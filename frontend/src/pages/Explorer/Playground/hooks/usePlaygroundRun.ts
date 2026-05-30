import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import type {
  TraceEvent,
  CallGraph,
  CfgGraphMap,
  StdoutEvent,
} from "@/types/trace";
import type { AiResult, AlgoCandidate } from "@/types/ai";
import type { RunStage } from "@/types/runStage";
import type { PlaygroundHistoryRecord } from "@/types/playgroundHistory";
import {
  run as analyzeRun,
  AnalyzeError,
  InputNeededError,
} from "@/services/AnalyzeService";
import { listHistory } from "@/services/playgroundHistoryService";
import { toast } from "@/shared/components/Toast";
import type { CodeEditorHandle } from "@/modules/core/components/CodeEditor/CodeEditor";

type DrillState = { mode: "call_graph" } | { mode: "cfg"; funcId: string };

interface UsePlaygroundRunOptions {
  code: string;
  editorRef: React.RefObject<CodeEditorHandle | null>;
  onResetPlayback: () => void;
  onQuotaFull: (
    records: PlaygroundHistoryRecord[],
  ) => Promise<"proceed" | "skip">;
}

export function handleDuplicateReplay(
  record: PlaygroundHistoryRecord,
  showDuplicateToast: () => void,
  loadFromHistory: (record: PlaygroundHistoryRecord) => void,
  delayMs = 3000,
): number {
  showDuplicateToast();
  return window.setTimeout(() => {
    loadFromHistory(record);
  }, delayMs);
}

export function usePlaygroundRun({
  code,
  editorRef,
  onResetPlayback,
  onQuotaFull,
}: UsePlaygroundRunOptions) {
  const { t } = useTranslation("playground");

  const [runStage, setRunStage] = useState<RunStage>("idle");
  const [trace, setTrace] = useState<TraceEvent[]>([]);
  const [rawTrace, setRawTrace] = useState<TraceEvent[]>([]);
  const [rawIndexMap, setRawIndexMap] = useState<number[]>([]);
  const [callGraph, setCallGraph] = useState<CallGraph | null>(null);
  const [cfgGraph, setCfgGraph] = useState<CfgGraphMap>({});
  const [stdoutEvents, setStdoutEvents] = useState<StdoutEvent[]>([]);
  const [isTruncated, setIsTruncated] = useState(false);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [top3Candidates, setTop3Candidates] = useState<AlgoCandidate[]>([]);
  const [appliedAlgo, setAppliedAlgo] = useState<string | null>(null);
  const [drill, setDrill] = useState<DrillState>({ mode: "call_graph" });
  const [isAlgoDialogOpen, setIsAlgoDialogOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const duplicateTimerRef = useRef<number | null>(null);

  // 互動式 input()：等待使用者輸入的彈窗狀態（null = 無彈窗）
  // resolve 由 retry loop 注入，使用者送出或取消時呼叫
  const [inputPrompt, setInputPrompt] = useState<{
    prompt: string;
    inputIndex: number;
    resolve: (value: string | null) => void; // null = 取消
  } | null>(null);
  // 跨多次 retry 累積使用者已輸入的 stdin（依 D8 由 caller 用 ref 維護）
  const stdinInputsRef = useRef<string[]>([]);

  const handleEditCode = useCallback(() => {
    onResetPlayback();
    setTrace([]);
    setRawTrace([]);
    setRawIndexMap([]);
    setCallGraph(null);
    setCfgGraph({});
    setStdoutEvents([]);
    setIsTruncated(false);
    setAiResult(null);
    setTop3Candidates([]);
    editorRef.current?.clearErrorMarker();
    setRunStage("idle");
  }, [editorRef, onResetPlayback]);

  const loadFromHistory = useCallback(
    (record: PlaygroundHistoryRecord) => {
      if (duplicateTimerRef.current !== null) {
        clearTimeout(duplicateTimerRef.current);
        duplicateTimerRef.current = null;
      }
      setTrace(record.execution_trace);
      setRawTrace(record.raw_trace);
      setRawIndexMap(record.raw_index_map);
      const mappedCallGraph = record.call_graph
        ? {
            ...record.call_graph,
            nodes: (record.call_graph.nodes as any[]).map((n) => ({
              id: n.id,
              funcName: n.func_name ?? n.funcName,
              cfg: n.cfg ?? null,
            })),
            edges: ((record.call_graph.edges ?? []) as any[]).map((e) => ({
              source: e.source,
              target: e.target,
              steps: e.steps ?? [],
              returnSteps: e.return_steps ?? e.returnSteps ?? [],
            })),
            root: record.call_graph.root,
          }
        : null;
      setCallGraph(mappedCallGraph);
      setCfgGraph(record.cfg_graph);
      setStdoutEvents(record.stdout_events);
      setIsTruncated(record.is_truncated);
      stdinInputsRef.current = []; // 從 history 載入是新一次互動，重置已累積的 stdin
      setAiResult({
        detected_algorithm: record.detected_algorithm,
        confidence_score: record.confidence_score,
        level1_eligible: record.have_level1,
        fallback_reason: null,
        time_complexity: record.time_complexity,
        analysis_source: record.analysis_source as AiResult["analysis_source"],
        summary:
          record.ai_summary || record.ai_feedback
            ? {
                purpose: record.ai_summary ?? "",
                feedback: record.ai_feedback ?? "",
              }
            : null,
        suggestions: [],
      });
      setTop3Candidates(record.top3_candidates);
      setAppliedAlgo(record.detected_algorithm);
      setDrill({ mode: "call_graph" });
      setRunStage("done");
      onResetPlayback();
    },
    [
      setTrace,
      setRawTrace,
      setRawIndexMap,
      setCallGraph,
      setCfgGraph,
      setStdoutEvents,
      setIsTruncated,
      setAiResult,
      setTop3Candidates,
      setAppliedAlgo,
      setDrill,
      setRunStage,
      onResetPlayback,
    ],
  );

  // 包裝 analyzeRun 成 retry loop：遇到 InputNeededError 就開彈窗收輸入，
  // append 到 stdinInputsRef 後重送（Python Tutor 重跑模式）；saveHistory 必須一路透傳（D7）
  const runWithInputRetry = useCallback(
    async (controller: AbortController, options: { saveHistory: boolean }) => {
      while (true) {
        try {
          return await analyzeRun(
            code,
            (stage) => setRunStage(stage),
            controller.signal,
            {
              saveHistory: options.saveHistory,
              stdinInputs: [...stdinInputsRef.current],
              isRetry: stdinInputsRef.current.length > 0,
            },
          );
        } catch (err) {
          if (err instanceof InputNeededError) {
            const value = await new Promise<string | null>((resolve) => {
              setInputPrompt({
                prompt: err.prompt,
                inputIndex: err.inputIndex,
                resolve,
              });
            });
            setInputPrompt(null);
            if (value === null) {
              throw new AnalyzeError("runtime_error", "input cancelled");
            }
            stdinInputsRef.current.push(value);
            continue;
          }
          throw err;
        }
      }
    },
    [code],
  );

  const handleRun = useCallback(async () => {
    if (!code.trim()) {
      toast.error(t("run.emptyCode"));
      return;
    }

    let saveHistory = true;
    stdinInputsRef.current = []; // 新一次 run：清掉上一輪累積的 stdin

    // Quota gate
    try {
      const records = await listHistory();
      if (records.length >= 5) {
        const decision = await onQuotaFull(records);
        saveHistory = decision === "proceed";
      }
    } catch {
      // If quota check fails, continue with run anyway
    }

    if (duplicateTimerRef.current !== null) {
      clearTimeout(duplicateTimerRef.current);
      duplicateTimerRef.current = null;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setRunStage("syntax_check");
    editorRef.current?.clearErrorMarker();
    setTrace([]);
    setRawTrace([]);
    setRawIndexMap([]);
    setCallGraph(null);
    setCfgGraph({});
    setIsTruncated(false);
    setStdoutEvents([]);
    onResetPlayback();
    setDrill({ mode: "call_graph" });
    setAppliedAlgo(null);

    try {
      const result = await runWithInputRetry(controller, { saveHistory });
      setTrace(result.trace);
      setRawTrace(result.rawTrace);
      setRawIndexMap(result.rawIndexMap);
      setIsTruncated(result.isTruncated);
      setStdoutEvents(result.stdoutEvents);
      setCallGraph(result.callGraph);
      setCfgGraph(result.cfgGraph);
      setAiResult(result.aiResult);
      setTop3Candidates(result.top3Candidates);
      setDrill({ mode: "call_graph" });
      setRunStage("done");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setRunStage("idle");
      if (e instanceof AnalyzeError) {
        switch (e.type) {
          case "duplicate_code":
            if (e.duplicateRecord) {
              duplicateTimerRef.current = handleDuplicateReplay(
                e.duplicateRecord,
                () => toast.info(t("run.duplicateCode")),
                loadFromHistory,
              );
            } else {
              toast.info(t("run.duplicateCode"));
            }
            break;
          case "empty_code":
            toast.error(t("run.emptyCode"));
            break;
          case "syntax_error":
            if (e.lineno != null) {
              toast.error(
                t("run.syntaxError", { line: e.lineno, msg: e.message }),
              );
              editorRef.current?.setErrorMarker(e.lineno, e.message);
            } else {
              toast.error(t("run.syntaxErrorNoLine", { msg: e.message }));
            }
            break;
          case "timeout":
            toast.error(t("run.timeout"));
            break;
          case "pool_exhausted":
            toast.warning(t("run.poolExhausted"));
            break;
          case "runtime_error":
            toast.error(formatRuntimeError(e.message, t));
            if (e.lineno != null) {
              editorRef.current?.setErrorMarker(e.lineno, e.message);
            }
            break;
          default:
            toast.error(t("run.analysisFailed"));
        }
      } else {
        toast.error(t("run.analysisFailed"));
      }
    }
  }, [
    code,
    editorRef,
    loadFromHistory,
    onResetPlayback,
    onQuotaFull,
    runWithInputRetry,
    t,
  ]);

  return {
    runStage,
    trace,
    rawTrace,
    rawIndexMap,
    callGraph,
    cfgGraph,
    stdoutEvents,
    isTruncated,
    aiResult,
    top3Candidates,
    appliedAlgo,
    setAppliedAlgo,
    drill,
    setDrill,
    isAlgoDialogOpen,
    setIsAlgoDialogOpen,
    handleRun,
    handleEditCode,
    loadFromHistory,
    inputPrompt,
  };
}

function formatRuntimeError(
  msg: string,
  t: (key: string, params?: Record<string, string>) => string,
): string {
  let m: RegExpMatchArray | null;
  if ((m = msg.match(/NameError: name '(.+?)' is not defined/)))
    return t("run.runtimeNameError", { name: m[1] });
  if ((m = msg.match(/KeyError: (.+)/)))
    return t("run.runtimeKeyError", { key: m[1] });
  if (msg.includes("ZeroDivisionError")) return t("run.runtimeZeroDivision");
  if (msg.includes("RecursionError")) return t("run.runtimeRecursionError");
  if ((m = msg.match(/IndexError: (.+)/)))
    return t("run.runtimeIndexError", { msg: m[1] });
  if ((m = msg.match(/AttributeError: (.+)/)))
    return t("run.runtimeAttributeError", { msg: m[1] });
  if ((m = msg.match(/TypeError: (.+)/)))
    return t("run.runtimeTypeError", { msg: m[1] });
  return t("run.runtimeError", { msg });
}

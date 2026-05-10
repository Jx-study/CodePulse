import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { TraceEvent, CallGraph, CfgGraphMap, StdoutEvent } from "@/types/trace";
import type { AiResult, AlgoCandidate } from "@/types/ai";
import type { RunStage } from "@/types/runStage";
import type { PlaygroundHistoryRecord } from "@/types/playgroundHistory";
import { run as analyzeRun, AnalyzeError } from "@/services/AnalyzeService";
import { listHistory } from "@/services/playgroundHistoryService";
import { toast } from "@/shared/components/Toast";
import type { CodeEditorHandle } from "@/modules/core/components/CodeEditor/CodeEditor";

type DrillState = { mode: "call_graph" } | { mode: "cfg"; funcId: string };

interface UsePlaygroundRunOptions {
  code: string;
  editorRef: React.RefObject<CodeEditorHandle | null>;
  onResetPlayback: () => void;
  onQuotaFull: (records: PlaygroundHistoryRecord[]) => Promise<"proceed" | "skip">;
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

  const handleRun = useCallback(async () => {
    if (!code.trim()) {
      toast.error(t("run.emptyCode"));
      return;
    }

    // ── Quota gate ───────────────────────────────────────────────────────────
    try {
      const records = await listHistory();
      if (records.length >= 5) {
        await onQuotaFull(records);
      }
    } catch {
      // If quota check fails, continue with run anyway
    }

    // ── Cancel any in-flight request ─────────────────────────────────────────
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
      const result = await analyzeRun(
        code,
        (stage) => setRunStage(stage),
        controller.signal,
      );
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
          case "empty_code":
            toast.error(t("run.emptyCode"));
            break;
          case "syntax_error":
            if (e.lineno != null) {
              toast.error(t("run.syntaxError", { line: e.lineno, msg: e.message }));
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
  }, [code, editorRef, onResetPlayback, onQuotaFull, t]);

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

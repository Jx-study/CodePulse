/**
 * Analyze Service - 程式碼分析服務
 *
 * 職責：
 * - 提交程式碼至後端分析
 * - 輪詢分析進度
 * - 取得並轉換分析結果
 */
import apiService, { API_BASE_URL } from "@/api/api";
import type {
  TraceEvent,
  CallGraph,
  CfgGraph,
  CfgGraphMap,
  StdoutEvent,
} from "@/types/trace";
import type { AiResult, AlgoCandidate } from "@/types/ai";
import type { RunStage } from "@/types/runStage";
import { mapAiResult } from "@/services/ComplexityService";
import type { PlaygroundHistoryRecord } from "@/types/playgroundHistory";

export type AnalyzeErrorType =
  | "empty_code"
  | "syntax_error"
  | "timeout"
  | "runtime_error"
  | "pool_exhausted"
  | "analysis_failed"
  | "duplicate_code"
  | "unknown";

export class AnalyzeError extends Error {
  constructor(
    public readonly type: AnalyzeErrorType,
    message: string,
    public readonly lineno?: number,
    public readonly duplicateRecord?: PlaygroundHistoryRecord,
  ) {
    super(message);
    this.name = "AnalyzeError";
  }
}

/**
 * 程式執行到 input() 但 stdin 已用罄時拋出
 * 依 D8：只帶 prompt 與 inputIndex，已累積的 stdin 由 caller（usePlaygroundRun）用 ref 自行維護
 */
export class InputNeededError extends Error {
  constructor(
    public readonly prompt: string,
    public readonly inputIndex: number,
    public readonly stdoutEvents: StdoutEvent[] = [],
  ) {
    super(`input needed at index ${inputIndex}: ${prompt}`);
    this.name = "InputNeededError";
  }
}

export interface AnalyzeResult {
  trace: TraceEvent[];
  rawTrace: TraceEvent[];
  rawIndexMap: number[];
  isTruncated: boolean;
  stdoutEvents: StdoutEvent[];
  callGraph: CallGraph | null;
  cfgGraph: CfgGraphMap;
  aiResult: AiResult;
  top3Candidates: AlgoCandidate[];
}

/**
 * Submit code, stream progress via SSE, and return fully-mapped result.
 * @param code       Python source code to analyze
 * @param onProgress Called each time the backend reports a new stage
 * @param signal     Optional AbortSignal to cancel the operation
 */
export async function run(
  code: string,
  onProgress: (stage: RunStage) => void,
  signal?: AbortSignal,
  options: { saveHistory?: boolean; stdinInputs?: string[]; isRetry?: boolean } = {},
): Promise<AnalyzeResult> {
  // 1. Submit
  let submitRes: {
    data: {
      task_id?: string;
      duplicate?: boolean;
      duplicate_record?: PlaygroundHistoryRecord;
    };
  };
  try {
    submitRes = await apiService.post<{
      task_id?: string;
      duplicate?: boolean;
      duplicate_record?: PlaygroundHistoryRecord;
    }>("/api/analyze/submit", {
      code,
      save_history: options.saveHistory ?? true,
      stdin_inputs: options.stdinInputs ?? [],
      is_retry: options.isRetry ?? false,
    }, undefined, signal);
  } catch (err: any) {
    const body = err?.response?.data;
    if (err?.response?.status === 422 && body?.error) {
      if (body.error === "empty_code") {
        throw new AnalyzeError("empty_code", body.message ?? "empty code");
      }
      if (body.error === "syntax_error") {
        throw new AnalyzeError(
          "syntax_error",
          body.message ?? "syntax error",
          body.lineno ?? undefined,
        );
      }
    }
    throw err;
  }

  throwIfAborted(signal);

  if (submitRes.data.duplicate) {
    throw new AnalyzeError(
      "duplicate_code",
      "duplicate",
      undefined,
      submitRes.data.duplicate_record,
    );
  }

  const taskId = submitRes.data.task_id!;

  // 2. Stream progress via SSE
  return streamProgress(taskId, onProgress, signal);
}

// Internal helpers

function streamProgress(
  taskId: string,
  onProgress: (stage: RunStage) => void,
  signal?: AbortSignal,
): Promise<AnalyzeResult> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const url = `${API_BASE_URL}/api/analyze/stream/${taskId}`;
    const es = new EventSource(url, { withCredentials: true });

    let settled = false;
    const cleanup = () => {
      signal?.removeEventListener("abort", onAbort);
      es.close();
    };
    const settleReject = (err: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err);
    };
    const settleResolve = (result: AnalyzeResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };
    const onAbort = () => {
      settleReject(new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    es.onmessage = (e) => {
      if (signal?.aborted || settled) return;

      let event: any;
      try {
        event = JSON.parse(e.data);
      } catch {
        return;
      }

      if (event.status === "running" && event.stage) {
        onProgress(event.stage as RunStage);
        return;
      }

      if (event.status === "input_needed") {
        // input_needed 是 terminal event：清掉 ES 並以 InputNeededError reject，
        // 由 caller 收集輸入後 append 到 stdin 再重送（D8）
        settleReject(new InputNeededError(
          event.prompt ?? "",
          event.input_index ?? 0,
          event.stdout_events ?? [],
        ));
        return;
      }

      if (event.status === "completed") {
        cleanup();
        fetchResult(taskId, signal).then(settleResolve).catch(settleReject);
        return;
      }

      if (event.status === "failed") {
        const detail: string | undefined = event.error;
        if (detail === "timeout") {
          settleReject(new AnalyzeError("timeout", "timeout"));
        } else if (detail?.startsWith("pool_exhausted")) {
          settleReject(new AnalyzeError("pool_exhausted", detail));
        } else if (detail) {
          const m = detail.match(/^lineno:(\d+):(.+)$/);
          if (m) {
            settleReject(new AnalyzeError("runtime_error", m[2], parseInt(m[1], 10)));
          } else {
            settleReject(new AnalyzeError("runtime_error", detail));
          }
        } else {
          settleReject(new AnalyzeError("analysis_failed", "analysis failed"));
        }
        return;
      }
    };

    es.onerror = () => {
      settleReject(new AnalyzeError("analysis_failed", "SSE connection error"));
    };
  });
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

async function fetchResult(
  taskId: string,
  signal?: AbortSignal,
): Promise<AnalyzeResult> {
  throwIfAborted(signal);
  const res = await apiService.get<any>(
    `/api/analyze/result/${taskId}`,
    undefined,
    signal,
  );
  throwIfAborted(signal);
  const r = res.data;

  const callGraph: CallGraph | null = r.call_graph
    ? {
        ...r.call_graph,
        nodes: r.call_graph.nodes.map(
          (n: { id: string; func_name: string; cfg: CfgGraph | null }) => ({
            id: n.id,
            funcName: n.func_name,
            cfg: n.cfg,
          }),
        ),
        edges: (r.call_graph.edges ?? []).map(
          (e: {
            source: string;
            target: string;
            steps: number[];
            return_steps: number[];
          }) => ({
            source: e.source,
            target: e.target,
            steps: e.steps ?? [],
            returnSteps: e.return_steps ?? [],
          }),
        ),
      }
    : null;

  const { aiResult, top3Candidates } = mapAiResult(r);

  return {
    trace: r.execution_trace ?? [],
    rawTrace: r.raw_trace ?? r.execution_trace ?? [],
    rawIndexMap: r.raw_index_map ?? [],
    isTruncated: r.is_truncated ?? false,
    stdoutEvents: r.stdout_events ?? [],
    callGraph,
    cfgGraph: r.cfg_graph ?? {},
    aiResult,
    top3Candidates,
  };
}

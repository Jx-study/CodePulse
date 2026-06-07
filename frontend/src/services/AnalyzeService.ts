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
  options: { saveHistory?: boolean } = {},
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
    }>("/api/analyze/submit", { code, save_history: options.saveHistory ?? true });
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
    const url = `${API_BASE_URL}/api/analyze/stream/${taskId}`;
    const es = new EventSource(url, { withCredentials: true });

    const cleanup = () => es.close();

    signal?.addEventListener("abort", () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    });

    es.onmessage = (e) => {
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

      if (event.status === "completed") {
        cleanup();
        fetchResult(taskId).then(resolve).catch(reject);
        return;
      }

      if (event.status === "failed") {
        cleanup();
        const detail: string | undefined = event.error;
        if (detail === "timeout") {
          reject(new AnalyzeError("timeout", "timeout"));
        } else if (detail?.startsWith("pool_exhausted")) {
          reject(new AnalyzeError("pool_exhausted", detail));
        } else if (detail) {
          const m = detail.match(/^lineno:(\d+):(.+)$/);
          if (m) {
            reject(new AnalyzeError("runtime_error", m[2], parseInt(m[1], 10)));
          } else {
            reject(new AnalyzeError("runtime_error", detail));
          }
        } else {
          reject(new AnalyzeError("analysis_failed", "analysis failed"));
        }
        return;
      }
    };

    es.onerror = () => {
      cleanup();
      reject(new AnalyzeError("analysis_failed", "SSE connection error"));
    };
  });
}

async function fetchResult(taskId: string): Promise<AnalyzeResult> {
  const res = await apiService.get<any>(`/api/analyze/result/${taskId}`);
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

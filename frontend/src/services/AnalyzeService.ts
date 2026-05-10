/**
 * Analyze Service - 程式碼分析服務
 *
 * 職責：
 * - 提交程式碼至後端分析
 * - 輪詢分析進度
 * - 取得並轉換分析結果
 */

import apiService from "@/api/api";
import type { TraceEvent, CallGraph, CfgGraph, CfgGraphMap, StdoutEvent } from "@/types/trace";
import type { AiResult, AlgoCandidate } from "@/types/ai";
import type { RunStage } from "@/types/runStage";
import { mapAiResult } from "@/services/ComplexityService";

export type AnalyzeErrorType =
  | "empty_code"
  | "syntax_error"
  | "timeout"
  | "runtime_error"
  | "analysis_failed"
  | "unknown";

export class AnalyzeError extends Error {
  constructor(
    public readonly type: AnalyzeErrorType,
    message: string,
    public readonly lineno?: number,
  ) {
    super(message);
    this.name = "AnalyzeError";
  }
}

const POLL_INTERVAL_MS = 500;

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
 * Submit code, poll for completion, and return fully-mapped result.
 * @param code       Python source code to analyze
 * @param onProgress Called each time the backend reports a new stage
 * @param signal     Optional AbortSignal to cancel the operation
 */
export async function run(
  code: string,
  onProgress: (stage: RunStage) => void,
  signal?: AbortSignal,
): Promise<AnalyzeResult> {
  // 1. Submit
  let submitRes: { data: { task_id: string } };
  try {
    submitRes = await apiService.post<{ task_id: string }>("/api/analyze/submit", { code });
  } catch (err: any) {
    const body = err?.response?.data;
    if (err?.response?.status === 422 && body?.error) {
      if (body.error === "empty_code") {
        throw new AnalyzeError("empty_code", body.message ?? "empty code");
      }
      if (body.error === "syntax_error") {
        throw new AnalyzeError("syntax_error", body.message ?? "syntax error", body.lineno ?? undefined);
      }
    }
    throw err;
  }
  const taskId = submitRes.data.task_id;

  // 2. Poll until completed or failed
  const result = await poll(taskId, onProgress, signal);

  return result;
}

// Internal helpers

async function poll(
  taskId: string,
  onProgress: (stage: RunStage) => void,
  signal?: AbortSignal,
): Promise<AnalyzeResult> {
  return new Promise((resolve, reject) => {
    let done = false;

    const stop = (fn: () => void) => {
      if (done) return;
      done = true;
      clearInterval(id);
      fn();
    };

    const id = setInterval(async () => {
      if (done) return;

      if (signal?.aborted) {
        stop(() => reject(new DOMException("Aborted", "AbortError")));
        return;
      }

      try {
        const statusRes = await apiService.get<{
          status: string;
          progress?: { stage: string };
        }>(`/api/analyze/status/${taskId}`);

        if (done) return;

        const status = statusRes.data;

        if (status.progress?.stage) {
          onProgress(status.progress.stage as RunStage);
        }

        if (status.status === "completed") {
          if (done) return;
          done = true;
          clearInterval(id);
          fetchResult(taskId).then(resolve).catch(reject);
        } else if (status.status === "failed") {
          const detail = (status as any).error_detail;
          stop(() => {
            if (detail === "timeout") {
              reject(new AnalyzeError("timeout", "timeout"));
            } else if (detail) {
              const m = typeof detail === "string" ? detail.match(/^lineno:(\d+):(.+)$/) : null;
              if (m) {
                reject(new AnalyzeError("runtime_error", m[2], parseInt(m[1], 10)));
              } else {
                reject(new AnalyzeError("runtime_error", detail));
              }
            } else {
              reject(new AnalyzeError("analysis_failed", "analysis failed"));
            }
          });
        }
      } catch (e) {
        stop(() => reject(e));
      }
    }, POLL_INTERVAL_MS);
  });
}

async function fetchResult(taskId: string): Promise<AnalyzeResult> {
  const res = await apiService.get<any>(`/api/analyze/result/${taskId}`);
  const r = res.data;

  const callGraph: CallGraph | null = r.call_graph
    ? {
        ...r.call_graph,
        nodes: r.call_graph.nodes.map((n: { id: string; func_name: string; cfg: CfgGraph | null }) => ({
          id: n.id,
          funcName: n.func_name,
          cfg: n.cfg,
        })),
        edges: (r.call_graph.edges ?? []).map((e: {
          source: string;
          target: string;
          steps: number[];
          return_steps: number[];
        }) => ({
          source: e.source,
          target: e.target,
          steps: e.steps ?? [],
          returnSteps: e.return_steps ?? [],
        })),
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

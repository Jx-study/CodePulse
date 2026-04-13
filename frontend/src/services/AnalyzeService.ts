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
import type { AiResult, AlgoCandidate } from "@/pages/Explorer/components/AiAnalysisDialog";
import type { RunStage } from "@/pages/Explorer/components/StatusBar";

const POLL_INTERVAL_MS = 500;

export interface AnalyzeResult {
  trace: TraceEvent[];
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
  const submitRes = await apiService.post<{ task_id: string }>("/api/analyze/submit", { code });
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
    const id = setInterval(async () => {
      if (signal?.aborted) {
        clearInterval(id);
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }

      try {
        const statusRes = await apiService.get<{
          status: string;
          progress?: { stage: string };
        }>(`/api/analyze/status/${taskId}`);

        const status = statusRes.data;

        if (status.progress?.stage) {
          onProgress(status.progress.stage as RunStage);
        }

        if (status.status === "completed") {
          clearInterval(id);
          try {
            const result = await fetchResult(taskId);
            resolve(result);
          } catch (e) {
            reject(e);
          }
        } else if (status.status === "failed") {
          clearInterval(id);
          reject(new Error("Analysis failed on server"));
        }
      } catch (e) {
        clearInterval(id);
        reject(e);
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

  return {
    trace: r.execution_trace ?? [],
    isTruncated: r.is_truncated ?? false,
    stdoutEvents: r.stdout_events ?? [],
    callGraph,
    cfgGraph: r.cfg_graph ?? {},
    aiResult: {
      detected_algorithm: r.detected_algorithm ?? null,
      confidence_score: r.confidence_score ?? null,
      time_complexity: r.time_complexity ?? null,
      analysis_source: r.analysis_source ?? null,
      summary: r.summary ?? null,
      suggestions: r.suggestions ?? [],
    },
    top3Candidates: r.top3_candidates ?? [],
  };
}

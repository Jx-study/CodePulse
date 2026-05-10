import type { TraceEvent, StdoutEvent, CallGraph, CfgGraphMap } from "@/types/trace";
import type { AlgoCandidate } from "@/types/ai";

export interface PlaygroundHistoryRecord {
  id: number;
  detected_algorithm: string | null;
  confidence_score: number | null;
  time_complexity: string | null;
  analysis_source: string | null;
  code_preview: string;
  user_code: string;
  created_at: string;
  // replay fields
  have_level1: boolean;
  is_truncated: boolean;
  execution_trace: TraceEvent[];
  raw_trace: TraceEvent[];
  raw_index_map: number[];
  call_graph: CallGraph | null;
  cfg_graph: CfgGraphMap;
  stdout_events: StdoutEvent[];
  top3_candidates: AlgoCandidate[];
  ai_summary: string | null;
  ai_feedback: string | null;
}

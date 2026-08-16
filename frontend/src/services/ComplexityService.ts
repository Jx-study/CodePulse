import type { AiResult, AlgoCandidate } from "@/types/ai";

/** Raw (snake_case) AI analysis fields as returned by the backend. */
export interface RawAiResult {
  detected_algorithm?: string | null;
  confidence_score?: number | null;
  level1_eligible?: boolean;
  fallback_reason?: string | null;
  time_complexity?: string | null;
  analysis_source?: AiResult["analysis_source"];
  gemini_summary?: AiResult["summary"];
  suggestions?: string[];
  top3_candidates?: AlgoCandidate[];
}

export function mapAiResult(r: RawAiResult): {
  aiResult: AiResult;
  top3Candidates: AlgoCandidate[];
} {
  return {
    aiResult: {
      detected_algorithm: r.detected_algorithm ?? null,
      confidence_score: r.confidence_score ?? null,
      level1_eligible: r.level1_eligible ?? false,
      fallback_reason: r.fallback_reason ?? null,
      time_complexity: r.time_complexity ?? null,
      analysis_source: r.analysis_source ?? null,
      summary: r.gemini_summary ?? null,
      suggestions: r.suggestions ?? [],
    },
    top3Candidates: r.top3_candidates ?? [],
  };
}

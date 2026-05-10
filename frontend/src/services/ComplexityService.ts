import type { AiResult, AlgoCandidate } from "@/types/ai";

export function mapAiResult(r: Record<string, any>): {
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

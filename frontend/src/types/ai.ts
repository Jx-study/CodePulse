export interface AiResult {
  detected_algorithm: string | null;
  confidence_score: number | null;
  level1_eligible: boolean;
  fallback_reason: string | null;
  time_complexity: string | null;
  analysis_source: "gemini" | "miniLM" | "ast+bigO" | "ast" | "bigO" | "ast_conflict" | null;
  summary: { purpose: string; feedback: string } | null;
  suggestions: string[];
}

export interface AlgoCandidate {
  name: string;
  score: number;
}

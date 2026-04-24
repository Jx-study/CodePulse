export interface AiResult {
  detected_algorithm: string | null;
  confidence_score: number | null;
  time_complexity: string | null;
  analysis_source: "gemini" | "miniLM" | "ast+bigO" | "ast" | "bigO" | "ast_conflict" | null;
  summary: string | null;
  suggestions: string[];
}

export interface AlgoCandidate {
  name: string;
  score: number;
}

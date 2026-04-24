export type RunStage =
  | "idle"
  | "syntax_check"
  | "sandbox"
  | "analysis"
  | "gemini"
  | "done";

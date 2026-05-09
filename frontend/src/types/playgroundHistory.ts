export interface PlaygroundHistoryRecord {
  id: number;
  detected_algorithm: string | null;
  time_complexity: string | null;
  analysis_source: string | null;
  code_preview: string;
  user_code: string;
  created_at: string;
}

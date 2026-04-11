export interface TraceEvent {
  tag: string;
  variables: Record<string, any>;
  dataSnapshot: { id: string; value: number | string | undefined }[];
  meta?: Record<string, any>;
}

export type ExecutionTrace = TraceEvent[];

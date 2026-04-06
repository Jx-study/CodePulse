export interface TraceEvent {
  tag: string;
  variables: Record<string, any>;
  dataSnapshot: { id: string; value: number | string | undefined }[];
  meta?: Record<string, any>;
}

export type ExecutionTrace = TraceEvent[];

export interface CfgNode {
  id: string;
  lines: number[];
  label: string;
  kind: "entry" | "exit" | "branch" | "loop" | "basic" | "call" | "return";
}

export interface CfgEdge {
  source: string;
  target: string;
  label: string;
}

export interface CfgGraph {
  nodes: CfgNode[];
  edges: CfgEdge[];
}

export interface CallNode {
  id: string;
  funcName: string;
  cfg: CfgGraph;
}

export interface CallEdge {
  source: string;
  target: string;
  steps: number[];
}

export interface CallGraph {
  nodes: CallNode[];
  edges: CallEdge[];
  root: string;
}

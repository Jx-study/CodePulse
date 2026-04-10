export interface TraceEvent {
  tag: string;
  local_vars: Record<string, any>;
  global_vars?: Record<string, string>;
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

/** func_name → CfgGraph，對應後端 cfg_graph dict key（Python function name） */
export type CfgGraphMap = Record<string, CfgGraph>;

export interface CallNode {
  id: string;
  /** 後端 JSON key 為 func_name（snake_case），存入 state 時需手動 mapping → funcName */
  funcName: string;
  cfg: CfgGraph | null;
}

export interface CallEdge {
  source: string;
  target: string;
  steps: number[];
  returnSteps: number[];
}

export interface CallGraph {
  nodes: CallNode[];
  edges: CallEdge[];
  root: string;
}

export interface StdoutEvent {
  step: number;
  text: string;
}

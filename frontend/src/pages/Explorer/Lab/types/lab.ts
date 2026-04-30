import type { AnimationStep } from "@/types";

export type AlgorithmId =
  | "bubbleSort"
  | "selectionSort"
  | "insertionSort"
  | "mergeSort"
  | "quickSort";

export type TopicId = "sorting";

export type PlayState = "idle" | "playing" | "paused" | "done";

export type CaseType = "random" | "sorted" | "reversed";

export interface AlgorithmMeta {
  id: AlgorithmId;
  label: string;
  color: string;
  theoreticalComplexity: Record<CaseType, string>;
}

export interface BenchmarkPoint {
  n: number;
  ms: number;
}

export type ComplexityChartMode = "curve" | "space";

export interface LabAlgorithmState {
  id: AlgorithmId;
  steps: AnimationStep[];
  opCountPerStep: number[];
  compareCountPerStep: number[];
  moveCountPerStep: number[];
  stackDepthPerStep: number[];
  auxSizePerStep: number[];
  execTimeMs: number;
  /** backward compat：等同於 random case 的 benchmark */
  benchmarkPoints: BenchmarkPoint[];
  benchmarkByCase: Partial<Record<CaseType, BenchmarkPoint[]>>;
}

export interface LabState {
  activeTopic: TopicId | null;
  selectedIds: AlgorithmId[];
  inputData: number[];
  inputSize: number;
  algorithms: LabAlgorithmState[];
  currentStep: number;
  maxSteps: number;
  playState: PlayState;
  speed: number;
  showComplexityChart: boolean;
  complexityChartMode: ComplexityChartMode;
  visibleCaseTypes: CaseType[];
  sidebarCollapsed: boolean;
  layoutFlipped: boolean;
  benchmarkKey: number;
  unifiedYAxis: boolean;
  manualSortEnabled: boolean;
  manualSortData: number[];
  manualDragStarted: boolean;
  manualSortMoves: number;
  manualSortStartMs: number | null;
  manualSortEndMs: number | null;
}

/** Reducer 持有的狀態（algorithms / maxSteps 由 Provider 衍生合併） */
export interface LabReducerState {
  activeTopic: TopicId | null;
  selectedIds: AlgorithmId[];
  inputData: number[];
  inputSize: number;
  currentStep: number;
  playState: PlayState;
  speed: number;
  showComplexityChart: boolean;
  complexityChartMode: ComplexityChartMode;
  visibleCaseTypes: CaseType[];
  sidebarCollapsed: boolean;
  layoutFlipped: boolean;
  benchmarkKey: number;
  unifiedYAxis: boolean;
  manualSortEnabled: boolean;
  manualSortData: number[];
  manualDragStarted: boolean;
  manualSortMoves: number;
  manualSortStartMs: number | null;
  manualSortEndMs: number | null;
}

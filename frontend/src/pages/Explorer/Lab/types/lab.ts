import type { AnimationStep } from "@/types";

export type AlgorithmId =
  | "bubbleSort"
  | "selectionSort"
  | "insertionSort"
  | "mergeSort"
  | "quickSort";

export type TopicId = "sorting";

export type PlayState = "idle" | "playing" | "paused" | "done";

export interface AlgorithmMeta {
  id: AlgorithmId;
  label: string;
  color: string;
}

export interface BenchmarkPoint {
  n: number;
  ms: number;
}

export type ComplexityChartMode = "steps" | "curve";

export interface LabAlgorithmState {
  id: AlgorithmId;
  steps: AnimationStep[];
  opCountPerStep: number[];
  compareCountPerStep: number[];
  moveCountPerStep: number[];
  stackDepthPerStep: number[];
  auxSizePerStep: number[];
  execTimeMs: number;
  benchmarkPoints: BenchmarkPoint[];
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
  sidebarCollapsed: boolean;
  layoutFlipped: boolean;
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
  sidebarCollapsed: boolean;
  layoutFlipped: boolean;
}

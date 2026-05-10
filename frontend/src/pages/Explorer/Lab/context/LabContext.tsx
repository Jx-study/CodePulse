import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  BENCHMARK_NS,
  CASE_TYPES,
  benchmarkExecMs,
  buildAlgorithmStates,
  generateCaseData,
} from "../hooks/useAlgorithmSteps";
import type {
  AlgorithmId,
  BenchmarkPoint,
  CaseType,
  ComplexityChartMode,
  LabReducerState,
  LabState,
  TopicId,
} from "../types/lab";

type BenchmarkStore = Partial<
  Record<AlgorithmId, Partial<Record<CaseType, BenchmarkPoint[]>>>
>;

function generateRandomData(n: number): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 990) + 10);
}

const DEFAULT_SIZE = 100;
const MAX_CHART_ITEMS_DEFAULT = 100;

const initialReducerState: LabReducerState = {
  activeTopic: "sorting",
  selectedIds: [],
  inputData: generateRandomData(DEFAULT_SIZE),
  inputSize: DEFAULT_SIZE,
  maxChartItems: MAX_CHART_ITEMS_DEFAULT,
  currentStep: 0,
  playState: "idle",
  speed: 1,
  showComplexityChart: false,
  complexityChartMode: "curve",
  visibleCaseTypes: ["random", "sorted", "reversed"],
  sidebarCollapsed: false,
  layoutFlipped: false,
  benchmarkKey: 0,
  unifiedYAxis: false,
  manualSortEnabled: false,
  manualSortData: [],
  manualDragStarted: false,
  manualSortMoves: 0,
  manualSortStartMs: null,
  manualSortEndMs: null,
};

export type LabAction =
  | { type: "SET_TOPIC"; topic: TopicId | null }
  | { type: "TOGGLE_ALGORITHM"; id: AlgorithmId }
  | { type: "SET_INPUT_DATA"; data: number[] }
  | { type: "SET_INPUT_SIZE"; size: number }
  | { type: "TOGGLE_COMPLEXITY_CHART" }
  | { type: "SET_COMPLEXITY_CHART_MODE"; mode: ComplexityChartMode }
  | { type: "TOGGLE_CASE_TYPE"; caseType: CaseType }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "TOGGLE_LAYOUT_FLIP" }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "RESET_BENCHMARK" }
  | { type: "TOGGLE_UNIFIED_Y_AXIS" }
  | { type: "TICK"; maxSteps: number; stepsToAdvance?: number }
  | { type: "SET_SPEED"; speed: number }
  | { type: "RESET_ANIMATION" }
  | { type: "TOGGLE_MANUAL_SORT" }
  | { type: "MANUAL_SORT_SWAP"; fromIdx: number; toIdx: number }
  | { type: "MANUAL_SORT_RESET" }
  | { type: "MANUAL_SORT_COMPLETE"; endMs: number }
  | { type: "SET_MAX_CHART_ITEMS"; max: number };

function labReducer(state: LabReducerState, action: LabAction): LabReducerState {
  switch (action.type) {
    case "SET_TOPIC":
      return { ...state, activeTopic: action.topic };
    case "TOGGLE_ALGORITHM": {
      const { id } = action;
      const next = state.selectedIds.includes(id)
        ? state.selectedIds.filter((x) => x !== id)
        : [...state.selectedIds, id];
      return { ...state, selectedIds: next };
    }
    case "SET_INPUT_DATA":
      return { ...state, inputData: action.data };
    case "SET_INPUT_SIZE": {
      if (state.manualSortEnabled) return state;
      const size = Math.max(20, Math.min(state.maxChartItems, action.size));
      return {
        ...state,
        inputSize: size,
        inputData: generateRandomData(size),
        currentStep: 0,
        playState: "idle",
      };
    }
    case "SET_MAX_CHART_ITEMS": {
      const max = Math.max(20, action.max);
      if (max === state.maxChartItems) return state;
      if (state.inputSize <= max || state.manualSortEnabled) {
        return { ...state, maxChartItems: max };
      }
      const snappedSize = Math.max(20, Math.floor(max / 10) * 10);
      return {
        ...state,
        maxChartItems: max,
        inputSize: snappedSize,
        inputData: generateRandomData(snappedSize),
        currentStep: 0,
        playState: "idle",
      };
    }
    case "TOGGLE_COMPLEXITY_CHART":
      return { ...state, showComplexityChart: !state.showComplexityChart };
    case "SET_COMPLEXITY_CHART_MODE":
      return { ...state, complexityChartMode: action.mode };
    case "TOGGLE_CASE_TYPE": {
      const { caseType } = action;
      const current = state.visibleCaseTypes;
      if (current.includes(caseType)) {
        if (current.length <= 1) return state;
        return {
          ...state,
          visibleCaseTypes: current.filter((c) => c !== caseType),
        };
      }
      return { ...state, visibleCaseTypes: [...current, caseType] };
    }
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case "TOGGLE_LAYOUT_FLIP":
      return { ...state, layoutFlipped: !state.layoutFlipped };
    case "PLAY": {
      if (state.playState === "playing") return state;
      if (state.playState === "done") {
        return { ...state, currentStep: 0, playState: "playing" };
      }
      return { ...state, playState: "playing" };
    }
    case "PAUSE":
      if (state.playState !== "playing") return state;
      return { ...state, playState: "paused" };
    case "RESET":
      return { ...state, currentStep: 0, playState: "idle" };
    case "RESET_BENCHMARK":
      return { ...state, benchmarkKey: state.benchmarkKey + 1 };
    case "TOGGLE_UNIFIED_Y_AXIS":
      return { ...state, unifiedYAxis: !state.unifiedYAxis };
    case "RESET_ANIMATION":
      return { ...state, currentStep: 0, playState: "idle" };
    case "TOGGLE_MANUAL_SORT": {
      if (state.manualSortEnabled) {
        return {
          ...state,
          manualSortEnabled: false,
          manualSortData: [],
          manualDragStarted: false,
          manualSortMoves: 0,
          manualSortStartMs: null,
          manualSortEndMs: null,
          currentStep: 0,
          playState: "idle",
        };
      }
      const newData = generateRandomData(20);
      return {
        ...state,
        manualSortEnabled: true,
        inputSize: 20,
        inputData: newData,
        manualSortData: [...newData],
        manualDragStarted: false,
        manualSortMoves: 0,
        manualSortStartMs: null,
        manualSortEndMs: null,
        currentStep: 0,
        playState: "idle",
      };
    }
    case "MANUAL_SORT_SWAP": {
      const { fromIdx, toIdx } = action;
      if (fromIdx === toIdx) return state;
      const next = [...state.manualSortData];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return {
        ...state,
        manualSortData: next,
        manualDragStarted: true,
        manualSortMoves: state.manualSortMoves + 1,
        manualSortStartMs: state.manualSortStartMs ?? Date.now(),
      };
    }
    case "MANUAL_SORT_RESET":
      return {
        ...state,
        manualSortData: [...state.inputData],
        manualDragStarted: false,
        manualSortMoves: 0,
        manualSortStartMs: null,
        manualSortEndMs: null,
        currentStep: 0,
        playState: "idle",
      };
    case "MANUAL_SORT_COMPLETE":
      return { ...state, manualSortEndMs: action.endMs };
    case "SET_SPEED":
      return { ...state, speed: action.speed };
    case "TICK": {
      const { maxSteps: cap, stepsToAdvance = 1 } = action;
      if (state.playState !== "playing" || cap === 0) return state;
      const next = state.currentStep + stepsToAdvance;
      if (next >= cap) {
        return { ...state, currentStep: cap, playState: "done" };
      }
      return { ...state, currentStep: next };
    }
    default:
      return state;
  }
}

export interface LabContextValue extends LabState {
  dispatch: Dispatch<LabAction>;
}

const LabContext = createContext<LabContextValue | null>(null);

function computeMaxSteps(algorithms: LabState["algorithms"]): number {
  if (!algorithms.length) return 0;
  return Math.max(...algorithms.map((a) => a.steps.length));
}

export function LabProvider({ children }: { children: ReactNode }) {
  const [reducerState, dispatch] = useReducer(labReducer, initialReducerState);
  const [benchmarkById, setBenchmarkById] = useState<BenchmarkStore>({});

  const { selectedIds, inputData, benchmarkKey } = reducerState;

  const baseAlgorithms = useMemo(
    () => buildAlgorithmStates(selectedIds, inputData),
    [selectedIds, inputData],
  );

  useEffect(() => {
    let cancelled = false;
    setBenchmarkById({});
    const ids = selectedIds;
    if (ids.length === 0) return;

    const yieldToMain = () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      });

    const runAll = async () => {
      for (const id of ids) {
        for (const caseType of CASE_TYPES) {
          const points: BenchmarkPoint[] = [];
          for (const n of BENCHMARK_NS) {
            if (cancelled) return;
            const data = generateCaseData(n, caseType);
            const ms = benchmarkExecMs(id, data);
            points.push({ n, ms });
            setBenchmarkById((prev) => ({
              ...prev,
              [id]: {
                ...(prev[id] ?? {}),
                [caseType]: [...points],
              },
            }));
            await yieldToMain();
          }
        }
      }
    };

    const t = window.setTimeout(() => {
      void runAll();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [selectedIds, benchmarkKey]);

  const algorithms = useMemo(() => {
    return baseAlgorithms.map((a) => ({
      ...a,
      benchmarkPoints: benchmarkById[a.id]?.random ?? [],
      benchmarkByCase: benchmarkById[a.id] ?? {},
    }));
  }, [baseAlgorithms, benchmarkById]);

  const maxSteps = useMemo(() => computeMaxSteps(algorithms), [algorithms]);

  useEffect(() => {
    dispatch({ type: "RESET_ANIMATION" });
  }, [selectedIds, inputData]);

  const value = useMemo<LabContextValue>(
    () => ({
      ...reducerState,
      algorithms,
      maxSteps,
      dispatch,
    }),
    [reducerState, algorithms, maxSteps],
  );

  return (
    <LabContext.Provider value={value}>{children}</LabContext.Provider>
  );
}

export function useLabContext(): LabContextValue {
  const ctx = useContext(LabContext);
  if (!ctx) {
    throw new Error("useLabContext must be used within LabProvider");
  }
  return ctx;
}

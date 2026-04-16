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
  buildAlgorithmStates,
  buildBenchmarkPoints,
} from "../hooks/useAlgorithmSteps";
import type {
  AlgorithmId,
  BenchmarkPoint,
  LabReducerState,
  LabState,
  TopicId,
} from "../types/lab";

function generateRandomData(n: number): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 990) + 10);
}

const DEFAULT_SIZE = 100;

const initialReducerState: LabReducerState = {
  activeTopic: "sorting",
  selectedIds: [],
  inputData: generateRandomData(DEFAULT_SIZE),
  inputSize: DEFAULT_SIZE,
  currentStep: 0,
  playState: "idle",
  speed: 1,
  showComplexityChart: false,
  complexityChartMode: "steps",
  sidebarCollapsed: false,
  layoutFlipped: false,
};

export type LabAction =
  | { type: "SET_TOPIC"; topic: TopicId | null }
  | { type: "TOGGLE_ALGORITHM"; id: AlgorithmId }
  | { type: "SET_INPUT_DATA"; data: number[] }
  | { type: "SET_INPUT_SIZE"; size: number }
  | { type: "TOGGLE_COMPLEXITY_CHART" }
  | { type: "SET_COMPLEXITY_CHART_MODE"; mode: LabState["complexityChartMode"] }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "TOGGLE_LAYOUT_FLIP" }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "TICK"; maxSteps: number; stepsToAdvance?: number }
  | { type: "SET_SPEED"; speed: number }
  | { type: "RESET_ANIMATION" };

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
      const size = Math.max(20, Math.min(100, action.size));
      return {
        ...state,
        inputSize: size,
        inputData: generateRandomData(size),
        currentStep: 0,
        playState: "idle",
      };
    }
    case "TOGGLE_COMPLEXITY_CHART":
      return { ...state, showComplexityChart: !state.showComplexityChart };
    case "SET_COMPLEXITY_CHART_MODE":
      return { ...state, complexityChartMode: action.mode };
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
    case "RESET_ANIMATION":
      return { ...state, currentStep: 0, playState: "idle" };
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
  const [benchmarkById, setBenchmarkById] = useState<
    Partial<Record<AlgorithmId, BenchmarkPoint[]>>
  >({});

  const { selectedIds, inputData } = reducerState;

  const baseAlgorithms = useMemo(
    () => buildAlgorithmStates(selectedIds, inputData),
    [selectedIds, inputData],
  );

  useEffect(() => {
    let cancelled = false;
    setBenchmarkById({});
    const ids = selectedIds;
    if (ids.length === 0) return;

    const run = () => {
      if (cancelled) return;
      const next: Partial<Record<AlgorithmId, BenchmarkPoint[]>> = {};
      for (const id of ids) {
        if (cancelled) return;
        next[id] = buildBenchmarkPoints(id);
      }
      if (!cancelled) setBenchmarkById(next);
    };

    const idle =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 0);

    const handle = idle(run);

    return () => {
      cancelled = true;
      if (typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(handle as number);
      } else {
        clearTimeout(handle as number);
      }
    };
  }, [selectedIds]);

  const algorithms = useMemo(() => {
    return baseAlgorithms.map((a) => ({
      ...a,
      benchmarkPoints: benchmarkById[a.id] ?? [],
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

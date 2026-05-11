import { useMemo } from "react";
import type { TraceEvent } from "@/types/trace";
import { ALGORITHM_TO_CONVERTER_KEY, TRACE_CONVERTERS } from "@/data/implementations/traceConverters";
import { rebuildCallStack } from "@/utils/traceUtils";

interface UsePlaygroundAnimationStepsOptions {
  trace: TraceEvent[];
  rawTrace: TraceEvent[];
  rawIndexMap: number[];
  appliedAlgo: string | null;
  activeTab: "animation" | "graph";
  currentStep: number;
}

export function usePlaygroundAnimationSteps({
  trace,
  rawTrace,
  rawIndexMap,
  appliedAlgo,
  activeTab,
  currentStep,
}: UsePlaygroundAnimationStepsOptions) {
  const animationSteps = useMemo(() => {
    if (trace.length === 0 || !appliedAlgo) return [];
    const converterKey = ALGORITHM_TO_CONVERTER_KEY[appliedAlgo];
    const converter = converterKey ? TRACE_CONVERTERS[converterKey] : undefined;
    return converter ? converter(trace) : [];
  }, [trace, appliedAlgo]);

  const allStepsElements = useMemo(
    () => animationSteps.map((s) => s.elements ?? []),
    [animationSteps],
  );

  const isLevel1 = animationSteps.length > 0 && activeTab === "animation";
  const totalSteps = isLevel1 ? animationSteps.length : rawTrace.length;

  const rawStepForLineno = isLevel1 ? (rawIndexMap[currentStep] ?? 0) : currentStep;
  const currentEvent = rawTrace[rawStepForLineno] ?? null;

  const activeLineno: number[] | undefined = useMemo(() => {
    if (!isLevel1 || rawIndexMap.length === 0) {
      const ln = currentEvent?.meta?.lineno as number | undefined;
      return ln != null ? [ln] : undefined;
    }
    const endIdx = rawIndexMap[currentStep] ?? 0;
    const startIdx = currentStep > 0 ? (rawIndexMap[currentStep - 1] ?? 0) : 0;
    const lines = new Set<number>();
    for (let i = startIdx; i <= endIdx; i++) {
      const ln = rawTrace[i]?.meta?.lineno as number | undefined;
      if (ln != null) lines.add(ln);
    }
    return lines.size > 0 ? [...lines] : undefined;
  }, [isLevel1, rawIndexMap, currentStep, currentEvent, rawTrace]);

  const globalVars = useMemo(() => currentEvent?.global_vars ?? {}, [currentEvent]);
  const localVars = useMemo(() => currentEvent?.local_vars ?? {}, [currentEvent]);
  const callStack = useMemo(
    () => rebuildCallStack(rawTrace, rawStepForLineno),
    [rawTrace, rawStepForLineno],
  );
  const activeFrame = callStack[callStack.length - 1] ?? null;

  return {
    animationSteps,
    allStepsElements,
    isLevel1,
    totalSteps,
    activeLineno,
    globalVars,
    localVars,
    callStack,
    activeFrame,
  };
}

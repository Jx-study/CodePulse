import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createSortingFrame } from "@/data/shared/animationUtils/linearFrame";
import { asTrace } from "@/data/shared/traceValue";
import { TAGS } from "./tags";

interface SelectionSortLocalVars {
  totalItems?: number;
  currentPos?: number;
  scanPos?: number;
  scanVal?: number;
  minVal?: number;
  minPos?: number;
  result?: boolean;
  hasSwapped?: boolean;
}

interface SelectionSortMeta {
  targetIndices?: number[];
  prepareIndices?: number[];
  sortedIndices?: number[];
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "animation.init",
    params: { n: asTrace<SelectionSortLocalVars>(e.local_vars).totalItems ?? null },
  }),
  [TAGS.ROUND_START]: (e) => {
    const lv = asTrace<SelectionSortLocalVars>(e.local_vars);
    return {
      key: "animation.round_start",
      params: {
        round: lv.currentPos !== undefined ? lv.currentPos + 1 : null,
        i: lv.currentPos ?? null,
      },
    };
  },
  [TAGS.COMPARE]: (e) => {
    const lv = asTrace<SelectionSortLocalVars>(e.local_vars);
    return {
      key: lv.result ? "animation.compare_true" : "animation.compare_false",
      params: {
        j: lv.scanPos ?? null,
        scanVal: lv.scanVal ?? null,
        minVal: lv.minVal ?? null,
      },
    };
  },
  [TAGS.UPDATE_MIN]: (e) => ({
    key: "animation.update_min",
    params: { minIdx: asTrace<SelectionSortLocalVars>(e.local_vars).minPos ?? null },
  }),
  [TAGS.SWAP]: (e) => {
    const lv = asTrace<SelectionSortLocalVars>(e.local_vars);
    return {
      key: lv.hasSwapped ? "animation.swap_true" : "animation.swap_false",
      params: { i: lv.currentPos ?? null, minIdx: lv.minPos ?? null },
    };
  },
  [TAGS.ROUND_END]: (e) => ({
    key: "animation.round_end",
    params: { i: asTrace<SelectionSortLocalVars>(e.local_vars).currentPos ?? null },
  }),
  [TAGS.DONE]: () => ({ key: "animation.done" }),
};

export function selectionSortTraceToSteps(
  trace: ExecutionTrace,
): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = asTrace<SelectionSortMeta>(event.meta);

    const targetIndices = meta.targetIndices ?? [];
    const prepareIndices = meta.prepareIndices ?? [];
    const sortedIndices = new Set<number>(meta.sortedIndices ?? []);

    const statusMap: Record<number, Status> = {};
    targetIndices.forEach((i) => (statusMap[i] = Status.Target));
    prepareIndices.forEach((i) => (statusMap[i] = Status.Prepare));

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements: createSortingFrame(
        event.dataSnapshot,
        statusMap,
        sortedIndices,
      ),
    };
  });
}

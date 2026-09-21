import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { TAGS } from "./tags";
import { createSortingFrame } from "@/data/shared/animationUtils/linearFrame";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { asTrace } from "@/data/shared/traceValue";

interface BubbleSortLocalVars {
  round?: number;
  index?: number;
  currentVal?: number;
  nextVal?: number;
  result?: boolean;
}

interface BubbleSortMeta {
  indices?: number[];
  sortedIndices?: number[];
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: () => ({ key: "animation.init" }),
  [TAGS.ROUND_START]: (e) => {
    const lv = asTrace<BubbleSortLocalVars>(e.local_vars);
    return {
      key: "animation.round_start",
      params: { round: lv.round !== undefined ? lv.round + 1 : null },
    };
  },
  [TAGS.GET_VALUES]: (e) => {
    const lv = asTrace<BubbleSortLocalVars>(e.local_vars);
    return {
      key: "animation.get_values",
      params: {
        idx: lv.index ?? null,
        idx2: lv.index !== undefined ? lv.index + 1 : null,
        v1: lv.currentVal ?? null,
        v2: lv.nextVal ?? null,
      },
    };
  },
  [TAGS.COMPARE]: (e) => {
    const lv = asTrace<BubbleSortLocalVars>(e.local_vars);
    return {
      key: lv.result ? "animation.compare_true" : "animation.compare_false",
      params: { v1: lv.currentVal ?? null, v2: lv.nextVal ?? null },
    };
  },
  [TAGS.SWAP]: () => ({ key: "animation.swap" }),
  [TAGS.ROUND_END]: (e) => ({
    key: "animation.round_end",
    params: { idx: asTrace<BubbleSortLocalVars>(e.local_vars).round ?? null },
  }),
  [TAGS.EARLY_EXIT]: (e) => {
    const lv = asTrace<BubbleSortLocalVars>(e.local_vars);
    return {
      key: "animation.early_exit",
      params: { round: lv.round !== undefined ? lv.round + 1 : null },
    };
  },
  [TAGS.DONE]: () => ({ key: "animation.done" }),
};

export function bubbleSortTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = asTrace<BubbleSortMeta>(event.meta);
    const indices = meta.indices ?? [];
    const sortedIndices = new Set<number>(meta.sortedIndices ?? []);
    const statusMap: Record<number, Status> = {};
    indices.forEach(
      (i: number) =>
        (statusMap[i] =
          event.tag === TAGS.SWAP ? Status.Target : Status.Prepare),
    );

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

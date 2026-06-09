import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { TAGS } from "./tags";
import { createSortingFrame } from "@/data/shared/animationUtils/linearFrame";
import { Status } from "@/modules/core/DataLogic/BaseElement";

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: () => ({ key: "animation.init" }),
  [TAGS.ROUND_START]: (e) => ({
    key: "animation.round_start",
    params: { round: e.local_vars.round + 1 },
  }),
  [TAGS.GET_VALUES]: (e) => ({
    key: "animation.get_values",
    params: {
      idx: e.local_vars.index,
      idx2: e.local_vars.index + 1,
      v1: e.local_vars.currentVal,
      v2: e.local_vars.nextVal,
    },
  }),
  [TAGS.COMPARE]: (e) => ({
    key: e.local_vars.result
      ? "animation.compare_true"
      : "animation.compare_false",
    params: { v1: e.local_vars.currentVal, v2: e.local_vars.nextVal },
  }),
  [TAGS.SWAP]: () => ({ key: "animation.swap" }),
  [TAGS.ROUND_END]: (e) => ({
    key: "animation.round_end",
    params: { idx: e.local_vars.round },
  }),
  [TAGS.EARLY_EXIT]: (e) => ({
    key: "animation.early_exit",
    params: { round: e.local_vars.round + 1 },
  }),
  [TAGS.DONE]: () => ({ key: "animation.done" }),
};

export function bubbleSortTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = event.meta ?? {};
    const indices = (meta.indices as number[]) ?? [];
    const sortedIndices = new Set<number>(
      (meta.sortedIndices as number[]) ?? [],
    );
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
        event.dataSnapshot as any,
        statusMap,
        sortedIndices,
      ),
    };
  });
}

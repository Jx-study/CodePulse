import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createSortingFrame } from "@/data/shared/animationUtils/linearFrame";
import { TAGS } from "./tags";

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "animation.init",
    params: { n: e.local_vars.totalItems },
  }),
  [TAGS.ROUND_START]: (e) => ({
    key: "animation.round_start",
    params: { round: e.local_vars.currentPos + 1, i: e.local_vars.currentPos },
  }),
  [TAGS.COMPARE]: (e) => ({
    key: e.local_vars.result
      ? "animation.compare_true"
      : "animation.compare_false",
    params: {
      j: e.local_vars.scanPos,
      scanVal: e.local_vars.scanVal,
      minVal: e.local_vars.minVal,
    },
  }),
  [TAGS.UPDATE_MIN]: (e) => ({
    key: "animation.update_min",
    params: { minIdx: e.local_vars.minPos },
  }),
  [TAGS.SWAP]: (e) => ({
    key: e.local_vars.hasSwapped
      ? "animation.swap_true"
      : "animation.swap_false",
    params: { i: e.local_vars.currentPos, minIdx: e.local_vars.minPos },
  }),
  [TAGS.ROUND_END]: (e) => ({
    key: "animation.round_end",
    params: { i: e.local_vars.currentPos },
  }),
  [TAGS.DONE]: () => ({ key: "animation.done" }),
};

export function selectionSortTraceToSteps(
  trace: ExecutionTrace,
): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = event.meta ?? {};

    const targetIndices = (meta.targetIndices as number[]) ?? [];
    const prepareIndices = (meta.prepareIndices as number[]) ?? [];
    const sortedIndices = new Set<number>(
      (meta.sortedIndices as number[]) ?? [],
    );

    const statusMap: Record<number, Status> = {};
    targetIndices.forEach((i) => (statusMap[i] = Status.Target));
    prepareIndices.forEach((i) => (statusMap[i] = Status.Prepare));

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements: createSortingFrame(
        event.dataSnapshot as any[],
        statusMap,
        sortedIndices,
      ),
    };
  });
}

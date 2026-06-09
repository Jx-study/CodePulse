import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createSortingFrame } from "@/data/shared/animationUtils/linearFrame";
import { TAGS } from "./tags";

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key:
      e.local_vars.totalItems !== undefined
        ? "animation.init_start"
        : "animation.init_zero",
    params: { n: e.local_vars.totalItems },
  }),
  [TAGS.ROUND_START]: (e) => ({
    key: "animation.round_start",
    params: { i: e.local_vars.unsortedPos, val: e.local_vars.insertVal },
  }),
  [TAGS.COMPARE]: (e) => ({
    key: e.local_vars.result
      ? "animation.compare_true"
      : "animation.compare_false",
    params: {
      j: e.local_vars.scanPos,
      scanVal: e.local_vars.scanVal,
      keyVal: e.local_vars.insertVal,
    },
  }),
  [TAGS.SHIFT]: (e) => ({
    key: "animation.shift",
    params: { scanVal: e.local_vars.shiftVal, keyVal: e.local_vars.insertVal },
  }),
  [TAGS.INSERT]: (e) => ({
    key: "animation.insert",
    params: { val: e.local_vars.insertVal, idx: e.local_vars.insertPos },
  }),
  [TAGS.ROUND_END]: (e) => ({
    key: "animation.round_end",
    params: { i: e.local_vars.sortedBoundary },
  }),
  [TAGS.DONE]: () => ({ key: "animation.done" }),
};

export function insertionSortTraceToSteps(
  trace: ExecutionTrace,
): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = event.meta ?? {};

    const targetIndices = (meta.targetIndices as number[]) ?? [];
    const prepareIndices = (meta.prepareIndices as number[]) ?? [];
    const completeIndices = (meta.completeIndices as number[]) ?? [];
    const sortedIndices = new Set<number>(
      (meta.sortedIndices as number[]) ?? [],
    );

    const statusMap: Record<number, Status> = {};
    targetIndices.forEach((i) => (statusMap[i] = Status.Target));
    prepareIndices.forEach((i) => (statusMap[i] = Status.Prepare));
    completeIndices.forEach((i) => (statusMap[i] = Status.Complete));

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

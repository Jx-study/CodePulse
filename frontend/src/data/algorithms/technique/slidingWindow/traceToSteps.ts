import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Box } from "@/modules/core/DataLogic/Box";
import { Pointer } from "@/modules/core/DataLogic/Pointer";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "@/data/DataStructure/linear/utils";
import { TAGS, SlidingWindowStatus } from "./tags";

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key:
      e.meta?.mode === "shortest_gte"
        ? "animation.init_shortest"
        : "animation.init_longest",
    params: { target: e.meta?.targetSum },
  }),
  [TAGS.EXPAND_RIGHT]: (e) => ({
    key: "animation.expand_right",
    params: { val: e.local_vars.val, r: e.local_vars.right },
  }),
  [TAGS.CHECK_WHILE]: (e) => ({
    key: "animation.check_while",
    params: { val: e.local_vars.val, sum: e.local_vars.currentSum },
  }),
  [TAGS.SHRINK_LEFT]: (e) => ({
    key:
      e.meta?.mode === "shortest_gte"
        ? "animation.shrink_shortest"
        : "animation.shrink_longest",
    params: {
      sum: e.local_vars.currentSum,
      target: e.local_vars.targetSum,
      l: e.local_vars.left,
    },
  }),
  [TAGS.UPDATE_RESULT]: (e) => ({
    key:
      e.meta?.mode === "shortest_gte"
        ? "animation.update_shortest"
        : "animation.update_longest",
    params: {
      len: e.local_vars.minLen ?? e.local_vars.maxLen,
      l: e.local_vars.left,
      r: e.local_vars.right,
    },
  }),
  [TAGS.DONE]: (e) => ({
    key:
      e.local_vars.bestLeft !== undefined
        ? "animation.done_success"
        : "animation.done_fail",
    params: {
      len: e.local_vars.minLen ?? e.local_vars.maxLen,
      l: e.local_vars.bestLeft,
      r: e.local_vars.bestRight,
      target: e.meta?.targetSum,
    },
  }),
};

const createSlidingPointers = (
  left: number,
  right: number,
  startX: number,
  startY: number,
  gap: number,
): Pointer[] => {
  const isOverlap = right !== -1 && left === right;
  const lXOffset = isOverlap ? -20 : 0;
  const rXOffset = isOverlap ? 20 : 0;
  const effectiveRight = right === -1 ? 0 : right;

  const leftPtr = new Pointer("L", "up");
  leftPtr.id = "sliding-L";
  leftPtr.moveTo(startX + left * gap + lXOffset, startY + 50);

  const rightPtr = new Pointer("R", "up");
  rightPtr.id = "sliding-R";
  rightPtr.moveTo(startX + effectiveRight * gap + rXOffset, startY + 50);
  rightPtr.opacity = right === -1 ? 0 : 1;

  return [leftPtr, rightPtr];
};

export function slidingWindowTraceToSteps(
  trace: ExecutionTrace,
): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = event.meta ?? {};
    const left = meta.left ?? 0;
    const right = meta.right ?? -1;
    const bestLeft = meta.bestLeft ?? -1;
    const bestRight = meta.bestRight ?? -1;
    const shrinkIndex = meta.shrinkIndex ?? -1;

    const boxes = createBoxes(event.dataSnapshot as LinearData[], {
      startX: 50,
      startY: 200,
      gap: 70,
      overrideStatusMap: {},
      getDescription: (_item, index) => String(index),
    });

    boxes.forEach((element, i) => {
      const box = element as Box;
      const inCurrentWindow = i >= left && i <= right;
      const inBestWindow =
        bestLeft !== -1 && bestRight !== -1 && i >= bestLeft && i <= bestRight;

      if (event.tag === TAGS.DONE && inBestWindow) {
        box.setStatus(SlidingWindowStatus.Optimal as Status);
      } else if (i === shrinkIndex) {
        box.setStatus(SlidingWindowStatus.Shrinking as Status);
      } else if (inCurrentWindow) {
        box.setStatus(SlidingWindowStatus.WindowActive as Status);
      } else {
        box.setStatus(SlidingWindowStatus.Inactive as Status);
      }
    });

    const pointers = createSlidingPointers(left, right, 50, 200, 70);

    return {
      stepNumber: idx,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements: [...boxes, ...pointers] as any,
    };
  });
}

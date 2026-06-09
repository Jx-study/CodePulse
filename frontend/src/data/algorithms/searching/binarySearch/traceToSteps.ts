import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Box } from "@/modules/core/DataLogic/Box";
import { Pointer } from "@/modules/core/DataLogic/Pointer";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "@/data/DataStructure/linear/utils";
import { TAGS } from "./tags";

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "animation.init",
    params: { target: e.local_vars.target },
  }),
  [TAGS.CHECK_WHILE]: (e) => ({
    key: "animation.check_while",
    params: { left: e.local_vars.left, right: e.local_vars.right },
  }),
  [TAGS.CALC_MID]: (e) => ({
    key: "animation.calc_mid",
    params: {
      left: e.local_vars.left,
      right: e.local_vars.right,
      mid: e.local_vars.mid,
    },
  }),
  [TAGS.COMPARE]: (e) => ({
    key: "animation.compare",
    params: {
      mid: e.local_vars.mid,
      midVal: e.local_vars.midVal,
      target: e.local_vars.target,
    },
  }),
  [TAGS.FOUND]: (e) => ({
    key: "animation.found",
    params: {
      midVal: e.local_vars.midVal,
      target: e.local_vars.target,
      mid: e.local_vars.foundIndex,
    },
  }),
  [TAGS.UPDATE_LEFT]: (e) => ({
    key: "animation.update_left",
    params: {
      midVal: e.local_vars.midVal,
      target: e.local_vars.target,
      mid: e.local_vars.mid,
      newLeft: e.local_vars.newLeft,
    },
  }),
  [TAGS.UPDATE_RIGHT]: (e) => ({
    key: "animation.update_right",
    params: {
      midVal: e.local_vars.midVal,
      target: e.local_vars.target,
      mid: e.local_vars.mid,
      newRight: e.local_vars.newRight,
    },
  }),
  [TAGS.NOT_FOUND]: (e) => ({
    key: "animation.not_found",
    params: { target: e.local_vars.target },
  }),
};

const createBinaryPointers = (
  left: number,
  right: number,
  mid: number,
  startX: number,
  startY: number,
  gap: number,
): Pointer[] => {
  const pointers: Pointer[] = [];
  const leftXOffset = left === right ? -20 : 0;
  const rightXOffset = left === right ? 20 : 0;

  const leftPtr = new Pointer("L", "up");
  leftPtr.id = "binary-L";
  leftPtr.moveTo(startX + left * gap + leftXOffset, startY + 50);
  pointers.push(leftPtr);

  const rightPtr = new Pointer("R", "up");
  rightPtr.id = "binary-R";
  rightPtr.moveTo(startX + right * gap + rightXOffset, startY + 50);
  pointers.push(rightPtr);

  const effectiveMid = mid !== -1 ? mid : Math.floor((left + right) / 2);
  const midPtr = new Pointer("M", "down");
  midPtr.id = "binary-M";
  midPtr.moveTo(startX + effectiveMid * gap, startY - 40);
  midPtr.opacity = mid !== -1 ? 1 : 0;
  pointers.push(midPtr);

  return pointers;
};

export function binarySearchTraceToSteps(
  trace: ExecutionTrace,
): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = event.meta ?? {};
    const { left, right, mid } = meta;
    const foundIndex = meta.foundIndex ?? -1;

    const targetIndices = (meta.targetIndices as number[]) ?? [];
    const prepareIndices = (meta.prepareIndices as number[]) ?? [];
    const completeIndices = (meta.completeIndices as number[]) ?? [];

    const overrideStatusMap: Record<number, Status> = {};
    targetIndices.forEach((i) => (overrideStatusMap[i] = Status.Target));
    prepareIndices.forEach((i) => (overrideStatusMap[i] = Status.Prepare));
    completeIndices.forEach((i) => (overrideStatusMap[i] = Status.Complete));

    const boxes = createBoxes(event.dataSnapshot as LinearData[], {
      startX: 50,
      startY: 200,
      gap: 70,
      overrideStatusMap,
      getDescription: (_item, index) => String(index),
    });

    boxes.forEach((element, i) => {
      const box = element as Box;
      if (i < left || i > right) box.setStatus(Status.Inactive);
      if (foundIndex !== -1 && i === foundIndex) box.setStatus(Status.Complete);
    });

    const pointers = createBinaryPointers(left, right, mid, 50, 200, 70);

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements: [...boxes, ...pointers] as any,
    };
  });
}

import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Box } from "@/modules/core/DataLogic/Box";
import { asTrace } from "@/data/shared/traceValue";
import { TAGS } from "./tags";
import { TrackedItem } from "./simulateTrace";

interface MergeSortLocalVars {
  chosenVal?: number;
  depth?: number;
  leftVal?: number;
  rightVal?: number;
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: () => ({ key: "animation.init" }),
  [TAGS.IF_RETURN]: (e) => ({
    key: "animation.if_return",
    params: { val: asTrace<MergeSortLocalVars>(e.local_vars).chosenVal ?? null },
  }),
  [TAGS.DIVIDE]: (e) => ({
    key: "animation.divide",
    params: { depth: asTrace<MergeSortLocalVars>(e.local_vars).depth ?? null },
  }),
  [TAGS.MERGE_START]: (e) => {
    const lv = asTrace<MergeSortLocalVars>(e.local_vars);
    return {
      key: "animation.merge_start",
      params: { depth: lv.depth !== undefined ? lv.depth - 1 : null },
    };
  },
  [TAGS.COMPARE]: (e) => ({
    key: "animation.compare",
    params: { v1: e.local_vars.leftVal, v2: e.local_vars.rightVal },
  }),
  [TAGS.LEFT_COPY]: (e) => ({
    key: "animation.copy_element",
    params: { val: e.local_vars.chosenVal },
  }),
  [TAGS.RIGHT_COPY]: (e) => ({
    key: "animation.copy_element",
    params: { val: e.local_vars.chosenVal },
  }),
  [TAGS.REMAINING]: (e) => ({
    key:
      e.local_vars.side === "left"
        ? "animation.remaining_left"
        : "animation.remaining_right",
    params: { val: e.local_vars.chosenVal },
  }),
  [TAGS.MERGE_END]: () => ({ key: "animation.merge_end" }),
  [TAGS.DONE]: () => ({ key: "animation.done" }),
};

export function mergeSortTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const items = event.dataSnapshot as TrackedItem[];

    const elements = items.map((item) => {
      const box = new Box();
      box.id = item.id;
      box.value = String(item.value);
      box.moveTo(item.x, item.y);
      box.width = 50;
      box.height = 50;
      box.description = item.description;
      box.setStatus(item.status);
      box.autoScale = true;
      return box;
    });

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements,
    };
  });
}

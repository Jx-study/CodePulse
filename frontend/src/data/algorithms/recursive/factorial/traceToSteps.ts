import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Box } from "@/modules/core/DataLogic/Box";
import { TAGS } from "./tags";

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "animation.init",
    params: { targetN: e.local_vars.targetN },
  }),
  [TAGS.PUSH_START]: (e) => ({
    key: "animation.push_start",
    params: { n: e.local_vars.n },
  }),
  [TAGS.PUSH_ASSIGN]: (e) => ({
    key: "animation.push_assign",
    params: { n: e.local_vars.n },
  }),
  [TAGS.BASE_CASE]: (e) => ({
    key: "animation.base_case",
    params: { n: e.local_vars.n, val: e.local_vars.val },
  }),
  [TAGS.CALC_START]: (e) => ({
    key: "animation.calc_start",
    params: {
      current_f: e.local_vars.current_f,
      child_val: e.local_vars.child_val,
      current_val: e.local_vars.current_val,
    },
  }),
  [TAGS.CALC_MULTIPLY]: (e) => ({
    key: "animation.calc_multiply",
    params: {
      current_f: e.local_vars.current_f,
      child_val: e.local_vars.child_val,
      new_val: e.local_vars.new_val,
    },
  }),
  [TAGS.POP_RIGHT]: (e) => ({
    key: "animation.pop_right",
    params: {
      returned_f: e.local_vars.returned_f,
      returned_val: e.local_vars.returned_val,
    },
  }),
  [TAGS.DONE]: (e) => ({
    key: "animation.done",
    params: {
      targetN: e.local_vars.targetN,
      final_result: e.local_vars.final_result,
    },
  }),
};

export function factorialTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  const startX = 100;
  const startY = 200;
  const gap = 70;

  return trace.map((event, idx) => {
    const elements: Box[] = [];

    const stack: { n: number; val: number }[] = event.meta?.stack || [];
    const preparingNode = event.meta?.preparingNode;
    const poppingNode = event.meta?.poppingNode;
    const highlightIndices: number[] = event.meta?.highlightIndices || [];
    const completeIndices: number[] = event.meta?.completeIndices || [];

    const createFactBox = (
      n: number,
      val: number,
      x: number,
      status: Status,
    ) => {
      const box = new Box();
      box.id = `fact-${n}`;
      box.value = String(val);
      box.description = `f(${n})`;
      box.width = 60;
      box.height = 60;
      box.moveTo(x, startY);
      box.setStatus(status);
      return box;
    };

    // 1. 繪製當前仍在 Stack 中的方塊 (由右往左排列)
    stack.forEach((item, i) => {
      const targetX = startX + i * gap;
      let status = Status.Unfinished;

      if (completeIndices.includes(i)) {
        status = Status.Complete;
      } else if (highlightIndices.includes(i)) {
        status = Status.Target;
      }

      elements.push(createFactBox(item.n, item.val, targetX, status));
    });

    // 2. 繪製準備進場的方塊 (由右側 950 進場)
    if (preparingNode) {
      elements.push(
        createFactBox(preparingNode.n, preparingNode.val, 950, Status.Prepare),
      );
    }

    // 3. 繪製 Pop 退場往右飛走的方塊 (飛回右側 950)
    if (poppingNode) {
      elements.push(
        createFactBox(poppingNode.n, poppingNode.val, 950, Status.Prepare),
      );
    }

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements: elements as any,
    };
  });
}

import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createTreeNodes } from "@/data/DataStructure/nonlinear/utils";
import { TAGS } from "./tags";

const STATUS_MAP: Record<string, Status> = {
  Target: Status.Target,
  Complete: Status.Complete,
  Prepare: Status.Prepare,
  Unfinished: Status.Unfinished,
};

function toStatus(s?: string): Status {
  return s ? (STATUS_MAP[s] ?? Status.Unfinished) : Status.Unfinished;
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.FIB_START]: (e) => ({
    key: "animation.start",
    params: { targetN: e.local_vars.targetN },
  }),
  [TAGS.FIB_CALL]: (e) => ({
    key: "animation.call",
    params: { n: e.local_vars.n },
  }),
  [TAGS.FIB_BASE]: (e) => ({
    key: "animation.base",
    params: { n: e.local_vars.n, result: e.local_vars.result },
  }),
  [TAGS.FIB_CALC]: (e) => ({
    key: "animation.calc",
    params: {
      n: e.local_vars.n,
      leftVal: e.local_vars.leftVal,
      rightVal: e.local_vars.rightVal,
      result: e.local_vars.result,
    },
  }),
  [TAGS.FIB_DONE]: (e) => ({
    key: "animation.done",
    params: { result: e.local_vars.result },
  }),
};

export function fibonacciTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const treeRoot = event.meta?.tree;
    const statusMap = event.meta?.statusMap || {};
    const valueMap = event.meta?.valueMap || {};
    const highlightId = event.meta?.highlightId;

    // 將深拷貝的動態樹直接餵給 createTreeNodes 產生排版
    const elements = createTreeNodes(treeRoot, {
      width: 800,
      height: 400,
      offsetX: 0,
      offsetY: 50,
      type: "custom",
    });

    elements.forEach((node) => {
      // 處理狀態顏色
      const customStatus = statusMap[node.id];
      if (node.id === highlightId) {
        node.setStatus(Status.Target);
      } else if (customStatus) {
        node.setStatus(toStatus(customStatus));
      }

      // 如果這層算完有結果了，就把主數值換成結果，原本的 f(n) 到描述
      const originalText = node.value; // 這會是 "f(n)"
      const calculatedResult = valueMap[node.id];

      if (calculatedResult !== undefined) {
        node.value = String(calculatedResult);
        node.description = String(originalText);
      } else {
        node.value = originalText;
        node.description = "";
      }
    });

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements: elements as any,
    };
  });
}

import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createTreeNodes } from "@/data/DataStructure/nonlinear/utils";
import {
  toStatus,
  toOverrideMap,
} from "@/data/implementations/traceConverters";
import { TAGS } from "./tags";

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "animation.init",
    params: { heapName: e.local_vars.heapName ?? "Heap" },
  }),
  [TAGS.INSERT_START]: (e) => ({
    key: "animation.insert_start",
    params: { value: e.local_vars.value, index: e.local_vars.index },
  }),
  [TAGS.HEAPIFY_UP_COMPARE]: (e) => ({
    key: "animation.heapify_up_compare",
    params: { curVal: e.local_vars.curVal, parentVal: e.local_vars.parentVal },
  }),
  [TAGS.HEAPIFY_UP_SWAP]: (e) => ({
    key: e.local_vars.isMinHeap
      ? "animation.heapify_up_swap_min"
      : "animation.heapify_up_swap_max",
  }),
  [TAGS.EXTRACT_START]: (e) => ({
    key: e.local_vars.isMinHeap
      ? "animation.extract_start_min"
      : "animation.extract_start_max",
    params: { extVal: e.local_vars.extVal },
  }),
  [TAGS.EXTRACT_SWAP_LAST]: () => ({ key: "animation.extract_swap_last" }),
  [TAGS.EXTRACT_REMOVE]: () => ({ key: "animation.extract_remove" }),
  [TAGS.HEAPIFY_DOWN_COMPARE]: (e) => ({
    key: e.local_vars.isMinHeap
      ? "animation.heapify_down_compare_min"
      : "animation.heapify_down_compare_max",
  }),
  [TAGS.HEAPIFY_DOWN_SWAP]: (e) => ({
    key: "animation.heapify_down_swap",
    params: { heapName: e.local_vars.heapName },
  }),
  [TAGS.PEEK]: (e) => ({
    key: e.local_vars.isMinHeap ? "animation.peek_min" : "animation.peek_max",
    params: { extVal: e.local_vars.extVal },
  }),
  [TAGS.HEAPIFY_START]: (e) => ({
    key: "animation.heapify_start",
    params: { length: e.local_vars.length, heapName: e.local_vars.heapName },
  }),
  [TAGS.DONE]: (e) => ({
    key: "animation.done",
    params: { heapName: e.local_vars.heapName },
  }),
};

export function heapTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const elements = createTreeNodes(event.dataSnapshot as any[], {
      width: 700,
      height: 300,
      offsetX: 0,
      offsetY: 50,
      type: "binarytree",
    });

    const defaultStatus = toStatus(event.meta?.status);
    const overrideMap = toOverrideMap(event.meta?.overrideStatusMap);
    const highlightIdx = event.meta?.highlightIndex ?? -1;

    elements.forEach((node, i) => {
      const isHighlighted = highlightIdx === i;

      if (overrideMap[i] !== undefined) {
        node.setStatus(overrideMap[i]);
      } else if (isHighlighted) {
        node.setStatus(Status.Target);
      } else {
        node.setStatus(defaultStatus);
      }

      node.description = `${i}`;
    });

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      local_vars: event.local_vars,
      elements: elements as any,
    };
  });
}

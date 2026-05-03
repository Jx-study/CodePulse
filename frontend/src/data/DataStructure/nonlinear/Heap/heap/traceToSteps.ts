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

function toOverrideMap(raw?: Record<number, string>): Record<number, Status> {
  if (!raw) return {};
  const result: Record<number, Status> = {};
  for (const [k, v] of Object.entries(raw)) {
    result[Number(k)] = toStatus(v);
  }
  return result;
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: () => ({ key: "heap.init" }),
  [TAGS.INSERT_START]: (e) => ({
    key: "heap.insert_start",
    params: { value: e.local_vars.value, index: e.local_vars.index },
  }),
  [TAGS.HEAPIFY_UP_COMPARE]: (e) => ({
    key: "heap.heapify_up_compare",
    params: { curVal: e.local_vars.curVal, parentVal: e.local_vars.parentVal },
  }),
  [TAGS.HEAPIFY_UP_SWAP]: () => ({ key: "heap.heapify_up_swap" }),
  [TAGS.EXTRACT_START]: (e) => ({
    key: "heap.extract_start",
    params: { maxVal: e.local_vars.maxVal },
  }),
  [TAGS.EXTRACT_SWAP_LAST]: () => ({ key: "heap.extract_swap_last" }),
  [TAGS.EXTRACT_REMOVE]: () => ({ key: "heap.extract_remove" }),
  [TAGS.HEAPIFY_DOWN_COMPARE]: () => ({ key: "heap.heapify_down_compare" }),
  [TAGS.HEAPIFY_DOWN_SWAP]: () => ({ key: "heap.heapify_down_swap" }),

  [TAGS.PEEK]: (e) => ({
    key: "heap.peek",
    params: { maxVal: e.local_vars.maxVal },
  }),
  [TAGS.HEAPIFY_START]: (e) => ({
    key: "heap.heapify_start",
    params: { length: e.local_vars.length },
  }),

  [TAGS.DONE]: () => ({ key: "heap.done" }),
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

      node.description = `[${i}]`;
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

import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { createBoxes } from "@/data/DataStructure/linear/utils";
import { toStatus, toOverrideMap } from "@/data/implementations/traceConverters";
import { asTrace } from "@/data/shared/traceValue";
import { TAGS } from "./tags";

interface ArrayMeta {
  isInitial?: boolean;
  highlightIndex?: number;
  status?: string;
  overrideStatusMap?: Record<number, string>;
}

// tag → StepDescription factory
const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.SEARCH_START]: (e) =>
    e.meta?.isInitial
      ? { key: "animation.initial_state" }
      : { key: "animation.search_start", params: { value: e.local_vars.target } },

  [TAGS.SEARCH_COMPARE]: (e) => ({
    key: "animation.search_compare",
    params: {
      index: e.local_vars.i,
      current_val: e.local_vars.current_val,
      value: e.local_vars.target,
    },
  }),

  [TAGS.SEARCH_FOUND]: (e) => ({
    key: "animation.search_found",
    params: { value: e.local_vars.target, index: e.local_vars.i },
  }),

  [TAGS.SEARCH_NOT_FOUND]: (e) => ({
    key: "animation.search_not_found",
    params: { value: e.local_vars.target },
  }),

  [TAGS.UPDATE_START]: (e) => ({
    key: "animation.update_start",
    params: { index: e.local_vars.index },
  }),

  [TAGS.UPDATE_ASSIGN]: (e) => ({
    key: "animation.update_assign",
    params: { index: e.local_vars.index, value: e.local_vars.value },
  }),

  [TAGS.UPDATE_COMPLETE]: (_e) => ({ key: "animation.update_complete" }),

  [TAGS.UPDATE_ERROR]: (e) => ({
    key: "animation.update_error",
    params: { index: e.local_vars.index },
  }),

  [TAGS.INSERT_START]: (_e) => ({ key: "animation.insert_start" }),

  [TAGS.INSERT_SHIFT]: (e) =>
    e.meta?.isShiftDone
      ? {
          key: "animation.insert_shift_done",
          params: {
            index: e.local_vars.i,
            value: e.local_vars[`data[${e.local_vars.i}]`],
          },
        }
      : {
          key: "animation.insert_shift_prepare",
          params: {
            from: e.local_vars.from,
            fromValue: e.local_vars.fromValue,
            to: e.local_vars.to,
          },
        },

  [TAGS.INSERT_ASSIGN]: (e) => ({
    key: "animation.insert_assign",
    params: { index: e.local_vars.index, value: e.local_vars.value },
  }),

  [TAGS.INSERT_COMPLETE]: (_e) => ({ key: "animation.insert_complete" }),

  [TAGS.DELETE_START]: (e) => ({
    key: "animation.delete_start",
    params: { index: e.local_vars.index, value: e.local_vars.value },
  }),

  [TAGS.DELETE_SHIFT]: (e) =>
    e.meta?.isShiftDone
      ? {
          key: "animation.delete_shift_done",
          params: {
            index: e.local_vars.i,
            value: e.local_vars[`data[${e.local_vars.i}]`],
          },
        }
      : {
          key: "animation.delete_shift_prepare",
          params: {
            from: e.local_vars.from,
            fromValue: e.local_vars.fromValue,
            to: e.local_vars.to,
          },
        },

  [TAGS.DELETE_REMOVE]: (_e) => ({ key: "animation.delete_remove" }),

  [TAGS.DELETE_COMPLETE]: (_e) => ({ key: "animation.delete_complete" }),
};

export function arrayTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = asTrace<ArrayMeta>(event.meta);
    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      elements: createBoxes(event.dataSnapshot, {
        startX: 50,
        startY: 200,
        gap: 70,
        highlightIndex: meta.highlightIndex ?? -1,
        status: toStatus(meta.status),
        forceXShiftIndex: -1,
        shiftDirection: 0,
        overrideStatusMap: toOverrideMap(meta.overrideStatusMap),
        getDescription: (_, i) => `${i}`,
      }),
      actionTag: event.tag,
      local_vars: event.local_vars,
      global_vars: event.global_vars,
    };
  });
}

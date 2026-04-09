import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes } from "@/data/DataStructure/linear/utils";
import { TAGS } from "./tags";

// status string → Status enum（meta 裡存字串，避免 Layer 1 import BaseElement）
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

// tag → StepDescription factory
const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.SEARCH_START]: (e) =>
    e.meta?.isInitial
      ? { key: "array.initial_state" }
      : { key: "array.search_start", params: { value: e.local_vars.target } },

  [TAGS.SEARCH_COMPARE]: (e) => ({
    key: "array.search_compare",
    params: {
      index: e.local_vars.i,
      current_val: e.local_vars.current_val,
      value: e.local_vars.target,
    },
  }),

  [TAGS.SEARCH_FOUND]: (e) => ({
    key: "array.search_found",
    params: { value: e.local_vars.target, index: e.local_vars.i },
  }),

  [TAGS.SEARCH_NOT_FOUND]: (e) => ({
    key: "array.search_not_found",
    params: { value: e.local_vars.target },
  }),

  [TAGS.UPDATE_START]: (e) => ({
    key: "array.update_start",
    params: { index: e.local_vars.index },
  }),

  [TAGS.UPDATE_ASSIGN]: (e) => ({
    key: "array.update_assign",
    params: { index: e.local_vars.index, value: e.local_vars.value },
  }),

  [TAGS.UPDATE_COMPLETE]: (_e) => ({ key: "array.update_complete" }),

  [TAGS.UPDATE_ERROR]: (e) => ({
    key: "array.update_error",
    params: { index: e.local_vars.index },
  }),

  [TAGS.INSERT_START]: (_e) => ({ key: "array.insert_start" }),

  [TAGS.INSERT_SHIFT]: (e) =>
    e.meta?.isShiftDone
      ? {
          key: "array.insert_shift_done",
          params: {
            index: e.local_vars.i,
            value: e.local_vars[`data[${e.local_vars.i}]`],
          },
        }
      : {
          key: "array.insert_shift_prepare",
          params: {
            from: e.local_vars.from,
            fromValue: e.local_vars.fromValue,
            to: e.local_vars.to,
          },
        },

  [TAGS.INSERT_ASSIGN]: (e) => ({
    key: "array.insert_assign",
    params: { index: e.local_vars.index, value: e.local_vars.value },
  }),

  [TAGS.INSERT_COMPLETE]: (_e) => ({ key: "array.insert_complete" }),

  [TAGS.DELETE_START]: (e) => ({
    key: "array.delete_start",
    params: { index: e.local_vars.index, value: e.local_vars.value },
  }),

  [TAGS.DELETE_SHIFT]: (e) =>
    e.meta?.isShiftDone
      ? {
          key: "array.delete_shift_done",
          params: {
            index: e.local_vars.i,
            value: e.local_vars[`data[${e.local_vars.i}]`],
          },
        }
      : {
          key: "array.delete_shift_prepare",
          params: {
            from: e.local_vars.from,
            fromValue: e.local_vars.fromValue,
            to: e.local_vars.to,
          },
        },

  [TAGS.DELETE_REMOVE]: (_e) => ({ key: "array.delete_remove" }),

  [TAGS.DELETE_COMPLETE]: (_e) => ({ key: "array.delete_complete" }),
};

export function arrayTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => ({
    stepNumber: idx + 1,
    description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
    elements: createBoxes(event.dataSnapshot, {
      startX: 50,
      startY: 200,
      gap: 70,
      highlightIndex: event.meta?.highlightIndex ?? -1,
      status: toStatus(event.meta?.status),
      forceXShiftIndex: -1,
      shiftDirection: 0,
      overrideStatusMap: toOverrideMap(event.meta?.overrideStatusMap),
      getDescription: (_, i) => `${i}`,
    }),
    actionTag: event.tag,
    variables: event.local_vars,
  }));
}

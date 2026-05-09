import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes } from "@/data/DataStructure/linear/utils";
import { createSortingFrame } from "@/data/shared/animationUtils/linearFrame";

// ---------------------------------------------------------------------------
// Sorting (bubble / selection / insertion)
// Tags: SORT_START, SORT_COMPARE, SORT_SWAP, SORT_INSERT, SORT_MIN_FOUND, SORT_END
// ---------------------------------------------------------------------------

const SORT_DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  SORT_START: () => ({ key: "sorting.start" }),
  SORT_COMPARE: (e) => ({
    key: "sorting.compare",
    params: { i: e.local_vars.i, j: e.local_vars.j },
  }),
  SORT_SWAP: (e) => ({
    key: "sorting.swap",
    params: { i: e.local_vars.i, j: e.local_vars.j },
  }),
  SORT_INSERT: (e) => ({
    key: "sorting.insert",
    params: { i: e.local_vars.i, j: e.local_vars.j },
  }),
  SORT_MIN_FOUND: (e) => ({
    key: "sorting.min_found",
    params: { i: e.local_vars.i, min_idx: e.local_vars.min_idx },
  }),
  SORT_END: () => ({ key: "sorting.end" }),
};

function sortingOverrideMap(tag: string, e: TraceEvent): Record<number, Status> {
  const override: Record<number, Status> = {};
  const i = e.local_vars.i as number | undefined;
  const j = e.local_vars.j as number | undefined;
  const min_idx = e.local_vars.min_idx as number | undefined;

  if (tag === "SORT_COMPARE" && i !== undefined && j !== undefined) {
    override[i] = Status.Prepare;
    override[j] = Status.Prepare;
  } else if (tag === "SORT_SWAP" && i !== undefined && j !== undefined) {
    override[i] = Status.Target;
    override[j] = Status.Target;
  } else if (tag === "SORT_INSERT" && i !== undefined && j !== undefined) {
    override[j] = Status.Target;
  } else if (tag === "SORT_MIN_FOUND" && i !== undefined && min_idx !== undefined) {
    override[i] = Status.Prepare;
    override[min_idx] = Status.Target;
  }

  return override;
}

export function sortingTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => ({
    stepNumber: idx + 1,
    description: SORT_DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
    elements: createSortingFrame(
      event.dataSnapshot,
      sortingOverrideMap(event.tag, event),
    ),
    actionTag: event.tag,
    local_vars: event.local_vars,
    global_vars: event.global_vars,
  }));
}

// ---------------------------------------------------------------------------
// Searching (linear / binary)
// Tags: SEARCH_START, SEARCH_COMPARE, SEARCH_FOUND, SEARCH_NOT_FOUND,
//       SEARCH_NARROW, SEARCH_END
// ---------------------------------------------------------------------------

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

const SEARCH_DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  SEARCH_START: (e) => ({
    key: "searching.start",
    params: { target: e.local_vars.target },
  }),
  SEARCH_COMPARE: (e) => ({
    key: "searching.compare",
    params: { i: e.local_vars.i, current: e.local_vars.current },
  }),
  SEARCH_FOUND: (e) => ({
    key: "searching.found",
    params: { i: e.local_vars.i },
  }),
  SEARCH_NOT_FOUND: () => ({ key: "searching.not_found" }),
  SEARCH_NARROW: (e) => ({
    key: "searching.narrow",
    params: { low: e.local_vars.low, high: e.local_vars.high, mid: e.local_vars.mid },
  }),
  SEARCH_END: () => ({ key: "searching.end" }),
};

function searchingOverrideMap(tag: string, e: TraceEvent): Record<number, Status> {
  const override: Record<number, Status> = {};
  const i = e.local_vars.i as number | undefined;
  const low = e.local_vars.low as number | undefined;
  const high = e.local_vars.high as number | undefined;
  const mid = e.local_vars.mid as number | undefined;

  if (tag === "SEARCH_COMPARE" && i !== undefined) {
    override[i] = Status.Prepare;
  } else if (tag === "SEARCH_FOUND" && i !== undefined) {
    override[i] = Status.Complete;
  } else if (tag === "SEARCH_NARROW" && low !== undefined && high !== undefined && mid !== undefined) {
    for (let k = 0; k < low; k++) override[k] = Status.Unfinished;
    for (let k = high + 1; k < e.dataSnapshot.length; k++) override[k] = Status.Unfinished;
    override[mid] = Status.Prepare;
  }

  return override;
}

export function searchingTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => ({
    stepNumber: idx + 1,
    description: SEARCH_DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
    elements: createBoxes(event.dataSnapshot, {
      startX: 50,
      startY: 200,
      gap: 70,
      highlightIndex: -1,
      status: Status.Unfinished,
      forceXShiftIndex: -1,
      shiftDirection: 0,
      overrideStatusMap: searchingOverrideMap(event.tag, event),
      getDescription: (_, i) => `${i}`,
    }),
    actionTag: event.tag,
    local_vars: event.local_vars,
    global_vars: event.global_vars,
  }));
}

// ---------------------------------------------------------------------------
// ALGORITHM_TO_CONVERTER_KEY
// 後端 detected_algorithm → converter key
// ---------------------------------------------------------------------------

export const ALGORITHM_TO_CONVERTER_KEY: Record<string, string> = {
  bubble_sort: "sorting",
  selection_sort: "sorting",
  insertion_sort: "sorting",
  linear_search: "searching",
  binary_search: "searching",
};

// ---------------------------------------------------------------------------
// TRACE_CONVERTERS
// converter key → traceToSteps()
// ---------------------------------------------------------------------------

export const TRACE_CONVERTERS: Record<
  string,
  (trace: ExecutionTrace) => AnimationStep[]
> = {
  sorting: sortingTraceToSteps,
  searching: searchingTraceToSteps,
};

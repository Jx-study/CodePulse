import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes } from "@/data/DataStructure/linear/utils";
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

function toOverrideMap(raw?: Record<string, string>): Record<number, Status> {
  if (!raw) return {};
  const result: Record<number, Status> = {};
  for (const [k, v] of Object.entries(raw)) {
    // Object.entries always yields string keys; convert to number for createBoxes index access
    result[Number(k)] = toStatus(v);
  }
  return result;
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "fibdp.init",
    params: { n: e.local_vars.n, size: e.local_vars.n + 1 },
  }),
  [TAGS.BASE_CASES]: () => ({
    key: "fibdp.base_cases",
  }),
  [TAGS.CALC_PREPARE]: (e) => ({
    key: "fibdp.calc_prepare",
    params: {
      i: e.local_vars.i,
      item1: e.local_vars.i - 1,
      item2: e.local_vars.i - 2,
      val1: e.local_vars["dp[i-1]"],
      val2: e.local_vars["dp[i-2]"],
    },
  }),
  [TAGS.CALC_DONE]: (e) => ({
    key: "fibdp.calc_done",
    params: {
      i: e.local_vars.i,
      val1: e.local_vars["dp[i-1]"],
      val2: e.local_vars["dp[i-2]"],
      result: e.local_vars["dp[i]"],
    },
  }),
  [TAGS.DONE]: (e) => ({
    key: "fibdp.done",
    params: { result: e.local_vars.result },
  }),
};

export function fibonacciDPTraceToSteps(
  trace: ExecutionTrace,
): AnimationStep[] {
  return trace.map((event, idx) => {
    const overrideMap = toOverrideMap(event.meta?.overrideStatusMap);
    const defaultStatus = toStatus(event.meta?.status);

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements: createBoxes(event.dataSnapshot as any[], {
        startX: 50,
        startY: 250,
        gap: 70,
        status: defaultStatus,
        overrideStatusMap: overrideMap,
        getDescription: (_, i) => `dp[${i}]`,
      }),
    };
  });
}

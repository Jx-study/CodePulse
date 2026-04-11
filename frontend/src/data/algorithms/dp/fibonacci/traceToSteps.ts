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

function toOverrideMap(raw?: Record<number, string>): Record<number, Status> {
  if (!raw) return {};
  const result: Record<number, Status> = {};
  for (const [k, v] of Object.entries(raw)) {
    result[Number(k)] = toStatus(v);
  }
  return result;
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "fibdp.init",
    params: { n: e.variables.n },
  }),
  [TAGS.BASE_CASES]: () => ({
    key: "fibdp.base_cases",
  }),
  [TAGS.CALC_PREPARE]: (e) => ({
    key: "fibdp.calc_prepare",
    params: {
      i: e.variables.i,
      val1: e.variables["dp[i-1]"],
      val2: e.variables["dp[i-2]"],
    },
  }),
  [TAGS.CALC_DONE]: (e) => ({
    key: "fibdp.calc_done",
    params: { i: e.variables.i, result: e.variables["dp[i]"] },
  }),
  [TAGS.DONE]: (e) => ({
    key: "fibdp.done",
    params: { result: e.variables.result },
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
      variables: event.variables,
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

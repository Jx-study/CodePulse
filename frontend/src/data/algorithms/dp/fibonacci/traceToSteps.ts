import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes } from "@/data/DataStructure/linear/utils";
import { asTrace } from "@/data/shared/traceValue";
import { TAGS } from "./tags";

interface FibDPLocalVars {
  n?: number;
  i?: number;
  "dp[i-1]"?: number;
  "dp[i-2]"?: number;
  "dp[i]"?: number;
  result?: number;
}

interface FibDPMeta {
  overrideStatusMap?: Record<string, string>;
  status?: string;
}

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
  [TAGS.INIT]: (e) => {
    const lv = asTrace<FibDPLocalVars>(e.local_vars);
    return {
      key: "animation.init",
      params: {
        n: lv.n ?? null,
        size: lv.n !== undefined ? lv.n + 1 : null,
      },
    };
  },
  [TAGS.BASE_CASES]: () => ({
    key: "animation.base_cases",
  }),
  [TAGS.CALC_PREPARE]: (e) => {
    const lv = asTrace<FibDPLocalVars>(e.local_vars);
    return {
      key: "animation.calc_prepare",
      params: {
        i: lv.i ?? null,
        item1: lv.i !== undefined ? lv.i - 1 : null,
        item2: lv.i !== undefined ? lv.i - 2 : null,
        val1: lv["dp[i-1]"] ?? null,
        val2: lv["dp[i-2]"] ?? null,
      },
    };
  },
  [TAGS.CALC_DONE]: (e) => {
    const lv = asTrace<FibDPLocalVars>(e.local_vars);
    return {
      key: "animation.calc_done",
      params: {
        i: lv.i ?? null,
        val1: lv["dp[i-1]"] ?? null,
        val2: lv["dp[i-2]"] ?? null,
        result: lv["dp[i]"] ?? null,
      },
    };
  },
  [TAGS.DONE]: (e) => ({
    key: "animation.done",
    params: { result: asTrace<FibDPLocalVars>(e.local_vars).result ?? null },
  }),
};

export function fibonacciDPTraceToSteps(
  trace: ExecutionTrace,
): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = asTrace<FibDPMeta>(event.meta);
    const overrideMap = toOverrideMap(meta.overrideStatusMap);
    const defaultStatus = toStatus(meta.status);

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements: createBoxes(event.dataSnapshot, {
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

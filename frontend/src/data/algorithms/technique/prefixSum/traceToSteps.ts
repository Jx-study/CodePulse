import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "@/data/DataStructure/linear/utils";
import { TAGS, PrefixSumStatus } from "./tags";

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.BUILD_INIT]: () => ({ key: "animation.build_init" }),
  [TAGS.BUILD_BASE]: (e) => ({
    key: "animation.build_base",
    params: { val0: e.local_vars.val0 },
  }),
  [TAGS.BUILD_CALC]: (e) => ({
    key: "animation.build_calc",
    params: {
      i: e.local_vars.i,
      prev: e.local_vars.i - 1,
      prevSum: e.local_vars.prevSum,
      currentVal: e.local_vars.currentVal,
    },
  }),
  [TAGS.BUILD_UPDATE]: (e) => ({
    key: "animation.build_update",
    params: { i: e.local_vars.i, newSum: e.local_vars.newSum },
  }),
  [TAGS.BUILD_DONE]: () => ({ key: "animation.build_done" }),

  [TAGS.QUERY_START]: (e) => ({
    key: "animation.query_start",
    params: { L: e.local_vars.L, R: e.local_vars.R },
  }),
  [TAGS.QUERY_GET_R]: (e) => ({
    key: "animation.query_get_r",
    params: { R: e.local_vars.R, valR: e.local_vars.valR },
  }),
  [TAGS.QUERY_GET_L]: (e) => ({
    key: "animation.query_get_l",
    params: {
      L: e.local_vars.L,
      prevL: e.local_vars.prevL,
      valL: e.local_vars.valL,
    },
  }),
  [TAGS.QUERY_RETURN_SUB]: (e) => ({
    key: "animation.query_return_sub",
    params: {
      valR: e.local_vars.valR,
      valL: e.local_vars.valL,
      result: e.local_vars.result,
    },
  }),
  [TAGS.QUERY_ELSE]: (e) => ({
    key: "animation.query_else",
    params: { L: e.local_vars.L },
  }),
  [TAGS.QUERY_RETURN_DIRECT]: (e) => ({
    key: "animation.query_return_direct",
    params: { R: e.local_vars.R, valR: e.local_vars.result },
  }),
};

export function prefixSumTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = event.meta ?? {};
    const sourceList = event.dataSnapshot as LinearData[];
    const prefixList = (meta.prefixList as (number | null)[]) ?? [];

    const prefixStatusMap =
      (meta.prefixStatusMap as Record<number, Status>) ?? {};
    const sourceStatusMap =
      (meta.sourceStatusMap as Record<number, Status>) ?? {};

    const sourceBoxes = createBoxes(sourceList, {
      startX: 50,
      startY: 130,
      gap: 70,
      overrideStatusMap: sourceStatusMap,
      getDescription: (_item, index) => `A[${index}]`,
    });

    const prefixData: LinearData[] = sourceList.map((_, i) => ({
      id: `prefix-${i}`,
      value: prefixList[i] ?? 0,
    }));

    const prefixBoxes = createBoxes(prefixData, {
      startX: 50,
      startY: 300,
      gap: 70,
      overrideStatusMap: prefixStatusMap,
      getDescription: (_item, index) => `P[${index}]`,
    });

    sourceBoxes.forEach((box: any) => {
      box.autoScale = true;
      box.scaleGroup = "source";
      box.maxHeight = 80;
      // 預設給予閒置藍色，避免全灰
      if (box.status === Status.Inactive)
        box.setStatus(PrefixSumStatus.Unfinished as Status);
    });

    prefixBoxes.forEach((element, i) => {
      const box = element as Box;
      box.autoScale = true;
      box.scaleGroup = "prefix";
      box.maxHeight = 80;

      if (prefixList[i] === null) {
        box.value = "0";
        box.setStatus(PrefixSumStatus.Inactive as Status);
      } else if (!prefixStatusMap[i]) {
        // 預設給予閒置藍色
        box.setStatus(PrefixSumStatus.Unfinished as Status);
      }
    });

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements: [...sourceBoxes, ...prefixBoxes] as any,
    };
  });
}

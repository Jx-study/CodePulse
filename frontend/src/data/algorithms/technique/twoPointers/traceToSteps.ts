import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Box } from "@/modules/core/DataLogic/Box";
import { Pointer } from "@/modules/core/DataLogic/Pointer";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "@/data/DataStructure/linear/utils";
import { asTrace } from "@/data/shared/traceValue";
import { TAGS, TwoPointersStatus } from "./tags";
import type { TwoPointersMeta } from "./simulateTrace";

const START_X = 50;
const START_Y = 200;
const GAP = 70;

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key:
      e.meta?.mode === "remove_duplicates"
        ? "animation.init_dedup"
        : "animation.init_two_sum",
    params: { target: e.meta?.target },
  }),
  [TAGS.COMPARE]: (e) => ({
    key: "animation.compare",
    params: {
      l: e.local_vars.left,
      r: e.local_vars.right,
      sum: e.local_vars.sum,
      target: e.local_vars.target,
    },
  }),
  [TAGS.MOVE_LEFT]: (e) => ({
    key: "animation.move_left",
    params: { sum: e.local_vars.sum, target: e.local_vars.target },
  }),
  [TAGS.MOVE_RIGHT]: (e) => ({
    key: "animation.move_right",
    params: { sum: e.local_vars.sum, target: e.local_vars.target },
  }),
  [TAGS.FOUND]: (e) => ({
    key: "animation.found",
    params: {
      l: e.local_vars.left,
      r: e.local_vars.right,
      target: e.local_vars.target,
    },
  }),
  [TAGS.SCAN]: (e) => ({
    key: "animation.scan",
    params: {
      fast: e.local_vars.fast,
      fastVal: e.local_vars.fastVal,
      slowVal: e.local_vars.slowVal,
    },
  }),
  [TAGS.SKIP_DUPLICATE]: (e) => ({
    key: "animation.skip_duplicate",
    params: { val: e.local_vars.val },
  }),
  [TAGS.WRITE_UNIQUE]: (e) => ({
    key: "animation.write_unique",
    params: { val: e.local_vars.val, slow: e.local_vars.slow },
  }),
  [TAGS.DONE]: (e) =>
    e.meta?.mode === "remove_duplicates"
      ? { key: "animation.done_dedup", params: { len: e.local_vars.length } }
      : { key: "animation.done_not_found", params: { target: e.meta?.target } },
};

/** 兩個指標指向同一格時左右錯開，避免標籤重疊 */
function createPointers(meta: TwoPointersMeta): Pointer[] {
  const isDedup = meta.mode === "remove_duplicates";
  const overlap = meta.first !== -1 && meta.first === meta.second;

  const firstPtr = new Pointer(isDedup ? "slow" : "L", "up");
  firstPtr.id = "two-pointers-first";
  firstPtr.moveTo(
    START_X + Math.max(meta.first, 0) * GAP + (overlap ? -20 : 0),
    START_Y + 50,
  );
  firstPtr.opacity = meta.first === -1 ? 0 : 1;

  const secondPtr = new Pointer(isDedup ? "fast" : "R", "up");
  secondPtr.id = "two-pointers-second";
  secondPtr.moveTo(
    START_X + Math.max(meta.second, 0) * GAP + (overlap ? 20 : 0),
    START_Y + 50,
  );
  secondPtr.opacity = meta.second === -1 ? 0 : 1;

  return [firstPtr, secondPtr];
}

function twoSumStatus(i: number, tag: string, meta: TwoPointersMeta): Status {
  const isFound = meta.foundLeft !== -1;
  if (isFound) {
    return i === meta.foundLeft || i === meta.foundRight
      ? (TwoPointersStatus.Result as Status)
      : (TwoPointersStatus.Excluded as Status);
  }
  // 結束仍沒找到：全部排除
  if (tag === TAGS.DONE) return TwoPointersStatus.Excluded as Status;
  if (i === meta.first || i === meta.second) {
    return TwoPointersStatus.Active as Status;
  }
  // 左右指標之外的元素已被排除，不可能組成答案
  if (i < meta.first || i > meta.second) {
    return TwoPointersStatus.Excluded as Status;
  }
  return TwoPointersStatus.Pending as Status;
}

function dedupStatus(i: number, tag: string, meta: TwoPointersMeta): Status {
  if (tag === TAGS.DONE) {
    return i < meta.keptLength
      ? (TwoPointersStatus.Result as Status)
      : (TwoPointersStatus.Excluded as Status);
  }
  if (i === meta.second) {
    return tag === TAGS.SKIP_DUPLICATE
      ? (TwoPointersStatus.Duplicate as Status)
      : (TwoPointersStatus.Active as Status);
  }
  if (i < meta.keptLength) return TwoPointersStatus.Result as Status;
  // fast 已掃過、但沒被保留的位置：內容已無意義
  if (i < meta.second) return TwoPointersStatus.Excluded as Status;
  return TwoPointersStatus.Pending as Status;
}

export function twoPointersTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = asTrace<TwoPointersMeta>(event.meta);

    const boxes = createBoxes(event.dataSnapshot as LinearData[], {
      startX: START_X,
      startY: START_Y,
      gap: GAP,
      overrideStatusMap: {},
      getDescription: (_item, index) => String(index),
    });

    const getStatus = meta.mode === "remove_duplicates" ? dedupStatus : twoSumStatus;
    boxes.forEach((element, i) => {
      (element as Box).setStatus(getStatus(i, event.tag, meta));
    });

    return {
      stepNumber: idx,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      local_vars: event.local_vars,
      elements: [...boxes, ...createPointers(meta)],
    };
  });
}

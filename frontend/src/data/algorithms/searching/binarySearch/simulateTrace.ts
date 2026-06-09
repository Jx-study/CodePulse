import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";
import { LinearData } from "@/data/DataStructure/linear/utils";

export function simulateBinarySearchTrace(
  inputData: LinearData[],
  action?: any,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const arr = inputData.map((d) => ({ ...d }));

  let target = 42;
  if (action && typeof action.searchValue === "number") {
    target = action.searchValue;
  } else if (arr.length > 0) {
    const targetIndex = Math.min(6, arr.length - 1);
    target = Number(arr[targetIndex].value) || 0;
  }

  const pushTrace = (tag: string, vars: any, meta: any) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: arr.map((d) => ({ ...d })),
      meta: meta,
    });
  };

  let left = 0;
  let right = arr.length - 1;
  let mid = -1;

  pushTrace(
    TAGS.INIT,
    { left, right, target, totalItems: arr.length },
    { left, right, mid: -1 },
  );

  while (left <= right) {
    pushTrace(
      TAGS.CHECK_WHILE,
      { left, right, condition: `${left} <= ${right}`, result: true },
      { left, right, mid: -1 },
    );

    mid = Math.floor((left + right) / 2);

    pushTrace(
      TAGS.CALC_MID,
      { left, right, mid },
      { left, right, mid, prepareIndices: [mid] },
    );

    const midVal = Number(arr[mid].value);

    pushTrace(
      TAGS.COMPARE,
      { mid, midVal, target, compareCondition: `${midVal} == ${target}` },
      { left, right, mid, targetIndices: [mid] },
    );

    if (midVal === target) {
      pushTrace(
        TAGS.FOUND,
        { foundIndex: mid, midVal, target },
        { left, right, mid, completeIndices: [mid], foundIndex: mid },
      );
      return trace;
    } else if (midVal < target) {
      const newLeft = mid + 1;
      pushTrace(
        TAGS.UPDATE_LEFT,
        { midVal, target, mid, oldLeft: left, newLeft },
        { left: newLeft, right, mid: -1 },
      );
      left = newLeft;
    } else {
      const newRight = mid - 1;
      pushTrace(
        TAGS.UPDATE_RIGHT,
        { midVal, target, mid, oldRight: right, newRight },
        { left, right: newRight, mid: -1 },
      );
      right = newRight;
    }
  }

  pushTrace(
    TAGS.NOT_FOUND,
    { left, right, found: false, target },
    { left, right, mid: -1 },
  );

  return trace;
}

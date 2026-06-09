import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";
import { LinearData } from "@/data/DataStructure/linear/utils";

export function simulateSlidingWindowTrace(
  inputData: LinearData[],
  action?: { mode?: string; targetSum?: number },
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const arr = inputData.map((d) => ({ ...d }));
  if (arr.length === 0) return trace;

  const mode = action?.mode || "longest_lte";
  const targetSum = action?.targetSum || 20;

  const pushTrace = (
    tag: string,
    vars: any,
    pointers: {
      left: number;
      right: number;
      bestLeft?: number;
      bestRight?: number;
    },
    shrinkIndex: number = -1,
  ) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: arr.map((d) => ({ ...d })),
      meta: {
        mode,
        targetSum,
        left: pointers.left,
        right: pointers.right,
        bestLeft: pointers.bestLeft ?? -1,
        bestRight: pointers.bestRight ?? -1,
        shrinkIndex,
      },
    });
  };

  // 最短模式：Sum >= targetSum 的最短子陣列
  if (mode === "shortest_gte") {
    let left = 0,
      currentSum = 0,
      minLen = Infinity;
    let bestLeft = 0,
      bestRight = -1;

    pushTrace(
      TAGS.INIT,
      { left: 0, right: -1, currentSum: 0, targetSum, minLen: "∞" },
      { left: 0, right: -1 },
    );

    for (let right = 0; right < arr.length; right++) {
      const val = Number(arr[right].value) || 0;
      pushTrace(
        TAGS.EXPAND_RIGHT,
        {
          left,
          right,
          val,
          currentSum,
          targetSum,
          minLen: minLen === Infinity ? "∞" : minLen,
        },
        { left, right, bestLeft, bestRight },
      );

      currentSum += val;
      pushTrace(
        TAGS.CHECK_WHILE,
        {
          left,
          right,
          val,
          currentSum,
          targetSum,
          minLen: minLen === Infinity ? "∞" : minLen,
        },
        { left, right, bestLeft, bestRight },
      );

      while (currentSum >= targetSum && left <= right) {
        if (right - left + 1 < minLen) {
          minLen = right - left + 1;
          bestLeft = left;
          bestRight = right;
          pushTrace(
            TAGS.UPDATE_RESULT,
            { left, right, currentSum, minLen },
            { left, right, bestLeft, bestRight },
          );
        }
        const leftVal = Number(arr[left].value) || 0;
        pushTrace(
          TAGS.SHRINK_LEFT,
          { left, right, currentSum, targetSum, minLen },
          { left, right, bestLeft, bestRight },
          left,
        );

        currentSum -= leftVal;
        left++;
      }
    }

    if (minLen === Infinity) {
      pushTrace(TAGS.DONE, { minLen: "None" }, { left: 0, right: -1 });
    } else {
      pushTrace(
        TAGS.DONE,
        { minLen, bestLeft, bestRight },
        { left: bestLeft, right: bestRight, bestLeft, bestRight },
      );
    }
  }

  // 最長模式：Sum <= targetSum 的最長子陣列
  else if (mode === "longest_lte") {
    let left = 0,
      currentSum = 0,
      maxLen = 0;
    let bestLeft = 0,
      bestRight = -1;

    pushTrace(
      TAGS.INIT,
      { left: 0, right: -1, currentSum: 0, targetSum, maxLen: 0 },
      { left: 0, right: -1 },
    );

    for (let right = 0; right < arr.length; right++) {
      const val = Number(arr[right].value) || 0;
      pushTrace(
        TAGS.EXPAND_RIGHT,
        { left, right, val, currentSum, targetSum, maxLen },
        { left, right, bestLeft, bestRight },
      );

      currentSum += val;
      pushTrace(
        TAGS.CHECK_WHILE,
        { left, right, val, currentSum, targetSum, maxLen },
        { left, right, bestLeft, bestRight },
      );

      while (currentSum > targetSum && left <= right) {
        const leftVal = Number(arr[left].value) || 0;
        pushTrace(
          TAGS.SHRINK_LEFT,
          { left, right, currentSum, targetSum, maxLen },
          { left, right, bestLeft, bestRight },
          left,
        );

        currentSum -= leftVal;
        left++;
      }

      if (right - left + 1 > maxLen) {
        maxLen = right - left + 1;
        bestLeft = left;
        bestRight = right;
        pushTrace(
          TAGS.UPDATE_RESULT,
          { left, right, currentSum, maxLen },
          { left, right, bestLeft, bestRight },
        );
      }
    }
    pushTrace(
      TAGS.DONE,
      { maxLen, bestLeft, bestRight },
      { left: bestLeft, right: bestRight, bestLeft, bestRight },
    );
  }

  return trace;
}

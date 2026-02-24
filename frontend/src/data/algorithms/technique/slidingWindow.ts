import { Box } from "@/modules/core/DataLogic/Box";
import type { AnimationStep } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "../../DataStructure/linear/utils";
import { CodeConfig, LevelImplementationConfig } from "@/types";

const TAGS = {
  INIT: "INIT",
  EXPAND_RIGHT: "EXPAND_RIGHT",
  CHECK_WHILE: "CHECK_WHILE",
  SHRINK_LEFT: "SHRINK_LEFT",
  UPDATE_RESULT: "UPDATE_RESULT",
  DONE: "DONE",
};

// 輔助函式：用來產生單一畫面的 Frame
const generateFrame = (
  list: LinearData[],
  pointers: {
    left: number;
    right: number;
    bestLeft?: number;
    bestRight?: number;
  },
  description: string,
  actionTag: string,
  variables: Record<string, any>,
  overrideStatusMap: Record<number, Status> = {},
): AnimationStep => {
  const { left, right, bestLeft = -1, bestRight = -1 } = pointers;

  const boxes = createBoxes(list, {
    startX: 50,
    startY: 200,
    gap: 70,
    overrideStatusMap,
    getDescription: (_item, index) => {
      const labels: string[] = [`${index}`];
      if (index === left) labels.push("L");
      if (index === right) labels.push("R");
      return labels.join("\n");
    },
  });

  boxes.forEach((element, i) => {
    const box = element as Box;
    const inCurrentWindow = i >= left && i <= right;
    const inBestWindow =
      bestLeft !== -1 && bestRight !== -1 && i >= bestLeft && i <= bestRight;

    if (inBestWindow) box.setStatus(Status.Complete);
    else if (inCurrentWindow)
      box.setStatus(overrideStatusMap[i] || Status.Target);
    else box.setStatus(Status.Inactive);
  });

  return { stepNumber: 0, description, actionTag, variables, elements: boxes };
};

export function createSlidingWindowAnimationSteps(
  inputData: any[],
  action?: { mode?: string; targetSum?: number },
): AnimationStep[] {
  const arr = inputData as LinearData[];
  const steps: AnimationStep[] = [];
  if (arr.length === 0) return steps;

  const mode = action?.mode || "longest_lte";
  const targetSum = action?.targetSum || 20;

  if (mode === "shortest_gte") {
    // 找總和 >= targetSum 的最短連續子陣列
    let left = 0,
      currentSum = 0,
      minLen = Infinity;
    let bestLeft = 0,
      bestRight = -1;

    steps.push(
      generateFrame(
        arr,
        { left: 0, right: -1 },
        `【最短模式】開始尋找總和 大於等於 ${targetSum} 的 最短 子陣列`,
        TAGS.INIT,
        { left: 0, right: 0, currentSum: 0, targetSum, minLen: "∞" },
      ),
    );

    for (let right = 0; right < arr.length; right++) {
      const val = arr[right].value || 0;
      steps.push(
        generateFrame(
          arr,
          { left, right },
          `右指標擴展，遇到數值 ${val}`,
          TAGS.EXPAND_RIGHT,
          {
            left,
            right,
            val,
            currentSum,
            targetSum,
            minLen: minLen === Infinity ? "∞" : minLen,
          },
        ),
      );
      currentSum += val;
      steps.push(
        generateFrame(
          arr,
          { left, right },
          `將 ${val} 加入，目前總和：${currentSum}`,
          TAGS.CHECK_WHILE,
          {
            left,
            right,
            currentSum,
            targetSum,
            minLen: minLen === Infinity ? "∞" : minLen,
          },
        ),
      );

      while (currentSum >= targetSum && left <= right) {
        if (right - left + 1 < minLen) {
          minLen = right - left + 1;
          bestLeft = left;
          bestRight = right;
          steps.push(
            generateFrame(
              arr,
              { left, right },
              `總和達標 (${currentSum} >= ${targetSum})！更新最短紀錄：${minLen}`,
              TAGS.UPDATE_RESULT,
              { left, right, currentSum, minLen },
            ),
          );
        }
        const leftVal = arr[left].value || 0;
        steps.push(
          generateFrame(
            arr,
            { left, right },
            `尋找更短可能：準備移除 Left(${left}) 的數值 ${leftVal}`,
            TAGS.SHRINK_LEFT,
            { left, right, currentSum, targetSum, minLen },
            { [left]: Status.Prepare },
          ),
        );
        currentSum -= leftVal;
        left++;
      }
    }
    if (minLen === Infinity) {
      steps.push(
        generateFrame(
          arr,
          { left: 0, right: -1 },
          `掃描結束！找不到總和 >= ${targetSum} 的子陣列`,
          TAGS.DONE,
          { minLen: "無解" },
        ),
      );
    } else {
      steps.push(
        generateFrame(
          arr,
          { left: bestLeft, right: bestRight, bestLeft, bestRight },
          `掃描結束！最短長度為 ${minLen}，範圍是 Index ${bestLeft} 到 ${bestRight}`,
          TAGS.DONE,
          { minLen },
        ),
      );
    }
  } else if (mode === "longest_lte") {
    // 找總和 <= targetSum 的最長連續子陣列
    let left = 0,
      currentSum = 0,
      maxLen = 0;
    let bestLeft = 0,
      bestRight = -1;

    steps.push(
      generateFrame(
        arr,
        { left: 0, right: -1 },
        `【最長模式】開始尋找總和 不超過 ${targetSum} 的 最長 子陣列`,
        TAGS.INIT,
        { left: 0, right: 0, currentSum: 0, targetSum, maxLen: 0 },
      ),
    );

    for (let right = 0; right < arr.length; right++) {
      const val = arr[right].value || 0;
      steps.push(
        generateFrame(
          arr,
          { left, right },
          `右指標擴展，遇到數值 ${val}`,
          TAGS.EXPAND_RIGHT,
          { left, right, val, currentSum, targetSum, maxLen },
        ),
      );
      currentSum += val;
      steps.push(
        generateFrame(
          arr,
          { left, right },
          `將 ${val} 加入，目前總和：${currentSum}`,
          TAGS.CHECK_WHILE,
          { left, right, currentSum, targetSum, maxLen },
        ),
      );

      while (currentSum > targetSum && left <= right) {
        const leftVal = arr[left].value || 0;
        steps.push(
          generateFrame(
            arr,
            { left, right },
            `總和 ${currentSum} 超過 ${targetSum}！準備移除 Left(${left}) 的數值 ${leftVal}`,
            TAGS.SHRINK_LEFT,
            { left, right, currentSum, targetSum, maxLen },
            { [left]: Status.Prepare },
          ),
        );
        currentSum -= leftVal;
        left++;
      }

      if (right - left + 1 > maxLen) {
        maxLen = right - left + 1;
        bestLeft = left;
        bestRight = right;
        steps.push(
          generateFrame(
            arr,
            { left, right },
            `更新最長紀錄！新長度為 ${maxLen} (Index ${left} 到 ${right})`,
            TAGS.UPDATE_RESULT,
            { left, right, currentSum, maxLen },
          ),
        );
      }
    }
    steps.push(
      generateFrame(
        arr,
        { left: bestLeft, right: bestRight, bestLeft, bestRight },
        `掃描結束！最長長度為 ${maxLen}，範圍是 Index ${bestLeft} 到 ${bestRight}`,
        TAGS.DONE,
        { maxLen },
      ),
    );
  }

  // 重編 stepNumber
  return steps.map((s, idx) => ({ ...s, stepNumber: idx }));
}

const slidingWindowCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure SlidingWindow(arr, targetSum):
  left ← 0
  currentSum ← 0
  maxLen ← 0

  For right ← 0 to length(arr) - 1 Do
    currentSum ← currentSum + arr[right]

    While currentSum > targetSum And left ≤ right Do
      currentSum ← currentSum - arr[left]
      left ← left + 1
    End While

    If (right - left + 1) > maxLen Then
      maxLen ← right - left + 1
    End If
  End For

  Return maxLen
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2, 3, 4],
      [TAGS.EXPAND_RIGHT]: [6],
      [TAGS.CHECK_WHILE]: [7],
      [TAGS.SHRINK_LEFT]: [9, 10, 11],
      [TAGS.UPDATE_RESULT]: [14, 15],
      [TAGS.DONE]: [19],
    },
  },
  python: {
    content: `def sliding_window(arr, target_sum):
    left = 0
    current_sum = 0
    max_len = 0

    for right in range(len(arr)):
        current_sum += arr[right]

        while current_sum > target_sum and left <= right:
            current_sum -= arr[left]
            left += 1

        if right - left + 1 > max_len:
            max_len = right - left + 1

    return max_len`,
  },
};

export const slidingWindowConfig: LevelImplementationConfig = {
  id: "slidingwindow",
  type: "algorithm",
  name: "滑動窗口 (Sliding Window)",
  categoryName: "演算法技巧",
  description: "用雙指標維護一個區間，解決連續子陣列問題",
  codeConfig: slidingWindowCodeConfig,
  complexity: {
    timeBest: "O(n)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(1)",
  },
  introduction: `滑動窗口是一種雙指標技巧，通常用於解決「陣列/字串中連續子區間」的問題。我們維護一個由 left 和 right 組成的窗口，根據條件不斷向右擴展 (right++) 或縮小 (left++)。因為每個元素最多進出窗口各一次，時間複雜度通常能從 O(n²) 降到 O(n)。`,
  defaultData: [
    { id: "box-0", value: 3 },
    { id: "box-1", value: 1 },
    { id: "box-2", value: 2 },
    { id: "box-3", value: 7 },
    { id: "box-4", value: 4 },
    { id: "box-5", value: 2 },
    { id: "box-6", value: 1 },
    { id: "box-7", value: 1 },
    { id: "box-8", value: 5 },
  ],
  createAnimationSteps: createSlidingWindowAnimationSteps,
};

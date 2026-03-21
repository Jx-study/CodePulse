import { Box } from "@/modules/core/DataLogic/Box";
import type { AnimationStep } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "@/data/DataStructure/linear/utils";
import { CodeConfig, LevelImplementationConfig } from "@/types";
import { SlidingWindowActionBar } from "./SlidingWindowActionBar";
import { cloneData } from "@/modules/core/visualization/visualizationUtils";
import { DATA_LIMITS } from "@/constants/dataLimits";
import type { ActionContext, ActionResult } from "@/modules/core/visualization/types";

function slidingWindowActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: LinearData[],
  context: ActionContext,
): ActionResult<LinearData[]> | null {
  if (actionType === "random") {
    const count =
      (payload.randomCount as number) ?? DATA_LIMITS.DEFAULT_RANDOM_COUNT;
    const values = Array.from(
      { length: count },
      () => Math.floor(Math.random() * 15) + 1
    );
    const newData = values.map((v) => ({
      id: context.nextId(),
      value: v,
    }));
    return { animationData: newData, isResetAction: true };
  }

  if (actionType === "load") {
    const values = payload.data as number[];
    if (!values?.length) return null;
    const newData = values.map((v) => ({
      id: context.nextId(),
      value: v,
    }));
    return { animationData: newData, isResetAction: true };
  }

  if (actionType === "reset") {
    const defaultData = (context.defaultData as LinearData[]) ?? data;
    return { animationData: cloneData(defaultData), isResetAction: true };
  }

  if (actionType === "run") {
    return { animationData: cloneData(data) };
  }

  return null;
}

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
      const val = Number(arr[right].value) || 0;
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
        const leftVal = Number(arr[left].value) || 0;
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
      const val = Number(arr[right].value) || 0;
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
        const leftVal = Number(arr[left].value) || 0;
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

const longestLteCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure SlidingWindowLongest(arr, targetSum):
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
    content: `def sliding_window_longest(arr, target_sum):
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

const shortestGteCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure SlidingWindowShortest(arr, targetSum):
  left ← 0
  currentSum ← 0
  minLen ← ∞

  For right ← 0 to length(arr) - 1 Do
    currentSum ← currentSum + arr[right]

    While currentSum ≥ targetSum And left ≤ right Do
      If (right - left + 1) < minLen Then
        minLen ← right - left + 1
      End If
      currentSum ← currentSum - arr[left]
      left ← left + 1
    End While
  End For

  If minLen = ∞ Then
    Return Error
  Else
    Return minLen
  End If
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2, 3, 4],
      [TAGS.EXPAND_RIGHT]: [6],
      [TAGS.CHECK_WHILE]: [7],
      [TAGS.UPDATE_RESULT]: [9, 10, 11],
      [TAGS.SHRINK_LEFT]: [13, 14],
      [TAGS.DONE]: [18, 19, 20, 21],
    },
  },
  python: {
    content: `def sliding_window_shortest(arr, target_sum):
    left = 0
    current_sum = 0
    min_len = float('inf')

    for right in range(len(arr)):
        current_sum += arr[right]

        while current_sum >= target_sum and left <= right:
            if right - left + 1 < min_len:
                min_len = right - left + 1
            current_sum -= arr[left]
            left += 1

    return min_len if min_len != float('inf') else -1`,
  },
};

export const slidingWindowConfig: LevelImplementationConfig = {
  id: "slidingwindow",
  type: "algorithm",
  defaultViewMode: "longest_lte",
  name: "滑動窗口 (Sliding Window)",
  categoryName: "演算法技巧",
  description: "用雙指標維護一個區間，解決連續子陣列問題",
  codeConfig: longestLteCodeConfig,
  getCodeConfig: (payload?: any) => {
    if (payload?.mode === "shortest_gte") {
      return shortestGteCodeConfig;
    }
    return longestLteCodeConfig;
  },
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
  actionHandler: slidingWindowActionHandler,
  renderActionBar: (props) => <SlidingWindowActionBar {...(props as any)} />,
  maxNodes: 30,
  relatedProblems: [
    {
      id: 3,
      title: "Longest Substring Without Repeating Characters",
      concept: "可變視窗：右指針擴展加入字元，左指針在遇到重複時縮窄，哈希集合記錄視窗內容",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    },
    {
      id: 76,
      title: "Minimum Window Substring",
      concept: "可變視窗 + 字元計數：右擴直到覆蓋目標字元後左縮取最短，雙指針搭配頻率表",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/minimum-window-substring/",
    },
    {
      id: 424,
      title: "Longest Repeating Character Replacement",
      concept: "可變視窗：追蹤視窗內最高頻字元，視窗大小 - 最高頻數 > k 時左縮視窗",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/longest-repeating-character-replacement/",
    },
    {
      id: 239,
      title: "Sliding Window Maximum",
      concept: "固定視窗 + 單調遞減雙端佇列：隊頭維持當前最大值，右移時淘汰隊尾較小元素",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/sliding-window-maximum/",
    },
    {
      id: 567,
      title: "Permutation in String",
      concept: "固定視窗字元匹配：維護長度 |s1| 的視窗，比較視窗字元頻率與目標是否相同",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/permutation-in-string/",
    },
    {
      id: 438,
      title: "Find All Anagrams in a String",
      concept: "固定視窗滑動比對：同 567 的頻率比較策略，但需記錄所有滿足條件的視窗起始位置",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
    },
  ],
};

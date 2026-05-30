import type { AnimationStep } from "@/types";
import { LinearData } from "@/data/DataStructure/linear/utils";
import { CodeConfig, LevelImplementationConfig } from "@/types";
import { SlidingWindowActionBar } from "./SlidingWindowActionBar";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import { simulateSlidingWindowTrace } from "./slidingWindow/simulateTrace";
import { slidingWindowTraceToSteps } from "./slidingWindow/traceToSteps";
import { TAGS, SlidingWindowStatusConfig } from "./slidingWindow/tags";

const slidingWindowActionHandler = createLinearActionHandler({
  randomValueRange: [1, 15],
});

export function createSlidingWindowAnimationSteps(
  inputData: any[],
  action?: { mode?: string; targetSum?: number },
): AnimationStep[] {
  const trace = simulateSlidingWindowTrace(inputData as LinearData[], action);
  return slidingWindowTraceToSteps(trace);
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
  i18nNamespace: "tutorials/sliding-window",
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
  statusConfig: SlidingWindowStatusConfig,
  actionHandler: slidingWindowActionHandler,
  renderActionBar: (props) => <SlidingWindowActionBar {...(props as any)} />,
  maxNodes: 30,
  relatedProblems: [
    {
      id: 3,
      title: "Longest Substring Without Repeating Characters",
      concept:
        "可變視窗：右指針擴展加入字元，左指針在遇到重複時縮窄，哈希集合記錄視窗內容",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    },
    {
      id: 76,
      title: "Minimum Window Substring",
      concept:
        "可變視窗 + 字元計數：右擴直到覆蓋目標字元後左縮取最短，雙指針搭配頻率表",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/minimum-window-substring/",
    },
    {
      id: 424,
      title: "Longest Repeating Character Replacement",
      concept:
        "可變視窗：追蹤視窗內最高頻字元，視窗大小 - 最高頻數 > k 時左縮視窗",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/longest-repeating-character-replacement/",
    },
    {
      id: 239,
      title: "Sliding Window Maximum",
      concept:
        "固定視窗 + 單調遞減雙端佇列：隊頭維持當前最大值，右移時淘汰隊尾較小元素",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/sliding-window-maximum/",
    },
    {
      id: 567,
      title: "Permutation in String",
      concept:
        "固定視窗字元匹配：維護長度 |s1| 的視窗，比較視窗字元頻率與目標是否相同",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/permutation-in-string/",
    },
    {
      id: 438,
      title: "Find All Anagrams in a String",
      concept:
        "固定視窗滑動比對：同 567 的頻率比較策略，但需記錄所有滿足條件的視窗起始位置",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
    },
  ],
};

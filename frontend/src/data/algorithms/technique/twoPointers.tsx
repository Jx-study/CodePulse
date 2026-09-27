import type { AnimationStep } from "@/types";
import { LinearData } from "@/data/DataStructure/linear/utils";
import { CodeConfig, LevelImplementationConfig, AlgoActionBarProps } from "@/types";
import type { ActionContext, ActionResult } from "@/modules/core/visualization/types";
import { cloneData } from "@/modules/core/visualization/visualizationUtils";
import { TwoPointersActionBar } from "./TwoPointersActionBar";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import {
  simulateTwoPointersTrace,
  type TwoPointersAction,
} from "./twoPointers/simulateTrace";
import { twoPointersTraceToSteps } from "./twoPointers/traceToSteps";
import { TAGS, TwoPointersStatusConfig } from "./twoPointers/tags";

// 兩種模式都要求排序陣列，載入 / 隨機資料一律先排序
const linearActionHandler = createLinearActionHandler({
  randomValueRange: [1, 20],
  sortOnLoad: true,
});

function twoPointersActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: LinearData[],
  context: ActionContext,
): ActionResult<LinearData[]> | null {
  // 切換模式時重畫初始畫面，讓指標位置（L/R 或 slow/fast）與所選模式一致
  if (actionType === "switchMode") {
    return {
      animationData: cloneData(data),
      useRawAnimationParams: true,
      animationParams: { mode: payload.mode },
    };
  }
  return linearActionHandler(actionType, payload, data, context);
}

function createTwoPointersAnimationSteps(
  inputData: LinearData[],
  action?: TwoPointersAction,
): AnimationStep[] {
  const trace = simulateTwoPointersTrace(inputData, action);
  return twoPointersTraceToSteps(trace);
}

const twoSumCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure TwoSumSorted(arr, target):
  left ← 0
  right ← length(arr) - 1

  While left < right Do
    sum ← arr[left] + arr[right]
    If sum = target Then
      Return (left, right)
    Else If sum < target Then
      left ← left + 1
    Else
      right ← right - 1
    End If
  End While

  Return NotFound
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2, 3],
      [TAGS.COMPARE]: [5, 6],
      [TAGS.FOUND]: [7, 8],
      [TAGS.MOVE_LEFT]: [9, 10],
      [TAGS.MOVE_RIGHT]: [11, 12],
      [TAGS.DONE]: [16],
    },
  },
  python: {
    content: `def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1

    while left < right:
        s = arr[left] + arr[right]
        if s == target:
            return left, right
        elif s < target:
            left += 1
        else:
            right -= 1

    return None`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(n)' },                      // def two_sum_sorted(arr, target):
      { lineNumber: 2,  complexity: 'O(1)' },                      // left, right = 0, len(arr) - 1
      { lineNumber: 4,  complexity: 'O(n)' },                      // while left < right: (每輪至少移動一個指標)
      { lineNumber: 5,  complexity: 'O(1)', context: 'O(n)' },     // s = arr[left] + arr[right]
      { lineNumber: 6,  complexity: 'O(1)', context: 'O(n)' },     // if s == target:
      { lineNumber: 7,  complexity: 'O(1)' },                      // return left, right
      { lineNumber: 8,  complexity: 'O(1)', context: 'O(n)' },     // elif s < target:
      { lineNumber: 9,  complexity: 'O(1)', context: 'O(n)' },     // left += 1
      { lineNumber: 11, complexity: 'O(1)', context: 'O(n)' },     // right -= 1
      { lineNumber: 13, complexity: 'O(1)' },                      // return None
    ],
  },
};

const removeDuplicatesCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure RemoveDuplicates(arr):
  slow ← 0

  For fast ← 1 to length(arr) - 1 Do
    If arr[fast] = arr[slow] Then
      Continue
    End If
    slow ← slow + 1
    arr[slow] ← arr[fast]
  End For

  Return slow + 1
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2],
      [TAGS.SCAN]: [4, 5],
      [TAGS.SKIP_DUPLICATE]: [6],
      [TAGS.WRITE_UNIQUE]: [8, 9],
      [TAGS.DONE]: [12],
    },
  },
  python: {
    content: `def remove_duplicates(arr):
    if not arr:
        return 0
    slow = 0

    for fast in range(1, len(arr)):
        if arr[fast] == arr[slow]:
            continue
        slow += 1
        arr[slow] = arr[fast]

    return slow + 1`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(n)' },                      // def remove_duplicates(arr):
      { lineNumber: 2,  complexity: 'O(1)' },                      // if not arr:
      { lineNumber: 3,  complexity: 'O(1)' },                      // return 0
      { lineNumber: 4,  complexity: 'O(1)' },                      // slow = 0
      { lineNumber: 6,  complexity: 'O(n)' },                      // for fast in range(1, len(arr)):
      { lineNumber: 7,  complexity: 'O(1)', context: 'O(n)' },     // if arr[fast] == arr[slow]:
      { lineNumber: 8,  complexity: 'O(1)', context: 'O(n)' },     // continue
      { lineNumber: 9,  complexity: 'O(1)', context: 'O(n)' },     // slow += 1
      { lineNumber: 10, complexity: 'O(1)', context: 'O(n)' },     // arr[slow] = arr[fast]
      { lineNumber: 12, complexity: 'O(1)' },                      // return slow + 1
    ],
  },
};

export const twoPointersConfig: LevelImplementationConfig = {
  id: "twopointers",
  type: "algorithm",
  defaultViewMode: "two_sum",
  name: "雙指標 (Two Pointers)",
  categoryName: "演算法技巧",
  description: "用兩個指標協作移動，把巢狀迴圈的 O(n²) 降到 O(n)",
  i18nNamespace: "tutorials/two-pointers",
  codeConfig: twoSumCodeConfig,
  getCodeConfig: (payload?: { mode?: string }) =>
    payload?.mode === "remove_duplicates" ? removeDuplicatesCodeConfig : twoSumCodeConfig,
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(1)",
  },
  introduction: `雙指標是用兩個索引在陣列上協作移動的技巧。「對向」雙指標從兩端往中間夾（例如排序陣列的兩數之和）：每次比較後都能確定排除一側的元素；「同向」雙指標（快慢指標）一前一後往同方向走（例如原地移除重複元素）：快指標負責掃描，慢指標負責標記已處理好的區域。兩種寫法都讓每個元素只被看過常數次，把暴力解的 O(n²) 降到 O(n)。`,
  // 9 格：10 格時右上角的狀態圖例會壓到最右邊的格子
  defaultData: [
    { id: "box-0", value: 1 },
    { id: "box-1", value: 2 },
    { id: "box-2", value: 3 },
    { id: "box-3", value: 3 },
    { id: "box-4", value: 5 },
    { id: "box-5", value: 7 },
    { id: "box-6", value: 8 },
    { id: "box-7", value: 8 },
    { id: "box-8", value: 11 },
  ],
  createAnimationSteps: createTwoPointersAnimationSteps,
  statusConfig: TwoPointersStatusConfig,
  actionHandler: twoPointersActionHandler,
  renderActionBar: (props) => <TwoPointersActionBar {...(props as AlgoActionBarProps)} />,
  maxNodes: 30,
  relatedProblems: [
    {
      id: 167,
      title: "Two Sum II - Input Array Is Sorted",
      concept: "relatedProblems.167",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    },
    {
      id: 26,
      title: "Remove Duplicates from Sorted Array",
      concept: "relatedProblems.26",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
    },
    {
      id: 15,
      title: "3Sum",
      concept: "relatedProblems.15",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/3sum/",
    },
    {
      id: 11,
      title: "Container With Most Water",
      concept: "relatedProblems.11",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/container-with-most-water/",
    },
    {
      id: 125,
      title: "Valid Palindrome",
      concept: "relatedProblems.125",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/valid-palindrome/",
    },
    {
      id: 283,
      title: "Move Zeroes",
      concept: "relatedProblems.283",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/move-zeroes/",
    },
  ],
};

import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { LinearData } from "@/data/DataStructure/linear/utils";
import { SearchingActionBar } from "./SearchingActionBar";
import { binarySearchRealWorldStories } from "@/data/algorithms/searching/binarySearch.stories";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import { simulateBinarySearchTrace } from "./binarySearch/simulateTrace";
import { binarySearchTraceToSteps } from "./binarySearch/traceToSteps";
import { TAGS } from "./binarySearch/tags";

const binarySearchActionHandler = createLinearActionHandler({
  randomValueRange: [0, 100],
  sortOnLoad: true,
});

export function createBinarySearchAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  const trace = simulateBinarySearchTrace(inputData as LinearData[], action);
  return binarySearchTraceToSteps(trace);
}

const binarySearchCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure BinarySearch(arr, target):
  left ← 0
  right ← length of arr - 1

  While left ≤ right Do
    mid ← floor((left + right) / 2)

    If arr[mid] = target Then
      Return mid
    Else If arr[mid] < target Then
      left ← mid + 1
    Else
      right ← mid - 1
    End If
  End While

  Return -1
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2, 3],
      [TAGS.CHECK_WHILE]: [5],
      [TAGS.CALC_MID]: [6],
      [TAGS.COMPARE]: [8, 10, 12],
      [TAGS.FOUND]: [9],
      [TAGS.UPDATE_LEFT]: [11],
      [TAGS.UPDATE_RIGHT]: [13],
      [TAGS.NOT_FOUND]: [17],
    },
  },
  python: {
    content: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(log n)' },                              // def binary_search(arr, target):
      { lineNumber: 2,  complexity: 'O(1)' },                                  // left = 0
      { lineNumber: 3,  complexity: 'O(1)' },                                  // right = len(arr) - 1
      { lineNumber: 5,  complexity: 'O(log n)' },                              // while left <= right:
      { lineNumber: 6,  complexity: 'O(1)', context: 'O(log n)' },             // mid = (left + right) // 2
      { lineNumber: 8,  complexity: 'O(1)', context: 'O(log n)' },             // if arr[mid] == target:
      { lineNumber: 9,  complexity: 'O(1)', context: 'O(log n)' },             // return mid
      { lineNumber: 10, complexity: 'O(1)', context: 'O(log n)' },             // elif arr[mid] < target:
      { lineNumber: 11, complexity: 'O(1)', context: 'O(log n)' },             // left = mid + 1
      { lineNumber: 12, complexity: 'O(1)', context: 'O(log n)' },             // else:
      { lineNumber: 13, complexity: 'O(1)', context: 'O(log n)' },             // right = mid - 1
      { lineNumber: 15, complexity: 'O(1)' },                                  // return -1
    ],
  },
};

export const binarySearchConfig: LevelImplementationConfig = {
  id: "binarysearch",
  type: "algorithm",
  name: "二分搜尋 (Binary Search)",
  categoryName: "搜尋演算法",
  description: "高效的搜尋演算法，適用於已排序陣列",
  codeConfig: binarySearchCodeConfig,
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(1)",
  },
  i18nNamespace: "tutorials/binary-search",
  introduction: { key: "introduction" },
  defaultData: [
    { id: "box-0", value: 10 },
    { id: "box-1", value: 25 },
    { id: "box-2", value: 32 },
    { id: "box-3", value: 42 },
    { id: "box-4", value: 55 },
    { id: "box-5", value: 68 },
    { id: "box-6", value: 73 },
    { id: "box-7", value: 89 },
    { id: "box-8", value: 95 },
  ],
  createAnimationSteps: createBinarySearchAnimationSteps,
  actionHandler: binarySearchActionHandler,
  renderActionBar: (props) => <SearchingActionBar {...(props as any)} />,
  relatedProblems: [
    {
      id: 704,
      title: "Binary Search",
      concept: "relatedProblems.704",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/binary-search/",
    },
    {
      id: 35,
      title: "Search Insert Position",
      concept: "relatedProblems.35",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/search-insert-position/",
    },
    {
      id: 34,
      title: "Find First and Last Position of Element in Sorted Array",
      concept: "relatedProblems.34",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
    },
  ],
  maxNodes: 30,
  realWorldStories: binarySearchRealWorldStories,
};

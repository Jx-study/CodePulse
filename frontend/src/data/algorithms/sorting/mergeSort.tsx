import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { LinearData } from "@/data/DataStructure/linear/utils";
import { SortingActionBar } from "./SortingActionBar";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import { simulateMergeSortTrace } from "./mergeSort/simulateTrace";
import { mergeSortTraceToSteps } from "./mergeSort/traceToSteps";
import { TAGS } from "./mergeSort/tags";

const mergeSortActionHandler = createLinearActionHandler();

export function createMergeSortAnimationSteps(
  inputData: LinearData[],
): AnimationStep[] {
  const trace = simulateMergeSortTrace(inputData);
  return mergeSortTraceToSteps(trace);
}

const mergeSortCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure MergeSort(collection):
  If length of collection ≤ 1 Then
    Return collection
  End If

  mid ← length of collection / 2
  left ← MergeSort(collection[0 to mid-1])
  right ← MergeSort(collection[mid to end])

  Return Merge(left, right)
End Procedure

Procedure Merge(left, right):
  result ← empty list
  leftIndex ← 0
  rightIndex ← 0
  While left is not empty And right is not empty Do
    If left[leftIndex] ≤ right[rightIndex] Then
      append left[leftIndex] to result
      remove first element from left
      leftIndex ← leftIndex + 1
    Else
      append right[rightIndex] to result
      remove first element from right
      rightIndex ← rightIndex + 1
    End If
  End While

  append remaining elements of left to result
  append remaining elements of right to result

  Return result
End Procedure`,
    mappings: {
      [TAGS.INIT]: [1],
      [TAGS.IF_RETURN]: [2, 3, 4],
      [TAGS.DIVIDE]: [6, 7, 8],
      [TAGS.MERGE_START]: [13, 14, 15, 16],
      [TAGS.COMPARE]: [17, 18, 22],
      [TAGS.LEFT_COPY]: [19, 20, 21],
      [TAGS.RIGHT_COPY]: [23, 24, 25],
      [TAGS.REMAINING]: [29, 30],
      [TAGS.DONE]: [32],
    },
  },
  python: {
    content: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
        
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
            
    result.extend(left[i:])
    result.extend(right[j:])
    
    return result`,
  },
};

export const mergeSortConfig: LevelImplementationConfig = {
  id: "mergesort",
  type: "algorithm",
  name: "合併排序 (Merge Sort)",
  categoryName: "排序演算法",
  description: "使用分治法將陣列切割成最小單位，再依序合併排序。",
  codeConfig: mergeSortCodeConfig,
  complexity: {
    timeBest: "O(n log n)",
    timeAverage: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(n)",
  },
  introduction: `合併排序（Merge Sort）是典型的分治法（Divide and Conquer）應用。
它將陣列從中間一分為二，持續切割直到每個子陣列只剩一個元素，接著將這些子陣列兩兩合併，在合併的過程中將它們排序好，最後合併成一個完整的已排序陣列。`,
  defaultData: [
    { id: "box-0", value: 38 },
    { id: "box-1", value: 27 },
    { id: "box-2", value: 43 },
    { id: "box-3", value: 3 },
    { id: "box-4", value: 9 },
    { id: "box-5", value: 82 },
    { id: "box-6", value: 10 },
  ],
  createAnimationSteps: createMergeSortAnimationSteps,
  actionHandler: mergeSortActionHandler,
  renderActionBar: (props) => <SortingActionBar {...(props as any)} />,
  i18nNamespace: "tutorials/merge-sort",
  relatedProblems: [
    {
      id: 912,
      title: "Sort an Array",
      concept: "relatedProblems.912",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/sort-an-array/",
    },
    {
      id: 23,
      title: "Merge k Sorted Lists",
      concept: "relatedProblems.23",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/merge-k-sorted-lists/",
    },
  ],
  maxNodes: 20,
};

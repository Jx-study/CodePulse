import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import type { LinearData } from "@/data/DataStructure/linear/utils";

import { SortingActionBar } from "./SortingActionBar";
import { TAGS } from "./quickSort/tags";
import { simulateQuickSortTrace } from "./quickSort/simulateTrace";
import { quickSortTraceToSteps } from "./quickSort/traceToSteps";

const baseActionHandler = createLinearActionHandler();

export function createQuickSortAnimationSteps(
  dataList: LinearData[],
): AnimationStep[] {
  const trace = simulateQuickSortTrace(dataList);
  return quickSortTraceToSteps(trace);
}

const quickSortCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure QuickSort(arr, low, high):
  If low < high Then
    pivotIdx ← Partition(arr, low, high)
    QuickSort(arr, low, pivotIdx - 1)
    QuickSort(arr, pivotIdx + 1, high)
  End If
End Procedure

Procedure Partition(arr, low, high):
  pivot ← arr[high]
  i ← low - 1
  For j ← low To high - 1 Do
    If arr[j] ≤ pivot Then
      i ← i + 1
      Swap(arr[i], arr[j])
    End If
  End For
  Swap(arr[i + 1], arr[high])
  Return i + 1
End Procedure`,
    mappings: {
      [TAGS.CALL]: [1, 2],
      [TAGS.PARTITION_START]: [9, 10],
      [TAGS.COMPARE]: [11, 12],
      [TAGS.SWAP]: [13, 14],
      [TAGS.PIVOT_SET]: [17, 18],
      [TAGS.BASE_CASE]: [2],
      [TAGS.DONE]: [7],
    },
  },
  python: {
    content: `def quick_sort(arr, low, high):
    if low < high:
        pivot_idx = partition(arr, low, high)
        quick_sort(arr, low, pivot_idx - 1)
        quick_sort(arr, pivot_idx + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
            
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
  },
};

export const quickSortConfig: LevelImplementationConfig = {
  id: "quicksort",
  type: "algorithm",
  name: "快速排序 (Quick Sort)",
  categoryName: "排序演算法",
  description: "使用分治法與基準點 (Pivot) 來切分陣列，原地進行高效率排序。",
  codeConfig: quickSortCodeConfig,
  complexity: {
    timeBest: "O(n log n)",
    timeAverage: "O(n log n)",
    timeWorst: "O(n²)",
    space: "O(log n)",
  },
  i18nNamespace: "tutorials/quick-sort",
  introduction: { key: "introduction" },
  defaultData: [
    { id: "box-0", value: 38 },
    { id: "box-1", value: 27 },
    { id: "box-2", value: 43 },
    { id: "box-3", value: 3 },
    { id: "box-4", value: 9 },
    { id: "box-5", value: 82 },
    { id: "box-6", value: 10 },
  ],
  createAnimationSteps: createQuickSortAnimationSteps,
  actionHandler: baseActionHandler,
  renderActionBar: (props) => <SortingActionBar {...(props as any)} />,
  relatedProblems: [
    {
      id: 912,
      title: "Sort an Array",
      concept:
        "基礎排序：適合用 Quick Sort (搭配 Randomized Pivot) 實現 O(n log n) 時間複雜度",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/sort-an-array/",
    },
    {
      id: 215,
      title: "Kth Largest Element in an Array",
      concept:
        "Quick Select：利用 Quick Sort 的 Partition 思想快速找到第 K 大元素",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    },
  ],
  maxNodes: 20,
};

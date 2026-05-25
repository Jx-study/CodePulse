import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { LinearData } from "@/data/DataStructure/linear/utils";
import { SortingActionBar } from "./SortingActionBar";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import { simulateSelectionSortTrace } from "./selectionSort/simulateTrace";
import { selectionSortTraceToSteps } from "./selectionSort/traceToSteps";
import { TAGS } from "./selectionSort/tags";

const selectionSortActionHandler = createLinearActionHandler();

export function createSelectionSortAnimationSteps(
  inputData: LinearData[],
): AnimationStep[] {
  const trace = simulateSelectionSortTrace(inputData);
  return selectionSortTraceToSteps(trace);
}

const selectionSortCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure SelectionSort(collection):
  totalItems ← length of collection
  
  For currentPos ← 0 To totalItems - 2 Do
    minPos ← currentPos
    
    For scanPos ← currentPos + 1 To totalItems - 1 Do
      scanVal ← collection[scanPos]
      minVal ← collection[minPos]
      
      If scanVal < minVal Then
        minPos ← scanPos
      End If
    End For
    
    If minPos ≠ currentPos Then
      swap(collection[currentPos], collection[minPos])
    End If
  End For
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2],
      [TAGS.ROUND_START]: [4, 5],
      [TAGS.COMPARE]: [7, 8, 9, 11],
      [TAGS.UPDATE_MIN]: [12],
      [TAGS.SWAP]: [16, 17],
      [TAGS.DONE]: [20],
    },
  },
  python: {
    content: `def selection_sort(collection):
    total_items = len(collection)
    
    for current_pos in range(total_items - 1):
        min_pos = current_pos
        
        for scan_pos in range(current_pos + 1, total_items):
            scan_val = collection[scan_pos]
            min_val = collection[min_pos]
            
            if scan_val < min_val:
                min_pos = scan_pos
                
        if min_pos != current_pos:
            collection[current_pos], collection[min_pos] = collection[min_pos], collection[current_pos]
            
    return collection`,
  },
};

export const selectionSortConfig: LevelImplementationConfig = {
  id: "selectionsort",
  type: "algorithm",
  name: "選擇排序 (Selection Sort)",
  categoryName: "排序演算法",
  description: "每次從未排序區間中選出最小值，放到已排序區間的末尾。",
  codeConfig: selectionSortCodeConfig,
  complexity: {
    timeBest: "O(n²)",
    timeAverage: "O(n²)",
    timeWorst: "O(n²)",
    space: "O(1)",
  },
  introduction: `選擇排序（Selection Sort）是一種簡單直觀的排序演算法。它的工作原理是每一次從待排序的資料元素中選出最小（或最大）的一個元素，存放在序列的起始位置，直到全部待排序的資料元素排完。`,
  defaultData: [
    { id: "box-0", value: 64 },
    { id: "box-1", value: 25 },
    { id: "box-2", value: 12 },
    { id: "box-3", value: 22 },
    { id: "box-4", value: 11 },
  ],
  createAnimationSteps: createSelectionSortAnimationSteps,
  actionHandler: selectionSortActionHandler,
  renderActionBar: (props) => <SortingActionBar {...(props as any)} />,
  i18nNamespace: "tutorials/selection-sort",
  relatedProblems: [
    {
      id: 215,
      title: "Kth Largest Element in an Array",
      concept: "選擇排序思想應用：尋找第 K 大元素，可用部分排序優化",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    },
    {
      id: 414,
      title: "Third Maximum Number",
      concept: "選擇最大/最小值概念：找出陣列中第三大的數字",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/third-maximum-number/",
    },
    {
      id: 164,
      title: "Maximum Gap",
      concept: "進階排序問題：找出排序後相鄰元素的最大差值",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/maximum-gap/",
    },
  ],
  maxNodes: 30,
};

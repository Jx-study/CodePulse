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
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(n^2)' },                            // def selection_sort(collection):
      { lineNumber: 2,  complexity: 'O(1)'   },                            // total_items = len(collection)
      { lineNumber: 4,  complexity: 'O(n)'   },                            // for current_pos in range(total_items - 1):
      { lineNumber: 5,  complexity: 'O(1)', context: 'O(n)'   },           // min_pos = current_pos
      { lineNumber: 7,  complexity: 'O(n)', context: 'O(n)'   },           // for scan_pos in range(current_pos + 1, ...):
      { lineNumber: 8,  complexity: 'O(1)', context: 'O(n^2)' },           // scan_val = collection[scan_pos]
      { lineNumber: 9,  complexity: 'O(1)', context: 'O(n^2)' },           // min_val = collection[min_pos]
      { lineNumber: 11, complexity: 'O(1)', context: 'O(n^2)' },           // if scan_val < min_val:
      { lineNumber: 12, complexity: 'O(1)', context: 'O(n^2)' },           // min_pos = scan_pos
      { lineNumber: 14, complexity: 'O(1)', context: 'O(n)'   },           // if min_pos != current_pos:
      { lineNumber: 15, complexity: 'O(1)', context: 'O(n)'   },           // collection[current_pos], ... = ...
      { lineNumber: 17, complexity: 'O(1)' },                              // return collection
    ],
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
  i18nNamespace: "tutorials/selection-sort",
  introduction: { key: "introduction" },
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
  relatedProblems: [
    {
      id: 215,
      title: "Kth Largest Element in an Array",
      concept: "relatedProblems.215",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    },
    {
      id: 414,
      title: "Third Maximum Number",
      concept: "relatedProblems.414",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/third-maximum-number/",
    },
    {
      id: 164,
      title: "Maximum Gap",
      concept: "relatedProblems.164",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/maximum-gap/",
    },
  ],
  maxNodes: 30,
};

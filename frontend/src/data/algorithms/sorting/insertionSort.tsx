import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { LinearData } from "@/data/DataStructure/linear/utils";
import { SortingActionBar } from "./SortingActionBar";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import { simulateInsertionSortTrace } from "./insertionSort/simulateTrace";
import { insertionSortTraceToSteps } from "./insertionSort/traceToSteps";
import { TAGS } from "./insertionSort/tags";

const insertionSortActionHandler = createLinearActionHandler();

export function createInsertionSortAnimationSteps(
  inputData: LinearData[],
): AnimationStep[] {
  const trace = simulateInsertionSortTrace(inputData);
  return insertionSortTraceToSteps(trace);
}

const insertionSortCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure InsertionSort(collection):
  totalItems ← length of collection
  
  For unsortedPos ← 1 To totalItems - 1 Do
    insertVal ← collection[unsortedPos]
    scanPos ← unsortedPos - 1
    
    // Shift elements greater than insertVal to the right
    While scanPos >= 0 AND collection[scanPos] > insertVal Do
      collection[scanPos + 1] ← collection[scanPos]
      scanPos ← scanPos - 1
    End While
    
    // Insert insertVal into the correct position
    collection[scanPos + 1] ← insertVal
    
    // Current round complete
  End For
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2],
      [TAGS.ROUND_START]: [4, 5, 6],
      [TAGS.COMPARE]: [9],
      [TAGS.SHIFT]: [10, 11],
      [TAGS.INSERT]: [15],
      [TAGS.DONE]: [19],
    },
  },
  python: {
    content: `def insertion_sort(collection):
    total_items = len(collection)
    
    for unsorted_pos in range(1, total_items):
        insert_val = collection[unsorted_pos]
        scan_pos = unsorted_pos - 1
        
        # Shift elements greater than insert_val
        while scan_pos >= 0 and collection[scan_pos] > insert_val:
            collection[scan_pos + 1] = collection[scan_pos]
            scan_pos -= 1
            
        # Insert the key into its correct position
        collection[scan_pos + 1] = insert_val
            
    return collection`,
  },
};

export const insertionSortConfig: LevelImplementationConfig = {
  id: "insertionsort",
  type: "algorithm",
  name: "插入排序 (Insertion Sort)",
  categoryName: "排序演算法",
  description:
    "類似整理撲克牌，每次將一張新牌插入到已排好序的手牌中的正確位置。",
  codeConfig: insertionSortCodeConfig,
  complexity: {
    timeBest: "O(n)",
    timeAverage: "O(n²)",
    timeWorst: "O(n²)",
    space: "O(1)",
  },
  introduction: `插入排序（Insertion Sort）是一種簡單直觀的排序演算法。它的工作原理是透過構建有序序列，對於未排序資料，在已排序序列中從後向前掃描，找到相應位置並插入。`,
  defaultData: [
    { id: "box-0", value: 12 },
    { id: "box-1", value: 11 },
    { id: "box-2", value: 13 },
    { id: "box-3", value: 5 },
    { id: "box-4", value: 6 },
  ],
  createAnimationSteps: createInsertionSortAnimationSteps,
  actionHandler: insertionSortActionHandler,
  renderActionBar: (props) => <SortingActionBar {...(props as any)} />,
  i18nNamespace: "tutorials/insertion-sort",
  relatedProblems: [
    {
      id: 147,
      title: "Insertion Sort List",
      concept: "relatedProblems.147",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/insertion-sort-list/",
    },
    {
      id: 148,
      title: "Sort List",
      concept: "relatedProblems.148",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/sort-list/",
    },
    {
      id: 88,
      title: "Merge Sorted Array",
      concept: "relatedProblems.88",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/merge-sorted-array/",
    },
  ],
  maxNodes: 30,
};

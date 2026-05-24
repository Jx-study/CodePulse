import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { LinearData } from "@/data/DataStructure/linear/utils";
import { SortingActionBar } from "./SortingActionBar";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import { simulateBubbleSortTrace } from "./bubbleSort/simulateTrace";
import { bubbleSortTraceToSteps } from "./bubbleSort/traceToSteps";
import { TAGS } from "./bubbleSort/tags";

const bubbleSortActionHandler = createLinearActionHandler();

export function createBubbleSortAnimationSteps(
  inputData: LinearData[],
): AnimationStep[] {
  const trace = simulateBubbleSortTrace(inputData);
  return bubbleSortTraceToSteps(trace);
}

const bubbleSortCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure BubbleSort(collection):
  totalItems ← length of collection
  
  For round ← 0 To totalItems - 2 Do
    hasSwapped ← false
    unsortedRange ← totalItems - round - 2
    
    For index ← 0 To unsortedRange Do
      currentVal ← collection[index]
      nextVal ← collection[index + 1]
      
      If currentVal > nextVal Then
        collection[index] ← nextVal
        collection[index + 1] ← currentVal
        hasSwapped ← true
      End If
    End For
    
    If hasSwapped = false Then Break
  End For
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2],
      [TAGS.ROUND_START]: [4, 5, 6],
      [TAGS.GET_VALUES]: [8, 9, 10],
      [TAGS.COMPARE]: [12],
      [TAGS.SWAP]: [13, 14, 15],
      [TAGS.ROUND_END]: [19],
      [TAGS.DONE]: [21],
    },
  },
  python: {
    content: `def bubble_sort(collection):
    total_items = len(collection)
    
    for round in range(total_items - 1):
        has_swapped = False
        unsorted_range = total_items - 1 - round
        
        for index in range(unsorted_range):
            if collection[index] > collection[index + 1]:
                collection[index], collection[index + 1] = collection[index + 1], collection[index]
                has_swapped = True
        
        if not has_swapped:
            break
            
    return collection`,
  },
};

export const bubbleSortConfig: LevelImplementationConfig = {
  id: "bubblesort",
  type: "algorithm",
  name: "泡沫排序 (Bubble Sort)",
  categoryName: "排序演算法",
  description: "透過重複交換相鄰的逆序元素，將最大值浮動到陣列頂端。",
  codeConfig: bubbleSortCodeConfig,
  complexity: {
    timeBest: "O(n)",
    timeAverage: "O(n²)",
    timeWorst: "O(n²)",
    space: "O(1)",
  },
  introduction: `泡沫排序是一種簡單的排序演算法。它重複地走訪過要排序的數列，一次比較兩個元素，如果他們的順序錯誤就把他們交換過來。`,
  defaultData: [
    { id: "box-0", value: 50 },
    { id: "box-1", value: 30 },
    { id: "box-2", value: -20 },
    { id: "box-3", value: 80 },
    { id: "box-4", value: 10 },
  ],
  createAnimationSteps: createBubbleSortAnimationSteps,
  actionHandler: bubbleSortActionHandler,
  renderActionBar: (props) => <SortingActionBar {...(props as any)} />,
  i18nNamespace: "tutorials/bubble-sort",
  relatedProblems: [
    {
      id: 912,
      title: "Sort an Array",
      concept: "基礎排序應用：使用任意排序演算法對陣列進行排序",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/sort-an-array/",
    },
    {
      id: 75,
      title: "Sort Colors",
      concept: "變體應用：三向分割問題，可用排序思想優化至 O(n)",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/sort-colors/",
    },
    {
      id: 242,
      title: "Valid Anagram",
      concept: "排序的實際應用：判斷兩字串是否為變位詞",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/valid-anagram/",
    },
  ],
  maxNodes: 30,
};

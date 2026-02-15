import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "../../DataStructure/linear/utils";

const generateFrame = (
  list: LinearData[],
  overrideStatusMap: Record<number, Status> = {},
  sortedIndices: Set<number> = new Set()
) => {
  const boxes = createBoxes(list, {
    startX: 50,
    startY: 250, // 0 的軸線位置
    gap: 70,
    overrideStatusMap,
    getDescription: (_item, index) => `${index}`,
  });

  boxes.forEach((element, i) => {
    // 強制轉型為 Box 以設定 autoScale (因為 createBoxes 回傳的是 BaseElement[] 或 Box[])
    const box = element as Box;
    box.autoScale = true; // 開啟長條圖模式

    // 如果該索引已經在已排序集合中，強制設為 complete
    if (sortedIndices.has(i)) {
      box.setStatus(Status.Complete);
    }
  });

  return boxes;
};

export function createBubbleSortAnimationSteps(
  inputData: LinearData[]
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  // 深拷貝資料以進行模擬排序
  let arr = inputData.map((d) => ({ ...d }));
  const n = arr.length;
  const sortedIndices = new Set<number>(); // 記錄已就定位的索引

  steps.push({
    stepNumber: 0,
    description: "開始泡沫排序",
    actionTag: TAGS.INIT,
    variables: { totalItems: n },
    elements: generateFrame(arr, {}, sortedIndices),
  });

  // 演算法主迴圈
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    steps.push({
      stepNumber: steps.length + 1,
      description: `第 ${i + 1} 輪開始`,
      actionTag: TAGS.ROUND_START,
      variables: { round: i, hasSwapped: false, unsortedRange: n - i - 2 },
      elements: generateFrame(arr, {}, sortedIndices),
    });

    for (let j = 0; j < n - i - 1; j++) {
      // 防呆：確保數值存在
      const val1 = arr[j].value ?? 0;
      const val2 = arr[j + 1].value ?? 0;

      const compareStatus: Record<number, Status> = {};
      compareStatus[j] = Status.Prepare;
      compareStatus[j + 1] = Status.Prepare;

      steps.push({
        stepNumber: steps.length + 1,
        description: `比較 Index ${j} (${val1}) 和 Index ${j + 1} (${val2})`,
        actionTag: TAGS.COMPARE,
        variables: {
          round: i,
          index: j,
          currentVal: val1,
          nextVal: val2,
          hasSwapped: swapped,
        },
        elements: generateFrame(arr, compareStatus, sortedIndices),
      });

      if (val1 > val2) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `判斷：${val1} > ${val2} 為真，準備交換`,
          actionTag: TAGS.COMPARE,
          variables: {
            round: i,
            index: j,
            currentVal: val1,
            nextVal: val2,
            condition: `${val1} > ${val2}`,
            result: true,
          },
          elements: generateFrame(arr, compareStatus, sortedIndices),
        });

        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;
        compareStatus[j] = Status.Target;
        compareStatus[j + 1] = Status.Target;

        steps.push({
          stepNumber: steps.length + 1,
          description: `交換完成：${val1} 和 ${val2} 位置對調`,
          actionTag: TAGS.SWAP,
          variables: {
            round: i,
            index: j,
            [`collection[${j}]`]: arr[j].value ?? null,
            [`collection[${j + 1}]`]: arr[j + 1].value ?? null,
            hasSwapped: true,
          },
          elements: generateFrame(arr, compareStatus, sortedIndices),
        });
      } else {
        steps.push({
          stepNumber: steps.length + 1,
          description: `判斷：${val1} > ${val2} 為假，不需交換`,
          actionTag: TAGS.COMPARE,
          variables: {
            round: i,
            index: j,
            condition: `${val1} > ${val2}`,
            result: false,
          },
          elements: generateFrame(arr, compareStatus, sortedIndices),
        });
      }
    }

    sortedIndices.add(n - 1 - i);

    steps.push({
      stepNumber: steps.length + 1,
      description: `本輪結束，Index ${n - 1 - i} 已就定位`,
      actionTag: TAGS.ROUND_END,
      variables: { round: i, hasSwapped: swapped },
      elements: generateFrame(arr, {}, sortedIndices),
    });

    if (!swapped) {
      for (let k = 0; k < n - 1 - i; k++) {
        sortedIndices.add(k);
      }
      break;
    }
  }

  sortedIndices.add(0);

  steps.push({
    stepNumber: steps.length + 1,
    description: "排序完成",
    actionTag: TAGS.DONE,
    variables: { isSorted: true },
    elements: generateFrame(arr, {}, sortedIndices),
  });

  return steps;
}

const TAGS = {
  INIT: "INIT",
  ROUND_START: "ROUND_START",
  INNER_LOOP_START: "INNER_LOOP_START",
  COMPARE: "COMPARE",
  DECISION: "DECISION",
  SWAP: "SWAP",
  ROUND_END: "ROUND_END",
  DONE: "DONE",
};

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
      [TAGS.COMPARE]: [8, 9, 10, 12],
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
};

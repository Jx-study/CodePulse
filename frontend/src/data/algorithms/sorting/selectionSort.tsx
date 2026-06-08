import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { LinearData } from "@/data/DataStructure/linear/utils";
import { SortingActionBar } from "./SortingActionBar";
import { createSortingFrame } from "@/data/shared/animationUtils/linearFrame";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";

const TAGS = {
  INIT: "INIT",
  ROUND_START: "ROUND_START",
  COMPARE: "COMPARE",
  UPDATE_MIN: "UPDATE_MIN",
  SWAP: "SWAP",
  DONE: "DONE",
};

const selectionSortActionHandler = createLinearActionHandler();

export function createSelectionSortAnimationSteps(
  inputData: LinearData[],
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  let arr = inputData.map((d) => ({ ...d }));
  const n = arr.length;
  const sortedIndices = new Set<number>();

  steps.push({
    stepNumber: 0,
    description: "開始選擇排序",
    actionTag: TAGS.INIT,
    local_vars: { totalItems: n },
    elements: createSortingFrame(arr, {}, sortedIndices),
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    steps.push({
      stepNumber: steps.length + 1,
      description: `第 ${i + 1} 輪開始：暫定 Index ${i} 為最小值`,
      actionTag: TAGS.ROUND_START,
      local_vars: { currentPos: i, minPos: i },
      elements: createSortingFrame(
        arr,
        { [minIdx]: Status.Target },
        sortedIndices,
      ),
    });

    for (let j = i + 1; j < n; j++) {
      const scanVal = Number(arr[j].value);
      const minVal = Number(arr[minIdx].value);

      steps.push({
        stepNumber: steps.length + 1,
        description: `比較：檢查 Index ${j} (${scanVal}) 是否小於目前最小值 (${minVal})`,
        actionTag: TAGS.COMPARE,
        local_vars: {
          currentPos: i,
          scanPos: j,
          minPos: minIdx,
          scanVal: scanVal,
          minVal: minVal,
          condition: `${scanVal} < ${minVal}`,
          result: scanVal < minVal,
        },
        elements: createSortingFrame(
          arr,
          { [i]: Status.Target, [minIdx]: Status.Target, [j]: Status.Prepare },
          sortedIndices,
        ),
      });

      if (scanVal < minVal) {
        minIdx = j;

        steps.push({
          stepNumber: steps.length + 1,
          description: `發現更小值！更新最小值索引為 ${minIdx}`,
          actionTag: TAGS.UPDATE_MIN,
          local_vars: {
            minPos: minIdx,
            scanVal: scanVal,
          },
          elements: createSortingFrame(
            arr,
            { [i]: Status.Target, [minIdx]: Status.Target },
            sortedIndices,
          ),
        });
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      steps.push({
        stepNumber: steps.length + 1,
        description: `本輪最小值 ${arr[i].value} (Index ${minIdx}) 與 Index ${i} 交換`,
        actionTag: TAGS.SWAP,
        local_vars: {
          currentPos: i,
          minPos: minIdx,
          [`collection[${i}]`]: arr[i].value ?? null,
          [`collection[${minIdx}]`]: arr[minIdx].value ?? null,
          hasSwapped: true,
        },
        elements: createSortingFrame(
          arr,
          { [i]: Status.Target, [minIdx]: Status.Target },
          sortedIndices,
        ),
      });
    } else {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Index ${i} 已經是最小值，無需交換`,
        actionTag: TAGS.SWAP,
        local_vars: {
          currentPos: i,
          minPos: minIdx,
          hasSwapped: false,
        },
        elements: createSortingFrame(
          arr,
          { [i]: Status.Target },
          sortedIndices,
        ),
      });
    }

    sortedIndices.add(i);
    steps.push({
      stepNumber: steps.length + 1,
      description: `Index ${i} 已排序完成`,
      actionTag: TAGS.ROUND_START,
      local_vars: { currentPos: i },
      elements: createSortingFrame(arr, {}, sortedIndices),
    });
  }

  sortedIndices.add(n - 1);

  steps.push({
    stepNumber: steps.length + 1,
    description: "排序完成",
    actionTag: TAGS.DONE,
    local_vars: { isSorted: true },
    elements: createSortingFrame(arr, {}, sortedIndices),
  });

  return steps;
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

import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "../../DataStructure/linear/utils";

const TAGS = {
  INIT: "INIT",
  ROUND_START: "ROUND_START",
  COMPARE: "COMPARE",
  UPDATE_MIN: "UPDATE_MIN",
  SWAP: "SWAP",
  DONE: "DONE",
};

// 復用 Frame 生成邏輯
const generateFrame = (
  list: LinearData[],
  overrideStatusMap: Record<number, Status> = {},
  sortedIndices: Set<number> = new Set()
) => {
  const boxes = createBoxes(list, {
    startX: 50,
    startY: 250,
    gap: 70,
    overrideStatusMap,
    getDescription: (_item, index) => `${index}`,
  });

  boxes.forEach((element, i) => {
    const box = element as Box;
    box.autoScale = true;

    if (sortedIndices.has(i)) {
      box.setStatus("complete");
    }
  });

  return boxes;
};

export function createSelectionSortAnimationSteps(
  inputData: LinearData[]
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  let arr = inputData.map((d) => ({ ...d }));
  const n = arr.length;
  const sortedIndices = new Set<number>();

  // Step 0: 初始狀態
  steps.push({
    stepNumber: 0,
    description: "開始選擇排序",
    actionTag: TAGS.INIT,
    variables: { totalItems: n },
    elements: generateFrame(arr, {}, sortedIndices),
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    // Step A: 回合開始 (Round Start)
    steps.push({
      stepNumber: steps.length + 1,
      description: `第 ${i + 1} 輪開始：暫定 Index ${i} 為最小值`,
      actionTag: TAGS.ROUND_START,
      variables: { currentPos: i, minPos: i },
      elements: generateFrame(arr, { [minIdx]: "target" }, sortedIndices),
    });

    for (let j = i + 1; j < n; j++) {
      const scanVal = arr[j].value ?? 0;
      const minVal = arr[minIdx].value ?? 0;

      // Step B: 比較 (Compare)
      steps.push({
        stepNumber: steps.length + 1,
        description: `比較：檢查 Index ${j} (${scanVal}) 是否小於目前最小值 (${minVal})`,
        actionTag: TAGS.COMPARE,
        variables: {
          currentPos: i, // 保持上下文
          scanPos: j,
          minPos: minIdx,
          scanVal: scanVal,
          minVal: minVal,
          condition: `${scanVal} < ${minVal}`,
          result: scanVal < minVal,
        },
        elements: generateFrame(
          arr,
          { [i]: "target", [minIdx]: "target", [j]: "prepare" },
          sortedIndices
        ),
      });

      // 檢查是否需要更新最小值
      if (scanVal < minVal) {
        minIdx = j;

        // Step C: 更新最小值 (Update Min)
        steps.push({
          stepNumber: steps.length + 1,
          description: `發現更小值！更新最小值索引為 ${minIdx}`,
          actionTag: TAGS.UPDATE_MIN,
          variables: {
            minPos: minIdx,
            scanVal: scanVal, // 這裡 scanVal 變成了新的 minVal
          },
          elements: generateFrame(
            arr,
            { [i]: "target", [minIdx]: "target" },
            sortedIndices
          ),
        });
      }
    }

    // 內層迴圈結束，準備交換
    // Step D: 交換 (Swap) or No Swap Decision
    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      steps.push({
        stepNumber: steps.length + 1,
        description: `本輪最小值 ${arr[i].value} (Index ${minIdx}) 與 Index ${i} 交換`,
        actionTag: TAGS.SWAP,
        variables: {
          currentPos: i,
          minPos: minIdx,
          [`collection[${i}]`]: arr[i].value ?? null,
          [`collection[${minIdx}]`]: arr[minIdx].value ?? null,
          hasSwapped: true,
        },
        elements: generateFrame(
          arr,
          { [i]: "target", [minIdx]: "target" },
          sortedIndices
        ),
      });
    } else {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Index ${i} 已經是最小值，無需交換`,
        actionTag: TAGS.SWAP,
        variables: {
          currentPos: i,
          minPos: minIdx,
          hasSwapped: false,
        },
        elements: generateFrame(arr, { [i]: "target" }, sortedIndices),
      });
    }

    // Step E: 回合結束，鎖定元素 (Round End)
    sortedIndices.add(i);
    steps.push({
      stepNumber: steps.length + 1,
      description: `Index ${i} 已排序完成`,
      actionTag: TAGS.ROUND_START,
      variables: { currentPos: i },
      elements: generateFrame(arr, {}, sortedIndices),
    });
  }

  // 確保最後一個元素也被標記
  sortedIndices.add(n - 1);
  
  // Final Step: 完成
  steps.push({
    stepNumber: steps.length + 1,
    description: "排序完成",
    actionTag: TAGS.DONE,
    variables: { isSorted: true },
    elements: generateFrame(arr, {}, sortedIndices),
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
        
        # 尋找未排序區間中的最小值
        for scan_pos in range(current_pos + 1, total_items):
            scan_val = collection[scan_pos]
            min_val = collection[min_pos]
            
            if scan_val < min_val:
                min_pos = scan_pos
                
        # 將找到的最小值換到目前位置
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
};
import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "../../DataStructure/linear/utils";

const TAGS = {
  INIT: "INIT",
  ROUND_START: "ROUND_START",
  COMPARE: "COMPARE",
  SHIFT: "SHIFT",
  INSERT: "INSERT",
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

    // 只有在 sortedIndices 內，且沒有被 override (例如正在比較或移動中) 時才設為 complete
    if (sortedIndices.has(i) && !overrideStatusMap[i]) {
      box.setStatus("complete");
    }
  });

  return boxes;
};

export function createInsertionSortAnimationSteps(
  inputData: LinearData[]
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  let arr = inputData.map((d) => ({ ...d }));
  const n = arr.length;
  const sortedIndices = new Set<number>();

  // Step 0: 初始狀態
  steps.push({
    stepNumber: 0,
    description: "開始插入排序",
    actionTag: TAGS.INIT,
    variables: { totalItems: n },
    elements: generateFrame(arr, {}, sortedIndices),
  });

  // 預設第 0 個元素視為已排序
  sortedIndices.add(0);
  steps.push({
    stepNumber: 1,
    description: "初始化：將第 0 個元素視為已排序區間",
    actionTag: TAGS.INIT,
    variables: { sortedCount: 1 },
    elements: generateFrame(arr, {}, sortedIndices),
  });

  // 從第 1 個元素開始遍歷
  for (let i = 1; i < n; i++) {
    const keyVal = arr[i].value ?? 0;
    
    // 視覺上暫時將 i 標記為處理中，但尚未真正「排序完成」
    sortedIndices.add(i);

    // Step A: Round Start (取出 Key)
    steps.push({
      stepNumber: steps.length + 1,
      description: `第 ${i} 輪：暫存 Index ${i} (${keyVal}) 為 insertVal，準備插入已排序區間`,
      actionTag: TAGS.ROUND_START,
      variables: {
        unsortedPos: i,
        insertVal: keyVal,
        scanPos: i - 1,
      },
      elements: generateFrame(arr, { [i]: "target" }, sortedIndices),
    });

    let j = i - 1;
    let currentKeyIndex = i; // 視覺追蹤：Key 目前在哪個格子

    // 向前掃描
    while (j >= 0) {
      const scanVal = arr[j].value ?? 0;

      // Step B: Compare
      steps.push({
        stepNumber: steps.length + 1,
        description: `比較：檢查 Index ${j} (${scanVal}) 是否大於 insertVal (${keyVal})`,
        actionTag: TAGS.COMPARE,
        variables: {
          unsortedPos: i,
          scanPos: j,
          insertVal: keyVal,
          scanVal: scanVal,
          condition: `${scanVal} > ${keyVal}`,
          result: scanVal > keyVal,
        },
        elements: generateFrame(
          arr,
          { [currentKeyIndex]: "target", [j]: "prepare" },
          sortedIndices
        ),
      });

      if (scanVal > keyVal) {
        // Step C: Shift (視覺上表現為交換)
        const temp = arr[j];
        arr[j] = arr[currentKeyIndex];
        arr[currentKeyIndex] = temp;

        steps.push({
          stepNumber: steps.length + 1,
          description: `搬移：${scanVal} > ${keyVal}，將 ${scanVal} 向右搬移 (Shift)`,
          actionTag: TAGS.SHIFT,
          variables: {
            scanPos: j,
            insertVal: keyVal,
            shiftVal: scanVal,
          },
          elements: generateFrame(
            arr,
            { [j]: "target", [currentKeyIndex]: "target" },
            sortedIndices
          ),
        });

        // 更新 Key 的位置索引 (視覺位置往左跑)
        currentKeyIndex = j;
        j--;
      } else {
        // Step D: Stop Shift (比較失敗，找到位置)
        // 這裡依然屬於 Compare 的一部分，只是結果為 False
        steps.push({
          stepNumber: steps.length + 1,
          description: `停止：${scanVal} <= ${keyVal}，找到插入點`,
          actionTag: TAGS.COMPARE, 
          variables: {
            scanPos: j,
            insertVal: keyVal,
            condition: `${scanVal} > ${keyVal}`,
            result: false,
          },
          elements: generateFrame(
            arr,
            { [currentKeyIndex]: "target", [j]: "prepare" },
            sortedIndices
          ),
        });
        break;
      }
    }

    // Step E: Insert
    // 雖然視覺上 Key 已經交換到了 currentKeyIndex，但在邏輯上這是「賦值」的一步
    steps.push({
      stepNumber: steps.length + 1,
      description: `插入：將 insertVal (${keyVal}) 放置於 Index ${currentKeyIndex}`,
      actionTag: TAGS.INSERT,
      variables: {
        insertPos: currentKeyIndex,
        insertVal: keyVal,
      },
      elements: generateFrame(arr, { [currentKeyIndex]: "complete" }, sortedIndices),
    });
    
    // Step F: Round End
    // 這一輪結束，確認 sortedIndices 更新
    steps.push({
      stepNumber: steps.length + 1,
      description: `Index 0~${i} 區間排序完成`,
      actionTag: TAGS.ROUND_START,
      variables: { sortedBoundary: i },
      elements: generateFrame(arr, {}, sortedIndices),
    });
  }

  // Final Step
  steps.push({
    stepNumber: steps.length + 1,
    description: "排序完成",
    actionTag: TAGS.DONE,
    variables: { isSorted: true },
    elements: generateFrame(arr, {}, sortedIndices),
  });

  return steps;
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
      
      // Round Start: 包含 For 迴圈與變數初始化 (4, 5, 6)
      [TAGS.ROUND_START]: [4, 5, 6],
      
      // Compare: While 迴圈條件檢查 (9)
      [TAGS.COMPARE]: [9],
      
      // Shift: 迴圈內的賦值與指針移動 (10, 11)
      [TAGS.SHIFT]: [10, 11],
      
      // Insert: 迴圈結束後的插入動作 (15)
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
  description: "類似整理撲克牌，每次將一張新牌插入到已排好序的手牌中的正確位置。",
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
};
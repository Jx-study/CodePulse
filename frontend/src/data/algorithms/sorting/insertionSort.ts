import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "../../DataStructure/linear/utils";

// 復用 Bubble/Selection 的 Frame 生成邏輯
const generateFrame = (
  list: LinearData[],
  overrideStatusMap: Record<number, Status> = {},
  sortedIndices: Set<number> = new Set()
) => {
  const boxes = createBoxes(list, {
    startX: 50,
    startY: 300,
    gap: 70,
    overrideStatusMap,
    getDescription: (_item, index) => `${index}`,
  });

  boxes.forEach((element, i) => {
    const box = element as Box;
    box.autoScale = true; // 開啟長條圖模式

    if (sortedIndices.has(i) && !overrideStatusMap[i]) {
      box.setStatus("complete");
    }
  });

  return boxes;
};

export function createInsertionSortAnimationSteps(
  inputData: any[]
): AnimationStep[] {
  // 強制轉型
  const dataList = inputData as LinearData[];
  const steps: AnimationStep[] = [];

  // 深拷貝資料
  let arr = dataList.map((d) => ({ ...d }));
  const n = arr.length;

  // 記錄已排序的索引集合
  const sortedIndices = new Set<number>();

  // Step 0: 初始狀態 (全部 Unfinished)
  // 這裡傳入空的 Set，讓所有格子維持藍色
  steps.push({
    stepNumber: 0,
    description: "初始陣列",
    elements: generateFrame(arr, {}, new Set()),
  });

  // Step 1: 標記第一個元素為已排序
  sortedIndices.add(0);
  steps.push({
    stepNumber: 1,
    description: "開始插入排序：將第 0 個元素視為已排序區間",
    elements: generateFrame(arr, {}, sortedIndices),
  });

  // 從第二個元素開始遍歷 (i = 1 to n-1)
  for (let i = 1; i < n; i++) {
    const keyVal = arr[i].value ?? 0;

    sortedIndices.add(i);
    // Step A: 選取當前要插入的元素 (Target)
    steps.push({
      stepNumber: steps.length + 1,
      description: `第 ${i} 輪：選取 Index ${i} (${keyVal}) 準備插入已排序區間`,
      elements: generateFrame(arr, { [i]: "target" }, sortedIndices),
    });

    let j = i - 1;
    let currentKeyIndex = i; // 追蹤 key 目前在陣列中的位置

    // 向前掃描並交換，只要前一個元素比 key 大，就交換
    while (j >= 0) {
      const compareVal = arr[j].value ?? 0;

      // Step B: 比較
      // Key 維持 Target，比較對象 (j) 標記為 Prepare (黃色)
      steps.push({
        stepNumber: steps.length + 1,
        description: `比較：${compareVal} (Index ${j}) vs ${keyVal} (Key)`,
        elements: generateFrame(
          arr,
          { [currentKeyIndex]: "target", [j]: "prepare" },
          sortedIndices
        ),
      });

      if (compareVal > keyVal) {
        // Step C: 交換 (Swap)
        const temp = arr[j];
        arr[j] = arr[currentKeyIndex];
        arr[currentKeyIndex] = temp;

        steps.push({
          stepNumber: steps.length + 1,
          description: `交換：${compareVal} > ${keyVal}，Key 向前移動`,
          elements: generateFrame(
            arr,
            { [j]: "target", [currentKeyIndex]: "target" },
            sortedIndices
          ),
        });

        // 交換後，Key 跑到 j 的位置了
        currentKeyIndex = j;
        j--;
      } else {
        // Step D: 發現比 Key 小的元素，停止移動
        steps.push({
          stepNumber: steps.length + 1,
          description: `${compareVal} <= ${keyVal}，Key 停留在此位置`,
          elements: generateFrame(
            arr,
            { [currentKeyIndex]: "target", [j]: "prepare" },
            sortedIndices
          ),
        });
        break;
      }
    }

    // Step E: 本輪結束，更新已排序區間
    // 將 0 到 i 的所有元素都加入 sortedIndices
    for (let k = 0; k <= i; k++) {
      sortedIndices.add(k);
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Index 0~${i} 區間已排序`,
      elements: generateFrame(arr, {}, sortedIndices),
    });
  }

  // Final Step: 全部完成
  steps.push({
    stepNumber: steps.length + 1,
    description: "排序完成",
    elements: generateFrame(arr, {}, sortedIndices),
  });

  return steps;
}

const insertionSortCodeConfig: CodeConfig = {
  pseudo: {
    content: `
for i from 1 to n-1:
  key = arr[i]
  j = i - 1
  while j >= 0 and arr[j] > key:
    arr[j+1] = arr[j]
    j = j - 1
  arr[j+1] = key
  `,
    mappings: {},
  },
  python: {
    content: `
for i in range(1, n):
  key = arr[i]
  j = i - 1
  while j >= 0 and arr[j] > key:
    arr[j+1] = arr[j]
    j = j - 1
  arr[j+1] = key`,
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
};


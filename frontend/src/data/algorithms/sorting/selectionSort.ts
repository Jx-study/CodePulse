import { AnimationStep, AlgorithmConfig } from "@/types";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "../../DataStructure/linear/utils";

// 復用 BubbleSort 的 Frame 生成邏輯
const generateFrame = (
  list: LinearData[],
  overrideStatusMap: Record<number, Status> = {},
  sortedIndices: Set<number> = new Set()
) => {
  const boxes = createBoxes(list, {
    startX: 50,
    startY: 300, // Bar Chart 基準線
    gap: 70,
    overrideStatusMap,
    getDescription: (_item, index) => `${index}`,
  });

  boxes.forEach((element, i) => {
    const box = element as Box;
    box.autoScale = true; // 開啟長條圖模式

    if (sortedIndices.has(i)) {
      box.setStatus("complete");
    }
  });

  return boxes;
};

export function createSelectionSortAnimationSteps(
  inputData: any[]
): AnimationStep[] {
  // 強制轉型
  const dataList = inputData as LinearData[];
  const steps: AnimationStep[] = [];

  let arr = dataList.map((d) => ({ ...d }));
  const n = arr.length;
  const sortedIndices = new Set<number>();

  // Step 0: 初始狀態
  steps.push({
    stepNumber: 0,
    description: "開始選擇排序：尋找未排序區間的最小值，放到最前面",
    elements: generateFrame(arr, {}, sortedIndices),
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    // Step A: 每一輪開始，先假設 i 是最小值
    // 標記 minIdx 為 target (橘色)
    steps.push({
      stepNumber: steps.length + 1,
      description: `第 ${i + 1} 輪：暫定 Index ${i} (${
        arr[i].value
      }) 為最小值，並標記為交換最小值的位置`,
      elements: generateFrame(arr, { [minIdx]: "target" }, sortedIndices),
    });

    for (let j = i + 1; j < n; j++) {
      // Step B: 掃描過程
      // minIdx 維持 target (橘色)，當前掃描的 j 標記為 prepare (黃色)
      steps.push({
        stepNumber: steps.length + 1,
        description: `檢查 Index ${j} (${arr[j].value}) 是否小於目前最小值 (${arr[minIdx].value})`,
        elements: generateFrame(
          arr,
          { [i]: "target", [minIdx]: "target", [j]: "prepare" },
          sortedIndices
        ),
      });

      // 檢查是否需要更新最小值
      if ((arr[j].value ?? 0) < (arr[minIdx].value ?? 0)) {
        minIdx = j;

        // Step C: 發現新最小值，更新標記
        // 新的 minIdx 變成 target，舊的會自動變回 unfinished (因為不在 map 裡了)
        steps.push({
          stepNumber: steps.length + 1,
          description: `發現更小值！更新最小值索引為 ${minIdx} (${arr[minIdx].value})`,
          elements: generateFrame(
            arr,
            { [i]: "target", [minIdx]: "target" },
            sortedIndices
          ),
        });
      }
    }

    // 內層迴圈結束，準備交換
    if (minIdx !== i) {
      // Step D: 交換
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      steps.push({
        stepNumber: steps.length + 1,
        description: `本輪最小值 ${arr[i].value} (Index ${minIdx}) 與 Index ${i} 交換`,
        elements: generateFrame(
          arr,
          { [i]: "target", [minIdx]: "target" }, // 交換的兩者都亮起
          sortedIndices
        ),
      });
    } else {
      // 如果不用交換，也顯示一下確認
      steps.push({
        stepNumber: steps.length + 1,
        description: `Index ${i} 已經是最小值，無需交換`,
        elements: generateFrame(arr, { [i]: "target" }, sortedIndices),
      });
    }

    // Step E: 鎖定 Index i
    sortedIndices.add(i);
    steps.push({
      stepNumber: steps.length + 1,
      description: `Index ${i} 已排序完成`,
      elements: generateFrame(arr, {}, sortedIndices),
    });
  }

  // 迴圈結束後，剩下最後一個元素一定是最大的，也算排序完成
  sortedIndices.add(n - 1);
  steps.push({
    stepNumber: steps.length + 1,
    description: "排序完成",
    elements: generateFrame(arr, {}, sortedIndices),
  });

  return steps;
}

export const selectionSortConfig: AlgorithmConfig = {
  id: "selectionsort",
  name: "選擇排序 (Selection Sort)",
  category: "sorting",
  categoryName: "排序演算法",
  description: "每次從未排序區間中選出最小值，放到已排序區間的末尾。",
  pseudoCode: `for i from 0 to n-1:
  minIdx = i
  for j from i+1 to n:
    if arr[j] < arr[minIdx]:
      minIdx = j
  swap(arr[i], arr[minIdx])`,
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

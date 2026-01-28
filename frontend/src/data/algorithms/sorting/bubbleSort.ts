import { AnimationStep, AlgorithmConfig } from "@/types";
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
      box.setStatus("complete");
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

  // Step 0: 初始狀態
  steps.push({
    stepNumber: 0,
    description: "開始泡沫排序",
    elements: generateFrame(arr, {}, sortedIndices),
  });

  // 演算法主迴圈
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      // 防呆：確保數值存在
      const val1 = arr[j].value ?? 0;
      const val2 = arr[j + 1].value ?? 0;

      // Step A: 比較 (Compare)
      const compareStatus: Record<number, Status> = {};
      compareStatus[j] = "prepare";
      compareStatus[j + 1] = "prepare";

      steps.push({
        stepNumber: steps.length + 1,
        description: `比較 Index ${j} (${val1}) 和 Index ${j + 1} (${val2})`,
        elements: generateFrame(arr, compareStatus, sortedIndices),
      });

      // 判斷交換
      if (val1 > val2) {
        // 交換整個物件，讓 ID 跟著跑，D3 才會產生位移動畫
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;
        compareStatus[j] = "target";
        compareStatus[j + 1] = "target";

        // Step B: 交換後
        // 因為 ID 位置變了，D3 會自動計算位置差並執行動畫
        steps.push({
          stepNumber: steps.length + 1,
          description: `交換：${val1} > ${val2}`,
          elements: generateFrame(arr, compareStatus, sortedIndices),
        });
      }
    }

    // 本輪結束，最後一個元素 (n-1-i) 歸位
    sortedIndices.add(n - 1 - i);

    steps.push({
      stepNumber: steps.length + 1,
      description: `本輪結束，Index ${n - 1 - i} 已就定位`,
      elements: generateFrame(arr, {}, sortedIndices),
    });

    // 如果這輪都沒交換，代表已經排序完成
    if (!swapped) {
      // 把剩下的所有未排序元素都標記為 sorted
      for (let k = 0; k < n - 1 - i; k++) {
        sortedIndices.add(k);
      }
      break;
    }
  }

  // 確保剩下最後一個元素也被標記
  sortedIndices.add(0);

  // Final Step: 完成
  steps.push({
    stepNumber: steps.length + 1,
    description: "排序完成",
    elements: generateFrame(arr, {}, sortedIndices),
  });

  return steps;
}

export const bubbleSortConfig: AlgorithmConfig = {
  id: "bubblesort",
  name: "泡沫排序 (Bubble Sort)",
  category: "sorting",
  categoryName: "排序演算法",
  description: "透過重複交換相鄰的逆序元素，將最大值浮動到陣列頂端。",
  pseudoCode: `
for i from 0 to n-1:
  for j from 0 to n-i-1:
    if arr[j] > arr[j+1]:
      swap(arr[j], arr[j+1])
  `,
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
};

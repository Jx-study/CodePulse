import { Box } from '@/modules/core/DataLogic/Box';
import type { AnimationStep, AlgorithmConfig, CodeConfig} from '@/types';
import type { Status } from '@/modules/core/DataLogic/BaseElement';
import { createBoxes, LinearData } from "../../DataStructure/linear/utils";

interface Pointers {
  left: number;
  right: number;
  mid: number;
}

// 產生每一個步驟的畫面 Frame
const generateFrame = (
  list: LinearData[],
  pointers: Pointers,
  overrideStatusMap: Record<number, Status> = {},
  foundIndex: number = -1
) => {
  const { left, right, mid } = pointers;

  const boxes = createBoxes(list, {
    startX: 50,
    startY: 200,
    gap: 70,
    overrideStatusMap,
    // 動態生成描述文字：顯示 Index 以及 L/M/R 指標
    getDescription: (_item, index) => {
      const labels: string[] = [`${index}`]; // 預設顯示 index
      if (index === left) labels.push("L");
      if (index === mid) labels.push("M");
      if (index === right) labels.push("R");

      // 如果重疊，顯示如 "2 (L,M)"
      if (labels.length > 1) {
        return `${labels[0]} (${labels.slice(1).join(",")})`;
      }
      return labels[0];
    },
  });

  boxes.forEach((element, i) => {
    const box = element as Box;

    // 如果 overrideStatusMap 有指定，它會優先 (由 createBoxes 處理)
    // 但 createBoxes 已經執行完了，所以這裡如果想要 override，需要手動檢查
    // 不過通常 overrideStatusMap 只會包含 mid (prepare/target)，mid 一定在範圍內，所以不會衝突。

    if (i < left || i > right) {
      box.setStatus("inactive");
    }

    if (foundIndex !== -1 && i === foundIndex) {
      box.setStatus("complete");
    }
  });

  return boxes;
};

export function createBinarySearchAnimationSteps(
  inputData: any[],
  action?: any // 允許接收外部傳入的參數 (例如 target)
): AnimationStep[] {
  // 強制轉型
  const dataList = inputData as LinearData[];
  const steps: AnimationStep[] = [];

  // 深拷貝資料 (雖然搜尋不改變資料，但為了保險)
  let arr = dataList.map((d) => ({ ...d }));

  // 1. 決定搜尋目標 (Target)
  // 如果 action 有傳入 value 就用，否則預設找陣列中間那個值 (確保 Demo 成功)
  // 或是找一個固定值 (例如 42)
  let target = 42;
  if (action && typeof action.value === "number") {
    target = action.value;
  } else if (arr.length > 0) {
    // 預設找 Index 4 的值 (如果有的話)
    target = arr[Math.min(4, arr.length - 1)].value || 0;
  }

  let left = 0;
  let right = arr.length - 1;
  let mid = -1; // 尚未計算

  // Step 0: 初始狀態
  steps.push({
    stepNumber: 0,
    description: `開始二分搜尋：目標值為 ${target}，搜尋範圍 [${left}, ${right}]`,
    elements: generateFrame(arr, { left, right, mid: -1 }),
  });

  while (left <= right) {
    // 1. 計算 Mid
    mid = Math.floor((left + right) / 2);

    // Step A: 標記 Mid (Prepare)
    steps.push({
      stepNumber: steps.length + 1,
      description: `計算中間位置 Mid = floor((${left} + ${right}) / 2) = ${mid}`,
      elements: generateFrame(arr, { left, right, mid }, { [mid]: "prepare" }),
    });

    const midVal = arr[mid].value ?? 0;

    // Step B: 比對 (Target)
    steps.push({
      stepNumber: steps.length + 1,
      description: `比對：Index ${mid} (${midVal}) vs 目標 (${target})`,
      elements: generateFrame(arr, { left, right, mid }, { [mid]: "target" }),
    });

    if (midVal === target) {
      // 找到目標
      steps.push({
        stepNumber: steps.length + 1,
        description: `找到目標！${midVal} 等於 ${target}，位於 Index ${mid}`,
        elements: generateFrame(
          arr,
          { left, right, mid },
          { [mid]: "complete" },
          mid
        ),
      });
      return steps; // 結束
    } else if (midVal < target) {
      // 中間值太小，往右找
      const newLeft = mid + 1; // 先計算，但不馬上覆蓋 left 變數

      // Step C: 更新範圍
      // 這裡顯示的是：Left 即將變動，但 Mid 還停留在原本的位置 (作為參考)
      // 或者可以讓 Mid 消失，只顯示 Left 移動
      // 這裡選擇讓 Mid 消失 (設為 -1)，強調「舊的 Mid 已經沒用了，新的範圍產生了」
      steps.push({
        stepNumber: steps.length + 1,
        description: `${midVal} < ${target}，目標在右半部，更新 Left = ${mid} + 1 = ${newLeft}`,
        elements: generateFrame(
          arr,
          { left: newLeft, right, mid: -1 }, // Mid 消失，Left 更新
          {} // 移除所有顏色標記，準備下一輪
        ),
      });

      left = newLeft; // 真正更新變數
    } else {
      // 中間值太大，往左找
      const newRight = mid - 1;

      // Step C: 更新範圍
      steps.push({
        stepNumber: steps.length + 1,
        description: `${midVal} > ${target}，目標在左半部，更新 Right = ${mid} - 1 = ${newRight}`,
        elements: generateFrame(
          arr,
          { left, right: newRight, mid: -1 }, // Mid 消失，Right 更新
          {}
        ),
      });

      right = newRight; // 真正更新變數
    }
  }

  // 沒找到
  steps.push({
    stepNumber: steps.length + 1,
    description: `搜尋結束：範圍已空 (Left > Right)，未找到目標 ${target}`,
    elements: generateFrame(arr, { left, right, mid: -1 }),
  });

  return steps;
}

// TODO: 完成 Binary Search 的 actionTag mappings 對應
const binarySearchCodeConfig: CodeConfig = {
  pseudo: {
    content: `Function binarySearch(arr, target):
  left ← 0
  right ← length of arr - 1

  While left ≤ right Do
    mid ← (left + right) / 2

    If arr[mid] = target Then
      Return mid
    Else If arr[mid] < target Then
      left ← mid + 1
    Else
      right ← mid - 1
    End If
  End While

  Return -1  // 未找到
End Function`,
    mappings: {
      // TODO: 實作 Binary Search 的 actionTag 對應 pseudo code 行號
    },
  },
  python: {
    content: `def binary_search(arr: list, target: int) -> int:
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1  # 未找到`,
    mappings: {
      // TODO: 實作 Binary Search 的 actionTag 對應 Python code 行號
    },
  },
};

export const binarySearchConfig: AlgorithmConfig = {
  id: "binarysearch",
  name: "二分搜尋 (Binary Search)",
  category: "searching",
  categoryName: "搜尋演算法",
  description: "高效的搜尋演算法，適用於已排序陣列",
  codeConfig: binarySearchCodeConfig,
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(1)",
  },
  introduction: `二分搜尋是一種高效的搜尋演算法，用於在已排序的陣列中尋找特定元素。它的核心思想是每次將搜尋範圍縮小一半，通過比較中間元素與目標值來決定接下來要搜尋左半部還是右半部。
由於每次都將搜尋範圍減半，因此時間複雜度為 O(log n)。注意：資料必須要是已排序的。`,
  // 預設資料：必須是已排序的！
  defaultData: [
    { id: "box-0", value: 10 },
    { id: "box-1", value: 25 },
    { id: "box-2", value: 32 },
    { id: "box-3", value: 42 },
    { id: "box-4", value: 55 },
    { id: "box-5", value: 68 },
    { id: "box-6", value: 73 },
    { id: "box-7", value: 89 },
    { id: "box-8", value: 95 },
  ],
  createAnimationSteps: createBinarySearchAnimationSteps,
};

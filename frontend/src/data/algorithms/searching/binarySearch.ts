import { Box } from '@/modules/core/DataLogic/Box';
import type { AnimationStep, CodeConfig } from '@/types';
import type { LevelImplementationConfig } from '@/types/implementation';
import type { Status } from '@/modules/core/DataLogic/BaseElement';
import { createBoxes, LinearData } from "../../DataStructure/linear/utils";

const TAGS = {
  INIT: "INIT",
  CHECK_WHILE: "CHECK_WHILE",
  CALC_MID: "CALC_MID",
  COMPARE: "COMPARE",
  FOUND: "FOUND",
  UPDATE_LEFT: "UPDATE_LEFT",
  UPDATE_RIGHT: "UPDATE_RIGHT",
  NOT_FOUND: "NOT_FOUND",
};

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

    // 視覺化重點：將不在搜尋範圍內的元素變灰 (Inactive)
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
  action?: any
): AnimationStep[] {
  const dataList = inputData as LinearData[];
  const steps: AnimationStep[] = [];

  // 深拷貝資料
  let arr = dataList.map((d) => ({ ...d }));

  // 1. 決定搜尋目標 (Target)
  let target = 42;
  if (action && typeof action.searchValue === "number") {
    target = action.searchValue;
  } else if (action && typeof action.value === "number") {
    target = action.value;
  } else if (arr.length > 0) {
    // 預設選擇中間偏右的值，展示較完整的搜尋路徑
    const targetIndex = Math.min(6, arr.length - 1);
    target = arr[targetIndex].value || 0;
  }

  let left = 0;
  let right = arr.length - 1;
  let mid = -1;

  // Step 0: 初始狀態
  steps.push({
    stepNumber: 0,
    description: `開始二分搜尋：目標值為 ${target}`,
    actionTag: TAGS.INIT,
    variables: { 
      left, 
      right, 
      target,
      totalItems: arr.length 
    },
    elements: generateFrame(arr, { left, right, mid: -1 }),
  });

  // Main Loop
  while (left <= right) {
    // Step: 檢查迴圈條件
    steps.push({
      stepNumber: steps.length + 1,
      description: `檢查：Left (${left}) <= Right (${right})，繼續搜尋`,
      actionTag: TAGS.CHECK_WHILE,
      variables: { left, right, condition: `${left} <= ${right}`, result: true },
      elements: generateFrame(arr, { left, right, mid: -1 }),
    });

    // 1. 計算 Mid
    mid = Math.floor((left + right) / 2);

    // Step A: 計算與標記 Mid
    steps.push({
      stepNumber: steps.length + 1,
      description: `計算中間點：Mid = floor((${left} + ${right}) / 2) = ${mid}`,
      actionTag: TAGS.CALC_MID,
      variables: { left, right, mid },
      elements: generateFrame(arr, { left, right, mid }, { [mid]: "prepare" }),
    });

    const midVal = arr[mid].value ?? 0;

    // Step B: 比對 (Compare)
    steps.push({
      stepNumber: steps.length + 1,
      description: `比對：Index ${mid} (${midVal}) vs 目標 (${target})`,
      actionTag: TAGS.COMPARE,
      variables: { 
        mid, 
        midVal, 
        target,
        compareCondition: `${midVal} == ${target}` 
      },
      elements: generateFrame(arr, { left, right, mid }, { [mid]: "target" }),
    });

    if (midVal === target) {
      // 找到目標
      steps.push({
        stepNumber: steps.length + 1,
        description: `找到目標！${midVal} 等於 ${target}，位於 Index ${mid}`,
        actionTag: TAGS.FOUND,
        variables: { foundIndex: mid, midVal },
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
      const newLeft = mid + 1;

      // Step C: 更新範圍 (Update Left)
      steps.push({
        stepNumber: steps.length + 1,
        description: `${midVal} < ${target} (太小)，目標在右半部，更新 Left = ${mid} + 1`,
        actionTag: TAGS.UPDATE_LEFT,
        variables: { 
          midVal, 
          target, 
          oldLeft: left,
          newLeft: newLeft 
        },
        elements: generateFrame(
          arr,
          { left: newLeft, right, mid: -1 }, // Mid 消失，Left 更新
          {} 
        ),
      });

      left = newLeft;
    } else {
      // 中間值太大，往左找
      const newRight = mid - 1;

      // Step C: 更新範圍 (Update Right)
      steps.push({
        stepNumber: steps.length + 1,
        description: `${midVal} > ${target} (太大)，目標在左半部，更新 Right = ${mid} - 1`,
        actionTag: TAGS.UPDATE_RIGHT,
        variables: { 
          midVal, 
          target, 
          oldRight: right,
          newRight: newRight
        },
        elements: generateFrame(
          arr,
          { left, right: newRight, mid: -1 }, // Mid 消失，Right 更新
          {}
        ),
      });

      right = newRight;
    }
  }

  // 沒找到
  steps.push({
    stepNumber: steps.length + 1,
    description: `搜尋結束：範圍已空 (Left > Right)，未找到目標 ${target}`,
    actionTag: TAGS.NOT_FOUND,
    variables: { left, right, found: false },
    elements: generateFrame(arr, { left, right, mid: -1 }),
  });

  return steps;
}

const binarySearchCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure BinarySearch(arr, target):
  left ← 0
  right ← length of arr - 1

  While left ≤ right Do
    mid ← floor((left + right) / 2)

    If arr[mid] = target Then
      Return mid
    Else If arr[mid] < target Then
      left ← mid + 1
    Else
      right ← mid - 1
    End If
  End While

  Return -1
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2, 3],
      [TAGS.CHECK_WHILE]: [5],
      [TAGS.CALC_MID]: [6],
      [TAGS.COMPARE]: [8, 10, 12], 
      [TAGS.FOUND]: [9],
      [TAGS.UPDATE_LEFT]: [11],
      [TAGS.UPDATE_RIGHT]: [13],
      [TAGS.NOT_FOUND]: [17],
    },
  },
  python: {
    content: `def binary_search(arr, target):
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

    return -1`,
  },
};

export const binarySearchConfig: LevelImplementationConfig = {
  id: "binarysearch",
  type: "algorithm",
  name: "二分搜尋 (Binary Search)",
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
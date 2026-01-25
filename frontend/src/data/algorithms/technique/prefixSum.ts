import { AnimationStep, AlgorithmConfig } from "../../../types/algorithm";
import { Box } from "../../../modules/core/DataLogic/Box";
import { createBoxes, LinearData } from "../../DataStructure/linear/utils";

// 輔助函式：同時產生「原始陣列」與「前綴和陣列」的畫面
const generateFrame = (
  sourceList: LinearData[],
  prefixList: (number | null)[], // 允許 null 表示還沒計算
  highlightIndices: {
    src?: number;
    pre?: number;
    prev?: number;
  } = {}
) => {
  // 1. 建立上排：原始陣列 (Source)
  // ID 保持原樣 (例如 box-0)，Y 軸設在上方 (150)
  const sourceBoxes = createBoxes(sourceList, {
    startX: 50,
    startY: 130, // 上排
    gap: 70,
    getDescription: (_item, index) => `A[${index}]`,
  });

  // 2. 建立下排：前綴和陣列 (Prefix)
  // 手動建構 LinearData，ID 改為 prefix-0 以防衝突
  const prefixData: LinearData[] = sourceList.map((_, i) => ({
    id: `prefix-${i}`,
    value: prefixList[i] ?? 0, // 如果是 null 顯示 0
  }));

  const prefixBoxes = createBoxes(prefixData, {
    startX: 50,
    startY: 300, // 下排 (錯開高度)
    gap: 70,
    getDescription: (_item, index) => `P[${index}]`,
  });

  // 3. 設定樣式與狀態
  // 設定 Source 狀態
  sourceBoxes.forEach((box, i) => {
    box.autoScale = true;
    box.scaleGroup = "source";
    box.maxHeight = 80;
    if (i === highlightIndices.src) box.setStatus("target"); // 橘色 (當前加數)
  });

  // 設定 Prefix 狀態
  prefixBoxes.forEach((element, i) => {
    const box = element as Box;
    box.autoScale = true;
    box.scaleGroup = "prefix";
    box.maxHeight = 80;

    // 如果數值是 null (尚未計算)，設為隱藏或灰色
    if (prefixList[i] === null) {
      box.value = 0;
      box.setStatus("inactive"); // 灰色
    } else {
      if (i === highlightIndices.pre) box.setStatus("complete"); // (剛算完)
      else if (i === highlightIndices.prev)
        box.setStatus("prepare"); // (前一個前綴和)
      else box.setStatus("complete"); // (已存檔)
    }
  });

  // 4. 合併兩排元素回傳
  return [...sourceBoxes, ...prefixBoxes];
};

export function createPrefixSumAnimationSteps(
  inputData: any[]
): AnimationStep[] {
  const sourceData = inputData as LinearData[];
  const steps: AnimationStep[] = [];
  const n = sourceData.length;

  // 建立一個初始全為 null 的前綴和陣列
  let prefixArr: (number | null)[] = new Array(n).fill(null);

  // Step 0: 初始狀態
  steps.push({
    stepNumber: 0,
    description: "初始狀態：上方為原始陣列 A，下方為前綴和陣列 P (尚未計算)",
    elements: generateFrame(sourceData, prefixArr),
  });

  // 演算法開始
  // P[0] = A[0]
  if (n > 0) {
    const val0 = sourceData[0].value ?? 0;

    // Step 1: 計算第一個元素
    steps.push({
      stepNumber: steps.length + 1,
      description: `初始化：P[0] = A[0] = ${val0}`,
      elements: generateFrame(sourceData, prefixArr, { src: 0 }),
    });

    prefixArr[0] = val0;

    steps.push({
      stepNumber: steps.length + 1,
      description: `P[0] 計算完成`,
      elements: generateFrame(sourceData, prefixArr, { pre: 0 }),
    });
  }

  // P[i] = P[i-1] + A[i]
  for (let i = 1; i < n; i++) {
    const currentVal = sourceData[i].value ?? 0;
    const prevSum = prefixArr[i - 1] ?? 0;
    const newSum = prevSum + currentVal;

    // Step A: 準備相加
    steps.push({
      stepNumber: steps.length + 1,
      description: `計算 P[${i}]：取前一個總和 P[${
        i - 1
      }] (${prevSum}) 加上當前元素 A[${i}] (${currentVal})`,
      elements: generateFrame(sourceData, prefixArr, {
        src: i, // 當前 A[i] (橘)
        prev: i - 1, // 前一個 P[i-1] (黃)
      }),
    });

    // Step B: 更新陣列
    prefixArr[i] = newSum;

    steps.push({
      stepNumber: steps.length + 1,
      description: `P[${i}] = ${prevSum} + ${currentVal} = ${newSum}`,
      elements: generateFrame(sourceData, prefixArr, {
        pre: i, // 新算的 P[i] (綠)
      }),
    });
  }

  // 結束
  steps.push({
    stepNumber: steps.length + 1,
    description: "前綴和陣列建構完成。現在可以進行 O(1) 的區間和查詢！",
    elements: generateFrame(sourceData, prefixArr),
  });

  return steps;
}

export const prefixSumConfig: AlgorithmConfig = {
  id: "prefixsum",
  name: "前綴和 (Prefix Sum)",
  category: "technique",
  categoryName: "演算法技巧",
  description: "透過預處理陣列，在 O(1) 時間內計算任意區間的總和。",
  pseudoCode: `// 建構前綴和 P
P[0] = A[0]
for i from 1 to n-1:
  P[i] = P[i-1] + A[i]

// 查詢區間 [L, R] 的和
RangeSum(L, R) = P[R] - P[L-1]`,
  complexity: {
    timeBest: "O(n)", // 建構時間
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(n)", // 需要額外陣列
  },
  introduction: `前綴和是一種重要的資料預處理技巧。它的核心概念是建立一個新陣列 P，其中 P[i] 代表原始陣列 A 從 index 0 加到 index i 的總和。
  一旦建立完成，我們就可以利用 P[R] - P[L-1] 快速求出任意區間 [L, R] 的總和，將查詢複雜度從 O(n) 降為 O(1)。`,
  defaultData: [
    { id: "box-0", value: 3 },
    { id: "box-1", value: 5 },
    { id: "box-2", value: 2 },
    { id: "box-3", value: 8 },
    { id: "box-4", value: 4 },
  ],
  createAnimationSteps: createPrefixSumAnimationSteps,
};

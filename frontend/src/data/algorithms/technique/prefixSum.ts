import { AnimationStep } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "../../DataStructure/linear/utils";

// 輔助函式：同時產生「原始陣列」與「前綴和陣列」的畫面
const generateFrame = (
  sourceList: LinearData[],
  prefixList: (number | null)[],
  prefixStatusMap: Record<number, Status> = {}, // 控制下方 Prefix 的狀態
  sourceStatusMap: Record<number, Status> = {} // 控制上方 Source 的狀態
) => {
  // 1. 建立上排：原始陣列 (Source)
  const sourceBoxes = createBoxes(sourceList, {
    startX: 50,
    startY: 130,
    gap: 70,
    overrideStatusMap: sourceStatusMap, // 直接傳入 map 給 createBoxes 處理
    getDescription: (_item, index) => `A[${index}]`,
  });

  // 2. 建立下排：前綴和陣列 (Prefix)
  const prefixData: LinearData[] = sourceList.map((_, i) => ({
    id: `prefix-${i}`,
    value: prefixList[i] ?? 0, // 如果是 null 顯示 0
  }));

  const prefixBoxes = createBoxes(prefixData, {
    startX: 50,
    startY: 300,
    gap: 70,
    overrideStatusMap: prefixStatusMap, // 直接傳入 map 給 createBoxes 處理
    getDescription: (_item, index) => `P[${index}]`,
  });

  // 3. 設定樣式與額外狀態邏輯

  // 設定 Source 樣式
  sourceBoxes.forEach((box) => {
    box.autoScale = true;
    box.scaleGroup = "source";
    box.maxHeight = 80;
  });

  // 設定 Prefix 樣式與特殊邏輯
  prefixBoxes.forEach((element, i) => {
    const box = element as Box;
    box.autoScale = true;
    box.scaleGroup = "prefix";
    box.maxHeight = 80;

    // 1. 如果數值是 null (尚未計算)，強制覆蓋為 inactive (灰色)
    if (prefixList[i] === null) {
      box.value = 0;
      box.setStatus("inactive");
    }
    // 2. 如果數值已計算，且不在 map 中 (createBoxes 沒設定到狀態)
    //    預設為 "unfinished" (藍色)，代表已存檔
    else if (!prefixStatusMap[i]) {
      box.setStatus("unfinished");
    }
    // 3. 如果在 map 中 (例如 target/complete/prepare)，已經設置完畢不用動
  });

  // 4. 合併兩排元素回傳
  return [...sourceBoxes, ...prefixBoxes];
};

export function createPrefixSumAnimationSteps(
  inputData: any[],
  action?: any // { range?: [L, R] }
): AnimationStep[] {
  const sourceData = inputData as LinearData[];
  const steps: AnimationStep[] = [];
  const n = sourceData.length;

  // 先計算好完整的前綴和陣列 (給查詢用)
  let prefixArrForQuery: (number | null)[] = new Array(n).fill(0);
  let currentSum = 0;
  for (let i = 0; i < n; i++) {
    currentSum += sourceData[i].value ?? 0;
    prefixArrForQuery[i] = currentSum;
  }

  // 查詢模式
  if (action && action.range && Array.isArray(action.range)) {
    const [L, R] = action.range;

    // 防呆
    if (L < 0 || R >= n || L > R) {
      const allCompleteMap: Record<number, Status> = {};
      for (let k = 0; k < n; k++) allCompleteMap[k] = "complete";

      steps.push({
        stepNumber: 0,
        description: `無效的區間 [${L}, ${R}]`,
        elements: generateFrame(sourceData, prefixArrForQuery, allCompleteMap),
      });
      return steps;
    }

    // 準備全綠 Map (背景用)
    const allCompleteMap: Record<number, Status> = {};
    for (let k = 0; k < n; k++) allCompleteMap[k] = "complete";

    // Step 0: 顯示初始狀態 (背景全綠)
    steps.push({
      stepNumber: 0,
      description: `準備查詢區間 [${L}, ${R}] 的總和`,
      elements: generateFrame(sourceData, prefixArrForQuery, allCompleteMap),
    });

    // Step 1: 標記 P[R] (覆蓋原本的 complete)
    steps.push({
      stepNumber: 1,
      description: `取得 P[${R}] = ${prefixArrForQuery[R]}`,
      elements: generateFrame(sourceData, prefixArrForQuery, {
        ...allCompleteMap,
        [R]: "target", // 高亮目標
      }),
    });

    // Step 2: 標記 P[L-1]
    const valR = prefixArrForQuery[R]!;
    let valL_1 = 0;

    if (L > 0) {
      valL_1 = prefixArrForQuery[L - 1]!;
      steps.push({
        stepNumber: 2,
        description: `取得 P[${L}-1] = P[${L - 1}] = ${valL_1}`,
        elements: generateFrame(sourceData, prefixArrForQuery, {
          ...allCompleteMap,
          [R]: "target",
          [L - 1]: "prepare", // 第二目標
        }),
      });
    } else {
      steps.push({
        stepNumber: 2,
        description: `L=0，因此不需要減去前綴`,
        elements: generateFrame(sourceData, prefixArrForQuery, {
          ...allCompleteMap,
          [R]: "target",
        }),
      });
    }

    // Step 3: 結果
    const result = valR - valL_1;

    // [修正重點] 這裡不再使用 undefined，而是手動建構 Map
    const resultMap: Record<number, Status> = { ...allCompleteMap };
    resultMap[R] = "target";
    if (L > 0) {
      resultMap[L - 1] = "prepare";
    }

    steps.push({
      stepNumber: 3,
      description: `區間和 = ${valR} - ${valL_1} = ${result}`,
      elements: generateFrame(sourceData, prefixArrForQuery, resultMap),
    });

    return steps;
  }

  // 建構模式
  let prefixArr: (number | null)[] = new Array(n).fill(null);

  // Step 0: 初始狀態 (空 Map)
  steps.push({
    stepNumber: 0,
    description: "初始狀態：上方為原始陣列 A，下方為前綴和陣列 P (尚未計算)",
    elements: generateFrame(sourceData, prefixArr, {}, {}),
  });

  // P[0] = A[0]
  if (n > 0) {
    const val0 = sourceData[0].value ?? 0;

    // Step 1: 初始化
    steps.push({
      stepNumber: steps.length + 1,
      description: `初始化：P[0] = A[0] = ${val0}`,
      elements: generateFrame(sourceData, prefixArr, {}, { 0: "target" }), // A[0] target
    });

    prefixArr[0] = val0;

    steps.push({
      stepNumber: steps.length + 1,
      description: `P[0] 計算完成`,
      elements: generateFrame(sourceData, prefixArr, { 0: "complete" }, {}), // P[0] complete
    });
  }

  // P[i] = P[i-1] + A[i]
  for (let i = 1; i < n; i++) {
    const currentVal = sourceData[i].value ?? 0;
    const prevSum = prefixArr[i - 1] ?? 0;
    const newSum = prevSum + currentVal;

    // Step A: 準備相加
    // A[i] -> target (橘)
    // P[i-1] -> prepare (黃)
    steps.push({
      stepNumber: steps.length + 1,
      description: `計算 P[${i}]：取前一個總和 P[${
        i - 1
      }] (${prevSum}) 加上當前元素 A[${i}] (${currentVal})`,
      elements: generateFrame(
        sourceData,
        prefixArr,
        { [i - 1]: "prepare" }, // Prefix map
        { [i]: "target" } // Source map
      ),
    });

    // Step B: 更新陣列
    prefixArr[i] = newSum;

    // P[i] -> complete (綠)
    steps.push({
      stepNumber: steps.length + 1,
      description: `P[${i}] = ${prevSum} + ${currentVal} = ${newSum}`,
      elements: generateFrame(
        sourceData,
        prefixArr,
        { [i]: "complete" }, // Prefix map
        {}
      ),
    });
  }

  // 結束：全部設為 Complete
  const finalCompleteMap: Record<number, Status> = {};
  for (let k = 0; k < n; k++) {
    finalCompleteMap[k] = "complete";
  }

  steps.push({
    stepNumber: steps.length + 1,
    description: "前綴和陣列建構完成。現在可以進行 O(1) 的區間和查詢！",
    elements: generateFrame(sourceData, prefixArr, finalCompleteMap, {}),
  });

  return steps;
}

export const prefixSumConfig: LevelImplementationConfig = {
  id: "prefixsum",
  type: "algorithm",
  name: "前綴和 (Prefix Sum)",
  categoryName: "演算法技巧",
  description: "透過預處理陣列，在 O(1) 時間內計算任意區間的總和。",
  pseudoCode: `// 建構前綴和 P
P[0] = A[0]
for i from 1 to n-1:
  P[i] = P[i-1] + A[i]

// 查詢區間 [L, R] 的和
RangeSum(L, R) = P[R] - P[L-1]`,
  complexity: {
    timeBest: "O(n)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(n)",
  },
  introduction: `前綴和是一種重要的資料預處理技巧。
  它的核心概念是建立一個新陣列 P，其中 P[i] 代表原始陣列 A 從 index 0 加到 index i 的總和。
  一旦建立完成，我們就可以利用 P[R] - P[L-1] 快速求出任意區間 [L, R] 的總和，將查詢複雜度從 O(n) 降為 O(1)。`,
  defaultData: [
    { id: "box-0", value: 3 },
    { id: "box-1", value: 5 },
    { id: "box-2", value: 2 },
    { id: "box-3", value: 8 },
    { id: "box-4", value: 4 },
  ],
  createAnimationSteps: createPrefixSumAnimationSteps,
  relatedProblems: [
    {
      id: 303,
      title: "Range Sum Query - Immutable",
      concept: "經典前綴和問題：快速計算陣列區間和",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/range-sum-query-immutable/",
    },
    {
      id: 560,
      title: "Subarray Sum Equals K",
      concept: "前綴和 + Hash Map：計算和為 K 的連續子陣列數量",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/subarray-sum-equals-k/",
    },
    {
      id: 304,
      title: "Range Sum Query 2D - Immutable",
      concept: "二維前綴和：擴展到二維矩陣的區間和查詢",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/range-sum-query-2d-immutable/",
    },
  ],
};

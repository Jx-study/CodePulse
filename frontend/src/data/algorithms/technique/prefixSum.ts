import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "../../DataStructure/linear/utils";

const TAGS = {
  // Construction Tags
  BUILD_INIT: "BUILD_INIT",
  BUILD_BASE: "BUILD_BASE",
  BUILD_CALC: "BUILD_CALC",
  BUILD_DONE: "BUILD_DONE",
  
  // Query Tags
  QUERY_START: "QUERY_START",
  QUERY_GET_R: "QUERY_GET_R",
  QUERY_GET_L: "QUERY_GET_L",         // L > 0: Enter If block
  QUERY_RETURN_SUB: "QUERY_RETURN_SUB", // L > 0: Return valR - valL
  QUERY_ELSE: "QUERY_ELSE",           // L = 0: Enter Else block
  QUERY_RETURN_DIRECT: "QUERY_RETURN_DIRECT", // L = 0: Return valR
};

// Helper function to generate frame
const generateFrame = (
  sourceList: LinearData[],
  prefixList: (number | null)[],
  prefixStatusMap: Record<number, Status> = {},
  sourceStatusMap: Record<number, Status> = {}
) => {
  const sourceBoxes = createBoxes(sourceList, {
    startX: 50,
    startY: 130,
    gap: 70,
    overrideStatusMap: sourceStatusMap,
    getDescription: (_item, index) => `A[${index}]`,
  });

  const prefixData: LinearData[] = sourceList.map((_, i) => ({
    id: `prefix-${i}`,
    value: prefixList[i] ?? 0,
  }));

  const prefixBoxes = createBoxes(prefixData, {
    startX: 50,
    startY: 300,
    gap: 70,
    overrideStatusMap: prefixStatusMap,
    getDescription: (_item, index) => `P[${index}]`,
  });

  sourceBoxes.forEach((box) => {
    box.autoScale = true;
    box.scaleGroup = "source";
    box.maxHeight = 80;
  });

  prefixBoxes.forEach((element, i) => {
    const box = element as Box;
    box.autoScale = true;
    box.scaleGroup = "prefix";
    box.maxHeight = 80;

    if (prefixList[i] === null) {
      box.value = 0;
      box.setStatus("inactive");
    } else if (!prefixStatusMap[i]) {
      box.setStatus("unfinished");
    }
  });

  return [...sourceBoxes, ...prefixBoxes];
};

export function createPrefixSumAnimationSteps(
  inputData: any[],
  action?: any
): AnimationStep[] {
  const sourceData = inputData as LinearData[];
  const steps: AnimationStep[] = [];
  const n = sourceData.length;

  // Pre-calculate prefix sum array
  let prefixArrForQuery: (number | null)[] = new Array(n).fill(0);
  let currentSum = 0;
  for (let i = 0; i < n; i++) {
    currentSum += sourceData[i].value ?? 0;
    prefixArrForQuery[i] = currentSum;
  }

  // ==========================================
  // Mode 1: Query Mode (查詢模式)
  // ==========================================
  if (action && action.range && Array.isArray(action.range)) {
    const [L, R] = action.range;

    if (L < 0 || R >= n || L > R) {
      return steps;
    }

    const allCompleteMap: Record<number, Status> = {};
    for (let k = 0; k < n; k++) allCompleteMap[k] = "complete";

    // Step 0: Start
    steps.push({
      stepNumber: 0,
      description: `開始查詢：計算區間 [${L}, ${R}] 的總和`,
      actionTag: TAGS.QUERY_START,
      variables: { L, R },
      elements: generateFrame(sourceData, prefixArrForQuery, allCompleteMap),
    });

    // Step 1: Get P[R]
    steps.push({
      stepNumber: 1,
      description: `步驟 1：取得右邊界的前綴和 P[${R}] = ${prefixArrForQuery[R]}`,
      actionTag: TAGS.QUERY_GET_R,
      variables: { 
        R, 
        valR: prefixArrForQuery[R] 
      },
      elements: generateFrame(sourceData, prefixArrForQuery, {
        ...allCompleteMap,
        [R]: "target",
      }),
    });

    const valR = prefixArrForQuery[R]!;
    
    // Step 2 & 3: Handle conditions
    if (L > 0) {
      const valL_1 = prefixArrForQuery[L - 1]!;
      
      // Step 2: Get P[L-1] (Enter If check)
      steps.push({
        stepNumber: 2,
        description: `步驟 2：因為 L > 0，取得左邊界前一個位置的前綴和 P[${L}-1] = ${valL_1}`,
        actionTag: TAGS.QUERY_GET_L,
        variables: { 
          L, 
          prevL: L - 1, 
          valL: valL_1 
        },
        elements: generateFrame(sourceData, prefixArrForQuery, {
          ...allCompleteMap,
          [R]: "target",
          [L - 1]: "prepare",
        }),
      });

      // Step 3: Calculate and Return (Subtraction)
      const result = valR - valL_1;
      const resultMap: Record<number, Status> = { ...allCompleteMap, [R]: "target", [L - 1]: "prepare" };
      
      steps.push({
        stepNumber: 3,
        description: `計算結果：${valR} - ${valL_1} = ${result}`,
        actionTag: TAGS.QUERY_RETURN_SUB,
        variables: { 
          valR, 
          valL: valL_1, 
          result 
        },
        elements: generateFrame(sourceData, prefixArrForQuery, resultMap),
      });

    } else {
      // Step 2: Else case (L = 0)
      steps.push({
        stepNumber: 2,
        description: `步驟 2：因為 L = 0，不需要減去任何前綴`,
        actionTag: TAGS.QUERY_ELSE,
        variables: { L },
        elements: generateFrame(sourceData, prefixArrForQuery, {
          ...allCompleteMap,
          [R]: "target",
        }),
      });

      // Step 3: Return Direct
      steps.push({
        stepNumber: 3,
        description: `直接回傳：P[${R}] = ${valR}`,
        actionTag: TAGS.QUERY_RETURN_DIRECT,
        variables: { result: valR },
        elements: generateFrame(sourceData, prefixArrForQuery, {
          ...allCompleteMap,
          [R]: "target",
        }),
      });
    }

    return steps;
  }

  // ==========================================
  // Mode 2: Construction Mode (建構模式)
  // ==========================================
  let prefixArr: (number | null)[] = new Array(n).fill(null);

  steps.push({
    stepNumber: 0,
    description: "開始建構前綴和陣列 P",
    actionTag: TAGS.BUILD_INIT,
    variables: { n },
    elements: generateFrame(sourceData, prefixArr, {}, {}),
  });

  if (n > 0) {
    const val0 = sourceData[0].value ?? 0;
    prefixArr[0] = val0;

    steps.push({
      stepNumber: steps.length + 1,
      description: `初始化：P[0] = A[0] = ${val0}`,
      actionTag: TAGS.BUILD_BASE,
      variables: { val0 },
      elements: generateFrame(sourceData, prefixArr, { 0: "complete" }, { 0: "target" }),
    });
  }

  for (let i = 1; i < n; i++) {
    const currentVal = sourceData[i].value ?? 0;
    const prevSum = prefixArr[i - 1] ?? 0;
    const newSum = prevSum + currentVal;

    steps.push({
      stepNumber: steps.length + 1,
      description: `計算 P[${i}]：前一個總和 P[${i - 1}] (${prevSum}) + 當前元素 A[${i}] (${currentVal})`,
      actionTag: TAGS.BUILD_CALC,
      variables: { i, prevSum, currentVal, newSum },
      elements: generateFrame(
        sourceData,
        prefixArr,
        { [i - 1]: "prepare" }, 
        { [i]: "target" }
      ),
    });

    prefixArr[i] = newSum;
    steps.push({
      stepNumber: steps.length + 1,
      description: `更新 P[${i}] = ${newSum}`,
      actionTag: TAGS.BUILD_CALC,
      variables: { i, newSum },
      elements: generateFrame(
        sourceData,
        prefixArr,
        { [i]: "complete" }, 
        {}
      ),
    });
  }

  const finalCompleteMap: Record<number, Status> = {};
  for (let k = 0; k < n; k++) finalCompleteMap[k] = "complete";

  steps.push({
    stepNumber: steps.length + 1,
    description: "建構完成",
    actionTag: TAGS.BUILD_DONE,
    elements: generateFrame(sourceData, prefixArr, finalCompleteMap, {}),
  });

  return steps;
}

const prefixSumCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure BuildPrefixSum(arr):
  n ← length of arr
  prefix[0] ← arr[0]

  For i ← 1 To n - 1 Do
    prefix[i] ← prefix[i - 1] + arr[i]
  End For
End Procedure

Procedure RangeSum(L, R):
  valR ← prefix[R]

  If L > 0 Then
    valL ← prefix[L - 1]
    Return valR - valL
  Else
    Return valR
  End If
End Procedure`,
    mappings: {
      [TAGS.BUILD_INIT]: [2],
      [TAGS.BUILD_BASE]: [3],
      [TAGS.BUILD_CALC]: [6],
      [TAGS.BUILD_DONE]: [8],
      
      [TAGS.QUERY_START]: [10],
      [TAGS.QUERY_GET_R]: [11],
      
      // L > 0 Path
      [TAGS.QUERY_GET_L]: [13, 14],       // If check + Assignment
      [TAGS.QUERY_RETURN_SUB]: [15],      // Return subtraction
      
      // L = 0 Path
      [TAGS.QUERY_ELSE]: [13, 16],        // If check (fail) + Else
      [TAGS.QUERY_RETURN_DIRECT]: [17],   // Return direct
    },
  },
  python: {
    content: `def build_prefix_sum(arr):
    n = len(arr)
    prefix = [0] * n
    prefix[0] = arr[0]

    for i in range(1, n):
        prefix[i] = prefix[i - 1] + arr[i]

    return prefix

def range_sum(prefix, L, R):
    # Get the value at the right boundary
    val_r = prefix[R]

    if L > 0:
        val_l = prefix[L - 1]
        return val_r - val_l
    else:
        return val_r`,
  },
};

export const prefixSumConfig: LevelImplementationConfig = {
  id: "prefixsum",
  type: "algorithm",
  name: "前綴和 (Prefix Sum)",
  categoryName: "演算法技巧",
  description: "透過預處理陣列，在 O(1) 時間內計算任意區間的總和。",
  codeConfig: prefixSumCodeConfig,
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
};
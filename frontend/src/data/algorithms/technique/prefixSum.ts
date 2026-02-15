import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createBoxes, LinearData } from "../../DataStructure/linear/utils";

const TAGS = {
  BUILD_INIT: "BUILD_INIT",
  BUILD_BASE: "BUILD_BASE",
  BUILD_CALC: "BUILD_CALC",
  BUILD_DONE: "BUILD_DONE",
  
  QUERY_START: "QUERY_START",
  QUERY_GET_R: "QUERY_GET_R",
  QUERY_GET_L: "QUERY_GET_L",         
  QUERY_RETURN_SUB: "QUERY_RETURN_SUB", 
  QUERY_ELSE: "QUERY_ELSE",           
  QUERY_RETURN_DIRECT: "QUERY_RETURN_DIRECT", 
};

const generateFrame = (
  sourceList: LinearData[],
  prefixList: (number | null)[],
  prefixStatusMap: Record<number, Status> = {},
  sourceStatusMap: Record<number, Status> = {}
) => {
  // 1. 建立上排：原始陣列 (Source)
  const sourceBoxes = createBoxes(sourceList, {
    startX: 50,
    startY: 130,
    gap: 70,
    overrideStatusMap: sourceStatusMap,
    getDescription: (_item, index) => `A[${index}]`,
  });

  // 2. 建立下排：前綴和陣列 (Prefix)
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
      box.setStatus(Status.Inactive);
    } 
    // 2. 如果數值已計算，且不在 map 中 (createBoxes 沒設定到狀態)
    //    預設為 Status.Unfinished (藍色)，代表已存檔
    else if (!prefixStatusMap[i]) {
      box.setStatus(Status.Unfinished);
    }
    // 3. 如果在 map 中 (例如 target/complete/prepare)，已經設置完畢不用動
  });

  // 4. 合併兩排元素回傳
  return [...sourceBoxes, ...prefixBoxes];
};

export function createPrefixSumAnimationSteps(
  inputData: any[],
  action?: any
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

  if (action && action.range && Array.isArray(action.range)) {
    const [L, R] = action.range;

    if (L < 0 || R >= n || L > R) {
      return steps;
    }

    const allCompleteMap: Record<number, Status> = {};
    for (let k = 0; k < n; k++) allCompleteMap[k] = Status.Complete;

    steps.push({
      stepNumber: 0,
      description: `開始查詢：計算區間 [${L}, ${R}] 的總和`,
      actionTag: TAGS.QUERY_START,
      variables: { L, R },
      elements: generateFrame(sourceData, prefixArrForQuery, allCompleteMap),
    });

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
        [R]: Status.Target,
      }),
    });

    const valR = prefixArrForQuery[R]!;
    
    if (L > 0) {
      const valL_1 = prefixArrForQuery[L - 1]!;
      
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
          [R]: Status.Target,
          [L - 1]: Status.Prepare,
        }),
      });

      const result = valR - valL_1;
      const resultMap: Record<number, Status> = { ...allCompleteMap, [R]: Status.Target, [L - 1]: Status.Prepare };
      
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
      steps.push({
        stepNumber: 2,
        description: `步驟 2：因為 L = 0，不需要減去任何前綴`,
        actionTag: TAGS.QUERY_ELSE,
        variables: { L },
        elements: generateFrame(sourceData, prefixArrForQuery, {
          ...allCompleteMap,
          [R]: Status.Target,
        }),
      });

      steps.push({
        stepNumber: 3,
        description: `直接回傳：P[${R}] = ${valR}`,
        actionTag: TAGS.QUERY_RETURN_DIRECT,
        variables: { result: valR },
        elements: generateFrame(sourceData, prefixArrForQuery, {
          ...allCompleteMap,
          [R]: Status.Target,
        }),
      });
    }

    return steps;
  }

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
      elements: generateFrame(sourceData, prefixArr, { 0: Status.Complete }, { 0: Status.Target }),
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
        { [i - 1]: Status.Prepare }, 
        { [i]: Status.Target }
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
        { [i]: Status.Complete }, 
        {}
      ),
    });
  }

  const finalCompleteMap: Record<number, Status> = {};
  for (let k = 0; k < n; k++) finalCompleteMap[k] = Status.Complete;

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
      
      [TAGS.QUERY_GET_L]: [13, 14],      
      [TAGS.QUERY_RETURN_SUB]: [15],     
      
      [TAGS.QUERY_ELSE]: [13, 16],       
      [TAGS.QUERY_RETURN_DIRECT]: [17],  
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

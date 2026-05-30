import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { PrefixSumActionBar } from "./PrefixSumActionBar";
import { LinearData } from "@/data/DataStructure/linear/utils";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import { simulatePrefixSumTrace } from "./prefixSum/simulateTrace";
import { prefixSumTraceToSteps } from "./prefixSum/traceToSteps";
import { TAGS, PrefixSumStatusConfig } from "./prefixSum/tags";

const prefixSumActionHandler = createLinearActionHandler({
  randomValueRange: [0, 100],
});

export function createPrefixSumAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  const trace = simulatePrefixSumTrace(inputData as LinearData[], action);
  return prefixSumTraceToSteps(trace);
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
      [TAGS.BUILD_UPDATE]: [6],
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
  i18nNamespace: "tutorials/prefix-sum",
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
  statusConfig: PrefixSumStatusConfig,
  actionHandler: prefixSumActionHandler,
  renderActionBar: (props) => <PrefixSumActionBar {...(props as any)} />,
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
  maxNodes: 15,
};

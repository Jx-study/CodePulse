import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig, AlgoActionBarProps } from "@/types/implementation";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import type { LinearData } from "@/data/DataStructure/linear/utils";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";

import { FibonacciDPActionBar } from "./fibonacciActionBar";
import { TAGS } from "./fibonacci/tags";
import { simulateFibonacciDPTrace } from "./fibonacci/simulateTrace";
import { fibonacciDPTraceToSteps } from "./fibonacci/traceToSteps";

const baseActionHandler = createLinearActionHandler();

function fibonacciDPActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: LinearData[],
  context: ActionContext,
): ActionResult<LinearData[]> | null {
  if (actionType === "run") {
    let n = (payload.n as number | undefined) ?? 6;
    n = Math.min(Math.max(n, 1), 12);
    return {
      animationData: data,
      animationParams: { n },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }
  return baseActionHandler(actionType, payload, data, context);
}

interface FibonacciDPRunAction {
  n?: number;
  animationParams?: { n?: number };
  payload?: { n?: number };
}

function createFibonacciDPAnimationSteps(
  _dataList: LinearData[],
  action?: FibonacciDPRunAction,
): AnimationStep[] {
  const targetN =
    action?.n ?? action?.animationParams?.n ?? action?.payload?.n ?? 6;
  const trace = simulateFibonacciDPTrace(targetN);
  return fibonacciDPTraceToSteps(trace);
}

const fibonacciDPCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure FibonacciDP(n):
  dp ← Array of size n + 1
  dp[0] ← 0
  dp[1] ← 1
  
  For i ← 2 To n Do
    dp[i] ← dp[i - 1] + dp[i - 2]
  End For
  
  Return dp[n]
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2],
      [TAGS.BASE_CASES]: [3, 4],
      [TAGS.CALC_PREPARE]: [6],
      [TAGS.CALC_DONE]: [7],
      [TAGS.DONE]: [10],
    },
  },
  python: {
    content: `def fibonacci_dp(n):
    dp = [0] * (n + 1)
    dp[0] = 0
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
        
    return dp[n]`,
  },
};

export const fibonacciDPConfig: LevelImplementationConfig = {
  id: "fibonacciDP",
  type: "algorithm",
  name: "費氏數列 (DP 陣列版)",
  categoryName: "動態規劃 (Dynamic Programming)",
  description: "展示使用 1D 陣列（由底向上）的狀態轉移過程",
  codeConfig: fibonacciDPCodeConfig,
  complexity: {
    timeBest: "O(n)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(n)",
  },
  introduction: { key: "introduction" },
  defaultData: [],
  createAnimationSteps: createFibonacciDPAnimationSteps,
  actionHandler: fibonacciDPActionHandler,
  renderActionBar: (props) => <FibonacciDPActionBar {...(props as AlgoActionBarProps)} />,
  relatedProblems: [
    {
      id: 70,
      title: "Climbing Stairs",
      concept: "一維動態規劃基礎：狀態轉移方程與費氏數列完全相同",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/climbing-stairs/",
    },
    {
      id: 1137,
      title: "N-th Tribonacci Number",
      concept: "狀態延伸：依賴前三個狀態的動態規劃",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/n-th-tribonacci-number/",
    },
  ],
  maxNodes: 12,
  i18nNamespace: "tutorials/fibonacci-dp",
};

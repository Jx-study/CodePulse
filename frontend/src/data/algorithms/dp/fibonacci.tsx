import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
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
  payload: any,
  data: any[],
  context: any,
) {
  if (actionType === "run") {
    let n = (payload.n as number) ?? 6;
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

export function createFibonacciDPAnimationSteps(
  dataList: any[],
  action?: any,
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
    if n <= 1:
        return n
        
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
  introduction:
    "費氏數列除了使用遞迴，更有效率的方式是使用「動態規劃 (Bottom-Up DP)」。\n我們建立一個一維陣列來記錄每個子問題的最佳解 (狀態)，從左掃描到右，每個格子都依賴前兩個格子的運算結果。這種將時間複雜度從 O(2^n) 降至 O(n) 的技巧稱為「空間換取時間 (Tabulation)」。",
  defaultData: [],
  createAnimationSteps: createFibonacciDPAnimationSteps,
  actionHandler: fibonacciDPActionHandler,
  renderActionBar: (props) => <FibonacciDPActionBar {...(props as any)} />,
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
};

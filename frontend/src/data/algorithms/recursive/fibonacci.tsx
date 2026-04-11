import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";

import { FibonacciActionBar } from "./fibonacciActionBar";
import { TAGS } from "./fibonacci/tags";
import { simulateFibonacciTrace } from "./fibonacci/simulateTrace";
import { fibonacciTraceToSteps } from "./fibonacci/traceToSteps";

const baseActionHandler = createLinearActionHandler();

function fibonacciActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: any[],
  context: ActionContext,
): ActionResult<any[]> | null {
  if (actionType === "fibonacci" || actionType === "run") {
    let n = (payload.n as number) ?? 4;
    n = Math.min(Math.max(n, 1), 6);
    return {
      animationData: data,
      animationParams: { n },
      isResetAction: true,
    };
  }
  return baseActionHandler(actionType, payload, data, context);
}

export function createFibonacciAnimationSteps(
  dataList: any[],
  action?: any,
): AnimationStep[] {
  const targetN =
    action?.n ?? action?.animationParams?.n ?? action?.payload?.n ?? 4;
  const trace = simulateFibonacciTrace(targetN);
  return fibonacciTraceToSteps(trace);
}

const fibonacciCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure Fibonacci(n):
  If n ≤ 1 Then
    Return n
  End If
  
  left ← Fibonacci(n - 1)
  right ← Fibonacci(n - 2)
  
  Return left + right
End Procedure`,
    mappings: {
      [TAGS.FIB_CALL]: [1],
      [TAGS.FIB_BASE]: [2, 3],
      [TAGS.FIB_CALC]: [6, 7, 9],
    },
  },
  python: {
    content: `def fibonacci(n):
    if n <= 1:
        return n
        
    left = fibonacci(n - 1)
    right = fibonacci(n - 2)
    
    return left + right`,
  },
};

export const fibonacciRecursiveConfig: LevelImplementationConfig = {
  id: "fibonacciRecursive",
  type: "algorithm",
  name: "費氏數列 (遞迴樹版)",
  categoryName: "遞迴與分治法",
  description: "展示 Top-Down 遞迴呼叫時，指數級增長的樹狀結構",
  codeConfig: fibonacciCodeConfig,
  complexity: {
    timeBest: "O(2^n)",
    timeAverage: "O(2^n)",
    timeWorst: "O(2^n)",
    space: "O(n)", // 呼叫堆疊的深度
  },
  introduction:
    "遞迴（Recursion）是將大問題切割成小問題來解決的策略。在這個視覺化中，你可以清楚地看到每一個函數呼叫是如何將狀態保留在「呼叫堆疊 (Call Stack)」中，直到最底層的 Base Case 回傳後，再一層一層地將結果合併上來。\n\n⚠️ 注意觀察：你會發現很多相同的節點（例如 f(2)）被重複計算了非常多次，這就是為什麼這個演算法的時間複雜度會高達可怕的 O(2^n)！",
  defaultData: [],
  createAnimationSteps: createFibonacciAnimationSteps,
  actionHandler: fibonacciActionHandler,
  renderActionBar: (props) => <FibonacciActionBar {...(props as any)} />,
  relatedProblems: [
    {
      id: 509,
      title: "Fibonacci Number",
      concept: "理解遞迴的基礎結構與重複子問題的痛點",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/fibonacci-number/",
    },
  ],
  maxNodes: 35, // fib(6) 會產生 25 個節點
};

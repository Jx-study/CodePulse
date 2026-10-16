import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig, AlgoActionBarProps } from "@/types/implementation";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import type { LinearData } from "@/data/DataStructure/linear/utils";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";

import { FactorialActionBar } from "./FactorialActionBar";
import { TAGS } from "./tags";
import { simulateFactorialTrace } from "./simulateTrace";
import { factorialTraceToSteps } from "./traceToSteps";

const baseActionHandler = createLinearActionHandler();

function factorialActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: LinearData[],
  context: ActionContext,
): ActionResult<LinearData[]> | null {
  if (actionType === "run" || actionType === "factorial") {
    let n = (payload.n as number) ?? 5;
    n = Math.min(Math.max(n, 1), 10);
    return {
      animationData: data,
      animationParams: { n },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }
  return baseActionHandler(actionType, payload, data, context);
}

interface FactorialRunAction {
  n?: number;
  animationParams?: { n?: number };
}

function createFactorialAnimationSteps(
  _dataList: LinearData[],
  action?: FactorialRunAction,
): AnimationStep[] {
  const targetN = action?.n ?? action?.animationParams?.n ?? 5;
  const trace = simulateFactorialTrace(targetN);
  return factorialTraceToSteps(trace);
}

const factorialCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure Factorial(n):
  If n ≤ 1 Then
    Return 1
  End If
  
  childResult ← Factorial(n - 1)
  result ← n * childResult
  
  Return result
End Procedure`,
    mappings: {
      [TAGS.PUSH_START]: [1],
      [TAGS.PUSH_ASSIGN]: [6],
      [TAGS.BASE_CASE]: [2, 3],
      [TAGS.CALC_START]: [6],
      [TAGS.CALC_MULTIPLY]: [7],
      [TAGS.POP_RIGHT]: [9],
    },
  },
  python: {
    content: `def factorial(n):
    if n <= 1:
        return 1
        
    child_result = factorial(n - 1)
    result = n * child_result
    
    return result`,
    lineComplexity: [
      { lineNumber: 1, complexity: 'O(n)' },   // def factorial(n):
      { lineNumber: 2, complexity: 'O(1)' },   // if n <= 1:
      { lineNumber: 3, complexity: 'O(1)' },   // return 1
      { lineNumber: 5, complexity: 'O(n)' },   // child_result = factorial(n - 1)
      { lineNumber: 6, complexity: 'O(1)' },   // result = n * child_result
      { lineNumber: 8, complexity: 'O(1)' },   // return result
    ],
  },
};

export const factorialConfig: LevelImplementationConfig = {
  id: "factorial",
  type: "algorithm",
  name: "階乘橫向堆疊 (遞迴版)",
  categoryName: "遞迴與分治法",
  description: "展示由右向左生長的 Call Stack 運作機制與累乘回溯。",
  codeConfig: factorialCodeConfig,
  complexity: {
    timeBest: "O(n)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(n)",
  },
  introduction: { key: "introduction" },
  defaultData: [],
  createAnimationSteps: createFactorialAnimationSteps,
  actionHandler: factorialActionHandler,
  renderActionBar: (props) => <FactorialActionBar {...(props as AlgoActionBarProps)} />,
  i18nNamespace: "tutorials/factorial",
  maxNodes: 10,
};

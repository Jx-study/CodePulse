import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
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
  data: any[],
  context: ActionContext,
): ActionResult<any[]> | null {
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

export function createFactorialAnimationSteps(
  _dataList: any[],
  action?: any,
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
  introduction:
    "階乘 (N!) 是學習遞迴最好的入門磚！\n\n觀察畫面的橫向生長，你會發現電腦在執行遞迴時，會建立一個「呼叫堆疊 (Call Stack)」。新呼叫會不斷自右向左推入，直到觸發最左側的 Base Case 後，才會雙雙標亮鄰近方塊，將數值依序往右乘回去並退場！",
  defaultData: [],
  createAnimationSteps: createFactorialAnimationSteps,
  actionHandler: factorialActionHandler,
  renderActionBar: (props) => <FactorialActionBar {...(props as any)} />,
  maxNodes: 10,
};

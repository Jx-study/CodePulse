import type { AnimationStep, CodeConfig } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import { KnapsackActionBar } from "@/data/algorithms/dp/KnapsackActionBar";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { cloneData } from "@/modules/core/visualization/visualizationUtils";
import { simulateKnapsackTrace, KnapsackItem } from "./knapsack/simulateTrace";
import { knapsackTraceToSteps } from "./knapsack/traceToSteps";
import { TAGS, KnapsackStatusConfig } from "./knapsack/tags";

function knapsackActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: KnapsackItem[],
  context: ActionContext,
): ActionResult<KnapsackItem[]> | null {
  if (actionType === "load") {
    const raw = payload.data as string;
    if (!raw?.startsWith("KNAPSACK:")) return null;

    const parts = raw.split(":");
    if (parts.length < 3) return null;

    const capacity = parseInt(parts[1], 10);
    const itemStr = parts.slice(2).join(":");
    const items: KnapsackItem[] = itemStr
      .split(",")
      .map((pair) => {
        const [w, v] = pair.trim().split(/\s+/).map(Number);
        return { weight: w, value: v };
      })
      .filter((item) => !isNaN(item.weight) && !isNaN(item.value));

    if (items.length === 0) return null;

    return {
      animationData: items,
      animationParams: { capacity },
      isResetAction: true,
      useRawAnimationParams: true, // 確保 capacity 參數不被 isResetAction 重置
    };
  }

  if (actionType === "reset") {
    return {
      animationData: cloneData(context.defaultData as KnapsackItem[]),
      isResetAction: true,
    };
  }

  if (actionType === "run") {
    return {
      animationData: cloneData(data),
      animationParams: payload,
    };
  }

  return null;
}

export function createKnapsackAnimationSteps(
  inputData: any,
  action?: any,
): AnimationStep[] {
  const trace = simulateKnapsackTrace(inputData as KnapsackItem[], action);
  return knapsackTraceToSteps(trace);
}

const knapsackCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure Knapsack(capacity, weights, values, numItems):
  For itemIdx from 0 to numItems:
    For currCapacity from 0 to capacity:
      If itemIdx = 0 or currCapacity = 0 Then
        dp[itemIdx][currCapacity] ← 0
      Else
        currentWeight ← weights[itemIdx-1]
        currentValue ← values[itemIdx-1]
        
        If currentWeight ≤ currCapacity Then
          skipValue ← dp[itemIdx-1][currCapacity]
          takeValue ← dp[itemIdx-1][currCapacity-currentWeight] + currentValue
          dp[itemIdx][currCapacity] ← max(skipValue, takeValue)
        Else
          dp[itemIdx][currCapacity] ← dp[itemIdx-1][currCapacity]
        End If
      End If
    End For
  End For
  Return dp[numItems][capacity]
End Procedure`,
    mappings: {
      [TAGS.INIT]: [3, 4, 5],
      [TAGS.CHECK_WEIGHT]: [7, 8, 10],
      [TAGS.TAKE_ITEM]: [11, 12, 13],
      [TAGS.SKIP_ITEM]: [14, 15],
      [TAGS.DONE]: [20],
    },
  },
  python: {
    content: `def knapsack(capacity, weights, values, num_items):
    dp = [[0 for _ in range(capacity + 1)] for _ in range(num_items + 1)]
    
    for item_idx in range(1, num_items + 1):
        for curr_capacity in range(1, capacity + 1):
            current_weight = weights[item_idx-1]
            current_value = values[item_idx-1]
            
            if current_weight <= curr_capacity:
                skip_val = dp[item_idx-1][curr_capacity]
                take_val = dp[item_idx-1][curr_capacity-current_weight] + current_value
                dp[item_idx][curr_capacity] = max(skip_val, take_val)
            else:
                dp[item_idx][curr_capacity] = dp[item_idx-1][curr_capacity]
                
    return dp[num_items][capacity]`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(n^2)' },                                // def knapsack(capacity, weights, values, num_items):
      { lineNumber: 2,  complexity: 'O(n^2)' },                                // dp = [[0 for _ in range(...)] for _ in range(...)]
      { lineNumber: 4,  complexity: 'O(n)' },                                  // for item_idx in range(1, num_items + 1):
      { lineNumber: 5,  complexity: 'O(n)', context: 'O(n)' },                 // for curr_capacity in range(1, capacity + 1):
      { lineNumber: 6,  complexity: 'O(1)', context: 'O(n^2)' },               // current_weight = weights[item_idx-1]
      { lineNumber: 7,  complexity: 'O(1)', context: 'O(n^2)' },               // current_value = values[item_idx-1]
      { lineNumber: 9,  complexity: 'O(1)', context: 'O(n^2)' },               // if current_weight <= curr_capacity:
      { lineNumber: 10, complexity: 'O(1)', context: 'O(n^2)' },               // skip_val = dp[item_idx-1][curr_capacity]
      { lineNumber: 11, complexity: 'O(1)', context: 'O(n^2)' },               // take_val = dp[item_idx-1][...] + current_value
      { lineNumber: 12, complexity: 'O(1)', context: 'O(n^2)' },               // dp[item_idx][curr_capacity] = max(...)
      { lineNumber: 13, complexity: 'O(1)', context: 'O(n^2)' },               // else:
      { lineNumber: 14, complexity: 'O(1)', context: 'O(n^2)' },               // dp[item_idx][curr_capacity] = dp[item_idx-1][...]
      { lineNumber: 16, complexity: 'O(1)' },                                  // return dp[num_items][capacity]
    ],
  },
};

export const knapsackConfig: LevelImplementationConfig = {
  id: "knapsack",
  type: "algorithm",
  name: "0/1 背包問題",
  categoryName: "動態規劃 (DP)",
  description: "給定物品的重量與價值，在背包容量限制下找出最大總價值。",
  i18nNamespace: "tutorials/knapsack",
  codeConfig: knapsackCodeConfig,
  complexity: {
    timeBest: "O(numItems * capacity)",
    timeAverage: "O(numItems * capacity)",
    timeWorst: "O(numItems * capacity)",
    space: "O(numItems * capacity)", // 可優化為 O(capacity) 但此處展示二維
  },
  introduction: `0/1 背包問題是動態規劃的經典問題。每個物品只有「拿（1）」或「不拿（0）」兩種選擇。我們定義 dp[itemIdx][currCapacity] 為：在只考慮前 itemIdx 個物品，且背包容量為 currCapacity 的情況下，能裝入的最大價值。透過逐列填表，我們可以找到最佳解。`,
  defaultData: [
    { weight: 1, value: 15 },
    { weight: 3, value: 20 },
    { weight: 4, value: 30 },
  ],
  actionHandler: knapsackActionHandler,
  createAnimationSteps: createKnapsackAnimationSteps,
  renderActionBar: (props) => <KnapsackActionBar {...(props as any)} />,
  statusConfig: KnapsackStatusConfig,
  maxNodes: 6,
  realWorldStories: [
    {
      id: "knapsack-business-optimization",
      video: {
        url: "https://youtu.be/cxn3YbMN3IU",
        duration: "08:42",
      },
      resources: [
        {
          type: "article",
          url: "https://crescointl.com/",
        },
        {
          type: "article",
          url: "https://courses.csail.mit.edu/6.006/fall11/rec/rec21_knapsack.pdf",
        },
        {
          type: "article",
          url: "https://www.researchgate.net/publication/341432555_A_Robust_Knapsack_Based_Constrained_Portfolio_Optimization",
        },
      ],
    },
    {
      id: "knapsack-investment-game",
      interactiveGame: { type: "knapsack-investment-game" },
    },
  ],
  relatedProblems: [
    {
      id: 416,
      title: "Partition Equal Subset Sum",
      concept: "relatedProblems.416",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/partition-equal-subset-sum/",
    },
    {
      id: 494,
      title: "Target Sum",
      concept: "relatedProblems.494",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/target-sum/",
    },
    {
      id: 1049,
      title: "Last Stone Weight II",
      concept: "relatedProblems.1049",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/last-stone-weight-ii/",
    },
    {
      id: 474,
      title: "Ones and Zeroes",
      concept: "relatedProblems.474",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/ones-and-zeroes/",
    },
  ],
};

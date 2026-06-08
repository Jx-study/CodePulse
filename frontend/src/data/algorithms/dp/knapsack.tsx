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
      title: "從金庫大盜到百萬美金：背包演算法的決策藝術",
      category: "商業與科技",
      tags: ["背包問題", "資源分配", "動態規劃", "投資組合優化", "商業思維"],
      content: `【痛點引發】現實中的選擇困難症
每一家企業在營運時，核心都圍繞著一個難題——「資源分配」。預算、庫存、時間與人力永遠都是有限的。想像你是一位產品經理，手上有 5 個潛在的高利潤研發項目，但預算只夠投資其中 3 個。或者在物流領域，貨車空間有限，面對重量與利潤不一的貨物，憑直覺亂塞可能會浪費大量的利潤空間。這些看似各自獨立的商業選擇題，在數學家眼中其實都是典型的「背包問題（Knapsack Problem）」。

【邏輯拆解】金庫大盜的生存指南
要理解這個概念，可以想像你是一個潛入金庫的大盜，背包容量只有 S 磅，只要裝超過這個重量背包就會破掉。面對每一件寶物，你只能做最簡單的二進位決策：「拿（1）」或「不拿（0）」。如果你只用「貪婪演算法」單純先拿單價最貴的，可能會因為它佔用過多空間而錯失整體最佳解。相反地，透過「動態規劃（Dynamic Programming, DP）」建立 dp[itemIdx][currCapacity] 表格，比較把物品放進背包與不放進背包哪一個獲利更大，就能一步步推導出整體的最佳解。

【高階應用】百萬美金的整數難題
當背包模型套用到真實的金融資產配置時，會遇到更複雜的痛點。傳統連續變數模型可能會告訴你「買 0.588 股」，但現實中投資如 Amazon 或 Google 等高價股時，交易必須是「整數」。升級版的背包演算法不僅能解決這類「整數難題」，還能加入「類別限制」（如限制能源股比例）等進階約束以避免投資過度集中。更重要的是，金融市場充滿波動，引入「魯棒優化（Robust Optimization）」技術後，演算法能考慮最壞情況，幫你找到最穩健的資產配置。

【結論與擴展】演算法是你的決策助手
背包問題不只是一個理論，它已經成為驅動現代商業的最佳化引擎。不管是行銷部門在固定預算下決定如何投放廣告，還是製造業在材料限制下安排生產線，0/1 背包演算法都是隱藏在幕後的功臣。掌握它，你就掌握了在資源有限的情況下，做出最優決策的藝術。`,
      video: {
        url: "https://youtu.be/cxn3YbMN3IU",
        title: "選擇的藝術：從商業痛點到背包演算法",
        duration: "08:42",
      },
      resources: [
        {
          type: "article",
          url: "https://crescointl.com/",
          title: "The Knapsack Problem in Business Optimization",
          source: "Cresco International",
        },
        {
          type: "article",
          url: "https://courses.csail.mit.edu/6.006/fall11/rec/rec21_knapsack.pdf",
          title: "6.006 Introduction to Algorithms: The Knapsack Problem",
          source: "MIT",
        },
        {
          type: "article",
          url: "https://www.researchgate.net/publication/341432555_A_Robust_Knapsack_Based_Constrained_Portfolio_Optimization",
          title: "A Robust Knapsack Based Constrained Portfolio Optimization",
          source: "IJE",
        },
      ],
    },
    {
      id: "knapsack-investment-game",
      title: "首席投資官：資金保衛戰",
      category: "互動遊戲",
      tags: ["0/1背包", "動態規劃", "資源分配", "貪婪陷阱"],
      content: `【遊戲說明】
你是一家投資公司的首席投資官（CIO）。
左側是可投資的標的，右側是你的投資組合。

【規則】
• 點擊標的將其加入/移出投資組合
• 資金有限，超出預算的標的無法選取
• 目標：找到讓總報酬最大化的最佳組合

【挑戰】
AI 貪婪策略永遠選「單位報酬最高」的項目——但這不保證整體最優。
你能找到比貪婪更好的組合嗎？`,
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

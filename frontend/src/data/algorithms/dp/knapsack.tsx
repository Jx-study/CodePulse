import type { AnimationStep, CodeConfig } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Box } from "@/modules/core/DataLogic/Box";
import { KnapsackActionBar } from "@/data/algorithms/dp/KnapsackActionBar";

const TAGS = {
  INIT: "INIT",
  OUTER_LOOP: "OUTER_LOOP",
  INNER_LOOP: "INNER_LOOP",
  CHECK_WEIGHT: "CHECK_WEIGHT",
  TAKE_ITEM: "TAKE_ITEM",
  SKIP_ITEM: "SKIP_ITEM",
  DONE: "DONE",
};

export function createKnapsackAnimationSteps(
  inputData: any,
  action?: any,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  // 預期 inputData 是一個陣列 [{ weight: 2, value: 3 }, ...]
  const items = Array.isArray(inputData) ? inputData : [];
  if (items.length === 0) return steps;

  // 背包總容量 (預設給 5)
  const capacity = action?.capacity ?? 5;
  const n = items.length;

  // 初始化 DP 表格與狀態
  const dp: number[][] = Array(n + 1)
    .fill(0)
    .map(() => Array(capacity + 1).fill(0));
  const statusMap: Record<string, Status> = {};

  const startX = 120;
  const startY = 120;
  const boxW = 55;
  const boxH = 45;

  const recordStep = (desc: string, tag: string) => {
    const elements: Box[] = [];

    // 1. 畫出 Col Header (背包容量 0~W)
    for (let w = 0; w <= capacity; w++) {
      const colHeader = new Box();
      colHeader.id = `header-col-${w}`;
      colHeader.value = String(w);
      colHeader.description = w === 0 ? "容量 W" : "";
      colHeader.moveTo(startX + w * boxW, startY - boxH);
      colHeader.width = boxW;
      colHeader.height = boxH;
      colHeader.setStatus(Status.Inactive);
      colHeader.borderStyle = "dashed";
      elements.push(colHeader);
    }

    // 2. 畫出 Row Header (物品 1~N)
    for (let i = 1; i <= n; i++) {
      const rowHeader = new Box();
      rowHeader.id = `header-row-${i}`;
      rowHeader.value = `w:${items[i - 1].weight}, v:${items[i - 1].value}`;
      rowHeader.description = `Item ${i}`;
      rowHeader.moveTo(startX - boxW * 1.5, startY + i * boxH);
      rowHeader.width = boxW * 1.2;
      rowHeader.height = boxH;
      rowHeader.setStatus(Status.Inactive);
      rowHeader.borderStyle = "dashed";
      elements.push(rowHeader);
    }

    // 3. 畫出 DP 二維表格
    for (let i = 0; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        const cell = new Box();
        const key = `${i}-${w}`;
        cell.id = `dp-${key}`;

        // 如果是 0 行或 0 列，預設顯示 0
        if (i === 0 || w === 0) {
          cell.value = "0";
          cell.setStatus(Status.Inactive);
        } else {
          // 還沒算到的格子顯示空白，算到的顯示 dp 值
          cell.value =
            dp[i][w] !== undefined && statusMap[key] !== Status.Unfinished
              ? String(dp[i][w])
              : "";
          cell.setStatus(statusMap[key] || Status.Unfinished);
        }

        cell.moveTo(startX + w * boxW, startY + i * boxH);
        cell.width = boxW;
        cell.height = boxH;
        elements.push(cell);
      }
    }

    steps.push({
      stepNumber: steps.length,
      description: desc,
      actionTag: tag,
      elements,
      variables: {
        "背包總容量 (W)": capacity,
        "目前物品 (i)": "N/A",
        "目前容量 (w)": "N/A",
      },
    });
  };

  // 演算法開始

  // 初始化表格狀態
  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      statusMap[`${i}-${w}`] = Status.Unfinished;
    }
  }

  recordStep(
    `初始化 DP 表格，dp[0][w] 和 dp[i][0] 皆為 0 (沒有物品或沒有容量時價值為 0)。`,
    TAGS.INIT,
  );

  for (let i = 1; i <= n; i++) {
    const currentItem = items[i - 1];
    const weight = currentItem.weight;
    const value = currentItem.value;

    for (let w = 1; w <= capacity; w++) {
      statusMap[`${i}-${w}`] = Status.Target; // 當前計算格子

      const stepVars = {
        "背包總容量 (W)": capacity,
        "目前物品 (i)": i,
        "目前容量 (w)": w,
        物品重量: weight,
        物品價值: value,
      };

      // 稍微改寫 recordStep 讓它可以吃 stepVars，這裡為了簡單先直接複寫上一步的 variables
      recordStep(
        `開始計算 dp[${i}][${w}]：考慮是否放入第 ${i} 個物品 (重量 ${weight}, 價值 ${value})。`,
        TAGS.INNER_LOOP,
      );
      steps[steps.length - 1].variables = stepVars;

      if (weight > w) {
        // 放不下
        dp[i][w] = dp[i - 1][w];
        statusMap[`${i - 1}-${w}`] = Status.Inactive; // 標示參考來源

        recordStep(
          `物品重量 (${weight}) > 目前容量 (${w})，放不下！繼承上一列的值：dp[${i}][${w}] = dp[${i - 1}][${w}] = ${dp[i][w]}`,
          TAGS.SKIP_ITEM,
        );
        steps[steps.length - 1].variables = stepVars;

        delete statusMap[`${i - 1}-${w}`]; // 算完取消參考標示
      } else {
        // 放得下，取 max(不放, 放)
        const skipValue = dp[i - 1][w];
        const takeValue = dp[i - 1][w - weight] + value;

        statusMap[`${i - 1}-${w}`] = Status.Inactive; // 參考不放
        statusMap[`${i - 1}-${w - weight}`] = Status.Prepare; // 參考放

        recordStep(
          `放得下！比較「不放」(價值 ${skipValue}) 與「放」(價值 ${dp[i - 1][w - weight]} + ${value} = ${takeValue})，取最大值。`,
          TAGS.TAKE_ITEM,
        );
        steps[steps.length - 1].variables = stepVars;

        dp[i][w] = Math.max(skipValue, takeValue);

        delete statusMap[`${i - 1}-${w}`];
        delete statusMap[`${i - 1}-${w - weight}`];
      }

      statusMap[`${i}-${w}`] = Status.Complete; // 填表完成
    }
  }

  recordStep(
    `填表完成！最大總價值為 dp[${n}][${capacity}] = ${dp[n][capacity]}。`,
    TAGS.DONE,
  );

  return steps;
}

const knapsackCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure Knapsack(W, weights, values, n):
  For i from 0 to n:
    For w from 0 to W:
      If i == 0 or w == 0 Then
        dp[i][w] ← 0
      Else If weights[i-1] <= w Then
        dp[i][w] ← max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1])
      Else
        dp[i][w] ← dp[i-1][w]
  Return dp[n][W]`,
    mappings: {
      [TAGS.INIT]: [3, 4],
      [TAGS.OUTER_LOOP]: [2],
      [TAGS.INNER_LOOP]: [3],
      [TAGS.CHECK_WEIGHT]: [5],
      [TAGS.TAKE_ITEM]: [6],
      [TAGS.SKIP_ITEM]: [8],
      [TAGS.DONE]: [9],
    },
  },
  python: {
    content: `def knapsack(W, weights, values, n):
    dp = [[0 for x in range(W + 1)] for x in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(1, W + 1):
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i-1][w], 
                             dp[i-1][w-weights[i-1]] + values[i-1])
            else:
                dp[i][w] = dp[i-1][w]
                
    return dp[n][W]`,
  },
};

export const knapsackConfig: LevelImplementationConfig = {
  id: "knapsack",
  type: "algorithm",
  name: "0/1 背包問題",
  categoryName: "動態規劃 (DP)",
  description: "給定物品的重量與價值，在背包容量限制下找出最大總價值。",
  codeConfig: knapsackCodeConfig,
  complexity: {
    timeBest: "O(N*W)",
    timeAverage: "O(N*W)",
    timeWorst: "O(N*W)",
    space: "O(N*W)", // 可優化為 O(W) 但此處展示二維
  },
  introduction: `0/1 背包問題是動態規劃的經典問題。每個物品只有「拿（1）」或「不拿（0）」兩種選擇。我們定義 dp[i][w] 為：在只考慮前 i 個物品，且背包容量為 w 的情況下，能裝入的最大價值。透過逐列填表，我們可以找到最佳解。`,
  defaultData: [
    { weight: 1, value: 15 },
    { weight: 3, value: 20 },
    { weight: 4, value: 30 },
  ],
  createAnimationSteps: createKnapsackAnimationSteps,
  renderActionBar: (props) => <KnapsackActionBar {...(props as any)} />,
};

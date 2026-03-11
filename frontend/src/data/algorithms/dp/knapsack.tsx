import type { AnimationStep, CodeConfig } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Box } from "@/modules/core/DataLogic/Box";
import { KnapsackActionBar } from "@/data/algorithms/dp/KnapsackActionBar";
import type { ActionContext, ActionResult } from "@/modules/core/visualization/types";
import { cloneData } from "@/modules/core/visualization/visualizationUtils";

const TAGS = {
  INIT: "INIT",
  CHECK_WEIGHT: "CHECK_WEIGHT",
  TAKE_ITEM: "TAKE_ITEM",
  SKIP_ITEM: "SKIP_ITEM",
  DONE: "DONE",
};

type KnapsackItem = { weight: number; value: number };

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

  const startX = 0;
  const startY = 0;
  const boxW = 50;
  const boxH = 50;

  const recordStep = (desc: string, tag: string, stepVars?: Record<string, any>) => {
    const elements: Box[] = [];

    // 畫出表格最上方的 Header (Row -1)
    // 左側三個固定標題
    const headerVal = new Box();
    headerVal.id = "header-title-val";
    headerVal.value = "V";
    headerVal.moveTo(startX - boxW * 2.5, startY - boxH);
    headerVal.width = boxW;
    headerVal.height = boxH;
    headerVal.setStatus(Status.Inactive);
    elements.push(headerVal);

    const headerWt = new Box();
    headerWt.id = "header-title-wt";
    headerWt.value = "W";
    headerWt.moveTo(startX - boxW * 3.5, startY - boxH);
    headerWt.width = boxW;
    headerWt.height = boxH;
    headerWt.setStatus(Status.Inactive);
    elements.push(headerWt);

    const headerItem = new Box();
    headerItem.id = "header-title-item";
    headerItem.value = "I\\C";
    headerItem.moveTo(startX - boxW * 1.25, startY - boxH);
    headerItem.width = boxW * 1.5; // 加寬處理文字長度
    headerItem.height = boxH;
    headerItem.setStatus(Status.Inactive);
    elements.push(headerItem);

    // 右側的背包容量標題 (w = 0 ~ W)
    for (let w = 0; w <= capacity; w++) {
      const colHeader = new Box();
      colHeader.id = `header-col-${w}`;
      colHeader.value = String(w);
      colHeader.moveTo(startX + w * boxW, startY - boxH);
      colHeader.width = boxW;
      colHeader.height = boxH;
      colHeader.setStatus(statusMap[`header-col-${w}`] || Status.Inactive);
      elements.push(colHeader);
    }

    // 畫出左側的物品資訊列 (Row 0 ~ N)
    for (let i = 0; i <= n; i++) {
      // 價值
      const valueBox = new Box();
      valueBox.id = `info-val-${i}`;
      valueBox.value = i === 0 ? "0" : String(items[i - 1].value);
      valueBox.moveTo(startX - boxW * 2.5, startY + i * boxH);
      valueBox.width = boxW;
      valueBox.height = boxH;
      valueBox.setStatus(statusMap[`info-val-${i}`] || Status.Inactive);
      elements.push(valueBox);

      // 重量
      const weightBox = new Box();
      weightBox.id = `info-wt-${i}`;
      weightBox.value = i === 0 ? "0" : String(items[i - 1].weight);
      weightBox.moveTo(startX - boxW * 3.5, startY + i * boxH);
      weightBox.width = boxW;
      weightBox.height = boxH;
      weightBox.setStatus(statusMap[`info-wt-${i}`] || Status.Inactive);
      elements.push(weightBox);

      // 物品 index (i) -> 對齊剛剛加寬的 headerItem
      const itemBox = new Box();
      itemBox.id = `info-item-${i}`;
      itemBox.value = i === 0 ? "0 items" : "item " + String(i);
      itemBox.moveTo(startX - boxW * 1.25, startY + i * boxH);
      itemBox.width = boxW * 1.5; // 跟著加寬，保持欄位對齊
      itemBox.height = boxH;
      itemBox.setStatus(Status.Inactive);
      elements.push(itemBox);
    }

    // 畫出 DP 二維表格
    for (let i = 0; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        const cell = new Box();
        const key = `${i}-${w}`;
        cell.id = `dp-${key}`;

        // 第 0 列與第 0 行初始化為 0
        if (i === 0 || w === 0) {
          cell.value = "0";
          cell.setStatus(statusMap[key] || Status.Inactive);
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
      stepNumber: steps.length + 1,
      description: desc,
      actionTag: tag,
      elements,
      variables: stepVars || { W: capacity, i: 0, w: 0 },
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
    `初始化：建立 DP 表格，當 itemIdx=0 或 currCapacity=0 時，價值皆為 0`,
    TAGS.INIT,
    { capacity, itemIdx: 0, currCapacity: 0 }
  );

  for (let i = 1; i <= n; i++) {
    const currentItem = items[i - 1];
    const weight = currentItem.weight;
    const value = currentItem.value;

    for (let w = 1; w <= capacity; w++) {
      statusMap[`${i}-${w}`] = Status.Target; // 當前計算格子

      const stepVars = {
        capacity,
        itemIdx: i,
        currCapacity: w,
        currentWeight: weight,
        currentValue: value,
        condition: `${weight} <= ${w}`,
      };

      // 第一步：檢查重量 (標亮左側的 Weight 格子)
      statusMap[`info-wt-${i}`] = Status.Prepare;
      statusMap[`header-col-${w}`] = Status.Prepare;
      recordStep(
        `判斷 dp[${i}][${w}]：目前物品重量 (${weight}) 是否放得進目前背包容量 (${w})？`,
        TAGS.CHECK_WEIGHT,
        stepVars
      );
      // 判斷完就取消高亮重量
      delete statusMap[`info-wt-${i}`];
      delete statusMap[`header-col-${w}`];

      // 第二步：處理結果 (標亮左側 Value 以及依賴的格子)
      if (weight > w) {
        // 放不下
        dp[i][w] = dp[i - 1][w];
        statusMap[`${i - 1}-${w}`] = Status.Prepare; // 標示參考來源(上方格子)

        recordStep(
          `物品重量 (${weight}) > 目前容量 (${w})，放不下！繼承上一列的值：dp[${i}][${w}] = dp[${i - 1}][${w}] = ${dp[i][w]}`,
          TAGS.SKIP_ITEM,
          stepVars
        );

        delete statusMap[`${i - 1}-${w}`]; // 算完取消參考標示
      } else {
        // 放得下，取 max(不放, 放)
        statusMap[`info-val-${i}`] = Status.Prepare; // 標示左側的物品價值
        statusMap[`${i - 1}-${w}`] = Status.Prepare; // 參考不放(上方格子)
        statusMap[`${i - 1}-${w - weight}`] = Status.Prepare; // 參考放(左上方格子)

        const skipValue = dp[i - 1][w];
        const takeValue = dp[i - 1][w - weight] + value;
        // 先設定值，讓這一幀的 UI 直接顯示結果
        dp[i][w] = Math.max(skipValue, takeValue);

        recordStep(
          `更新：放得下！dp[${i}][${w}] ← max(skipValue: ${skipValue}, takeValue: ${takeValue}) = ${dp[i][w]}`,
          TAGS.TAKE_ITEM,
          { ...stepVars, skipValue, takeValue }
        );

        delete statusMap[`info-val-${i}`];
        delete statusMap[`${i - 1}-${w}`];
        delete statusMap[`${i - 1}-${w - weight}`];
      }

      if (i === n && w === capacity) {
        statusMap[`${i}-${w}`] = Status.Complete; // 填表完成
      } else {
        delete statusMap[`${i}-${w}`]; // 算完取消目標標示
      }
    }
  }

  recordStep(
    `計算完成！最大總價值為 dp[${n}][${capacity}] = ${dp[n][capacity]}`,
    TAGS.DONE,
    { capacity, itemIdx: n, currCapacity: capacity }
  );

  return steps;
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
  relatedProblems:[
    {
      id: 416,
      title: "Partition Equal Subset Sum",
      concept: "基礎 0/1 背包：判斷是否能將陣列分割成總和相等的兩個子集",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/partition-equal-subset-sum/",
    },
    {
      id: 494,
      title: "Target Sum",
      concept: "0/1 背包變體：透過給予正負號來達成目標和，可轉換為子集求和問題",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/target-sum/",
    },
    {
      id: 1049,
      title: "Last Stone Weight II",
      concept: "0/1 背包應用：將石頭分成兩堆並使其重量差最小化",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/last-stone-weight-ii/",
    },
    {
      id: 474,
      title: "Ones and Zeroes",
      concept: "多維 0/1 背包：在同時限制 0 與 1 的數量下尋找最大子集數量",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/ones-and-zeroes/",
    },
  ],
};

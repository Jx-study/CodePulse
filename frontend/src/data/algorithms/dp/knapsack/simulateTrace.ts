import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS, KnapsackStatus } from "./tags";

export type KnapsackItem = { weight: number; value: number };

export function simulateKnapsackTrace(
  inputData: KnapsackItem[],
  action?: { capacity?: number },
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const items = Array.isArray(inputData) ? inputData : [];
  if (items.length === 0) return trace;

  const capacity = action?.capacity ?? 5;
  const n = items.length;

  const dp: number[][] = Array(n + 1)
    .fill(0)
    .map(() => Array(capacity + 1).fill(0));
  const statusMap: Record<string, string> = {};

  const pushTrace = (tag: string, vars: any) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: items.map((item, idx) => ({
        id: `item-${idx}`,
        value: item.value,
      })),
      meta: {
        capacity,
        n,
        items: items.map((item) => ({ ...item })),
        dp: dp.map((row) => [...row]),
        statusMap: { ...statusMap },
      },
    });
  };

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      statusMap[`${i}-${w}`] = KnapsackStatus.Unfinished;
    }
  }

  pushTrace(TAGS.INIT, { capacity, itemIdx: 0, currCapacity: 0 });

  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1];

    for (let w = 1; w <= capacity; w++) {
      statusMap[`${i}-${w}`] = KnapsackStatus.Target;

      const stepVars = {
        capacity,
        itemIdx: i,
        currCapacity: w,
        currentWeight: weight,
        currentValue: value,
        condition: `${weight} <= ${w}`,
      };

      statusMap[`info-wt-${i}`] = KnapsackStatus.Prepare;
      statusMap[`header-col-${w}`] = KnapsackStatus.Prepare;
      pushTrace(TAGS.CHECK_WEIGHT, stepVars);

      delete statusMap[`info-wt-${i}`];
      delete statusMap[`header-col-${w}`];

      if (weight > w) {
        dp[i][w] = dp[i - 1][w];
        statusMap[`${i - 1}-${w}`] = KnapsackStatus.Skip;

        pushTrace(TAGS.SKIP_ITEM, stepVars);
        delete statusMap[`${i - 1}-${w}`];
      } else {
        statusMap[`info-val-${i}`] = KnapsackStatus.Take;
        statusMap[`${i - 1}-${w}`] = KnapsackStatus.Skip;
        statusMap[`${i - 1}-${w - weight}`] = KnapsackStatus.Take;

        const skipValue = dp[i - 1][w];
        const takeValue = dp[i - 1][w - weight] + value;
        dp[i][w] = Math.max(skipValue, takeValue);

        pushTrace(TAGS.TAKE_ITEM, { ...stepVars, skipValue, takeValue });

        delete statusMap[`info-val-${i}`];
        delete statusMap[`${i - 1}-${w}`];
        delete statusMap[`${i - 1}-${w - weight}`];
      }

      if (i === n && w === capacity) {
        statusMap[`${i}-${w}`] = KnapsackStatus.Complete;
      } else {
        delete statusMap[`${i}-${w}`];
      }
    }
  }

  pushTrace(TAGS.DONE, {
    capacity,
    itemIdx: n,
    currCapacity: capacity,
    finalResult: dp[n][capacity],
  });

  return trace;
}

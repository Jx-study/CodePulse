import type { InvestmentItem } from "@/types/games/knapsackGameTypes";

export const BUDGET_MIN = 3;
export const BUDGET_MAX = 10;
export const BUDGET_DEFAULT = 6;
/** 報酬條固定基準：綠能電廠 value = 7 */
export const MAX_ITEM_VALUE = 7;

export const ITEMS: InvestmentItem[] = [
  { id: 1, name: "科技新創", weight: 2, value: 3, emoji: "💻" },
  { id: 2, name: "商辦大樓", weight: 3, value: 4, emoji: "🏙️" },
  { id: 3, name: "物流倉儲", weight: 4, value: 5, emoji: "🏭" },
  { id: 4, name: "生技研發", weight: 2, value: 4, emoji: "💊" },
  { id: 5, name: "綠能電廠", weight: 5, value: 7, emoji: "🌿" },
  { id: 6, name: "黃金期貨", weight: 1, value: 1, emoji: "🥇" },
];

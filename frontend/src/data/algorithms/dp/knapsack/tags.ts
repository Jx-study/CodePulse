import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  INIT: "INIT",
  CHECK_WEIGHT: "CHECK_WEIGHT",
  TAKE_ITEM: "TAKE_ITEM",
  SKIP_ITEM: "SKIP_ITEM",
  DONE: "DONE",
} as const;

export const KnapsackStatus = {
  Unfinished: Status.Unfinished, // 背包內
  Prepare: Status.Prepare, // 檢查重量
  Target: Status.Target, // 當前目標
  Complete: Status.Complete, // 最終答案
  Inactive: Status.Inactive, // 背包外
  Take: "take", // 放數值參考
  Skip: "skip", // 不放數值參考
} as const;

export const KnapsackStatusConfig: StatusConfig = {
  i18nNs: "tutorials/knapsack",
  statuses: [
    { key: KnapsackStatus.Inactive,   label: "statusLegend.outsideKnapsack", color: "#555555" },
    { key: KnapsackStatus.Unfinished, label: "statusLegend.insideKnapsack",  color: "#1d79cfff" },
    { key: KnapsackStatus.Prepare,    label: "statusLegend.checkingWeight",  color: "#f59e0b" },
    { key: KnapsackStatus.Target,     label: "statusLegend.currentTarget",   color: "#ff6b35" },
    { key: KnapsackStatus.Take,       label: "statusLegend.takeItem",        color: "#10b981" },
    { key: KnapsackStatus.Skip,       label: "statusLegend.skipItem",        color: "#ef4444" },
    { key: KnapsackStatus.Complete,   label: "statusLegend.finalAnswer",     color: "#46f336ff" },
  ],
};

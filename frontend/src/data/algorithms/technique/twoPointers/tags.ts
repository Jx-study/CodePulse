import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  INIT: "INIT",
  // 對向雙指標：兩數之和
  COMPARE: "COMPARE",
  MOVE_LEFT: "MOVE_LEFT",
  MOVE_RIGHT: "MOVE_RIGHT",
  FOUND: "FOUND",
  // 同向雙指標：移除重複元素
  SCAN: "SCAN",
  SKIP_DUPLICATE: "SKIP_DUPLICATE",
  WRITE_UNIQUE: "WRITE_UNIQUE",
  DONE: "DONE",
} as const;

export const TwoPointersStatus = {
  Pending: Status.Unfinished, // 藍色：尚未處理 / 仍在搜尋範圍內
  Excluded: Status.Inactive, // 灰色：已被排除，不可能是答案
  Active: Status.Target, // 橘色：指標目前指向、正在比較的元素
  Duplicate: Status.Prepare, // 黃色：重複值，將被跳過
  Result: Status.Complete, // 綠色：答案 / 已保留的不重複元素
} as const;

export const TwoPointersStatusConfig: StatusConfig = {
  i18nNs: "tutorials/two-pointers",
  statuses: [
    { key: TwoPointersStatus.Pending,   label: "statusLegend.pending",   color: "#1d79cf" },
    { key: TwoPointersStatus.Excluded,  label: "statusLegend.excluded",  color: "#555555" },
    { key: TwoPointersStatus.Active,    label: "statusLegend.active",    color: "#ff6b35" },
    { key: TwoPointersStatus.Duplicate, label: "statusLegend.duplicate", color: "#f59e0b" },
    { key: TwoPointersStatus.Result,    label: "statusLegend.result",    color: "#10b981" },
  ],
};

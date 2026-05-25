import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  INIT: "INIT",
  CHECK_SAFE: "CHECK_SAFE",
  ATTACKED: "ATTACKED",
  PLACE_QUEEN: "PLACE_QUEEN",
  RECURSE: "RECURSE",
  BACKTRACK: "BACKTRACK",
  SUCCESS: "SUCCESS",
  FAIL: "FAIL",
} as const;

export const NQueensStatus = {
  Inactive: Status.Inactive,
  Target: Status.Target,
  Complete: Status.Complete,
  Attacked: "attacked",
  Backtrack: "backtrack",
} as const;

export const NQueensStatusConfig: StatusConfig = {
  statuses: [
    { key: NQueensStatus.Inactive, label: "安全空格", color: "#475569" },
    { key: NQueensStatus.Target, label: "嘗試中", color: "#f59e0b" },
    { key: NQueensStatus.Complete, label: "已放置皇后", color: "#10b981" },
    { key: NQueensStatus.Attacked, label: "被攻擊範圍", color: "#ef4444" },
    { key: NQueensStatus.Backtrack, label: "回溯拔除", color: "#a855f7" },
  ],
};

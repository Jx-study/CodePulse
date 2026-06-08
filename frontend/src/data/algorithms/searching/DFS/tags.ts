import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  INIT: "INIT",
  START: "START",
  POP: "POP",
  SKIP: "SKIP",
  DIST_UPDATE: "DIST_UPDATE",
  CHECK_END: "CHECK_END",
  EXPLORE: "EXPLORE",
  PUSH_NEIGHBOR: "PUSH_NEIGHBOR",
  BACKTRACK: "BACKTRACK",
  PATH_FOUND: "PATH_FOUND",
  NOT_FOUND: "NOT_FOUND",
  GRID_BLOCKED: "GRID_BLOCKED", // 處理起終點是牆壁
} as const;

export const DFSStatus = {
  Inactive: Status.Inactive, // 尚未發現
  Discovered: Status.Prepare, // 已加入 Stack 待探索
  Current: Status.Target, // 當前正在探索
  Visited: Status.Unfinished, // 已探索完畢
  Path: Status.Complete, // 最短路徑/最終解
} as const;

export const DFSStatusConfig: StatusConfig = {
  i18nNs: "tutorials/dfs",
  statuses: [
    { key: DFSStatus.Inactive,    label: "statusLegend.notDiscovered", color: "#555555" },
    { key: DFSStatus.Discovered,  label: "statusLegend.inStack",       color: "#f59e0b" },
    { key: DFSStatus.Current,     label: "statusLegend.exploring",     color: "#ff6b35" },
    { key: DFSStatus.Visited,     label: "statusLegend.explored",      color: "#1d79cfff" },
    { key: DFSStatus.Path,        label: "statusLegend.finalPath",     color: "#10b981" },
  ],
};

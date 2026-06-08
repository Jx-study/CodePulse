import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  GRAPH_INIT: "GRAPH_INIT",
  GRAPH_START: "GRAPH_START",

  GRID_BLOCKED: "GRID_BLOCKED",
  GRID_INIT: "GRID_INIT",
  GRID_INIT_DIST: "GRID_INIT_DIST",
  GRID_START: "GRID_START",

  DEQUEUE: "DEQUEUE",
  CHECK_END: "CHECK_END",
  EXPLORE: "EXPLORE",
  VISIT_NEIGHBOR: "VISIT_NEIGHBOR",
  CHANGE_VISITED_VALUE: "CHANGE_VISITED_VALUE",
  PATH_FOUND: "PATH_FOUND",
  NOT_FOUND: "NOT_FOUND",
} as const;

export const BFSStatus = {
  Inactive: Status.Inactive, // 尚未發現
  Discovered: Status.Prepare, // 已加入佇列待探索
  Current: Status.Target, // 當前正在探索的節點
  Visited: Status.Unfinished, // 已探索完畢
  Path: Status.Complete, // 最短路徑
} as const;

export const BFSStatusConfig: StatusConfig = {
  i18nNs: "tutorials/bfs",
  statuses: [
    { key: BFSStatus.Inactive,    label: "statusLegend.notDiscovered", color: "#555555" },
    { key: BFSStatus.Discovered,  label: "statusLegend.inQueue",       color: "#f59e0b" },
    { key: BFSStatus.Current,     label: "statusLegend.exploring",     color: "#ff6b35" },
    { key: BFSStatus.Visited,     label: "statusLegend.explored",      color: "#1d79cfff" },
    { key: BFSStatus.Path,        label: "statusLegend.shortestPath",  color: "#10b981" },
  ],
};

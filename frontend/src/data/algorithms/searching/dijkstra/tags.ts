import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  INIT: "INIT",
  WHILE_QUEUE_NOT_EMPTY: "WHILE_QUEUE_NOT_EMPTY",
  EXTRACT_MIN: "EXTRACT_MIN",
  CHECK_NEIGHBORS: "CHECK_NEIGHBORS",
  RELAX_EDGE_TRUE: "RELAX_EDGE_TRUE",
  RELAX_EDGE_FALSE: "RELAX_EDGE_FALSE",
  DONE: "DONE",
} as const;

export const DijkstraStatus = {
  Inactive: Status.Inactive, // 尚未發現
  Neighbor: Status.Prepare, // 正在檢查的鄰居
  Current: Status.Target, // 當前抽出的最小距離節點
  Settled: Status.Unfinished, // 已定案/最短距離已確定
  Path: Status.Complete, // 最終最短路徑
} as const;

export const DijkstraStatusConfig: StatusConfig = {
  i18nNs: "tutorials/dijkstra",
  statuses: [
    { key: DijkstraStatus.Inactive,  label: "statusLegend.notProcessed",     color: "#555555" },
    { key: DijkstraStatus.Current,   label: "statusLegend.currentMin",        color: "#ff6b35" },
    { key: DijkstraStatus.Neighbor,  label: "statusLegend.checkingNeighbor", color: "#f59e0b" },
    { key: DijkstraStatus.Settled,   label: "statusLegend.settled",           color: "#1d79cfff" },
    { key: DijkstraStatus.Path,      label: "statusLegend.visitedPath",       color: "#10b981" },
  ],
};

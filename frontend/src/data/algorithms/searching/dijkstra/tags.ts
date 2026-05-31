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
  statuses: [
    { key: DijkstraStatus.Inactive, label: "未處理", color: "#555555" },
    {
      key: DijkstraStatus.Current,
      label: "當前最小距離節點",
      color: "#ff6b35",
    },
    { key: DijkstraStatus.Neighbor, label: "正在檢查的鄰居", color: "#f59e0b" },
    {
      key: DijkstraStatus.Settled,
      label: "最短距離已確定",
      color: "#1d79cfff",
    },
    { key: DijkstraStatus.Path, label: "已走訪路徑", color: "#10b981" },
  ],
};

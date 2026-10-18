import { StatusConfig } from "@/types";
import { BSTStatus } from "../BinarySearchTree/tags";

export const TAGS = {
  INIT: "INIT",
} as const;

export const AVLStatus = BSTStatus;

export const AVLStatusConfig: StatusConfig = {
  i18nNs: "tutorials/avl-tree",
  statuses: [
    { key: AVLStatus.Inactive, label: "statusLegend.notVisited", color: "#555555" },
    { key: AVLStatus.Visited, label: "statusLegend.visitedPath", color: "#1d79cfff" },
    { key: AVLStatus.Prepare, label: "statusLegend.exploreDirection", color: "#f59e0b" },
    { key: AVLStatus.Target, label: "statusLegend.currentNode", color: "#ff6b35" },
    { key: AVLStatus.Complete, label: "statusLegend.completeTarget", color: "#46f336ff" },
  ],
};

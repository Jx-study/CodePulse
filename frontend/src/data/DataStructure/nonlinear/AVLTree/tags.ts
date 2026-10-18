import { StatusConfig } from "@/types";
import { BSTStatus } from "../BinarySearchTree/tags";

export const TAGS = {
  INIT: "INIT",
  INS_COMPARE: "INS_COMPARE",
  INS_LEFT: "INS_LEFT",
  INS_RIGHT: "INS_RIGHT",
  INS_EQUAL: "INS_EQUAL",
  INS_PLACE: "INS_PLACE",
  BF_CHECK: "BF_CHECK",
  BALANCED: "BALANCED",
  UNBALANCED_LEFT: "UNBALANCED_LEFT",
  UNBALANCED_RIGHT: "UNBALANCED_RIGHT",
  ROTATE_CHILD_LEFT: "ROTATE_CHILD_LEFT",
  ROTATE_CHILD_RIGHT: "ROTATE_CHILD_RIGHT",
  ROTATE_LEFT: "ROTATE_LEFT",
  ROTATE_RIGHT: "ROTATE_RIGHT",
  ROT_RIGHT_PIVOT: "ROT_RIGHT_PIVOT",
  ROT_RIGHT_MOVE: "ROT_RIGHT_MOVE",
  ROT_RIGHT_LINK: "ROT_RIGHT_LINK",
  ROT_RIGHT_HEIGHT_NODE: "ROT_RIGHT_HEIGHT_NODE",
  ROT_RIGHT_HEIGHT_PIVOT: "ROT_RIGHT_HEIGHT_PIVOT",
  ROT_RIGHT_RETURN: "ROT_RIGHT_RETURN",
  ROT_LEFT_PIVOT: "ROT_LEFT_PIVOT",
  ROT_LEFT_MOVE: "ROT_LEFT_MOVE",
  ROT_LEFT_LINK: "ROT_LEFT_LINK",
  ROT_LEFT_HEIGHT_NODE: "ROT_LEFT_HEIGHT_NODE",
  ROT_LEFT_HEIGHT_PIVOT: "ROT_LEFT_HEIGHT_PIVOT",
  ROT_LEFT_RETURN: "ROT_LEFT_RETURN",
  INS_DONE: "INS_DONE",
} as const;

export const AVLStatus = {
  ...BSTStatus,
  Unbalanced: "unbalanced",
  Rotating: "rotating",
} as const;

export const AVLStatusConfig: StatusConfig = {
  i18nNs: "tutorials/avl-tree",
  statuses: [
    { key: AVLStatus.Inactive, label: "statusLegend.notVisited", color: "#555555" },
    { key: AVLStatus.Visited, label: "statusLegend.visitedPath", color: "#1d79cfff" },
    { key: AVLStatus.Prepare, label: "statusLegend.exploreDirection", color: "#f59e0b" },
    { key: AVLStatus.Target, label: "statusLegend.currentNode", color: "#ff6b35" },
    { key: AVLStatus.Complete, label: "statusLegend.completeTarget", color: "#46f336ff" },
    { key: AVLStatus.Unbalanced, label: "statusLegend.unbalanced", color: "#ef4444" },
    { key: AVLStatus.Rotating, label: "statusLegend.rotating", color: "#a855f7" },
  ],
};

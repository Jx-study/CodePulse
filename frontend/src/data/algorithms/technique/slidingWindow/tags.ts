import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  INIT: "INIT",
  EXPAND_RIGHT: "EXPAND_RIGHT",
  CHECK_WHILE: "CHECK_WHILE",
  SHRINK_LEFT: "SHRINK_LEFT",
  UPDATE_RESULT: "UPDATE_RESULT",
  DONE: "DONE",
} as const;

export const SlidingWindowStatus = {
  Inactive: Status.Inactive,
  WindowActive: Status.Target, // 橘色：當前視窗範圍
  Shrinking: Status.Prepare, // 黃色：即將被左界縮減移出的元素
  Optimal: Status.Complete, // 綠色：紀錄中的最佳完美解答
} as const;

export const SlidingWindowStatusConfig: StatusConfig = {
  statuses: [
    { key: SlidingWindowStatus.Inactive, label: "視窗外部", color: "#555555" },
    {
      key: SlidingWindowStatus.WindowActive,
      label: "當前視窗",
      color: "#ff6b35",
    },
    { key: SlidingWindowStatus.Shrinking, label: "即將移出", color: "#f59e0b" },
    {
      key: SlidingWindowStatus.Optimal,
      label: "歷史最佳區間",
      color: "#10b981",
    },
  ],
};

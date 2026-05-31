import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  INIT: "INIT",
  ENQUEUE_ZERO: "ENQUEUE_ZERO",
  WHILE_LOOP: "WHILE_LOOP",
  DEQUEUE: "DEQUEUE",
  ADD_TO_RESULT: "ADD_TO_RESULT",
  REDUCE_NEIGHBOR: "REDUCE_NEIGHBOR",
  CHECK_ZERO_TRUE: "CHECK_ZERO_TRUE",
  CHECK_ZERO_FALSE: "CHECK_ZERO_FALSE",
  CYCLE_CHECK_START: "CYCLE_CHECK_START",
  CYCLE_DETECTED: "CYCLE_DETECTED",
  CYCLE_DEADLOCK: "CYCLE_DEADLOCK",
  SUCCESS_VERIFY: "SUCCESS_VERIFY",
  DONE: "DONE",
} as const;

export const TopoStatus = {
  Inactive: Status.Inactive,
  Target: Status.Target,
  InQueue: Status.Prepare,
  Reducing: "reducing",
  Complete: Status.Complete,
  Error: "error",
} as const;

export const TopoStatusConfig: StatusConfig = {
  statuses: [
    { key: TopoStatus.Inactive, label: "未處理", color: "#475569" },
    { key: TopoStatus.InQueue, label: "在 Queue 中", color: "#3b82f6" },
    { key: TopoStatus.Target, label: "當前處理節點", color: "#f59e0b" },
    { key: TopoStatus.Reducing, label: "拔除邊/減入度", color: "#ef4444" },
    { key: TopoStatus.Complete, label: "排序完成", color: "#10b981" },
    { key: TopoStatus.Error, label: "循環死鎖", color: "#991b1b" },
  ],
};

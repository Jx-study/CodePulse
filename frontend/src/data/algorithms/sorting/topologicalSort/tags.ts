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
  i18nNs: "tutorials/topological-sort",
  statuses: [
    { key: TopoStatus.Inactive,  label: "statusLegend.notProcessed",   color: "#475569" },
    { key: TopoStatus.InQueue,   label: "statusLegend.inQueue",         color: "#3b82f6" },
    { key: TopoStatus.Target,    label: "statusLegend.currentNode",     color: "#f59e0b" },
    { key: TopoStatus.Reducing,  label: "statusLegend.reducingEdge",    color: "#ef4444" },
    { key: TopoStatus.Complete,  label: "statusLegend.sorted",          color: "#10b981" },
    { key: TopoStatus.Error,     label: "statusLegend.cyclicDeadlock",  color: "#991b1b" },
  ],
};

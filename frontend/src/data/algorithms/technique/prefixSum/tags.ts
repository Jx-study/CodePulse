import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  BUILD_INIT: "BUILD_INIT",
  BUILD_BASE: "BUILD_BASE",
  BUILD_CALC: "BUILD_CALC",
  BUILD_UPDATE: "BUILD_UPDATE",
  BUILD_DONE: "BUILD_DONE",

  QUERY_START: "QUERY_START",
  QUERY_GET_R: "QUERY_GET_R",
  QUERY_GET_L: "QUERY_GET_L",
  QUERY_RETURN_SUB: "QUERY_RETURN_SUB",
  QUERY_ELSE: "QUERY_ELSE",
  QUERY_RETURN_DIRECT: "QUERY_RETURN_DIRECT",
} as const;

export const PrefixSumStatus = {
  Inactive: Status.Inactive,
  Unfinished: Status.Unfinished,
  Complete: Status.Complete,

  BuildCurrent: Status.Target,
  BuildPrev: Status.Prepare,

  QueryRight: "query-right",
  QueryLeft: "query-left",
} as const;

export const PrefixSumStatusConfig: StatusConfig = {
  statuses: [
    { key: PrefixSumStatus.Inactive, label: "未計算", color: "#555555" },
    { key: PrefixSumStatus.Unfinished, label: "閒置狀態", color: "#1d79cfff" },
    { key: PrefixSumStatus.Complete, label: "計算完成", color: "#10b981" },
    {
      key: PrefixSumStatus.BuildPrev,
      label: "前項總和 P[i-1]",
      color: "#f59e0b",
    },
    {
      key: PrefixSumStatus.BuildCurrent,
      label: "當前元素 A[i]",
      color: "#ff6b35",
    },
    {
      key: PrefixSumStatus.QueryRight,
      label: "查詢右界 P[R]",
      color: "#a855f7",
    },
    {
      key: PrefixSumStatus.QueryLeft,
      label: "扣除前綴 P[L-1]",
      color: "#ec4899",
    },
  ],
};

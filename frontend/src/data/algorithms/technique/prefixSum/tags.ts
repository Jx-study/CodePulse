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
  i18nNs: "tutorials/prefix-sum",
  statuses: [
    { key: PrefixSumStatus.Inactive,      label: "statusLegend.notCalculated",  color: "#555555" },
    { key: PrefixSumStatus.Unfinished,    label: "statusLegend.idle",            color: "#1d79cfff" },
    { key: PrefixSumStatus.Complete,      label: "statusLegend.calculated",      color: "#10b981" },
    { key: PrefixSumStatus.BuildPrev,     label: "statusLegend.prevSum",         color: "#f59e0b" },
    { key: PrefixSumStatus.BuildCurrent,  label: "statusLegend.currentElement",  color: "#ff6b35" },
    { key: PrefixSumStatus.QueryRight,    label: "statusLegend.queryRight",      color: "#a855f7" },
    { key: PrefixSumStatus.QueryLeft,     label: "statusLegend.queryLeft",       color: "#ec4899" },
  ],
};

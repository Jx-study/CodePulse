import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  INIT: "INIT",
  MATCH: "MATCH",
  NO_MATCH: "NO_MATCH",
  TRACE_START: "TRACE_START",
  TRACE_MATCH: "TRACE_MATCH",
  TRACE_UP: "TRACE_UP",
  TRACE_LEFT: "TRACE_LEFT",
  DONE: "DONE",
} as const;

export const LCSStatus = {
  Inactive: Status.Inactive, // 表頭 / 基底 0
  Unfinished: Status.Unfinished, // 一般格子
  Prepare: Status.Prepare, // 正在比較的字元
  Target: Status.Target, // 當前格子
  Complete: Status.Complete, // 回溯路徑 / LCS 字元
  Match: "match", // 字元相同：取左上 + 1
  Candidate: "candidate", // 字元不同：比較上方與左方
} as const;

export const LCSStatusConfig: StatusConfig = {
  i18nNs: "tutorials/lcs",
  statuses: [
    { key: LCSStatus.Inactive,   label: "statusLegend.header",    color: "#555555" },
    { key: LCSStatus.Unfinished, label: "statusLegend.cell",      color: "#1d79cfff" },
    { key: LCSStatus.Prepare,    label: "statusLegend.comparing", color: "#f59e0b" },
    { key: LCSStatus.Target,     label: "statusLegend.current",   color: "#ff6b35" },
    { key: LCSStatus.Match,      label: "statusLegend.match",     color: "#10b981" },
    { key: LCSStatus.Candidate,  label: "statusLegend.candidate", color: "#a855f7" },
    { key: LCSStatus.Complete,   label: "statusLegend.path",      color: "#46f336ff" },
  ],
};

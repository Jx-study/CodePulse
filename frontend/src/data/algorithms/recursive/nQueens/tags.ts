import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  INIT: "INIT",
  CHECK_SAFE: "CHECK_SAFE",
  ATTACKED: "ATTACKED",
  PLACE_QUEEN: "PLACE_QUEEN",
  RECURSE: "RECURSE",
  BACKTRACK: "BACKTRACK",
  SUCCESS: "SUCCESS",
  FAIL: "FAIL",
} as const;

export const NQueensStatus = {
  Inactive: Status.Inactive,
  Target: Status.Target,
  Complete: Status.Complete,
  Attacked: "attacked",
  Backtrack: "backtrack",
} as const;

export const NQueensStatusConfig: StatusConfig = {
  i18nNs: "tutorials/n-queens",
  statuses: [
    { key: NQueensStatus.Inactive,   label: "statusLegend.safeCell",    color: "#475569" },
    { key: NQueensStatus.Target,     label: "statusLegend.trying",      color: "#f59e0b" },
    { key: NQueensStatus.Complete,   label: "statusLegend.queenPlaced", color: "#10b981" },
    { key: NQueensStatus.Attacked,   label: "statusLegend.attacked",    color: "#ef4444" },
    { key: NQueensStatus.Backtrack,  label: "statusLegend.backtrack",   color: "#a855f7" },
  ],
};

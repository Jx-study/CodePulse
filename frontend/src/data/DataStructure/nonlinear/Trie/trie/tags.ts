import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  INIT: "INIT",
  INSERT_START: "INSERT_START",
  CHAR_MATCH: "CHAR_MATCH",
  CHAR_CREATE: "CHAR_CREATE",
  SET_END: "SET_END",
  SEARCH_START: "SEARCH_START",
  SEARCH_FOUND: "SEARCH_FOUND",
  SEARCH_NOT_FOUND: "SEARCH_NOT_FOUND",
  DELETE_START: "DELETE_START",
  DELETE_UNMARK: "DELETE_UNMARK",
  DELETE_PRUNE: "DELETE_PRUNE",
  DELETE_NOT_FOUND: "DELETE_NOT_FOUND",
  DONE: "DONE",
} as const;

export const TrieStatus = {
  Inactive: Status.Inactive,
  Default: Status.Unfinished,
  Match: Status.Target, // 比對中/走訪中
  Create: Status.Prepare, // 新增的節點/即將刪除的節點
  WordEnd: Status.Complete, // 標記為單字結尾
} as const;

export const TrieStatusConfig: StatusConfig = {
  i18nNs: "tutorials/trie",
  statuses: [
    { key: TrieStatus.Default,  label: "statusLegend.trieNode",   color: "#1d79cfff" },
    { key: TrieStatus.Match,    label: "statusLegend.traversing", color: "#ff6b35" },
    { key: TrieStatus.Create,   label: "statusLegend.addRemove",  color: "#f59e0b" },
    { key: TrieStatus.WordEnd,  label: "statusLegend.wordEnd",    color: "#10b981" },
  ],
};

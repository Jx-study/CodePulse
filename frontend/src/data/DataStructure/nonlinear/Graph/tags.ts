import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  INIT: "INIT",
  ADD_VERTEX: "ADD_VERTEX",
  ADD_VERTEX_RESULT: "ADD_VERTEX_RESULT",
  REMOVE_VERTEX: "REMOVE_VERTEX",
  REMOVE_VERTEX_UPDATE: "REMOVE_VERTEX_UPDATE",
  ADD_EDGE: "ADD_EDGE",
  ADD_EDGE_UNDIRECTED: "ADD_EDGE_UNDIRECTED",
  REMOVE_EDGE: "REMOVE_EDGE",
  REMOVE_EDGE_UNDIRECTED: "REMOVE_EDGE_UNDIRECTED",
  GET_NEIGHBORS: "GET_NEIGHBORS",
  GET_NEIGHBORS_RESULT_TRUE: "GET_NEIGHBORS_RESULT_TRUE",
  GET_NEIGHBORS_RESULT_FALSE: "GET_NEIGHBORS_RESULT_FALSE",
  CHECK_ADJACENT: "CHECK_ADJACENT",
  CHECK_ADJACENT_RESULT_TRUE: "CHECK_ADJACENT_RESULT_TRUE",
  CHECK_ADJACENT_RESULT_FALSE: "CHECK_ADJACENT_RESULT_FALSE",
  GET_DEGREE_UNDIRECTED: "GET_DEGREE_UNDIRECTED",
  GET_DEGREE_DIRECTED: "GET_DEGREE_DIRECTED",
  CHECK_CONNECTED_INIT: "CHECK_CONNECTED_INIT",
  CHECK_CONNECTED_WHILE: "CHECK_CONNECTED_WHILE",
  CHECK_CONNECTED_RESULT: "CHECK_CONNECTED_RESULT",
  CHECK_CYCLE_INIT: "CHECK_CYCLE_INIT",
  CHECK_CYCLE_DFS: "CHECK_CYCLE_DFS",
  CHECK_CYCLE_FOUND_TRUE: "CHECK_CYCLE_FOUND_TRUE",
  CHECK_CYCLE_FOUND_FALSE: "CHECK_CYCLE_FOUND_FALSE",
  CHECK_CYCLE_END_TRUE: "CHECK_CYCLE_END_TRUE",
  CHECK_CYCLE_END_FALSE: "CHECK_CYCLE_END_FALSE",
} as const;

export const GraphStatusConfig: StatusConfig = {
  i18nNs: "tutorials/graph",
  statuses: [
    { key: Status.Inactive,   label: "statusLegend.notProcessed",      color: "#555555" },
    { key: Status.Unfinished, label: "statusLegend.normalState",        color: "#1d79cfff" },
    { key: Status.Prepare,    label: "statusLegend.preparing",          color: "#f59e0b" },
    { key: Status.Target,     label: "statusLegend.targetCurrent",      color: "#ff6b35" },
    { key: Status.Complete,   label: "statusLegend.completeConnected",  color: "#10b981" },
  ],
};

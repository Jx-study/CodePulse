import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import {
  createGraphElements,
  generateGraphFrame,
} from "@/data/DataStructure/nonlinear/utils";
import { Node } from "@/modules/core/DataLogic/Node";
import { TAGS } from "./tags";

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: () => ({ key: "animation.init" }),
  [TAGS.ADD_VERTEX]: (e) => ({
    key: "animation.add_vertex",
    params: { val: e.local_vars.insertVal },
  }),
  [TAGS.ADD_VERTEX_RESULT]: (e) => ({
    key: "animation.add_vertex_result",
    params: { val: e.local_vars.insertVal },
  }),
  [TAGS.REMOVE_VERTEX]: (e) => ({
    key: "animation.remove_vertex",
    params: { val: e.local_vars.removeVal },
  }),
  [TAGS.REMOVE_VERTEX_UPDATE]: () => ({
    key: "animation.remove_vertex_update",
  }),
  [TAGS.ADD_EDGE]: (e) => ({
    key: "animation.add_edge",
    params: { src: e.local_vars.source, dst: e.local_vars.target },
  }),
  [TAGS.ADD_EDGE_UNDIRECTED]: (e) => ({
    key: "animation.add_edge",
    params: { src: e.local_vars.source, dst: e.local_vars.target },
  }),
  [TAGS.REMOVE_EDGE]: (e) => ({
    key: "animation.remove_edge",
    params: { src: e.local_vars.source, dst: e.local_vars.target },
  }),
  [TAGS.REMOVE_EDGE_UNDIRECTED]: (e) => ({
    key: "animation.remove_edge",
    params: { src: e.local_vars.source, dst: e.local_vars.target },
  }),
  [TAGS.GET_NEIGHBORS]: (e) => ({
    key: e.local_vars.currentNeighbor
      ? "animation.get_neighbors_find"
      : "animation.get_neighbors_start",
    params: {
      target: e.local_vars.target,
      neighbor: e.local_vars.currentNeighbor,
    },
  }),
  [TAGS.GET_NEIGHBORS_RESULT_TRUE]: (e) => ({
    key: "animation.get_neighbors_result_true",
    params: { count: e.local_vars.neighborsCount, names: e.local_vars.names },
  }),
  [TAGS.GET_NEIGHBORS_RESULT_FALSE]: (e) => ({
    key: "animation.get_neighbors_result_false",
    params: { target: e.local_vars.target },
  }),
  [TAGS.CHECK_ADJACENT]: (e) => ({
    key: "animation.check_adjacent",
    params: {
      src: e.local_vars.source,
      dst: e.local_vars.target,
      dir: e.local_vars.dirStr,
    },
  }),
  [TAGS.CHECK_ADJACENT_RESULT_TRUE]: (e) => ({
    key: "animation.check_adjacent_true",
    params: { src: e.local_vars.source, dst: e.local_vars.target },
  }),
  [TAGS.CHECK_ADJACENT_RESULT_FALSE]: (e) => ({
    key: "animation.check_adjacent_false",
    params: { src: e.local_vars.source, dst: e.local_vars.target },
  }),
  [TAGS.GET_DEGREE_DIRECTED]: (e) => ({
    key:
      e.local_vars.inDegree !== undefined
        ? "animation.get_degree_directed_result"
        : "animation.get_degree",
    params: {
      target: e.local_vars.target.replace("node-", ""),
      dir: e.local_vars.dirStr,
      inDeg: e.local_vars.inDegree,
      outDeg: e.local_vars.outDegree,
    },
  }),
  [TAGS.GET_DEGREE_UNDIRECTED]: (e) => ({
    key:
      e.local_vars.degree !== undefined
        ? "animation.get_degree_undirected_result"
        : "animation.get_degree",
    params: {
      target: e.local_vars.target.replace("node-", ""),
      dir: e.local_vars.dirStr,
      deg: e.local_vars.degree,
    },
  }),
  [TAGS.CHECK_CONNECTED_INIT]: (e) => ({
    key: "animation.check_connected_init",
    params: { start: e.local_vars.start.replace("node-", "") },
  }),
  [TAGS.CHECK_CONNECTED_WHILE]: (e) => ({
    key: `animation.check_connected_${e.meta?.stepKey}`,
    params: {
      current: e.local_vars.current.replace("node-", ""),
      visited: e.meta?.visitedSize,
      total: e.meta?.totalNodes,
    },
  }),
  [TAGS.CHECK_CONNECTED_RESULT]: (e) => ({
    key: e.local_vars.isConnected
      ? "animation.check_connected_result_true"
      : "animation.check_connected_result_false",
  }),
  [TAGS.CHECK_CYCLE_DFS]: (e) => ({
    key:
      e.meta?.stepKey === "return_node"
        ? "animation.check_cycle_return"
        : "animation.check_cycle_dfs",
    params: { current: e.local_vars.current.replace("node-", "") },
  }),
  [TAGS.CHECK_CYCLE_FOUND_TRUE]: (e) => ({
    key: "animation.check_cycle_found_true",
    params: {
      current: e.local_vars.current,
      cycleNode: e.local_vars.cycleNode,
    },
  }),
  [TAGS.CHECK_CYCLE_FOUND_FALSE]: (e) => ({
    key: "animation.check_cycle_found_false",
    params: { current: e.local_vars.current },
  }),
  [TAGS.CHECK_CYCLE_END_TRUE]: (e) => ({
    key: "animation.check_cycle_end_true",
    params: { path: e.local_vars.cyclePath },
  }),
  [TAGS.CHECK_CYCLE_END_FALSE]: () => ({
    key: "animation.check_cycle_end_false",
  }),
};

export function graphTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = event.meta ?? {};
    const isDirected = meta.isDirected;
    const graphData = meta.graphData;
    let baseElements = createGraphElements(graphData as any, isDirected);

    // 處理 Ghost Node (刪除節點時用)
    if (meta.ghostNode) {
      const g = new Node();
      g.id = meta.ghostNode.id;
      if (meta.ghostNode.x !== undefined)
        g.moveTo(meta.ghostNode.x, meta.ghostNode.y);

      meta.deletedEdges?.forEach(([source, target]: string[]) => {
        if (source === g.id) {
          const tNode = baseElements.find((n) => n.id === target);
          if (tNode) g.pointers.push(tNode);
        }
        if (target === g.id) {
          const sNode = baseElements.find((n) => n.id === source);
          if (sNode) sNode.pointers.push(g);
        }
      });
      baseElements.push(g);
    }

    // 處理 hideEdge / forceEdge (新增/刪除邊時的過場)
    if (meta.hideEdge) {
      const sNode = baseElements.find((n) => n.id === meta.hideEdge.source);
      const tNode = baseElements.find((n) => n.id === meta.hideEdge.target);
      if (sNode)
        sNode.pointers = sNode.pointers.filter(
          (n) => n.id !== meta.hideEdge.target,
        );
      if (!isDirected && tNode)
        tNode.pointers = tNode.pointers.filter(
          (n) => n.id !== meta.hideEdge.source,
        );
    }
    if (meta.forceEdge) {
      const sNode = baseElements.find((n) => n.id === meta.forceEdge.source);
      const tNode = baseElements.find((n) => n.id === meta.forceEdge.target);
      if (sNode && tNode) {
        sNode.pointers.push(tNode);
        if (!isDirected) tNode.pointers.push(sNode);
      }
    }

    const descObj = DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag };

    const frame = generateGraphFrame(
      baseElements,
      meta.statusMap || {},
      {},
      descObj.key,
      true,
      meta.linkStatusMap || {},
    );

    return {
      stepNumber: idx,
      description: descObj,
      actionTag: event.tag,
      variables: event.local_vars,
      elements: frame.elements,
      links: frame.links,
    };
  });
}

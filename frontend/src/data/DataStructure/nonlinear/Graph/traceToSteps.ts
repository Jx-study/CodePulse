import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import {
  createGraphElements,
  generateGraphFrame,
  RawGraphNode,
} from "@/data/DataStructure/nonlinear/utils";
import { Node } from "@/modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import type { linkStatus } from "@/modules/core/Render/D3Renderer";
import { asTrace } from "@/data/shared/traceValue";
import { TAGS } from "./tags";

interface GraphLocalVars {
  insertVal?: number | string;
  removeVal?: number | string;
  source?: string;
  target?: string;
  currentNeighbor?: string;
  neighborsCount?: number;
  names?: string;
  dirStr?: string;
  inDegree?: number;
  outDegree?: number;
  degree?: number;
  start?: string;
  current?: string;
  isConnected?: boolean;
  cycleNode?: string;
  cyclePath?: string;
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: () => ({ key: "animation.init" }),
  [TAGS.ADD_VERTEX]: (e) => ({
    key: "animation.add_vertex",
    params: { val: asTrace<GraphLocalVars>(e.local_vars).insertVal ?? null },
  }),
  [TAGS.ADD_VERTEX_RESULT]: (e) => ({
    key: "animation.add_vertex_result",
    params: { val: asTrace<GraphLocalVars>(e.local_vars).insertVal ?? null },
  }),
  [TAGS.REMOVE_VERTEX]: (e) => ({
    key: "animation.remove_vertex",
    params: { val: asTrace<GraphLocalVars>(e.local_vars).removeVal ?? null },
  }),
  [TAGS.REMOVE_VERTEX_UPDATE]: () => ({
    key: "animation.remove_vertex_update",
  }),
  [TAGS.ADD_EDGE]: (e) => {
    const lv = asTrace<GraphLocalVars>(e.local_vars);
    return {
      key: "animation.add_edge",
      params: { src: lv.source ?? null, dst: lv.target ?? null },
    };
  },
  [TAGS.ADD_EDGE_UNDIRECTED]: (e) => {
    const lv = asTrace<GraphLocalVars>(e.local_vars);
    return {
      key: "animation.add_edge",
      params: { src: lv.source ?? null, dst: lv.target ?? null },
    };
  },
  [TAGS.REMOVE_EDGE]: (e) => {
    const lv = asTrace<GraphLocalVars>(e.local_vars);
    return {
      key: "animation.remove_edge",
      params: { src: lv.source ?? null, dst: lv.target ?? null },
    };
  },
  [TAGS.REMOVE_EDGE_UNDIRECTED]: (e) => {
    const lv = asTrace<GraphLocalVars>(e.local_vars);
    return {
      key: "animation.remove_edge",
      params: { src: lv.source ?? null, dst: lv.target ?? null },
    };
  },
  [TAGS.GET_NEIGHBORS]: (e) => {
    const lv = asTrace<GraphLocalVars>(e.local_vars);
    return {
      key: lv.currentNeighbor
        ? "animation.get_neighbors_find"
        : "animation.get_neighbors_start",
      params: {
        target: lv.target ?? null,
        neighbor: lv.currentNeighbor ?? null,
      },
    };
  },
  [TAGS.GET_NEIGHBORS_RESULT_TRUE]: (e) => {
    const lv = asTrace<GraphLocalVars>(e.local_vars);
    return {
      key: "animation.get_neighbors_result_true",
      params: { count: lv.neighborsCount ?? null, names: lv.names ?? null },
    };
  },
  [TAGS.GET_NEIGHBORS_RESULT_FALSE]: (e) => ({
    key: "animation.get_neighbors_result_false",
    params: { target: asTrace<GraphLocalVars>(e.local_vars).target ?? null },
  }),
  [TAGS.CHECK_ADJACENT]: (e) => {
    const lv = asTrace<GraphLocalVars>(e.local_vars);
    return {
      key: "animation.check_adjacent",
      params: {
        src: lv.source ?? null,
        dst: lv.target ?? null,
        dir: lv.dirStr ?? null,
      },
    };
  },
  [TAGS.CHECK_ADJACENT_RESULT_TRUE]: (e) => {
    const lv = asTrace<GraphLocalVars>(e.local_vars);
    return {
      key: "animation.check_adjacent_true",
      params: { src: lv.source ?? null, dst: lv.target ?? null },
    };
  },
  [TAGS.CHECK_ADJACENT_RESULT_FALSE]: (e) => {
    const lv = asTrace<GraphLocalVars>(e.local_vars);
    return {
      key: "animation.check_adjacent_false",
      params: { src: lv.source ?? null, dst: lv.target ?? null },
    };
  },
  [TAGS.GET_DEGREE_DIRECTED]: (e) => {
    const lv = asTrace<GraphLocalVars>(e.local_vars);
    return {
      key:
        lv.inDegree !== undefined
          ? "animation.get_degree_directed_result"
          : "animation.get_degree",
      params: {
        target: (lv.target ?? "").replace("node-", ""),
        dir: lv.dirStr ?? null,
        inDeg: lv.inDegree ?? null,
        outDeg: lv.outDegree ?? null,
      },
    };
  },
  [TAGS.GET_DEGREE_UNDIRECTED]: (e) => {
    const lv = asTrace<GraphLocalVars>(e.local_vars);
    return {
      key:
        lv.degree !== undefined
          ? "animation.get_degree_undirected_result"
          : "animation.get_degree",
      params: {
        target: (lv.target ?? "").replace("node-", ""),
        dir: lv.dirStr ?? null,
        deg: lv.degree ?? null,
      },
    };
  },
  [TAGS.CHECK_CONNECTED_INIT]: (e) => ({
    key: "animation.check_connected_init",
    params: {
      start: (asTrace<GraphLocalVars>(e.local_vars).start ?? "").replace(
        "node-",
        "",
      ),
    },
  }),
  [TAGS.CHECK_CONNECTED_WHILE]: (e) => {
    const lv = asTrace<GraphLocalVars>(e.local_vars);
    return {
      key: `animation.check_connected_${e.meta?.stepKey}`,
      params: {
        current: (lv.current ?? "").replace("node-", ""),
        visited: (e.meta?.visitedSize as number | undefined) ?? null,
        total: (e.meta?.totalNodes as number | undefined) ?? null,
      },
    };
  },
  [TAGS.CHECK_CONNECTED_RESULT]: (e) => ({
    key: asTrace<GraphLocalVars>(e.local_vars).isConnected
      ? "animation.check_connected_result_true"
      : "animation.check_connected_result_false",
  }),
  [TAGS.CHECK_CYCLE_DFS]: (e) => ({
    key:
      e.meta?.stepKey === "return_node"
        ? "animation.check_cycle_return"
        : "animation.check_cycle_dfs",
    params: {
      current: (asTrace<GraphLocalVars>(e.local_vars).current ?? "").replace(
        "node-",
        "",
      ),
    },
  }),
  [TAGS.CHECK_CYCLE_FOUND_TRUE]: (e) => {
    const lv = asTrace<GraphLocalVars>(e.local_vars);
    return {
      key: "animation.check_cycle_found_true",
      params: {
        current: lv.current ?? null,
        cycleNode: lv.cycleNode ?? null,
      },
    };
  },
  [TAGS.CHECK_CYCLE_FOUND_FALSE]: (e) => ({
    key: "animation.check_cycle_found_false",
    params: { current: asTrace<GraphLocalVars>(e.local_vars).current ?? null },
  }),
  [TAGS.CHECK_CYCLE_END_TRUE]: (e) => ({
    key: "animation.check_cycle_end_true",
    params: { path: asTrace<GraphLocalVars>(e.local_vars).cyclePath ?? null },
  }),
  [TAGS.CHECK_CYCLE_END_FALSE]: () => ({
    key: "animation.check_cycle_end_false",
  }),
};

interface GraphMeta {
  isDirected?: boolean;
  graphData?: { nodes: RawGraphNode[]; edges: string[][] };
  ghostNode?: { id: string; x?: number; y?: number };
  deletedEdges?: [string, string][];
  hideEdge?: { source: string; target: string };
  forceEdge?: { source: string; target: string };
  statusMap?: Record<string, Status>;
  linkStatusMap?: Record<string, linkStatus>;
}

export function graphTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = asTrace<GraphMeta>(event.meta);
    const isDirected = meta.isDirected;
    const graphData = meta.graphData ?? { nodes: [], edges: [] };
    let baseElements = createGraphElements(graphData, isDirected);

    // 處理 Ghost Node (刪除節點時用)
    if (meta.ghostNode) {
      const g = new Node();
      g.id = meta.ghostNode.id;
      if (meta.ghostNode.x !== undefined)
        g.moveTo(meta.ghostNode.x, meta.ghostNode.y ?? 0);

      meta.deletedEdges?.forEach(([source, target]) => {
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
      const hideEdge = meta.hideEdge;
      const sNode = baseElements.find((n) => n.id === hideEdge.source);
      const tNode = baseElements.find((n) => n.id === hideEdge.target);
      if (sNode)
        sNode.pointers = sNode.pointers.filter(
          (n) => n.id !== hideEdge.target,
        );
      if (!isDirected && tNode)
        tNode.pointers = tNode.pointers.filter(
          (n) => n.id !== hideEdge.source,
        );
    }
    if (meta.forceEdge) {
      const forceEdge = meta.forceEdge;
      const sNode = baseElements.find((n) => n.id === forceEdge.source);
      const tNode = baseElements.find((n) => n.id === forceEdge.target);
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

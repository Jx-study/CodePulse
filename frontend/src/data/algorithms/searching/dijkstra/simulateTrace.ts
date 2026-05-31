import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS, DijkstraStatus } from "./tags";
import {
  createGraphElements,
  getLinkKey,
  updateLinkStatus,
} from "@/data/DataStructure/nonlinear/utils";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { linkStatus } from "@/modules/core/Render/D3Renderer";

export function simulateDijkstraTrace(
  inputData: any,
  action?: any,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  if (!inputData || !inputData.nodes) return trace;

  const isDirected = action?.isDirected || false;
  const baseElements = createGraphElements(inputData, isDirected);
  const rawNodes = inputData.nodes;
  const rawEdges = inputData.edges || [];
  const startNodeId = action?.startNode || rawNodes[0]?.id || "node-0";
  const endNodeId = action?.endNode || "";

  const adjList: Record<string, { to: string; weight: number }[]> = {};
  const weightMap: Record<string, number> = {};

  rawNodes.forEach((n: any) => (adjList[n.id] = []));
  rawEdges.forEach((edge: any) => {
    const u = edge[0],
      v = edge[1];
    const weight =
      edge[2] !== undefined
        ? parseInt(edge[2], 10)
        : Math.floor(Math.random() * 9) + 1;

    if (adjList[u]) adjList[u].push({ to: v, weight });
    if (!isDirected && adjList[v]) adjList[v].push({ to: u, weight });

    weightMap[getLinkKey(u, v)] = weight;
    if (!isDirected) weightMap[getLinkKey(v, u)] = weight;
  });

  const dist: Record<string, number> = {};
  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, linkStatus> = {};
  const visited: Set<string> = new Set();
  const prev: Record<string, string | null> = {};

  rawNodes.forEach((n: any) => {
    prev[n.id] = null;
    dist[n.id] = Infinity;
    statusMap[n.id] = DijkstraStatus.Inactive as Status;
  });
  dist[startNodeId] = 0;

  const pushTrace = (tag: string, vars: any, meta: any = {}) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: inputData,
      meta: {
        baseElements,
        statusMap: { ...statusMap },
        linkStatusMap: { ...linkStatusMap },
        dist: { ...dist },
        weightMap,
        ...meta,
      },
    });
  };

  pushTrace(TAGS.INIT, { start: startNodeId });

  const pq = [...rawNodes.map((n: any) => n.id)];

  while (pq.length > 0) {
    pq.sort((a, b) => dist[a] - dist[b]);
    const u = pq.shift()!;

    if (dist[u] === Infinity) break;

    if (endNodeId && u === endNodeId) {
      pushTrace(TAGS.DONE, { u, distU: dist[u] }, { earlyExit: true });
      break;
    }

    statusMap[u] = DijkstraStatus.Current as Status;
    pushTrace(TAGS.EXTRACT_MIN, { u, distU: dist[u] });

    const neighbors = adjList[u] || [];
    for (const edge of neighbors) {
      const v = edge.to;
      const weight = edge.weight;

      if (visited.has(v)) continue;

      updateLinkStatus(linkStatusMap, u, v, "target", true);
      pushTrace(TAGS.CHECK_NEIGHBORS, { u, v, weight });

      const alt = dist[u] + weight;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;

        statusMap[v] = DijkstraStatus.Neighbor as Status;
        updateLinkStatus(linkStatusMap, u, v, "prepare", true);
        pushTrace(TAGS.RELAX_EDGE_TRUE, { u, v, alt, oldDist: dist[v] });

        statusMap[v] = DijkstraStatus.Inactive as Status;
      } else {
        pushTrace(TAGS.RELAX_EDGE_FALSE, { u, v, alt, oldDist: dist[v] });
      }
      updateLinkStatus(linkStatusMap, u, v, "complete", false);
    }

    visited.add(u);
    statusMap[u] = DijkstraStatus.Settled as Status;
    pushTrace(TAGS.WHILE_QUEUE_NOT_EMPTY, { u });
  }

  if (endNodeId && dist[endNodeId] !== Infinity) {
    const path: string[] = [];
    let curr: string | null = endNodeId;
    while (curr !== null) {
      path.unshift(curr);
      curr = prev[curr];
    }

    Object.keys(statusMap).forEach(
      (k) => (statusMap[k] = DijkstraStatus.Inactive as Status),
    );
    Object.keys(linkStatusMap).forEach((k) => delete linkStatusMap[k]);

    path.forEach(
      (nodeId) => (statusMap[nodeId] = DijkstraStatus.Path as Status),
    );
    for (let i = 0; i < path.length - 1; i++) {
      updateLinkStatus(linkStatusMap, path[i], path[i + 1], "complete", false);
    }

    pushTrace(TAGS.DONE, {
      path: path.join(" → "),
      totalDist: dist[endNodeId],
      endNodeId,
    });
  } else if (!endNodeId) {
    pushTrace(TAGS.DONE, { allReachable: true });
  } else {
    pushTrace(TAGS.DONE, { endNodeId, unreachable: true });
  }

  return trace;
}

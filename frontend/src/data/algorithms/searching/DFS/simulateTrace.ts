import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS, DFSStatus } from "./tags";
import {
  createGraphElements,
  updateLinkStatus,
} from "@/data/DataStructure/nonlinear/utils";
import { Node } from "@/modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { linkStatus } from "@/modules/core/Render/D3Renderer";

// Graph DFS
export function simulateGraphDFSTrace(
  graphData: any,
  startId?: string,
  endId?: string,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  if (!graphData.nodes || !graphData.edges) return trace;

  const baseElements = createGraphElements(graphData);
  const nodeMap = new Map<string, Node>();
  baseElements.forEach((node) => nodeMap.set(node.id, node));
  const sortedIds = baseElements.map((n) => n.id).sort();

  const realStartId = startId && nodeMap.has(startId) ? startId : sortedIds[0];
  const realEndId =
    endId && nodeMap.has(endId) ? endId : sortedIds[sortedIds.length - 1];

  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, linkStatus> = {};
  const distanceMap: Record<string, number> = {};
  const parentMap = new Map<string, string>();
  const visited = new Set<string>();
  const discovered = new Set<string>();

  const stack: { id: string; dist: number }[] = [];
  const result: string[] = [];

  baseElements.forEach((n) => (distanceMap[n.id] = Infinity));

  const pushTrace = (tag: string, vars: any, meta: any) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: graphData,
      meta: {
        viewMode: "graph",
        baseElements,
        statusMap: { ...statusMap },
        distanceMap: { ...distanceMap },
        linkStatusMap: { ...linkStatusMap },
        stack: stack.map((s) => s.id),
        result: [...result],
        ...meta,
      },
    });
  };

  pushTrace(
    TAGS.INIT,
    { start: realStartId, end: realEndId, "distance[all]": "∞" },
    {},
  );

  stack.push({ id: realStartId, dist: 0 });
  discovered.add(realStartId);
  statusMap[realStartId] = DFSStatus.Discovered as Status;
  distanceMap[realStartId] = 0;

  pushTrace(
    TAGS.START,
    { start: realStartId, stack: `[(${realStartId}, 0)]`, dist: 0 },
    { pushingNodeIds: [realStartId] },
  );
  pushTrace(
    TAGS.START,
    { start: realStartId, stack: `[(${realStartId}, 0)]`, dist: 0 },
    {},
  );

  let found = false;

  while (stack.length > 0) {
    const item = stack.pop()!;
    const currId = item.id;
    const currDist = item.dist;
    const parentId = parentMap.get(currId);

    if (parentId)
      updateLinkStatus(linkStatusMap, parentId, currId, "target", false);
    statusMap[currId] = DFSStatus.Current as Status;

    pushTrace(
      TAGS.POP,
      {
        curr: currId,
        dist: currDist,
        stack:
          stack.length > 0
            ? `[${stack.map((s) => `(${s.id}, ${s.dist})`).join(", ")}]`
            : "[]",
        "visited count": visited.size,
      },
      { poppingNodeId: currId },
    );

    if (!visited.has(currId)) result.push(currId);

    if (visited.has(currId)) {
      pushTrace(
        TAGS.SKIP,
        { curr: currId, "already visited": "True", dist: distanceMap[currId] },
        {},
      );
      continue;
    }

    visited.add(currId);
    distanceMap[currId] = currDist;

    pushTrace(
      TAGS.DIST_UPDATE,
      {
        curr: currId,
        end: realEndId,
        "curr === end": currId === realEndId ? "True" : "False",
        dist: distanceMap[currId],
      },
      {},
    );
    pushTrace(
      TAGS.CHECK_END,
      {
        curr: currId,
        end: realEndId,
        "curr === end": currId === realEndId ? "True" : "False",
        dist: distanceMap[currId],
      },
      {},
    );

    if (currId === realEndId) {
      found = true;
      break;
    }

    statusMap[currId] = DFSStatus.Visited as Status;
    if (parentId)
      updateLinkStatus(
        linkStatusMap,
        parentId,
        currId,
        DFSStatus.Visited as linkStatus,
        false,
      );

    const currNode = nodeMap.get(currId);
    if (currNode) {
      const neighbors = currNode.pointers;
      neighbors.sort((a, b) => b.id.localeCompare(a.id));
      const allNeighborIds = neighbors.map((n) => n.id);
      const unvisitedIds = allNeighborIds.filter((id) => !discovered.has(id));

      pushTrace(
        TAGS.EXPLORE,
        {
          curr: currId,
          unvisitedCount: unvisitedIds.length,
          "all neighbors": `[${allNeighborIds.join(", ")}]`,
          unvisited:
            unvisitedIds.length > 0 ? `[${unvisitedIds.join(", ")}]` : "[]",
        },
        {},
      );

      for (const neighbor of neighbors) {
        if (!discovered.has(neighbor.id)) {
          updateLinkStatus(linkStatusMap, currId, neighbor.id, "prepare", true);
          parentMap.set(neighbor.id, currId);
          stack.push({ id: neighbor.id, dist: currDist + 1 });
          discovered.add(neighbor.id);
          statusMap[neighbor.id] = DFSStatus.Discovered as Status;

          pushTrace(
            TAGS.PUSH_NEIGHBOR,
            {
              curr: currId,
              neighbor: neighbor.id,
              "depth[new]": currDist + 1,
              "stack (after)": `[${stack.map((s) => `(${s.id}, ${s.dist})`).join(", ")}]`,
            },
            { pushingNodeIds: [neighbor.id] },
          );

          pushTrace(
            TAGS.PUSH_NEIGHBOR,
            {
              curr: currId,
              neighbor: neighbor.id,
              "depth[new]": currDist + 1,
              "stack (after)": `[${stack.map((s) => `(${s.id}, ${s.dist})`).join(", ")}]`,
            },
            {},
          );
        }
      }
    }
  }

  if (found) {
    let curr = realEndId;
    const path: string[] = [realEndId];
    statusMap[realEndId] = DFSStatus.Path as Status;

    while (curr !== realStartId) {
      const parent = parentMap.get(curr);
      if (!parent) break;
      updateLinkStatus(linkStatusMap, parent, curr, "complete", false);
      path.push(parent);
      curr = parent;
    }
    path.forEach((id) => (statusMap[id] = DFSStatus.Path as Status));
    pushTrace(
      TAGS.PATH_FOUND,
      { end: realEndId, "path depth": distanceMap[realEndId] },
      { pathLength: path.length - 1 },
    );
  } else {
    pushTrace(
      TAGS.NOT_FOUND,
      { stack: "[]", end: realEndId, reachable: "False" },
      {},
    );
  }

  return trace;
}

// Grid DFS
export function simulateGridDFSTrace(
  gridData: any[],
  cols: number = 5,
  startId?: string,
  endId?: string,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  if (!Array.isArray(gridData) || gridData.length === 0) return trace;

  const rows = Math.ceil(gridData.length / cols);
  const startIndex = startId ? parseInt(startId) : 0;
  const endIndex = endId ? parseInt(endId) : gridData.length - 1;

  const visited = new Set<number>();
  const discovered = new Set<number>();
  const parentMap = new Map<number, number>();
  const statusMap: Record<number, Status> = {};
  const distanceMap: Record<number, number> = {};

  for (let i = 0; i < gridData.length; i++) distanceMap[i] = Infinity;

  const stack: number[] = [];
  const result: number[] = [];

  const pushTrace = (tag: string, vars: any, meta: any) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: gridData,
      meta: {
        viewMode: "grid",
        cols,
        statusMap: { ...statusMap },
        distanceMap: { ...distanceMap },
        stack: stack.map(String),
        result: result.map(String),
        ...meta,
      },
    });
  };

  if (gridData[startIndex].val === 1 || gridData[endIndex].val === 1) {
    pushTrace(TAGS.GRID_BLOCKED, {}, { showIdAsValue: true });
    return trace;
  }

  pushTrace(
    TAGS.INIT,
    { start: startIndex, end: endIndex },
    { showIdAsValue: true },
  );
  pushTrace(
    TAGS.INIT,
    { start: startIndex, end: endIndex, "distance[all]": "∞" },
    { showIdAsValue: false },
  );

  stack.push(startIndex);
  discovered.add(startIndex);
  distanceMap[startIndex] = 0;
  statusMap[startIndex] = DFSStatus.Discovered as Status;

  pushTrace(
    TAGS.START,
    { start: startIndex, stack: `[${startIndex}]`, dist: 0 },
    { pushingNodeIds: [String(startIndex)] },
  );
  pushTrace(
    TAGS.START,
    { start: startIndex, stack: `[${startIndex}]`, dist: 0 },
    {},
  );

  let found = false;
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ]; // Right, Down, Left, Up

  while (stack.length > 0) {
    const currIndex = stack.pop()!;
    statusMap[currIndex] = DFSStatus.Current as Status;

    pushTrace(
      TAGS.POP,
      {
        curr: currIndex,
        dist: distanceMap[currIndex],
        "stack size": stack.length,
        "visited count": visited.size,
      },
      { poppingNodeId: String(currIndex) },
    );

    if (!visited.has(currIndex)) result.push(currIndex);

    if (visited.has(currIndex)) {
      pushTrace(TAGS.POP, { curr: currIndex, "already visited": "True" }, {});
      continue;
    }

    visited.add(currIndex);

    pushTrace(
      TAGS.CHECK_END,
      {
        curr: currIndex,
        end: endIndex,
        "curr === end": currIndex === endIndex ? "True" : "False",
        dist: distanceMap[currIndex],
      },
      {},
    );

    if (currIndex === endIndex) {
      found = true;
      statusMap[currIndex] = DFSStatus.Path as Status;
      break;
    }

    statusMap[currIndex] = DFSStatus.Visited as Status;

    const r = Math.floor(currIndex / cols);
    const c = currIndex % cols;
    let pushedCount = 0; // 用於判斷死胡同

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const nIndex = nr * cols + nc;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (gridData[nIndex].val !== 1 && !discovered.has(nIndex)) {
          discovered.add(nIndex);
          parentMap.set(nIndex, currIndex);
          stack.push(nIndex);
          pushedCount++;

          distanceMap[nIndex] =
            distanceMap[currIndex] !== undefined
              ? distanceMap[currIndex] + 1
              : 1;
          statusMap[nIndex] = DFSStatus.Discovered as Status;

          pushTrace(
            TAGS.PUSH_NEIGHBOR,
            {
              curr: currIndex,
              neighbor: nIndex,
              "depth[new]": distanceMap[nIndex],
              "stack size (after)": stack.length,
            },
            { pushingNodeIds: [String(nIndex)] },
          );

          pushTrace(
            TAGS.PUSH_NEIGHBOR,
            {
              curr: currIndex,
              neighbor: nIndex,
              "depth[new]": distanceMap[nIndex],
              "stack size (after)": stack.length,
            },
            {},
          );
        }
      }
    }

    if (pushedCount === 0) {
      pushTrace(TAGS.BACKTRACK, { curr: currIndex, "dead end": "True" }, {});
    }
  }

  if (found) {
    let curr = endIndex;
    const path = [endIndex];
    while (curr !== startIndex) {
      const parent = parentMap.get(curr);
      if (parent === undefined) break;
      path.push(parent);
      curr = parent;
    }
    path.forEach((idx) => {
      statusMap[idx] = DFSStatus.Path as Status;
    });
    pushTrace(
      TAGS.PATH_FOUND,
      { end: endIndex, dist: distanceMap[endIndex] },
      { pathLength: path.length },
    );
  } else {
    pushTrace(
      TAGS.NOT_FOUND,
      { stack: "[]", end: endIndex, reachable: "False" },
      {},
    );
  }

  return trace;
}

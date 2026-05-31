import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS, BFSStatus } from "./tags";
import { createGraphElements } from "@/data/DataStructure/nonlinear/utils";
import { Node } from "@/modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { linkStatus } from "@/modules/core/Render/D3Renderer";
import { updateLinkStatus } from "@/data/DataStructure/nonlinear/utils";

// Graph BFS
export function simulateGraphBFSTrace(
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
  const visited = new Set<string>();
  const parentMap = new Map<string, string>();
  const queue: string[] = [];
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
        queue: [...queue],
        result: [...result],
        ...meta,
      },
    });
  };

  pushTrace(
    TAGS.GRAPH_INIT,
    { start: realStartId, end: realEndId, "distance[all]": "∞" },
    {},
  );

  queue.push(realStartId);
  visited.add(realStartId);
  statusMap[realStartId] = BFSStatus.Discovered as Status;
  distanceMap[realStartId] = 0;
  pushTrace(
    TAGS.GRAPH_START,
    {
      start: realStartId,
      queue: `[${realStartId}]`,
      visited: `{${realStartId}}`,
      [`distance[${realStartId}]`]: 0,
    },
    { pushingNodeId: realStartId },
  );

  let found = false;

  while (queue.length > 0) {
    const currId = queue.shift()!;
    const currNode = nodeMap.get(currId);
    const parentId = parentMap.get(currId);
    if (parentId)
      updateLinkStatus(
        linkStatusMap,
        parentId,
        currId,
        BFSStatus.Current as linkStatus,
        false,
      );

    statusMap[currId] = BFSStatus.Current as Status;
    pushTrace(
      TAGS.DEQUEUE,
      {
        curr: currId,
        dist: distanceMap[currId],
        queue: queue.length > 0 ? `[${queue.join(", ")}]` : "[]",
        "visited count": visited.size,
      },
      { poppingNodeId: currId },
    );

    result.push(currId);
    pushTrace(
      TAGS.CHECK_END,
      {
        curr: currId,
        end: realEndId,
        "curr === end": currId === realEndId ? "True" : "False",
        [`distance[${currId}]`]: distanceMap[currId],
      },
      {},
    );

    if (currId === realEndId) {
      found = true;
      break;
    }

    if (currNode) {
      const neighbors = currNode.pointers;
      neighbors.sort((a, b) => a.id.localeCompare(b.id));
      const allNeighborIds = neighbors.map((n) => n.id);
      const unvisitedIds = allNeighborIds.filter((id) => !visited.has(id));

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

      const currentDist = distanceMap[currId];

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          parentMap.set(neighbor.id, currId);
          queue.push(neighbor.id);

          statusMap[neighbor.id] = BFSStatus.Discovered as Status;
          updateLinkStatus(
            linkStatusMap,
            currId,
            neighbor.id,
            BFSStatus.Discovered as linkStatus,
            false,
          );

          // 步驟 1: 發現鄰居並加入佇列
          pushTrace(
            TAGS.VISIT_NEIGHBOR,
            {
              curr: currId,
              neighbor: neighbor.id,
              "queue (after)": `[${queue.join(", ")}]`,
            },
            { pushingNodeId: neighbor.id },
          );

          // 步驟 2: 立即更新該鄰居的距離
          distanceMap[neighbor.id] = currentDist + 1;
          pushTrace(
            TAGS.CHANGE_VISITED_VALUE,
            {
              curr: currId,
              neighbor: neighbor.id,
              "distance[new]": currentDist + 1,
            },
            {},
          );
        }
      }
    }

    statusMap[currId] = BFSStatus.Visited as Status;
    if (parentId)
      updateLinkStatus(
        linkStatusMap,
        parentId,
        currId,
        BFSStatus.Visited as linkStatus,
        false,
      );
  }

  if (found) {
    let curr = realEndId;
    const path: string[] = [realEndId];
    while (curr !== realStartId) {
      const parent = parentMap.get(curr);
      if (!parent) break;
      updateLinkStatus(
        linkStatusMap,
        parent,
        curr,
        BFSStatus.Path as linkStatus,
        false,
      );
      path.push(parent);
      curr = parent;
    }
    path.forEach((id) => (statusMap[id] = BFSStatus.Path as Status));
    pushTrace(
      TAGS.PATH_FOUND,
      { end: realEndId, "shortest distance": distanceMap[realEndId] },
      {},
    );
  } else {
    pushTrace(
      TAGS.NOT_FOUND,
      { queue: "[]", end: realEndId, reachable: "False" },
      {},
    );
  }

  return trace;
}

// Grid BFS
export function simulateGridBFSTrace(
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
  const parentMap = new Map<number, number>();
  const statusMap: Record<number, Status> = {};
  const distanceMap: Record<number, number> = {};
  const queue: number[] = [];
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
        queue: queue.map(String),
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
    TAGS.GRID_INIT,
    { start: startIndex, end: endIndex },
    { showIdAsValue: true },
  );
  pushTrace(
    TAGS.GRID_INIT_DIST,
    { start: startIndex, end: endIndex, "distance[all]": "∞" },
    { showIdAsValue: false },
  );

  queue.push(startIndex);
  visited.add(startIndex);
  statusMap[startIndex] = BFSStatus.Discovered as Status;
  distanceMap[startIndex] = 0;
  pushTrace(
    TAGS.GRID_START,
    {
      start: startIndex,
      queue: `[${startIndex}]`,
      visited: `{${startIndex}}`,
      "distance[start]": 0,
    },
    { pushingNodeId: String(startIndex) },
  );

  let found = false;
  const directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];

  while (queue.length > 0) {
    const currIndex = queue.shift()!;
    statusMap[currIndex] = BFSStatus.Current as Status;

    pushTrace(
      TAGS.DEQUEUE,
      {
        curr: currIndex,
        dist: distanceMap[currIndex],
        "visited count": visited.size,
        queue: queue.length > 0 ? `[${queue.join(", ")}]` : "[]",
      },
      { poppingNodeId: String(currIndex) },
    );
    result.push(currIndex);
    pushTrace(
      TAGS.CHECK_END,
      {
        curr: currIndex,
        end: endIndex,
        "curr === end": currIndex === endIndex ? "True" : "False",
      },
      {},
    );

    if (currIndex === endIndex) {
      found = true;
      break;
    }

    const r = Math.floor(currIndex / cols);
    const c = currIndex % cols;
    const currentDist = distanceMap[currIndex];

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const nIndex = nr * cols + nc;

      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        gridData[nIndex].val !== 1 &&
        !visited.has(nIndex)
      ) {
        visited.add(nIndex);
        parentMap.set(nIndex, currIndex);
        queue.push(nIndex);

        statusMap[nIndex] = BFSStatus.Discovered as Status;

        // 步驟 1: 發現鄰居並加入佇列
        pushTrace(
          TAGS.VISIT_NEIGHBOR,
          {
            curr: currIndex,
            neighbor: nIndex,
            "queue (after)": `[${queue.join(", ")}]`,
          },
          { pushingNodeId: String(nIndex) },
        );

        // 步驟 2: 立即更新距離
        distanceMap[nIndex] = currentDist + 1;
        pushTrace(
          TAGS.CHANGE_VISITED_VALUE,
          {
            curr: currIndex,
            neighbor: nIndex,
            "distance[new]": currentDist + 1,
          },
          {},
        );
      }
    }

    statusMap[currIndex] = BFSStatus.Visited as Status;
  }

  if (found) {
    let curr = endIndex;
    const path: number[] = [endIndex];
    while (curr !== startIndex) {
      const parent = parentMap.get(curr);
      if (parent === undefined) break;
      path.push(parent);
      curr = parent;
    }
    path.forEach((idx) => {
      statusMap[idx] = BFSStatus.Path as Status;
    });
    pushTrace(
      TAGS.PATH_FOUND,
      { end: endIndex, "shortest distance": distanceMap[endIndex] },
      { pathLength: path.length },
    );
  } else {
    pushTrace(
      TAGS.NOT_FOUND,
      { queue: "[]", end: endIndex, reachable: "False" },
      {},
    );
  }

  return trace;
}

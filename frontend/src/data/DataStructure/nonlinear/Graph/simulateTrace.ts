import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export function simulateGraphTrace(
  inputData: any,
  action?: any,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const type = action?.type;
  const isDirected = action?.isDirected || false;
  const rawNodes = inputData.nodes || [];
  const rawEdges = inputData.edges || [];

  const pushTrace = (
    tag: string,
    vars: any,
    statusMap: Record<string, Status> = {},
    linkStatusMap: Record<string, string> = {},
    metaOpts: any = {},
  ) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: rawNodes.map((n: any) => ({ id: n.id, value: n.value })),
      meta: {
        graphData: inputData,
        isDirected,
        statusMap: { ...statusMap },
        linkStatusMap: { ...linkStatusMap },
        ...metaOpts,
      },
    });
  };

  const ensurePrefix = (id: string) =>
    id.startsWith("node-") ? id : `node-${id}`;

  if (!type || type === "refresh") {
    pushTrace(TAGS.INIT, {});
    return trace;
  }

  if (type === "addVertex") {
    const targetId = ensurePrefix(action.value);
    pushTrace(
      TAGS.ADD_VERTEX,
      { insertVal: action.value },
      { [targetId]: Status.Target },
    );
    pushTrace(
      TAGS.ADD_VERTEX_RESULT,
      { insertVal: action.value },
      { [targetId]: Status.Complete },
    );
  } else if (type === "removeVertex") {
    const targetId = ensurePrefix(action.id);
    const linkStatusMap: Record<string, string> = {};

    // Ghost elements logic: 標記準備被刪掉的線
    action.deletedEdges?.forEach(([source, target]: string[]) => {
      if (source === targetId || target === targetId) {
        linkStatusMap[`${source}->${target}`] = Status.Target;
        if (!isDirected) linkStatusMap[`${target}->${source}`] = Status.Target;
      }
    });

    pushTrace(
      TAGS.REMOVE_VERTEX,
      { removeVal: action.id },
      { [targetId]: Status.Target },
      linkStatusMap,
      {
        ghostNode: {
          id: targetId,
          x: action.deletedNodeCoords?.x,
          y: action.deletedNodeCoords?.y,
        },
        deletedEdges: action.deletedEdges,
      },
    );
    pushTrace(TAGS.REMOVE_VERTEX_UPDATE, { removeVal: action.id }, {}, {});
  } else if (type === "addEdge") {
    const sId = ensurePrefix(action.source);
    const tId = ensurePrefix(action.target);
    const linkStatusMap: Record<string, string> = {};

    pushTrace(
      TAGS.ADD_EDGE,
      { source: action.source, target: action.target },
      { [sId]: Status.Target, [tId]: Status.Target },
      {},
      { hideEdge: { source: sId, target: tId } },
    );

    linkStatusMap[`${sId}->${tId}`] = Status.Complete;
    if (!isDirected) linkStatusMap[`${tId}->${sId}`] = Status.Complete;

    pushTrace(
      isDirected ? TAGS.ADD_EDGE : TAGS.ADD_EDGE_UNDIRECTED,
      { source: action.source, target: action.target },
      { [sId]: Status.Complete, [tId]: Status.Complete },
      linkStatusMap,
    );
  } else if (type === "removeEdge") {
    const sId = ensurePrefix(action.source);
    const tId = ensurePrefix(action.target);
    const linkStatusMap: Record<string, string> = {};

    linkStatusMap[`${sId}->${tId}`] = Status.Target;
    if (!isDirected) linkStatusMap[`${tId}->${sId}`] = Status.Target;

    pushTrace(
      TAGS.REMOVE_EDGE,
      { source: action.source, target: action.target },
      { [sId]: Status.Target, [tId]: Status.Target },
      linkStatusMap,
      { forceEdge: { source: sId, target: tId } },
    );
    pushTrace(
      isDirected ? TAGS.REMOVE_EDGE : TAGS.REMOVE_EDGE_UNDIRECTED,
      { source: action.source, target: action.target },
      { [sId]: Status.Complete, [tId]: Status.Complete },
      {},
    );
  } else if (type === "getNeighbors") {
    const targetId = ensurePrefix(action.id);
    pushTrace(
      TAGS.GET_NEIGHBORS,
      { target: action.id },
      { [targetId]: Status.Target },
    );

    const neighbors = rawEdges
      .filter((e: any) => e[0] === targetId)
      .map((e: any) => e[1]);
    if (!isDirected) {
      rawEdges
        .filter((e: any) => e[1] === targetId)
        .forEach((e: any) => neighbors.push(e[0]));
    }

    if (neighbors.length === 0) {
      pushTrace(
        TAGS.GET_NEIGHBORS_RESULT_FALSE,
        { target: action.id, neighborsCount: 0 },
        { [targetId]: Status.Target },
      );
    } else {
      const statusMap: Record<string, Status> = { [targetId]: Status.Target };
      const linkStatusMap: Record<string, string> = {};

      neighbors.forEach((nId: string, idx: number) => {
        statusMap[nId] = Status.Prepare;
        linkStatusMap[`${targetId}->${nId}`] = Status.Prepare;
        if (!isDirected) linkStatusMap[`${nId}->${targetId}`] = Status.Prepare;

        pushTrace(
          TAGS.GET_NEIGHBORS,
          { target: action.id, currentNeighbor: nId.replace("node-", "") },
          { ...statusMap },
          { ...linkStatusMap },
        );

        statusMap[nId] = Status.Complete;
        linkStatusMap[`${targetId}->${nId}`] = Status.Complete;
        if (!isDirected) linkStatusMap[`${nId}->${targetId}`] = Status.Complete;
      });

      pushTrace(
        TAGS.GET_NEIGHBORS_RESULT_TRUE,
        {
          target: action.id,
          neighborsCount: neighbors.length,
          names: neighbors
            .map((n: string) => n.replace("node-", ""))
            .join(", "),
        },
        { ...statusMap },
        { ...linkStatusMap },
      );
    }
  } else if (type === "checkAdjacent") {
    const sId = ensurePrefix(action.source);
    const tId = ensurePrefix(action.target);
    pushTrace(
      TAGS.CHECK_ADJACENT,
      {
        source: action.source,
        target: action.target,
        dirStr: isDirected ? "有向" : "無向",
      },
      { [sId]: Status.Target, [tId]: Status.Target },
    );

    const isConnected = rawEdges.some((e: any) => e[0] === sId && e[1] === tId);
    if (isConnected) {
      pushTrace(
        TAGS.CHECK_ADJACENT_RESULT_TRUE,
        { source: action.source, target: action.target, isAdjacent: true },
        { [sId]: Status.Complete, [tId]: Status.Complete },
        { [`${sId}->${tId}`]: Status.Complete },
      );
    } else {
      pushTrace(
        TAGS.CHECK_ADJACENT_RESULT_FALSE,
        { source: action.source, target: action.target, isAdjacent: false },
        { [sId]: Status.Complete, [tId]: Status.Complete },
      );
    }
  } else if (type === "getDegree") {
    const targetId = ensurePrefix(action.id);
    const tag = isDirected
      ? TAGS.GET_DEGREE_DIRECTED
      : TAGS.GET_DEGREE_UNDIRECTED;
    pushTrace(
      tag,
      { target: action.id, dirStr: isDirected ? "有向" : "無向" },
      { [targetId]: Status.Target },
    );

    const statusMap: Record<string, Status> = {};
    const linkStatusMap: Record<string, string> = {};
    let local_vars: any = { target: action.id };

    if (isDirected) {
      const outNeighbors = rawEdges
        .filter((e: any) => e[0] === targetId)
        .map((e: any) => e[1]);
      outNeighbors.forEach((nId: string) => {
        statusMap[nId] = Status.Complete;
        linkStatusMap[`${targetId}->${nId}`] = Status.Complete;
      });

      const inNeighbors = rawEdges
        .filter((e: any) => e[1] === targetId)
        .map((e: any) => e[0]);
      inNeighbors.forEach((nId: string) => {
        statusMap[nId] = Status.Unfinished;
        linkStatusMap[`${nId}->${targetId}`] = Status.Unfinished;
      });

      local_vars.inDegree = inNeighbors.length;
      local_vars.outDegree = outNeighbors.length;
    } else {
      let degree = 0;
      rawEdges.forEach((e: any) => {
        if (e[0] === targetId) {
          statusMap[e[1]] = Status.Complete;
          linkStatusMap[`${e[0]}->${e[1]}`] = Status.Complete;
          degree++;
        } else if (e[1] === targetId) {
          statusMap[e[0]] = Status.Complete;
          linkStatusMap[`${e[1]}->${e[0]}`] = Status.Complete;
          degree++;
        }
      });
      local_vars.degree = degree;
    }

    pushTrace(tag, { ...local_vars }, { ...statusMap }, { ...linkStatusMap });
  }

  // Check Connected (BFS)
  else if (type === "checkConnected") {
    if (rawNodes.length === 0) return trace;
    const undirectedAdj = new Map<string, string[]>();
    rawNodes.forEach((n: any) => undirectedAdj.set(n.id, []));
    rawEdges.forEach((e: any) => {
      undirectedAdj.get(e[0])?.push(e[1]);
      if (e[0] !== e[1]) undirectedAdj.get(e[1])?.push(e[0]);
    });

    const startNodeId = rawNodes[0].id;
    const visited = new Set<string>();
    const queue: string[] = [startNodeId];
    visited.add(startNodeId);

    const statusMap: Record<string, Status> = { [startNodeId]: Status.Target };
    const linkStatusMap: Record<string, string> = {};

    pushTrace(
      TAGS.CHECK_CONNECTED_INIT,
      { start: startNodeId, queue: queue.join(", ") },
      { ...statusMap },
      { ...linkStatusMap },
    );

    while (queue.length > 0) {
      const currId = queue.shift()!;
      statusMap[currId] = Status.Target;

      pushTrace(
        TAGS.CHECK_CONNECTED_WHILE,
        { current: currId, queue: queue.join(", ") },
        { ...statusMap },
        { ...linkStatusMap },
        { stepKey: "process_node" },
      );

      const neighbors = undirectedAdj.get(currId) || [];
      let newFound = false;

      neighbors.forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
          statusMap[neighborId] = Status.Prepare;
          linkStatusMap[`${currId}->${neighborId}`] = Status.Prepare;
          linkStatusMap[`${neighborId}->${currId}`] = Status.Prepare;
          newFound = true;
        } else if (statusMap[neighborId] === Status.Prepare) {
          linkStatusMap[`${currId}->${neighborId}`] = Status.Prepare;
          linkStatusMap[`${neighborId}->${currId}`] = Status.Prepare;
          newFound = true;
        }
      });

      if (newFound) {
        pushTrace(
          TAGS.CHECK_CONNECTED_WHILE,
          { current: currId, queue: queue.join(", ") },
          { ...statusMap },
          { ...linkStatusMap },
          {
            stepKey: "diffusion",
            visitedSize: visited.size,
            totalNodes: rawNodes.length,
          },
        );
      }

      statusMap[currId] = Status.Complete;
      neighbors.forEach((neighborId) => {
        if (visited.has(neighborId)) {
          linkStatusMap[`${currId}->${neighborId}`] = Status.Complete;
          linkStatusMap[`${neighborId}->${currId}`] = Status.Complete;
        }
      });

      pushTrace(
        TAGS.CHECK_CONNECTED_WHILE,
        { current: currId, queue: queue.join(", ") },
        { ...statusMap },
        { ...linkStatusMap },
        { stepKey: "node_done" },
      );
    }

    const isConnected = visited.size === rawNodes.length;
    const finalStatusMap: Record<string, Status> = { ...statusMap };
    if (!isConnected) {
      rawNodes.forEach((n: any) => {
        if (!visited.has(n.id))
          finalStatusMap[n.id] = Status.Target; // 孤島
        else finalStatusMap[n.id] = Status.Unfinished;
      });
    }
    pushTrace(
      TAGS.CHECK_CONNECTED_RESULT,
      { isConnected },
      { ...finalStatusMap },
      { ...linkStatusMap },
    );
  }

  // Check Cycle (DFS)
  else if (type === "checkCycle") {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const pathStack: string[] = [];
    const statusMap: Record<string, Status> = {};
    const linkStatusMap: Record<string, string> = {};

    let cyclePath: string[] = [];
    let cycleConnectTo = "";
    let hasCycle = false;

    const adj = new Map<string, string[]>();
    rawNodes.forEach((n: any) => adj.set(n.id, []));
    rawEdges.forEach((e: any) => {
      adj.get(e[0])?.push(e[1]);
      if (!isDirected && e[0] !== e[1]) adj.get(e[1])?.push(e[0]);
    });

    const dfs = (currId: string, parentId: string | null): boolean => {
      visited.add(currId);
      pathStack.push(currId);
      if (isDirected) recStack.add(currId);

      statusMap[currId] = Status.Target;
      pushTrace(
        TAGS.CHECK_CYCLE_DFS,
        { current: currId },
        { ...statusMap },
        { ...linkStatusMap },
      );

      const neighbors = adj.get(currId) || [];
      for (const neighborId of neighbors) {
        linkStatusMap[`${currId}->${neighborId}`] = Status.Target;
        if (!isDirected)
          linkStatusMap[`${neighborId}->${currId}`] = Status.Target;

        if (!visited.has(neighborId)) {
          if (dfs(neighborId, currId)) return true;

          statusMap[currId] = Status.Target;
          linkStatusMap[`${currId}->${neighborId}`] = Status.Complete;
          if (!isDirected)
            linkStatusMap[`${neighborId}->${currId}`] = Status.Complete;

          pushTrace(
            TAGS.CHECK_CYCLE_DFS,
            { current: currId },
            { ...statusMap },
            { ...linkStatusMap },
            { stepKey: "return_node" },
          );
          statusMap[currId] = Status.Prepare;
        } else {
          let isCycle = false;
          if (isDirected && recStack.has(neighborId)) isCycle = true;
          else if (!isDirected && neighborId !== parentId) isCycle = true;

          if (isCycle) {
            const startIndex = pathStack.indexOf(neighborId);
            cyclePath = pathStack.slice(startIndex);
            cycleConnectTo = neighborId;

            for (let i = 0; i < cyclePath.length - 1; i++) {
              linkStatusMap[`${cyclePath[i]}->${cyclePath[i + 1]}`] =
                Status.Target;
              if (!isDirected)
                linkStatusMap[`${cyclePath[i + 1]}->${cyclePath[i]}`] =
                  Status.Target;
            }
            cyclePath.forEach((id) => (statusMap[id] = Status.Target));

            pushTrace(
              TAGS.CHECK_CYCLE_FOUND_TRUE,
              { current: currId, cycleNode: neighborId },
              { ...statusMap },
              { ...linkStatusMap },
            );
            return true;
          } else if (neighborId !== parentId) {
            linkStatusMap[`${currId}->${neighborId}`] = Status.Complete;
            if (!isDirected)
              linkStatusMap[`${neighborId}->${currId}`] = Status.Complete;
          }
        }
      }

      if (isDirected) recStack.delete(currId);
      pathStack.pop();

      statusMap[currId] = Status.Complete;
      pushTrace(
        TAGS.CHECK_CYCLE_FOUND_FALSE,
        { current: parentId || currId },
        { ...statusMap },
        { ...linkStatusMap },
      );

      if (parentId !== null) {
        linkStatusMap[`${currId}->${parentId}`] = Status.Unfinished;
        if (!isDirected)
          linkStatusMap[`${parentId}->${currId}`] = Status.Unfinished;
      }
      return false;
    };

    for (const node of rawNodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id, null)) {
          hasCycle = true;
          break;
        }
      }
    }

    if (!hasCycle) {
      const finalStatusMap: Record<string, Status> = {};
      visited.forEach((id) => (finalStatusMap[id] = Status.Unfinished));
      pushTrace(
        TAGS.CHECK_CYCLE_END_FALSE,
        { hasCycle: false },
        { ...finalStatusMap },
        {},
      );
    } else {
      const finalStatusMap: Record<string, Status> = {};
      visited.forEach((id) => (finalStatusMap[id] = Status.Unfinished));
      cyclePath.forEach((id) => (finalStatusMap[id] = Status.Target));

      const fullPathStr = [
        ...cyclePath.map((id) => id.replace("node-", "")),
        cycleConnectTo.replace("node-", ""),
      ].join(" -> ");
      pushTrace(
        TAGS.CHECK_CYCLE_END_TRUE,
        { hasCycle: true, cyclePath: fullPathStr },
        { ...finalStatusMap },
        { ...linkStatusMap },
      );
    }
  }

  return trace;
}

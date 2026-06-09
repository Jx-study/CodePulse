import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS, TopoStatus } from "./tags";

export type GraphData = {
  nodes: { id: string; value?: string; x?: number; y?: number }[];
  edges: string[][];
};

export function simulateTopologicalSortTrace(graph: GraphData): ExecutionTrace {
  const trace: TraceEvent[] = [];
  if (!graph?.nodes || graph.nodes.length === 0) return trace;

  const nodes = graph.nodes;
  let remainingEdges = [...graph.edges];

  // 計算初始 In-Degree
  const inDegree: Record<string, number> = {};
  nodes.forEach((n) => (inDegree[n.id] = 0));
  remainingEdges.forEach((e) => inDegree[e[1]]++);

  const nodeStatus: Record<string, string> = {};
  const edgeStatus: Record<string, string> = {};
  const queue: string[] = [];
  const result: string[] = [];
  let poppingNodeId: string | undefined = undefined;

  const pushTrace = (tag: string, vars: any, meta: any = {}) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: JSON.parse(JSON.stringify(nodes)),
      meta: {
        remainingEdges: [...remainingEdges],
        inDegree: { ...inDegree },
        nodeStatus: { ...nodeStatus },
        edgeStatus: { ...edgeStatus },
        queue: [...queue],
        result: [...result],
        poppingNodeId,
        ...meta,
      },
    });
  };

  // 1. 初始化入度
  pushTrace(TAGS.INIT, {});

  // 2. 將入度為 0 的節點加入佇列
  nodes.forEach((n) => {
    if (inDegree[n.id] === 0) {
      queue.push(n.id);
      nodeStatus[n.id] = TopoStatus.InQueue;
    }
  });
  pushTrace(TAGS.ENQUEUE_ZERO, {});

  // 3. Kahn 主迴圈
  while (queue.length > 0) {
    pushTrace(TAGS.WHILE_LOOP, {});

    const curr = queue.shift()!;
    poppingNodeId = curr;
    nodeStatus[curr] = TopoStatus.Target;
    pushTrace(TAGS.DEQUEUE, { currId: curr });

    result.push(curr);
    poppingNodeId = undefined;
    nodeStatus[curr] = TopoStatus.Complete;
    pushTrace(TAGS.ADD_TO_RESULT, { currId: curr });

    const neighbors = remainingEdges
      .filter((e) => e[0] === curr)
      .map((e) => e[1]);

    for (const neighbor of neighbors) {
      const edgeKey = `${curr}->${neighbor}`;
      edgeStatus[edgeKey] = TopoStatus.Reducing;
      nodeStatus[neighbor] = TopoStatus.Reducing;

      pushTrace(TAGS.REDUCE_NEIGHBOR, { currId: curr, neighborId: neighbor });

      inDegree[neighbor]--;
      remainingEdges = remainingEdges.filter(
        (e) => !(e[0] === curr && e[1] === neighbor),
      );
      delete edgeStatus[edgeKey];

      if (inDegree[neighbor] === 0) {
        nodeStatus[neighbor] = TopoStatus.InQueue;
        queue.push(neighbor);
        pushTrace(
          TAGS.CHECK_ZERO_TRUE,
          { neighborId: neighbor },
          { pushingNodeId: neighbor },
        );
      } else {
        nodeStatus[neighbor] = TopoStatus.Inactive;
        pushTrace(TAGS.CHECK_ZERO_FALSE, {
          neighborId: neighbor,
          deg: inDegree[neighbor],
        });
      }
    }
  }

  // 4. 迴圈結束，環偵測檢查
  pushTrace(TAGS.CYCLE_CHECK_START, {});

  if (result.length < nodes.length) {
    pushTrace(TAGS.CYCLE_DETECTED, {
      resLen: result.length,
      nodeLen: nodes.length,
    });

    nodes.forEach((n) => {
      if (nodeStatus[n.id] !== TopoStatus.Complete) {
        nodeStatus[n.id] = TopoStatus.Error;
      }
    });
    remainingEdges.forEach((e) => {
      edgeStatus[`${e[0]}->${e[1]}`] = TopoStatus.Error;
    });
    pushTrace(TAGS.CYCLE_DEADLOCK, {});
  } else {
    pushTrace(TAGS.SUCCESS_VERIFY, {
      resLen: result.length,
      nodeLen: nodes.length,
    });
    pushTrace(TAGS.DONE, {});
  }

  return trace;
}

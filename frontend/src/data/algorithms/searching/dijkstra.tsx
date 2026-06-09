import type { AnimationStep, CodeConfig } from "@/types";
import type {
  AlgoActionBarProps,
  LevelImplementationConfig,
} from "@/types/implementation";
import { DijkstraActionBar } from "./DijkstraActionBar";
import {
  cloneData,
  generateRandomGraph,
} from "@/modules/core/visualization/visualizationUtils";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { simulateDijkstraTrace } from "./dijkstra/simulateTrace";
import { dijkstraTraceToSteps } from "./dijkstra/traceToSteps";
import { TAGS, DijkstraStatusConfig } from "./dijkstra/tags";

function parseGraphLoadPayload(
  dataStr: string,
): { nodes: any[]; edges: string[][] } | null {
  const parts = dataStr.split(":");
  if (parts.length < 3) return null;
  const nodeCount = parseInt(parts[1], 10);
  if (isNaN(nodeCount)) return null;
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `node-${i}`,
  }));
  const edges: string[][] = [];
  const edgeStr = parts.slice(2).join(":").trim();
  if (edgeStr !== "") {
    edgeStr.split(",").forEach((pair: string) => {
      const [u, v, w] = pair.trim().split(/\s+/);
      if (u !== undefined && v !== undefined) {
        const uIdx = parseInt(u, 10);
        const vIdx = parseInt(v, 10);
        if (
          !isNaN(uIdx) &&
          !isNaN(vIdx) &&
          uIdx >= 0 &&
          uIdx < nodeCount &&
          vIdx >= 0 &&
          vIdx < nodeCount
        ) {
          edges.push(
            w !== undefined
              ? [`node-${uIdx}`, `node-${vIdx}`, w]
              : [`node-${uIdx}`, `node-${vIdx}`],
          );
        }
      }
    });
  }
  return { nodes, edges };
}

function dijkstraActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: any,
  context: ActionContext,
): ActionResult<unknown> | null {
  const defaultData = context.defaultData as { graph: any };

  if (actionType === "random") {
    const count = Math.floor(Math.random() * 6) + 5;
    const newData = generateRandomGraph(count, true);
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: { mode: "graph", isDirected: payload.isDirected },
      isResetAction: false,
    };
  }

  if (actionType === "load") {
    const dataStr = payload.data as string;
    if (typeof dataStr !== "string" || !dataStr.startsWith("GRAPH:"))
      return null;
    const graphPayload = parseGraphLoadPayload(dataStr);
    if (!graphPayload) return null;
    return {
      animationData: cloneData(graphPayload),
      useRawAnimationParams: true,
      animationParams: { mode: "graph", isDirected: payload.isDirected },
      isResetAction: false,
    };
  }

  if (actionType === "reset") {
    const newData = cloneData(defaultData.graph);
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: { mode: "graph", ...payload },
      isResetAction: false,
    };
  }

  if (actionType === "refresh") {
    return {
      animationData: cloneData(data),
      useRawAnimationParams: true,
      animationParams: { mode: "graph", isDirected: payload.isDirected },
      isResetAction: false,
    };
  }

  if (actionType === "run") {
    return { animationData: cloneData(data) };
  }

  return null;
}

export function createDijkstraAnimationSteps(
  inputData: any,
  action?: any,
): AnimationStep[] {
  const trace = simulateDijkstraTrace(inputData, action);
  return dijkstraTraceToSteps(trace);
}

const dijkstraCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure Dijkstra(Graph, start_node):
  For each node v in Graph:
    dist[v] ← Infinity
  dist[start_node] ← 0
  PQ ← PriorityQueue()
  PQ.insert(start_node, 0)

  While PQ is not empty Do
    curr_node ← PQ.extractMin()

    For each neighbor of curr_node Do
      new_dist ← dist[curr_node] + weight(curr_node, neighbor)
      
      If new_dist < dist[neighbor] Then
        dist[neighbor] ← new_dist
        PQ.insert(neighbor, new_dist)
      End If
    End For
  End While

  Return dist
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2, 3, 4, 5, 6],
      [TAGS.WHILE_QUEUE_NOT_EMPTY]: [8],
      [TAGS.EXTRACT_MIN]: [9],
      [TAGS.CHECK_NEIGHBORS]: [11, 12],
      [TAGS.RELAX_EDGE_TRUE]: [14, 15, 16],
      [TAGS.RELAX_EDGE_FALSE]: [14],
      [TAGS.DONE]: [21, 22],
    },
  },
  python: {
    content: `import heapq

def dijkstra(graph, start_node):
    dist = {v: float('inf') for v in graph}
    dist[start_node] = 0
    pq = [(0, start_node)]
    
    while pq:
        current_dist, curr_node = heapq.heappop(pq)
        
        if current_dist > dist[curr_node]:
            continue
            
        for neighbor, weight in graph[curr_node]:
            new_dist = current_dist + weight
            
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                heapq.heappush(pq, (new_dist, neighbor))

    return dist`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(1)' },                                  // import heapq
      { lineNumber: 3,  complexity: 'O(n log n)' },                            // def dijkstra(graph, start_node):
      { lineNumber: 4,  complexity: 'O(n)' },                                  // dist = {v: float('inf') for v in graph}
      { lineNumber: 5,  complexity: 'O(1)' },                                  // dist[start_node] = 0
      { lineNumber: 6,  complexity: 'O(1)' },                                  // pq = [(0, start_node)]
      { lineNumber: 8,  complexity: 'O(n log n)' },                            // while pq:
      { lineNumber: 9,  complexity: 'O(log n)', context: 'O(n)' },             // current_dist, curr_node = heapq.heappop(pq)
      { lineNumber: 11, complexity: 'O(1)', context: 'O(n)' },                 // if current_dist > dist[curr_node]:
      { lineNumber: 12, complexity: 'O(1)', context: 'O(n)' },                 // continue
      { lineNumber: 14, complexity: 'O(n)', context: 'O(n)' },                 // for neighbor, weight in graph[curr_node]:
      { lineNumber: 15, complexity: 'O(1)', context: 'O(n)' },                 // new_dist = current_dist + weight
      { lineNumber: 17, complexity: 'O(1)', context: 'O(n)' },                 // if new_dist < dist[neighbor]:
      { lineNumber: 18, complexity: 'O(1)', context: 'O(n)' },                 // dist[neighbor] = new_dist
      { lineNumber: 19, complexity: 'O(log n)', context: 'O(n)' },             // heapq.heappush(pq, (new_dist, neighbor))
      { lineNumber: 21, complexity: 'O(1)' },                                  // return dist
    ],
  },
};

export const dijkstraConfig: LevelImplementationConfig = {
  id: "dijkstra",
  type: "algorithm",
  name: "Dijkstra 最短路徑",
  categoryName: "圖論演算法",
  description: "在帶權重圖形中尋找單源最短路徑",
  i18nNamespace: "tutorials/dijkstra",
  codeConfig: dijkstraCodeConfig,
  complexity: {
    timeBest: "O((V+E) log V)",
    timeAverage: "O((V+E) log V)",
    timeWorst: "O((V+E) log V)",
    space: "O(V)",
  },
  introduction: `Dijkstra 演算法用於解決「單源最短路徑」問題。它將節點分為「已完成」與「未完成」兩個集合，每次從未完成集合中挑選距離起點最近的節點，並更新（鬆弛）它的所有相鄰節點的距離。請注意，它無法處理帶有負權重的邊。`,
  defaultData: {
    graph: {
      nodes: [
        { id: "node-0" },
        { id: "node-1" },
        { id: "node-2" },
        { id: "node-3" },
        { id: "node-4" },
      ],
      edges: [
        // u, v, weight
        ["node-0", "node-1", "4"],
        ["node-0", "node-2", "2"],
        ["node-1", "node-2", "5"],
        ["node-1", "node-3", "10"],
        ["node-2", "node-4", "3"],
        ["node-4", "node-3", "4"],
        ["node-3", "node-2", "6"],
      ],
    },
  },
  linkAnimConfig: {
    animateOn: ["target"],
    directOn: ["prepare", "complete", "unfinished"],
  },
  createAnimationSteps: createDijkstraAnimationSteps,
  statusConfig: DijkstraStatusConfig,
  actionHandler: dijkstraActionHandler,
  renderActionBar: (props) => (
    <DijkstraActionBar {...(props as AlgoActionBarProps)} />
  ),
  maxNodes: 15,
  relatedProblems: [
    {
      id: 743,
      title: "Network Delay Time",
      concept: "relatedProblems.743",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/network-delay-time/",
    },
    {
      id: 1631,
      title: "Path With Minimum Effort",
      concept: "relatedProblems.1631",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/path-with-minimum-effort/",
    },
    {
      id: 1514,
      title: "Path with Maximum Probability",
      concept: "relatedProblems.1514",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/path-with-maximum-probability/",
    },
    {
      id: 787,
      title: "Cheapest Flights Within K Stops",
      concept: "relatedProblems.787",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    },
    {
      id: 778,
      title: "Swim in Rising Water",
      concept: "relatedProblems.778",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/swim-in-rising-water/",
    },
  ],
};

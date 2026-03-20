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
import type { ActionContext, ActionResult } from "@/modules/core/visualization/types";

function parseGraphLoadPayload(dataStr: string): { nodes: any[]; edges: string[][] } | null {
  const parts = dataStr.split(":");
  if (parts.length < 3) return null;
  const nodeCount = parseInt(parts[1], 10);
  if (isNaN(nodeCount)) return null;
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({ id: `node-${i}` }));
  const edges: string[][] = [];
  const edgeStr = parts.slice(2).join(":").trim();
  if (edgeStr !== "") {
    edgeStr.split(",").forEach((pair: string) => {
      const [u, v, w] = pair.trim().split(/\s+/);
      if (u !== undefined && v !== undefined) {
        const uIdx = parseInt(u, 10);
        const vIdx = parseInt(v, 10);
        if (!isNaN(uIdx) && !isNaN(vIdx) && uIdx >= 0 && uIdx < nodeCount && vIdx >= 0 && vIdx < nodeCount) {
          edges.push(w !== undefined ? [`node-${uIdx}`, `node-${vIdx}`, w] : [`node-${uIdx}`, `node-${vIdx}`]);
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
      animationParams: { mode: "graph" },
      needsSyncCoordinates: true,
      isResetAction: false,
    };
  }

  if (actionType === "load") {
    const dataStr = payload.data as string;
    if (typeof dataStr !== "string" || !dataStr.startsWith("GRAPH:")) return null;
    const graphPayload = parseGraphLoadPayload(dataStr);
    if (!graphPayload) return null;
    return {
      animationData: cloneData(graphPayload),
      useRawAnimationParams: true,
      animationParams: { mode: "graph", isDirected: payload.Directed },
      needsSyncCoordinates: true,
      isResetAction: false,
    };
  }

  if (actionType === "reset") {
    const newData = cloneData(defaultData.graph);
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: { mode: "graph", ...payload },
      needsSyncCoordinates: true,
      isResetAction: false,
    };
  }

  if (actionType === "run") {
    return { animationData: cloneData(data) };
  }

  return null;
}
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { linkStatus } from "@/modules/core/Render/D3Renderer";
import {
  createGraphElements,
  generateGraphFrame,
  getLinkKey,
  updateLinkStatus,
} from "@/data/DataStructure/nonlinear/utils";

const TAGS = {
  INIT: "INIT",
  WHILE_QUEUE_NOT_EMPTY: "WHILE_QUEUE_NOT_EMPTY",
  EXTRACT_MIN: "EXTRACT_MIN",
  CHECK_NEIGHBORS: "CHECK_NEIGHBORS",
  RELAX_EDGE_TRUE: "RELAX_EDGE_TRUE",
  RELAX_EDGE_FALSE: "RELAX_EDGE_FALSE",
  DONE: "DONE",
};

export function createDijkstraAnimationSteps(
  inputData: any,
  action?: any,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  if (!inputData || !inputData.nodes) return steps;

  const isDirected = action?.isDirected || false;

  const baseElements = createGraphElements(inputData, isDirected);

  const rawNodes = inputData.nodes;
  const rawEdges = inputData.edges || [];
  const startNodeId = action?.startNode || rawNodes[0]?.id || "node-0";
  const endNodeId = action?.endNode || "";

  // 建立鄰接表與權重表
  const adjList: Record<string, { to: string; weight: number }[]> = {};
  const weightMap: Record<string, number> = {};

  rawNodes.forEach((n: any) => (adjList[n.id] = []));

  rawEdges.forEach((edge: any) => {
    const u = edge[0];
    const v = edge[1];
    const weight =
      edge[2] !== undefined
        ? parseInt(edge[2], 10)
        : Math.floor(Math.random() * 9) + 1;

    if (adjList[u]) adjList[u].push({ to: v, weight });
    if (!isDirected && adjList[v]) adjList[v].push({ to: u, weight });

    // 儲存權重供 UI 顯示
    weightMap[getLinkKey(u, v)] = weight;
    if (!isDirected) weightMap[getLinkKey(v, u)] = weight;
  });

  const dist: Record<string, number> = {};
  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, linkStatus> = {};
  const visited: Set<string> = new Set();

  rawNodes.forEach((n: any) => {
    dist[n.id] = Infinity;
    statusMap[n.id] = Status.Unfinished;
  });
  dist[startNodeId] = 0;

  const initialFrame = generateGraphFrame(
    baseElements,
    statusMap,
    dist,
    "載入圖形與權重資訊",
    true,
    linkStatusMap,
    weightMap,
  );
  initialFrame.actionTag = TAGS.INIT;
  initialFrame.stepNumber = 0;

  // 幫 Step 0 也加上右側的 Table (此時 Table 裡的 dist 應該都是 ∞)
  initialFrame.elements = [...initialFrame.elements];

  // 產生初始的 dist 字串供 Inspector 顯示
  const initialDistString = Object.entries(dist)
    .map(([nodeId, val]) => {
      const id = nodeId.replace("node-", "");
      const valueStr = val === Infinity ? "∞" : val;
      return `${id}: ${valueStr}`;
    })
    .join(", ");
  initialFrame.variables = { 目前距離表: initialDistString };

  steps.push(initialFrame);

  // 輔助函式：呼叫共用的 generateGraphFrame
  const recordStep = (desc: string, tag: string) => {
    const step = generateGraphFrame(
      baseElements,
      statusMap,
      dist,
      desc,
      false, // 不要顯示 ID，顯示距離
      linkStatusMap,
      weightMap,
    );
    step.actionTag = tag;
    step.stepNumber = steps.length;

    step.elements = [...step.elements];

    // 效果例如："0: 0, 1: 4, 2: ∞, 3: ∞"
    const distString = Object.entries(dist)
      .map(([nodeId, val]) => {
        // 把 "node-0" 簡化為 "0"，並把 Infinity 轉為 "∞"
        const id = nodeId.replace("node-", "");
        const valueStr = val === Infinity ? "∞" : val;
        return `${id}: ${valueStr}`;
      })
      .join(", ");

    // 將字串塞入 variables
    step.variables = { 目前距離表: distString };
    steps.push(step);
  };

  recordStep(
    `初始化：將起點 ${startNodeId} 的距離設為 0，其餘節點設為 ∞`,
    TAGS.INIT,
  );

  // 使用簡單陣列模擬 Priority Queue
  const pq = [...rawNodes.map((n: any) => n.id)];

  while (pq.length > 0) {
    // 依距離排序，抓出最小的
    pq.sort((a, b) => dist[a] - dist[b]);
    const u = pq.shift()!;

    if (dist[u] === Infinity) break;

    // 提早結束邏輯(有輸入終點時)
    if (endNodeId && u === endNodeId) {
      statusMap[u] = Status.Complete;
      recordStep(
        `節點 ${u} 是目標終點，且已確定最短路徑 (${dist[u]})，提早結束搜尋！`,
        TAGS.DONE,
      );
      break;
    }

    statusMap[u] = Status.Target;
    recordStep(
      `從未完成的節點中，取出距離最小的節點 ${u} (距離=${dist[u]})`,
      TAGS.EXTRACT_MIN,
    );

    const neighbors = adjList[u];
    for (const edge of neighbors) {
      const v = edge.to;
      const weight = edge.weight;

      if (visited.has(v)) continue; // 已經定案的節點不再更新

      updateLinkStatus(linkStatusMap, u, v, "target", isDirected);
      recordStep(
        `檢查相鄰節點 ${v}，經過此邊的權重為 ${weight}`,
        TAGS.CHECK_NEIGHBORS,
      );

      const alt = dist[u] + weight;
      if (alt < dist[v]) {
        dist[v] = alt;
        // 標記發現的最短路徑邊
        statusMap[v] = Status.Prepare;
        updateLinkStatus(linkStatusMap, u, v, "path", isDirected);
        recordStep(
          `發現更短路徑，從 ${u} 到 ${v} 的新距離是 ${alt}，更新距離表`,
          TAGS.RELAX_EDGE_TRUE,
        );
        statusMap[v] = Status.Unfinished;
      } else {
        recordStep(
          `不需更新：新距離 ${alt} 並未小於目前的距離`,
          TAGS.RELAX_EDGE_FALSE,
        );
      }

      // 檢查完把線的顏色恢復
      updateLinkStatus(linkStatusMap, u, v, "default", isDirected);
    }

    visited.add(u);
    statusMap[u] = Status.Complete;
    recordStep(
      `節點 ${u} 的相鄰邊已檢查完畢，確定其最短路徑。`,
      TAGS.WHILE_QUEUE_NOT_EMPTY,
    );
  }

  if (!endNodeId || dist[endNodeId] === Infinity) {
    recordStep("演算法執行完畢！所有可達節點的最短路徑皆已找出。", TAGS.DONE);
  }

  return steps;
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
  },
};

export const dijkstraConfig: LevelImplementationConfig = {
  id: "dijkstra",
  type: "algorithm",
  name: "Dijkstra 最短路徑",
  categoryName: "圖論演算法",
  description: "在帶權重圖形中尋找單源最短路徑",
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
  createAnimationSteps: createDijkstraAnimationSteps,
  actionHandler: dijkstraActionHandler,
  renderActionBar: (props) => <DijkstraActionBar {...(props as AlgoActionBarProps)} />,
  maxNodes: 15,
  relatedProblems: [
    {
      id: 743,
      title: "Network Delay Time",
      concept: "單源最短路徑：Dijkstra 從源節點出發，求所有節點都收到訊號的最短等待時間",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/network-delay-time/",
    },
    {
      id: 1631,
      title: "Path With Minimum Effort",
      concept: "Dijkstra 變形：最小化路徑上相鄰格高度差的最大值，以最小堆追蹤當前最大落差",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/path-with-minimum-effort/",
    },
    {
      id: 1514,
      title: "Path with Maximum Probability",
      concept: "最大概率路徑：將 Dijkstra 的加法改為乘法，最大堆優先擴展當前概率最高的節點",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/path-with-maximum-probability/",
    },
    {
      id: 787,
      title: "Cheapest Flights Within K Stops",
      concept: "限轉機次數的最短路徑：對每個節點額外追蹤已用步數，限制最多 k 次中途停靠",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    },
    {
      id: 778,
      title: "Swim in Rising Water",
      concept: "最小瓶頸路徑：Dijkstra 以最小堆選出當前最小的水位高度格，求到達右下角的最低水位",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/swim-in-rising-water/",
    },
  ],
};

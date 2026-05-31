import type { AnimationStep, CodeConfig } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import { bfsRealWorldStories } from "@/data/algorithms/searching/bfs.stories";
import { BFSDFSActionBar } from "./BFSDFSActionBar";
import {
  cloneData,
  generateRandomGraph,
  generateRandomGrid,
} from "@/modules/core/visualization/visualizationUtils";
import type {
  ActionContext,
  GraphData,
} from "@/modules/core/visualization/types";
import type { ActionResult } from "@/modules/core/visualization/types";
import {
  simulateGraphBFSTrace,
  simulateGridBFSTrace,
} from "./BFS/simulateTrace";
import { bfsTraceToSteps } from "./BFS/traceToSteps";
import { TAGS, BFSStatusConfig } from "./BFS/tags";

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

function parseGridLoadPayload(
  dataStr: string,
): { cols: number; values: number[] } | null {
  const parts = dataStr.split(":");
  if (parts.length !== 3) return null;
  const cols = parseInt(parts[1], 10);
  const values = parts[2].split(",").map(Number);
  if (isNaN(cols) || values.some((v) => isNaN(v))) return null;
  return { cols, values };
}

function bfsActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: any,
  context: ActionContext,
): ActionResult<unknown> | null {
  const defaultData = context.defaultData as { graph: GraphData; grid: any[] };

  if (actionType === "random") {
    const mode = (payload.mode as string) || "graph";
    if (mode === "grid") {
      const rows = (payload.rows as number) || 3;
      const cols = (payload.cols as number) || 5;
      const newData = generateRandomGrid(rows, cols);
      return {
        animationData: newData,
        useRawAnimationParams: true,
        animationParams: { mode: "grid", cols },
        isResetAction: false,
      };
    }
    const count = Math.floor(Math.random() * 6) + 5;
    const newData = generateRandomGraph(count, true);
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: { mode: "graph" },
      isResetAction: false,
    };
  }

  if (actionType === "load") {
    const dataStr = payload.data as string;
    if (typeof dataStr !== "string") return null;
    if (dataStr.startsWith("GRAPH:")) {
      const graphPayload = parseGraphLoadPayload(dataStr);
      if (!graphPayload) return null;
      return {
        animationData: cloneData(graphPayload),
        useRawAnimationParams: true,
        animationParams: { mode: "graph", isDirected: payload.Directed },
        isResetAction: false,
      };
    }
    if (dataStr.startsWith("GRID:")) {
      const gridPayload = parseGridLoadPayload(dataStr);
      if (!gridPayload) return null;
      const newData = gridPayload.values.map((val, i) => ({
        id: `box-${i}`,
        val,
      }));
      return {
        animationData: newData,
        useRawAnimationParams: true,
        animationParams: { mode: "grid", cols: gridPayload.cols },
        isResetAction: false,
      };
    }
    return null;
  }

  if (actionType === "reset") {
    const modeVal = (payload.mode as string) || "graph";
    if (modeVal === "grid") {
      const newData = cloneData(defaultData.grid);
      return {
        animationData: newData,
        useRawAnimationParams: true,
        animationParams: { mode: "grid", cols: 5, ...payload },
        isResetAction: false,
      };
    }
    const newData = cloneData(defaultData.graph) as GraphData;
    const isGraphData = (d: any): d is GraphData =>
      d && !Array.isArray(d) && Array.isArray(d.nodes);
    if (isGraphData(data)) {
      const coordMap = new Map(
        data.nodes.map((n: any) => [n.id, { x: n.x, y: n.y }]),
      );
      newData.nodes.forEach((n: any) => {
        const saved = coordMap.get(n.id);
        if (saved?.x != null && saved?.y != null) {
          n.x = saved.x;
          n.y = saved.y;
        }
      });
    }
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: { mode: "graph", ...payload },
      isResetAction: false,
    };
  }

  if (actionType === "run") {
    return { animationData: cloneData(data) };
  }

  if (actionType === "switchMode") {
    const newData =
      payload.mode === "graph"
        ? cloneData(defaultData.graph)
        : cloneData(defaultData.grid);
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: { ...payload, action: "switchMode" },
      isResetAction: false,
    };
  }

  return null;
}

export function createBFSAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  const startNodeId = action?.startNode;
  const endNodeId = action?.endNode;

  const trace =
    action?.mode === "grid"
      ? simulateGridBFSTrace(
          inputData,
          action?.cols || 5,
          startNodeId,
          endNodeId,
        )
      : simulateGraphBFSTrace(inputData, startNodeId, endNodeId);

  return bfsTraceToSteps(trace);
}

const bfsGraphCodeConfig = {
  pseudo: {
    content: `Procedure BFS_Graph(graph, start, end):
  Initialize distance[all] ← ∞
  distance[start] ← 0
  Queue ← [start], visited ← {start}

  While Queue is not empty Do
    curr ← Dequeue from Queue

    If curr = end Then
      Return distance[end]
    End If

    For each neighbor of curr Do
      If neighbor is not visited Then
        visited ← visited ∪ {neighbor}
        distance[neighbor] ← distance[curr] + 1
        Enqueue neighbor to Queue
      End If
    End For
  End While

  Return -1
End Procedure`,
    mappings: {
      [TAGS.GRAPH_INIT]: [1, 2],
      [TAGS.GRAPH_START]: [3, 4],
      [TAGS.DEQUEUE]: [6, 7],
      [TAGS.CHECK_END]: [9],
      [TAGS.EXPLORE]: [13, 14],
      [TAGS.VISIT_NEIGHBOR]: [15],
      [TAGS.CHANGE_VISITED_VALUE]: [16, 17],
      [TAGS.PATH_FOUND]: [10],
      [TAGS.NOT_FOUND]: [22],
    } as Record<string, number[]>,
  },
  python: {
    content: `from collections import deque

def bfs(graph, start, end):
    # 初始化距離與訪問狀態
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    queue = deque([start])
    visited = {start}

    while queue:
        curr = queue.popleft()
        
        # 檢查是否到達終點
        if curr == end:
            return distances[curr]
            
        # 遍歷鄰居
        for neighbor in graph[curr]:
            if neighbor not in visited:
                visited.add(neighbor)
                distances[neighbor] = distances[curr] + 1
                queue.append(neighbor)
                
    return -1`,
  },
};

const bfsGridCodeConfig = {
  pseudo: {
    content: `Procedure BFS_Grid(grid, cols, start, end):
  Initialize distance[all] ← ∞
  distance[start] ← 0
  Queue ← [start], visited ← {start}

  While Queue is not empty Do
    nextQueue ← []

    If end ∈ Queue Then
      Return distance[end]
    End If

    For each curr in Queue Do
      For each neighbor in Adjacent(curr, grid, cols) Do
        If neighbor not visited And not wall Then
          visited ← visited ∪ {neighbor}
          distance[neighbor] ← distance[curr] + 1
          Append neighbor to nextQueue
        End If
      End For
    End For

    Queue ← nextQueue
  End While

  Return -1
End Procedure`,
    mappings: {
      [TAGS.GRID_INIT]: [1],
      [TAGS.GRID_INIT_DIST]: [2],
      [TAGS.GRID_START]: [3, 4],
      [TAGS.DEQUEUE]: [6, 7],
      [TAGS.CHECK_END]: [9],
      [TAGS.VISIT_NEIGHBOR]: [15, 16, 17, 18],
      [TAGS.PATH_FOUND]: [10],
      [TAGS.NOT_FOUND]: [26],
    } as Record<string, number[]>,
  },
  python: bfsGraphCodeConfig.python,
};

export const BFSConfig: LevelImplementationConfig = {
  id: "bfs",
  type: "algorithm",
  name: "廣度優先搜尋 (Breadth-First Search)",
  categoryName: "搜尋演算法",
  description: "廣度優先搜尋演算法，用於圖或樹的遍歷",
  i18nNamespace: "tutorials/bfs",
  codeConfig: bfsGraphCodeConfig,
  getCodeConfig: (payload?: any): CodeConfig => {
    if (payload?.mode === "grid") return bfsGridCodeConfig;
    return bfsGraphCodeConfig;
  },
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(V + E)",
    timeWorst: "O(V + E)",
    space: "O(V)",
  },
  introduction: `廣度優先搜尋 (BFS) 是一種圖或樹的遍歷演算法，它從根節點開始，逐層遍歷所有節點。它使用佇列來管理待訪問的節點，確保每一層的節點都被訪問過一次。
BFS 的時間複雜度為 O(V + E)，其中 V 是節點數量，E 是邊數量。空間複雜度為 O(V)。`,
  defaultData: {
    // 分開定義兩種預設資料
    graph: {
      nodes: [
        { id: "node-0" },
        { id: "node-1" },
        { id: "node-2" },
        { id: "node-3" },
        { id: "node-4" },
        { id: "node-5" },
        { id: "node-6" },
        { id: "node-7" },
        { id: "node-8" },
      ],
      edges: [
        ["node-0", "node-1"],
        ["node-0", "node-2"],
        ["node-1", "node-3"],
        ["node-2", "node-4"],
        ["node-3", "node-4"],
        ["node-3", "node-5"],
        ["node-4", "node-6"],
        ["node-5", "node-7"],
        ["node-6", "node-8"],
        ["node-7", "node-8"],
      ],
    },
    grid: [
      { id: "box-0", val: 0 },
      { id: "box-1", val: 0 },
      { id: "box-2", val: 0 },
      { id: "box-3", val: 0 },
      { id: "box-4", val: 0 },
      { id: "box-5", val: 0 },
      { id: "box-6", val: 1 },
      { id: "box-7", val: 1 },
      { id: "box-8", val: 1 },
      { id: "box-9", val: 0 },
      { id: "box-10", val: 0 },
      { id: "box-11", val: 0 },
      { id: "box-12", val: 0 },
      { id: "box-13", val: 0 },
      { id: "box-14", val: 0 },
    ],
  },
  createAnimationSteps: createBFSAnimationSteps,
  statusConfig: BFSStatusConfig,
  actionHandler: bfsActionHandler,
  defaultViewMode: "graph",
  linkAnimConfig: {
    animateOn: ["prepare"],
    directOn: ["target", "complete"],
  },
  renderActionBar: (props) => <BFSDFSActionBar {...(props as any)} />,
  maxNodes: 15,
  realWorldStories: bfsRealWorldStories,
  relatedProblems: [
    {
      id: 994,
      title: "Rotting Oranges",
      concept:
        "多源 BFS：所有腐爛橘子同時向外擴散，每輪代表一分鐘，計算最短感染時間",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/rotting-oranges/",
    },
    {
      id: 127,
      title: "Word Ladder",
      concept:
        "無權最短路徑：把每個單詞視為節點、相差一字母為邊，BFS 保證找到最短轉換序列",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/word-ladder/",
    },
    {
      id: 542,
      title: "01 Matrix",
      concept:
        "多源 BFS：從所有 0 格同時向外擴展，逐層記錄每個 1 格距離最近 0 的距離",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/01-matrix/",
    },
    {
      id: 286,
      title: "Walls and Gates",
      concept:
        "多源 BFS：從所有門（0）同時出發，以 BFS 層數填入每個空房間到最近門的距離",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/walls-and-gates/",
    },
    {
      id: 1091,
      title: "Shortest Path in Binary Matrix",
      concept:
        "BFS 最短路徑：在二元矩陣中以 8 方向移動，BFS 逐層擴展保證求得最短路徑長度",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
    },
  ],
};

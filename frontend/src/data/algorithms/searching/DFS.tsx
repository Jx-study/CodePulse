import type { AnimationStep, CodeConfig } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
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
import { dfsRealWorldStories } from "@/data/algorithms/searching/dfs.stories";
import {
  simulateGraphDFSTrace,
  simulateGridDFSTrace,
} from "./DFS/simulateTrace";
import { dfsTraceToSteps } from "./DFS/traceToSteps";
import { TAGS, DFSStatusConfig } from "./DFS/tags";

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

function dfsActionHandler(
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

export function createDFSAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  const startNodeId = action?.startNode;
  const endNodeId = action?.endNode;

  const trace =
    action?.mode === "grid"
      ? simulateGridDFSTrace(
          inputData,
          action?.cols || 5,
          startNodeId,
          endNodeId,
        )
      : simulateGraphDFSTrace(inputData, startNodeId, endNodeId);

  return dfsTraceToSteps(trace);
}

const dfsGraphCodeConfig = {
  pseudo: {
    content: `Procedure DFS_Graph(graph, start, end):
  Initialize distance[all] ← ∞
  Stack ← [(start, 0)], visited ← {}
  distance[start] ← 0

  While Stack is not empty Do
    (curr, depth) ← Pop from Stack

    If curr ∈ visited Then
      Continue
    End If
    visited ← visited ∪ {curr}
    distance[curr] ← depth

    If curr = end Then
      Return distance[end]
    End If

    For each neighbor of curr Do
      If neighbor ∉ visited Then
        Push (neighbor, depth + 1) to Stack
      End If
    End For
  End While

  Return -1
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2],
      [TAGS.START]: [3, 4],
      [TAGS.POP]: [6, 7],
      [TAGS.SKIP]: [9, 10],
      [TAGS.DIST_UPDATE]: [12, 13],
      [TAGS.CHECK_END]: [15],
      [TAGS.PATH_FOUND]: [16],
      [TAGS.EXPLORE]: [19, 20],
      [TAGS.PUSH_NEIGHBOR]: [21],
      [TAGS.NOT_FOUND]: [26],
    } as Record<string, number[]>,
  },
  python: {
    content: `def dfs(graph, start, end):
    # 初始化距離
    distances = {node: float('inf') for node in graph}
    distances[start] = 0

    stack = [(start, 0)]  # (node, depth)
    visited = set()

    while stack:
        curr, depth = stack.pop()

        # 跳過已訪問節點
        if curr in visited:
            continue

        visited.add(curr)
        distances[curr] = depth

        # 找到終點
        if curr == end:
            return distances[curr]

        # 遍歷鄰居（降序確保小 ID 先被處理）
        for neighbor in sorted(graph[curr], reverse=True):
            if neighbor not in visited:
                stack.append((neighbor, depth + 1))

    return -1`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(n)' },                                  // def dfs(graph, start, end):
      { lineNumber: 2,  complexity: 'O(1)' },                                  // # 初始化距離
      { lineNumber: 3,  complexity: 'O(n)' },                                  // distances = {node: float('inf')...}
      { lineNumber: 4,  complexity: 'O(1)' },                                  // distances[start] = 0
      { lineNumber: 6,  complexity: 'O(1)' },                                  // stack = [(start, 0)]
      { lineNumber: 7,  complexity: 'O(1)' },                                  // visited = set()
      { lineNumber: 9,  complexity: 'O(n)' },                                  // while stack:
      { lineNumber: 10, complexity: 'O(1)', context: 'O(n)' },                 // curr, depth = stack.pop()
      { lineNumber: 12, complexity: 'O(1)', context: 'O(n)' },                 // # 跳過已訪問節點
      { lineNumber: 13, complexity: 'O(1)', context: 'O(n)' },                 // if curr in visited:
      { lineNumber: 14, complexity: 'O(1)', context: 'O(n)' },                 // continue
      { lineNumber: 16, complexity: 'O(1)', context: 'O(n)' },                 // visited.add(curr)
      { lineNumber: 17, complexity: 'O(1)', context: 'O(n)' },                 // distances[curr] = depth
      { lineNumber: 19, complexity: 'O(1)', context: 'O(n)' },                 // # 找到終點
      { lineNumber: 20, complexity: 'O(1)', context: 'O(n)' },                 // if curr == end:
      { lineNumber: 21, complexity: 'O(1)', context: 'O(n)' },                 // return distances[curr]
      { lineNumber: 23, complexity: 'O(1)', context: 'O(n)' },                 // # 遍歷鄰居（降序...）
      { lineNumber: 24, complexity: 'O(n log n)', context: 'O(n)' },           // for neighbor in sorted(graph[curr], ...):
      { lineNumber: 25, complexity: 'O(1)', context: 'O(n)' },                 // if neighbor not in visited:
      { lineNumber: 26, complexity: 'O(1)', context: 'O(n)' },                 // stack.append((neighbor, depth + 1))
      { lineNumber: 28, complexity: 'O(1)' },                                  // return -1
    ],
  },
};

const dfsGridCodeConfig = {
  pseudo: {
    content: `Procedure DFS_Grid(grid, cols, start, end):
  Initialize distance[all] ← ∞
  distance[start] ← 0
  Stack ← [start], visited ← {start}

  While Stack is not empty Do
    curr ← Pop from Stack

    If curr = end Then
      Return distance[end]
    End If

    For each neighbor in Adjacent(curr, grid, cols) Do
      If neighbor ∉ visited And not wall Then
        visited ← visited ∪ {neighbor}
        distance[neighbor] ← distance[curr] + 1
        Push neighbor to Stack
      End If
    End For

    If no new neighbors pushed Then
      (Dead end — Backtrack)
    End If
  End While

  Return -1
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2, 3],
      [TAGS.START]: [4],
      [TAGS.POP]: [6, 7],
      [TAGS.CHECK_END]: [9],
      [TAGS.PATH_FOUND]: [10],
      [TAGS.PUSH_NEIGHBOR]: [14, 15, 16, 17],
      [TAGS.BACKTRACK]: [21, 22],
      [TAGS.NOT_FOUND]: [26],
    } as Record<string, number[]>,
  },
  python: dfsGraphCodeConfig.python,
};

export const DFSConfig: LevelImplementationConfig = {
  id: "dfs",
  type: "algorithm",
  name: "深度優先搜尋 (Depth-First Search)",
  categoryName: "搜尋演算法",
  description: "深度優先搜尋演算法，用於圖或樹的遍歷",
  i18nNamespace: "tutorials/dfs",
  codeConfig: dfsGraphCodeConfig,
  getCodeConfig: (payload?: any): CodeConfig => {
    if (payload?.mode === "grid") return dfsGridCodeConfig;
    return dfsGraphCodeConfig;
  },
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(V + E)",
    timeWorst: "O(V + E)",
    space: "O(V)",
  },
  introduction: `深度優先搜尋 (DFS) 是一種圖或樹的遍歷演算法，它從根節點開始，逐層遍歷所有節點。它使用堆疊來管理待訪問的節點，確保每一層的節點都被訪問過一次。
DFS 的時間複雜度為 O(V + E)，其中 V 是節點數量，E 是邊數量。空間複雜度為 O(V)。`,
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
  createAnimationSteps: createDFSAnimationSteps,
  statusConfig: DFSStatusConfig,
  actionHandler: dfsActionHandler,
  defaultViewMode: "graph",
  linkAnimConfig: {
    animateOn: ["prepare"],
    directOn: ["target", "complete"],
  },
  renderActionBar: (props) => <BFSDFSActionBar {...(props as any)} />,
  maxNodes: 15,
  relatedProblems: [
    {
      id: 695,
      title: "Max Area of Island",
      concept: "relatedProblems.695",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/max-area-of-island/",
    },
    {
      id: 79,
      title: "Word Search",
      concept: "relatedProblems.79",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/word-search/",
    },
    {
      id: 130,
      title: "Surrounded Regions",
      concept: "relatedProblems.130",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/surrounded-regions/",
    },
    {
      id: 417,
      title: "Pacific Atlantic Water Flow",
      concept: "relatedProblems.417",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    },
    {
      id: 329,
      title: "Longest Increasing Path in a Matrix",
      concept: "relatedProblems.329",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/",
    },
  ],
  realWorldStories: dfsRealWorldStories,
};

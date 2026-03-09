import type { AnimationStep, CodeConfig } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import { BFSDFSActionBar } from "./BFSDFSActionBar";
import {
  cloneData,
  generateRandomGraph,
  generateRandomGrid,
} from "@/modules/core/visualization/visualizationUtils";
import type { ActionContext, GraphData } from "@/modules/core/visualization/types";
import type { ActionResult } from "@/modules/core/visualization/types";

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

function parseGridLoadPayload(dataStr: string): { cols: number; values: number[] } | null {
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
      needsSyncCoordinates: true,
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
        needsSyncCoordinates: true,
        isResetAction: false,
      };
    }
    if (dataStr.startsWith("GRID:")) {
      const gridPayload = parseGridLoadPayload(dataStr);
      if (!gridPayload) return null;
      const newData = gridPayload.values.map((val, i) => ({ id: `box-${i}`, val }));
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
      const coordMap = new Map(data.nodes.map((n: any) => [n.id, { x: n.x, y: n.y }]));
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
      needsSyncCoordinates: true,
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
      needsSyncCoordinates: payload.mode === "graph",
      isResetAction: false,
    };
  }

  return null;
}
import { createGraphElements } from "@/data/DataStructure/nonlinear/utils";
import { Node } from "../../../modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import {
  generateGridFrame,
  generateGraphFrame,
  updateLinkStatus,
} from "@/data/DataStructure/nonlinear/utils";
import { linkStatus } from "@/modules/core/Render/D3Renderer";

const TAGS = {
  INIT: "INIT",
  START: "START",
  POP: "POP",
  SKIP: "SKIP",
  DIST_UPDATE: "DIST_UPDATE",
  CHECK_END: "CHECK_END",
  EXPLORE: "EXPLORE",
  PUSH_NEIGHBOR: "PUSH_NEIGHBOR",
  BACKTRACK: "BACKTRACK",
  PATH_FOUND: "PATH_FOUND",
  NOT_FOUND: "NOT_FOUND",
};

function runGraphDFS(
  graphData: any,
  startId?: string,
  endId?: string,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  let baseElements: Node[] = [];
  if (graphData.nodes && graphData.edges) {
    baseElements = createGraphElements(graphData);
  } else {
    return steps;
  }

  // 建立 ID 對照表
  const nodeMap = new Map<string, Node>();
  baseElements.forEach((node) => nodeMap.set(node.id, node));

  // 排序節點 ID 以確保 start/end 選擇穩定 (最小與最大)
  const sortedIds = baseElements.map((n) => n.id).sort();
  const realStartId = startId && nodeMap.has(startId) ? startId : sortedIds[0];
  const realEndId =
    endId && nodeMap.has(endId) ? endId : sortedIds[sortedIds.length - 1];

  // 狀態變數
  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, linkStatus> = {};
  const distanceMap: Record<string, number> = {}; // DFS 深度
  const parentMap = new Map<string, string>();

  baseElements.forEach((n) => (distanceMap[n.id] = Infinity));

  const initFrame2 = generateGraphFrame(
    baseElements,
    {},
    distanceMap,
    `初始化距離為 ∞，準備開始 DFS`,
  );
  initFrame2.actionTag = TAGS.INIT;
  initFrame2.variables = {
    start: realStartId,
    end: realEndId,
    "distance[all]": "∞",
  };
  steps.push(initFrame2);

  const stack: { id: string; dist: number }[] = [{ id: realStartId, dist: 0 }];
  const visited = new Set<string>();

  statusMap[realStartId] = Status.Prepare;
  distanceMap[realStartId] = 0;
  const startFrame = generateGraphFrame(
    baseElements,
    statusMap,
    distanceMap,
    `將起點 ${realStartId} 推入 Stack（距離: 0）`,
  );
  startFrame.actionTag = TAGS.START;
  startFrame.variables = {
    stack: `[(${realStartId}, 0)]`,
    [`distance[${realStartId}]`]: 0,
  };
  steps.push(startFrame);

  // DFS 主迴圈
  while (stack.length > 0) {
    const item = stack.pop()!;
    const currId = item.id;
    const currDist = item.dist;
    const parentId = parentMap.get(currId);

    if (parentId) {
      updateLinkStatus(linkStatusMap, parentId, currId, "visited", false);
    }

    statusMap[currId] = Status.Target;

    const popFrame = generateGraphFrame(
      baseElements,
      statusMap,
      distanceMap,
      `Pop 出 ${currId}（depth: ${currDist}）`,
      false,
      { ...linkStatusMap },
    );
    popFrame.actionTag = TAGS.POP;
    popFrame.variables = {
      curr: currId,
      depth: currDist,
      stack:
        stack.length > 0
          ? `[${stack.map((s) => `(${s.id}, ${s.dist})`).join(", ")}]`
          : "[]  (空)",
      "visited count": visited.size,
    };
    steps.push(popFrame);

    if (visited.has(currId)) {
      const skipFrame = generateGraphFrame(
        baseElements,
        statusMap,
        distanceMap,
        `${currId} 已訪問，跳過`,
        false,
        { ...linkStatusMap },
      );
      skipFrame.actionTag = TAGS.SKIP;
      skipFrame.variables = {
        curr: currId,
        "already visited": "True",
        [`distance[${currId}]`]: distanceMap[currId],
      };
      steps.push(skipFrame);
      continue;
    }

    visited.add(currId);
    distanceMap[currId] = currDist;

    const distUpdateFrame = generateGraphFrame(
      baseElements,
      { ...statusMap },
      distanceMap,
      `節點 ${currId} 更新距離為 ${currDist}`,
      false,
      { ...linkStatusMap },
    );
    distUpdateFrame.actionTag = TAGS.DIST_UPDATE;
    distUpdateFrame.variables = {
      curr: currId,
      end: realEndId,
      "curr === end": currId === realEndId ? "True" : "False",
      [`distance[${currId}]`]: distanceMap[currId],
    };
    steps.push(distUpdateFrame);

    const checkEndFrame = generateGraphFrame(
      baseElements,
      { ...statusMap },
      distanceMap,
      `判斷：${currId} ${currId === realEndId ? "=== end，找到終點！" : "!== end，繼續搜尋"}`,
      false,
      { ...linkStatusMap },
    );
    checkEndFrame.actionTag = TAGS.CHECK_END;
    checkEndFrame.variables = {
      curr: currId,
      end: realEndId,
      "curr === end": currId === realEndId ? "True" : "False",
      [`distance[${currId}]`]: distanceMap[currId],
    };
    steps.push(checkEndFrame);

    if (currId === realEndId) break;

    statusMap[currId] = Status.Unfinished; // 歷史軌跡

    const currNode = nodeMap.get(currId);
    if (currNode) {
      const neighbors = currNode.pointers;
      neighbors.sort((a, b) => b.id.localeCompare(a.id));

      const allNeighborIds = neighbors.map((n) => n.id);
      const unvisitedIds = allNeighborIds.filter((id) => !visited.has(id));

      // ── EXPLORE frame ──
      const exploreFrame = generateGraphFrame(
        baseElements,
        { ...statusMap },
        distanceMap,
        unvisitedIds.length > 0
          ? `遍歷 ${currId} 的鄰居，發現 ${unvisitedIds.length} 個未訪問節點`
          : `遍歷 ${currId} 的鄰居，所有鄰居皆已訪問`,
        false,
        { ...linkStatusMap },
      );
      exploreFrame.actionTag = TAGS.EXPLORE;
      exploreFrame.variables = {
        curr: currId,
        "all neighbors": `[${allNeighborIds.join(", ")}]`,
        unvisited:
          unvisitedIds.length > 0
            ? `[${unvisitedIds.join(", ")}]`
            : "[]  (全已訪問)",
      };
      steps.push(exploreFrame);

      const pushedNeighbors: string[] = [];

      for (const neighbor of neighbors) {
        // 只有未訪問過的才推入堆疊
        if (!visited.has(neighbor.id)) {
          updateLinkStatus(linkStatusMap, currId, neighbor.id, "path", false);
          parentMap.set(neighbor.id, currId);
          // 步數 + 1
          stack.push({ id: neighbor.id, dist: currDist + 1 });
          pushedNeighbors.push(neighbor.id);

          statusMap[neighbor.id] = Status.Prepare;
          // 不更新 distanceMap，等到 pop 出來才更新，才符合 DFS 順序
        }
      }

      if (pushedNeighbors.length > 0) {
        const visitFrame = generateGraphFrame(
          baseElements,
          statusMap,
          distanceMap,
          `發現鄰居 ${pushedNeighbors.join(", ")}，推入堆疊`,
          false,
          { ...linkStatusMap },
        );
        visitFrame.actionTag = TAGS.PUSH_NEIGHBOR;
        visitFrame.variables = {
          curr: currId,
          "pushed neighbors": `[${pushedNeighbors.join(", ")}]`,
          "depth[new]": currDist + 1,
          "stack (after)": `[${stack.map((s) => `(${s.id}, ${s.dist})`).join(", ")}]`,
        };
        steps.push(visitFrame);
      }
    }
  }

  // 路徑回溯
  if (visited.has(realEndId)) {
    let curr = realEndId;
    const path: string[] = [realEndId];
    statusMap[realEndId] = Status.Complete;

    while (curr !== realStartId) {
      const parent = parentMap.get(curr);
      if (!parent) break;

      updateLinkStatus(linkStatusMap, parent, curr, "complete", false);

      path.push(parent);
      curr = parent;
    }

    path.forEach((id) => (statusMap[id] = Status.Complete));

    const pathFoundFrame = generateGraphFrame(
      baseElements,
      statusMap,
      distanceMap,
      `找到終點！路徑長度: ${path.length - 1} (綠色)`,
      false,
      { ...linkStatusMap },
    );
    pathFoundFrame.actionTag = TAGS.PATH_FOUND;
    pathFoundFrame.variables = {
      end: realEndId,
      "path depth": distanceMap[realEndId],
    };
    steps.push(pathFoundFrame);
  } else {
    const notFoundFrame = generateGraphFrame(
      baseElements,
      statusMap,
      distanceMap,
      "無法到達終點",
      false,
      { ...linkStatusMap },
    );
    notFoundFrame.actionTag = TAGS.NOT_FOUND;
    notFoundFrame.variables = {
      stack: "[]  (空)",
      end: realEndId,
      reachable: "false — 終點不可達",
    };
    steps.push(notFoundFrame);
  }

  return steps;
}

// 迷宮最短路徑
function runGridDFS(
  gridData: any,
  cols: number = 5,
  startId?: string,
  endId?: string,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  if (!Array.isArray(gridData) || gridData.length === 0) return steps;

  const rows = Math.ceil(gridData.length / cols);
  const startIndex = startId ? parseInt(startId) : 0;
  const endIndex = endId ? parseInt(endId) : gridData.length - 1;

  const visited = new Set<number>();
  const parentMap = new Map<number, number>();
  const statusMap: Record<number, Status> = {};
  const distanceMap: Record<number, number> = {};

  // 檢查起點終點
  if (gridData[startIndex].val === 1 || gridData[endIndex].val === 1) {
    steps.push(
      generateGridFrame(gridData, cols, {}, {}, "起點或終點是牆壁", true),
    );
    return steps;
  }

  // 初始畫面
  const gridInitFrame1 = generateGridFrame(
    gridData,
    cols,
    {},
    {},
    `DFS 準備開始：顯示格子索引 (ID)。起點: ${startIndex}, 終點: ${endIndex}`,
    true,
  );
  gridInitFrame1.actionTag = TAGS.INIT;
  gridInitFrame1.variables = { start: startIndex, end: endIndex };
  steps.push(gridInitFrame1);

  const gridInitFrame2 = generateGridFrame(
    gridData,
    cols,
    {},
    {},
    `初始化距離為 ∞`,
    false,
  );
  gridInitFrame2.actionTag = TAGS.INIT;
  gridInitFrame2.variables = {
    start: startIndex,
    end: endIndex,
    "distance[all]": "∞",
  };
  steps.push(gridInitFrame2);

  const stack: number[] = [startIndex];
  visited.add(startIndex);
  distanceMap[startIndex] = 0;
  statusMap[startIndex] = Status.Prepare;

  // ── START frame ──
  const startGridFrame = generateGridFrame(
    gridData,
    cols,
    statusMap,
    distanceMap,
    `將起點 ${startIndex} 推入 Stack（距離: 0）`,
  );
  startGridFrame.actionTag = TAGS.START;
  startGridFrame.variables = {
    stack: `[${startIndex}]`,
    visited: `{${startIndex}}`,
    "distance[start]": 0,
  };
  steps.push(startGridFrame);

  let found = false;

  // 方向優先順序：右 -> 下 -> 左 -> 上 (這樣會傾向先往右下走)
  const directions = [
    [0, 1], // Right
    [1, 0], // Down
    [0, -1], // Left
    [-1, 0], // Up
  ];

  while (stack.length > 0) {
    // A. Pop (取出最新加入的)
    const currIndex = stack.pop()!;
    statusMap[currIndex] = Status.Target;

    // ── POP frame ──
    const popGridFrame = generateGridFrame(
      gridData,
      cols,
      statusMap,
      distanceMap,
      `深入探索：處理節點 ${currIndex}`,
    );
    popGridFrame.actionTag = TAGS.POP;
    popGridFrame.variables = {
      curr: currIndex,
      [`distance[${currIndex}]`]: distanceMap[currIndex],
      "stack size": stack.length,
      "visited count": visited.size,
    };
    steps.push(popGridFrame);

    // ── CHECK_END frame ──
    const checkEndGridFrame = generateGridFrame(
      gridData,
      cols,
      { ...statusMap },
      distanceMap,
      currIndex === endIndex ? "找到終點！" : "尚未到達終點，繼續搜尋",
    );
    checkEndGridFrame.actionTag = TAGS.CHECK_END;
    checkEndGridFrame.variables = {
      curr: currIndex,
      end: endIndex,
      "curr === end": currIndex === endIndex ? "True" : "False",
      [`distance[${currIndex}]`]: distanceMap[currIndex],
    };
    steps.push(checkEndGridFrame);

    if (currIndex === endIndex) {
      found = true;
      statusMap[currIndex] = Status.Complete;
      break;
    }

    // C. 標記為已訪問
    statusMap[currIndex] = Status.Unfinished;

    // D. 尋找鄰居
    const r = Math.floor(currIndex / cols);
    const c = currIndex % cols;
    let addedNeighbors = 0;

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const nIndex = nr * cols + nc;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (gridData[nIndex].val !== 1 && !visited.has(nIndex)) {
          visited.add(nIndex);
          parentMap.set(nIndex, currIndex);
          stack.push(nIndex);

          distanceMap[nIndex] =
            distanceMap[currIndex] !== undefined
              ? distanceMap[currIndex] + 1
              : 1;
          statusMap[nIndex] = Status.Prepare;
          addedNeighbors++;
        }
      }
    }

    if (addedNeighbors > 0) {
      const pushNeighborGridFrame = generateGridFrame(
        gridData,
        cols,
        statusMap,
        distanceMap,
        `發現 ${addedNeighbors} 個未訪問鄰居，推入堆疊 (黃色)`,
      );
      pushNeighborGridFrame.actionTag = TAGS.PUSH_NEIGHBOR;
      pushNeighborGridFrame.variables = {
        "new count": addedNeighbors,
        "distance[new]": distanceMap[currIndex]! + 1,
        "stack size (after)": stack.length,
      };
      steps.push(pushNeighborGridFrame);
    } else {
      const backtrackFrame = generateGridFrame(
        gridData,
        cols,
        statusMap,
        distanceMap,
        `無路可走 (死胡同)，回溯 (Backtrack)`,
      );
      backtrackFrame.actionTag = TAGS.BACKTRACK;
      backtrackFrame.variables = {
        curr: currIndex,
        "dead end": "True — 無未訪問鄰居",
      };
      steps.push(backtrackFrame);
    }
  }

  // 路徑回溯
  if (found) {
    let curr = endIndex;
    const path = [endIndex];
    while (curr !== startIndex) {
      const parent = parentMap.get(curr);
      if (parent === undefined) break;
      path.push(parent);
      curr = parent;
    }

    // 顯示最終路徑
    path.forEach((idx) => {
      statusMap[idx] = Status.Complete;
    });

    const pathCompleteFrame = generateGridFrame(
      gridData,
      cols,
      statusMap,
      distanceMap,
      `DFS 搜尋結束，路徑長度：${path.length} (綠色路徑)`,
    );
    pathCompleteFrame.actionTag = TAGS.PATH_FOUND;
    pathCompleteFrame.variables = {
      end: endIndex,
      "shortest distance": distanceMap[endIndex],
    };
    steps.push(pathCompleteFrame);
  } else {
    const notFoundGridFrame = generateGridFrame(
      gridData,
      cols,
      statusMap,
      distanceMap,
      "堆疊已空，無法到達終點",
    );
    notFoundGridFrame.actionTag = TAGS.NOT_FOUND;
    notFoundGridFrame.variables = {
      stack: "[]  (空)",
      end: endIndex,
      reachable: "False — 終點不可達",
    };
    steps.push(notFoundGridFrame);
  }

  return steps;
}

export function createDFSAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  const startNodeId = action?.startNode;
  const endNodeId = action?.endNode;

  if (action?.mode === "grid") {
    const gridCols = action?.cols || 5;
    return runGridDFS(inputData, gridCols, startNodeId, endNodeId);
  }

  return runGraphDFS(inputData, startNodeId, endNodeId);
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
  actionHandler: dfsActionHandler,
  defaultViewMode: "graph",
  renderActionBar: (props) => <BFSDFSActionBar {...(props as any)} />,
};

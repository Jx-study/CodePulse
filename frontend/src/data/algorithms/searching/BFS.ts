import type { AnimationStep, CodeConfig } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import { createGraphElements } from "@/data/DataStructure/nonlinear/utils";
import { Node } from "../../../modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import {
  generateGridFrame,
  generateGraphFrame,
  updateLinkStatus,
} from "@/data/DataStructure/nonlinear/utils";
import { linkStatus } from "@/modules/core/Render/D3Renderer";
import { TRUE } from "sass";

const TAGS = {
  INIT: "INIT",
  START: "START",
  DEQUEUE: "DEQUEUE",
  CHECK_END: "CHECK_END",
  EXPLORE: "EXPLORE",
  VISIT_NEIGHBOR: "VISIT_NEIGHBOR",
  PATH_FOUND: "PATH_FOUND",
  NOT_FOUND: "NOT_FOUND",
};

function runGraphBFS(
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

  const sortedIds = baseElements.map((n) => n.id).sort();

  // 決定起點與終點
  // 若未指定，預設第一個節點為起點，最後一個節點為終點
  const realStartId = startId && nodeMap.has(startId) ? startId : sortedIds[0];
  const realEndId =
    endId && nodeMap.has(endId) ? endId : sortedIds[sortedIds.length - 1];

  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, linkStatus> = {};
  const distanceMap: Record<string, number> = {}; // 記錄每個節點的層數 (距離)
  const visited = new Set<string>();
  const parentMap = new Map<string, string>(); // child -> parent (用於回溯)

  baseElements.forEach((n) => (distanceMap[n.id] = Infinity));

  // 初始畫面 (顯示 ID)
  const initFrame1 = generateGraphFrame(
    baseElements,
    {},
    distanceMap,
    `Graph 顯示 ID 完成，起點: ${realStartId}, 終點: ${realEndId}`,
    true, // showIdAsValue = true
  );
  initFrame1.actionTag = TAGS.INIT;
  initFrame1.variables = {
    start: realStartId,
    end: realEndId,
  };
  steps.push(initFrame1);

  // 數值轉為距離 (∞)
  const initFrame2 = generateGraphFrame(
    baseElements,
    {},
    distanceMap,
    `準備開始 BFS，初始化距離為 ∞`,
  );
  initFrame2.actionTag = TAGS.INIT;
  initFrame2.variables = {
    start: realStartId,
    end: realEndId,
    "distance[all]": "∞",
  };
  steps.push(initFrame2);

  // BFS 初始化
  const queue: string[] = [realStartId];
  visited.add(realStartId);
  statusMap[realStartId] = Status.Prepare;
  distanceMap[realStartId] = 0; // 起點距離為 0

  const initFrame3 = generateGraphFrame(
    baseElements,
    statusMap,
    distanceMap,
    `將起點 ${realStartId} 加入佇列 (距離: 0)`,
  );
  initFrame3.actionTag = TAGS.START;
  initFrame3.variables = {
    queue: `[${realStartId}]`,
    visited: `{${realStartId}}`,
    [`distance[${realStartId}]`]: 0,
  };
  steps.push(initFrame3);

  let found = false;

  // BFS 主迴圈
  while (queue.length > 0) {
    const currId = queue.shift()!;
    const currNode = nodeMap.get(currId);
    const parentId = parentMap.get(currId);
    if (parentId) {
      updateLinkStatus(linkStatusMap, parentId, currId, "visited", false);
    }

    statusMap[currId] = Status.Target;

    // ── DEQUEUE frame（高亮 [5, 6]）──
    const dequeueFrame = generateGraphFrame(
      baseElements,
      statusMap,
      distanceMap,
      `While 佇列不為空，取出 ${currId}（距離: ${distanceMap[currId]}）`,
      false,
      { ...linkStatusMap },
    );
    dequeueFrame.actionTag = TAGS.DEQUEUE;
    dequeueFrame.variables = {
      curr: currId,
      [`distance[${currId}]`]: distanceMap[currId],
      queue: queue.length > 0 ? `[${queue.join(", ")}]` : "[]  (空)",
      "visited count": visited.size,
    };
    steps.push(dequeueFrame);

    // ── CHECK_END snapshot（高亮 [8]）──
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

    // 終點判斷
    if (currId === realEndId) {
      found = true;
      break;
    }

    if (currNode) {
      const neighbors = currNode.pointers;
      // 排序以保持動畫順序穩定
      neighbors.sort((a, b) => a.id.localeCompare(b.id));

      const allNeighborIds = neighbors.map((n) => n.id);
      const unvisitedIds = allNeighborIds.filter((id) => !visited.has(id));

      // ── EXPLORE snapshot（高亮 [12]）──
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

      const newNeighbors: string[] = [];
      const currentDist = distanceMap[currId];

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          parentMap.set(neighbor.id, currId);
          queue.push(neighbor.id);
          newNeighbors.push(neighbor.id);

          statusMap[neighbor.id] = Status.Prepare;
          distanceMap[neighbor.id] = currentDist + 1; // 鄰居距離 = 當前距離 + 1
          updateLinkStatus(linkStatusMap, currId, neighbor.id, "path", false);
        }
      }

      if (newNeighbors.length > 0) {
        // ── VISIT_NEIGHBOR frame（高亮 [13, 14, 15, 16]）──
        const visitFrame = generateGraphFrame(
          baseElements,
          statusMap,
          distanceMap,
          `發現鄰居 ${newNeighbors.join(", ")}，距離更新為 ${currentDist + 1}，加入佇列`,
          false,
          { ...linkStatusMap },
        );
        visitFrame.actionTag = TAGS.VISIT_NEIGHBOR;
        visitFrame.variables = {
          curr: currId,
          "new neighbors": `[${newNeighbors.join(", ")}]`,
          "distance[new]": currentDist + 1,
          "queue (after)": `[${queue.join(", ")}]`,
        };
        steps.push(visitFrame);
      }
    }

    // 處理完畢 -> Unfinished
    statusMap[currId] = Status.Unfinished;
  }

  // 路徑回溯與結束
  if (found) {
    // 回溯路徑（視覺層：畫出綠色路徑，parentMap 供動畫用）
    let curr = realEndId;
    const path: string[] = [realEndId];

    while (curr !== realStartId) {
      const parent = parentMap.get(curr);
      if (!parent) break;

      updateLinkStatus(linkStatusMap, parent, curr, "complete", false);

      path.push(parent);
      curr = parent;
    }

    // 將路徑上所有節點標示為 complete
    path.forEach((id) => (statusMap[id] = Status.Complete));

    // ── PATH_FOUND frame（單一 frame，視覺上顯示綠色路徑）
    const pathFoundFrame = generateGraphFrame(
      baseElements,
      statusMap,
      distanceMap,
      `找到終點！最短路徑長度: ${distanceMap[realEndId]} (綠色)`,
      false,
      { ...linkStatusMap },
    );
    pathFoundFrame.actionTag = TAGS.PATH_FOUND;
    pathFoundFrame.variables = {
      end: realEndId,
      "shortest distance": distanceMap[realEndId],
    };
    steps.push(pathFoundFrame);
  } else {
    const notFoundFrame = generateGraphFrame(
      baseElements,
      statusMap,
      distanceMap,
      "佇列已空，無法到達終點",
      false,
      { ...linkStatusMap },
    );
    notFoundFrame.actionTag = TAGS.NOT_FOUND;
    notFoundFrame.variables = {
      queue: "[]  (空)",
      end: realEndId,
      reachable: "false — 終點不可達",
    };
    steps.push(notFoundFrame);
  }

  return steps;
}

// 迷宮最短路徑
function runGridBFS(
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

  // 狀態記錄
  const visited = new Set<number>();
  const parentMap = new Map<number, number>(); // childIndex -> parentIndex (用於回溯路徑)
  const statusMap: Record<number, Status> = {};
  const distanceMap: Record<number, number> = {};

  // 確保起點終點不是牆 (防呆)
  if (gridData[startIndex].val === 1 || gridData[endIndex].val === 1) {
    steps.push(
      generateGridFrame(
        gridData,
        cols,
        {},
        {},
        "起點或終點被牆壁阻擋，無法開始",
        true,
      ),
    );
    return steps;
  }

  // 初始畫面
  const gridInitFrame1 = generateGridFrame(
    gridData,
    cols,
    {},
    {},
    `BFS 準備開始：顯示格子索引 (ID)。起點: ${startIndex}, 終點: ${endIndex}`,
    true, // showIdAsValue = true
  );
  gridInitFrame1.actionTag = TAGS.INIT;
  gridInitFrame1.variables = {
    start: startIndex,
    end: endIndex,
  };
  steps.push(gridInitFrame1);

  // Step 1: 準備開始，數值轉為距離 (∞)
  const gridInitFrame2 = generateGridFrame(
    gridData,
    cols,
    {},
    {},
    `初始化距離為 ∞`,
    false, // 轉回顯示距離模式
  );
  gridInitFrame2.actionTag = TAGS.INIT;
  gridInitFrame2.variables = {
    start: startIndex,
    end: endIndex,
    "distance[all]": "∞",
  };
  steps.push(gridInitFrame2);

  // BFS 初始化
  let queue: number[] = [startIndex];
  visited.add(startIndex);
  statusMap[startIndex] = Status.Target;
  distanceMap[startIndex] = 0;

  let found = false;

  // 方向：上、右、下、左
  const directions = [
    [-1, 0], // Up
    [0, 1], // Right
    [1, 0], // Down
    [0, -1], // Left
  ];

  while (queue.length > 0) {
    const nextQueue: number[] = [];
    const currentLevelIndices: number[] = [];

    // Step A: 標記當前層級為 Target (正在處理)
    for (const idx of queue) {
      statusMap[idx] = Status.Target;
      currentLevelIndices.push(idx);
    }

    const dequeueGridFrame = generateGridFrame(
      gridData,
      cols,
      statusMap,
      distanceMap,
      `當前層級遍歷：處理 ${currentLevelIndices.length} 個節點`,
    );
    dequeueGridFrame.actionTag = TAGS.DEQUEUE;
    dequeueGridFrame.variables = {
      "level size": currentLevelIndices.length,
      queue: `[${currentLevelIndices.join(", ")}]`,
      "visited count": visited.size,
    };
    steps.push(dequeueGridFrame);

    // ── CHECK_END snapshot（高亮 [8]）──
    const checkEndGridFrame = generateGridFrame(
      gridData,
      cols,
      { ...statusMap },
      distanceMap,
      currentLevelIndices.includes(endIndex)
        ? "終點在此層，找到！"
        : "終點不在本層，繼續搜尋下一層",
    );
    checkEndGridFrame.actionTag = TAGS.CHECK_END;
    checkEndGridFrame.variables = {
      end: endIndex,
      "end ∈ Queue": currentLevelIndices.includes(endIndex) ? "True" : "False",
      "current level": `[${currentLevelIndices.join(", ")}]`,
    };
    steps.push(checkEndGridFrame);

    // 檢查是否包含終點
    if (currentLevelIndices.includes(endIndex)) {
      found = true;
      break;
    }

    // Step B: 尋找下一層鄰居
    const prepareIndices: number[] = [];

    for (const currIndex of queue) {
      const r = Math.floor(currIndex / cols);
      const c = currIndex % cols;
      const currentDist = distanceMap[currIndex];

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        const nIndex = nr * cols + nc;

        // 邊界檢查
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          // 檢查：不是牆壁 (val!==1) 且 未訪問過
          if (gridData[nIndex].val !== 1 && !visited.has(nIndex)) {
            visited.add(nIndex);
            parentMap.set(nIndex, currIndex); // 記錄路徑來源
            nextQueue.push(nIndex);
            prepareIndices.push(nIndex);
            statusMap[nIndex] = Status.Prepare; // 標記為下階段 (Prepare)
            distanceMap[nIndex] = currentDist + 1;
          }
        }
      }
    }

    // 如果有找到鄰居，顯示 Prepare 動畫
    if (prepareIndices.length > 0) {
      const currentDistForVisit =
        queue.length > 0 ? distanceMap[queue[0]] : 0;
      const visitGridFrame = generateGridFrame(
        gridData,
        cols,
        statusMap,
        distanceMap,
        `發現 ${prepareIndices.length} 個鄰居，加入佇列 (黃色)`,
      );
      visitGridFrame.actionTag = TAGS.VISIT_NEIGHBOR;
      visitGridFrame.variables = {
        "new count": prepareIndices.length,
        "distance[new]": currentDistForVisit + 1,
        "queue size (after)": nextQueue.length,
      };
      steps.push(visitGridFrame);
    }

    // Step C: 這一層處理結束，將 Target 轉為 Unfinished (已訪問歷史)，準備進入下一層
    for (const idx of queue) {
      statusMap[idx] = Status.Unfinished; // Visited
    }

    // 更新 Queue
    queue = nextQueue;
  }

  if (found) {
    // 回溯路徑 (Backtracking)
    let curr = endIndex;
    const path: number[] = [endIndex];
    while (curr !== startIndex) {
      const parent = parentMap.get(curr);
      if (parent === undefined) break; // Should not happen if found is true
      path.push(parent);
      curr = parent;
    }

    // C. 顯示最短路徑
    path.forEach((idx) => {
      statusMap[idx] = Status.Complete;
    });

    const pathCompleteFrame = generateGridFrame(
      gridData,
      cols,
      statusMap,
      distanceMap,
      `最短路徑長度：${path.length} (綠色路徑)`,
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
      "佇列已空，無法到達終點",
    );
    notFoundGridFrame.actionTag = TAGS.NOT_FOUND;
    notFoundGridFrame.variables = {
      queue: "[]  (空)",
      end: endIndex,
      reachable: "False — 終點不可達",
    };
    steps.push(notFoundGridFrame);
  }

  return steps;
}

export function createBFSAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  const startNodeId = action?.startNode;
  const endNodeId = action?.endNode;

  if (action?.mode === "grid") {
    const gridCols = action?.cols || 5;
    return runGridBFS(inputData, gridCols, startNodeId, endNodeId);
  }

  return runGraphBFS(inputData, startNodeId, endNodeId);
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
      [TAGS.INIT]: [1, 2, 3],
      [TAGS.START]: [4],
      [TAGS.DEQUEUE]: [6, 7],
      [TAGS.CHECK_END]: [9],
      [TAGS.EXPLORE]: [13, 14],
      [TAGS.VISIT_NEIGHBOR]: [15, 16, 17],
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
      [TAGS.INIT]: [1, 2, 3],
      [TAGS.START]: [4],
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
};

import type { AnimationStep } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import {
  createGridElements,
  createGraphElements,
} from "@/data/DataStructure/nonlinear/utils";
import { Node } from "../../../modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";

const generateGridFrame = (
  gridData: any[],
  cols: number,
  statusMap: Record<number, Status>, // Key 是 index, Value 是狀態
  description: string,
): AnimationStep => {
  const elements = createGridElements(gridData, cols);

  elements.forEach((box, index) => {
    if (box.value === 1) return;

    if (statusMap[index]) {
      box.setStatus(statusMap[index]);
    }
  });

  return {
    stepNumber: 0,
    description,
    elements,
  };
};

const generateGraphFrame = (
  baseElements: Node[],
  statusMap: Record<string, Status>,
  distanceMap: Record<string, number>,
  description: string,
  showIdAsValue: boolean = false,
): AnimationStep => {
  const frameElements = baseElements.map((node) => {
    const newNode = new Node();
    newNode.id = node.id;

    if (showIdAsValue) {
      const numId = parseInt(node.id.replace("node-", ""), 10);
      newNode.value = isNaN(numId) ? -1 : numId;
    } else {
      if (distanceMap[node.id] !== undefined) {
        // 如果是 99 (無限大)，顯示 "∞"
        newNode.value = (
          distanceMap[node.id] === 99 ? "∞" : distanceMap[node.id]
        ) as any;
      } else {
        newNode.value = 0; // 或 "∞"
      }
    }

    let x = node.position.x;
    let y = node.position.y;
    newNode.moveTo(x, y);
    newNode.radius = node.radius;
    newNode.pointers = node.pointers;

    const status = statusMap[node.id];
    if (status) newNode.setStatus(status);
    else {
      newNode.setStatus("inactive");
    }

    return newNode;
  });

  return {
    stepNumber: 0,
    description,
    elements: frameElements,
  };
};

function runGraphBFS(
  graphData: any,
  startId?: string,
  endId?: string,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  // 1. 建立基礎圖形結構
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
  const distanceMap: Record<string, number> = {}; // 記錄每個節點的層數 (距離)
  const visited = new Set<string>();
  const parentMap = new Map<string, string>(); // child -> parent (用於回溯)

  baseElements.forEach((n) => (distanceMap[n.id] = 99));

  // Step 0: 初始畫面 (顯示 ID)
  steps.push(
    generateGraphFrame(
      baseElements,
      {},
      distanceMap,
      `Graph 初始化完成 (顯示 ID)，起點: ${realStartId}, 終點: ${realEndId}`,
      true, // showIdAsValue = true
    ),
  );

  // Step 1: 準備開始，數值轉為距離 (∞)
  steps.push(
    generateGraphFrame(
      baseElements,
      {},
      distanceMap,
      `準備開始 BFS，初始化距離為 ∞`,
    ),
  );

  // 2. BFS 初始化
  const queue: string[] = [realStartId];
  visited.add(realStartId);
  statusMap[realStartId] = "prepare";
  distanceMap[realStartId] = 0; // 起點距離為 0

  steps.push(
    generateGraphFrame(
      baseElements,
      statusMap,
      distanceMap,
      `將起點 ${realStartId} 加入佇列 (距離: 0)`,
    ),
  );

  let found = false;

  // 3. BFS 主迴圈
  while (queue.length > 0) {
    // A. Dequeue
    const currId = queue.shift()!;
    const currNode = nodeMap.get(currId);

    statusMap[currId] = "target";

    steps.push(
      generateGraphFrame(
        baseElements,
        statusMap,
        distanceMap,
        `取出 ${currId} (層數: ${distanceMap[currId]})，檢查鄰居`,
      ),
    );

    // 檢查是否到達終點
    if (currId === realEndId) {
      found = true;
      break;
    }

    // B. 訪問鄰居
    if (currNode) {
      const neighbors = currNode.pointers;
      const newNeighbors: string[] = [];
      const currentDist = distanceMap[currId];

      // 排序以保持動畫順序穩定
      neighbors.sort((a, b) => a.id.localeCompare(b.id));

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          parentMap.set(neighbor.id, currId);
          queue.push(neighbor.id);
          newNeighbors.push(neighbor.id);

          statusMap[neighbor.id] = "prepare";
          distanceMap[neighbor.id] = currentDist + 1; // 鄰居距離 = 當前距離 + 1
        }
      }

      if (newNeighbors.length > 0) {
        steps.push(
          generateGraphFrame(
            baseElements,
            statusMap,
            distanceMap,
            `發現鄰居 ${newNeighbors.join(", ")}，距離更新為 ${currentDist + 1}，加入佇列`,
          ),
        );
      }
    }

    // C. 處理完畢 -> Unfinished
    statusMap[currId] = "unfinished";
  }

  // 4. 路徑回溯與結束
  if (found) {
    // 回溯路徑
    let curr = realEndId;
    const path: string[] = [realEndId];

    // 先標終點
    statusMap[realEndId] = "complete";

    while (curr !== realStartId) {
      const parent = parentMap.get(curr);
      if (!parent) break;
      path.push(parent);
      curr = parent;
    }

    // 將路徑上所有節點標示為 complete
    path.forEach((id) => (statusMap[id] = "complete"));

    steps.push(
      generateGraphFrame(
        baseElements,
        statusMap,
        distanceMap,
        `找到終點！最短路徑長度: ${distanceMap[realEndId]} (綠色)`,
      ),
    );
  } else {
    steps.push(
      generateGraphFrame(
        baseElements,
        statusMap,
        distanceMap,
        "佇列已空，無法到達終點",
      ),
    );
  }

  return steps;
}

// 迷宮最短路徑
function runGridBFS(gridData: any, cols: number = 5): AnimationStep[] {
  const steps: AnimationStep[] = [];

  if (!Array.isArray(gridData) || gridData.length === 0) return steps;

  const rows = Math.ceil(gridData.length / cols);
  const startIndex = 0; // 起點暫定 (0,0)
  const endIndex = gridData.length - 1; // 終點暫定 (最後一格)

  // 狀態記錄
  const visited = new Set<number>();
  const parentMap = new Map<number, number>(); // childIndex -> parentIndex (用於回溯路徑)
  const statusMap: Record<number, Status> = {};

  // 確保起點終點不是牆 (防呆)
  if (gridData[startIndex].val === 1 || gridData[endIndex].val === 1) {
    steps.push(
      generateGridFrame(gridData, cols, {}, "起點或終點被牆壁阻擋，無法開始"),
    );
    return steps;
  }

  // 初始畫面
  steps.push(
    generateGridFrame(
      gridData,
      cols,
      {},
      `準備開始 BFS，起點 (0,0)，終點 (${rows - 1},${cols - 1})`,
    ),
  );

  // BFS 初始化
  let queue: number[] = [startIndex];
  visited.add(startIndex);
  statusMap[startIndex] = "target";

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
      statusMap[idx] = "target";
      currentLevelIndices.push(idx);
    }

    steps.push(
      generateGridFrame(
        gridData,
        cols,
        statusMap,
        `當前層級遍歷：處理 ${currentLevelIndices.length} 個節點`,
      ),
    );

    // 檢查是否包含終點
    if (currentLevelIndices.includes(endIndex)) {
      found = true;
      break; // 找到終點，跳出迴圈去畫路徑
    }

    // Step B: 尋找下一層鄰居
    const prepareIndices: number[] = [];

    for (const currIndex of queue) {
      const r = Math.floor(currIndex / cols);
      const c = currIndex % cols;

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
            statusMap[nIndex] = "prepare"; // 標記為下階段 (Prepare)
          }
        }
      }
    }

    // 如果有找到鄰居，顯示 Prepare 動畫
    if (prepareIndices.length > 0) {
      steps.push(
        generateGridFrame(
          gridData,
          cols,
          statusMap,
          `發現 ${prepareIndices.length} 個鄰居，加入佇列 (黃色)`,
        ),
      );
    }

    // Step C: 這一層處理結束，將 Target 轉為 Unfinished (已訪問歷史)，準備進入下一層
    for (const idx of queue) {
      statusMap[idx] = "unfinished"; // Visited
    }

    // 更新 Queue
    queue = nextQueue;
  }

  if (found) {
    // A. 標記終點
    statusMap[endIndex] = "complete";
    steps.push(
      generateGridFrame(
        gridData,
        cols,
        statusMap,
        `找到終點！開始回溯最短路徑`,
      ),
    );

    // B. 回溯路徑 (Backtracking)
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
      statusMap[idx] = "complete";
    });

    steps.push(
      generateGridFrame(
        gridData,
        cols,
        statusMap,
        `最短路徑長度：${path.length} (綠色路徑)`,
      ),
    );
  } else {
    steps.push(
      generateGridFrame(gridData, cols, statusMap, "佇列已空，無法到達終點"),
    );
  }

  return steps;
}

export function createBFSAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  if (action?.mode === "grid") {
    const gridCols = action?.cols || 5;
    return runGridBFS(inputData, gridCols);
  }
  const startNodeId = action?.startNode;
  const endNodeId = action?.endNode;

  return runGraphBFS(inputData, startNodeId, endNodeId);
}

export const BFSConfig: LevelImplementationConfig = {
  id: "bfs",
  type: "algorithm",
  name: "廣度優先搜尋 (Breadth-First Search)",
  categoryName: "搜尋演算法",
  description: "廣度優先搜尋演算法，用於圖或樹的遍歷",
  pseudoCode: `Q = Queue()
Q.enqueue(start_node)
mark start_node as visited
while Q is not empty:
    curr = Q.dequeue()
    process(curr)
    for neighbor in curr.neighbors:
        if neighbor not visited:
            mark neighbor as visited
            Q.enqueue(neighbor)`,
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

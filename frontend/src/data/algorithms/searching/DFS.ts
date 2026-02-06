import type { AnimationStep } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import {
  createGridElements,
  createGraphElements,
} from "@/data/DataStructure/nonlinear/utils";
import { Node } from "../../../modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";

// (與 BFS 共用邏輯，之後可以抽到 utils)
const generateGridFrame = (
  gridData: any[],
  cols: number,
  statusMap: Record<number, Status>,
  distanceMap: Record<number, number>,
  description: string,
  showIdAsValue: boolean = false,
): AnimationStep => {
  const elements = createGridElements(gridData, cols);

  elements.forEach((box, index) => {
    if (box.value === 1) {
      box.value = "wall" as any;
      return;
    }

    if (showIdAsValue) {
      box.value = index;
    } else {
      // 顯示距離
      if (distanceMap[index] !== undefined) {
        box.value = distanceMap[index];
      } else {
        box.value = "∞" as any; // 未訪問
      }
    }

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
  distanceMap: Record<string, number>, // 這裡的 distance 對 DFS 來說是深度/步數
  description: string,
  showIdAsValue: boolean = false,
): AnimationStep => {
  const frameElements = baseElements.map((node) => {
    const newNode = new Node();
    newNode.id = node.id;
    // 如果有計算出深度，顯示深度；否則顯示原始值或空
    if (showIdAsValue) {
      // 將 "node-1" 轉為數字 1
      const numId = parseInt(node.id.replace("node-", ""), 10);
      newNode.value = isNaN(numId) ? -1 : numId;
    } else {
      const dist = distanceMap[node.id];
      // 強制轉型為 any 以允許顯示 "∞" 字串 (D3Renderer 支援顯示文字)
      newNode.value = (dist === undefined || dist === 99 ? "∞" : dist) as any;
    }

    let x = node.position.x;
    let y = node.position.y;
    newNode.moveTo(x, y);
    newNode.radius = node.radius;
    newNode.pointers = node.pointers;

    // 1. 設定狀態 (預設 inactive)
    const status = statusMap[node.id];
    if (status) {
      newNode.setStatus(status);
    } else {
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

function runGraphDFS(
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

  // 排序節點 ID 以確保 start/end 選擇穩定 (最小與最大)
  const sortedIds = baseElements.map((n) => n.id).sort();
  const realStartId = startId && nodeMap.has(startId) ? startId : sortedIds[0];
  const realEndId =
    endId && nodeMap.has(endId) ? endId : sortedIds[sortedIds.length - 1];

  // 狀態變數
  const statusMap: Record<string, Status> = {};
  const distanceMap: Record<string, number> = {}; // DFS 深度
  // const visited = new Set<string>();
  const parentMap = new Map<string, string>();

  baseElements.forEach((n) => (distanceMap[n.id] = 99));

  // 初始畫面
  steps.push(
    generateGraphFrame(
      baseElements,
      {},
      distanceMap,
      `Graph 初始化：顯示節點 ID。準備從 ${realStartId} 走到 ${realEndId}`,
      true,
    ),
  );

  steps.push(
    generateGraphFrame(
      baseElements,
      {},
      distanceMap,
      `初始化距離為 ∞ (99)，準備開始 DFS`,
    ),
  );

  // 2. DFS 初始化
  const stack: { id: string; dist: number }[] = [{ id: realStartId, dist: 0 }];
  const visited = new Set<string>();
  // 注意：DFS 的 visited 通常在 pop 時才標記，或者在 push 時標記
  // 為了避免重複入棧太多次，我們這裡採用「發現即標記 (push時)」的策略，這比較常見於圖的遍歷
  // visited.add(realStartId);
  // statusMap[realStartId] = "prepare";
  // distanceMap[realStartId] = 0; // 起點深度 0

  // steps.push(
  //   generateGraphFrame(
  //     baseElements,
  //     statusMap,
  //     distanceMap,
  //     `將起點 ${realStartId} 推入堆疊`,
  //   ),
  // );

  // let found = false;

  // 3. DFS 主迴圈
  while (stack.length > 0) {
    const item = stack.pop()!;
    const currId = item.id;
    const currDist = item.dist;

    // 如果已經訪問過且距離更短，則跳過 (雖然 DFS 通常不走回頭路，但這是保險)
    if (visited.has(currId) && distanceMap[currId] <= currDist) continue;

    visited.add(currId);

    // 更新距離：如果是第一次訪問或找到更短路徑 (DFS 不保證最短，但我們記錄當下路徑長)
    distanceMap[currId] = currDist;
    statusMap[currId] = "target"; // 紅色：正在處理

    steps.push(
      generateGraphFrame(
        baseElements,
        statusMap,
        distanceMap,
        `訪問節點 ${currId}，更新步數為 ${currDist}`,
      ),
    );

    // 檢查終點
    if (currId === realEndId) {
      steps.push(
        generateGraphFrame(baseElements, statusMap, distanceMap, "找到終點！"),
      );
      break; // 找到就停，DFS 的標準行為
    }

    statusMap[currId] = "unfinished"; // 歷史軌跡

    const currNode = nodeMap.get(currId);
    if (currNode) {
      const neighbors = currNode.pointers;
      // 排序：降序，這樣小的 ID 會先被 Pop 出來 (Stack LIFO)
      neighbors.sort((a, b) => b.id.localeCompare(a.id));

      const pushedNeighbors: string[] = [];

      for (const neighbor of neighbors) {
        // 只有未訪問過的才推入堆疊
        if (!visited.has(neighbor.id)) {
          parentMap.set(neighbor.id, currId);
          // 步數 + 1
          stack.push({ id: neighbor.id, dist: currDist + 1 });
          pushedNeighbors.push(neighbor.id);

          statusMap[neighbor.id] = "prepare"; // 黃色：待辦
          // 注意：這裡不更新 distanceMap，等到 pop 出來才更新，才符合 DFS 順序
        }
      }

      if (pushedNeighbors.length > 0) {
        steps.push(
          generateGraphFrame(
            baseElements,
            statusMap,
            distanceMap,
            `發現鄰居 ${pushedNeighbors.join(", ")}，推入堆疊`,
          ),
        );
      }
    }
  }

  // 路徑回溯
  if (visited.has(realEndId)) {
    let curr = realEndId;
    const path: string[] = [realEndId];
    statusMap[realEndId] = "complete";

    while (curr !== realStartId) {
      const parent = parentMap.get(curr);
      if (!parent) break;
      path.push(parent);
      curr = parent;
    }

    path.forEach((id) => (statusMap[id] = "complete"));

    steps.push(
      generateGraphFrame(
        baseElements,
        statusMap,
        distanceMap,
        `回溯路徑 (長度: ${path.length - 1})`,
      ),
    );
  } else {
    steps.push(
      generateGraphFrame(baseElements, statusMap, distanceMap, "無法到達終點"),
    );
  }

  return steps;
}

// 迷宮最短路徑
function runGridDFS(gridData: any, cols: number = 5): AnimationStep[] {
  const steps: AnimationStep[] = [];

  if (!Array.isArray(gridData) || gridData.length === 0) return steps;

  const rows = Math.ceil(gridData.length / cols);
  const startIndex = 0;
  const endIndex = gridData.length - 1;

  const visited = new Set<number>();
  const parentMap = new Map<number, number>();
  const statusMap: Record<number, Status> = {};
  const distanceMap: Record<number, number> = {};

  // 檢查起點終點
  if (gridData[startIndex].val === 1 || gridData[endIndex].val === 1) {
    steps.push(generateGridFrame(gridData, cols, {}, {}, "起點或終點是牆壁"));
    return steps;
  }

  // 初始畫面
  steps.push(
    generateGridFrame(
      gridData,
      cols,
      {},
      {},
      `DFS 準備開始：顯示格子索引 (ID)。起點: ${startIndex}, 終點: ${endIndex}`,
      true, // showIdAsValue = true
    ),
  );

  // Step 1: 準備開始，數值轉為距離 (∞)
  steps.push(
    generateGridFrame(
      gridData,
      cols,
      {},
      {},
      `初始化距離為 ∞`,
      false, // 轉回顯示距離模式
    ),
  );

  const stack: number[] = [startIndex];
  visited.add(startIndex);
  distanceMap[startIndex] = 0;
  statusMap[startIndex] = "prepare"; // 在 stack 中先顯示黃色

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
    statusMap[currIndex] = "target";

    steps.push(
      generateGridFrame(
        gridData,
        cols,
        statusMap,
        distanceMap,
        `深入探索：處理節點 ${currIndex}`,
      ),
    );

    // B. 檢查終點
    if (currIndex === endIndex) {
      found = true;
      statusMap[currIndex] = "complete";
      steps.push(
        generateGridFrame(gridData, cols, statusMap, distanceMap, "找到終點！"),
      );
      break;
    }

    // C. 標記為已訪問
    statusMap[currIndex] = "unfinished";

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
          statusMap[nIndex] = "prepare"; // 加入 Stack 變黃色
          addedNeighbors++;
        }
      }
    }

    if (addedNeighbors > 0) {
      steps.push(
        generateGridFrame(
          gridData,
          cols,
          statusMap,
          distanceMap,
          `發現 ${addedNeighbors} 個未訪問鄰居，推入堆疊 (黃色)`,
        ),
      );
    } else {
      // 死胡同
      steps.push(
        generateGridFrame(
          gridData,
          cols,
          statusMap,
          distanceMap,
          `無路可走 (死胡同)，回溯 (Backtrack)`,
        ),
      );
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
      statusMap[idx] = "complete";
    });

    steps.push(
      generateGridFrame(
        gridData,
        cols,
        statusMap,
        distanceMap,
        `DFS 搜尋結束，路徑長度：${path.length}`,
      ),
    );
  } else {
    steps.push(
      generateGridFrame(
        gridData,
        cols,
        statusMap,
        distanceMap,
        "堆疊已空，無法到達終點",
      ),
    );
  }

  return steps;
}

export function createDFSAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  if (action?.mode === "grid") {
    const gridCols = action?.cols || 5;
    return runGridDFS(inputData, gridCols);
  }
  const startNodeId = action?.startNode;
  const endNodeId = action?.endNode;

  return runGraphDFS(inputData, startNodeId, endNodeId);
}

export const DFSConfig: LevelImplementationConfig = {
  id: "dfs",
  type: "algorithm",
  name: "深度優先搜尋 (Depth-First Search)",
  categoryName: "搜尋演算法",
  description: "深度優先搜尋演算法，用於圖或樹的遍歷",
  pseudoCode: ``,
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(1)",
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
};

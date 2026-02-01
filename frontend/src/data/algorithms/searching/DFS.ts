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
  description: string
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

function runGraphDFS(graphData: any): AnimationStep[] {
  let elements: Node[] = [];
  if (graphData.nodes && graphData.edges) {
    elements = createGraphElements(graphData);
  }

  const steps: AnimationStep[] = [];

  steps.push({
    stepNumber: 0,
    description: "Graph 初始化完成，準備執行 DFS",
    elements: elements,
  });

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

  // 檢查起點終點
  if (gridData[startIndex].val === 1 || gridData[endIndex].val === 1) {
    steps.push(generateGridFrame(gridData, cols, {}, "起點或終點是牆壁"));
    return steps;
  }

  // 初始畫面
  steps.push(
    generateGridFrame(
      gridData,
      cols,
      {},
      `DFS 準備開始 (堆疊實作)，目標：(${rows - 1}, ${cols - 1})`
    )
  );

  const stack: number[] = [startIndex];
  visited.add(startIndex);
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
        `深入探索：處理節點 ${currIndex}`
      )
    );

    // B. 檢查終點
    if (currIndex === endIndex) {
      found = true;
      statusMap[currIndex] = "complete";
      steps.push(generateGridFrame(gridData, cols, statusMap, "找到終點！"));
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
          `發現 ${addedNeighbors} 個未訪問鄰居，推入堆疊 (黃色)`
        )
      );
    } else {
      // 死胡同
      steps.push(
        generateGridFrame(
          gridData,
          cols,
          statusMap,
          `無路可走 (死胡同)，回溯 (Backtrack)`
        )
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
        `DFS 搜尋結束，路徑長度：${path.length}`
      )
    );
  } else {
    steps.push(
      generateGridFrame(gridData, cols, statusMap, "堆疊已空，無法到達終點")
    );
  }

  return steps;
}

export function createDFSAnimationSteps(
  inputData: any[],
  action?: any
): AnimationStep[] {
  if (action?.mode === "grid") {
    const gridCols = action?.cols || 5;
    return runGridDFS(inputData, gridCols);
  }
  return runGraphDFS(inputData);
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
      ],
      edges: [
        ["node-0", "node-1"],
        ["node-0", "node-2"],
        ["node-1", "node-3"],
        ["node-2", "node-4"],
        ["node-3", "node-4"],
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

import type { AnimationStep } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import {
  createGridElements,
  createGraphElements,
} from "@/data/DataStructure/nonlinear/utils";
import { Node } from "../../../modules/core/DataLogic/Node";
import { Box } from "../../../modules/core/DataLogic/Box";

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
function runGridDFS(gridData: any): AnimationStep[] {
  let elements: Box[] = [];

  // 判斷是否為陣列 (Grid data 是陣列)
  if (Array.isArray(gridData)) {
    elements = createGridElements(gridData);
  }

  const steps: AnimationStep[] = [];

  steps.push({
    stepNumber: 0,
    description: "Grid 初始化完成 (0:路, 1:牆)",
    elements: elements,
  });

  return steps;
}

export function createDFSAnimationSteps(
  inputData: any[],
  action?: any
): AnimationStep[] {
  if (action?.mode === "grid") {
    return runGridDFS(inputData);
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

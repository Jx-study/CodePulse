import React from "react";
import type { AnimationStep } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import { BFSDFSActionBar } from "./BFSDFSActionBar";
import { createGraphElements } from "@/data/DataStructure/nonlinear/utils";
import { Node } from "../../../modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import {
  generateGridFrame,
  generateGraphFrame,
  updateLinkStatus,
} from "@/data/DataStructure/nonlinear/utils";
import { linkStatus } from "@/modules/core/Render/D3Renderer";

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
      `初始化距離為 ∞，準備開始 DFS`,
    ),
  );

  const stack: { id: string; dist: number }[] = [{ id: realStartId, dist: 0 }];
  const visited = new Set<string>();

  // DFS 主迴圈
  while (stack.length > 0) {
    const item = stack.pop()!;
    const currId = item.id;
    const currDist = item.dist;
    const parentId = parentMap.get(currId);

    if (parentId) {
      updateLinkStatus(linkStatusMap, parentId, currId, "visited", false);
    }

    // 如果已經訪問過且距離更短，則跳過 (雖然 DFS 通常不走回頭路，但這是保險)
    if (visited.has(currId) && distanceMap[currId] <= currDist) continue;

    visited.add(currId);

    // 更新距離：如果是第一次訪問或找到更短路徑 (DFS 不保證最短，但記錄當下路徑長)
    distanceMap[currId] = currDist;
    statusMap[currId] = Status.Target;

    steps.push(
      generateGraphFrame(
        baseElements,
        statusMap,
        distanceMap,
        `訪問節點 ${currId}，更新步數為 ${currDist}`,
        false,
        { ...linkStatusMap },
      ),
    );

    // 檢查終點
    if (currId === realEndId) {
      steps.push(
        generateGraphFrame(
          baseElements,
          statusMap,
          distanceMap,
          "找到終點！",
          false,
          { ...linkStatusMap },
        ),
      );
      break;
    }

    statusMap[currId] = Status.Unfinished; // 歷史軌跡

    const currNode = nodeMap.get(currId);
    if (currNode) {
      const neighbors = currNode.pointers;
      // 排序：降序，這樣小的 ID 會先被 Pop 出來 (Stack LIFO)
      neighbors.sort((a, b) => b.id.localeCompare(a.id));

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
        steps.push(
          generateGraphFrame(
            baseElements,
            statusMap,
            distanceMap,
            `發現鄰居 ${pushedNeighbors.join(", ")}，推入堆疊`,
            false,
            { ...linkStatusMap },
          ),
        );
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

    steps.push(
      generateGraphFrame(
        baseElements,
        statusMap,
        distanceMap,
        `回溯路徑 (長度: ${path.length - 1})`,
        false,
        { ...linkStatusMap },
      ),
    );
  } else {
    steps.push(
      generateGraphFrame(
        baseElements,
        statusMap,
        distanceMap,
        "無法到達終點",
        false,
        { ...linkStatusMap },
      ),
    );
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
  statusMap[startIndex] = Status.Prepare; // 在 stack 中先顯示黃色

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
      statusMap[currIndex] = Status.Complete;
      steps.push(
        generateGridFrame(gridData, cols, statusMap, distanceMap, "找到終點！"),
      );
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
          statusMap[nIndex] = Status.Prepare; // 加入 Stack 變黃色
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
      statusMap[idx] = Status.Complete;
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
  const startNodeId = action?.startNode;
  const endNodeId = action?.endNode;

  if (action?.mode === "grid") {
    const gridCols = action?.cols || 5;
    return runGridDFS(inputData, gridCols, startNodeId, endNodeId);
  }

  return runGraphDFS(inputData, startNodeId, endNodeId);
}

// TODO: 補完 DFS 的 pseudo code 與 mappings
const dfsCodeConfig = {
  pseudo: { content: "", mappings: {} as Record<string, number[]> },
  python: { content: "" },
};

export const DFSConfig: LevelImplementationConfig = {
  id: "dfs",
  type: "algorithm",
  name: "深度優先搜尋 (Depth-First Search)",
  categoryName: "搜尋演算法",
  description: "深度優先搜尋演算法，用於圖或樹的遍歷",
  codeConfig: dfsCodeConfig,
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
  renderActionBar: (props) => <BFSDFSActionBar {...(props as any)} />,
};

import type { AnimationStep } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import {
  createGraphElements,
  generateGraphFrame,
} from "@/data/DataStructure/nonlinear/utils";
import { Node } from "../../../modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";

function runGraphExplore(
  graphData: any,
  startId?: string,
  endId?: string,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  // 1. 建立結構
  let baseElements: Node[] = [];
  if (graphData.nodes && graphData.edges) {
    baseElements = createGraphElements(graphData);
  } else {
    return steps;
  }

  const nodeMap = new Map<string, Node>();
  baseElements.forEach((node) => nodeMap.set(node.id, node));

  // 決定起點與終點 (預設頭尾)
  const sortedIds = baseElements.map((n) => n.id).sort();
  const realStartId = startId && nodeMap.has(startId) ? startId : sortedIds[0];
  const realEndId =
    endId && nodeMap.has(endId) ? endId : sortedIds[sortedIds.length - 1];

  const statusMap: Record<string, Status> = {};
  const distanceMap: Record<string, number> = {};
  const visited = new Set<string>();
  const parentMap = new Map<string, string>();

  // 初始化距離顯示
  baseElements.forEach((n) => (distanceMap[n.id] = 99));

  // Step 0: 初始靜態畫面 (顯示 ID)
  steps.push(
    generateGraphFrame(
      baseElements,
      {},
      distanceMap,
      `圖形結構展示：節點 (Nodes) 與邊 (Edges)。起點: ${realStartId}`,
      true, // 顯示 ID
    ),
  );

  // Step 1: 準備開始
  steps.push(
    generateGraphFrame(
      baseElements,
      {},
      distanceMap,
      `準備進行連通性探索 (基於 BFS)`,
      false, // 轉為顯示距離/數值
    ),
  );

  // 開始遍歷
  const queue: string[] = [realStartId];
  visited.add(realStartId);
  statusMap[realStartId] = "prepare";
  distanceMap[realStartId] = 0;

  steps.push(
    generateGraphFrame(
      baseElements,
      statusMap,
      distanceMap,
      `從起點 ${realStartId} 開始探索`,
    ),
  );

  let found = false;

  while (queue.length > 0) {
    const currId = queue.shift()!;
    const currNode = nodeMap.get(currId);

    statusMap[currId] = "target";

    steps.push(
      generateGraphFrame(
        baseElements,
        statusMap,
        distanceMap,
        `訪問節點 ${currId}，尋找相鄰節點 (Neighbors)`,
      ),
    );

    if (currId === realEndId) {
      found = true;
    }

    if (currNode) {
      const neighbors = currNode.pointers;
      const newNeighbors: string[] = [];
      const currentDist = distanceMap[currId];

      neighbors.sort((a, b) => a.id.localeCompare(b.id));

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          parentMap.set(neighbor.id, currId);
          queue.push(neighbor.id);
          newNeighbors.push(neighbor.id);

          statusMap[neighbor.id] = "prepare";
          distanceMap[neighbor.id] = currentDist + 1;
        }
      }

      if (newNeighbors.length > 0) {
        steps.push(
          generateGraphFrame(
            baseElements,
            statusMap,
            distanceMap,
            `發現未訪問的鄰居：${newNeighbors.join(", ")}`,
          ),
        );
      }
    }

    statusMap[currId] = "unfinished";
  }

  // 結束畫面
  steps.push(
    generateGraphFrame(
      baseElements,
      statusMap,
      distanceMap,
      "圖形遍歷完成，所有可到達的節點已標示",
    ),
  );

  return steps;
}

function runAddNode(graphData: any, newNodeId: string): AnimationStep[] {
  const steps: AnimationStep[] = [];

  // 建立基本元素 (包含剛剛新增的 Node)
  let baseElements: Node[] = [];
  if (graphData.nodes) {
    baseElements = createGraphElements(graphData);
  }

  const statusMap: Record<string, Status> = {};
  const distanceMap: Record<string, number> = {};

  const targetId = newNodeId.startsWith("node-")
    ? newNodeId
    : `node-${newNodeId}`;
  statusMap[targetId] = "target";

  steps.push(
    generateGraphFrame(
      baseElements,
      statusMap,
      distanceMap,
      `新增節點：${newNodeId}`,
      true, // 顯示 ID
    ),
  );

  statusMap[targetId] = "complete";

  steps.push(
    generateGraphFrame(
      baseElements,
      statusMap,
      distanceMap,
      `節點新增完成：${newNodeId}`,
      true, // 顯示 ID
    ),
  );
  return steps;
}

export function createGraphAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  if (action?.type === "addVertex") {
    return runAddNode(inputData, action.value);
  }
  return runGraphExplore(inputData);
}

export const GraphConfig: LevelImplementationConfig = {
  id: "graph", // 對應 level.json 的 implementationKey
  type: "dataStructure",
  name: "圖 (Graph)",
  categoryName: "非線性表",
  description:
    "由節點 (Vertex) 與邊 (Edge) 組成的資料結構，用於描述物件之間的關係。",
  pseudoCode: `Graph G = (V, E)
V: Set of Vertices (Nodes)
E: Set of Edges (Connections)

// 鄰接表表示法 (Adjacency List)
Node A: [B, C]
Node B: [A, D]
Node C: [A]
Node D: [B]`,
  complexity: {
    timeBest: "O(1)", // 存取特定節點
    timeAverage: "O(V + E)", // 遍歷
    timeWorst: "O(V + E)",
    space: "O(V + E)", // 儲存空間
  },
  introduction: `圖 (Graph) 是一種非線性的資料結構，由節點 (Vertex) 和邊 (Edge) 組成。
  
  - **節點 (Vertex)**: 代表資料元素，例如地圖上的城市、社交網絡中的人。
  - **邊 (Edge)**: 代表節點之間的關係，例如城市間的道路、朋友關係。
  
  圖可以分為「有向圖」與「無向圖」，也可以帶有權重 (Weighted)。在此演示中，我們展示的是無向無權圖。`,

  // 這裡使用了包含 graph 和 grid 的雙重結構，以支援切換模式
  defaultData: {
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
  createAnimationSteps: createGraphAnimationSteps,
};

import type { AnimationStep } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import {
  createGraphElements,
  generateGraphFrame,
  updateLinkStatus,
} from "@/data/DataStructure/nonlinear/utils";
import { Node } from "@/modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";

function runRefresh(graphData: any, isDirected: boolean): AnimationStep[] {
  const steps: AnimationStep[] = [];

  // 建立結構
  let baseElements: Node[] = [];
  if (graphData.nodes && graphData.edges) {
    baseElements = createGraphElements(graphData, isDirected);
  } else {
    return steps;
  }

  const nodeMap = new Map<string, Node>();
  baseElements.forEach((node) => nodeMap.set(node.id, node));

  // 初始靜態畫面
  steps.push(
    generateGraphFrame(
      baseElements,
      {},
      {},
      `圖形結構展示：節點 (Nodes) 與邊 (Edges)。`,
      true, // 顯示 ID
    ),
  );

  return steps;
}

function runAddNode(
  graphData: any,
  newNodeId: string,
  isDirected: boolean,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  // 建立基本元素 (包含剛剛新增的 Node)
  let baseElements: Node[] = [];
  if (graphData.nodes) {
    baseElements = createGraphElements(graphData, isDirected);
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

function runRemoveNode(
  graphData: any,
  deletedNodeId: string,
  isDirected: boolean,
  deletedNodeX?: number,
  deletedNodeY?: number,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  // 建立「已刪除後」的基本元素
  let baseElements: Node[] = [];
  if (graphData.nodes) {
    baseElements = createGraphElements(graphData, isDirected);
  }

  const statusMap: Record<string, Status> = {};
  const distanceMap: Record<string, number> = {};

  // 標示要刪除的節點 (Ghost Node)
  const targetId = deletedNodeId.startsWith("node-")
    ? deletedNodeId
    : `node-${deletedNodeId}`;

  // 複製目前的元素列表，準備加入幽靈節點
  const ghostElements = [...baseElements];

  const ghostNode = new Node();
  if (deletedNodeX !== undefined && deletedNodeY !== undefined) {
    ghostNode.moveTo(deletedNodeX, deletedNodeY);
  }
  ghostNode.id = targetId;
  ghostElements.push(ghostNode);

  statusMap[targetId] = "target";

  steps.push(
    generateGraphFrame(
      ghostElements,
      statusMap,
      distanceMap,
      `刪除節點：${deletedNodeId} 及其連接的邊`,
      true,
    ),
  );

  // 真正刪除後的狀態，顯示剩下的節點
  steps.push(
    generateGraphFrame(
      baseElements, // 使用原本 inputData 產生的列表 (已無該節點)
      {},
      {},
      "節點已移除，圖形重新排版",
      true,
    ),
  );

  return steps;
}

function runAddEdge(
  graphData: any,
  sourceId: string,
  targetId: string,
  isDirected: boolean,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  let baseElements: Node[] = [];
  if (graphData.nodes) {
    baseElements = createGraphElements(graphData, isDirected);
  }

  const sId = sourceId.startsWith("node-") ? sourceId : `node-${sourceId}`;
  const tId = targetId.startsWith("node-") ? targetId : `node-${targetId}`;

  const sNode = baseElements.find((n) => n.id === sId);
  const tNode = baseElements.find((n) => n.id === tId);

  // 暫時移除連線
  // 把已經存在的 pointer 拿掉，讓這一幀看起來就像還沒連線
  if (sNode) {
    sNode.pointers = sNode.pointers.filter((n) => n.id !== tId);
  }
  // 如果是無向圖，雙向都有 pointer
  if (!isDirected && tNode) {
    tNode.pointers = tNode.pointers.filter((n) => n.id !== sId);
  }

  const statusMap: Record<string, Status> = {};
  statusMap[sId] = "target";
  statusMap[tId] = "target";

  steps.push(
    generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `選擇節點 ${sourceId} 與 ${targetId} 準備連線`,
      true,
    ),
  );

  // 恢復連線
  if (sNode && tNode) {
    // 檢查是否已經存在 (避免重複添加)
    if (!sNode.pointers.find((n) => n.id === tId)) {
      sNode.pointers = [...sNode.pointers, tNode];
    }
    // 雙向處理
    if (!isDirected) {
      if (!tNode.pointers.find((n) => n.id === sId)) {
        tNode.pointers = [...tNode.pointers, sNode];
      }
    }
  }

  statusMap[sId] = "complete";
  statusMap[tId] = "complete";

  steps.push(
    generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `邊已新增：${sourceId} - ${targetId}`,
      true,
    ),
  );

  return steps;
}

function runRemoveEdge(
  graphData: any,
  sourceId: string,
  targetId: string,
  isDirected: boolean,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  let baseElements: Node[] = [];
  if (graphData.nodes) {
    baseElements = createGraphElements(graphData, isDirected);
  }

  const sId = sourceId.startsWith("node-") ? sourceId : `node-${sourceId}`;
  const tId = targetId.startsWith("node-") ? targetId : `node-${targetId}`;

  const sNode = baseElements.find((n) => n.id === sId);
  const tNode = baseElements.find((n) => n.id === tId);

  // 標記兩點 + 手動補回連線 (Ghost Edge)
  const statusMap: Record<string, Status> = {};
  statusMap[sId] = "target";
  statusMap[tId] = "target";

  if (sNode && tNode) {
    sNode.pointers = [...sNode.pointers, tNode];

    // 如果是無向圖，把反向的加回去
    if (!isDirected) {
      tNode.pointers = [...tNode.pointers, sNode];
    }
  }

  steps.push(
    generateGraphFrame(
      baseElements, // 包含手動加入的 Ghost Edge
      statusMap,
      {},
      `選中節點 ${sourceId} 與 ${targetId}，準備斷開連線`,
      true,
    ),
  );

  // 移除連線
  if (sNode && tNode) {
    sNode.pointers = sNode.pointers.filter((n) => n.id !== tId);

    // 如果是無向圖，也要移除反向的連線
    if (!isDirected) {
      tNode.pointers = tNode.pointers.filter((n) => n.id !== sId);
    }
  }

  statusMap[sId] = "complete";
  statusMap[tId] = "complete";

  steps.push(
    generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `連線已移除：${sourceId} - ${targetId}`,
      true,
    ),
  );

  return steps;
}

function runGetNeighbors(
  graphData: any,
  nodeId: string,
  isDirected: boolean,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  let baseElements: Node[] = [];
  if (graphData.nodes) {
    baseElements = createGraphElements(graphData, isDirected);
  }

  const targetId = nodeId.startsWith("node-") ? nodeId : `node-${nodeId}`;
  const targetNode = baseElements.find((n) => n.id === targetId);

  const statusMap: Record<string, Status> = {};
  statusMap[targetId] = "target";

  steps.push(
    generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `準備尋找節點 ${nodeId} 的鄰居 (讀取 Adjacency List)...`,
      true,
    ),
  );

  if (targetNode) {
    const neighbors = targetNode.pointers;

    if (neighbors.length === 0) {
      steps.push(
        generateGraphFrame(
          baseElements,
          statusMap,
          {},
          `節點 ${nodeId} 沒有鄰居 (Out-Degree = 0)。`,
          true,
        ),
      );
    } else {
      neighbors.forEach((neighbor, index) => {
        statusMap[neighbor.id] = "prepare";

        steps.push(
          generateGraphFrame(
            baseElements,
            { ...statusMap },
            {},
            `發現第 ${index + 1} 個鄰居：${neighbor.id.replace("node-", "")}`,
            true,
          ),
        );

        statusMap[neighbor.id] = "complete";
      });

      const neighborNames = neighbors.map((n) => n.id.replace("node-", ""));
      steps.push(
        generateGraphFrame(
          baseElements,
          statusMap,
          {},
          `搜尋完成，共有 ${neighbors.length} 個鄰居：${neighborNames.join(", ")}`,
          true,
        ),
      );
    }
  } else {
    steps.push(
      generateGraphFrame(baseElements, {}, {}, `節點 ${nodeId} 不存在`, true),
    );
  }

  return steps;
}

function runCheckAdjacent(
  graphData: any,
  sourceId: string,
  targetId: string,
  isDirected: boolean,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  let baseElements: Node[] = [];
  if (graphData.nodes) {
    baseElements = createGraphElements(graphData, isDirected);
  }

  const sId = sourceId.startsWith("node-") ? sourceId : `node-${sourceId}`;
  const tId = targetId.startsWith("node-") ? targetId : `node-${targetId}`;
  const sNode = baseElements.find((n) => n.id === sId);
  const tNode = baseElements.find((n) => n.id === tId);

  const statusMap: Record<string, Status> = {};
  statusMap[sId] = "target";
  statusMap[tId] = "target";

  steps.push(
    generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `檢查 ${sourceId} 是否連通至 ${targetId} (${isDirected ? "有向" : "無向"})`,
      true,
    ),
  );

  if (sNode && tNode) {
    const isConnected = sNode.pointers.some((n) => n.id === tId);

    if (isConnected) {
      statusMap[sId] = "complete";
      statusMap[tId] = "complete";
      steps.push(
        generateGraphFrame(
          baseElements,
          statusMap,
          {},
          `結果：True (存在邊 ${sourceId} -> ${targetId})`,
          true,
        ),
      );
    } else {
      steps.push(
        generateGraphFrame(
          baseElements,
          statusMap,
          {},
          `結果：False (不存在從 ${sourceId} 到 ${targetId} 的邊)`,
          true,
        ),
      );
    }
  }

  return steps;
}

function runGetDegree(
  graphData: any,
  nodeId: string,
  isDirected: boolean,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  let baseElements: Node[] = [];
  if (graphData.nodes) {
    baseElements = createGraphElements(graphData, isDirected);
  }

  const targetId = nodeId.startsWith("node-") ? nodeId : `node-${nodeId}`;
  const targetNode = baseElements.find((n) => n.id === targetId);

  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, string> = {};

  statusMap[targetId] = "target";

  steps.push(
    generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `準備計算節點 ${nodeId} 的度數 (${isDirected ? "有向" : "無向"})...`,
      true,
    ),
  );

  // In: prepare, Out: unfinished
  if (targetNode) {
    let msg = "";

    // 有向圖邏輯
    if (isDirected) {
      // Out-Degree (出度): Target 指向別人
      // 狀態設為 "unfinished"
      const outDegree = targetNode.pointers.length;
      targetNode.pointers.forEach((neighbor) => {
        statusMap[neighbor.id] = "unfinished";
        updateLinkStatus(
          linkStatusMap,
          targetId,
          neighbor.id,
          "visited",
          isDirected,
        );
      });

      // In-Degree (入度): 別人指向 Target
      // 狀態設為 "prepare"
      let inDegree = 0;
      baseElements.forEach((otherNode) => {
        // 檢查 otherNode 是否指向 targetId
        if (otherNode.pointers.some((n) => n.id === targetId)) {
          // 如果發生雙向 (A<->B) 或 自環 (A->A)，顏色會被覆蓋。
          // 這裡 "prepare" (In) 會覆蓋掉 "unfinished" (Out)
          statusMap[otherNode.id] = "prepare";
          updateLinkStatus(
            linkStatusMap,
            otherNode.id,
            targetId,
            "path",
            isDirected,
          );
          inDegree++;
        }
      });

      msg = `節點 ${nodeId}：In-Degree (入度/黃) = ${inDegree}, Out-Degree (出度/藍) = ${outDegree}`;
    } else {
      // 無向圖邏輯

      // Degree: 所有相連的都算，統一設為 "prepare"
      const degree = targetNode.pointers.length;
      targetNode.pointers.forEach((neighbor) => {
        statusMap[neighbor.id] = "prepare";
        updateLinkStatus(
          linkStatusMap,
          targetId,
          neighbor.id,
          "path",
          isDirected,
        );
      });

      msg = `節點 ${nodeId}：Degree (度數) = ${degree}`;
    }

    statusMap[targetId] = "complete";

    steps.push(
      generateGraphFrame(baseElements, statusMap, {}, msg, true, {
        ...linkStatusMap,
      }),
    );
  } else {
    steps.push(
      generateGraphFrame(
        baseElements,
        {},
        {},
        `錯誤：節點 ${nodeId} 不存在`,
        true,
      ),
    );
  }

  return steps;
}

function runCheckConnected(
  graphData: any,
  isDirected: boolean,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  let baseElements: Node[] = [];
  if (graphData.nodes) {
    baseElements = createGraphElements(graphData, isDirected);
  }

  if (baseElements.length === 0) return steps;

  // 建立一個「無向」的鄰接表 (Adjacency List) 用於演算法計算
  // 目的：不管使用者選有向或無向，知道「結構上」是否連在一起
  const undirectedAdj = new Map<string, string[]>();

  baseElements.forEach((n) => undirectedAdj.set(n.id, []));

  // 填入邊 (強制雙向)
  baseElements.forEach((source) => {
    source.pointers.forEach((target) => {
      // 正向
      undirectedAdj.get(source.id)?.push(target.id);
      // 反向 (確保回頭路也能走，這樣才算檢查結構連通)
      undirectedAdj.get(target.id)?.push(source.id);
    });
  });

  // BFS 初始化
  const startNode = baseElements[0]; // 從第一個節點開始
  const visited = new Set<string>();
  const queue: string[] = [startNode.id];
  visited.add(startNode.id);

  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, string> = {};

  statusMap[startNode.id] = "target";
  steps.push(
    generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `採用 BFS，從節點 ${startNode.id} 開始檢查連通性 (忽略方向)`,
      true,
    ),
  );

  // BFS 過程
  // 為了動畫流暢，我們不要每一步都畫，而是把「一層」做成一個 Frame

  // 逐步感染的動畫
  while (queue.length > 0) {
    const currId = queue.shift()!;

    statusMap[currId] = "target";

    const neighbors = undirectedAdj.get(currId) || [];

    let newFound = false;
    neighbors.forEach((neighborId) => {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);
        statusMap[neighborId] = "prepare";
        newFound = true;
        updateLinkStatus(
          linkStatusMap,
          currId,
          neighborId,
          "complete",
          isDirected,
        );
      }
    });

    // 如果有新發現的節點，推一個 Frame 顯示擴散進度
    if (newFound) {
      steps.push(
        generateGraphFrame(
          baseElements,
          { ...statusMap },
          {},
          `擴散中... 已訪問 ${visited.size} / ${baseElements.length} 個節點`,
          true,
          { ...linkStatusMap },
        ),
      );
    }
    statusMap[currId] = "complete";
  }

  // Frame Final: 結果判定
  const isConnected = visited.size === baseElements.length;
  let resultMsg = "";

  if (isConnected) {
    resultMsg = "結果：圖是連通的 (Connected)！所有節點皆可達。";
  } else {
    resultMsg = "結果：圖不連通 (Disconnected)。紅色節點為孤島。";
    baseElements.forEach((n) => {
      if (!visited.has(n.id)) {
        statusMap[n.id] = "target";
      }
    });
  }

  steps.push(
    generateGraphFrame(baseElements, statusMap, {}, resultMsg, true, {
      ...linkStatusMap,
    }),
  );

  return steps;
}

// 檢查是否有環 (DFS)
function runCheckCycle(graphData: any, isDirected: boolean): AnimationStep[] {
  const steps: AnimationStep[] = [];

  let baseElements: Node[] = [];
  if (graphData.nodes) {
    baseElements = createGraphElements(graphData, isDirected);
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();
  const pathStack: string[] = [];

  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, string> = {};

  // 用來儲存找到的環，以便在最後一步顯示
  let cyclePath: string[] = [];
  // 用來儲存造成環的那個「連接點」，讓路徑顯示更完整 (A->B->C->A)
  let cycleConnectTo: string = "";
  let hasCycle = false;

  const dfs = (
    currId: string,
    parentId: string | null, // 僅用於無向圖，避免走回頭路
  ): boolean => {
    visited.add(currId);
    pathStack.push(currId);

    // 有向圖：加入遞迴堆疊
    if (isDirected) recStack.add(currId);

    statusMap[currId] = "target";
    steps.push(
      generateGraphFrame(
        baseElements,
        { ...statusMap },
        {},
        `訪問節點 ${currId} ...`,
        true,
        { ...linkStatusMap },
      ),
    );
    if (parentId !== null) {
      updateLinkStatus(linkStatusMap, currId, parentId, "path", isDirected);
    }
    statusMap[currId] = "prepare";

    const currNode = baseElements.find((n) => n.id === currId);
    if (currNode) {
      for (const neighbor of currNode.pointers) {
        const neighborId = neighbor.id;

        updateLinkStatus(
          linkStatusMap,
          currId,
          neighborId,
          "target",
          isDirected,
        );

        if (!visited.has(neighborId)) {
          if (dfs(neighborId, currId)) return true;

          statusMap[currId] = "target";

          steps.push(
            generateGraphFrame(
              baseElements,
              { ...statusMap },
              {},
              `回到節點 ${currId}`,
              true,
              { ...linkStatusMap },
            ),
          );
          statusMap[currId] = "prepare";
        } else {
          // 發現已訪問過的節點，檢查是否為環
          let isCycle = false;
          if (isDirected) {
            if (recStack.has(neighborId)) isCycle = true;
          } else {
            if (neighborId !== parentId) isCycle = true;
          }

          if (isCycle) {
            const startIndex = pathStack.indexOf(neighborId);
            cyclePath = pathStack.slice(startIndex);
            cycleConnectTo = neighborId; // 記錄最後接回哪裡

            // 環路徑上的邊設為 target
            for (let i = 0; i < cyclePath.length - 1; i++) {
              const u = cyclePath[i];
              const v = cyclePath[i + 1];
              updateLinkStatus(linkStatusMap, u, v, "target", isDirected);
            }

            cyclePath.forEach((id) => (statusMap[id] = "target"));

            steps.push(
              generateGraphFrame(
                baseElements,
                { ...statusMap },
                {},
                `發現環！(${currId} -> ${neighborId})`,
                true,
                { ...linkStatusMap },
              ),
            );
            return true;
          } else if (neighborId !== parentId) {
            // 已經走訪過，非環，不在堆疊裡，標成 visited
            updateLinkStatus(
              linkStatusMap,
              currId,
              neighborId,
              "visited",
              isDirected,
            );
          } else {
            updateLinkStatus(
              linkStatusMap,
              currId,
              neighborId,
              "path",
              isDirected,
            );
          }
        }
      }
    }

    // 離開節點 (Backtrack)
    if (isDirected) recStack.delete(currId);
    pathStack.pop();

    statusMap[currId] = "complete";
    steps.push(
      generateGraphFrame(
        baseElements,
        { ...statusMap },
        {},
        `節點 ${currId} 處理完成`,
        true,
        { ...linkStatusMap },
      ),
    );
    if (parentId !== null) {
      updateLinkStatus(linkStatusMap, currId, parentId, "visited", isDirected);
    }

    return false;
  };

  // 對每個未訪問的節點執行 DFS (處理森林/非連通圖的情況)
  // 如果是無向圖，需要先將 baseElements 排序或按順序遍歷，避免順序混亂
  for (const node of baseElements) {
    if (!visited.has(node.id)) {
      if (dfs(node.id, null)) {
        hasCycle = true;
        break; // 只要找到一個環就可以結束了
      }
    }
  }

  // 最終結果
  if (!hasCycle) {
    steps.push(
      generateGraphFrame(
        baseElements,
        statusMap, // 全綠
        {},
        "檢查結束：此圖無環 (Acyclic)。",
        true,
        {},
      ),
    );
  } else {
    const finalStatusMap: Record<string, Status> = {};

    visited.forEach((id) => {
      finalStatusMap[id] = "complete";
    });

    cyclePath.forEach((id) => {
      finalStatusMap[id] = "target"; // 環設 target
    });

    // 格式化路徑字串 (例如: A -> B -> C -> A)
    const pathNames = cyclePath.map((id) => id.replace("node-", ""));
    const connectToName = cycleConnectTo.replace("node-", "");
    const fullPathStr = [...pathNames, connectToName].join(" -> ");

    steps.push(
      generateGraphFrame(
        baseElements,
        finalStatusMap,
        {},
        `檢查結束：發現環 (Cyclic)。路徑：${fullPathStr}`,
        true,
        linkStatusMap,
      ),
    );
  }

  return steps;
}

export function createGraphAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  if (action?.type === "addVertex") {
    return runAddNode(inputData, action.value, action.isDirected);
  }
  if (action?.type === "removeVertex") {
    return runRemoveNode(
      inputData,
      action.id,
      action.isDirected,
      action.deletedNodeCoords?.x,
      action.deletedNodeCoords?.y,
    );
  }
  if (action?.type === "addEdge") {
    return runAddEdge(
      inputData,
      action.source,
      action.target,
      action.isDirected,
    );
  }
  if (action?.type === "removeEdge") {
    return runRemoveEdge(
      inputData,
      action.source,
      action.target,
      action.isDirected,
    );
  }
  if (action?.type === "getNeighbors") {
    return runGetNeighbors(inputData, action.id, action.isDirected);
  }
  if (action?.type === "checkAdjacent") {
    return runCheckAdjacent(
      inputData,
      action.source,
      action.target,
      action.isDirected,
    );
  }
  if (action?.type === "getDegree") {
    return runGetDegree(inputData, action.id, action.isDirected);
  }
  if (action?.type === "checkConnected") {
    // 這裡傳入 isDirected 用於產生正確的視覺箭頭
    // 內部的演算法會視為無向來檢查結構
    return runCheckConnected(inputData, action.isDirected);
  }
  if (action?.type === "checkCycle") {
    return runCheckCycle(inputData, action.isDirected);
  }
  return runRefresh(inputData, action.isDirected);
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

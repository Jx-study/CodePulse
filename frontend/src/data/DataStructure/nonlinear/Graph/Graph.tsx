import React from "react";
import type { AnimationStep, CodeConfig } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import { graphRealWorldStories } from './graph.stories';
import type { ActionContext } from "@/modules/core/visualization/types";
import { GraphActionBar } from "./GraphActionBar";
import {
  createGraphElements,
  generateGraphFrame,
  updateLinkStatus,
} from "@/data/DataStructure/nonlinear/utils";
import { generateRandomGraphDS } from "@/modules/core/visualization/visualizationUtils";
import type { ActionResult } from "@/modules/core/visualization/types";
import type { GraphData } from "@/modules/core/visualization/types";
import { Node } from "@/modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { linkStatus } from "@/modules/core/Render/D3Renderer";

const TAGS = {
  INIT: "INIT",
  ADD_VERTEX: "ADD_VERTEX",
  ADD_VERTEX_RESULT: "ADD_VERTEX_RESULT",
  REMOVE_VERTEX: "REMOVE_VERTEX",
  REMOVE_VERTEX_UPDATE: "REMOVE_VERTEX_UPDATE",
  ADD_EDGE: "ADD_EDGE",
  ADD_EDGE_UNDIRECTED: "ADD_EDGE_UNDIRECTED",
  REMOVE_EDGE: "REMOVE_EDGE",
  REMOVE_EDGE_UNDIRECTED: "REMOVE_EDGE_UNDIRECTED",
  GET_NEIGHBORS: "GET_NEIGHBORS",
  GET_NEIGHBORS_RESULT_TRUE: "GET_NEIGHBORS_RESULT_TRUE",
  GET_NEIGHBORS_RESULT_FALSE: "GET_NEIGHBORS_RESULT_FALSE",
  CHECK_ADJACENT: "CHECK_ADJACENT",
  CHECK_ADJACENT_RESULT_TRUE: "CHECK_ADJACENT_RESULT_TRUE",
  CHECK_ADJACENT_RESULT_FALSE: "CHECK_ADJACENT_RESULT_FALSE",
  GET_DEGREE_UNDIRECTED: "GET_DEGREE_UNDIRECTED",
  GET_DEGREE_DIRECTED: "GET_DEGREE_DIRECTED",
  CHECK_CONNECTED_INIT: "CHECK_CONNECTED_INIT",
  CHECK_CONNECTED_WHILE: "CHECK_CONNECTED_WHILE",
  CHECK_CONNECTED_RESULT: "CHECK_CONNECTED_RESULT",
  CHECK_CYCLE_INIT: "CHECK_CYCLE_INIT",
  CHECK_CYCLE_DFS: "CHECK_CYCLE_DFS",
  CHECK_CYCLE_FOUND_TRUE: "CHECK_CYCLE_FOUND_TRUE",
  CHECK_CYCLE_FOUND_FALSE: "CHECK_CYCLE_FOUND_FALSE",
  CHECK_CYCLE_END_TRUE: "CHECK_CYCLE_END_TRUE",
  CHECK_CYCLE_END_FALSE: "CHECK_CYCLE_END_FALSE",
};

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
  steps.push({
    ...generateGraphFrame(
      baseElements,
      {},
      {},
      `圖形結構展示：節點 (Nodes) 與邊 (Edges)。`,
      true, // 顯示 ID
    ),
    actionTag: TAGS.INIT,
    variables: {},
  });

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
  statusMap[targetId] = Status.Target;

  steps.push({
    ...generateGraphFrame(
      baseElements,
      statusMap,
      distanceMap,
      `新增節點：${newNodeId}`,
      true, // 顯示 ID
    ),
    actionTag: TAGS.ADD_VERTEX,
    variables: { insertVal: newNodeId },
  });

  statusMap[targetId] = Status.Complete;

  steps.push({
    ...generateGraphFrame(
      baseElements,
      statusMap,
      distanceMap,
      `節點新增完成：${newNodeId}`,
      true, // 顯示 ID
    ),
    actionTag: TAGS.ADD_VERTEX_RESULT,
    variables: { insertVal: newNodeId },
  });
  return steps;
}

function runRemoveNode(
  graphData: any,
  deletedNodeId: string,
  isDirected: boolean,
  deletedEdges: string[][] = [],
  deletedNodeX?: number,
  deletedNodeY?: number,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  let baseElements: Node[] = [];
  if (graphData.nodes) {
    baseElements = createGraphElements(graphData, isDirected);
  }

  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, linkStatus> = {};
  const distanceMap: Record<string, number> = {};

  const targetId = deletedNodeId.startsWith("node-")
    ? deletedNodeId
    : `node-${deletedNodeId}`;

  const ghostElements = [...baseElements];

  const ghostNode = new Node();

  if (deletedNodeX !== undefined && deletedNodeY !== undefined) {
    ghostNode.moveTo(deletedNodeX, deletedNodeY);
  }

  ghostNode.id = targetId;

  deletedEdges.forEach(([source, target]) => {
    if (source === targetId) {
      const targetNode = baseElements.find((n) => n.id === target);
      if (targetNode) {
        ghostNode.pointers.push(targetNode);
        updateLinkStatus(linkStatusMap, targetId, target, Status.Target, isDirected);
      }
    }

    if (target === targetId) {
      const sourceNode = baseElements.find((n) => n.id === source);
      if (sourceNode) {
        sourceNode.pointers.push(ghostNode);
        updateLinkStatus(linkStatusMap, source, targetId, Status.Target, isDirected);
      }
    }
  });
  ghostElements.push(ghostNode);

  statusMap[targetId] = Status.Target;

  steps.push({
    ...generateGraphFrame(
      ghostElements,
      statusMap,
      distanceMap,
      `刪除節點：${deletedNodeId} 及其連接的邊`,
      true,
      { ...linkStatusMap },
    ),
    actionTag: TAGS.REMOVE_VERTEX,
    variables: { removeVal: deletedNodeId },
  });

  // 還原被 mutate 的 pointers，避免 clean step 的 links 仍含已刪除節點
  baseElements.forEach((node) => {
    node.pointers = node.pointers.filter((p) => p.id !== targetId);
  });

  steps.push({
    ...generateGraphFrame(
      baseElements,
      {},
      {},
      "節點已移除，圖形重新排版",
      true,
    ),
    actionTag: TAGS.REMOVE_VERTEX_UPDATE,
    variables: { removeVal: deletedNodeId },
  });

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
  const linkStatusMap: Record<string, linkStatus> = {};
  statusMap[sId] = Status.Target;
  statusMap[tId] = Status.Target;

  steps.push({
    ...generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `選擇節點 ${sourceId} 與 ${targetId} 準備連線`,
      true,
    ),
    actionTag: TAGS.ADD_EDGE,
    variables: { source: sourceId, target: targetId },
  });

  // 恢復連線
  if (sNode && tNode) {
    // 檢查是否已經存在 (避免重複添加)
    if (!sNode.pointers.find((n) => n.id === tId)) {
      sNode.pointers = [...sNode.pointers, tNode];
      updateLinkStatus(linkStatusMap, sId, tId, Status.Complete, isDirected);
    }
    // 雙向處理
    if (!isDirected) {
      if (!tNode.pointers.find((n) => n.id === sId)) {
        tNode.pointers = [...tNode.pointers, sNode];
        updateLinkStatus(linkStatusMap, tId, sId, Status.Complete, isDirected);
      }
    }
  }

  statusMap[sId] = Status.Complete;
  statusMap[tId] = Status.Complete;

  steps.push({
    ...generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `邊已新增：${sourceId} - ${targetId}`,
      true,
      { ...linkStatusMap },
    ),
    actionTag: isDirected ? TAGS.ADD_EDGE : TAGS.ADD_EDGE_UNDIRECTED,
    variables: { source: sourceId, target: targetId },
  });

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
  const linkStatusMap: Record<string, linkStatus> = {};

  statusMap[sId] = Status.Target;
  statusMap[tId] = Status.Target;

  if (sNode && tNode) {
    sNode.pointers = [...sNode.pointers, tNode];
    updateLinkStatus(linkStatusMap, sId, tId, Status.Target, isDirected);

    // 如果是無向圖，把反向的加回去
    if (!isDirected) {
      tNode.pointers = [...tNode.pointers, sNode];
      updateLinkStatus(linkStatusMap, tId, sId, Status.Target, isDirected);
    }
  }

  steps.push({
    ...generateGraphFrame(
      baseElements, // 包含手動加入的 Ghost Edge
      statusMap,
      {},
      `選中節點 ${sourceId} 與 ${targetId}，準備斷開連線`,
      true,
      { ...linkStatusMap },
    ),
    actionTag: TAGS.REMOVE_EDGE,
    variables: { source: sourceId, target: targetId },
  });

  // 移除連線
  if (sNode && tNode) {
    sNode.pointers = sNode.pointers.filter((n) => n.id !== tId);

    // 如果是無向圖，也要移除反向的連線
    if (!isDirected) {
      tNode.pointers = tNode.pointers.filter((n) => n.id !== sId);
    }
  }

  statusMap[sId] = Status.Complete;
  statusMap[tId] = Status.Complete;

  steps.push({
    ...generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `連線已移除：${sourceId} - ${targetId}`,
      true,
    ),
    actionTag: isDirected ? TAGS.REMOVE_EDGE : TAGS.REMOVE_EDGE_UNDIRECTED,
    variables: { source: sourceId, target: targetId },
  });

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
  const linkStatusMap: Record<string, linkStatus> = {};
  statusMap[targetId] = Status.Target;

  steps.push({
    ...generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `準備尋找節點 ${nodeId} 的鄰居 (讀取 Adjacency List)...`,
      true,
    ),
    actionTag: TAGS.GET_NEIGHBORS,
    variables: { target: nodeId },
  });

  if (targetNode) {
    const neighbors = targetNode.pointers;

    if (neighbors.length === 0) {
      steps.push({
        ...generateGraphFrame(
          baseElements,
          statusMap,
          {},
          `節點 ${nodeId} 沒有鄰居 (Out-Degree = 0)。`,
          true,
        ),
        actionTag: TAGS.GET_NEIGHBORS_RESULT_FALSE,
        variables: { target: nodeId, neighborsCount: 0 },
      });
    } else {
      neighbors.forEach((neighbor, index) => {
        statusMap[neighbor.id] = Status.Prepare;
        updateLinkStatus(
          linkStatusMap,
          targetId,
          neighbor.id,
          "path",
          isDirected,
        );
        steps.push({
          ...generateGraphFrame(
            baseElements,
            { ...statusMap },
            {},
            `發現第 ${index + 1} 個鄰居：${neighbor.id.replace("node-", "")}`,
            true,
            { ...linkStatusMap },
          ),
          actionTag: TAGS.GET_NEIGHBORS,
          variables: { target: nodeId, currentNeighbor: neighbor.id },
        });
        updateLinkStatus(
          linkStatusMap,
          targetId,
          neighbor.id,
          Status.Complete,
          isDirected,
        );
        statusMap[neighbor.id] = Status.Complete;
      });

      const neighborNames = neighbors.map((n) => n.id.replace("node-", ""));
      steps.push({
        ...generateGraphFrame(
          baseElements,
          statusMap,
          {},
          `搜尋完成，共有 ${neighbors.length} 個鄰居：${neighborNames.join(", ")}`,
          true,
          { ...linkStatusMap },
        ),
        actionTag: TAGS.GET_NEIGHBORS_RESULT_TRUE,
        variables: { target: nodeId, neighborsCount: neighbors.length },
      });
    }
  } else {
    steps.push({
      ...generateGraphFrame(baseElements, {}, {}, `節點 ${nodeId} 不存在`, true),
      actionTag: TAGS.GET_NEIGHBORS,
      variables: { target: nodeId, error: true },
    });
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
  const linkStatusMap: Record<string, linkStatus> = {};
  statusMap[sId] = Status.Target;
  statusMap[tId] = Status.Target;

  steps.push({
    ...generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `檢查 ${sourceId} 是否連通至 ${targetId} (${isDirected ? "有向" : "無向"})`,
      true,
    ),
    actionTag: TAGS.CHECK_ADJACENT,
    variables: { source: sourceId, target: targetId },
  });

  if (sNode && tNode) {
    const isConnected = sNode.pointers.some((n) => n.id === tId);

    if (isConnected) {
      statusMap[sId] = Status.Complete;
      statusMap[tId] = Status.Complete;
      updateLinkStatus(linkStatusMap, sId, tId, Status.Complete, isDirected);
      steps.push({
        ...generateGraphFrame(
          baseElements,
          statusMap,
          {},
          `結果：True (存在邊 ${sourceId} -> ${targetId})`,
          true,
          { ...linkStatusMap },
        ),
        actionTag: TAGS.CHECK_ADJACENT_RESULT_TRUE,
        variables: { source: sourceId, target: targetId, isAdjacent: true },
      });
    } else {
      statusMap[sId] = Status.Complete;
      statusMap[tId] = Status.Complete;
      steps.push({
        ...generateGraphFrame(
          baseElements,
          statusMap,
          {},
          `結果：False (不存在從 ${sourceId} 到 ${targetId} 的邊)`,
          true,
        ),
        actionTag: TAGS.CHECK_ADJACENT_RESULT_FALSE,
        variables: { source: sourceId, target: targetId, isAdjacent: false },
      });
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
  const linkStatusMap: Record<string, linkStatus> = {};

  statusMap[targetId] = Status.Target;

  steps.push({
    ...generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `準備計算節點 ${nodeId} 的度數 (${isDirected ? "有向" : "無向"})...`,
      true,
    ),
    actionTag: isDirected ? TAGS.GET_DEGREE_DIRECTED : TAGS.GET_DEGREE_UNDIRECTED,
    variables: { target: nodeId },
  });

  // In: prepare, Out: unfinished
  if (targetNode) {
    let msg = "";

    // 有向圖邏輯
    if (isDirected) {
      // Out-Degree (出度): Target 指向別人
      // 狀態設為 Status.Unfinished
      const outDegree = targetNode.pointers.length;
      targetNode.pointers.forEach((neighbor) => {
        statusMap[neighbor.id] = Status.Unfinished;
        updateLinkStatus(
          linkStatusMap,
          targetId,
          neighbor.id,
          "visited",
          isDirected,
        );
      });

      // In-Degree (入度): 別人指向 Target
      // 狀態設為 Status.Prepare
      let inDegree = 0;
      baseElements.forEach((otherNode) => {
        // 檢查 otherNode 是否指向 targetId
        if (otherNode.pointers.some((n) => n.id === targetId)) {
          // 如果發生雙向 (A<->B) 或 自環 (A->A)，顏色會被覆蓋。
          // 這裡 Status.Prepare (In) 會覆蓋掉 Status.Unfinished (Out)
          statusMap[otherNode.id] = Status.Prepare;
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

      // Degree: 所有相連的都算，統一設為 Status.Prepare
      const degree = targetNode.pointers.length;
      targetNode.pointers.forEach((neighbor) => {
        statusMap[neighbor.id] = Status.Prepare;
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

    statusMap[targetId] = Status.Complete;

    steps.push({
      ...generateGraphFrame(baseElements, statusMap, {}, msg, true, {
        ...linkStatusMap,
      }),
      actionTag: isDirected ? TAGS.GET_DEGREE_DIRECTED : TAGS.GET_DEGREE_UNDIRECTED,
      variables: { target: nodeId, ...(!isDirected ? { degree: targetNode.pointers.length } : { outDegree: targetNode.pointers.length, inDegree: baseElements.filter(otherNode => otherNode.pointers.some(n => n.id === targetId)).length }) },
    });
  } else {
    steps.push({
      ...generateGraphFrame(
        baseElements,
        {},
        {},
        `錯誤：節點 ${nodeId} 不存在`,
        true,
      ),
      actionTag: isDirected ? TAGS.GET_DEGREE_DIRECTED : TAGS.GET_DEGREE_UNDIRECTED,
      variables: { target: nodeId, error: true },
    });
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
      // 反向：自環不需要反向（自己就是自己的鄰居），避免重複累積
      if (source.id !== target.id) {
        undirectedAdj.get(target.id)?.push(source.id);
      }
    });
  });

  // BFS 初始化
  const startNode = baseElements[0]; // 從第一個節點開始
  const visited = new Set<string>();
  const queue: string[] = [startNode.id];
  visited.add(startNode.id);

  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, linkStatus> = {};

  statusMap[startNode.id] = Status.Target;
  steps.push({
    ...generateGraphFrame(
      baseElements,
      statusMap,
      {},
      `採用 BFS，從節點 ${startNode.id} 開始檢查連通性 (忽略方向)`,
      true,
    ),
    actionTag: TAGS.CHECK_CONNECTED_INIT,
    variables: { start: startNode.id, queue: queue.join(", ") },
  });

  // BFS 過程
  // 為了動畫流暢，把「一層」做成一個 Frame

  // 逐步感染的動畫
  while (queue.length > 0) {
    const currId = queue.shift()!;

    statusMap[currId] = Status.Target;

    const neighbors = undirectedAdj.get(currId) || [];

    let newFound = false;
    neighbors.forEach((neighborId) => {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);
        statusMap[neighborId] = Status.Prepare;
        newFound = true;
        updateLinkStatus(
          linkStatusMap,
          currId,
          neighborId,
          Status.Complete,
          isDirected,
        );
        updateLinkStatus(
          linkStatusMap,
          neighborId,
          currId,
          Status.Complete,
          isDirected,
        );
      }
    });

    // 如果有新發現的節點，推一個 Frame 顯示擴散進度
    if (newFound) {
      steps.push({
        ...generateGraphFrame(
          baseElements,
          { ...statusMap },
          {},
          `擴散中... 已訪問 ${visited.size} / ${baseElements.length} 個節點 (忽略方向)`,
          true,
          { ...linkStatusMap },
        ),
        actionTag: TAGS.CHECK_CONNECTED_WHILE,
        variables: { current: currId, queue: queue.join(", ") },
      });
    }
    statusMap[currId] = Status.Complete;
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
        statusMap[n.id] = Status.Target;
      }
    });
  }

  steps.push({
    ...generateGraphFrame(baseElements, statusMap, {}, resultMsg, true, {
      ...linkStatusMap,
    }),
    actionTag: TAGS.CHECK_CONNECTED_RESULT,
    variables: { isConnected: isConnected },
  });

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
  const linkStatusMap: Record<string, linkStatus> = {};

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

    statusMap[currId] = Status.Target;
    steps.push({
      ...generateGraphFrame(
        baseElements,
        { ...statusMap },
        {},
        `訪問節點 ${currId} ...`,
        true,
        { ...linkStatusMap },
      ),
      actionTag: TAGS.CHECK_CYCLE_DFS,
      variables: { current: currId },
    });
    if (parentId !== null) {
      updateLinkStatus(linkStatusMap, parentId, currId, "path", isDirected);
    }
    statusMap[currId] = Status.Prepare;

    const currNode = baseElements.find((n) => n.id === currId);
    if (currNode) {
      for (const neighbor of currNode.pointers) {
        const neighborId = neighbor.id;

        updateLinkStatus(
          linkStatusMap,
          currId,
          neighborId,
          Status.Target,
          isDirected,
        );

        if (!visited.has(neighborId)) {
          if (dfs(neighborId, currId)) return true;

          statusMap[currId] = Status.Target;
          updateLinkStatus(
            linkStatusMap,
            currId,
            neighborId,
            "visited",
            isDirected,
          );
          steps.push({
            ...generateGraphFrame(
              baseElements,
              { ...statusMap },
              {},
              `回到節點 ${currId}`,
              true,
              { ...linkStatusMap },
            ),
            actionTag: TAGS.CHECK_CYCLE_DFS,
            variables: { current: currId },
          });
          statusMap[currId] = Status.Prepare;
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
              updateLinkStatus(linkStatusMap, u, v, Status.Target, isDirected);
            }

            cyclePath.forEach((id) => (statusMap[id] = Status.Target));

            steps.push({
              ...generateGraphFrame(
                baseElements,
                { ...statusMap },
                {},
                `發現環！(${currId} -> ${neighborId})`,
                true,
                { ...linkStatusMap },
              ),
              actionTag: TAGS.CHECK_CYCLE_FOUND_TRUE,
              variables: { current: currId, cycleNode: neighborId },
            });
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

    statusMap[currId] = Status.Complete;
    steps.push({
      ...generateGraphFrame(
        baseElements,
        { ...statusMap },
        {},
        `節點 ${currId} 處理完成`,
        true,
        { ...linkStatusMap },
      ),
      actionTag: TAGS.CHECK_CYCLE_FOUND_FALSE,
      variables: { current: parentId || currId },
    });
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
    steps.push({
      ...generateGraphFrame(
        baseElements,
        statusMap, // 全綠
        {},
        "檢查結束：此圖無環 (Acyclic)。",
        true,
        {},
      ),
      actionTag: TAGS.CHECK_CYCLE_END_FALSE,
      variables: { hasCycle: false },
    });
  } else {
    const finalStatusMap: Record<string, Status> = {};

    visited.forEach((id) => {
      finalStatusMap[id] = Status.Complete;
    });

    cyclePath.forEach((id) => {
      finalStatusMap[id] = Status.Target; // 環設 target
    });

    // 格式化路徑字串 (例如: A -> B -> C -> A)
    const pathNames = cyclePath.map((id) => id.replace("node-", ""));
    const connectToName = cycleConnectTo.replace("node-", "");
    const fullPathStr = [...pathNames, connectToName].join(" -> ");

    steps.push({
      ...generateGraphFrame(
        baseElements,
        finalStatusMap,
        {},
        `檢查結束：發現環 (Cyclic)。路徑：${fullPathStr}`,
        true,
        linkStatusMap,
      ),
      actionTag: TAGS.CHECK_CYCLE_END_TRUE,
      variables: { hasCycle: true, cyclePath: fullPathStr },
    });
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
      action.deletedEdges,
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
  return runRefresh(inputData, action?.isDirected);
}

function isGraphData(d: any): d is GraphData {
  return d && !Array.isArray(d) && Array.isArray(d.nodes);
}

/** Graph actionHandler */
function graphActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: GraphData,
  context: ActionContext,
): ActionResult<GraphData> | null {
  if (!isGraphData(data)) return null;
  const newData = JSON.parse(JSON.stringify(data));
  const { nodes, edges } = newData;
  const isDirected = payload.isDirected as boolean;

  if (actionType === "addVertex") {
    const val = payload.value ? String(payload.value) : `node-${nodes.length}`;
    const id = `node-${val}`;
    if (!val || val.trim() === "") {
      context.toast.warning("請輸入節點 ID");
      return null;
    }
    if (nodes.find((n: any) => n.id === id)) {
      context.toast.warning(`節點 ${val} 已存在`);
      return null;
    }
    nodes.push({ id, value: val });
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: { type: "addVertex", value: val, isDirected },
    };
  }

  if (actionType === "removeVertex") {
    const targetVal = String(payload.id ?? "");
    const targetIdVal = `node-${targetVal}`;
    if (!targetVal || targetVal.trim() === "") {
      context.toast.warning("請輸入節點 ID");
      return null;
    }
    const idx = nodes.findIndex((n: any) => n.id === targetIdVal);
    if (idx === -1) {
      context.toast.warning(`節點 ${targetVal} 不存在`);
      return null;
    }
    const relatedEdges = edges.filter(
      (e: any[]) => e[0] === targetIdVal || e[1] === targetIdVal,
    );
    const deletedNodeCoords = { x: nodes[idx].x, y: nodes[idx].y };
    nodes.splice(idx, 1);
    newData.edges = edges.filter(
      (e: any[]) => e[0] !== targetIdVal && e[1] !== targetIdVal,
    );
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: {
        type: "removeVertex",
        id: targetVal,
        isDirected,
        deletedEdges: relatedEdges,
        deletedNodeCoords,
        ...payload,
      },
    };
  }

  if (actionType === "addEdge") {
    const sourceId = `node-${payload.source}`;
    const targetIdVal = `node-${payload.target}`;
    const sExists = nodes.find((n: any) => n.id === sourceId);
    const tExists = nodes.find((n: any) => n.id === targetIdVal);
    if (!sExists || !tExists) {
      context.toast.warning("來源或目標節點不存在");
      return null;
    }
    const exists = edges.some(
      (e: any[]) =>
        (e[0] === sourceId && e[1] === targetIdVal) ||
        (!isDirected && e[0] === targetIdVal && e[1] === sourceId),
    );
    if (exists) {
      context.toast.warning("該連線已存在");
      return null;
    }
    edges.push([sourceId, targetIdVal]);
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: {
        type: "addEdge",
        source: payload.source,
        target: payload.target,
        isDirected,
        ...payload,
      },
    };
  }

  if (actionType === "removeEdge") {
    const sourceId = `node-${payload.source}`;
    const targetIdVal = `node-${payload.target}`;
    const initialLength = edges.length;
    newData.edges = edges.filter((e: any[]) => {
      const isForward = e[0] === sourceId && e[1] === targetIdVal;
      const isBackward = e[0] === targetIdVal && e[1] === sourceId;
      return isDirected ? !isForward : !(isForward || isBackward);
    });
    if (newData.edges.length === initialLength) {
      context.toast.warning("找不到該連線，無法刪除");
      return null;
    }
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: {
        type: "removeEdge",
        source: payload.source,
        target: payload.target,
        isDirected,
        ...payload,
      },
    };
  }

  if (
    ["getNeighbors", "getDegree", "checkAdjacent", "checkConnected", "checkCycle"].includes(
      actionType,
    )
  ) {
    if (
      (actionType === "getNeighbors" || actionType === "getDegree") &&
      (!payload.id || String(payload.id).trim() === "")
    ) {
      context.toast.warning("請輸入節點 ID");
      return null;
    }
    if (
      actionType === "checkAdjacent" &&
      (!payload.source ||
        String(payload.source).trim() === "" ||
        !payload.target ||
        String(payload.target).trim() === "")
    ) {
      context.toast.warning("請輸入來源與目標節點 ID");
      return null;
    }
    if (
      (actionType === "checkConnected" || actionType === "checkCycle") &&
      nodes.length === 0
    ) {
      context.toast.warning("圖形為空");
      return null;
    }
    return {
      animationData: data,
      useRawAnimationParams: true,
      animationParams: { type: actionType, ...payload, isDirected },
    };
  }

  if (["random", "reset", "load", "refresh"].includes(actionType)) {
    if (actionType === "random") {
      const randomCount = Math.floor(Math.random() * 6) + 5;
      const randData = generateRandomGraphDS(randomCount);
      return {
        animationData: randData,
        isResetAction: true,
          useRawAnimationParams: true,
        animationParams: { type: "random", mode: "graph", isDirected },
      };
    }
    if (actionType === "reset") {
      const defaultData = (context.defaultData ?? data) as GraphData;
      const resetData = JSON.parse(JSON.stringify(defaultData));
      if (isGraphData(data)) {
        const coordMap = new Map(
          data.nodes.map((n: any) => [n.id, { x: n.x, y: n.y }]),
        );
        resetData.nodes.forEach((n: any) => {
          const saved = coordMap.get(n.id);
          if (saved?.x !== undefined && saved?.y !== undefined) {
            n.x = saved.x;
            n.y = saved.y;
            if (!n.position) n.position = { x: saved.x, y: saved.y };
            else {
              n.position.x = saved.x;
              n.position.y = saved.y;
            }
          }
        });
      }
      return {
        animationData: resetData,
        isResetAction: true,
          useRawAnimationParams: true,
        animationParams: { type: "reset", mode: "graph", isDirected },
      };
    }
    if (actionType === "load") {
      const loadStr = payload.data as string;
      if (typeof loadStr === "string" && loadStr.startsWith("GRAPH:")) {
        const parts = loadStr.split(":");
        if (parts.length >= 3) {
          const nodeCount = parseInt(parts[1]);
          const edgeStr = parts.slice(2).join(":");
          const nodesArr: any[] = [];
          for (let i = 0; i < nodeCount; i++)
            nodesArr.push({ id: `node-${i}`, value: String(i) });
          const edgesArr: string[][] = [];
          if (edgeStr.trim() !== "") {
            edgeStr.split(",").forEach((pair) => {
              const [u, v] = pair.trim().split(/\s+/);
              if (u && v) edgesArr.push([`node-${u}`, `node-${v}`]);
            });
          }
          const loadData = { nodes: nodesArr, edges: edgesArr };
          return {
            animationData: loadData,
            isResetAction: true,
                  useRawAnimationParams: true,
            animationParams: { type: "load", mode: "graph", isDirected: payload.Directed },
          };
        }
      }
    }
    return {
      animationData: data,
      isResetAction: true,
      useRawAnimationParams: true,
      animationParams: { type: "refresh", mode: "graph", isDirected },
    };
  }

  return null;
}

const graphCodeConfig: CodeConfig = {
  pseudo: {
    content: `Class Graph:
  Procedure AddVertex(id):
    If id is not in adjList Then
      adjList[id] ← Empty List
    End If
  End Procedure

  Procedure RemoveVertex(id):
    If id is in adjList Then
      Remove adjList[id]
      For Each u in adjList Do
        If id is in adjList[u] Then
          Remove id from adjList[u]
        End If
      End For
    End If
  End Procedure

  Procedure AddEdge(u, v):
    If u in adjList And v in adjList Then
      If v is not in adjList[u] Then
        Append v to adjList[u]
      End If
      If isDirected = False Then
        If u is not in adjList[v] Then
          Append u to adjList[v]
        End If
      End If
    End If
  End Procedure

  Procedure RemoveEdge(u, v):
    If u in adjList And v in adjList Then
      If v is in adjList[u] Then
        Remove v from adjList[u]
      End If
      If isDirected = False Then
        If u is in adjList[v] Then
          Remove u from adjList[v]
        End If
      End If
    End If
  End Procedure

  Procedure GetNeighbors(id):
    If id is in adjList Then
      Return adjList[id]
    End If
    Return Empty List
  End Procedure

  Procedure CheckAdjacent(u, v):
    If u is in adjList Then
      Return v is in adjList[u]
    End If
    Return False
  End Procedure

  Procedure GetDegree(id):
    If id is not in adjList Then
      Return -1
    End If
    If isDirected = False Then
      Return size of adjList[id]
    Else
      outDeg ← size of adjList[id]
      inDeg ← number of nodes that point to id
      Return outDeg, inDeg
    End If
  End Procedure

  Procedure CheckConnected():
    visited ← Empty Set
    queue ← Empty Queue
    start ← First node in adjList
    visited.Add(start)
    queue.Enqueue(start)

    While queue is not Empty Do
      curr ← queue.Dequeue()
      For Each neighbor in adjList[curr] Do
        If neighbor is not in visited Then
          visited.Add(neighbor)
          queue.Enqueue(neighbor)
        End If
      End For
    End While

    Return size of visited = size of adjList
  End Procedure

  Procedure CheckCycle():
    visited ← Empty Set
    recStack ← Empty Set
    pathStack ← Empty Stack

    Function DFS(curr, parent):
      visited.Add(curr)
      recStack.Add(curr)
      pathStack.Push(curr)

      For Each neighbor in adjList[curr] Do
        If neighbor is not in visited Then
          result ← DFS(neighbor, curr)
          If result is not Null Then Return result
        Else If isDirected = True And neighbor is in recStack Then Return pathStack
        Else If isDirected = False And neighbor ≠ parent Then Return pathStack
      End For

      recStack.Remove(curr)
      pathStack.Pop()
      Return Null
    End Function

    For Each node in adjList Do
      If node is not in visited Then
        result ← DFS(node, Null)
        If result is not Null Then Return result
    End For
    Return Null
  End Procedure
End Class`,
    mappings: {
      [TAGS.ADD_VERTEX]: [2, 3, 4],
      [TAGS.ADD_VERTEX_RESULT]: [6],
      [TAGS.REMOVE_VERTEX]: [8, 9],
      [TAGS.REMOVE_VERTEX_UPDATE]: [10, 11, 12, 13, 14],
      [TAGS.ADD_EDGE]: [19, 20, 21, 22],
      [TAGS.ADD_EDGE_UNDIRECTED]: [24, 25, 26, 27],
      [TAGS.REMOVE_EDGE]: [32, 33, 34, 35],
      [TAGS.REMOVE_EDGE_UNDIRECTED]: [37, 38, 39, 40],
      [TAGS.GET_NEIGHBORS]: [45, 46],
      [TAGS.GET_NEIGHBORS_RESULT_TRUE]: [47],
      [TAGS.GET_NEIGHBORS_RESULT_FALSE]: [49],
      [TAGS.CHECK_ADJACENT]: [52, 53],
      [TAGS.CHECK_ADJACENT_RESULT_TRUE]: [54],
      [TAGS.CHECK_ADJACENT_RESULT_FALSE]: [56],
      [TAGS.GET_DEGREE_UNDIRECTED]: [63, 64],
      [TAGS.GET_DEGREE_DIRECTED]: [65, 66, 67, 68, 69],
      [TAGS.CHECK_CONNECTED_INIT]: [72, 73, 74, 75, 76, 77],
      [TAGS.CHECK_CONNECTED_WHILE]: [79, 80, 81, 82, 83, 84, 85, 86],
      [TAGS.CHECK_CONNECTED_RESULT]: [89],
      [TAGS.CHECK_CYCLE_INIT]: [92, 93, 94],
      [TAGS.CHECK_CYCLE_DFS]: [97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112],
      [TAGS.CHECK_CYCLE_FOUND_TRUE]: [105, 106],
      [TAGS.CHECK_CYCLE_FOUND_FALSE]: [112],
      [TAGS.CHECK_CYCLE_END_TRUE]: [116, 117, 118],
      [TAGS.CHECK_CYCLE_END_FALSE]: [120],
    },
  },
  python: {
    content: `class Graph:
    def __init__(self, is_directed: bool = False):
        self.adj_list = {}
        self.is_directed = is_directed

    def add_vertex(self, vertex_id: str) -> None:
        if vertex_id not in self.adj_list:
            self.adj_list[vertex_id] = []

    def remove_vertex(self, vertex_id: str) -> None:
        if vertex_id in self.adj_list:
            del self.adj_list[vertex_id]
            for u in self.adj_list:
                if vertex_id in self.adj_list[u]:
                    self.adj_list[u].remove(vertex_id)

    def add_edge(self, source: str, target: str) -> None:
        if source in self.adj_list and target in self.adj_list:
            if target not in self.adj_list[source]:
                self.adj_list[source].append(target)
            if not self.is_directed:
                if source not in self.adj_list[target]:
                    self.adj_list[target].append(source)

    def remove_edge(self, source: str, target: str) -> None:
        if source in self.adj_list and target in self.adj_list:
            if target in self.adj_list[source]:
                self.adj_list[source].remove(target)
            if not self.is_directed and source in self.adj_list[target]:
                self.adj_list[target].remove(source)

    def get_neighbors(self, vertex_id: str) -> list:
        if vertex_id in self.adj_list:
            return self.adj_list[vertex_id]
        return []

    def check_adjacent(self, source: str, target: str) -> bool:
        if source in self.adj_list:
            return target in self.adj_list[source]
        return False

    def get_degree(self, vertex_id: str) -> int:
        if vertex_id not in self.adj_list:
            return -1
        if not self.is_directed:
            return len(self.adj_list[vertex_id])
        out_deg = len(self.adj_list[vertex_id])
        in_deg = sum(1 for u in self.adj_list if vertex_id in self.adj_list[u])
        return out_deg, in_deg

    def check_connected(self) -> bool:
        if not self.adj_list:
            return True
        visited = set()
        start = next(iter(self.adj_list))
        queue = [start]
        visited.add(start)
        
        while queue:
            curr = queue.pop(0)
            for neighbor in self.adj_list[curr]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
                    
        return len(visited) == len(self.adj_list)

    def check_cycle(self) -> list:
        visited = set()
        rec_stack = set()
        path_stack = []
        
        def dfs(curr: str, parent: str) -> list:
            visited.add(curr)
            rec_stack.add(curr)
            path_stack.append(curr)
            
            for neighbor in self.adj_list[curr]:
                if neighbor not in visited:
                    result = dfs(neighbor, curr)
                    if result: return result
                elif self.is_directed and neighbor in rec_stack: return path_stack.copy()
                elif not self.is_directed and neighbor != parent: return path_stack.copy()
                
            rec_stack.remove(curr)
            path_stack.pop()
            return []
            
        for node in self.adj_list:
            if node not in visited:
                result = dfs(node, None)
                if result: return result
        return []`
  },
};

export const GraphConfig: LevelImplementationConfig = {
  id: "graph", // 對應 level.json 的 implementationKey
  type: "dataStructure",
  name: "圖 (Graph)",
  categoryName: "非線性表",
  description:
    "由節點 (Vertex) 與邊 (Edge) 組成的資料結構，用於描述物件之間的關係。",
  // TODO: 補完 Graph 的 pseudo code 與 mappings
  codeConfig: graphCodeConfig,
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
  realWorldStories: graphRealWorldStories,
  actionHandler: graphActionHandler,
  maxNodes: 20,
  renderActionBar: (props) => <GraphActionBar {...(props as any)} />,
  relatedProblems: [
    {
      id: 133,
      title: "Clone Graph",
      concept: "圖的深拷貝：用雜湊表記錄已訪問節點，遞迴/BFS 複製整張無向圖",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/clone-graph/",
    },
    {
      id: 207,
      title: "Course Schedule",
      concept: "有向圖環偵測：若先修課程形成環則無法完成，以拓樸排序判斷 DAG 性質",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/course-schedule/",
    },
    {
      id: 210,
      title: "Course Schedule II",
      concept: "拓樸排序：在 DAG 中求線性學習順序，使用 Kahn's 演算法或 DFS 輸出排列",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/course-schedule-ii/",
    },
    {
      id: 684,
      title: "Redundant Connection",
      concept: "環偵測 / Union-Find：找出使無向樹出現多餘一條邊（形成環）的那條邊",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/redundant-connection/",
    },
    {
      id: 269,
      title: "Alien Dictionary",
      concept: "拓樸排序進階：從字典序推導字母偏序關係，建圖後輸出合法字母順序",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/alien-dictionary/",
    },
  ],
};

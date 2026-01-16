import { Node } from "../../../modules/core/DataLogic/Node";
import { Status } from "../../../modules/core/DataLogic/BaseElement";
import {
  AnimationStep,
  DataStructureConfig,
} from "../../../types/dataStructure";

interface ListNodeData {
  id: string;
  value: number;
}

interface ActionType {
  type: string;
  value: number;
  mode: string;
  targetId?: string;
}
/**
 * 創建鏈表的動畫步驟
 */
export function createLinkedListAnimationSteps(): AnimationStep[] {
  const steps: AnimationStep[] = [];

  // Helper: 創建鏈表節點
  const createNodes = (
    nodeCount: number,
    values: number[],
    statusMap: { [id: string]: Status } = {},
    startX: number = 200
  ) => {
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const Node1 = new Node();
      Node1.id = `node-${i}`;
      Node1.moveTo(startX + i * 110, 200);
      Node1.radius = 30;
      Node1.value = values[i];
      Node1.description = `${i}`;
      Node1.setStatus(statusMap[Node1.id] || "unfinished");
      nodes.push(Node1);
    }
    return nodes;
  };

  // Step 1: 初始鏈表
  steps.push({
    stepNumber: 1,
    description: "初始鏈表：1 → 2 → 3 → null",
    elements: createNodes(3, [1, 2, 3]),
  });

  // Step 2: 準備在頭部插入新節點
  steps.push({
    stepNumber: 2,
    description: "準備在頭部插入新節點 0",
    elements: createNodes(3, [1, 2, 3], {
      "node-0": "target",
    }),
  });

  // Step 3: 在頭部插入節點
  steps.push({
    stepNumber: 3,
    description: "在頭部插入節點 0 → 1 → 2 → 3 → null",
    elements: createNodes(4, [0, 1, 2, 3], {
      "node-0": "complete",
    }),
  });

  // Step 4: 準備在中間插入節點
  steps.push({
    stepNumber: 4,
    description: "準備在位置 2 插入新節點 5",
    elements: createNodes(4, [0, 1, 2, 3], {
      "node-1": "prepare",
      "node-2": "target",
    }),
  });

  // Step 5: 在中間插入節點
  steps.push({
    stepNumber: 5,
    description: "插入節點：0 → 1 → 5 → 2 → 3 → null",
    elements: createNodes(5, [0, 1, 5, 2, 3], {
      "node-2": "complete",
    }),
  });

  // Step 6: 準備在尾部插入節點
  steps.push({
    stepNumber: 6,
    description: "準備在尾部插入新節點 9",
    elements: createNodes(5, [0, 1, 5, 2, 3], {
      "node-4": "target",
    }),
  });

  // Step 7: 在尾部插入節點
  steps.push({
    stepNumber: 7,
    description: "在尾部插入節點：0 → 1 → 5 → 2 → 3 → 9 → null",
    elements: createNodes(6, [0, 1, 5, 2, 3, 9], {
      "node-5": "complete",
    }),
  });

  // Step 8: 準備刪除節點
  steps.push({
    stepNumber: 8,
    description: "準備刪除節點 5",
    elements: createNodes(6, [0, 1, 5, 2, 3, 9], {
      "node-1": "prepare",
      "node-2": "target",
      "node-3": "prepare",
    }),
  });

  // Step 9: 刪除節點
  steps.push({
    stepNumber: 9,
    description: "刪除節點 5：0 → 1 → 2 → 3 → 9 → null",
    elements: createNodes(5, [0, 1, 2, 3, 9]),
  });

  // Step 10: 遍歷鏈表 - 節點 1
  steps.push({
    stepNumber: 10,
    description: "遍歷鏈表：訪問節點 0",
    elements: createNodes(5, [0, 1, 2, 3, 9], {
      "node-0": "target",
    }),
  });

  // Step 11: 遍歷鏈表 - 節點 2
  steps.push({
    stepNumber: 11,
    description: "遍歷鏈表：訪問節點 1",
    elements: createNodes(5, [0, 1, 2, 3, 9], {
      "node-0": "complete",
      "node-1": "target",
    }),
  });

  // Step 12: 遍歷鏈表 - 節點 3
  steps.push({
    stepNumber: 12,
    description: "遍歷鏈表：訪問節點 2",
    elements: createNodes(5, [0, 1, 2, 3, 9], {
      "node-0": "complete",
      "node-1": "complete",
      "node-2": "target",
    }),
  });

  // Step 13: 遍歷鏈表 - 節點 4
  steps.push({
    stepNumber: 13,
    description: "遍歷鏈表：訪問節點 3",
    elements: createNodes(5, [0, 1, 2, 3, 9], {
      "node-0": "complete",
      "node-1": "complete",
      "node-2": "complete",
      "node-3": "target",
    }),
  });

  // Step 14: 遍歷鏈表 - 節點 5
  steps.push({
    stepNumber: 14,
    description: "遍歷鏈表：訪問節點 9",
    elements: createNodes(5, [0, 1, 2, 3, 9], {
      "node-0": "complete",
      "node-1": "complete",
      "node-2": "complete",
      "node-3": "complete",
      "node-4": "target",
    }),
  });

  // Step 15: 遍歷完成
  steps.push({
    stepNumber: 15,
    description: "遍歷完成：0 → 1 → 2 → 3 → 9 → null",
    elements: createNodes(5, [0, 1, 2, 3, 9], {
      "node-0": "complete",
      "node-1": "complete",
      "node-2": "complete",
      "node-3": "complete",
      "node-4": "complete",
    }),
  });

  return steps;
}

/**
 * 建立節點實例的工廠函式
 */
function createNodeInstance(
  id: string,
  val: number,
  x: number,
  y: number,
  status: Status = "unfinished"
) {
  const n = new Node();
  n.id = id;
  n.value = val;
  n.moveTo(x, y);
  n.setStatus(status);
  return n;
}

function linkNodes(nodes: Node[]) {
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].pointers = [nodes[i + 1]];
  }
}

export function generateStepsFromData(
  dataList: ListNodeData[],
  action?: ActionType
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const startX = 200;
  const gap = 120;
  const baseY = 200;

  const createNode = (
    item: ListNodeData,
    x: number,
    y: number,
    status: Status = "unfinished"
  ) => {
    return createNodeInstance(`node-${item.id}`, item.value, x, y, status);
  };

  // 初始/靜態渲染
  if (!action) {
    const nodes = dataList.map((item, i) =>
      createNode(item, startX + i * gap, baseY, "complete")
    );
    linkNodes(nodes);
    steps.push({ stepNumber: 1, description: "初始鏈表", elements: nodes });
    return steps;
  }

  const { type, value, mode } = action;

  // --- Insert Head 邏輯 ---
  if (type === "add" && mode === "Head") {
    const newNodeData = dataList[0];
    const oldNodesData = dataList.slice(1);

    // Step 1: 新節點在左側出現
    const s1OldNodes = oldNodesData.map((item, i) =>
      createNode(item, startX + i * gap, baseY, "complete")
    );
    linkNodes(s1OldNodes);

    const s1NewNode = createNode(newNodeData, startX - gap, baseY, "target"); // 新節點在左邊

    steps.push({
      stepNumber: 1,
      description: `建立新節點 ${value}`,
      elements: [s1NewNode, ...s1OldNodes],
    });

    // Step 2: 建立連線 (New -> OldHead)
    // 物件是重新 new 出來的，但 ID 與 Step 1 相同，動畫不會受到影響
    const s2OldNodes = oldNodesData.map((item, i) =>
      createNode(item, startX + i * gap, baseY, "complete")
    );
    const s2NewNode = createNode(newNodeData, startX - gap, baseY, "target");

    // 連接：新節點 -> 舊的 HEAD
    const allS2 = [s2NewNode, ...s2OldNodes];
    linkNodes(allS2);

    steps.push({
      stepNumber: 2,
      description: "建立連線指向原 Head",
      elements: allS2,
    });

    // Step 3: 全體向右平移
    // 遍歷完整的 dataList，重新計算 X 座標
    const s3Nodes = dataList.map((item, i) =>
      createNode(item, startX + i * gap, baseY, "complete")
    );
    linkNodes(s3Nodes);

    steps.push({
      stepNumber: 3,
      description: "新增完成",
      elements: s3Nodes,
    });
  }

  // --- Insert Tail 邏輯 ---
  else if (type === "add" && mode === "Tail") {
    const oldNodesData = dataList.slice(0, -1); // 排除最後一個(剛新增的)
    const newNodeData = dataList[dataList.length - 1];

    // Step 1 ~ N: 遍歷過程
    for (let i = 0; i < oldNodesData.length; i++) {
      const traverseNodes = oldNodesData.map((item, idx) =>
        createNode(
          item,
          startX + idx * gap,
          baseY,
          idx === i ? "prepare" : "unfinished"
        )
      );
      linkNodes(traverseNodes);

      steps.push({
        stepNumber: steps.length + 1,
        description: `遍歷中：檢查節點 ${oldNodesData[i].value}`,
        elements: traverseNodes,
      });
    }

    // Step N+1: 在最後建立新節點
    const lastNodes = oldNodesData.map((item, i) =>
      createNode(
        item,
        startX + i * gap,
        baseY,
        i === oldNodesData.length - 1 ? "prepare" : "unfinished"
      )
    );
    linkNodes(lastNodes);

    const newNodeTail = createNode(
      newNodeData,
      startX + oldNodesData.length * gap,
      baseY,
      "target"
    );

    steps.push({
      stepNumber: steps.length + 1,
      description: "建立新節點",
      elements: [...lastNodes, newNodeTail],
    });

    // Step N+2: 連接
    const stepLinkOldNodes = oldNodesData.map((item, i) =>
      createNode(
        item,
        startX + i * gap,
        baseY,
        i === oldNodesData.length - 1 ? "prepare" : "unfinished"
      )
    );
    const stepLinkNewNode = createNode(
      newNodeData,
      startX + oldNodesData.length * gap,
      baseY,
      "target"
    );

    const finalNodes = [...stepLinkOldNodes, stepLinkNewNode];
    linkNodes(finalNodes);

    steps.push({
      stepNumber: steps.length + 1,
      description: "連接新節點",
      elements: finalNodes,
    });

    // Step N+3: 完成狀態
    const doneNodes = dataList.map((item, i) =>
      createNode(item, startX + i * gap, baseY, "complete")
    );
    linkNodes(doneNodes);

    steps.push({
      stepNumber: steps.length + 1,
      description: "插入完成",
      elements: doneNodes,
    });
  }

  return steps;
}

// 鏈表數據結構配置
export const linkedListConfig: DataStructureConfig = {
  id: "linkedlist",
  name: "鏈結串列 (Linked List)",
  category: "linear",
  categoryName: "線性表",
  description: "動態的線性數據結構",
  pseudoCode: `class Node:
    value: any
    next: Node

class LinkedList:
    head: Node

    // 在頭部插入節點
    insertAtHead(value):
        newNode = new Node(value)
        newNode.next = head
        head = newNode

    // 在尾部插入節點
    insertAtTail(value):
        newNode = new Node(value)
        if head is null:
            head = newNode
        else:
            current = head
            while current.next is not null:
                current = current.next
            current.next = newNode

    // 刪除節點
    deleteNode(value):
        if head is null:
            return
        if head.value == value:
            head = head.next
            return
        current = head
        while current.next is not null:
            if current.next.value == value:
                current.next = current.next.next
                return
            current = current.next

    // 遍歷鏈表
    traverse():
        current = head
        while current is not null:
            print(current.value)
            current = current.next`,
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(1)",
  },
  introduction: `鏈表是一種基本的線性數據結構，由一系列節點組成，每個節點包含數據和指向下一個節點的指針。
與陣列不同，鏈表的元素在記憶體中不是連續存儲的，這使得插入和刪除操作更加高效。
鏈表分為單向鏈表、雙向鏈表和循環鏈表等類型。單向鏈表的每個節點只有一個指向下一個節點的指針，
適合需要頻繁插入和刪除的場景，但訪問特定位置的元素需要從頭開始遍歷。`,
  createAnimationSteps: createLinkedListAnimationSteps,
};

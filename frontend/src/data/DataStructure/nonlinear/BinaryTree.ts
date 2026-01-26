import { DataStructureConfig } from "@/types/dataStructure";
import { AnimationStep } from "@/types";
import { createTreeNodes } from "./utils";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Node } from "@/modules/core/DataLogic/Node";

// 1. 定義邏輯節點
interface LogicTreeNode {
  id: string;
  value: number;
  left?: LogicTreeNode;
  right?: LogicTreeNode;
}

// 2. 輔助函式：將線性資料轉為邏輯樹 (Level Order)
function buildLogicalTree(data: any[]): LogicTreeNode | null {
  if (data.length === 0) return null;
  const nodes = data.map((d) => ({ ...d }));
  const root = nodes[0];
  const queue = [root];
  let i = 1;

  while (i < nodes.length) {
    const curr = queue.shift();
    if (curr) {
      // Left
      if (i < nodes.length) {
        curr.left = nodes[i++];
        queue.push(curr.left);
      }
      // Right
      if (i < nodes.length) {
        curr.right = nodes[i++];
        queue.push(curr.right);
      }
    }
  }
  return root;
}

// 3. 輔助函式：產生 Frame
const generateFrame = (
  inputData: any[],
  statusMap: Record<string, Status>,
  description: string
): AnimationStep => {
  const elements = createTreeNodes(inputData, { degree: 2 });

  // 根據 statusMap 更新節點顏色
  elements.forEach((el) => {
    if (el instanceof Node && statusMap[el.id]) {
      el.setStatus(statusMap[el.id]);
    }
  });

  return {
    stepNumber: 0, // 外部會重算，這裡填 0 即可
    description,
    elements,
  };
};

// 4. 實作 Preorder 邏輯
function runPreorder(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const statusMap: Record<string, Status> = {};
  const root = buildLogicalTree(inputData);

  // 初始狀態
  steps.push(
    generateFrame(inputData, {}, "開始前序遍歷 (Root -> Left -> Right)")
  );

  if (!root) return steps;

  // 遞迴函式
  const traverse = (node: LogicTreeNode | undefined) => {
    if (!node) return;

    // Step A: 訪問根節點 (Root)
    statusMap[node.id] = "target";
    steps.push(generateFrame(inputData, statusMap, `訪問節點 ${node.value}`));

    statusMap[node.id] = "complete";

    // Step 3: 處理左子樹
    if (node.left) {
      statusMap[node.left.id] = "prepare";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入左子節點 ${node.left.value}`
        )
      );

      // 清除 prepare 狀態，交給遞迴下一層去變 target
      delete statusMap[node.left.id];

      traverse(node.left);

      // 3-3: Backtrack (回到這裡)
      // 雖然 node 已經 complete，但回到這裡時要標示為 target
      const originalStatus = statusMap[node.id]; // 記住原本狀態 (complete)
      statusMap[node.id] = "target"; // 暫時覆蓋為 target
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `左子樹遍歷結束，回到節點 ${node.value}`
        )
      );
      statusMap[node.id] = originalStatus; // 還原狀態 (complete)
    } else {
      // 如果沒有左子樹，顯示訊息
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點 ${node.value} 無左子節點，返回`
        )
      );
      statusMap[node.id] = "complete";
    }

    // Step 4: 處理右子樹
    if (node.right) {
      statusMap[node.right.id] = "prepare";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入右子節點 ${node.right.value}`
        )
      );

      delete statusMap[node.right.id];

      // 4-2: Recursion
      traverse(node.right);

      // 4-3: Backtrack (回到這裡)
      const originalStatus = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `右子樹遍歷結束，回到節點 ${node.value}`
        )
      );
      statusMap[node.id] = originalStatus;
    } else {
      // 如果沒有右子樹，顯示訊息
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點 ${node.value} 無右子節點，返回`
        )
      );
      statusMap[node.id] = "complete";
    }
  };

  traverse(root);

  steps.push(generateFrame(inputData, statusMap, "前序遍歷完成"));
  return steps;
}

export function createBinaryTreeAnimationSteps(
  inputData: any[],
  action?: any
): AnimationStep[] {
  // 如果有指定模式，執行對應演算法
  if (action?.mode === "preorder") {
    return runPreorder(inputData);
  }

  // 預設：只顯示初始結構
  const steps: AnimationStep[] = [];
  const elements = createTreeNodes(inputData, { degree: 2 });

  steps.push({
    stepNumber: 0,
    description: `二元樹建立完成 (節點數: ${inputData.length})`,
    elements: elements,
  });

  return steps;
}

export const BinaryTreeConfig: DataStructureConfig = {
  id: "binarytree",
  name: "二元樹 (Binary Tree)",
  category: "nonlinear",
  categoryName: "非線性表",
  description: "每個節點最多有兩個子節點的樹狀結構",
  pseudoCode: `
function preorder(node):
    if node is null: return
    visit(node)      // 1. 根
    preorder(node.left)  // 2. 左
    preorder(node.right) // 3. 右
  `,
  complexity: {
    timeBest: "O(n)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(h)", // h 是樹高
  },
  introduction: `前序遍歷 (Preorder Traversal) 是一種深度優先搜尋 (DFS)。
  它的順序是：先訪問根節點，再訪問左子樹，最後訪問右子樹。
  
  應用場景：複製二元樹、計算波蘭表示法 (Prefix Notation)。`,
  defaultData: [
    { id: "node-1", value: 1 },
    { id: "node-2", value: 2 },
    { id: "node-3", value: 3 },
    { id: "node-4", value: 4 },
    { id: "node-5", value: 5 },
    { id: "node-6", value: 6 },
    { id: "node-7", value: 7 },
  ],
  createAnimationSteps: createBinaryTreeAnimationSteps,
};

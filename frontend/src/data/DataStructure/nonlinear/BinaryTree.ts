import { DataStructureConfig } from "@/types/dataStructure";
import { AnimationStep, CodeConfig } from "@/types/animation";
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
    if (el instanceof Node) {
      const status = statusMap[el.id] ? statusMap[el.id] : "inactive";
      el.setStatus(status);
    }
  });

  return {
    stepNumber: 0, // 外部會重算，這裡填 0 即可
    description,
    elements,
  };
};

// A. 前序遍歷 (Root -> Left -> Right)
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

    // 訪問根節點 (Root)
    statusMap[node.id] = "target";
    steps.push(generateFrame(inputData, statusMap, `訪問節點 ${node.value}`));

    statusMap[node.id] = "complete";

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

      // Backtrack (回到這裡)
      // 雖然 node 已經 complete，但回到這裡時要標示為 target
      const originalStatus = statusMap[node.id]; // 記住原本狀態 (complete)
      statusMap[node.id] = "target";
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
      const originalStatus = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點 ${node.value} 無左子節點，返回`
        )
      );
      statusMap[node.id] = originalStatus;
    }

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

      // Recursion
      traverse(node.right);

      // Backtrack (回到這裡)
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
      const originalStatus = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點 ${node.value} 無右子節點，返回`
        )
      );
      statusMap[node.id] = originalStatus;
    }
  };

  traverse(root);
  steps.push(generateFrame(inputData, statusMap, "前序遍歷完成"));
  return steps;
}

// B. 中序遍歷 (Left -> Root -> Right)
function runInorder(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const statusMap: Record<string, Status> = {};
  const root = buildLogicalTree(inputData);

  steps.push(
    generateFrame(inputData, {}, "開始中序遍歷 (Left -> Root -> Right)")
  );
  if (!root) return steps;

  const traverse = (node: LogicTreeNode | undefined) => {
    if (!node) return;

    // 抵達節點 (還沒 Process，先標記 Target)
    statusMap[node.id] = "target";
    steps.push(generateFrame(inputData, statusMap, `抵達節點 ${node.value}`));
    statusMap[node.id] = "unfinished";

    if (node.left) {
      statusMap[node.left.id] = "prepare";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入左子節點 ${node.left.value}`
        )
      );
      delete statusMap[node.left.id];

      traverse(node.left);
    } else {
      steps.push(
        generateFrame(inputData, statusMap, `節點 ${node.value} 無左子節點`)
      );
    }

    statusMap[node.id] = "target";
    steps.push(generateFrame(inputData, statusMap, `回到節點 ${node.value}`));

    statusMap[node.id] = "complete";
    steps.push(
      generateFrame(inputData, statusMap, `標記節點 ${node.value} (完成)`)
    );

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

      traverse(node.right);

      // Backtrack
      const original = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `右子樹結束，回到節點 ${node.value}`
        )
      );
      statusMap[node.id] = original;
    } else {
      const original = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(inputData, statusMap, `節點 ${node.value} 無右子節點`)
      );
      statusMap[node.id] = original;
    }
  };

  traverse(root);
  steps.push(generateFrame(inputData, statusMap, "中序遍歷完成"));
  return steps;
}

// C. 後序遍歷 (Left -> Right -> Root)
function runPostorder(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const statusMap: Record<string, Status> = {};
  const root = buildLogicalTree(inputData);

  steps.push(
    generateFrame(inputData, {}, "開始後序遍歷 (Left -> Right -> Root)")
  );
  if (!root) return steps;

  const traverse = (node: LogicTreeNode | undefined) => {
    if (!node) return;

    // 抵達節點
    statusMap[node.id] = "target";
    steps.push(
      generateFrame(inputData, statusMap, `抵達節點 ${node.value} (尚未處理)`)
    );
    statusMap[node.id] = "unfinished";

    // 1. Left
    if (node.left) {
      statusMap[node.left.id] = "prepare";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入左子節點 ${node.left.value}`
        )
      );
      delete statusMap[node.left.id];

      traverse(node.left);

      // Backtrack
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `左子樹結束，回到節點 ${node.value}`
        )
      );
      statusMap[node.id] = "unfinished";
    } else {
      steps.push(
        generateFrame(inputData, statusMap, `節點 ${node.value} 無左子節點`)
      );
    }

    // 2. Right
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

      traverse(node.right);

      // 3. Backtrack
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `右子樹結束，回到節點 ${node.value}`
        )
      );
    } else {
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(inputData, statusMap, `節點 ${node.value} 無右子節點`)
      );
    }

    // 4. Process (Complete)
    statusMap[node.id] = "complete";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `左右子樹皆完成，處理節點 ${node.value}`
      )
    );
  };

  traverse(root);
  steps.push(generateFrame(inputData, statusMap, "後序遍歷完成"));
  return steps;
}

export function createBinaryTreeAnimationSteps(
  inputData: any[],
  action?: any
): AnimationStep[] {
  // 如果有指定模式，執行對應演算法
  if (action?.mode === "preorder") {
    return runPreorder(inputData);
  } else if (action?.mode === "inorder") {
    return runInorder(inputData);
  } else if (action?.mode === "postorder") {
    return runPostorder(inputData);
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

const binaryTreeCodeConfig: CodeConfig = {
  pseudo: {
    content: `
function preorder(node):
    if node is null: return
    visit(node)      // 1. 根
    preorder(node.left)  // 2. 左
    preorder(node.right) // 3. 右
  `,
    mappings: {},
  },
  python: {
    content: `
def preorder(node):
    if node is None: return
    visit(node)      # 1. 根
    preorder(node.left)  # 2. 左
    preorder(node.right) # 3. 右
  `,
  },
};

export const BinaryTreeConfig: DataStructureConfig = {
  id: "binarytree",
  name: "二元樹 (Binary Tree)",
  category: "nonlinear",
  categoryName: "非線性表",
  description: "每個節點最多有兩個子節點的樹狀結構",
  codeConfig: binaryTreeCodeConfig,
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

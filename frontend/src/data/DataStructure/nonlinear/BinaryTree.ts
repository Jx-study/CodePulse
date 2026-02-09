import { LevelImplementationConfig } from "@/types/implementation";
import { AnimationStep } from "@/types";
import { createTreeNodes } from "./utils";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Node } from "@/modules/core/DataLogic/Node";
import { Box } from "@/modules/core/DataLogic/Box";

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

type StackAnimationState = "idle" | "pushing" | "popping";

// 3. 輔助函式：產生 Frame
const generateFrame = (
  inputData: any[],
  statusMap: Record<string, Status>,
  description: string,
  linearList: LogicTreeNode[] = [],
  animationState: StackAnimationState = "idle",
  containerType: "stack" | "queue" = "stack"
): AnimationStep => {
  const treeElements = createTreeNodes(inputData, {
    degree: 2,
    width: 700,
    height: 300,
    offsetX: 0,
    offsetY: 50,
  });

  // 根據 statusMap 更新節點顏色
  treeElements.forEach((el) => {
    if (el instanceof Node) {
      const status = statusMap[el.id] ? statusMap[el.id] : "inactive";
      el.setStatus(status);
    }
  });

  const listElements = linearList.map((node, index) => {
    const box = new Box();
    box.id = `${containerType}-${node.id}`;
    box.value = node.value;
    const baseX = 850;
    const baseY = 355 - index * 35;

    let isActiveItem = false;
    if (containerType === "stack") {
      isActiveItem = index === linearList.length - 1; // Stack Top
    } else {
      // Queue:
      // Pushing (Enqueue): 影響最後一個 (Tail)
      // Popping (Dequeue): 影響第一個 (Head)
      if (animationState === "pushing")
        isActiveItem = index === linearList.length - 1;
      else if (animationState === "popping") isActiveItem = index === 0;
    }

    if (isActiveItem) {
      if (animationState === "pushing") {
        box.moveTo(baseX, 50);
        box.setStatus("prepare");
      } else if (animationState === "popping") {
        if (containerType === "stack") {
          box.moveTo(baseX, -50);
        } else {
          box.moveTo(baseX, 420);
        }
        box.setStatus("complete");
      } else {
        box.moveTo(baseX, baseY);
        box.setStatus("target");
      }
    } else {
      box.moveTo(baseX, baseY);
      box.setStatus("unfinished");
    }

    box.width = 120;
    box.height = 30; // 壓扁一點
    return box;
  });

  return {
    stepNumber: 0, // 外部會重算，這裡填 0 即可
    description,
    elements: [...treeElements, ...listElements],
  };
};

// A. 前序遍歷 (Root -> Left -> Right)
function runPreorder(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const statusMap: Record<string, Status> = {};
  const root = buildLogicalTree(inputData);
  const callStack: LogicTreeNode[] = [];

  // 初始狀態：準備 Push Root
  // 手動構造一個包含 Root 的 Stack，狀態為 pushing
  if (root) {
    steps.push(
      generateFrame(
        inputData,
        {},
        "開始前序遍歷 (Root -> Left -> Right)：Push Root",
        [root],
        "pushing"
      )
    );
  } else {
    steps.push(generateFrame(inputData, {}, "空樹"));
  }

  if (!root) return steps;

  const traverse = (node: LogicTreeNode | undefined) => {
    if (!node) return;

    callStack.push(node);

    // 因為上一步 Prepare 時已經演過 Pushing 了，這裡直接 Idle
    statusMap[node.id] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `訪問節點 ${node.value}`,
        [...callStack],
        "idle"
      )
    );
    statusMap[node.id] = "complete";

    if (node.left) {
      statusMap[node.left.id] = "prepare";
      // 構造包含左子節點的臨時 Stack
      const nextStack = [...callStack, node.left];
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入左子節點 ${node.left.value}`,
          nextStack,
          "pushing"
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
          `左子樹結束，回到 ${node.value}`,
          [...callStack],
          "idle"
        )
      );
      statusMap[node.id] = originalStatus; // 還原狀態 (complete)
    } else {
      // 無左子節點，不用預判 Stack
      const originalStatus = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點 ${node.value} 無左子節點`,
          [...callStack],
          "idle"
        )
      );
      statusMap[node.id] = originalStatus;
    }

    if (node.right) {
      statusMap[node.right.id] = "prepare";
      // 構造包含右子節點的臨時 Stack
      const nextStack = [...callStack, node.right];
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入右子節點 ${node.right.value}`,
          nextStack,
          "pushing"
        )
      );

      delete statusMap[node.right.id];
      traverse(node.right);

      const originalStatus = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `右子樹結束，回到 ${node.value}`,
          [...callStack],
          "idle"
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
          `節點 ${node.value} 無右子節點`,
          [...callStack],
          "idle"
        )
      );
      statusMap[node.id] = originalStatus;
    }

    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `Pop ${node.value}`,
        [...callStack],
        "popping"
      )
    );
    callStack.pop();
  };

  traverse(root);
  steps.push(generateFrame(inputData, statusMap, "前序遍歷完成", []));
  return steps;
}

// B. 中序遍歷 (Left -> Root -> Right)
function runInorder(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const statusMap: Record<string, Status> = {};
  const root = buildLogicalTree(inputData);
  const callStack: LogicTreeNode[] = [];

  if (root) {
    steps.push(
      generateFrame(
        inputData,
        {},
        "開始中序遍歷 (Left -> Root -> Right)：Push Root",
        [root],
        "pushing"
      )
    );
  }

  if (!root) return steps;

  const traverse = (node: LogicTreeNode | undefined) => {
    if (!node) return;

    callStack.push(node);

    statusMap[node.id] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `抵達 ${node.value}`,
        [...callStack],
        "idle"
      )
    );
    statusMap[node.id] = "unfinished";

    if (node.left) {
      statusMap[node.left.id] = "prepare";
      // 預判
      const nextStack = [...callStack, node.left];
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入左子節點 ${node.left.value}`,
          nextStack,
          "pushing"
        )
      );
      delete statusMap[node.left.id];

      traverse(node.left);
    } else {
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點 ${node.value} 無左子節點`,
          [...callStack],
          "idle"
        )
      );
    }

    statusMap[node.id] = "complete";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `標記節點 ${node.value} (完成)`,
        [...callStack],
        "idle"
      )
    );

    if (node.right) {
      statusMap[node.right.id] = "prepare";
      // 預判
      const nextStack = [...callStack, node.right];
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入右子節點 ${node.right.value}`,
          nextStack,
          "pushing"
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
          `右子樹結束，回到 ${node.value}`,
          [...callStack],
          "idle"
        )
      );
      statusMap[node.id] = original;
    } else {
      const original = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點 ${node.value} 無右子節點`,
          [...callStack],
          "idle"
        )
      );
      statusMap[node.id] = original;
    }

    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `Pop ${node.value}`,
        [...callStack],
        "popping"
      )
    );
    callStack.pop();
  };

  traverse(root);
  steps.push(
    generateFrame(
      inputData,
      statusMap,
      "中序遍歷完成，如果是 BST 會得到排序後的數列",
      []
    )
  );
  return steps;
}

// C. 後序遍歷 (Left -> Right -> Root)
function runPostorder(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const statusMap: Record<string, Status> = {};
  const root = buildLogicalTree(inputData);
  const callStack: LogicTreeNode[] = [];

  if (!root) return steps;

  steps.push(
    generateFrame(
      inputData,
      {},
      "開始後序遍歷 (Left -> Right -> Root)：Push Root",
      [root],
      "pushing"
    )
  );

  const traverse = (node: LogicTreeNode | undefined) => {
    if (!node) return;

    callStack.push(node);

    statusMap[node.id] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `抵達節點 ${node.value}`,
        [...callStack],
        "idle"
      )
    );
    statusMap[node.id] = "unfinished";

    if (node.left) {
      statusMap[node.left.id] = "prepare";
      // 預判
      const nextStack = [...callStack, node.left];
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入左子節點 ${node.left.value}`,
          nextStack,
          "pushing"
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
          `左子樹結束，回到 ${node.value}`,
          [...callStack],
          "idle"
        )
      );
      statusMap[node.id] = "unfinished";
    } else {
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點 ${node.value} 無左子節點`,
          [...callStack],
          "idle"
        )
      );
    }

    if (node.right) {
      statusMap[node.right.id] = "prepare";
      // 預判
      const nextStack = [...callStack, node.right];
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入右子節點 ${node.right.value}`,
          nextStack,
          "pushing"
        )
      );
      delete statusMap[node.right.id];

      traverse(node.right);

      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `右子樹結束，回到 ${node.value}`,
          [...callStack],
          "idle"
        )
      );
    } else {
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點 ${node.value} 無右子節點`,
          [...callStack],
          "idle"
        )
      );
    }

    statusMap[node.id] = "complete";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `左右子樹皆完成，標記節點 ${node.value} (完成)`,
        [...callStack],
        "idle"
      )
    );

    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `Pop ${node.value}`,
        [...callStack],
        "popping"
      )
    );
    callStack.pop();
  };

  traverse(root);
  steps.push(generateFrame(inputData, statusMap, "後序遍歷完成", []));
  return steps;
}

function runBFS(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const statusMap: Record<string, Status> = {};
  const root = buildLogicalTree(inputData);
  const queue: LogicTreeNode[] = [];

  if (root) {
    statusMap[root.id] = "prepare";
    steps.push(
      generateFrame(
        inputData,
        {},
        "開始層序遍歷 (BFS)：Enqueue Root",
        [root],
        "pushing",
        "queue"
      )
    );
  }

  if (!root) return steps;

  statusMap[root.id] = "unfinished";
  queue.push(root);
  steps.push(
    generateFrame(
      inputData,
      statusMap,
      "Root 入隊完成",
      [...queue],
      "idle",
      "queue"
    )
  );

  while (queue.length > 0) {
    const curr = queue[0];

    statusMap[curr.id] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `Dequeue ${curr.value} 並訪問`,
        [...queue],
        "popping",
        "queue"
      )
    );

    queue.shift();

    statusMap[curr.id] = "complete";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `標記節點 ${curr.value} (完成)`,
        [...queue],
        "idle",
        "queue"
      )
    );

    if (curr.left) {
      statusMap[curr.left.id] = "prepare";
      const nextQ = [...queue, curr.left];
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `左子節點 ${curr.left.value} 入隊`,
          nextQ,
          "pushing",
          "queue"
        )
      );

      statusMap[curr.left.id] = "unfinished";
      queue.push(curr.left);

      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `左子節點 ${curr.left.value} 入隊完成`,
          [...queue],
          "idle",
          "queue"
        )
      );
    }

    if (curr.right) {
      statusMap[curr.right.id] = "prepare";
      const nextQ = [...queue, curr.right];
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `右子節點 ${curr.right.value} 入隊`,
          nextQ,
          "pushing",
          "queue"
        )
      );

      statusMap[curr.right.id] = "unfinished";
      queue.push(curr.right);

      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `右子節點 ${curr.right.value} 入隊完成`,
          [...queue],
          "idle",
          "queue"
        )
      );
    }
  }

  steps.push(
    generateFrame(inputData, statusMap, "BFS 遍歷完成", [], "idle", "queue")
  );
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
  if (action?.mode === "inorder") {
    return runInorder(inputData);
  }
  if (action?.mode === "postorder") {
    return runPostorder(inputData);
  }
  if (action?.mode === "bfs") return runBFS(inputData);

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

export const BinaryTreeConfig: LevelImplementationConfig = {
  id: "binarytree",
  type: "dataStructure",
  name: "二元樹 (Binary Tree)",
  categoryName: "非線性表",
  description: "每個節點最多有兩個子節點的樹狀結構",
  pseudoCode: `
function preorder(node):
    if node is null: return
    visit(node)      // 1. 根
    preorder(node.left)  // 2. 左
    preorder(node.right) // 3. 右
    queue.push(root)
while queue not empty:
  node = queue.shift() // Dequeue
  visit(node)
  if node.left: queue.push(node.left)
  if node.right: queue.push(node.right)
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
  relatedProblems: [
    {
      id: 144,
      title: "Binary Tree Preorder Traversal",
      concept: "前序遍歷：Root -> Left -> Right (迭代與遞迴實作)",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    },
    {
      id: 94,
      title: "Binary Tree Inorder Traversal",
      concept: "中序遍歷：Left -> Root -> Right (BST 會得到排序結果)",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    },
    {
      id: 102,
      title: "Binary Tree Level Order Traversal",
      concept: "層序遍歷 (BFS)：逐層訪問節點",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    },
  ],
};

import { LevelImplementationConfig } from "@/types/implementation";
import { AnimationStep, CodeConfig } from "@/types";
import { createTreeNodes } from "./utils";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Node } from "@/modules/core/DataLogic/Node";
import { Box } from "@/modules/core/DataLogic/Box";

interface LogicTreeNode {
  id: string;
  value: number;
  left?: LogicTreeNode;
  right?: LogicTreeNode;
}

const TAGS = {
  PRE_INIT: "PRE_INIT",
  PRE_NULL: "PRE_NULL",
  PRE_VISIT: "PRE_VISIT",
  PRE_LEFT: "PRE_LEFT",
  PRE_RIGHT: "PRE_RIGHT",

  IN_INIT: "IN_INIT",
  IN_NULL: "IN_NULL",
  IN_LEFT: "IN_LEFT",
  IN_VISIT: "IN_VISIT",
  IN_RIGHT: "IN_RIGHT",

  POST_INIT: "POST_INIT",
  POST_NULL: "POST_NULL",
  POST_LEFT: "POST_LEFT",
  POST_RIGHT: "POST_RIGHT",
  POST_VISIT: "POST_VISIT",

  BFS_INIT: "BFS_INIT",
  BFS_WHILE: "BFS_WHILE",
  BFS_DEQUEUE: "BFS_DEQUEUE",
  BFS_VISIT: "BFS_VISIT",
  BFS_ENQUEUE: "BFS_ENQUEUE",
};

function buildLogicalTree(data: any[]): LogicTreeNode | null {
  if (data.length === 0) return null;
  const nodes = data.map((d) => ({ ...d }));
  const root = nodes[0];
  const queue = [root];
  let i = 1;

  while (i < nodes.length) {
    const curr = queue.shift();
    if (curr) {
      if (i < nodes.length) {
        curr.left = nodes[i++];
        queue.push(curr.left);
      }
      if (i < nodes.length) {
        curr.right = nodes[i++];
        queue.push(curr.right);
      }
    }
  }
  return root;
}

type StackAnimationState = "idle" | "pushing" | "popping";

const generateFrame = (
  inputData: any[],
  statusMap: Record<string, Status>,
  description: string,
  linearList: LogicTreeNode[] = [],
  animationState: StackAnimationState = "idle",
  containerType: "stack" | "queue" = "stack",
  actionTag?: string,
  variables?: Record<string, any>,
): AnimationStep => {
  const treeElements = createTreeNodes(inputData, {
    degree: 2,
    width: 700,
    height: 300,
    offsetX: 0,
    offsetY: 50,
  });

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
      isActiveItem = index === linearList.length - 1;
    } else {
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
    box.height = 30;
    return box;
  });

  return {
    stepNumber: 0,
    description,
    elements: [...treeElements, ...listElements],
    actionTag,
    variables,
  };
};

function runPreorder(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const statusMap: Record<string, Status> = {};
  const root = buildLogicalTree(inputData);
  const callStack: LogicTreeNode[] = [];
  const visited: number[] = [];
  const nullNode: LogicTreeNode = { id: "Null", value: "Null" as any };

  const getVars = (node?: LogicTreeNode) => {
    const stack = [...callStack.map((n) => n.value)];
    const currentStackState = node ? stack : [...stack, "Null"];
    return {
      currentNode: node?.value ?? "Null",
      stack: currentStackState,
      visitedOrder: [...visited],
    };
  };

  if (root) {
    steps.push(
      generateFrame(
        inputData,
        {},
        "開始前序遍歷 (根-左-右)",
        [root],
        "pushing",
        "stack",
        TAGS.PRE_INIT,
        getVars(root),
      ),
    );
  }

  if (!root) return steps;

  const traverse = (node: LogicTreeNode | undefined) => {
    if (!node) {
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          "節點為空 (Null)，回溯",
          [...callStack],
          "idle",
          "stack",
          TAGS.PRE_NULL,
          getVars(),
        ),
      );
      return;
    }

    callStack.push(node);
    statusMap[node.id] = "target";
    visited.push(Number(node.value));
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `[訪問] 紀錄根節點 ${node.value}`,
        [...callStack],
        "idle",
        "stack",
        TAGS.PRE_VISIT,
        getVars(node),
      ),
    );
    statusMap[node.id] = "complete";

    if (node.left) {
      statusMap[node.left.id] = "prepare";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入左子節點 ${node.left.value}`,
          [...callStack, node.left],
          "pushing",
          "stack",
          TAGS.PRE_LEFT,
          getVars(node),
        ),
      );
      delete statusMap[node.left.id];
      traverse(node.left);

      const originalStatus = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `左子樹完成，回到節點 ${node.value}`,
          [...callStack],
          "idle",
          "stack",
          TAGS.PRE_LEFT,
          getVars(node),
        ),
      );
      statusMap[node.id] = originalStatus;
    } else {
      const originalStatus = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入左子節點`,
          [...callStack, nullNode],
          "pushing",
          "stack",
          TAGS.PRE_LEFT,
          getVars(node),
        ),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點為空 (Null)`,
          [...callStack, nullNode],
          "idle",
          "stack",
          TAGS.PRE_NULL,
          getVars(undefined),
        ),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `返回父節點 ${node.value}`,
          [...callStack, nullNode],
          "popping",
          "stack",
          TAGS.PRE_LEFT,
          getVars(node),
        ),
      );
      statusMap[node.id] = originalStatus;
    }

    if (node.right) {
      statusMap[node.right.id] = "prepare";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入右子節點 ${node.right.value}`,
          [...callStack, node.right],
          "pushing",
          "stack",
          TAGS.PRE_RIGHT,
          getVars(node),
        ),
      );
      delete statusMap[node.right.id];
      traverse(node.right);

      const originalStatus = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `右子樹完成，回到節點 ${node.value}`,
          [...callStack],
          "idle",
          "stack",
          TAGS.PRE_RIGHT,
          getVars(node),
        ),
      );
      statusMap[node.id] = originalStatus;
    } else {
      const originalStatus = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入右子節點`,
          [...callStack, nullNode],
          "pushing",
          "stack",
          TAGS.PRE_RIGHT,
          getVars(node),
        ),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點為空 (Null)`,
          [...callStack, nullNode],
          "idle",
          "stack",
          TAGS.PRE_NULL,
          getVars(undefined),
        ),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `返回父節點 ${node.value}`,
          [...callStack, nullNode],
          "popping",
          "stack",
          TAGS.PRE_RIGHT,
          getVars(node),
        ),
      );
      statusMap[node.id] = originalStatus;
    }

    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `從棧中彈出 (Pop) 節點 ${node.value}`,
        [...callStack],
        "popping",
        "stack",
        TAGS.PRE_RIGHT,
        getVars(node),
      ),
    );
    callStack.pop();
  };

  traverse(root);
  steps.push(
    generateFrame(
      inputData,
      statusMap,
      "前序遍歷完成",
      [],
      "idle",
      "stack",
      undefined,
      getVars(),
    ),
  );
  return steps;
}

function runInorder(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const statusMap: Record<string, Status> = {};
  const root = buildLogicalTree(inputData);
  const callStack: LogicTreeNode[] = [];
  const visited: number[] = [];
  const nullNode: LogicTreeNode = { id: "Null", value: "Null" as any };

  const getVars = (node?: LogicTreeNode) => {
    const stack = [...callStack.map((n) => n.value)];
    const currentStackState = node ? stack : [...stack, "Null"];
    return {
      currentNode: node?.value ?? "Null",
      stack: currentStackState,
      visitedOrder: [...visited],
    };
  };

  if (root) {
    steps.push(
      generateFrame(
        inputData,
        {},
        "開始中序遍歷 (左-根-右)",
        [root],
        "pushing",
        "stack",
        TAGS.IN_INIT,
        getVars(root),
      ),
    );
  } else return steps;

  const traverse = (node: LogicTreeNode | undefined) => {
    if (!node) return;

    callStack.push(node);
    statusMap[node.id] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `抵達節點 ${node.value}，準備遍歷左子樹`,
        [...callStack],
        "idle",
        "stack",
        TAGS.IN_LEFT,
        getVars(node),
      ),
    );
    statusMap[node.id] = "unfinished";

    if (node.left) {
      statusMap[node.left.id] = "prepare";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入左子節點 ${node.left.value}`,
          [...callStack, node.left],
          "pushing",
          "stack",
          TAGS.IN_LEFT,
          getVars(node),
        ),
      );
      delete statusMap[node.left.id];
      traverse(node.left);

      const originalStatus = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `左子樹完成，回到節點 ${node.value}`,
          [...callStack],
          "idle",
          "stack",
          TAGS.IN_LEFT,
          getVars(node),
        ),
      );
      statusMap[node.id] = originalStatus;
    } else {
      const originalStatus = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入左子節點`,
          [...callStack, nullNode],
          "pushing",
          "stack",
          TAGS.IN_LEFT,
          getVars(node),
        ),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點為空 (Null)`,
          [...callStack, nullNode],
          "idle",
          "stack",
          TAGS.IN_NULL,
          getVars(undefined),
        ),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `返回父節點 ${node.value}`,
          [...callStack, nullNode],
          "popping",
          "stack",
          TAGS.IN_LEFT,
          getVars(node),
        ),
      );
      statusMap[node.id] = originalStatus;
    }

    statusMap[node.id] = "complete";
    visited.push(node.value);
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `[訪問] 紀錄節點 ${node.value}`,
        [...callStack],
        "idle",
        "stack",
        TAGS.IN_VISIT,
        getVars(node),
      ),
    );

    if (node.right) {
      statusMap[node.right.id] = "prepare";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入右子節點 ${node.right.value}`,
          [...callStack, node.right],
          "pushing",
          "stack",
          TAGS.IN_RIGHT,
          getVars(node),
        ),
      );
      delete statusMap[node.right.id];
      traverse(node.right);

      const originalStatus = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `右子樹完成，回到節點 ${node.value}`,
          [...callStack],
          "idle",
          "stack",
          TAGS.IN_RIGHT,
          getVars(node),
        ),
      );
      statusMap[node.id] = originalStatus;
    } else {
      const originalStatus = statusMap[node.id];
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入右子節點`,
          [...callStack, nullNode],
          "pushing",
          "stack",
          TAGS.IN_RIGHT,
          getVars(node),
        ),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點為空 (Null)`,
          [...callStack, nullNode],
          "idle",
          "stack",
          TAGS.IN_NULL,
          getVars(undefined),
        ),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `返回父節點 ${node.value}`,
          [...callStack, nullNode],
          "popping",
          "stack",
          TAGS.IN_RIGHT,
          getVars(node),
        ),
      );
      statusMap[node.id] = originalStatus;
    }

    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `從棧中彈出 (Pop) 節點 ${node.value}`,
        [...callStack],
        "popping",
        "stack",
        TAGS.IN_RIGHT,
        getVars(node),
      ),
    );
    callStack.pop();
  };

  traverse(root);
  steps.push(
    generateFrame(
      inputData,
      statusMap,
      "中序遍歷完成",
      [],
      "idle",
      "stack",
      undefined,
      getVars(),
    ),
  );
  return steps;
}

function runPostorder(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const statusMap: Record<string, Status> = {};
  const root = buildLogicalTree(inputData);
  const callStack: LogicTreeNode[] = [];
  const visited: number[] = [];
  const nullNode: LogicTreeNode = { id: "Null", value: "Null" as any };

  const getVars = (node?: LogicTreeNode) => {
    const stack = [...callStack.map((n) => n.value)];
    const currentStackState = node ? stack : [...stack, "Null"];
    return {
      currentNode: node?.value ?? "Null",
      stack: currentStackState,
      visitedOrder: [...visited],
    };
  };

  if (root) {
    steps.push(
      generateFrame(
        inputData,
        {},
        "開始後序遍歷 (左-右-根)",
        [root],
        "pushing",
        "stack",
        TAGS.POST_INIT,
        getVars(root),
      ),
    );
  } else return steps;

  const traverse = (node: LogicTreeNode | undefined) => {
    if (!node) return;

    callStack.push(node);
    statusMap[node.id] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `抵達節點 ${node.value}，準備遍歷左子樹`,
        [...callStack],
        "idle",
        "stack",
        TAGS.POST_LEFT,
        getVars(node),
      ),
    );
    statusMap[node.id] = "unfinished";

    if (node.left) {
      statusMap[node.left.id] = "prepare";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入左子節點 ${node.left.value}`,
          [...callStack, node.left],
          "pushing",
          "stack",
          TAGS.POST_LEFT,
          getVars(node),
        ),
      );
      delete statusMap[node.left.id];
      traverse(node.left);

      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `左子樹完成，回到節點 ${node.value}`,
          [...callStack],
          "idle",
          "stack",
          TAGS.POST_LEFT,
          getVars(node),
        ),
      );
      statusMap[node.id] = "unfinished";
    } else {
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入左子節點`,
          [...callStack, nullNode],
          "pushing",
          "stack",
          TAGS.POST_LEFT,
          getVars(node),
        ),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點為空 (Null)`,
          [...callStack, nullNode],
          "idle",
          "stack",
          TAGS.POST_NULL,
          getVars(undefined),
        ),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `返回父節點 ${node.value}`,
          [...callStack, nullNode],
          "popping",
          "stack",
          TAGS.POST_LEFT,
          getVars(node),
        ),
      );
    }

    if (node.right) {
      statusMap[node.right.id] = "prepare";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入右子節點 ${node.right.value}`,
          [...callStack, node.right],
          "pushing",
          "stack",
          TAGS.POST_RIGHT,
          getVars(node),
        ),
      );
      delete statusMap[node.right.id];
      traverse(node.right);

      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `右子樹完成，回到節點 ${node.value}`,
          [...callStack],
          "idle",
          "stack",
          TAGS.POST_RIGHT,
          getVars(node),
        ),
      );
    } else {
      statusMap[node.id] = "target";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `準備進入右子節點`,
          [...callStack, nullNode],
          "pushing",
          "stack",
          TAGS.POST_RIGHT,
          getVars(node),
        ),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `節點為空 (Null)`,
          [...callStack, nullNode],
          "idle",
          "stack",
          TAGS.POST_NULL,
          getVars(undefined),
        ),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `返回父節點 ${node.value}`,
          [...callStack, nullNode],
          "popping",
          "stack",
          TAGS.POST_RIGHT,
          getVars(node),
        ),
      );
    }

    statusMap[node.id] = "complete";
    visited.push(node.value);
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `[訪問] 紀錄節點 ${node.value}`,
        [...callStack],
        "idle",
        "stack",
        TAGS.POST_VISIT,
        getVars(node),
      ),
    );

    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `從棧中彈出 (Pop) 節點 ${node.value}`,
        [...callStack],
        "popping",
        "stack",
        TAGS.POST_VISIT,
        getVars(node),
      ),
    );
    callStack.pop();
  };

  traverse(root);
  steps.push(
    generateFrame(
      inputData,
      statusMap,
      "後序遍歷完成",
      [],
      "idle",
      "stack",
      undefined,
      getVars(),
    ),
  );
  return steps;
}

function runBFS(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const statusMap: Record<string, Status> = {};
  const root = buildLogicalTree(inputData);
  const queue: LogicTreeNode[] = [];
  const visited: number[] = [];

  const getVars = (curr?: LogicTreeNode) => ({
    currentNode: curr?.value ?? "None",
    queue: queue.map((n) => n.value),
    visitedOrder: [...visited],
  });

  if (root) {
    steps.push(
      generateFrame(
        inputData,
        {},
        "開始層序遍歷 (BFS)：將 Root 入隊",
        [root],
        "pushing",
        "queue",
        TAGS.BFS_INIT,
        getVars(root),
      ),
    );
    queue.push(root);
    statusMap[root.id] = "unfinished";
  } else return steps;

  while (queue.length > 0) {
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        "檢查佇列是否爲空",
        [...queue],
        "idle",
        "queue",
        TAGS.BFS_WHILE,
        getVars(),
      ),
    );

    const curr = queue[0];
    statusMap[curr.id] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `取出佇列首位節點，Dequeue 節點 ${curr.value}`,
        [...queue],
        "popping",
        "queue",
        TAGS.BFS_DEQUEUE,
        getVars(curr),
      ),
    );

    queue.shift();
    statusMap[curr.id] = "complete";
    visited.push(curr.value);
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `[訪問] 紀錄節點 ${curr.value}`,
        [...queue],
        "idle",
        "queue",
        TAGS.BFS_VISIT,
        getVars(curr),
      ),
    );

    if (curr.left) {
      statusMap[curr.left.id] = "prepare";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `發現左子節點 ${curr.left.value}，Enqueue 左子節點`,
          [...queue, curr.left],
          "pushing",
          "queue",
          TAGS.BFS_ENQUEUE,
          getVars(curr),
        ),
      );
      statusMap[curr.left.id] = "unfinished";
      queue.push(curr.left);
    } else {
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `左子節點為空，跳過`,
          [...queue],
          "idle",
          "queue",
          TAGS.BFS_ENQUEUE,
          getVars(curr),
        ),
      );
    }

    if (curr.right) {
      statusMap[curr.right.id] = "prepare";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `發現右子節點 ${curr.right.value}，Enqueue 右子節點`,
          [...queue, curr.right],
          "pushing",
          "queue",
          TAGS.BFS_ENQUEUE,
          getVars(curr),
        ),
      );
      statusMap[curr.right.id] = "unfinished";
      queue.push(curr.right);
    } else {
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `右子節點為空，跳過`,
          [...queue],
          "idle",
          "queue",
          TAGS.BFS_ENQUEUE,
          getVars(curr),
        ),
      );
    }
  }

  steps.push(
    generateFrame(
      inputData,
      statusMap,
      "BFS 遍歷完成",
      [],
      "idle",
      "queue",
      undefined,
      getVars(),
    ),
  );
  return steps;
}

export function createBinaryTreeAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  if (action?.mode === "preorder") return runPreorder(inputData);
  if (action?.mode === "inorder") return runInorder(inputData);
  if (action?.mode === "postorder") return runPostorder(inputData);
  if (action?.mode === "bfs") return runBFS(inputData);

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
    content: `Procedure Preorder(node):
  If node is Null Then Return
  Visit(node)
  Preorder(node.left)
  Preorder(node.right)

Procedure Inorder(node):
  If node is Null Then Return
  Inorder(node.left)
  Visit(node)
  Inorder(node.right)

Procedure Postorder(node):
  If node is Null Then Return
  Postorder(node.left)
  Postorder(node.right)
  Visit(node)

Procedure BFS(root):
  Queue ← [root]
  While Queue is not Empty:
    curr ← Dequeue(Queue)
    Visit(curr)
    If curr.left ≠ Null Then Enqueue(Queue, curr.left)
    If curr.right ≠ Null Then Enqueue(Queue, curr.right)`,
    mappings: {
      [TAGS.PRE_INIT]: [1],
      [TAGS.PRE_NULL]: [2],
      [TAGS.PRE_VISIT]: [3],
      [TAGS.PRE_LEFT]: [4],
      [TAGS.PRE_RIGHT]: [5],
      [TAGS.IN_INIT]: [7],
      [TAGS.IN_NULL]: [8],
      [TAGS.IN_LEFT]: [9],
      [TAGS.IN_VISIT]: [10],
      [TAGS.IN_RIGHT]: [11],
      [TAGS.POST_INIT]: [13],
      [TAGS.POST_NULL]: [14],
      [TAGS.POST_LEFT]: [15],
      [TAGS.POST_RIGHT]: [16],
      [TAGS.POST_VISIT]: [17],
      [TAGS.BFS_INIT]: [20],
      [TAGS.BFS_WHILE]: [21],
      [TAGS.BFS_DEQUEUE]: [22],
      [TAGS.BFS_VISIT]: [23],
      [TAGS.BFS_ENQUEUE]: [24, 25],
    },
  },
  python: {
    content: `def preorder(node):
    if not node: return
    visit(node)
    preorder(node.left)
    preorder(node.right)

def inorder(node):
    if not node: return
    inorder(node.left)
    visit(node)
    inorder(node.right)

def postorder(node):
    if not node: return
    postorder(node.left)
    postorder(node.right)
    visit(node)

def bfs(root):
    queue = [root]
    while queue:
        node = queue.pop(0)
        visit(node)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)`,
  },
};

export const BinaryTreeConfig: LevelImplementationConfig = {
  id: "binarytree",
  type: "dataStructure",
  name: "二元樹 (Binary Tree)",
  categoryName: "非線性表",
  description: "每個節點最多有兩個子節點的樹狀結構",
  codeConfig: binaryTreeCodeConfig,
  complexity: {
    timeBest: "O(n)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(h)",
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

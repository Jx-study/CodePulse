import { LevelImplementationConfig } from "@/types/implementation";
import { AnimationStep } from "@/types";
import { createTreeNodes } from "./utils";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Node } from "@/modules/core/DataLogic/Node";

const BST_LAYOUT = {
  degree: 2,
  width: 1000,
  height: 300,
  offsetX: 0,
  offsetY: 50,
  type: "bst" as const,
};

// 1. 定義邏輯節點
interface LogicTreeNode {
  id: string;
  value: number;
  left?: LogicTreeNode;
  right?: LogicTreeNode;
}

// 2. 輔助函式：將線性資料轉為邏輯樹 (Level Order)
function buildBST(data: any[]): LogicTreeNode | null {
  if (data.length === 0) return null;

  const rootData = data[0];
  const root: LogicTreeNode = {
    ...rootData,
    left: undefined,
    right: undefined,
  };

  for (let i = 1; i < data.length; i++) {
    insertNodeLogic(root, { ...data[i], left: undefined, right: undefined });
  }

  return root;
}

function insertNodeLogic(root: LogicTreeNode, newNode: LogicTreeNode) {
  if (newNode.value < root.value) {
    if (root.left) insertNodeLogic(root.left, newNode);
    else root.left = newNode;
  } else {
    if (root.right) insertNodeLogic(root.right, newNode);
    else root.right = newNode;
  }
}

// 3. 輔助函式：產生 Frame
const generateFrame = (
  inputData: any[],
  statusMap: Record<string, Status>,
  description: string
): AnimationStep => {
  const treeElements = createTreeNodes(inputData, BST_LAYOUT);

  // 根據 statusMap 更新節點顏色
  treeElements.forEach((el) => {
    if (el instanceof Node) {
      const status = statusMap[el.id] ? statusMap[el.id] : "inactive";
      el.setStatus(status);
    }
  });

  return {
    stepNumber: 0, // 外部會重算，這裡填 0 即可
    description,
    elements: [...treeElements],
  };
};

function runInsert(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];

  // 1. 分離舊資料與新節點
  if (inputData.length === 0) return steps;

  const newNodeData = inputData[inputData.length - 1];
  const oldData = inputData.slice(0, inputData.length - 1);

  // 如果是第一個節點 (Root)，直接顯示
  if (oldData.length === 0) {
    steps.push(
      generateFrame(
        inputData,
        { [newNodeData.id]: "complete" },
        `樹為空，插入根節點 ${newNodeData.value}`
      )
    );
    return steps;
  }

  // 2. 建立舊樹的邏輯結構
  const root = buildBST(oldData);
  const statusMap: Record<string, Status> = {};

  // 初始畫面：顯示舊樹
  steps.push(
    generateFrame(oldData, {}, `準備插入新節點：${newNodeData.value}`)
  );

  // 3. 開始遍歷尋找插入點
  let curr = root;
  while (curr) {
    statusMap[curr.id] = "target";
    steps.push(
      generateFrame(
        oldData,
        statusMap,
        `比較：${newNodeData.value} vs ${curr.value}`
      )
    );

    if (newNodeData.value < curr.value) {
      if (curr.left) {
        statusMap[curr.left.id] = "prepare";
        steps.push(
          generateFrame(
            oldData,
            statusMap,
            `${newNodeData.value} < ${curr.value}，往左子樹尋找`
          )
        );
        delete statusMap[curr.left.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.left;
      } else {
        // 找到空位 (左)
        steps.push(
          generateFrame(
            oldData,
            statusMap,
            `${newNodeData.value} < ${curr.value}，且無左子節點，找到插入位置`
          )
        );
        break;
      }
    } else {
      if (curr.right) {
        statusMap[curr.right.id] = "prepare";
        steps.push(
          generateFrame(
            oldData,
            statusMap,
            `${newNodeData.value} >= ${curr.value}，往右子樹尋找`
          )
        );
        delete statusMap[curr.right.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.right;
      } else {
        // 找到空位 (右)
        steps.push(
          generateFrame(
            oldData,
            statusMap,
            `${newNodeData.value} >= ${curr.value}，且無右子節點，找到插入位置`
          )
        );
        break;
      }
    }
  }

  // 4. 插入完成
  statusMap[newNodeData.id] = "complete";
  if (curr) statusMap[curr.id] = "unfinished";

  steps.push(
    generateFrame(inputData, statusMap, `插入節點 ${newNodeData.value} 完成`)
  );

  return steps;
}

function runSearch(inputData: any[], targetValue: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};

  if (!root) {
    steps.push(generateFrame(inputData, {}, "樹為空，無法搜尋"));
    return steps;
  }

  steps.push(generateFrame(inputData, {}, `開始搜尋數值：${targetValue}`));

  let curr: LogicTreeNode | undefined = root;
  let found = false;

  while (curr) {
    statusMap[curr.id] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `比較：${targetValue} vs ${curr.value}`
      )
    );

    if (targetValue === curr.value) {
      statusMap[curr.id] = "complete";
      steps.push(
        generateFrame(inputData, statusMap, `找到目標值 ${targetValue}`)
      );
      found = true;
      break;
    } else if (targetValue < curr.value) {
      if (curr.left) {
        statusMap[curr.left.id] = "prepare";
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${targetValue} < ${curr.value}，往左尋找`
          )
        );
        delete statusMap[curr.left.id];
        statusMap[curr.id] = "unfinished"; // 標記路徑
        curr = curr.left;
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${targetValue} < ${curr.value}，但無左子節點`
          )
        );
        statusMap[curr.id] = "unfinished";
        break;
      }
    } else {
      if (curr.right) {
        statusMap[curr.right.id] = "prepare";
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${targetValue} > ${curr.value}，往右尋找`
          )
        );
        delete statusMap[curr.right.id];
        statusMap[curr.id] = "unfinished"; // 標記路徑
        curr = curr.right;
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${targetValue} > ${curr.value}，但無右子節點`
          )
        );
        statusMap[curr.id] = "unfinished";
        break;
      }
    }
  }

  if (!found) {
    steps.push(
      generateFrame(inputData, statusMap, `未找到數值 ${targetValue}`)
    );
  }

  return steps;
}

// Min 邏輯 (一路向左)
function runMin(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};

  if (!root) return steps;

  steps.push(generateFrame(inputData, {}, "尋找最小值 (Min)：一路向左"));

  let curr: LogicTreeNode = root;
  while (curr.left) {
    statusMap[curr.id] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `當前節點 ${curr.value}，還有左子節點`
      )
    );

    statusMap[curr.left.id] = "prepare";
    steps.push(generateFrame(inputData, statusMap, "往左移動"));
    delete statusMap[curr.left.id];

    statusMap[curr.id] = "unfinished";
    curr = curr.left;
  }

  statusMap[curr.id] = "complete";
  steps.push(
    generateFrame(
      inputData,
      statusMap,
      `抵達最左節點 ${curr.value}，即為最小值`
    )
  );

  return steps;
}

// Max 邏輯 (一路向右)
function runMax(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};

  if (!root) return steps;

  steps.push(generateFrame(inputData, {}, "尋找最大值 (Max)：一路向右"));

  let curr: LogicTreeNode = root;
  while (curr.right) {
    statusMap[curr.id] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `當前節點 ${curr.value}，還有右子節點`
      )
    );

    statusMap[curr.right.id] = "prepare";
    steps.push(generateFrame(inputData, statusMap, "往右移動"));
    delete statusMap[curr.right.id];

    statusMap[curr.id] = "unfinished";
    curr = curr.right;
  }

  statusMap[curr.id] = "complete";
  steps.push(
    generateFrame(
      inputData,
      statusMap,
      `抵達最右節點 ${curr.value}，即為最大值`
    )
  );

  return steps;
}

// Floor(key): 小於等於 key 的最大值
function runFloor(inputData: any[], targetValue: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};

  if (!root) return steps;

  steps.push(generateFrame(inputData, {}, `尋找 Floor(${targetValue})`));

  let curr: LogicTreeNode | undefined = root;
  let floorNode: LogicTreeNode | null = null; // 目前的最佳解

  while (curr) {
    statusMap[curr.id] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `比較：${targetValue} vs ${curr.value}`
      )
    );

    if (curr.value === targetValue) {
      // 找到完全相等 = 最佳解
      if (floorNode) statusMap[floorNode.id] = "unfinished"; // 舊候選人：unfinished
      statusMap[curr.id] = "complete"; // 新候選人：Complete
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `找到相等值，Floor 為 ${curr.value}`
        )
      );
      return steps;
    }

    if (curr.value > targetValue) {
      // 當前值太大 -> 往左找
      // 當前節點不可能是 Floor -> unfinished
      if (curr.left) {
        statusMap[curr.left.id] = "prepare";
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} > ${targetValue}，往左尋找`
          )
        );
        delete statusMap[curr.left.id];
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} > ${targetValue}，無左子樹`
          )
        );
      }
      statusMap[curr.id] = "unfinished"; // 走過的路：藍色
      curr = curr.left;
    } else {
      // 當前值 < target -> 它是候選人 (Candidate) -> complete

      if (floorNode) statusMap[floorNode.id] = "unfinished"; // 舊候選人：unfinished
      floorNode = curr;
      statusMap[curr.id] = "complete"; // 新候選人：Complete

      if (curr.right) {
        statusMap[curr.right.id] = "prepare";
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} < ${targetValue}，暫定 Floor 為 ${curr.value}，往右尋找更大的`
          )
        );
        delete statusMap[curr.right.id];
        // curr 保持 complete，因為它是目前的最佳解
        curr = curr.right;
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} < ${targetValue}，無右子樹`
          )
        );
        break;
      }
    }
  }

  if (floorNode) {
    // floorNode 已經是 complete 了
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `搜尋結束，Floor 為 ${floorNode.value}`
      )
    );
  } else {
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `搜尋結束，未找到小於等於 ${targetValue} 的值`
      )
    );
  }

  return steps;
}

// Ceil(key): 大於等於 key 的最小值
function runCeil(inputData: any[], targetValue: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};

  if (!root) return steps;

  steps.push(generateFrame(inputData, {}, `尋找 Ceil(${targetValue})`));

  let curr: LogicTreeNode | undefined = root;
  let ceilNode: LogicTreeNode | null = null;

  while (curr) {
    statusMap[curr.id] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `比較：${targetValue} vs ${curr.value}`
      )
    );

    if (curr.value === targetValue) {
      if (ceilNode) statusMap[ceilNode.id] = "unfinished";
      statusMap[curr.id] = "complete";
      steps.push(
        generateFrame(inputData, statusMap, `找到相等值，Ceil 為 ${curr.value}`)
      );
      return steps;
    }

    if (curr.value < targetValue) {
      // 當前值太小 -> 往右找
      // 當前節點不可能是 Ceil -> unfinished
      if (curr.right) {
        statusMap[curr.right.id] = "prepare";
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} < ${targetValue}，往右尋找`
          )
        );
        delete statusMap[curr.right.id];
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} < ${targetValue}，無右子樹`
          )
        );
      }
      statusMap[curr.id] = "unfinished";
      curr = curr.right;
    } else {
      // 當前值 > target -> 它是候選人 -> complete

      if (ceilNode) statusMap[ceilNode.id] = "unfinished"; // 舊候選人：unfinished
      ceilNode = curr;
      statusMap[curr.id] = "complete"; // 新候選人：Complete

      if (curr.left) {
        statusMap[curr.left.id] = "prepare";
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} > ${targetValue}，暫定 Ceil 為 ${curr.value}，往左尋找更小的`
          )
        );
        delete statusMap[curr.left.id];
        // curr 保持 complete
        curr = curr.left;
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} > ${targetValue}，無左子樹`
          )
        );
        break;
      }
    }
  }

  if (ceilNode) {
    steps.push(
      generateFrame(inputData, statusMap, `搜尋結束，Ceil 為 ${ceilNode.value}`)
    );
  } else {
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `搜尋結束，未找到大於等於 ${targetValue} 的值`
      )
    );
  }

  return steps;
}
function runLoad(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  // 直接顯示最終樹
  steps.push(
    generateFrame(inputData, {}, `資料載入完成 (節點數: ${inputData.length})`)
  );
  return steps;
}

export function createBinarySearchTreeAnimationSteps(
  inputData: any[],
  action?: any
): AnimationStep[] {
  if (action?.type === "add" || action?.mode === "Insert") {
    return runInsert(inputData);
  }
  if (action?.mode === "search") {
    return runSearch(inputData, action.value);
  }
  if (action?.mode === "min") {
    return runMin(inputData);
  }
  if (action?.mode === "max") {
    return runMax(inputData);
  }
  if (action?.mode === "floor") {
    return runFloor(inputData, action.value);
  }
  if (action?.mode === "ceil") {
    return runCeil(inputData, action.value);
  }
  if (["load", "random", "reset"].includes(action?.type)) {
    return runLoad(inputData);
  }

  const steps: AnimationStep[] = [];
  const elements = createTreeNodes(inputData, BST_LAYOUT);

  steps.push({
    stepNumber: 0,
    description: "Binary Search Tree",
    elements: elements,
  });

  return steps;
}

export const BinarySearchTreeConfig: LevelImplementationConfig = {
  id: "bst",
  type: "dataStructure",
  name: "二元搜尋樹 (Binary Search Tree)",
  categoryName: "非線性表",
  description: "具有排序性質的二元樹，左子樹小於根，右子樹大於根",
  pseudoCode: `insert(node, value):
  if node is null:
    return new Node(value)
  if value < node.value:
    node.left = insert(node.left, value)
  else:
    node.right = insert(node.right, value)
  return node`,
  complexity: {
    timeBest: "O(log n)",
    timeAverage: "O(log n)",
    timeWorst: "O(n)",
    space: "O(h)", // h 是樹高
  },
  introduction: `二元搜尋樹 (BST) 是一種特殊的二元樹。
  特性：
  1. 若左子樹不為空，則左子樹上所有節點的值均小於根節點的值。
  2. 若右子樹不為空，則右子樹上所有節點的值均大於根節點的值。
  3. 左右子樹也分別為二元搜尋樹。`,
  defaultData: [
    { id: "node-1", value: 50 },
    { id: "node-2", value: 30 },
    { id: "node-3", value: 70 },
    { id: "node-4", value: 20 },
    { id: "node-5", value: 40 },
    { id: "node-6", value: 60 },
    { id: "node-7", value: 80 },
  ],
  createAnimationSteps: createBinarySearchTreeAnimationSteps,
};

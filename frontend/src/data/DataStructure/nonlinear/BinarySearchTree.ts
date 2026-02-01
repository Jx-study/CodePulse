import { LevelImplementationConfig } from "@/types/implementation";
import { AnimationStep, CodeConfig } from "@/types";
import { createTreeNodes } from "./utils";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Node } from "@/modules/core/DataLogic/Node";

// ==========================================
// 1. 定義 Namespaced TAGS
// ==========================================
const TAGS = {
  // Insert Tags
  INSERT_INIT: "INSERT_INIT",
  INSERT_COMPARE: "INSERT_COMPARE",
  INSERT_LEFT: "INSERT_LEFT",
  INSERT_RIGHT: "INSERT_RIGHT",
  INSERT_FOUND_LEFT: "INSERT_FOUND_LEFT",
  INSERT_FOUND_RIGHT: "INSERT_FOUND_RIGHT",
  INSERT_ACT: "INSERT_ACT",

  // Search Tags
  SEARCH_INIT: "SEARCH_INIT",
  SEARCH_COMPARE: "SEARCH_COMPARE",
  SEARCH_LEFT: "SEARCH_LEFT",
  SEARCH_RIGHT: "SEARCH_RIGHT",
  SEARCH_FOUND: "SEARCH_FOUND",

  // Delete Tags
  DELETE_INIT: "DELETE_INIT",
  DELETE_COMPARE: "DELETE_COMPARE",
  DELETE_LEFT: "DELETE_LEFT",
  DELETE_RIGHT: "DELETE_RIGHT",
  DELETE_FOUND: "DELETE_FOUND",
  
  DELETE_LEAF: "DELETE_LEAF",         // Case 1
  DELETE_ONE_PREPARE: "DELETE_ONE_PREPARE", // Case 2: 準備複製
  DELETE_ONE_COPY: "DELETE_ONE_COPY",       // Case 2: 執行複製與刪除
  
  DELETE_TWO: "DELETE_TWO",           // Case 3
  DELETE_FIND_MIN: "DELETE_FIND_MIN",
  DELETE_SWAP: "DELETE_SWAP",
  DELETE_RECURSE: "DELETE_RECURSE",
};

const BST_LAYOUT = {
  degree: 2,
  width: 1000,
  height: 300,
  offsetX: 0,
  offsetY: 50,
  type: "bst" as const,
};

interface LogicTreeNode {
  id: string;
  value: number;
  left?: LogicTreeNode;
  right?: LogicTreeNode;
}

// ==========================================
// 2. 基礎輔助函式
// ==========================================
function buildBST(data: any[]): LogicTreeNode | null {
  if (data.length === 0) return null;
  const rootData = data[0];
  const root: LogicTreeNode = { ...rootData, left: undefined, right: undefined };
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

const generateFrame = (
  inputData: any[],
  statusMap: Record<string, Status>,
  description: string
): AnimationStep => {
  const treeElements = createTreeNodes(inputData, BST_LAYOUT);
  treeElements.forEach((el) => {
    if (el instanceof Node) {
      const status = statusMap[el.id] ? statusMap[el.id] : "inactive";
      el.setStatus(status);
    }
  });
  return {
    stepNumber: 0,
    description,
    elements: [...treeElements],
  };
};

// ==========================================
// 3. 狀態更新輔助函式 (對應 User 的邏輯)
// ==========================================
export function getBSTArrayAfterDelete(
  data: any[],
  targetValue: number
): any[] {
  const root = buildBST(data);
  if (!root) return [];
  // 這裡的邏輯我們保持「結果正確」即可，前序遍歷重組後 ID 的變化不影響靜態結果的正確性
  const newRoot = deleteNodeFromTree(root, targetValue);
  const result: LogicTreeNode[] = [];
  serializePreorder(newRoot, result);
  return result.map((node) => ({
    id: node.id,
    value: node.value,
  }));
}

function deleteNodeFromTree(
  root: LogicTreeNode | undefined,
  key: number
): LogicTreeNode | undefined {
  if (!root) return undefined;
  if (key < root.value) {
    root.left = deleteNodeFromTree(root.left, key);
  } else if (key > root.value) {
    root.right = deleteNodeFromTree(root.right, key);
  } else {
    // Found
    if (!root.left && !root.right) return undefined; // Leaf
    
    // One Child: 模擬數值覆蓋邏輯
    if (!root.left) {
        // 邏輯上：回傳右子樹代表原本的 root 被取代
        // 為了讓 helper 簡單，這裡用標準 pointer 寫法，結果是一樣的
        return root.right; 
    }
    if (!root.right) return root.left;

    // Two Children
    let temp = root.right;
    while (temp.left) temp = temp.left;
    root.value = temp.value;
    root.right = deleteNodeFromTree(root.right, temp.value);
  }
  return root;
}

function serializePreorder(node: LogicTreeNode | undefined, list: LogicTreeNode[]) {
  if (!node) return;
  list.push(node);
  serializePreorder(node.left, list);
  serializePreorder(node.right, list);
}

// ==========================================
// 4. 動畫邏輯: Insert & Search
// ==========================================
function runInsert(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  if (inputData.length === 0) return steps;

  const newNodeData = inputData[inputData.length - 1];
  const oldData = inputData.slice(0, inputData.length - 1);

  if (oldData.length === 0) {
    steps.push({
      ...generateFrame(inputData, { [newNodeData.id]: "complete" }, `樹為空，插入根節點 ${newNodeData.value}`),
      actionTag: TAGS.INSERT_INIT,
      variables: { root: newNodeData.value }
    });
    return steps;
  }

  const root = buildBST(oldData);
  const statusMap: Record<string, Status> = {};

  steps.push({
    ...generateFrame(oldData, {}, `準備插入新節點：${newNodeData.value}`),
    actionTag: TAGS.INSERT_INIT,
    variables: { insertVal: newNodeData.value }
  });

  let curr = root;
  while (curr) {
    statusMap[curr.id] = "target";
    steps.push({
      ...generateFrame(oldData, statusMap, `比較：${newNodeData.value} vs ${curr.value}`),
      actionTag: TAGS.INSERT_COMPARE,
      variables: { curr: curr.value, insertVal: newNodeData.value }
    });

    if (newNodeData.value < curr.value) {
      if (curr.left) {
        statusMap[curr.left.id] = "prepare";
        steps.push({
          ...generateFrame(oldData, statusMap, `${newNodeData.value} < ${curr.value}，往左子樹尋找`),
          actionTag: TAGS.INSERT_LEFT,
          variables: { curr: curr.value }
        });
        delete statusMap[curr.left.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.left;
      } else {
        steps.push({
          ...generateFrame(oldData, statusMap, `找到空位 (左側)，準備插入`),
          actionTag: TAGS.INSERT_FOUND_LEFT,
          variables: { parent: curr.value }
        });
        break;
      }
    } else {
      if (curr.right) {
        statusMap[curr.right.id] = "prepare";
        steps.push({
          ...generateFrame(oldData, statusMap, `${newNodeData.value} >= ${curr.value}，往右子樹尋找`),
          actionTag: TAGS.INSERT_RIGHT,
          variables: { curr: curr.value }
        });
        delete statusMap[curr.right.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.right;
      } else {
        steps.push({
          ...generateFrame(oldData, statusMap, `找到空位 (右側)，準備插入`),
          actionTag: TAGS.INSERT_FOUND_RIGHT,
          variables: { parent: curr.value }
        });
        break;
      }
    }
  }

  statusMap[newNodeData.id] = "complete";
  if (curr) statusMap[curr.id] = "unfinished";

  steps.push({
    ...generateFrame(inputData, statusMap, `插入節點 ${newNodeData.value} 完成`),
    actionTag: TAGS.INSERT_ACT,
    variables: { inserted: true }
  });

  return steps;
}

function runSearch(inputData: any[], targetValue: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};

  if (!root) {
    steps.push({ ...generateFrame(inputData, {}, "樹為空，無法搜尋"), actionTag: TAGS.SEARCH_INIT });
    return steps;
  }

  steps.push({
    ...generateFrame(inputData, {}, `開始搜尋數值：${targetValue}`),
    actionTag: TAGS.SEARCH_INIT,
    variables: { target: targetValue }
  });

  let curr: LogicTreeNode | undefined = root;
  let found = false;

  while (curr) {
    statusMap[curr.id] = "target";
    steps.push({
      ...generateFrame(inputData, statusMap, `比較：${targetValue} vs ${curr.value}`),
      actionTag: TAGS.SEARCH_COMPARE,
      variables: { curr: curr.value, target: targetValue }
    });

    if (targetValue === curr.value) {
      statusMap[curr.id] = "complete";
      steps.push({
        ...generateFrame(inputData, statusMap, `找到目標值 ${targetValue}`),
        actionTag: TAGS.SEARCH_FOUND,
        variables: { found: true }
      });
      found = true;
      break;
    } else if (targetValue < curr.value) {
      if (curr.left) {
        statusMap[curr.left.id] = "prepare";
        steps.push({
          ...generateFrame(inputData, statusMap, `${targetValue} < ${curr.value}，往左尋找`),
          actionTag: TAGS.SEARCH_LEFT,
          variables: { curr: curr.value }
        });
        delete statusMap[curr.left.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.left;
      } else {
        steps.push({
          ...generateFrame(inputData, statusMap, `無左子節點，搜尋失敗`),
          actionTag: TAGS.SEARCH_LEFT,
          variables: { result: "not_found" }
        });
        statusMap[curr.id] = "unfinished";
        break;
      }
    } else {
      if (curr.right) {
        statusMap[curr.right.id] = "prepare";
        steps.push({
          ...generateFrame(inputData, statusMap, `${targetValue} > ${curr.value}，往右尋找`),
          actionTag: TAGS.SEARCH_RIGHT,
          variables: { curr: curr.value }
        });
        delete statusMap[curr.right.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.right;
      } else {
        steps.push({
          ...generateFrame(inputData, statusMap, `無右子節點，搜尋失敗`),
          actionTag: TAGS.SEARCH_RIGHT,
          variables: { result: "not_found" }
        });
        statusMap[curr.id] = "unfinished";
        break;
      }
    }
  }

  if (!found) {
    steps.push({
      ...generateFrame(inputData, statusMap, `未找到數值 ${targetValue}`),
      variables: { found: false }
    });
  }

  return steps;
}

// ==========================================
// 5. Operation: Delete (Modified to "Value Copy" for Case 2)
// ==========================================
function runDelete(inputData: any[], targetValue: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};

  if (!root) {
    steps.push(generateFrame(inputData, {}, "樹為空，無法刪除"));
    return steps;
  }

  steps.push({
    ...generateFrame(inputData, {}, `準備刪除節點：${targetValue}`),
    actionTag: TAGS.DELETE_INIT,
    variables: { deleteVal: targetValue }
  });

  // Phase 1: Search
  let curr: LogicTreeNode | undefined = root;
  let foundNode: LogicTreeNode | undefined = undefined;

  while (curr) {
    statusMap[curr.id] = "target";
    steps.push({
      ...generateFrame(inputData, statusMap, `尋找刪除目標：${targetValue} vs ${curr.value}`),
      actionTag: TAGS.DELETE_COMPARE,
      variables: { curr: curr.value, target: targetValue }
    });

    if (targetValue === curr.value) {
      foundNode = curr;
      statusMap[curr.id] = "complete";
      steps.push({
        ...generateFrame(inputData, statusMap, `找到目標節點 ${targetValue}`),
        actionTag: TAGS.DELETE_FOUND,
        variables: { found: true }
      });
      break;
    }

    if (targetValue < curr.value) {
      if (curr.left) {
        statusMap[curr.left.id] = "prepare";
        steps.push({
          ...generateFrame(inputData, statusMap, `往左尋找`),
          actionTag: TAGS.DELETE_LEFT,
          variables: { curr: curr.value }
        });
        delete statusMap[curr.left.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.left;
      } else {
        steps.push({
          ...generateFrame(inputData, statusMap, `${targetValue} < ${curr.value}，但無左子節點`),
          variables: { result: "not_found" }
        });
        statusMap[curr.id] = "unfinished";
        break;
      }
    } else {
      if (curr.right) {
        statusMap[curr.right.id] = "prepare";
        steps.push({
          ...generateFrame(inputData, statusMap, `往右尋找`),
          actionTag: TAGS.DELETE_RIGHT,
          variables: { curr: curr.value }
        });
        delete statusMap[curr.right.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.right;
      } else {
        steps.push({
          ...generateFrame(inputData, statusMap, `${targetValue} > ${curr.value}，但無右子節點`),
          variables: { result: "not_found" }
        });
        statusMap[curr.id] = "unfinished";
        break;
      }
    }
  }

  if (!foundNode) {
    steps.push(generateFrame(inputData, statusMap, `未找到數值 ${targetValue}，刪除失敗`));
    return steps;
  }

  // Phase 2: Delete
  const targetId = foundNode.id;

  // Case 1: Leaf Node
  if (!foundNode.left && !foundNode.right) {
    statusMap[targetId] = "target";
    steps.push({
      ...generateFrame(inputData, statusMap, `Case 1: 葉子節點，直接移除`),
      actionTag: TAGS.DELETE_LEAF,
      variables: { case: "leaf" }
    });
    
    const finalData = inputData.filter((d: any) => d.id !== targetId);
    const finalStatus: Record<string, Status> = {};
    finalData.forEach((d: any) => { finalStatus[d.id] = "complete"; });
    
    steps.push(generateFrame(finalData, finalStatus, `刪除完成`));
  }
  // Case 2: One Child (Modified to Value Copy Logic)
  else if (!foundNode.left || !foundNode.right) {
    const child = foundNode.left ? foundNode.left : foundNode.right;
    statusMap[targetId] = "target";
    
    // 1. Identify Child
    if (foundNode.left) {
      steps.push({
        ...generateFrame(inputData, statusMap, `Case 2: 只有左子樹 (${foundNode.left.value})，準備覆蓋數值`),
        actionTag: TAGS.DELETE_ONE_PREPARE,
        variables: { case: "one_child_left", child: child!.value }
      });
    } else {
      steps.push({
        ...generateFrame(inputData, statusMap, `Case 2: 只有右子樹 (${foundNode.right!.value})，準備覆蓋數值`),
        actionTag: TAGS.DELETE_ONE_PREPARE,
        variables: { case: "one_child_right", child: child!.value }
      });
    }

    // 2. Highlight Child as Prepare
    statusMap[child!.id] = "prepare";
    steps.push({
      ...generateFrame(inputData, statusMap, `鎖定子節點 ${child!.value}`),
      actionTag: TAGS.DELETE_ONE_PREPARE,
      variables: { replacement: child!.value }
    });

    // 3. Swap/Copy Value (Visually: Target value changes to Child value)
    const replacedData = inputData.map((d: any) =>
        d.id === targetId ? { ...d, value: child!.value } : d
    );
    steps.push({
      ...generateFrame(replacedData, statusMap, `將子節點 ${child!.value} 的值覆蓋到目標節點`),
      actionTag: TAGS.DELETE_ONE_COPY,
      variables: { op: "copy_value", newVal: child!.value }
    });

    // 4. Remove Child (Visually: Child node disappears)
    // 這裡我們移除 child.id，保留 targetId (但 targetId 的值已經變成 child.value 了)
    const finalData = replacedData.filter((d: any) => d.id !== child!.id);
    const finalStatus: Record<string, Status> = {};
    finalData.forEach((d: any) => { finalStatus[d.id] = "complete"; });
    
    steps.push({
      ...generateFrame(finalData, finalStatus, `移除原本的子節點 ${child!.value}，並接管其子樹，刪除完成`),
      actionTag: TAGS.DELETE_ONE_COPY,
      variables: { op: "delete_child" }
    });
  }
  // Case 3: Two Children
  else {
    statusMap[targetId] = "target";
    steps.push({
      ...generateFrame(inputData, statusMap, `Case 3: 雙子節點。需尋找後繼者 (右子樹最小值)`),
      actionTag: TAGS.DELETE_TWO,
      variables: { case: "two_children" }
    });

    // 1. Enter Right
    let successor = foundNode.right;
    statusMap[successor.id] = "prepare";
    steps.push({
      ...generateFrame(inputData, statusMap, `進入右子樹根節點 ${successor.value}`),
      actionTag: TAGS.DELETE_FIND_MIN,
      variables: { curr: successor.value }
    });
    
    delete statusMap[successor.id];
    statusMap[successor.id] = "unfinished";

    // 2. Go Left
    while (successor.left) {
      statusMap[successor.id] = "target";
      steps.push({
        ...generateFrame(inputData, statusMap, `檢查 ${successor.value} 左側`),
        actionTag: TAGS.DELETE_FIND_MIN,
        variables: { curr: successor.value }
      });

      if (successor.left) {
        statusMap[successor.left.id] = "prepare";
        steps.push({
          ...generateFrame(inputData, statusMap, `有左子節點 ${successor.left.value}，繼續往左尋找`),
          actionTag: TAGS.DELETE_FIND_MIN,
          variables: { curr: successor.value, next: successor.left.value }
        });

        delete statusMap[successor.left.id];
        statusMap[successor.id] = "unfinished";
        successor = successor.left;
      } else {
        steps.push({
          ...generateFrame(inputData, statusMap, `無左子節點，${successor.value} 即為右子樹的最小值 (Successor)`),
          actionTag: TAGS.DELETE_FIND_MIN,
          variables: { successor: successor.value }
        });
        break;
      }
    }

    // 3. Lock Successor
    statusMap[successor.id] = "complete";
    steps.push({
      ...generateFrame(inputData, statusMap, `鎖定後繼者: ${successor.value}`),
      actionTag: TAGS.DELETE_FIND_MIN,
      variables: { successor: successor.value }
    });

    // 4. Swap Value
    const replacedData = inputData.map((d: any) =>
      d.id === targetId ? { ...d, value: successor!.value } : d
    );
    steps.push({
      ...generateFrame(replacedData, statusMap, `將 ${targetValue} 替換為 ${successor.value}`),
      actionTag: TAGS.DELETE_SWAP,
      variables: { target: targetValue, newVal: successor.value }
    });

    // 5. Remove Successor
    const finalData = replacedData.filter((d: any) => d.id !== successor!.id);
    const finalStatus: Record<string, Status> = {};
    finalData.forEach((d: any) => { finalStatus[d.id] = "complete"; });

    steps.push({
      ...generateFrame(finalData, finalStatus, `移除原本的後繼者節點 ${successor.value}，重組結構，刪除完成`),
      actionTag: TAGS.DELETE_RECURSE,
      variables: { deleted: successor.value }
    });
  }

  return steps;
}

function runLoad(inputData: any[]): AnimationStep[] {
  return [{
    stepNumber: 0,
    description: `資料載入完成 (節點數: ${inputData.length})`,
    elements: createTreeNodes(inputData, BST_LAYOUT),
    actionTag: TAGS.INSERT_INIT
  }];
}

// (Run Min/Max/Floor/Ceil omitted for brevity, use previous logic)
export function createBinarySearchTreeAnimationSteps(
  inputData: any[],
  action?: any
): AnimationStep[] {
  if (action?.type === "add" || action?.mode === "Insert") return runInsert(inputData);
  if (action?.type === "delete" || action?.mode === "DeleteValue") return runDelete(inputData, action.index);
  if (action?.mode === "search") return runSearch(inputData, action.value);
  if (action?.mode === "floor") return runFloor(inputData, action.value);
  if (["load", "random", "reset"].includes(action?.type)) return runLoad(inputData);

  return [{
    stepNumber: 0,
    description: "Binary Search Tree",
    elements: createTreeNodes(inputData, BST_LAYOUT),
    actionTag: TAGS.INSERT_INIT
  }];
}

// ==========================================
// Code Config with Updated Delete Logic
// ==========================================
const binarySearchTreeCodeConfig: CodeConfig = {
  pseudo: {
    content: `// Operation: Insert
Procedure Insert(node, value):
  If node is NULL Return NewNode(value)
  If value < node.value:
    node.left ← Insert(node.left, value)
  Else:
    node.right ← Insert(node.right, value)

// Operation: Search
Procedure Search(node, target):
  While node is not NULL:
    If node.value = target Return node
    If target < node.value:
      node ← node.left
    Else:
      node ← node.right
  Return NULL

// Operation: Delete
Procedure Delete(node, key):
  // 1. Find Node
  If key < node.value:
    node.left ← Delete(node.left, key)
  Else If key > node.value:
    node.right ← Delete(node.right, key)
  Else:
    // 2. Handle Removal (Value Copy Logic)
    If IsLeaf(node) Return NULL
    child ← GetChild(node)
    If child exists:
      node.value ← child.value
      node.link ← child.link
      Delete child (re-link grandchildren)
    
    // 3. Two Children Case
    successor ← FindMin(node.right)
    node.value ← successor.value
    node.right ← Delete(node.right, successor.value)`,
    mappings: {
      // --- Insert Mappings ---
      [TAGS.INSERT_INIT]: [3],
      [TAGS.INSERT_COMPARE]: [4, 6],
      [TAGS.INSERT_LEFT]: [5],
      [TAGS.INSERT_RIGHT]: [7],
      [TAGS.INSERT_ACT]: [3],
      // [Update] Specific Highlights for finding spots
      [TAGS.INSERT_FOUND_LEFT]: [4,5], 
      [TAGS.INSERT_FOUND_RIGHT]: [6,7],

      // --- Search ---
      [TAGS.SEARCH_INIT]: [11],
      [TAGS.SEARCH_COMPARE]: [12, 13],
      [TAGS.SEARCH_LEFT]: [14],
      [TAGS.SEARCH_RIGHT]: [16],
      [TAGS.SEARCH_FOUND]: [12],

      // --- Delete ---
      [TAGS.DELETE_INIT]: [22],
      [TAGS.DELETE_COMPARE]: [22, 24],
      [TAGS.DELETE_LEFT]: [23],
      [TAGS.DELETE_RIGHT]: [25],
      [TAGS.DELETE_FOUND]: [26],
      
      [TAGS.DELETE_LEAF]: [28],
      
      // Case 2: One Child (Value Copy)
      [TAGS.DELETE_ONE_PREPARE]: [29], // GetChild
      [TAGS.DELETE_ONE_COPY]: [31, 32], // Copy value & re-link
      
      // Case 3: Two Children
      [TAGS.DELETE_TWO]: [35],
      [TAGS.DELETE_FIND_MIN]: [36],
      [TAGS.DELETE_SWAP]: [37],
      [TAGS.DELETE_RECURSE]: [38],
    },
  },
  python: {
    content: `class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if not root: return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

def search(root, target):
    curr = root
    while curr:
        if curr.val == target: return curr
        if target < curr.val:
            curr = curr.left
        else:
            curr = curr.right
    return None

def delete_node(root, key):
    if not root: return None
    if key < root.val:
        root.left = delete_node(root.left, key)
    elif key > root.val:
        root.right = delete_node(root.right, key)
    else:
        if not root.left: return root.right
        if not root.right: return root.left
        
        # Two children: Find successor
        temp = root.right
        while temp.left: temp = temp.left
        
        root.val = temp.val
        root.right = delete_node(root.right, temp.val)
    return root`,
  },
};

export const BinarySearchTreeConfig: LevelImplementationConfig = {
  id: "bst",
  type: "dataStructure",
  name: "二元搜尋樹 (Binary Search Tree)",
  categoryName: "非線性表",
  description: "具有排序性質的二元樹，左子樹小於根，右子樹大於根",
  codeConfig: binarySearchTreeCodeConfig,
  complexity: {
    timeBest: "O(log n)",
    timeAverage: "O(log n)",
    timeWorst: "O(n)",
    space: "O(h)",
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
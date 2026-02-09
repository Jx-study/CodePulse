import { LevelImplementationConfig } from "@/types/implementation";
import { AnimationStep, CodeConfig } from "@/types";
import { createTreeNodes } from "./utils";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Node } from "@/modules/core/DataLogic/Node";

// --- 1. Action Tags 定義 (對應 Pseudo Code 映射) ---
const TAGS = {
  // 插入
  INSERT_INIT: "INSERT_INIT",
  INSERT_COMPARE: "INSERT_COMPARE",
  INSERT_COUNT: "INSERT_COUNT",
  INSERT_LEFT: "INSERT_LEFT",
  INSERT_RIGHT: "INSERT_RIGHT",
  INSERT_ACT: "INSERT_ACT",

  // 搜尋 / 最小值 / 最大值
  SEARCH_INIT: "SEARCH_INIT",
  SEARCH_COMPARE: "SEARCH_COMPARE",
  SEARCH_LEFT: "SEARCH_LEFT",
  SEARCH_RIGHT: "SEARCH_RIGHT",
  SEARCH_FOUND: "SEARCH_FOUND",

  // 刪除
  DELETE_INIT: "DELETE_INIT",
  DELETE_COMPARE: "DELETE_COMPARE",
  DELETE_COUNT: "DELETE_COUNT",
  DELETE_FOUND: "DELETE_FOUND",
  DELETE_LEFT: "DELETE_LEFT",
  DELETE_RIGHT: "DELETE_RIGHT",
  DELETE_LEAF: "DELETE_LEAF",
  DELETE_ONE_PREPARE: "DELETE_ONE_PREPARE",
  DELETE_ONE_COPY: "DELETE_ONE_COPY",
  DELETE_TWO: "DELETE_TWO",
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

// --- 2. 邏輯樹介面與輔助函數 ---
interface LogicTreeNode {
  id: string;
  value: number;
  count: number;
  left?: LogicTreeNode;
  right?: LogicTreeNode;
}

function buildBST(data: any[]): LogicTreeNode | null {
  if (data.length === 0) return null;
  const rootData = data[0];
  const root: LogicTreeNode = { ...rootData, count: 1, left: undefined, right: undefined };
  for (let i = 1; i < data.length; i++) {
    insertNodeLogic(root, { ...data[i], count: 1, left: undefined, right: undefined });
  }
  return root;
}

function insertNodeLogic(root: LogicTreeNode, newNode: LogicTreeNode) {
  if (newNode.value === root.value) {
    root.count += 1;
    return;
  }
  if (newNode.value < root.value) {
    if (root.left) insertNodeLogic(root.left, newNode);
    else root.left = newNode;
  } else {
    if (root.right) insertNodeLogic(root.right, newNode);
    else root.right = newNode;
  }
}

function flattenUniqueNodes(node: LogicTreeNode | undefined, list: any[]) {
  if (!node) return;
  list.push({ id: node.id, value: node.value, count: node.count });
  flattenUniqueNodes(node.left, list);
  flattenUniqueNodes(node.right, list);
}

const generateFrame = (
  inputData: any[],
  statusMap: Record<string, Status>,
  description: string,
  actionTag?: string,
  variables?: Record<string, any>
): AnimationStep => {
  const root = buildBST(inputData);
  const uniqueData: any[] = [];
  flattenUniqueNodes(root || undefined, uniqueData);

  const treeElements = createTreeNodes(uniqueData, BST_LAYOUT);

  treeElements.forEach((el) => {
    if (el instanceof Node) {
      const status = statusMap[el.id] || "inactive";
      el.setStatus(status);
      if (typeof (el as any).value === "number") {
        (el as any).value = Math.round((el as any).value);
      }
      const logicNode = uniqueData.find((d) => d.id === el.id);
      if (logicNode) el.description = `Count: ${logicNode.count}`;
    }
  });

  treeElements.sort((a, b) => {
    const isNodeA = a instanceof Node;
    const isNodeB = b instanceof Node;
    if (isNodeA && !isNodeB) return 1;
    if (!isNodeA && isNodeB) return -1;
    return a.id.localeCompare(b.id);
  });

  return {
    stepNumber: 0,
    description,
    elements: [...treeElements],
    actionTag,
    variables
  };
};

// --- 3. 操作函數實作 ---

function runInsert(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  if (inputData.length === 0) return steps;

  const rawNewNode = inputData[inputData.length - 1];
  const newValue = Math.round(rawNewNode.value);
  const newNodeData = { ...rawNewNode, value: newValue };
  const oldData = inputData.slice(0, inputData.length - 1);

  if (oldData.length === 0) {
    steps.push(generateFrame(inputData, { [newNodeData.id]: "complete" }, `樹為空，插入根節點 ${newValue}`, TAGS.INSERT_INIT, { root: newValue }));
    return steps;
  }

  const root = buildBST(oldData);
  const statusMap: Record<string, Status> = {};
  steps.push(generateFrame(oldData, {}, `準備插入新節點：${newValue}`, TAGS.INSERT_INIT, { insertVal: newValue }));

  let curr = root;
  while (curr) {
    statusMap[curr.id] = "target";
    steps.push(generateFrame(oldData, statusMap, `比較：${newValue} vs ${curr.value}`, TAGS.INSERT_COMPARE, { curr: curr.value, insertVal: newValue }));

    if (newValue === curr.value) {
      statusMap[curr.id] = "complete";
      steps.push(generateFrame(inputData, statusMap, `數值 ${newValue} 已存在，計數器加 1`, TAGS.INSERT_COUNT, { count: curr.count + 1 }));
      return steps;
    }

    if (newValue < curr.value) {
      if (curr.left) {
        statusMap[curr.left.id] = "prepare";
        steps.push(generateFrame(oldData, statusMap, `${newValue} < ${curr.value}，往左尋找`, TAGS.INSERT_LEFT, { curr: curr.value }));
        delete statusMap[curr.left.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.left;
      } else break;
    } else {
      if (curr.right) {
        statusMap[curr.right.id] = "prepare";
        steps.push(generateFrame(oldData, statusMap, `${newValue} >= ${curr.value}，往右尋找`, TAGS.INSERT_RIGHT, { curr: curr.value }));
        delete statusMap[curr.right.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.right;
      } else break;
    }
  }

  statusMap[newNodeData.id] = "complete";
  if (curr) statusMap[curr.id] = "unfinished";
  steps.push(generateFrame(inputData, statusMap, `插入節點 ${newValue} 完成`, TAGS.INSERT_ACT, { inserted: true }));
  return steps;
}

function runSearch(inputData: any[], targetValue: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};

  if (!root) {
    steps.push(generateFrame(inputData, {}, "樹為空", TAGS.SEARCH_INIT));
    return steps;
  }

  steps.push(generateFrame(inputData, {}, `開始搜尋：${targetValue}`, TAGS.SEARCH_INIT, { target: targetValue }));

  let curr: LogicTreeNode | undefined = root;
  while (curr) {
    statusMap[curr.id] = "target";
    steps.push(generateFrame(inputData, statusMap, `比較：${targetValue} vs ${curr.value}`, TAGS.SEARCH_COMPARE, { curr: curr.value, target: targetValue }));

    if (targetValue === curr.value) {
      statusMap[curr.id] = "complete";
      steps.push(generateFrame(inputData, statusMap, `找到目標 ${targetValue}`, TAGS.SEARCH_FOUND, { found: true }));
      return steps;
    }
    
    if (targetValue < curr.value) {
      if (curr.left) {
        statusMap[curr.left.id] = "prepare";
        steps.push(generateFrame(inputData, statusMap, `${targetValue} < ${curr.value} 往左`, TAGS.SEARCH_LEFT));
        delete statusMap[curr.left.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.left;
      } else break;
    } else {
      if (curr.right) {
        statusMap[curr.right.id] = "prepare";
        steps.push(generateFrame(inputData, statusMap, `${targetValue} > ${curr.value} 往右`, TAGS.SEARCH_RIGHT));
        delete statusMap[curr.right.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.right;
      } else break;
    }
  }

  steps.push(generateFrame(inputData, statusMap, "搜尋結束，未找到", TAGS.SEARCH_FOUND, { found: false }));
  return steps;
}

function runDelete(inputData: any[], targetValue: number): AnimationStep[] {
  targetValue = Math.round(targetValue);
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};

  if (!root) return [generateFrame(inputData, {}, "樹為空", TAGS.DELETE_INIT)];

  steps.push(generateFrame(inputData, {}, `準備刪除：${targetValue}`, TAGS.DELETE_INIT, { deleteVal: targetValue }));

  let curr: LogicTreeNode | undefined = root;
  let foundNode: LogicTreeNode | undefined = undefined;

  while (curr) {
    statusMap[curr.id] = "target";
    steps.push(generateFrame(inputData, statusMap, `比較：${targetValue} vs ${curr.value}`, TAGS.DELETE_COMPARE, { curr: curr.value, target: targetValue }));

    if (targetValue === curr.value) {
      foundNode = curr;
      statusMap[curr.id] = "complete";
      steps.push(generateFrame(inputData, statusMap, `找到目標 ${targetValue}`, TAGS.DELETE_FOUND, { found: true }));
      break;
    }

    if (targetValue < curr.value) {
      if (curr.left) {
        statusMap[curr.left.id] = "prepare";
        steps.push(generateFrame(inputData, statusMap, `往左尋找`, TAGS.DELETE_LEFT));
        delete statusMap[curr.left.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.left;
      } else break;
    } else {
      if (curr.right) {
        statusMap[curr.right.id] = "prepare";
        steps.push(generateFrame(inputData, statusMap, `往右尋找`, TAGS.DELETE_RIGHT));
        delete statusMap[curr.right.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.right;
      } else break;
    }
  }

  if (!foundNode) {
    steps.push(generateFrame(inputData, statusMap, `未找到目標`, TAGS.DELETE_FOUND, { found: false }));
    return steps;
  }

  // 處理重複計數
  if (foundNode.count > 1) {
    const newData = getBSTArrayAfterDelete(inputData, targetValue);
    steps.push(generateFrame(newData, statusMap, `計數器減 1`, TAGS.DELETE_COUNT, { count: foundNode.count - 1 }));
    return steps;
  }

  const targetId = foundNode.id;
  // Case 1: 葉子
  if (!foundNode.left && !foundNode.right) {
    steps.push(generateFrame(inputData, statusMap, `葉子節點，直接刪除`, TAGS.DELETE_LEAF));
    const finalData = getBSTArrayAfterDelete(inputData, targetValue);
    steps.push(generateFrame(finalData, {}, `刪除完成`));
  } 
  // Case 2: 單一子節點
  else if (!foundNode.left || !foundNode.right) {
    const child = foundNode.left || foundNode.right;
    steps.push(generateFrame(inputData, statusMap, `只有單一子節點 ${child?.value}，準備替換`, TAGS.DELETE_ONE_PREPARE));
    const finalData = getBSTArrayAfterDelete(inputData, targetValue);
    steps.push(generateFrame(finalData, {}, `子節點接上，刪除完成`, TAGS.DELETE_ONE_COPY));
  } 
  // Case 3: 雙子節點
  else {
    steps.push(generateFrame(inputData, statusMap, `雙子節點，尋找右子樹後繼者`, TAGS.DELETE_TWO));
    let successor = foundNode.right;
    while (successor.left) {
      statusMap[successor.id] = "target";
      steps.push(generateFrame(inputData, statusMap, `尋找最小值...`, TAGS.DELETE_FIND_MIN, { curr: successor.value }));
      statusMap[successor.id] = "unfinished";
      successor = successor.left;
    }
    statusMap[successor.id] = "complete";
    steps.push(generateFrame(inputData, statusMap, `鎖定後繼者: ${successor.value}`, TAGS.DELETE_FIND_MIN, { successor: successor.value }));
    
    const finalData = getBSTArrayAfterDelete(inputData, targetValue);
    steps.push(generateFrame(finalData, {}, `替換為後繼者並移除原節點`, TAGS.DELETE_RECURSE));
  }

  return steps;
}

function runMin(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};
  if (!root) return steps;

  steps.push(generateFrame(inputData, {}, "尋找最小值：一路向左", TAGS.SEARCH_INIT));
  let curr: LogicTreeNode = root;
  while (curr.left) {
    statusMap[curr.id] = "target";
    steps.push(generateFrame(inputData, statusMap, `當前 ${curr.value}，往左走`, TAGS.SEARCH_LEFT));
    statusMap[curr.id] = "unfinished";
    curr = curr.left;
  }
  statusMap[curr.id] = "complete";
  steps.push(generateFrame(inputData, statusMap, `抵達最左節點 ${curr.value}`, TAGS.SEARCH_FOUND, { min: curr.value }));
  return steps;
}

function runMax(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};
  if (!root) return steps;

  steps.push(generateFrame(inputData, {}, "尋找最大值：一路向右", TAGS.SEARCH_INIT));
  let curr: LogicTreeNode = root;
  while (curr.right) {
    statusMap[curr.id] = "target";
    steps.push(generateFrame(inputData, statusMap, `當前 ${curr.value}，往右走`, TAGS.SEARCH_RIGHT));
    statusMap[curr.id] = "unfinished";
    curr = curr.right;
  }
  statusMap[curr.id] = "complete";
  steps.push(generateFrame(inputData, statusMap, `抵達最右節點 ${curr.value}`, TAGS.SEARCH_FOUND, { max: curr.value }));
  return steps;
}

function runFloor(inputData: any[], targetValue: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};
  if (!root) return steps;

  steps.push(generateFrame(inputData, {}, `尋找 Floor(${targetValue})`, TAGS.SEARCH_INIT));
  let curr: LogicTreeNode | undefined = root;
  let floorNode: LogicTreeNode | null = null;

  while (curr) {
    statusMap[curr.id] = "target";
    steps.push(generateFrame(inputData, statusMap, `比較 ${targetValue} vs ${curr.value}`, TAGS.SEARCH_COMPARE));

    if (curr.value === targetValue) {
      statusMap[curr.id] = "complete";
      steps.push(generateFrame(inputData, statusMap, `找到相等值`, TAGS.SEARCH_FOUND));
      return steps;
    }

    if (curr.value > targetValue) {
      steps.push(generateFrame(inputData, statusMap, `太大了，往左找`, TAGS.SEARCH_LEFT));
      statusMap[curr.id] = "unfinished";
      curr = curr.left;
    } else {
      if (floorNode) statusMap[floorNode.id] = "unfinished";
      floorNode = curr;
      statusMap[curr.id] = "complete";
      steps.push(generateFrame(inputData, statusMap, `比目標小，暫定為 Floor，往右找更大但仍符合的`, TAGS.SEARCH_RIGHT));
      curr = curr.right;
    }
  }
  steps.push(generateFrame(inputData, statusMap, `搜尋結束`, TAGS.SEARCH_FOUND, { floor: floorNode?.value }));
  return steps;
}

function runCeil(inputData: any[], targetValue: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};
  if (!root) return steps;

  steps.push(generateFrame(inputData, {}, `尋找 Ceil(${targetValue})`, TAGS.SEARCH_INIT));
  let curr: LogicTreeNode | undefined = root;
  let ceilNode: LogicTreeNode | null = null;

  while (curr) {
    statusMap[curr.id] = "target";
    steps.push(generateFrame(inputData, statusMap, `比較 ${targetValue} vs ${curr.value}`, TAGS.SEARCH_COMPARE));

    if (curr.value === targetValue) {
      statusMap[curr.id] = "complete";
      steps.push(generateFrame(inputData, statusMap, `找到相等值`, TAGS.SEARCH_FOUND));
      return steps;
    }

    if (curr.value < targetValue) {
      steps.push(generateFrame(inputData, statusMap, `太小了，往右找`, TAGS.SEARCH_RIGHT));
      statusMap[curr.id] = "unfinished";
      curr = curr.right;
    } else {
      if (ceilNode) statusMap[ceilNode.id] = "unfinished";
      ceilNode = curr;
      statusMap[curr.id] = "complete";
      steps.push(generateFrame(inputData, statusMap, `比目標大，暫定為 Ceil，往左找更小但仍符合的`, TAGS.SEARCH_LEFT));
      curr = curr.left;
    }
  }
  steps.push(generateFrame(inputData, statusMap, `搜尋結束`, TAGS.SEARCH_FOUND, { ceil: ceilNode?.value }));
  return steps;
}

// --- 4. 刪除邏輯輔助 (計算最後狀態) ---
export function getBSTArrayAfterDelete(data: any[], targetValue: number): any[] {
  targetValue = Math.round(targetValue);
  const root = buildBST(data);
  if (!root) return data;

  const findNode = (node: LogicTreeNode | undefined, val: number): LogicTreeNode | undefined => {
    if (!node) return undefined;
    if (val === node.value) return node;
    return val < node.value ? findNode(node.left, val) : findNode(node.right, val);
  };

  const targetNode = findNode(root, targetValue);
  if (!targetNode) return data;

  if (targetNode.count > 1) {
    const idx = data.slice().reverse().findIndex((d) => Math.round(d.value) === targetValue);
    const realIdx = data.length - 1 - idx;
    const newData = [...data];
    newData.splice(realIdx, 1);
    return newData;
  }

  let idToRemove: string | null = null;
  let idToUpdateValue: string | null = null;
  let newValueForUpdate: number | null = null;

  if (!targetNode.left && !targetNode.right) {
    idToRemove = targetNode.id;
  } else if (!targetNode.left || !targetNode.right) {
    const child = targetNode.left || targetNode.right;
    idToUpdateValue = targetNode.id;
    newValueForUpdate = child!.value;
    idToRemove = child!.id;
  } else {
    let successor = targetNode.right;
    while (successor!.left) successor = successor!.left;
    idToUpdateValue = targetNode.id;
    newValueForUpdate = successor!.value;
    idToRemove = successor!.id;
  }

  let finalData = data.filter((d) => d.id !== idToRemove);
  if (idToUpdateValue) {
    finalData = finalData.map((d) => d.id === idToUpdateValue ? { ...d, value: newValueForUpdate } : d);
  }
  return finalData;
}

// --- 5. 主配置與 CodeConfig ---
const binarySearchTreeCodeConfig: CodeConfig = {
  pseudo: {
    content: `// Operation: Insert
Procedure Insert(node, value):
  If node is NULL: Return NewNode(value)
  If value == node.value:
    node.count++ // Duplicate Handle
  Else if value < node.value:
    node.left ← Insert(node.left, value)
  Else:
    node.right ← Insert(node.right, value)

// Operation: Search / Find
Procedure Search(node, target):
  While node is not NULL:
    If node.value = target: Return node
    If target < node.value: node ← node.left
    Else: node ← node.right
  Return NULL

// Operation: Delete
Procedure Delete(node, key):
  // 1. Find Node
  If key < node.value: node.left ← Delete(node.left, key)
  Else if key > node.value: node.right ← Delete(node.right, key)
  Else:
    // 2. Handle Duplicate
    If node.count > 1: node.count--
    // 3. Structural Removal
    Else if IsLeaf(node): Return NULL
    Else if OneChild(node): Return child
    Else:
      successor ← FindMin(node.right)
      node.value ← successor.value
      node.right ← Delete(node.right, successor.value)`,
    mappings: {
      [TAGS.INSERT_INIT]: [3],
      [TAGS.INSERT_COMPARE]: [4],
      [TAGS.INSERT_COUNT]: [5],
      [TAGS.INSERT_LEFT]: [6, 7],
      [TAGS.INSERT_RIGHT]: [8, 9],
      [TAGS.INSERT_ACT]: [3],
      [TAGS.SEARCH_INIT]: [13],
      [TAGS.SEARCH_COMPARE]: [14, 15],
      [TAGS.SEARCH_LEFT]: [16],
      [TAGS.SEARCH_RIGHT]: [17],
      [TAGS.SEARCH_FOUND]: [15],
      [TAGS.DELETE_INIT]: [22],
      [TAGS.DELETE_COMPARE]: [23, 24],
      [TAGS.DELETE_LEFT]: [23],
      [TAGS.DELETE_RIGHT]: [24],
      [TAGS.DELETE_FOUND]: [25],
      [TAGS.DELETE_COUNT]: [27],
      [TAGS.DELETE_LEAF]: [29],
      [TAGS.DELETE_ONE_PREPARE]: [30],
      [TAGS.DELETE_ONE_COPY]: [30],
      [TAGS.DELETE_TWO]: [32],
      [TAGS.DELETE_FIND_MIN]: [32],
      [TAGS.DELETE_SWAP]: [33],
      [TAGS.DELETE_RECURSE]: [34],
    },
  },
  python: {
    content: `def insert(root, val):
    if not root: return TreeNode(val)
    if val == root.val:
        root.count += 1
    elif val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

def delete_node(root, key):
    if not root: return None
    if key < root.val:
        root.left = delete_node(root.left, key)
    elif key > root.val:
        root.right = delete_node(root.right, key)
    else:
        if root.count > 1:
            root.count -= 1
        elif not root.left: return root.right
        elif not root.right: return root.left
        else:
            temp = find_min(root.right)
            root.val = temp.val
            root.right = delete_node(root.right, temp.val)
    return root`,
  },
};

export const BinarySearchTreeConfig: LevelImplementationConfig = {
  id: "bst",
  type: "dataStructure",
  name: "二元搜尋樹 (BST)",
  categoryName: "非線性表",
  description: "具有排序性質的二元樹，左子樹小於根，右子樹大於根，重複值以計數顯示",
  codeConfig: binarySearchTreeCodeConfig,
  complexity: {
    timeBest: "O(log n)",
    timeAverage: "O(log n)",
    timeWorst: "O(n)",
    space: "O(h)",
  },
  introduction: `二元搜尋樹 (BST) 是一種重要的資料結構。
1. **左小右大**：所有左子樹節點皆小於根，所有右子樹節點皆大於根。
2. **重複處理**：本實作採用「計數器」邏輯。若插入相同數值，節點內的 Count 會增加。
3. **刪除邏輯**：
   - 葉子：直接刪除。
   - 單一子節點：由子節點繼承位置。
   - 雙子節點：尋找右子樹最小值 (Successor) 替換。`,
  defaultData: [
    { id: "node-1", value: 50 },
    { id: "node-2", value: 30 },
    { id: "node-3", value: 70 },
    { id: "node-4", value: 20 },
    { id: "node-5", value: 40 },
  ],
  createAnimationSteps: (data, action) => {
    if (action?.type === "add" || action?.mode === "Insert") return runInsert(data);
    if (action?.type === "delete" || action?.mode === "DeleteValue") return runDelete(data, action.index);
    if (action?.mode === "search") return runSearch(data, action.value);
    if (action?.mode === "min") return runMin(data);
    if (action?.mode === "max") return runMax(data);
    if (action?.mode === "floor") return runFloor(data, action.value);
    if (action?.mode === "ceil") return runCeil(data, action.value);
    return [generateFrame(data, {}, "Binary Search Tree")];
  },
};
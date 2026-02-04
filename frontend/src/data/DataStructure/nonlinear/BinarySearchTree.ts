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
  const root: LogicTreeNode = {
    ...rootData,
    value: rootData.value,
    count: 1,
    left: undefined,
    right: undefined,
  };

  for (let i = 1; i < data.length; i++) {
    const currentNode = {
      ...data[i],
      value: data[i].value,
      count: 1,
      left: undefined,
      right: undefined,
    };
    insertNodeLogic(root, currentNode);
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
  list.push({
    id: node.id,
    value: node.value,
    count: node.count,
  });
  flattenUniqueNodes(node.left, list);
  flattenUniqueNodes(node.right, list);
}

const generateFrame = (
  inputData: any[],
  statusMap: Record<string, Status>,
  description: string
): AnimationStep => {
  const root = buildBST(inputData);
  const uniqueData: any[] = [];
  flattenUniqueNodes(root || undefined, uniqueData);

  const treeElements = createTreeNodes(uniqueData, BST_LAYOUT);

  treeElements.forEach((el) => {
    if (el instanceof Node) {
      const status = statusMap[el.id] ? statusMap[el.id] : "inactive";
      el.setStatus(status);

      if (typeof (el as any).value === "number") {
        (el as any).value = Math.round((el as any).value);
      }

      const logicNode = uniqueData.find((d) => d.id === el.id);
      if (logicNode) {
        el.description = `Count: ${logicNode.count}`;
      }
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
  };
};

function runInsert(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  if (inputData.length === 0) return steps;
  const rawNewNode = inputData[inputData.length - 1];
  const newValue = Math.round(rawNewNode.value);
  const newNodeData = { ...rawNewNode, value: newValue };
  const oldData = inputData.slice(0, inputData.length - 1);
  if (oldData.length === 0) {
    steps.push(
      generateFrame(
        inputData,
        { [newNodeData.id]: "complete" },
        `樹為空，插入根節點 ${newValue}`
      )
    );
    return steps;
  }
  const root = buildBST(oldData);
  const statusMap: Record<string, Status> = {};
  steps.push(generateFrame(oldData, {}, `準備插入新節點：${newValue}`));
  let curr = root;
  while (curr) {
    statusMap[curr.id] = "target";
    steps.push(
      generateFrame(oldData, statusMap, `比較：${newValue} vs ${curr.value}`)
    );
    if (newValue === curr.value) {
      statusMap[curr.id] = "complete";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `數值 ${newValue} 已存在，計數器加 1`
        )
      );
      return steps;
    }
    if (newValue < curr.value) {
      if (curr.left) {
        statusMap[curr.left.id] = "prepare";
        steps.push(
          generateFrame(
            oldData,
            statusMap,
            `${newValue} < ${curr.value}，往左子樹尋找`
          )
        );
        delete statusMap[curr.left.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.left;
      } else {
        steps.push(
          generateFrame(
            oldData,
            statusMap,
            `${newValue} < ${curr.value}，且無左子節點，找到插入位置`
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
            `${newValue} >= ${curr.value}，往右子樹尋找`
          )
        );
        delete statusMap[curr.right.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.right;
      } else {
        steps.push(
          generateFrame(
            oldData,
            statusMap,
            `${newValue} >= ${curr.value}，且無右子節點，找到插入位置`
          )
        );
        break;
      }
    }
  }
  statusMap[newNodeData.id] = "complete";
  if (curr) statusMap[curr.id] = "unfinished";
  steps.push(generateFrame(inputData, statusMap, `插入節點 ${newValue} 完成`));
  return steps;
}

function runSearch(inputData: any[], targetValue: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};
  if (!root) {
    steps.push(generateFrame(inputData, {}, "樹為空"));
    return steps;
  }
  steps.push(generateFrame(inputData, {}, `開始搜尋：${targetValue}`));
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
        generateFrame(
          inputData,
          statusMap,
          `找到目標 ${targetValue} (Count: ${curr.count})`
        )
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
            `${targetValue} < ${curr.value} 往左`
          )
        );
        delete statusMap[curr.left.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.left;
      } else {
        steps.push(generateFrame(inputData, statusMap, "無左子節點"));
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
            `${targetValue} > ${curr.value} 往右`
          )
        );
        delete statusMap[curr.right.id];
        statusMap[curr.id] = "unfinished";
        curr = curr.right;
      } else {
        steps.push(generateFrame(inputData, statusMap, "無右子節點"));
        statusMap[curr.id] = "unfinished";
        break;
      }
    }
  }
  if (!found) steps.push(generateFrame(inputData, statusMap, "未找到"));
  return steps;
}

function runDelete(inputData: any[], targetValue: number): AnimationStep[] {
  targetValue = Math.round(targetValue);
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};

  if (!root) {
    steps.push(generateFrame(inputData, {}, "樹為空，無法刪除"));
    return steps;
  }

  steps.push(generateFrame(inputData, {}, `準備刪除節點：${targetValue}`));

  let curr: LogicTreeNode | undefined = root;
  let foundNode: LogicTreeNode | undefined = undefined;

  while (curr) {
    statusMap[curr.id] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `尋找刪除目標：${targetValue} vs ${curr.value}`
      )
    );

    if (targetValue === curr.value) {
      foundNode = curr;
      statusMap[curr.id] = "complete";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `找到目標節點 ${targetValue} (Count: ${curr.count})`
        )
      );
      break;
    }

    if (targetValue < curr.value) {
      if (curr.left) {
        statusMap[curr.left.id] = "prepare";
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${targetValue} < ${curr.value}，往左`
          )
        );
        delete statusMap[curr.left.id];
        statusMap[curr.id] = "unfinished";
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
            `${targetValue} > ${curr.value}，往右`
          )
        );
        delete statusMap[curr.right.id];
        statusMap[curr.id] = "unfinished";
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

  if (!foundNode) {
    steps.push(
      generateFrame(inputData, statusMap, `未找到數值 ${targetValue}，刪除失敗`)
    );
    return steps;
  }

  if (foundNode.count > 1) {
    const idx = inputData
      .slice()
      .reverse()
      .findIndex((d) => Math.round(d.value) === targetValue);
    const realIdx = inputData.length - 1 - idx;
    const newData = [...inputData];
    newData.splice(realIdx, 1);

    steps.push(
      generateFrame(
        newData,
        statusMap,
        `Count > 1，僅減少計數 (Count: ${foundNode.count} -> ${
          foundNode.count - 1
        })`
      )
    );
    return steps;
  }

  const targetId = foundNode.id;

  if (!foundNode.left && !foundNode.right) {
    statusMap[targetId] = "target";
    steps.push(
      generateFrame(inputData, statusMap, `檢查子節點：無 (葉子節點)，直接移除`)
    );

    const finalData = getBSTArrayAfterDelete(inputData, targetValue);
    steps.push(generateFrame(finalData, {}, `刪除完成`));
  } else if (!foundNode.left || !foundNode.right) {
    const child = foundNode.left ? foundNode.left : foundNode.right;
    const isLeftChild = !!foundNode.left;

    const intermediateData = inputData.map((d) => {
      if (d.id === targetId) {
        return { ...d, value: child!.value };
      }

      if (d.id === child!.id) {
        const epsilon = isLeftChild ? -0.0001 : 0.0001;
        return { ...d, value: child!.value + epsilon };
      }
      return d;
    });

    steps.push(
      generateFrame(
        intermediateData,
        statusMap,
        `將目標節點數值更新為 ${child!.value}`
      )
    );

    const finalData = getBSTArrayAfterDelete(inputData, targetValue);
    steps.push(
      generateFrame(finalData, {}, `移除原本的子節點 ${child!.value}，刪除完成`)
    );
  } else {
    statusMap[targetId] = "target";
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `檢查子節點：左右皆有。需尋找後繼者 (右子樹的最小值)`
      )
    );

    let successor = foundNode.right;

    statusMap[successor!.id] = "prepare";
    steps.push(
      generateFrame(inputData, statusMap, `進入右子樹 ${successor!.value}`)
    );
    delete statusMap[successor!.id];

    while (successor!.left) {
      statusMap[successor!.left.id] = "prepare";
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `往左找更小值 ${successor!.left.value}`
        )
      );
      delete statusMap[successor!.left.id];
      successor = successor!.left;
    }

    statusMap[successor!.id] = "complete";
    steps.push(
      generateFrame(inputData, statusMap, `鎖定後繼者: ${successor!.value}`)
    );

    const intermediateData = inputData.map((d) => {
      if (d.id === targetId) {
        return { ...d, value: successor!.value };
      }
      if (d.id === successor!.id) {
        return { ...d, value: successor!.value + 0.0001 };
      }
      return d;
    });

    steps.push(
      generateFrame(
        intermediateData,
        statusMap,
        `將目標節點 ${targetValue} 的值替換為 ${successor!.value}`
      )
    );

    const finalData = getBSTArrayAfterDelete(inputData, targetValue);
    steps.push(
      generateFrame(
        finalData,
        {},
        `移除原本的後繼者節點 ${successor!.value}，重組結構，刪除完成`
      )
    );
  }

  return steps;
}

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
function runFloor(inputData: any[], targetValue: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};
  if (!root) return steps;
  steps.push(generateFrame(inputData, {}, `尋找 Floor(${targetValue})`));
  let curr: LogicTreeNode | undefined = root;
  let floorNode: LogicTreeNode | null = null;
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
      if (floorNode) statusMap[floorNode.id] = "unfinished";
      statusMap[curr.id] = "complete";
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
      statusMap[curr.id] = "unfinished";
      curr = curr.left;
    } else {
      if (floorNode) statusMap[floorNode.id] = "unfinished";
      floorNode = curr;
      statusMap[curr.id] = "complete";
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
      if (ceilNode) statusMap[ceilNode.id] = "unfinished";
      ceilNode = curr;
      statusMap[curr.id] = "complete";
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
export function getBSTArrayAfterDelete(
  data: any[],
  targetValue: number
): any[] {
  targetValue = Math.round(targetValue);

  const root = buildBST(data);
  if (!root) return data;

  const findNode = (
    node: LogicTreeNode | undefined,
    val: number
  ): LogicTreeNode | undefined => {
    if (!node) return undefined;
    if (val === node.value) return node;
    return val < node.value
      ? findNode(node.left, val)
      : findNode(node.right, val);
  };

  const targetNode = findNode(root, targetValue);

  if (!targetNode) return data;
  if (targetNode.count > 1) {
    const idx = data
      .slice()
      .reverse()
      .findIndex((d) => Math.round(d.value) === targetValue);
    if (idx !== -1) {
      const realIdx = data.length - 1 - idx;
      const newData = [...data];
      newData.splice(realIdx, 1);
      return newData;
    }
    return data;
  }

  let idToRemove: string | null = null;
  let idToUpdateValue: string | null = null;
  let newValueForUpdate: number | null = null;

  if (!targetNode.left && !targetNode.right) {
    idToRemove = targetNode.id;
  } else if (!targetNode.left || !targetNode.right) {
    const child = targetNode.left ? targetNode.left : targetNode.right;
    idToUpdateValue = targetNode.id;
    newValueForUpdate = child!.value;
    idToRemove = child!.id;
  } else {
    let successor = targetNode.right;
    while (successor!.left) {
      successor = successor!.left;
    }

    idToUpdateValue = targetNode.id;
    newValueForUpdate = successor!.value;
    idToRemove = successor!.id;
  }

  let finalData = [...data];

  if (idToRemove) {
    finalData = finalData.filter((d) => d.id !== idToRemove);
  }

  if (idToUpdateValue !== null && newValueForUpdate !== null) {
    finalData = finalData.map((d) => {
      if (d.id === idToUpdateValue) {
        return { ...d, value: newValueForUpdate };
      }
      return d;
    });
  }

  return finalData;
}

function runLoad(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
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
  if (action?.type === "delete" || action?.mode === "DeleteValue") {
    return runDelete(inputData, action.index);
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
  steps.push(generateFrame(inputData, {}, "Binary Search Tree"));
  return steps;
}

export const BinarySearchTreeConfig: LevelImplementationConfig = {
  id: "bst",
  type: "dataStructure",
  name: "二元搜尋樹 (BST)",
  categoryName: "非線性表",
  description:
    "具有排序性質的二元樹，左子樹小於根，右子樹大於根，重複值以計數顯示",
  pseudoCode: `insert(node, value):
  if value == node.value:
    node.count++
  else if value < node.value:
    node.left = insert(node.left, value)
  else:
    node.right = insert(node.right, value)`,
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
  3. **重複值處理**：當數值相同時，不新增節點，而是增加該節點的計數器 (Count)。`,
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

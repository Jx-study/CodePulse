import { LevelImplementationConfig } from "@/types/implementation";
import { AnimationStep, CodeConfig } from "@/types";
import { createTreeNodes, getLinkKey, updateLinkStatus } from "./utils";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { linkStatus } from "@/modules/core/Render/D3Renderer";
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
  if (Number(newNode.value) === Number(root.value)) {
    root.count += 1;
    return;
  }
  if (Number(newNode.value) < Number(root.value)) {
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

const TAGS = {
  INS_INIT: "INS_INIT",
  INS_COMPARE: "INS_COMPARE",
  INS_EQUAL: "INS_EQUAL",
  INS_LEFT: "INS_LEFT",
  INS_RIGHT: "INS_RIGHT",
  INS_PLACE_LEFT: "INS_PLACE_LEFT",
  INS_PLACE_RIGHT: "INS_PLACE_RIGHT",
  INS_DONE_LEFT: "INS_DONE_LEFT",
  INS_DONE_RIGHT: "INS_DONE_RIGHT",

  SRCH_INIT: "SRCH_INIT",
  SRCH_EMPTY: "SRCH_EMPTY",
  SRCH_COMPARE: "SRCH_COMPARE",
  SRCH_FOUND: "SRCH_FOUND",
  SRCH_LEFT: "SRCH_LEFT",
  SRCH_RIGHT: "SRCH_RIGHT",
  SRCH_NOT_FOUND: "SRCH_NOT_FOUND",

  DEL_INIT: "DEL_INIT",
  DEL_EMPTY: "DEL_EMPTY",
  DEL_SEARCH: "DEL_SEARCH",
  DEL_FOUND: "DEL_FOUND",
  DEL_LEFT: "DEL_LEFT",
  DEL_RIGHT: "DEL_RIGHT",
  DEL_NOT_FOUND: "DEL_NOT_FOUND",
  DEL_COUNT_DEC: "DEL_COUNT_DEC",
  DEL_LEAF: "DEL_LEAF",
  DEL_LEAF_REMOVE: "DEL_LEAF_REMOVE",
  DEL_ONE_CHILD_REPLACE: "DEL_ONE_CHILD_REPLACE",
  DEL_ONE_CHILD_DONE: "DEL_ONE_CHILD_DONE",
  DEL_TWO_CHILD: "DEL_TWO_CHILD",
  DEL_SUCCESSOR_FIND: "DEL_SUCCESSOR_FIND",
  DEL_SUCCESSOR_REPLACE: "DEL_SUCCESSOR_REPLACE",
  DEL_SUCCESSOR_REMOVE: "DEL_SUCCESSOR_REMOVE",

  MIN_INIT: "MIN_INIT",
  MIN_TRAVERSE: "MIN_TRAVERSE",
  MIN_FOUND: "MIN_FOUND",

  MAX_INIT: "MAX_INIT",
  MAX_TRAVERSE: "MAX_TRAVERSE",
  MAX_FOUND: "MAX_FOUND",

  FLOOR_INIT: "FLOOR_INIT",
  FLOOR_COMPARE: "FLOOR_COMPARE",
  FLOOR_LEFT: "FLOOR_LEFT",
  FLOOR_RIGHT: "FLOOR_RIGHT",
  FLOOR_EQUAL: "FLOOR_EQUAL",
  FLOOR_FOUND: "FLOOR_FOUND",
  FLOOR_NOT_FOUND: "FLOOR_NOT_FOUND",

  CEIL_INIT: "CEIL_INIT",
  CEIL_COMPARE: "CEIL_COMPARE",
  CEIL_EQUAL: "CEIL_EQUAL",
  CEIL_LEFT: "CEIL_LEFT",
  CEIL_RIGHT: "CEIL_RIGHT",
  CEIL_FOUND: "CEIL_FOUND",
  CEIL_NOT_FOUND: "CEIL_NOT_FOUND",
};

const generateFrame = (
  inputData: any[],
  statusMap: Record<string, Status>,
  description: string,
  actionTag?: string,
  variables?: Record<string, string | number | boolean | null>,
  linkStatusMap: Record<string, linkStatus> = {},
): AnimationStep => {
  const root = buildBST(inputData);
  const uniqueData: any[] = [];
  flattenUniqueNodes(root || undefined, uniqueData);

  const treeElements = createTreeNodes(uniqueData, BST_LAYOUT);

  treeElements.forEach((el) => {
    if (el instanceof Node) {
      const status = statusMap[el.id] ? statusMap[el.id] : Status.Inactive;
      el.setStatus(status);

      if (el.value !== '') {
        el.value = String(Math.round(Number(el.value)));
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

  const links: { sourceId: string; targetId: string; status?: linkStatus }[] =
    [];

  treeElements.forEach((source) => {
    if (source instanceof Node) {
      source.pointers.forEach((target) => {
        const key = getLinkKey(source.id, target.id);
        links.push({
          sourceId: source.id,
          targetId: target.id,
          status: linkStatusMap[key],
        });
      });
    }
  });

  return {
    stepNumber: 0,
    description,
    elements: [...treeElements],
    links,
    actionTag,
    variables,
  };
};

function runInsert(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  if (inputData.length === 0) return steps;
  const rawNewNode = inputData[inputData.length - 1];
  const newValue = Math.round(rawNewNode.value);
  const newNodeData = { ...rawNewNode, value: newValue };
  const oldData = inputData.slice(0, inputData.length - 1);

  const linkStatusMap: Record<string, linkStatus> = {};
  const pathLinks: { u: string; v: string }[] = [];

  const getVars = (curr?: LogicTreeNode | null) => ({
    newValue,
    curr: curr?.value ?? null,
  });

  if (oldData.length === 0) {
    steps.push(
      generateFrame(
        inputData,
        { [newNodeData.id]: Status.Complete },
        `樹為空，插入根節點 ${newValue}`,
        TAGS.INS_INIT,
        { ...getVars(), curr: null },
        { ...linkStatusMap },
      ),
    );
    return steps;
  }
  const root = buildBST(oldData);
  const statusMap: Record<string, Status> = {};
  steps.push(
    generateFrame(
      oldData,
      {},
      `準備插入新節點：${newValue}`,
      TAGS.INS_INIT,
      getVars(root),
      { ...linkStatusMap },
    ),
  );

  let curr = root;
  let insertedAsLeftChild = false;

  while (curr) {
    statusMap[curr.id] = Status.Target;
    steps.push(
      generateFrame(
        oldData,
        statusMap,
        `比較：${newValue} vs ${curr.value}`,
        TAGS.INS_COMPARE,
        getVars(curr),
        { ...linkStatusMap },
      ),
    );
    if (newValue === curr.value) {
      statusMap[curr.id] = Status.Complete;
      pathLinks.forEach(({ u, v }) =>
        updateLinkStatus(linkStatusMap, u, v, "complete", true),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `數值 ${newValue} 已存在，計數器加 1`,
          TAGS.INS_EQUAL,
          { ...getVars(curr), count: curr.count },
          { ...linkStatusMap },
        ),
      );
      return steps;
    }
    if (newValue < curr.value) {
      if (curr.left) {
        statusMap[curr.left.id] = Status.Prepare;
        updateLinkStatus(linkStatusMap, curr.id, curr.left.id, "path", true);
        pathLinks.push({ u: curr.id, v: curr.left.id });
        steps.push(
          generateFrame(
            oldData,
            statusMap,
            `${newValue} < ${curr.value}，往左子樹尋找`,
            TAGS.INS_LEFT,
            getVars(curr),
            { ...linkStatusMap },
          ),
        );
        delete statusMap[curr.left.id];
        statusMap[curr.id] = Status.Unfinished;
        curr = curr.left;
      } else {
        insertedAsLeftChild = true;
        steps.push(
          generateFrame(
            oldData,
            statusMap,
            `${newValue} < ${curr.value}，且無左子節點，找到插入位置`,
            TAGS.INS_PLACE_LEFT,
            getVars(curr),
            { ...linkStatusMap },
          ),
        );
        break;
      }
    } else {
      if (curr.right) {
        statusMap[curr.right.id] = Status.Prepare;
        updateLinkStatus(linkStatusMap, curr.id, curr.right.id, "path", true);
        pathLinks.push({ u: curr.id, v: curr.right.id });
        steps.push(
          generateFrame(
            oldData,
            statusMap,
            `${newValue} >= ${curr.value}，往右子樹尋找`,
            TAGS.INS_RIGHT,
            getVars(curr),
            { ...linkStatusMap },
          ),
        );
        delete statusMap[curr.right.id];
        statusMap[curr.id] = Status.Unfinished;
        curr = curr.right;
      } else {
        insertedAsLeftChild = false;
        steps.push(
          generateFrame(
            oldData,
            statusMap,
            `${newValue} >= ${curr.value}，且無右子節點，找到插入位置`,
            TAGS.INS_PLACE_RIGHT,
            getVars(curr),
            { ...linkStatusMap },
          ),
        );
        break;
      }
    }
  }
  statusMap[newNodeData.id] = Status.Complete;
  if (curr) {
    statusMap[curr.id] = Status.Unfinished;
    pathLinks.forEach(({ u, v }) =>
      updateLinkStatus(linkStatusMap, u, v, "complete", true),
    );
    updateLinkStatus(linkStatusMap, curr.id, newNodeData.id, "complete", true);
  }
  steps.push(
    generateFrame(
      inputData,
      statusMap,
      `插入節點 ${newValue} 完成`,
      insertedAsLeftChild ? TAGS.INS_DONE_LEFT : TAGS.INS_DONE_RIGHT,
      getVars(curr ?? null),
      { ...linkStatusMap },
    ),
  );
  return steps;
}

function runSearch(inputData: any[], targetValue: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, linkStatus> = {};
  const searchPathLinks: { u: string; v: string }[] = [];

  const getVars = (curr?: LogicTreeNode | null, found?: boolean) => ({
    target: targetValue,
    curr: curr?.value ?? null,
    found: found ?? false,
  });

  if (!root) {
    steps.push(
      generateFrame(
        inputData,
        {},
        "樹為空",
        TAGS.SRCH_EMPTY,
        getVars(null, false),
        { ...linkStatusMap },
      ),
    );
    return steps;
  }
  steps.push(
    generateFrame(
      inputData,
      {},
      `開始搜尋：${targetValue}`,
      TAGS.SRCH_INIT,
      getVars(root),
      { ...linkStatusMap },
    ),
  );

  let curr: LogicTreeNode | undefined = root;
  let found = false;

  while (curr) {
    statusMap[curr.id] = Status.Target;
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `比較：${targetValue} vs ${curr.value}`,
        TAGS.SRCH_COMPARE,
        getVars(curr),
        { ...linkStatusMap },
      ),
    );

    if (targetValue === curr.value) {
      statusMap[curr.id] = Status.Complete;
      searchPathLinks.forEach(({ u, v }) => {
        updateLinkStatus(linkStatusMap, u, v, "complete", true);
      });
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `找到目標 ${targetValue} (Count: ${curr.count})`,
          TAGS.SRCH_FOUND,
          getVars(curr, true),
          { ...linkStatusMap },
        ),
      );
      found = true;
      break;
    } else if (targetValue < curr.value) {
      if (curr.left) {
        statusMap[curr.left.id] = Status.Prepare;
        updateLinkStatus(linkStatusMap, curr.id, curr.left.id, "path", true);
        searchPathLinks.push({ u: curr.id, v: curr.left.id });
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${targetValue} < ${curr.value} 往左`,
            TAGS.SRCH_LEFT,
            getVars(curr),
            { ...linkStatusMap },
          ),
        );
        delete statusMap[curr.left.id];
        statusMap[curr.id] = Status.Unfinished;
        curr = curr.left;
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            "無左子節點",
            TAGS.SRCH_LEFT,
            getVars(curr),
            { ...linkStatusMap },
          ),
        );
        statusMap[curr.id] = Status.Unfinished;
        break;
      }
    } else {
      if (curr.right) {
        statusMap[curr.right.id] = Status.Prepare;
        updateLinkStatus(linkStatusMap, curr.id, curr.right.id, "path", true);
        searchPathLinks.push({ u: curr.id, v: curr.right.id });
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${targetValue} > ${curr.value} 往右`,
            TAGS.SRCH_RIGHT,
            getVars(curr),
            { ...linkStatusMap },
          ),
        );
        delete statusMap[curr.right.id];
        statusMap[curr.id] = Status.Unfinished;
        curr = curr.right;
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            "無右子節點",
            TAGS.SRCH_RIGHT,
            getVars(curr),
            { ...linkStatusMap },
          ),
        );
        statusMap[curr.id] = Status.Unfinished;
        break;
      }
    }
  }
  if (!found)
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        "未找到",
        TAGS.SRCH_NOT_FOUND,
        getVars(null, false),
        { ...linkStatusMap },
      ),
    );
  return steps;
}

function runDelete(inputData: any[], targetValue: number): AnimationStep[] {
  targetValue = Math.round(targetValue);
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, linkStatus> = {};
  const pathLinks: { u: string; v: string }[] = [];
  const successorPathLinks: { u: string; v: string }[] = [];

  const getVars = (
    curr?: LogicTreeNode | null,
    foundNode?: LogicTreeNode | null,
    successor?: LogicTreeNode | null,
  ) => ({
    target: targetValue,
    curr: curr?.value ?? null,
    foundNode: foundNode?.value ?? null,
    successor: successor?.value ?? null,
  });

  if (!root) {
    steps.push(
      generateFrame(
        inputData,
        {},
        "樹為空，無法刪除",
        TAGS.DEL_EMPTY,
        getVars(null),
        { ...linkStatusMap },
      ),
    );
    return steps;
  }

  steps.push(
    generateFrame(
      inputData,
      {},
      `準備刪除節點：${targetValue}`,
      TAGS.DEL_INIT,
      getVars(root),
      { ...linkStatusMap },
    ),
  );

  let curr: LogicTreeNode | undefined = root;
  let foundNode: LogicTreeNode | undefined = undefined;

  while (curr) {
    statusMap[curr.id] = Status.Target;
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `尋找刪除目標：${targetValue} vs ${curr.value}`,
        TAGS.DEL_SEARCH,
        getVars(curr),
        { ...linkStatusMap },
      ),
    );

    if (targetValue === curr.value) {
      foundNode = curr;
      statusMap[curr.id] = Status.Complete;
      pathLinks.forEach(({ u, v }) =>
        updateLinkStatus(linkStatusMap, u, v, "complete", true),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `找到目標節點 ${targetValue} (Count: ${curr.count})`,
          TAGS.DEL_FOUND,
          getVars(curr, curr),
          { ...linkStatusMap },
        ),
      );
      break;
    }

    if (targetValue < curr.value) {
      if (curr.left) {
        statusMap[curr.left.id] = Status.Prepare;
        updateLinkStatus(linkStatusMap, curr.id, curr.left.id, "path", true);
        pathLinks.push({ u: curr.id, v: curr.left.id });
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${targetValue} < ${curr.value}，往左`,
            TAGS.DEL_LEFT,
            getVars(curr),
            { ...linkStatusMap },
          ),
        );
        delete statusMap[curr.left.id];
        statusMap[curr.id] = Status.Unfinished;
        curr = curr.left;
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${targetValue} < ${curr.value}，但無左子節點`,
            TAGS.DEL_LEFT,
            getVars(curr),
            { ...linkStatusMap },
          ),
        );
        statusMap[curr.id] = Status.Unfinished;
        break;
      }
    } else {
      if (curr.right) {
        statusMap[curr.right.id] = Status.Prepare;
        updateLinkStatus(linkStatusMap, curr.id, curr.right.id, "path", true);
        pathLinks.push({ u: curr.id, v: curr.right.id });
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${targetValue} > ${curr.value}，往右`,
            TAGS.DEL_RIGHT,
            getVars(curr),
            { ...linkStatusMap },
          ),
        );
        delete statusMap[curr.right.id];
        statusMap[curr.id] = Status.Unfinished;
        curr = curr.right;
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${targetValue} > ${curr.value}，但無右子節點`,
            TAGS.DEL_RIGHT,
            getVars(curr),
            { ...linkStatusMap },
          ),
        );
        statusMap[curr.id] = Status.Unfinished;
        break;
      }
    }
  }

  if (!foundNode) {
    pathLinks.forEach(({ u, v }) =>
      updateLinkStatus(linkStatusMap, u, v, "path", true),
    );

    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `未找到數值 ${targetValue}，刪除失敗`,
        TAGS.DEL_NOT_FOUND,
        getVars(null),
        { ...linkStatusMap },
      ),
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
        })`,
        TAGS.DEL_COUNT_DEC,
        { ...getVars(null, foundNode), count: foundNode.count - 1 },
        { ...linkStatusMap },
      ),
    );
    return steps;
  }

  const targetId = foundNode.id;

  if (!foundNode.left && !foundNode.right) {
    statusMap[targetId] = Status.Target;
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `檢查子節點：無 (葉子節點)，直接移除`,
        TAGS.DEL_LEAF,
        getVars(null, foundNode),
        { ...linkStatusMap },
      ),
    );

    const finalData = getBSTArrayAfterDelete(inputData, targetValue);
    steps.push(
      generateFrame(
        finalData,
        {},
        `刪除完成`,
        TAGS.DEL_LEAF_REMOVE,
        getVars(),
        { ...linkStatusMap },
      ),
    );
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

    updateLinkStatus(linkStatusMap, targetId, child!.id, "visited", true);

    steps.push(
      generateFrame(
        intermediateData,
        statusMap,
        `將目標節點數值更新為 ${child!.value}`,
        TAGS.DEL_ONE_CHILD_REPLACE,
        getVars(null, foundNode, child!),
        { ...linkStatusMap },
      ),
    );

    const finalData = getBSTArrayAfterDelete(inputData, targetValue);
    steps.push(
      generateFrame(
        finalData,
        {},
        `移除原本的子節點 ${child!.value}，刪除完成`,
        TAGS.DEL_ONE_CHILD_DONE,
        getVars(),
        { ...linkStatusMap },
      ),
    );
  } else {
    statusMap[targetId] = Status.Target;
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `檢查子節點：左右皆有。需尋找後繼者 (右子樹的最小值)`,
        TAGS.DEL_TWO_CHILD,
        getVars(null, foundNode),
        { ...linkStatusMap },
      ),
    );

    let successor = foundNode.right;

    statusMap[successor!.id] = Status.Prepare;
    updateLinkStatus(linkStatusMap, foundNode.id, successor!.id, "path", true);
    successorPathLinks.push({ u: foundNode.id, v: successor!.id });
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `進入右子樹 ${successor!.value}`,
        TAGS.DEL_SUCCESSOR_FIND,
        getVars(null, foundNode, successor),
        { ...linkStatusMap },
      ),
    );
    delete statusMap[successor!.id];

    while (successor!.left) {
      statusMap[successor!.left.id] = Status.Prepare;
      updateLinkStatus(
        linkStatusMap,
        successor!.id,
        successor!.left.id,
        "path",
        true,
      );
      successorPathLinks.push({ u: successor!.id, v: successor!.left.id });
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `往左找更小值 ${successor!.left.value}`,
          TAGS.DEL_SUCCESSOR_FIND,
          getVars(null, foundNode, successor),
          { ...linkStatusMap },
        ),
      );
      delete statusMap[successor!.left.id];
      successor = successor!.left;
    }

    statusMap[successor!.id] = Status.Complete;
    successorPathLinks.forEach(({ u, v }) =>
      updateLinkStatus(linkStatusMap, u, v, "complete", true),
    );
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `鎖定後繼者: ${successor!.value}`,
        TAGS.DEL_SUCCESSOR_FIND,
        getVars(null, foundNode, successor),
        { ...linkStatusMap },
      ),
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
        `將目標節點 ${targetValue} 的值替換為 ${successor!.value}`,
        TAGS.DEL_SUCCESSOR_REPLACE,
        getVars(null, foundNode, successor),
        { ...linkStatusMap },
      ),
    );

    const finalData = getBSTArrayAfterDelete(inputData, targetValue);
    steps.push(
      generateFrame(
        finalData,
        {},
        `移除原本的後繼者節點 ${successor!.value}，重組結構，刪除完成`,
        TAGS.DEL_SUCCESSOR_REMOVE,
        getVars(),
        {},
      ),
    );
  }

  return steps;
}

function runMin(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, linkStatus> = {};
  const pathLinks: { u: string; v: string }[] = [];

  if (!root) return steps;

  const getVars = (curr?: LogicTreeNode | null) => ({
    curr: curr?.value ?? null,
  });

  steps.push(
    generateFrame(
      inputData,
      {},
      "尋找最小值 (Min)：一路向左",
      TAGS.MIN_INIT,
      getVars(root),
      { ...linkStatusMap },
    ),
  );
  let curr: LogicTreeNode = root;
  while (curr.left) {
    statusMap[curr.id] = Status.Target;
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `當前節點 ${curr.value}，還有左子節點`,
        TAGS.MIN_TRAVERSE,
        getVars(curr),
        { ...linkStatusMap },
      ),
    );
    statusMap[curr.left.id] = Status.Prepare;
    updateLinkStatus(linkStatusMap, curr.id, curr.left.id, "path", true);
    pathLinks.push({ u: curr.id, v: curr.left.id });
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        "往左移動",
        TAGS.MIN_TRAVERSE,
        getVars(curr),
        { ...linkStatusMap },
      ),
    );
    delete statusMap[curr.left.id];
    statusMap[curr.id] = Status.Unfinished;
    curr = curr.left;
  }
  statusMap[curr.id] = Status.Complete;
  pathLinks.forEach(({ u, v }) => {
    updateLinkStatus(linkStatusMap, u, v, "complete", true);
  });
  steps.push(
    generateFrame(
      inputData,
      statusMap,
      `抵達最左節點 ${curr.value}，即為最小值`,
      TAGS.MIN_FOUND,
      getVars(curr),
      { ...linkStatusMap },
    ),
  );
  return steps;
}

function runMax(inputData: any[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, linkStatus> = {};
  const pathLinks: { u: string; v: string }[] = [];

  if (!root) return steps;

  const getVars = (curr?: LogicTreeNode | null) => ({
    curr: curr?.value ?? null,
  });

  steps.push(
    generateFrame(
      inputData,
      {},
      "尋找最大值 (Max)：一路向右",
      TAGS.MAX_INIT,
      getVars(root),
      { ...linkStatusMap },
    ),
  );
  let curr: LogicTreeNode = root;
  while (curr.right) {
    statusMap[curr.id] = Status.Target;
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `當前節點 ${curr.value}，還有右子節點`,
        TAGS.MAX_TRAVERSE,
        getVars(curr),
        { ...linkStatusMap },
      ),
    );
    statusMap[curr.right.id] = Status.Prepare;
    updateLinkStatus(linkStatusMap, curr.id, curr.right.id, "path", true);
    pathLinks.push({ u: curr.id, v: curr.right.id });
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        "往右移動",
        TAGS.MAX_TRAVERSE,
        getVars(curr),
        { ...linkStatusMap },
      ),
    );
    delete statusMap[curr.right.id];
    statusMap[curr.id] = Status.Unfinished;
    curr = curr.right;
  }
  statusMap[curr.id] = Status.Complete;
  pathLinks.forEach(({ u, v }) => {
    updateLinkStatus(linkStatusMap, u, v, "complete", true);
  });
  steps.push(
    generateFrame(
      inputData,
      statusMap,
      `抵達最右節點 ${curr.value}，即為最大值`,
      TAGS.MAX_FOUND,
      getVars(curr),
      { ...linkStatusMap },
    ),
  );
  return steps;
}

function runFloor(inputData: any[], targetValue: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, linkStatus> = {};
  const pathLinks: { u: string; v: string }[] = [];

  if (!root) return steps;

  const getVars = (curr?: LogicTreeNode | null, floorVal?: number | null) => ({
    target: targetValue,
    curr: curr?.value ?? null,
    floor: floorVal ?? null,
  });

  steps.push(
    generateFrame(
      inputData,
      {},
      `尋找 Floor(${targetValue})`,
      TAGS.FLOOR_INIT,
      getVars(root),
      { ...linkStatusMap },
    ),
  );

  let curr: LogicTreeNode | undefined = root;
  let floorNode: LogicTreeNode | null = null;

  while (curr) {
    statusMap[curr.id] = Status.Target;
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `比較：${targetValue} vs ${curr.value}`,
        TAGS.FLOOR_COMPARE,
        getVars(curr, floorNode?.value ?? null),
        { ...linkStatusMap },
      ),
    );
    if (curr.value === targetValue) {
      if (floorNode) statusMap[floorNode.id] = Status.Unfinished;
      statusMap[curr.id] = Status.Complete;
      pathLinks.forEach(({ u, v }) =>
        updateLinkStatus(linkStatusMap, u, v, "complete", true),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `找到相等值，Floor 為 ${curr.value}`,
          TAGS.FLOOR_EQUAL,
          getVars(curr, curr.value),
          { ...linkStatusMap },
        ),
      );
      return steps;
    }

    if (curr.value > targetValue) {
      if (curr.left) {
        statusMap[curr.left.id] = Status.Prepare;
        updateLinkStatus(linkStatusMap, curr.id, curr.left.id, "path", true);
        pathLinks.push({ u: curr.id, v: curr.left.id });
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} > ${targetValue}，往左尋找`,
            TAGS.FLOOR_LEFT,
            getVars(curr, floorNode?.value ?? null),
            { ...linkStatusMap },
          ),
        );
        delete statusMap[curr.left.id];
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} > ${targetValue}，無左子樹`,
            TAGS.FLOOR_LEFT,
            getVars(curr, floorNode?.value ?? null),
            { ...linkStatusMap },
          ),
        );
      }
      statusMap[curr.id] = Status.Unfinished;
      curr = curr.left;
    } else {
      if (floorNode) statusMap[floorNode.id] = Status.Unfinished;
      floorNode = curr;
      statusMap[curr.id] = Status.Complete;
      if (curr.right) {
        statusMap[curr.right.id] = Status.Prepare;
        updateLinkStatus(linkStatusMap, curr.id, curr.right.id, "path", true);
        pathLinks.push({ u: curr.id, v: curr.right.id });
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} < ${targetValue}，暫定 Floor 為 ${curr.value}，往右尋找更大的`,
            TAGS.FLOOR_RIGHT,
            getVars(curr, curr.value),
            { ...linkStatusMap },
          ),
        );
        delete statusMap[curr.right.id];
        curr = curr.right;
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} < ${targetValue}，無右子樹`,
            TAGS.FLOOR_RIGHT,
            getVars(curr, curr.value),
            { ...linkStatusMap },
          ),
        );
        break;
      }
    }
  }
  if (floorNode) {
    pathLinks.forEach(({ u, v }) =>
      updateLinkStatus(linkStatusMap, u, v, "complete", true),
    );
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `搜尋結束，Floor 為 ${floorNode.value}`,
        TAGS.FLOOR_FOUND,
        getVars(null, floorNode.value),
        { ...linkStatusMap },
      ),
    );
  } else {
    pathLinks.forEach(({ u, v }) =>
      updateLinkStatus(linkStatusMap, u, v, "visited", true),
    );
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `搜尋結束，未找到小於等於 ${targetValue} 的值`,
        TAGS.FLOOR_NOT_FOUND,
        getVars(null),
        { ...linkStatusMap },
      ),
    );
  }
  return steps;
}

function runCeil(inputData: any[], targetValue: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const root = buildBST(inputData);
  const statusMap: Record<string, Status> = {};
  const linkStatusMap: Record<string, linkStatus> = {};
  const pathLinks: { u: string; v: string }[] = [];

  if (!root) return steps;

  const getVars = (curr?: LogicTreeNode | null, ceilVal?: number | null) => ({
    target: targetValue,
    curr: curr?.value ?? null,
    ceil: ceilVal ?? null,
  });

  steps.push(
    generateFrame(
      inputData,
      {},
      `尋找 Ceil(${targetValue})`,
      TAGS.CEIL_INIT,
      getVars(root),
      { ...linkStatusMap },
    ),
  );
  let curr: LogicTreeNode | undefined = root;
  let ceilNode: LogicTreeNode | null = null;
  while (curr) {
    statusMap[curr.id] = Status.Target;
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `比較：${targetValue} vs ${curr.value}`,
        TAGS.CEIL_COMPARE,
        getVars(curr, ceilNode?.value ?? null),
        { ...linkStatusMap },
      ),
    );
    if (curr.value === targetValue) {
      if (ceilNode) statusMap[ceilNode.id] = Status.Unfinished;
      statusMap[curr.id] = Status.Complete;
      pathLinks.forEach(({ u, v }) =>
        updateLinkStatus(linkStatusMap, u, v, "complete", true),
      );
      steps.push(
        generateFrame(
          inputData,
          statusMap,
          `找到相等值，Ceil 為 ${curr.value}`,
          TAGS.CEIL_EQUAL,
          getVars(curr, curr.value),
          { ...linkStatusMap },
        ),
      );
      return steps;
    }
    if (curr.value < targetValue) {
      if (curr.right) {
        statusMap[curr.right.id] = Status.Prepare;
        updateLinkStatus(linkStatusMap, curr.id, curr.right.id, "path", true);
        pathLinks.push({ u: curr.id, v: curr.right.id });
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} < ${targetValue}，往右尋找`,
            TAGS.CEIL_RIGHT,
            getVars(curr, ceilNode?.value ?? null),
            { ...linkStatusMap },
          ),
        );
        delete statusMap[curr.right.id];
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} < ${targetValue}，無右子樹`,
            TAGS.CEIL_RIGHT,
            getVars(curr, ceilNode?.value ?? null),
            { ...linkStatusMap },
          ),
        );
      }
      statusMap[curr.id] = Status.Unfinished;
      curr = curr.right;
    } else {
      if (ceilNode) statusMap[ceilNode.id] = Status.Unfinished;
      ceilNode = curr;
      statusMap[curr.id] = Status.Complete;
      if (curr.left) {
        statusMap[curr.left.id] = Status.Prepare;
        updateLinkStatus(linkStatusMap, curr.id, curr.left.id, "path", true);
        pathLinks.push({ u: curr.id, v: curr.left.id });
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} > ${targetValue}，暫定 Ceil 為 ${curr.value}，往左尋找更小的`,
            TAGS.CEIL_LEFT,
            getVars(curr, curr.value),
            { ...linkStatusMap },
          ),
        );
        delete statusMap[curr.left.id];
        curr = curr.left;
      } else {
        steps.push(
          generateFrame(
            inputData,
            statusMap,
            `${curr.value} > ${targetValue}，無左子樹`,
            TAGS.CEIL_LEFT,
            getVars(curr, curr.value),
            { ...linkStatusMap },
          ),
        );
        break;
      }
    }
  }
  if (ceilNode) {
    pathLinks.forEach(({ u, v }) =>
      updateLinkStatus(linkStatusMap, u, v, "complete", true),
    );
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `搜尋結束，Ceil 為 ${ceilNode.value}`,
        TAGS.CEIL_FOUND,
        getVars(null, ceilNode.value),
        { ...linkStatusMap },
      ),
    );
  } else {
    pathLinks.forEach(({ u, v }) =>
      updateLinkStatus(linkStatusMap, u, v, "visited", true),
    );
    steps.push(
      generateFrame(
        inputData,
        statusMap,
        `搜尋結束，未找到大於等於 ${targetValue} 的值`,
        TAGS.CEIL_NOT_FOUND,
        getVars(null),
        { ...linkStatusMap },
      ),
    );
  }
  return steps;
}
export function getBSTArrayAfterDelete(
  data: any[],
  targetValue: number,
): any[] {
  targetValue = Math.round(targetValue);

  const root = buildBST(data);
  if (!root) return data;

  const findNode = (
    node: LogicTreeNode | undefined,
    val: number,
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
    generateFrame(
      inputData,
      {},
      `資料載入完成 (節點數: ${inputData.length})`,
      undefined,
      { nodeCount: inputData.length },
    ),
  );
  return steps;
}

export function createBinarySearchTreeAnimationSteps(
  inputData: any[],
  action?: any,
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
  steps.push(
    generateFrame(inputData, {}, "Binary Search Tree", undefined, {
      status: "idle",
      nodeCount: inputData.length,
    }),
  );
  return steps;
}

const binarySearchTreeCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure Insert(root, value):
  curr ← root
  While curr ≠ Null:
    If value = curr.value Then count++; Return
    If value < curr.value Then
      If curr.left ≠ Null Then curr ← curr.left
      Else curr.left ← newNode(value); Return
    Else
      If curr.right ≠ Null Then curr ← curr.right
      Else curr.right ← newNode(value); Return

Procedure Search(root, target):
  If root is Null Then Return Not Found
  curr ← root
  While curr ≠ Null:
    If target = curr.value Then Return Found
    If target < curr.value Then curr ← curr.left (if exists)
    Else curr ← curr.right (if exists)
  Return Not Found

Procedure Delete(root, target):
  node ← Search(root, target)
  If node is Null Then Return

  If node.count > 1 Then
    node.count ← node.count - 1
    Return

  If node has no children Then
    Remove node
  Else If node has only one child Then
    Replace node with its child
  Else
    successor ← Min(node.right)
    node.value ← successor.value
    Delete successor node from node.right

Procedure Min(root):
  curr ← root
  While curr.left ≠ Null: curr ← curr.left
  Return curr.value

Procedure Max(root):
  curr ← root
  While curr.right ≠ Null: curr ← curr.right
  Return curr.value

Procedure Floor(root, target):
  curr ← root; floor ← Null
  While curr ≠ Null:
    If curr.value = target Then Return curr.value
    If curr.value > target Then curr ← curr.left
    Else floor ← curr; curr ← curr.right
  Return floor

Procedure Ceil(root, target):
  curr ← root; ceil ← Null
  While curr ≠ Null:
    If curr.value = target Then Return curr.value
    If curr.value < target Then curr ← curr.right
    Else ceil ← curr; curr ← curr.left
  Return ceil`,
    mappings: {
      [TAGS.INS_INIT]: [1, 2],
      [TAGS.INS_COMPARE]: [3, 4, 5, 8],
      [TAGS.INS_EQUAL]: [4],
      [TAGS.INS_LEFT]: [5, 6],
      [TAGS.INS_RIGHT]: [8, 9],
      [TAGS.INS_PLACE_LEFT]: [7],
      [TAGS.INS_PLACE_RIGHT]: [10],

      [TAGS.SRCH_INIT]: [12, 14],
      [TAGS.SRCH_EMPTY]: [13],
      [TAGS.SRCH_COMPARE]: [15, 16],
      [TAGS.SRCH_FOUND]: [16],
      [TAGS.SRCH_LEFT]: [17],
      [TAGS.SRCH_RIGHT]: [18],
      [TAGS.SRCH_NOT_FOUND]: [19],

      [TAGS.DEL_INIT]: [21, 22],
      [TAGS.DEL_EMPTY]: [23],

      [TAGS.DEL_SEARCH]: [15, 16],
      [TAGS.DEL_FOUND]: [16, 22],
      [TAGS.DEL_LEFT]: [17],
      [TAGS.DEL_RIGHT]: [18],
      [TAGS.DEL_NOT_FOUND]: [19, 23, 24],

      [TAGS.DEL_COUNT_DEC]: [25, 26, 27],

      [TAGS.DEL_LEAF]: [29, 30],
      [TAGS.DEL_LEAF_REMOVE]: [30],
      [TAGS.DEL_ONE_CHILD_REPLACE]: [31, 32],
      [TAGS.DEL_ONE_CHILD_DONE]: [32],

      [TAGS.DEL_TWO_CHILD]: [33, 34],
      [TAGS.DEL_SUCCESSOR_FIND]: [34, 41],
      [TAGS.DEL_SUCCESSOR_REPLACE]: [35],
      [TAGS.DEL_SUCCESSOR_REMOVE]: [36],

      [TAGS.MIN_INIT]: [38, 39],
      [TAGS.MIN_TRAVERSE]: [40],
      [TAGS.MIN_FOUND]: [41],

      [TAGS.MAX_INIT]: [43, 44],
      [TAGS.MAX_TRAVERSE]: [45],
      [TAGS.MAX_FOUND]: [46],

      [TAGS.FLOOR_INIT]: [48, 49],
      [TAGS.FLOOR_EQUAL]: [51],
      [TAGS.FLOOR_COMPARE]: [50, 51, 52, 53],
      [TAGS.FLOOR_LEFT]: [52],
      [TAGS.FLOOR_RIGHT]: [53],
      [TAGS.FLOOR_FOUND]: [54],
      [TAGS.FLOOR_NOT_FOUND]: [54],

      [TAGS.CEIL_INIT]: [56, 57],
      [TAGS.CEIL_COMPARE]: [58, 59, 60, 61],
      [TAGS.CEIL_EQUAL]: [59],
      [TAGS.CEIL_LEFT]: [61],
      [TAGS.CEIL_RIGHT]: [60],
      [TAGS.CEIL_FOUND]: [62],
      [TAGS.CEIL_NOT_FOUND]: [62],
    },
  },
  python: {
    content: `class Node:
    def __init__(self, value):
        self.value = value
        self.count = 1
        self.left = None
        self.right = None

def insert(root, value):
    if not root: return Node(value)
    curr = root
    while curr:
        if value == curr.value:
            curr.count += 1
            return root
        if value < curr.value:
            if curr.left: curr = curr.left
            else:
                curr.left = Node(value)
                break
        else:
            if curr.right: curr = curr.right
            else:
                curr.right = Node(value)
                break
    return root

def search(root, target):
    curr = root
    while curr:
        if target == curr.value: return curr
        curr = curr.left if target < curr.value else curr.right
    return None

def delete(root, target):
    if not root: return None
    
    if target < root.value:
        root.left = delete(root.left, target)
    elif target > root.value:
        root.right = delete(root.right, target)
    else:
        
        if root.count > 1:
            root.count -= 1
            return root
        
        if not root.left: return root.right
        if not root.right: return root.left
        
        successor = root.right
        while successor.left:
            successor = successor.left
        root.value = successor.value
        
        root.right = delete(root.right, successor.value)
        
    return root

def find_min(root):
    curr = root
    while curr and curr.left:
        curr = curr.left
    return curr.value if curr else None

def find_max(root):
    curr = root
    while curr and curr.right:
        curr = curr.right
    return curr.value if curr else None

def floor(root, target):
    curr, res = root, None
    while curr:
        if curr.value == target: return curr.value
        if curr.value > target:
            curr = curr.left
        else:
            res = curr.value
            curr = curr.right
    return res

def ceil(root, target):
    curr, res = root, None
    while curr:
        if curr.value == target: return curr.value
        if curr.value < target:
            curr = curr.right
        else:
            res = curr.value
            curr = curr.left
    return res`,
  },
};

export const BinarySearchTreeConfig: LevelImplementationConfig = {
  id: "bst",
  type: "dataStructure",
  name: "二元搜尋樹 (BST)",
  categoryName: "非線性表",
  description:
    "具有排序性質的二元樹，左子樹小於根，右子樹大於根，重複值以計數顯示",
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
  relatedProblems: [
    {
      id: 700,
      title: "Search in a Binary Search Tree",
      concept: "BST 基礎操作：在二元搜尋樹中查找節點",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/search-in-a-binary-search-tree/",
    },
    {
      id: 701,
      title: "Insert into a Binary Search Tree",
      concept: "BST 插入操作：在二元搜尋樹中插入新節點",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/insert-into-a-binary-search-tree/",
    },
    {
      id: 98,
      title: "Validate Binary Search Tree",
      concept: "BST 驗證：判斷二元樹是否為有效的二元搜尋樹",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/validate-binary-search-tree/",
    },
  ],
  maxNodes: 10,
};

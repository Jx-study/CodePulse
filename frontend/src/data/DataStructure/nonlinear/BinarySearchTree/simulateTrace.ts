import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS, BSTStatus } from "./tags";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { linkStatus } from "@/modules/core/Render/D3Renderer";
import { updateLinkStatus } from "../utils";

export interface LogicTreeNode {
  id: string;
  value: number;
  count: number;
  left?: LogicTreeNode;
  right?: LogicTreeNode;
}

export function buildBST(data: any[]): LogicTreeNode | null {
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
    insertNodeLogic(root, {
      ...data[i],
      value: data[i].value,
      count: 1,
      left: undefined,
      right: undefined,
    });
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

export function flattenUniqueNodes(
  node: LogicTreeNode | undefined,
  list: any[],
) {
  if (!node) return;
  list.push({ id: node.id, value: node.value, count: node.count });
  flattenUniqueNodes(node.left, list);
  flattenUniqueNodes(node.right, list);
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
    while (successor!.left) successor = successor!.left;
    idToUpdateValue = targetNode.id;
    newValueForUpdate = successor!.value;
    idToRemove = successor!.id;
  }
  let finalData = [...data];
  if (idToRemove) finalData = finalData.filter((d) => d.id !== idToRemove);
  if (idToUpdateValue !== null && newValueForUpdate !== null) {
    finalData = finalData.map((d) =>
      d.id === idToUpdateValue ? { ...d, value: newValueForUpdate } : d,
    );
  }
  return finalData;
}

export function simulateBSTTrace(
  inputData: any[],
  action: any,
): ExecutionTrace {
  const trace: TraceEvent[] = [];

  const pushTrace = (
    data: any[],
    statusMap: Record<string, string>,
    tag: string,
    local_vars: any,
    linkStatusMap: Record<string, linkStatus> = {},
  ) => {
    trace.push({
      tag,
      local_vars,
      dataSnapshot: [],
      meta: {
        inputData: data.map((d) => ({ ...d })),
        statusMap: { ...statusMap },
        linkStatusMap: { ...linkStatusMap },
      },
    });
  };

  if (!action || !action.mode) {
    pushTrace(inputData, {}, TAGS.LOAD_DONE, { nodeCount: inputData.length });
    return trace;
  }

  const { mode, value: targetValue } = action;

  // INSERT
  if (mode === "Insert") {
    if (inputData.length === 0) return trace;
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
      pushTrace(
        inputData,
        { [newNodeData.id]: BSTStatus.Complete },
        TAGS.INS_INIT_EMPTY,
        { ...getVars(), curr: null },
        { ...linkStatusMap },
      );
      return trace;
    }
    const root = buildBST(oldData);
    const statusMap: Record<string, string> = {};
    pushTrace(oldData, {}, TAGS.INS_INIT, getVars(root), { ...linkStatusMap });

    let curr = root;
    let insertedAsLeftChild = false;
    while (curr) {
      statusMap[curr.id] = BSTStatus.Target;
      pushTrace(oldData, statusMap, TAGS.INS_COMPARE, getVars(curr), {
        ...linkStatusMap,
      });
      if (newValue === curr.value) {
        statusMap[curr.id] = BSTStatus.Complete;
        pathLinks.forEach(({ u, v }) =>
          updateLinkStatus(linkStatusMap, u, v, "complete", false),
        );
        pushTrace(
          inputData,
          statusMap,
          TAGS.INS_EQUAL,
          { ...getVars(curr), count: curr.count },
          { ...linkStatusMap },
        );
        return trace;
      }
      if (newValue < curr.value) {
        if (curr.left) {
          statusMap[curr.left.id] = BSTStatus.Prepare;
          updateLinkStatus(
            linkStatusMap,
            curr.id,
            curr.left.id,
            "prepare",
            true,
          );
          pathLinks.push({ u: curr.id, v: curr.left.id });
          pushTrace(oldData, statusMap, TAGS.INS_LEFT, getVars(curr), {
            ...linkStatusMap,
          });
          delete statusMap[curr.left.id];
          statusMap[curr.id] = BSTStatus.Visited;
          curr = curr.left;
        } else {
          insertedAsLeftChild = true;
          pushTrace(oldData, statusMap, TAGS.INS_PLACE_LEFT, getVars(curr), {
            ...linkStatusMap,
          });
          break;
        }
      } else {
        if (curr.right) {
          statusMap[curr.right.id] = BSTStatus.Prepare;
          updateLinkStatus(
            linkStatusMap,
            curr.id,
            curr.right.id,
            "prepare",
            true,
          );
          pathLinks.push({ u: curr.id, v: curr.right.id });
          pushTrace(oldData, statusMap, TAGS.INS_RIGHT, getVars(curr), {
            ...linkStatusMap,
          });
          delete statusMap[curr.right.id];
          statusMap[curr.id] = BSTStatus.Visited;
          curr = curr.right;
        } else {
          insertedAsLeftChild = false;
          pushTrace(oldData, statusMap, TAGS.INS_PLACE_RIGHT, getVars(curr), {
            ...linkStatusMap,
          });
          break;
        }
      }
    }
    statusMap[newNodeData.id] = BSTStatus.Complete;
    if (curr) {
      statusMap[curr.id] = BSTStatus.Visited;
      pathLinks.forEach(({ u, v }) =>
        updateLinkStatus(linkStatusMap, u, v, "unfinished", false),
      );
      updateLinkStatus(
        linkStatusMap,
        curr.id,
        newNodeData.id,
        "complete",
        false,
      );
    }
    pushTrace(
      inputData,
      statusMap,
      insertedAsLeftChild ? TAGS.INS_DONE_LEFT : TAGS.INS_DONE_RIGHT,
      getVars(curr ?? null),
      { ...linkStatusMap },
    );
  }

  // SEARCH
  else if (mode === "search") {
    const root = buildBST(inputData);
    const statusMap: Record<string, string> = {};
    const linkStatusMap: Record<string, linkStatus> = {};
    const searchPathLinks: { u: string; v: string }[] = [];
    const getVars = (curr?: LogicTreeNode | null, found?: boolean) => ({
      target: targetValue,
      curr: curr?.value ?? null,
      found: found ?? false,
    });

    if (!root) {
      pushTrace(inputData, {}, TAGS.SRCH_EMPTY, getVars(null, false), {
        ...linkStatusMap,
      });
      return trace;
    }
    pushTrace(inputData, {}, TAGS.SRCH_INIT, getVars(root), {
      ...linkStatusMap,
    });
    let curr: LogicTreeNode | undefined = root;
    let found = false;
    while (curr) {
      statusMap[curr.id] = BSTStatus.Target;
      pushTrace(inputData, statusMap, TAGS.SRCH_COMPARE, getVars(curr), {
        ...linkStatusMap,
      });
      if (targetValue === curr.value) {
        statusMap[curr.id] = BSTStatus.Complete;
        searchPathLinks.forEach(({ u, v }) =>
          updateLinkStatus(linkStatusMap, u, v, "complete", false),
        );
        pushTrace(inputData, statusMap, TAGS.SRCH_FOUND, getVars(curr, true), {
          ...linkStatusMap,
        });
        found = true;
        break;
      } else if (targetValue < curr.value) {
        if (curr.left) {
          statusMap[curr.left.id] = BSTStatus.Prepare;
          updateLinkStatus(
            linkStatusMap,
            curr.id,
            curr.left.id,
            "prepare",
            true,
          );
          searchPathLinks.push({ u: curr.id, v: curr.left.id });
          pushTrace(inputData, statusMap, TAGS.SRCH_LEFT, getVars(curr), {
            ...linkStatusMap,
          });
          delete statusMap[curr.left.id];
          statusMap[curr.id] = BSTStatus.Visited;
          curr = curr.left;
        } else {
          pushTrace(inputData, statusMap, TAGS.SRCH_LEFT, getVars(curr), {
            ...linkStatusMap,
          });
          statusMap[curr.id] = BSTStatus.Visited;
          break;
        }
      } else {
        if (curr.right) {
          statusMap[curr.right.id] = BSTStatus.Prepare;
          updateLinkStatus(
            linkStatusMap,
            curr.id,
            curr.right.id,
            "prepare",
            true,
          );
          searchPathLinks.push({ u: curr.id, v: curr.right.id });
          pushTrace(inputData, statusMap, TAGS.SRCH_RIGHT, getVars(curr), {
            ...linkStatusMap,
          });
          delete statusMap[curr.right.id];
          statusMap[curr.id] = BSTStatus.Visited;
          curr = curr.right;
        } else {
          pushTrace(inputData, statusMap, TAGS.SRCH_RIGHT, getVars(curr), {
            ...linkStatusMap,
          });
          statusMap[curr.id] = BSTStatus.Visited;
          break;
        }
      }
    }
    if (!found) {
      searchPathLinks.forEach(({ u, v }) =>
        updateLinkStatus(linkStatusMap, u, v, "unfinished", false),
      );
      pushTrace(
        inputData,
        statusMap,
        TAGS.SRCH_NOT_FOUND,
        getVars(null, false),
        { ...linkStatusMap },
      );
    }
  }

  // DELETE
  else if (mode === "DeleteValue") {
    const tVal = Math.round(targetValue);
    const root = buildBST(inputData);
    const statusMap: Record<string, string> = {};
    const linkStatusMap: Record<string, linkStatus> = {};
    const pathLinks: { u: string; v: string }[] = [];
    const successorPathLinks: { u: string; v: string }[] = [];
    const getVars = (
      curr?: LogicTreeNode | null,
      foundNode?: LogicTreeNode | null,
      successor?: LogicTreeNode | null,
    ) => ({
      target: tVal,
      curr: curr?.value ?? null,
      foundNode: foundNode?.value ?? null,
      successor: successor?.value ?? null,
    });

    if (!root) {
      pushTrace(inputData, {}, TAGS.DEL_EMPTY, getVars(null), {
        ...linkStatusMap,
      });
      return trace;
    }
    pushTrace(inputData, {}, TAGS.DEL_INIT, getVars(root), {
      ...linkStatusMap,
    });

    let curr: LogicTreeNode | undefined = root;
    let foundNode: LogicTreeNode | undefined = undefined;

    while (curr) {
      statusMap[curr.id] = BSTStatus.Target;
      pushTrace(inputData, statusMap, TAGS.DEL_SEARCH, getVars(curr), {
        ...linkStatusMap,
      });
      if (tVal === curr.value) {
        foundNode = curr;
        statusMap[curr.id] = BSTStatus.Complete;
        pathLinks.forEach(({ u, v }) =>
          updateLinkStatus(linkStatusMap, u, v, "complete", false),
        );
        pushTrace(inputData, statusMap, TAGS.DEL_FOUND, getVars(curr, curr), {
          ...linkStatusMap,
        });
        break;
      }
      if (tVal < curr.value) {
        if (curr.left) {
          statusMap[curr.left.id] = BSTStatus.Prepare;
          updateLinkStatus(
            linkStatusMap,
            curr.id,
            curr.left.id,
            "prepare",
            true,
          );
          pathLinks.push({ u: curr.id, v: curr.left.id });
          pushTrace(inputData, statusMap, TAGS.DEL_LEFT, getVars(curr), {
            ...linkStatusMap,
          });
          delete statusMap[curr.left.id];
          statusMap[curr.id] = BSTStatus.Visited;
          curr = curr.left;
        } else {
          pushTrace(inputData, statusMap, TAGS.DEL_LEFT, getVars(curr), {
            ...linkStatusMap,
          });
          statusMap[curr.id] = BSTStatus.Visited;
          break;
        }
      } else {
        if (curr.right) {
          statusMap[curr.right.id] = BSTStatus.Prepare;
          updateLinkStatus(
            linkStatusMap,
            curr.id,
            curr.right.id,
            "prepare",
            true,
          );
          pathLinks.push({ u: curr.id, v: curr.right.id });
          pushTrace(inputData, statusMap, TAGS.DEL_RIGHT, getVars(curr), {
            ...linkStatusMap,
          });
          delete statusMap[curr.right.id];
          statusMap[curr.id] = BSTStatus.Visited;
          curr = curr.right;
        } else {
          pushTrace(inputData, statusMap, TAGS.DEL_RIGHT, getVars(curr), {
            ...linkStatusMap,
          });
          statusMap[curr.id] = BSTStatus.Visited;
          break;
        }
      }
    }

    if (!foundNode) {
      pathLinks.forEach(({ u, v }) =>
        updateLinkStatus(linkStatusMap, u, v, "unfinished", false),
      );
      pushTrace(inputData, statusMap, TAGS.DEL_NOT_FOUND, getVars(null), {
        ...linkStatusMap,
      });
      return trace;
    }

    if (foundNode.count > 1) {
      const finalData = getBSTArrayAfterDelete(inputData, tVal);
      pushTrace(
        finalData,
        statusMap,
        TAGS.DEL_COUNT_DEC,
        { ...getVars(null, foundNode), count: foundNode.count - 1 },
        { ...linkStatusMap },
      );
      return trace;
    }

    const targetId = foundNode.id;

    if (!foundNode.left && !foundNode.right) {
      statusMap[targetId] = BSTStatus.Target;
      pushTrace(inputData, statusMap, TAGS.DEL_LEAF, getVars(null, foundNode), {
        ...linkStatusMap,
      });
      const finalData = getBSTArrayAfterDelete(inputData, tVal);
      pushTrace(finalData, {}, TAGS.DEL_LEAF_REMOVE, getVars(), {
        ...linkStatusMap,
      });
    } else if (!foundNode.left || !foundNode.right) {
      const child = foundNode.left ? foundNode.left : foundNode.right;
      const isLeftChild = !!foundNode.left;
      const intermediateData = inputData.map((d) => {
        if (d.id === targetId) return { ...d, value: child!.value };
        if (d.id === child!.id)
          return {
            ...d,
            value: child!.value + (isLeftChild ? -0.0001 : 0.0001),
          };
        return d;
      });
      updateLinkStatus(linkStatusMap, targetId, child!.id, "target", false);
      pushTrace(
        intermediateData,
        statusMap,
        TAGS.DEL_ONE_CHILD_REPLACE,
        getVars(null, foundNode, child!),
        { ...linkStatusMap },
      );
      const finalData = getBSTArrayAfterDelete(inputData, tVal);
      pushTrace(finalData, {}, TAGS.DEL_ONE_CHILD_DONE, getVars(), {
        ...linkStatusMap,
      });
    } else {
      statusMap[targetId] = BSTStatus.Target;
      pushTrace(
        inputData,
        statusMap,
        TAGS.DEL_TWO_CHILD,
        getVars(null, foundNode),
        { ...linkStatusMap },
      );
      let successor = foundNode.right;
      statusMap[successor!.id] = BSTStatus.Prepare;
      updateLinkStatus(
        linkStatusMap,
        foundNode.id,
        successor!.id,
        "prepare",
        true,
      );
      successorPathLinks.push({ u: foundNode.id, v: successor!.id });
      pushTrace(
        inputData,
        statusMap,
        TAGS.DEL_SUCCESSOR_FIND,
        getVars(null, foundNode, successor),
        { ...linkStatusMap },
      );
      delete statusMap[successor!.id];

      while (successor!.left) {
        statusMap[successor!.left.id] = BSTStatus.Prepare;
        updateLinkStatus(
          linkStatusMap,
          successor!.id,
          successor!.left.id,
          "prepare",
          true,
        );
        successorPathLinks.push({ u: successor!.id, v: successor!.left.id });
        pushTrace(
          inputData,
          statusMap,
          TAGS.DEL_SUCCESSOR_FIND,
          getVars(null, foundNode, successor),
          { ...linkStatusMap },
        );
        delete statusMap[successor!.left.id];
        successor = successor!.left;
      }

      statusMap[successor!.id] = BSTStatus.Complete;
      successorPathLinks.forEach(({ u, v }) =>
        updateLinkStatus(linkStatusMap, u, v, "complete", false),
      );
      pushTrace(
        inputData,
        statusMap,
        TAGS.DEL_SUCCESSOR_FIND,
        getVars(null, foundNode, successor),
        { ...linkStatusMap },
      );

      const intermediateData = inputData.map((d) => {
        if (d.id === targetId) return { ...d, value: successor!.value };
        if (d.id === successor!.id)
          return { ...d, value: successor!.value + 0.0001 };
        return d;
      });
      pushTrace(
        intermediateData,
        statusMap,
        TAGS.DEL_SUCCESSOR_REPLACE,
        getVars(null, foundNode, successor),
        { ...linkStatusMap },
      );

      const finalData = getBSTArrayAfterDelete(inputData, tVal);
      pushTrace(
        finalData,
        { [targetId]: BSTStatus.Complete },
        TAGS.DEL_SUCCESSOR_REMOVE,
        getVars(),
        {},
      );
    }
  }

  // MIN & MAX
  else if (mode === "min" || mode === "max") {
    const root = buildBST(inputData);
    if (!root) return trace;
    const statusMap: Record<string, string> = {};
    const linkStatusMap: Record<string, linkStatus> = {};
    const pathLinks: { u: string; v: string }[] = [];
    const getVars = (curr?: LogicTreeNode) => ({ curr: curr?.value ?? null });

    pushTrace(
      inputData,
      {},
      mode === "min" ? TAGS.MIN_INIT : TAGS.MAX_INIT,
      getVars(root),
      { ...linkStatusMap },
    );
    let curr = root;
    const nextChild = mode === "min" ? () => curr.left : () => curr.right;

    while (nextChild()) {
      statusMap[curr.id] = BSTStatus.Target;
      pushTrace(
        inputData,
        statusMap,
        mode === "min" ? TAGS.MIN_TRAVERSE : TAGS.MAX_TRAVERSE,
        getVars(curr),
        { ...linkStatusMap },
      );
      const child = nextChild()!;
      statusMap[child.id] = BSTStatus.Prepare;
      updateLinkStatus(linkStatusMap, curr.id, child.id, "prepare", true);
      pathLinks.push({ u: curr.id, v: child.id });
      pushTrace(
        inputData,
        statusMap,
        mode === "min" ? TAGS.MIN_TRAVERSE : TAGS.MAX_TRAVERSE,
        getVars(curr),
        { ...linkStatusMap },
      );
      delete statusMap[child.id];
      statusMap[curr.id] = BSTStatus.Visited;
      curr = child;
    }

    statusMap[curr.id] = BSTStatus.Complete;
    pathLinks.forEach(({ u, v }) =>
      updateLinkStatus(linkStatusMap, u, v, "unfinished", false),
    );
    pushTrace(
      inputData,
      statusMap,
      mode === "min" ? TAGS.MIN_FOUND : TAGS.MAX_FOUND,
      getVars(curr),
      { ...linkStatusMap },
    );
  }

  // FLOOR & CEIL
  else if (mode === "floor" || mode === "ceil") {
    const root = buildBST(inputData);
    if (!root) return trace;
    const statusMap: Record<string, string> = {};
    const linkStatusMap: Record<string, linkStatus> = {};
    const pathLinks: { u: string; v: string }[] = [];

    const isFloor = mode === "floor";
    const initTag = isFloor ? TAGS.FLOOR_INIT : TAGS.CEIL_INIT;
    const compareTag = isFloor ? TAGS.FLOOR_COMPARE : TAGS.CEIL_COMPARE;
    const equalTag = isFloor ? TAGS.FLOOR_EQUAL : TAGS.CEIL_EQUAL;
    const leftTag = isFloor ? TAGS.FLOOR_LEFT : TAGS.CEIL_LEFT;
    const rightTag = isFloor ? TAGS.FLOOR_RIGHT : TAGS.CEIL_RIGHT;
    const foundTag = isFloor ? TAGS.FLOOR_FOUND : TAGS.CEIL_FOUND;
    const notFoundTag = isFloor ? TAGS.FLOOR_NOT_FOUND : TAGS.CEIL_NOT_FOUND;

    const getVars = (
      curr?: LogicTreeNode | null,
      candidateVal?: number | null,
    ) => {
      const v = { target: targetValue, curr: curr?.value ?? null } as any;
      if (isFloor) v.floor = candidateVal ?? null;
      else v.ceil = candidateVal ?? null;
      return v;
    };

    pushTrace(inputData, {}, initTag, getVars(root), { ...linkStatusMap });

    let curr: LogicTreeNode | undefined = root;
    let candidateNode: LogicTreeNode | null = null;

    while (curr) {
      statusMap[curr.id] = BSTStatus.Target;
      pushTrace(
        inputData,
        statusMap,
        compareTag,
        getVars(curr, candidateNode?.value),
        { ...linkStatusMap },
      );

      if (curr.value === targetValue) {
        if (candidateNode) statusMap[candidateNode.id] = BSTStatus.Visited;
        statusMap[curr.id] = BSTStatus.Complete;
        pathLinks.forEach(({ u, v }) =>
          updateLinkStatus(linkStatusMap, u, v, "complete", false),
        );
        pushTrace(inputData, statusMap, equalTag, getVars(curr, curr.value), {
          ...linkStatusMap,
        });
        return trace;
      }

      const shouldRecord = isFloor
        ? curr.value < targetValue
        : curr.value > targetValue;
      let nextNode: LogicTreeNode | undefined;
      let currentTag: string;

      if (isFloor) {
        if (curr.value > targetValue) {
          nextNode = curr.left;
          currentTag = leftTag;
        } else {
          nextNode = curr.right;
          currentTag = rightTag;
        }
      } else {
        // Ceil
        if (curr.value < targetValue) {
          nextNode = curr.right;
          currentTag = rightTag;
        } else {
          nextNode = curr.left;
          currentTag = leftTag;
        }
      }

      if (shouldRecord) {
        if (candidateNode) statusMap[candidateNode.id] = BSTStatus.Visited;
        candidateNode = curr;
        statusMap[curr.id] = BSTStatus.Complete;
      }

      if (nextNode) {
        statusMap[nextNode.id] = BSTStatus.Prepare;
        updateLinkStatus(linkStatusMap, curr.id, nextNode.id, "prepare", true);
        pathLinks.push({ u: curr.id, v: nextNode.id });
        pushTrace(
          inputData,
          statusMap,
          currentTag,
          getVars(curr, candidateNode?.value),
          { ...linkStatusMap },
        );
        delete statusMap[nextNode.id];
        if (!shouldRecord) statusMap[curr.id] = BSTStatus.Visited;
        curr = nextNode;
      } else {
        pushTrace(
          inputData,
          statusMap,
          currentTag,
          getVars(curr, candidateNode?.value),
          { ...linkStatusMap },
        );
        if (!shouldRecord) statusMap[curr.id] = BSTStatus.Visited;
        break;
      }
    }

    if (candidateNode) {
      pathLinks.forEach(({ u, v }) =>
        updateLinkStatus(linkStatusMap, u, v, "unfinished", false),
      );
      pushTrace(
        inputData,
        statusMap,
        foundTag,
        getVars(null, candidateNode.value),
        { ...linkStatusMap },
      );
    } else {
      pathLinks.forEach(({ u, v }) =>
        updateLinkStatus(
          linkStatusMap,
          u,
          v,
          Status.Unfinished as linkStatus,
          false,
        ),
      );
      pushTrace(inputData, statusMap, notFoundTag, getVars(null), {
        ...linkStatusMap,
      });
    }
  }
  return trace;
}

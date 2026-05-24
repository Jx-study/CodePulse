import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS, BTStatus } from "./tags";
import { linkStatus } from "@/modules/core/Render/D3Renderer";

export interface LogicTreeNode {
  id: string;
  value: number | string;
  left?: LogicTreeNode;
  right?: LogicTreeNode;
}

export function buildLogicalTree(data: any[]): LogicTreeNode | null {
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

export function simulateBinaryTreeTrace(
  inputData: any[],
  action: any,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const root = buildLogicalTree(inputData);

  const pushTrace = (
    tag: string,
    statusMap: Record<string, string>,
    linearList: LogicTreeNode[],
    animationState: "idle" | "pushing" | "popping",
    containerType: "stack" | "queue",
    local_vars: any,
    linkStatusMap: Record<string, linkStatus> = {},
  ) => {
    trace.push({
      tag,
      local_vars,
      dataSnapshot: [],
      meta: {
        inputData: inputData.map((d) => ({ ...d })),
        statusMap: { ...statusMap },
        linkStatusMap: { ...linkStatusMap },
        linearList: [...linearList],
        animationState,
        containerType,
      },
    });
  };

  if (!action || !action.mode) {
    trace.push({
      tag: TAGS.INIT_DONE,
      local_vars: { count: inputData.length },
      dataSnapshot: [],
      meta: { inputData: inputData.map((d) => ({ ...d })) },
    });
    return trace;
  }

  const statusMap: Record<string, string> = {};
  const linkStatusMap: Record<string, linkStatus> = {};
  const callStack: LogicTreeNode[] = [];
  const visited: number[] = [];
  const nullNode: LogicTreeNode = { id: "Null", value: "Null" };

  const getVars = (node?: LogicTreeNode, child?: LogicTreeNode) => ({
    curr: node?.value ?? "Null",
    child: child?.value ?? "Null",
    stack: node
      ? [...callStack.map((n) => n.value)]
      : [...callStack.map((n) => n.value), "Null"],
    visitedOrder: [...visited],
  });

  if (action.mode === "preorder") {
    if (!root) return trace;
    pushTrace(
      TAGS.PRE_INIT,
      statusMap,
      [root],
      "pushing",
      "stack",
      getVars(root),
      { ...linkStatusMap },
    );

    const traverse = (node: LogicTreeNode | undefined) => {
      if (!node) {
        pushTrace(
          TAGS.PRE_NULL,
          statusMap,
          [...callStack],
          "idle",
          "stack",
          getVars(),
          { ...linkStatusMap },
        );
        return;
      }
      callStack.push(node);
      statusMap[node.id] = BTStatus.Target;
      visited.push(Number(node.value));
      pushTrace(
        TAGS.PRE_VISIT,
        statusMap,
        [...callStack],
        "idle",
        "stack",
        getVars(node),
        { ...linkStatusMap },
      );
      statusMap[node.id] = BTStatus.Complete;

      if (node.left) {
        statusMap[node.left.id] = BTStatus.Prepare;
        linkStatusMap[`${node.id}-${node.left.id}`] = "prepare";
        pushTrace(
          TAGS.PRE_LEFT_ENTER,
          statusMap,
          [...callStack, node.left],
          "pushing",
          "stack",
          getVars(node, node.left),
          { ...linkStatusMap },
        );
        delete statusMap[node.left.id];
        traverse(node.left);
        linkStatusMap[`${node.id}-${node.left.id}`] = "complete";
        const orig = statusMap[node.id];
        statusMap[node.id] = BTStatus.Target;
        pushTrace(
          TAGS.PRE_LEFT_RETURN,
          statusMap,
          [...callStack],
          "idle",
          "stack",
          getVars(node),
          { ...linkStatusMap },
        );
        statusMap[node.id] = orig;
      } else {
        const orig = statusMap[node.id];
        statusMap[node.id] = BTStatus.Target;
        pushTrace(
          TAGS.PRE_LEFT_ENTER,
          statusMap,
          [...callStack, nullNode],
          "pushing",
          "stack",
          getVars(node),
          { ...linkStatusMap },
        );
        pushTrace(
          TAGS.PRE_NULL,
          statusMap,
          [...callStack, nullNode],
          "idle",
          "stack",
          getVars(),
          { ...linkStatusMap },
        );
        pushTrace(
          TAGS.PRE_LEFT_RETURN,
          statusMap,
          [...callStack, nullNode],
          "popping",
          "stack",
          getVars(node),
          { ...linkStatusMap },
        );
        statusMap[node.id] = orig;
      }

      if (node.right) {
        statusMap[node.right.id] = BTStatus.Prepare;
        linkStatusMap[`${node.id}-${node.right.id}`] = "prepare";
        pushTrace(
          TAGS.PRE_RIGHT_ENTER,
          statusMap,
          [...callStack, node.right],
          "pushing",
          "stack",
          getVars(node, node.right),
          { ...linkStatusMap },
        );
        delete statusMap[node.right.id];
        traverse(node.right);
        linkStatusMap[`${node.id}-${node.right.id}`] = "complete";
        const orig = statusMap[node.id];
        statusMap[node.id] = BTStatus.Target;
        pushTrace(
          TAGS.PRE_RIGHT_RETURN,
          statusMap,
          [...callStack],
          "idle",
          "stack",
          getVars(node),
          { ...linkStatusMap },
        );
        statusMap[node.id] = orig;
      } else {
        const orig = statusMap[node.id];
        statusMap[node.id] = BTStatus.Target;
        pushTrace(
          TAGS.PRE_RIGHT_ENTER,
          statusMap,
          [...callStack, nullNode],
          "pushing",
          "stack",
          getVars(node),
          { ...linkStatusMap },
        );
        pushTrace(
          TAGS.PRE_NULL,
          statusMap,
          [...callStack, nullNode],
          "idle",
          "stack",
          getVars(),
          { ...linkStatusMap },
        );
        pushTrace(
          TAGS.PRE_RIGHT_RETURN,
          statusMap,
          [...callStack, nullNode],
          "popping",
          "stack",
          getVars(node),
          { ...linkStatusMap },
        );
        statusMap[node.id] = orig;
      }
      pushTrace(
        TAGS.PRE_RIGHT_RETURN,
        statusMap,
        [...callStack],
        "popping",
        "stack",
        getVars(node),
        { ...linkStatusMap },
      );
      callStack.pop();
    };

    traverse(root);
    pushTrace(TAGS.PRE_DONE, statusMap, [], "idle", "stack", getVars(), {
      ...linkStatusMap,
    });
  } else if (action.mode === "inorder") {
    if (!root) return trace;
    pushTrace(
      TAGS.IN_INIT,
      statusMap,
      [root],
      "pushing",
      "stack",
      getVars(root),
    );

    const traverse = (node: LogicTreeNode | undefined) => {
      if (!node) return;
      callStack.push(node);
      statusMap[node.id] = BTStatus.Target;
      pushTrace(
        TAGS.IN_LEFT_ENTER,
        statusMap,
        [...callStack],
        "idle",
        "stack",
        getVars(node),
      );
      statusMap[node.id] = BTStatus.Visited; // 在 Stack 中等待

      if (node.left) {
        statusMap[node.left.id] = BTStatus.Prepare;
        linkStatusMap[`${node.id}-${node.left.id}`] = "prepare";
        pushTrace(
          TAGS.IN_LEFT_ENTER,
          statusMap,
          [...callStack, node.left],
          "pushing",
          "stack",
          getVars(node, node.left),
        );
        delete statusMap[node.left.id];
        traverse(node.left);
        linkStatusMap[`${node.id}-${node.left.id}`] = "complete";
        const orig = statusMap[node.id];
        statusMap[node.id] = BTStatus.Target;
        pushTrace(
          TAGS.IN_LEFT_RETURN,
          statusMap,
          [...callStack],
          "idle",
          "stack",
          getVars(node),
        );
        statusMap[node.id] = orig;
      } else {
        const orig = statusMap[node.id];
        statusMap[node.id] = BTStatus.Target;
        pushTrace(
          TAGS.IN_LEFT_ENTER,
          statusMap,
          [...callStack, nullNode],
          "pushing",
          "stack",
          getVars(node),
        );
        pushTrace(
          TAGS.IN_NULL,
          statusMap,
          [...callStack, nullNode],
          "idle",
          "stack",
          getVars(),
        );
        pushTrace(
          TAGS.IN_LEFT_RETURN,
          statusMap,
          [...callStack, nullNode],
          "popping",
          "stack",
          getVars(node),
        );
        statusMap[node.id] = orig;
      }

      statusMap[node.id] = BTStatus.Complete;
      visited.push(Number(node.value));
      pushTrace(
        TAGS.IN_VISIT,
        statusMap,
        [...callStack],
        "idle",
        "stack",
        getVars(node),
      );

      if (node.right) {
        statusMap[node.right.id] = BTStatus.Prepare;
        linkStatusMap[`${node.id}-${node.right.id}`] = "prepare";
        pushTrace(
          TAGS.IN_RIGHT_ENTER,
          statusMap,
          [...callStack, node.right],
          "pushing",
          "stack",
          getVars(node, node.right),
        );
        delete statusMap[node.right.id];
        traverse(node.right);
        linkStatusMap[`${node.id}-${node.right.id}`] = "complete";
        const orig = statusMap[node.id];
        statusMap[node.id] = BTStatus.Target;
        pushTrace(
          TAGS.IN_RIGHT_RETURN,
          statusMap,
          [...callStack],
          "idle",
          "stack",
          getVars(node),
        );
        statusMap[node.id] = orig;
      } else {
        const orig = statusMap[node.id];
        statusMap[node.id] = BTStatus.Target;
        pushTrace(
          TAGS.IN_RIGHT_ENTER,
          statusMap,
          [...callStack, nullNode],
          "pushing",
          "stack",
          getVars(node),
        );
        pushTrace(
          TAGS.IN_NULL,
          statusMap,
          [...callStack, nullNode],
          "idle",
          "stack",
          getVars(),
        );
        pushTrace(
          TAGS.IN_RIGHT_RETURN,
          statusMap,
          [...callStack, nullNode],
          "popping",
          "stack",
          getVars(node),
        );
        statusMap[node.id] = orig;
      }
      pushTrace(
        TAGS.IN_RIGHT_RETURN,
        statusMap,
        [...callStack],
        "popping",
        "stack",
        getVars(node),
      );
      callStack.pop();
    };

    traverse(root);
    pushTrace(TAGS.IN_DONE, statusMap, [], "idle", "stack", getVars());
  } else if (action.mode === "postorder") {
    if (!root) return trace;
    pushTrace(
      TAGS.POST_INIT,
      statusMap,
      [root],
      "pushing",
      "stack",
      getVars(root),
    );

    const traverse = (node: LogicTreeNode | undefined) => {
      if (!node) return;
      callStack.push(node);
      statusMap[node.id] = BTStatus.Target;
      pushTrace(
        TAGS.POST_LEFT_ENTER,
        statusMap,
        [...callStack],
        "idle",
        "stack",
        getVars(node),
      );
      statusMap[node.id] = BTStatus.Visited;

      if (node.left) {
        statusMap[node.left.id] = BTStatus.Prepare;
        linkStatusMap[`${node.id}-${node.left.id}`] = "prepare";
        pushTrace(
          TAGS.POST_LEFT_ENTER,
          statusMap,
          [...callStack, node.left],
          "pushing",
          "stack",
          getVars(node, node.left),
        );
        delete statusMap[node.left.id];
        traverse(node.left);
        linkStatusMap[`${node.id}-${node.left.id}`] = "complete";
        const orig = statusMap[node.id];
        statusMap[node.id] = BTStatus.Target;
        pushTrace(
          TAGS.POST_LEFT_RETURN,
          statusMap,
          [...callStack],
          "idle",
          "stack",
          getVars(node),
        );
        statusMap[node.id] = orig;
      } else {
        const orig = statusMap[node.id];
        statusMap[node.id] = BTStatus.Target;
        pushTrace(
          TAGS.POST_LEFT_ENTER,
          statusMap,
          [...callStack, nullNode],
          "pushing",
          "stack",
          getVars(node),
        );
        pushTrace(
          TAGS.POST_NULL,
          statusMap,
          [...callStack, nullNode],
          "idle",
          "stack",
          getVars(),
        );
        pushTrace(
          TAGS.POST_LEFT_RETURN,
          statusMap,
          [...callStack, nullNode],
          "popping",
          "stack",
          getVars(node),
        );
        statusMap[node.id] = orig;
      }

      if (node.right) {
        statusMap[node.right.id] = BTStatus.Prepare;
        linkStatusMap[`${node.id}-${node.right.id}`] = "prepare";
        pushTrace(
          TAGS.POST_RIGHT_ENTER,
          statusMap,
          [...callStack, node.right],
          "pushing",
          "stack",
          getVars(node, node.right),
        );
        delete statusMap[node.right.id];
        traverse(node.right);
        linkStatusMap[`${node.id}-${node.right.id}`] = "complete";
        const orig = statusMap[node.id];
        statusMap[node.id] = BTStatus.Target;
        pushTrace(
          TAGS.POST_RIGHT_RETURN,
          statusMap,
          [...callStack],
          "idle",
          "stack",
          getVars(node),
        );
        statusMap[node.id] = orig;
      } else {
        const orig = statusMap[node.id];
        statusMap[node.id] = BTStatus.Target;
        pushTrace(
          TAGS.POST_RIGHT_ENTER,
          statusMap,
          [...callStack, nullNode],
          "pushing",
          "stack",
          getVars(node),
        );
        pushTrace(
          TAGS.POST_NULL,
          statusMap,
          [...callStack, nullNode],
          "idle",
          "stack",
          getVars(),
        );
        pushTrace(
          TAGS.POST_RIGHT_RETURN,
          statusMap,
          [...callStack, nullNode],
          "popping",
          "stack",
          getVars(node),
        );
        statusMap[node.id] = orig;
      }

      statusMap[node.id] = BTStatus.Complete;
      visited.push(Number(node.value));
      pushTrace(
        TAGS.POST_VISIT,
        statusMap,
        [...callStack],
        "idle",
        "stack",
        getVars(node),
      );
      pushTrace(
        TAGS.POST_RIGHT_RETURN,
        statusMap,
        [...callStack],
        "popping",
        "stack",
        getVars(node),
      );
      callStack.pop();
    };

    traverse(root);
    pushTrace(TAGS.POST_DONE, statusMap, [], "idle", "stack", getVars());
  } else if (action.mode === "bfs") {
    if (!root) return trace;
    const q: { node: LogicTreeNode; parent: LogicTreeNode | null }[] = [];

    pushTrace(
      TAGS.BFS_INIT,
      statusMap,
      [root],
      "pushing",
      "queue",
      getVars(root),
    );
    q.push({ node: root, parent: null });
    statusMap[root.id] = BTStatus.Visited;

    while (q.length > 0) {
      pushTrace(
        TAGS.BFS_WHILE,
        statusMap,
        q.map((i) => i.node),
        "idle",
        "queue",
        getVars(),
      );
      const { node: curr, parent } = q[0];
      if (parent) linkStatusMap[`${parent.id}-${curr.id}`] = "complete";

      statusMap[curr.id] = BTStatus.Target;
      pushTrace(
        TAGS.BFS_DEQUEUE,
        statusMap,
        q.map((i) => i.node),
        "popping",
        "queue",
        getVars(curr),
      );
      q.shift();

      statusMap[curr.id] = BTStatus.Complete;
      visited.push(Number(curr.value));
      pushTrace(
        TAGS.BFS_VISIT,
        statusMap,
        q.map((i) => i.node),
        "idle",
        "queue",
        getVars(curr),
      );

      if (curr.left) {
        statusMap[curr.left.id] = BTStatus.Prepare;
        linkStatusMap[`${curr.id}-${curr.left.id}`] = "prepare";
        pushTrace(
          TAGS.BFS_ENQUEUE_LEFT,
          statusMap,
          [...q.map((i) => i.node), curr.left],
          "pushing",
          "queue",
          getVars(curr, curr.left),
        );
        statusMap[curr.left.id] = BTStatus.Visited;
        q.push({ node: curr.left, parent: curr });
      } else {
        pushTrace(
          TAGS.BFS_SKIP_LEFT,
          statusMap,
          q.map((i) => i.node),
          "idle",
          "queue",
          getVars(curr),
        );
      }

      if (curr.right) {
        statusMap[curr.right.id] = BTStatus.Prepare;
        linkStatusMap[`${curr.id}-${curr.right.id}`] = "prepare";
        pushTrace(
          TAGS.BFS_ENQUEUE_RIGHT,
          statusMap,
          [...q.map((i) => i.node), curr.right],
          "pushing",
          "queue",
          getVars(curr, curr.right),
        );
        statusMap[curr.right.id] = BTStatus.Visited;
        q.push({ node: curr.right, parent: curr });
      } else {
        pushTrace(
          TAGS.BFS_SKIP_RIGHT,
          statusMap,
          q.map((i) => i.node),
          "idle",
          "queue",
          getVars(curr),
        );
      }
    }
    pushTrace(TAGS.BFS_DONE, statusMap, [], "idle", "queue", getVars());
  }

  return trace;
}

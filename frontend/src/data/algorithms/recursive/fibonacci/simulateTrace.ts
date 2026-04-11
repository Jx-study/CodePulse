import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";

export interface FibNodeLayout {
  id: string;
  n: number;
  val: number | null;
  x: number;
  y: number;
  status: string;
  leftId: string | null;
  rightId: string | null;
}

class TreeNode {
  id: string;
  n: number;
  depth: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  x: number = 0;
  y: number = 0;
  constructor(id: string, n: number, depth: number) {
    this.id = id;
    this.n = n;
    this.depth = depth;
  }
}

export function simulateFibonacciTrace(targetN: number): ExecutionTrace {
  const trace: TraceEvent[] = [];
  let nextId = 0;

  function buildTree(n: number, depth: number): TreeNode {
    const node = new TreeNode(`fib-${nextId++}`, n, depth);
    if (n > 1) {
      node.left = buildTree(n - 1, depth + 1);
      node.right = buildTree(n - 2, depth + 1);
    }
    return node;
  }

  const root = buildTree(targetN, 0);

  let xIndex = 0;
  const startX = 50;
  const gapX = 55;
  const baseY = 80;
  const offsetY = 70;

  function assignCoords(node: TreeNode) {
    if (node.left) assignCoords(node.left);
    node.x = startX + xIndex * gapX;
    node.y = baseY + node.depth * offsetY;
    xIndex++;
    if (node.right) assignCoords(node.right);
  }
  assignCoords(root);

  const activeNodes = new Map<string, FibNodeLayout>();

  function getSnapshot() {
    return Array.from(activeNodes.values()).map((n) => ({
      id: n.id,
      value: n.val !== null ? n.val : `f(${n.n})`, // 放入 value 屬性以符合介面
    }));
  }

  function getLayoutMeta() {
    const layoutMap: Record<string, FibNodeLayout> = {};
    activeNodes.forEach((node, id) => {
      layoutMap[id] = { ...node };
    });
    return layoutMap;
  }

  trace.push({
    tag: TAGS.FIB_START,
    variables: { targetN },
    dataSnapshot: [],
    meta: { isInitial: true, treeLayout: {} },
  });

  function simulate(node: TreeNode): number {
    const nodeData: FibNodeLayout = {
      id: node.id,
      n: node.n,
      val: null,
      x: node.x,
      y: node.y,
      status: "Target",
      leftId: node.left?.id ?? null,
      rightId: node.right?.id ?? null,
    };
    activeNodes.set(node.id, nodeData);

    trace.push({
      tag: TAGS.FIB_CALL,
      variables: { n: node.n },
      dataSnapshot: getSnapshot(),
      meta: { highlightId: node.id, treeLayout: getLayoutMeta() },
    });

    nodeData.status = "Unfinished";

    // Base Case
    if (node.n <= 1) {
      nodeData.val = node.n;
      nodeData.status = "Complete";
      trace.push({
        tag: TAGS.FIB_BASE,
        variables: { n: node.n, result: node.n },
        dataSnapshot: getSnapshot(),
        meta: { highlightId: node.id, treeLayout: getLayoutMeta() },
      });
      return node.n;
    }

    // 遞迴左右子樹
    const leftVal = simulate(node.left!);
    const rightVal = simulate(node.right!);

    // 合併結果
    const result = leftVal + rightVal;
    nodeData.val = result;
    nodeData.status = "Complete";

    trace.push({
      tag: TAGS.FIB_CALC,
      variables: { n: node.n, leftVal, rightVal, result },
      dataSnapshot: getSnapshot(),
      meta: { highlightId: node.id, treeLayout: getLayoutMeta() },
    });

    return result;
  }

  const finalResult = simulate(root);

  trace.push({
    tag: TAGS.FIB_DONE,
    variables: { result: finalResult },
    dataSnapshot: getSnapshot(),
    meta: { highlightId: root.id, treeLayout: getLayoutMeta() },
  });

  return trace;
}

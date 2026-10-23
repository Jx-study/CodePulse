import type { ExecutionTrace } from "@/types/trace";
import type { BSTInputItem } from "../BinarySearchTree/simulateTrace";
import {
  balanceFactor,
  height,
  isBalancedTree,
  type AVLNode,
} from "./avl";
import { createRun, visited, type StatusMap } from "./run";
import { TAGS, AVLStatus } from "./tags";

const unbalancedNodes = (root: AVLNode | null): StatusMap => {
  const map: StatusMap = {};
  const walk = (node: AVLNode | undefined) => {
    if (!node) return;
    if (Math.abs(balanceFactor(node)) > 1) map[node.id] = AVLStatus.Unbalanced;
    walk(node.left);
    walk(node.right);
  };
  walk(root ?? undefined);
  return map;
};

/** Insert and delete assume an AVL tree, so they stop and point at what is wrong instead. */
export function simulateNeedBalance(inputData: BSTInputItem[]): ExecutionTrace {
  const run = createRun(inputData);
  run.push(TAGS.NEED_BALANCE, {}, unbalancedNodes(run.getRoot()));
  return run.trace;
}

/**
 * Runs IsBalanced for real: every call, every recursive step and every return
 * is a frame, and the value a call returns is carried up to its caller.
 */
export function simulateCheckBalance(inputData: BSTInputItem[]): ExecutionTrace {
  const run = createRun(inputData);
  const root = run.getRoot();
  if (!root) {
    run.push(TAGS.CHK_EMPTY, {});
    return run.trace;
  }

  const done: StatusMap = {};
  const ancestors: AVLNode[] = [];
  let bad = 0;

  const looking = (node: AVLNode, extra: StatusMap = {}): StatusMap => ({
    ...visited(ancestors),
    ...done,
    [node.id]: AVLStatus.Target,
    ...extra,
  });

  const check = (
    node: AVLNode | undefined,
    parent?: AVLNode,
    side?: "left" | "right",
  ): boolean => {
    if (!node) {
      run.push(TAGS.CHK_NULL, { parent: parent!.value, side: side! }, looking(parent!));
      return true;
    }

    run.push(TAGS.CHK_CALL, { node: node.value, depth: ancestors.length + 1 }, looking(node));

    const descend = (child: AVLNode | undefined, side: "left" | "right") => {
      run.push(side === "left" ? TAGS.CHK_GO_LEFT : TAGS.CHK_GO_RIGHT, { node: node.value }, looking(
        node,
        child ? { [child.id]: AVLStatus.Prepare } : {},
      ));
      ancestors.push(node);
      const result = check(child, node, side);
      ancestors.pop();
      return result;
    };
    const leftOk = descend(node.left, "left");
    const rightOk = descend(node.right, "right");

    const bf = balanceFactor(node);
    run.push(TAGS.CHK_BF, { node: node.value, height: height(node), bf }, looking(node));

    const ownOk = Math.abs(bf) <= 1;
    if (!ownOk) bad += 1;
    done[node.id] = ownOk ? AVLStatus.Complete : AVLStatus.Unbalanced;
    const result = ownOk && leftOk && rightOk;
    run.push(ownOk ? TAGS.CHK_OK : TAGS.CHK_BAD, { node: node.value, bf, result }, {
      ...visited(ancestors),
      ...done,
    });
    return result;
  };

  const balanced = check(root);
  run.push(balanced ? TAGS.CHK_DONE_OK : TAGS.CHK_DONE_BAD, { bad }, done);
  return run.trace;
}

/**
 * Rebalances bottom up. Subtrees that are already fine are skipped, and a
 * rotation that pushes a node down re-checks the nodes that moved.
 */
export function simulateRebalance(inputData: BSTInputItem[]): ExecutionTrace {
  const run = createRun(inputData);
  const root = run.getRoot();
  if (!root || isBalancedTree(root)) {
    run.push(TAGS.RB_ALREADY, { empty: !root });
    return run.trace;
  }

  const settleNode = (ancestors: AVLNode[], node: AVLNode) => {
    let current = node;
    for (let guard = 0; guard < 200; guard++) {
      const full = [...ancestors, current];
      const top = run.rebalanceAt(full, full.length - 1, {}, TAGS.RB_BF_CHECK);
      if (top === current) return;

      const above = [...ancestors, top];
      (["left", "right"] as const).forEach((side) => {
        const child = top[side];
        if (child && !isBalancedTree(child)) visitTree(above, child);
      });
      current = top;
    }
  };

  const visitTree = (ancestors: AVLNode[], node: AVLNode) => {
    if (isBalancedTree(node)) return;
    const below = [...ancestors, node];
    if (node.left) visitTree(below, node.left);
    if (node.right) visitTree(below, node.right);
    settleNode(ancestors, node);
  };

  visitTree([], root);
  run.push(TAGS.RB_DONE, {});
  return run.trace;
}

/** Rotates the node holding `value`, one pointer change per frame. */
export function simulateRotate(
  inputData: BSTInputItem[],
  dir: "left" | "right",
  value: number,
): ExecutionTrace {
  const run = createRun(inputData);
  const path: AVLNode[] = [];
  let node = run.getRoot() ?? undefined;
  while (node && Number(node.value) !== value) {
    path.push(node);
    node = value < Number(node.value) ? node.left : node.right;
  }

  if (!node) {
    run.push(TAGS.ROT_MISSING, { val: value }, visited(path));
    return run.trace;
  }

  const pivot = dir === "left" ? node.right : node.left;
  if (!pivot) {
    run.push(TAGS.ROT_BLOCKED, { val: value, dir }, {
      ...visited(path),
      [node.id]: AVLStatus.Target,
    });
    return run.trace;
  }

  const target = node;
  run.push(TAGS.ROT_SELECT, { val: value }, {
    ...visited(path),
    [target.id]: AVLStatus.Target,
  });
  run.push(dir === "left" ? TAGS.ROTATE_LEFT : TAGS.ROTATE_RIGHT, {
    node: target.value,
    pivot: pivot.value,
    case: "manual",
  }, {
    ...visited(path),
    [target.id]: AVLStatus.Target,
    [pivot.id]: AVLStatus.Rotating,
  });
  run.rotateWithFrames(target, dir === "left" ? "left" : "right", visited(path), (sub) =>
    run.replaceInParent(path, path.length, target, sub),
  );
  run.push(TAGS.ROT_DONE, { val: value, pivot: pivot.value }, visited(path));
  return run.trace;
}

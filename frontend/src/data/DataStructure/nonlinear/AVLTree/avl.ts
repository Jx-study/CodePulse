import {
  buildBST,
  type BSTInputItem,
  type LogicTreeNode,
} from "../BinarySearchTree/simulateTrace";

export type AVLNode = LogicTreeNode;

export const height = (node: AVLNode | undefined): number =>
  node ? 1 + Math.max(height(node.left), height(node.right)) : 0;

export const balanceFactor = (node: AVLNode | undefined): number =>
  node ? height(node.left) - height(node.right) : 0;

export function rotateRight(y: AVLNode): AVLNode {
  const x = y.left!;
  y.left = x.right;
  x.right = y;
  return x;
}

export function rotateLeft(x: AVLNode): AVLNode {
  const y = x.right!;
  x.right = y.left;
  y.left = x;
  return y;
}

export function rebalance(node: AVLNode): AVLNode {
  const bf = balanceFactor(node);
  if (bf > 1) {
    if (balanceFactor(node.left) < 0) node.left = rotateLeft(node.left!);
    return rotateRight(node);
  }
  if (bf < -1) {
    if (balanceFactor(node.right) > 0) node.right = rotateRight(node.right!);
    return rotateLeft(node);
  }
  return node;
}

export function insertItem(
  root: AVLNode | undefined,
  item: BSTInputItem,
): AVLNode {
  if (!root) return { id: item.id, value: item.value, count: 1 };
  if (Number(item.value) === Number(root.value)) {
    root.count += 1;
    return root;
  }
  if (Number(item.value) < Number(root.value)) {
    root.left = insertItem(root.left, item);
  } else {
    root.right = insertItem(root.right, item);
  }
  return rebalance(root);
}

export const isBalancedTree = (node: AVLNode | undefined): boolean =>
  !node ||
  (Math.abs(balanceFactor(node)) <= 1 &&
    isBalancedTree(node.left) &&
    isBalancedTree(node.right));

/** Keeps rotating until the node is balanced; each rotation can unbalance the nodes that moved down. */
function settle(node: AVLNode): AVLNode {
  let top = node;
  for (let guard = 0; guard < 200 && Math.abs(balanceFactor(top)) > 1; guard++) {
    top = rebalance(top);
    top.left = rebalanceTree(top.left);
    top.right = rebalanceTree(top.right);
  }
  return top;
}

export function rebalanceTree(node: AVLNode | undefined): AVLNode | undefined {
  if (!node) return undefined;
  node.left = rebalanceTree(node.left);
  node.right = rebalanceTree(node.right);
  return settle(node);
}

export type RotateStatus = "ok" | "missing" | "blocked";

/** Rotates the node holding `value`; blocked means it has no child to move up. */
export function rotateAt(
  root: AVLNode | undefined,
  value: number,
  dir: "left" | "right",
): { root: AVLNode | undefined; status: RotateStatus } {
  const path: AVLNode[] = [];
  let curr = root;
  while (curr && Number(curr.value) !== value) {
    path.push(curr);
    curr = value < Number(curr.value) ? curr.left : curr.right;
  }
  if (!curr) return { root, status: "missing" };
  if (!(dir === "left" ? curr.right : curr.left)) {
    return { root, status: "blocked" };
  }
  const sub = dir === "left" ? rotateLeft(curr) : rotateRight(curr);
  const parent = path[path.length - 1];
  if (!parent) return { root: sub, status: "ok" };
  if (parent.left === curr) parent.left = sub;
  else parent.right = sub;
  return { root, status: "ok" };
}

function removeMin(node: AVLNode): AVLNode | undefined {
  if (!node.left) return node.right;
  node.left = removeMin(node.left);
  return rebalance(node);
}

export function deleteItem(
  root: AVLNode | undefined,
  value: number,
): AVLNode | undefined {
  if (!root) return undefined;
  if (value < Number(root.value)) {
    root.left = deleteItem(root.left, value);
  } else if (value > Number(root.value)) {
    root.right = deleteItem(root.right, value);
  } else {
    if (root.count > 1) {
      root.count -= 1;
      return root;
    }
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let successor = root.right;
    while (successor.left) successor = successor.left;
    root.value = successor.value;
    root.count = successor.count;
    root.right = removeMin(root.right);
  }
  return rebalance(root);
}

export function buildAVL(items: BSTInputItem[]): AVLNode | null {
  let root: AVLNode | undefined;
  items.forEach((item) => {
    root = insertItem(root, item);
  });
  return root ?? null;
}

/**
 * The tree is stored as its preorder, one entry per stored value. Replaying a
 * preorder into a plain BST rebuilds exactly the same shape, so the stored
 * state never depends on how the tree got balanced.
 */
export function toState(root: AVLNode | null | undefined): BSTInputItem[] {
  const list: BSTInputItem[] = [];
  const walk = (node: AVLNode | undefined) => {
    if (!node) return;
    list.push({ id: node.id, value: node.value });
    for (let i = 1; i < node.count; i++) {
      list.push({ id: `${node.id}~${i}`, value: node.value });
    }
    walk(node.left);
    walk(node.right);
  };
  walk(root ?? undefined);
  return list;
}

export const fromState = (state: BSTInputItem[]): AVLNode | null =>
  buildBST(state);

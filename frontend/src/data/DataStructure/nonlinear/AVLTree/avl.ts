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

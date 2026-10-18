import { describe, expect, it } from "vitest";
import {
  balanceFactor,
  buildAVL,
  fromState,
  height,
  toState,
  type AVLNode,
} from "../avl";
import { avlTreeConfig } from "../AVLTree";
import { avlTraceToSteps } from "../traceToSteps";
import { simulateAVLTrace } from "../simulateTrace";
import { AVL_OPS } from "../ops";

const items = (values: number[]) =>
  values.map((value, i) => ({ id: `n${i}`, value }));

const inorder = (node: AVLNode | null | undefined): number[] =>
  node ? [...inorder(node.left), node.value, ...inorder(node.right)] : [];

const everyNode = (
  node: AVLNode | null | undefined,
  check: (n: AVLNode) => void,
) => {
  if (!node) return;
  check(node);
  everyNode(node.left, check);
  everyNode(node.right, check);
};

const shape = (node: AVLNode | null | undefined): unknown =>
  node ? [node.value, shape(node.left), shape(node.right)] : null;

describe("AVL insertion", () => {
  it.each([
    ["LL", [30, 20, 10]],
    ["RR", [10, 20, 30]],
    ["LR", [30, 10, 20]],
    ["RL", [10, 30, 20]],
  ])("rebalances a %s case into a three-node tree rooted at 20", (_, values) => {
    const root = buildAVL(items(values))!;

    expect(shape(root)).toEqual([20, [10, null, null], [30, null, null]]);
  });

  it("keeps every balance factor within -1 and +1 for ascending input", () => {
    const root = buildAVL(items(Array.from({ length: 20 }, (_, i) => i + 1)));

    everyNode(root, (n) => expect(Math.abs(balanceFactor(n))).toBeLessThanOrEqual(1));
    expect(height(root!)).toBeLessThanOrEqual(6);
  });

  it("keeps the BST ordering for random input", () => {
    const values = Array.from({ length: 40 }, (_, i) => (i * 37) % 97);
    const root = buildAVL(items(values));

    const sorted = [...new Set(values)].sort((a, b) => a - b);
    expect(inorder(root)).toEqual(sorted);
    everyNode(root, (n) => expect(Math.abs(balanceFactor(n))).toBeLessThanOrEqual(1));
  });

  it("counts duplicates on the existing node instead of adding a node", () => {
    const root = buildAVL(items([5, 5, 5, 3]))!;

    expect(root.count).toBe(3);
    expect(inorder(root)).toEqual([3, 5]);
  });
});

describe("AVL stored state", () => {
  it("replays into exactly the same tree shape, duplicates included", () => {
    const root = buildAVL(items([50, 20, 70, 10, 30, 60, 80, 20, 25, 5, 1]))!;

    const replayed = fromState(toState(root))!;

    expect(shape(replayed)).toEqual(shape(root));
    expect(replayed.left!.count).toBe(root.left!.count);
  });
});

describe("AVL level config", () => {
  it("starts from a perfectly balanced tree and shows a balance factor on every node", () => {
    const state = avlTreeConfig.defaultData as { id: string; value: number }[];
    const steps = avlTraceToSteps(simulateAVLTrace(state));

    const labels = steps[0].elements
      .filter((el) => el.kind === "node")
      .map((el) => el.description);

    expect(labels).toHaveLength(7);
    expect(labels.every((l) => l?.endsWith("BF 0"))).toBe(true);
    expect(labels).toContain("h3 · BF 0");
  });

  it("builds an AVL tree when loading values in an unbalanced order", () => {
    const handler = avlTreeConfig.actionHandler!;
    let id = 0;
    const context = { nextId: () => `id-${id++}`, defaultData: [] } as never;

    const result = handler("load", { data: [1, 2, 3, 4, 5, 6, 7] }, [], context)!;
    const root = fromState(result.animationData as never)!;

    expect(root.value).toBe(4);
    everyNode(root, (n) => expect(Math.abs(balanceFactor(n))).toBeLessThanOrEqual(1));
  });

  it("lists every planned operation in the action bar registry", () => {
    expect(AVL_OPS.map((op) => op.id)).toEqual([
      "insert",
      "delete",
      "search",
      "min",
      "max",
      "floor",
      "ceil",
      "preorder",
      "inorder",
      "postorder",
      "levelorder",
      "checkBalance",
      "rotateLeft",
      "rotateRight",
      "autoBalance",
      "rebalance",
    ]);
  });
});

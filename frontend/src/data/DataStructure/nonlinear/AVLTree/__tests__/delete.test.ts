import { describe, expect, it } from "vitest";
import { avlTreeConfig } from "../AVLTree";
import {
  balanceFactor,
  buildAVL,
  deleteItem,
  fromState,
  toState,
  type AVLNode,
} from "../avl";
import { simulateAVLTrace, type AVLInputItem } from "../simulateTrace";
import { avlTraceToSteps } from "../traceToSteps";
import { TAGS, AVLStatus } from "../tags";
import { mountStructure } from "@/data/__tests__/harness";

const stateOf = (values: number[]): AVLInputItem[] =>
  toState(buildAVL(values.map((value, i) => ({ id: `n${i}`, value }))));

const deleteTrace = (values: number[], value: number) =>
  simulateAVLTrace(stateOf(values), { mode: "Delete", value });

const tagsOf = (trace: { tag: string }[]) => trace.map((e) => e.tag);

const shape = (node: AVLNode | null | undefined): unknown =>
  node ? [node.value, shape(node.left), shape(node.right)] : null;

const lastState = (trace: ReturnType<typeof deleteTrace>) =>
  (trace[trace.length - 1].meta as unknown as { inputData: AVLInputItem[] })
    .inputData;

const isBalanced = (node: AVLNode | undefined): boolean =>
  !node ||
  (Math.abs(balanceFactor(node)) <= 1 &&
    isBalanced(node.left) &&
    isBalanced(node.right));

describe("AVL delete trace", () => {
  it("ends in exactly the tree that the plain AVL delete produces", () => {
    let seed = 11;
    const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648);
    const values = Array.from({ length: 18 }, () => next() % 30);

    for (let round = 0; round < 60; round++) {
      const before = stateOf(values);
      const value = next() % 30;
      const trace = simulateAVLTrace(before, { mode: "Delete", value });
      const expected = deleteItem(fromState(before) ?? undefined, value);

      expect(shape(fromState(lastState(trace)))).toEqual(shape(expected));
      expect(isBalanced(expected)).toBe(true);
    }
  });

  it("only says the tree is empty when there is nothing to delete", () => {
    expect(tagsOf(deleteTrace([], 5))).toEqual([TAGS.DEL_EMPTY]);
  });

  it("walks down and stops with not-found when the value is missing", () => {
    const tags = tagsOf(deleteTrace([20, 10, 30], 99));

    expect(tags[tags.length - 1]).toBe(TAGS.DEL_NOT_FOUND);
    expect(tags).not.toContain(TAGS.DEL_BF_CHECK);
  });

  it("only lowers the count of a duplicated value", () => {
    const trace = deleteTrace([20, 10, 30, 10], 10);

    expect(tagsOf(trace)).toContain(TAGS.DEL_COUNT_DEC);
    expect(tagsOf(trace)).not.toContain(TAGS.DEL_BF_CHECK);
    expect(lastState(trace)).toHaveLength(3);
  });

  it("removes a leaf, then checks every ancestor", () => {
    const tags = tagsOf(deleteTrace([40, 20, 60, 10, 30, 50, 70], 10));

    expect(tags).toContain(TAGS.DEL_LEAF);
    expect(tags).toContain(TAGS.DEL_REMOVE);
    expect(tags.filter((t) => t === TAGS.DEL_BF_CHECK)).toHaveLength(2);
    expect(tags[tags.length - 1]).toBe(TAGS.DEL_DONE);
  });

  it("lets the only child take the place of the deleted node", () => {
    const trace = deleteTrace([20, 10, 30, 25], 30);

    expect(tagsOf(trace)).toContain(TAGS.DEL_ONE_CHILD);
    expect(shape(fromState(lastState(trace)))).toEqual([
      20,
      [10, null, null],
      [25, null, null],
    ]);
  });

  it("copies the successor over a node with two children, then removes the successor", () => {
    const trace = deleteTrace([40, 20, 60, 10, 30, 50, 70, 45], 40);
    const tags = tagsOf(trace);

    expect(tags.filter((t) => t === TAGS.DEL_SUCC_FIND)).toHaveLength(3);
    expect(tags.indexOf(TAGS.DEL_SUCC_COPY)).toBeLessThan(
      tags.indexOf(TAGS.DEL_SUCC_REMOVE),
    );
    expect(shape(fromState(lastState(trace)))).toEqual([
      45,
      [20, [10, null, null], [30, null, null]],
      [60, [50, null, null], [70, null, null]],
    ]);
  });

  it("shows the count on a node that stores a value more than once", () => {
    const steps = avlTraceToSteps(deleteTrace([20, 10, 30, 10], 10));
    const labels = (tag: string) =>
      steps
        .find((s) => s.actionTag === tag)!
        .elements.filter((el) => el.kind === "node")
        .map((el) => el.description);

    expect(labels(TAGS.DEL_COMPARE)).toContain("h1 · BF 0 · ×2");
    expect(labels(TAGS.DEL_COUNT_DEC).some((l) => l?.includes("×"))).toBe(false);
  });

  it("keeps the deleted node's id on the node that now holds the successor's value", () => {
    const steps = avlTraceToSteps(deleteTrace([20, 10, 30], 20));
    const final = steps[steps.length - 1].elements.filter(
      (el) => el.kind === "node",
    );

    expect(final.map((el) => el.id).sort()).toEqual(["n0", "n1"]);
  });

  it.each([
    ["LL", [20, 10, 30, 5], 30, [TAGS.UNBALANCED_LEFT, TAGS.ROTATE_RIGHT]],
    ["RR", [20, 10, 30, 40], 10, [TAGS.UNBALANCED_RIGHT, TAGS.ROTATE_LEFT]],
    [
      "LR",
      [20, 10, 30, 15],
      30,
      [TAGS.UNBALANCED_LEFT, TAGS.ROTATE_CHILD_LEFT, TAGS.ROTATE_RIGHT],
    ],
    [
      "RL",
      [20, 10, 30, 25],
      10,
      [TAGS.UNBALANCED_RIGHT, TAGS.ROTATE_CHILD_RIGHT, TAGS.ROTATE_LEFT],
    ],
  ])("rebalances the %s case after the removal", (_, existing, value, expected) => {
    const rotationTags = tagsOf(deleteTrace(existing, value)).filter((t) =>
      [
        TAGS.UNBALANCED_LEFT,
        TAGS.UNBALANCED_RIGHT,
        TAGS.ROTATE_CHILD_LEFT,
        TAGS.ROTATE_CHILD_RIGHT,
        TAGS.ROTATE_LEFT,
        TAGS.ROTATE_RIGHT,
      ].includes(t as never),
    );

    expect(rotationTags).toEqual(expected);
  });

  it("rotates once on a sibling with balance factor 0", () => {
    const tags = tagsOf(deleteTrace([20, 10, 30, 5, 15], 30));

    expect(tags).toContain(TAGS.ROTATE_RIGHT);
    expect(tags).not.toContain(TAGS.ROTATE_CHILD_LEFT);
  });

  it("rebalances at more than one level on the way up", () => {
    const values = [4, 11, 18, 25, 1, 8, 15, 22, 29, 5, 12, 19];
    const before = stateOf(values);
    const trace = simulateAVLTrace(before, { mode: "Delete", value: 1 });
    const unbalanced = tagsOf(trace).filter(
      (t) => t === TAGS.UNBALANCED_LEFT || t === TAGS.UNBALANCED_RIGHT,
    );
    const expected = deleteItem(fromState(before) ?? undefined, 1);

    expect(unbalanced.length).toBeGreaterThanOrEqual(2);
    expect(shape(fromState(lastState(trace)))).toEqual(shape(expected));
    expect(isBalanced(expected)).toBe(true);
  });

  it("moves the successor's whole count up to the deleted node", () => {
    const trace = deleteTrace([20, 10, 30, 25, 25], 20);
    const values = lastState(trace)
      .map((d) => Math.round(d.value))
      .sort((a, b) => a - b);

    expect(values).toEqual([10, 25, 25, 30]);
    expect(shape(fromState(lastState(trace)))).toEqual([
      25,
      [10, null, null],
      [30, null, null],
    ]);
  });

  it("deletes a root that has only one child", () => {
    const trace = deleteTrace([20, 10], 20);

    expect(tagsOf(trace)).toContain(TAGS.DEL_ONE_CHILD);
    expect(shape(fromState(lastState(trace)))).toEqual([10, null, null]);
  });

  it("hangs the successor's right subtree where the successor was", () => {
    const state: AVLInputItem[] = [20, 10, 5, 40, 30, 35, 50].map(
      (value, i) => ({ id: `p${i}`, value }),
    );
    const trace = simulateAVLTrace(state, { mode: "Delete", value: 20 });

    expect(tagsOf(trace)).toContain(TAGS.DEL_SUCC_REMOVE);
    expect(shape(fromState(lastState(trace)))).toEqual([
      30,
      [10, [5, null, null], null],
      [40, [35, null, null], [50, null, null]],
    ]);
  });

  it("keeps the ancestors not yet checked blue while walking back up", () => {
    const steps = avlTraceToSteps(
      deleteTrace([40, 20, 60, 10, 30, 50, 70], 10),
    );
    const checks = steps.filter((s) => s.actionTag === TAGS.DEL_BF_CHECK);
    const statusOf = (step: (typeof steps)[number], id: string) =>
      step.elements.find((el) => el.id === id)!.status;

    // n0 = 40 (root), n1 = 20: the first check is on 20, so the root is still pending
    expect(statusOf(checks[0], "n1")).toBe(AVLStatus.Target);
    expect(statusOf(checks[0], "n0")).toBe(AVLStatus.Visited);
    // by the time the root is checked, 20 is plain again
    expect(statusOf(checks[1], "n1")).toBe(AVLStatus.Inactive);
  });

  it("keeps every node in place between finding the successor and copying its value", () => {
    const steps = avlTraceToSteps(
      deleteTrace([40, 20, 60, 10, 30, 50, 70, 45], 40),
    );
    const positions = (index: number) =>
      Object.fromEntries(
        steps[index].elements
          .filter((el) => el.kind === "node")
          .map((el) => [el.id, el.position]),
      );
    const tags = steps.map((s) => s.actionTag);
    const lastFind = tags.lastIndexOf(TAGS.DEL_SUCC_FIND);
    const copy = tags.indexOf(TAGS.DEL_SUCC_COPY);

    expect(copy).toBe(lastFind + 1);
    expect(positions(copy)).toEqual(positions(lastFind));
  });

  it("shows the copied value on the deleted node while the successor is still there", () => {
    const steps = avlTraceToSteps(
      deleteTrace([40, 20, 60, 10, 30, 50, 70, 45], 40),
    );
    const copy = steps.find((s) => s.actionTag === TAGS.DEL_SUCC_COPY)!;
    const values = copy.elements
      .filter((el) => el.kind === "node")
      .map((el) => el.value);

    expect(values.filter((v) => v === "45")).toHaveLength(2);
    expect(values).not.toContain("40");
  });

  it("uses the successor-path check tag for nodes below the deleted node", () => {
    const tags = tagsOf(deleteTrace([40, 20, 60, 10, 30, 50, 70, 45], 40));

    expect(tags).toContain(TAGS.DEL_BF_CHECK_SUCC);
    expect(tags.filter((t) => t === TAGS.DEL_BF_CHECK)).toHaveLength(1);
  });

  it("deletes the last value and leaves an empty tree", () => {
    const trace = deleteTrace([5], 5);

    expect(lastState(trace)).toEqual([]);
    expect(() => avlTraceToSteps(trace)).not.toThrow();
  });

  it("lights every If line of Delete, MinNode and RemoveMin across the common cases", () => {
    const mappings = avlTreeConfig.codeConfig!.pseudo!.mappings!;
    const lit = new Set<number>();
    const scenarios: [number[], number][] = [
      [[], 5],
      [[20, 10, 30], 99],
      [[20, 10, 30], 10],
      [[20, 10, 30], 30],
      [[20, 10, 30, 10], 10],
      [[20, 10, 30, 25], 30],
      [[20, 10, 30, 5], 20],
      [[40, 20, 60, 10, 30, 50, 70, 45], 40],
      [[20, 10, 30, 5], 30],
    ];
    scenarios.forEach(([values, value]) =>
      deleteTrace(values, value).forEach((e) =>
        (mappings[e.tag] ?? []).forEach((n) => lit.add(n)),
      ),
    );
    const content = avlTreeConfig.codeConfig!.pseudo!.content;
    const lines = content
      .slice(0, content.indexOf("Procedure IsBalanced"))
      .split("\n");
    const start = lines.findIndex((l) => l.startsWith("Procedure Delete"));
    const unlit = lines
      .map((text, i) => [i + 1, text.trim()] as const)
      .filter(([n]) => n > start)
      .filter(([n, text]) => text.startsWith("If ") && !lit.has(n));

    expect(unlit).toEqual([]);
  });
});

describe("AVL delete through the action pipeline", () => {
  it("tells the learner when the tree is empty and stores nothing", () => {
    const avl = mountStructure(avlTreeConfig, {}, []);

    const steps = avl.remove("Delete", 5);

    expect(steps.map((s) => s.actionTag)).toEqual([TAGS.DEL_EMPTY]);
    expect(avl.count()).toBe(0);
  });

  it("plays the steps and stores the tree without the value", () => {
    const avl = mountStructure(avlTreeConfig, {}, stateOf([20, 10, 30]));

    const steps = avl.remove("Delete", 10);

    expect(steps.map((s) => s.actionTag)).toContain(TAGS.DEL_REMOVE);
    expect(avl.count()).toBe(2);
  });

  it("leaves the stored tree alone when the value is missing", () => {
    const avl = mountStructure(avlTreeConfig, {}, stateOf([20, 10, 30]));

    const steps = avl.remove("Delete", 99);

    expect(steps[steps.length - 1].actionTag).toBe(TAGS.DEL_NOT_FOUND);
    expect(avl.count()).toBe(3);
  });
});

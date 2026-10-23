import { describe, expect, it } from "vitest";
import { avlTreeConfig } from "../AVLTree";
import {
  balanceFactor,
  buildAVL,
  fromState,
  isBalancedTree,
  rebalanceTree,
  toState,
  type AVLNode,
} from "../avl";
import { simulateAVLTrace, type AVLInputItem } from "../simulateTrace";
import { avlTraceToSteps } from "../traceToSteps";
import { TAGS, AVLStatus } from "../tags";
import { buildBST } from "../../BinarySearchTree/simulateTrace";
import { mountStructure } from "@/data/__tests__/harness";
import type { AnimationStep } from "@/types";

const DEFAULT = [40, 20, 60, 10, 30, 50, 70];
const CHAIN = [1, 2, 3, 4, 5, 6, 7];

const plainState = (values: number[]): AVLInputItem[] =>
  toState(buildBST(values.map((value, i) => ({ id: `n${i}`, value }))));

const balancedState = (values: number[]): AVLInputItem[] =>
  toState(buildAVL(values.map((value, i) => ({ id: `n${i}`, value }))));

const tagsOf = (steps: AnimationStep[]) => steps.map((s) => s.actionTag);

const statusOfValue = (step: AnimationStep, value: number) =>
  step.elements.find((el) => el.kind === "node" && el.value === String(value))!
    .status;

const nodeStatuses = (step: AnimationStep) =>
  step.elements.filter((el) => el.kind === "node").map((el) => el.status);

const shape = (node: AVLNode | null | undefined): unknown =>
  node ? [node.value, shape(node.left), shape(node.right)] : null;

const mount = (state: AVLInputItem[]) =>
  mountStructure(avlTreeConfig, {}, state);

describe("AVL loading values", () => {
  it("keeps the order typed, and shows the broken nodes in red", () => {
    const avl = mount(balancedState(DEFAULT));

    const steps = avl.custom("load", { data: CHAIN });

    expect(avl.count()).toBe(7);
    const first = steps[0];
    expect(statusOfValue(first, 1)).toBe(AVLStatus.Unbalanced);
    expect(nodeStatuses(first).filter((s) => s === AVLStatus.Unbalanced)).toHaveLength(5);
  });

  it("random and reset still give a balanced tree", () => {
    const handler = avlTreeConfig.actionHandler!;
    let id = 0;
    const context = {
      nextId: () => `id-${id++}`,
      defaultData: balancedState(DEFAULT),
    } as never;

    for (const action of ["random", "reset"]) {
      const result = handler(action, { randomCount: 12 }, [], context)!;
      expect(isBalancedTree(fromState(result.animationData as never) ?? undefined)).toBe(true);
    }
  });
});

describe("AVL insert and delete on an unbalanced tree", () => {
  it.each([
    ["insert", (avl: ReturnType<typeof mount>) => avl.add(8, "Insert")],
    ["delete", (avl: ReturnType<typeof mount>) => avl.remove("Delete", 7)],
  ])("%s is stopped with a warning and changes nothing", (_, run) => {
    const avl = mount(plainState(CHAIN));

    const steps = run(avl);

    expect(tagsOf(steps)).toEqual([TAGS.NEED_BALANCE]);
    expect(steps[0].warn).toBe(true);
    expect(avl.warning).toHaveBeenCalledWith("animation.need_balance");
    expect(avl.count()).toBe(7);
  });

  it("works again once the tree is rebalanced", () => {
    const avl = mount(plainState(CHAIN));

    avl.custom("rebalance", {});
    const steps = avl.add(8, "Insert");

    expect(tagsOf(steps)).toContain(TAGS.INS_PLACE);
    expect(avl.count()).toBe(8);
  });

  it("a balanced tree is not stopped", () => {
    const avl = mount(balancedState(DEFAULT));

    expect(tagsOf(avl.add(5, "Insert"))).not.toContain(TAGS.NEED_BALANCE);
  });
});

describe("AVL check balance", () => {
  const tagsOfCheck = (state: AVLInputItem[]) =>
    mount(state).custom("checkBalance", {});

  it("runs the recursion call by call, with the empty children as their own steps", () => {
    const steps = tagsOfCheck(balancedState([20, 10, 30]));

    expect(tagsOf(steps)).toEqual([
      TAGS.CHK_CALL, TAGS.CHK_GO_LEFT,
      TAGS.CHK_CALL, TAGS.CHK_GO_LEFT, TAGS.CHK_NULL, TAGS.CHK_GO_RIGHT, TAGS.CHK_NULL, TAGS.CHK_BF, TAGS.CHK_OK,
      TAGS.CHK_GO_RIGHT,
      TAGS.CHK_CALL, TAGS.CHK_GO_LEFT, TAGS.CHK_NULL, TAGS.CHK_GO_RIGHT, TAGS.CHK_NULL, TAGS.CHK_BF, TAGS.CHK_OK,
      TAGS.CHK_BF, TAGS.CHK_OK,
      TAGS.CHK_DONE_OK,
    ]);
    const calls = steps
      .filter((s) => s.actionTag === TAGS.CHK_CALL)
      .map((s) => (s.local_vars as { node: number; depth: number }));
    expect(calls).toEqual([
      { node: 20, depth: 1 },
      { node: 10, depth: 2 },
      { node: 30, depth: 2 },
    ]);
  });

  it("highlights the node being called, the callers above it, and keeps the finished ones colored", () => {
    const steps = tagsOfCheck(balancedState([20, 10, 30]));
    const callOfTen = steps.find(
      (s) => s.actionTag === TAGS.CHK_CALL && (s.local_vars as { node: number }).node === 10,
    )!;
    const rightOfRoot = steps.find((s) => s.actionTag === TAGS.CHK_GO_RIGHT && (s.local_vars as { node: number }).node === 20)!;

    expect(statusOfValue(callOfTen, 10)).toBe(AVLStatus.Target);
    expect(statusOfValue(callOfTen, 20)).toBe(AVLStatus.Visited);
    expect(statusOfValue(rightOfRoot, 10)).toBe(AVLStatus.Complete);
    expect(statusOfValue(rightOfRoot, 30)).toBe(AVLStatus.Prepare);
  });

  it("lights a different part of the pseudocode at each kind of step", () => {
    const mappings = avlTreeConfig.codeConfig!.pseudo!.mappings!;
    const steps = tagsOfCheck(balancedState([20, 10, 30]));
    const distinct = new Set(
      steps.map((s) => JSON.stringify(mappings[s.actionTag as string])),
    );

    expect(distinct.size).toBeGreaterThanOrEqual(5);
    expect(mappings[TAGS.CHK_GO_LEFT]).not.toEqual(mappings[TAGS.CHK_GO_RIGHT]);
    expect(mappings[TAGS.CHK_OK]).not.toEqual(mappings[TAGS.CHK_BAD]);
  });

  it("carries the returned value up: a balanced node above a broken one still returns False", () => {
    const steps = tagsOfCheck(plainState([20, 10, 30, 5, 3, 25, 35]));
    const verdicts = steps.filter(
      (s) => s.actionTag === TAGS.CHK_OK || s.actionTag === TAGS.CHK_BAD,
    );
    const root = verdicts[verdicts.length - 1];

    expect(root.actionTag).toBe(TAGS.CHK_OK);
    expect(root.local_vars).toMatchObject({ node: 20, result: false });
    expect(root.description).toMatchObject({ key: "animation.chk_ok_child_bad" });
    expect(tagsOf(steps)[steps.length - 1]).toBe(TAGS.CHK_DONE_BAD);
  });

  it("marks every broken node of a degenerate tree and leaves the tree alone", () => {
    const avl = mount(plainState(CHAIN));

    const steps = avl.custom("checkBalance", {});
    const tags = tagsOf(steps);
    const last = steps[steps.length - 1];

    expect(tags.filter((t) => t === TAGS.CHK_OK)).toHaveLength(2);
    expect(tags.filter((t) => t === TAGS.CHK_BAD)).toHaveLength(5);
    expect(tags[tags.length - 1]).toBe(TAGS.CHK_DONE_BAD);
    expect((last.local_vars as { bad: number }).bad).toBe(5);
    expect(statusOfValue(last, 1)).toBe(AVLStatus.Unbalanced);
    expect(statusOfValue(last, 7)).toBe(AVLStatus.Complete);
    expect(avl.count()).toBe(7);
  });

  it("reports a balanced tree", () => {
    const steps = tagsOfCheck(balancedState(DEFAULT));

    expect(tagsOf(steps)[steps.length - 1]).toBe(TAGS.CHK_DONE_OK);
    expect(tagsOf(steps)).not.toContain(TAGS.CHK_BAD);
  });

  it("says so when the tree is empty", () => {
    expect(tagsOf(tagsOfCheck([]))).toEqual([TAGS.CHK_EMPTY]);
  });
});

describe("AVL rebalance", () => {
  it("rotates the broken nodes and ends with every node balanced", () => {
    const avl = mount(plainState(CHAIN));

    const steps = avl.custom("rebalance", {});
    const last = steps[steps.length - 1];

    expect(tagsOf(steps)).toContain(TAGS.ROT_LEFT_RETURN);
    expect(last.actionTag).toBe(TAGS.RB_DONE);
    expect(nodeStatuses(last).every((s) => s !== AVLStatus.Unbalanced)).toBe(true);
    expect(
      last.elements
        .filter((el) => el.kind === "node")
        .every((el) => /BF [+-]?[01]$/.test(el.description ?? "")),
    ).toBe(true);
    expect(avl.count()).toBe(7);
  });

  it("leaves a balanced tree alone", () => {
    expect(tagsOf(mount(balancedState(DEFAULT)).custom("rebalance", {}))).toEqual([
      TAGS.RB_ALREADY,
    ]);
    expect(tagsOf(mount([]).custom("rebalance", {}))).toEqual([TAGS.RB_ALREADY]);
  });

  it("only checks the nodes on the way to the broken one, and the new subtree root again", () => {
    const state = plainState([40, 20, 60, 10, 30, 50, 70, 5, 3]);
    const steps = mount(state).custom("rebalance", {});
    const checked = steps
      .filter((s) => s.actionTag === TAGS.RB_BF_CHECK)
      .map((s) => (s.local_vars as { node: number }).node);

    // 5 moves up in the rotation at 10, so it is checked once more
    expect(checked).toEqual([10, 5, 20, 40]);
  });

  it("gives the same tree as the plain rebalance for many random trees", () => {
    let seed = 3;
    const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648);

    for (let round = 0; round < 80; round++) {
      const values = Array.from({ length: 1 + (next() % 16) }, () => next() % 50);
      const state = plainState(values);
      const trace = simulateAVLTrace(state, { mode: "Rebalance" });
      const final = (trace[trace.length - 1].meta as unknown as {
        inputData: AVLInputItem[];
      }).inputData;
      const expected = rebalanceTree(fromState(state) ?? undefined);

      expect(isBalancedTree(expected)).toBe(true);
      expect(shape(fromState(final))).toEqual(shape(expected));
      expect(toState(expected).map((d) => d.value).sort()).toEqual(
        state.map((d) => d.value).sort(),
      );
    }
  });

  it("keeps the in-order sequence of a degenerate tree", () => {
    const root = rebalanceTree(fromState(plainState(CHAIN)) ?? undefined);
    const inorder: number[] = [];
    const walk = (n: AVLNode | undefined) => {
      if (!n) return;
      walk(n.left);
      inorder.push(n.value);
      walk(n.right);
    };
    walk(root);

    expect(inorder).toEqual(CHAIN);
    expect(balanceFactor(root)).toBe(0);
  });
});

describe("AVL manual rotation", () => {
  it("plays the pointer changes and breaks the balance visibly", () => {
    const avl = mount(balancedState(DEFAULT));

    const steps = avl.custom("rotateRight", { value: 20 });
    const tags = tagsOf(steps);

    expect(tags[0]).toBe(TAGS.ROT_SELECT);
    expect(tags).toContain(TAGS.ROTATE_RIGHT);
    expect(tags).toContain(TAGS.ROT_RIGHT_LINK);
    expect(tags[tags.length - 1]).toBe(TAGS.ROT_DONE);
    expect(nodeStatuses(steps[steps.length - 1])).toContain(AVLStatus.Unbalanced);
    expect(avl.count()).toBe(7);
  });

  it("stores the rotated tree, so the next check sees the imbalance and rebalance fixes it", () => {
    const avl = mount(balancedState(DEFAULT));

    avl.custom("rotateRight", { value: 20 });
    const check = avl.custom("checkBalance", {});
    expect(tagsOf(check)[check.length - 1]).toBe(TAGS.CHK_DONE_BAD);

    avl.custom("rebalance", {});
    const again = avl.custom("checkBalance", {});
    expect(tagsOf(again)[again.length - 1]).toBe(TAGS.CHK_DONE_OK);
  });

  it("a left rotation undoes a right rotation", () => {
    const avl = mount(balancedState(DEFAULT));

    avl.custom("rotateRight", { value: 20 });
    avl.custom("rotateLeft", { value: 10 });
    const check = avl.custom("checkBalance", {});

    expect(tagsOf(check)[check.length - 1]).toBe(TAGS.CHK_DONE_OK);
  });

  it.each([
    ["rotateLeft", 10, TAGS.ROT_BLOCKED, "animation.rot_blocked_left"],
    ["rotateRight", 10, TAGS.ROT_BLOCKED, "animation.rot_blocked_right"],
    ["rotateLeft", 99, TAGS.ROT_MISSING, "animation.rot_missing"],
  ])("%s on %i is refused with a warning", (action, value, tag, key) => {
    const avl = mount(balancedState(DEFAULT));

    const steps = avl.custom(action, { value });

    expect(tagsOf(steps)).toEqual([tag]);
    expect(avl.warning).toHaveBeenCalledWith(key);
    expect(avl.count()).toBe(7);
  });
});

describe("AVL search", () => {
  const search = (state: AVLInputItem[], value: number) =>
    mount(state).search(value, "Search");

  it("walks to the value and counts the nodes it compared", () => {
    const steps = search(balancedState(DEFAULT), 30);

    expect(tagsOf(steps)).toEqual([
      TAGS.SRCH_COMPARE,
      TAGS.SRCH_LEFT,
      TAGS.SRCH_COMPARE,
      TAGS.SRCH_RIGHT,
      TAGS.SRCH_COMPARE,
      TAGS.SRCH_FOUND,
    ]);
    expect(steps[steps.length - 1].local_vars).toMatchObject({ steps: 3 });
  });

  it("takes fewer comparisons after the tree is rebalanced", () => {
    const avl = mount(plainState(CHAIN));
    const before = avl.search(7, "Search");
    avl.custom("rebalance", {});
    const after = avl.search(7, "Search");

    expect(before[before.length - 1].local_vars).toMatchObject({ steps: 7 });
    expect(
      (after[after.length - 1].local_vars as { steps: number }).steps,
    ).toBeLessThanOrEqual(3);
  });

  it("works on an unbalanced tree without changing it", () => {
    const avl = mount(plainState(CHAIN));

    const steps = avl.search(5, "Search");

    expect(tagsOf(steps)[steps.length - 1]).toBe(TAGS.SRCH_FOUND);
    expect(avl.count()).toBe(7);
  });

  it("ends with not-found when the value is missing, and on an empty tree", () => {
    const missing = search(balancedState(DEFAULT), 35);
    expect(tagsOf(missing)[missing.length - 1]).toBe(TAGS.SRCH_NOT_FOUND);
    expect(tagsOf(search([], 5))).toEqual([TAGS.SRCH_EMPTY]);
  });

  it("shows the count of a value stored more than once", () => {
    const steps = search(balancedState([20, 10, 30, 10]), 10);
    const labels = steps[steps.length - 1].elements
      .filter((el) => el.kind === "node")
      .map((el) => el.description);

    expect(labels).toContain("h1 · BF 0 · ×2");
  });
});

describe("AVL balance pseudocode", () => {
  it("lights every If line of IsBalanced, RebalanceTree and Search", () => {
    const mappings = avlTreeConfig.codeConfig!.pseudo!.mappings!;
    const lit = new Set<number>();
    const light = (steps: { tag: string }[]) =>
      steps.forEach((e) => (mappings[e.tag] ?? []).forEach((n) => lit.add(n)));
    const run = (state: AVLInputItem[], mode: string, value?: number) =>
      light(simulateAVLTrace(state, { mode, value }));

    [[], plainState(CHAIN), balancedState(DEFAULT)].forEach((state) => {
      run(state, "CheckBalance");
      run(state, "Rebalance");
    });
    [[], balancedState(DEFAULT)].forEach((state) =>
      [30, 70, 35].forEach((v) => run(state, "Search", v)),
    );

    const lines = avlTreeConfig.codeConfig!.pseudo!.content.split("\n");
    const start = lines.findIndex((l) => l.startsWith("Procedure IsBalanced"));
    const unlit = lines
      .map((text, i) => [i + 1, text.trim()] as const)
      .filter(([n]) => n > start)
      .filter(([n, text]) => text.startsWith("If ") && !lit.has(n));

    expect(unlit).toEqual([]);
  });
});

describe("AVL trace stays in step with the rotation animation", () => {
  it("the rebalance trace renders without errors for a degenerate tree", () => {
    const trace = simulateAVLTrace(plainState(CHAIN), { mode: "Rebalance" });

    expect(() => avlTraceToSteps(trace)).not.toThrow();
    expect(trace.length).toBeGreaterThan(10);
  });
});

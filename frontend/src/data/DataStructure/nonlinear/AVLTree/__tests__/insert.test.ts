import { describe, expect, it } from "vitest";
import { avlTreeConfig } from "../AVLTree";
import { buildAVL, fromState, insertItem, toState, type AVLNode } from "../avl";
import { simulateAVLTrace, type AVLInputItem } from "../simulateTrace";
import { avlTraceToSteps } from "../traceToSteps";
import { TAGS, AVLStatus } from "../tags";
import { mountStructure } from "@/data/__tests__/harness";

const stateOf = (values: number[]): AVLInputItem[] =>
  toState(buildAVL(values.map((value, i) => ({ id: `n${i}`, value }))));

const insertTrace = (values: number[], value: number) =>
  simulateAVLTrace(stateOf(values), { mode: "Insert", value, targetId: "new" });

const tagsOf = (trace: { tag: string }[]) => trace.map((e) => e.tag);

const shape = (node: AVLNode | null | undefined): unknown =>
  node ? [node.value, shape(node.left), shape(node.right)] : null;

const lastState = (trace: ReturnType<typeof insertTrace>) =>
  (trace[trace.length - 1].meta as unknown as { inputData: AVLInputItem[] })
    .inputData;

describe("AVL insert trace", () => {
  it("ends in exactly the tree that the plain AVL insert produces", () => {
    let seed = 7;
    const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648);
    const values: number[] = [];
    for (let round = 0; round < 60; round++) {
      const value = next() % 40;
      const before = stateOf(values);
      const trace = simulateAVLTrace(before, {
        mode: "Insert",
        value,
        targetId: `new${round}`,
      });
      const expected = insertItem(fromState(before) ?? undefined, {
        id: `new${round}`,
        value,
      });

      expect(shape(fromState(lastState(trace)))).toEqual(shape(expected));
      values.push(value);
    }
  });

  it("puts the first value in an empty tree at the root", () => {
    const trace = insertTrace([], 5);

    expect(tagsOf(trace)).toEqual([TAGS.INS_PLACE, TAGS.INS_DONE]);
  });

  it("counts a duplicate on the existing node without rebalancing", () => {
    const trace = insertTrace([20, 10, 30], 10);

    expect(tagsOf(trace)).toContain(TAGS.INS_EQUAL);
    expect(tagsOf(trace)).not.toContain(TAGS.INS_PLACE);
    expect(tagsOf(trace)).not.toContain(TAGS.BF_CHECK);
  });

  it("walks down with compare and direction steps, then back up checking every ancestor", () => {
    const trace = insertTrace([40, 20, 60, 10, 30, 50, 70], 5);
    const tags = tagsOf(trace);

    expect(tags.filter((t) => t === TAGS.INS_COMPARE)).toHaveLength(3);
    expect(tags.filter((t) => t === TAGS.INS_LEFT)).toHaveLength(3);
    expect(tags.filter((t) => t === TAGS.BF_CHECK)).toHaveLength(3);
    expect(tags.filter((t) => t === TAGS.BALANCED)).toHaveLength(3);
  });

  it.each([
    ["LL", [30, 20], 10, [TAGS.UNBALANCED_LEFT, TAGS.ROTATE_RIGHT]],
    ["RR", [10, 20], 30, [TAGS.UNBALANCED_RIGHT, TAGS.ROTATE_LEFT]],
    ["LR", [30, 10], 20, [TAGS.UNBALANCED_LEFT, TAGS.ROTATE_CHILD_LEFT, TAGS.ROTATE_RIGHT]],
    ["RL", [10, 30], 20, [TAGS.UNBALANCED_RIGHT, TAGS.ROTATE_CHILD_RIGHT, TAGS.ROTATE_LEFT]],
  ])("plays the %s case as flagged, then the rotation steps in order", (_, existing, value, expected) => {
    const trace = insertTrace(existing, value);
    const rotationTags = tagsOf(trace).filter((t) =>
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
    expect(shape(fromState(lastState(trace)))).toEqual([
      20,
      [10, null, null],
      [30, null, null],
    ]);
  });

  it("marks the unbalanced node red and the rotated nodes purple", () => {
    const steps = avlTraceToSteps(insertTrace([30, 20], 10));
    const statusOf = (tag: string, id: string) =>
      steps
        .find((s) => s.actionTag === tag)!
        .elements.find((el) => el.id === id)!.status;

    expect(statusOf(TAGS.UNBALANCED_LEFT, "n0")).toBe(AVLStatus.Unbalanced);
    expect(statusOf(TAGS.ROT_RIGHT_PIVOT, "n0")).toBe(AVLStatus.Rotating);
  });

  it("shows the imbalance in the labels before the rotation and a balanced tree after it", () => {
    const steps = avlTraceToSteps(insertTrace([30, 20], 10));
    const labelsAt = (tag: string) =>
      steps
        .find((s) => s.actionTag === tag)!
        .elements.filter((el) => el.kind === "node")
        .map((el) => el.description);

    expect(labelsAt(TAGS.UNBALANCED_LEFT)).toContain("h3 · BF +2");
    expect(
      labelsAt(TAGS.INS_DONE).every((l) => /BF [+-]?[01]$/.test(l ?? "")),
    ).toBe(true);
  });

  it("lights every Insert and Rebalance line across the common cases", () => {
    const mappings = avlTreeConfig.codeConfig!.pseudo!.mappings!;
    const lit = new Set<number>();
    const scenarios: [number[], number][] = [
      [[], 5],
      [[20, 10, 30], 10],
      [[40, 20, 60, 10, 30, 50, 70], 5],
      [[30, 20], 10],
      [[10, 20], 30],
      [[30, 10], 20],
      [[10, 30], 20],
    ];
    scenarios.forEach(([values, value]) =>
      insertTrace(values, value).forEach((e) =>
        (mappings[e.tag] ?? []).forEach((n) => lit.add(n)),
      ),
    );
    const lines = avlTreeConfig.codeConfig!.pseudo!.content.split("\n");
    const unlit = lines
      .map((text, i) => [i + 1, text.trim()] as const)
      .filter(([n, text]) => text.startsWith("If ") && !lit.has(n));

    expect(unlit).toEqual([]);
    [8, 9, 44, 47, 50, 51, 26, 27, 28, 29, 30, 31, 35, 36, 37, 38, 39, 40].forEach(
      (n) => expect(lit.has(n)).toBe(true),
    );
  });
});

describe("AVL rotation, one pointer change per step", () => {
  const values = [30, 20, 40, 10, 25];
  const steps = () => avlTraceToSteps(insertTrace(values, 5));
  const frame = (tag: string) => steps().find((s) => s.actionTag === tag)!;
  const pos = (tag: string, id: string) =>
    frame(tag).elements.find((el) => el.id === id)!.position;
  const linksOf = (tag: string) =>
    frame(tag).links!.map((l) => `${l.sourceId}>${l.targetId}`);

  it("plays RotateRight as a call step followed by one step per statement", () => {
    const tags = steps().map((s) => s.actionTag);
    const at = tags.indexOf(TAGS.ROTATE_RIGHT);

    expect(tags.slice(at, at + 7)).toEqual([
      TAGS.ROTATE_RIGHT,
      TAGS.ROT_RIGHT_PIVOT,
      TAGS.ROT_RIGHT_MOVE,
      TAGS.ROT_RIGHT_LINK,
      TAGS.ROT_RIGHT_HEIGHT_NODE,
      TAGS.ROT_RIGHT_HEIGHT_PIVOT,
      TAGS.ROT_RIGHT_RETURN,
    ]);
  });

  it("plays a double rotation as two full rotations, child first", () => {
    const tags = tagsOf(insertTrace([30, 10], 20));

    expect(tags.filter((t) => t === TAGS.ROT_LEFT_RETURN)).toHaveLength(1);
    expect(tags.filter((t) => t === TAGS.ROT_RIGHT_RETURN)).toHaveLength(1);
    expect(tags.indexOf(TAGS.ROT_LEFT_RETURN)).toBeLessThan(
      tags.indexOf(TAGS.ROT_RIGHT_PIVOT),
    );
  });

  it("moves the shared subtree: it is linked from both nodes in between", () => {
    expect(linksOf(TAGS.ROT_RIGHT_PIVOT)).toContain("n0>n1");
    expect(linksOf(TAGS.ROT_RIGHT_MOVE)).toEqual(
      expect.arrayContaining(["n0>n4", "n1>n4"]),
    );
    expect(linksOf(TAGS.ROT_RIGHT_MOVE)).not.toContain("n0>n1");
    expect(linksOf(TAGS.ROT_RIGHT_LINK)).toEqual(
      expect.arrayContaining(["n1>n0", "n0>n4"]),
    );
    expect(linksOf(TAGS.ROT_RIGHT_LINK)).not.toContain("n1>n4");
  });

  it("keeps the nodes where they were until the rotation returns", () => {
    const before = pos(TAGS.ROT_RIGHT_PIVOT, "n0");

    expect(pos(TAGS.ROT_RIGHT_MOVE, "n0")).toEqual(before);
    expect(pos(TAGS.ROT_RIGHT_HEIGHT_PIVOT, "n0")).toEqual(before);
    expect(pos(TAGS.ROT_RIGHT_RETURN, "n0")).not.toEqual(before);
  });

  it("names the variables on the nodes and shows the updated heights", () => {
    const label = (tag: string, id: string) =>
      frame(tag).elements.find((el) => el.id === id)!.description;

    expect(label(TAGS.ROT_RIGHT_PIVOT, "n0")).toBe("y");
    expect(label(TAGS.ROT_RIGHT_PIVOT, "n1")).toBe("x");
    expect(label(TAGS.ROT_RIGHT_MOVE, "n4")).toBe("T2");
    expect(label(TAGS.ROT_RIGHT_HEIGHT_NODE, "n0")).toBe("y · h2");
    expect(label(TAGS.ROT_RIGHT_HEIGHT_PIVOT, "n1")).toBe("x · h3");
  });

  it("uses the empty variant of the move step when there is no subtree to move", () => {
    const desc = avlTraceToSteps(insertTrace([30, 20], 10)).find(
      (s) => s.actionTag === TAGS.ROT_RIGHT_MOVE,
    )!.description as { key: string };

    expect(desc.key).toBe("animation.rot_right_move_empty");
  });
});

describe("AVL insert through the action pipeline", () => {
  it("plays the steps and stores the rebalanced tree", () => {
    const avl = mountStructure(avlTreeConfig, {}, stateOf([30, 20]));

    const steps = avl.add(10, "Insert");

    expect(steps.length).toBeGreaterThan(3);
    expect(steps.map((s) => s.actionTag)).toContain(TAGS.ROTATE_RIGHT);
    expect(avl.count()).toBe(3);
    expect(avl.warning).not.toHaveBeenCalled();
  });

  it("stores the preorder of the tree after the rotation", () => {
    const handler = avlTreeConfig.actionHandler!;
    const context = { nextId: () => "new", defaultData: [] } as never;

    const result = handler("add", { value: 10 }, stateOf([30, 20]), context)!;

    expect(shape(fromState(result.stateData as AVLInputItem[]))).toEqual([
      20,
      [10, null, null],
      [30, null, null],
    ]);
    expect(result.animationData).toEqual(stateOf([30, 20]));
  });
});

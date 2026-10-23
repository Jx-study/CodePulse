import type { ExecutionTrace, JsonValue } from "@/types/trace";
import type { BSTInputItem } from "../BinarySearchTree/simulateTrace";
import {
  balanceFactor,
  fromState,
  height,
  toState,
  type AVLNode,
} from "./avl";
import { TAGS, AVLStatus } from "./tags";

export type StatusMap = Record<string, string>;

export const visited = (path: AVLNode[]): StatusMap =>
  Object.fromEntries(path.map((n) => [n.id, AVLStatus.Visited]));

/**
 * The recorder shared by insert and delete: it owns the logic tree, appends
 * one frame per step, and replays the walk back up the path that rebalances.
 */
export function createRun(inputData: BSTInputItem[]) {
  const trace: ExecutionTrace = [];
  let root = fromState(inputData);

  const push = (
    tag: string,
    vars: Record<string, JsonValue>,
    statusMap: StatusMap = {},
  ) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: [],
      meta: {
        inputData: toState(root).map((d) => ({ ...d })),
        statusMap: { ...statusMap },
        linkStatusMap: {},
      },
    });
  };

  const replaceInParent = (
    path: AVLNode[],
    index: number,
    node: AVLNode,
    sub: AVLNode | undefined,
  ) => {
    const parent = path[index - 1];
    if (!parent) root = sub ?? null;
    else if (parent.left === node) parent.left = sub;
    else parent.right = sub;
  };

  const edgesFrom = (roots: (AVLNode | undefined)[]): string[][] => {
    const seen = new Set<AVLNode>();
    const keys = new Set<string>();
    const edges: string[][] = [];
    const walk = (n: AVLNode | undefined) => {
      if (!n || seen.has(n)) return;
      seen.add(n);
      [n.left, n.right].forEach((c) => {
        if (!c) return;
        const key = `${n.id}>${c.id}`;
        if (!keys.has(key)) {
          keys.add(key);
          edges.push([n.id, c.id]);
        }
        walk(c);
      });
    };
    roots.forEach(walk);
    return edges;
  };

  /**
   * One frame per statement of RotateRight / RotateLeft. While the pointers are
   * being changed the nodes keep their old positions and the links are drawn
   * from the live pointers, so a shared subtree is briefly linked twice.
   */
  const rotateWithFrames = (
    node: AVLNode,
    dir: "right" | "left",
    fresh: StatusMap,
    attach: (sub: AVLNode) => void,
  ) => {
    const right = dir === "right";
    const pivot = (right ? node.left : node.right)!;
    const layoutState = toState(root).map((d) => ({ ...d }));
    const nodeName = right ? "y" : "x";
    const pivotName = right ? "x" : "y";
    const T = TAGS;
    const tags = right
      ? {
          pivot: T.ROT_RIGHT_PIVOT,
          move: T.ROT_RIGHT_MOVE,
          link: T.ROT_RIGHT_LINK,
          heightNode: T.ROT_RIGHT_HEIGHT_NODE,
          heightPivot: T.ROT_RIGHT_HEIGHT_PIVOT,
          ret: T.ROT_RIGHT_RETURN,
        }
      : {
          pivot: T.ROT_LEFT_PIVOT,
          move: T.ROT_LEFT_MOVE,
          link: T.ROT_LEFT_LINK,
          heightNode: T.ROT_LEFT_HEIGHT_NODE,
          heightPivot: T.ROT_LEFT_HEIGHT_PIVOT,
          ret: T.ROT_LEFT_RETURN,
        };

    const pushPointers = (
      tag: string,
      vars: Record<string, JsonValue>,
      labels: Record<string, string>,
      extraStatus: StatusMap = {},
      changed?: string[],
    ) => {
      trace.push({
        tag,
        local_vars: vars,
        dataSnapshot: [],
        meta: {
          inputData: layoutState,
          statusMap: {
            ...fresh,
            [node.id]: AVLStatus.Rotating,
            [pivot.id]: AVLStatus.Rotating,
            ...extraStatus,
          },
          linkStatusMap: changed ? { [`${changed[0]}->${changed[1]}`]: "target" } : {},
          rotation: {
            edges: edgesFrom([root ?? undefined, node, pivot]),
            labels,
          },
        },
      });
    };

    const base = { node: node.value, pivot: pivot.value };
    const names = { [node.id]: nodeName, [pivot.id]: pivotName };

    pushPointers(tags.pivot, base, names);

    const moved = right ? pivot.right : pivot.left;
    if (right) node.left = moved;
    else node.right = moved;
    const movedNames = moved ? { ...names, [moved.id]: "T2" } : names;
    pushPointers(
      tags.move,
      { ...base, t2: moved ? moved.value : null },
      movedNames,
      moved ? { [moved.id]: AVLStatus.Prepare } : {},
      moved ? [node.id, moved.id] : undefined,
    );

    if (right) pivot.right = node;
    else pivot.left = node;
    pushPointers(tags.link, base, movedNames, {}, [pivot.id, node.id]);

    pushPointers(
      tags.heightNode,
      { ...base, height: height(node) },
      { ...movedNames, [node.id]: `${nodeName} · h${height(node)}` },
    );
    pushPointers(
      tags.heightPivot,
      { ...base, height: height(pivot) },
      {
        ...movedNames,
        [node.id]: `${nodeName} · h${height(node)}`,
        [pivot.id]: `${pivotName} · h${height(pivot)}`,
      },
    );

    attach(pivot);
    push(tags.ret, base, {
      ...fresh,
      [node.id]: AVLStatus.Rotating,
      [pivot.id]: AVLStatus.Rotating,
    });
  };

  /**
   * Checks the node at path[index] and rotates it when it is out of balance.
   * Returns the root of that subtree afterwards (the node itself when no
   * rotation was needed).
   */
  const rebalanceAt = (
    path: AVLNode[],
    i: number,
    fresh: StatusMap,
    checkTag: string,
  ): AVLNode => {
    const node = path[i];
    // Ancestors not yet checked stay blue, checked ones go back to plain
    const base: StatusMap = { ...visited(path.slice(0, i)), ...fresh };
    const bf = balanceFactor(node);

    push(checkTag, { node: node.value, height: height(node), bf }, {
      ...base,
      [node.id]: AVLStatus.Target,
    });

    if (Math.abs(bf) <= 1) {
      push(TAGS.BALANCED, { node: node.value, bf }, {
        ...base,
        [node.id]: AVLStatus.Visited,
      });
      return node;
    }

    const leftHeavy = bf > 1;
    const child = (leftHeavy ? node.left : node.right)!;
    const childBf = balanceFactor(child);
    const isDouble = leftHeavy ? childBf < 0 : childBf > 0;
    const caseName = leftHeavy
      ? isDouble ? "LR" : "LL"
      : isDouble ? "RL" : "RR";
    const grand = (
      isDouble
        ? leftHeavy ? child.right : child.left
        : leftHeavy ? child.left : child.right
    )!;

    push(
      leftHeavy ? TAGS.UNBALANCED_LEFT : TAGS.UNBALANCED_RIGHT,
      { node: node.value, bf, child: child.value, childBf, case: caseName },
      {
        ...base,
        [node.id]: AVLStatus.Unbalanced,
        [child.id]: AVLStatus.Prepare,
        [grand.id]: AVLStatus.Prepare,
      },
    );

    const involved: StatusMap = {
      ...base,
      [node.id]: AVLStatus.Unbalanced,
      [child.id]: AVLStatus.Rotating,
      [grand.id]: AVLStatus.Rotating,
    };

    if (isDouble) {
      push(
        leftHeavy ? TAGS.ROTATE_CHILD_LEFT : TAGS.ROTATE_CHILD_RIGHT,
        { node: child.value, pivot: grand.value },
        involved,
      );
      rotateWithFrames(child, leftHeavy ? "left" : "right", base, (sub) => {
        if (leftHeavy) node.left = sub;
        else node.right = sub;
      });
    }

    const pivot = (leftHeavy ? node.left : node.right)!;
    push(
      leftHeavy ? TAGS.ROTATE_RIGHT : TAGS.ROTATE_LEFT,
      { node: node.value, pivot: pivot.value, case: caseName },
      { ...base, [node.id]: AVLStatus.Unbalanced, [pivot.id]: AVLStatus.Rotating },
    );
    rotateWithFrames(node, leftHeavy ? "right" : "left", base, (sub) =>
      replaceInParent(path, i, node, sub),
    );

    return pivot;
  };

  const rebalancePath = (
    path: AVLNode[],
    fresh: StatusMap,
    checkTag: (index: number) => string,
  ) => {
    for (let i = path.length - 1; i >= 0; i--) {
      rebalanceAt(path, i, fresh, checkTag(i));
    }
  };

  return {
    trace,
    push,
    rebalanceAt,
    rotateWithFrames,
    rebalancePath,
    replaceInParent,
    getRoot: () => root,
    setRoot: (node: AVLNode | null) => {
      root = node;
    },
  };
}

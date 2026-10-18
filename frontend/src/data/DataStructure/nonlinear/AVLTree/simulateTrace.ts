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

export type AVLInputItem = BSTInputItem;

export interface AVLAction {
  mode?: string;
  value?: number;
  targetId?: string;
}

type StatusMap = Record<string, string>;

export function simulateAVLTrace(
  inputData: AVLInputItem[],
  action?: AVLAction,
): ExecutionTrace {
  if (
    action?.mode === "Insert" &&
    action.value !== undefined &&
    action.targetId
  ) {
    return simulateInsert(inputData, Number(action.value), action.targetId);
  }

  if (action?.mode === "Delete" && action.value !== undefined) {
    return simulateDelete(inputData, Math.round(Number(action.value)));
  }

  return [
    {
      tag: TAGS.INIT,
      local_vars: { nodeCount: inputData.length },
      dataSnapshot: [],
      meta: {
        inputData: inputData.map((d) => ({ ...d })),
        statusMap: {},
        linkStatusMap: {},
      },
    },
  ];
}

const visited = (path: AVLNode[]): StatusMap =>
  Object.fromEntries(path.map((n) => [n.id, AVLStatus.Visited]));

/**
 * The recorder shared by insert and delete: it owns the logic tree, appends
 * one frame per step, and replays the walk back up the path that rebalances.
 */
function createRun(inputData: AVLInputItem[]) {
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

  /** Walks the path from the bottom up, checking every node and rotating where needed. */
  const rebalancePath = (
    path: AVLNode[],
    fresh: StatusMap,
    checkTag: (index: number) => string,
  ) => {
    for (let i = path.length - 1; i >= 0; i--) {
      const node = path[i];
      const bf = balanceFactor(node);

      push(checkTag(i), { node: node.value, height: height(node), bf }, {
        ...fresh,
        [node.id]: AVLStatus.Target,
      });

      if (Math.abs(bf) <= 1) {
        push(TAGS.BALANCED, { node: node.value, bf }, {
          ...fresh,
          [node.id]: AVLStatus.Visited,
        });
        continue;
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
          ...fresh,
          [node.id]: AVLStatus.Unbalanced,
          [child.id]: AVLStatus.Prepare,
          [grand.id]: AVLStatus.Prepare,
        },
      );

      const involved: StatusMap = {
        ...fresh,
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
        rotateWithFrames(child, leftHeavy ? "left" : "right", fresh, (sub) => {
          if (leftHeavy) node.left = sub;
          else node.right = sub;
        });
      }

      const pivot = (leftHeavy ? node.left : node.right)!;
      push(
        leftHeavy ? TAGS.ROTATE_RIGHT : TAGS.ROTATE_LEFT,
        { node: node.value, pivot: pivot.value, case: caseName },
        { ...fresh, [node.id]: AVLStatus.Unbalanced, [pivot.id]: AVLStatus.Rotating },
      );
      rotateWithFrames(node, leftHeavy ? "right" : "left", fresh, (sub) =>
        replaceInParent(path, i, node, sub),
      );
    }
  };

  return {
    trace,
    push,
    rebalancePath,
    replaceInParent,
    getRoot: () => root,
    setRoot: (node: AVLNode | null) => {
      root = node;
    },
  };
}

function simulateInsert(
  inputData: AVLInputItem[],
  value: number,
  newId: string,
): ExecutionTrace {
  const run = createRun(inputData);
  const { trace, push } = run;
  const root = run.getRoot();

  const created = (): AVLNode => ({ id: newId, value, count: 1 });

  if (!root) {
    run.setRoot(created());
    push(TAGS.INS_PLACE, { val: value, parent: null }, {
      [newId]: AVLStatus.Complete,
    });
    push(TAGS.INS_DONE, { val: value }, { [newId]: AVLStatus.Complete });
    return trace;
  }

  const path: AVLNode[] = [];
  let curr: AVLNode = root;
  for (;;) {
    push(TAGS.INS_COMPARE, { val: value, curr: curr.value }, {
      ...visited(path),
      [curr.id]: AVLStatus.Target,
    });

    if (value === Number(curr.value)) {
      curr.count += 1;
      push(TAGS.INS_EQUAL, { val: value, count: curr.count }, {
        ...visited(path),
        [curr.id]: AVLStatus.Complete,
      });
      push(TAGS.INS_DONE, { val: value }, { [curr.id]: AVLStatus.Complete });
      return trace;
    }

    const goLeft = value < Number(curr.value);
    push(goLeft ? TAGS.INS_LEFT : TAGS.INS_RIGHT, { val: value, curr: curr.value }, {
      ...visited(path),
      [curr.id]: AVLStatus.Prepare,
    });
    path.push(curr);

    const next: AVLNode | undefined = goLeft ? curr.left : curr.right;
    if (!next) {
      const node = created();
      if (goLeft) curr.left = node;
      else curr.right = node;
      push(TAGS.INS_PLACE, { val: value, parent: curr.value }, {
        ...visited(path),
        [newId]: AVLStatus.Complete,
      });
      break;
    }
    curr = next;
  }

  run.rebalancePath(path, { [newId]: AVLStatus.Complete }, () => TAGS.BF_CHECK);

  push(TAGS.INS_DONE, { val: value }, { [newId]: AVLStatus.Complete });
  return trace;
}

function simulateDelete(
  inputData: AVLInputItem[],
  value: number,
): ExecutionTrace {
  const run = createRun(inputData);
  const { trace, push } = run;
  const root = run.getRoot();

  if (!root) {
    push(TAGS.DEL_EMPTY, { val: value });
    return trace;
  }

  const path: AVLNode[] = [];
  let curr: AVLNode = root;
  for (;;) {
    push(TAGS.DEL_COMPARE, { val: value, curr: curr.value }, {
      ...visited(path),
      [curr.id]: AVLStatus.Target,
    });
    if (value === Number(curr.value)) break;

    const goLeft = value < Number(curr.value);
    push(goLeft ? TAGS.DEL_LEFT : TAGS.DEL_RIGHT, { val: value, curr: curr.value }, {
      ...visited(path),
      [curr.id]: AVLStatus.Prepare,
    });
    path.push(curr);

    const next: AVLNode | undefined = goLeft ? curr.left : curr.right;
    if (!next) {
      push(TAGS.DEL_NOT_FOUND, { val: value }, visited(path));
      return trace;
    }
    curr = next;
  }

  const target = curr;
  push(TAGS.DEL_FOUND, { val: value, count: target.count }, {
    ...visited(path),
    [target.id]: AVLStatus.Complete,
  });

  if (target.count > 1) {
    target.count -= 1;
    push(TAGS.DEL_COUNT_DEC, { val: value, count: target.count }, {
      ...visited(path),
      [target.id]: AVLStatus.Complete,
    });
    return trace;
  }

  if (!target.left || !target.right) {
    const child = target.left ?? target.right;
    push(child ? TAGS.DEL_ONE_CHILD : TAGS.DEL_LEAF, {
      val: value,
      child: child ? child.value : null,
    }, {
      ...visited(path),
      [target.id]: AVLStatus.Target,
      ...(child ? { [child.id]: AVLStatus.Prepare } : {}),
    });

    run.replaceInParent(path, path.length, target, child);
    push(TAGS.DEL_REMOVE, { val: value, child: child ? child.value : null }, {
      ...visited(path),
      ...(child ? { [child.id]: AVLStatus.Complete } : {}),
    });

    run.rebalancePath(path, {}, () => TAGS.DEL_BF_CHECK);
    push(TAGS.DEL_DONE, { val: value });
    return trace;
  }

  push(TAGS.DEL_TWO_CHILD, { val: value }, {
    ...visited(path),
    [target.id]: AVLStatus.Target,
  });

  const succPath: AVLNode[] = [];
  let succ = target.right;
  for (;;) {
    const last = !succ.left;
    push(TAGS.DEL_SUCC_FIND, { val: value, succ: succ.value, last }, {
      ...visited(path),
      [target.id]: AVLStatus.Target,
      ...visited(succPath),
      [succ.id]: last ? AVLStatus.Complete : AVLStatus.Prepare,
    });
    if (last) break;
    succPath.push(succ);
    succ = succ.left!;
  }

  // The successor's value is nudged by 0.0001 while both nodes exist, so
  // replaying the preorder does not merge them into one counted node
  const succValue = Number(succ.value);
  target.value = succValue;
  target.count = succ.count;
  succ.value = succValue + 0.0001;
  push(TAGS.DEL_SUCC_COPY, { val: value, succ: succValue }, {
    ...visited(path),
    ...visited(succPath),
    [target.id]: AVLStatus.Complete,
    [succ.id]: AVLStatus.Target,
  });

  const full = [...path, target, ...succPath];
  run.replaceInParent(full, full.length, succ, succ.right);
  push(TAGS.DEL_SUCC_REMOVE, {
    val: value,
    succ: succValue,
    child: succ.right ? succ.right.value : null,
  }, {
    ...visited(full),
    [target.id]: AVLStatus.Complete,
  });

  run.rebalancePath(
    full,
    { [target.id]: AVLStatus.Complete },
    (i) => (i > path.length ? TAGS.DEL_BF_CHECK_SUCC : TAGS.DEL_BF_CHECK),
  );
  push(TAGS.DEL_DONE, { val: value }, { [target.id]: AVLStatus.Complete });
  return trace;
}

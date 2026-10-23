import type { ExecutionTrace } from "@/types/trace";
import type { BSTInputItem } from "../BinarySearchTree/simulateTrace";
import { type AVLNode } from "./avl";
import { TAGS, AVLStatus } from "./tags";
import { createRun, visited } from "./run";
import {
  simulateCheckBalance,
  simulateNeedBalance,
  simulateRebalance,
  simulateRotate,
} from "./simulateBalance";
import { simulateSearch } from "./simulateQuery";

export type AVLInputItem = BSTInputItem;

export interface AVLAction {
  mode?: string;
  value?: number;
  targetId?: string;
}

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

  const value = Math.round(Number(action?.value ?? 0));
  switch (action?.mode) {
    case "NeedBalance":
      return simulateNeedBalance(inputData);
    case "CheckBalance":
      return simulateCheckBalance(inputData);
    case "Rebalance":
      return simulateRebalance(inputData);
    case "RotateLeft":
      return simulateRotate(inputData, "left", value);
    case "RotateRight":
      return simulateRotate(inputData, "right", value);
    case "Search":
      return simulateSearch(inputData, value);
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

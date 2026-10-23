import type { ExecutionTrace, JsonValue } from "@/types/trace";
import type { linkStatus } from "@/modules/core/Render/D3Renderer";
import type { BSTInputItem } from "../BinarySearchTree/simulateTrace";
import { updateLinkStatus } from "../utils";
import { fromState, type AVLNode } from "./avl";
import { AVLStatus, TAGS } from "./tags";

type StatusMap = Record<string, string>;

/** Read-only walk: the tree never changes, only the highlighted path does. */
export function simulateSearch(
  inputData: BSTInputItem[],
  value: number,
): ExecutionTrace {
  const trace: ExecutionTrace = [];
  const links: Record<string, linkStatus> = {};
  const edges: [string, string][] = [];
  const trail: AVLNode[] = [];

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
        inputData: inputData.map((d) => ({ ...d })),
        statusMap: { ...statusMap },
        linkStatusMap: { ...links },
      },
    });
  };

  const visited = (): StatusMap =>
    Object.fromEntries(trail.map((n) => [n.id, AVLStatus.Visited]));

  const settle = (status: linkStatus) =>
    edges.forEach(([u, v]) => updateLinkStatus(links, u, v, status, false));

  const root = fromState(inputData);
  if (!root) {
    push(TAGS.SRCH_EMPTY, { val: value });
    return trace;
  }

  let curr = root;
  for (;;) {
    push(TAGS.SRCH_COMPARE, { val: value, curr: curr.value, steps: trail.length + 1 }, {
      ...visited(),
      [curr.id]: AVLStatus.Target,
    });
    if (value === Number(curr.value)) {
      settle("complete");
      push(TAGS.SRCH_FOUND, {
        val: value,
        count: curr.count,
        steps: trail.length + 1,
      }, {
        ...visited(),
        [curr.id]: AVLStatus.Complete,
      });
      return trace;
    }

    const goLeft = value < Number(curr.value);
    const next = goLeft ? curr.left : curr.right;
    if (next) {
      updateLinkStatus(links, curr.id, next.id, "prepare", true);
      edges.push([curr.id, next.id]);
    }
    push(goLeft ? TAGS.SRCH_LEFT : TAGS.SRCH_RIGHT, {
      val: value,
      curr: curr.value,
    }, {
      ...visited(),
      [curr.id]: AVLStatus.Target,
      ...(next ? { [next.id]: AVLStatus.Prepare } : {}),
    });
    trail.push(curr);
    if (!next) {
      settle("unfinished");
      push(TAGS.SRCH_NOT_FOUND, { val: value, steps: trail.length }, visited());
      return trace;
    }
    curr = next;
  }
}

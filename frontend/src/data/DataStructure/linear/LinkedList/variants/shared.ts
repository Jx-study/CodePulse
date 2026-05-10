import { Pointer } from "@/modules/core/DataLogic/Pointer";
import { Node } from "@/modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import {
  LinearData as ListNodeData,
  createNodeInstance,
  linkNodes,
  linkNodesDoubly,
  syncPointersFromNextPrev,
} from "../../utils";

import type { AnimationStep } from "@/types";

export function addStep(steps: AnimationStep[], stepData: AnimationStep) {
  steps.push(stepData);
}

export function linkForVariant(nodes: Node[], isDoubly: boolean) {
  if (isDoubly) {
    linkNodesDoubly(nodes);
  } else {
    linkNodes(nodes);
  }
}

/** InsertAtIndex 雙向：僅 newNode.next = succ */
export function wireIndexDoublyLinkNext(
  oldChain: Node[],
  newNode: Node,
  succ?: Node,
) {
  linkNodesDoubly(oldChain);
  if (succ) newNode.next = succ;
  newNode.prev = null;
  syncPointersFromNextPrev([...oldChain, newNode]);
}

/** succ.prev = newNode */
export function wireIndexDoublySuccPrev(
  oldChain: Node[],
  newNode: Node,
  succ?: Node,
) {
  linkNodesDoubly(oldChain);
  if (succ) {
    newNode.next = succ;
    succ.prev = newNode;
  }
  newNode.prev = null;
  syncPointersFromNextPrev([...oldChain, newNode]);
}

/** pred.next = newNode，newNode.prev 仍為 null */
export function wireIndexDoublyPredNext(
  oldChain: Node[],
  newNode: Node,
  pred: Node,
  succ?: Node,
) {
  linkNodesDoubly(oldChain);
  if (succ) {
    newNode.next = succ;
    succ.prev = newNode;
  }
  newNode.prev = null;
  pred.next = newNode;
  syncPointersFromNextPrev([...oldChain, newNode]);
}

/** 雙向插入完成：newNode.prev = pred */
export function wireIndexDoublyFull(
  oldChain: Node[],
  newNode: Node,
  pred: Node,
  succ?: Node,
) {
  linkNodesDoubly(oldChain);
  pred.next = newNode;
  newNode.prev = pred;
  if (succ) {
    newNode.next = succ;
    succ.prev = newNode;
  }
  syncPointersFromNextPrev([...oldChain, newNode]);
}

export function getLabel(
  index: number,
  totalLength: number,
  hasTailMode: boolean,
  extra: string = "",
): string {
  const labels: string[] = [];
  if (index === 0) labels.push("head");
  if (hasTailMode && index === totalLength - 1) labels.push("tail");
  if (extra) labels.push(extra);

  return labels.length > 0 ? labels.join("/") : "";
}

export function createPointers(
  x: number,
  y: number,
  config: {
    isHead?: boolean;
    isTail?: boolean;
    extraLabel?: string;
  },
): Pointer[] {
  const pointers: Pointer[] = [];
  const gap = 100;
  const yOffset = gap / 2;

  const { isHead, isTail, extraLabel } = config;

  if (isHead) {
    const headPtr = new Pointer("head");
    headPtr.id = `head-pointer`;

    const xOffset = isTail ? -20 : 0;
    headPtr.moveTo(x + xOffset, y + yOffset);
    pointers.push(headPtr);
  }

  if (isTail) {
    const tailPtr = new Pointer("tail");
    tailPtr.id = `tail-pointer`;

    const xOffset = isHead ? 20 : 0;
    tailPtr.moveTo(x + xOffset, y + yOffset);
    pointers.push(tailPtr);
  }

  if (extraLabel) {
    const extraPtr = new Pointer(extraLabel, "down");
    extraPtr.id = `${extraLabel}-pointer`;
    extraPtr.moveTo(x, y - yOffset);
    pointers.push(extraPtr);
  }

  return pointers;
}

/** 頂層工廠函式：依 hasTailMode 決定是否顯示 tail pointer */
export function makeNodeAndPointers(
  item: ListNodeData,
  i: number,
  total: number,
  x: number,
  y: number,
  hasTailMode: boolean,
  status: Status = Status.Unfinished,
  overrideLabel?: string,
  extraLabel?: string,
) {
  const node = createNodeInstance(item.id, item.value, x, y, status, "");
  node.description = String(i);

  let isHead = false;
  let isTail = false;

  if (overrideLabel !== undefined) {
    if (overrideLabel.includes("head")) isHead = true;
  } else if (i === 0) {
    isHead = true;
  }

  if (hasTailMode) {
    if (overrideLabel !== undefined) {
      if (overrideLabel.includes("tail")) isTail = true;
    } else if (i === total - 1) {
      isTail = true;
    }
  }

  const pointers = createPointers(x, y, { isHead, isTail, extraLabel });
  (node as any).pointers = pointers;
  return [node, ...pointers];
}

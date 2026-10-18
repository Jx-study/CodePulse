import type { ExecutionTrace } from "@/types/trace";
import type { BSTInputItem } from "../BinarySearchTree/simulateTrace";
import { TAGS } from "./tags";

export type AVLInputItem = BSTInputItem;

export function simulateAVLTrace(inputData: AVLInputItem[]): ExecutionTrace {
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

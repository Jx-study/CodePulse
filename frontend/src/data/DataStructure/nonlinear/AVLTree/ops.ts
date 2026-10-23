export type AVLOpGroup = "modify" | "query" | "balance";

export type AVLOpId =
  | "insert"
  | "delete"
  | "search"
  | "rotateLeft"
  | "rotateRight"
  | "checkBalance"
  | "rebalance";

export interface AVLOp {
  id: AVLOpId;
  group: AVLOpGroup;
  needsValue: boolean;
  implemented: boolean;
}

export const AVL_OPS: AVLOp[] = [
  { id: "insert", group: "modify", needsValue: true, implemented: true },
  { id: "delete", group: "modify", needsValue: true, implemented: true },
  { id: "search", group: "query", needsValue: true, implemented: true },
  { id: "rotateLeft", group: "balance", needsValue: true, implemented: true },
  { id: "rotateRight", group: "balance", needsValue: true, implemented: true },
  { id: "checkBalance", group: "balance", needsValue: false, implemented: true },
  { id: "rebalance", group: "balance", needsValue: false, implemented: true },
];

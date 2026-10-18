export type AVLOpGroup = "modify" | "query" | "traversal" | "balance";

export type AVLOpId =
  | "insert"
  | "delete"
  | "search"
  | "min"
  | "max"
  | "floor"
  | "ceil"
  | "preorder"
  | "inorder"
  | "postorder"
  | "levelorder"
  | "checkBalance"
  | "rotateLeft"
  | "rotateRight"
  | "autoBalance"
  | "rebalance";

export interface AVLOp {
  id: AVLOpId;
  group: AVLOpGroup;
  needsValue: boolean;
  implemented: boolean;
}

export const AVL_OPS: AVLOp[] = [
  { id: "insert", group: "modify", needsValue: true, implemented: false },
  { id: "delete", group: "modify", needsValue: true, implemented: false },
  { id: "search", group: "query", needsValue: true, implemented: false },
  { id: "min", group: "query", needsValue: false, implemented: false },
  { id: "max", group: "query", needsValue: false, implemented: false },
  { id: "floor", group: "query", needsValue: true, implemented: false },
  { id: "ceil", group: "query", needsValue: true, implemented: false },
  { id: "preorder", group: "traversal", needsValue: false, implemented: false },
  { id: "inorder", group: "traversal", needsValue: false, implemented: false },
  { id: "postorder", group: "traversal", needsValue: false, implemented: false },
  { id: "levelorder", group: "traversal", needsValue: false, implemented: false },
  { id: "checkBalance", group: "balance", needsValue: false, implemented: false },
  { id: "rotateLeft", group: "balance", needsValue: true, implemented: false },
  { id: "rotateRight", group: "balance", needsValue: true, implemented: false },
  { id: "autoBalance", group: "balance", needsValue: false, implemented: false },
  { id: "rebalance", group: "balance", needsValue: false, implemented: false },
];

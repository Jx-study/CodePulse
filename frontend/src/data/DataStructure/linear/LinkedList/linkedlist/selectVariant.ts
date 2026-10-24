import type { LinkedListVariant } from "./types";
import { singlyVariant } from "./singly";
import { singlyWithTailVariant } from "./singlyWithTail";
import { doublyVariant } from "./doubly";
import { doublyWithTailVariant } from "./doublyWithTail";

export function selectVariant(
  isDoubly: boolean,
  hasTail: boolean,
): LinkedListVariant {
  if (isDoubly && hasTail) return doublyWithTailVariant;
  if (isDoubly) return doublyVariant;
  if (hasTail) return singlyWithTailVariant;
  return singlyVariant;
}

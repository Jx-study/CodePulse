import type { LinkedListVariant } from "../types";
import { TAGS } from "./tags";
import { codeConfig } from "./codeConfig";
import { simulateDoublyWithTailTrace } from "./simulateTrace";

export const doublyWithTailVariant: LinkedListVariant = {
  TAGS,
  codeConfig,
  createAnimationSteps: simulateDoublyWithTailTrace,
};

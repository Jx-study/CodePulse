import type { LinkedListVariant } from "../types";
import { TAGS } from "./tags";
import { codeConfig } from "./codeConfig";
import { simulateSinglyWithTailTrace } from "./simulateTrace";

export const singlyWithTailVariant: LinkedListVariant = {
  TAGS,
  codeConfig,
  createAnimationSteps: simulateSinglyWithTailTrace,
};

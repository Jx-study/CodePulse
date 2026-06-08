import type { LinkedListVariant } from "../types";
import { TAGS } from "./tags";
import { codeConfig } from "./codeConfig";
import { simulateDoublyTrace } from "./simulateTrace";

export const doublyVariant: LinkedListVariant = {
  TAGS,
  codeConfig,
  createAnimationSteps: simulateDoublyTrace,
};

import type { LinkedListVariant } from "../types";
import { TAGS } from "./tags";
import { codeConfig } from "./codeConfig";
import { simulateSinglyTrace } from "./simulateTrace";

export const singlyVariant: LinkedListVariant = {
  TAGS,
  codeConfig,
  createAnimationSteps: simulateSinglyTrace,
};

import type { AnimationStep, CodeConfig } from "@/types";
import type {
  LinearData as ListNodeData,
  LinearAction as ActionType,
} from "../../utils";

export interface LinkedListVariant {
  TAGS: Readonly<Record<string, string>>;
  codeConfig: CodeConfig;
  createAnimationSteps(
    dataList: ListNodeData[],
    action?: ActionType,
  ): AnimationStep[];
}

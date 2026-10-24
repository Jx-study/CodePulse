import type { AnimationStep } from "@/types";
import type { LinearData as ListNodeData, LinearAction as ActionType } from "../../../utils";
import { TAGS } from "./tags";
import { createLinkedListSteps } from "../_createStepsCore";

export function simulateDoublyTrace(
  dataList: ListNodeData[],
  action: ActionType | undefined,
): AnimationStep[] {
  return createLinkedListSteps(
    dataList,
    action,
    TAGS as unknown as Record<string, string>,
    true,
    false,
  );
}

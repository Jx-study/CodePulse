import { toast } from "@/shared/components/Toast";
import type { AnimationStep, StepDescription } from "@/types";

export type Translate = (key: string, params?: Record<string, unknown>) => string;

export function renderDescription(
  desc: string | StepDescription | undefined,
  t: Translate,
): string {
  if (!desc) return "";
  if (typeof desc === "string") return desc;
  return t(desc.key, desc.params);
}

/** 播放到帶有 warn／info 旗標的步驟時，以 toast 顯示該步驟的說明 */
export function showStepNotice(step: AnimationStep | undefined, t: Translate) {
  if (!step?.warn && !step?.info) return;
  const message = renderDescription(step.description, t);
  if (step.warn) toast.warning(message);
  else toast.info(message);
}

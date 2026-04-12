import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Box } from "@/modules/core/DataLogic/Box";
import { TAGS } from "./tags";
import type { QSLayoutInfo } from "./simulateTrace";

const STATUS_MAP: Record<string, Status> = {
  Target: Status.Target,
  Complete: Status.Complete,
  Prepare: Status.Prepare,
  Unfinished: Status.Unfinished,
};

function toStatus(s?: string): Status {
  return s ? (STATUS_MAP[s] ?? Status.Unfinished) : Status.Unfinished;
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "qs.init",
    fallback: `開始快速排序 (Quick Sort)，陣列長度為 ${e.variables.length}`,
  }),
  [TAGS.CALL]: (e) => ({
    key: "qs.call",
    fallback: `遞迴分割：處理區間 [${e.variables.low}, ${e.variables.high}]，進入深度 ${e.variables.depth}`,
  }),
  [TAGS.PARTITION_START]: (e) => ({
    key: "qs.partition_start",
    fallback: `選擇區間最後一個元素 ${e.variables.pivotVal} 作為基準點 (Pivot)`,
  }),
  [TAGS.COMPARE]: (e) => ({
    key: "qs.compare",
    fallback: `比較：${e.variables.scanVal} 是否小於等於基準點 ${e.variables.pivotVal}？`,
  }),
  [TAGS.SWAP]: (e) => ({
    key: "qs.swap",
    fallback: `是！將 ${e.variables.valI} 與 ${e.variables.valJ} 互換`,
  }),
  [TAGS.PIVOT_SET]: (e) => ({
    key: "qs.pivot_set",
    fallback: `分區完成，將基準點 ${e.variables.pivotVal} 放回正確的排序位置 (Index ${e.variables.pivotIdx})`,
  }),
  [TAGS.BASE_CASE]: (e) => ({
    key: "qs.base_case",
    fallback: `區間只剩一個元素 ${e.variables.value}，直接標記為已排序`,
  }),
  [TAGS.DONE]: () => ({
    key: "qs.done",
    fallback: "快速排序完成！所有元素皆已在正確位置。",
  }),
};

export function quickSortTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const layout = (event.meta?.layout as QSLayoutInfo[]) ?? [];

    const startX = 50;
    const gapX = 70;
    const baseY = 100;
    const offsetY = 40;

    const elements = event.dataSnapshot.map((d, i) => {
      const box = new Box();
      box.id = d.id;
      box.value = String(d.value);

      const nodeLayout = layout[i] || { depth: 0, status: "Unfinished" };

      box.moveTo(startX + i * gapX, baseY + nodeLayout.depth * offsetY);
      box.width = 50;
      box.height = 50;
      box.autoScale = true;
      box.description = `${i}`;
      box.setStatus(toStatus(nodeLayout.status));

      return box;
    });

    const descriptionData = DESCRIPTION_MAP[event.tag]?.(event);

    return {
      stepNumber: idx + 1,
      description: descriptionData ?? String(event.tag),
      actionTag: event.tag,
      variables: event.variables,
      elements: elements as any,
    };
  });
}

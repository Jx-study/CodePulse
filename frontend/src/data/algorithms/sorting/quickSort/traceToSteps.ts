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
    params: { length: e.variables.length },
  }),
  [TAGS.CALL]: (e) => ({
    key: "qs.call",
    params: {
      low: e.variables.low,
      high: e.variables.high,
      depth: e.variables.depth,
    },
  }),
  [TAGS.PARTITION_START]: (e) => ({
    key: "qs.partition_start",
    params: { pivotVal: e.variables.pivotVal },
  }),
  [TAGS.COMPARE]: (e) => ({
    key: "qs.compare",
    params: { scanVal: e.variables.scanVal, pivotVal: e.variables.pivotVal },
  }),
  [TAGS.SWAP]: (e) => ({
    key: "qs.swap",
    params: { valI: e.variables.valI, valJ: e.variables.valJ },
  }),
  [TAGS.PIVOT_SET]: (e) => ({
    key: "qs.pivot_set",
    params: { pivotVal: e.variables.pivotVal, pivotIdx: e.variables.pivotIdx },
  }),
  [TAGS.BASE_CASE]: (e) => ({
    key: "qs.base_case",
    params: { value: e.variables.value },
  }),
  [TAGS.DONE]: () => ({
    key: "qs.done",
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

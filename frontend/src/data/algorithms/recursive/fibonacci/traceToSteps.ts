import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Box } from "@/modules/core/DataLogic/Box";
import { TAGS } from "./tags";
import type { FibNodeLayout } from "./simulateTrace";

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
  [TAGS.FIB_START]: (e) => ({
    key: "fib.start",
    params: { targetN: e.variables.targetN },
  }),
  [TAGS.FIB_CALL]: (e) => ({
    key: "fib.call",
    params: { n: e.variables.n },
  }),
  [TAGS.FIB_BASE]: (e) => ({
    key: "fib.base",
    params: { n: e.variables.n, result: e.variables.result },
  }),
  [TAGS.FIB_CALC]: (e) => ({
    key: "fib.calc",
    params: {
      n: e.variables.n,
      leftVal: e.variables.leftVal,
      rightVal: e.variables.rightVal,
      result: e.variables.result,
    },
  }),
  [TAGS.FIB_DONE]: (e) => ({
    key: "fib.done",
    params: { result: e.variables.result },
  }),
};

export function fibonacciTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const boxMap = new Map<string, Box>();

    const treeLayout =
      (event.meta?.treeLayout as Record<string, FibNodeLayout>) ?? {};

    const elements = event.dataSnapshot.map((d) => {
      const box = new Box();
      box.id = d.id;
      box.value = String(d.value);
      box.width = 50;
      box.height = 50;
      box.autoScale = true;

      const layoutData = treeLayout[d.id];
      if (layoutData) {
        box.moveTo(layoutData.x, layoutData.y);
        box.description = `n=${layoutData.n}`;
        const isHighlighted = event.meta?.highlightId === d.id;
        box.setStatus(
          isHighlighted ? Status.Target : toStatus(layoutData.status),
        );
      } else {
        // 安全防護
        box.moveTo(0, 0);
        box.setStatus(Status.Unfinished);
      }

      boxMap.set(d.id, box);
      return box;
    });

    // 建立樹狀連線 (Pointers)
    event.dataSnapshot.forEach((d) => {
      const layoutData = treeLayout[d.id];
      const box = boxMap.get(d.id);

      if (layoutData && box) {
        const pointers: Box[] = [];
        if (layoutData.leftId && boxMap.has(layoutData.leftId)) {
          pointers.push(boxMap.get(layoutData.leftId)!);
        }
        if (layoutData.rightId && boxMap.has(layoutData.rightId)) {
          pointers.push(boxMap.get(layoutData.rightId)!);
        }
        (box as any).pointers = pointers;
      }
    });

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.variables,
      elements: elements as any,
    };
  });
}

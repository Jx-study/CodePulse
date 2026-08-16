import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { asTrace } from "@/data/shared/traceValue";
import { TAGS, KnapsackStatus } from "./tags";
import type { KnapsackItem } from "./simulateTrace";

interface KnapsackLocalVars {
  itemIdx?: number;
  currCapacity?: number;
  currentWeight?: number;
  skipValue?: number;
  takeValue?: number;
  capacity?: number;
  finalResult?: number;
}

interface KnapsackMeta {
  items?: KnapsackItem[];
  capacity?: number;
  n?: number;
  dp?: number[][];
  statusMap?: Record<string, string>;
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: () => ({ key: "animation.init" }),
  [TAGS.CHECK_WEIGHT]: (e) => {
    const lv = asTrace<KnapsackLocalVars>(e.local_vars);
    return {
      key: "animation.check_weight",
      params: {
        i: lv.itemIdx ?? null,
        w: lv.currCapacity ?? null,
        weight: lv.currentWeight ?? null,
      },
    };
  },
  [TAGS.SKIP_ITEM]: (e) => {
    const lv = asTrace<KnapsackLocalVars>(e.local_vars);
    const meta = asTrace<KnapsackMeta>(e.meta);
    return {
      key: "animation.skip_item",
      params: {
        i: lv.itemIdx ?? null,
        w: lv.currCapacity ?? null,
        weight: lv.currentWeight ?? null,
        dpVal:
          lv.itemIdx !== undefined && lv.currCapacity !== undefined
            ? (meta.dp?.[lv.itemIdx]?.[lv.currCapacity] ?? null)
            : null,
      },
    };
  },
  [TAGS.TAKE_ITEM]: (e) => {
    const lv = asTrace<KnapsackLocalVars>(e.local_vars);
    const meta = asTrace<KnapsackMeta>(e.meta);
    return {
      key: "animation.take_item",
      params: {
        i: lv.itemIdx ?? null,
        w: lv.currCapacity ?? null,
        skipValue: lv.skipValue ?? null,
        takeValue: lv.takeValue ?? null,
        dpVal:
          lv.itemIdx !== undefined && lv.currCapacity !== undefined
            ? (meta.dp?.[lv.itemIdx]?.[lv.currCapacity] ?? null)
            : null,
      },
    };
  },
  [TAGS.DONE]: (e) => {
    const lv = asTrace<KnapsackLocalVars>(e.local_vars);
    return {
      key: "animation.done",
      params: {
        n: lv.itemIdx ?? null,
        capacity: lv.capacity ?? null,
        dpVal: lv.finalResult ?? null,
      },
    };
  },
};

export function knapsackTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = asTrace<KnapsackMeta>(event.meta);
    const items = meta.items ?? [];
    const capacity = meta.capacity ?? 5;
    const n = meta.n ?? items.length;
    const dp = meta.dp ?? [];
    const statusMap = meta.statusMap ?? {};

    const elements: Box[] = [];
    const startX = 0;
    const startY = 0;
    const boxW = 50;
    const boxH = 50;

    const createHeaderBox = (
      id: string,
      value: string,
      offsetX: number,
      offsetY: number,
      w: number,
    ) => {
      const b = new Box();
      b.id = id;
      b.value = value;
      b.moveTo(startX + offsetX, startY + offsetY);
      b.width = w;
      b.height = boxH;
      b.setStatus(KnapsackStatus.Inactive as Status);
      return b;
    };

    elements.push(
      createHeaderBox("header-title-val", "V", -boxW * 2.5, -boxH, boxW),
    );
    elements.push(
      createHeaderBox("header-title-wt", "W", -boxW * 3.5, -boxH, boxW),
    );
    elements.push(
      createHeaderBox(
        "header-title-item",
        "I\\C",
        -boxW * 1.25,
        -boxH,
        boxW * 1.5,
      ),
    );

    for (let w = 0; w <= capacity; w++) {
      const colHeader = createHeaderBox(
        `header-col-${w}`,
        String(w),
        w * boxW,
        -boxH,
        boxW,
      );
      colHeader.setStatus(
        (statusMap[`header-col-${w}`] as Status) || KnapsackStatus.Inactive,
      );
      elements.push(colHeader);
    }

    for (let i = 0; i <= n; i++) {
      const valueBox = createHeaderBox(
        `info-val-${i}`,
        i === 0 ? "0" : String(items[i - 1].value),
        -boxW * 2.5,
        i * boxH,
        boxW,
      );
      valueBox.setStatus(
        (statusMap[`info-val-${i}`] as Status) || KnapsackStatus.Inactive,
      );
      elements.push(valueBox);

      const weightBox = createHeaderBox(
        `info-wt-${i}`,
        i === 0 ? "0" : String(items[i - 1].weight),
        -boxW * 3.5,
        i * boxH,
        boxW,
      );
      weightBox.setStatus(
        (statusMap[`info-wt-${i}`] as Status) || KnapsackStatus.Inactive,
      );
      elements.push(weightBox);

      elements.push(
        createHeaderBox(
          `info-item-${i}`,
          i === 0 ? "0 items" : `item ${i}`,
          -boxW * 1.25,
          i * boxH,
          boxW * 1.5,
        ),
      );
    }

    for (let i = 0; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        const cell = new Box();
        const key = `${i}-${w}`;
        cell.id = `dp-${key}`;

        if (i === 0 || w === 0) {
          cell.value = "0";
          cell.setStatus((statusMap[key] as Status) || KnapsackStatus.Inactive);
        } else {
          cell.value =
            dp[i] &&
            dp[i][w] !== undefined &&
            statusMap[key] !== KnapsackStatus.Unfinished
              ? String(dp[i][w])
              : "";
          cell.setStatus(
            (statusMap[key] as Status) || KnapsackStatus.Unfinished,
          );
        }

        cell.moveTo(startX + w * boxW, startY + i * boxH);
        cell.width = boxW;
        cell.height = boxH;
        elements.push(cell);
      }
    }

    return {
      stepNumber: idx,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements,
    };
  });
}

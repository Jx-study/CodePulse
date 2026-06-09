import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";
import { LinearData } from "@/data/DataStructure/linear/utils";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export interface TrackedItem {
  id: string;
  value: number;
  x: number;
  y: number;
  description: string;
  status: Status;
}

export function simulateMergeSortTrace(
  inputData: LinearData[],
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const startX = 50;
  const baseY = 150;
  const gap = 70;
  const yOffset = 40;

  const currentItems: TrackedItem[] = inputData.map((d, i) => ({
    id: d.id,
    value: Number(d.value),
    description: String(i),
    x: startX + i * gap,
    y: baseY,
    status: Status.Unfinished,
  }));

  const pushTrace = (tag: string, vars: any = {}) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: currentItems.map((item) => ({ ...item })),
      meta: {},
    });
  };

  pushTrace(TAGS.INIT, {});

  if (currentItems.length <= 1) {
    pushTrace(TAGS.IF_RETURN, { chosenVal: currentItems[0]?.value ?? null });
    return trace;
  }

  const mergeSort = (
    items: TrackedItem[],
    depth: number,
    startIndex: number,
  ): TrackedItem[] => {
    if (items.length <= 1) {
      pushTrace(TAGS.IF_RETURN, { chosenVal: items[0]?.value ?? null });
      return items;
    }

    const mid = Math.floor(items.length / 2);
    const leftHalf = items.slice(0, mid);
    const rightHalf = items.slice(mid);

    leftHalf.forEach((item, i) => {
      item.y = baseY + depth * yOffset;
      item.description = String(i);
    });
    rightHalf.forEach((item, i) => {
      item.y = baseY + depth * yOffset;
      item.description = String(i);
    });

    pushTrace(TAGS.DIVIDE, {
      depth,
      start: startIndex,
      end: startIndex + items.length - 1,
    });

    const sortedLeft = mergeSort(leftHalf, depth + 1, startIndex);
    const sortedRight = mergeSort(rightHalf, depth + 1, startIndex + mid);

    return merge(sortedLeft, sortedRight, depth, startIndex);
  };

  const merge = (
    left: TrackedItem[],
    right: TrackedItem[],
    depth: number,
    startIndex: number,
  ): TrackedItem[] => {
    const merged: TrackedItem[] = [];
    let i = 0;
    let j = 0;

    pushTrace(TAGS.MERGE_START, { depth, auxSize: left.length + right.length });

    while (i < left.length && j < right.length) {
      left[i].status = Status.Prepare;
      right[j].status = Status.Prepare;
      pushTrace(TAGS.COMPARE, {
        leftVal: left[i].value,
        rightVal: right[j].value,
      });

      let chosen: TrackedItem;
      let copyTag: string;
      if (left[i].value <= right[j].value) {
        chosen = left[i];
        left[i].status = depth === 1 ? Status.Complete : Status.Target;
        right[j].status = Status.Unfinished;
        i++;
        copyTag = TAGS.LEFT_COPY;
      } else {
        chosen = right[j];
        right[j].status = depth === 1 ? Status.Complete : Status.Target;
        left[i].status = Status.Unfinished;
        j++;
        copyTag = TAGS.RIGHT_COPY;
      }

      chosen.x = startX + (startIndex + merged.length) * gap;
      chosen.y = baseY + (depth - 1) * yOffset;
      chosen.description = String(merged.length);
      merged.push(chosen);

      pushTrace(copyTag, { chosenVal: chosen.value });

      if (depth !== 1) chosen.status = Status.Unfinished;
    }

    while (i < left.length) {
      const chosen = left[i];
      chosen.status = depth === 1 ? Status.Complete : Status.Target;
      chosen.x = startX + (startIndex + merged.length) * gap;
      chosen.y = baseY + (depth - 1) * yOffset;
      chosen.description = String(merged.length);
      merged.push(chosen);
      pushTrace(TAGS.REMAINING, { chosenVal: chosen.value, side: "left" });
      if (depth !== 1) chosen.status = Status.Unfinished;
      i++;
    }

    while (j < right.length) {
      const chosen = right[j];
      chosen.status = depth === 1 ? Status.Complete : Status.Target;
      chosen.x = startX + (startIndex + merged.length) * gap;
      chosen.y = baseY + (depth - 1) * yOffset;
      chosen.description = String(merged.length);
      merged.push(chosen);
      pushTrace(TAGS.REMAINING, { chosenVal: chosen.value, side: "right" });
      if (depth !== 1) chosen.status = Status.Unfinished;
      j++;
    }

    pushTrace(TAGS.MERGE_END, { depth });
    return merged;
  };

  const sortedItems = mergeSort(currentItems, 1, 0);

  sortedItems.forEach((item, i) => {
    currentItems[i] = item;
  });

  currentItems.forEach((item) => (item.status = Status.Complete));
  pushTrace(TAGS.DONE, { isSorted: true });

  return trace;
}

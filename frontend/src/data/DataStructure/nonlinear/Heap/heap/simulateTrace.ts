import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";

interface HeapNode {
  id: string;
  value: number;
}

export function simulateHeapTrace(
  dataList: HeapNode[],
  action: any,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const currentList = dataList.map((d) => ({ ...d }));

  const getSnapshot = () => currentList.map((d) => ({ ...d }));

  if (!action || action.heapType === "init") {
    trace.push({
      tag: TAGS.INIT,
      local_vars: {},
      dataSnapshot: getSnapshot(),
      meta: { isInitial: true },
    });
    return trace;
  }

  if (action.heapType === "peek") {
    if (currentList.length > 0) {
      trace.push({
        tag: TAGS.PEEK,
        local_vars: { maxVal: currentList[0].value },
        dataSnapshot: getSnapshot(),
        meta: { highlightIndex: 0, status: "Complete" },
      });
    }
    return trace;
  }

  // 操作: Heapify (由下而上建堆)
  if (action.heapType === "heapify") {
    trace.push({
      tag: TAGS.HEAPIFY_START,
      local_vars: { length: currentList.length },
      dataSnapshot: getSnapshot(),
      meta: { status: "Unfinished" },
    });

    // 從最後一個非葉子節點開始往前做 Heapify-Down
    for (let i = Math.floor(currentList.length / 2) - 1; i >= 0; i--) {
      let idx = i;
      while (true) {
        const leftIdx = 2 * idx + 1;
        const rightIdx = 2 * idx + 2;
        let largestIdx = idx;

        if (
          leftIdx < currentList.length &&
          currentList[leftIdx].value > currentList[largestIdx].value
        ) {
          largestIdx = leftIdx;
        }
        if (
          rightIdx < currentList.length &&
          currentList[rightIdx].value > currentList[largestIdx].value
        ) {
          largestIdx = rightIdx;
        }

        if (leftIdx < currentList.length) {
          trace.push({
            tag: TAGS.HEAPIFY_DOWN_COMPARE,
            local_vars: { idx, leftIdx, rightIdx, largestIdx },
            dataSnapshot: getSnapshot(),
            meta: {
              overrideStatusMap: {
                [idx]: "Target",
                [leftIdx]: "Prepare",
                ...(rightIdx < currentList.length
                  ? { [rightIdx]: "Prepare" }
                  : {}),
              },
            },
          });
        }

        if (largestIdx !== idx) {
          const temp = currentList[idx].value;
          currentList[idx].value = currentList[largestIdx].value;
          currentList[largestIdx].value = temp;

          trace.push({
            tag: TAGS.HEAPIFY_DOWN_SWAP,
            local_vars: { idx, largestIdx },
            dataSnapshot: getSnapshot(),
            meta: {
              overrideStatusMap: { [idx]: "Prepare", [largestIdx]: "Target" },
            },
          });
          idx = largestIdx;
        } else {
          break;
        }
      }
    }

    trace.push({
      tag: TAGS.DONE,
      local_vars: {},
      dataSnapshot: getSnapshot(),
      meta: { status: "Complete" },
    });
    return trace;
  }

  if (action.heapType === "add") {
    const { value, targetId } = action;
    const newNode = { id: targetId, value: value };
    currentList.push(newNode);
    let idx = currentList.length - 1;

    trace.push({
      tag: TAGS.INSERT_START,
      local_vars: { value, index: idx },
      dataSnapshot: getSnapshot(),
      meta: { highlightIndex: idx, status: "Target" },
    });

    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const curVal = currentList[idx].value;
      const parentVal = currentList[parentIdx].value;

      trace.push({
        tag: TAGS.HEAPIFY_UP_COMPARE,
        local_vars: { idx, parentIdx, curVal, parentVal },
        dataSnapshot: getSnapshot(),
        meta: {
          overrideStatusMap: { [idx]: "Target", [parentIdx]: "Prepare" },
        },
      });

      if (curVal > parentVal) {
        const temp = currentList[idx].value;
        currentList[idx].value = currentList[parentIdx].value;
        currentList[parentIdx].value = temp;

        trace.push({
          tag: TAGS.HEAPIFY_UP_SWAP,
          local_vars: { idx, parentIdx },
          dataSnapshot: getSnapshot(),
          meta: {
            overrideStatusMap: { [idx]: "Prepare", [parentIdx]: "Target" },
          },
        });

        idx = parentIdx;
      } else {
        break;
      }
    }

    trace.push({
      tag: TAGS.DONE,
      local_vars: {},
      dataSnapshot: getSnapshot(),
      meta: { status: "Complete" },
    });
  } else if (action.heapType === "delete") {
    if (currentList.length === 0) return trace;

    const maxVal = currentList[0].value;
    trace.push({
      tag: TAGS.EXTRACT_START,
      local_vars: { maxVal },
      dataSnapshot: getSnapshot(),
      meta: { highlightIndex: 0 },
    });

    if (currentList.length === 1) {
      currentList.pop();
      trace.push({
        tag: TAGS.EXTRACT_REMOVE,
        local_vars: { maxVal },
        dataSnapshot: getSnapshot(),
      });
      return trace;
    }

    const lastIdx = currentList.length - 1;
    currentList[0].value = currentList[lastIdx].value;

    trace.push({
      tag: TAGS.EXTRACT_SWAP_LAST,
      local_vars: { lastIdx },
      dataSnapshot: getSnapshot(),
      meta: { overrideStatusMap: { 0: "Prepare", [lastIdx]: "Target" } },
    });

    currentList.pop();

    trace.push({
      tag: TAGS.EXTRACT_REMOVE,
      local_vars: {},
      dataSnapshot: getSnapshot(),
      meta: { highlightIndex: 0, status: "Prepare" },
    });

    let idx = 0;
    while (true) {
      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;
      let largestIdx = idx;

      if (
        leftIdx < currentList.length &&
        currentList[leftIdx].value > currentList[largestIdx].value
      ) {
        largestIdx = leftIdx;
      }
      if (
        rightIdx < currentList.length &&
        currentList[rightIdx].value > currentList[largestIdx].value
      ) {
        largestIdx = rightIdx;
      }

      if (leftIdx < currentList.length) {
        trace.push({
          tag: TAGS.HEAPIFY_DOWN_COMPARE,
          local_vars: { idx, leftIdx, rightIdx, largestIdx },
          dataSnapshot: getSnapshot(),
          meta: {
            overrideStatusMap: {
              [idx]: "Target",
              [leftIdx]: "Prepare",
              ...(rightIdx < currentList.length
                ? { [rightIdx]: "Prepare" }
                : {}),
            },
          },
        });
      }

      if (largestIdx !== idx) {
        const swapTemp = currentList[idx].value;
        currentList[idx].value = currentList[largestIdx].value;
        currentList[largestIdx].value = swapTemp;

        trace.push({
          tag: TAGS.HEAPIFY_DOWN_SWAP,
          local_vars: { idx, largestIdx },
          dataSnapshot: getSnapshot(),
          meta: {
            overrideStatusMap: { [idx]: "Prepare", [largestIdx]: "Target" },
          },
        });
        idx = largestIdx;
      } else {
        break;
      }
    }

    trace.push({
      tag: TAGS.DONE,
      local_vars: {},
      dataSnapshot: getSnapshot(),
      meta: { status: "Complete" },
    });
  }

  return trace;
}

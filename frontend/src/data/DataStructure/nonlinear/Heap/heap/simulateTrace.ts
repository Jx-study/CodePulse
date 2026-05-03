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

  const isMinHeap = !!action.isMinHeap;
  const isPrior = (a: number, b: number) => (isMinHeap ? a < b : a > b);
  const heapName = isMinHeap ? "Min-Heap" : "Max-Heap";
  const extremeStr = isMinHeap ? "小" : "大";
  const extremeVal = isMinHeap ? "最小" : "最大";

  if (!action || action.heapType === "init") {
    trace.push({
      tag: TAGS.INIT,
      local_vars: { heapName },
      dataSnapshot: getSnapshot(),
      meta: { isInitial: true },
    });
    return trace;
  }

  if (action.heapType === "peek") {
    if (currentList.length > 0) {
      trace.push({
        tag: TAGS.PEEK,
        local_vars: { extVal: currentList[0].value, extremeVal },
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
      local_vars: { length: currentList.length, heapName },
      dataSnapshot: getSnapshot(),
      meta: { status: "Unfinished" },
    });

    // 從最後一個非葉子節點開始往前做 Heapify-Down
    for (let i = Math.floor(currentList.length / 2) - 1; i >= 0; i--) {
      let idx = i;
      while (true) {
        const leftIdx = 2 * idx + 1;
        const rightIdx = 2 * idx + 2;
        let targetIdx = idx;

        if (
          leftIdx < currentList.length &&
          isPrior(currentList[leftIdx].value, currentList[targetIdx].value)
        ) {
          targetIdx = leftIdx;
        }
        if (
          rightIdx < currentList.length &&
          isPrior(currentList[rightIdx].value, currentList[targetIdx].value)
        ) {
          targetIdx = rightIdx;
        }

        if (leftIdx < currentList.length) {
          trace.push({
            tag: TAGS.HEAPIFY_DOWN_COMPARE,
            local_vars: { idx, leftIdx, rightIdx, targetIdx, extremeStr },
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

        if (targetIdx !== idx) {
          const temp = currentList[idx].value;
          currentList[idx].value = currentList[targetIdx].value;
          currentList[targetIdx].value = temp;

          trace.push({
            tag: TAGS.HEAPIFY_DOWN_SWAP,
            local_vars: { idx, targetIdx, heapName },
            dataSnapshot: getSnapshot(),
            meta: {
              overrideStatusMap: { [idx]: "Prepare", [targetIdx]: "Target" },
            },
          });
          idx = targetIdx;
        } else {
          break;
        }
      }
    }

    trace.push({
      tag: TAGS.DONE,
      local_vars: { heapName },
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

      if (isPrior(curVal, parentVal)) {
        const temp = currentList[idx].value;
        currentList[idx].value = currentList[parentIdx].value;
        currentList[parentIdx].value = temp;

        trace.push({
          tag: TAGS.HEAPIFY_UP_SWAP,
          local_vars: { idx, parentIdx, extremeStr },
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
      local_vars: { heapName },
      dataSnapshot: getSnapshot(),
      meta: { status: "Complete" },
    });
  } else if (action.heapType === "delete") {
    if (currentList.length === 0) return trace;

    const extVal = currentList[0].value;
    trace.push({
      tag: TAGS.EXTRACT_START,
      local_vars: { extVal, extremeVal, extremeStr },
      dataSnapshot: getSnapshot(),
      meta: { highlightIndex: 0 },
    });

    if (currentList.length === 1) {
      currentList.pop();
      trace.push({
        tag: TAGS.EXTRACT_REMOVE,
        local_vars: {},
        dataSnapshot: getSnapshot(),
      });
      return trace;
    }

    const lastIdx = currentList.length - 1;
    currentList[0].value = currentList[lastIdx].value;

    trace.push({
      tag: TAGS.EXTRACT_SWAP_LAST,
      local_vars: {},
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
      let targetIdx = idx;

      if (
        leftIdx < currentList.length &&
        isPrior(currentList[leftIdx].value, currentList[targetIdx].value)
      ) {
        targetIdx = leftIdx;
      }
      if (
        rightIdx < currentList.length &&
        isPrior(currentList[rightIdx].value, currentList[targetIdx].value)
      ) {
        targetIdx = rightIdx;
      }

      if (leftIdx < currentList.length) {
        trace.push({
          tag: TAGS.HEAPIFY_DOWN_COMPARE,
          local_vars: { idx, leftIdx, rightIdx, targetIdx, extremeStr },
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

      if (targetIdx !== idx) {
        const swapTemp = currentList[idx].value;
        currentList[idx].value = currentList[targetIdx].value;
        currentList[targetIdx].value = swapTemp;

        trace.push({
          tag: TAGS.HEAPIFY_DOWN_SWAP,
          local_vars: { idx, targetIdx, heapName },
          dataSnapshot: getSnapshot(),
          meta: {
            overrideStatusMap: { [idx]: "Prepare", [targetIdx]: "Target" },
          },
        });
        idx = targetIdx;
      } else {
        break;
      }
    }

    trace.push({
      tag: TAGS.DONE,
      local_vars: { heapName },
      dataSnapshot: getSnapshot(),
      meta: { status: "Complete" },
    });
  }

  return trace;
}

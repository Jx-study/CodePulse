import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";
import { LinearData } from "@/data/DataStructure/linear/utils";

export function simulateSelectionSortTrace(
  inputData: LinearData[],
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  let arr = inputData.map((d) => ({ ...d }));
  const n = arr.length;
  const sortedIndices = new Set<number>();

  const pushTrace = (tag: string, vars: any, meta: any) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: arr.map((d) => ({ ...d })),
      meta: { ...meta, sortedIndices: Array.from(sortedIndices) },
    });
  };

  pushTrace(TAGS.INIT, { totalItems: n }, {});

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    pushTrace(
      TAGS.ROUND_START,
      { currentPos: i, minPos: i },
      { targetIndices: [minIdx] },
    );

    for (let j = i + 1; j < n; j++) {
      const scanVal = Number(arr[j].value);
      const minVal = Number(arr[minIdx].value);

      pushTrace(
        TAGS.COMPARE,
        {
          currentPos: i,
          scanPos: j,
          minPos: minIdx,
          scanVal: scanVal,
          minVal: minVal,
          condition: `${scanVal} < ${minVal}`,
          result: scanVal < minVal,
        },
        // [i] 是當前起點, [minIdx] 是目前最小, [j] 是正在掃描的對象
        { targetIndices: [i, minIdx], prepareIndices: [j] },
      );

      if (scanVal < minVal) {
        minIdx = j;
        pushTrace(
          TAGS.UPDATE_MIN,
          { minPos: minIdx, scanVal: scanVal },
          { targetIndices: [i, minIdx] },
        );
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      pushTrace(
        TAGS.SWAP,
        {
          currentPos: i,
          minPos: minIdx,
          [`collection[${i}]`]: arr[i].value ?? null,
          [`collection[${minIdx}]`]: arr[minIdx].value ?? null,
          hasSwapped: true,
        },
        { targetIndices: [i, minIdx] },
      );
    } else {
      pushTrace(
        TAGS.SWAP,
        { currentPos: i, minPos: minIdx, hasSwapped: false },
        { targetIndices: [i] },
      );
    }

    sortedIndices.add(i);
    pushTrace(TAGS.ROUND_END, { currentPos: i }, {});
  }

  // 將最後一個元素標記為完成
  if (n > 0) {
    sortedIndices.add(n - 1);
  }

  pushTrace(TAGS.DONE, { isSorted: true }, {});
  return trace;
}

import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";
import { LinearData } from "@/data/DataStructure/linear/utils";

export function simulateInsertionSortTrace(
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

  if (n > 0) {
    sortedIndices.add(0);
    pushTrace(TAGS.INIT, { sortedCount: 1 }, {});
  }

  for (let i = 1; i < n; i++) {
    const keyVal = Number(arr[i].value);
    sortedIndices.add(i);

    pushTrace(
      TAGS.ROUND_START,
      { unsortedPos: i, insertVal: keyVal, scanPos: i - 1 },
      { targetIndices: [i] },
    );

    let j = i - 1;
    let currentKeyIndex = i;

    while (j >= 0) {
      const scanVal = Number(arr[j].value);

      pushTrace(
        TAGS.COMPARE,
        {
          unsortedPos: i,
          scanPos: j,
          insertVal: keyVal,
          scanVal: scanVal,
          condition: `${scanVal} > ${keyVal}`,
          result: scanVal > keyVal,
        },
        { targetIndices: [currentKeyIndex], prepareIndices: [j] },
      );

      if (scanVal > keyVal) {
        const temp = arr[j];
        arr[j] = arr[currentKeyIndex];
        arr[currentKeyIndex] = temp;

        pushTrace(
          TAGS.SHIFT,
          { scanPos: j, insertVal: keyVal, shiftVal: scanVal },
          { targetIndices: [j, currentKeyIndex] },
        );

        currentKeyIndex = j;
        j--;
      } else {
        break; // 停止：找到插入點
      }
    }

    pushTrace(
      TAGS.INSERT,
      { insertPos: currentKeyIndex, insertVal: keyVal },
      { completeIndices: [currentKeyIndex] },
    );

    pushTrace(TAGS.ROUND_END, { sortedBoundary: i }, {});
  }

  // 結束時確保所有 index 都在 sorted 狀態內
  for (let k = 0; k < n; k++) sortedIndices.add(k);
  pushTrace(TAGS.DONE, { isSorted: true }, {});

  return trace;
}

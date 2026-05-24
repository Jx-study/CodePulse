import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";
import { LinearData } from "@/data/DataStructure/linear/utils";

export function simulateBubbleSortTrace(
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
    let swapped = false;
    pushTrace(TAGS.ROUND_START, { round: i }, { round: i });

    for (let j = 0; j < n - i - 1; j++) {
      const val1 = Number(arr[j].value);
      const val2 = Number(arr[j + 1].value);

      pushTrace(
        TAGS.GET_VALUES,
        { index: j, currentVal: val1, nextVal: val2 },
        { indices: [j, j + 1] },
      );

      if (val1 > val2) {
        pushTrace(
          TAGS.COMPARE,
          { condition: `${val1} > ${val2}`, result: true },
          { indices: [j, j + 1] },
        );
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
        pushTrace(
          TAGS.SWAP,
          { index: j, hasSwapped: true },
          { indices: [j, j + 1] },
        );
      } else {
        pushTrace(
          TAGS.COMPARE,
          { condition: `${val1} > ${val2}`, result: false },
          { indices: [j, j + 1] },
        );
      }
    }
    sortedIndices.add(n - 1 - i);
    pushTrace(
      TAGS.ROUND_END,
      { round: n - i - 1, hasSwapped: swapped },
      { sortedIndices: Array.from(sortedIndices) },
    );
    if (!swapped) {
      pushTrace(
        TAGS.EARLY_EXIT,
        {
          round: i,
        },
        { sortedIndices: Array.from(sortedIndices) },
      );
      break;
    }
  }
  for (let k = 0; k < n; k++) {
    sortedIndices.add(k);
  }
  pushTrace(TAGS.DONE, { isSorted: true }, {});
  return trace;
}

import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { LinearData } from "@/data/DataStructure/linear/utils";
import { TAGS } from "./tags";

export interface QSLayoutInfo {
  depth: number;
  status: string;
}

export function simulateQuickSortTrace(dataList: LinearData[]): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const currentList = dataList.map((d) => ({ ...d }));

  // 記錄每個 index 當下的深度與狀態
  const layout: QSLayoutInfo[] = currentList.map(() => ({
    depth: 0,
    status: "Unfinished",
  }));

  const getSnapshot = () =>
    currentList.map((d) => ({ id: d.id, value: d.value }));
  const getLayoutMeta = () => layout.map((l) => ({ ...l }));

  function pushTrace(
    tag: string,
    vars: any,
    highlightMap: Record<number, string> = {},
  ) {
    const currentLayout = getLayoutMeta();
    // 覆寫這一幀的特殊高亮狀態
    for (const [idxStr, status] of Object.entries(highlightMap)) {
      const idx = Number(idxStr);
      if (currentLayout[idx]) {
        currentLayout[idx].status = status;
      }
    }
    trace.push({
      tag,
      variables: vars,
      dataSnapshot: getSnapshot(),
      meta: { layout: currentLayout },
    });
  }

  pushTrace(TAGS.INIT, { length: currentList.length, stackDepth: 0 });

  function qs(low: number, high: number, depth: number) {
    if (low > high) return;

    if (low === high) {
      layout[low].status = "Complete";
      layout[low].depth = 0; // 排序完成，回到最頂層
      pushTrace(TAGS.BASE_CASE, {
        index: low,
        value: currentList[low].value,
        stackDepth: depth,
      });
      return;
    }

    // 1. 進入子陣列：將未完成的元素往下推到目前的深度
    for (let k = low; k <= high; k++) {
      if (layout[k].status !== "Complete") {
        layout[k].depth = depth;
        layout[k].status = "Unfinished";
      }
    }
    pushTrace(TAGS.CALL, { low, high, depth, stackDepth: depth });

    // 2. 開始 Partition
    const pivotIdx = high;
    const pivotVal = Number(currentList[pivotIdx].value);
    pushTrace(
      TAGS.PARTITION_START,
      { low, high, pivotVal, stackDepth: depth },
      { [pivotIdx]: "Target" },
    );

    let i = low - 1;

    for (let j = low; j < high; j++) {
      const scanVal = Number(currentList[j].value);
      pushTrace(
        TAGS.COMPARE,
        { j, scanVal, pivotVal, stackDepth: depth },
        {
          [pivotIdx]: "Target",
          [j]: "Prepare",
          ...(i >= low ? { [i]: "Prepare" } : {}),
        },
      );

      if (scanVal <= pivotVal) {
        i++;
        // 交換資料
        const temp = currentList[i];
        currentList[i] = currentList[j];
        currentList[j] = temp;

        // 交換佈局狀態 (雖然深度通常一樣，但保持一致性)
        const tempL = layout[i];
        layout[i] = layout[j];
        layout[j] = tempL;

        if (i !== j) {
          pushTrace(
            TAGS.SWAP,
            {
              i,
              j,
              valI: currentList[i].value,
              valJ: currentList[j].value,
              stackDepth: depth,
            },
            { [pivotIdx]: "Target", [i]: "Prepare", [j]: "Prepare" },
          );
        }
      }
    }

    // 3. 把 Pivot 換到正確的最終位置
    i++;
    const temp = currentList[i];
    currentList[i] = currentList[high];
    currentList[high] = temp;

    const tempL = layout[i];
    layout[i] = layout[high];
    layout[high] = tempL;

    // Pivot 已經在最終位置了！標記完成並將其送回深度 0 (最頂層)
    layout[i].status = "Complete";
    layout[i].depth = 0;
    pushTrace(
      TAGS.PIVOT_SET,
      { pivotIdx: i, pivotVal, stackDepth: depth },
      { [i]: "Complete" },
    );

    // 4. 遞迴左右兩半
    qs(low, i - 1, depth + 1);
    qs(i + 1, high, depth + 1);
  }

  qs(0, currentList.length - 1, 1); // 起始深度設為 1，0 留給已排序好的結果

  // 確保所有狀態都為 Complete
  layout.forEach((l) => {
    l.status = "Complete";
    l.depth = 0;
  });
  pushTrace(TAGS.DONE, { isSorted: true, stackDepth: 0 });

  return trace;
}

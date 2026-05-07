import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type {
  LinearData,
  LinearAction,
} from "@/data/DataStructure/linear/utils";
import { TAGS } from "./tags";

function snapshot(list: { id: string; value: number | string | undefined }[]) {
  return list.map((d) => ({ ...d }));
}

export function simulateArrayTrace(
  dataList: LinearData[],
  action?: LinearAction,
): ExecutionTrace {
  const trace: TraceEvent[] = [];

  if (!action) {
    trace.push({
      tag: TAGS.SEARCH_START,
      local_vars: { length: dataList.length },
      dataSnapshot: snapshot(dataList),
      meta: { isInitial: true },
    });
    return trace;
  }

  const { type, value, index } = action;

  // Search
  if (type === "search") {
    trace.push({
      tag: TAGS.SEARCH_START,
      local_vars: { target: value, i: -1 },
      dataSnapshot: snapshot(dataList),
    });

    let found = false;
    for (let i = 0; i < dataList.length; i++) {
      trace.push({
        tag: TAGS.SEARCH_COMPARE,
        local_vars: { target: value, i, current_val: dataList[i].value ?? 0 },
        dataSnapshot: snapshot(dataList),
        meta: { highlightIndex: i, status: "Target" },
      });

      if (Number(dataList[i].value) === value) {
        found = true;
        trace.push({
          tag: TAGS.SEARCH_FOUND,
          local_vars: { target: value, i, found_index: i },
          dataSnapshot: snapshot(dataList),
          meta: { highlightIndex: i, status: "Complete" },
        });
        break;
      }
    }

    if (!found) {
      trace.push({
        tag: TAGS.SEARCH_NOT_FOUND,
        local_vars: { target: value, i: dataList.length, found_index: -1 },
        dataSnapshot: snapshot(dataList),
      });
    }

  // Update
  } else if (type === "add" && action.mode === "Update") {
    const idx = index !== undefined ? index : -1;
    const oldValue =
      (action as any).oldValue !== undefined ? (action as any).oldValue : value;

    if (idx >= 0 && idx < dataList.length) {
      const snapBefore = snapshot(dataList);
      snapBefore[idx] = { ...snapBefore[idx], value: oldValue };

      trace.push({
        tag: TAGS.UPDATE_START,
        local_vars: { index: idx, value, [`data[${idx}]`]: oldValue },
        dataSnapshot: snapBefore,
        meta: { highlightIndex: idx, status: "Target" },
      });

      trace.push({
        tag: TAGS.UPDATE_ASSIGN,
        local_vars: { index: idx, value, [`data[${idx}]`]: value },
        dataSnapshot: snapshot(dataList),
        meta: { highlightIndex: idx, status: "Target" },
      });

      trace.push({
        tag: TAGS.UPDATE_COMPLETE,
        local_vars: { index: idx, value, [`data[${idx}]`]: value },
        dataSnapshot: snapshot(dataList),
        meta: { highlightIndex: idx, status: "Complete" },
      });
    } else {
      trace.push({
        tag: TAGS.UPDATE_ERROR,
        local_vars: { index: idx, length: dataList.length },
        dataSnapshot: snapshot(dataList),
      });
    }

  // Insert
  } else if (type === "add") {
    const idx = index !== undefined ? index : dataList.length - 1;
    let currentList = dataList.map((item) => ({ ...item }));

    for (let i = idx; i < dataList.length - 1; i++) {
      currentList[i].value = dataList[i + 1].value;
    }
    currentList[currentList.length - 1].value = "";

    trace.push({
      tag: TAGS.INSERT_START,
      local_vars: { index: idx, value, length: currentList.length },
      dataSnapshot: snapshot(currentList),
      meta: { highlightIndex: currentList.length - 1, status: "Target" },
    });

    for (let i = currentList.length - 1; i > idx; i--) {
      trace.push({
        tag: TAGS.INSERT_SHIFT,
        local_vars: {
          i,
          index: idx,
          from: i - 1,
          fromValue: currentList[i - 1].value ?? null,
          to: i,
          [`data[${i - 1}]`]: currentList[i - 1].value ?? null,
          [`data[${i}]`]: currentList[i].value ?? null,
        },
        dataSnapshot: snapshot(currentList),
        meta: {
          overrideStatusMap: { [i]: "Prepare", [i - 1]: "Prepare" },
          isShiftPrepare: true,
        },
      });

      currentList[i].value = currentList[i - 1].value;

      trace.push({
        tag: TAGS.INSERT_SHIFT,
        local_vars: {
          i,
          index: idx,
          [`data[${i}]`]: currentList[i].value ?? null,
        },
        dataSnapshot: snapshot(currentList),
        meta: {
          overrideStatusMap: { [i]: "Target", [i - 1]: "Prepare" },
          isShiftDone: true,
        },
      });
    }

    currentList[idx].value = String(value);

    trace.push({
      tag: TAGS.INSERT_ASSIGN,
      local_vars: { index: idx, value, [`data[${idx}]`]: value },
      dataSnapshot: snapshot(currentList),
      meta: { highlightIndex: idx, status: "Target" },
    });

    trace.push({
      tag: TAGS.INSERT_COMPLETE,
      local_vars: { index: idx, value, [`data[${idx}]`]: value },
      dataSnapshot: snapshot(dataList),
      meta: { status: "Complete" },
    });

  // Delete
  } else if (type === "delete") {
    const idx = index !== undefined ? index : -1;
    if (idx >= 0) {
      const poppedNode = {
        id: (action as any).targetId || "temp-pop",
        value: 0 as number | string | undefined,
      };
      let currentList = [...dataList, poppedNode].map((item) => ({ ...item }));

      for (let i = currentList.length - 1; i > idx; i--) {
        currentList[i].value = currentList[i - 1].value;
      }
      currentList[idx].value = String(value);

      trace.push({
        tag: TAGS.DELETE_START,
        local_vars: { index: idx, value },
        dataSnapshot: snapshot(currentList),
        meta: { highlightIndex: idx, status: "Target" },
      });

      for (let i = idx; i < currentList.length - 1; i++) {
        trace.push({
          tag: TAGS.DELETE_SHIFT,
          local_vars: {
            i,
            index: idx,
            from: i + 1,
            fromValue: currentList[i + 1].value ?? null,
            to: i,
            [`data[${i}]`]: currentList[i].value ?? null,
            [`data[${i + 1}]`]: currentList[i + 1].value ?? null,
          },
          dataSnapshot: snapshot(currentList),
          meta: {
            overrideStatusMap: { [i]: "Prepare", [i + 1]: "Prepare" },
            isShiftPrepare: true,
          },
        });

        currentList[i].value = currentList[i + 1].value;

        trace.push({
          tag: TAGS.DELETE_SHIFT,
          local_vars: {
            i,
            index: idx,
            [`data[${i}]`]: currentList[i].value ?? null,
          },
          dataSnapshot: snapshot(currentList),
          meta: {
            overrideStatusMap: { [i]: "Target", [i + 1]: "Prepare" },
            isShiftDone: true,
          },
        });
      }

      trace.push({
        tag: TAGS.DELETE_REMOVE,
        local_vars: { length: currentList.length },
        dataSnapshot: snapshot(currentList),
        meta: { highlightIndex: currentList.length - 1, status: "Target" },
      });

      trace.push({
        tag: TAGS.DELETE_COMPLETE,
        local_vars: { length: dataList.length },
        dataSnapshot: snapshot(dataList),
        meta: { status: "Complete" },
      });
    }
  }

  return trace;
}

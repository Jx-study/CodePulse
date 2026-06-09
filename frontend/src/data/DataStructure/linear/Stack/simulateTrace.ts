import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";
import { LinearData as BoxData, LinearAction as ActionType } from "../utils";

export function simulateStackTrace(
  dataList: BoxData[],
  action?: ActionType,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const meta = { dataList, action };

  if (!action) {
    const currentTop = dataList.length - 1;
    trace.push({
      tag: TAGS.INIT,
      local_vars: { top: currentTop, size: dataList.length },
      dataSnapshot: [],
      meta,
    });
    return trace;
  }

  const { type, value } = action;

  if (type === "add") {
    const oldList = dataList.slice(0, -1);
    let currentTop = oldList.length - 1;

    trace.push({
      tag: TAGS.PUSH_START,
      local_vars: { top: currentTop, value },
      dataSnapshot: [],
      meta,
    });
    currentTop++;
    trace.push({
      tag: TAGS.PUSH_INC_TOP,
      local_vars: { top: currentTop, value },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.PUSH_ASSIGN,
      local_vars: { top: currentTop, value },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.PUSH_COMPLETE,
      local_vars: { top: currentTop, value },
      dataSnapshot: [],
      meta,
    });
  } else if (type === "delete") {
    if (value === undefined) {
      trace.push({
        tag: TAGS.POP_CHECK_EMPTY,
        local_vars: { top: -1 },
        dataSnapshot: [],
        meta,
      });
      trace.push({
        tag: TAGS.POP_ERROR,
        local_vars: { top: -1 },
        dataSnapshot: [],
        meta,
      });
      return trace;
    }

    const fullList = [
      ...dataList,
      { id: (action as any).targetId || "deleted-temp", value },
    ];
    let currentTop = fullList.length - 1;

    trace.push({
      tag: TAGS.POP_CHECK_EMPTY,
      local_vars: { top: currentTop },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.POP_GET_VALUE,
      local_vars: { top: currentTop, removed_value: value },
      dataSnapshot: [],
      meta,
    });
    currentTop--;
    trace.push({
      tag: TAGS.POP_DEC_TOP,
      local_vars: { top: currentTop, removed_value: value },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.POP_RETURN,
      local_vars: { top: currentTop, removed_value: value },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.POP_COMPLETE,
      local_vars: { top: currentTop, removed_value: value },
      dataSnapshot: [],
      meta,
    });
  } else if (type === "peek") {
    let currentTop = dataList.length - 1;
    if (dataList.length === 0) {
      trace.push({
        tag: TAGS.PEEK_CHECK_EMPTY,
        local_vars: { top: -1 },
        dataSnapshot: [],
        meta,
      });
      trace.push({
        tag: TAGS.PEEK_ERROR,
        local_vars: { top: -1 },
        dataSnapshot: [],
        meta,
      });
      return trace;
    }
    trace.push({
      tag: TAGS.PEEK_CHECK_EMPTY,
      local_vars: { top: currentTop },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.PEEK_RETURN,
      local_vars: { top: currentTop, value },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.PEEK_COMPLETE,
      local_vars: { top: currentTop, value },
      dataSnapshot: [],
      meta,
    });
  }

  return trace;
}

import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";
import { LinearData as BoxData, LinearAction as ActionType } from "../utils";

export function simulateQueueTrace(
  dataList: BoxData[],
  action?: ActionType,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const meta = { dataList, action };

  if (!action) {
    const rear = dataList.length - 1;
    trace.push({
      tag: TAGS.INIT,
      local_vars: { front: 0, rear },
      dataSnapshot: [],
      meta,
    });
    return trace;
  }

  const { type, value } = action;

  if (type === "add") {
    const oldList = dataList.slice(0, -1);
    let currentRear = oldList.length - 1;

    trace.push({
      tag: TAGS.ENQUEUE_START,
      local_vars: { front: 0, rear: currentRear, value },
      dataSnapshot: [],
      meta,
    });
    currentRear++;
    trace.push({
      tag: TAGS.ENQUEUE_INC_REAR,
      local_vars: { front: 0, rear: currentRear, value },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.ENQUEUE_ASSIGN,
      local_vars: { front: 0, rear: currentRear, value },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.ENQUEUE_COMPLETE,
      local_vars: { front: 0, rear: currentRear, value },
      dataSnapshot: [],
      meta,
    });
  } else if (type === "delete") {
    if (value === undefined) {
      trace.push({
        tag: TAGS.DEQUEUE_CHECK_EMPTY,
        local_vars: { front: 0, rear: -1 },
        dataSnapshot: [],
        meta,
      });
      trace.push({
        tag: TAGS.DEQUEUE_ERROR,
        local_vars: { front: 0, rear: -1 },
        dataSnapshot: [],
        meta,
      });
      return trace;
    }

    const fullList = [
      { id: (action as any).targetId || "del-temp", value },
      ...dataList,
    ];
    const oldRear = fullList.length - 1;

    trace.push({
      tag: TAGS.DEQUEUE_CHECK_EMPTY,
      local_vars: { front: 0, rear: oldRear },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.DEQUEUE_GET_VALUE,
      local_vars: { front: 0, rear: oldRear, removed_value: value },
      dataSnapshot: [],
      meta,
    });

    const newRear = oldRear - 1;
    trace.push({
      tag: TAGS.DEQUEUE_DEC_REAR,
      local_vars: { front: 0, rear: newRear, removed_value: value },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.DEQUEUE_RETURN,
      local_vars: { front: 0, rear: newRear, removed_value: value },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.DEQUEUE_COMPLETE,
      local_vars: { front: 0, rear: newRear, removed_value: value },
      dataSnapshot: [],
      meta,
    });
  } else if (type === "peek") {
    const rear = dataList.length - 1;
    if (dataList.length === 0) {
      trace.push({
        tag: TAGS.PEEK_CHECK_EMPTY,
        local_vars: { front: 0, rear: -1 },
        dataSnapshot: [],
        meta,
      });
      trace.push({
        tag: TAGS.PEEK_ERROR,
        local_vars: { front: 0, rear: -1 },
        dataSnapshot: [],
        meta,
      });
      return trace;
    }
    trace.push({
      tag: TAGS.PEEK_CHECK_EMPTY,
      local_vars: { front: 0, rear },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.PEEK_RETURN,
      local_vars: { front: 0, rear, value },
      dataSnapshot: [],
      meta,
    });
    trace.push({
      tag: TAGS.PEEK_COMPLETE,
      local_vars: { front: 0, rear, value },
      dataSnapshot: [],
      meta,
    });
  }

  return trace;
}

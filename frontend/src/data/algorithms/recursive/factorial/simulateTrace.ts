import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";

interface StackItem {
  n: number;
  val: number;
}

export function simulateFactorialTrace(targetN: number): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const stack: StackItem[] = [];

  const pushTrace = (
    tag: string,
    local_vars: Record<string, any>,
    metaOpts: {
      preparingNode?: StackItem | null;
      poppingNode?: StackItem | null;
      highlightIndices?: number[];
      completeIndices?: number[];
    } = {},
  ) => {
    trace.push({
      tag,
      local_vars,
      dataSnapshot: [],
      meta: {
        stack: stack.map((s) => ({ ...s })),
        preparingNode: metaOpts.preparingNode || null,
        poppingNode: metaOpts.poppingNode || null,
        highlightIndices: metaOpts.highlightIndices || [],
        completeIndices: metaOpts.completeIndices || [],
      },
    });
  };

  // 1. 初始狀態
  pushTrace(TAGS.INIT, { targetN });

  // Phase 1: 依序 Push 直到 Base Case
  for (let currN = targetN; currN >= 1; currN--) {
    // 準備推入
    pushTrace(
      TAGS.PUSH_START,
      { n: currN },
      { preparingNode: { n: currN, val: currN } },
    );

    // 正式進入堆疊陣列
    stack.push({ n: currN, val: currN });
    pushTrace(
      TAGS.PUSH_ASSIGN,
      { n: currN },
      { highlightIndices: [stack.length - 1] },
    );

    // 達到 Base Case
    if (currN === 1) {
      pushTrace(
        TAGS.BASE_CASE,
        { n: 1, val: 1 },
        { completeIndices: [stack.length - 1] },
      );
    }
  }

  // Phase 2: 雙高亮 -> 乘上去 -> Pop 往右
  while (stack.length > 1) {
    const topIdx = stack.length - 1;
    const parentIdx = stack.length - 2;

    const topItem = stack[topIdx];
    const parentItem = stack[parentIdx];

    // 1. 同時標亮第 n 和 n-1 個槽位
    pushTrace(
      TAGS.CALC_START,
      {
        current_f: parentItem.n,
        child_val: topItem.val,
        current_val: parentItem.val,
      },
      { highlightIndices: [parentIdx, topIdx] },
    );

    // 2. 將數值乘上去
    parentItem.val = parentItem.val * topItem.val;

    pushTrace(
      TAGS.CALC_MULTIPLY,
      {
        current_f: parentItem.n,
        child_val: topItem.val,
        new_val: parentItem.val,
      },
      { highlightIndices: [parentIdx, topIdx] },
    );

    // 3. Pop 移出堆疊
    const poppedItem = stack.pop()!;

    pushTrace(
      TAGS.POP_RIGHT,
      {
        returned_f: poppedItem.n,
        returned_val: poppedItem.val,
      },
      {
        poppingNode: poppedItem,
        completeIndices: [parentIdx], // 父節點接收完畢，給予 Complete 提示
      },
    );
  }

  // Phase 3: 最終結果停留
  pushTrace(
    TAGS.DONE,
    { final_result: stack[0].val },
    { completeIndices: [0] },
  );

  return trace;
}

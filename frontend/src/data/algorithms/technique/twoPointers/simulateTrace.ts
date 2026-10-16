import type { ExecutionTrace, TraceEvent, JsonValue } from "@/types/trace";
import { TAGS } from "./tags";
import { LinearData } from "@/data/DataStructure/linear/utils";
import type { TwoPointersMode } from "@/types/implementation";

export const DEFAULT_TWO_POINTERS_TARGET = 10;

export interface TwoPointersAction {
  mode?: string;
  target?: number;
}

export interface TwoPointersMeta {
  mode: TwoPointersMode;
  target: number;
  /** two_sum: 左右指標；remove_duplicates: slow / fast */
  first: number;
  second: number;
  /** two_sum: 找到的答案位置（-1 = 無） */
  foundLeft: number;
  foundRight: number;
  /** remove_duplicates: 已確定不重複的前綴長度 */
  keptLength: number;
}

function toMode(mode: string | undefined): TwoPointersMode {
  return mode === "remove_duplicates" ? "remove_duplicates" : "two_sum";
}

export function simulateTwoPointersTrace(
  inputData: LinearData[],
  action?: TwoPointersAction,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const arr = inputData.map((d) => ({ ...d }));
  if (arr.length === 0) return trace;

  const mode = toMode(action?.mode);
  const target = action?.target ?? DEFAULT_TWO_POINTERS_TARGET;
  const valueAt = (i: number) => Number(arr[i].value) || 0;

  const pushTrace = (
    tag: string,
    vars: Record<string, JsonValue>,
    meta: Partial<TwoPointersMeta>,
  ) => {
    const fullMeta: TwoPointersMeta = {
      mode,
      target,
      first: -1,
      second: -1,
      foundLeft: -1,
      foundRight: -1,
      keptLength: 0,
      ...meta,
    };
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: arr.map((d) => ({ ...d })),
      meta: { ...fullMeta },
    });
  };

  if (mode === "two_sum") {
    // 對向雙指標：排序陣列中找兩數和 = target
    let left = 0;
    let right = arr.length - 1;

    pushTrace(TAGS.INIT, { left, right, target }, { first: left, second: right });

    while (left < right) {
      const sum = valueAt(left) + valueAt(right);
      pushTrace(
        TAGS.COMPARE,
        { left, right, sum, target },
        { first: left, second: right },
      );

      if (sum === target) {
        // 找到即為最後一步（對應 pseudo 的 Return (left, right)）
        pushTrace(
          TAGS.FOUND,
          { left, right, sum, target },
          { first: left, second: right, foundLeft: left, foundRight: right },
        );
        return trace;
      }

      if (sum < target) {
        left++;
        pushTrace(
          TAGS.MOVE_LEFT,
          { left, right, sum, target },
          { first: left, second: right },
        );
      } else {
        right--;
        pushTrace(
          TAGS.MOVE_RIGHT,
          { left, right, sum, target },
          { first: left, second: right },
        );
      }
    }

    pushTrace(TAGS.DONE, { left, right }, { first: left, second: right });
    return trace;
  }

  // 同向雙指標（快慢指標）：原地移除排序陣列中的重複元素
  let slow = 0;
  pushTrace(TAGS.INIT, { slow, fast: 1 }, { first: slow, second: 1, keptLength: 1 });

  for (let fast = 1; fast < arr.length; fast++) {
    pushTrace(
      TAGS.SCAN,
      { slow, fast, slowVal: valueAt(slow), fastVal: valueAt(fast) },
      { first: slow, second: fast, keptLength: slow + 1 },
    );

    if (valueAt(fast) === valueAt(slow)) {
      pushTrace(
        TAGS.SKIP_DUPLICATE,
        { slow, fast, val: valueAt(fast) },
        { first: slow, second: fast, keptLength: slow + 1 },
      );
      continue;
    }

    slow++;
    arr[slow] = { ...arr[slow], value: arr[fast].value };
    pushTrace(
      TAGS.WRITE_UNIQUE,
      { slow, fast, val: valueAt(slow) },
      { first: slow, second: fast, keptLength: slow + 1 },
    );
  }

  const length = slow + 1;
  pushTrace(TAGS.DONE, { length }, { first: slow, second: -1, keptLength: length });
  return trace;
}

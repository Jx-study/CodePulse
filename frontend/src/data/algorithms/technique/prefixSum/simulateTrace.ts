import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS, PrefixSumStatus } from "./tags";
import { LinearData } from "@/data/DataStructure/linear/utils";

export function simulatePrefixSumTrace(
  inputData: LinearData[],
  action?: any,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const sourceData = inputData.map((d) => ({ ...d }));
  const n = sourceData.length;

  const pushTrace = (
    tag: string,
    vars: any,
    prefixList: (number | null)[],
    prefixStatusMap: Record<number, string>,
    sourceStatusMap: Record<number, string>,
  ) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: sourceData.map((d) => ({ ...d })),
      meta: {
        prefixList: [...prefixList],
        prefixStatusMap: { ...prefixStatusMap },
        sourceStatusMap: { ...sourceStatusMap },
      },
    });
  };

  const prefixArrForQuery: (number | null)[] = new Array(n).fill(0);
  let currentSum = 0;
  for (let i = 0; i < n; i++) {
    currentSum += Number(sourceData[i].value) || 0;
    prefixArrForQuery[i] = currentSum;
  }

  // 查詢階段 (Query)
  if (action && action.range && Array.isArray(action.range)) {
    const [L, R] = action.range;
    if (L < 0 || R >= n || L > R) return trace;

    pushTrace(TAGS.QUERY_START, { L, R }, prefixArrForQuery, {}, {});

    // R 標記為 QueryRight
    pushTrace(
      TAGS.QUERY_GET_R,
      { R, valR: prefixArrForQuery[R] },
      prefixArrForQuery,
      {
        [R]: PrefixSumStatus.QueryRight,
      },
      {},
    );

    const valR = prefixArrForQuery[R]!;

    if (L > 0) {
      const valL_1 = prefixArrForQuery[L - 1]!;
      // L-1 標記為 QueryLeft
      pushTrace(
        TAGS.QUERY_GET_L,
        { L, prevL: L - 1, valL: valL_1 },
        prefixArrForQuery,
        {
          [R]: PrefixSumStatus.QueryRight,
          [L - 1]: PrefixSumStatus.QueryLeft,
        },
        {},
      );

      const result = valR - valL_1;
      pushTrace(
        TAGS.QUERY_RETURN_SUB,
        { valR, valL: valL_1, result },
        prefixArrForQuery,
        {
          [R]: PrefixSumStatus.QueryRight,
          [L - 1]: PrefixSumStatus.QueryLeft,
        },
        {},
      );
    } else {
      pushTrace(
        TAGS.QUERY_ELSE,
        { L },
        prefixArrForQuery,
        {
          [R]: PrefixSumStatus.QueryRight,
        },
        {},
      );

      pushTrace(
        TAGS.QUERY_RETURN_DIRECT,
        { result: valR },
        prefixArrForQuery,
        {
          [R]: PrefixSumStatus.QueryRight,
        },
        {},
      );
    }

    return trace;
  }

  // 建構階段 (Build)
  const prefixArr: (number | null)[] = new Array(n).fill(null);

  pushTrace(TAGS.BUILD_INIT, { n }, prefixArr, {}, {});

  if (n > 0) {
    const val0 = Number(sourceData[0].value) || 0;
    prefixArr[0] = val0;
    pushTrace(
      TAGS.BUILD_BASE,
      { val0 },
      prefixArr,
      { 0: PrefixSumStatus.Complete },
      { 0: PrefixSumStatus.BuildCurrent },
    );
  }

  for (let i = 1; i < n; i++) {
    const currentVal = Number(sourceData[i].value) || 0;
    const prevSum = prefixArr[i - 1] ?? 0;
    const newSum = prevSum + currentVal;

    // 橘色 (當前), 黃色 (前一項)
    pushTrace(
      TAGS.BUILD_CALC,
      { i, prevSum, currentVal, newSum },
      prefixArr,
      { [i - 1]: PrefixSumStatus.BuildPrev },
      { [i]: PrefixSumStatus.BuildCurrent },
    );

    prefixArr[i] = newSum;
    pushTrace(
      TAGS.BUILD_UPDATE,
      { i, newSum },
      prefixArr,
      { [i - 1]: PrefixSumStatus.BuildPrev, [i]: PrefixSumStatus.Complete },
      { [i]: PrefixSumStatus.BuildCurrent },
    );
  }

  pushTrace(TAGS.BUILD_DONE, {}, prefixArr, {}, {});

  return trace;
}

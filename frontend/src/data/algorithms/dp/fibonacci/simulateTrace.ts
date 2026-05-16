import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";

export function simulateFibonacciDPTrace(targetN: number): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const dp: (number | null)[] = Array(targetN + 1).fill(null);

  // Helper：將當前 dp 狀態轉成 Trace 需要的 dataSnapshot
  const getSnapshot = () =>
    dp.map((val, i) => ({
      id: `fib-box-${i}`,
      value: val !== null ? val : "", // null 轉空字串給渲染層
    }));

  // 1. 初始化
  trace.push({
    tag: TAGS.INIT,
    variables: { n: targetN },
    dataSnapshot: getSnapshot(),
    meta: { isInitial: true },
  });

  // 2. Base Cases
  if (targetN >= 0) dp[0] = 0;
  if (targetN >= 1) dp[1] = 1;

  trace.push({
    tag: TAGS.BASE_CASES,
    variables: { "dp[0]": 0, "dp[1]": 1 },
    dataSnapshot: getSnapshot(),
    meta: { overrideStatusMap: { 0: "Target", 1: "Target" } },
  });

  // 3. 迴圈計算
  for (let i = 2; i <= targetN; i++) {
    const val1 = dp[i - 1]!;
    const val2 = dp[i - 2]!;

    trace.push({
      tag: TAGS.CALC_PREPARE,
      variables: { i, "dp[i-1]": val1, "dp[i-2]": val2 },
      dataSnapshot: getSnapshot(),
      meta: {
        overrideStatusMap: {
          [i - 1]: "Prepare",
          [i - 2]: "Prepare",
          [i]: "Target",
        },
      },
    });

    dp[i] = val1 + val2;

    trace.push({
      tag: TAGS.CALC_DONE,
      variables: { i, "dp[i]": dp[i], "dp[i-1]": val1, "dp[i-2]": val2 },
      dataSnapshot: getSnapshot(),
      meta: {
        overrideStatusMap: {
          [i - 1]: "Prepare",
          [i - 2]: "Prepare",
          [i]: "Target",
        },
      },
    });
  }

  // 4. 結束
  trace.push({
    tag: TAGS.DONE,
    variables: { result: dp[targetN] },
    dataSnapshot: getSnapshot(),
    meta: { status: "Complete" }, // 全部轉為 Complete
  });

  return trace;
}

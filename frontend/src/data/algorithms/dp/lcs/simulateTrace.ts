import type { ExecutionTrace, TraceEvent, JsonValue } from "@/types/trace";
import { TAGS, LCSStatus } from "./tags";

export type LCSData = { textA: string; textB: string };

export function simulateLCSTrace(inputData: LCSData): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const textA = inputData?.textA ?? "";
  const textB = inputData?.textB ?? "";
  const m = textA.length;
  const n = textB.length;

  // null 代表尚未填寫的格子
  const dp: (number | null)[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : null)),
  );
  // 回溯路徑與已確定的 LCS 字元，跨步驟保留
  const persistent: Record<string, string> = {};
  let lcsChars: string[] = [];

  const pushTrace = (
    tag: string,
    vars: Record<string, JsonValue>,
    transient: Record<string, string> = {},
  ) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: [],
      meta: {
        textA,
        textB,
        dp: dp.map((row) => [...row]),
        statusMap: { ...persistent, ...transient },
      },
    });
  };

  pushTrace(TAGS.INIT, { m, n });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const charA = textA[i - 1];
      const charB = textB[j - 1];
      const transient: Record<string, string> = {
        [`${i}-${j}`]: LCSStatus.Target,
        [`row-${i}`]: LCSStatus.Prepare,
        [`col-${j}`]: LCSStatus.Prepare,
      };

      if (charA === charB) {
        const diag = dp[i - 1][j - 1] as number;
        dp[i][j] = diag + 1;
        transient[`${i - 1}-${j - 1}`] = LCSStatus.Match;
        pushTrace(
          TAGS.MATCH,
          { i, j, charA, charB, diag, dpVal: dp[i][j] },
          transient,
        );
      } else {
        const up = dp[i - 1][j] as number;
        const left = dp[i][j - 1] as number;
        dp[i][j] = Math.max(up, left);
        transient[`${i - 1}-${j}`] = LCSStatus.Candidate;
        transient[`${i}-${j - 1}`] = LCSStatus.Candidate;
        pushTrace(
          TAGS.NO_MATCH,
          { i, j, charA, charB, up, left, dpVal: dp[i][j] },
          transient,
        );
      }
    }
  }

  const length = dp[m][n] as number;
  if (m === 0 || n === 0) {
    pushTrace(TAGS.DONE, { length: 0, lcs: "" });
    return trace;
  }

  let i = m;
  let j = n;
  persistent[`${i}-${j}`] = LCSStatus.Complete;
  pushTrace(TAGS.TRACE_START, { i, j, length, lcs: "" });

  while (i > 0 && j > 0) {
    const fromI = i;
    const fromJ = j;
    if (textA[i - 1] === textB[j - 1]) {
      const char = textA[i - 1];
      lcsChars = [char, ...lcsChars];
      persistent[`row-${i}`] = LCSStatus.Complete;
      persistent[`col-${j}`] = LCSStatus.Complete;
      i--;
      j--;
      persistent[`${i}-${j}`] = LCSStatus.Complete;
      pushTrace(TAGS.TRACE_MATCH, {
        i: fromI,
        j: fromJ,
        char,
        lcs: lcsChars.join(""),
      });
    } else if ((dp[i - 1][j] as number) >= (dp[i][j - 1] as number)) {
      const up = dp[i - 1][j] as number;
      const left = dp[i][j - 1] as number;
      i--;
      persistent[`${i}-${j}`] = LCSStatus.Complete;
      pushTrace(TAGS.TRACE_UP, {
        i: fromI,
        j: fromJ,
        up,
        left,
        lcs: lcsChars.join(""),
      });
    } else {
      const up = dp[i - 1][j] as number;
      const left = dp[i][j - 1] as number;
      j--;
      persistent[`${i}-${j}`] = LCSStatus.Complete;
      pushTrace(TAGS.TRACE_LEFT, {
        i: fromI,
        j: fromJ,
        up,
        left,
        lcs: lcsChars.join(""),
      });
    }
  }

  pushTrace(TAGS.DONE, { length, lcs: lcsChars.join("") });

  return trace;
}

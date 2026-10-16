import { describe, expect, it } from "vitest";
import { simulateLCSTrace } from "../simulateTrace";
import { lcsTraceToSteps } from "../traceToSteps";
import { TAGS, LCSStatus } from "../tags";
import type { Box } from "@/modules/core/DataLogic/Box";

// tsconfig lib 尚未包含 ES2022 的 Array.prototype.at
const last = <T,>(arr: T[]): T => arr[arr.length - 1];

const isSubsequence = (sub: string, text: string) => {
  let k = 0;
  for (const ch of text) if (ch === sub[k]) k++;
  return k === sub.length;
};

// 以遞迴 + memo 獨立計算 LCS 長度，用來對照 DP 表
const referenceLength = (a: string, b: string): number => {
  const memo = new Map<string, number>();
  const go = (i: number, j: number): number => {
    if (i === a.length || j === b.length) return 0;
    const key = `${i},${j}`;
    if (!memo.has(key)) {
      memo.set(
        key,
        a[i] === b[j] ? go(i + 1, j + 1) + 1 : Math.max(go(i + 1, j), go(i, j + 1)),
      );
    }
    return memo.get(key)!;
  };
  return go(0, 0);
};

describe("LCS trace", () => {
  it("fills the table and backtracks the classic CLRS example", () => {
    const trace = simulateLCSTrace({ textA: "ABCBDAB", textB: "BDCABA" });
    const tags = trace.map((e) => e.tag);

    expect(tags[0]).toBe(TAGS.INIT);
    expect(tags.filter((t) => t === TAGS.MATCH || t === TAGS.NO_MATCH)).toHaveLength(7 * 6);
    expect(tags).toContain(TAGS.TRACE_START);
    expect(last(tags)).toBe(TAGS.DONE);

    const done = last(trace);
    expect(done.local_vars.length).toBe(4);
    expect(done.local_vars.lcs).toBe("BCBA");
  });

  it("matches a brute-force reference on assorted inputs", () => {
    const cases: [string, string][] = [
      ["AGGTAB", "GXTXAYB"],
      ["ABCD", "ABCD"],
      ["ABC", "DEF"],
      ["AAAA", "AA"],
      ["BADCAB", "ACBDBA"],
    ];
    for (const [a, b] of cases) {
      const trace = simulateLCSTrace({ textA: a, textB: b });
      const lcs = last(trace).local_vars.lcs as string;
      expect(lcs.length).toBe(referenceLength(a, b));
      expect(isSubsequence(lcs, a)).toBe(true);
      expect(isSubsequence(lcs, b)).toBe(true);
    }
  });

  it("ends immediately when a string is empty", () => {
    const trace = simulateLCSTrace({ textA: "", textB: "ABC" });
    expect(trace.map((e) => e.tag)).toEqual([TAGS.INIT, TAGS.DONE]);
    expect(last(trace).local_vars.length).toBe(0);
  });

  it("renders the full table and marks the backtrack path", () => {
    const steps = lcsTraceToSteps(simulateLCSTrace({ textA: "AB", textB: "B" }));
    const final = last(steps).elements as Box[];
    // corner + 2 欄表頭 + 3 列表頭 + 3×2 格子
    expect(final).toHaveLength(1 + 2 + 3 + 6);

    const byId = (id: string) => final.find((b) => b.id === id)!;
    expect(byId("dp-2-1").value).toBe("1");
    expect(byId("dp-2-1").status).toBe(LCSStatus.Complete);
    expect(byId("row-2").status).toBe(LCSStatus.Complete);
    expect(byId("col-1").status).toBe(LCSStatus.Complete);
    expect(byId("row-1").status).toBe(LCSStatus.Inactive);

    // 變數面板讀的是 local_vars
    expect(last(steps).local_vars).toEqual({ length: 1, lcs: "B" });
    expect(steps[1].local_vars).toMatchObject({ i: 1, j: 1, charA: "A", charB: "B", dpVal: 0 });

    // 第一步尚未填寫的格子是空白
    const first = steps[0].elements as Box[];
    expect(first.find((b) => b.id === "dp-1-1")!.value).toBe("");
  });
});

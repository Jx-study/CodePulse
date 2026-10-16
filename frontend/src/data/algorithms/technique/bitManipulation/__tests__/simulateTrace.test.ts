import { describe, expect, it } from "vitest";
import { simulateBitManipulationTrace, type BitManipulationData } from "../simulateTrace";
import { bitManipulationTraceToSteps } from "../traceToSteps";
import { TAGS, BitManipulationStatus } from "../tags";
import type { Box } from "@/modules/core/DataLogic/Box";

// tsconfig lib 尚未包含 ES2022 的 Array.prototype.at
const last = <T,>(arr: T[]): T => arr[arr.length - 1];

const base: BitManipulationData = {
  mode: "bit_ops",
  a: 12,
  b: 10,
  op: "AND",
  k: 2,
  singleOp: "SET",
  n: 44,
  items: [3, 5, 2, 7],
  target: 10,
};

const popcount = (v: number) => v.toString(2).split("").filter((c) => c === "1").length;

describe("bit manipulation trace: bitwise ops", () => {
  it("computes AND / OR / XOR one bit per step", () => {
    const cases: [BitManipulationData["op"], number][] = [
      ["AND", 12 & 10],
      ["OR", 12 | 10],
      ["XOR", 12 ^ 10],
    ];
    for (const [op, expected] of cases) {
      const trace = simulateBitManipulationTrace({ ...base, op });
      const tags = trace.map((e) => e.tag);
      expect(tags[0]).toBe(TAGS.OPS_INIT);
      expect(tags.filter((t) => t === TAGS[`OPS_BIT_${op}`])).toHaveLength(8);
      expect(last(tags)).toBe(TAGS.OPS_DONE);
      expect(last(trace).local_vars.result).toBe(expected);
    }
  });

  it("renders bit 0 in the rightmost column and highlights the current bit", () => {
    const steps = bitManipulationTraceToSteps(simulateBitManipulationTrace(base));
    const first = steps[0].elements as Box[];
    const byId = (els: Box[], id: string) => els.find((b) => b.id === id)!;

    // 12 = 00001100
    expect(byId(first, "a-2").value).toBe("1");
    expect(byId(first, "a-2").status).toBe(BitManipulationStatus.One);
    expect(byId(first, "a-0").status).toBe(BitManipulationStatus.Unfinished);
    expect(byId(first, "a-0").position.x).toBeGreaterThan(byId(first, "a-7").position.x);
    expect(byId(first, "result-0").value).toBe("");

    const bit3 = steps[4].elements as Box[];
    expect(steps[4].local_vars).toMatchObject({ k: 3, bitA: 1, bitB: 1, bit: 1 });
    expect(byId(bit3, "a-3").status).toBe(BitManipulationStatus.Prepare);
    expect(byId(bit3, "result-3").status).toBe(BitManipulationStatus.Target);
    expect(byId(bit3, "result-value").value).toBe("8");
  });
});

describe("bit manipulation trace: count bits", () => {
  it("runs one n & (n - 1) round per set bit", () => {
    for (const n of [1, 44, 128, 255, 170]) {
      const trace = simulateBitManipulationTrace({ ...base, mode: "count_bits", n });
      const clears = trace.filter((e) => e.tag === TAGS.COUNT_CLEAR);
      expect(clears).toHaveLength(popcount(n));
      expect(last(clears).local_vars.next).toBe(0);
      expect(last(trace).local_vars).toMatchObject({
        count: popcount(n),
        isPowerOfTwo: popcount(n) === 1,
      });
    }
  });

  it("marks the lowest set bit and the bits flipped by n - 1", () => {
    // 44 = 00101100，最低位的 1 在第 2 位
    const trace = simulateBitManipulationTrace({ ...base, mode: "count_bits", n: 44 });
    const minusStep = trace.find((e) => e.tag === TAGS.COUNT_MINUS_ONE)!;
    expect(minusStep.local_vars).toMatchObject({ n: 44, minus: 43, lowestBit: 2 });

    const steps = bitManipulationTraceToSteps(trace);
    const els = steps[1].elements as Box[];
    const byId = (id: string) => els.find((b) => b.id === id)!;
    expect(byId("n-2").status).toBe(BitManipulationStatus.Target);
    expect(byId("minus-0").status).toBe(BitManipulationStatus.Prepare);
    expect(byId("minus-2").status).toBe(BitManipulationStatus.Prepare);
    expect(byId("minus-3").status).toBe(BitManipulationStatus.One);
  });

  it("skips the loop for n = 0", () => {
    const trace = simulateBitManipulationTrace({ ...base, mode: "count_bits", n: 0 });
    expect(trace.map((e) => e.tag)).toEqual([TAGS.COUNT_INIT, TAGS.COUNT_DONE]);
    expect(last(trace).local_vars).toMatchObject({ count: 0, isPowerOfTwo: false });
  });
});

describe("bit manipulation trace: subset enumeration", () => {
  it("visits every mask and finds the subsets that hit the target", () => {
    const trace = simulateBitManipulationTrace({ ...base, mode: "subsets" });
    const perMask = trace.filter(
      (e) => e.tag === TAGS.SUBSET_CHECK || e.tag === TAGS.SUBSET_FOUND,
    );
    expect(perMask.map((e) => e.local_vars.mask)).toEqual(
      Array.from({ length: 16 }, (_, i) => i),
    );

    const found = trace.filter((e) => e.tag === TAGS.SUBSET_FOUND);
    // [3, 5, 2, 7] 中總和為 10：{3, 5, 2}（mask 7）、{3, 7}（mask 9）
    expect(found.map((e) => e.local_vars.mask)).toEqual([7, 9]);
    expect(found.map((e) => e.local_vars.subset)).toEqual(["{3, 5, 2}", "{3, 7}"]);
    expect(last(trace).local_vars).toMatchObject({ total: 16, count: 2 });
  });

  it("colors the chosen elements of a matching mask", () => {
    const steps = bitManipulationTraceToSteps(
      simulateBitManipulationTrace({ ...base, mode: "subsets" }),
    );
    const found = steps.find((s) => s.local_vars?.mask === 9)!;
    const els = found.elements as Box[];
    const byId = (id: string) => els.find((b) => b.id === id)!;

    expect(byId("mask-0").value).toBe("1");
    expect(byId("mask-3").value).toBe("1");
    expect(byId("item-0").status).toBe(BitManipulationStatus.Complete);
    expect(byId("item-1").status).toBe(BitManipulationStatus.Inactive);
    expect(byId("chosen-3").value).toBe("7");
    expect(byId("chosen-1").value).toBe("");
    expect(byId("chosen-value").value).toBe("sum = 10");
  });
});

describe("bit manipulation trace: NOT and shifts", () => {
  it("matches 8-bit NOT and shift results", () => {
    const cases: [BitManipulationData["op"], number, number, number, number][] = [
      // op, a, b, 預期結果, 該運算的步數（NOT 逐位 8 步；移位 = 整排移動 + 補 0）
      ["NOT", 12, 0, ~12 & 0xff, 8],
      ["SHL", 12, 2, (12 << 2) & 0xff, 2],
      ["SHL", 200, 1, (200 << 1) & 0xff, 2],
      ["SHR", 200, 3, 200 >> 3, 2],
      ["SHR", 5, 8, 0, 2],
      ["SHL", 5, 0, 5, 1],
    ];
    for (const [op, a, b, expected, stepCount] of cases) {
      const trace = simulateBitManipulationTrace({ ...base, op, a, b });
      expect(trace.filter((e) => e.tag === TAGS[`OPS_BIT_${op}`])).toHaveLength(stepCount);
      expect(last(trace).local_vars.result).toBe(expected);
    }
  });

  it("moves the whole row at once, greys out dropped bits, then fills zeros", () => {
    // 200 = 11001000，左移 1 格：最高位的 1 被擠出去
    const trace = simulateBitManipulationTrace({ ...base, op: "SHL", a: 200, b: 1 });
    const steps = bitManipulationTraceToSteps(trace);
    const [move, fill] = steps.filter((s) => s.actionTag === TAGS.OPS_BIT_SHL);

    expect(move.description).toMatchObject({ key: "animation.ops_shift_move_shl" });
    const moveEls = move.elements as Box[];
    const at = (els: Box[], id: string) => els.find((b) => b.id === id)!;
    expect(at(moveEls, "a-7").status).toBe(BitManipulationStatus.Inactive);
    expect(at(moveEls, "a-3").status).toBe(BitManipulationStatus.Prepare);
    expect(at(moveEls, "result-4").value).toBe("1");
    expect(at(moveEls, "result-0").value).toBe("");

    expect(fill.description).toMatchObject({ key: "animation.ops_shift_fill_shl" });
    expect(at(fill.elements as Box[], "result-0").value).toBe("0");
    expect(at(fill.elements as Box[], "result-0").status).toBe(BitManipulationStatus.Target);

    expect(last(trace).local_vars).toMatchObject({ full: 400, result: 144 });
    expect(last(steps).description).toMatchObject({ key: "animation.ops_done_shl_overflow" });
    // NOT 與移位只有 a 和結果兩列
    expect(moveEls.some((b) => b.id === "b-0")).toBe(false);
  });
});

describe("bit manipulation trace: XOR swap", () => {
  it("swaps a and b in three XOR steps", () => {
    const trace = simulateBitManipulationTrace({ ...base, mode: "xor_swap", a: 12, b: 10 });
    expect(trace.map((e) => e.tag)).toEqual([
      TAGS.SWAP_INIT,
      TAGS.SWAP_STEP1,
      TAGS.SWAP_STEP2,
      TAGS.SWAP_STEP3,
      TAGS.SWAP_DONE,
    ]);
    expect(trace[1].local_vars).toMatchObject({ a: 12 ^ 10, b: 10 });
    expect(trace[2].local_vars).toMatchObject({ a: 12 ^ 10, b: 12 });
    expect(last(trace).local_vars).toMatchObject({ a: 10, b: 12 });
  });

  it("marks only the bits that changed in the assigned row", () => {
    const steps = bitManipulationTraceToSteps(
      simulateBitManipulationTrace({ ...base, mode: "xor_swap", a: 12, b: 10 }),
    );
    // 12 ^ 10 = 00000110：a 的第 1、3 位改變（1100 → 0110）
    const els = steps[1].elements as Box[];
    const at = (id: string) => els.find((b) => b.id === id)!;
    expect(at("a-1").status).toBe(BitManipulationStatus.Target);
    expect(at("a-3").status).toBe(BitManipulationStatus.Target);
    expect(at("a-2").status).toBe(BitManipulationStatus.One);
    expect(at("b-0").status).toBe(BitManipulationStatus.Prepare);
  });
});

describe("bit manipulation trace: lowbit", () => {
  it("builds -a from ~a + 1 and keeps only the lowest set bit", () => {
    for (const a of [1, 12, 44, 128, 255]) {
      const trace = simulateBitManipulationTrace({ ...base, mode: "lowbit", a });
      expect(trace.map((e) => e.tag)).toEqual([
        TAGS.LOWBIT_INIT,
        TAGS.LOWBIT_NOT,
        TAGS.LOWBIT_NEG,
        TAGS.LOWBIT_AND,
      ]);
      expect(trace[2].local_vars.negA).toBe(-a & 0xff);
      expect(last(trace).local_vars.result).toBe(a & -a);
    }
  });

  it("highlights the carry run and the surviving bit", () => {
    // 12 = 00001100，~12 = 11110011，+1 進位到第 2 位 → 11110100
    const steps = bitManipulationTraceToSteps(
      simulateBitManipulationTrace({ ...base, mode: "lowbit", a: 12 }),
    );
    const neg = steps[2].elements as Box[];
    expect(neg.find((b) => b.id === "neg-value")!.value).toBe("244");
    expect(neg.find((b) => b.id === "neg-2")!.status).toBe(BitManipulationStatus.Target);
    // 進位只影響第 0 ~ 2 位，更高的位元維持 ~a 的值
    expect(neg.find((b) => b.id === "neg-3")!.status).toBe(BitManipulationStatus.Unfinished);
    expect(neg.find((b) => b.id === "neg-4")!.status).toBe(BitManipulationStatus.One);

    const and = last(steps).elements as Box[];
    expect(and.find((b) => b.id === "result-value")!.value).toBe("4");
    expect(and.find((b) => b.id === "result-2")!.status).toBe(BitManipulationStatus.Complete);
  });

  it("handles a = 0", () => {
    const trace = simulateBitManipulationTrace({ ...base, mode: "lowbit", a: 0 });
    expect(last(trace).local_vars).toMatchObject({ result: 0, low: null });
    const steps = bitManipulationTraceToSteps(trace);
    expect(last(steps).description).toMatchObject({ key: "animation.lowbit_and_zero" });
  });
});

describe("bit manipulation layout", () => {
  it("reserves invisible space on the right for the status legend", () => {
    const steps = bitManipulationTraceToSteps(simulateBitManipulationTrace(base));
    const els = steps[0].elements as Box[];
    const spacer = els.find((b) => b.id === "legend-space")!;
    const value = els.find((b) => b.id === "a-value")!;
    expect(spacer.opacity).toBe(0);
    expect(spacer.position.x).toBeGreaterThan(value.position.x);
  });
});

describe("bit manipulation trace: single-bit operations", () => {
  it("sets, tests, clears and toggles bit k", () => {
    // 12 = 00001100
    const cases: [BitManipulationData["singleOp"], number, number][] = [
      ["SET", 0, 13],
      ["SET", 2, 12],
      ["TEST", 3, 8],
      ["TEST", 0, 0],
      ["CLEAR", 2, 8],
      ["TOGGLE", 7, 140],
    ];
    for (const [singleOp, k, expected] of cases) {
      const trace = simulateBitManipulationTrace({ ...base, mode: "single_bit", a: 12, k, singleOp });
      expect(trace.map((e) => e.tag)).toEqual([
        TAGS.SINGLE_INIT,
        TAGS.SINGLE_MASK,
        TAGS[`SINGLE_${singleOp}`],
      ]);
      expect(last(trace).local_vars.result).toBe(expected);
    }
  });

  it("uses an inverted mask for clear", () => {
    const steps = bitManipulationTraceToSteps(
      simulateBitManipulationTrace({ ...base, mode: "single_bit", a: 12, k: 2, singleOp: "CLEAR" }),
    );
    expect(steps[1].description).toMatchObject({ key: "animation.single_mask_clear" });
    const els = steps[1].elements as Box[];
    expect(els.find((b) => b.id === "mask-label")!.value).toBe("~(1 << k)");
    expect(els.find((b) => b.id === "mask-value")!.value).toBe("251");
  });
});

describe("bit manipulation trace: found subsets stay listed", () => {
  it("keeps one row per found subset through the last step", () => {
    const steps = bitManipulationTraceToSteps(simulateBitManipulationTrace({ ...base, mode: "subsets" }));
    const final = last(steps).elements as Box[];
    const byId = (id: string) => final.find((b) => b.id === id);

    expect(byId("found0-label")!.value).toBe("mask = 7");
    expect(byId("found1-label")!.value).toBe("mask = 9");
    expect(byId("found1-3")!.value).toBe("7");
    expect(byId("found1-3")!.status).toBe(BitManipulationStatus.Complete);
    expect(byId("found2-label")).toBeUndefined();
  });

  it("caps the listed rows and counts the rest", () => {
    // [1, 1, 1, 1] 取兩個相加為 2 的組合共 6 組
    const trace = simulateBitManipulationTrace({ ...base, mode: "subsets", items: [1, 1, 1, 1], target: 2 });
    expect(last(trace).local_vars.count).toBe(6);
    const final = last(bitManipulationTraceToSteps(trace)).elements as Box[];
    expect(final.filter((b) => /^found\d-label$/.test(b.id))).toHaveLength(4);
    expect(final.find((b) => b.id === "found-more-label")!.value).toBe("+2");
  });
});

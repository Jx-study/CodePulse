import { describe, expect, it } from "vitest";
import { simulateTwoPointersTrace } from "../simulateTrace";
import { twoPointersTraceToSteps } from "../traceToSteps";
import { TAGS, TwoPointersStatus } from "../tags";
import type { Box } from "@/modules/core/DataLogic/Box";

const toData = (values: number[]) =>
  values.map((value, i) => ({ id: `box-${i}`, value }));

const DEFAULT_VALUES = [1, 1, 2, 3, 3, 5, 7, 8, 8, 11];

// tsconfig lib 尚未包含 ES2022 的 Array.prototype.at
const last = <T,>(arr: T[]): T => arr[arr.length - 1];

describe("two pointers: two_sum", () => {
  it("moves both pointers inward and stops on the matching pair", () => {
    const trace = simulateTwoPointersTrace(toData(DEFAULT_VALUES), {
      mode: "two_sum",
      target: 10,
    });
    const tags = trace.map((e) => e.tag);

    expect(tags[0]).toBe(TAGS.INIT);
    expect(tags).toContain(TAGS.MOVE_LEFT);
    expect(tags).toContain(TAGS.MOVE_RIGHT);
    expect(last(tags)).toBe(TAGS.FOUND);
    expect(tags).not.toContain(TAGS.DONE);

    const found = last(trace)!;
    const l = found.meta!.foundLeft as number;
    const r = found.meta!.foundRight as number;
    expect(DEFAULT_VALUES[l] + DEFAULT_VALUES[r]).toBe(10);
  });

  it("ends with DONE when no pair matches", () => {
    const trace = simulateTwoPointersTrace(toData([1, 2, 4]), {
      mode: "two_sum",
      target: 100,
    });

    expect(last(trace)!.tag).toBe(TAGS.DONE);
    expect(trace.map((e) => e.tag)).not.toContain(TAGS.FOUND);
  });

  it("marks everything outside [L, R] as excluded", () => {
    const steps = twoPointersTraceToSteps(
      simulateTwoPointersTrace(toData(DEFAULT_VALUES), { mode: "two_sum", target: 10 }),
    );
    // 第一次 MOVE_RIGHT 後，最右邊那格已被排除
    const afterMoveRight = steps.find((s) => s.actionTag === TAGS.MOVE_RIGHT)!;
    const boxes = afterMoveRight.elements.filter((e) => e.kind === "box") as Box[];

    expect(last(boxes)!.status).toBe(TwoPointersStatus.Excluded);
  });
});

describe("two pointers: remove_duplicates", () => {
  it("compacts unique values into the prefix and reports its length", () => {
    const trace = simulateTwoPointersTrace(toData(DEFAULT_VALUES), {
      mode: "remove_duplicates",
    });
    const done = last(trace)!;

    expect(done.tag).toBe(TAGS.DONE);
    expect(done.local_vars.length).toBe(7);
    expect(done.dataSnapshot.slice(0, 7).map((d) => d.value)).toEqual([
      1, 2, 3, 5, 7, 8, 11,
    ]);
  });

  it("skips duplicates without moving slow", () => {
    const trace = simulateTwoPointersTrace(toData([4, 4, 4]), {
      mode: "remove_duplicates",
    });
    const tags = trace.map((e) => e.tag);

    expect(tags.filter((t) => t === TAGS.SKIP_DUPLICATE)).toHaveLength(2);
    expect(tags).not.toContain(TAGS.WRITE_UNIQUE);
    expect(last(trace)!.local_vars.length).toBe(1);
  });

  it("does not mutate the input data", () => {
    const input = toData([1, 1, 2]);
    simulateTwoPointersTrace(input, { mode: "remove_duplicates" });

    expect(input.map((d) => d.value)).toEqual([1, 1, 2]);
  });
});

it("returns an empty trace for empty input", () => {
  expect(simulateTwoPointersTrace([], { mode: "two_sum" })).toEqual([]);
});

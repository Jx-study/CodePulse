import { describe, expect, it, vi } from "vitest";
import { HeapConfig } from "../Heap";
import { TAGS } from "../heap/tags";

const run = (actionType: string) => {
  const warning = vi.fn();
  const result = HeapConfig.actionHandler!(
    actionType,
    { isMinHeap: false, isMaxHeap: true },
    [],
    { nextId: () => "n", toast: { warning } } as never,
  );
  const steps = HeapConfig.createAnimationSteps(
    result!.animationData,
    result!.animationParams as never,
    { hasTailMode: false, isDoubly: false },
  );
  return { steps, warning };
};

describe("heap operations on an empty heap", () => {
  it.each([
    ["delete", TAGS.EXTRACT_EMPTY],
    ["peek", TAGS.PEEK_EMPTY],
  ])("%s emits one warning step on the guard line", (action, tag) => {
    const { steps, warning } = run(action);

    expect(warning).not.toHaveBeenCalled();
    expect(steps).toHaveLength(1);
    expect(steps[0].actionTag).toBe(tag);
    expect(steps[0].warn).toBe(true);
    expect(
      HeapConfig.codeConfig?.pseudo?.mappings?.[tag],
    ).toBeDefined();
  });

  it("opts out of the generic empty-data toast", () => {
    expect(HeapConfig.hasEmptyGuard).toBe(true);
  });
});

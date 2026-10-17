import { describe, expect, it } from "vitest";
import { HeapConfig } from "../Heap";
import { mountStructure } from "@/data/__tests__/harness";

const maxHeap = { isMinHeap: false, isMaxHeap: true };

const emptied = () => {
  const heap = mountStructure(HeapConfig);
  while (heap.count() > 0) heap.custom("delete", maxHeap);
  heap.warning.mockClear();
  return heap;
};

describe("heap on an empty heap", () => {
  it.each([
    ["delete", "animation.extract_empty"],
    ["peek", "animation.peek_empty"],
  ])("%s shows the guard step and a warning instead of the generic empty-data toast", (action, key) => {
    const heap = emptied();

    const steps = heap.custom(action, maxHeap);

    expect(steps).toHaveLength(1);
    expect(heap.warning).toHaveBeenCalledTimes(1);
    expect(heap.warning).toHaveBeenCalledWith(key);
  });

  it("a non-empty heap shows no toast when extracting", () => {
    const heap = mountStructure(HeapConfig);

    heap.custom("delete", maxHeap);

    expect(heap.warning).not.toHaveBeenCalled();
    expect(heap.info).not.toHaveBeenCalled();
  });
});

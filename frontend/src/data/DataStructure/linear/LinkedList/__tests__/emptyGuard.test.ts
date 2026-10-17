import { describe, expect, it } from "vitest";
import { linkedListConfig } from "../LinkedList";
import { mountStructure } from "@/data/__tests__/harness";

const variants = [
  { isDoubly: false, hasTailMode: false },
  { isDoubly: false, hasTailMode: true },
  { isDoubly: true, hasTailMode: false },
  { isDoubly: true, hasTailMode: true },
];

const emptied = (flags: (typeof variants)[number]) => {
  const list = mountStructure(linkedListConfig, flags);
  while (list.count() > 0) list.remove("Head");
  list.warning.mockClear();
  return list;
};

describe.each(variants)("linked list %j", (flags) => {
  it.each(["Head", "Tail"])("deleting the %s of an empty list shows the guard step and a warning", (mode) => {
    const list = emptied(flags);

    const steps = list.remove(mode);

    expect(steps).toHaveLength(1);
    expect(list.warning).toHaveBeenCalledTimes(1);
    expect(list.warning).toHaveBeenCalledWith("animation.delete_empty");
  });

  it("deleting by index from an empty list shows the index guard step and a warning", () => {
    const list = emptied(flags);

    const steps = list.remove("Node N", 0);

    expect(steps).toHaveLength(1);
    expect(list.warning).toHaveBeenCalledTimes(1);
    expect(list.warning).toHaveBeenCalledWith("animation.delete_index_out_of_range");
  });

  it("inserting past the end shows the index guard step and a warning", () => {
    const list = mountStructure(linkedListConfig, flags);
    const before = list.count();

    const steps = list.add(9, "Node N", before + 1);

    expect(steps).toHaveLength(1);
    expect(steps[0].elements.length).toBeGreaterThan(0);
    expect(list.warning).toHaveBeenCalledWith("animation.insert_index_out_of_range");
  });

  it("deleting past the end shows the index guard step and keeps the list", () => {
    const list = mountStructure(linkedListConfig, flags);
    const before = list.count();

    const steps = list.remove("Node N", before);

    expect(steps).toHaveLength(1);
    expect(list.warning).toHaveBeenCalledWith("animation.delete_index_out_of_range");
    expect(list.count()).toBe(before);
  });
});

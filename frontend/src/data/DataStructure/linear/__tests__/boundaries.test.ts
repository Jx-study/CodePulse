import { describe, expect, it } from "vitest";
import { StackConfig } from "../Stack/Stack";
import { QueueConfig } from "../Queue/Queue";
import { mountStructure } from "@/data/__tests__/harness";

describe.each([
  { name: "stack", config: StackConfig, addMode: "Head", removeError: "animation.pop_error", overflowError: "animation.push_error" },
  { name: "queue", config: QueueConfig, addMode: "Tail", removeError: "animation.dequeue_error", overflowError: "animation.enqueue_error" },
])("$name", ({ config, addMode, removeError, overflowError }) => {
  const emptied = () => {
    const s = mountStructure(config);
    while (s.count() > 0) s.remove("Head");
    return s;
  };

  it("peek on an empty structure shows an info notice because it returns null", () => {
    const s = emptied();

    s.peek();

    expect(s.info).toHaveBeenCalledTimes(1);
    expect(s.info).toHaveBeenCalledWith("animation.peek_error");
    expect(s.warning).not.toHaveBeenCalled();
  });

  it("removing from an empty structure shows a warning because it returns Error", () => {
    const s = emptied();

    s.remove("Head");

    expect(s.warning).toHaveBeenCalledTimes(1);
    expect(s.warning).toHaveBeenCalledWith(removeError);
    expect(s.info).not.toHaveBeenCalled();
  });

  it("adding to a full structure plays the guard steps and warns once", () => {
    const s = mountStructure(config);
    while (s.count() < config.maxNodes!) s.add(1, addMode);
    s.warning.mockClear();

    const steps = s.add(1, addMode);

    expect(s.count()).toBe(config.maxNodes);
    expect(steps.length).toBeGreaterThan(1);
    expect(steps.some((step) => step.actionTag?.includes("DISCARD"))).toBe(false);
    expect(s.warning).toHaveBeenCalledTimes(1);
    expect(s.warning).toHaveBeenCalledWith(overflowError);
  });
});

import { describe, expect, it, vi } from "vitest";
import { linkedListConfig } from "../LinkedList";
import { selectVariant } from "../linkedlist/selectVariant";

const run = (
  mode: string,
  flags: { isDoubly: boolean; hasTailMode: boolean },
) => {
  const warning = vi.fn();
  const result = linkedListConfig.actionHandler!(
    "delete",
    { mode, ...flags },
    [],
    { nextId: () => "n", toast: { warning } } as never,
  );
  return { result, warning };
};

describe("linked list delete on an empty list", () => {
  const variants = [
    { isDoubly: false, hasTailMode: false },
    { isDoubly: false, hasTailMode: true },
    { isDoubly: true, hasTailMode: false },
    { isDoubly: true, hasTailMode: true },
  ];

  describe.each(variants)("variant %j", (flags) => {
    it.each([
      ["Head", "DELETE_HEAD_CHECK"],
      ["Tail", "DELETE_TAIL_START"],
    ])("%s shows one warning step on the guard line", (mode, tagName) => {
      const { result, warning } = run(mode, flags);
      const variant = selectVariant(flags.isDoubly, flags.hasTailMode);
      const steps = linkedListConfig.createAnimationSteps(
        result!.animationData,
        { type: "delete", ...(result!.animationParams as object) } as never,
        flags,
      );

      expect(warning).not.toHaveBeenCalled();
      expect(steps).toHaveLength(1);
      expect(steps[0].warn).toBe(true);
      expect(steps[0].actionTag).toBe(variant.TAGS[tagName]);
      expect(
        variant.codeConfig.pseudo?.mappings?.[steps[0].actionTag!],
      ).toBeDefined();
    });
  });

  it("still toasts for Node N because the pseudo code has no index check", () => {
    const { result, warning } = run("Node N", variants[0]);

    expect(result).toBeNull();
    expect(warning).toHaveBeenCalledTimes(1);
  });
});

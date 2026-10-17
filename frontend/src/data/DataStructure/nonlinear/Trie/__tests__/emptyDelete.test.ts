import { describe, expect, it, vi } from "vitest";
import { TrieConfig } from "../Trie";

describe("trie delete on an empty trie", () => {
  it("plays the not-found path instead of being blocked by a generic toast", () => {
    const warning = vi.fn();
    const result = TrieConfig.actionHandler!(
      "delete",
      { word: "cat" },
      [],
      { nextId: () => "n", toast: { warning } } as never,
    );
    const steps = TrieConfig.createAnimationSteps(
      result!.animationData,
      result!.animationParams as never,
      { hasTailMode: false, isDoubly: false },
    );

    expect(warning).not.toHaveBeenCalled();
    expect(steps.length).toBeGreaterThan(0);
    expect(TrieConfig.hasEmptyGuard).toBe(true);
  });
});

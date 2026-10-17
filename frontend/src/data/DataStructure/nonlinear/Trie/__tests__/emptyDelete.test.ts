import { describe, expect, it } from "vitest";
import { TrieConfig } from "../Trie";
import { mountStructure } from "@/data/__tests__/harness";

describe("trie delete on an empty trie", () => {
  it("plays the not-found path instead of the generic empty-data toast", () => {
    const trie = mountStructure(TrieConfig);
    for (const word of TrieConfig.defaultData as string[]) {
      trie.custom("delete", { word });
    }
    expect(trie.count()).toBe(0);
    trie.warning.mockClear();

    const steps = trie.custom("delete", { word: "cat" });

    expect(steps.length).toBeGreaterThan(0);
    expect(trie.warning).not.toHaveBeenCalledWith("toast.emptyDataOperation");
  });
});

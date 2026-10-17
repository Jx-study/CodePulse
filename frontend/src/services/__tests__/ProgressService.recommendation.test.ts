import { describe, expect, it, vi } from "vitest";
import type { Level, LevelProgress, UserProgress } from "@/types";

vi.mock("@/api/api", () => ({ default: {} }));

import { getRecommendedLevelId, INITIAL_USER_PROGRESS } from "../ProgressService";

function lv(id: string, layer: number, extra: Partial<Level> = {}): Level {
  return {
    id,
    category: "sorting",
    difficulty: 1,
    isDeveloped: true,
    isUnlocked: true,
    graphPosition: { layer, branch: "main", horizontalIndex: 0 },
    ...extra,
  };
}

function withProgress(
  entries: Record<string, Partial<LevelProgress>>,
): UserProgress {
  const levels: UserProgress["levels"] = {};
  for (const [id, p] of Object.entries(entries)) {
    levels[id] = { levelId: id, status: "unlocked", stars: 0, attempts: 0, bestTime: 0, ...p };
  }
  return { ...INITIAL_USER_PROGRESS, levels };
}

describe("getRecommendedLevelId", () => {
  it("recommends the lowest-layer unlocked, unfinished level", () => {
    const levels = [lv("bubble", 0), lv("selection", 1), lv("insertion", 1)];
    const progress = withProgress({ bubble: { status: "completed" } });
    expect(getRecommendedLevelId(levels, progress)).toBe("selection");
  });

  it("prefers a started level when several share the front layer", () => {
    const levels = [lv("selection", 1), lv("insertion", 1)];
    const progress = withProgress({ insertion: { teachingCompleted: true } });
    expect(getRecommendedLevelId(levels, progress)).toBe("insertion");
  });

  it("treats a level whose practice was entered but not submitted as started", () => {
    const levels = [lv("selection", 1), lv("insertion", 1)];
    const progress = withProgress({ insertion: { status: "in-progress", attempts: 0 } });
    expect(getRecommendedLevelId(levels, progress)).toBe("insertion");
  });

  it("prefers a started level on a higher layer over an untouched front layer", () => {
    const levels = [lv("bst", 3), lv("heap", 4), lv("graph", 4), lv("trie", 5)];
    const progress = withProgress({ bst: { status: "completed" }, trie: { attempts: 2 } });
    expect(getRecommendedLevelId(levels, progress)).toBe("trie");
  });

  it("prefers practice attempts over a tutorial-only level on a lower layer", () => {
    const levels = [lv("heap", 4), lv("trie", 5)];
    const progress = withProgress({
      heap: { teachingCompleted: true },
      trie: { status: "in-progress", attempts: 0 },
    });
    expect(getRecommendedLevelId(levels, progress)).toBe("trie");
  });

  it("picks the lowest layer among equally started levels", () => {
    const levels = [lv("trie", 5), lv("heap", 4), lv("graph", 4)];
    const progress = withProgress({
      trie: { teachingCompleted: true },
      graph: { teachingCompleted: true },
    });
    expect(getRecommendedLevelId(levels, progress)).toBe("graph");
  });

  it("treats a level without graphPosition as layer 0", () => {
    const levels = [lv("selection", 1), { ...lv("bubble", 0), graphPosition: undefined }];
    expect(getRecommendedLevelId(levels, withProgress({}))).toBe("bubble");
  });

  it("skips practice-locked levels", () => {
    const levels = [lv("quick", 0, { isUnlocked: false }), lv("merge", 1)];
    expect(getRecommendedLevelId(levels, withProgress({}))).toBe("merge");
  });

  it("never recommends undeveloped levels", () => {
    const levels = [lv("shell", 0, { isDeveloped: false }), lv("merge", 1)];
    expect(getRecommendedLevelId(levels, withProgress({}))).toBe("merge");
  });

  it("never recommends portal nodes", () => {
    const levels = [
      lv("to-searching", 0, { pathMetadata: { pathType: "portal" } as Level["pathMetadata"] }),
      lv("merge", 1),
    ];
    expect(getRecommendedLevelId(levels, withProgress({}))).toBe("merge");
  });

  it("returns null when every level is completed", () => {
    const levels = [lv("bubble", 0), lv("selection", 1)];
    const progress = withProgress({
      bubble: { status: "completed" },
      selection: { status: "completed" },
    });
    expect(getRecommendedLevelId(levels, progress)).toBeNull();
  });
});

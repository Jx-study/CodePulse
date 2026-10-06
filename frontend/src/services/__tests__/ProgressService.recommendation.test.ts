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

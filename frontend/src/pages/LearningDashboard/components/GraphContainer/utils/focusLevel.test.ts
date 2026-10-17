import { describe, expect, it } from "vitest";
import type { Level, LevelProgress, UserProgress } from "@/types";
import { getFocusLevelIndex } from "./focusLevel";

function lv(id: string, extra: Partial<Level> = {}): Level {
  return { id, category: "sorting", difficulty: 1, isDeveloped: true, isUnlocked: true, ...extra };
}

function withProgress(entries: Record<string, Partial<LevelProgress>>): UserProgress {
  const levels: UserProgress["levels"] = {};
  for (const [id, p] of Object.entries(entries)) {
    levels[id] = { levelId: id, status: "unlocked", stars: 0, attempts: 0, bestTime: 0, ...p };
  }
  return { levels } as UserProgress;
}

describe("getFocusLevelIndex", () => {
  const levels = [lv("bubble"), lv("selection"), lv("insertion")];

  it("focuses the recommended level", () => {
    expect(getFocusLevelIndex(levels, withProgress({}), "insertion")).toBe(2);
  });

  it("falls back to the first unfinished level when nothing is recommended", () => {
    const progress = withProgress({ bubble: { status: "completed" } });
    expect(getFocusLevelIndex(levels, progress, null)).toBe(1);
  });

  it("falls back when the recommended id is not in this category", () => {
    expect(getFocusLevelIndex(levels, withProgress({}), "dijkstra")).toBe(0);
  });

  it("skips undeveloped levels and portals in the fallback", () => {
    const mixed = [
      lv("shell", { isDeveloped: false }),
      lv("to-searching", { pathMetadata: { pathType: "portal" } as Level["pathMetadata"] }),
      lv("merge"),
    ];
    expect(getFocusLevelIndex(mixed, withProgress({}), null)).toBe(2);
  });

  it("focuses the last level when everything is passed", () => {
    const progress = withProgress({
      bubble: { status: "completed" },
      selection: { status: "completed" },
      insertion: { status: "completed" },
    });
    expect(getFocusLevelIndex(levels, progress, null)).toBe(2);
  });
});

import { describe, expect, it, vi } from "vitest";
import type { Level } from "@/types";

const levels = vi.hoisted(() => [
  { id: "with-practice", category: "sorting", difficulty: 1, isDeveloped: true, isUnlocked: true },
  { id: "no-practice", category: "sorting", difficulty: 1, isDeveloped: true, isUnlocked: true, hasPractice: false },
] as unknown as Level[]);

vi.mock("@/services/LevelService", () => ({
  getAllLevels: () => levels,
  getLevelById: (id: string) => levels.find((l) => l.id === id) ?? null,
}));

import {
  INITIAL_USER_PROGRESS,
  calculateOverallProgress,
  levelHasPractice,
  mergeApiProgress,
} from "@/services/ProgressService";

const apiRow = (slug: string, overrides: Record<string, unknown> = {}) => ({
  tutorial_slug: slug,
  teaching_completed: false,
  best_score: null,
  best_time_seconds: null,
  attempt_count: 0,
  practice_passed: false,
  last_accessed_at: null,
  ...overrides,
});

describe("levelHasPractice", () => {
  it("defaults to true and is false only when explicitly disabled", () => {
    expect(levelHasPractice(levels[0])).toBe(true);
    expect(levelHasPractice(levels[1])).toBe(false);
  });
});

describe("mergeApiProgress for levels without practice", () => {
  it("completes the level once the tutorial is completed, without stars", () => {
    const merged = mergeApiProgress(INITIAL_USER_PROGRESS, [
      apiRow("no-practice", { teaching_completed: true }),
    ]);
    expect(merged.levels["no-practice"].status).toBe("completed");
    expect(merged.levels["no-practice"].stars).toBe(0);
    expect(merged.totalLevelsCompleted).toBe(1);
  });

  it("stays incomplete before the tutorial is completed", () => {
    const merged = mergeApiProgress(INITIAL_USER_PROGRESS, [apiRow("no-practice")]);
    expect(merged.levels["no-practice"].status).not.toBe("completed");
  });

  it("still requires practice_passed for levels with practice", () => {
    const merged = mergeApiProgress(INITIAL_USER_PROGRESS, [
      apiRow("with-practice", { teaching_completed: true }),
    ]);
    expect(merged.levels["with-practice"].status).not.toBe("completed");
  });
});

describe("calculateOverallProgress", () => {
  it("excludes levels without practice from the star total", () => {
    const result = calculateOverallProgress(levels, INITIAL_USER_PROGRESS);
    expect(result.totalLevels).toBe(2);
    expect(result.totalStars).toBe(3);
  });
});

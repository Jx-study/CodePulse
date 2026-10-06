import { describe, expect, it } from "vitest";
import type { Level, LevelProgress } from "@/types";
import { getLevelNodeVisualState } from "./levelNodeState";

const level: Level = {
  id: "bubble-sort",
  category: "sorting",
  difficulty: 1,
  isDeveloped: true,
  isUnlocked: true,
};

function progress(overrides: Partial<LevelProgress> = {}): LevelProgress {
  return {
    levelId: "bubble-sort",
    status: "unlocked",
    stars: 0,
    attempts: 0,
    bestTime: 0,
    ...overrides,
  };
}

describe("getLevelNodeVisualState", () => {
  it("treats missing progress (guest) as not started with open arcs", () => {
    const state = getLevelNodeVisualState(level, undefined, false);
    expect(state).toEqual({
      isUndeveloped: false,
      phase: "not-started",
      teachingDone: false,
      practiceDone: false,
      practiceLocked: false,
      stars: 0,
    });
  });

  it("marks in-progress when teaching is done but practice is not", () => {
    const state = getLevelNodeVisualState(
      level,
      progress({ teachingCompleted: true }),
      false,
    );
    expect(state.phase).toBe("in-progress");
    expect(state.teachingDone).toBe(true);
    expect(state.practiceDone).toBe(false);
  });

  it("marks in-progress when practice was attempted without passing", () => {
    const state = getLevelNodeVisualState(
      level,
      progress({ status: "in-progress", attempts: 2 }),
      false,
    );
    expect(state.phase).toBe("in-progress");
    expect(state.teachingDone).toBe(false);
  });

  it("marks completed and carries stars when practice passed", () => {
    const state = getLevelNodeVisualState(
      level,
      progress({ status: "completed", stars: 2, teachingCompleted: true }),
      false,
    );
    expect(state.phase).toBe("completed");
    expect(state.practiceDone).toBe(true);
    expect(state.stars).toBe(2);
  });

  it("reports practice locked when prerequisites are unmet", () => {
    const state = getLevelNodeVisualState(level, progress(), true);
    expect(state.practiceLocked).toBe(true);
  });

  it("never reports a lock once practice has passed", () => {
    const state = getLevelNodeVisualState(
      level,
      progress({ status: "completed", stars: 3 }),
      true,
    );
    expect(state.practiceLocked).toBe(false);
  });

  it("flags undeveloped levels regardless of progress", () => {
    const state = getLevelNodeVisualState(
      { ...level, isDeveloped: false },
      progress({ status: "completed", stars: 3 }),
      false,
    );
    expect(state.isUndeveloped).toBe(true);
  });

  it("hides stars until practice passes", () => {
    const state = getLevelNodeVisualState(
      level,
      progress({ status: "in-progress", stars: 1 }),
      false,
    );
    expect(state.stars).toBe(0);
  });
});

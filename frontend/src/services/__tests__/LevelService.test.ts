import { describe, expect, it } from "vitest";
import { INITIAL_USER_PROGRESS } from "@/services/ProgressService";
import {
  getLevelConfigById,
  isLevelUnlocked,
  isPortalUnlocked,
  resolveEffectivePrerequisites,
} from "@/services/LevelService";

describe("portal unlock state", () => {
  it("traces through undeveloped prerequisites to the nearest developed gate", () => {
    expect(resolveEffectivePrerequisites(["bit-mask"])).toEqual([
      "sliding-window",
    ]);
  });

  it("keeps portal locked until the traced developed prerequisite is completed", () => {
    const portal = getLevelConfigById("portal-to-graph");
    const progress = {
      ...INITIAL_USER_PROGRESS,
      levels: {
        ...INITIAL_USER_PROGRESS.levels,
        "sliding-window": {
          levelId: "sliding-window",
          status: "locked" as const,
          stars: 0 as const,
          attempts: 0,
          bestTime: 0,
        },
      },
    };

    expect(portal).not.toBeNull();
    expect(isLevelUnlocked(portal!, progress)).toBe(false);
    expect(isPortalUnlocked("portal-to-graph", progress)).toBe(false);
  });

  it("unlocks portal after the traced developed prerequisite is completed", () => {
    const portal = getLevelConfigById("portal-to-graph");
    const progress = {
      ...INITIAL_USER_PROGRESS,
      levels: {
        ...INITIAL_USER_PROGRESS.levels,
        "sliding-window": {
          levelId: "sliding-window",
          status: "completed" as const,
          stars: 3 as const,
          attempts: 1,
          bestTime: 0,
        },
      },
    };

    expect(portal).not.toBeNull();
    expect(isLevelUnlocked(portal!, progress)).toBe(true);
    expect(isPortalUnlocked("portal-to-graph", progress)).toBe(true);
  });
});

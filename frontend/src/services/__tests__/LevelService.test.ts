import { describe, expect, it } from "vitest";
import { INITIAL_USER_PROGRESS } from "@/services/ProgressService";
import {
  getLevelConfigById,
  getLevelByImplKey,
  getEffectivePrerequisiteInfo,
  isLevelUnlocked,
  isPortalUnlocked,
  resolveEffectivePrerequisites,
} from "@/services/LevelService";

describe("getLevelByImplKey", () => {
  it("returns the main-path level matching a known implementationKey", () => {
    const result = getLevelByImplKey("bubbleSort");
    expect(result).not.toBeNull();
    expect(result!.id).toBe("bubble-sort");
    expect(result!.category).toBe("sorting");
  });

  it("returns the searching level for binarySearch", () => {
    const result = getLevelByImplKey("binarySearch");
    expect(result).not.toBeNull();
    expect(result!.id).toBe("binary-search");
    expect(result!.category).toBe("searching");
  });

  it("returns null for an unknown implementationKey", () => {
    expect(getLevelByImplKey("nonExistent")).toBeNull();
  });
});

describe("portal unlock state", () => {
  it("traces through undeveloped prerequisites to the nearest developed gate", () => {
    expect(resolveEffectivePrerequisites(["bit-mask"])).toEqual([
      "sliding-window",
    ]);
  });

  it("returns effective prerequisite info for dialog lock hints", () => {
    const nQueens = getLevelConfigById("n-queens");

    expect(nQueens).not.toBeNull();
    expect(getEffectivePrerequisiteInfo(nQueens!)).toEqual({
      type: "AND",
      levelIds: ["factorial"],
    });
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

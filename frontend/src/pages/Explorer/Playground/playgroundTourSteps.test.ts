import { describe, expect, it, vi } from "vitest";
import { buildPlaygroundTourSteps } from "./playgroundTourSteps";

describe("buildPlaygroundTourSteps", () => {
  it("skips the run step to tab-bar because the algo dialog never opens on skip", () => {
    const steps = buildPlaygroundTourSteps({
      runStage: "idle",
      lastRunOutcome: "none",
      goAnimationTab: vi.fn(),
      leftDockedId: null,
      isAlgoDialogOpen: false,
      t: ((key: string) => key) as never,
    });

    expect(steps.find(step => step.id === "run-button")?.skipTargetStepId).toBe("tab-bar");
  });
});

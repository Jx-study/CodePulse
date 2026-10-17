import { describe, expect, it, vi } from "vitest";
import { GraphConfig } from "../Graph";
import { GUARD_TAGS } from "../tags";

const defaultData = GraphConfig.defaultData as {
  nodes: { id: string; value: string }[];
  edges: string[][];
};

const run = (actionType: string, payload: Record<string, unknown>) => {
  const warning = vi.fn();
  const result = GraphConfig.actionHandler!(
    actionType,
    { isDirected: false, ...payload },
    JSON.parse(JSON.stringify(defaultData)),
    { nextId: () => "n", toast: { warning }, defaultData } as never,
  );
  const steps = GraphConfig.createAnimationSteps(
    result!.animationData,
    result!.animationParams as never,
    { hasTailMode: false, isDoubly: false },
  );
  return { result, steps, warning };
};

describe("graph handler guards end to end", () => {
  it.each([
    ["removeVertex", { id: "99" }],
    ["addVertex", { value: "0" }],
    ["addEdge", { source: "0", target: "99" }],
    ["removeEdge", { source: "0", target: "99" }],
    ["getNeighbors", { id: "99" }],
    ["getDegree", { id: "99" }],
    ["checkAdjacent", { source: "0", target: "99" }],
  ])("%s turns a bad input into one warning step", (action, payload) => {
    const { steps, warning } = run(action, payload);

    expect(steps).toHaveLength(1);
    expect(steps[0].warn).toBe(true);
    expect(GUARD_TAGS.has(steps[0].actionTag!)).toBe(true);
    expect(warning).not.toHaveBeenCalled();
  });
});

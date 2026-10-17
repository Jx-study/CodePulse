import { describe, expect, it } from "vitest";
import { simulateGraphTrace } from "../simulateTrace";
import { graphTraceToSteps } from "../traceToSteps";
import { GUARD_TAGS, TAGS } from "../tags";

const graph = {
  nodes: [
    { id: "node-0", value: "0" },
    { id: "node-1", value: "1" },
  ],
  edges: [["node-0", "node-1"]],
};

const run = (action: Parameters<typeof simulateGraphTrace>[1]) =>
  graphTraceToSteps(simulateGraphTrace(graph, action));

describe("graph guard steps", () => {
  it.each([
    [{ type: "addVertex", value: "0", guardTag: TAGS.ADD_VERTEX_DUPLICATE }],
    [{ type: "removeVertex", id: "9", guardTag: TAGS.REMOVE_VERTEX_MISSING }],
    [
      {
        type: "addEdge",
        source: "0",
        target: "9",
        guardTag: TAGS.ADD_EDGE_MISSING_VERTEX,
      },
    ],
    [
      {
        type: "addEdge",
        source: "0",
        target: "1",
        guardTag: TAGS.ADD_EDGE_DUPLICATE,
      },
    ],
    [
      {
        type: "removeEdge",
        source: "1",
        target: "9",
        guardTag: TAGS.REMOVE_EDGE_MISSING_VERTEX,
      },
    ],
    [
      {
        type: "removeEdge",
        source: "1",
        target: "0",
        isDirected: true,
        guardTag: TAGS.REMOVE_EDGE_NOT_FOUND,
      },
    ],
    [{ type: "getNeighbors", id: "9", guardTag: TAGS.GET_NEIGHBORS_MISSING }],
    [{ type: "getDegree", id: "9", guardTag: TAGS.GET_DEGREE_MISSING }],
    [
      {
        type: "checkAdjacent",
        source: "0",
        target: "9",
        guardTag: TAGS.CHECK_ADJACENT_MISSING,
      },
    ],
  ])("emits a single warning step for %j", (action) => {
    const steps = run(action);

    expect(steps).toHaveLength(1);
    expect(steps[0].actionTag).toBe(action.guardTag);
    expect(steps[0].warn).toBe(true);
    expect(GUARD_TAGS.has(action.guardTag)).toBe(true);
  });

  it("does not warn on a normal action", () => {
    const steps = run({ type: "addVertex", value: "2" });

    expect(steps.every((s) => !s.warn)).toBe(true);
  });
});

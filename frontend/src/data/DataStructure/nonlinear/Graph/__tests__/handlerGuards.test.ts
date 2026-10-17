import { describe, expect, it } from "vitest";
import { GraphConfig } from "../Graph";
import { mountStructure } from "@/data/__tests__/harness";

const { nodes, edges } = GraphConfig.defaultData as {
  nodes: { id: string }[];
  edges: string[][];
};
const idOf = (nodeId: string) => nodeId.replace("node-", "");
const [edgeFrom, edgeTo] = edges[0].map(idOf);
const hasEdge = (a: string, b: string) =>
  edges.some(
    ([x, y]) =>
      (idOf(x) === a && idOf(y) === b) || (idOf(x) === b && idOf(y) === a),
  );
const unconnected = nodes
  .map((n) => idOf(n.id))
  .flatMap((a, i, all) => all.slice(i + 1).map((b) => [a, b] as const))
  .find(([a, b]) => !hasEdge(a, b))!;
const MISSING = "99";

type Case = {
  name: string;
  action: string;
  payload: Record<string, unknown>;
  key: string;
  level: "warning" | "info";
};

const undirected = { isDirected: false };

const cases: Case[] = [
  { name: "duplicate vertex", action: "addVertex", payload: { ...undirected, value: edgeFrom }, key: "animation.add_vertex_duplicate", level: "warning" },
  { name: "missing vertex on remove", action: "removeVertex", payload: { ...undirected, id: MISSING }, key: "animation.remove_vertex_missing", level: "warning" },
  { name: "missing endpoint on addEdge", action: "addEdge", payload: { ...undirected, source: edgeFrom, target: MISSING }, key: "animation.add_edge_missing_vertex", level: "warning" },
  { name: "duplicate edge", action: "addEdge", payload: { ...undirected, source: edgeFrom, target: edgeTo }, key: "animation.add_edge_duplicate", level: "warning" },
  { name: "missing endpoint on removeEdge", action: "removeEdge", payload: { ...undirected, source: edgeFrom, target: MISSING }, key: "animation.remove_edge_missing_vertex", level: "warning" },
  { name: "edge not found", action: "removeEdge", payload: { ...undirected, source: unconnected[0], target: unconnected[1] }, key: "animation.remove_edge_not_found", level: "warning" },
  { name: "neighbors of a missing vertex", action: "getNeighbors", payload: { ...undirected, id: MISSING }, key: "animation.get_neighbors_missing", level: "info" },
  { name: "degree of a missing vertex", action: "getDegree", payload: { ...undirected, id: MISSING }, key: "animation.get_degree_missing", level: "info" },
  { name: "adjacency with a missing vertex", action: "checkAdjacent", payload: { ...undirected, source: edgeFrom, target: MISSING }, key: "animation.check_adjacent_missing", level: "info" },
];

describe("graph guards through the real action pipeline", () => {
  it.each(cases)("$name shows one step and one $level toast", ({ action, payload, key, level }) => {
    const graph = mountStructure(GraphConfig);

    const steps = graph.graph(action, payload);
    const other = level === "warning" ? graph.info : graph.warning;

    expect(steps).toHaveLength(1);
    expect(graph[level]).toHaveBeenCalledTimes(1);
    expect(graph[level]).toHaveBeenCalledWith(key);
    expect(other).not.toHaveBeenCalled();
  });

  it("a valid action plays several steps and shows no toast", () => {
    const graph = mountStructure(GraphConfig);

    const steps = graph.graph("addVertex", { ...undirected, value: MISSING });

    expect(steps.length).toBeGreaterThan(1);
    expect(graph.warning).not.toHaveBeenCalled();
    expect(graph.info).not.toHaveBeenCalled();
  });
});

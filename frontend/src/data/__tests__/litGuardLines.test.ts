import { describe, expect, it, vi } from "vitest";
import { linkedListConfig } from "@/data/DataStructure/linear/LinkedList/LinkedList";
import { HeapConfig } from "@/data/DataStructure/nonlinear/Heap/Heap";
import { BinaryTreeConfig } from "@/data/DataStructure/nonlinear/BinaryTree/BinaryTree";
import { TrieConfig } from "@/data/DataStructure/nonlinear/Trie/Trie";
import { GraphConfig } from "@/data/DataStructure/nonlinear/Graph/Graph";
import type { CodeConfig } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";

type Scenario = [string, Record<string, unknown>];

const litLines = (
  cfg: LevelImplementationConfig,
  code: CodeConfig,
  scenarios: Scenario[],
  flags: Record<string, unknown> = {},
) => {
  const lit = new Set<number>();
  const mappings = code.pseudo!.mappings!;
  for (const [action, payload] of scenarios) {
    const pl = { ...flags, ...payload };
    const result = cfg.actionHandler!(
      action,
      pl,
      JSON.parse(JSON.stringify(cfg.defaultData)),
      { nextId: () => "x", toast: { warning: vi.fn() }, defaultData: cfg.defaultData } as never,
    );
    if (!result) continue;
    const params = result!.useRawAnimationParams
      ? result!.animationParams
      : { type: action, ...pl, ...(result!.animationParams as object) };
    cfg
      .createAnimationSteps(result!.animationData, params as never, flags as never)
      .forEach((s) => (mappings[s.actionTag ?? ""] ?? []).forEach((n) => lit.add(n)));
  }
  return lit;
};

const lineOf = (code: CodeConfig, text: string, last = false) => {
  const lines = code.pseudo!.content.split("\n").map((l) => l.trim());
  const idx = last ? lines.lastIndexOf(text) : lines.indexOf(text);
  expect(idx, `pseudo line "${text}" exists`).toBeGreaterThanOrEqual(0);
  return idx + 1;
};

describe("guard lines light up in a normal run", () => {
  it("heap extract and peek show the empty check", () => {
    const code = HeapConfig.codeConfig!;
    const flags = { isMinHeap: false, isMaxHeap: true };
    const lit = litLines(HeapConfig, code, [["delete", {}], ["peek", {}]], flags);
    const guard = "If array.length = 0 Then Return Error";
    const lines = code.pseudo!.content.split("\n").map((l, i) => [i + 1, l.trim()] as const);

    lines.filter(([, l]) => l === guard).forEach(([n]) => expect(lit.has(n)).toBe(true));
    expect(lit.has(lineOf(code, "If array.length = 1 Then"))).toBe(true);
  });

  it("graph degree shows the missing-vertex check", () => {
    const code = GraphConfig.codeConfig!;
    const lit = litLines(GraphConfig, code, [
      ["getDegree", { id: "0", isDirected: false }],
      ["getDegree", { id: "0", isDirected: true }],
    ]);

    expect(lit.has(lineOf(code, "If id is not in adjList Then", true))).toBe(true);
  });

  it("trie delete shows the end-of-word check", () => {
    const code = TrieConfig.codeConfig!;
    const lit = litLines(TrieConfig, code, [["insert", { word: "cat" }], ["delete", { word: "cat" }]]);

    expect(lit.has(lineOf(code, "If Not curr.isEndOfWord Then"))).toBe(true);
  });

  it("binary tree bfs shows both child checks", () => {
    const code = BinaryTreeConfig.codeConfig!;
    const lit = litLines(BinaryTreeConfig, code, [["search", { mode: "bfs", value: 0 }]]);

    expect(lit.has(lineOf(code, "If curr.left ≠ Null Then Enqueue(Queue, curr.left)"))).toBe(true);
    expect(lit.has(lineOf(code, "If curr.right ≠ Null Then Enqueue(Queue, curr.right)"))).toBe(true);
  });

  it.each([
    { isDoubly: false, hasTailMode: false },
    { isDoubly: false, hasTailMode: true },
    { isDoubly: true, hasTailMode: false },
    { isDoubly: true, hasTailMode: true },
  ])("linked list leaves no If line unlit across normal operations for %j", (flags) => {
    const code = linkedListConfig.getCodeConfig!(flags as never);
    const scenarios: Scenario[] = [];
    for (const size of [1, 2, 4]) {
      scenarios.push(
        ["search", { value: 10, mode: "search", size }],
        ["search", { value: 99, mode: "search", size }],
      );
      for (const mode of ["Head", "Tail", "Node N"]) {
        for (const index of [0, 1, size - 1, size]) {
          scenarios.push(["add", { value: 9, mode, index, size }], ["delete", { mode, index, size }]);
        }
      }
    }
    const lit = new Set<number>();
    for (const size of [1, 2, 4]) {
      const data = Array.from({ length: size }, (_, i) => ({ id: `n${i}`, value: (i + 1) * 10 }));
      const cfg = { ...linkedListConfig, defaultData: data } as LevelImplementationConfig;
      litLines(
        cfg,
        code,
        scenarios.filter(([, p]) => p.size === size).map(([a, p]) => [a, { ...p, size: undefined }] as Scenario),
        flags,
      ).forEach((n) => lit.add(n));
    }
    const unlit = code
      .pseudo!.content.split("\n")
      .map((l, i) => [i + 1, l.trim()] as const)
      .filter(([n, l]) => l.startsWith("If ") && !lit.has(n));

    expect(unlit).toEqual([]);
  });

  it.each([
    { isDoubly: false, hasTailMode: false },
    { isDoubly: false, hasTailMode: true },
    { isDoubly: true, hasTailMode: false },
    { isDoubly: true, hasTailMode: true },
  ])("linked list insert tail on a non-empty list shows the head check for %j", (flags) => {
    const code = linkedListConfig.getCodeConfig!(flags as never);
    const lit = litLines(linkedListConfig, code, [["add", { mode: "Tail", value: 9 }]], flags);
    const headCheck = code.pseudo!.content
      .split("\n")
      .map((l, i) => [i + 1, l.trim()] as const)
      .filter(([, l]) => l === "If head = null Then")
      .map(([n]) => n);

    expect(headCheck.some((n) => lit.has(n))).toBe(true);
  });

  it.each([
    { isDoubly: false, hasTailMode: false },
    { isDoubly: false, hasTailMode: true },
    { isDoubly: true, hasTailMode: false },
    { isDoubly: true, hasTailMode: true },
  ])("linked list delete head shows the head check for %j", (flags) => {
    const code = linkedListConfig.getCodeConfig!(flags as never);
    const lit = litLines(linkedListConfig, code, [["delete", { mode: "Head" }]], flags);
    const headCheck = code.pseudo!.content
      .split("\n")
      .map((l, i) => [i + 1, l.trim()] as const)
      .filter(([, l]) => l === "If head = null Then Return")
      .map(([n]) => n);

    expect(headCheck.some((n) => lit.has(n))).toBe(true);
  });
});

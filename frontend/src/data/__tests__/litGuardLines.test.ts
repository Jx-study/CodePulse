import { describe, expect, it } from "vitest";
import { linkedListConfig } from "@/data/DataStructure/linear/LinkedList/LinkedList";
import { HeapConfig } from "@/data/DataStructure/nonlinear/Heap/Heap";
import { BinaryTreeConfig } from "@/data/DataStructure/nonlinear/BinaryTree/BinaryTree";
import { TrieConfig } from "@/data/DataStructure/nonlinear/Trie/Trie";
import { GraphConfig } from "@/data/DataStructure/nonlinear/Graph/Graph";
import type { CodeConfig, AnimationStep } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import { mountStructure } from "./harness";

type Harness = ReturnType<typeof mountStructure>;
type Flags = { isDoubly?: boolean; hasTailMode?: boolean };

const litLines = (
  config: LevelImplementationConfig,
  code: CodeConfig,
  run: (h: Harness) => AnimationStep[],
  flags: Flags = {},
  defaultData?: unknown,
) => {
  const mappings = code.pseudo!.mappings!;
  const lit = new Set<number>();
  run(mountStructure(config, flags, defaultData)).forEach((s) =>
    (mappings[s.actionTag ?? ""] ?? []).forEach((n) => lit.add(n)),
  );
  return lit;
};

const linesOf = (code: CodeConfig) =>
  code.pseudo!.content.split("\n").map((l, i) => [i + 1, l.trim()] as const);

const lineNumbers = (code: CodeConfig, text: string) =>
  linesOf(code).filter(([, l]) => l === text).map(([n]) => n);

const maxHeap = { isMinHeap: false, isMaxHeap: true };
const linkedListVariants: Flags[] = [
  { isDoubly: false, hasTailMode: false },
  { isDoubly: false, hasTailMode: true },
  { isDoubly: true, hasTailMode: false },
  { isDoubly: true, hasTailMode: true },
];

describe("guard lines light up in a normal run", () => {
  it("heap extract and peek show the empty check", () => {
    const code = HeapConfig.codeConfig!;
    const lit = litLines(HeapConfig, code, (h) => [
      ...h.custom("delete", maxHeap),
      ...h.custom("peek", maxHeap),
    ]);

    lineNumbers(code, "If array.length = 0 Then Return Error").forEach((n) =>
      expect(lit.has(n)).toBe(true),
    );
    lineNumbers(code, "If array.length = 1 Then").forEach((n) =>
      expect(lit.has(n)).toBe(true),
    );
  });

  it("graph degree shows the missing-vertex check", () => {
    const code = GraphConfig.codeConfig!;
    const lit = litLines(GraphConfig, code, (h) => [
      ...h.graph("getDegree", { isDirected: false, id: "0" }),
      ...h.graph("getDegree", { isDirected: true, id: "0" }),
    ]);
    const degreeChecks = lineNumbers(code, "If id is not in adjList Then");
    const degreeCheck = degreeChecks[degreeChecks.length - 1];

    expect(lit.has(degreeCheck)).toBe(true);
  });

  it("trie delete shows the end-of-word check", () => {
    const code = TrieConfig.codeConfig!;
    const word = (TrieConfig.defaultData as string[])[0];
    const lit = litLines(TrieConfig, code, (h) => h.custom("delete", { word }));

    lineNumbers(code, "If Not curr.isEndOfWord Then").forEach((n) =>
      expect(lit.has(n)).toBe(true),
    );
  });

  it("binary tree bfs shows both child checks", () => {
    const code = BinaryTreeConfig.codeConfig!;
    const lit = litLines(BinaryTreeConfig, code, (h) => h.search(0, "bfs"));

    [
      "If curr.left ≠ Null Then Enqueue(Queue, curr.left)",
      "If curr.right ≠ Null Then Enqueue(Queue, curr.right)",
    ].forEach((text) =>
      lineNumbers(code, text).forEach((n) => expect(lit.has(n)).toBe(true)),
    );
  });

  describe.each(linkedListVariants)("linked list %j", (flags) => {
    const code = linkedListConfig.getCodeConfig!(flags as never);
    const headChecks = (text: string) => lineNumbers(code, text);

    it("delete head shows the head check", () => {
      const lit = litLines(linkedListConfig, code, (h) => h.remove("Head"), flags);

      expect(headChecks("If head = null Then Return").some((n) => lit.has(n))).toBe(true);
    });

    it("insert tail on a non-empty list shows the head check", () => {
      const lit = litLines(linkedListConfig, code, (h) => h.add(9, "Tail"), flags);

      expect(headChecks("If head = null Then").some((n) => lit.has(n))).toBe(true);
    });

    it("leaves no If line unlit across normal operations", () => {
      const lit = new Set<number>();
      for (const size of [1, 2, 4]) {
        const data = Array.from({ length: size }, (_, i) => ({
          id: `n${i}`,
          value: (i + 1) * 10,
        }));
        const scenarios: ((h: Harness) => AnimationStep[])[] = [];
        for (const mode of ["Head", "Tail", "Node N"]) {
          for (const index of [0, 1, size - 1, size]) {
            scenarios.push(
              (h) => h.add(9, mode, index),
              (h) => h.remove(mode, index),
            );
          }
        }
        scenarios.push((h) => h.search(10, "search"), (h) => h.search(99, "search"));
        scenarios.forEach((scenario) =>
          litLines(linkedListConfig, code, scenario, flags, data).forEach((n) => lit.add(n)),
        );
      }
      const unlit = linesOf(code).filter(([n, l]) => l.startsWith("If ") && !lit.has(n));

      expect(unlit).toEqual([]);
    });
  });
});

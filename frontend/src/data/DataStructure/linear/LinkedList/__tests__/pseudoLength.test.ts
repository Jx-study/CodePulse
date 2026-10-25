import { describe, expect, it } from "vitest";
import { codeConfig as singly } from "../linkedlist/singly/codeConfig";
import { codeConfig as singlyWithTail } from "../linkedlist/singlyWithTail/codeConfig";
import { codeConfig as doubly } from "../linkedlist/doubly/codeConfig";
import { codeConfig as doublyWithTail } from "../linkedlist/doublyWithTail/codeConfig";
import { linkedListConfig } from "../LinkedList";
import { mountStructure } from "@/data/__tests__/harness";

const variants = { singly, singlyWithTail, doubly, doublyWithTail };

describe.each(Object.entries(variants))("%s pseudo code", (_name, config) => {
  const lines = config.pseudo!.content.split("\n");
  const mappings = config.pseudo!.mappings as Record<string, number[]>;
  const mappedLines = new Set(Object.values(mappings).flat());

  it("only maps lines that exist", () => {
    for (const line of mappedLines) {
      expect(line).toBeGreaterThanOrEqual(1);
      expect(line).toBeLessThanOrEqual(lines.length);
    }
  });

  it("never maps a blank line", () => {
    for (const line of mappedLines) expect(lines[line - 1].trim(), `line ${line}`).not.toBe("");
  });

  it("updates length in every insert and delete procedure and lights those lines", () => {
    let procedure = "";
    const seen: Record<string, number> = {};
    lines.forEach((text, i) => {
      const header = text.match(/^Procedure (\w+)/);
      if (header) procedure = header[1];
      const update = text.match(/^\s*length ← length ([+-]) 1$/);
      if (!update) return;
      seen[procedure] = (seen[procedure] ?? 0) + 1;
      expect(update[1], procedure).toBe(procedure.startsWith("insert") ? "+" : "-");
      expect(mappedLines.has(i + 1), `${procedure} line ${i + 1}`).toBe(true);
    });
    for (const name of ["insertAtHead", "insertAtTail", "insertAtIndex", "deleteAtHead", "deleteAtTail", "deleteAtIndex"]) {
      expect(seen[name], name).toBeGreaterThan(0);
    }
    expect(seen.search).toBeUndefined();
  });
});


const runtimeVariants = [
  { name: "singly", flags: { isDoubly: false, hasTailMode: false }, config: singly },
  { name: "singlyWithTail", flags: { isDoubly: false, hasTailMode: true }, config: singlyWithTail },
  { name: "doubly", flags: { isDoubly: true, hasTailMode: false }, config: doubly },
  { name: "doublyWithTail", flags: { isDoubly: true, hasTailMode: true }, config: doublyWithTail },
];

describe.each(runtimeVariants)("$name animation lights the length update", ({ flags, config }) => {
  const lines = config.pseudo!.content.split("\n");
  const mappings = config.pseudo!.mappings as Record<string, number[]>;
  const litLines = (steps: { actionTag?: string }[]) =>
    steps.flatMap((s) => (s.actionTag ? (mappings[s.actionTag] ?? []) : [])).map((n) => lines[n - 1].trim());

  const operations: [string, (list: ReturnType<typeof mountStructure>) => { actionTag?: string }[], string][] = [
    ["insert at head", (l) => l.add(9, "Head"), "length ← length + 1"],
    ["insert at tail", (l) => l.add(9, "Tail"), "length ← length + 1"],
    ["insert at index", (l) => l.add(9, "Node N", 1), "length ← length + 1"],
    ["delete at head", (l) => l.remove("Head"), "length ← length - 1"],
    ["delete at tail", (l) => l.remove("Tail"), "length ← length - 1"],
    ["delete at index", (l) => l.remove("Node N", 1), "length ← length - 1"],
  ];

  it.each(operations)("%s", (_label, run, expected) => {
    const list = mountStructure(linkedListConfig, flags);
    expect(litLines(run(list))).toContain(expected);
  });
});

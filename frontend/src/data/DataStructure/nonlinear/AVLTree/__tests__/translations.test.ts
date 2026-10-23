import { describe, expect, it } from "vitest";
import zhTW from "../../../../../../public/locales/zh-TW/tutorials/avl-tree.json";
import en from "../../../../../../public/locales/en/tutorials/avl-tree.json";
import { AVL_OPS } from "../ops";
import { buildAVL, toState } from "../avl";
import { simulateAVLTrace, type AVLInputItem } from "../simulateTrace";
import { avlTraceToSteps } from "../traceToSteps";
import { buildBST } from "../../BinarySearchTree/simulateTrace";

const locales = { "zh-TW": zhTW, en } as const;

const flatten = (value: unknown, prefix = ""): string[] => {
  if (Array.isArray(value)) return [prefix];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) =>
      flatten(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
};

const lookup = (locale: unknown, path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>((node, key) => (node as Record<string, unknown>)?.[key], locale);

const balanced = (values: number[]): AVLInputItem[] =>
  toState(buildAVL(values.map((value, i) => ({ id: `n${i}`, value }))));

const plain = (values: number[]): AVLInputItem[] =>
  toState(buildBST(values.map((value, i) => ({ id: `n${i}`, value }))));

describe("AVL translations", () => {
  it("zh-TW and en define exactly the same keys", () => {
    expect(flatten(zhTW).sort()).toEqual(flatten(en).sort());
  });

  it.each(Object.entries(locales))("%s has text for every button, tooltip and warning", (_, locale) => {
    const keys = [
      "ui.operations",
      "ui.valuePlaceholder",
      "ui.rotatePlaceholder",
      "ui.group.balance",
      "ui.insertWarning",
      "ui.deleteWarning",
      "ui.searchWarning",
      "ui.rotateWarning",
      ...AVL_OPS.flatMap((op) => [`ui.${op.id}`, `ui.${op.id}Tooltip`]),
    ];

    keys.forEach((key) => expect(lookup(locale, key), key).toBeTruthy());
  });

  it("every step of every operation has a description in both languages", () => {
    const tall = balanced([40, 20, 60, 10, 30, 50, 70]);
    const chain = plain([1, 2, 3, 4, 5, 6, 7]);
    const lopsided = plain([20, 10, 30, 5, 3, 25, 35]);
    const runs = [
      ...[tall, [], balanced([20, 10, 30, 10])].flatMap((state) =>
        [5, 10, 40, 99, 30].flatMap((value) => [
          simulateAVLTrace(state, { mode: "Insert", value, targetId: "new" }),
          simulateAVLTrace(state, { mode: "Delete", value }),
          simulateAVLTrace(state, { mode: "Search", value }),
          simulateAVLTrace(state, { mode: "RotateLeft", value }),
          simulateAVLTrace(state, { mode: "RotateRight", value }),
        ]),
      ),
      ...[tall, chain, lopsided, []].flatMap((state) => [
        simulateAVLTrace(state, { mode: "CheckBalance" }),
        simulateAVLTrace(state, { mode: "Rebalance" }),
        simulateAVLTrace(state, { mode: "NeedBalance" }),
      ]),
      simulateAVLTrace(chain, { mode: "Insert", value: 8, targetId: "new" }),
      simulateAVLTrace(balanced([30, 10]), { mode: "Insert", value: 20, targetId: "new" }),
      simulateAVLTrace(balanced([10, 30]), { mode: "Insert", value: 20, targetId: "new" }),
      simulateAVLTrace(balanced([40, 20, 60, 10, 30, 50, 70, 45]), { mode: "Delete", value: 40 }),
      simulateAVLTrace(balanced([4, 11, 18, 25, 1, 8, 15, 22, 29, 5, 12, 19]), { mode: "Delete", value: 1 }),
      simulateAVLTrace(tall, {}),
    ];

    const keys = new Set<string>();
    runs.forEach((trace) =>
      avlTraceToSteps(trace).forEach((step) => {
        const description = step.description;
        keys.add(typeof description === "string" ? description : description.key);
      }),
    );

    expect(keys.size).toBeGreaterThan(40);
    Object.entries(locales).forEach(([name, locale]) =>
      keys.forEach((key) =>
        expect(lookup(locale, key), `${name}: ${key}`).toBeTruthy(),
      ),
    );
  });
});

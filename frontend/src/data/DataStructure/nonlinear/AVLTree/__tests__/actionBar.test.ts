import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "@/shared/components/Toast";
import { AVLTreeActionBar } from "../AVLTreeActionBar";
import type { DSActionBarProps } from "@/types/implementation";

const roots: ReturnType<typeof createRoot>[] = [];

afterEach(() => {
  roots.splice(0).forEach((r) => act(() => r.unmount()));
  vi.restoreAllMocks();
});

function mountBar(disabled = false) {
  const handlers = {
    onAddNode: vi.fn(),
    onDeleteNode: vi.fn(),
    onSearchNode: vi.fn(),
    onCustomAction: vi.fn(),
  };
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push(root);
  const props = {
    onLoadData: vi.fn(),
    onResetData: vi.fn(),
    onRandomData: vi.fn(),
    onMaxNodesChange: vi.fn(),
    ...handlers,
    disabled,
    maxNodes: 20,
  } as unknown as DSActionBarProps;
  act(() => root.render(createElement(AVLTreeActionBar, props)));

  const button = (label: string) =>
    [...container.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === label,
    ) as HTMLButtonElement | undefined;
  const type = (value: string, label = "Node value") => {
    const input = container.querySelector(
      `input[aria-label="${label}"]`,
    ) as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    act(() => {
      setter.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };
  const click = (label: string) =>
    act(() => {
      button(label)!.click();
    });
  return { ...handlers, button, type, click };
}

const OPERATIONS = [
  "ui.insert",
  "ui.delete",
  "ui.search",
  "ui.rotateLeft",
  "ui.rotateRight",
  "ui.checkBalance",
  "ui.rebalance",
];

describe("AVL action bar", () => {
  it("has every operation of the level, enabled", () => {
    const bar = mountBar();

    OPERATIONS.forEach((label) => expect(bar.button(label)!.disabled).toBe(false));
  });

  it("does not offer what the BST and binary tree levels already teach, or the auto-balance switch", () => {
    const bar = mountBar();

    [
      "ui.min",
      "ui.max",
      "ui.floor",
      "ui.ceil",
      "ui.preorder",
      "ui.inorder",
      "ui.postorder",
      "ui.levelorder",
      "ui.autoBalance",
    ].forEach((label) => expect(bar.button(label)).toBeUndefined());
  });

  it("disables every operation while an animation is playing", () => {
    const bar = mountBar(true);

    OPERATIONS.forEach((label) => expect(bar.button(label)!.disabled).toBe(true));
  });

  it("insert and delete send the typed value", () => {
    const bar = mountBar();

    bar.type("45");
    bar.click("ui.insert");
    bar.click("ui.delete");

    expect(bar.onAddNode).toHaveBeenCalledWith(45, "Insert");
    expect(bar.onDeleteNode).toHaveBeenCalledWith("Delete", 45);
  });

  it.each([
    ["ui.insert", "ui.insertWarning"],
    ["ui.delete", "ui.deleteWarning"],
    ["ui.search", "ui.searchWarning"],
    ["ui.rotateLeft", "ui.rotateWarning"],
    ["ui.rotateRight", "ui.rotateWarning"],
  ])("%s without a value only warns", (label, warning) => {
    const warn = vi.spyOn(toast, "warning").mockImplementation(() => undefined);
    const bar = mountBar();

    bar.click(label);

    expect(warn).toHaveBeenCalledWith(warning);
    expect(bar.onAddNode).not.toHaveBeenCalled();
    expect(bar.onDeleteNode).not.toHaveBeenCalled();
    expect(bar.onSearchNode).not.toHaveBeenCalled();
    expect(bar.onCustomAction).not.toHaveBeenCalled();
  });

  it("search sends the typed value", () => {
    const bar = mountBar();

    bar.type("45");
    bar.click("ui.search");

    expect(bar.onSearchNode).toHaveBeenCalledWith(45, "Search");
  });

  it("check balance and rebalance need no value", () => {
    const bar = mountBar();

    bar.click("ui.checkBalance");
    bar.click("ui.rebalance");

    expect(bar.onCustomAction).toHaveBeenNthCalledWith(1, "checkBalance", {});
    expect(bar.onCustomAction).toHaveBeenNthCalledWith(2, "rebalance", {});
  });

  it.each([
    ["ui.rotateLeft", "rotateLeft"],
    ["ui.rotateRight", "rotateRight"],
  ])("%s sends the value typed in the rotation input", (label, action) => {
    const bar = mountBar();

    bar.type("20", "Rotate value");
    bar.click(label);

    expect(bar.onCustomAction).toHaveBeenCalledWith(action, { value: 20 });
  });

  it("the rotation input is separate from the insert value", () => {
    const warn = vi.spyOn(toast, "warning").mockImplementation(() => undefined);
    const bar = mountBar();

    bar.type("20");
    bar.click("ui.rotateRight");

    expect(bar.onCustomAction).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith("ui.rotateWarning");
  });
});

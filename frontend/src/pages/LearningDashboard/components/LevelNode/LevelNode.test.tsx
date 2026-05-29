import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import LevelNode from "./LevelNode";
import type { Level, NodePosition } from "@/types";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      if (key === "levels.trie.name") return "Trie";
      if (key === "node.ariaLabel") return `Level: ${options?.levelName}`;
      if (key === "levelUnavailable.undeveloped") {
        return "This level is not available yet. Stay tuned.";
      }
      return key;
    },
  }),
}));

vi.mock("@/shared/components/Icon", () => ({
  default: ({ name, className }: { name: string; className?: string }) => (
    <span className={className} data-icon={name} />
  ),
}));

const undevelopedLevel: Level = {
  id: "trie",
  category: "data-structures",
  difficulty: 2,
  isDeveloped: false,
  isUnlocked: true,
};

const position: NodePosition = {
  x: "50%",
  y: 100,
  alignment: "center",
};

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  root = null;
  container?.remove();
  container = null;
  document.body.innerHTML = "";
  vi.useRealTimers();
});

function renderLevelNode(onClick = vi.fn()) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root?.render(
      <LevelNode
        level={undevelopedLevel}
        status="unlocked"
        stars={0}
        isLocked={false}
        position={position}
        onClick={onClick}
      />,
    );
  });

  const node = container.querySelector("[data-level-id='trie']") as HTMLElement;
  return { node, onClick };
}

describe("LevelNode unavailable state", () => {
  it("keeps undeveloped levels focusable and announces the unavailable reason", () => {
    const { node } = renderLevelNode();

    expect(node.tabIndex).toBe(0);
    expect(node.getAttribute("aria-disabled")).toBe("true");
    expect(node.getAttribute("aria-label")).toBe(
      "Level: Trie. This level is not available yet. Stay tuned.",
    );
  });

  it("delegates undeveloped level clicks to the dashboard handler", () => {
    const onClick = vi.fn();
    const { node } = renderLevelNode(onClick);

    act(() => {
      node.click();
    });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows the unavailable tooltip when an undeveloped level receives focus", () => {
    vi.useFakeTimers();
    const { node } = renderLevelNode();

    act(() => {
      node.focus();
      vi.advanceTimersByTime(200);
    });

    expect(document.body.textContent).toContain(
      "This level is not available yet. Stay tuned.",
    );
  });
});

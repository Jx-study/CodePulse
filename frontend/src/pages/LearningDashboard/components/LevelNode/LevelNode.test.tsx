import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import LevelNode from "./LevelNode";
import type { Level, LevelProgress, NodePosition } from "@/types";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      if (key === "levels.trie.name") return "Trie";
      if (key === "node.ariaLabel") return `Level: ${options?.levelName}`;
      if (key === "node.recommended") return "Recommended next";
      if (key === "levelUnavailable.undeveloped") {
        return "This level is not available yet. Stay tuned.";
      }
      if (key === "levelUnavailable.locked") {
        return "Complete prerequisite levels to unlock practice mode";
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

const baseLevel: Level = {
  id: "trie",
  category: "data-structures",
  difficulty: 2,
  isDeveloped: true,
  isUnlocked: true,
};

const position: NodePosition = { x: "50%", y: 100, alignment: "center" };

function prog(overrides: Partial<LevelProgress> = {}): LevelProgress {
  return { levelId: "trie", status: "unlocked", stars: 0, attempts: 0, bestTime: 0, ...overrides };
}

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

interface RenderOptions {
  level?: Level;
  progress?: LevelProgress;
  isPracticeLocked?: boolean;
  isRecommended?: boolean;
  isBossLevel?: boolean;
  onClick?: () => void;
}

function renderLevelNode(options: RenderOptions = {}) {
  const onClick = options.onClick ?? vi.fn();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root?.render(
      <LevelNode
        level={options.level ?? baseLevel}
        progress={options.progress}
        isPracticeLocked={options.isPracticeLocked ?? false}
        isRecommended={options.isRecommended}
        isBossLevel={options.isBossLevel}
        position={position}
        onClick={onClick}
      />,
    );
  });

  const node = container.querySelector("[data-level-id='trie']") as HTMLElement;
  const arc = (name: "teach" | "practice") =>
    node.querySelector(`[data-arc='${name}']`)?.getAttribute("data-arc-state");
  return { node, onClick, arc };
}

describe("LevelNode undeveloped state", () => {
  const undeveloped = { ...baseLevel, isDeveloped: false };

  it("keeps undeveloped levels focusable and announces the unavailable reason", () => {
    const { node } = renderLevelNode({ level: undeveloped });
    expect(node.tabIndex).toBe(0);
    expect(node.getAttribute("aria-disabled")).toBe("true");
    expect(node.getAttribute("aria-label")).toBe(
      "Level: Trie. This level is not available yet. Stay tuned.",
    );
  });

  it("delegates undeveloped level clicks to the dashboard handler", () => {
    const onClick = vi.fn();
    const { node } = renderLevelNode({ level: undeveloped, onClick });
    act(() => {
      node.click();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows the unavailable tooltip when an undeveloped level receives focus", () => {
    vi.useFakeTimers();
    const { node } = renderLevelNode({ level: undeveloped });
    act(() => {
      node.focus();
      vi.advanceTimersByTime(200);
    });
    expect(document.body.textContent).toContain(
      "This level is not available yet. Stay tuned.",
    );
  });

  it("draws no progress ring and shows the hourglass icon", () => {
    const { node } = renderLevelNode({ level: undeveloped });
    expect(node.querySelector("[data-arc]")).toBeNull();
    expect(node.querySelector("[data-icon='hourglass-half']")).not.toBeNull();
  });

  it("is never marked as recommended", () => {
    const { node } = renderLevelNode({ level: undeveloped, isRecommended: true });
    expect(node.getAttribute("data-recommended")).toBe("false");
    expect(node.getAttribute("aria-label")).not.toContain("Recommended next");
  });
});

describe("LevelNode progress ring", () => {
  it("shows open teach and practice arcs for a fresh level", () => {
    const { node, arc } = renderLevelNode();
    expect(arc("teach")).toBe("open");
    expect(arc("practice")).toBe("open");
    expect(node.getAttribute("data-phase")).toBe("not-started");
    expect(node.querySelector("[data-icon='circle']")).not.toBeNull();
    expect(node.querySelector("[data-icon='lock']")).toBeNull();
  });

  it("fills the teach arc and shows the half icon after the tutorial", () => {
    const { node, arc } = renderLevelNode({ progress: prog({ teachingCompleted: true }) });
    expect(arc("teach")).toBe("done");
    expect(arc("practice")).toBe("open");
    expect(node.getAttribute("data-phase")).toBe("in-progress");
    expect(node.querySelector("[data-icon='circle-half-stroke']")).not.toBeNull();
  });

  it("fills both arcs, shows the check and the earned stars when practice passed", () => {
    const { node, arc } = renderLevelNode({
      progress: prog({ status: "completed", stars: 2, teachingCompleted: true }),
    });
    expect(arc("teach")).toBe("done");
    expect(arc("practice")).toBe("done");
    expect(node.querySelector("[data-icon='check']")).not.toBeNull();
    expect(node.querySelectorAll("[data-filled='true']")).toHaveLength(2);
    expect(node.querySelectorAll("[data-filled='false']")).toHaveLength(1);
  });

  it("renders no stars before practice passes", () => {
    const { node } = renderLevelNode({ progress: prog({ teachingCompleted: true }) });
    expect(node.querySelector("[data-filled]")).toBeNull();
  });
});

describe("LevelNode practice locked", () => {
  it("keeps the node clickable and explains that only practice is locked", () => {
    const { node } = renderLevelNode({ isPracticeLocked: true });
    expect(node.getAttribute("aria-disabled")).toBe("false");
    expect(node.getAttribute("aria-label")).toBe(
      "Level: Trie. Complete prerequisite levels to unlock practice mode",
    );
  });

  it("locks only the practice arc and puts the lock on the ring", () => {
    const { node, arc } = renderLevelNode({ isPracticeLocked: true });
    expect(arc("teach")).toBe("open");
    expect(arc("practice")).toBe("locked");
    expect(node.querySelector("[data-icon='lock']")).not.toBeNull();
    expect(node.querySelector("[data-icon='book-open']")).toBeNull();
  });

  it("shows the practice-locked tooltip on focus", () => {
    vi.useFakeTimers();
    const { node } = renderLevelNode({ isPracticeLocked: true });
    act(() => {
      node.focus();
      vi.advanceTimersByTime(200);
    });
    expect(document.body.textContent).toContain(
      "Complete prerequisite levels to unlock practice mode",
    );
  });

  it("delegates clicks to the dashboard handler", () => {
    const onClick = vi.fn();
    const { node } = renderLevelNode({ isPracticeLocked: true, onClick });
    act(() => {
      node.click();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("LevelNode recommendation and boss", () => {
  it("marks the recommended node and announces it", () => {
    const { node } = renderLevelNode({ isRecommended: true });
    expect(node.getAttribute("data-recommended")).toBe("true");
    expect(node.getAttribute("aria-label")).toBe("Level: Trie. Recommended next");
  });

  it("renders the boss crown, plate and BOSS chip with the same ring", () => {
    const { node, arc } = renderLevelNode({ isBossLevel: true, isPracticeLocked: true });
    expect(node.querySelector("[data-icon='crown']")).not.toBeNull();
    expect(node.querySelector("[data-boss-plate]")).not.toBeNull();
    expect(node.textContent).toContain("BOSS");
    expect(arc("practice")).toBe("locked");
  });
});

import { useLayoutEffect } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import GraphContainer from "./GraphContainer";
import type { UserProgress } from "@/types";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const dragEnabledHistory = vi.hoisted(() => [] as boolean[]);

vi.mock("@/pages/LearningDashboard/context/ZoomDisableContext", () => ({
  useZoomDisable: () => ({ isZoomDisabled: false }),
}));

vi.mock("@/shared/hooks/useZoom", () => ({
  useZoom: () => ({
    zoomLevel: 1,
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetZoom: vi.fn(),
  }),
}));

vi.mock("@/shared/hooks/useDrag", () => ({
  useDrag: (options: { enabled?: boolean }) => {
    dragEnabledHistory.push(Boolean(options.enabled));
    return {
      offset: { x: 0, y: 0 },
      isDragging: false,
      setOffset: vi.fn(),
      handleMouseDown: vi.fn(),
      handleMouseMove: vi.fn(),
      handleMouseUp: vi.fn(),
      handleTouchStart: vi.fn(),
      handleTouchMove: vi.fn(),
      handleTouchEnd: vi.fn(),
      containerRef: { current: null },
    };
  },
}));

vi.mock("@/shared/components/ZoomControls", () => ({
  default: () => <div data-testid="zoom-controls" />,
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const userProgress: UserProgress = {
  userId: "test-user",
  levels: {},
  totalStarsEarned: 0,
  totalLevelsCompleted: 0,
  lastAccessedDate: "2026-05-23",
  categoryUnlocks: {},
  activeCategory: "data-structures",
};

function RemoveDialogFlagBeforePassiveEffects() {
  useLayoutEffect(() => {
    document.body.removeAttribute("data-dialog-open");
  }, []);

  return null;
}

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  root = null;
  container?.remove();
  container = null;
  document.body.innerHTML = "";
  document.body.removeAttribute("data-dialog-open");
  dragEnabledHistory.length = 0;
});

describe("GraphContainer overlay state", () => {
  it("resyncs a stale dialog flag after route-transition cleanup", () => {
    document.body.setAttribute("data-dialog-open", "true");
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root?.render(
        <>
          <RemoveDialogFlagBeforePassiveEffects />
          <GraphContainer levels={[]} userProgress={userProgress}>
            {() => null}
          </GraphContainer>
        </>,
      );
    });

    expect(dragEnabledHistory[dragEnabledHistory.length - 1]).toBe(true);
  });
});

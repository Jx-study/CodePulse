import { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TourEngine from "./TourEngine";
import type { TourStep } from "./tourTypes";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, number>) => {
      if (key === "tour.stepOf") return `Step ${values?.current} of ${values?.total}`;
      if (key === "tour.skipThisStep") return "Skip this step";
      if (key === "tour.waitingForAction") return "Waiting for action";
      if (key === "tour.previous") return "Previous";
      if (key === "tour.next") return "Next";
      return key;
    },
  }),
}));

vi.mock("@/shared/components/Codi", () => ({
  default: () => <div data-testid="codi" />,
}));

describe("TourEngine", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  let animationFrameCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    animationFrameCallbacks = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      animationFrameCallbacks.push(callback);
      return animationFrameCallbacks.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  function setElementRect(selector: string, rect: Partial<DOMRect>) {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Missing test element: ${selector}`);
    element.getBoundingClientRect = vi.fn(() => ({
      top: rect.top ?? 10,
      left: rect.left ?? 10,
      width: rect.width ?? 100,
      height: rect.height ?? 40,
      right: (rect.left ?? 10) + (rect.width ?? 100),
      bottom: (rect.top ?? 10) + (rect.height ?? 40),
      x: rect.left ?? 10,
      y: rect.top ?? 10,
      toJSON: () => ({}),
    } as DOMRect));
  }

  function runAnimationFrame() {
    const callback = animationFrameCallbacks.shift();
    if (!callback) throw new Error("No animation frame callback queued");
    act(() => callback(performance.now()));
  }

  function setup(
    steps: TourStep[],
    props: Partial<React.ComponentProps<typeof TourEngine>> = {},
  ) {
    document.body.innerHTML = `
      <div data-tour="first">first</div>
      <div data-tour="interactive">interactive</div>
      <div data-tour="target">target</div>
    `;
    setElementRect('[data-tour="first"]', { top: 10, left: 10 });
    setElementRect('[data-tour="interactive"]', { top: 70, left: 10 });
    setElementRect('[data-tour="target"]', { top: 130, left: 10 });

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(
        <TourEngine
          isOpen
          steps={steps}
          onComplete={vi.fn()}
          onSkip={vi.fn()}
          {...props}
        />,
      );
    });
  }

  it("jumps to the dependency-aware skip target when an interactive step is skipped", () => {
    setup([
      {
        id: "interactive",
        title: "Run code",
        description: "Run first",
        targetSelector: '[data-tour="interactive"]',
        placement: "bottom",
        interactive: true,
        advanceWhen: () => false,
        skipTargetStepId: "target-step",
      },
      {
        id: "data-dependent",
        title: "Canvas",
        description: "Needs run output",
        targetSelector: '[data-tour="first"]',
        placement: "bottom",
      },
      {
        id: "target-step",
        title: "Panels",
        description: "Still useful without run output",
        targetSelector: '[data-tour="target"]',
        placement: "bottom",
      },
    ]);

    const skipButton = Array.from(document.body.querySelectorAll("button")).find(
      button => button.textContent === "Skip this step",
    );
    expect(skipButton).toBeDefined();

    act(() => {
      skipButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(document.body.textContent).toContain("Panels");
    expect(document.body.textContent).not.toContain("Canvas");
  });

  it("allows the tour to continue after skipping to a dependency-aware target", () => {
    setup([
      {
        id: "interactive",
        title: "Run code",
        description: "Run first",
        targetSelector: '[data-tour="interactive"]',
        placement: "bottom",
        interactive: true,
        advanceWhen: () => false,
        skipTargetStepId: "target-step",
      },
      {
        id: "data-dependent",
        title: "Canvas",
        description: "Needs run output",
        targetSelector: '[data-tour="first"]',
        placement: "bottom",
      },
      {
        id: "target-step",
        title: "Panels",
        description: "Still useful without run output",
        targetSelector: '[data-tour="target"]',
        placement: "bottom",
      },
      {
        id: "history",
        title: "History",
        description: "Available without run output",
        targetSelector: '[data-tour="first"]',
        placement: "bottom",
      },
    ]);

    const skipButton = Array.from(document.body.querySelectorAll("button")).find(
      button => button.textContent === "Skip this step",
    );

    act(() => {
      skipButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const nextButton = Array.from(document.body.querySelectorAll("button")).find(
      button => button.textContent === "Next",
    ) as HTMLButtonElement | undefined;
    expect(nextButton?.disabled).toBe(false);

    act(() => {
      nextButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(document.body.textContent).toContain("History");
  });

  it("advances to the final card with keyboard navigation from the last regular step", () => {
    setup(
      [
        {
          id: "first-step",
          title: "First",
          description: "First step",
          targetSelector: '[data-tour="first"]',
          placement: "bottom",
        },
        {
          id: "last-step",
          title: "Last",
          description: "Last step",
          targetSelector: '[data-tour="target"]',
          placement: "bottom",
        },
      ],
      { finalTitle: "Tour complete" },
    );

    const nextButton = Array.from(document.body.querySelectorAll("button")).find(
      button => button.textContent === "Next",
    );

    act(() => {
      nextButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(document.body.textContent).toContain("Last");

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });

    expect(document.body.textContent).toContain("Tour complete");
  });

  it("keeps the spotlight positioned when revisiting a completed interactive step", () => {
    setup([
      {
        id: "interactive",
        title: "Run code",
        description: "Run first",
        targetSelector: '[data-tour="interactive"]',
        placement: "bottom",
        interactive: true,
        advanceWhen: () => true,
        skipTargetStepId: "target-step",
      },
      {
        id: "target-step",
        title: "Panels",
        description: "Target",
        targetSelector: '[data-tour="target"]',
        placement: "bottom",
      },
    ]);

    const skipButton = Array.from(document.body.querySelectorAll("button")).find(
      button => button.textContent === "Skip this step",
    );
    act(() => {
      skipButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const previousButton = Array.from(document.body.querySelectorAll("button")).find(
      button => button.textContent === "Previous",
    );
    act(() => {
      previousButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    runAnimationFrame();

    expect(document.querySelector("[class*='spotlightBorder']")).not.toBeNull();
  });

  it("clears stale secondary spotlight state when the tour reopens", () => {
    const steps: TourStep[] = [
      {
        id: "dual-target",
        title: "Dual target",
        description: "Highlights two elements",
        targetSelector: '[data-tour="first"]',
        secondaryTargetSelector: '[data-tour="target"]',
        placement: "bottom",
      },
      {
        id: "single-target",
        title: "Single target",
        description: "Highlights one element",
        targetSelector: '[data-tour="interactive"]',
        placement: "bottom",
      },
    ];
    setup(steps);
    runAnimationFrame();
    expect(document.querySelectorAll("[class*='spotlightBorder']")).toHaveLength(2);

    act(() => {
      root.render(
        <TourEngine
          isOpen={false}
          steps={steps}
          onComplete={vi.fn()}
          onSkip={vi.fn()}
        />,
      );
    });
    act(() => {
      root.render(
        <TourEngine
          isOpen
          steps={steps}
          onComplete={vi.fn()}
          onSkip={vi.fn()}
        />,
      );
    });

    expect(document.querySelectorAll("[class*='spotlightBorder']")).toHaveLength(0);
  });

  it("uses a unique spotlight mask id for each mounted tour instance", () => {
    document.body.innerHTML = `<div data-tour="first">first</div>`;
    setElementRect('[data-tour="first"]', { top: 10, left: 10 });

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    const steps: TourStep[] = [
      {
        id: "first-step",
        title: "First",
        description: "First step",
        targetSelector: '[data-tour="first"]',
        placement: "bottom",
      },
    ];

    act(() => {
      root.render(
        <>
          <TourEngine isOpen steps={steps} onComplete={vi.fn()} onSkip={vi.fn()} />
          <TourEngine isOpen steps={steps} onComplete={vi.fn()} onSkip={vi.fn()} />
        </>,
      );
    });
    runAnimationFrame();
    runAnimationFrame();

    const maskIds = Array.from(document.querySelectorAll("mask")).map(mask => mask.id);
    expect(maskIds).toHaveLength(2);
    expect(new Set(maskIds).size).toBe(2);
    for (const maskId of maskIds) {
      expect(document.querySelector(`rect[mask="url(#${maskId})"]`)).not.toBeNull();
    }
  });

  it("pauses when a dialog lock is set before the observer subscribes", () => {
    document.body.innerHTML = `<div data-tour="first">first</div>`;
    setElementRect('[data-tour="first"]', { top: 10, left: 10 });

    function DialogLockBeforeTourObserver() {
      useEffect(() => {
        document.body.setAttribute("data-dialog-open", "true");
        return () => document.body.removeAttribute("data-dialog-open");
      }, []);
      return null;
    }

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    const steps: TourStep[] = [
      {
        id: "first-step",
        title: "First",
        description: "First step",
        targetSelector: '[data-tour="first"]',
        placement: "bottom",
      },
    ];

    act(() => {
      root.render(
        <>
          <DialogLockBeforeTourObserver />
          <TourEngine isOpen steps={steps} onComplete={vi.fn()} onSkip={vi.fn()} />
        </>,
      );
    });

    expect(document.body.textContent).not.toContain("First step");
  });
});

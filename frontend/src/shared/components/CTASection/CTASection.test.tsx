import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import CTASection from "./CTASection";

describe("CTASection", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  function setup(ui: React.ReactNode) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(ui));
    return container;
  }

  it("renders title, description, and actions", () => {
    const c = setup(
      <CTASection
        title="準備好開始了嗎？"
        description="從基礎開始建立扎實的演算法直覺。"
        actions={<button>開始學習</button>}
      />,
    );
    expect(c.querySelector("h2")?.textContent).toBe("準備好開始了嗎？");
    expect(c.querySelector("[data-testid='desc']")?.textContent).toBe(
      "從基礎開始建立扎實的演算法直覺。",
    );
    expect(c.querySelector("button")?.textContent).toBe("開始學習");
  });

  it("renders icon when provided", () => {
    const c = setup(
      <CTASection
        title="標題"
        actions={<button>action</button>}
        icon={<span data-testid="icon">icon</span>}
      />,
    );
    expect(c.querySelector("[data-testid='icon']")).not.toBeNull();
  });

  it("omits description when not provided", () => {
    const c = setup(<CTASection title="標題" actions={<button>action</button>} />);
    expect(c.querySelector("[data-testid='desc']")).toBeNull();
  });
});

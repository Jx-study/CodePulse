import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import PageHero from "./PageHero";

describe("PageHero", () => {
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

  it("renders title and description", () => {
    const c = setup(
      <PageHero variant="content" title="標題" description="描述文字" />,
    );
    expect(c.querySelector("h1")?.textContent).toBe("標題");
    expect(c.querySelector("p")?.textContent).toBe("描述文字");
  });

  it("renders actions when provided", () => {
    const c = setup(
      <PageHero variant="content" title="標題" actions={<button>開始</button>} />,
    );
    expect(c.querySelector("button")?.textContent).toBe("開始");
  });

  it("applies variant-specific data attribute", () => {
    const c = setup(<PageHero variant="landing" title="A" />);
    expect(c.querySelector("section")?.getAttribute("data-variant")).toBe("landing");

    act(() => root.render(<PageHero variant="content" title="A" />));
    expect(c.querySelector("section")?.getAttribute("data-variant")).toBe("content");

    act(() => root.render(<PageHero variant="feature" title="A" />));
    expect(c.querySelector("section")?.getAttribute("data-variant")).toBe("feature");
  });

  it("renders bgTexture only on feature variant when enabled", () => {
    const c = setup(<PageHero variant="feature" title="A" bgTexture />);
    expect(c.querySelector("[data-testid='bg-texture']")).not.toBeNull();

    act(() => root.render(<PageHero variant="content" title="A" bgTexture />));
    expect(c.querySelector("[data-testid='bg-texture']")).toBeNull();
  });

  it("renders children only on landing variant", () => {
    const c = setup(
      <PageHero variant="landing" title="A">
        <div data-testid="extra">extra</div>
      </PageHero>,
    );
    expect(c.querySelector("[data-testid='extra']")).not.toBeNull();

    act(() =>
      root.render(
        <PageHero variant="content" title="A">
          <div data-testid="extra">extra</div>
        </PageHero>,
      ),
    );
    expect(c.querySelector("[data-testid='extra']")).toBeNull();
  });
});

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import Dialog from "./Dialog";
import Sidebar from "../Sidebar";
import { resetBodyDialogLockForTests } from "@/shared/utils/bodyDialogLock";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

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
  document.body.style.overflow = "";
  document.body.removeAttribute("data-dialog-open");
  resetBodyDialogLockForTests();
});

function renderOverlays(dialogOpen: boolean, sidebarOpen: boolean) {
  if (!container) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  }

  act(() => {
    root?.render(
      <>
        <Dialog isOpen={dialogOpen} onClose={() => undefined} title="Result">
          Result content
        </Dialog>
        <Sidebar isOpen={sidebarOpen} onClose={() => undefined} title="Filters">
          Filter content
        </Sidebar>
      </>,
    );
  });
}

describe("dialog body lock", () => {
  it("keeps the body marked while another overlay is still open", () => {
    renderOverlays(true, true);

    expect(document.body.getAttribute("data-dialog-open")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");

    renderOverlays(false, true);

    expect(document.body.getAttribute("data-dialog-open")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");

    renderOverlays(false, false);

    expect(document.body.hasAttribute("data-dialog-open")).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });
});

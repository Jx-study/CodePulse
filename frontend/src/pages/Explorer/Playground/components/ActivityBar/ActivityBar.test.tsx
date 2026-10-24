import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import type { PanelId } from "../DockablePanel";
import { RightActivityBar } from "./ActivityBar";

describe("RightActivityBar", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  function setup(leftDockedId: PanelId | null) {
    const rightOrder: PanelId[] = ["globalVars", "localVars", "callStack", "console"];
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(
        <DndContext>
          <SortableContext items={rightOrder.filter(id => id !== leftDockedId)} strategy={verticalListSortingStrategy}>
            <RightActivityBar
              rightOrder={rightOrder}
              leftDockedId={leftDockedId}
              collapsedPanels={new Set()}
              isDragActive={false}
              onTogglePanel={() => undefined}
            />
          </SortableContext>
        </DndContext>,
      );
    });
  }

  it("does not move the drag-dock tour target to another right-bar icon after a panel is docked", () => {
    setup("globalVars");

    expect(container.querySelector('[data-tour="pg-drag-icon"]')).toBeNull();
  });
});

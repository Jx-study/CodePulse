import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/services/LevelService", () => ({
  getAllLevels: () => [],
  getLevelById: (id: string) =>
    id === "no-practice" ? { id, hasPractice: false } : { id },
}));

import Practice from "./Practice";

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe("Practice route guard", () => {
  it("redirects a level without practice to the dashboard", async () => {
    const container = document.createElement("div");
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/practice/sorting/no-practice"]}>
          <Routes>
            <Route path="/dashboard" element={<div>dashboard page</div>} />
            <Route path="/practice/:category/:levelId" element={<Practice />} />
          </Routes>
        </MemoryRouter>,
      );
    });
    expect(container.textContent).toContain("dashboard page");
    await act(async () => root.unmount());
  });
});

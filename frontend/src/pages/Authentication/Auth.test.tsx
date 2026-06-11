import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AuthPage from "./Auth";
import authService from "@/services/authService";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock("@/shared/contexts/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn(),
    register: vi.fn(),
    checkAuthStatus: vi.fn(),
    setPendingWelcome: vi.fn(),
  }),
}));

vi.mock("@/services/authService", () => ({
  default: {
    getOnboardingInfo: vi.fn(),
    completeSetup: vi.fn(),
    loginWithGoogle: vi.fn(),
    confirmGoogleLink: vi.fn(),
    cancelGoogleLink: vi.fn(),
  },
}));

vi.mock("@/modules/auth/components/GameOfLifePanel", () => ({
  default: () => <div />,
}));

vi.mock("@/modules/auth/components/AuthPanel", () => ({
  default: () => <div />,
}));

vi.mock("@/modules/auth/components/OnboardingForm", () => ({
  default: () => <form />,
}));

vi.mock("@/shared/components/Skeleton", () => ({
  SkeletonText: () => <div />,
}));

function LocationProbe({ onLocation }: { onLocation: (location: ReturnType<typeof useLocation>) => void }) {
  const location = useLocation();
  onLocation(location);
  return null;
}

describe("AuthPage onboarding", () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    container?.remove();
    root = null;
    container = null;
  });

  it("redirects expired onboarding sessions to login with an OAuth error", async () => {
    vi.mocked(authService.getOnboardingInfo).mockRejectedValue({ status: 401 });
    let observedLocation: ReturnType<typeof useLocation> | undefined;

    await act(async () => {
      root?.render(
        <MemoryRouter initialEntries={["/auth/onboarding"]}>
          <Routes>
            <Route path="/auth/onboarding" element={<AuthPage />} />
            <Route path="/auth" element={<LocationProbe onLocation={(location) => {
              observedLocation = location;
            }} />} />
            <Route path="/" element={<LocationProbe onLocation={(location) => {
              observedLocation = location;
            }} />} />
          </Routes>
        </MemoryRouter>,
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(observedLocation?.pathname).toBe("/auth");
    expect(observedLocation?.search).toBe("?tab=login");
    expect((observedLocation?.state as { oauthError?: string } | null)?.oauthError).toContain("Google");
  });

});

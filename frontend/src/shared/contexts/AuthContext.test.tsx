import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import authService from '@/services/authService';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { changeLanguage: vi.fn() },
  }),
}));

vi.mock('@/shared/contexts/ThemeContext', () => ({
  useTheme: () => ({ reconcileTheme: vi.fn() }),
}));

vi.mock('@/services/authService', () => ({
  default: {
    getStatus: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('AuthContext logout', () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    vi.mocked(authService.getStatus).mockResolvedValue({
      isAuthenticated: true,
      user: {
        id: 1,
        email: 'user@example.com',
        username: 'user',
        display_name: 'User',
        role: 'user',
      },
    });
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

  it('rejects API errors while clearing local auth state', async () => {
    const apiError = new Error('logout failed');
    vi.mocked(authService.logout).mockRejectedValue(apiError);

    let observedLogout: (() => Promise<void>) | undefined;
    let observedIsAuthenticated: boolean | undefined;

    function Probe() {
      const auth = useAuth();
      observedLogout = auth.logout;
      observedIsAuthenticated = auth.isAuthenticated;
      return null;
    }

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <AuthProvider>
          <Probe />
        </AuthProvider>,
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(observedIsAuthenticated).toBe(true);
    await act(async () => {
      await expect(observedLogout?.()).rejects.toBe(apiError);
    });
    expect(observedIsAuthenticated).toBe(false);
  });
});

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ScrollToTop from './ScrollToTop';

function NavigationTestPage() {
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate('/guide')}>
      Go to guide
    </button>
  );
}

describe('ScrollToTop', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls to the top when the route changes', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/faq']}>
          <ScrollToTop />
          <Routes>
            <Route path="/faq" element={<NavigationTestPage />} />
            <Route path="/guide" element={<div>Guide</div>} />
          </Routes>
        </MemoryRouter>,
      );
    });

    scrollTo.mockClear();

    await act(async () => {
      container.querySelector('button')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});

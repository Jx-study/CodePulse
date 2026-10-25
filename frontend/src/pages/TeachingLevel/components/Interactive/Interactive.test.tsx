import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GrowthExplorer from './GrowthExplorer';
import SearchCases from './SearchCases';
import StepCounter from './StepCounter';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => (options ? `${key} ${JSON.stringify(options)}` : key),
    i18n: { language: 'en' },
  }),
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function mount(element: React.ReactElement) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root!.render(element));
  return container;
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  vi.useRealTimers();
});

const buttonByText = (el: HTMLElement, text: string) =>
  Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes(text)) as HTMLButtonElement;

describe('StepCounter', () => {
  it('counts one step per executed line and reports the total at the end', () => {
    const el = mount(<StepCounter />);
    const next = buttonByText(el, 'visuals.stepCounter.next');
    for (let i = 0; i < 7; i++) act(() => next.click());
    expect(next.disabled).toBe(true);
    expect(el.textContent).toContain('"total":7');
  });
});

describe('SearchCases', () => {
  it('finds the first item in one comparison (best case)', () => {
    vi.useFakeTimers();
    const el = mount(<SearchCases />);
    act(() => (el.querySelector('[aria-label*="\\"value\\":7"]') as HTMLButtonElement).click());
    act(() => vi.advanceTimersByTime(2000));
    expect(el.textContent).toContain('visuals.searchCases.verdict.best');
  });

  it('scans everything when the target is missing (worst case)', () => {
    vi.useFakeTimers();
    const el = mount(<SearchCases />);
    act(() => buttonByText(el, 'visuals.searchCases.missing').click());
    for (let i = 0; i < 8; i++) act(() => vi.advanceTimersByTime(400));
    expect(el.textContent).toContain('visuals.searchCases.verdict.worst');
    expect(el.textContent).toContain('8 / 8');
  });
});

describe('GrowthExplorer', () => {
  it('shows a row for every growth class', () => {
    const el = mount(<GrowthExplorer />);
    for (const label of ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)']) {
      expect(el.textContent).toContain(label);
    }
  });
});

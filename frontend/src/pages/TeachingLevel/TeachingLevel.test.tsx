import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TeachingLevel from './TeachingLevel';
import type { Lesson } from './types';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  auth: { isAuthenticated: true },
  startSession: vi.fn(),
  endSession: vi.fn(),
  markTeachingComplete: vi.fn(),
  fetchMyProgress: vi.fn(),
  xpShow: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mocks.navigate,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => (options ? `${key} ${JSON.stringify(options)}` : key),
  }),
}));

vi.mock('@/shared/components/Icon', () => ({ default: () => null }));
vi.mock('@/shared/components/XpFloat', () => ({ xp: { show: mocks.xpShow } }));
vi.mock('@/shared/contexts/AuthContext', () => ({ useAuth: () => mocks.auth }));
vi.mock('@/services/ProgressService', () => ({ fetchMyProgress: mocks.fetchMyProgress }));
vi.mock('@/services/tutorialService', () => ({
  tutorialService: {
    startSession: mocks.startSession,
    endSession: mocks.endSession,
    markTeachingComplete: mocks.markTeachingComplete,
  },
}));
vi.mock('./components/LessonSidebar/LessonSidebar', () => ({ default: () => null }));
vi.mock('./components/SlideRenderer/SlideRenderer', () => ({
  default: ({ slide }: { slide: { title: string } }) => <div>{slide.title}</div>,
}));

const slides = (id: string): Lesson['slides'] => [
  { type: 'cover', title: `${id} cover` },
  { type: 'concept', title: `${id} middle` },
  { type: 'summary', title: `${id} summary` },
];

const lessons: Lesson[] = ['one', 'two'].map((id) => ({
  id,
  title: id,
  subtitle: '',
  icon: 'book',
  color: '#000',
  estimatedMinutes: 1,
  slides: slides(id),
}));

vi.mock('./hooks/useLessons', () => ({ useLessons: () => lessons }));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function render() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(
      <MemoryRouter initialEntries={['/lesson/one']}>
        <Routes>
          <Route path="/lesson/:lessonId" element={<TeachingLevel />} />
        </Routes>
      </MemoryRouter>,
    );
  });
  return container;
}

function unmount() {
  act(() => root?.unmount());
  root = null;
  container?.remove();
  container = null;
}

const buttons = (el: HTMLElement) => Array.from(el.querySelectorAll('button'));
// the footer button comes last; the top bar has its own "back to map" button with the same text
const nextButton = (el: HTMLElement) =>
  buttons(el)
    .filter((b) => /ui\.(next|finish|nextLesson|backToMap|toMap)/.test(b.textContent ?? ''))
    .pop()!;

async function goToLastSlide(el: HTMLElement) {
  for (let i = 0; i < 2; i++) {
    await act(async () => nextButton(el).click());
  }
}

async function wait(seconds: number) {
  await act(async () => {
    vi.advanceTimersByTime(seconds * 1000);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  mocks.auth.isAuthenticated = true;
  mocks.startSession.mockResolvedValue(7);
  mocks.endSession.mockResolvedValue(undefined);
  mocks.markTeachingComplete.mockResolvedValue({ xp_earned: 20 });
  mocks.fetchMyProgress.mockResolvedValue([]);
  Object.defineProperty(navigator, 'sendBeacon', { value: vi.fn(() => true), configurable: true });
});

afterEach(() => {
  if (root) unmount();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('finishing a lesson', () => {
  it('counts down before the finish button can be used', async () => {
    const el = render();
    await goToLastSlide(el);

    expect(nextButton(el).textContent).toContain('ui.finishWait');
    expect(nextButton(el).disabled).toBe(true);

    await wait(32);
    expect(nextButton(el).textContent).toContain('ui.finish');
    expect(nextButton(el).textContent).not.toContain('ui.finishWait');
    expect(nextButton(el).disabled).toBe(false);
  });

  it('marks the lesson complete and stays on the page, then offers the next lesson', async () => {
    const el = render();
    await goToLastSlide(el);
    await wait(32);

    await act(async () => nextButton(el).click());
    expect(mocks.markTeachingComplete).toHaveBeenCalledWith('one');
    expect(mocks.xpShow).toHaveBeenCalledWith(20, { reason: 'tutorial' });
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(el.textContent).toContain('one summary');
    expect(nextButton(el).textContent).toContain('ui.nextLesson');

    await act(async () => nextButton(el).click());
    expect(mocks.navigate).toHaveBeenCalledWith('/lesson/two');
  });

  it('keeps the button available to retry when the backend refuses', async () => {
    mocks.markTeachingComplete.mockRejectedValueOnce(new Error('too early'));
    const el = render();
    await goToLastSlide(el);
    await wait(32);

    await act(async () => nextButton(el).click());
    expect(nextButton(el).textContent).toContain('ui.finish');
    expect(nextButton(el).disabled).toBe(false);

    await act(async () => nextButton(el).click());
    expect(nextButton(el).textContent).toContain('ui.nextLesson');
  });

  it('completes on the way out when a next-step link is used before pressing finish', async () => {
    const el = render();
    await goToLastSlide(el);
    await wait(32);

    unmount();
    expect(mocks.markTeachingComplete).toHaveBeenCalledWith('one');
  });

  it('does not complete on the way out before the minimum reading time', async () => {
    const el = render();
    await goToLastSlide(el);
    await wait(10);

    unmount();
    expect(mocks.markTeachingComplete).not.toHaveBeenCalled();
  });

  it('does not complete on the way out when the last slide was never reached', async () => {
    render();
    await wait(60);

    unmount();
    expect(mocks.markTeachingComplete).not.toHaveBeenCalled();
  });

  it('does not ask the backend anything when signed out and goes straight to the next lesson', async () => {
    mocks.auth.isAuthenticated = false;
    const el = render();
    await goToLastSlide(el);

    expect(nextButton(el).textContent).toContain('ui.nextLesson');
    expect(nextButton(el).disabled).toBe(false);
    await act(async () => nextButton(el).click());

    expect(mocks.navigate).toHaveBeenCalledWith('/lesson/two');
    expect(mocks.markTeachingComplete).not.toHaveBeenCalled();
    expect(mocks.startSession).not.toHaveBeenCalled();
  });
});

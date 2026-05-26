import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import About from './About';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('motion/react', async () => {
  const ReactModule = await import('react');
  type MotionDivProps = React.ComponentProps<'div'> & {
    initial?: unknown;
    whileInView?: unknown;
    viewport?: unknown;
    transition?: unknown;
  };
  return {
    motion: {
      div: ({
        children,
        initial: _initial,
        whileInView: _whileInView,
        viewport: _viewport,
        transition: _transition,
        ...props
      }: MotionDivProps) =>
        ReactModule.createElement('div', props, children),
    },
    useScroll: () => ({ scrollYProgress: 0 }),
    useTransform: () => '0%',
  };
});

describe('About', () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    container?.remove();
    root = null;
    container = null;
  });

  it('does not crash when milestone translations fail to load', () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    expect(() => {
      act(() => {
        root?.render(<About />);
      });
    }).not.toThrow();
  });
});

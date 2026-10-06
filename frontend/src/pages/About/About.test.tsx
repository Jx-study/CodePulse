import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import About from './About';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('motion/react', async () => {
  const ReactModule = await import('react');
  type MotionProps = Record<string, unknown> & {
    children?: React.ReactNode;
    initial?: unknown;
    animate?: unknown;
    exit?: unknown;
    whileInView?: unknown;
    viewport?: unknown;
    transition?: unknown;
    style?: unknown;
  };
  const stripMotionProps = ({
    children,
    initial: _initial,
    animate: _animate,
    exit: _exit,
    whileInView: _whileInView,
    viewport: _viewport,
    transition: _transition,
    ...props
  }: MotionProps) => props;

  const makeMotion = (tag: string) => (props: MotionProps) =>
    ReactModule.createElement(tag, stripMotionProps(props), props.children);

  const motionProxy = new Proxy(
    {},
    {
      get: (_target, tag: string) => makeMotion(tag),
    },
  );

  return {
    motion: Object.assign(motionProxy, {
      create: (Component: React.ComponentType) => (props: MotionProps) =>
        ReactModule.createElement(Component, stripMotionProps(props) as never),
    }),
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
    useScroll: () => ({ scrollYProgress: { get: () => 0, on: () => () => {} } }),
    useTransform: () => 0,
    useSpring: () => ({ get: () => 0, on: () => () => {}, set: () => {} }),
    useVelocity: () => ({ get: () => 0, on: () => () => {} }),
    useMotionValueEvent: () => {},
    useReducedMotion: () => false,
    useInView: () => false,
  };
});

// jsdom 沒有 SVGPathElement，且未實作幾何 API；HeroPulse 用 getTotalLength/getPointAtLength 取樣路徑
beforeAll(() => {
  const proto = window.SVGElement.prototype as unknown as {
    getTotalLength: () => number;
    getPointAtLength: () => DOMPoint;
  };
  proto.getTotalLength = () => 100;
  proto.getPointAtLength = () => ({ x: 0, y: 0 }) as DOMPoint;

  // jsdom 沒有 ResizeObserver；About 用它在主軸尺寸變動時重新量測節點位置
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
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
        root?.render(
          <MemoryRouter>
            <About />
          </MemoryRouter>,
        );
      });
    }).not.toThrow();
  });
});

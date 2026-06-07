import { useSyncExternalStore } from 'react';
import CodiSvg from './CodiSvg';
import CodiLottie from './CodiLottie';
import type { CodiSvgProps } from './CodiSvg';

export type { CodiState } from './CodiSvg';
export type CodiProps = CodiSvgProps;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener('change', onStoreChange);

  return () => {
    mediaQuery.removeEventListener('change', onStoreChange);
  };
}

function getReducedMotionSnapshot() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
}

/**
 * Codi 吉祥物對外入口。
 * prefers-reduced-motion 時退回 SVG 靜態版，否則使用 Lottie 動畫版。
 */
export default function Codi(props: CodiProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return prefersReducedMotion ? <CodiSvg {...props} /> : <CodiLottie {...props} />;
}

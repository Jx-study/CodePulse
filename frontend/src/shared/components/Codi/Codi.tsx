import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import styles from './Codi.module.scss';
import runningAnimation from './codi-running.json';
import errorAnimation from './codi-error.json';

export type CodiState = 'running' | 'error';

export interface CodiProps {
  state: CodiState;
  runningText?: string;
  errorText?: string;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/** Codi 吉祥物。prefers-reduced-motion 時停在第一幀，否則循環播放 */
export default function Codi({ state, runningText, errorText }: CodiProps) {
  const { t } = useTranslation('common');
  const prefersReducedMotion = usePrefersReducedMotion();
  const isError = state === 'error';

  return (
    <div className={styles.wrap}>
      <Lottie
        className={styles.lottie}
        animationData={isError ? errorAnimation : runningAnimation}
        loop={!prefersReducedMotion}
        initialSegment={prefersReducedMotion ? [0, 1] : undefined}
        aria-hidden
      />
      <span className={`${styles.text} ${isError ? styles.textError : ''}`}>
        {isError
          ? (errorText ?? t('mascot.errorText'))
          : (runningText ?? t('mascot.runningText'))}
      </span>
    </div>
  );
}

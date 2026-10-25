import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import Slider from '@/shared/components/Slider';
import StatCard from './StatCard';
import styles from './Interactive.module.scss';

type Mode = 'recursive' | 'iterative';

const MIN_N = 2;
const MAX_N = 6;
const FRAME_HEIGHT = 38;

const factorial = (k: number): number => (k <= 1 ? 1 : k * factorial(k - 1));

export default function CallStack() {
  const { t } = useTranslation('lessons');
  const [mode, setMode] = useState<Mode>('recursive');
  const [n, setN] = useState(4);
  const [step, setStep] = useState(0);

  const recursive = mode === 'recursive';
  const totalSteps = recursive ? 2 * n : n;
  const finished = step === totalSteps;

  // recursive: n steps of calling deeper, then n steps of returning
  const pushed = Math.min(step, n);
  const popped = recursive ? Math.max(0, step - n) : 0;
  const depth = recursive ? pushed - popped : step > 0 ? 1 : 0;
  const maxDepth = recursive ? pushed : step > 0 ? 1 : 0;
  const returned = popped > 0 ? factorial(popped) : null;

  // bottom of the stack first
  const frames = recursive
    ? Array.from({ length: depth }, (_, i) => n - i)
    : step > 0
      ? [step]
      : [];

  const reset = (nextMode: Mode, nextN: number) => {
    setMode(nextMode);
    setN(nextN);
    setStep(0);
  };

  const hint = () => {
    if (finished) return t(recursive ? 'visuals.callStack.finishedRecursive' : 'visuals.callStack.finishedIterative', { depth: maxDepth });
    return t(recursive ? 'visuals.callStack.hintRecursive' : 'visuals.callStack.hintIterative');
  };

  return (
    <div className={styles.panel} role="group" aria-label={t('visuals.callStack.ariaLabel')}>
      <div className={styles.actions}>
        {(['recursive', 'iterative'] as const).map((m) => (
          <Button
            key={m}
            variant={m === mode ? 'primaryOutline' : 'secondary'}
            size="sm"
            aria-pressed={m === mode}
            onClick={() => reset(m, n)}
          >
            {t(`visuals.callStack.${m}`)}
          </Button>
        ))}
      </div>

      <div className={styles.controlRow}>
        <span className={styles.controlLabel}>n</span>
        <Slider
          min={MIN_N}
          max={MAX_N}
          step={1}
          value={n}
          onChange={(value) => reset(mode, value)}
          showValue
          formatValue={String}
          ariaLabel={t('visuals.callStack.nLabel')}
          className={styles.slider}
        />
      </div>

      <div className={styles.stackArea} style={{ minHeight: MAX_N * FRAME_HEIGHT }}>
        {frames.length === 0 && <span className={styles.stackEmpty}>{t('visuals.callStack.empty')}</span>}
        {frames.map((k, i) => {
          const top = i === frames.length - 1;
          return (
            <div key={`${mode}-${k}`} className={`${styles.frame} ${top ? styles.frameTop : ''}`} style={{ minHeight: FRAME_HEIGHT - 6 }}>
              {recursive ? (
                <>
                  <code>factorial({k})</code>
                  <span className={styles.frameNote}>
                    {top && returned !== null
                      ? t('visuals.callStack.returned', { value: returned })
                      : t('visuals.callStack.waiting', { expr: k > 1 ? `${k} × factorial(${k - 1})` : '1' })}
                  </span>
                </>
              ) : (
                <>
                  <code>total({n})</code>
                  <span className={styles.frameNote}>{`i = ${k},  result = ${factorial(k)}`}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.stats}>
        <StatCard inline label={t('visuals.callStack.depth')} value={depth} />
        <StatCard inline label={t('visuals.callStack.maxDepth')} value={maxDepth} />
      </div>

      <div className={styles.actions}>
        <Button size="sm" disabled={finished} onClick={() => setStep(step + 1)}>
          {t('visuals.callStack.next')}
        </Button>
        <Button variant="secondary" size="sm" disabled={step === 0} onClick={() => setStep(0)}>
          {t('visuals.callStack.reset')}
        </Button>
      </div>

      <p className={styles.hint} aria-live="polite">
        {hint()}
      </p>
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import CodeBlock from '@/shared/components/CodeBlock';
import Slider from '@/shared/components/Slider';
import styles from './Interactive.module.scss';

const MIN_N = 3;
const MAX_N = 12;

const CODE = ['def total(nums):', '    result = 0', '    for x in nums:', '        result += x', '    return result'];
const LINE_INIT = 1;
const LINE_LOOP = 3;
const LINE_RETURN = 4;

export default function StepCounter() {
  const { t } = useTranslation('lessons');
  const [n, setN] = useState(5);
  const [steps, setSteps] = useState(0); // lines executed so far

  const total = n + 2; // init + one per element + return
  const finished = steps === total;
  const iterations = Math.min(Math.max(steps - 1, 0), n);
  const sum = (iterations * (iterations + 1)) / 2;

  let nextLine = LINE_INIT;
  if (steps >= 1 && steps <= n) nextLine = LINE_LOOP;
  else if (steps === n + 1) nextLine = LINE_RETURN;

  const changeN = (value: number) => {
    setN(value);
    setSteps(0);
  };

  return (
    <div className={styles.panel} role="group" aria-label={t('visuals.stepCounter.ariaLabel')}>
      <div className={styles.controlRow}>
        <span className={styles.controlLabel}>n</span>
        <Slider
          min={MIN_N}
          max={MAX_N}
          step={1}
          value={n}
          onChange={changeN}
          ariaLabel={t('visuals.stepCounter.nLabel')}
          showValue
          formatValue={(v) => String(v)}
          className={styles.slider}
        />
      </div>

      <CodeBlock filename="total.py" lines={CODE} highlightedLines={finished ? [] : [nextLine + 1]} fontSize="md" />

      <div className={styles.tiles} aria-hidden="true">
        {Array.from({ length: n }, (_, i) => {
          const current = steps >= 1 && i === iterations && iterations < n;
          return (
            <div key={i} className={styles.tileSlot}>
              <span className={`${styles.tilePointer} ${current ? styles.tilePointerOn : ''}`}>x</span>
              <div className={`${styles.tile} ${i < iterations ? styles.tileDone : ''}`}>{i + 1}</div>
            </div>
          );
        })}
      </div>

      <div className={styles.stats}>
        <Card size="sm" hoverable={false} className={styles.stat}>
          <span className={styles.statLabel}>{t('visuals.stepCounter.steps')}</span>
          <strong className={styles.statValue}>{steps}</strong>
        </Card>
        <Card size="sm" hoverable={false} className={styles.stat}>
          <span className={styles.statLabel}>{t('visuals.stepCounter.result')}</span>
          <strong className={styles.statValue}>{sum}</strong>
        </Card>
      </div>

      <div className={styles.actions}>
        <Button size="sm" disabled={finished} onClick={() => setSteps(steps + 1)}>
          {t('visuals.stepCounter.next')}
        </Button>
        <Button variant="secondary" size="sm" disabled={steps === 0} onClick={() => setSteps(0)}>
          {t('visuals.stepCounter.reset')}
        </Button>
      </div>

      <p className={styles.hint} aria-live="polite">
        {finished ? t('visuals.stepCounter.finished', { n, total }) : t('visuals.stepCounter.hint')}
      </p>
    </div>
  );
}

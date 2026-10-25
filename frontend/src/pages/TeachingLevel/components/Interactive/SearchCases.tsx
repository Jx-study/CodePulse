import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import styles from './Interactive.module.scss';

const ARRAY = [7, 3, 9, 1, 5, 8, 2, 6];
const STEP_MS = 350;

type Target = number | 'missing';

export default function SearchCases() {
  const { t } = useTranslation('lessons');
  const [target, setTarget] = useState<Target | null>(null);
  const [checked, setChecked] = useState(0);

  const foundAt = target === null || target === 'missing' ? -1 : ARRAY.indexOf(target);
  const lastStep = foundAt >= 0 ? foundAt + 1 : ARRAY.length;
  const running = target !== null && checked < lastStep;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setChecked((c) => c + 1), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [running, checked]);

  // picking the current target again cancels the search
  const start = (next: Target) => {
    setTarget(next === target ? null : next);
    setChecked(0);
  };

  const verdict = () => {
    if (target === null || running) return null;
    if (foundAt === 0) return 'best';
    if (foundAt === -1 || foundAt === ARRAY.length - 1) return 'worst';
    return 'middle';
  };
  const result = verdict();

  return (
    <div className={styles.panel} role="group" aria-label={t('visuals.searchCases.ariaLabel')}>
      <p className={styles.prompt}>{t('visuals.searchCases.prompt')}</p>

      <div className={styles.cells}>
        {ARRAY.map((value, i) => {
          const scanned = target !== null && i < checked;
          const hit = scanned && i === foundAt;
          return (
            <Button
              key={i}
              variant="unstyled"
              className={`${styles.cell} ${styles.cellButton} ${scanned ? styles.cellDone : ''} ${hit ? styles.cellHit : ''} ${target === value ? styles.cellTarget : ''}`}
              aria-pressed={target === value}
              onClick={() => start(value)}
              aria-label={t('visuals.searchCases.pick', { value })}
            >
              {value}
            </Button>
          );
        })}
      </div>

      <div className={styles.actions}>
        <Button
          variant={target === 'missing' ? 'primaryOutline' : 'secondary'}
          size="sm"
          aria-pressed={target === 'missing'}
          onClick={() => start('missing')}
        >
          {t('visuals.searchCases.missing')}
        </Button>
      </div>

      <div className={styles.stats}>
        <Card size="sm" hoverable={false} className={styles.stat}>
          <span className={styles.statLabel}>{t('visuals.searchCases.compared')}</span>
          <strong className={styles.statValue}>
            {checked} / {ARRAY.length}
          </strong>
        </Card>
        {result && (
          <Card size="sm" hoverable={false} className={`${styles.stat} ${styles[`verdict_${result}`]}`}>
            <span className={styles.statLabel}>{t('visuals.searchCases.case')}</span>
            <strong className={styles.statValue}>{t(`visuals.searchCases.verdict.${result}`)}</strong>
          </Card>
        )}
      </div>

      <p className={styles.hint} aria-live="polite">
        {result ? t(`visuals.searchCases.explain.${result}`, { count: checked }) : t('visuals.searchCases.hint')}
      </p>
    </div>
  );
}

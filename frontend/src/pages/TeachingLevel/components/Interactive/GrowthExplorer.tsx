import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Slider from '@/shared/components/Slider';
import styles from './Interactive.module.scss';

const OPS_PER_SECOND = 1e9;
const MAX_LOG10 = 12; // bar width saturates at 10^12 steps
const MAX_EXPONENT = 6;

interface Growth {
  label: string;
  color: string;
  /** log10 of the step count, so 2^n stays finite for large n */
  log10Ops: (n: number) => number;
}

const GROWTHS: Growth[] = [
  { label: 'O(1)', color: '#10b981', log10Ops: () => 0 },
  { label: 'O(log n)', color: '#3b82f6', log10Ops: (n) => Math.log10(Math.max(1, Math.log2(n))) },
  { label: 'O(n)', color: '#f59e0b', log10Ops: (n) => Math.log10(n) },
  { label: 'O(n log n)', color: '#f97316', log10Ops: (n) => Math.log10(n * Math.max(1, Math.log2(n))) },
  { label: 'O(n²)', color: '#ef4444', log10Ops: (n) => 2 * Math.log10(n) },
  { label: 'O(2ⁿ)', color: '#a855f7', log10Ops: (n) => n * Math.log10(2) },
];

function formatSteps(log10: number, locale: string): string {
  if (log10 < 15) return Math.round(10 ** log10).toLocaleString(locale);
  return `10^${Math.round(log10).toLocaleString(locale)}`;
}

export default function GrowthExplorer() {
  const { t, i18n } = useTranslation('lessons');
  const [exponent, setExponent] = useState(1);
  const n = Math.max(1, Math.round(10 ** exponent));

  const timeLabel = (log10: number) => {
    const seconds = 10 ** (log10 - Math.log10(OPS_PER_SECOND));
    const base = 'visuals.growthExplorer.units';
    if (log10 - Math.log10(OPS_PER_SECOND) > 12) return t(`${base}.never`);
    const fmt = (value: number) => value.toLocaleString(i18n.language, { maximumFractionDigits: 1 });
    if (seconds < 1e-3) return t(`${base}.instant`);
    if (seconds < 60) return t(`${base}.second`, { value: fmt(seconds) });
    if (seconds < 3600) return t(`${base}.minute`, { value: fmt(seconds / 60) });
    if (seconds < 86400) return t(`${base}.hour`, { value: fmt(seconds / 3600) });
    if (seconds < 86400 * 365) return t(`${base}.day`, { value: fmt(seconds / 86400) });
    return t(`${base}.year`, { value: fmt(seconds / (86400 * 365)) });
  };

  return (
    <div className={styles.panel} role="group" aria-label={t('visuals.growthExplorer.ariaLabel')}>
      <div className={styles.controlRow}>
        <span className={styles.controlLabel}>{t('visuals.growthExplorer.nLabel')}</span>
        <Slider
          min={0}
          max={MAX_EXPONENT}
          step={0.1}
          value={exponent}
          onChange={setExponent}
          ariaLabel={t('visuals.growthExplorer.nLabel')}
          showValue
          formatValue={(v) => Math.max(1, Math.round(10 ** v)).toLocaleString(i18n.language)}
          className={styles.slider}
        />
      </div>

      <div className={styles.bars}>
        {GROWTHS.map(({ label, color, log10Ops }) => {
          const log10 = log10Ops(n);
          const width = Math.max(2, Math.min(100, (log10 / MAX_LOG10) * 100));
          return (
            <div key={label} className={styles.barRow}>
              <span className={styles.barLabel} style={{ color }}>
                {label}
              </span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${width}%`, background: color }} />
              </div>
              <span className={styles.barValue}>
                <span>{formatSteps(log10, i18n.language)}</span>
                <span className={styles.barTime}>{timeLabel(log10)}</span>
              </span>
            </div>
          );
        })}
      </div>

      <p className={styles.hint}>{t('visuals.growthExplorer.hint')}</p>
    </div>
  );
}

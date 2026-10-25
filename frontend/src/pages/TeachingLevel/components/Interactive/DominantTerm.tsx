import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import Slider from '@/shared/components/Slider';
import styles from './Interactive.module.scss';

interface Term {
  label: string;
  /** power of n: 2 for n², 1 for 100n, 0 for a constant */
  degree: number;
  value: (n: number) => number;
}

interface Preset {
  terms: Term[];
  bigO: string;
}

const PRESETS: Preset[] = [
  {
    bigO: 'O(n)',
    terms: [
      { label: '3n', degree: 1, value: (n) => 3 * n },
      { label: '5', degree: 0, value: () => 5 },
    ],
  },
  {
    bigO: 'O(n²)',
    terms: [
      { label: 'n²', degree: 2, value: (n) => n * n },
      { label: '100n', degree: 1, value: (n) => 100 * n },
    ],
  },
  {
    bigO: 'O(n²)',
    terms: [
      { label: 'n²', degree: 2, value: (n) => n * n },
      { label: 'n', degree: 1, value: (n) => n },
      { label: '1', degree: 0, value: () => 1 },
    ],
  },
];

const TERM_COLORS = ['#ef4444', '#f59e0b', '#3b82f6'];
const MAX_EXPONENT = 4;
const SEARCH_LIMIT = 1_000_000;

/** Smallest n from which the highest-power term is bigger than all the other terms together */
export function crossover(terms: Term[]): number {
  const top = terms.reduce((a, b) => (b.degree > a.degree ? b : a));
  const rest = terms.filter((term) => term !== top);
  for (let n = 1; n <= SEARCH_LIMIT; n++) {
    if (top.value(n) > rest.reduce((sum, term) => sum + term.value(n), 0)) return n;
  }
  return SEARCH_LIMIT;
}

export default function DominantTerm() {
  const { t, i18n } = useTranslation('lessons');
  const [presetIndex, setPresetIndex] = useState(1);
  const [exponent, setExponent] = useState(1);

  const preset = PRESETS[presetIndex];
  const n = Math.max(1, Math.round(10 ** exponent));
  const terms = preset.terms.map((term, i) => ({ ...term, amount: term.value(n), color: TERM_COLORS[i] }));
  const total = terms.reduce((sum, term) => sum + term.amount, 0);
  const top = terms.reduce((a, b) => (b.degree > a.degree ? b : a));
  const rest = terms.filter((term) => term !== top);
  const topWins = top.amount > rest.reduce((sum, term) => sum + term.amount, 0);
  const takeover = crossover(preset.terms);
  const expression = preset.terms.map((term) => term.label).join(' + ');

  return (
    <div className={styles.panel} role="group" aria-label={t('visuals.dominantTerm.ariaLabel')}>
      <div className={styles.actions}>
        {PRESETS.map((option, i) => (
          <Button
            key={i}
            variant={i === presetIndex ? 'primaryOutline' : 'secondary'}
            size="sm"
            aria-pressed={i === presetIndex}
            onClick={() => setPresetIndex(i)}
          >
            {option.terms.map((term) => term.label).join(' + ')}
          </Button>
        ))}
      </div>

      <div className={styles.controlRow}>
        <span className={styles.controlLabel}>n</span>
        <Slider
          min={0}
          max={MAX_EXPONENT}
          step={0.1}
          value={exponent}
          onChange={setExponent}
          showValue
          formatValue={(v) => Math.max(1, Math.round(10 ** v)).toLocaleString(i18n.language)}
          ariaLabel={t('visuals.dominantTerm.nLabel')}
          className={styles.slider}
        />
      </div>

      <div className={styles.bars}>
        {terms.map(({ label, degree, amount, color }) => (
          <div key={label} className={styles.stepRow}>
            <span className={styles.stepLabel} style={{ color }}>
              {label}
              <span className={styles.stepSub}>{t('visuals.dominantTerm.power', { power: degree })}</span>
            </span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${Math.max(1, (amount / total) * 100)}%`, background: color }} />
            </div>
            <span className={styles.stepValue}>{amount.toLocaleString(i18n.language)}</span>
          </div>
        ))}
      </div>

      <p className={styles.hint} aria-live="polite">
        {topWins
          ? t('visuals.dominantTerm.bigEnough', { term: top.label })
          : t('visuals.dominantTerm.stillSmall', { term: top.label, at: (takeover - 1).toLocaleString(i18n.language) })}
      </p>
      <p className={styles.hint}>
        <strong>{t('visuals.dominantTerm.rule', { expression, bigO: preset.bigO, term: top.label })}</strong>
      </p>
    </div>
  );
}

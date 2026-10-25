import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import Slider from '@/shared/components/Slider';
import StatCard from './StatCard';
import styles from './Interactive.module.scss';

const MIN_MAX = 8;
const MAX_MAX = 64;

/** Most guesses needed when every guess is the middle of what is left */
export function worstCaseGuesses(max: number): number {
  let left = max;
  let guesses = 0;
  while (left > 0) {
    left = Math.floor(left / 2);
    guesses += 1;
  }
  return guesses;
}

const randomSecret = (max: number) => Math.floor(Math.random() * max) + 1;

export default function NumberGuess() {
  const { t } = useTranslation('lessons');
  const [max, setMax] = useState(32);
  const [secret, setSecret] = useState(() => randomSecret(32));
  const [guesses, setGuesses] = useState<number[]>([]);

  const found = guesses.includes(secret);
  const last = guesses[guesses.length - 1];

  // every wrong guess cuts away everything on its side
  let low = 1;
  let high = max;
  for (const guess of guesses) {
    if (guess < secret) low = Math.max(low, guess + 1);
    if (guess > secret) high = Math.min(high, guess - 1);
  }
  const remaining = found ? 1 : high - low + 1;

  const restart = (nextMax: number) => {
    setMax(nextMax);
    setSecret(randomSecret(nextMax));
    setGuesses([]);
  };

  const guess = (value: number) => {
    if (!found) setGuesses([...guesses, value]);
  };

  const message = () => {
    if (guesses.length === 0) return t('visuals.numberGuess.start', { max });
    if (found) {
      return `${t('visuals.numberGuess.found', { guess: last })} ${t('visuals.numberGuess.result', {
        used: guesses.length,
        best: worstCaseGuesses(max),
        max,
      })}`;
    }
    return t(last < secret ? 'visuals.numberGuess.tooLow' : 'visuals.numberGuess.tooHigh', { guess: last });
  };

  return (
    <div className={styles.panel} role="group" aria-label={t('visuals.numberGuess.ariaLabel')}>
      <div className={styles.controlRow}>
        <span className={styles.controlLabel}>{t('visuals.numberGuess.rangeLabel')}</span>
        <Slider
          min={MIN_MAX}
          max={MAX_MAX}
          step={8}
          value={max}
          onChange={restart}
          showValue
          formatValue={(v) => `1 – ${v}`}
          ariaLabel={t('visuals.numberGuess.rangeLabel')}
          className={styles.slider}
        />
      </div>

      <div className={styles.tiles}>
        {Array.from({ length: max }, (_, i) => {
          const value = i + 1;
          const out = !found && (value < low || value > high);
          const guessed = guesses.includes(value);
          const hit = found && value === secret;
          return (
            <Button
              key={value}
              variant="unstyled"
              disabled={found || out || guessed}
              aria-label={t('visuals.numberGuess.pick', { guess: value })}
              className={`${styles.tile} ${styles.guessTile} ${out ? styles.guessOut : ''} ${guessed && !hit ? styles.guessUsed : ''} ${hit ? styles.guessHit : ''}`}
              onClick={() => guess(value)}
            >
              {value}
            </Button>
          );
        })}
      </div>

      <div className={styles.stats}>
        <StatCard inline label={t('visuals.numberGuess.used')} value={guesses.length} />
        <StatCard inline label={t('visuals.numberGuess.remaining')} value={remaining} />
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="sm"
          disabled={found}
          onClick={() => guess(Math.floor((low + high) / 2))}
        >
          {t('visuals.numberGuess.middle')}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => restart(max)}>
          {t('visuals.numberGuess.again')}
        </Button>
      </div>

      <p className={styles.hint} aria-live="polite">
        {message()}
      </p>
    </div>
  );
}

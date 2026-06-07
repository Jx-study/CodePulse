import styles from './CodiSvg.module.scss';

export type CodiState = 'running' | 'error';

export interface CodiSvgProps {
  state: CodiState;
  runningText?: string;
  errorText?: string;
}

/** SVG+CSS 版 Codi 吉祥物，用於 prefers-reduced-motion 或 Lottie 不可用時的 fallback。 */
export default function CodiSvg({
  state,
  runningText = '分析中，請稍候…',
  errorText = '執行失敗，請修正後再試',
}: CodiSvgProps) {
  const isError = state === 'error';
  return (
    <div className={styles.wrap}>
      <svg
        className={`${styles.svg} ${isError ? styles.botError : styles.bot}`}
        viewBox="0 0 100 124"
        aria-hidden="true"
      >
        <line
          className={isError ? styles.antennaError : styles.antenna}
          x1="50" y1="20" x2="50" y2="6"
        />
        <circle
          className={isError ? styles.bulbError : styles.bulb}
          cx="50" cy="5" r="4"
        />
        <rect
          className={isError ? `${styles.head} ${styles.headError}` : styles.head}
          x="20" y="22" width="60" height="56" rx="20"
        />
        <ellipse
          className={isError ? `${styles.eye} ${styles.eyeError}` : styles.eye}
          cx="38" cy="44" rx="6" ry="8"
        />
        <ellipse
          className={isError ? `${styles.eye} ${styles.eyeError}` : styles.eye}
          cx="62" cy="44" rx="6" ry="8"
        />
        <path
          className={isError ? `${styles.mouthWave} ${styles.mouthWaveError}` : styles.mouthWave}
          d="M36 64 L44 64 L48 58 L54 72 L58 64 L64 64"
        />
        <path
          className={isError ? `${styles.flatline} ${styles.flatlineError}` : styles.flatline}
          d="M36 64 L64 64"
        />
      </svg>
      <span className={`${styles.text} ${isError ? styles.textError : ''}`}>
        {isError ? errorText : runningText}
      </span>
    </div>
  );
}

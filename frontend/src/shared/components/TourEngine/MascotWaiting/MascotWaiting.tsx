import styles from './MascotWaiting.module.scss';

export type MascotState = 'running' | 'error';

interface MascotWaitingProps {
  /** running：陪伴等待；error：執行失敗提示 */
  state: MascotState;
  /** running 時顯示的文字，預設「分析中，請稍候…」 */
  runningText?: string;
  /** error 時顯示的文字，預設「執行失敗，請修正後再試」 */
  errorText?: string;
}

/**
 * Codi 吉祥物等待元件（造型 B 衍生：方案 E 無腮紅版）。
 * 純 SVG + CSS 動畫。嘴部為心電圖脈搏波形（running 跑動 / error 攤平成 flatline），
 * 呼應 CodePulse =「程式碼的脈搏」品牌。進度由畫面上既有的 StatusBar 負責，Codi 只做陪伴。
 * 若日後需要更豐富動作，再以 Lottie 替換（獨立 plan）。
 */
export default function MascotWaiting({
  state,
  runningText = '分析中，請稍候…',
  errorText = '執行失敗，請修正後再試',
}: MascotWaitingProps) {
  const isError = state === 'error';
  return (
    <div className={styles.wrap}>
      <svg
        className={`${styles.svg} ${isError ? styles.botError : styles.bot}`}
        viewBox="0 0 100 124"
        aria-hidden="true"
      >
        {/* 天線 + 燈號 */}
        <line
          className={isError ? styles.antennaError : styles.antenna}
          x1="50" y1="20" x2="50" y2="6"
        />
        <circle
          className={isError ? styles.bulbError : styles.bulb}
          cx="50" cy="5" r="4"
        />
        {/* 頭（圓角較圓） */}
        <rect
          className={isError ? `${styles.head} ${styles.headError}` : styles.head}
          x="20" y="22" width="60" height="56" rx="20"
        />
        {/* 眼睛（放大） */}
        <ellipse
          className={isError ? `${styles.eye} ${styles.eyeError}` : styles.eye}
          cx="38" cy="44" rx="6" ry="8"
        />
        <ellipse
          className={isError ? `${styles.eye} ${styles.eyeError}` : styles.eye}
          cx="62" cy="44" rx="6" ry="8"
        />
        {/* 嘴 = 心電圖脈搏波形（running 跑動） */}
        <path
          className={isError ? `${styles.mouthWave} ${styles.mouthWaveError}` : styles.mouthWave}
          d="M36 64 L44 64 L48 58 L54 72 L58 64 L64 64"
        />
        {/* error 時改顯紅色平直線（flatline） */}
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

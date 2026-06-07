import Lottie from 'lottie-react';
import type { CodiSvgProps } from './CodiSvg';
import styles from './CodiSvg.module.scss';
import runningAnimation from './codi-running.json';
import errorAnimation from './codi-error.json';

/** Lottie 版 Codi 吉祥物，用於支援動畫的環境。 */
export default function CodiLottie({
  state,
  runningText = '分析中，請稍候…',
  errorText = '執行失敗，請修正後再試',
}: CodiSvgProps) {
  const isError = state === 'error';
  return (
    <div className={styles.wrap}>
      <Lottie
        className={styles.lottie}
        animationData={isError ? errorAnimation : runningAnimation}
        loop={!isError}
        aria-hidden
      />
      <span className={`${styles.text} ${isError ? styles.textError : ''}`}>
        {isError ? errorText : runningText}
      </span>
    </div>
  );
}

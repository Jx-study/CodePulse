import React from 'react';
import styles from './IntroductionTab.module.scss';

interface IntroductionTabProps {
  introduction: string;
}

const IntroductionTab: React.FC<IntroductionTabProps> = ({ introduction }) => {
  return (
    <div className={styles.introductionTab}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>演算法簡介</h3>
        <p className={styles.cardContent}>{introduction}</p>
      </div>
    </div>
  );
};

export default IntroductionTab;

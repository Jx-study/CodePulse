import React from 'react';
import type { Complexity } from '@/types';
import styles from './ComplexityTab.module.scss';

interface ComplexityTabProps {
  complexity: Complexity;
}

const ComplexityTab: React.FC<ComplexityTabProps> = ({ complexity }) => {
  return (
    <div className={styles.complexityTab}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>複雜度分析</h3>
        <div className={styles.complexityTable}>
          <div className={styles.complexityRow}>
            <span className={styles.complexityLabel}>時間複雜度（最佳）：</span>
            <span className={styles.complexityValue}>
              {complexity.timeBest || 'N/A'}
            </span>
          </div>
          <div className={styles.complexityRow}>
            <span className={styles.complexityLabel}>時間複雜度（平均）：</span>
            <span className={styles.complexityValue}>
              {complexity.timeAverage || 'N/A'}
            </span>
          </div>
          <div className={styles.complexityRow}>
            <span className={styles.complexityLabel}>時間複雜度（最差）：</span>
            <span className={styles.complexityValue}>
              {complexity.timeWorst || 'N/A'}
            </span>
          </div>
          <div className={styles.complexityRow}>
            <span className={styles.complexityLabel}>空間複雜度：</span>
            <span className={styles.complexityValue}>
              {complexity.space || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplexityTab;

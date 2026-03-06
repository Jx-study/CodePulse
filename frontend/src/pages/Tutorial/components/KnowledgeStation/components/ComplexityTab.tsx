import React from 'react';
import { motion } from 'motion/react';
import Icon from '@/shared/components/Icon';
import type { ComplexityInfo } from '@/types';
import styles from './ComplexityTab.module.scss';

interface ComplexityTabProps {
  complexity: ComplexityInfo;
}

const rowVariants = {
  rest: { x: 0, scale: 1 },
  hover: { x: 4, scale: 1.01 },
};

const rowTransition = { type: 'spring' as const, stiffness: 400, damping: 28 };

const ComplexityTab: React.FC<ComplexityTabProps> = ({ complexity }) => {
  return (
    <div className={styles.complexityTab}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <span className={styles.cardTitleIcon}><Icon name="layer-group" decorative /></span>
          複雜度分析
        </h3>
        <div className={styles.complexityTable}>
          {[
            { label: '時間複雜度（最佳）', value: complexity.timeBest, modifier: styles.rowBest },
            { label: '時間複雜度（平均）', value: complexity.timeAverage, modifier: styles.rowAverage },
            { label: '時間複雜度（最差）', value: complexity.timeWorst, modifier: styles.rowWorst },
            { label: '空間複雜度', value: complexity.space, modifier: styles.rowSpace },
          ].map(({ label, value, modifier }) => (
            <motion.div
              key={label}
              className={`${styles.complexityRow} ${modifier}`}
              variants={rowVariants}
              initial="rest"
              whileHover="hover"
              transition={rowTransition}
            >
              <span className={styles.complexityLabel}>{label}</span>
              <span className={styles.complexityValue}>{value || 'N/A'}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplexityTab;

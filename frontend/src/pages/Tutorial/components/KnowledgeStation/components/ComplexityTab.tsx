import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('tutorial');

  const rows = [
    { rowKey: 'timeBest', labelKey: 'complexityTab.timeBest', value: complexity.timeBest, modifier: styles.rowBest },
    { rowKey: 'timeAverage', labelKey: 'complexityTab.timeAverage', value: complexity.timeAverage, modifier: styles.rowAverage },
    { rowKey: 'timeWorst', labelKey: 'complexityTab.timeWorst', value: complexity.timeWorst, modifier: styles.rowWorst },
    { rowKey: 'space', labelKey: 'complexityTab.space', value: complexity.space, modifier: styles.rowSpace },
  ];

  return (
    <div className={styles.complexityTab}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <span className={styles.cardTitleIcon}><Icon name="layer-group" decorative /></span>
          {t('complexityTab.title')}
        </h3>
        <div className={styles.complexityTable}>
          {rows.map(({ rowKey, labelKey, value, modifier }) => (
            <motion.div
              key={rowKey}
              className={`${styles.complexityRow} ${modifier}`}
              variants={rowVariants}
              initial="rest"
              whileHover="hover"
              transition={rowTransition}
            >
              <span className={styles.complexityLabel}>{t(labelKey)}</span>
              <span className={styles.complexityValue}>{value || 'N/A'}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplexityTab;

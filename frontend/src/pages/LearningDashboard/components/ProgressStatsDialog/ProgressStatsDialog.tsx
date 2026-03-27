import { motion } from 'motion/react';
import styles from './ProgressStatsDialog.module.scss';
import Dialog from '@/shared/components/Dialog';
import Card from '@/shared/components/Card';
import ProgressBar from '@/shared/components/ProgressBar';
import Icon from '@/shared/components/Icon';
import type { ProgressStatsDialogProps } from '@/types';
import { useTranslation } from 'react-i18next';

function ProgressStatsDialog({
  isOpen,
  onClose,
  totalLevels,
  completedLevels,
  totalStars: _totalStars,
  earnedStars,
  completionRate,
  categoryProgress,
}: ProgressStatsDialogProps) {
  const { t } = useTranslation('dashboard');
  const overallPercent = Math.round(completionRate);
  const svgDashArray = `${overallPercent}, 100`;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="學習進度"
      size="sm"
      closeOnEscape
      closeOnOverlayClick
    >
      <div className={styles.content}>
        {/* Hero 卡片 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card hoverable={false} className={styles.heroCard}>
            <div className={styles.heroInner}>
              <div className={styles.heroText}>
                <p className={styles.heroLabel}>總完成度</p>
                <p className={styles.heroPercent}>{overallPercent}%</p>
                <span className={styles.heroBadge}>
                  已完成 {completedLevels} / {totalLevels} 關卡
                </span>
              </div>
              <div className={styles.heroCircle}>
                <svg className={styles.heroSvg} viewBox="0 0 36 36">
                  <path
                    className={styles.svgTrack}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                  />
                  <path
                    className={styles.svgProgress}
                    strokeDasharray={svgDashArray}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <Icon name="star" className={styles.heroStarIcon} />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className={styles.statsGrid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <Icon name="star" />
            </div>
            <p className={styles.statValue}>{earnedStars}</p>
            <p className={styles.statLabel}>獲得星數</p>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <Icon name="check-circle" />
            </div>
            <p className={styles.statValue}>{completedLevels}</p>
            <p className={styles.statLabel}>完成關卡</p>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <Icon name="chart-bar" />
            </div>
            <p className={styles.statValue}>{overallPercent}%</p>
            <p className={styles.statLabel}>整體進度</p>
          </div>
        </motion.div>

        {/* 分類進度列表 */}
        <div className={styles.categorySection}>
          <h3 className={styles.categorySectionTitle}>課程詳情</h3>
          <div className={styles.categoryList}>
            {Object.entries(categoryProgress).map(([category, info], index) => (
              <motion.div
                key={category}
                className={styles.categoryItem}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={styles.categoryHeader}>
                  <div
                    className={styles.categoryIcon}
                    style={{ color: info.colorTheme }}
                  >
                    <Icon name={info.icon ?? "circle"} />
                  </div>
                  <span className={styles.categoryName}>{t(`categories.${category.replace(/-/g, '_')}.name`)}</span>
                  <span className={styles.categoryCount}>
                    {info.completedLevels} / {info.totalLevels}
                  </span>
                </div>
                <ProgressBar
                  value={info.completionRate}
                  max={100}
                  variant="primary"
                  size="sm"
                  color={info.colorTheme}
                />
                {info.isBossCompleted && (
                  <p className={styles.bossCompleted}>
                    <Icon name="crown" />
                    Boss 已完成
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default ProgressStatsDialog;

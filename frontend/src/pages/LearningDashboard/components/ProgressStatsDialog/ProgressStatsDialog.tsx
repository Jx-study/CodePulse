import styles from "./ProgressStatsDialog.module.scss";
import Dialog from "@/shared/components/Dialog";
import ProgressBar from "@/shared/components/ProgressBar";
import type { ProgressStatsDialogProps } from "@/types";

function ProgressStatsDialog({
  isOpen,
  onClose,
  totalLevels,
  completedLevels,
  totalStars,
  earnedStars,
  completionRate,
  categoryProgress,
  categoryColors,
}: ProgressStatsDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="學習進度統計"
      size="sm"
      closeOnEscape
      closeOnOverlayClick
    >
      <div className={styles.content}>
        {/* 完成度進度條 */}
        <div className={styles.statCard}>
          <h3>完成度</h3>
          <ProgressBar
            value={completionRate}
            max={100}
            variant="primary"
            size="md"
            showLabel
            animated
          />
        </div>

        {/* 關卡完成統計 */}
        <div className={styles.statCard}>
          <h3>已完成關卡</h3>
          <p className={styles.statValue}>
            <span className={styles.current}>{completedLevels}</span>
            <span className={styles.separator}>/</span>
            <span className={styles.total}>{totalLevels}</span>
          </p>
          <p className={styles.label}>關卡</p>
        </div>

        {/* 星數統計 */}
        <div className={styles.statCard}>
          <h3>獲得星數</h3>
          <p className={styles.statValue}>
            <span className={styles.current}>{earnedStars}</span>
            <span className={styles.separator}>/</span>
            <span className={styles.total}>{totalStars}</span>
          </p>
          <p className={styles.label}>⭐</p>
        </div>

        {/* 按分類進度 */}
        {Object.entries(categoryProgress).map(([category, info]) => (
          <div key={category} className={styles.statCard}>
            <h3>{info.name}</h3>
            <ProgressBar
              value={info.completionRate}
              max={100}
              variant="primary"
              size="sm"
              showLabel
              color={categoryColors?.[category as keyof typeof categoryColors]}
            />
            <p className={styles.statValue}>
              <span className={styles.current}>{info.completedLevels}</span>
              <span className={styles.separator}>/</span>
              <span className={styles.total}>{info.totalLevels}</span>
            </p>
            {info.isBossCompleted && <p className={styles.bossCompleted}>👑 Boss 已完成</p>}
          </div>
        ))}
      </div>
    </Dialog>
  );
}

export default ProgressStatsDialog;

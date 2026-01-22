import styles from "./ProgressStatsDialog.module.scss";
import Dialog from "@/shared/components/Dialog";
import ProgressBar from "@/shared/components/ProgressBar";

interface ProgressStatsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalLevels: number;
  completedLevels: number;
  totalStars: number;
  earnedStars: number;
  completionRate: number;
}

function ProgressStatsDialog({
  isOpen,
  onClose,
  totalLevels,
  completedLevels,
  totalStars,
  earnedStars,
  completionRate,
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
      </div>
    </Dialog>
  );
}

export default ProgressStatsDialog;

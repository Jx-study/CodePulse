import styles from './PracticeSection.module.scss';
import Button from '@/shared/components/Button';
import StarRating from '@/shared/components/StarRating';
import ProgressBar from '@/shared/components/ProgressBar';
import Badge from '@/shared/components/Badge';
import type { Level } from '@/types';

interface PracticeSectionProps {
  level: Level;
  onStartPractice: () => void;
  onCompleteLevel?: () => void;
  completionPercentage: number;
  bestStars: number;
  attempts: number;
  isLocked: boolean;
}

function PracticeSection({
  level,
  onStartPractice,
  onCompleteLevel,
  completionPercentage,
  bestStars,
  attempts,
  isLocked
}: PracticeSectionProps) {
  return (
    <div className={styles.practiceSection}>
      <h3>練習模式</h3>

      {completionPercentage > 0 && (
        <div className={styles.practiceProgress}>
          <h4>練習進度</h4>
          <ProgressBar
            value={completionPercentage}
            max={100}
            variant="success"
            size="md"
            showLabel
            animated
          />
        </div>
      )}

      {bestStars > 0 && (
        <div className={styles.bestScore}>
          <h4>最佳成績</h4>
          <StarRating
            value={bestStars}
            max={3}
            size="xl"
            icon="emoji"
            readonly
            className={styles.stars}
          />
        </div>
      )}

      <div className={styles.requirements}>
        <h4>通關條件</h4>
        <ul>
          <li>完成所有測試用例</li>
          <li>達到正確率 80% 以上</li>
          <li>獲得 1-3 星評價</li>
        </ul>
      </div>

      {attempts > 0 && (
        <div className={styles.stats}>
          <span className={styles.label}>嘗試次數：</span>
          <span className={styles.value}>{attempts}</span>
        </div>
      )}

      <Button
        variant="ghost"
        onClick={onStartPractice}
        disabled={isLocked}
        className={styles.startPracticeButton}
        fullWidth
      >
        {completionPercentage > 0 ? '重新挑戰' : '開始練習'}
      </Button>

      {onCompleteLevel && (
        <Button
          variant="primary"
          onClick={onCompleteLevel}
          disabled={isLocked || completionPercentage === 100}
          className={styles.startPracticeButton}
          fullWidth
        >
          {completionPercentage === 100 ? '已完成' : '測試：完成關卡'}
        </Button>
      )}

      {isLocked && (
        <p className={styles.lockedHint}>
          完成前一關以解鎖練習模式
        </p>
      )}

      {completionPercentage === 100 && (
        <Badge
          variant="success"
          size="sm"
          icon={<span>✓</span>}
          className={styles.completedBadge}
        >
          已完成練習
        </Badge>
      )}
    </div>
  );
}

export default PracticeSection;

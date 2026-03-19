import styles from './PracticeSection.module.scss';
import Button from '@/shared/components/Button';
import StarRating from '@/shared/components/StarRating';
import Badge from '@/shared/components/Badge';
import type { Level, PrerequisiteConfig } from '@/types';
import Icon from '@/shared/components/Icon/Icon';
import { getLevelById } from '@/services/LevelService';
import { useTranslation } from 'react-i18next';

interface PracticeSectionProps {
  level: Level;
  onStartPractice: () => void;
  onCompleteLevel?: () => void; // 測試用：完成關卡
  bestStars: number;
  attempts: number;
  bestTime: number; // seconds, 0 = not recorded
  isLocked: boolean;
  prerequisiteInfo?: PrerequisiteConfig;
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return '--:--';
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function PracticeSection({
  onStartPractice,
  onCompleteLevel,
  bestStars,
  attempts,
  bestTime,
  isLocked,
  prerequisiteInfo
}: PracticeSectionProps) {
  const { t } = useTranslation('dashboard');
  const isCompleted = bestStars > 0;
  const prerequisiteLevelNames = prerequisiteInfo?.levelIds
    .map(id => {
      const l = getLevelById(id);
      return l ? t(`levels.${l.id.replace(/-/g, '_')}.name`) : id;
    })
    ?? [];

  return (
    <div className={styles.practiceSection}>
      <h3>練習模式</h3>

      <div className={styles.requirements}>
        <h4>通關條件</h4>
        <ul>
          <li>完成所有測試用例</li>
          <li>達到正確率 80% 以上</li>
          <li>獲得 1-3 星評價</li>
        </ul>
      </div>

      {isCompleted && (
        <div className={styles.bestRecord}>
          <StarRating
            value={bestStars}
            max={3}
            size="md"
            icon="emoji"
            readonly
            className={styles.stars}
          />
          <div className={styles.score}>100%</div>
          <div className={styles.divider} />
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <Icon name="stopwatch" />
              <span className={styles.statLabel}>最佳時間</span>
              <span className={styles.statValue}>{formatTime(bestTime)}</span>
            </div>
            <div className={styles.stat}>
              <Icon name="rotate" />
              <span className={styles.statLabel}>嘗試次數</span>
              <span className={styles.statValue}>{attempts} 次</span>
            </div>
          </div>
        </div>
      )}

      <Button
        variant="secondary"
        onClick={onStartPractice}
        disabled={isLocked}
        className={styles.startPracticeButton}
        fullWidth
        iconLeft={<Icon name="code" />}
      >
        {isCompleted ? "重新挑戰" : "開始練習"}
      </Button>

      {onCompleteLevel && !isCompleted && (
        <Button
          variant="primary"
          onClick={onCompleteLevel}
          disabled={isLocked}
          className={styles.startPracticeButton}
          fullWidth
        >
          測試：完成關卡
        </Button>
      )}

      {isLocked && prerequisiteInfo && prerequisiteLevelNames.length > 0 && (
        <p className={styles.lockedHint}>
          {prerequisiteInfo.type === "AND"
            ? `需要先完成：${prerequisiteLevelNames.join('、')}`
            : `完成以下任一關卡即可解鎖：${prerequisiteLevelNames.join('、')}`}
        </p>
      )}

      {isLocked && (!prerequisiteInfo || prerequisiteLevelNames.length === 0) && (
        <p className={styles.lockedHint}>完成前置關卡以解鎖練習模式</p>
      )}

      {isCompleted && (
        <Badge
          variant="success"
          size="sm"
          icon={<Icon name="check" />}
          className={styles.completedBadge}
        >
          已完成練習
        </Badge>
      )}
    </div>
  );
}

export default PracticeSection;

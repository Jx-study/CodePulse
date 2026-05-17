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
  bestStars: number;
  attempts: number;
  bestTime: number; // seconds, 0 = not recorded
  bestScore?: number; // 百分制 0-100，undefined = 尚未練習
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
  bestStars,
  attempts,
  bestTime,
  bestScore,
  isLocked,
  prerequisiteInfo
}: PracticeSectionProps) {
  const { t } = useTranslation('dashboard');
  const isCompleted = bestStars > 0;
  const hasAttempted = attempts > 0;
  const prerequisiteLevelNames = prerequisiteInfo?.levelIds
    .map(id => {
      const l = getLevelById(id);
      return l ? t(`levels.${l.id.replace(/-/g, '_')}.name`) : id;
    })
    ?? [];
  const requirements = t("practiceSection.requirements", { returnObjects: true }) as string[];
  const prerequisiteList = prerequisiteLevelNames.join("、");

  return (
    <div className={styles.practiceSection}>
      <h3>{t("practiceSection.title")}</h3>

      <div className={styles.requirements}>
        <h4>{t("practiceSection.requirementsTitle")}</h4>
        <ul>
          {requirements.map((requirement, index) => (
            <li key={index}>{requirement}</li>
          ))}
        </ul>
      </div>

      {hasAttempted && (
        <div className={styles.bestRecord}>
          <StarRating
            value={bestStars}
            max={3}
            size="md"
            icon="emoji"
            readonly
            className={styles.stars}
          />
          <div className={styles.score}>
            {bestScore !== undefined ? `${bestScore}%` : "--"}
          </div>
          <div className={styles.divider} />
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <Icon name="stopwatch" />
              <span className={styles.statLabel}>{t("practiceSection.bestTime")}</span>
              <span className={styles.statValue}>{formatTime(bestTime)}</span>
            </div>
            <div className={styles.stat}>
              <Icon name="rotate" />
              <span className={styles.statLabel}>{t("practiceSection.attempts")}</span>
              <span className={styles.statValue}>{t("practiceSection.attemptCount", { count: attempts })}</span>
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
        {isCompleted
          ? t("practiceSection.restartButton")
          : hasAttempted
            ? t("practiceSection.continueButton")
            : t("practiceSection.startButton")}
      </Button>

      {isLocked && prerequisiteInfo && prerequisiteLevelNames.length > 0 && (
        <p className={styles.lockedHint}>
          {prerequisiteInfo.type === "AND"
            ? t("practiceSection.lockedAndHint", { levels: prerequisiteList })
            : t("practiceSection.lockedOrHint", { levels: prerequisiteList })}
        </p>
      )}

      {isLocked &&
        (!prerequisiteInfo || prerequisiteLevelNames.length === 0) && (
          <p className={styles.lockedHint}>{t("practiceSection.lockedFallbackHint")}</p>
        )}

      {isCompleted && (
        <Badge
          variant="success"
          size="sm"
          icon={<Icon name="check" />}
          className={styles.completedBadge}
        >
          {t("practiceSection.completedBadge")}
        </Badge>
      )}
    </div>
  );
}

export default PracticeSection;

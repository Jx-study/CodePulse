import styles from './TutorialSection.module.scss';
import Button from '@/shared/components/Button';
import Badge from '@/shared/components/Badge';
import type { Level } from '@/types';
import Icon from '@/shared/components/Icon/Icon';
import { useTranslation } from 'react-i18next';

interface TutorialSectionProps {
  level: Level;
  onStartTutorial: () => void;
  isCompleted: boolean;
  isLocked: boolean;
  suggestedLevelNames?: string[];
}

function TutorialSection({ level, onStartTutorial, isCompleted, isLocked, suggestedLevelNames }: TutorialSectionProps) {
  const { t } = useTranslation('dashboard');
  const levelKey = level.id.replace(/-/g, '_');
  const description = t(`levels.${levelKey}.description`);
  const objectives = t(`levels.${levelKey}.objectives`, { returnObjects: true }) as string[];

  return (
    <div className={styles.tutorialSection}>
      <h3>{t("tutorialSection.title")}</h3>

      <div className={styles.description}>
        <h4>{t("tutorialSection.descriptionTitle")}</h4>
        {description && (
          <p dangerouslySetInnerHTML={{ __html: description }} />
        )}
      </div>

      {objectives && objectives.length > 0 && (
        <div className={styles.objectives}>
          <h4>{t("tutorialSection.objectivesTitle")}</h4>
          <ul>
            {objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
      )}

      {suggestedLevelNames && suggestedLevelNames.length > 0 && (
        <div className={styles.suggested}>
          <h4>{t("tutorialSection.suggestedTitle")}</h4>
          <div className={styles.suggestedBadges}>
            {suggestedLevelNames.map((name, i) => (
              <Badge key={i} variant="danger" size="sm" shape="pill">
                {name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="secondary"
        onClick={onStartTutorial}
        disabled={isLocked}
        className={styles.startTutorialButton}
        fullWidth
        iconLeft={<Icon name="play" />}
      >
        {isCompleted ? t("tutorialSection.restartButton") : t("tutorialSection.startButton")}
      </Button>

      {isLocked && <p className={styles.lockedHint}>{t("tutorialSection.lockedHint")}</p>}

      {isCompleted && (
        <Badge
          variant="success"
          size="sm"
          icon={<Icon name="check" />}
          className={styles.completedBadge}
        >
          {t("tutorialSection.completedBadge")}
        </Badge>
      )}
    </div>
  );
}

export default TutorialSection;

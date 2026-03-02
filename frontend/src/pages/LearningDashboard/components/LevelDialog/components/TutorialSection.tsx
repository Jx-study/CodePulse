import styles from './TutorialSection.module.scss';
import Button from '@/shared/components/Button';
import Badge from '@/shared/components/Badge';
import type { Level } from '@/types';
import Icon from '@/shared/components/Icon/Icon';

interface TutorialSectionProps {
  level: Level;
  onStartTutorial: () => void;
  isCompleted: boolean;
  isLocked: boolean;
}

function TutorialSection({ level, onStartTutorial, isCompleted, isLocked }: TutorialSectionProps) {
  return (
    <div className={styles.tutorialSection}>
      <h3>教學模式</h3>

      <div className={styles.description}>
        <h4>演算法說明</h4>
        {level.description && (
          <p dangerouslySetInnerHTML={{ __html: level.description }} />
        )}
      </div>

      {level.learningObjectives && level.learningObjectives.length > 0 && (
        <div className={styles.objectives}>
          <h4>學習目標</h4>
          <ul>
            {level.learningObjectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
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
        {isCompleted ? "重新學習" : "開始教學"}
      </Button>

      {isLocked && <p className={styles.lockedHint}>此教學尚未解鎖</p>}

      {isCompleted && (
        <Badge
          variant="success"
          size="sm"
          icon={<Icon name="check" />}
          className={styles.completedBadge}
        >
          已完成教學
        </Badge>
      )}
    </div>
  );
}

export default TutorialSection;

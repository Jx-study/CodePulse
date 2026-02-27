import styles from './TutorialSection.module.scss';
import Button from '@/shared/components/Button';
import Badge from '@/shared/components/Badge';
import type { Level } from '@/types';

interface TutorialSectionProps {
  level: Level;
  onStartTutorial: () => void;
  isCompleted: boolean;
  isLocked: boolean;
}

function TutorialSection({ level, onStartTutorial, isCompleted, isLocked }: TutorialSectionProps) {
  const difficultyColors = {
    1: '#4caf50',
    2: '#4caf50',
    3: '#ff9800',
    4: '#f44336',
    5: '#f44336'
  };

  const difficultyLabels = {
    1: '非常簡單',
    2: '簡單',
    3: '中等',
    4: '困難',
    5: '非常困難'
  };

  return (
    <div className={styles.tutorialSection}>
      <h3>教學模式</h3>

      <div className={styles.levelInfo}>
        <div className={styles.infoRow}>
          <span className={styles.label}>難度：</span>
          <span
            className={styles.value}
            style={{ color: difficultyColors[level.difficulty] }}
          >
            {difficultyLabels[level.difficulty]}
          </span>
        </div>
      </div>

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
        variant="ghost"
        onClick={onStartTutorial}
        disabled={isLocked}
        className={styles.startTutorialButton}
        fullWidth
      >
        {isCompleted ? "重新學習" : "開始教學"}
      </Button>

      {isLocked && <p className={styles.lockedHint}>此教學尚未解鎖</p>}

      {isCompleted && (
        <Badge
          variant="success"
          size="sm"
          icon={<span>✓</span>}
          className={styles.completedBadge}
        >
          已完成教學
        </Badge>
      )}
    </div>
  );
}

export default TutorialSection;

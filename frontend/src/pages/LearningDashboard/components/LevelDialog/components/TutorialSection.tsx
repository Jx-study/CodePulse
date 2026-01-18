import styles from './TutorialSection.module.scss';
import Button from '@/shared/components/Button';
import Badge from '@/shared/components/Badge';
import type { Level } from '@/types';

interface TutorialSectionProps {
  level: Level;
  onStartTutorial: () => void;
  isCompleted: boolean;
}

function TutorialSection({ level, onStartTutorial, isCompleted }: TutorialSectionProps) {
  const difficultyColors = {
    easy: '#4caf50',
    medium: '#ff9800',
    hard: '#f44336'
  };

  const difficultyLabels = {
    easy: '簡單',
    medium: '中等',
    hard: '困難'
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

        <div className={styles.infoRow}>
          <span className={styles.label}>預估時間：</span>
          <span className={styles.value}>{level.estimatedTime} 分鐘</span>
        </div>
      </div>

      <div className={styles.description}>
        <h4>演算法說明</h4>
        <p>{level.description}</p>
      </div>

      <div className={styles.objectives}>
        <h4>學習目標</h4>
        <ul>
          {level.learningObjectives.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      </div>

      <Button
        variant="ghost"
        onClick={onStartTutorial}
        className={styles.startTutorialButton}
        fullWidth
      >
        {isCompleted ? '重新學習' : '開始教學'}
      </Button>

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

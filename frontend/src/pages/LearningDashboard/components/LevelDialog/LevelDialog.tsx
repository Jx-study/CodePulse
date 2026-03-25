import TutorialSection from './components/TutorialSection';
import PracticeSection from './components/PracticeSection';
import styles from './LevelDialog.module.scss';
import Dialog from '@/shared/components/Dialog/Dialog';
import Badge from '@/shared/components/Badge';
import type { LevelDialogProps } from '@/types';
import type { BadgeProps } from '@/types';
import { getLevelById } from '@/services/LevelService';
import { useTranslation } from 'react-i18next';

const difficultyVariant: Record<number, BadgeProps['variant']> = {
  1: 'success',
  2: 'success',
  3: 'warning',
  4: 'danger',
  5: 'danger',
};

const difficultyLabel: Record<number, string> = {
  1: '非常簡單',
  2: '簡單',
  3: '中等',
  4: '困難',
  5: '非常困難',
};

function LevelDialog({
  level,
  isOpen,
  onClose,
  onStartTutorial,
  onStartPractice,
  userProgress,
  tutorialLocked,
  practiceLocked,
  prerequisiteInfo
}: LevelDialogProps) {
  const { t } = useTranslation('dashboard');

  const suggestedLevelNames = level.suggestedPrerequisites
    ?.map(id => {
      const l = getLevelById(id);
      return l ? t(`levels.${l.id.replace(/-/g, '_')}.name`) : id;
    })
    ?? [];

  const difficultyBadge = (
    <Badge variant={difficultyVariant[level.difficulty] ?? 'secondary'} size="sm" shape="pill">
      {difficultyLabel[level.difficulty] ?? '未知'}
    </Badge>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`關卡 : ${t(`levels.${level.id.replace(/-/g, '_')}.name`)}`}
      subtitle={difficultyBadge}
      size="lg"
      closeOnOverlayClick={true}
      closeOnEscape={true}
      preventScroll={true}
      className={styles.levelDialog}
      contentClassName={styles.dialogContent}
    >
      <TutorialSection
        level={level}
        onStartTutorial={onStartTutorial}
        isCompleted={userProgress.teachingCompleted === true}
        isLocked={tutorialLocked}
        suggestedLevelNames={suggestedLevelNames}
      />
      <PracticeSection
        level={level}
        onStartPractice={onStartPractice}
        bestStars={userProgress.stars}
        attempts={userProgress.attempts}
        bestTime={userProgress.bestTime}
        bestScore={userProgress.bestScore}
        isLocked={practiceLocked}
        prerequisiteInfo={prerequisiteInfo}
      />
    </Dialog>
  );
}

export default LevelDialog;

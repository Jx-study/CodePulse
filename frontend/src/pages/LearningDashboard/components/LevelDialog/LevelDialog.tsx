import TutorialSection from './components/TutorialSection';
import PracticeSection from './components/PracticeSection';
import styles from './LevelDialog.module.scss';
import Dialog from '@/shared/components/Dialog/Dialog';
import type { LevelDialogProps } from '@/types';

function LevelDialog({
  level,
  isOpen,
  onClose,
  onStartTutorial,
  onStartPractice,
  onCompleteLevel,
  userProgress,
  tutorialLocked,
  practiceLocked,
  prerequisiteInfo
}: LevelDialogProps) {
  const completionPercentage = userProgress.status === 'completed' ? 100 : 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`關卡 : ${level.name}`}
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
        isCompleted={userProgress.status === "completed"}
        isLocked={tutorialLocked}
      />
      <PracticeSection
        level={level}
        onStartPractice={onStartPractice}
        onCompleteLevel={onCompleteLevel}
        completionPercentage={completionPercentage}
        bestStars={userProgress.stars}
        attempts={userProgress.attempts}
        isLocked={practiceLocked}
        prerequisiteInfo={prerequisiteInfo}
      />
    </Dialog>
  );
}

export default LevelDialog;

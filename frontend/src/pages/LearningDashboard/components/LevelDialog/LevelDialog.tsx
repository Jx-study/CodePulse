import React from 'react';
import TutorialSection from './components/TutorialSection';
import PracticeSection from './components/PracticeSection';
import styles from './LevelDialog.module.scss';
import Dialog from '@/shared/components/Dialog/Dialog';
import type { Level, LevelProgress } from '@/types';

interface LevelDialogProps {
  level: Level;
  isOpen: boolean;
  onClose: () => void;
  onStartTutorial: () => void;
  onStartPractice: () => void;
  userProgress?: LevelProgress;
  isLocked: boolean;
}

function LevelDialog({
  level,
  isOpen,
  onClose,
  onStartTutorial,
  onStartPractice,
  userProgress,
  isLocked
}: LevelDialogProps) {
  const completionPercentage = userProgress?.status === 'completed' ? 100 : 0;

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
        isCompleted={userProgress?.status === "completed"}
      />
      <PracticeSection
        level={level}
        onStartPractice={onStartPractice}
        completionPercentage={completionPercentage}
        bestStars={userProgress?.stars ?? 0}
        attempts={userProgress?.attempts ?? 0}
        isLocked={isLocked}
      />
    </Dialog>
  );
}

export default LevelDialog;

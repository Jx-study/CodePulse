import React, { useEffect } from 'react';
import TutorialSection from './components/TutorialSection';
import PracticeSection from './components/PracticeSection';
import styles from './LevelDialog.module.scss';
import Icon from '@/shared/components/Icon';
import Button from '@/shared/components/Button';
import type { Level, LevelProgress } from '@/types';

interface LevelDialogProps {
  level: Level;
  isOpen: boolean;
  onClose: () => void;
  onStartTutorial: () => void;
  onStartPractice: () => void;
  userProgress: LevelProgress;
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const completionPercentage = userProgress.status === 'completed' ? 100 : 0;

  return (
    <>
      <div className={styles.overlay} onClick={handleOverlayClick} />
      <div className={styles.levelDialog}>
        <div className={styles.dialogHeader}>
          <h2>
            關卡 {level.levelNumber}: {level.name}
          </h2>
          <Button
            variant="icon"
            onClick={onClose}
            aria-label="Close"
            className={styles.closeButton}
            iconLeft={<Icon name="times" size="lg" />}
          />
        </div>

        <div className={styles.dialogContent}>
          <TutorialSection
            level={level}
            onStartTutorial={onStartTutorial}
            isCompleted={userProgress.status === "completed"}
          />

          <PracticeSection
            level={level}
            onStartPractice={onStartPractice}
            completionPercentage={completionPercentage}
            bestStars={userProgress.stars}
            attempts={userProgress.attempts}
            isLocked={isLocked}
          />
        </div>
      </div>
    </>
  );
}

export default LevelDialog;

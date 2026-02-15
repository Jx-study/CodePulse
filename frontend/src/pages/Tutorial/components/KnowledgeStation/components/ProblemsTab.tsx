import React from 'react';
import DerivedContent from '@/shared/components/DerivedContent';
import type { ProblemReference } from "@/types";
import styles from './ProblemsTab.module.scss';

interface ProblemsTabProps {
  relatedProblems?: ProblemReference[];
}

const ProblemsTab: React.FC<ProblemsTabProps> = ({ relatedProblems }) => {
  if (!relatedProblems || relatedProblems.length === 0) {
    return (
      <div className={styles.problemsTab}>
        <div className={styles.emptyState}>
          <p>暫無相關題目</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.problemsTab}>
      <DerivedContent problems={relatedProblems} />
    </div>
  );
};

export default ProblemsTab;

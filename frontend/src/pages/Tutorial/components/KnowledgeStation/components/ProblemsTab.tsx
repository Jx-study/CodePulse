import React from 'react';
import { useTranslation } from 'react-i18next';
import DerivedContent from '@/shared/components/DerivedContent';
import type { ProblemReference } from "@/types";
import styles from './ProblemsTab.module.scss';

interface ProblemsTabProps {
  relatedProblems?: ProblemReference[];
}

const ProblemsTab: React.FC<ProblemsTabProps> = ({ relatedProblems }) => {
  const { t } = useTranslation('tutorial');

  if (!relatedProblems || relatedProblems.length === 0) {
    return (
      <div className={styles.problemsTab}>
        <div className={styles.emptyState}>
          <p>{t('problemsTab.empty')}</p>
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

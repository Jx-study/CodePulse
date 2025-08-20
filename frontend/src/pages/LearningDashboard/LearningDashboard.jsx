import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LearningDashboard.module.scss';

function LearningDashboard() {
  const { t } = useTranslation();

  return (
    <div className={styles.learningDashboard}>
      <div className="container">
        <h1 className="section-title">{t('learningDashboard')}</h1>
        <div className={styles.content}>
          <p>{t('learningDashboardComingSoon')}</p>
        </div>
      </div>
    </div>
  );
}

export default LearningDashboard;
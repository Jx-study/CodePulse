import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Tutorial.module.scss';

function Tutorial() {
  const { t } = useTranslation();

  return (
    <div className={styles.tutorial}>
      <div className="container">
        <h1 className="section-title">{t('tutorial')}</h1>
        <div className={styles.content}>
          <p>{t('tutorialComingSoon')}</p>
        </div>
      </div>
    </div>
  );
}

export default Tutorial;
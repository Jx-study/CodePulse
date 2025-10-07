import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './About.module.scss';

function About() {
  const { t } = useTranslation();

  return (
    <div className={styles.about}>
      <div className="container">
        <h1 className="section-title">{t('aboutUs')}</h1>
        <div className={styles.content}>
          <p>{t('aboutComingSoon')}</p>
        </div>
      </div>
    </div>
  );
}

export default About;
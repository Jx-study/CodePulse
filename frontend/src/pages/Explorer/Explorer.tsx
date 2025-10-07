import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Explorer.module.scss';

function Explorer() {
  const { t } = useTranslation();

  return (
    <div className={styles.explorer}>
      <div className="container">
        <h1 className="section-title">{t('explorer')}</h1>
        <div className={styles.content}>
          <p>{t('explorerComingSoon')}</p>
        </div>
      </div>
    </div>
  );
}

export default Explorer;
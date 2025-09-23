import React from 'react';
import styles from './Footer.module.scss';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h2>CodePulse</h2>
          <p>{t('footer.tagline')}</p>
        </div>

        
        <div className={styles.footerSection}>
          <h4>{t('footer.resources.title')}</h4>
          <ul>
            <li><a href="#">{t('footer.resources.tutorial')}</a></li>
            <li><a href="#">{t('footer.resources.examples')}</a></li>
            <li><a href="#">{t('footer.resources.faq')}</a></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h4>{t('footer.contact.title')}</h4>
          <ul>
            <li><a href="#">{t('footer.contact.github')}</a></li>
            <li><a href="#">{t('footer.contact.support')}</a></li>
            <li><a href="#">{t('footer.contact.feedback')}</a></li>
          </ul>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <p>{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}

export default Footer;

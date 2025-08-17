import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './NavigationBar.module.scss';
import logo from '/images/codePulse_logo.png';

function NavigationBar() {
  const { t } = useTranslation();

  return (
    <div className={styles.navigationBar}>
      <div className={styles.logo}>
        <Link to="/"><img src={logo} alt="logo" /></Link>
      </div>
      
      <ul className={styles.navMenu}>
        <li><Link to="/" className={styles.active}>{t('home')}</Link></li>
        <li><Link to="/analysis">{t('features')}</Link></li>
        <li><a href="#demo">{t('demo')}</a></li>
        <li><a href="#docs">{t('docs')}</a></li>
        <li><a href="#about">{t('about')}</a></li>
      </ul>
    </div>
  );
}

export default NavigationBar;
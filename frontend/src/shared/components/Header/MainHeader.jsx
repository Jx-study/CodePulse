import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.scss';
import NavigationBar from '../NavigationBar/NavigationBar';
import LanguageSetting from '../../../modules/platform/components/LanguageSetting/LanguageSetting';
import UserStatus from '../../../modules/user/components/UserStatus/UserStatus';
import logo from '/images/codePulse_logo.png';

function MainHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <Link to="/">
            <img src={logo} alt="CodePulse Logo" />
          </Link>
        </div>
        
        <NavigationBar />
        
        <div className={styles.rightSection}>
          <LanguageSetting />
          <UserStatus />
        </div>
      </div>
    </header>
  );
} 

export default MainHeader;

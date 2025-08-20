import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.scss';
import NavigationBar from '../UI/NavigationBar/NavigationBar';
import LanguageSetting from '../UI/LanguageSetting/LanguageSetting';
import UserStatus from '../UI/UserStatus/UserStatus';
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

import React from 'react';
import styles from './Header.module.scss';
import NavigationBar from '../UI/NavigationBar/NavigationBar';
import LanguageSetting from '../UI/LanguageSetting/LanguageSetting';
import UserStatus from '../UI/UserStatus/UserStatus';

function MainHeader() {
  return (
    <header className={styles.header}>
      <nav className={styles.navContainer}>
        <NavigationBar />
        
        <div className={styles.rightSection}>
          <LanguageSetting />
          <UserStatus />
        </div>
      </nav>
    </header>
  );
} 

export default MainHeader;

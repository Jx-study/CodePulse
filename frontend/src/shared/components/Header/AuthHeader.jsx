import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.scss';
import logo from '/images/codePulse_logo.png';

function AuthHeader() {
  return (
    <header className={styles.header}>
    {/* 使用特定的class-scss */}
    {/* <header className={`${styles.header} ${styles['header-auth']}`}> */}
      <nav className={styles.navContainer}>
        <div className={styles.logo}>
          <Link to="/"><img src={logo} alt="logo" /></Link>
        </div>
      </nav>
    </header>
  );
}

export default AuthHeader;

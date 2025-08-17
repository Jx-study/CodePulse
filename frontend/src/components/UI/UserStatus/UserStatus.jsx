import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './UserStatus.module.scss';

function UserStatus() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 後續整合真實登入狀態
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    // 後續實現登出邏輯
    setIsLoggedIn(false);
    setShowUserMenu(false);
  };

  if (isLoggedIn) {
    return (
      <div className={styles.userStatus}>
        <div className={styles.userAvatar} onClick={handleUserMenuToggle}>
          <img src="/images/default-avatar.png" alt="User Avatar" />
        </div>
        
        {showUserMenu && (
          <div className={styles.userMenu}>
            <ul>
              <li><button>Setting Panel</button></li>
              <li><button>Get Help</button></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.userStatus}>
      <div className={styles.authButtons}>
        <Link to="/auth" className={styles.btnLogin}>{t('login')}</Link>
        <Link to="/auth" className={styles.btnRegister}>{t('register')}</Link>
      </div>
    </div>
  );
}

export default UserStatus;
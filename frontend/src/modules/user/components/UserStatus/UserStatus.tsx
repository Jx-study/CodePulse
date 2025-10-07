import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './UserStatus.module.scss';
import SettingPanel from '../SettingPanel/SettingPanel';

function UserStatus() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // TODO: 從後端獲取真實登入狀態
  // TODO: 添加用戶狀態檢查邏輯
  // useEffect(() => {
  //   const checkUserStatus = async () => {
  //     try {
  //       const response = await fetch('/api/user/status', {
  //         credentials: 'include'  // 發送 cookies
  //       });
  //       if (response.ok) {
  //         const userData = await response.json();
  //         setIsLoggedIn(userData.isAuthenticated);
  //       }
  //     } catch (error) {
  //       console.error('檢查用戶狀態失敗:', error);
  //       setIsLoggedIn(false);
  //     }
  //   };
  //   checkUserStatus();
  // }, []);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingPanel, setShowSettingPanel] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 處理點擊外部關閉菜單
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setShowSettingPanel(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showUserMenu]);

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleSettingPanelOpen = () => {
    setShowSettingPanel(true);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    // TODO: 調用後端登出 API - POST /api/user/logout
    setIsLoggedIn(false);
    setShowUserMenu(false);
    // TODO: 清除本地存儲的用戶數據
  };

  if (isLoggedIn) {
    return (
      <div className={styles.userStatus} ref={menuRef}>
        <div className={styles.userAvatar} onClick={handleUserMenuToggle}>
          <img src="/images/default-avatar.png" alt="User Avatar" />
        </div>
        
        {showUserMenu && (
          <div className={styles.userMenu}>
            <ul>
              <li>
                <button onClick={handleSettingPanelOpen}>
                  <span className={styles.menuIcon}>⚙️</span>
                  {t('settingPanel')}
                </button>
              </li>
              <li>
                <button>
                  <span className={styles.menuIcon}>❓</span>
                  {t('getHelp')}
                </button>
              </li>
              <li>
                <button onClick={handleLogout}>
                  <span className={styles.menuIcon}>🚪</span>
                  {t('logout')}
                </button>
              </li>
            </ul>
          </div>
        )}
        
        <SettingPanel 
          isOpen={showSettingPanel} 
          onClose={() => setShowSettingPanel(false)} 
        />
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
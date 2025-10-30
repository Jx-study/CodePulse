import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './UserStatus.module.scss';
import SettingPanel from '../SettingPanel/SettingPanel';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { Icon } from '../../../../shared/components/Icon';
import Button from '../../../../shared/components/Button/Button';

function UserStatus() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
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

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('登出失敗:', error);
      setShowUserMenu(false);
    }
  };

  // 提取用戶名第一個字母
  const getAvatarLetter = (username: string): string => {
    return username?.charAt(0).toUpperCase() || '?';
  };

  // 根據用戶名生成穩定的背景顏色
  const getAvatarColor = (username: string): string => {
    const colors = [
      '#3b82f6', // 藍色
      '#10b981', // 綠色
      '#8b5cf6', // 紫色
      '#f59e0b', // 橙色
      '#ef4444', // 紅色
      '#06b6d4', // 青色
      '#ec4899', // 粉色
      '#6366f1'  // 靛色
    ];

    // 簡單 hash 算法：計算字串 charCode 總和
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash += username.charCodeAt(i);
    }

    return colors[hash % colors.length];
  };

  if (isAuthenticated) {
    return (
      <div className={styles.userStatus} ref={menuRef}>
        <div
          className={styles.userAvatar}
          onClick={handleUserMenuToggle}
          style={{ backgroundColor: getAvatarColor(user?.username || '') }}
          title={user?.username || ''}
        >
          <span className={styles.avatarLetter}>
            {getAvatarLetter(user?.username || '')}
          </span>
        </div>
        
        {showUserMenu && (
          <div className={styles.userMenu}>
            <ul>
              <li>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSettingPanelOpen}
                  iconLeft={<Icon name="cog" size="sm" />}
                >
                  {t('settingPanel')}
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  size="sm"
                  iconLeft={<Icon name="question-circle" size="sm" />}
                >
                  {t('getHelp')}
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  iconLeft={<Icon name="sign-out-alt" size="sm" />}
                >
                  {t('logout')}
                </Button>
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
        <Button variant="secondary" size="sm" as={Link} to="/auth" className={styles.btnLogin}>
          {t('login')}
        </Button>
        <Button variant="primary" size="sm" as={Link} to="/auth">
          {t('register')}
        </Button>
      </div>
    </div>
  );
}

export default UserStatus;
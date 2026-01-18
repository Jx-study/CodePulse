import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './UserStatus.module.scss';
import SettingPanel from '../SettingPanel/SettingPanel';
import { useAuth } from '@/shared/contexts/AuthContext';
import Button from '@/shared/components/Button';
import Avatar from '@/shared/components/Avatar';
import Icon from '@/shared/components/Icon';

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

  if (isAuthenticated) {
    return (
      <div className={styles.userStatus} ref={menuRef}>
        <Avatar
          username={user?.username || ''}
          size="md"
          colorScheme="auto"
          onClick={handleUserMenuToggle}
          className={styles.userAvatar}
          showBorder
        />
        
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
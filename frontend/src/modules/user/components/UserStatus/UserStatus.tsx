import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './UserStatus.module.scss';
import SettingPanel from '../SettingPanel/SettingPanel';
import { useAuth } from '@/shared/contexts/AuthContext';
import Button from '@/shared/components/Button';
import Avatar from '@/shared/components/Avatar';
import Icon from '@/shared/components/Icon';
import Dropdown from '@/shared/components/Dropdown';

function UserStatus() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const [showSettingPanel, setShowSettingPanel] = useState(false);

  const handleSettingPanelOpen = () => {
    setShowSettingPanel(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  // 定義下拉菜單項目
  const menuItems = [
    {
      key: 'settings',
      label: t('settingPanel'),
      icon: <Icon name="cog" size="sm" />,
      onClick: handleSettingPanelOpen,
    },
    {
      key: 'help',
      label: t('getHelp'),
      icon: <Icon name="question-circle" size="sm" />,
      onClick: () => {
        // TODO: 實作幫助功能
      },
    },
    {
      key: 'divider-1',
      label: '',
      divider: true,
    },
    {
      key: 'logout',
      label: t('logout'),
      icon: <Icon name="sign-out-alt" size="sm" />,
      onClick: handleLogout,
    },
  ];

  if (isAuthenticated) {
    return (
      <div className={styles.userStatus}>
        <Dropdown
          trigger={
            <Avatar
              username={user?.username || ''}
              size="md"
              colorScheme="auto"
              className={styles.userAvatar}
              showBorder
            />
          }
          items={menuItems}
          placement="bottom-right"
          aria-label={t('userMenu')}
        />

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
        <Link to="/auth">
          <Button variant="secondary" size="sm" className={styles.btnLogin}>
            {t("login")}
          </Button>
        </Link>
        <Link to="/auth" className={styles.btnRegister}>
          <Button variant="primary" size="sm">
            {t("register")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default UserStatus;
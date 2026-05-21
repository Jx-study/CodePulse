import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './UserStatus.module.scss';
import SettingPanel from '../SettingPanel/SettingPanel';
import { useAuth } from '@/shared/contexts/AuthContext';
import Button from '@/shared/components/Button';
import Avatar from '@/shared/components/Avatar';
import Icon from '@/shared/components/Icon';
import Dropdown from '@/shared/components/Dropdown';
import { toast } from '@/shared/components/Toast';

function UserStatus() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const [showSettingPanel, setShowSettingPanel] = useState(false);
  const navigate = useNavigate();

  const handleSettingPanelOpen = () => {
    setShowSettingPanel(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      // TODO: sentry
      console.error('Logout failed:', error);
      toast.error(t('logoutError'));
    }
  };

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
      icon: <Icon name="circle-question" size="sm" />,
      onClick: () => navigate('/faq'),
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
              src={user?.avatar_url}
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
        <Button
          variant="secondary"
          size="sm"
          className={styles.btnLogin}
          onClick={() => navigate('/auth?tab=login')}
        >
          {t("login")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          className={styles.btnRegister}
          onClick={() => navigate('/auth?tab=signup')}
        >
          {t("register")}
        </Button>
      </div>
    </div>
  );
}

export default UserStatus;

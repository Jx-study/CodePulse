import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './SettingPanel.module.scss';
import { Icon } from '../../../../shared/components/Icon';
import Button from '../../../../shared/components/Button/Button';

function SettingPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.settingPanel}>
        <div className={styles.header}>
          <h2>{t('settingPanel')}</h2>
          <Button variant="icon" onClick={onClose} aria-label="關閉">
            <Icon name="times" size="lg" />
          </Button>
        </div>

        <div className={styles.content}>
          <div className={styles.sidebar}>
            <nav className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <span className={styles.tabIcon}>
                  <Icon name="user" size="sm" />
                </span>
                {t('profile')}
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'account' ? styles.active : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <span className={styles.tabIcon}>
                  <Icon name="cog" size="sm" />
                </span>
                {t('accountSetting')}
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'appearance' ? styles.active : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                <span className={styles.tabIcon}>
                  <Icon name="palette" size="sm" />
                </span>
                {t('appearance')}
              </button>
            </nav>
          </div>

          <div className={styles.main}>
            {activeTab === 'profile' && (
              <div className={styles.section}>
                <h3>{t('profile')}</h3>
                <div className={styles.field}>
                  <label>{t('username')}</label>
                  <input type="text" placeholder="User Name" />
                  {/* TODO: 從後端獲取用戶名稱 - GET /api/user/profile */}
                </div>
                <div className={styles.field}>
                  <label>{t('email')}</label>
                  <input type="email" placeholder="user@example.com" />
                  {/* TODO: 從後端獲取郵箱 - GET /api/user/profile */}
                </div>
                <div className={styles.field}>
                  <label>{t('avatar')}</label>
                  <div className={styles.avatarUpload}>
                    <img src="/images/default-avatar.png" alt="Avatar" />
                    <button>{t('changeAvatar')}</button>
                    {/* TODO: 實作頭像上傳 - POST /api/user/avatar */}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className={styles.section}>
                <h3>{t('accountSetting')}</h3>
                <div className={styles.field}>
                  <label>{t('changePassword')}</label>
                  <input type="password" placeholder={t('currentPassword')} />
                  <input type="password" placeholder={t('newPassword')} />
                  <input type="password" placeholder={t('confirmPassword')} />
                  {/* TODO: 實作密碼修改 - PUT /api/user/password */}
                </div>
                <div className={styles.field}>
                  <label>{t('notificationSettings')}</label>
                  <div className={styles.switchGroup}>
                    <div className={styles.switchItem}>
                      <span>{t('emailNotifications')}</span>
                      <input type="checkbox" />
                    </div>
                    <div className={styles.switchItem}>
                      <span>{t('pushNotifications')}</span>
                      <input type="checkbox" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className={styles.section}>
                <h3>{t('appearance')}</h3>
                <div className={styles.field}>
                  <label>{t('theme')}</label>
                  <div className={styles.themeSelector}>
                    <button className={styles.themeOption}>
                      <span className={styles.themePreview} style={{background: '#ffffff'}}></span>
                      {t('lightMode')}
                    </button>
                    <button className={styles.themeOption}>
                      <span className={styles.themePreview} style={{background: '#1a1a1a'}}></span>
                      {t('darkMode')}
                    </button>
                    <button className={styles.themeOption}>
                      <span className={styles.themePreview} style={{background: 'linear-gradient(45deg, #ffffff, #1a1a1a)'}}></span>
                      {t('systemDefault')}
                    </button>
                  </div>
                </div>
                <div className={styles.field}>
                  <label>{t('fontSize')}</label>
                  <select>
                    <option value="small">{t('small')}</option>
                    <option value="medium" selected>{t('medium')}</option>
                    <option value="large">{t('large')}</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary">
            {t('saveChanges')}
            {/* TODO: 保存設定到後端 - PUT /api/user/settings */}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SettingPanel;
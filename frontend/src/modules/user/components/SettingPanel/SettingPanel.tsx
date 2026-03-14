import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SettingPanel.module.scss";
import Icon from "@/shared/components/Icon";
import Button from "@/shared/components/Button";
import Switch from "@/shared/components/Switch/Switch";
import Dialog from "@/shared/components/Dialog/Dialog";
import Avatar from "@/shared/components/Avatar";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useTheme } from "@/shared/contexts/ThemeContext";
import { userService } from "@/services/userService";

function SettingPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  // Profile editable state
  const [displayName, setDisplayName] = useState(user?.display_name ?? '');

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    updateUser({ theme: newTheme });
    userService.updateProfile({ theme: newTheme }).catch(err => {
      console.error('Theme sync failed:', err);
    });
  };

  // Avatar preview state
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(t("avatarFormatError", "請上傳 JPG、PNG、WebP 或 GIF 格式"));
      return;
    }
    if (file.size > MAX_SIZE) {
      alert(t("avatarSizeError", "檔案大小不可超過 5MB"));
      return;
    }

    setPendingAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const patch: Parameters<typeof userService.updateProfile>[0] = {};

      if (displayName !== user?.display_name) patch.display_name = displayName;

      if (pendingAvatarFile) {
        const url = await userService.uploadAvatar(pendingAvatarFile);
        patch.avatar_url = url;
      }

      if (Object.keys(patch).length > 0) {
        await userService.updateProfile(patch);
        updateUser(patch);
      }

      setPendingAvatarFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      alert(t("saveError", "儲存失敗，請稍後再試"));
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        {t("cancel")}
      </Button>
      <Button variant="primary" onClick={handleSave} disabled={saving}>
        {saving ? t("saving", "儲存中...") : t("saveChanges")}
      </Button>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t("settingPanel")}
      size="lg"
      footer={footer}
      closeOnOverlayClick={true}
      closeOnEscape={true}
      preventScroll={true}
      className={styles.settingDialog}
    >
      <div className={styles.content}>
          <div className={styles.sidebar}>
            <nav className={styles.tabs}>
              <Button
                variant="ghost"
                className={`${styles.tab} ${activeTab === "profile" ? styles.active : ""}`}
                onClick={() => setActiveTab("profile")}
                iconLeft={<Icon name="user" size="sm" />}
              >
                {t("profile")}
              </Button>
              <Button
                variant="ghost"
                className={`${styles.tab} ${activeTab === "account" ? styles.active : ""}`}
                onClick={() => setActiveTab("account")}
                iconLeft={<Icon name="cog" size="sm" />}
              >
                {t("accountSetting")}
              </Button>
              <Button
                variant="ghost"
                className={`${styles.tab} ${activeTab === "appearance" ? styles.active : ""}`}
                onClick={() => setActiveTab("appearance")}
                iconLeft={<Icon name="palette" size="sm" />}
              >
                {t("appearance")}
              </Button>
            </nav>
          </div>

          <div className={styles.main}>
            {activeTab === "profile" && (
              <div className={styles.section}>
                <h3>{t("profile")}</h3>
                <div className={styles.field}>
                  <label>{t("username")}</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label>{t("email")}</label>
                  <input type="email" value={user?.email ?? ''} readOnly />
                </div>
                <div className={styles.field}>
                  <label>{t("avatar")}</label>
                  <div className={styles.avatarUpload}>
                    <Avatar
                      src={previewUrl ?? user?.avatar_url}
                      username={user?.display_name ?? ''}
                      size="lg"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {t("changeAvatar")}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      hidden
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className={styles.section}>
                <h3>{t("accountSetting")}</h3>
                <div className={styles.field}>
                  <label>{t("changePassword")}</label>
                  <input type="password" placeholder={t("currentPassword")} />
                  <input type="password" placeholder={t("newPassword")} />
                  <input type="password" placeholder={t("confirmPassword")} />
                  {/* TODO: 實作密碼修改 - PUT /api/user/password */}
                </div>
                <div className={styles.field}>
                  <label>{t("notificationSettings")}</label>
                  <div className={styles.switchGroup}>
                    <Switch
                      label={t("emailNotifications")}
                      labelPosition="left"
                    />
                    <Switch
                      label={t("pushNotifications")}
                      labelPosition="left"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className={styles.section}>
                <h3>{t("appearance")}</h3>
                <div className={styles.field}>
                  <label>{t("theme")}</label>
                  <div className={styles.themeSelector}>
                    <Button
                      variant="ghost"
                      className={`${styles.themeOption} ${theme === 'light' ? styles.active : ''}`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <span className={styles.themePreview} style={{ background: "#ffffff" }}></span>
                      {t("lightMode")}
                    </Button>
                    <Button
                      variant="ghost"
                      className={`${styles.themeOption} ${theme === 'dark' ? styles.active : ''}`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <span className={styles.themePreview} style={{ background: "#1a1a1a" }}></span>
                      {t("darkMode")}
                    </Button>
                    <Button
                      variant="ghost"
                      className={`${styles.themeOption} ${theme === 'system' ? styles.active : ''}`}
                      onClick={() => handleThemeChange('system')}
                    >
                      <span className={styles.themePreview} style={{ background: "linear-gradient(45deg, #ffffff, #1a1a1a)" }}></span>
                      {t("systemDefault")}
                    </Button>
                  </div>
                </div>
                <div className={styles.field}>
                  <label>{t("fontSize")}</label>
                  <select defaultValue="medium">
                    <option value="small">{t("small")}</option>
                    <option value="medium">{t("medium")}</option>
                    <option value="large">{t("large")}</option>
                  </select>
                </div>
              </div>
            )}
          </div>
      </div>
    </Dialog>
  );
}

export default SettingPanel;

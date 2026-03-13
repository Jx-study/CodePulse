import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SettingPanel.module.scss";
import Icon from "@/shared/components/Icon";
import Button from "@/shared/components/Button";
import Switch from "@/shared/components/Switch/Switch";
import Dialog from "@/shared/components/Dialog/Dialog";
import Avatar from "@/shared/components/Avatar";
import { useAuth } from "@/shared/contexts/AuthContext";
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
  const [activeTab, setActiveTab] = useState("profile");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true);
    try {
      const url = await userService.uploadAvatar(file);
      await userService.updateProfile({ avatar_url: url });
      updateUser({ avatar_url: url });
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert(t("avatarUploadError", "頭像上傳失敗，請稍後再試"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        {t("cancel")}
      </Button>
      <Button variant="primary">
        {t("saveChanges")}
        {/* TODO: 保存設定到後端 - PUT /api/user/settings */}
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
                  <input type="text" value={user?.display_name ?? ''} readOnly />
                </div>
                <div className={styles.field}>
                  <label>{t("email")}</label>
                  <input type="email" value={user?.email ?? ''} readOnly />
                </div>
                <div className={styles.field}>
                  <label>{t("avatar")}</label>
                  <div className={styles.avatarUpload}>
                    <Avatar
                      src={user?.avatar_url}
                      username={user?.display_name ?? ''}
                      size="lg"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? t("uploading", "上傳中...") : t("changeAvatar")}
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
                    <Button variant="ghost" className={styles.themeOption}>
                      <span
                        className={styles.themePreview}
                        style={{ background: "#ffffff" }}
                      ></span>
                      {t("lightMode")}
                    </Button>
                    <Button variant="ghost" className={styles.themeOption}>
                      <span
                        className={styles.themePreview}
                        style={{ background: "#1a1a1a" }}
                      ></span>
                      {t("darkMode")}
                    </Button>
                    <Button variant="ghost" className={styles.themeOption}>
                      <span
                        className={styles.themePreview}
                        style={{
                          background:
                            "linear-gradient(45deg, #ffffff, #1a1a1a)",
                        }}
                      ></span>
                      {t("systemDefault")}
                    </Button>
                  </div>
                </div>
                <div className={styles.field}>
                  <label>{t("fontSize")}</label>
                  <select>
                    <option value="small">{t("small")}</option>
                    <option value="medium" selected>
                      {t("medium")}
                    </option>
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

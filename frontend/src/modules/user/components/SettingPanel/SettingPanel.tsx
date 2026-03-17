import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SettingPanel.module.scss";
import Icon from "@/shared/components/Icon";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import FormItem from "@/shared/components/FormItem";
import Dialog from "@/shared/components/Dialog";
import Tabs from "@/shared/components/Tabs";
import Avatar from "@/shared/components/Avatar";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useTheme } from "@/shared/contexts/ThemeContext";
import { userService } from "@/services/userService";
import type { TabItem } from "@/types";

// ─── Password strength ─────────────────────────────────────────────────────
const getPasswordStrength = (pw: string): 0 | 1 | 2 | 3 => {
  if (!pw) return 0;
  if (pw.length < 6) return 1;
  if (/[a-zA-Z]/.test(pw) && /[0-9]/.test(pw)) return 3;
  return 2;
};

// ─── Component ────────────────────────────────────────────────────────────
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

  // ── Profile ────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      console.error("Save failed:", err);
      alert(t("saveError", "儲存失敗，請稍後再試"));
    } finally {
      setSaving(false);
    }
  };

  // ── Theme ──────────────────────────────────────────────────────────────
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    updateUser({ theme: newTheme });
    userService.updateProfile({ theme: newTheme }).catch((err) => {
      console.error("Theme sync failed:", err);
    });
  };

  // ── Username copy ──────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false);
  const handleCopyUsername = () => {
    navigator.clipboard.writeText(user?.username ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Password change ────────────────────────────────────────────────────
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t("fillAllFields", "請填寫所有欄位"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordMismatch", "新密碼與確認密碼不符"));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t("passwordTooShort", "密碼至少需要 6 個字元"));
      return;
    }
    setPasswordSaving(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: unknown) {
      const e = err as { error_code?: string };
      if (e.error_code === "WRONG_PASSWORD") {
        setPasswordError(t("wrongPassword", "目前密碼錯誤"));
      } else {
        setPasswordError(t("saveError", "儲存失敗，請稍後再試"));
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const pwStrength = getPasswordStrength(newPassword);

  // ─── Tab content ──────────────────────────────────────────────────────
  const profileTab = (
    <div className={styles.tabContent}>
      {/* Avatar */}
      <div className={styles.avatarSection}>
        <div
          className={styles.avatarWrapper}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          aria-label={t("changeAvatar", "更換頭像")}
        >
          <Avatar
            src={previewUrl ?? user?.avatar_url}
            username={user?.display_name ?? ""}
            size="lg"
            className={styles.avatar}
          />
          <div className={styles.avatarOverlay}>
            <Icon name="camera" size="sm" />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={handleAvatarChange}
        />
      </div>

      {/* Display Name */}
      <FormItem label={t("displayName", "顯示名稱")} htmlFor="displayName">
        <Input
          name="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </FormItem>

      {/* Username (readonly) */}
      <FormItem
        label={t("username", "使用者名稱")}
        htmlFor="username"
        helperText={t("usernameHelper", "唯一識別碼，目前不可修改")}
      >
        <div className={styles.inputGroup}>
          <span className={styles.inputPrefix}>@</span>
          <Input
            name="username"
            type="text"
            value={user?.username ?? ""}
            readOnly
            className={styles.inputWithPrefix}
          />
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            icon={copied ? "check" : "copy"}
            onClick={handleCopyUsername}
            aria-label={t("copyUsername", "複製使用者名稱")}
            className={styles.inputAction}
          />
        </div>
      </FormItem>

      {/* Email — only shown in profileTab for OAuth-only users */}
      {!user?.has_local_password && (
        <FormItem label={t("email", "電子郵件")} htmlFor="profileEmail">
          <Input
            name="profileEmail"
            type="email"
            value={user?.email ?? ""}
            readOnly
          />
        </FormItem>
      )}

      {/* Save actions */}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving} loading={saving}>
          {saving ? t("saving", "儲存中...") : t("saveChanges")}
        </Button>
      </div>
    </div>
  );

  const securityTab = (
    <div className={styles.tabContent}>
      {/* Email (local users only) */}
      <FormItem label={t("emailAddress", "電子郵件地址")} htmlFor="securityEmail">
        <Input
          name="securityEmail"
          type="email"
          value={user?.email ?? ""}
          readOnly
        />
      </FormItem>

      {/* Change Password Accordion */}
      <div className={styles.accordion}>
        <button
          className={styles.accordionHeader}
          onClick={() => setIsPasswordOpen((v) => !v)}
          aria-expanded={isPasswordOpen}
        >
          <span>{t("changePassword", "變更密碼")}</span>
          <Icon
            name="chevron-down"
            size="sm"
            className={`${styles.accordionChevron} ${isPasswordOpen ? styles.accordionChevronOpen : ""}`}
          />
        </button>

        <div className={`${styles.accordionBody} ${isPasswordOpen ? styles.accordionBodyOpen : ""}`}>
          <div className={styles.accordionInner}>
            {/* Current password */}
            <FormItem label={t("currentPassword", "目前密碼")} htmlFor="currentPassword">
              <div className={styles.inputGroup}>
                <Input
                  name="currentPassword"
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className={styles.inputWithAction}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  icon={showCurrentPw ? "eye-off" : "eye"}
                  onClick={() => setShowCurrentPw((v) => !v)}
                  aria-label={showCurrentPw ? t("hidePassword", "隱藏密碼") : t("showPassword", "顯示密碼")}
                  type="button"
                  className={styles.inputAction}
                />
              </div>
            </FormItem>

            {/* New password + strength */}
            <FormItem label={t("newPassword", "新密碼")} htmlFor="newPassword">
              <div className={styles.inputGroup}>
                <Input
                  name="newPassword"
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className={styles.inputWithAction}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  icon={showNewPw ? "eye-off" : "eye"}
                  onClick={() => setShowNewPw((v) => !v)}
                  aria-label={showNewPw ? t("hidePassword", "隱藏密碼") : t("showPassword", "顯示密碼")}
                  type="button"
                  className={styles.inputAction}
                />
              </div>
              {newPassword.length > 0 && (
                <>
                  <div className={styles.strengthMeter}>
                    <div className={`${styles.strengthBar} ${pwStrength >= 1 ? styles[`strength${pwStrength}`] : ""}`} />
                    <div className={`${styles.strengthBar} ${pwStrength >= 2 ? styles[`strength${pwStrength}`] : ""}`} />
                    <div className={`${styles.strengthBar} ${pwStrength >= 3 ? styles[`strength${pwStrength}`] : ""}`} />
                  </div>
                  <ul className={styles.pwChecklist}>
                    <li className={newPassword.length >= 6 ? styles.pwCheckPass : styles.pwCheckFail}>
                      <Icon name="check-circle" size="sm" className={styles.pwCheckIcon} />
                      {t("pwCheck6chars", "至少 6 字元")}
                    </li>
                    <li className={(/[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) ? styles.pwCheckPass : styles.pwCheckFail}>
                      <Icon name="check-circle" size="sm" className={styles.pwCheckIcon} />
                      {t("pwCheckAlphaNum", "包含英文與數字")}
                    </li>
                  </ul>
                </>
              )}
            </FormItem>

            {/* Confirm password */}
            <FormItem label={t("confirmPassword", "確認新密碼")} htmlFor="confirmPassword">
              <div className={styles.inputGroup}>
                <Input
                  name="confirmPassword"
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className={styles.inputWithAction}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  icon={showConfirmPw ? "eye-off" : "eye"}
                  onClick={() => setShowConfirmPw((v) => !v)}
                  aria-label={showConfirmPw ? t("hidePassword", "隱藏密碼") : t("showPassword", "顯示密碼")}
                  type="button"
                  className={styles.inputAction}
                />
              </div>
            </FormItem>

            {passwordError && <p className={styles.errorText}>{passwordError}</p>}
            {passwordSuccess && <p className={styles.successText}>{t("passwordUpdated", "密碼已成功更新！")}</p>}

            <Button
              variant="primary"
              onClick={handleChangePassword}
              disabled={passwordSaving}
              loading={passwordSaving}
            >
              {t("updatePassword", "更新密碼")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const preferencesTab = (
    <div className={styles.tabContent}>
      <div className={styles.field}>
        <label className={styles.segmentLabel}>{t("theme", "外觀主題")}</label>
        <div className={styles.segmentedControl}>
          <button
            className={`${styles.segment} ${theme === "light" ? styles.segmentActive : ""}`}
            onClick={() => handleThemeChange("light")}
          >
            <Icon name="sun" size="sm" />
            <span>{t("lightMode", "淺色")}</span>
          </button>
          <button
            className={`${styles.segment} ${theme === "dark" ? styles.segmentActive : ""}`}
            onClick={() => handleThemeChange("dark")}
          >
            <Icon name="moon" size="sm" />
            <span>{t("darkMode", "深色")}</span>
          </button>
          <button
            className={`${styles.segment} ${theme === "system" ? styles.segmentActive : ""}`}
            onClick={() => handleThemeChange("system")}
          >
            <Icon name="globe" size="sm" />
            <span>{t("systemDefault", "系統")}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const tabs: TabItem[] = [
    {
      key: "profile",
      label: t("profile", "個人資料"),
      icon: <Icon name="user" size="sm" />,
      content: profileTab,
    },
    // Only local-password users see the security tab
    ...(user?.has_local_password !== false
      ? [{
          key: "security",
          label: t("security", "安全性"),
          icon: <Icon name="lock" size="sm" />,
          content: securityTab,
        }]
      : []),
    {
      key: "preferences",
      label: t("preferences", "偏好設定"),
      icon: <Icon name="palette" size="sm" />,
      content: preferencesTab,
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t("settingPanel", "設定")}
      size="lg"
      closeOnOverlayClick={true}
      closeOnEscape={true}
      preventScroll={true}
      className={styles.settingDialog}
      contentClassName={styles.dialogContentReset}
    >
      <Tabs
        tabs={tabs}
        defaultTab="profile"
        orientation="vertical"
        variant="pills"
        size="sm"
        className={styles.settingTabs}
        tabListClassName={styles.settingTabList}
        contentClassName={styles.settingTabContent}
        aria-label={t("settingPanel", "設定")}
      />
    </Dialog>
  );
}

export default SettingPanel;

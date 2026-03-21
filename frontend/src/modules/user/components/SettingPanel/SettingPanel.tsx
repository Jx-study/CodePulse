import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SettingPanel.module.scss";
import Icon from "@/shared/components/Icon";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import FormItem from "@/shared/components/FormItem";
import FormAlert from "@/shared/components/FormAlert";
import type { FormAlertType } from "@/shared/components/FormAlert";
import Dialog from "@/shared/components/Dialog";
import Tabs from "@/shared/components/Tabs";
import Avatar from "@/shared/components/Avatar";
import useForm from "@/shared/hooks/useForm";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useTheme } from "@/shared/contexts/ThemeContext";
import { userService } from "@/services/userService";
import {
  validateDisplayName,
  validateOldPassword,
  validatePassword,
  validateConfirmPassword,
} from "@/shared/utils/validation";
import type { TabItem } from "@/types";

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
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileAlert, setProfileAlert] = useState({ type: "error" as FormAlertType, message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const handleClose = () => {
    setPendingAvatarFile(null);
    setPreviewUrl(null);
    setProfileAlert({ type: "error", message: "" });
    profileForm.reset();
    onClose();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setProfileAlert({ type: "error", message: t("avatarFormatError", "請上傳 JPG、PNG、WebP 或 GIF 格式") });
      return;
    }
    if (file.size > MAX_SIZE) {
      setProfileAlert({ type: "error", message: t("avatarSizeError", "檔案大小不可超過 5MB") });
      return;
    }
    setPendingAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const profileForm = useForm<{ displayName: string }>({
    initialValues: { displayName: user?.display_name ?? "" },
    validationRules: {
      displayName: (v) => validateDisplayName(v, t),
    },
    onSubmit: async ({ displayName }) => {
      setProfileAlert({ type: "error", message: "" });
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
        setProfileAlert({ type: "success", message: t("saveSuccess", "儲存成功！") });
        setTimeout(() => setProfileAlert((a) => ({ ...a, message: "" })), 3000);
      } catch {
        setProfileAlert({ type: "error", message: t("saveError", "儲存失敗，請稍後再試") });
      }
    },
  });

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
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const passwordForm = useForm<{
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }>({
    initialValues: { oldPassword: "", newPassword: "", confirmNewPassword: "" },
    validationRules: {
      oldPassword: (v) => validateOldPassword(v, t),
      newPassword: (v) => validatePassword(v, t),
      confirmNewPassword: (v, all) => validateConfirmPassword(all.newPassword, v, t),
    },
    onSubmit: async ({ oldPassword, newPassword }) => {
      try {
        await userService.changePassword(oldPassword, newPassword);
        passwordForm.reset();
        setIsPasswordOpen(false);
        // Password change is a security action — use toast-level feedback
        // For now we show a brief inline success via reset state; caller can hook toast
      } catch (err: unknown) {
        const e = err as { error_code?: string };
        if (e.error_code === "WRONG_PASSWORD") {
          passwordForm.setFieldError("oldPassword", t("wrongPassword", "目前密碼錯誤"));
        } else {
          passwordForm.setFieldError("oldPassword", t("saveError", "儲存失敗，請稍後再試"));
        }
      }
    },
  });

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

      <FormAlert type={profileAlert.type} message={profileAlert.message} />

      {/* Display Name */}
      <FormItem
        label={t("displayName", "顯示名稱")}
        error={profileForm.touched.displayName ? profileForm.errors.displayName : undefined}
        htmlFor="displayName"
        required
      >
        <Input
          name="displayName"
          type="text"
          value={profileForm.values.displayName}
          onChange={profileForm.handleChange}
          onBlur={profileForm.handleBlur}
          hasError={!!(profileForm.touched.displayName && profileForm.errors.displayName)}
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

      {/* Email — only shown for OAuth-only users */}
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
        <Button variant="secondary" onClick={() => {
          setPendingAvatarFile(null);
          setPreviewUrl(null);
          profileForm.reset();
        }}>
          {t("cancel")}
        </Button>
        <Button
          variant="primary"
          onClick={() => profileForm.handleSubmit()}
          disabled={profileForm.isSubmitting}
          loading={profileForm.isSubmitting}
        >
          {profileForm.isSubmitting ? t("saving", "儲存中...") : t("saveChanges")}
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
            <FormItem
              label={t("currentPassword", "目前密碼")}
              error={passwordForm.touched.oldPassword ? passwordForm.errors.oldPassword : undefined}
              htmlFor="oldPassword"
              required
            >
              <div className={styles.inputGroup}>
                <Input
                  name="oldPassword"
                  type={showCurrentPw ? "text" : "password"}
                  value={passwordForm.values.oldPassword}
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                  hasError={!!(passwordForm.touched.oldPassword && passwordForm.errors.oldPassword)}
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

            {/* New password */}
            <FormItem
              label={t("newPassword", "新密碼")}
              error={passwordForm.touched.newPassword ? passwordForm.errors.newPassword : undefined}
              htmlFor="newPassword"
              required
              tooltip={t("passwordTooltip", "需 8–20 字符，包含大小寫字母、數字和符號")}
            >
              <div className={styles.inputGroup}>
                <Input
                  name="newPassword"
                  type={showNewPw ? "text" : "password"}
                  value={passwordForm.values.newPassword}
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                  hasError={!!(passwordForm.touched.newPassword && passwordForm.errors.newPassword)}
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
            </FormItem>

            {/* Confirm new password */}
            <FormItem
              label={t("confirmPassword", "確認新密碼")}
              error={passwordForm.touched.confirmNewPassword ? passwordForm.errors.confirmNewPassword : undefined}
              success={
                passwordForm.touched.confirmNewPassword &&
                !passwordForm.errors.confirmNewPassword &&
                passwordForm.values.confirmNewPassword === passwordForm.values.newPassword &&
                passwordForm.values.confirmNewPassword !== ""
              }
              successMessage={t("passwordMatch", "密碼一致")}
              htmlFor="confirmNewPassword"
              required
            >
              <div className={styles.inputGroup}>
                <Input
                  name="confirmNewPassword"
                  type={showConfirmPw ? "text" : "password"}
                  value={passwordForm.values.confirmNewPassword}
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                  hasError={!!(passwordForm.touched.confirmNewPassword && passwordForm.errors.confirmNewPassword)}
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

            <Button
              variant="primary"
              onClick={() => passwordForm.handleSubmit()}
              disabled={passwordForm.isSubmitting}
              loading={passwordForm.isSubmitting}
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
    ...(user?.has_local_password !== false
      ? [
          {
            key: "security",
            label: t("security", "安全性"),
            icon: <Icon name="lock" size="sm" />,
            content: securityTab,
          },
        ]
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
      onClose={handleClose}
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

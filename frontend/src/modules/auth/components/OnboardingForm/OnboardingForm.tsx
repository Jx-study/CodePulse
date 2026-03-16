import React, { useState, useEffect } from "react";
import Button from "@/shared/components/Button";
import FormItem from "@/shared/components/FormItem";
import Input from "@/shared/components/Input";
import Icon from "@/shared/components/Icon";
import ProgressBar from "@/shared/components/ProgressBar";
import useUsernameCheck from "../../hooks/useUsernameCheck";
import { validateUsername } from "@/shared/utils/validation";
import styles from "./OnboardingForm.module.scss";

interface OnboardingFormProps {
  email: string;
  displayNamePlaceholder: string;
  loading: boolean;
  usernameError: string;
  formError?: string;
  onSubmit: (username: string, displayName: string) => void;
}

function OnboardingForm({
  email,
  displayNamePlaceholder,
  loading,
  usernameError,
  formError,
  onSubmit,
}: OnboardingFormProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [usernameFieldError, setUsernameFieldError] = useState("");

  const { status: usernameStatus } = useUsernameCheck(username);

  useEffect(() => {
    if (usernameError) {
      setUsernameFieldError(usernameError);
    }
  }, [usernameError]);

  const getUsernameFormItemProps = () => {
    if (usernameFieldError) {
      return { error: usernameFieldError };
    }
    if (usernameStatus === "available") {
      return { success: true, successMessage: "此名稱可以使用" };
    }
    const derivedError =
      usernameStatus === "taken"
        ? "此名稱已被使用，試試加上數字？"
        : usernameStatus === "error"
        ? "檢查失敗，請稍後再試"
        : "";
    if (derivedError) {
      return { error: derivedError };
    }
    return {};
  };

  const isSubmitDisabled =
    loading ||
    usernameStatus === "checking" ||
    usernameStatus === "taken" ||
    usernameStatus === "error" ||
    validateUsername(username) !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateUsername(username);
    if (validationError) {
      setUsernameFieldError(validationError);
      return;
    }
    onSubmit(username, displayName);
  };

  const usernameFormItemProps = getUsernameFormItemProps();

  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        <div className={styles.progressWrapper}>
          <ProgressBar value={90} max={100} showLabel={false} />
        </div>

        <div className={styles.header}>
          <h2 className={styles.title}>最後一步！</h2>
          <p className={styles.subtitle}>你正在以 {email} 完成帳號設定</p>
        </div>

        <div className={styles.emailBadge}>
          <Icon name="envelope" />
          <span>{email}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <FormItem
            label="用戶名"
            maxLength={15}
            currentLength={username.length}
            showCharCount={username.length > 0}
            required
            htmlFor="username"
            {...usernameFormItemProps}
          >
            <div style={{ position: "relative" }}>
              <Input
                type="text"
                name="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (usernameFieldError) setUsernameFieldError("");
                }}
                placeholder="請輸入用戶名"
                hasError={
                  !!usernameFieldError ||
                  usernameStatus === "taken" ||
                  usernameStatus === "error"
                }
                disabled={loading}
                required
              />
              {usernameStatus === "checking" && (
                <div
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Icon name="spinner" animation="spin" />
                </div>
              )}
            </div>
          </FormItem>

          <FormItem
            label="顯示名稱（選填）"
            tooltip="留空則使用 Google 帳號名稱"
            maxLength={50}
            currentLength={displayName.length}
            showCharCount={displayName.length > 0}
            htmlFor="displayName"
          >
            <Input
              type="text"
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={displayNamePlaceholder}
              disabled={loading}
            />
          </FormItem>

          {formError && (
            <p className={styles.formError}>{formError}</p>
          )}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitDisabled}
            loading={loading}
          >
            完成設定
          </Button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingForm;

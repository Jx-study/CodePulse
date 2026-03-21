import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import FormItem from "@/shared/components/FormItem";
import FormAlert from "@/shared/components/FormAlert";
import Input from "@/shared/components/Input";
import Icon from "@/shared/components/Icon";
import ProgressBar from "@/shared/components/ProgressBar";
import useForm from "@/shared/hooks/useForm";
import useUsernameCheck from "@/modules/auth/hooks/useUsernameCheck";
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
  const { t } = useTranslation();

  const form = useForm<{ username: string; displayName: string }>({
    initialValues: { username: "", displayName: "" },
    validationRules: {
      username: (v) => validateUsername(v, t),
    },
    onSubmit: ({ username, displayName }) => {
      if (usernameStatus === "taken" || usernameStatus === "error") return;
      if (usernameStatus === "checking") return;
      onSubmit(username, displayName);
    },
  });

  const { status: usernameStatus } = useUsernameCheck(form.values.username);

  // Propagate server-side username error from parent
  useEffect(() => {
    if (usernameError) {
      form.setFieldError("username", usernameError);
    }
  }, [usernameError]); // eslint-disable-line react-hooks/exhaustive-deps

  const getUsernameFormItemProps = () => {
    if (form.touched.username && form.errors.username) {
      return { error: form.errors.username };
    }
    if (usernameStatus === "available") {
      return { success: true, successMessage: t("usernameAvailable", "此名稱可以使用") };
    }
    if (usernameStatus === "taken") {
      return { error: t("usernameTakenSuggest", "此名稱已被使用，試試加上數字？") };
    }
    if (usernameStatus === "error") {
      return { error: t("usernameCheckError", "檢查失敗，請稍後再試") };
    }
    return {};
  };

  const isSubmitDisabled =
    loading ||
    usernameStatus === "checking" ||
    usernameStatus === "taken" ||
    usernameStatus === "error" ||
    validateUsername(form.values.username, t) !== null;

  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        <div className={styles.progressWrapper}>
          <ProgressBar value={90} max={100} showLabel={false} />
        </div>

        <div className={styles.header}>
          <h2 className={styles.title}>{t("onboarding.title", "最後一步！")}</h2>
          <p className={styles.subtitle}>
            {t("onboarding.subtitle", "你正在以 {{email}} 完成帳號設定", { email })}
          </p>
        </div>

        <div className={styles.emailBadge}>
          <Icon name="envelope" />
          <span>{email}</span>
        </div>

        <form onSubmit={form.handleSubmit}>
          <FormItem
            label={t("username", "用戶名")}
            maxLength={15}
            currentLength={form.values.username.length}
            showCharCount={form.values.username.length > 0}
            required
            htmlFor="username"
            {...getUsernameFormItemProps()}
          >
            <div style={{ position: "relative" }}>
              <Input
                type="text"
                name="username"
                value={form.values.username}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                placeholder={t("usernamePlaceholder", "請輸入用戶名")}
                hasError={
                  !!(form.touched.username && form.errors.username) ||
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
            label={t("displayNameOptional", "顯示名稱（選填）")}
            tooltip={t("displayNameTooltip", "留空則使用 Google 帳號名稱")}
            maxLength={30}
            currentLength={form.values.displayName.length}
            showCharCount={form.values.displayName.length > 0}
            htmlFor="displayName"
          >
            <Input
              type="text"
              name="displayName"
              value={form.values.displayName}
              onChange={form.handleChange}
              placeholder={displayNamePlaceholder}
              disabled={loading}
            />
          </FormItem>

          {formError && <FormAlert type="error" message={formError} />}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitDisabled}
            loading={loading}
          >
            {t("onboarding.submit", "完成設定")}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingForm;

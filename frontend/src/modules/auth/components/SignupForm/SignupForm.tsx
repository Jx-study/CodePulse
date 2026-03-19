import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SignupFormData } from "@/types/pages/auth";
import Button from "@/shared/components/Button";
import FormItem from "@/shared/components/FormItem";
import FormAlert from "@/shared/components/FormAlert";
import type { FormAlertType } from "@/shared/components/FormAlert";
import Input from "@/shared/components/Input";
import Icon from "@/shared/components/Icon";
import useForm from "@/shared/hooks/useForm";
import useUsernameCheck from "../../hooks/useUsernameCheck";
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/shared/utils/validation";

interface SignupFormProps {
  onSubmit: (formData: SignupFormData) => void;
  disabled?: boolean;
  alertMessage?: string;
  alertType?: FormAlertType;
}

function SignupForm({
  onSubmit,
  disabled = false,
  alertMessage = "",
  alertType = "error",
}: SignupFormProps) {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormData>({
    initialValues: { username: "", email: "", password: "", confirmPassword: "" },
    validationRules: {
      username: (v) => validateUsername(v, t),
      email: (v) => validateEmail(v, t),
      password: (v) => validatePassword(v, t),
      confirmPassword: (v, all) => validateConfirmPassword(all.password, v, t),
    },
    onSubmit,
  });

  const { status: usernameStatus } = useUsernameCheck(form.values.username);

  const canSubmit =
    !disabled &&
    !form.isSubmitting &&
    usernameStatus !== "checking" &&
    usernameStatus !== "taken";

  // Username FormItem feedback
  const getUsernameFormItemProps = () => {
    if (form.touched.username && form.errors.username) {
      return { error: form.errors.username };
    }
    if (usernameStatus === "available") {
      return { success: true, successMessage: t("usernameAvailable", "此名稱可以使用") };
    }
    if (usernameStatus === "taken") {
      return { error: t("usernameTaken", "此帳號已被使用") };
    }
    if (usernameStatus === "error") {
      return { error: t("usernameCheckError", "檢查失敗，請稍後再試") };
    }
    return {};
  };

  const isEmailValid =
    form.touched.email && !form.errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.values.email);
  const isPasswordValid =
    form.touched.password && !form.errors.password && form.values.password.length >= 8;
  const isConfirmPasswordValid =
    form.touched.confirmPassword &&
    !form.errors.confirmPassword &&
    form.values.confirmPassword === form.values.password &&
    form.values.confirmPassword !== "";

  return (
    <form onSubmit={form.handleSubmit}>
      <FormAlert type={alertType} message={alertMessage} />

      {/* Username */}
      <FormItem
        label={t("username", "用戶名")}
        tooltip={t("usernameTooltip", "用戶名只能包含字母、數字和底線，3–15 個字符")}
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
            disabled={disabled}
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

      {/* Email */}
      <FormItem
        label={t("email", "信箱")}
        error={form.touched.email ? form.errors.email : undefined}
        success={isEmailValid}
        successMessage={isEmailValid ? t("emailValid", "信箱格式正確") : undefined}
        tooltip={t("emailTooltip", "請使用有效的電子郵件地址進行註冊")}
        required
        htmlFor="email"
      >
        <Input
          type="email"
          name="email"
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder={t("emailPlaceholder", "請輸入信箱")}
          hasError={!!(form.touched.email && form.errors.email)}
          disabled={disabled}
          autoComplete="email"
          required
        />
      </FormItem>

      {/* Password */}
      <FormItem
        label={t("password", "密碼")}
        error={form.touched.password ? form.errors.password : undefined}
        success={isPasswordValid}
        tooltip={t("passwordTooltip", "密碼需 8–20 字符，包含大小寫字母、數字和符號")}
        required
        htmlFor="password"
      >
        <div style={{ position: "relative" }}>
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.values.password}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            placeholder={t("passwordPlaceholder", "請輸入密碼")}
            hasError={!!(form.touched.password && form.errors.password)}
            disabled={disabled}
            autoComplete="new-password"
            required
            style={{ paddingRight: "40px" }}
          />
          <div
            style={{
              position: "absolute",
              right: "6px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
            }}
          >
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={disabled}
              icon={showPassword ? "eye" : "eye-off"}
              iconOnly
              aria-label={showPassword ? t("hidePassword", "隱藏密碼") : t("showPassword", "顯示密碼")}
              tabIndex={-1}
            />
          </div>
        </div>
      </FormItem>

      {/* Confirm Password */}
      <FormItem
        label={t("confirmPassword", "確認密碼")}
        error={form.touched.confirmPassword ? form.errors.confirmPassword : undefined}
        success={isConfirmPasswordValid}
        successMessage={isConfirmPasswordValid ? t("passwordMatch", "密碼一致") : undefined}
        required
        htmlFor="confirmPassword"
      >
        <div style={{ position: "relative" }}>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.values.confirmPassword}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            placeholder={t("confirmPasswordPlaceholder", "請再次輸入密碼")}
            hasError={!!(form.touched.confirmPassword && form.errors.confirmPassword)}
            disabled={disabled}
            required
            style={{ paddingRight: "40px" }}
          />
          <div
            style={{
              position: "absolute",
              right: "6px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
            }}
          >
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              disabled={disabled}
              icon={showConfirmPassword ? "eye" : "eye-off"}
              iconOnly
              aria-label={showConfirmPassword ? t("hidePassword", "隱藏密碼") : t("showPassword", "顯示密碼")}
              tabIndex={-1}
            />
          </div>
        </div>
      </FormItem>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={!canSubmit}
        loading={form.isSubmitting}
      >
        {t("register")}
      </Button>
    </form>
  );
}

export default SignupForm;

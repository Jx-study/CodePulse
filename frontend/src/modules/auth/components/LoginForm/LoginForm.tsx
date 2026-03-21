import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { LoginFormData } from "@/types/pages/auth";
import styles from "@/styles/AuthForm.module.scss";
import Button from "@/shared/components/Button";
import FormItem from "@/shared/components/FormItem";
import FormAlert from "@/shared/components/FormAlert";
import type { FormAlertType } from "@/shared/components/FormAlert";
import Input from "@/shared/components/Input";
import useForm from "@/shared/hooks/useForm";
import { validateLoginIdentifier } from "@/shared/utils/validation";

interface LoginFormProps {
  onSubmit: (formData: LoginFormData) => void;
  disabled?: boolean;
  alertMessage?: string;
  alertType?: FormAlertType;
}

function LoginForm({
  onSubmit,
  disabled = false,
  alertMessage = "",
  alertType = "error",
}: LoginFormProps) {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    initialValues: { usernameOrEmail: "", password: "" },
    validationRules: {
      usernameOrEmail: (v) => validateLoginIdentifier(v, t),
      password: (v) => (!v ? t("validation.password.required") : null),
    },
    onSubmit,
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <FormAlert type={alertType} message={alertMessage} />

      <FormItem
        label={t("usernameOrEmail", "用戶名或信箱")}
        error={form.touched.usernameOrEmail ? form.errors.usernameOrEmail : undefined}
        tooltip={t("loginIdentifierTooltip", "您可以使用用戶名或註冊的電子郵件地址登入")}
        required
        htmlFor="usernameOrEmail"
      >
        <Input
          type="text"
          name="usernameOrEmail"
          value={form.values.usernameOrEmail}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder={t("usernameOrEmailPlaceholder", "請輸入用戶名或信箱")}
          hasError={!!(form.touched.usernameOrEmail && form.errors.usernameOrEmail)}
          disabled={disabled}
          autoComplete="username"
          required
        />
      </FormItem>

      <FormItem
        label={t("password", "密碼")}
        error={form.touched.password ? form.errors.password : undefined}
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
            autoComplete="current-password"
            required
            style={{ paddingRight: "40px" }}
          />
          <div style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", display: "flex" }}>
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

      <Button type="submit" variant="primary" fullWidth disabled={disabled || form.isSubmitting}>
        {form.isSubmitting ? t("loggingIn", "登入中...") : t("login")}
      </Button>

      <div className={styles.forgotPassword}>
        <Link to="/auth/forgot-password">{t("forgotPassword", "忘記密碼？")}</Link>
      </div>
    </form>
  );
}

export default LoginForm;

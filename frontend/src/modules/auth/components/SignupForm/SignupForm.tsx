import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SignupFormData } from "@/types/pages/auth";
import Button from "@/shared/components/Button";
import FormItem from "@/shared/components/FormItem";
import Input from "@/shared/components/Input";
import Icon from "@/shared/components/Icon";
import useUsernameCheck from "../../hooks/useUsernameCheck";
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/shared/utils/validation";

interface SignupFormErrors {
  [key: string]: string;
}

interface SignupFormProps {
  onSubmit: (formData: SignupFormData) => void;
  disabled?: boolean;
}

function SignupForm({ onSubmit, disabled = false }: SignupFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<SignupFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const { status: usernameStatus } = useUsernameCheck(formData.username);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "confirmPassword" || name === "password") {
        const pw = name === "password" ? value : next.password;
        const cpw = name === "confirmPassword" ? value : next.confirmPassword;
        if (touched.confirmPassword && cpw) {
          setErrors((e) => ({
            ...e,
            confirmPassword: pw !== cpw ? "密碼不一致" : "",
          }));
        }
      } else if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }

      return next;
    });
  };

  const validateForm = () => {
    const newErrors: SignupFormErrors = {};

    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      newErrors.username = usernameError;
    } else if (usernameStatus === "taken") {
      newErrors.username = "此帳號已被使用";
    } else if (usernameStatus === "checking") {
      newErrors.username = "正在檢查用戶名，請稍候";
    }

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Username FormItem props based on useUsernameCheck status
  const getUsernameFormItemProps = () => {
    if (errors.username) {
      return { error: errors.username };
    }
    if (usernameStatus === 'available') {
      return { success: true, successMessage: "Username is available" };
    }
    if (usernameStatus === 'taken') {
      return { error: "此帳號已被使用" };
    }
    return {};
  };

  const isEmailValid = touched.email && !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordValid = touched.password && !errors.password && formData.password.length >= 6;
  const isConfirmPasswordValid = touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword === formData.password;

  const usernameFormItemProps = getUsernameFormItemProps();

  return (
    <form onSubmit={handleSubmit}>
      <FormItem
        label="用戶名"
        tooltip="用戶名只能包含字母、數字和下劃線，至少3個字符"
        maxLength={20}
        currentLength={formData.username.length}
        showCharCount={formData.username.length > 0}
        required
        htmlFor="username"
        {...usernameFormItemProps}
      >
        <div style={{ position: "relative" }}>
          <Input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="請輸入用戶名"
            hasError={!!errors.username || usernameStatus === "taken"}
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

      <FormItem
        label="信箱"
        error={errors.email}
        success={isEmailValid}
        successMessage={isEmailValid ? "信箱格式正確" : undefined}
        tooltip="請使用有效的電子郵件地址進行註冊"
        required
        htmlFor="email"
      >
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="請輸入信箱"
          hasError={!!errors.email}
          disabled={disabled}
          autoComplete="email"
          required
        />
      </FormItem>

      <FormItem
        label="密碼"
        error={errors.password}
        success={isPasswordValid}
        tooltip={
          !errors.password && !isPasswordValid
            ? "密碼必須包含大小寫字母和數字，至少6個字符"
            : undefined
        }
        required
        htmlFor="password"
      >
        <div style={{ position: "relative" }}>
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="請輸入密碼"
            hasError={!!errors.password}
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
              aria-label={showPassword ? "顯示密碼" : "隱藏密碼"}
              tabIndex={-1}
            />
          </div>
        </div>
      </FormItem>

      <FormItem
        label="確認密碼"
        error={errors.confirmPassword}
        success={isConfirmPasswordValid}
        successMessage={isConfirmPasswordValid ? "密碼一致" : undefined}
        required
        htmlFor="confirmPassword"
      >
        <div style={{ position: "relative" }}>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="請再次輸入密碼"
            hasError={!!errors.confirmPassword}
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
              icon={showPassword ? "eye" : "eye-off"}
              iconOnly
              aria-label={showPassword ? "顯示密碼" : "隱藏密碼"}
              tabIndex={-1}
            />
          </div>
        </div>
      </FormItem>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={disabled || usernameStatus === "checking"}
      >
        {t("register")}
      </Button>
    </form>
  );
}

export default SignupForm;

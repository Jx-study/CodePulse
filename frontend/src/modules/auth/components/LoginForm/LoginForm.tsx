import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { LoginFormData } from "@/types/pages/auth";
import styles from "../../styles/AuthForm.module.scss";
import Button from "@/shared/components/Button";
import FormItem from "@/shared/components/FormItem";
import Input from "@/shared/components/Input";

interface LoginFormErrors {
  [key: string]: string;
}

interface LoginFormProps {
  onSubmit: (formData: LoginFormData) => void;
  disabled?: boolean;
}

function LoginForm({ onSubmit, disabled = false }: LoginFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<LoginFormData>({
    usernameOrEmail: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: LoginFormErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = "請輸入用戶名或信箱";
    }

    if (!formData.password) {
      newErrors.password = "請輸入密碼";
    } else if (formData.password.length < 6) {
      newErrors.password = "密碼至少需要6個字符";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormItem
        label="用戶名或信箱"
        error={errors.usernameOrEmail}
        tooltip="您可以使用用戶名或註冊的電子郵件地址登入"
        required
        htmlFor="usernameOrEmail"
      >
        <Input
          type="text"
          name="usernameOrEmail"
          value={formData.usernameOrEmail}
          onChange={handleChange}
          placeholder="請輸入用戶名或信箱"
          hasError={!!errors.usernameOrEmail}
          disabled={disabled}
          autoComplete="username"
          required
        />
      </FormItem>

      <FormItem
        label="密碼"
        error={errors.password || (formData.password.length > 0 && formData.password.length < 6 ? "密碼至少需要6個字符" : undefined)}
        required
        htmlFor="password"
      >
        <div style={{ position: "relative" }}>
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="請輸入密碼"
            hasError={!!errors.password}
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
              aria-label={showPassword ? "顯示密碼" : "隱藏密碼"}
              tabIndex={-1}
            />
          </div>
        </div>
      </FormItem>

<Button type="submit" variant="primary" fullWidth disabled={disabled}>
        {t("login")}
      </Button>

      <div className={styles.forgotPassword}>
        <Link to="/auth/forgot-password">忘記密碼？</Link>
      </div>
    </form>
  );
}

export default LoginForm;

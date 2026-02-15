import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../styles/AuthForm.module.scss";
import Button from "@/shared/components/Button";
import FormItem from "@/shared/components/FormItem";
import Input from "@/shared/components/Input";
import Checkbox from "@/shared/components/Checkbox";

interface LoginFormData {
  usernameOrEmail: string;
  password: string;
  rememberMe: boolean;
}

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
    rememberMe: false,
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // 清除錯誤訊息
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
    <div className={styles.formContent}>
      <h2>{t("login")}</h2>
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
          error={errors.password}
          helperText={!errors.password ? "密碼至少需要6個字符" : undefined}
          required
          htmlFor="password"
        >
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="請輸入密碼"
            hasError={!!errors.password}
            disabled={disabled}
            autoComplete="current-password"
            required
          />
        </FormItem>

        <Checkbox
          name="rememberMe"
          label="記住我"
          checked={formData.rememberMe}
          onChange={handleChange}
          disabled={disabled}
        />

        <Button type="submit" variant="primary" fullWidth disabled={disabled}>
          {t("login")}
        </Button>

        <div className={styles.forgotPassword}>
          <a href="#forgot-password">忘記密碼？</a>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;

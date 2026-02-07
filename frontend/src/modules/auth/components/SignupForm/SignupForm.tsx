import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../styles/AuthForm.module.scss";
import Button from "@/shared/components/Button";
import FormItem from "@/shared/components/FormItem";
import Input from "@/shared/components/Input";

interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 清除錯誤訊息
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const validateForm = () => {
    const newErrors: SignupFormErrors = {};

    // 用戶名驗證
    if (!formData.username.trim()) {
      newErrors.username = "請輸入用戶名";
    } else if (formData.username.length < 3) {
      newErrors.username = "用戶名至少需要3個字符";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "用戶名只能包含字母、數字和下劃線";
    }

    // 信箱驗證
    if (!formData.email.trim()) {
      newErrors.email = "請輸入信箱";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "請輸入有效的信箱格式";
    }

    // 密碼驗證
    if (!formData.password) {
      newErrors.password = "請輸入密碼";
    } else if (formData.password.length < 6) {
      newErrors.password = "密碼至少需要6個字符";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "密碼必須包含大小寫字母和數字";
    }

    // 確認密碼驗證
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "請確認密碼";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "密碼不一致";
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

  // 檢查是否有成功狀態
  const isUsernameValid = touched.username && !errors.username && formData.username.length >= 3;
  const isEmailValid = touched.email && !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordValid = touched.password && !errors.password && formData.password.length >= 6;
  const isConfirmPasswordValid = touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword === formData.password;

  return (
    <div className={styles.formContent}>
      <h2>{t("register")}</h2>
      <form onSubmit={handleSubmit}>
        <FormItem
          label="用戶名"
          error={errors.username}
          success={isUsernameValid}
          successMessage={isUsernameValid ? "用戶名可用" : undefined}
          tooltip="用戶名只能包含字母、數字和下劃線，至少3個字符"
          maxLength={20}
          currentLength={formData.username.length}
          showCharCount={formData.username.length > 0}
          required
          htmlFor="username"
        >
          <Input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="請輸入用戶名"
            hasError={!!errors.username}
            disabled={disabled}
            required
          />
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
          helperText={!errors.password && !isPasswordValid ? "密碼必須包含大小寫字母和數字，至少6個字符" : undefined}
          required
          htmlFor="password"
        >
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="請輸入密碼"
            hasError={!!errors.password}
            disabled={disabled}
            autoComplete="new-password"
            required
          />
        </FormItem>

        <FormItem
          label="確認密碼"
          error={errors.confirmPassword}
          success={isConfirmPasswordValid}
          successMessage={isConfirmPasswordValid ? "密碼一致" : undefined}
          required
          htmlFor="confirmPassword"
        >
          <Input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="請再次輸入密碼"
            hasError={!!errors.confirmPassword}
            disabled={disabled}
            required
          />
        </FormItem>

        <Button type="submit" variant="primary" fullWidth disabled={disabled}>
          {t("register")}
        </Button>
      </form>
    </div>
  );
}

export default SignupForm;

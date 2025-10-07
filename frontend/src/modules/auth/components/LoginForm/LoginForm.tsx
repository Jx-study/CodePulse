import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../../styles/AuthForm.module.scss';

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

function LoginForm({ onSubmit, disabled }: LoginFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<LoginFormData>({
    usernameOrEmail: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 清除錯誤訊息
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: LoginFormErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = '請輸入用戶名或信箱';
    }

    if (!formData.password) {
      newErrors.password = '請輸入密碼';
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼至少需要6個字符';
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
      <h2>{t('login')}</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="usernameOrEmail">用戶名或信箱</label>
          <input
            type="text"
            id="usernameOrEmail"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            placeholder="請輸入用戶名或信箱"
            className={errors.usernameOrEmail ? styles.error : ''}
            disabled={disabled}
            required
          />
          {errors.usernameOrEmail && (
            <span className={styles.errorMessage}>{errors.usernameOrEmail}</span>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password">密碼</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="請輸入密碼"
            className={errors.password ? styles.error : ''}
            disabled={disabled}
            required
          />
          {errors.password && (
            <span className={styles.errorMessage}>{errors.password}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={disabled}
            />
            記住我
          </label>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={disabled}>
          {t('login')}
        </button>

        <div className={styles.forgotPassword}>
          <a href="#forgot-password">忘記密碼？</a>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
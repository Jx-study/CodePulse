import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AuthForm.module.scss';

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
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<SignupFormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    const newErrors: SignupFormErrors = {};

    // 用戶名驗證
    if (!formData.username.trim()) {
      newErrors.username = '請輸入用戶名';
    } else if (formData.username.length < 3) {
      newErrors.username = '用戶名至少需要3個字符';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = '用戶名只能包含字母、數字和下劃線';
    }

    // 信箱驗證
    if (!formData.email.trim()) {
      newErrors.email = '請輸入信箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '請輸入有效的信箱格式';
    }

    // 密碼驗證
    if (!formData.password) {
      newErrors.password = '請輸入密碼';
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼至少需要6個字符';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '密碼必須包含大小寫字母和數字';
    }

    // 確認密碼驗證
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '請確認密碼';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '密碼不一致';
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
      <h2>{t('register')}</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="username">用戶名</label>
          <input 
            type="text" 
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="請輸入用戶名"
            className={errors.username ? styles.error : ''}
            required 
          />
          {errors.username && (
            <span className={styles.errorMessage}>{errors.username}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">信箱</label>
          <input 
            type="email" 
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="請輸入信箱"
            className={errors.email ? styles.error : ''}
            required 
          />
          {errors.email && (
            <span className={styles.errorMessage}>{errors.email}</span>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="signupPassword">密碼</label>
          <input 
            type="password" 
            id="signupPassword"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="請輸入密碼"
            className={errors.password ? styles.error : ''}
            required 
          />
          {errors.password && (
            <span className={styles.errorMessage}>{errors.password}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">確認密碼</label>
          <input 
            type="password" 
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="請再次輸入密碼"
            className={errors.confirmPassword ? styles.error : ''}
            required 
          />
          {errors.confirmPassword && (
            <span className={styles.errorMessage}>{errors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" className={styles.submitBtn}>
          {t('register')}
        </button>
      </form>
    </div>
  );
}

export default SignupForm;
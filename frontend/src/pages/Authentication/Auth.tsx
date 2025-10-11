import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../modules/auth/components/LoginForm/LoginForm';
import SignupForm from '../../modules/auth/components/SignupForm/SignupForm';
import { useAuth } from '../../shared/contexts/AuthContext';
import styles from './Auth.module.scss';

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showTab = (tab: string) => {
    setActiveTab(tab);
    setMessage({ type: '', text: '' }); // 清除訊息
  };

  const handleLoginSubmit = async (formData: any) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 使用 email 欄位進行登入
      const email = formData.usernameOrEmail;
      await login(email, formData.password);

      // 登入成功
      setMessage({ type: 'success', text: t('auth.success.LOGIN_SUCCESS') });

      // 延遲跳轉到首頁
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || t('auth.errors.LOGIN_ERROR')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (formData: any) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await register(
        formData.email,
        formData.password,
        formData.username
      );

      // 註冊成功（AuthContext 會自動登入）
      setMessage({ type: 'success', text: t('auth.success.REGISTRATION_SUCCESS') });

      // 跳轉到首頁
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || t('auth.errors.REGISTRATION_ERROR')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'login' ? styles.active : ''}`}
          onClick={() => showTab('login')}
          disabled={loading}
        >
          {t('login')}
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'signup' ? styles.active : ''}`}
          onClick={() => showTab('signup')}
          disabled={loading}
        >
          {t('register')}
        </button>
      </div>

      {/* 訊息顯示區域 */}
      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* Loading 狀態 */}
      {loading && (
        <div className={styles.loading}>
          {t('loading', '處理中...')}
        </div>
      )}

      <div className={styles.formContainer}>
        {activeTab === 'login' && (
          <LoginForm onSubmit={handleLoginSubmit} disabled={loading} />
        )}

        {activeTab === 'signup' && (
          <SignupForm onSubmit={handleSignupSubmit} disabled={loading} />
        )}
      </div>
    </div>
  );
}

export default AuthPage;

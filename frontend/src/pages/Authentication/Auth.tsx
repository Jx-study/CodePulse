import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import authService from '../../modules/user/services/authService';
import styles from './Auth.module.scss';

// 型別定義
type TabType = 'login' | 'signup';

interface LoginFormData {
  usernameOrEmail: string;
  password: string;
  rememberMe: boolean;
}

interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface MessageState {
  type: string;
  text: string;
}

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState>({ type: '', text: '' });

  // 注入翻譯函數到 authService
  React.useEffect(() => {
    authService.setTranslation(t);
  }, [t]);

  const showTab = (tab: TabType) => {
    setActiveTab(tab);
    setMessage({ type: '', text: '' }); // 清除訊息
  };

  const handleLoginSubmit = async (formData: LoginFormData) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 使用 usernameOrEmail 欄位進行登入 (支援 email 或 username)
      const response = await authService.login(formData.usernameOrEmail, formData.password);

      if (response.success) {
        setMessage({ type: 'success', text: response.message || t('auth.success.LOGIN_SUCCESS') });

        // 延遲跳轉到首頁
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('auth.errors.LOGIN_ERROR');
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (formData: SignupFormData) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authService.register(
        formData.email,
        formData.password,
        formData.username
      );

      if (response.success) {
        setMessage({ type: 'success', text: response.message || t('auth.success.REGISTRATION_SUCCESS') });

        // 如果有 session（自動登入），跳轉到首頁
        if (response.session) {
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          // 否則切換到登入頁面
          setTimeout(() => {
            setActiveTab('login');
            setMessage({ type: 'info', text: t('auth.success.EMAIL_VERIFICATION_SENT') });
          }, 2000);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('auth.errors.REGISTRATION_ERROR');
      setMessage({
        type: 'error',
        text: errorMessage
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

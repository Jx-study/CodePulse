import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/Auth/LoginForm';
import SignupForm from '../../components/Auth/SignupForm';
import authService from '../../services/authService';
import styles from './Auth.module.scss';

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 注入翻譯函數到 authService
  React.useEffect(() => {
    authService.setTranslation(t);
  }, [t]);

  const showTab = (tab) => {
    setActiveTab(tab);
    setMessage({ type: '', text: '' }); // 清除訊息
  };

  const handleLoginSubmit = async (formData) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 使用 email 欄位進行登入
      const email = formData.usernameOrEmail;
      const response = await authService.login(email, formData.password);
      
      if (response.success) {
        setMessage({ type: 'success', text: response.message || t('auth.success.LOGIN_SUCCESS') });
        
        // 延遲跳轉到首頁
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || t('auth.errors.LOGIN_ERROR')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (formData) => {
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

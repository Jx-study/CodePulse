import { useTranslation } from 'react-i18next';
import type { LoginFormData, SignupFormData } from '@/types/pages/auth';
import type { FormAlertType } from '@/shared/components/FormAlert';
import LoginForm from '@/modules/auth/components/LoginForm/LoginForm';
import SignupForm from '@/modules/auth/components/SignupForm/SignupForm';
import FormAlert from '@/shared/components/FormAlert';
import Button from '@/shared/components/Button';
import Icon from '@/shared/components/Icon';
import styles from './AuthPanel.module.scss';

interface AuthPanelProps {
  activeTab: 'login' | 'signup';
  loading: boolean;
  alertMessage: string;
  alertType: FormAlertType;
  linkPromptEmail: string | null;
  onTabSwitch: (tab: 'login' | 'signup') => void;
  onGoogleLogin: () => void;
  onLoginSubmit: (data: LoginFormData) => void;
  onSignupSubmit: (data: SignupFormData) => void;
  onConfirmLink: () => void;
  onCancelLink: () => void;
}

const GoogleSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

function AuthPanel({
  activeTab,
  loading,
  alertMessage,
  alertType,
  linkPromptEmail,
  onTabSwitch,
  onGoogleLogin,
  onLoginSubmit,
  onSignupSubmit,
  onConfirmLink,
  onCancelLink,
}: AuthPanelProps) {
  const { t } = useTranslation('auth');
  if (linkPromptEmail) {
    return (
      <div className={styles.panel}>
        <div className={styles.content}>
          <div className={styles.linkHeader}>
            <div className={styles.linkIcon}>
              <GoogleSVG />
            </div>
            <h1 className={styles.title}>{t('linkGoogle.title')}</h1>
            <p className={styles.linkSubtitle}>
              {t('linkGoogle.subtitle')}
            </p>
          </div>

          <div className={styles.emailBadge}>
            <Icon name="envelope" size="sm" />
            <span>{linkPromptEmail}</span>
          </div>

          <p className={styles.linkDescription}>
            {t('linkGoogle.description')}
          </p>

          <FormAlert type={alertType} message={alertMessage} />

          <div className={styles.linkActions}>
            <Button
              variant="primary"
              onClick={onConfirmLink}
              disabled={loading}
              fullWidth
            >
              {t('linkGoogle.confirm')}
            </Button>
            <Button
              variant="ghost"
              onClick={onCancelLink}
              disabled={loading}
              fullWidth
            >
              {t('linkGoogle.cancel')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          {activeTab === 'login' ? t('welcomeBack') : t('createAccount')}
        </h1>

        <button
          type="button"
          className={styles.googleBtn}
          onClick={onGoogleLogin}
          disabled={loading}
        >
          <GoogleSVG />
          <span>{t('continueWithGoogle')}</span>
        </button>

        <div className={styles.divider}>
          <span>{t('or')}</span>
        </div>

        <div className={styles.formWrapper}>
          {activeTab === 'login' ? (
            <LoginForm
              onSubmit={onLoginSubmit}
              disabled={loading}
              alertMessage={alertMessage}
              alertType={alertType}
            />
          ) : (
            <SignupForm
              onSubmit={onSignupSubmit}
              disabled={loading}
              alertMessage={alertMessage}
              alertType={alertType}
            />
          )}
        </div>

        <p className={styles.switchLink}>
          {activeTab === 'login' ? (
            <>
              {t('noAccount', '還沒有帳號？')}
              <Button variant="ghost" size="sm" onClick={() => onTabSwitch('signup')} className={styles.switchBtn}>
                {t('registerNow', '立即註冊')}
              </Button>
            </>
          ) : (
            <>
              {t('hasAccount', '已有帳號？')}
              <Button variant="ghost" size="sm" onClick={() => onTabSwitch('login')} className={styles.switchBtn}>
                {t('loginNow', '立即登入')}
              </Button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthPanel;

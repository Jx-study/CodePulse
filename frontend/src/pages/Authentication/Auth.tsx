import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import LoginForm from "@/modules/auth/components/LoginForm/LoginForm";
import SignupForm from "@/modules/auth/components/SignupForm/SignupForm";
import { useAuth } from "@/shared/contexts/AuthContext";
import Button from "@/shared/components/Button";
import authService from "@/services/authService";
import styles from "./Auth.module.scss";

// 型別定義
type TabType = "login" | "signup";

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
  const location = useLocation();
  const { login, register, checkAuthStatus } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(
    searchParams.get("tab") === "signup" ? "signup" : "login"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState>({ type: "", text: "" });
  const [linkPromptEmail, setLinkPromptEmail] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { oauthError?: string; linkPromptEmail?: string } | null;
    if (state?.oauthError) {
      setMessage({ type: "error", text: state.oauthError });
    }
    if (state?.linkPromptEmail) {
      setLinkPromptEmail(state.linkPromptEmail);
    }
  }, [location.state]);

  const showTab = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams(tab === "signup" ? { tab: "signup" } : {});
    setMessage({ type: "", text: "" });
  };

  const handleLoginSubmit = async (formData: LoginFormData) => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // 使用 usernameOrEmail 欄位進行登入 (支援 email 或 username)
      await login(formData.usernameOrEmail, formData.password);

      // 登入成功
      setMessage({ type: "success", text: t("auth.success.LOGIN_SUCCESS") });

      // 延遲跳轉到首頁
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("auth.errors.LOGIN_ERROR");
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (formData: SignupFormData) => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await register(formData.email, formData.password, formData.username);

      // 驗證碼已寄出，跳轉到驗證頁面
      navigate("/auth/verify-email", { state: { email: formData.email } });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("auth.errors.REGISTRATION_ERROR");
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLink = async () => {
    setLoading(true);
    try {
      await authService.confirmGoogleLink();
      await checkAuthStatus();
      navigate("/dashboard", { state: { oauthLinked: true }, replace: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "綁定失敗，請稍後再試";
      setMessage({ type: "error", text: errorMessage });
      setLinkPromptEmail(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLink = async () => {
    await authService.cancelGoogleLink();
    setLinkPromptEmail(null);
  };

  if (linkPromptEmail) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.formContainer}>
          <div className={styles.message + " " + styles.info}>
            帳號 <strong>{linkPromptEmail}</strong> 已存在。是否要將 Google 登入綁定到此帳號？
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <Button
              variant="primary"
              onClick={handleConfirmLink}
              disabled={loading}
              fullWidth
            >
              確認綁定
            </Button>
            <Button
              variant="primaryOutline"
              onClick={handleCancelLink}
              disabled={loading}
              fullWidth
            >
              取消
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.tabs}>
        <Button
          variant="ghost"
          className={`${styles.tabButton} ${activeTab === "login" ? styles.active : ""}`}
          onClick={() => showTab("login")}
          disabled={loading}
        >
          {t("login")}
        </Button>
        <Button
          variant="ghost"
          className={`${styles.tabButton} ${activeTab === "signup" ? styles.active : ""}`}
          onClick={() => showTab("signup")}
          disabled={loading}
        >
          {t("register")}
        </Button>
      </div>

      {/* 訊息顯示區域 */}
      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* Loading 狀態 */}
      {loading && (
        <div className={styles.loading}>{t("loading", "處理中...")}</div>
      )}

      <div className={styles.formContainer}>
        {activeTab === "login" && (
          <LoginForm onSubmit={handleLoginSubmit} disabled={loading} />
        )}

        {activeTab === "signup" && (
          <SignupForm onSubmit={handleSignupSubmit} disabled={loading} />
        )}
      </div>

      {activeTab === "login" && (
        <div className={styles.oauthSection}>
          <div className={styles.oauthDivider}>
            <span>或</span>
          </div>
          <Button
            variant="primaryOutline"
            onClick={() => authService.loginWithGoogle()}
            fullWidth
          >
            Sign in with Google
          </Button>
        </div>
      )}
    </div>
  );
}

export default AuthPage;

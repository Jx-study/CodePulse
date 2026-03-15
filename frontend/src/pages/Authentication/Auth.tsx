import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";
import authService from "@/services/authService";
import type { LoginFormData, SignupFormData, AuthMessageType } from "@/types/pages/auth";
import GameOfLifePanel from "@/modules/auth/components/GameOfLifePanel";
import AuthPanel from "@/modules/auth/components/AuthPanel";
import styles from "./Auth.module.scss";

type TabType = "login" | "signup";

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
  const [message, setMessage] = useState<{ type: AuthMessageType; text: string }>({
    type: "",
    text: "",
  });
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

  const handleTabSwitch = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams(tab === "signup" ? { tab: "signup" } : {});
    setMessage({ type: "", text: "" });
  };

  const handleGoogleLogin = () => {
    authService.loginWithGoogle();
  };

  const handleLoginSubmit = async (formData: LoginFormData) => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await login(formData.usernameOrEmail, formData.password);
      setMessage({ type: "success", text: t("auth.success.LOGIN_SUCCESS") });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("auth.errors.LOGIN_ERROR");
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (formData: SignupFormData) => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await register(formData.email, formData.password, formData.username);
      navigate("/auth/verify-email", { state: { email: formData.email } });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("auth.errors.REGISTRATION_ERROR");
      setMessage({ type: "error", text: errorMessage });
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

  return (
    <div className={styles.authLayout}>
      <div className={styles.leftPanel}>
        <GameOfLifePanel />
      </div>
      <div className={styles.rightPanel}>
        <AuthPanel
          activeTab={activeTab}
          loading={loading}
          message={message}
          linkPromptEmail={linkPromptEmail}
          onTabSwitch={handleTabSwitch}
          onGoogleLogin={handleGoogleLogin}
          onLoginSubmit={handleLoginSubmit}
          onSignupSubmit={handleSignupSubmit}
          onConfirmLink={handleConfirmLink}
          onCancelLink={handleCancelLink}
        />
      </div>
    </div>
  );
}

export default AuthPage;

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams, useLocation, useMatch } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";
import authService from "@/services/authService";
import type { LoginFormData, SignupFormData } from "@/types/pages/auth";
import type { FormAlertType } from "@/shared/components/FormAlert";
import GameOfLifePanel from "@/modules/auth/components/GameOfLifePanel";
import AuthPanel from "@/modules/auth/components/AuthPanel";
import OnboardingForm from "@/modules/auth/components/OnboardingForm";
import WelcomeOverlay from "@/modules/auth/components/WelcomeOverlay";
import { SkeletonText } from "@/shared/components/Skeleton";
import styles from "./Auth.module.scss";

type TabType = "login" | "signup";

function AuthPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, checkAuthStatus } = useAuth();
  const isOnboarding = useMatch("/auth/onboarding");
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(
    searchParams.get("tab") === "signup" ? "signup" : "login"
  );
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<FormAlertType>("error");
  const [linkPromptEmail, setLinkPromptEmail] = useState<string | null>(null);

  // Onboarding state
  const [onboardingInfo, setOnboardingInfo] = useState({ email: "", display_name: "" });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [usernameError, setUsernameError] = useState("");
  const [formError, setFormError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [submittedUsername, setSubmittedUsername] = useState("");

  const setAlert = (type: FormAlertType, message: string) => {
    setAlertType(type);
    setAlertMessage(message);
  };

  const clearAlert = () => setAlertMessage("");

  useEffect(() => {
    const state = location.state as { oauthError?: string; linkPromptEmail?: string } | null;
    if (state?.oauthError) {
      setAlert("error", state.oauthError);
    }
    if (state?.linkPromptEmail) {
      setLinkPromptEmail(state.linkPromptEmail);
    }
  }, [location.state]);

  useEffect(() => {
    if (!isOnboarding) return;
    authService
      .getOnboardingInfo()
      .then((data) => setOnboardingInfo({ email: data.email, display_name: data.display_name }))
      .catch(() => navigate("/auth", { replace: true }))
      .finally(() => setIsInitialLoading(false));
  }, [isOnboarding]);

  const handleOnboardingSubmit = async (username: string, displayName: string) => {
    setLoading(true);
    setUsernameError("");
    setFormError("");
    try {
      await authService.completeSetup(username, displayName);
      try {
        await checkAuthStatus();
      } catch {}
      setSubmittedUsername(username);
      setShowWelcome(true);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error_code?: string }; status?: number } };
      const errorCode = axiosError?.response?.data?.error_code;
      const status = axiosError?.response?.status;
      if (status === 400 && errorCode === "INVALID_USERNAME") {
        setUsernameError(t("invalidUsername", "用戶名格式不正確"));
      } else if (status === 400 && errorCode === "RESERVED_USERNAME") {
        setUsernameError(t("reservedUsername", "此名稱不可使用，請換一個"));
      } else if (status === 409) {
        setUsernameError(t("usernameTaken", "此名稱已被使用"));
      } else if (status === 401) {
        setFormError(t("onboardingExpired", "連結已過期，請重新使用 Google 登入"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams(tab === "signup" ? { tab: "signup" } : {});
    clearAlert();
  };

  const handleGoogleLogin = () => {
    authService.loginWithGoogle();
  };

  const handleLoginSubmit = async (formData: LoginFormData) => {
    setLoading(true);
    clearAlert();
    try {
      await login(formData.usernameOrEmail, formData.password);
      // Login succeeded — navigate immediately, no success message needed
      navigate("/");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("auth.errors.LOGIN_ERROR");
      setAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (formData: SignupFormData) => {
    setLoading(true);
    clearAlert();
    try {
      await register(formData.email, formData.password, formData.username);
      navigate("/auth/verify-email", { state: { email: formData.email } });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("auth.errors.REGISTRATION_ERROR");
      setAlert("error", errorMessage);
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
        error instanceof Error ? error.message : t("linkFailed", "綁定失敗，請稍後再試");
      setAlert("error", errorMessage);
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
    <>
      <div className={styles.authLayout}>
        <div className={styles.leftPanel}>
          <GameOfLifePanel />
        </div>
        <div className={styles.rightPanel}>
          {isOnboarding ? (
            isInitialLoading ? (
              <div className={styles.loadingPanel}>
                <SkeletonText lines={5} width={["60%", "80%", "100%", "100%", "40%"]} />
              </div>
            ) : (
              <OnboardingForm
                email={onboardingInfo.email}
                displayNamePlaceholder={onboardingInfo.display_name}
                loading={loading}
                usernameError={usernameError}
                formError={formError}
                onSubmit={handleOnboardingSubmit}
              />
            )
          ) : (
            <AuthPanel
              activeTab={activeTab}
              loading={loading}
              alertMessage={alertMessage}
              alertType={alertType}
              linkPromptEmail={linkPromptEmail}
              onTabSwitch={handleTabSwitch}
              onGoogleLogin={handleGoogleLogin}
              onLoginSubmit={handleLoginSubmit}
              onSignupSubmit={handleSignupSubmit}
              onConfirmLink={handleConfirmLink}
              onCancelLink={handleCancelLink}
            />
          )}
        </div>
      </div>
      {showWelcome && (
        <WelcomeOverlay
          username={submittedUsername}
          onComplete={() => navigate("/")}
        />
      )}
    </>
  );
}

export default AuthPage;

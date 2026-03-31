import { useEffect, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Auth Context
import { AuthProvider, useAuth } from "./shared/contexts/AuthContext";
import { ToastContainer } from "@/shared/components/Toast";
import CheckinDialog from '@/modules/user/components/CheckinDialog';
import XpFloat from '@/shared/components/XpFloat';

// Layouts
import MainLayout from "./shared/layouts/MainLayout";
import AuthLayout from "./shared/layouts/AuthLayout";

// Skeleton Loading
import { PageSkeleton } from "./shared/components/Skeleton";

// Pages
import Home from "./pages/Home/Home";
import AuthPage from "./pages/Authentication/Auth";
import VerifyEmailPage from "./pages/Authentication/VerifyEmail";
import ForgotPasswordPage from "./pages/Authentication/ForgotPassword";
import ResetPasswordPage from "./pages/Authentication/ResetPassword";
import OAuthCallback from "./pages/Authentication/OAuthCallback";
import Tutorial from "./pages/Tutorial/Tutorial";
import Practice from "./pages/Practice/Practice";
import Explorer from "./pages/Explorer/Explorer";
import Lab from "./pages/Explorer/Lab";
import Playground from "./pages/Explorer/Playground";
import About from "./pages/About/About";
import LearningDashboard from "./pages/LearningDashboard/LearningDashboard";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import WelcomeOverlay from "./modules/auth/components/WelcomeOverlay";

function CheckinWrapper() {
  const { isLoading, showCheckinDialog, setShowCheckinDialog } = useAuth();
  if (isLoading) return null;
  return (
    <CheckinDialog
      isOpen={showCheckinDialog}
      onClose={() => setShowCheckinDialog(false)}
    />
  );
}

function WelcomeWrapper() {
  const { pendingWelcome, setPendingWelcome } = useAuth();
  const navigate = useNavigate();
  if (!pendingWelcome) return null;
  return (
    <WelcomeOverlay
      username={pendingWelcome.username}
      onComplete={() => {
        setPendingWelcome(null);
        navigate("/");
      }}
    />
  );
}

function ThemeApplier() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const theme = user?.theme ?? 'system';
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [user?.theme, isLoading]);

  return null;
}

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // 根據語言設置 HTML lang 屬性
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <AuthProvider>
      <ThemeApplier />
      <CheckinWrapper />
      <WelcomeWrapper />
      <ToastContainer />
      <XpFloat />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* 主布局 */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<LearningDashboard />} />
            <Route path="/tutorial" element={<Tutorial />} />
            <Route path="/tutorial/:category/:levelId" element={<Tutorial />} />
            <Route element={<ProtectedRoute />}>
              <Route
                path="/practice/:category/:levelId"
                element={<Practice />}
              />
            </Route>
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/explorer/lab" element={<Lab />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/explorer/playground" element={<Playground />} />
            </Route>
            <Route path="/about" element={<About />} />
          </Route>

          {/* 登入页面布局 */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<AuthPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="callback" element={<OAuthCallback />} />
            <Route path="onboarding" element={<AuthPage />} />
            <Route path="survey" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;

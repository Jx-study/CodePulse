import React, { useEffect, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Auth Context
import { AuthProvider } from "./shared/contexts/AuthContext";

// Layouts
import MainLayout from "./shared/layouts/MainLayout";
import AuthLayout from "./shared/layouts/AuthLayout";

// Skeleton Loading
import { PageSkeleton } from "./shared/components/Skeleton";

// Pages - 使用動態導入進行代碼分割
const Home = React.lazy(() => import("./pages/Home/Home"));
const AuthPage = React.lazy(() => import("./pages/Authentication/Auth"));
const Tutorial = React.lazy(() => import("./pages/Tutorial/Tutorial"));
const Explorer = React.lazy(() => import("./pages/Explorer/Explorer"));
const About = React.lazy(() => import("./pages/About/About"));
const LearningDashboard = React.lazy(
  () => import("./pages/LearningDashboard/LearningDashboard")
);

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // 根據語言設置 HTML lang 屬性
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <AuthProvider>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* 主布局 */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<LearningDashboard />} />
            <Route path="/tutorial" element={<Tutorial />} />
            <Route
              path="/tutorial/:category/:levelId"
              element={<Tutorial />}
            />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/about" element={<About />} />
          </Route>

          {/* 登入页面布局 */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<AuthPage />} />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;

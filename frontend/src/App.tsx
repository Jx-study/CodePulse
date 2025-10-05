import React, { useEffect, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Layouts
import MainLayout from './shared/layouts/MainLayout';
import AuthLayout from './shared/layouts/AuthLayout';

// Pages - 使用動態導入進行代碼分割
const Home = React.lazy(() => import('./pages/Home/Home'));
const AuthPage = React.lazy(() => import('./pages/Authentication/Auth'));
const Tutorial = React.lazy(() => import('./pages/Tutorial/Tutorial'));
const Explorer = React.lazy(() => import('./pages/Explorer/Explorer'));
const About = React.lazy(() => import('./pages/About/About'));
const LearningDashboard = React.lazy(() => import('./pages/LearningDashboard/LearningDashboard'));

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // 根据语言设置 HTML lang 属性
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Suspense fallback={<div className="loading-spinner">載入中...</div>}>
      <Routes>
        {/* 主布局 */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tutorial" element={<Tutorial />} />
          <Route path="/tutorial/:category/:algorithm" element={<Tutorial />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<LearningDashboard />} />
        </Route>

        {/* 其他页面布局 */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<AuthPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;

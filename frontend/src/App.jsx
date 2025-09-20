import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Home from './pages/Home/Home';
import AuthPage from './pages/Authentication/Auth';
import Tutorial from './pages/Tutorial/Tutorial';
import Explorer from './pages/Explorer/Explorer';
import About from './pages/About/About';
import LearningDashboard from './pages/LearningDashboard/LearningDashboard';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // 根据语言设置 HTML lang 属性
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
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
  );
}

export default App;

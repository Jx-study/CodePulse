import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import App from './App.tsx'
import { ThemeProvider } from '@/shared/contexts/ThemeContext'
import './shared/styles/main.scss';
import './i18n';

// 會找到 index.html 中 #root 的 HTML 元素，並將App渲染到DOM 元素中
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider>
      {/* reducedMotion="user"：讓所有 motion/react 動畫全域尊重 OS 的 prefers-reduced-motion 設定 */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </ThemeProvider>
  </BrowserRouter>
)

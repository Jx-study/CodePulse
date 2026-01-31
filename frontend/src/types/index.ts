/**
 * Types Index
 * 統一導出所有類型定義
 */

// ==================== Animation Types (Shared) ====================
export * from './animation';

// ==================== Component Types ====================
export * from './components/common';
export * from './components/form';
export * from './components/feedback';
export * from './components/navigation';
export * from './components/display';
export * from './components/skeleton';

// ==================== Page Types ====================
export * from './pages/dashboard';

// ==================== Context Types ====================
export * from './contexts/auth';

// ==================== API Types ====================
export * from './api/common';

// ==================== General Types ====================

// React 組件 Props 類型
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

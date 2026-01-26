/**
 * Feedback Component Types
 * 反饋類組件的類型定義 (Dialog, Tooltip, EmptyState 等)
 */

// ==================== Dialog Component ====================
export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'sidebar';
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  closeButtonIcon?: React.ReactNode;
  'aria-label'?: string;
  'aria-describedby'?: string;
  animationDuration?: number;
  onAfterOpen?: () => void;
  onAfterClose?: () => void;
  [key: string]: any;
}

// ==================== Tooltip Component ====================
export interface TooltipProps {
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  disabled?: boolean;
  children: React.ReactElement;
  className?: string;
  tooltipClassName?: string;
  'aria-label'?: string;
  [key: string]: any;
}

// ==================== EmptyState Component ====================
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  'aria-label'?: string;
  [key: string]: any;
}

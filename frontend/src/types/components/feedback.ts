/**
 * Feedback Component Types
 * 反饋類組件的類型定義 (Dialog, Tooltip, EmptyState 等)
 */

// ==================== Dialog Component ====================
export interface DialogProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'sidebar';
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
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
}

// ==================== Sidebar Component ====================
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  placement?: 'left' | 'right';      // default: 'left'
  width?: 'sm' | 'md' | 'lg';        // default: 'md'
  closeOnOverlayClick?: boolean;      // default: true
  closeOnEscape?: boolean;            // default: true
  showCloseButton?: boolean;          // default: true
  className?: string;
  contentClassName?: string;
  'aria-label'?: string;
}

// ==================== Tooltip Component ====================
/**
 * Props shape Tooltip actually reads/writes on its `children` element
 * (merges refs, wraps mouse/focus handlers). The index signature lets
 * arbitrary other DOM props (e.g. `aria-describedby`) pass through
 * `cloneElement` without excess-property errors.
 */
export interface TooltipChildProps {
  ref?: React.Ref<HTMLElement>;
  className?: string;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
  [key: string]: unknown;
}

export interface TooltipProps {
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  disabled?: boolean;
  children: React.ReactElement<TooltipChildProps>;
  className?: string;
  tooltipClassName?: string;
  'aria-label'?: string;
}

// ==================== EmptyState Component ====================
export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
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
}

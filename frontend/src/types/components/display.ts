/**
 * Display Component Types
 * 展示類組件的類型定義 (InfoBlock, ProgressBar, StarRating 等)
 */

// ==================== InfoBlock Component ====================
export interface InfoBlockProps {
  title?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  'aria-label'?: string;
  [key: string]: any;
}

// ==================== ProgressBar Component ====================
export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom' | 'inside' | 'none';
  animated?: boolean;
  striped?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  formatLabel?: (value: number, max: number) => string;
  [key: string]: any;
}

// ==================== StarRating Component ====================
export interface StarRatingProps {
  value: number;
  max?: number;
  readonly?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: 'star' | 'emoji';
  color?: 'default' | 'primary' | 'success' | 'warning';
  onChange?: (value: number) => void;
  allowHalf?: boolean;
  allowClear?: boolean;
  className?: string;
  gap?: number;
  'aria-label'?: string;
  showValue?: boolean;
  [key: string]: any;
}

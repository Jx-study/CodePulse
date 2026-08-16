/**
 * Display Component Types
 * 展示類組件的類型定義 (InfoBlock, ProgressBar, StarRating 等)
 */

// ==================== BaseCanvasProps ====================
export interface BaseCanvasProps {
  enableZoom?: boolean;
  enablePan?: boolean;
  width?: number;
  height?: number;
}

// ==================== ProgressBar Component ====================
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
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
}

// ==================== StarRating Component ====================
export interface StarRatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
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
}

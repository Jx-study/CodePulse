/**
 * Common Component Types
 * 基礎通用組件的類型定義
 */

// ==================== Button Component ====================
export interface ButtonProps {
  variant?: 'primary' | 'primaryOutline' | 'secondary' | 'ghost' | 'danger' | 'icon' | 'dot';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  icon?: string;
  iconOnly?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  children?: React.ReactNode;
  'aria-label'?: string;
  [key: string]: any;
}

// ==================== Card Component ====================
export interface CardCategory {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export interface CardProps {
  variant?: 'default' | 'algorithm';
  layout?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  image?: React.ReactNode | string;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  category?: CardCategory;
  difficulty?: number;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  role?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

// ==================== Avatar Component ====================
export interface AvatarProps {
  username?: string;
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  colorScheme?: 'auto' | 'primary' | 'success' | 'warning' | 'danger';
  showBorder?: boolean;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
  [key: string]: any;
}

// ==================== Badge Component ====================
export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'pill' | 'rounded' | 'square';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  clickable?: boolean;
  onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  role?: string;
  [key: string]: any;
}

// ==================== Icon Component ====================
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconColor = 'primary' | 'secondary' | 'danger' | 'muted' | 'inherit';
export type IconAnimation = 'spin' | 'pulse';

export interface IconProps {
  name: string;
  size?: IconSize;
  color?: IconColor;
  animation?: IconAnimation;
  className?: string;
  ariaLabel?: string;
  title?: string;
  onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  decorative?: boolean;
}

// ==================== Divider Component ====================
export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'primary' | 'light';
  thickness?: 'thin' | 'medium' | 'thick';
  variant?: 'solid' | 'dashed' | 'dotted';
  label?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  [key: string]: any;
}
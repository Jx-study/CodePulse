/**
 * Common Component Types
 * 基礎通用組件的類型定義
 */

// ==================== Button Component ====================
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'> {
  ref?: React.Ref<HTMLButtonElement>;
  variant?: 'primary' | 'primaryOutline' | 'secondary' | 'ghost' | 'danger' | 'icon' | 'dot' | 'glass' | 'gameCtrl' | 'unstyled' | 'glow';
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
}

// ==================== Card Component ====================
interface CardCategory {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick' | 'title' | 'role'> {
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
}

// ==================== Avatar Component ====================
export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
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
}

// ==================== Badge Component ====================
export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onClick' | 'role'> {
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
}

// ==================== Icon Component ====================
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconColor = 'primary' | 'secondary' | 'success' | 'danger' | 'error' | 'muted' | 'inherit';
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
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'primary' | 'light';
  thickness?: 'thin' | 'medium' | 'thick';
  variant?: 'solid' | 'dashed' | 'dotted';
  label?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}
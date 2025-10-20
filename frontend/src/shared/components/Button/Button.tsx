import React from 'react';
import styles from './Button.module.scss';

export interface ButtonProps {
  variant?: 'primary' | 'primary-outline' | 'secondary' | 'ghost' | 'danger' | 'icon' | 'dot';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  children?: React.ReactNode;
  'aria-label'?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  type = 'button',
  onClick,
  className = '',
  children,
  'aria-label': ariaLabel,
}) => {
  // 點擊事件處理（防止 disabled 或 loading 時觸發）
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  // 動態 className 生成
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    loading && styles.loading,
    fullWidth && styles.fullWidth,
    className
  ].filter(Boolean).join(' ');

  // Loading Spinner 渲染
  const renderSpinner = () => (
    <span className={styles.spinner} />
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled}
    >
      {loading && renderSpinner()}
      {!loading && iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
      {children && <span className={styles.content}>{children}</span>}
      {!loading && iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </button>
  );
};

export default React.memo(Button);

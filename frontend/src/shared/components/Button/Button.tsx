import React from 'react';
import styles from './Button.module.scss';

export interface ButtonProps {
  variant?: 'primary' | 'primaryOutline' | 'secondary' | 'ghost' | 'danger' | 'icon' | 'dot';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
  children?: React.ReactNode;
  'aria-label'?: string;
  as?: React.ElementType; // 支援自定義元素類型 (如 Link)
  to?: string; // 支援 React Router Link 的 to prop
  href?: string; // 支援原生 <a> 的 href
  [key: string]: any; // 支援其他額外 props
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
  as,
  to,
  href,
  ...restProps
}) => {
  // 決定渲染的元素類型
  const Component = as || (to || href ? 'a' : 'button');

  // 點擊事件處理（防止 disabled 或 loading 時觸發）
  const handleClick = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
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

  // 準備 props（根據元素類型）
  const elementProps: any = {
    className: buttonClasses,
    onClick: handleClick,
    'aria-label': ariaLabel,
    'aria-busy': loading,
    'aria-disabled': disabled,
    ...restProps,
  };

  // 如果是 button 元素，添加 type 和 disabled
  if (Component === 'button') {
    elementProps.type = type;
    elementProps.disabled = disabled || loading;
  }

  // 如果有 to prop (React Router Link)
  if (to) {
    elementProps.to = to;
  }

  // 如果有 href prop (原生 <a>)
  if (href) {
    elementProps.href = href;
  }

  return (
    <Component {...elementProps}>
      {loading && renderSpinner()}
      {!loading && iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
      {children && <span className={styles.content}>{children}</span>}
      {!loading && iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </Component>
  );
};

export default React.memo(Button);

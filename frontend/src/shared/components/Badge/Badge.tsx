import React from 'react';
import type { BadgeProps } from '@/types';
import styles from './Badge.module.scss';

const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  children,
  icon,
  iconPosition = 'left',
  clickable = false,
  onClick,
  className = '',
  style,
  'aria-label': ariaLabel,
  role,
  ...restProps
}) => {
  const isClickable = clickable || !!onClick;

  const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (onClick) {
      onClick(event);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.(event as any);
    }
  };

  const badgeClasses = [
    styles.badge,
    styles[variant],
    styles[size],
    styles[shape],
    isClickable && styles.clickable,
    className
  ].filter(Boolean).join(' ');

  const iconClasses = [
    styles.icon,
    iconPosition === 'left' ? styles.iconLeft : styles.iconRight
  ].filter(Boolean).join(' ');

  return (
    <span
      className={badgeClasses}
      style={style}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={role || (isClickable ? 'button' : undefined)}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel}
      {...restProps}
    >
      {icon && (
        <span className={iconClasses}>{icon}</span>
      )}
      {children}
    </span>
  );
};

export default React.memo(Badge);

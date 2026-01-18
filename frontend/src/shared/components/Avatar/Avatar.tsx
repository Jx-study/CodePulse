import React from 'react';
import type { AvatarProps } from '@/types';
import styles from './Avatar.module.scss';

const Avatar: React.FC<AvatarProps> = ({
  username = '',
  src,
  alt,
  size = 'md',
  shape = 'circle',
  colorScheme = 'auto',
  showBorder = false,
  className = '',
  onClick,
  'aria-label': ariaLabel,
  ...restProps
}) => {
  const getInitials = (name: string): string => {
    if (!name) return '?';

    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAutoColor = (name: string): string => {
    if (!name) return 'primary';

    const colors = ['primary', 'success', 'warning', 'danger', 'info'];
    const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return colors[charCode % colors.length];
  };

  const initials = getInitials(username);
  const finalColorScheme = colorScheme === 'auto' ? getAutoColor(username) : colorScheme;

  const containerClasses = [
    styles.avatar,
    styles[size],
    styles[shape],
    styles[`color${finalColorScheme.charAt(0).toUpperCase()}${finalColorScheme.slice(1)}`],
    showBorder && styles.bordered,
    onClick && styles.clickable,
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={containerClasses}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel || `Avatar for ${username || 'user'}`}
      {...restProps}
    >
      {src ? (
        <img
          src={src}
          alt={alt || username || 'Avatar'}
          className={styles.image}
          loading="lazy"
        />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </div>
  );
};

export default React.memo(Avatar);

import React from 'react';
import type { EmptyStateProps } from '@/types';
import styles from './EmptyState.module.scss';

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  size = 'md',
  variant = 'default',
  className = '',
  iconClassName = '',
  titleClassName = '',
  descriptionClassName = '',
  'aria-label': ariaLabel,
  ...restProps
}) => {
  const containerClasses = [
    styles.emptyState,
    styles[size],
    styles[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      role="status"
      aria-label={ariaLabel || 'Empty state'}
      {...restProps}
    >
      {icon && (
        <div className={`${styles.icon} ${iconClassName}`}>
          {icon}
        </div>
      )}

      {title && (
        <h3 className={`${styles.title} ${titleClassName}`}>
          {title}
        </h3>
      )}

      {description && (
        <p className={`${styles.description} ${descriptionClassName}`}>
          {description}
        </p>
      )}

      {action && (
        <div className={styles.action}>
          {action}
        </div>
      )}
    </div>
  );
};

export default React.memo(EmptyState);

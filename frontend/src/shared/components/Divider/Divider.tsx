import React from 'react';
import type { DividerProps } from '@/types';
import styles from './Divider.module.scss';

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  spacing = 'md',
  color = 'default',
  thickness = 'thin',
  variant = 'solid',
  label,
  className = '',
  'aria-label': ariaLabel,
  ...restProps
}) => {
  const containerClasses = [
    styles.divider,
    styles[orientation],
    styles[`spacing${spacing.charAt(0).toUpperCase()}${spacing.slice(1)}`],
    styles[`color${color.charAt(0).toUpperCase()}${color.slice(1)}`],
    styles[`thickness${thickness.charAt(0).toUpperCase()}${thickness.slice(1)}`],
    styles[variant],
    label && styles.withLabel,
    className
  ].filter(Boolean).join(' ');

  if (label && orientation === 'horizontal') {
    return (
      <div
        className={containerClasses}
        role="separator"
        aria-label={ariaLabel || 'Divider with label'}
        {...restProps}
      >
        <span className={styles.line} />
        <span className={styles.label}>{label}</span>
        <span className={styles.line} />
      </div>
    );
  }

  return (
    <div
      className={containerClasses}
      role="separator"
      aria-label={ariaLabel || 'Divider'}
      aria-orientation={orientation}
      {...restProps}
    />
  );
};

export default React.memo(Divider);

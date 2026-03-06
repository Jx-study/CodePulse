import React from 'react';
import type { ProgressBarProps } from '@/types';
import styles from './ProgressBar.module.scss';

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'primary',
  color,
  size = 'md',
  showLabel = true,
  labelPosition = 'bottom',
  animated = true,
  striped = false,
  className = '',
  style,
  'aria-label': ariaLabel,
  formatLabel,
  ...restProps
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const defaultFormatLabel = (val: number, maxVal: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const labelText = formatLabel
    ? formatLabel(value, max)
    : defaultFormatLabel(value, max);

  const containerClasses = [
    styles.progressBarContainer,
    styles[size],
    className
  ].filter(Boolean).join(' ');

  const barClasses = [
    styles.progressBar,
    color ? styles.custom : styles[variant],
    animated && styles.animated,
    striped && styles.striped
  ].filter(Boolean).join(' ');

  const renderLabel = () => {
    if (!showLabel || labelPosition === 'none') return null;

    if (labelPosition === 'inside') {
      return (
        <span className={styles.labelInside}>
          {labelText}
        </span>
      );
    }

    return (
      <div className={`${styles.label} ${styles[`label${labelPosition.charAt(0).toUpperCase()}${labelPosition.slice(1)}`]}`}>
        {labelText}
      </div>
    );
  };

  return (
    <div className={styles.progressWrapper} {...restProps}>
      {labelPosition === 'top' && renderLabel()}

      <div
        className={containerClasses}
        style={style}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || `Progress: ${labelText}`}
      >
        <div
          className={barClasses}
          style={{
            width: `${percentage}%`,
            ...(color ? { "--progress-color": color } as React.CSSProperties : {}),
          }}
        >
          {labelPosition === 'inside' && renderLabel()}
        </div>
      </div>

      {labelPosition === 'bottom' && renderLabel()}
    </div>
  );
};

export default React.memo(ProgressBar);

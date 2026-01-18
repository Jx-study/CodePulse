import React, { useState } from 'react';
import type { StarRatingProps } from '@/types';
import styles from './StarRating.module.scss';

const StarRating: React.FC<StarRatingProps> = ({
  value,
  max = 5,
  readonly = true,
  size = 'md',
  icon = 'star',
  color = 'default',
  onChange,
  allowHalf = false,
  allowClear = false,
  className = '',
  gap,
  'aria-label': ariaLabel,
  showValue = false,
  ...restProps
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const isInteractive = !readonly && !!onChange;

  const starSymbol = icon === 'emoji' ? '⭐' : '★';

  const containerClasses = [
    styles.starRating,
    styles[size],
    styles[icon],
    isInteractive && styles.interactive,
    styles[`color${color.charAt(0).toUpperCase()}${color.slice(1)}`],
    className
  ].filter(Boolean).join(' ');

  const handleStarClick = (starIndex: number) => {
    if (!isInteractive) return;

    const newValue = starIndex + 1;

    if (allowClear && newValue === value) {
      onChange?.(0);
    } else {
      onChange?.(newValue);
    }
  };

  const handleStarHover = (starIndex: number) => {
    if (!isInteractive) return;
    setHoverValue(starIndex + 1);
  };

  const handleMouseLeave = () => {
    if (!isInteractive) return;
    setHoverValue(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent, starIndex: number) => {
    if (!isInteractive) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStarClick(starIndex);
    }
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  const renderStars = () => {
    const stars = [];

    for (let i = 0; i < max; i++) {
      const isFilled = i < displayValue;
      const isHalf = allowHalf && i === Math.floor(displayValue) && displayValue % 1 !== 0;

      const starClasses = [
        styles.star,
        isFilled ? styles.filled : styles.empty,
        isHalf && styles.half,
        isInteractive && styles.interactive
      ].filter(Boolean).join(' ');

      stars.push(
        <span
          key={i}
          className={starClasses}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          role={isInteractive ? 'button' : undefined}
          tabIndex={isInteractive ? 0 : undefined}
          aria-label={isInteractive ? `Rate ${i + 1} out of ${max}` : undefined}
        >
          {starSymbol}
        </span>
      );
    }

    return stars;
  };

  return (
    <div
      className={containerClasses}
      onMouseLeave={handleMouseLeave}
      style={gap !== undefined ? { gap: `${gap}px` } : undefined}
      aria-label={ariaLabel || `Rating: ${value} out of ${max}`}
      {...restProps}
    >
      {renderStars()}
      {showValue && (
        <span className={styles.valueDisplay}>
          {value}/{max}
        </span>
      )}
    </div>
  );
};

export default React.memo(StarRating);

import React from 'react';
import type { CardProps } from '@/types';
import Badge from '../Badge/Badge';
import StarRating from '../StarRating/StarRating';
import styles from './Card.module.scss';

const Card: React.FC<CardProps> = ({
  variant = 'default',
  layout = 'vertical',
  size = 'md',
  image,
  icon,
  title,
  description,
  footer,
  header,
  category,
  difficulty,
  hoverable = true,
  clickable = false,
  onClick,
  className = '',
  style,
  'aria-label': ariaLabel,
  role,
  children,
  ...restProps
}) => {
  const isClickable = clickable || !!onClick;

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick(event);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.(event as any);
    }
  };

  const cardClasses = [
    styles.card,
    styles[variant],
    styles[layout],
    styles[size],
    hoverable && styles.hoverable,
    isClickable && styles.clickable,
    category && styles[`category${category.variant?.charAt(0).toUpperCase()}${category.variant?.slice(1)}`],
    className
  ].filter(Boolean).join(' ');

  const renderMedia = () => {
    if (icon) {
      return (
        <div className={`${styles.iconContainer} ${styles.featureIcon}`}>
          {icon}
        </div>
      );
    }

    if (image) {
      const imageContainerClass = variant === 'algorithm'
        ? styles.algorithmImage
        : styles.imageContainer;

      return (
        <div className={imageContainerClass}>
          {typeof image === 'string' ? (
            <img src={image} alt="" loading="lazy" />
          ) : (
            image
          )}
        </div>
      );
    }

    return null;
  };

  const renderHeader = () => {
    if (header) return header;

    if (!title && difficulty === undefined) return null;

    return (
      <div className={styles.header}>
        {title && (
          <h3 className={styles.title}>
            {title}
          </h3>
        )}
        {difficulty !== undefined && (
          <StarRating value={difficulty} max={5} size="sm" readonly />
        )}
      </div>
    );
  };

  const renderFooter = () => {
    if (!footer && !category) return null;

    return (
      <div className={styles.footer}>
        {category && (
          <Badge
            variant={category.variant || 'primary'}
            size="sm"
          >
            {category.label}
          </Badge>
        )}
        {footer}
      </div>
    );
  };

  const renderStructuredContent = () => {
    if (layout === 'horizontal') {
      return (
        <>
          {renderMedia()}
          <div className={styles.contentWrapper}>
            {renderHeader()}
            {description && (
              <p className={styles.description}>{description}</p>
            )}
            {renderFooter()}
          </div>
        </>
      );
    }

    return (
      <>
        {renderMedia()}
        {renderHeader()}
        {description && (
          <p className={styles.description}>{description}</p>
        )}
        {renderFooter()}
      </>
    );
  };

  return (
    <div
      className={cardClasses}
      style={style}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={role || (isClickable ? 'button' : undefined)}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel}
      {...restProps}
    >
      {children || renderStructuredContent()}
    </div>
  );
};

export default React.memo(Card);

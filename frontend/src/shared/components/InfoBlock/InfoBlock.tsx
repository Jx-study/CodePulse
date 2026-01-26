import React from 'react';
import type { InfoBlockProps } from '@/types';
import styles from './InfoBlock.module.scss';

const InfoBlock: React.FC<InfoBlockProps> = ({
  title,
  variant = 'default',
  size = 'md',
  icon,
  footer,
  collapsible = false,
  defaultCollapsed = false,
  children,
  className = '',
  titleClassName = '',
  contentClassName = '',
  'aria-label': ariaLabel,
  ...restProps
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(prev => !prev);
    }
  };

  const containerClasses = [
    styles.infoBlock,
    styles[variant],
    styles[size],
    collapsible && styles.collapsible,
    isCollapsed && styles.collapsed,
    className
  ].filter(Boolean).join(' ');

  const titleClasses = [
    styles.title,
    titleClassName
  ].filter(Boolean).join(' ');

  const contentClasses = [
    styles.content,
    contentClassName
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      aria-label={ariaLabel}
      {...restProps}
    >
      {title && (
        <div
          className={titleClasses}
          onClick={handleToggle}
          role={collapsible ? 'button' : undefined}
          tabIndex={collapsible ? 0 : undefined}
          onKeyDown={(e) => {
            if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleToggle();
            }
          }}
          aria-expanded={collapsible ? !isCollapsed : undefined}
        >
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={styles.titleText}>{title}</span>
          {collapsible && (
            <span className={styles.collapseIcon}>
              {isCollapsed ? '▶' : '▼'}
            </span>
          )}
        </div>
      )}

      {!isCollapsed && (
        <>
          <div className={contentClasses}>
            {children}
          </div>
          {footer && (
            <div className={styles.footer}>
              {footer}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default React.memo(InfoBlock);

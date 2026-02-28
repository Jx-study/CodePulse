import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { SidebarProps } from '@/types';
import Button from '../Button';
import styles from './Sidebar.module.scss';

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  title,
  children,
  placement = 'left',
  width = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  contentClassName = '',
  'aria-label': ariaLabel,
}) => {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const panelClasses = [
    styles.panel,
    styles[placement],
    styles[width],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={styles.overlay}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={panelClasses}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && (typeof title === 'string' ? <h2>{title}</h2> : title)}
            {showCloseButton && (
              <Button
                variant="icon"
                onClick={onClose}
                aria-label="Close sidebar"
                className={styles.closeButton}
                iconOnly
                icon="times"
              />
            )}
          </div>
        )}
        <div className={`${styles.content} ${contentClassName}`}>
          {children}
        </div>
      </div>
    </>,
    document.body
  );
};

export default React.memo(Sidebar);

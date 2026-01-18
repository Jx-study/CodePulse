import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { DialogProps } from "@/types";
import Icon from "../Icon";
import Button from "../Button/Button";
import styles from "./Dialog.module.scss";

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  size = "md",
  variant = "default",
  title,
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventScroll = true,
  className = "",
  overlayClassName = "",
  contentClassName = "",
  headerClassName = "",
  footerClassName = "",
  closeButtonIcon,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  animationDuration = 300,
  onAfterOpen,
  onAfterClose,
  ...restProps
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (!isOpen || !preventScroll) return;

    document.body.style.overflow = "hidden";
    onAfterOpen?.();

    return () => {
      document.body.style.overflow = "unset";
      onAfterClose?.();
    };
  }, [isOpen, preventScroll, onAfterOpen, onAfterClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const dialogElement = dialogRef.current;
    if (!dialogElement) return;

    // Focus first focusable element
    const focusableElements = dialogElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0] as HTMLElement;
    firstElement?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Dynamic className generation
  const overlayClasses = [styles.overlay, overlayClassName]
    .filter(Boolean)
    .join(" ");

  const dialogClasses = [
    styles.dialog,
    styles[size],
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const dialogContent = (
    <div
      className={overlayClasses}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      <div ref={dialogRef} className={dialogClasses} {...restProps}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={`${styles.dialogHeader} ${headerClassName}`}>
            {title && (typeof title === "string" ? <h2>{title}</h2> : title)}
            {showCloseButton && (
              <Button
                variant="icon"
                onClick={onClose}
                aria-label="Close dialog"
                className={styles.closeButton}
              >
                {closeButtonIcon || <Icon name="times" size="lg" />}
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`${styles.dialogContent} ${contentClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer !== null && footer !== undefined && (
          <div className={`${styles.dialogFooter} ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render in portal
  return createPortal(dialogContent, document.body);
};

export default React.memo(Dialog);

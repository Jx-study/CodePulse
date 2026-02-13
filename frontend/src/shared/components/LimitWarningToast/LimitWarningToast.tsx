import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "../Icon";
import styles from "./LimitWarningToast.module.scss";

export interface LimitWarningToastProps {
  isOpen: boolean;
  onClose: () => void;
  maxLimit: number;
  message?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const LimitWarningToast: React.FC<LimitWarningToastProps> = ({
  isOpen,
  onClose,
  maxLimit,
  message,
  autoClose = true,
  autoCloseDelay = 3000,
}) => {
  const defaultMessage = `資料數量超過限制，最多只能有 ${maxLimit} 筆資料。`;

  // 自動關閉
  useEffect(() => {
    if (!isOpen || !autoClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const toastContent = (
    <div className={styles.toastContainer}>
      <div className={styles.toast}>
        <div className={styles.iconWrapper}>
          <Icon name="exclamation-circle" size="sm" />
        </div>
        <p className={styles.message}>{message || defaultMessage}</p>
        <button className={styles.closeBtn} onClick={onClose} aria-label="關閉">
          <Icon name="times" size="sm" />
        </button>
      </div>
    </div>
  );

  return createPortal(toastContent, document.body);
};

export default React.memo(LimitWarningToast);

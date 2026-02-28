import React, { useEffect } from "react";
import Icon from "@/shared/components/Icon";
import type { ToastItem as ToastItemType } from "./types";
import styles from "./Toast.module.scss";

const ICON_MAP: Record<ToastItemType["variant"], string> = {
  warning: "exclamation-circle",
  error: "exclamation-circle",
  success: "check-circle",
  info: "info-circle",
};

interface ToastItemProps {
  item: ToastItemType;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ item, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(item.id);
    }, item.duration);

    return () => clearTimeout(timer);
  }, [item.id, item.duration, onClose]);

  const { variant } = item;

  return (
    <div className={`${styles.toast} ${styles[variant]}`}>
      <div className={styles.iconWrapper}>
        <Icon name={ICON_MAP[item.variant]} size="sm" />
      </div>
      <p className={styles.message}>{item.message}</p>
      <button
        className={styles.closeBtn}
        onClick={() => onClose(item.id)}
        aria-label="關閉"
      >
        <Icon name="times" size="sm" />
      </button>
    </div>
  );
};

export default React.memo(ToastItem);

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toastEmitter } from "./toastEmitter";
import ToastItem from "./ToastItem";
import type { ToastItem as ToastItemType } from "./types";
import styles from "./Toast.module.scss";

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItemType[]>([]);

  useEffect(() => {
    const handler = (toast: ToastItemType) => {
      setToasts((prev) => [...prev, toast]);
    };
    toastEmitter.subscribe(handler);
    return () => toastEmitter.unsubscribe();
  }, []);

  const handleClose = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <div className={styles.container}>
      {toasts.map((item) => (
        <ToastItem key={item.id} item={item} onClose={handleClose} />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;

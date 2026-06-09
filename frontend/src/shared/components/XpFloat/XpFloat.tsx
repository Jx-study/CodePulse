import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { xpEmitter, XpPayload } from './xpEmitter';
import styles from './XpFloat.module.scss';
import Icon from '../Icon';

export default function XpFloat() {
  const { t } = useTranslation('common');
  const [payload, setPayload] = useState<XpPayload>({ amount: 0 });
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    xpEmitter.subscribe((incoming) => {
      setPayload(incoming);
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 2500);
    });
    return () => {
      xpEmitter.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const reasonText = payload.customReason
    ?? (payload.reason ? t(`xp.reason.${payload.reason}`) : null);

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.xpToast}
          initial={{ opacity: 0, x: -24, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -16, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className={styles.iconWrapper}>
            <Icon name="star" />
          </div>
          <div className={styles.textWrapper}>
            <span className={styles.label}>{t('xp.earned')}</span>
            <span className={styles.amount}>+{payload.amount} XP</span>
            {reasonText && (
              <span className={styles.reason}>{reasonText}</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}


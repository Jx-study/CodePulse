import { AnimatePresence, motion } from 'motion/react';
import styles from './XpFloat.module.scss';
import Icon from '../Icon';

interface XpFloatProps {
  amount: number;
  trigger: boolean;
  onDone?: () => void;
}

export default function XpFloat({ amount, trigger, onDone }: XpFloatProps) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {trigger && (
        <motion.span
          className={styles.xpFloat}
          initial={{ opacity: 1, y: 0, scale: 0.9 }}
          animate={{ opacity: 1, y: -20, scale: 1.15 }}
          exit={{ opacity: 0, y: -56, scale: 1.2 }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
        >
          <Icon name="plus" />{' '}{amount} XP
        </motion.span>
      )}
    </AnimatePresence>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import styles from './WelcomeOverlay.module.scss';

interface WelcomeOverlayProps {
  username: string;
  onComplete: () => void;
}

function WelcomeOverlay({ username, onComplete }: WelcomeOverlayProps) {
  const [showExit, setShowExit] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);

  useEffect(() => {
    // Start progress bar countdown
    const frame = requestAnimationFrame(() => {
      setProgressWidth(0);
    });
    // Trigger exit after 4s
    const timer = setTimeout(() => setShowExit(true), 4000);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: showExit ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={() => {
        if (showExit) onComplete();
      }}
    >
      <div className={styles.card}>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          歡迎加入 CodePulse！
        </motion.h1>

        <motion.p
          className={styles.username}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          @{username}
        </motion.p>

        <motion.div
          className={styles.progressSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.3 }}
        >
          <p className={styles.redirectText}>自動跳轉中...</p>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              style={{
                width: `${progressWidth}%`,
                transition: 'width 4s linear',
              }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default WelcomeOverlay;

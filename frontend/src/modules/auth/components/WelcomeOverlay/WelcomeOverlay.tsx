import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Icon from '@/shared/components/Icon';
import styles from './WelcomeOverlay.module.scss';

interface WelcomeOverlayProps {
  username: string;
  onComplete: () => void;
}

const PIXEL_OPACITIES = [
  40, 0, 20, 0, 60, 0, 0, 10, 0, 0, 0, 0,
  0, 30, 0, 0, 0, 50, 0, 0, 40, 0, 0, 0,
  20, 0, 0, 60, 0, 0, 20, 0, 0, 30, 0, 0,
  0, 40, 20, 0, 0, 10, 0, 50, 0, 0, 30, 0,
];

function getTimezoneLabel(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const parts = tz.split('/');
  return parts[parts.length - 1].replace(/_/g, ' ').toUpperCase();
}

function WelcomeOverlay({ username, onComplete }: WelcomeOverlayProps) {
  const [showExit, setShowExit] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const timezoneLabel = getTimezoneLabel();

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgressPercent(prev => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return Math.min(85, prev + Math.floor(Math.random() * 5));
      });
    }, 100);

    const countdownInterval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timer = setTimeout(() => {
      setProgressPercent(100);
      setShowExit(true);
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(countdownInterval);
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
      <div className={styles.gridBg} />

      <div className={styles.pixelBg}>
        <div className={styles.pixelGrid}>
          {PIXEL_OPACITIES.map((opacity, i) => (
            <div
              key={i}
              className={styles.pixelCell}
              style={
                opacity > 0
                  ? { background: `rgba(99, 91, 255, ${opacity / 100})` }
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      <div className={styles.scanline} />
      <div className={styles.cornerTL} />
      <div className={styles.cornerBR} />

      <main className={styles.shell}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className={styles.titleBlock}>
            <motion.h2
              className={styles.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              System Initializing<span className={styles.cursor}>_</span>
            </motion.h2>

            <motion.p
              className={styles.subTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Welcome to CodePulse, @{username}.
            </motion.p>
          </div>

          <motion.div
            className={styles.infoBlocks}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.3 }}
          >
            <div className={styles.infoBlock}>
              <span className={styles.blockLabel}>SESSION</span>
              <span className={styles.blockValue}>ACTIVE</span>
            </div>
            <div className={`${styles.infoBlock} ${styles.green}`}>
              <span className={styles.blockLabel}>TIMEZONE</span>
              <span className={styles.blockValue}>{timezoneLabel}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.3 }}
          >
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>
                Loading workspace...
              </span>
              <span className={styles.progressPercent}>{progressPercent}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{ width: `${progressPercent}%` }}
              >
                <div className={styles.progressGlow} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className={styles.redirectSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.3, duration: 0.3 }}
          >
            <Icon
              name="rotate"
              animation="spin"
              className={styles.redirectIcon}
            />
            <p className={styles.redirectText}>
              Redirecting to Home Page in {redirectCountdown}s...
            </p>
          </motion.div>
        </motion.div>

        <motion.footer
          className={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className={styles.footerLeft}>
            <div className={styles.footerItem}>
              <Icon name="lock" className={styles.footerIcon} decorative />
              <span className={styles.footerLabel}>Secure Channel</span>
            </div>
            <div className={styles.footerItem}>
              <Icon name="globe" className={styles.footerIcon} decorative />
              <span className={styles.footerLabel}>{timezoneLabel}</span>
            </div>
          </div>
          <span className={styles.footerVersion}>v1.1.0-stable</span>
        </motion.footer>
      </main>
    </motion.div>
  );
}

export default WelcomeOverlay;

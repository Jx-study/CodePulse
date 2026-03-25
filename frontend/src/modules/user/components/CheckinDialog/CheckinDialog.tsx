import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import Dialog from '@/shared/components/Dialog';
import Button from '@/shared/components/Button';
import Icon from '@/shared/components/Icon';
import { xp } from '@/shared/components/XpFloat';
import { userService } from '@/services/userService';
import { useAuth } from '@/shared/contexts/AuthContext';
import styles from './CheckinDialog.module.scss';

// Note: `new Date('YYYY-MM-DD')` parses as UTC midnight — in non-UTC timezones
// calling toLocaleDateString shifts to the previous day. Fix: use local Date constructor.
function subtractDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d - 1);
  return dt.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function computeStreaks(dates: string[]): Record<string, number> {
  const set = new Set(dates);
  const result: Record<string, number> = {};
  for (const d of dates) {
    let streak = 0;
    let cur = d;
    while (set.has(cur)) {
      streak++;
      cur = subtractDay(cur);
    }
    result[d] = streak;
  }
  return result;
}

interface CheckinDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckinDialog({ isOpen, onClose }: CheckinDialogProps) {
  const { t } = useTranslation();
  const { updateUser } = useAuth();
  const [dates, setDates] = useState<string[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const today = now.toLocaleDateString('en-CA');
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingHistory(true);
    userService.getCheckinHistory(year, month)
      .then(data => {
        setDates(data.dates);
        setIsCheckedIn(data.dates.includes(today));
      })
      .finally(() => setIsLoadingHistory(false));
  }, [isOpen, year, month, today]);

  const streakMap = computeStreaks(dates);

  const handleCheckin = async () => {
    setIsLoading(true);
    try {
      const res = await userService.checkin();
      if (res.success) {
        const newDates = [...dates, today].sort();
        setDates(newDates);
        setIsCheckedIn(true);
        xp.show(5);
        updateUser({
          last_login_date: today,
          current_streak: res.current_streak,
          longest_streak: res.longest_streak,
          total_xp: res.total_xp,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('checkin.title', '每日打卡')}
      size="md"
    >
      {isLoadingHistory ? (
        <div className={styles.loading}>
          <Icon name="circle-notch" animation="spin" />
        </div>
      ) : (
        <>
          <div className={styles.calendar}>
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className={styles.weekday}>{d}</div>
            ))}
            {cells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className={styles.empty} />;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === today;
              const isFuture = dateStr > today;
              const checkedIn = dates.includes(dateStr);
              const streak = streakMap[dateStr];

              return (
                <motion.div
                  key={dateStr}
                  className={[
                    styles.day,
                    checkedIn ? styles.checked : '',
                    isToday && !checkedIn ? styles.today : '',
                    isFuture ? styles.future : '',
                  ].filter(Boolean).join(' ')}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isFuture ? 0.3 : 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.01 }}
                  whileHover={!isFuture ? { scale: 1.08 } : undefined}
                >
                  <AnimatePresence mode="wait">
                    {checkedIn ? (
                      <motion.span
                        key="checked"
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      >
                        <Icon name="check" className={styles.checkmark} />
                      </motion.span>
                    ) : (
                      <motion.span key="day" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <span className={styles.dayNum}>{day}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {checkedIn && streak && (
                    <span className={styles.streakNum}>
                      <Icon name="fire" className={styles.fireIcon} />{streak}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
          <motion.div
            className={styles.footer}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className={styles.checkinBtnWrapper}>
              <AnimatePresence mode="wait">
                {isCheckedIn ? (
                  <motion.div
                    key="done"
                    className={styles.footerInner}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Button variant="secondary" disabled>
                      <Icon name="check" /> {t('checkin.checkedIn', '已打卡')}
                    </Button>
                    <Button variant="primary" onClick={onClose}>
                      {t('close', '關閉')}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="checkin"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Button variant="primary" onClick={handleCheckin} disabled={isLoading}>
                      {isLoading
                        ? <><Icon name="circle-notch" animation="spin" /> {t('checkin.checking', '打卡中...')}</>
                        : t('checkin.checkIn', '打卡')}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </Dialog>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '@/shared/components/Icon';
import Button from '@/shared/components/Button';
import { xp } from '@/shared/components/XpFloat';
import { useAuth } from '@/shared/contexts/AuthContext';
import { fetchMyProgress } from '@/services/ProgressService';
import { tutorialService } from '@/services/tutorialService';
import { useLessons } from './hooks/useLessons';
import LessonSidebar from './components/LessonSidebar/LessonSidebar';
import SlideRenderer from './components/SlideRenderer/SlideRenderer';
import type { Lesson } from './types';
import styles from './TeachingLevel.module.scss';

/** 後端要求停留滿這麼久才能標記教學完成（見 routes/tutorials.py） */
const MIN_READING_SECONDS = 30;
/** 計時從 startSession 回應前就開始，多留 1 秒避免被後端判成時間不足 */
const READING_MARGIN_SECONDS = 1;
const REQUIRED_SECONDS = MIN_READING_SECONDS + READING_MARGIN_SECONDS;

export default function TeachingLevel() {
  const lessons = useLessons();
  const { lessonId } = useParams<{ lessonId: string }>();
  const activeLesson = lessons.find((l) => l.id === lessonId) ?? lessons[0];

  // 換課時整個重新掛載，投影片位置與計時自然歸零
  return <LessonView key={activeLesson.id} lesson={activeLesson} lessons={lessons} />;
}

interface LessonViewProps {
  lesson: Lesson;
  lessons: Lesson[];
}

function LessonView({ lesson, lessons }: LessonViewProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('lessons');
  const { isAuthenticated } = useAuth();

  const [slideIndex, setSlideIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const totalSlides = lesson.slides.length;
  const currentSlide = lesson.slides[slideIndex];
  const isFirst = slideIndex === 0;
  const isLast = slideIndex === totalSlides - 1;
  const progress = ((slideIndex + 1) / totalSlides) * 100;
  const lessonIndex = lessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = lessons[lessonIndex + 1];
  const isCompleted = completedIds.has(lesson.id);
  const [secondsLeft, setSecondsLeft] = useState(REQUIRED_SECONDS);
  const [completing, setCompleting] = useState(false);

  const markCompleted = useCallback((id: string) => {
    setCompletedIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  // 已完成的課（來自後端進度）
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    fetchMyProgress()
      .then((rows) => {
        if (cancelled) return;
        const ids = new Set(lessons.map((l) => l.id));
        rows
          .filter((row) => row.teaching_completed && ids.has(row.tutorial_slug))
          .forEach((row) => markCompleted(row.tutorial_slug));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, lessons, markCompleted]);

  // 學習 session：沿用教學頁的規則（開始 → 離開時回報停留秒數）
  const sessionIdRef = useRef<number | null>(null);
  const startedAtRef = useRef(Date.now());
  const completedRef = useRef(false);
  const reachedEndRef = useRef(false);

  useEffect(() => {
    reachedEndRef.current = reachedEndRef.current || isLast;
  }, [isLast]);

  useEffect(() => {
    if (!isAuthenticated) return;
    startedAtRef.current = Date.now();
    completedRef.current = false;
    tutorialService
      .startSession(lesson.id)
      .then((id) => {
        sessionIdRef.current = id;
      })
      .catch(() => {});

    return () => {
      const sessionId = sessionIdRef.current;
      if (sessionId === null) return;
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      // 還沒按「完成本課」就離開（例如直接點「接下來可以前往」）時，補上完成
      if (reachedEndRef.current && !completedRef.current && elapsed >= REQUIRED_SECONDS) {
        tutorialService
          .markTeachingComplete(lesson.id)
          .then((res) => {
            if (res.xp_earned > 0) xp.show(res.xp_earned, { reason: 'tutorial' });
          })
          .catch(() => {});
      }
      const blob = new Blob([JSON.stringify({ duration_seconds: elapsed })], {
        type: 'application/json',
      });
      if (!navigator.sendBeacon(`/api/tutorials/${lesson.id}/session/${sessionId}`, blob)) {
        tutorialService.endSession(lesson.id, sessionId, elapsed).catch(() => {});
      }
    };
  }, [isAuthenticated, lesson.id]);

  // 最後一張的倒數：停留滿 REQUIRED_SECONDS 才能按「完成本課」
  useEffect(() => {
    if (!isAuthenticated || !isLast || isCompleted) return;
    const tick = () =>
      setSecondsLeft(
        Math.max(0, Math.ceil(REQUIRED_SECONDS - (Date.now() - startedAtRef.current) / 1000)),
      );
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isAuthenticated, isLast, isCompleted]);

  const completeLesson = useCallback(async () => {
    setCompleting(true);
    try {
      const res = await tutorialService.markTeachingComplete(lesson.id);
      completedRef.current = true;
      markCompleted(lesson.id);
      if (res.xp_earned > 0) xp.show(res.xp_earned, { reason: 'tutorial' });
    } catch {
      // 後端判定時間不足等失敗時維持原狀，使用者可再按一次
    } finally {
      setCompleting(false);
    }
  }, [lesson.id, markCompleted]);

  const handleSelectLesson = useCallback(
    (id: string) => navigate(`/lesson/${id}`),
    [navigate],
  );

  const handlePrev = useCallback(() => setSlideIndex((i) => Math.max(0, i - 1)), []);

  // 最後一頁：登入且尚未完成時，按鈕負責「標記完成」並留在頁面，讓使用者還能看接下來可以前往
  const needsCompleting = isLast && isAuthenticated && !isCompleted;

  const handleNext = useCallback(() => {
    if (!isLast) {
      setSlideIndex((i) => i + 1);
      return;
    }
    if (needsCompleting) {
      void completeLesson();
      return;
    }
    navigate(nextLesson ? `/lesson/${nextLesson.id}` : '/dashboard');
  }, [isLast, needsCompleting, completeLesson, navigate, nextLesson]);

  const nextLabel = (() => {
    if (!isLast) return t('ui.next');
    if (!needsCompleting) return nextLesson ? t('ui.nextLesson') : t('ui.toMap');
    return secondsLeft > 0 ? t('ui.finishWait', { seconds: secondsLeft }) : t('ui.finish');
  })();

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <button className={styles.backBtn} aria-label={t('ui.backToMap')} onClick={() => navigate('/dashboard')}>
          <Icon name="arrow-left" decorative />
          <span className={styles.backLabel}>{t('ui.backToMap')}</span>
        </button>

        <div className={styles.topbarCenter}>
          <span className={styles.lessonName}>{lesson.title}</span>
          <span className={styles.slideCounter}>
            {slideIndex + 1} / {totalSlides}
          </span>
        </div>

        <div className={styles.topbarRight}>
          <div className={styles.progressPill}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        <LessonSidebar
          lessons={lessons}
          activeId={lesson.id}
          completedIds={completedIds}
          onSelect={handleSelectLesson}
        />

        <main className={styles.main}>
          <div className={styles.slideArea}>
            <SlideRenderer slide={currentSlide} lesson={lesson} />
          </div>

          <footer className={styles.footer}>
            <div className={styles.dots}>
              {lesson.slides.map((_, i) => (
                <button
                  key={i}
                  className={styles.dot}
                  data-active={i === slideIndex}
                  data-done={i < slideIndex}
                  style={i === slideIndex ? { background: lesson.color } : undefined}
                  onClick={() => setSlideIndex(i)}
                  aria-label={t('ui.goToSlide', { n: i + 1 })}
                />
              ))}
            </div>

            <div className={styles.navBtns}>
              <Button
                variant="secondary"
                iconLeft={<Icon name="arrow-left" decorative />}
                onClick={handlePrev}
                disabled={isFirst}
              >
                {t('ui.prev')}
              </Button>
              <Button
                variant="primary"
                iconRight={<Icon name={needsCompleting ? 'check' : 'arrow-right'} decorative />}
                onClick={handleNext}
                disabled={needsCompleting && secondsLeft > 0}
                loading={completing}
                style={{ background: lesson.color, borderColor: lesson.color }}
              >
                {nextLabel}
              </Button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

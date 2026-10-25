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
const COMPLETE_RETRY_MS = 2000;
const COMPLETE_MAX_ATTEMPTS = 3;

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
      const blob = new Blob([JSON.stringify({ duration_seconds: elapsed })], {
        type: 'application/json',
      });
      if (!navigator.sendBeacon(`/api/tutorials/${lesson.id}/session/${sessionId}`, blob)) {
        tutorialService.endSession(lesson.id, sessionId, elapsed).catch(() => {});
      }
    };
  }, [isAuthenticated, lesson.id]);

  // 完成條件：看到最後一張，且停留滿 MIN_READING_SECONDS
  useEffect(() => {
    if (!isAuthenticated || !isLast || completedRef.current) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const attempt = async (remaining: number) => {
      if (cancelled || completedRef.current) return;
      try {
        const res = await tutorialService.markTeachingComplete(lesson.id);
        completedRef.current = true;
        markCompleted(lesson.id);
        if (res.xp_earned > 0) xp.show(res.xp_earned, { reason: 'tutorial' });
      } catch {
        if (remaining > 1) timer = setTimeout(() => attempt(remaining - 1), COMPLETE_RETRY_MS);
      }
    };

    const waitMs = Math.max(0, MIN_READING_SECONDS * 1000 - (Date.now() - startedAtRef.current));
    timer = setTimeout(() => attempt(COMPLETE_MAX_ATTEMPTS), waitMs + 500);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isAuthenticated, isLast, lesson.id, markCompleted]);

  const handleSelectLesson = useCallback(
    (id: string) => navigate(`/lesson/${id}`),
    [navigate],
  );

  const handlePrev = useCallback(() => setSlideIndex((i) => Math.max(0, i - 1)), []);

  const handleNext = useCallback(() => {
    if (!isLast) {
      setSlideIndex((i) => i + 1);
      return;
    }
    navigate(nextLesson ? `/lesson/${nextLesson.id}` : '/dashboard');
  }, [isLast, navigate, nextLesson]);

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          <Icon name="arrow-left" decorative />
          {t('ui.backToMap')}
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
                iconRight={<Icon name={isLast ? 'check' : 'arrow-right'} decorative />}
                onClick={handleNext}
                style={{ background: lesson.color, borderColor: lesson.color }}
              >
                {isLast ? t('ui.finish') : t('ui.next')}
              </Button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

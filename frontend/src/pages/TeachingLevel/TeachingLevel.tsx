import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '@/shared/components/Icon';
import Button from '@/shared/components/Button';
import { LESSONS } from './data/lessons';
import LessonSidebar from './components/LessonSidebar/LessonSidebar';
import SlideRenderer from './components/SlideRenderer/SlideRenderer';
import styles from './TeachingLevel.module.scss';

export default function TeachingLevel() {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();

  const initialLesson = LESSONS.find((l) => l.id === lessonId) ?? LESSONS[0];

  const [activeLesson, setActiveLesson] = useState(initialLesson);
  const [slideIndex, setSlideIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const currentSlide = activeLesson.slides[slideIndex];
  const totalSlides = activeLesson.slides.length;
  const isFirst = slideIndex === 0;
  const isLast = slideIndex === totalSlides - 1;
  const progress = ((slideIndex + 1) / totalSlides) * 100;

  const handleSelectLesson = useCallback((id: string) => {
    const lesson = LESSONS.find((l) => l.id === id);
    if (!lesson) return;
    setActiveLesson(lesson);
    setSlideIndex(0);
  }, []);

  const handlePrev = useCallback(() => {
    setSlideIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (isLast) {
      setCompletedIds((prev) => new Set(prev).add(activeLesson.id));
      const currentIndex = LESSONS.findIndex((l) => l.id === activeLesson.id);
      const nextLesson = LESSONS[currentIndex + 1];
      if (nextLesson) {
        handleSelectLesson(nextLesson.id);
      }
    } else {
      setSlideIndex((i) => i + 1);
    }
  }, [isLast, activeLesson.id, handleSelectLesson]);

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          <Icon name="arrow-left" decorative />
          返回學習地圖
        </button>

        <div className={styles.topbarCenter}>
          <span className={styles.lessonName}>{activeLesson.title}</span>
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
          lessons={LESSONS}
          activeId={activeLesson.id}
          completedIds={completedIds}
          onSelect={handleSelectLesson}
        />

        <main className={styles.main}>
          {/* Slide area */}
          <div className={styles.slideArea}>
            <SlideRenderer slide={currentSlide} lesson={activeLesson} />
          </div>

          {/* Navigation */}
          <footer className={styles.footer}>
            {/* Dot indicators */}
            <div className={styles.dots}>
              {activeLesson.slides.map((_, i) => (
                <button
                  key={i}
                  className={styles.dot}
                  data-active={i === slideIndex}
                  data-done={i < slideIndex}
                  style={i === slideIndex ? { background: activeLesson.color } : undefined}
                  onClick={() => setSlideIndex(i)}
                  aria-label={`第 ${i + 1} 頁`}
                />
              ))}
            </div>

            {/* Prev / Next */}
            <div className={styles.navBtns}>
              <Button
                variant="secondary"
                iconLeft={<Icon name="arrow-left" decorative />}
                onClick={handlePrev}
                disabled={isFirst}
              >
                上一頁
              </Button>
              <Button
                variant="primary"
                iconRight={<Icon name={isLast ? 'check' : 'arrow-right'} decorative />}
                onClick={handleNext}
                style={{ background: activeLesson.color, borderColor: activeLesson.color }}
              >
                {isLast ? '完成本課！' : '下一頁'}
              </Button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

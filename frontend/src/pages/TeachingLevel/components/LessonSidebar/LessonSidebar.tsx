import { useTranslation } from 'react-i18next';
import Icon from '@/shared/components/Icon';
import type { Lesson } from '../../types';
import styles from './LessonSidebar.module.scss';

interface Props {
  lessons: Lesson[];
  activeId: string;
  completedIds: Set<string>;
  onSelect: (id: string) => void;
}

export default function LessonSidebar({ lessons, activeId, completedIds, onSelect }: Props) {
  const { t } = useTranslation('lessons');
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <Icon name="book-open" decorative />
        <span>{t('ui.lessonList')}</span>
      </div>

      <nav className={styles.nav}>
        {lessons.map((lesson, index) => {
          const isActive = lesson.id === activeId;
          const isDone = completedIds.has(lesson.id);

          return (
            <button
              key={lesson.id}
              className={styles.item}
              data-active={isActive}
              data-done={isDone}
              onClick={() => onSelect(lesson.id)}
              style={{ '--lesson-color': lesson.color } as React.CSSProperties}
            >
              <div className={styles.itemLeft}>
                <div className={styles.itemIndex}>{isDone ? <Icon name="check" /> : index + 1}</div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemTitle}>{lesson.title}</span>
                  <span className={styles.itemMeta}>
                    <Icon name="stopwatch" decorative />
                    {t('ui.minutesShort', { count: lesson.estimatedMinutes })}
                  </span>
                </div>
              </div>
              {isActive && <Icon name="chevron-right" className={styles.activeArrow} />}
            </button>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <span className={styles.footerText}>
          {t('ui.completedCount', { done: completedIds.size, total: lessons.length })}
        </span>
        <div className={styles.footerBar}>
          <div
            className={styles.footerFill}
            style={{ width: `${(completedIds.size / lessons.length) * 100}%` }}
          />
        </div>
      </div>
    </aside>
  );
}

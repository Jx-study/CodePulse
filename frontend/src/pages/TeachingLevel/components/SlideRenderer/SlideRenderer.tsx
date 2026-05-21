import Icon from '@/shared/components/Icon';
import BigOChart from '../BigOChart/BigOChart';
import DSDiagram from '../DSDiagram/DSDiagram';
import type { Lesson, Slide } from '../../types';
import styles from './SlideRenderer.module.scss';

interface Props {
  slide: Slide;
  lesson: Lesson;
}

export default function SlideRenderer({ slide, lesson }: Props) {
  switch (slide.type) {
    case 'cover':
      return <CoverSlide slide={slide} lesson={lesson} />;
    case 'concept':
      return <ConceptSlide slide={slide} />;
    case 'list':
      return <ListSlide slide={slide} />;
    case 'comparison':
      return <ComparisonSlide slide={slide} />;
    case 'visual':
      return <VisualSlide slide={slide} />;
    case 'code':
      return <CodeSlide slide={slide} />;
    case 'summary':
      return <SummarySlide slide={slide} lesson={lesson} />;
    default:
      return null;
  }
}

function CoverSlide({ slide, lesson }: { slide: Slide; lesson: Lesson }) {
  return (
    <div className={styles.cover}>
      <div className={styles.coverIcon} style={{ background: `${lesson.color}22`, color: lesson.color }}>
        <Icon name={lesson.icon} />
      </div>
      <h1 className={styles.coverTitle}>{slide.title}</h1>
      {slide.subtitle && <p className={styles.coverSubtitle}>{slide.subtitle}</p>}
      <div className={styles.coverMeta}>
        <span>
          <Icon name="clock" decorative />
          約 {lesson.estimatedMinutes} 分鐘
        </span>
        <span>
          <Icon name="layer-group" decorative />
          {lesson.slides.length} 個單元
        </span>
      </div>
    </div>
  );
}

function ConceptSlide({ slide }: { slide: Slide }) {
  const lines = slide.body?.split('\n') ?? [];
  return (
    <div className={styles.concept}>
      <h2 className={styles.slideTitle}>{slide.title}</h2>
      <div className={styles.conceptBody}>
        {lines.map((line, i) =>
          line === '' ? (
            <br key={i} />
          ) : (
            <p key={i} className={line.startsWith('•') ? styles.bullet : undefined}>
              {line}
            </p>
          )
        )}
      </div>
    </div>
  );
}

function ListSlide({ slide }: { slide: Slide }) {
  return (
    <div className={styles.list}>
      <h2 className={styles.slideTitle}>{slide.title}</h2>
      <ol className={styles.orderedList}>
        {(slide.items ?? []).map((item, i) => {
          const [head, ...rest] = item.split(' — ');
          return (
            <li key={i} className={styles.listItem}>
              <span className={styles.listNum}>{i + 1}</span>
              <span>
                {rest.length > 0 ? (
                  <>
                    <strong>{head}</strong> — {rest.join(' — ')}
                  </>
                ) : (
                  head
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ComparisonSlide({ slide }: { slide: Slide }) {
  return (
    <div className={styles.comparison}>
      <h2 className={styles.slideTitle}>{slide.title}</h2>
      <div className={styles.comparisonGrid}>
        {(slide.comparisons ?? []).map((item) => (
          <div key={item.label} className={styles.comparisonCard} style={{ borderColor: `${item.color}44` }}>
            <div className={styles.comparisonIcon} style={{ color: item.color }}>
              <Icon name={item.icon} />
            </div>
            <h3 className={styles.comparisonLabel}>{item.label}</h3>
            <p className={styles.comparisonDesc}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualSlide({ slide }: { slide: Slide }) {
  return (
    <div className={styles.visual}>
      <h2 className={styles.slideTitle}>{slide.title}</h2>
      <div className={styles.visualContent}>
        {slide.visual === 'big-o-chart' && <BigOChart />}
        {slide.visual === 'ds-diagram' && <DSDiagram />}
      </div>
    </div>
  );
}

function CodeSlide({ slide }: { slide: Slide }) {
  return (
    <div className={styles.codeSlide}>
      <h2 className={styles.slideTitle}>{slide.title}</h2>
      {slide.code && (
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>
            <span className={styles.codeLang}>{slide.code.language}</span>
            <span className={styles.codeDots}>
              <span />
              <span />
              <span />
            </span>
          </div>
          <pre className={styles.codePre}>
            <code>{slide.code.content}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

function SummarySlide({ slide, lesson }: { slide: Slide; lesson: Lesson }) {
  return (
    <div className={styles.summary}>
      <div className={styles.summaryHeader}>
        <div className={styles.summaryBadge} style={{ background: `${lesson.color}22`, color: lesson.color }}>
          <Icon name="check-circle" decorative />
          完成！
        </div>
        <h2 className={styles.slideTitle}>{slide.title}</h2>
      </div>
      <ul className={styles.summaryList}>
        {(slide.items ?? []).map((item, i) => (
          <li key={i} className={styles.summaryItem}>
            <span className={styles.summaryCheck} style={{ color: lesson.color }}>
              <Icon name="circle-check" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

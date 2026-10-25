import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '@/shared/components/Icon';
import { getLevelById } from '@/services/LevelService';
import BigOChart from '../BigOChart/BigOChart';
import DSDiagram from '../DSDiagram/DSDiagram';
import GrowthExplorer from '../Interactive/GrowthExplorer';
import SearchCases from '../Interactive/SearchCases';
import StepCounter from '../Interactive/StepCounter';
import type { Lesson, Slide } from '../../types';
import styles from './SlideRenderer.module.scss';

interface Props {
  slide: Slide;
  lesson: Lesson;
}

export default function SlideRenderer({ slide, lesson }: Props) {
  return (
    <div className={styles.slide} style={{ '--lesson-color': lesson.color } as CSSProperties}>
      <SlideContent slide={slide} lesson={lesson} />
    </div>
  );
}

function SlideContent({ slide, lesson }: Props) {
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
    case 'table':
      return <TableSlide slide={slide} />;
    case 'summary':
      return <SummarySlide slide={slide} />;
    default:
      return null;
  }
}

function CoverSlide({ slide, lesson }: { slide: Slide; lesson: Lesson }) {
  const { t } = useTranslation('lessons');
  return (
    <div className={styles.cover}>
      <span className={styles.coverKicker}>{t('ui.lessonList')}</span>
      <h1 className={styles.coverTitle}>{slide.title}</h1>
      {slide.subtitle && <p className={styles.coverSubtitle}>{slide.subtitle}</p>}
      <p className={styles.coverMeta}>
        {t('ui.minutes', { count: lesson.estimatedMinutes })}
        <span aria-hidden="true"> · </span>
        {t('ui.units', { count: lesson.slides.length })}
      </p>
    </div>
  );
}

type BodyBlock = { kind: 'p'; text: string } | { kind: 'ul'; items: string[] };

/** 把 body 拆成段落與項目清單：空行分段，以「•」開頭的連續行合成一個清單 */
function parseBody(body: string): BodyBlock[] {
  const blocks: BodyBlock[] = [];
  for (const line of body.split('\n')) {
    const text = line.trim();
    if (text === '') continue;
    if (text.startsWith('•')) {
      const item = text.replace(/^•\s*/, '');
      const last = blocks[blocks.length - 1];
      if (last?.kind === 'ul') last.items.push(item);
      else blocks.push({ kind: 'ul', items: [item] });
    } else {
      blocks.push({ kind: 'p', text });
    }
  }
  return blocks;
}

function ConceptSlide({ slide }: { slide: Slide }) {
  const blocks = parseBody(slide.body ?? '');
  return (
    <div className={styles.concept}>
      <h2 className={styles.slideTitle}>{slide.title}</h2>
      <div className={styles.conceptBody}>
        {blocks.map((block, i) =>
          block.kind === 'p' ? (
            <p key={i}>{block.text}</p>
          ) : (
            <ul key={i} className={styles.bulletList}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
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
      {slide.body && <p className={styles.listIntro}>{slide.body}</p>}
      <ol className={styles.orderedList}>
        {(slide.items ?? []).map((item, i) => {
          const [head, ...rest] = item.split(' — ');
          return (
            <li key={i} className={styles.listItem}>
              <span className={styles.listNum}>{String(i + 1).padStart(2, '0')}</span>
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
          <div key={item.label} className={styles.comparisonCard} style={{ borderTopColor: item.color }}>
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
        {slide.visual === 'growth-explorer' && <GrowthExplorer />}
        {slide.visual === 'step-counter' && <StepCounter />}
        {slide.visual === 'search-cases' && <SearchCases />}
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
          </div>
          <pre className={styles.codePre}>
            <code>{slide.code.content}</code>
          </pre>
        </div>
      )}
      {slide.body && (
        <div className={styles.codeCaption}>
          {slide.body.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function TableSlide({ slide }: { slide: Slide }) {
  if (!slide.table) return null;
  const { headers, rows, note } = slide.table;
  return (
    <div className={styles.tableSlide}>
      <h2 className={styles.slideTitle}>{slide.title}</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={i}>{cell}</td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className={styles.tableNote}>{note}</p>}
    </div>
  );
}

function SummarySlide({ slide }: { slide: Slide }) {
  return (
    <div className={styles.summary}>
      <h2 className={styles.slideTitle}>{slide.title}</h2>
      <ul className={styles.summaryList}>
        {(slide.items ?? []).map((item, i) => (
          <li key={i} className={styles.summaryItem}>
            {item}
          </li>
        ))}
      </ul>
      {slide.nextLevelIds && slide.nextLevelIds.length > 0 && <NextSteps levelIds={slide.nextLevelIds} />}
    </div>
  );
}

function NextSteps({ levelIds }: { levelIds: string[] }) {
  const { t } = useTranslation('lessons');
  const { t: tDashboard } = useTranslation('dashboard');
  const navigate = useNavigate();

  return (
    <div className={styles.nextSteps}>
      <h3 className={styles.nextTitle}>{t('ui.nextSteps')}</h3>
      <div className={styles.nextList}>
        {levelIds.map((id) => {
          const level = getLevelById(id);
          if (!level) return null;
          const target = level.isLesson ? `/lesson/${id}` : `/tutorial/${level.category}/${id}`;
          return (
            <button key={id} type="button" className={styles.nextLink} onClick={() => navigate(target)}>
              <span>{tDashboard(`levels.${id.replace(/-/g, '_')}.name`)}</span>
              <Icon name="arrow-right" decorative />
            </button>
          );
        })}
      </div>
    </div>
  );
}

import type { ProblemReference } from '@/types/implementation';
import styles from './DerivedContent.module.scss';

interface DerivedContentProps {
  problems?: ProblemReference[];
}

const DerivedContent = ({ problems }: DerivedContentProps) => {
  if (!problems || problems.length === 0) {
    return null;
  }

  return (
    <div className={styles.derivedContentWrapper}>
      <h4 className={styles.derivedContentTitle}>衍生內容</h4>
      <div className={styles.derivedContentList}>
        {problems.map((problem) => (
          <a
            key={problem.id}
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.derivedCard}
          >
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <span className={`${styles.difficultyBadge} ${styles[problem.difficulty.toLowerCase()]}`}>
                  {problem.difficulty}
                </span>
                <svg className={styles.externalIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </div>
              <p className={styles.cardConcept}>
                {problem.concept}
              </p>
              <p className={styles.cardTitle}>
                #{problem.id} {problem.title}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DerivedContent;

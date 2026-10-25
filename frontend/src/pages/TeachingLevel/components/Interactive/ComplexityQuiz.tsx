import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import CodeBlock from '@/shared/components/CodeBlock';
import styles from './Interactive.module.scss';

export const QUIZ_OPTIONS = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'] as const;

interface Question {
  code: string;
  answer: string;
  explanation: string;
}

export default function ComplexityQuiz() {
  const { t } = useTranslation('lessons');
  const questions = t('visuals.complexityQuiz.questions', { returnObjects: true }) as Question[];

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const question = questions[index];
  const total = questions.length;

  const pick = (option: string) => {
    if (picked !== null) return;
    setPicked(option);
    if (option === question.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (index === total - 1) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setPicked(null);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className={styles.panel} role="group" aria-label={t('visuals.complexityQuiz.ariaLabel')}>
        <p className={styles.quizScore}>{t('visuals.complexityQuiz.score', { score, total })}</p>
        <p className={styles.hint}>{t(score === total ? 'visuals.complexityQuiz.perfect' : 'visuals.complexityQuiz.review')}</p>
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={restart}>
            {t('visuals.complexityQuiz.retry')}
          </Button>
        </div>
      </div>
    );
  }

  const variantFor = (option: string) => {
    if (picked === null) return 'secondary' as const;
    if (option === question.answer) return 'primary' as const;
    if (option === picked) return 'danger' as const;
    return 'secondary' as const;
  };

  return (
    <div className={styles.panel} role="group" aria-label={t('visuals.complexityQuiz.ariaLabel')}>
      <p className={styles.prompt}>
        {t('visuals.complexityQuiz.progress', { n: index + 1, total })} · {t('visuals.complexityQuiz.prompt')}
      </p>

      <CodeBlock filename="quiz.py" lines={question.code.split('\n')} fontSize="md" />

      <div className={styles.options}>
        {QUIZ_OPTIONS.map((option) => (
          <Button
            key={option}
            variant={variantFor(option)}
            size="sm"
            disabled={picked !== null && option !== question.answer && option !== picked}
            aria-pressed={picked === option}
            onClick={() => pick(option)}
          >
            {option}
          </Button>
        ))}
      </div>

      <p className={styles.hint} aria-live="polite">
        {picked === null
          ? ''
          : `${picked === question.answer ? t('visuals.complexityQuiz.correct') : t('visuals.complexityQuiz.wrong', { answer: question.answer })} ${question.explanation}`}
      </p>

      <div className={styles.actions}>
        <Button size="sm" disabled={picked === null} onClick={next}>
          {t(index === total - 1 ? 'visuals.complexityQuiz.seeResult' : 'visuals.complexityQuiz.next')}
        </Button>
      </div>
    </div>
  );
}

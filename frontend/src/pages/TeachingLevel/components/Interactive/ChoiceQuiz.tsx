import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import CodeBlock from '@/shared/components/CodeBlock';
import styles from './Interactive.module.scss';

interface Question {
  code: string;
  answer: string;
  explanation: string;
  /** options for this question; falls back to the quiz's shared options */
  options?: string[];
  /** replaces the quiz's usual question text */
  prompt?: string;
}

interface Props {
  /** key under visuals.* in lessons.json that holds this quiz's text and questions */
  namespace: string;
  /** options shared by every question that has none of its own */
  options?: readonly string[];
  /** name shown on the code block */
  filename?: string;
}

export default function ChoiceQuiz({ namespace, options: sharedOptions = [], filename = 'quiz.py' }: Props) {
  const { t } = useTranslation('lessons');
  const text = (name: string, values?: Record<string, unknown>) => t(`visuals.${namespace}.${name}`, values);
  const questions = t(`visuals.${namespace}.questions`, { returnObjects: true }) as Question[];

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
      <div className={styles.panel} role="group" aria-label={text('ariaLabel')}>
        <p className={styles.quizScore}>{text('score', { score, total })}</p>
        <p className={styles.hint}>{text(score === total ? 'perfect' : 'review')}</p>
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={restart}>
            {text('retry')}
          </Button>
        </div>
      </div>
    );
  }

  const options = question.options ?? sharedOptions;

  const variantFor = (option: string) => {
    if (picked === null) return 'secondary' as const;
    if (option === question.answer) return 'primary' as const;
    if (option === picked) return 'danger' as const;
    return 'secondary' as const;
  };

  return (
    <div className={styles.panel} role="group" aria-label={text('ariaLabel')}>
      <p className={styles.prompt}>
        {text('progress', { n: index + 1, total })} · {question.prompt ?? text('prompt')}
      </p>

      <CodeBlock filename={filename} lines={question.code.split('\n')} fontSize="md" />

      <div className={styles.options}>
        {options.map((option) => (
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
          : `${picked === question.answer ? text('correct') : text('wrong', { answer: question.answer })} ${question.explanation}`}
      </p>

      <div className={styles.actions}>
        <Button size="sm" disabled={picked === null} onClick={next}>
          {text(index === total - 1 ? 'seeResult' : 'next')}
        </Button>
      </div>
    </div>
  );
}

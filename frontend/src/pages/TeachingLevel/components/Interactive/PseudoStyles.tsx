import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import CodeBlock from '@/shared/components/CodeBlock';
import { PROGRAMS } from './PseudoCompare';
import styles from './Interactive.module.scss';

type StyleKey = 'platform' | 'steps' | 'mixed';

const STYLE_KEYS: StyleKey[] = ['platform', 'steps', 'mixed'];

/** Not translated: the platform style reuses the pseudocode of the side-by-side slide, the other one borrows Python */
const MIXED_LINES = ['biggest = nums[0]', 'for x in nums:', '    if x > biggest:', '        biggest = x', 'return biggest'];

export default function PseudoStyles() {
  const { t } = useTranslation('lessons');
  const [active, setActive] = useState<StyleKey>('platform');

  const stepsLines = t('visuals.pseudoStyles.stepsLines', { returnObjects: true }) as string[];
  const lines: Record<StyleKey, string[]> = {
    platform: PROGRAMS[0].pseudo,
    steps: stepsLines,
    mixed: MIXED_LINES,
  };

  return (
    <div className={styles.panel} role="group" aria-label={t('visuals.pseudoStyles.ariaLabel')}>
      <div className={styles.actions}>
        {STYLE_KEYS.map((key) => (
          <Button
            key={key}
            variant={key === active ? 'primaryOutline' : 'secondary'}
            size="sm"
            aria-pressed={key === active}
            onClick={() => setActive(key)}
          >
            {t(`visuals.pseudoStyles.styles.${key}`)}
          </Button>
        ))}
      </div>

      <CodeBlock filename={t(`visuals.pseudoStyles.styles.${active}`)} lines={lines[active]} fontSize="md" />

      <p className={styles.hint} aria-live="polite">
        {t(`visuals.pseudoStyles.notes.${active}`)}
      </p>
      <p className={styles.hint}>
        <strong>{t('visuals.pseudoStyles.hint')}</strong>
      </p>
    </div>
  );
}

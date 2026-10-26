import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import styles from './Interactive.module.scss';

interface Program {
  key: 'max' | 'search' | 'halve';
  pseudo: string[];
  python: string[];
  /** for each pseudocode line, the Python lines it turns into (none when Python needs nothing) */
  pythonOf: number[][];
}

/** Pseudocode keywords are English on the platform in every language, so these lines are not translated */
export const PROGRAMS: Program[] = [
  {
    key: 'max',
    pseudo: [
      'Procedure FindMax(nums):',
      '  biggest ← nums[0]',
      '  For each x in nums Do',
      '    If x > biggest Then',
      '      biggest ← x',
      '    End If',
      '  End For',
      '  Return biggest',
      'End Procedure',
    ],
    python: ['def find_max(nums):', '    biggest = nums[0]', '    for x in nums:', '        if x > biggest:', '            biggest = x', '    return biggest'],
    pythonOf: [[0], [1], [2], [3], [4], [], [], [5], []],
  },
  {
    key: 'search',
    pseudo: [
      'Procedure LinearSearch(nums, target):',
      '  For i ← 0 To length(nums) - 1 Do',
      '    If nums[i] = target Then',
      '      Return i',
      '    End If',
      '  End For',
      '  Return -1',
      'End Procedure',
    ],
    python: [
      'def linear_search(nums, target):',
      '    for i in range(len(nums)):',
      '        if nums[i] == target:',
      '            return i',
      '    return -1',
    ],
    pythonOf: [[0], [1], [2], [3], [], [], [4], []],
  },
  {
    key: 'halve',
    pseudo: [
      'Procedure CountHalves(n):',
      '  steps ← 0',
      '  While n > 1 Do',
      '    n ← n ÷ 2',
      '    steps ← steps + 1',
      '  End While',
      '  Return steps',
      'End Procedure',
    ],
    python: ['def count_halves(n):', '    steps = 0', '    while n > 1:', '        n = n // 2', '        steps += 1', '    return steps'],
    pythonOf: [[0], [1], [2], [3], [4], [], [5], []],
  },
];

type Selection = { side: 'pseudo' | 'python'; index: number } | null;

export default function PseudoCompare() {
  const { t } = useTranslation('lessons');
  const [programKey, setProgramKey] = useState<Program['key']>('max');
  const [selection, setSelection] = useState<Selection>(null);

  const program = PROGRAMS.find((p) => p.key === programKey)!;

  // which lines light up on each side for the current selection
  const pseudoOn = new Set<number>();
  const pythonOn = new Set<number>();
  if (selection?.side === 'pseudo') {
    pseudoOn.add(selection.index);
    program.pythonOf[selection.index].forEach((i) => pythonOn.add(i));
  } else if (selection?.side === 'python') {
    pythonOn.add(selection.index);
    program.pythonOf.forEach((targets, i) => {
      if (targets.includes(selection.index)) pseudoOn.add(i);
    });
  }

  const noCounterpart = selection?.side === 'pseudo' && program.pythonOf[selection.index].length === 0;

  const renderLines = (side: 'pseudo' | 'python', lines: string[], on: Set<number>) =>
    lines.map((line, index) => (
      <Button
        key={index}
        variant="unstyled"
        className={`${styles.pairLine} ${on.has(index) ? styles.pairLineOn : ''}`}
        aria-pressed={on.has(index)}
        onClick={() => setSelection({ side, index })}
        onMouseEnter={() => setSelection({ side, index })}
        onFocus={() => setSelection({ side, index })}
      >
        <code>{line}</code>
      </Button>
    ));

  return (
    <div className={styles.panel} role="group" aria-label={t('visuals.pseudoCompare.ariaLabel')}>
      <div className={styles.actions}>
        {PROGRAMS.map((option) => (
          <Button
            key={option.key}
            variant={option.key === programKey ? 'primaryOutline' : 'secondary'}
            size="sm"
            aria-pressed={option.key === programKey}
            onClick={() => {
              setProgramKey(option.key);
              setSelection(null);
            }}
          >
            {t(`visuals.pseudoCompare.programs.${option.key}`)}
          </Button>
        ))}
      </div>

      <div className={styles.pairs}>
        <div className={styles.pairColumn}>
          <span className={styles.pairTitle}>{t('visuals.pseudoCompare.pseudo')}</span>
          <div className={styles.pairCode}>{renderLines('pseudo', program.pseudo, pseudoOn)}</div>
        </div>
        <div className={styles.pairColumn}>
          <span className={styles.pairTitle}>Python</span>
          <div className={styles.pairCode}>{renderLines('python', program.python, pythonOn)}</div>
        </div>
      </div>

      <p className={styles.hint} aria-live="polite">
        {noCounterpart ? t('visuals.pseudoCompare.noCounterpart') : t('visuals.pseudoCompare.hint')}
      </p>
    </div>
  );
}

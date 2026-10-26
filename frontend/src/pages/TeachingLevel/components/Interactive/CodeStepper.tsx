import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import CodeBlock from '@/shared/components/CodeBlock';
import StatCard from './StatCard';
import styles from './Interactive.module.scss';

type Variables = Record<string, string>;

/** The state before `line` runs; `line` is null once the program is over */
export interface Step {
  line: number | null;
  vars: Variables;
  output: string[];
}

interface Program {
  key: 'sum' | 'max' | 'halve';
  lines: string[];
  trace: () => Step[];
}

const show = (value: unknown) => (Array.isArray(value) ? `[${value.join(', ')}]` : String(value));

/** Records a step each time a line is about to run */
function recorder() {
  const steps: Step[] = [];
  const vars: Variables = {};
  const output: string[] = [];
  return {
    set: (name: string, value: unknown) => {
      vars[name] = show(value);
    },
    print: (value: unknown) => output.push(show(value)),
    at: (line: number) => steps.push({ line, vars: { ...vars }, output: [...output] }),
    finish: () => {
      steps.push({ line: null, vars: { ...vars }, output: [...output] });
      return steps;
    },
  };
}

export const PROGRAMS: Program[] = [
  {
    key: 'sum',
    lines: ['nums = [4, 8, 15]', 'total = 0', 'for x in nums:', '    total += x', 'print(total)'],
    trace: () => {
      const r = recorder();
      const nums = [4, 8, 15];
      r.at(0);
      r.set('nums', nums);
      r.at(1);
      let total = 0;
      r.set('total', total);
      for (const x of nums) {
        r.at(2);
        r.set('x', x);
        r.at(3);
        total += x;
        r.set('total', total);
      }
      r.at(2);
      r.at(4);
      r.print(total);
      return r.finish();
    },
  },
  {
    key: 'max',
    lines: ['nums = [3, 9, 4]', 'biggest = nums[0]', 'for x in nums:', '    if x > biggest:', '        biggest = x', 'print(biggest)'],
    trace: () => {
      const r = recorder();
      const nums = [3, 9, 4];
      r.at(0);
      r.set('nums', nums);
      r.at(1);
      let biggest = nums[0];
      r.set('biggest', biggest);
      for (const x of nums) {
        r.at(2);
        r.set('x', x);
        r.at(3);
        if (x > biggest) {
          r.at(4);
          biggest = x;
          r.set('biggest', biggest);
        }
      }
      r.at(2);
      r.at(5);
      r.print(biggest);
      return r.finish();
    },
  },
  {
    key: 'halve',
    lines: ['n = 20', 'steps = 0', 'while n > 1:', '    n = n // 2', '    steps += 1', 'print(steps)'],
    trace: () => {
      const r = recorder();
      r.at(0);
      let n = 20;
      r.set('n', n);
      r.at(1);
      let steps = 0;
      r.set('steps', steps);
      while (true) {
        r.at(2);
        if (!(n > 1)) break;
        r.at(3);
        n = Math.floor(n / 2);
        r.set('n', n);
        r.at(4);
        steps += 1;
        r.set('steps', steps);
      }
      r.at(5);
      r.print(steps);
      return r.finish();
    },
  },
];

export default function CodeStepper() {
  const { t } = useTranslation('lessons');
  const [programKey, setProgramKey] = useState<Program['key']>('sum');
  const [position, setPosition] = useState(0);

  const program = PROGRAMS.find((p) => p.key === programKey)!;
  const steps = program.trace();
  const step = steps[position];
  const finished = step.line === null;
  const names = Object.keys(step.vars);

  const choose = (key: Program['key']) => {
    setProgramKey(key);
    setPosition(0);
  };

  return (
    <div className={styles.panel} role="group" aria-label={t('visuals.codeStepper.ariaLabel')}>
      <div className={styles.actions}>
        {PROGRAMS.map((option) => (
          <Button
            key={option.key}
            variant={option.key === programKey ? 'primaryOutline' : 'secondary'}
            size="sm"
            aria-pressed={option.key === programKey}
            onClick={() => choose(option.key)}
          >
            {t(`visuals.codeStepper.programs.${option.key}`)}
          </Button>
        ))}
      </div>

      <CodeBlock filename="program.py" lines={program.lines} highlightedLines={finished ? [] : [step.line! + 1]} fontSize="md" />

      <div className={styles.stats}>
        <StatCard
          inline
          label={t('visuals.codeStepper.variables')}
          value={names.length === 0 ? '—' : names.map((name) => `${name} = ${step.vars[name]}`).join('   ')}
        />
        <StatCard inline label={t('visuals.codeStepper.output')} value={step.output.length === 0 ? '—' : step.output.join(', ')} />
      </div>

      <div className={styles.actions}>
        <Button size="sm" disabled={finished} onClick={() => setPosition(position + 1)}>
          {t('visuals.codeStepper.next')}
        </Button>
        <Button variant="secondary" size="sm" disabled={position === 0} onClick={() => setPosition(0)}>
          {t('visuals.codeStepper.reset')}
        </Button>
      </div>

      <p className={styles.hint} aria-live="polite">
        {finished ? t('visuals.codeStepper.finished', { count: position }) : t('visuals.codeStepper.hint')}
      </p>
    </div>
  );
}

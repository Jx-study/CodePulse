import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BstShape, { insertKey, treeHeight } from './BstShape';
import CallStack from './CallStack';
import CodeQuiz from './CodeQuiz';
import CodeStepper, { PROGRAMS as STEPPER_PROGRAMS } from './CodeStepper';
import ComplexityQuiz from './ComplexityQuiz';
import { crossover } from './DominantTerm';
import { edgeCells } from './GraphStorage';
import GrowthExplorer from './GrowthExplorer';
import NumberGuess, { worstCaseGuesses } from './NumberGuess';
import PseudoCompare, { PROGRAMS as PAIR_PROGRAMS } from './PseudoCompare';
import PseudoStyles from './PseudoStyles';
import SearchCases from './SearchCases';
import StepCounter from './StepCounter';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === 'visuals.complexityQuiz.questions') {
        return [
          { code: 'a', answer: 'O(1)', explanation: 'e1' },
          { code: 'b', answer: 'O(n)', explanation: 'e2' },
        ];
      }
      if (key === 'visuals.pseudoStyles.stepsLines') return ['step one', 'step two'];
      if (key === 'visuals.codeQuiz.questions') {
        return [
          { prompt: 'own prompt', code: 'a', options: ['x', 'y'], answer: 'y', explanation: 'e1' },
          { code: 'b', options: ['p', 'q', 'r'], answer: 'p', explanation: 'e2' },
        ];
      }
      return options ? `${key} ${JSON.stringify(options)}` : key;
    },
    i18n: { language: 'en' },
  }),
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function mount(element: React.ReactElement) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root!.render(element));
  return container;
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  vi.useRealTimers();
});

const buttonByText = (el: HTMLElement, text: string) =>
  Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes(text)) as HTMLButtonElement;

describe('StepCounter', () => {
  it('counts one step per executed line and reports the total at the end', () => {
    const el = mount(<StepCounter />);
    const next = buttonByText(el, 'visuals.stepCounter.next');
    for (let i = 0; i < 7; i++) act(() => next.click());
    expect(next.disabled).toBe(true);
    expect(el.textContent).toContain('"total":7');
  });
});

describe('SearchCases', () => {
  it('finds the first item in one comparison (best case)', () => {
    vi.useFakeTimers();
    const el = mount(<SearchCases />);
    act(() => (el.querySelector('[aria-label*="\\"value\\":7"]') as HTMLButtonElement).click());
    act(() => vi.advanceTimersByTime(2000));
    expect(el.textContent).toContain('visuals.searchCases.verdict.best');
  });

  it('scans everything when the target is missing (worst case)', () => {
    vi.useFakeTimers();
    const el = mount(<SearchCases />);
    act(() => buttonByText(el, 'visuals.searchCases.missing').click());
    for (let i = 0; i < 8; i++) act(() => vi.advanceTimersByTime(400));
    expect(el.textContent).toContain('visuals.searchCases.verdict.worst');
    expect(el.textContent).toContain('8 / 8');
  });
});

describe('GrowthExplorer', () => {
  it('shows a row for every growth class', () => {
    const el = mount(<GrowthExplorer />);
    for (const label of ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)']) {
      expect(el.textContent).toContain(label);
    }
  });
});

describe('pure helpers', () => {
  it('finds where the highest power term overtakes the rest', () => {
    const square = { label: 'n²', degree: 2, value: (n: number) => n * n };
    const linear = { label: '100n', degree: 1, value: (n: number) => 100 * n };
    expect(crossover([square, linear])).toBe(101);
    expect(crossover([{ label: '3n', degree: 1, value: (n: number) => 3 * n }, { label: '5', degree: 0, value: () => 5 }])).toBe(2);
  });

  it('knows the most guesses a number range can need', () => {
    expect(worstCaseGuesses(100)).toBe(7);
    expect(worstCaseGuesses(32)).toBe(6);
    expect(worstCaseGuesses(8)).toBe(4);
  });

  it('fills exactly E distinct edge cells without self loops', () => {
    const cells = edgeCells(5, 12);
    expect(cells.size).toBe(12);
    for (const cell of cells) expect(Math.floor(cell / 5)).not.toBe(cell % 5);
    expect(edgeCells(4, 12).size).toBe(12);
  });

  it('grows a balanced tree and a degenerate one', () => {
    const build = (keys: number[]) => keys.reduce<ReturnType<typeof insertKey> | null>((t, k) => insertKey(t, k), null);
    expect(treeHeight(build([30, 20, 40, 10, 25, 35, 45]))).toBe(3);
    expect(treeHeight(build([10, 20, 30, 40, 50]))).toBe(5);
  });
});

describe('CallStack', () => {
  it('goes n deep and reports it when finished', () => {
    const el = mount(<CallStack />);
    const next = buttonByText(el, 'visuals.callStack.next');
    for (let i = 0; i < 8; i++) act(() => next.click());
    expect(next.disabled).toBe(true);
    expect(el.textContent).toContain('visuals.callStack.finishedRecursive {"depth":4}');
  });
});

describe('BstShape', () => {
  it('shows a degenerate tree after sorted inserts', () => {
    const el = mount(<BstShape />);
    act(() => buttonByText(el, 'visuals.bstShape.all').click());
    expect(el.textContent).toContain('visuals.bstShape.degenerate');
  });
});

describe('ComplexityQuiz', () => {
  it('scores answers and shows the result', () => {
    const el = mount(<ComplexityQuiz />);
    act(() => buttonByText(el, 'O(1)').click());
    expect(el.textContent).toContain('visuals.complexityQuiz.correct');
    act(() => buttonByText(el, 'visuals.complexityQuiz.next').click());
    act(() => buttonByText(el, 'O(log n)').click());
    expect(el.textContent).toContain('visuals.complexityQuiz.wrong');
    act(() => buttonByText(el, 'visuals.complexityQuiz.seeResult').click());
    expect(el.textContent).toContain('"score":1');
  });
});

describe('NumberGuess', () => {
  it('finds the number by always guessing the middle within the worst case', () => {
    const el = mount(<NumberGuess />);
    const middle = buttonByText(el, 'visuals.numberGuess.middle');
    for (let i = 0; i < 6 && !middle.disabled; i++) act(() => middle.click());
    expect(middle.disabled).toBe(true);
    expect(el.textContent).toContain('visuals.numberGuess.found');
  });
});

describe('code stepper programs', () => {
  it.each([
    ['sum', '27'],
    ['max', '9'],
    ['halve', '4'],
  ])('%s ends with the output %s', (key, output) => {
    const steps = STEPPER_PROGRAMS.find((p) => p.key === key)!.trace();
    const last = steps[steps.length - 1];
    expect(last.line).toBeNull();
    expect(last.output).toEqual([output]);
  });

  it('only visits lines that exist and always starts on the first line', () => {
    for (const program of STEPPER_PROGRAMS) {
      const steps = program.trace();
      expect(steps[0].line).toBe(0);
      for (const step of steps) {
        if (step.line !== null) expect(step.line).toBeLessThan(program.lines.length);
      }
    }
  });
});

describe('CodeStepper', () => {
  it('runs a program to the end one line at a time', () => {
    const el = mount(<CodeStepper />);
    const next = buttonByText(el, 'visuals.codeStepper.next');
    const total = STEPPER_PROGRAMS[0].trace().length - 1;
    for (let i = 0; i < total; i++) act(() => next.click());
    expect(next.disabled).toBe(true);
    expect(el.textContent).toContain('visuals.codeStepper.finished');
  });
});

describe('pseudocode next to Python', () => {
  it('maps every pseudocode line and covers every Python line', () => {
    for (const program of PAIR_PROGRAMS) {
      expect(program.pythonOf, program.key).toHaveLength(program.pseudo.length);
      const covered = new Set(program.pythonOf.flat());
      for (const target of covered) expect(target).toBeLessThan(program.python.length);
      for (let i = 0; i < program.python.length; i++) expect(covered.has(i), `${program.key} python line ${i}`).toBe(true);
    }
  });

  it('lights up the matching Python line when a pseudocode line is chosen', () => {
    const el = mount(<PseudoCompare />);
    const lines = Array.from(el.querySelectorAll('button[aria-pressed]')).filter((b) => b.querySelector('code')) as HTMLButtonElement[];
    const pseudoLine = lines.find((b) => b.textContent === '  biggest ← nums[0]')!;
    act(() => pseudoLine.click());
    const lit = lines.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.textContent?.trim());
    expect(lit).toContain('biggest ← nums[0]');
    expect(lit).toContain('biggest = nums[0]');
  });

  it('explains that an End line has no Python counterpart', () => {
    const el = mount(<PseudoCompare />);
    const lines = Array.from(el.querySelectorAll('button[aria-pressed]')).filter((b) => b.querySelector('code')) as HTMLButtonElement[];
    act(() => lines.find((b) => b.textContent === '    End If')!.click());
    expect(el.textContent).toContain('visuals.pseudoCompare.noCounterpart');
  });
});

describe('CodeQuiz', () => {
  it('uses the options and prompt that belong to each question', () => {
    const el = mount(<CodeQuiz />);
    expect(el.textContent).toContain('own prompt');
    expect(buttonByText(el, 'x')).toBeTruthy();
    act(() => buttonByText(el, 'y').click());
    expect(el.textContent).toContain('visuals.codeQuiz.correct');
    act(() => buttonByText(el, 'visuals.codeQuiz.next').click());
    expect(buttonByText(el, 'r')).toBeTruthy();
  });
});

describe('PseudoStyles', () => {
  it('shows the same algorithm in three styles', () => {
    const el = mount(<PseudoStyles />);
    expect(el.textContent).toContain('Procedure FindMax(nums):');
    act(() => buttonByText(el, 'visuals.pseudoStyles.styles.steps').click());
    expect(el.textContent).toContain('step one');
    act(() => buttonByText(el, 'visuals.pseudoStyles.styles.mixed').click());
    expect(el.textContent).toContain('biggest = nums[0]');
  });
});

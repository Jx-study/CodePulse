export const COMPLEXITY_CLASS_NAME = 'complexity-line-decoration';
export const COMPLEXITY_STYLE_ID = 'monaco-complexity-styles';

export const COMPLEXITY_COLORS = {
  'O(1)': '#6a9955',
  'O(log n)': '#4fc1ff',
  'O(n)': '#d19a66',
  'O(n log n)': '#c586c0',
  'O(n^2)': '#f44747',
  'O(2^n)': '#ff0000',
  'O(n!)': '#8b0000',
};

const COMPLEXITY_RANK: Record<string, number> = {
  'O(1)': 0,
  'O(log n)': 1,
  'O(n)': 2,
  'O(n log n)': 3,
  'O(n^2)': 4,
};

const RANK_COLOR_KEYS = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)'] as const;

export function combineComplexity(a: string, b: string): string {
  if (a === 'O(n!)' || b === 'O(n!)') return 'O(n!)';
  if (a === 'O(2^n)' || b === 'O(2^n)') return 'O(2^n)';

  const normalize = (s: string) => (s in COMPLEXITY_RANK ? s : 'O(n)');
  const na = normalize(a);
  const nb = normalize(b);

  if (na === 'O(1)') return nb;
  if (nb === 'O(1)') return na;

  const combined = COMPLEXITY_RANK[na] + COMPLEXITY_RANK[nb];
  return combined <= 4 ? RANK_COLOR_KEYS[combined] : 'O(2^n)';
}

import levelsData from '@/data/levels/levels.json';

// 跑馬燈用原文術語，兩個語系共用；新增關卡時請在這裡補上名稱（測試會檢查有沒有漏）
export const MARQUEE_LABELS: Record<string, string> = {
  array: 'Array',
  'linked-list': 'Linked List',
  stack: 'Stack',
  queue: 'Queue',
  binarytree: 'Binary Tree',
  bst: 'BST',
  heap: 'Heap',
  graph: 'Graph',
  trie: 'Trie',
  'bubble-sort': 'Bubble Sort',
  'selection-sort': 'Selection Sort',
  'insertion-sort': 'Insertion Sort',
  'merge-sort': 'Merge Sort',
  'quick-sort': 'Quick Sort',
  'binary-search': 'Binary Search',
  factorial: 'Factorial',
  'fibonacci-recursive': 'Fibonacci',
  'n-queens': 'N-Queens',
  'prefix-sum': 'Prefix Sum',
  'sliding-window': 'Sliding Window',
  'two-pointers': 'Two Pointers',
  bfs: 'BFS',
  dfs: 'DFS',
  'topological-sort': 'Topological Sort',
  dijkstra: 'Dijkstra',
  'dp-fibonacci': 'Fibonacci DP',
  knapsack: 'Knapsack',
  lcs: 'LCS',
};

const isListedLevel = (level: { id: string; isDeveloped: boolean }) =>
  level.isDeveloped && !level.id.startsWith('portal-to-');

const toTitle = (id: string) =>
  id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const developedLevelIds = levelsData.levels
  .filter(isListedLevel)
  .map((level) => level.id);

export const marqueeItems = developedLevelIds.map(
  (id) => MARQUEE_LABELS[id] ?? toTitle(id),
);

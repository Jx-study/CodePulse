import type { LessonSpec } from '../types';

/**
 * 入門課程的結構（與語言無關）。
 * 每一關的 id 同時是 levels.json 的關卡 id 與 locales/<lng>/lessons.json 的 key；
 * slides 依序對應 lessons.json 裡同一關的 slides 陣列，封面由標題自動產生。
 */
export const LESSON_SPECS: LessonSpec[] = [
  {
    id: 'what-is-dsa',
    icon: 'lightbulb',
    color: '#635bff',
    estimatedMinutes: 4,
    slides: [
      { type: 'concept' },
      { type: 'concept' },
      {
        type: 'comparison',
        comparisons: [
          { icon: 'gear', color: '#635bff' },
          { icon: 'database', color: '#10b981' },
          { icon: 'bolt', color: '#f59e0b' },
        ],
      },
      { type: 'visual', visual: 'ds-diagram' },
      { type: 'list' },
      { type: 'summary', nextLevelIds: ['big-o-basics'] },
    ],
  },
  {
    id: 'big-o-basics',
    icon: 'chart-line',
    color: '#10b981',
    estimatedMinutes: 5,
    slides: [
      { type: 'concept' },
      { type: 'code', language: 'python' },
      { type: 'visual', visual: 'step-counter' },
      { type: 'list' },
      { type: 'concept' },
      {
        type: 'comparison',
        comparisons: [
          { icon: 'bolt', color: '#10b981' },
          { icon: 'magnifying-glass', color: '#f59e0b' },
        ],
      },
      { type: 'summary', nextLevelIds: ['growth-rates'] },
    ],
  },
  {
    id: 'growth-rates',
    icon: 'signal',
    color: '#f59e0b',
    estimatedMinutes: 6,
    slides: [
      { type: 'visual', visual: 'big-o-chart' },
      { type: 'table' },
      { type: 'visual', visual: 'growth-explorer' },
      { type: 'concept' },
      { type: 'code', language: 'python' },
      { type: 'code', language: 'python' },
      {
        type: 'comparison',
        comparisons: [
          { icon: 'magnifying-glass', color: '#3b82f6' },
          { icon: 'sitemap', color: '#f97316' },
          { icon: 'layer-group', color: '#ef4444' },
        ],
      },
      { type: 'concept' },
      { type: 'summary', nextLevelIds: ['array', 'case-analysis'] },
    ],
  },
  {
    id: 'case-analysis',
    icon: 'scale-balanced',
    color: '#ef4444',
    estimatedMinutes: 6,
    slides: [
      { type: 'concept' },
      { type: 'list' },
      { type: 'visual', visual: 'search-cases' },
      { type: 'concept' },
      { type: 'code', language: 'python' },
      {
        type: 'comparison',
        comparisons: [
          { icon: 'sitemap', color: '#10b981' },
          { icon: 'route', color: '#ef4444' },
          { icon: 'scale-balanced', color: '#3b82f6' },
        ],
      },
      { type: 'summary', nextLevelIds: ['bubble-sort', 'bst'] },
    ],
  },
  {
    id: 'space-complexity',
    icon: 'layer-group',
    color: '#8b5cf6',
    estimatedMinutes: 6,
    slides: [
      { type: 'concept' },
      { type: 'code', language: 'python' },
      { type: 'code', language: 'python' },
      {
        type: 'comparison',
        comparisons: [
          { icon: 'bolt', color: '#10b981' },
          { icon: 'arrows-spin', color: '#f59e0b' },
          { icon: 'route', color: '#ef4444' },
        ],
      },
      { type: 'concept' },
      { type: 'summary', nextLevelIds: ['factorial', 'binary-search', 'merge-sort'] },
    ],
  },
  {
    id: 'multi-variable-complexity',
    icon: 'sitemap',
    color: '#0ea5e9',
    estimatedMinutes: 7,
    slides: [
      { type: 'concept' },
      { type: 'list' },
      {
        type: 'comparison',
        comparisons: [
          { icon: 'diagram-project', color: '#ec4899' },
          { icon: 'sitemap', color: '#10b981' },
          { icon: 'route', color: '#3b82f6' },
        ],
      },
      { type: 'table' },
      { type: 'table' },
      { type: 'summary', nextLevelIds: ['bfs', 'dijkstra', 'binarytree'] },
    ],
  },
];

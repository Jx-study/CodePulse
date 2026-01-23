/**
 * 統一的 Level 配置系統
 * 整合 Algorithm 和 DataStructure 的配置
 */

import type { Level, LevelConfig, AlgorithmCategory } from '@/types/pages/dashboard';
import type { AlgorithmConfig } from '@/types/algorithm';
import type { DataStructureConfig } from '@/types/dataStructure';

import { algorithmsMap } from '../algorithms/index';
import { dataStructuresMap } from '../DataStructure';

/** Category 基本配置（內部使用） */
interface CategoryConfigInternal {
  id: AlgorithmCategory;
  name: string;
  nameEn: string;
  description: string;
  icon?: string;
  colorTheme: string;
  order: number;
}

/** 所有分類配置 */
export const CATEGORIES: Record<AlgorithmCategory, CategoryConfigInternal> = {
  'data-structures': {
    id: 'data-structures',
    name: '資料結構',
    nameEn: 'Data Structures',
    description: '學習各種資料結構的運作原理與應用',
    icon: 'database',
    colorTheme: '#635bff',
    order: 1,
  },
  sorting: {
    id: 'sorting',
    name: '排序演算法',
    nameEn: 'Sorting Algorithms',
    description: '掌握各種排序演算法的實作與效能分析',
    icon: 'sort',
    colorTheme: '#ff6b6b',
    order: 2,
  },
  searching: {
    id: 'searching',
    name: '搜尋演算法',
    nameEn: 'Searching Algorithms',
    description: '探索高效的搜尋策略與技巧',
    icon: 'search',
    colorTheme: '#51cf66',
    order: 3,
  },
  graph: {
    id: 'graph',
    name: '圖論演算法',
    nameEn: 'Graph Algorithms',
    description: '深入理解圖論的核心演算法',
    icon: 'project-diagram',
    colorTheme: '#ffd43b',
    order: 4,
  },
};

/** 所有關卡配置 */
export const LEVELS_CONFIG: LevelConfig[] = [
// ============ Data Structures 類別 ============
  {
    id: 'linked-list',
    name: '鏈結串列',
    nameEn: 'Linked List',
    category: 'data-structures',
    difficulty: 1,
    description: '動態資料結構基礎',
    learningObjectives: [
      '理解鏈結串列的基本結構',
      '掌握節點插入與刪除',
      '分析時間複雜度'
    ],
    isDeveloped: true,
    isUnlocked: false,
    prerequisites: { type: 'NONE', levelIds: [] },
    graphPosition: { layer: 0, branch: 'main', horizontalIndex: 0 },
    pathMetadata: { pathType: 'main' },
    implementationType: 'dataStructure',
    implementationKey: 'linear/linkedlist'
  },
  {
    id: 'stack',
    name: '堆疊',
    nameEn: 'Stack',
    category: 'data-structures',
    difficulty: 1,
    description: '後進先出 (LIFO) 資料結構',
    learningObjectives: [
      '理解 LIFO 原則',
      '掌握 push/pop 操作',
      '應用於函式呼叫堆疊'
    ],
    isDeveloped: true,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['linked-list'] },
    graphPosition: { layer: 1, branch: 'left', horizontalIndex: 0 },
    pathMetadata: { pathType: 'branch', branchLabel: 'LIFO 結構' },
    implementationType: 'dataStructure',
    implementationKey: 'linear/stack'
  },
  {
    id: 'queue',
    name: '佇列',
    nameEn: 'Queue',
    category: 'data-structures',
    difficulty: 1,
    description: '先進先出 (FIFO) 資料結構',
    learningObjectives: [
      '理解 FIFO 原則',
      '掌握 enqueue/dequeue 操作',
      '應用於廣度優先搜尋'
    ],
    isDeveloped: true,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['linked-list'] },
    graphPosition: { layer: 1, branch: 'right', horizontalIndex: 0 },
    pathMetadata: { pathType: 'branch', branchLabel: 'FIFO 結構' },
    implementationType: 'dataStructure',
    implementationKey: 'linear/queue'
  },
  // ============ Sorting 類別 ============
  {
    id: 'bubble-sort',
    name: '氣泡排序',
    nameEn: 'Bubble Sort',
    category: 'sorting',
    difficulty: 1,
    description: '最基礎的排序演算法，透過不斷交換相鄰元素來排序',
    learningObjectives: [
      '理解排序演算法的基本概念',
      '掌握雙層迴圈的邏輯',
      '分析時間複雜度 O(n²)'
    ],
    isDeveloped: false,
    isUnlocked: true,
    prerequisites: { type: 'NONE', levelIds: [] },
    graphPosition: { layer: 0, branch: 'main', horizontalIndex: 0 },
    pathMetadata: { pathType: 'main' },
    implementationType: 'algorithm',
    implementationKey: 'sorting/bubble-sort'
  },
  {
    id: 'selection-sort',
    name: '選擇排序',
    nameEn: 'Selection Sort',
    category: 'sorting',
    difficulty: 1,
    description: '每次從未排序部分選擇最小值放到已排序部分末尾',
    learningObjectives: [
      '理解選擇排序的核心邏輯',
      '比較氣泡排序與選擇排序的差異',
      '分析時間複雜度 O(n²)'
    ],
    isDeveloped: false,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['bubble-sort'] },
    graphPosition: { layer: 1, branch: 'left', horizontalIndex: 0 },
    pathMetadata: { pathType: 'branch', branchLabel: '比較排序' },
    implementationType: 'algorithm',
    implementationKey: 'sorting/selection-sort'
  },
  {
    id: 'insertion-sort',
    name: '插入排序',
    nameEn: 'Insertion Sort',
    category: 'sorting',
    difficulty: 1,
    description: '將元素插入到已排序部分的正確位置',
    learningObjectives: [
      '理解插入排序的實作方式',
      '掌握適用場景（小規模資料）',
      '分析最佳與最壞情況'
    ],
    isDeveloped: false,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['bubble-sort'] },
    graphPosition: { layer: 1, branch: 'right', horizontalIndex: 0 },
    pathMetadata: { pathType: 'branch', branchLabel: '插入排序' },
    implementationType: 'algorithm',
    implementationKey: 'sorting/insertion-sort'
  },
  {
    id: 'merge-sort',
    name: '合併排序',
    nameEn: 'Merge Sort',
    category: 'sorting',
    difficulty: 3,
    description: '使用分治法的穩定排序演算法',
    learningObjectives: [
      '理解分治法的核心思想',
      '掌握遞迴實作技巧',
      '分析時間複雜度 O(n log n)'
    ],
    isDeveloped: true,
    isUnlocked: false,
    prerequisites: { type: 'OR', levelIds: ['selection-sort', 'insertion-sort'] },
    graphPosition: { layer: 2, branch: 'main', horizontalIndex: 0 },
    pathMetadata: { pathType: 'convergence' },
    implementationType: 'algorithm',
    implementationKey: 'sorting/merge-sort'
  },
  {
    id: 'quick-sort',
    name: '快速排序',
    nameEn: 'Quick Sort',
    category: 'sorting',
    difficulty: 3,
    description: '使用分治法的高效排序演算法',
    learningObjectives: [
      '理解快速排序的分區邏輯',
      '掌握 pivot 選擇策略',
      '分析平均時間複雜度 O(n log n)'
    ],
    isDeveloped: true,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['merge-sort'] },
    graphPosition: { layer: 3, branch: 'main', horizontalIndex: 0 },
    pathMetadata: { pathType: 'boss' },
    implementationType: 'algorithm',
    implementationKey: 'sorting/quick-sort'
  },

  // ============ Searching 類別 ============
  {
    id: 'binary-search',
    name: '二分搜尋',
    nameEn: 'Binary Search',
    category: 'searching',
    difficulty: 2,
    description: '在已排序陣列中快速找到目標值',
    learningObjectives: [
      '理解二分搜尋的原理',
      '掌握邊界條件處理',
      '分析時間複雜度 O(log n)'
    ],
    isDeveloped: true,
    isUnlocked: false,
    prerequisites: { type: 'NONE', levelIds: [] },
    graphPosition: { layer: 0, branch: 'main', horizontalIndex: 0 },
    pathMetadata: { pathType: 'main' },
    implementationType: 'algorithm',
    implementationKey: 'searching/binary-search'
  },
  {
    id: 'linear-search',
    name: '線性搜尋',
    nameEn: 'Linear Search',
    category: 'searching',
    difficulty: 1,
    description: '依序檢查每個元素直到找到目標值',
    learningObjectives: [
      '理解線性搜尋的基本概念',
      '比較與二分搜尋的差異',
      '分析時間複雜度 O(n)'
    ],
    isDeveloped: false,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['binary-search'] },
    graphPosition: { layer: 1, branch: 'main', horizontalIndex: 0 },
    pathMetadata: { pathType: 'main' },
    implementationType: 'algorithm',
    implementationKey: 'searching/linear-search'
  },

  // ============ Graph 類別 ============
  {
    id: 'bfs',
    name: '廣度優先搜尋',
    nameEn: 'BFS',
    category: 'graph',
    difficulty: 3,
    description: '使用佇列實作的圖遍歷演算法',
    learningObjectives: [
      '理解 BFS 的遍歷順序',
      '掌握佇列的使用方式',
      '應用於最短路徑問題'
    ],
    isDeveloped: false,
    isUnlocked: false,
    prerequisites: { type: 'NONE', levelIds: [] },
    graphPosition: { layer: 0, branch: 'main', horizontalIndex: 0 },
    pathMetadata: { pathType: 'main' },
    implementationType: 'algorithm',
    implementationKey: 'graph/bfs'
  },
];

/** 根據 ID 獲取關卡配置 */
export function getLevelById(levelId: string): LevelConfig | null {
  return LEVELS_CONFIG.find(level => level.id === levelId) || null;
}

/** 根據分類獲取關卡列表 */
export function getLevelsByCategory(category: AlgorithmCategory | 'all'): LevelConfig[] {
  if (category === 'all') return LEVELS_CONFIG;
  return LEVELS_CONFIG.filter(level => level.category === category);
}

/** 獲取關卡的實作（Algorithm 或 DataStructure config） */
export function getLevelImplementation(
  levelId: string
): AlgorithmConfig | DataStructureConfig | null {
  const level = getLevelById(levelId);
  if (!level) return null;

  if (level.implementationType === 'algorithm') {
    return algorithmsMap[level.implementationKey] || null;
  } else if (level.implementationType === 'dataStructure') {
    return dataStructuresMap[level.implementationKey] || null;
  }

  return null;
}

/** 檢查關卡是否已實作 */
export function isLevelImplemented(levelId: string): boolean {
  const implementation = getLevelImplementation(levelId);
  return implementation !== null;
}

/** 獲取所有已開發的關卡 */
export function getDevelopedLevels(): LevelConfig[] {
  return LEVELS_CONFIG.filter(level => level.isDeveloped);
}

/** 將 LevelConfig 轉換為 Level（移除實作細節） */
export function levelConfigToLevel(config: LevelConfig): Level {
  const { implementationType, implementationKey, ...level } = config;
  return level;
}

/** 獲取所有關卡（Level[] 格式，向後兼容） */
export function getAllLevels(): Level[] {
  return LEVELS_CONFIG.map(levelConfigToLevel);
}

/** 獲取分類名稱 */
export function getCategoryName(categoryId: AlgorithmCategory): string {
  return CATEGORIES[categoryId]?.name || categoryId;
}

/** 獲取所有分類配置 */
export function getAllCategories(): CategoryConfigInternal[] {
  return Object.values(CATEGORIES);
}
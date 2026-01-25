/**
 * 統一的 Level 配置系統
 * 整合 Algorithm 和 DataStructure 的配置
 */

import type { Level, LevelConfig, AlgorithmCategory } from '@/types/pages/dashboard';
import type { AlgorithmConfig } from '@/types/algorithm';
import type { DataStructureConfig } from '@/types/dataStructure';
import type { Category, UserProgress } from "@/types";

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
  "data-structures": {
    id: "data-structures",
    name: "資料結構",
    nameEn: "Data Structures",
    description: "學習各種資料結構的運作原理與應用",
    icon: "sitemap",
    colorTheme: "#635bff",
    order: 1,
  },
  sorting: {
    id: "sorting",
    name: "排序演算法",
    nameEn: "Sorting Algorithms",
    description: "掌握各種排序演算法的實作與效能分析",
    icon: "signal",
    colorTheme: "#ff6b6b",
    order: 2,
  },
  searching: {
    id: "searching",
    name: "搜尋演算法",
    nameEn: "Searching Algorithms",
    description: "探索高效的搜尋策略與技巧",
    icon: "magnifying-glass",
    colorTheme: "#51cf66",
    order: 3,
  },
  graph: {
    id: "graph",
    name: "圖論演算法",
    nameEn: "Graph Algorithms",
    description: "深入理解圖論的核心演算法",
    icon: "diagram-project",
    colorTheme: "#ffd43b",
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
    isUnlocked: true,
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
    graphPosition: { layer: 1, branch: 'right', horizontalIndex: 1 },
    pathMetadata: { pathType: 'branch', branchLabel: 'FIFO 結構' },
    implementationType: 'dataStructure',
    implementationKey: 'linear/queue'
  },
  {
    id: 'doubly-linked-list',
    name: '雙向鏈結串列',
    nameEn: 'Doubly Linked List',
    category: 'data-structures',
    difficulty: 2,
    description: '進階鏈結結構，支援雙向遍歷',
    learningObjectives: [
      '理解雙向鏈結的優勢',
      '掌握前後指標管理',
      '應用於 LRU Cache'
    ],
    isDeveloped: false,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['stack', 'queue'] },
    graphPosition: { layer: 2, branch: 'main', horizontalIndex: 0 },
    pathMetadata: { pathType: 'boss' },
    implementationType: 'dataStructure',
    implementationKey: 'linear/doubly-linkedlist'
  },
  // 測試：同一 layer 有 3 個節點
  {
    id: 'test-node-1',
    name: '測試節點 1',
    nameEn: 'Test Node 1',
    category: 'data-structures',
    difficulty: 1,
    description: '這是測試節點 1（最左邊）',
    learningObjectives: [
      '展示 horizontalIndex = 0',
      '使用 nodeSpacing 控制間距',
    ],
    isDeveloped: false,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['doubly-linked-list'] },
    graphPosition: { layer: 3, branch: 'main', horizontalIndex: 0 },
    pathMetadata: { pathType: 'main' },
    implementationType: 'dataStructure',
    implementationKey: 'linear/linkedlist'
  },
  {
    id: 'test-node-2',
    name: '測試節點 2',
    nameEn: 'Test Node 2',
    category: 'data-structures',
    difficulty: 1,
    description: '這是測試節點 2（中間）',
    learningObjectives: [
      '展示 horizontalIndex = 1',
      '使用 nodeSpacing 控制間距',
    ],
    isDeveloped: false,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['doubly-linked-list'] },
    graphPosition: { layer: 3, branch: 'main', horizontalIndex: 1 },
    pathMetadata: { pathType: 'main' },
    implementationType: 'dataStructure',
    implementationKey: 'linear/stack'
  },
  {
    id: 'test-node-3',
    name: '測試節點 3',
    nameEn: 'Test Node 3',
    category: 'data-structures',
    difficulty: 1,
    description: '這是測試節點 3（最右邊）',
    learningObjectives: [
      '展示 horizontalIndex = 2',
      '使用 nodeSpacing 控制間距',
    ],
    isDeveloped: false,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['doubly-linked-list'] },
    graphPosition: { layer: 3, branch: 'main', horizontalIndex: 2 },
    pathMetadata: { pathType: 'main' },
    implementationType: 'dataStructure',
    implementationKey: 'linear/queue'
  },
  {
    id: 'portal-to-sorting',
    name: '傳送門：排序演算法',
    nameEn: 'Portal: Sorting Algorithms',
    category: 'data-structures',
    difficulty: 1,
    isDeveloped: true,
    isUnlocked: false,
    prerequisites: { type: 'OR', levelIds: ['test-node-1', 'test-node-2', 'test-node-3'] },
    graphPosition: { layer: 4, branch: 'main', horizontalIndex: 0 },
    pathMetadata: {
      pathType: 'portal',
      targetCategory: 'sorting'
    },
    implementationType: 'algorithm',
    implementationKey: 'sorting/bubble-sort' // Portal 使用下一個 category 的第一個關卡
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
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['portal-to-sorting'] },
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
    graphPosition: { layer: 1, branch: 'right', horizontalIndex: 1 },
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
  {
    id: 'portal-to-searching',
    name: '傳送門：搜尋演算法',
    nameEn: 'Portal: Searching Algorithms',
    category: 'sorting',
    difficulty: 1,
    isDeveloped: true,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['quick-sort'] },
    graphPosition: { layer: 4, branch: 'main', horizontalIndex: 0 },
    pathMetadata: {
      pathType: 'portal',
      targetCategory: 'searching'
    },
    implementationType: 'algorithm',
    implementationKey: 'searching/binary-search'
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
    prerequisites: { type: 'AND', levelIds: ['portal-to-searching'] },
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
    pathMetadata: { pathType: 'boss' },
    implementationType: 'algorithm',
    implementationKey: 'searching/linear-search'
  },
  {
    id: 'portal-to-graph',
    name: '傳送門：圖論演算法',
    nameEn: 'Portal: Graph Algorithms',
    category: 'searching',
    difficulty: 1,
    isDeveloped: true,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['linear-search'] },
    graphPosition: { layer: 2, branch: 'main', horizontalIndex: 0 },
    pathMetadata: {
      pathType: 'portal',
      targetCategory: 'graph'
    },
    implementationType: 'algorithm',
    implementationKey: 'graph/bfs'
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
    prerequisites: { type: 'AND', levelIds: ['portal-to-graph'] },
    graphPosition: { layer: 0, branch: 'main', horizontalIndex: 0 },
    pathMetadata: { pathType: 'main' },
    implementationType: 'algorithm',
    implementationKey: 'graph/bfs'
  },
  {
    id: 'dfs',
    name: '深度優先搜尋',
    nameEn: 'DFS',
    category: 'graph',
    difficulty: 3,
    description: '使用堆疊或遞迴實作的圖遍歷演算法',
    learningObjectives: [
      '理解 DFS 的遍歷順序',
      '掌握遞迴實作技巧',
      '應用於路徑搜尋問題'
    ],
    isDeveloped: false,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['bfs'] },
    graphPosition: { layer: 1, branch: 'main', horizontalIndex: 0 },
    pathMetadata: { pathType: 'boss' },
    implementationType: 'algorithm',
    implementationKey: 'graph/dfs'
  },
  {
    id: 'portal-complete',
    name: '完成旅程',
    nameEn: 'Journey Complete',
    category: 'graph',
    difficulty: 1,
    isDeveloped: true,
    isUnlocked: false,
    prerequisites: { type: 'AND', levelIds: ['dfs'] },
    graphPosition: { layer: 2, branch: 'main', horizontalIndex: 0 },
    pathMetadata: {
      pathType: 'portal',
      targetCategory: 'data-structures' // 最後一個 Portal 可以循環回起點或設為 null
    },
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

/**
 * 取得所有 Category 配置（包含解鎖狀態）
 * @param userProgress - 使用者進度
 * @returns Category 陣列（按 order 排序）
 */
export function getCategories(userProgress: UserProgress): Category[] {
  const categories: Category[] = [];

  for (const [id, config] of Object.entries(CATEGORIES)) {
    const categoryId = id as AlgorithmCategory;

    categories.push({
      id: categoryId,
      name: config.name,
      nameEn: config.nameEn,
      description: config.description,
      icon: config.icon,
      colorTheme: config.colorTheme,
      isUnlocked: userProgress.categoryUnlocks?.[categoryId] ?? false,
      order: config.order,
    });
  }

  // 按 order 排序
  return categories.sort((a, b) => a.order - b.order);
}

/**
 * 取得指定 Category 的 Boss Level
 * @param categoryId - Category ID
 * @returns Boss Level 或 undefined
 */
export function getCategoryBossLevel(categoryId: AlgorithmCategory): Level | undefined {
  const levels = LEVELS_CONFIG.filter((l) => l.category === categoryId);
  const bossConfig = levels.find((l) => l.pathMetadata?.pathType === 'boss');
  return bossConfig ? levelConfigToLevel(bossConfig) : undefined;
}

/**
 * 取得 Category 的下一個 Category（用於 Boss Level 完成後解鎖）
 * @param currentCategoryId - 當前 Category ID
 * @returns 下一個 Category ID 或 null
 */
export function getNextCategory(currentCategoryId: AlgorithmCategory): AlgorithmCategory | null {
  const currentOrder = CATEGORIES[currentCategoryId]?.order;
  if (!currentOrder) return null;

  const nextCategory = Object.values(CATEGORIES).find(
    (cat) => cat.order === currentOrder + 1
  );

  return nextCategory?.id ?? null;
}

/**
 * 取得指定 Category 的 Portal Node
 * @param categoryId - Category ID
 * @returns Portal Node 或 undefined
 */
export function getCategoryPortalNode(categoryId: AlgorithmCategory): Level | undefined {
  const levels = LEVELS_CONFIG.filter((l) => l.category === categoryId);
  const portalConfig = levels.find((l) => l.pathMetadata?.pathType === 'portal');
  return portalConfig ? levelConfigToLevel(portalConfig) : undefined;
}

/**
 * 檢查關卡是否為 Portal Node
 * @param levelId - Level ID
 * @returns 是否為 Portal Node
 */
export function isPortalNode(levelId: string): boolean {
  const level = getLevelById(levelId);
  return level?.pathMetadata?.pathType === 'portal';
}

/**
 * 檢查關卡是否為 Boss Level
 * @param levelId - Level ID
 * @returns 是否為 Boss Level
 */
export function isBossLevel(levelId: string): boolean {
  const level = getLevelById(levelId);
  return level?.pathMetadata?.pathType === 'boss';
}

/**
 * 取得 Portal Node 的目標 Category
 * @param portalLevelId - Portal Node 的 Level ID
 * @returns 目標 Category ID 或 null
 */
export function getPortalTargetCategory(portalLevelId: string): AlgorithmCategory | null {
  const level = getLevelById(portalLevelId);
  if (!level || !isPortalNode(portalLevelId)) return null;
  return level.pathMetadata?.targetCategory ?? null;
}

/**
 * 檢查 Portal Node 是否已解鎖（Boss Level 是否完成）
 * @param portalLevelId - Portal Node 的 Level ID
 * @param userProgress - 使用者進度
 * @returns Portal 是否解鎖
 */
export function isPortalUnlocked(portalLevelId: string, userProgress: UserProgress): boolean {
  const portalLevel = getLevelById(portalLevelId);
  if (!portalLevel || !isPortalNode(portalLevelId)) return false;

  // 檢查前置關卡（Boss Level）是否完成
  const prerequisites = portalLevel.prerequisites?.levelIds || [];
  if (prerequisites.length === 0) return true;

  const bossLevelId = prerequisites[0]; // Portal 的前置條件應該只有一個 Boss Level
  const bossProgress = userProgress.levels?.[bossLevelId];
  return bossProgress?.status === 'completed';
}
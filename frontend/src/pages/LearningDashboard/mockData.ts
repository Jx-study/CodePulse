import type { Level, UserProgress } from '@/types';

// Mock 關卡資料
export const MOCK_LEVELS: Level[] = [
  {
    id: 'bubble-sort',
    levelNumber: 1,
    name: '氣泡排序',
    nameEn: 'Bubble Sort',
    category: 'sorting',
    difficulty: 'easy',
    estimatedTime: 15,
    description: '最基礎的排序演算法，透過不斷交換相鄰元素來排序',
    learningObjectives: [
      '理解排序演算法的基本概念',
      '掌握雙層迴圈的邏輯',
      '分析時間複雜度 O(n²)'
    ],
    isDeveloped: true,   // 已開發
    isUnlocked: true     // 預設解鎖
  },
  {
    id: 'selection-sort',
    levelNumber: 2,
    name: '選擇排序',
    nameEn: 'Selection Sort',
    category: 'sorting',
    difficulty: 'easy',
    estimatedTime: 15,
    description: '每次從未排序部分選擇最小值放到已排序部分末尾',
    learningObjectives: [
      '理解選擇排序的核心邏輯',
      '比較氣泡排序與選擇排序的差異',
      '分析時間複雜度 O(n²)'
    ],
    isDeveloped: false,  // 未開發
    isUnlocked: false
  },
  {
    id: 'insertion-sort',
    levelNumber: 3,
    name: '插入排序',
    nameEn: 'Insertion Sort',
    category: 'sorting',
    difficulty: 'easy',
    estimatedTime: 15,
    description: '將元素插入到已排序部分的正確位置',
    learningObjectives: [
      '理解插入排序的實作方式',
      '掌握適用場景（小規模資料）',
      '分析最佳與最壞情況'
    ],
    isDeveloped: false,  // 未開發
    isUnlocked: false
  },
  {
    id: 'merge-sort',
    levelNumber: 4,
    name: '合併排序',
    nameEn: 'Merge Sort',
    category: 'sorting',
    difficulty: 'medium',
    estimatedTime: 25,
    description: '使用分治法的穩定排序演算法',
    learningObjectives: [
      '理解分治法的核心思想',
      '掌握遞迴實作技巧',
      '分析時間複雜度 O(n log n)'
    ],
    isDeveloped: true,   // ✅ 已開發（有 mergeSortConfig）
    isUnlocked: false
  },
  {
    id: 'quick-sort',
    levelNumber: 5,
    name: '快速排序',
    nameEn: 'Quick Sort',
    category: 'sorting',
    difficulty: 'medium',
    estimatedTime: 30,
    description: '使用分治法的高效排序演算法',
    learningObjectives: [
      '理解快速排序的分區邏輯',
      '掌握 pivot 選擇策略',
      '分析平均時間複雜度 O(n log n)'
    ],
    isDeveloped: true,   // 已開發
    isUnlocked: false
  },
  {
    id: 'binary-search',
    levelNumber: 6,
    name: '二分搜尋',
    nameEn: 'Binary Search',
    category: 'searching',
    difficulty: 'easy',
    estimatedTime: 15,
    description: '在已排序陣列中快速找到目標值',
    learningObjectives: [
      '理解二分搜尋的原理',
      '掌握邊界條件處理',
      '分析時間複雜度 O(log n)'
    ],
    isDeveloped: true,   // ✅ 已開發（有 binarySearchConfig）
    isUnlocked: false
  },
  {
    id: 'linear-search',
    levelNumber: 7,
    name: '線性搜尋',
    nameEn: 'Linear Search',
    category: 'searching',
    difficulty: 'easy',
    estimatedTime: 10,
    description: '依序檢查每個元素直到找到目標值',
    learningObjectives: [
      '理解線性搜尋的基本概念',
      '比較與二分搜尋的差異',
      '分析時間複雜度 O(n)'
    ],
    isDeveloped: false,  // 未開發
    isUnlocked: false
  },
  {
    id: 'bfs',
    levelNumber: 8,
    name: '廣度優先搜尋',
    nameEn: 'BFS',
    category: 'graph',
    difficulty: 'medium',
    estimatedTime: 30,
    description: '使用佇列實作的圖遍歷演算法',
    learningObjectives: [
      '理解 BFS 的遍歷順序',
      '掌握佇列的使用方式',
      '應用於最短路徑問題'
    ],
    isDeveloped: false,  // 未開發
    isUnlocked: false
  }
];

// 初始使用者進度
const INITIAL_USER_PROGRESS: UserProgress = {
  userId: 'guest',
  levels: {
    'bubble-sort': {
      levelId: 'bubble-sort',
      status: 'unlocked',
      stars: 0,
      attempts: 0,
      bestTime: 0
    },
    'selection-sort': {
      levelId: 'selection-sort',
      status: 'locked',
      stars: 0,
      attempts: 0,
      bestTime: 0
    },
    'insertion-sort': {
      levelId: 'insertion-sort',
      status: 'locked',
      stars: 0,
      attempts: 0,
      bestTime: 0
    },
    'merge-sort': {
      levelId: 'merge-sort',
      status: 'locked',
      stars: 0,
      attempts: 0,
      bestTime: 0
    },
    'quick-sort': {
      levelId: 'quick-sort',
      status: 'locked',
      stars: 0,
      attempts: 0,
      bestTime: 0
    },
    'binary-search': {
      levelId: 'binary-search',
      status: 'locked',
      stars: 0,
      attempts: 0,
      bestTime: 0
    },
    'linear-search': {
      levelId: 'linear-search',
      status: 'locked',
      stars: 0,
      attempts: 0,
      bestTime: 0
    },
    'bfs': {
      levelId: 'bfs',
      status: 'locked',
      stars: 0,
      attempts: 0,
      bestTime: 0
    }
  },
  totalStarsEarned: 0,
  totalLevelsCompleted: 0,
  lastAccessedDate: new Date().toISOString()
};

// LocalStorage 相關函數
const STORAGE_KEY = 'codepulse_user_progress';

export const loadUserProgress = (): UserProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load user progress:', error);
  }
  return INITIAL_USER_PROGRESS;
};

export const saveUserProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save user progress:', error);
  }
};

export const resetUserProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset user progress:', error);
  }
};

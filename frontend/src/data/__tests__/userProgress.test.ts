import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { UserProgress } from '@/types';
import { updateCategoryUnlocks } from '../userProgress';

// Mock levelDefinitions
vi.mock('../levels/levelDefinitions', () => ({
  getCategoryBossLevel: vi.fn((categoryId) => {
    const bosses: Record<string, any> = {
      'data-structures': {
        id: 'doubly-linked-list',
        name: 'Doubly Linked List',
        category: 'data-structures',
        pathMetadata: { pathType: 'boss' },
      },
      'sorting': {
        id: 'heap-sort',
        name: 'Heap Sort',
        category: 'sorting',
        pathMetadata: { pathType: 'boss' },
      },
      'searching': {
        id: 'advanced-search',
        name: 'Advanced Search',
        category: 'searching',
        pathMetadata: { pathType: 'boss' },
      },
      'graph': {
        id: 'a-star',
        name: 'A* Algorithm',
        category: 'graph',
        pathMetadata: { pathType: 'boss' },
      },
    };
    return bosses[categoryId];
  }),
  getNextCategory: vi.fn((categoryId) => {
    const next: Record<string, string | null> = {
      'data-structures': 'sorting',
      'sorting': 'searching',
      'searching': 'graph',
      'graph': null,
    };
    return next[categoryId];
  }),
}));

describe('updateCategoryUnlocks', () => {
  let baseProgress: UserProgress;

  beforeEach(() => {
    baseProgress = {
      userId: 'test-user',
      levels: {},
      totalStarsEarned: 0,
      totalLevelsCompleted: 0,
      lastAccessedDate: new Date().toISOString(),
      categoryUnlocks: {
        'data-structures': true,
        'sorting': false,
        'searching': false,
        'graph': false,
      },
      activeCategory: 'data-structures',
    };
  });

  it('should unlock sorting when data-structures boss is completed', () => {
    const progress: UserProgress = {
      ...baseProgress,
      levels: {
        'doubly-linked-list': {
          levelId: 'doubly-linked-list',
          status: 'completed',
          stars: 3,
          attempts: 2,
          bestTime: 180,
        },
      },
    };

    const updated = updateCategoryUnlocks(progress);

    expect(updated.categoryUnlocks['sorting']).toBe(true);
    expect(updated.categoryUnlocks['searching']).toBe(false);
    expect(updated.categoryUnlocks['graph']).toBe(false);
  });

  it('should unlock multiple categories if multiple bosses are completed', () => {
    const progress: UserProgress = {
      ...baseProgress,
      levels: {
        'doubly-linked-list': {
          levelId: 'doubly-linked-list',
          status: 'completed',
          stars: 3,
          attempts: 2,
          bestTime: 180,
        },
        'heap-sort': {
          levelId: 'heap-sort',
          status: 'completed',
          stars: 2,
          attempts: 3,
          bestTime: 200,
        },
      },
    };

    const updated = updateCategoryUnlocks(progress);

    expect(updated.categoryUnlocks['sorting']).toBe(true);
    expect(updated.categoryUnlocks['searching']).toBe(true);
    expect(updated.categoryUnlocks['graph']).toBe(false);
  });

  it('should not unlock if boss is not completed', () => {
    const progress: UserProgress = {
      ...baseProgress,
      levels: {
        'doubly-linked-list': {
          levelId: 'doubly-linked-list',
          status: 'in-progress',
          stars: 3,
          attempts: 1,
          bestTime: 0,
        },
      },
    };

    const updated = updateCategoryUnlocks(progress);

    // 應該返回原始 progress（沒有變更）
    expect(updated).toBe(progress);
    expect(updated.categoryUnlocks['sorting']).toBe(false);
  });

  it('should not unlock already unlocked categories', () => {
    const progress: UserProgress = {
      ...baseProgress,
      categoryUnlocks: {
        'data-structures': true,
        'sorting': true, // 已經解鎖
        'searching': false,
        'graph': false,
      },
      levels: {
        'doubly-linked-list': {
          levelId: 'doubly-linked-list',
          status: 'completed',
          stars: 3,
          attempts: 2,
          bestTime: 180,
        },
      },
    };

    const updated = updateCategoryUnlocks(progress);

    // 因為 sorting 已經解鎖，應該沒有變更
    expect(updated).toBe(progress);
  });

  it('should return same reference if no changes', () => {
    const progress: UserProgress = {
      ...baseProgress,
      levels: {},
    };

    const updated = updateCategoryUnlocks(progress);

    // 應該返回相同引用
    expect(updated).toBe(progress);
  });

  it('should not unlock graph if searching boss is not completed', () => {
    const progress: UserProgress = {
      ...baseProgress,
      categoryUnlocks: {
        'data-structures': true,
        'sorting': true,
        'searching': true,
        'graph': false,
      },
      levels: {
        'advanced-search': {
          levelId: 'advanced-search',
          status: 'in-progress',
          stars: 1,
          attempts: 5,
          bestTime: 250,
        },
      },
    };

    const updated = updateCategoryUnlocks(progress);

    expect(updated.categoryUnlocks['graph']).toBe(false);
  });

  it('should unlock graph when searching boss is completed', () => {
    const progress: UserProgress = {
      ...baseProgress,
      categoryUnlocks: {
        'data-structures': true,
        'sorting': true,
        'searching': true,
        'graph': false,
      },
      levels: {
        'advanced-search': {
          levelId: 'advanced-search',
          status: 'completed',
          stars: 3,
          attempts: 3,
          bestTime: 200,
        },
      },
    };

    const updated = updateCategoryUnlocks(progress);

    expect(updated.categoryUnlocks['graph']).toBe(true);
  });

  it('should handle boss level with status "locked"', () => {
    const progress: UserProgress = {
      ...baseProgress,
      levels: {
        'doubly-linked-list': {
          levelId: 'doubly-linked-list',
          status: 'locked',
          stars: 3,
          attempts: 0,
          bestTime: 0,
        },
      },
    };

    const updated = updateCategoryUnlocks(progress);

    expect(updated).toBe(progress);
    expect(updated.categoryUnlocks['sorting']).toBe(false);
  });

  it('should handle boss level with status "unlocked"', () => {
    const progress: UserProgress = {
      ...baseProgress,
      levels: {
        "doubly-linked-list": {
          levelId: "doubly-linked-list",
          status: "unlocked",
          stars: 4,
          attempts: 0,
          bestTime: 0,
        },
      },
    };

    const updated = updateCategoryUnlocks(progress);

    expect(updated).toBe(progress);
    expect(updated.categoryUnlocks['sorting']).toBe(false);
  });

  it('should preserve other progress data when unlocking', () => {
    const progress: UserProgress = {
      ...baseProgress,
      totalStarsEarned: 10,
      totalLevelsCompleted: 5,
      levels: {
        'doubly-linked-list': {
          levelId: 'doubly-linked-list',
          status: 'completed',
          stars: 3,
          attempts: 2,
          bestTime: 180,
        },
        'stack': {
          levelId: 'stack',
          status: 'completed',
          stars: 2,
          attempts: 1,
          bestTime: 120,
        },
      },
    };

    const updated = updateCategoryUnlocks(progress);

    expect(updated.totalStarsEarned).toBe(10);
    expect(updated.totalLevelsCompleted).toBe(5);
    expect(updated.levels['stack']).toEqual(progress.levels['stack']);
  });

  it('should handle rapid completion of multiple bosses', () => {
    // 模擬使用者快速完成多個 Boss Level
    const progress: UserProgress = {
      ...baseProgress,
      levels: {
        'doubly-linked-list': {
          levelId: 'doubly-linked-list',
          status: 'completed',
          stars: 3,
          attempts: 2,
          bestTime: 180,
        },
        'heap-sort': {
          levelId: 'heap-sort',
          status: 'completed',
          stars: 3,
          attempts: 1,
          bestTime: 150,
        },
        'advanced-search': {
          levelId: 'advanced-search',
          status: 'completed',
          stars: 3,
          attempts: 2,
          bestTime: 200,
        },
      },
    };

    const updated = updateCategoryUnlocks(progress);

    expect(updated.categoryUnlocks['sorting']).toBe(true);
    expect(updated.categoryUnlocks['searching']).toBe(true);
    expect(updated.categoryUnlocks['graph']).toBe(true);
  });
});
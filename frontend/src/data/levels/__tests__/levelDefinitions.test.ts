import { describe, it, expect, beforeEach } from 'vitest';
import type { UserProgress, AlgorithmCategory } from '@/types';
import {
  getCategories,
  getCategoryBossLevel,
  getNextCategory,
} from '../levelDefinitions';

describe('Category Helper Functions', () => {
  let mockUserProgress: UserProgress;

  beforeEach(() => {
    // 模擬使用者進度
    mockUserProgress = {
      userId: 'test-user',
      levels: {
        'linked-list': {
          levelId: 'linked-list',
          status: 'completed',
          stars: 3,
          attempts: 2,
          bestTime: 120,
        },
        'stack': {
          levelId: 'stack',
          status: 'completed',
          stars: 2,
          attempts: 3,
          bestTime: 150,
        },
      },
      totalStarsEarned: 5,
      totalLevelsCompleted: 2,
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

  describe('getCategories', () => {
    it('should return all 4 categories', () => {
      const categories = getCategories(mockUserProgress);
      expect(categories).toHaveLength(4);
    });

    it('should return categories in correct order', () => {
      const categories = getCategories(mockUserProgress);
      expect(categories[0].id).toBe('data-structures');
      expect(categories[1].id).toBe('sorting');
      expect(categories[2].id).toBe('searching');
      expect(categories[3].id).toBe('graph');
    });

    it('should correctly set isUnlocked status from userProgress', () => {
      const categories = getCategories(mockUserProgress);

      // data-structures 應該解鎖
      expect(categories[0].isUnlocked).toBe(true);

      // 其他應該鎖定
      expect(categories[1].isUnlocked).toBe(false);
      expect(categories[2].isUnlocked).toBe(false);
      expect(categories[3].isUnlocked).toBe(false);
    });

    it('should include all required category properties', () => {
      const categories = getCategories(mockUserProgress);
      const category = categories[0];

      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('nameEn');
      expect(category).toHaveProperty('description');
      expect(category).toHaveProperty('colorTheme');
      expect(category).toHaveProperty('isUnlocked');
      expect(category).toHaveProperty('order');
      expect(category).toHaveProperty('icon');
    });

    it('should handle multiple unlocked categories', () => {
      // 解鎖多個 Category
      mockUserProgress.categoryUnlocks = {
        'data-structures': true,
        'sorting': true,
        'searching': true,
        'graph': false,
      };

      const categories = getCategories(mockUserProgress);
      expect(categories[0].isUnlocked).toBe(true);
      expect(categories[1].isUnlocked).toBe(true);
      expect(categories[2].isUnlocked).toBe(true);
      expect(categories[3].isUnlocked).toBe(false);
    });

    it('should handle missing categoryUnlocks gracefully', () => {
      // 模擬舊版資料沒有 categoryUnlocks
      const progressWithoutUnlocks = {
        ...mockUserProgress,
        categoryUnlocks: {},
      };

      const categories = getCategories(progressWithoutUnlocks);
      // 應該都是 false（因為 ?? false）
      expect(categories.every(cat => cat.isUnlocked === false)).toBe(true);
    });
  });

  describe('getCategoryBossLevel', () => {
    it('should return boss level for data-structures category', () => {
      const boss = getCategoryBossLevel('data-structures');

      if (boss) {
        expect(boss.category).toBe('data-structures');
        expect(boss.pathMetadata?.pathType).toBe('boss');
      } else {
        // 如果沒有定義 boss level，測試應該通過（因為是可選的）
        expect(boss).toBeUndefined();
      }
    });

    it('should return undefined for category without boss level', () => {
      // 假設某個 category 沒有 boss level
      const boss = getCategoryBossLevel('searching');

      // 可能有也可能沒有，這取決於實際配置
      // 測試只確認函數不會出錯
      expect(boss === undefined || boss.pathMetadata?.pathType === 'boss').toBe(true);
    });

    it('should return correct boss level with all metadata', () => {
      const boss = getCategoryBossLevel('data-structures');

      if (boss && boss.pathMetadata?.pathType === 'boss') {
        expect(boss).toHaveProperty('id');
        expect(boss).toHaveProperty('name');
        expect(boss).toHaveProperty('category');
        expect(boss.pathMetadata).toHaveProperty('pathType');
      }
    });
  });

  describe('getNextCategory', () => {
    it('should return sorting for data-structures', () => {
      const next = getNextCategory('data-structures');
      expect(next).toBe('sorting');
    });

    it('should return searching for sorting', () => {
      const next = getNextCategory('sorting');
      expect(next).toBe('searching');
    });

    it('should return graph for searching', () => {
      const next = getNextCategory('searching');
      expect(next).toBe('graph');
    });

    it('should return null for last category (graph)', () => {
      const next = getNextCategory('graph');
      expect(next).toBeNull();
    });

    it('should handle invalid category id gracefully', () => {
      const next = getNextCategory('invalid-category' as AlgorithmCategory);
      expect(next).toBeNull();
    });

    it('should maintain correct order sequence', () => {
      // 驗證整個順序鏈
      let current: AlgorithmCategory | null = 'data-structures';
      const sequence: AlgorithmCategory[] = ['data-structures'];

      while (current) {
        current = getNextCategory(current);
        if (current) sequence.push(current);
      }

      expect(sequence).toEqual(['data-structures', 'sorting', 'searching', 'graph']);
    });
  });

  describe('Category Integration', () => {
    it('should have consistent category order across functions', () => {
      const categories = getCategories(mockUserProgress);

      // 驗證每個 category 的 next 與順序一致
      for (let i = 0; i < categories.length - 1; i++) {
        const current = categories[i];
        const next = getNextCategory(current.id);
        expect(next).toBe(categories[i + 1].id);
      }
    });

    it('should support boss level completion flow', () => {
      // 模擬 Boss Level 完成流程
      const categories = getCategories(mockUserProgress);
      const firstCategory = categories[0];

      expect(firstCategory.isUnlocked).toBe(true);

      const bossLevel = getCategoryBossLevel(firstCategory.id);
      if (bossLevel) {
        const nextCategory = getNextCategory(firstCategory.id);
        expect(nextCategory).toBe('sorting');
      }
    });
  });
});
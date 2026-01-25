/**
 * Level 配置驗證工具
 *
 * 職責：
 * 1. 在開發環境中驗證 levels.json 的資料完整性
 * 2. 檢查關卡依賴關係的正確性
 * 3. 提供友善的錯誤訊息
 */

import levelsData from './levels.json';
import type { AlgorithmCategory } from '@/types';

interface ValidationError {
  type: string;
  message: string;
  levelId?: string;
  categoryId?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * 驗證 levels.json 的資料完整性
 */
export function validateLevelsData(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // 1. 驗證基本結構
  if (!levelsData.levels || !Array.isArray(levelsData.levels)) {
    errors.push({
      type: 'STRUCTURE',
      message: 'levels.json 缺少 levels 陣列'
    });
    return { isValid: false, errors, warnings };
  }

  if (!levelsData.categories || typeof levelsData.categories !== 'object') {
    errors.push({
      type: 'STRUCTURE',
      message: 'levels.json 缺少 categories 物件'
    });
    return { isValid: false, errors, warnings };
  }

  // 2. 驗證所有關卡
  const levelIds = new Set<string>();
  const categories = new Set<AlgorithmCategory>();

  for (const level of levelsData.levels as any[]) {
    // 檢查必要欄位
    if (!level.id) {
      errors.push({
        type: 'REQUIRED_FIELD',
        message: '關卡缺少 id 欄位'
      });
      continue;
    }

    // 檢查重複 ID
    if (levelIds.has(level.id)) {
      errors.push({
        type: 'DUPLICATE_ID',
        message: `關卡 ID 重複：${level.id}`,
        levelId: level.id
      });
    }
    levelIds.add(level.id);

    // 檢查必要欄位
    const requiredFields = [
      'name', 'nameEn', 'category', 'difficulty', 'isDeveloped',
      'isUnlocked', 'prerequisites', 'graphPosition', 'pathMetadata',
      'implementationType', 'implementationKey'
    ];

    for (const field of requiredFields) {
      if (level[field] === undefined) {
        errors.push({
          type: 'REQUIRED_FIELD',
          message: `關卡 ${level.id} 缺少必要欄位：${field}`,
          levelId: level.id
        });
      }
    }

    // 檢查 category 是否有效
    if (level.category) {
      const categoryRecord = levelsData.categories as Record<string, unknown>;
      if (!categoryRecord[level.category]) {
        errors.push({
          type: 'INVALID_CATEGORY',
          message: `關卡 ${level.id} 的 category "${level.category}" 不存在`,
          levelId: level.id,
          categoryId: level.category
        });
      } else {
        categories.add(level.category);
      }
    }

    // 檢查 difficulty 範圍
    if (level.difficulty && (level.difficulty < 1 || level.difficulty > 5)) {
      errors.push({
        type: 'INVALID_DIFFICULTY',
        message: `關卡 ${level.id} 的 difficulty 必須在 1-5 之間`,
        levelId: level.id
      });
    }

    // 檢查 prerequisites
    if (level.prerequisites) {
      if (!['AND', 'OR', 'NONE'].includes(level.prerequisites.type)) {
        errors.push({
          type: 'INVALID_PREREQUISITE_TYPE',
          message: `關卡 ${level.id} 的 prerequisites.type 必須是 AND, OR 或 NONE`,
          levelId: level.id
        });
      }

      if (level.prerequisites.levelIds && Array.isArray(level.prerequisites.levelIds)) {
        for (const prereqId of level.prerequisites.levelIds) {
          if (!levelIds.has(prereqId)) {
            warnings.push({
              type: 'MISSING_PREREQUISITE',
              message: `關卡 ${level.id} 的前置關卡 "${prereqId}" 尚未定義（可能在後面定義）`,
              levelId: level.id
            });
          }
        }
      }
    }

    // 檢查 graphPosition
    if (level.graphPosition) {
      if (typeof level.graphPosition.layer !== 'number') {
        errors.push({
          type: 'INVALID_GRAPH_POSITION',
          message: `關卡 ${level.id} 的 graphPosition.layer 必須是數字`,
          levelId: level.id
        });
      }

      if (!level.graphPosition.branch) {
        errors.push({
          type: 'INVALID_GRAPH_POSITION',
          message: `關卡 ${level.id} 缺少 graphPosition.branch`,
          levelId: level.id
        });
      }

      if (typeof level.graphPosition.horizontalIndex !== 'number') {
        errors.push({
          type: 'INVALID_GRAPH_POSITION',
          message: `關卡 ${level.id} 的 graphPosition.horizontalIndex 必須是數字`,
          levelId: level.id
        });
      }
    }

    // 檢查 pathMetadata
    if (level.pathMetadata) {
      const validPathTypes = ['main', 'branch', 'convergence', 'choice-point', 'boss', 'portal'];
      if (!validPathTypes.includes(level.pathMetadata.pathType)) {
        errors.push({
          type: 'INVALID_PATH_TYPE',
          message: `關卡 ${level.id} 的 pathMetadata.pathType 必須是以下之一：${validPathTypes.join(', ')}`,
          levelId: level.id
        });
      }

      // Portal Node 必須有 targetCategory
      if (level.pathMetadata.pathType === 'portal' && !level.pathMetadata.targetCategory) {
        errors.push({
          type: 'MISSING_TARGET_CATEGORY',
          message: `Portal 關卡 ${level.id} 缺少 pathMetadata.targetCategory`,
          levelId: level.id
        });
      }
    }

    // 檢查 implementationType
    if (level.implementationType && !['algorithm', 'dataStructure'].includes(level.implementationType)) {
      errors.push({
        type: 'INVALID_IMPLEMENTATION_TYPE',
        message: `關卡 ${level.id} 的 implementationType 必須是 'algorithm' 或 'dataStructure'`,
        levelId: level.id
      });
    }

    // 如果需要在首頁顯示，檢查 homePageMetadata
    if (level.homePageMetadata?.showOnHomePage) {
      if (!level.homePageMetadata.displayOrder) {
        errors.push({
          type: 'MISSING_DISPLAY_ORDER',
          message: `關卡 ${level.id} 要在首頁顯示但缺少 homePageMetadata.displayOrder`,
          levelId: level.id
        });
      }

      if (!level.homePageMetadata.image) {
        errors.push({
          type: 'MISSING_IMAGE',
          message: `關卡 ${level.id} 要在首頁顯示但缺少 homePageMetadata.image`,
          levelId: level.id
        });
      }

      if (!level.homePageMetadata.translationKey) {
        errors.push({
          type: 'MISSING_TRANSLATION_KEY',
          message: `關卡 ${level.id} 要在首頁顯示但缺少 homePageMetadata.translationKey`,
          levelId: level.id
        });
      }
    }
  }

  // 3. 驗證 Categories
  const categoryConfigs = Object.entries(levelsData.categories);
  const categoryOrders = new Set<number>();

  for (const [id, config] of categoryConfigs) {
    const cat = config as any;

    // 檢查必要欄位
    const requiredFields = ['id', 'name', 'nameEn', 'description', 'colorTheme', 'order'];
    for (const field of requiredFields) {
      if (cat[field] === undefined) {
        errors.push({
          type: 'REQUIRED_FIELD',
          message: `Category ${id} 缺少必要欄位：${field}`,
          categoryId: id
        });
      }
    }

    // 檢查 order 是否重複
    if (cat.order && categoryOrders.has(cat.order)) {
      errors.push({
        type: 'DUPLICATE_ORDER',
        message: `Category ${id} 的 order ${cat.order} 重複`,
        categoryId: id
      });
    }
    categoryOrders.add(cat.order);

    // 檢查是否有關卡使用這個 category
    if (!categories.has(id as AlgorithmCategory)) {
      warnings.push({
        type: 'UNUSED_CATEGORY',
        message: `Category ${id} 沒有任何關卡使用`,
        categoryId: id
      });
    }
  }

  // 4. 檢查循環依賴
  const graph = new Map<string, string[]>();
  for (const level of levelsData.levels as any[]) {
    if (level.prerequisites?.levelIds) {
      graph.set(level.id, level.prerequisites.levelIds);
    }
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(levelId: string): boolean {
    if (!graph.has(levelId)) return false;
    if (recursionStack.has(levelId)) return true;
    if (visited.has(levelId)) return false;

    visited.add(levelId);
    recursionStack.add(levelId);

    const prerequisites = graph.get(levelId) || [];
    for (const prereqId of prerequisites) {
      if (hasCycle(prereqId)) {
        return true;
      }
    }

    recursionStack.delete(levelId);
    return false;
  }

  for (const levelId of levelIds) {
    if (hasCycle(levelId)) {
      errors.push({
        type: 'CIRCULAR_DEPENDENCY',
        message: `檢測到循環依賴，涉及關卡：${levelId}`,
        levelId
      });
      break; // 找到一個循環依賴就停止，避免重複錯誤
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 在開發環境中自動驗證（僅在開發環境執行）
 */
export function autoValidateInDev(): void {
  if (import.meta.env.DEV) {
    const result = validateLevelsData();

    if (result.errors.length > 0) {
      console.error('❌ levels.json 驗證失敗：');
      result.errors.forEach(error => {
        console.error(`  [${error.type}] ${error.message}`);
      });
    } else {
      console.log('✅ levels.json 驗證通過');
    }

    if (result.warnings.length > 0) {
      console.warn('⚠️  levels.json 警告：');
      result.warnings.forEach(warning => {
        console.warn(`  [${warning.type}] ${warning.message}`);
      });
    }
  }
}

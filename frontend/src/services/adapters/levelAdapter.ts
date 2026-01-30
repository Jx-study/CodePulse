/**
 * Level Adapter - 資料轉換層
 *
 * 職責（僅限資料轉換）：
 * 1. 從 JSON 原始資料轉換為 TypeScript 類型
 * 2. 計算首頁顯示順序
 * 3. 不包含任何業務邏輯或查詢功能
 */

import type {
  LevelConfig,
  Level,
  PrerequisiteConfig,
  GraphPosition,
  PathMetadata,
  Category,
  DifficultyLevel,
  CategoryType,
} from "@/types";
import levelsData from "@/data/levels/levels.json";

// ==================== JSON 原始資料結構 ====================

interface HomePageMetadata {
  image: string;
  translationKey: string;
  showOnHomePage: boolean;
}

interface RawLevelData {
  id: string;
  name: string;
  nameEn: string;
  category: CategoryType;
  difficulty: DifficultyLevel;
  description: string;
  learningObjectives: string[];
  isDeveloped: boolean;
  isUnlocked: boolean;
  prerequisites: PrerequisiteConfig;
  graphPosition: GraphPosition;
  pathMetadata: PathMetadata;
  implementationKey: string;
  homePageMetadata?: HomePageMetadata;
}

interface RawCategoryData {
  id: CategoryType;
  name: string;
  nameEn: string;
  description: string;
  icon?: string;
  colorTheme: string;
  order: number;
  layerOffset: number;
}

// ==================== 資料轉換函式 ====================

/**
 * 從 JSON 原始資料轉換為 LevelConfig
 */
export function rawToLevelConfig(raw: RawLevelData): LevelConfig {
  return {
    id: raw.id,
    name: raw.name,
    nameEn: raw.nameEn,
    category: raw.category,
    difficulty: raw.difficulty,
    description: raw.description,
    learningObjectives: raw.learningObjectives,
    isDeveloped: raw.isDeveloped,
    isUnlocked: raw.isUnlocked,
    prerequisites: raw.prerequisites,
    graphPosition: raw.graphPosition,
    pathMetadata: raw.pathMetadata,
    implementationKey: raw.implementationKey,
  };
}

/**
 * 從 LevelConfig 轉換為 Level（移除 implementationKey）
 */
export function levelConfigToLevel(config: LevelConfig): Level {
  const { implementationKey, ...level } = config;
  return level;
}

/**
 * 計算首頁顯示順序的權重
 * 公式：category.order * 1000 + graphPosition.layer * 10 + horizontalIndex
 */
export function calculateDisplayOrder(
  level: RawLevelData,
  categories: Record<string, RawCategoryData>,
): number {
  const category = categories[level.category];
  if (!category) return 999999;
  const horizontalIndex = level.graphPosition.horizontalIndex || 0;
  return category.order * 1000 + level.graphPosition.layer * 10 + horizontalIndex;
}

/**
 * 取得所有原始關卡資料
 * @internal 僅供 Service 層使用
 */
export function getRawLevels(): RawLevelData[] {
  return levelsData.levels as RawLevelData[];
}

/**
 * 取得所有原始分類資料
 * @internal 僅供 Service 層使用
 */
export function getRawCategories(): Record<string, RawCategoryData> {
  return levelsData.categories as Record<string, RawCategoryData>;
}

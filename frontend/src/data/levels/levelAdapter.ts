/**
 * Level Adapter - 適配層
 *
 * 職責：
 * 1. 從 levels.json 讀取靜態配置
 * 2. 為不同頁面提供適配的資料格式
 * 3. 與邏輯註冊表（algorithmsMap, dataStructuresMap）解耦
 */

import levelsData from './levels.json';
import { autoValidateInDev } from './levelValidator';

// 在開發環境中自動驗證資料完整性
autoValidateInDev();
import type {
  LevelConfig,
  Level,
  PrerequisiteConfig,
  GraphPosition,
  PathMetadata,
  Category,
  DifficultyLevel
} from '@/types';
import type { UserProgress, AlgorithmCategory } from "@/types";

// ==================== Home 頁面專用類型 ====================

/**
 * Home 頁面展示用的輕量級資料
 */
export interface HomePageAlgorithmMetadata {
  id: number;           // 展示順序 ID
  levelId: string;      // 關卡真實 ID
  name: string;         // 中文名稱
  nameEn: string;       // 英文名稱
  category: AlgorithmCategory;
  difficulty: number;
  description: string;
  image: string;        // 圖片檔名
  translationKey: string;
  isDeveloped: boolean;
}

// ==================== JSON 原始資料結構 ====================

interface HomePageMetadata {
  displayOrder: number;
  image: string;
  translationKey: string;
  showOnHomePage: boolean;
}

interface RawLevelData {
  id: string;
  name: string;
  nameEn: string;
  category: AlgorithmCategory;
  difficulty: DifficultyLevel;
  description: string;
  learningObjectives: string[];
  isDeveloped: boolean;
  isUnlocked: boolean;
  prerequisites: PrerequisiteConfig;
  graphPosition: GraphPosition;
  pathMetadata: PathMetadata;
  implementationType: "algorithm" | "dataStructure";
  implementationKey: string;
  homePageMetadata?: HomePageMetadata;
}

interface RawCategoryData {
  id: AlgorithmCategory;
  name: string;
  nameEn: string;
  description: string;
  icon?: string;
  colorTheme: string;
  order: number;
}

// ==================== private工具函式 ====================

/**
 * 從 JSON 轉換為 LevelConfig
 */
function rawToLevelConfig(raw: RawLevelData): LevelConfig {
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
    implementationType: raw.implementationType,
    implementationKey: raw.implementationKey,
  };
}

/**
 * 從 LevelConfig 轉換為 Level（移除實作細節）
 */
function levelConfigToLevel(config: LevelConfig): Level {
  const { implementationType, implementationKey, ...level } = config;
  return level;
}

// ==================== 公共 API - Dashboard 使用 ====================

/**
 * 取得所有關卡配置（完整資料，供 Dashboard 使用）
 */
export function getAllLevelConfigs(): LevelConfig[] {
  return (levelsData.levels as RawLevelData[]).map(rawToLevelConfig);
}

/**
 * 取得所有關卡（Level 格式，向後兼容）
 */
export function getAllLevels(): Level[] {
  return getAllLevelConfigs().map(levelConfigToLevel);
}

/**
 * 根據 ID 取得關卡配置
 */
export function getLevelConfigById(levelId: string): LevelConfig | null {
  const raw = (levelsData.levels as RawLevelData[]).find(l => l.id === levelId);
  return raw ? rawToLevelConfig(raw) : null;
}

/**
 * 根據 ID 取得關卡（不含實作細節）
 */
export function getLevelById(levelId: string): Level | null {
  const config = getLevelConfigById(levelId);
  return config ? levelConfigToLevel(config) : null;
}

/**
 * 根據分類取得關卡列表
 */
export function getLevelsByCategory(category: AlgorithmCategory | 'all'): Level[] {
  if (category === 'all') return getAllLevels();
  return (levelsData.levels as RawLevelData[])
    .filter(l => l.category === category)
    .map(raw => levelConfigToLevel(rawToLevelConfig(raw)));
}

/**
 * 取得所有已開發的關卡
 */
export function getDevelopedLevels(): Level[] {
  return (levelsData.levels as RawLevelData[])
    .filter(l => l.isDeveloped)
    .map(raw => levelConfigToLevel(rawToLevelConfig(raw)));
}

/**
 * 取得 Level ID 對應的實作 Key
 * 用於在邏輯註冊表中查找對應的演算法/資料結構實作
 */
export function getImplementationKey(levelId: string): string | null {
  const raw = (levelsData.levels as RawLevelData[]).find(l => l.id === levelId);
  return raw?.implementationKey ?? null;
}

/**
 * 取得 Level ID 對應的實作類型
 */
export function getImplementationType(levelId: string): 'algorithm' | 'dataStructure' | null {
  const raw = (levelsData.levels as RawLevelData[]).find(l => l.id === levelId);
  return raw?.implementationType ?? null;
}

// ==================== 公共 API - Category 相關 ====================

/**
 * 取得所有分類配置
 */
export function getAllCategories(): RawCategoryData[] {
  const cats = levelsData.categories as Record<AlgorithmCategory, RawCategoryData>;
  return Object.values(cats);
}

/**
 * 取得分類配置（包含解鎖狀態）
 */
export function getCategories(userProgress: UserProgress): Category[] {
  const cats = levelsData.categories as Record<AlgorithmCategory, RawCategoryData>;

  return Object.values(cats).map(cat => {
    const categoryId = cat.id as AlgorithmCategory;
    return {
      id: cat.id,
      name: cat.name,
      nameEn: cat.nameEn,
      description: cat.description,
      icon: cat.icon,
      colorTheme: cat.colorTheme,
      isUnlocked: userProgress.categoryUnlocks?.[categoryId] ?? false,
      order: cat.order,
    };
  }).sort((a, b) => a.order - b.order);
}

/**
 * 取得分類名稱
 */
export function getCategoryName(categoryId: AlgorithmCategory): string {
  const cats = levelsData.categories as Record<AlgorithmCategory, RawCategoryData>;
  return cats[categoryId]?.name || categoryId;
}

/**
 * 取得 Category 的下一個 Category
 */
export function getNextCategory(currentCategoryId: AlgorithmCategory): AlgorithmCategory | null {
  const cats = levelsData.categories as Record<AlgorithmCategory, RawCategoryData>;
  const currentOrder = cats[currentCategoryId]?.order;
  if (!currentOrder) return null;

  const nextCategory = Object.values(cats).find(cat => cat.order === currentOrder + 1);
  return nextCategory?.id ?? null;
}

// ==================== 公共 API - Home 頁面使用 ====================

/**
 * 取得 Home 頁面展示用的輕量級資料
 *
 * 特點：
 * - 只包含需要在首頁展示的關卡
 * - 資料結構簡化，不包含學習目標、前置條件等
 * - 按 displayOrder 排序
 */
export function getHomePageAlgorithms(): HomePageAlgorithmMetadata[] {
  return (levelsData.levels as RawLevelData[])
    .filter(l => l.homePageMetadata?.showOnHomePage)
    .sort((a, b) => {
      const orderA = a.homePageMetadata?.displayOrder ?? 999;
      const orderB = b.homePageMetadata?.displayOrder ?? 999;
      return orderA - orderB;
    })
    .map(l => ({
      id: l.homePageMetadata!.displayOrder,
      levelId: l.id,
      name: l.name,
      nameEn: l.nameEn,
      category: l.category,
      difficulty: l.difficulty,
      description: l.description,
      image: l.homePageMetadata!.image,
      translationKey: l.homePageMetadata!.translationKey,
      isDeveloped: l.isDeveloped,
    }));
}

// ==================== 兼容性 API（向後兼容舊程式碼） ====================

/**
 * @deprecated 使用 getHomePageAlgorithms() 替代
 */
export function getAllAlgorithmsMetadata(): HomePageAlgorithmMetadata[] {
  return getHomePageAlgorithms();
}

/**
 * @deprecated 使用 getLevelConfigById() + homePageMetadata 替代
 */
export function getAlgorithmMetadataById(id: number): HomePageAlgorithmMetadata | null {
  const all = getHomePageAlgorithms();
  return all.find(a => a.id === id) ?? null;
}

/**
 * @deprecated 使用 getLevelConfigById() 替代
 */
export function getLevelIdFromHomeAlgorithm(homeAlgorithmId: number): string | null {
  const metadata = getAlgorithmMetadataById(homeAlgorithmId);
  return metadata?.levelId ?? null;
}

// ==================== 公共 API - 關卡實作相關 ====================

import type { AlgorithmConfig } from '@/types/algorithm';
import type { DataStructureConfig } from '@/types/dataStructure';
import { algorithmsMap } from '../algorithms/index';
import { dataStructuresMap } from '../DataStructure';

/**
 * 取得關卡的實作配置（Algorithm 或 DataStructure）
 * 用於 Tutorial 和 Practice 頁面載入實際的演算法/資料結構邏輯
 */
export function getLevelImplementation(
  levelId: string
): AlgorithmConfig | DataStructureConfig | null {
  const level = getLevelConfigById(levelId);
  if (!level) return null;

  if (level.implementationType === 'algorithm') {
    return algorithmsMap[level.implementationKey] || null;
  } else if (level.implementationType === 'dataStructure') {
    return dataStructuresMap[level.implementationKey] || null;
  }

  return null;
}

/**
 * 檢查關卡是否已實作
 */
export function isLevelImplemented(levelId: string): boolean {
  const implementation = getLevelImplementation(levelId);
  return implementation !== null;
}

/**
 * 取得 Category 的 Boss Level
 */
export function getCategoryBossLevel(categoryId: AlgorithmCategory): Level | undefined {
  const levels = (levelsData.levels as RawLevelData[])
    .filter(l => l.category === categoryId);
  const bossConfig = levels.find(l => l.pathMetadata?.pathType === 'boss');
  return bossConfig ? levelConfigToLevel(rawToLevelConfig(bossConfig)) : undefined;
}

/**
 * 取得 Category 的 Portal Node
 */
export function getCategoryPortalNode(categoryId: AlgorithmCategory): Level | undefined {
  const levels = (levelsData.levels as RawLevelData[])
    .filter(l => l.category === categoryId);
  const portalConfig = levels.find(l => l.pathMetadata?.pathType === 'portal');
  return portalConfig ? levelConfigToLevel(rawToLevelConfig(portalConfig)) : undefined;
}

/**
 * 檢查關卡是否為 Portal Node
 */
export function isPortalNode(levelId: string): boolean {
  const level = getLevelConfigById(levelId);
  return level?.pathMetadata?.pathType === 'portal';
}

/**
 * 檢查關卡是否為 Boss Level
 */
export function isBossLevel(levelId: string): boolean {
  const level = getLevelConfigById(levelId);
  return level?.pathMetadata?.pathType === 'boss';
}

/**
 * 取得 Portal Node 的目標 Category
 */
export function getPortalTargetCategory(portalLevelId: string): AlgorithmCategory | null {
  const level = getLevelConfigById(portalLevelId);
  if (!level || !isPortalNode(portalLevelId)) return null;
  return level.pathMetadata?.targetCategory ?? null;
}

/**
 * 檢查 Portal Node 是否已解鎖（Boss Level 是否完成）
 */
export function isPortalUnlocked(portalLevelId: string, userProgress: UserProgress): boolean {
  const portalLevel = getLevelConfigById(portalLevelId);
  if (!portalLevel || !isPortalNode(portalLevelId)) return false;

  // 檢查前置關卡（Boss Level）是否完成
  const prerequisites = portalLevel.prerequisites?.levelIds || [];
  if (prerequisites.length === 0) return true;

  const bossLevelId = prerequisites[0]; // Portal 的前置條件應該只有一個 Boss Level
  const bossProgress = userProgress.levels?.[bossLevelId];
  return bossProgress?.status === 'completed';
}

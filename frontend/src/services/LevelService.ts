/**
 * Level Service - 關卡資料查詢服務
 *
 * 職責：
 * - 提供關卡資料的查詢 API
 * - 處理關卡相關的業務邏輯（Boss Level, Portal Node）
 * - 未來可擴展為從後端 API 獲取資料
 */

import type { Level, LevelConfig, UserProgress, CategoryType } from "@/types";
import {
  getRawLevels,
  getRawCategories,
  rawToLevelConfig,
  levelConfigToLevel,
  calculateDisplayOrder,
} from "./adapters/levelAdapter";

// ==================== Home 頁面專用類型 ====================

/**
 * Home 頁面展示用的輕量級資料
 */
export interface HomePageAlgorithmMetadata {
  id: number; // 展示順序 ID
  levelId: string; // 關卡真實 ID
  name: string; // 中文名稱
  nameEn: string; // 英文名稱
  category: CategoryType;
  difficulty: number;
  description: string;
  image: string; // 圖片檔名
  translationKey: string;
  isDeveloped: boolean;
}

// ==================== 基礎查詢 ====================

/**
 * 取得所有關卡（不含 implementationKey）
 */
export function getAllLevels(): Level[] {
  return getRawLevels().map((raw) => levelConfigToLevel(rawToLevelConfig(raw)));
}

/**
 * 取得所有關卡配置（含 implementationKey）
 */
export function getAllLevelConfigs(): LevelConfig[] {
  return getRawLevels().map(rawToLevelConfig);
}

/**
 * 根據 ID 取得關卡
 */
export function getLevelById(levelId: string): Level | null {
  const raw = getRawLevels().find((l) => l.id === levelId);
  return raw ? levelConfigToLevel(rawToLevelConfig(raw)) : null;
}

/**
 * 根據 ID 取得關卡配置
 */
export function getLevelConfigById(levelId: string): LevelConfig | null {
  const raw = getRawLevels().find((l) => l.id === levelId);
  return raw ? rawToLevelConfig(raw) : null;
}

// ==================== 分類查詢 ====================

/**
 * 根據分類取得關卡列表
 */
export function getLevelsByCategory(category: CategoryType | "all"): Level[] {
  if (category === "all") return getAllLevels();
  return getRawLevels()
    .filter((l) => l.category === category)
    .map((raw) => levelConfigToLevel(rawToLevelConfig(raw)));
}

/**
 * 取得所有已開發的關卡
 */
export function getDevelopedLevels(): Level[] {
  return getRawLevels()
    .filter((l) => l.isDeveloped)
    .map((raw) => levelConfigToLevel(rawToLevelConfig(raw)));
}

// ==================== 首頁展示 ====================

/**
 * 取得首頁展示用的關卡列表
 * 按 category.order * 1000 + layer 排序
 */
export function getHomePageLevels(): HomePageAlgorithmMetadata[] {
  const categories = getRawCategories();

  return getRawLevels()
    .filter((l) => l.homePageMetadata?.showOnHomePage)
    .map((l, index) => ({
      id: calculateDisplayOrder(l, categories),
      levelId: l.id,
      name: l.name,
      nameEn: l.nameEn,
      category: l.category,
      difficulty: l.difficulty,
      description: l.description,
      image: l.homePageMetadata!.image,
      translationKey: l.homePageMetadata!.translationKey,
      isDeveloped: l.isDeveloped,
    }))
    .sort((a, b) => a.id - b.id);
}

// ==================== Boss 與 Portal 邏輯 ====================

/**
 * 檢查關卡是否為 Boss Level
 */
export function isBossLevel(levelId: string): boolean {
  const level = getLevelConfigById(levelId);
  return level?.pathMetadata?.pathType === "boss";
}

/**
 * 檢查關卡是否為 Portal Node
 */
export function isPortalNode(levelId: string): boolean {
  const level = getLevelConfigById(levelId);
  return level?.pathMetadata?.pathType === "portal";
}

/**
 * 取得指定分類的 Boss Level
 */
export function getCategoryBossLevel(category: CategoryType): Level | null {
  const raw = getRawLevels().find(
    (l) => l.category === category && l.pathMetadata?.pathType === "boss",
  );
  return raw ? levelConfigToLevel(rawToLevelConfig(raw)) : null;
}

/**
 * 取得指定分類的 Portal Node
 */
export function getCategoryPortalNode(category: CategoryType): Level | null {
  const raw = getRawLevels().find(
    (l) => l.category === category && l.pathMetadata?.pathType === "portal",
  );
  return raw ? levelConfigToLevel(rawToLevelConfig(raw)) : null;
}

/**
 * 取得 Portal Node 的目標分類
 */
export function getPortalTargetCategory(
  portalLevelId: string,
): CategoryType | null {
  const level = getLevelConfigById(portalLevelId);
  if (!level || !isPortalNode(portalLevelId)) return null;
  return level.pathMetadata?.targetCategory ?? null;
}

/**
 * 檢查 Portal 是否已解鎖
 * 判斷前置關卡（Boss Level）是否完成
 */
export function isPortalUnlocked(
  portalLevelId: string,
  userProgress: UserProgress,
): boolean {
  const portalLevel = getLevelConfigById(portalLevelId);
  if (!portalLevel || !isPortalNode(portalLevelId)) return false;

  // 檢查前置關卡（Boss Level）是否完成
  const prerequisites = portalLevel.prerequisites?.levelIds || [];
  if (prerequisites.length === 0) return true;

  const bossLevelId = prerequisites[0]; // Portal 的前置條件應該只有一個 Boss Level
  const bossProgress = userProgress.levels?.[bossLevelId];
  return bossProgress?.status === "completed";
}

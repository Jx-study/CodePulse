/**
 * Level Service - 關卡資料查詢服務
 *
 * 職責：
 * - 提供關卡資料的查詢 API
 * - 處理關卡相關的業務邏輯（Boss Level, Portal Node）
 * - 未來可擴展為從後端 API 獲取資料
 */

import type {
  Level,
  LevelConfig,
  PrerequisiteConfig,
  UserProgress,
  CategoryType,
} from "@/types";
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
  category: CategoryType;
  difficulty: number;
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
    .map((l) => ({
      id: calculateDisplayOrder(l, categories),
      levelId: l.id,
      category: l.category,
      difficulty: l.difficulty,
      image: l.homePageMetadata!.image,
      translationKey: l.homePageMetadata!.translationKey,
      isDeveloped: l.isDeveloped,
    }))
    .sort((a, b) => a.id - b.id);
}

// ==================== 解鎖判斷 ====================

/**
 * 解析有效前置關卡：未開發的關卡不作為 gate，而是往上追溯到最近的已開發前置關卡
 */
export function resolveEffectivePrerequisites(levelIds: string[]): string[] {
  const rawLevels = getRawLevels();
  const levelMap = new Map(rawLevels.map((l) => [l.id, l]));
  const resolved: string[] = [];
  const resolvedSet = new Set<string>();

  const addResolved = (levelId: string) => {
    if (!resolvedSet.has(levelId)) {
      resolvedSet.add(levelId);
      resolved.push(levelId);
    }
  };

  const tracePrerequisite = (levelId: string, visited: Set<string>) => {
    if (visited.has(levelId)) return;
    visited.add(levelId);

    const level = levelMap.get(levelId);
    if (!level) return;

    if (level.isDeveloped) {
      addResolved(levelId);
      return;
    }

    const prerequisiteIds = level.prerequisites?.levelIds ?? [];
    prerequisiteIds.forEach((prerequisiteId) => {
      tracePrerequisite(prerequisiteId, new Set(visited));
    });
  };

  levelIds.forEach((levelId) => tracePrerequisite(levelId, new Set()));
  return resolved;
}

/**
 * 取得可供 UI 顯示與鎖定判斷共用的有效前置關卡資訊
 */
export function getEffectivePrerequisiteInfo(level: {
  prerequisites?: PrerequisiteConfig;
}): PrerequisiteConfig | undefined {
  const prereq = level.prerequisites;

  if (!prereq || prereq.type === "NONE" || prereq.levelIds.length === 0) {
    return prereq;
  }

  return {
    ...prereq,
    levelIds: resolveEffectivePrerequisites(prereq.levelIds),
  };
}

/**
 * 根據 AND/OR 前置邏輯判斷關卡是否解鎖，未實作的前置關卡會往上追溯到已實作 gate
 */
export function isLevelUnlocked(
  level: { prerequisites?: PrerequisiteConfig },
  userProgress: UserProgress,
): boolean {
  const prereq = level.prerequisites;

  if (!prereq || prereq.type === "NONE" || prereq.levelIds.length === 0) {
    return true;
  }

  const effectiveIds = getEffectivePrerequisiteInfo(level)?.levelIds ?? [];

  // 沒有可追溯的已開發 gate 時，維持既有行為：視為無前置
  if (effectiveIds.length === 0) return true;

  const isCompleted = (levelId: string) =>
    userProgress.levels?.[levelId]?.status === "completed";

  if (prereq.type === "AND") {
    return effectiveIds.every(isCompleted);
  }

  if (prereq.type === "OR") {
    return effectiveIds.some(isCompleted);
  }

  return false;
}

/**
 * 計算所有關卡的解鎖狀態（供 graphUtils 使用）
 */
export function computeAllUnlockStatus(
  levels: Level[],
  userProgress: UserProgress,
): (Level & { isUnlocked: boolean })[] {
  return levels.map((level) => ({
    ...level,
    isUnlocked: isLevelUnlocked(level, userProgress),
  }));
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
 * 使用與一般關卡相同的有效前置關卡規則，避免顯示狀態與點擊行為不一致
 */
export function isPortalUnlocked(
  portalLevelId: string,
  userProgress: UserProgress,
): boolean {
  const portalLevel = getLevelConfigById(portalLevelId);
  if (!portalLevel || !isPortalNode(portalLevelId)) return false;

  return isLevelUnlocked(portalLevel, userProgress);
}

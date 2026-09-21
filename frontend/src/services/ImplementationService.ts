/**
 * Implementation Service - 實作配置查詢服務
 *
 * 職責：
 * - 提供實作配置的查詢 API
 */

import type { LevelImplementationConfig } from "@/types/implementation";
import { implementationsMap } from "@/data/implementations";
import { getLevelConfigById } from "./LevelService";

// ==================== 實作查詢 ====================

/**
 * 根據 implementationKey 查詢實作配置
 */
function getImplementation(implementationKey: string): LevelImplementationConfig | null {
  return implementationsMap[implementationKey] || null;
}

/**
 * 根據 levelId 查詢實作配置
 */
export function getImplementationByLevelId(levelId: string): LevelImplementationConfig | null {
  const levelConfig = getLevelConfigById(levelId);
  if (!levelConfig) return null;

  return getImplementation(levelConfig.implementationKey);
}

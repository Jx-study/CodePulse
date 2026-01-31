/**
 * Implementation Service - 實作配置查詢服務
 *
 * 職責：
 * - 提供實作配置的查詢 API
 * - 判斷實作類型（algorithm / dataStructure）
 * - 檢查關卡是否已實作
 */

import type { LevelImplementationConfig } from "@/types/implementation";
import { implementationsMap } from "@/data/implementations";
import { getLevelConfigById } from "./LevelService";

// ==================== 實作查詢 ====================

/**
 * 根據 implementationKey 查詢實作配置
 */
export function getImplementation(implementationKey: string): LevelImplementationConfig | null {
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

/**
 * 檢查關卡是否已實作
 */
export function isLevelImplemented(levelId: string): boolean {
  return getImplementationByLevelId(levelId) !== null;
}

// ==================== 類型判斷 ====================

/**
 * 檢查實作類型是否為演算法
 */
export function isAlgorithm(implementationKey: string): boolean {
  const implementation = getImplementation(implementationKey);
  return implementation?.type === "algorithm";
}

/**
 * 檢查實作類型是否為資料結構
 */
export function isDataStructure(implementationKey: string): boolean {
  const implementation = getImplementation(implementationKey);
  return implementation?.type === "dataStructure";
}

/**
 * 檢查關卡是否為演算法類型
 */
export function isAlgorithmLevel(levelId: string): boolean {
  const implementation = getImplementationByLevelId(levelId);
  return implementation?.type === "algorithm";
}

/**
 * 檢查關卡是否為資料結構類型
 */
export function isDataStructureLevel(levelId: string): boolean {
  const implementation = getImplementationByLevelId(levelId);
  return implementation?.type === "dataStructure";
}

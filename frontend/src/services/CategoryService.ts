/**
 * Category Service - 分類資料查詢服務
 *
 * 職責：
 * - 提供分類資料的查詢 API
 * - 處理分類解鎖邏輯
 * - 未來可擴展為從後端 API 獲取資料
 */

import type { Category, CategoryType, UserProgress } from "@/types";
import { getRawCategories } from "./adapters/levelAdapter";
import { getCategoryBossLevel } from "./LevelService";

// ==================== 基礎查詢 ====================

/**
 * 取得所有分類配置
 * 按 order 欄位排序
 */
export function getAllCategories(): Category[] {
  const rawCategories = getRawCategories();

  return Object.values(rawCategories)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      nameEn: cat.nameEn,
      description: cat.description,
      icon: cat.icon,
      colorTheme: cat.colorTheme,
      isUnlocked: false, // 預設為 false，需要透過 getCategories 取得實際狀態
      order: cat.order,
    }))
    .sort((a, b) => a.order - b.order);
}

/**
 * 根據 ID 取得分類配置
 */
export function getCategoryById(categoryId: CategoryType): Category | null {
  const rawCategories = getRawCategories();
  const rawCat = rawCategories[categoryId];

  if (!rawCat) return null;

  return {
    id: rawCat.id,
    name: rawCat.name,
    nameEn: rawCat.nameEn,
    description: rawCat.description,
    icon: rawCat.icon,
    colorTheme: rawCat.colorTheme,
    isUnlocked: false,
    order: rawCat.order,
  };
}

/**
 * 取得分類的顯示名稱
 */
export function getCategoryName(categoryId: CategoryType): string {
  const rawCategories = getRawCategories();
  return rawCategories[categoryId]?.name || categoryId;
}

/**
 * 取得下一個分類
 * 根據 category.order 欄位判斷
 */
export function getNextCategory(
  currentCategoryId: CategoryType,
): CategoryType | null {
  const rawCategories = getRawCategories();
  const currentCat = rawCategories[currentCategoryId];
  if (!currentCat) return null;

  const nextCat = Object.values(rawCategories).find(
    (cat) => cat.order === currentCat.order + 1,
  );
  return nextCat?.id ?? null;
}

// ==================== 解鎖邏輯 ====================

/**
 * 取得分類配置（包含解鎖狀態）
 * 結合 userProgress.categoryUnlocks 判斷 isUnlocked
 */
export function getCategories(userProgress: UserProgress): Category[] {
  const rawCategories = getRawCategories();

  return Object.values(rawCategories)
    .map((cat) => {
      const categoryId = cat.id as CategoryType;
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
    })
    .sort((a, b) => a.order - b.order);
}

/**
 * 根據 Boss Level 完成狀態更新分類解鎖
 * 從 userProgress.ts 的同名函式移動過來
 *
 * 邏輯：
 * - 檢查每個 category 的 Boss Level 是否完成
 * - 如果完成則解鎖下一個 category
 * - 使用 while 迴圈實現級聯解鎖
 */
export function updateCategoryUnlocks(progress: UserProgress): UserProgress {
  const rawCategories = getRawCategories();
  const sortedCategories = Object.values(rawCategories).sort(
    (a, b) => a.order - b.order,
  );

  const updated = { ...progress };

  // 從第二個 category 開始檢查（第一個預設解鎖）
  for (let i = 1; i < sortedCategories.length; i++) {
    const currentCategory = sortedCategories[i];
    const categoryId = currentCategory.id as CategoryType;

    // 如果已經解鎖，跳過
    if (updated.categoryUnlocks?.[categoryId]) continue;

    // 檢查前一個 category 的 Boss Level 是否完成
    const prevCategory = sortedCategories[i - 1];
    const prevCategoryId = prevCategory.id as CategoryType;
    const bossLevel = getCategoryBossLevel(prevCategoryId);

    if (bossLevel) {
      const bossProgress = updated.levels?.[bossLevel.id];
      if (bossProgress?.status === "completed") {
        // 解鎖當前 category
        updated.categoryUnlocks = updated.categoryUnlocks || {};
        updated.categoryUnlocks[categoryId] = true;
        updated.activeCategory = categoryId;
      } else {
        // 如果前一個 Boss Level 未完成，後面的都不解鎖
        break;
      }
    }
  }

  return updated;
}

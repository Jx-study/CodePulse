/**
 * Progress Service - 用戶進度計算服務
 *
 * 職責：
 * - 計算關卡顯示狀態（locked, unlocked, in-progress, completed）
 * - 處理關卡進度查詢
 * - 計算進度統計數據
 */

import type {
  Level,
  UserProgress,
  LevelProgress,
  LevelStatus,
  CategoryType,
  CategoryProgressInfo,
} from "@/types";

// ==================== 關卡進度查詢 ====================

/**
 * 獲取關卡進度（若不存在則返回預設值）
 */
export function getLevelProgress(
  levelId: string,
  userProgress: UserProgress,
): LevelProgress {
  return (
    userProgress.levels[levelId] || {
      levelId,
      status: "locked" as const,
      stars: 0,
      attempts: 0,
      bestTime: 0,
    }
  );
}

// ==================== 關卡顯示狀態計算 ====================

/**
 * 計算關卡應該顯示的狀態
 *
 * 規則：
 * 1. 在同一 category 中，找出所有已解鎖但未完成的關卡
 * 2. 只有 layer 最小的關卡才會顯示為可玩狀態
 * 3. 如果整個 category 只有一個可玩關卡，顯示為 "in-progress"
 * 4. 如果有多個可玩關卡，顯示為 "unlocked"
 */
export function calculateDisplayStatus(
  level: Level & { isUnlocked: boolean },
  filteredLevels: (Level & { isUnlocked: boolean })[],
  userProgress: UserProgress,
): LevelStatus {
  // 如果關卡被鎖定，直接返回 "locked"
  if (!level.isUnlocked) {
    return "locked";
  }

  // 獲取用戶進度中的狀態（若不存在則視為 "locked"）
  const progressStatus = userProgress.levels[level.id]?.status || "locked";

  // 如果已經是 "completed" 或 "in-progress"，保持原狀態
  if (progressStatus === "completed" || progressStatus === "in-progress") {
    return progressStatus;
  }

  // 找出所有已解鎖但未完成的關卡（包含 status 為 "locked" 或 "unlocked" 的）
  const unlockedNotCompletedLevels = filteredLevels.filter(
    (l) =>
      l.isUnlocked &&
      userProgress.levels[l.id]?.status !== "completed" &&
      userProgress.levels[l.id]?.status !== "in-progress",
  );

  // 如果沒有未完成的關卡，返回 "unlocked"（這種情況應該不會發生，因為當前關卡也是已解鎖的）
  if (unlockedNotCompletedLevels.length === 0) {
    return "unlocked";
  }

  // 找到 layer 最小的關卡
  const minLayer = Math.min(
    ...unlockedNotCompletedLevels.map((l) => l.graphPosition?.layer ?? 0),
  );

  // 找出所有 layer 最小的未完成關卡
  const minLayerLevels = unlockedNotCompletedLevels.filter(
    (l) => l.graphPosition?.layer === minLayer,
  );

  // 如果當前關卡不是 layer 最小的，顯示為 "unlocked"（已解鎖但不是推薦順序）
  const isInMinLayer = minLayerLevels.some((l) => l.id === level.id);
  if (!isInMinLayer) {
    return "unlocked";
  }

  // 如果只有一個 layer 最小的未完成關卡（就是當前這個），顯示為 "in-progress"
  if (minLayerLevels.length === 1) {
    return "in-progress";
  }

  // 如果有多個 layer 最小的未完成關卡，顯示為 "unlocked"
  return "unlocked";
}

// ==================== 進度統計 ====================

/**
 * 計算總體進度統計
 */
export function calculateOverallProgress(
  allLevels: Level[],
  userProgress: UserProgress,
): {
  totalLevels: number;
  completedLevels: number;
  totalStars: number;
  earnedStars: number;
  completionRate: number;
} {
  const totalLevels = allLevels.length;
  const completedLevels = Object.values(userProgress.levels).filter(
    (progress) => progress.status === "completed",
  ).length;
  const totalStars = totalLevels * 3;
  const earnedStars = Object.values(userProgress.levels).reduce(
    (sum, progress) => sum + progress.stars,
    0,
  );
  const completionRate =
    totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;

  return {
    totalLevels,
    completedLevels,
    totalStars,
    earnedStars,
    completionRate,
  };
}

/**
 * 計算按分類的進度統計
 */
export function calculateCategoryProgress(
  allLevels: Level[],
  userProgress: UserProgress,
): Record<CategoryType, CategoryProgressInfo> {
  return allLevels.reduce(
    (acc, level) => {
      const category = level.category;

      if (!acc[category]) {
        acc[category] = {
          name: level.category,
          completedLevels: 0,
          totalLevels: 0,
          completionRate: 0,
          isBossCompleted: false,
        };
      }

      acc[category].totalLevels += 1;

      const levelProgress = userProgress.levels[level.id];
      if (levelProgress?.status === "completed") {
        acc[category].completedLevels += 1;
      }

      // 檢查是否為 Boss Level
      if (
        level.pathMetadata?.pathType === "boss" &&
        levelProgress?.status === "completed"
      ) {
        acc[category].isBossCompleted = true;
      }

      // 計算完成率
      acc[category].completionRate =
        acc[category].totalLevels > 0
          ? (acc[category].completedLevels / acc[category].totalLevels) * 100
          : 0;

      return acc;
    },
    {} as Record<CategoryType, CategoryProgressInfo>,
  );
}

/**
 * 完成關卡（更新進度）
 */
export function completeLevel(
  levelId: string,
  userProgress: UserProgress,
  newStars: 0 | 1 | 2 | 3,
): UserProgress {
  const currentProgress = getLevelProgress(levelId, userProgress);
  const wasCompleted = currentProgress.status === "completed";

  return {
    ...userProgress,
    levels: {
      ...userProgress.levels,
      [levelId]: {
        ...currentProgress,
        status: "completed" as const,
        stars: Math.max(currentProgress.stars, newStars) as 0 | 1 | 2 | 3,
        attempts: currentProgress.attempts + 1,
      },
    },
    totalLevelsCompleted: userProgress.totalLevelsCompleted + (wasCompleted ? 0 : 1),
    totalStarsEarned: userProgress.totalStarsEarned + (wasCompleted ? 0 : newStars),
  };
}

/**
 * 更新關卡狀態為「進行中」
 */
export function startLevel(
  levelId: string,
  userProgress: UserProgress,
): UserProgress {
  const currentProgress = getLevelProgress(levelId, userProgress);

  return {
    ...userProgress,
    levels: {
      ...userProgress.levels,
      [levelId]: {
        ...currentProgress,
        status: "in-progress" as const,
      },
    },
  };
}

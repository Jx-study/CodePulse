/**
 * Progress Service - 用戶進度計算服務
 *
 * 職責：
 * - 從後端取得用戶進度（HTTP）
 * - 挑選技能樹上的建議節點
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
  ScoreLevel,
} from "@/types";
import { getCategoryById } from "./CategoryService";
import { isLevelStarted } from "@/shared/lib/levelProgress";
import { getAllLevels } from "./LevelService";
import apiService from "@/api/api";

// ==================== 後端 API 型別 ====================

interface ApiTutorialProgress {
  tutorial_slug: string;
  teaching_completed: boolean;
  best_score: number | null;
  best_time_seconds: number | null;
  attempt_count: number;
  practice_passed: boolean;
  last_accessed_at: string | null;
}

// ==================== 初始進度 ====================

/**
 * 從 levels.json（單一來源）動態生成初始進度的 levels map。
 * 過去這份清單是手抄的，曾漏掉 binarytree/bst/heap/graph/trie 等關卡，
 * 導致它們的後端進度在 mergeApiProgress 的 `slug in levels` 檢查被 skip、永遠不顯示通關。
 * 改由 getAllLevels() 生成後，新增關卡不需再手動同步，不會再漏。
 */
function buildInitialLevels(): UserProgress["levels"] {
  const levels: UserProgress["levels"] = {};
  for (const level of getAllLevels()) {
    levels[level.id] = {
      levelId: level.id,
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    };
  }
  return levels;
}

export const INITIAL_USER_PROGRESS: UserProgress = {
  userId: "guest",
  levels: buildInitialLevels(),
  totalStarsEarned: 0,
  totalLevelsCompleted: 0,
  lastAccessedDate: new Date().toISOString(),
  categoryUnlocks: {
    "data-structures": true,
    sorting: false,
    searching: false,
    graph: false,
    recursive: false,
  },
  activeCategory: "data-structures",
};

// ==================== API 函式 ====================

/** 從後端取得當前用戶所有 tutorial 進度 */
export async function fetchMyProgress(): Promise<ApiTutorialProgress[]> {
  const res = await apiService.get<{ progress: ApiTutorialProgress[] }>("/api/users/me/progress");
  return res.data.progress;
}

// ==================== 合併邏輯 ====================

/** 將後端 ApiTutorialProgress[] 合併至現有 UserProgress */
export function mergeApiProgress(
  base: UserProgress,
  apiProgress: ApiTutorialProgress[],
): UserProgress {
  const updated = { ...base, levels: { ...base.levels } };

  apiProgress.forEach((p) => {
    const slug = p.tutorial_slug;
    if (!(slug in updated.levels)) return;

    let stars: ScoreLevel = 0;
    if (p.best_score !== null) {
      if (p.best_score >= 90) stars = 3;
      else if (p.best_score >= 60) stars = 2;
      else if (p.practice_passed) stars = 1;
    } else if (p.practice_passed) {
      stars = 1;
    }

    let status: LevelStatus = updated.levels[slug].status;
    if (p.practice_passed) {
      status = "completed";
    } else if (p.attempt_count > 0) {
      status = "in-progress";
    }

    updated.levels[slug] = {
      ...updated.levels[slug],
      status,
      stars,
      attempts: p.attempt_count,
      bestTime: p.best_time_seconds ?? 0,
      bestScore: p.best_score ?? undefined,
      teachingCompleted: p.teaching_completed,
    };
  });

  updated.totalLevelsCompleted = Object.values(updated.levels).filter(
    (l) => l.status === "completed",
  ).length;

  updated.totalStarsEarned = Object.values(updated.levels).reduce(
    (sum, l) => sum + l.stars,
    0,
  );

  return updated;
}

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

// ==================== 建議節點 ====================

/**
 * 在目前分類的關卡中挑出唯一的建議節點，技能樹上只有它帶光暈。
 *
 * 規則：
 * 1. 候選是練習已解鎖、已開發、非 portal、尚未通過練習的關卡
 * 2. 依進度分三級，取最高的一級：進過練習 > 只看過教學（見 isLevelStarted）> 沒碰過
 *    回訪者在高層做到一半的關卡，不會輸給低層沒碰過的關卡
 * 3. 同一級取 layer 最小的，同層取陣列中第一個
 */
export function getRecommendedLevelId(
  levels: Level[],
  userProgress: UserProgress,
): string | null {
  const candidates = levels.filter(
    (l) =>
      l.isUnlocked &&
      l.isDeveloped &&
      isProgressTrackableLevel(l) &&
      userProgress.levels[l.id]?.status !== "completed",
  );
  if (candidates.length === 0) return null;

  const tierOf = (l: Level) => {
    const p = userProgress.levels[l.id];
    if ((p?.attempts ?? 0) > 0 || p?.status === "in-progress") return 2;
    return isLevelStarted(p) ? 1 : 0;
  };
  const topTier = Math.max(...candidates.map(tierOf));
  const tierLevels = candidates.filter((l) => tierOf(l) === topTier);

  const layerOf = (l: Level) => l.graphPosition?.layer ?? 0;
  const best = tierLevels.reduce((a, b) => (layerOf(b) < layerOf(a) ? b : a));
  return best.id;
}

// ==================== 進度統計 ====================

export function isProgressTrackableLevel(level: Level): boolean {
  return level.pathMetadata?.pathType !== "portal";
}

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
  const progressTrackableLevels = allLevels.filter(isProgressTrackableLevel);
  const progressTrackableLevelIds = new Set(
    progressTrackableLevels.map((level) => level.id),
  );

  const totalLevels = progressTrackableLevels.length;
  const completedLevels = progressTrackableLevels.filter(
    (level) => userProgress.levels[level.id]?.status === "completed",
  ).length;
  const totalStars = totalLevels * 3;
  const earnedStars = Object.values(userProgress.levels).reduce(
    (sum, progress) =>
      progressTrackableLevelIds.has(progress.levelId)
        ? sum + progress.stars
        : sum,
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
  return allLevels.filter(isProgressTrackableLevel).reduce(
    (acc, level) => {
      const category = level.category;

      if (!acc[category]) {
        const categoryConfig = getCategoryById(category);
        acc[category] = {
          icon: categoryConfig?.icon,
          colorTheme: categoryConfig?.colorTheme ?? "var(--primary-color)",
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
 * 更新關卡狀態為「進行中」
 */
export function startLevel(
  levelId: string,
  userProgress: UserProgress,
): UserProgress {
  const currentProgress = getLevelProgress(levelId, userProgress);

  // 已通關的關卡再次開始練習時，保持 completed 不降級為 in-progress
  // （通關是永久的；後端 practice_passed 也始終為 true）。
  if (currentProgress.status === "completed") {
    return userProgress;
  }

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

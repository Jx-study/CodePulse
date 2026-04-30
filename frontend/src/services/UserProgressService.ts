/**
 * User Progress Service - 用戶進度服務
 *
 * 職責：
 * - 定義後端進度 API 的資料型別
 * - 從後端取得用戶進度
 * - 將後端進度合併至前端 UserProgress 狀態
 */

import type { UserProgress, ScoreLevel, LevelStatus } from "@/types";
import apiService from "@/api/api";

// 後端 API 型別

export interface ApiTutorialProgress {
  tutorial_slug: string;
  teaching_completed: boolean;
  best_score: number | null;
  best_time_seconds: number | null;
  attempt_count: number;
  practice_passed: boolean;
  last_accessed_at: string | null;
}

// 初始進度（後端尚未回應時的預設值） 

export const INITIAL_USER_PROGRESS: UserProgress = {
  userId: "guest",
  levels: {
    // Data Structures
    array: { levelId: "array", status: "unlocked", stars: 0, attempts: 0, bestTime: 0 },
    "linked-list": { levelId: "linked-list", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    stack: { levelId: "stack", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    queue: { levelId: "queue", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    "doubly-linked-list": { levelId: "doubly-linked-list", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    "portal-to-sorting": { levelId: "portal-to-sorting", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    // Sorting
    "bubble-sort": { levelId: "bubble-sort", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    "selection-sort": { levelId: "selection-sort", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    "insertion-sort": { levelId: "insertion-sort", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    "merge-sort": { levelId: "merge-sort", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    "quick-sort": { levelId: "quick-sort", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    "portal-to-searching": { levelId: "portal-to-searching", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    // Searching
    "binary-search": { levelId: "binary-search", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    "linear-search": { levelId: "linear-search", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    "prefix-sum": { levelId: "prefix-sum", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    "portal-to-graph": { levelId: "portal-to-graph", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    // Graph
    bfs: { levelId: "bfs", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
    dfs: { levelId: "dfs", status: "locked", stars: 0, attempts: 0, bestTime: 0 },
  },
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

// API 函式

/** 從後端取得當前用戶所有 tutorial 進度 */
export async function fetchMyProgress(): Promise<ApiTutorialProgress[]> {
  const res = await apiService.get<ApiTutorialProgress[]>(
    "/api/users/me/progress",
  );
  return res.data;
}

// 純前端邏輯

/** 將後端 ApiTutorialProgress[] 合併至現有 UserProgress */
export function mergeApiProgress(
  base: UserProgress,
  apiProgress: ApiTutorialProgress[]
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
      status = 'completed';
    } else if (p.attempt_count > 0) {
      status = 'in-progress';
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
    (l) => l.status === 'completed'
  ).length;

  updated.totalStarsEarned = Object.values(updated.levels).reduce(
    (sum, l) => sum + l.stars,
    0
  );

  return updated;
}

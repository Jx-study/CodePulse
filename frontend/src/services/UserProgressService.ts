/**
 * User Progress Service - 用戶進度存儲服務
 *
 * 職責：
 * - 管理用戶進度的載入和儲存
 */

import type { UserProgress, ScoreLevel, LevelStatus } from "@/types";
import type { ApiTutorialProgress } from './tutorialService';

/** 初始使用者進度（有DB後移除） */
const INITIAL_USER_PROGRESS: UserProgress = {
  userId: "guest",
  levels: {
    // Data Structures
    array: {
      levelId: "array",
      status: "unlocked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    "linked-list": {
      levelId: "linked-list",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    stack: {
      levelId: "stack",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    queue: {
      levelId: "queue",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    "doubly-linked-list": {
      levelId: "doubly-linked-list",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    "portal-to-sorting": {
      levelId: "portal-to-sorting",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    // Sorting
    "bubble-sort": {
      levelId: "bubble-sort",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    "selection-sort": {
      levelId: "selection-sort",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    "insertion-sort": {
      levelId: "insertion-sort",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    "merge-sort": {
      levelId: "merge-sort",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    "quick-sort": {
      levelId: "quick-sort",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    "portal-to-searching": {
      levelId: "portal-to-searching",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    // Searching
    "binary-search": {
      levelId: "binary-search",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    "linear-search": {
      levelId: "linear-search",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    "prefix-sum": {
      levelId: "prefix-sum",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    "portal-to-graph": {
      levelId: "portal-to-graph",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    // Graph
    bfs: {
      levelId: "bfs",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
    dfs: {
      levelId: "dfs",
      status: "locked",
      stars: 0,
      attempts: 0,
      bestTime: 0,
    },
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

/**
 * 從後端 API 載入使用者進度
 *
 * TODO: 實作真正的 API 呼叫
 * @example
 * const response = await fetch('/api/user/progress');
 * return await response.json();
 */
export function loadUserProgress(): UserProgress {
  // TODO: 替換為真正的 API 呼叫
  return INITIAL_USER_PROGRESS;
}

/**
 * 儲存使用者進度到後端 API
 *
 * TODO: 實作真正的 API 呼叫
 * @param progress - 要儲存的使用者進度
 * @example
 * await fetch('/api/user/progress', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(progress)
 * });
 */
export function saveUserProgress(progress: UserProgress): void {
  // TODO: 替換為真正的 API 呼叫
  console.log("Progress save triggered:", progress);
}

/**
 * 重置使用者進度到後端 API
 *
 * TODO: 實作真正的 API 呼叫
 * @example
 * await fetch('/api/user/progress/reset', {
 *   method: 'POST'
 * });
 */
export function resetUserProgress(): void {
  // TODO: 替換為真正的 API 呼叫
  console.log("Progress reset triggered");
}

/**
 * 取得初始進度（用於測試或重置）
 */
export function getInitialUserProgress(): UserProgress {
  return { ...INITIAL_USER_PROGRESS };
}

/** 將後端 ApiTutorialProgress[] 合併至現有 UserProgress */
export function mergeApiProgress(
  base: UserProgress,
  apiProgress: ApiTutorialProgress[]
): UserProgress {
  const updated = { ...base, levels: { ...base.levels } };

  apiProgress.forEach((p) => {
    const slug = p.tutorial_slug;
    if (!(slug in updated.levels)) return; // 本地沒這個關卡則忽略

    // 計算星數
    let stars: ScoreLevel = 0;
    if (p.best_score !== null) {
      if (p.best_score >= 90) stars = 3;
      else if (p.best_score >= 60) stars = 2;
      else if (p.practice_passed) stars = 1;
    } else if (p.practice_passed) {
      stars = 1;
    }

    // 計算前端 status
    // 教學完成 or 練習通過 → completed；有任何進度 → in-progress
    let status: LevelStatus = updated.levels[slug].status;
    if (p.teaching_completed || p.practice_passed) {
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
      teachingCompleted: p.teaching_completed,
    };

    // 更新統計
    if (status === 'completed') {
      updated.totalLevelsCompleted = Object.values(updated.levels).filter(
        (l) => l.status === 'completed'
      ).length;
    }
  });

  updated.totalStarsEarned = Object.values(updated.levels).reduce(
    (sum, l) => sum + l.stars,
    0
  );

  return updated;
}

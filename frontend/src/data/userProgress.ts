/**
 * 使用者進度管理
 */

import type { UserProgress } from "@/types";

const STORAGE_KEY = "codepulse_user_progress";

/** 初始使用者進度 */
const INITIAL_USER_PROGRESS: UserProgress = {
  userId: "guest",
  levels: {
    "bubble-sort": {
      levelId: "bubble-sort",
      status: "unlocked",
      stars: 1,
      attempts: 0,
      bestTime: 0,
    },
    "selection-sort": {
      levelId: "selection-sort",
      status: "locked",
      stars: 1,
      attempts: 0,
      bestTime: 0,
    },
    "insertion-sort": {
      levelId: "insertion-sort",
      status: "locked",
      stars: 1,
      attempts: 0,
      bestTime: 0,
    },
    "merge-sort": {
      levelId: "merge-sort",
      status: "locked",
      stars: 1,
      attempts: 0,
      bestTime: 0,
    },
    "quick-sort": {
      levelId: "quick-sort",
      status: "locked",
      stars: 1,
      attempts: 0,
      bestTime: 0,
    },
    "binary-search": {
      levelId: "binary-search",
      status: "locked",
      stars: 1,
      attempts: 0,
      bestTime: 0,
    },
    "linear-search": {
      levelId: "linear-search",
      status: "locked",
      stars: 1,
      attempts: 0,
      bestTime: 0,
    },
    bfs: {
      levelId: "bfs",
      status: "locked",
      stars: 1,
      attempts: 0,
      bestTime: 0,
    },
    "linked-list": {
      levelId: "linked-list",
      status: "unlocked",
      stars: 1,
      attempts: 0,
      bestTime: 0,
    },
    stack: {
      levelId: "stack",
      status: "locked",
      stars: 1,
      attempts: 0,
      bestTime: 0,
    },
    queue: {
      levelId: "queue",
      status: "locked",
      stars: 1,
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
  },
  activeCategory: "data-structures",
};

/** 從 LocalStorage 載入使用者進度 */
export const loadUserProgress = (): UserProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const progress = JSON.parse(stored) as UserProgress;

      // 確保舊資料具有 categoryUnlocks 欄位（向後兼容）
      if (!progress.categoryUnlocks) {
        progress.categoryUnlocks = {
          "data-structures": true,
          sorting: false,
          searching: false,
          graph: false,
        };
      }

      return progress;
    }
  } catch (error) {
    console.error("Failed to load user progress:", error);
  }
  return INITIAL_USER_PROGRESS;
};

/** 儲存使用者進度到 LocalStorage */
export const saveUserProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save user progress:", error);
  }
};

/** 重置使用者進度 */
export const resetUserProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to reset user progress:", error);
  }
};

/**
 * LevelNode 尺寸常量
 * 與 LevelNode.module.scss 保持同步
 */

// 節點尺寸 (rem -> px)
export const LEVEL_NODE_SIZE = 80; // 5rem = 80px
export const LEVEL_NODE_SIZE_MOBILE = 64; // 4rem = 64px

// 節點半徑 (用於連線計算)
export const LEVEL_NODE_RADIUS = LEVEL_NODE_SIZE / 2; // 40px
export const LEVEL_NODE_RADIUS_MOBILE = LEVEL_NODE_SIZE_MOBILE / 2; // 32px

// 響應式斷點
export const MOBILE_BREAKPOINT = 768; // px

/**
 * 根據視窗寬度獲取當前節點半徑
 */
export const getCurrentNodeRadius = (): number => {
  if (typeof window === 'undefined') return LEVEL_NODE_RADIUS;
  return window.innerWidth <= MOBILE_BREAKPOINT
    ? LEVEL_NODE_RADIUS_MOBILE
    : LEVEL_NODE_RADIUS;
};
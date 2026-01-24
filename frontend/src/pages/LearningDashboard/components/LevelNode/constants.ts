/**
 * LevelNode 尺寸常量
 * 與 LevelNode.module.scss 保持同步
 */

// 節點尺寸 (rem -> px)
export const LEVEL_NODE_SIZE = 80; // 5rem = 80px
export const LEVEL_NODE_SIZE_MOBILE = 64; // 4rem = 64px

// Boss Level 尺寸 (更大)
export const BOSS_NODE_SIZE = 120; // 7.5rem = 120px
export const BOSS_NODE_SIZE_MOBILE = 96; // 6rem = 96px

// Portal Node 尺寸
export const PORTAL_NODE_SIZE = 100; // 6.25rem = 100px
export const PORTAL_NODE_SIZE_MOBILE = 80; // 5rem = 80px

// 節點半徑 (用於連線計算)
export const LEVEL_NODE_RADIUS = LEVEL_NODE_SIZE / 2; // 40px
export const LEVEL_NODE_RADIUS_MOBILE = LEVEL_NODE_SIZE_MOBILE / 2; // 32px
export const BOSS_NODE_RADIUS = BOSS_NODE_SIZE / 2; // 60px
export const BOSS_NODE_RADIUS_MOBILE = BOSS_NODE_SIZE_MOBILE / 2; // 48px
export const PORTAL_NODE_RADIUS = PORTAL_NODE_SIZE / 2; // 50px
export const PORTAL_NODE_RADIUS_MOBILE = PORTAL_NODE_SIZE_MOBILE / 2; // 40px

// 響應式斷點
export const MOBILE_BREAKPOINT = 768; // px

/**
 * 根據視窗寬度獲取當前節點半徑
 */
export const getCurrentNodeRadius = (isBoss = false, isPortal = false): number => {
  if (typeof window === 'undefined') {
    if (isBoss) return BOSS_NODE_RADIUS;
    if (isPortal) return PORTAL_NODE_RADIUS;
    return LEVEL_NODE_RADIUS;
  }

  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  if (isBoss) {
    return isMobile ? BOSS_NODE_RADIUS_MOBILE : BOSS_NODE_RADIUS;
  }

  if (isPortal) {
    return isMobile ? PORTAL_NODE_RADIUS_MOBILE : PORTAL_NODE_RADIUS;
  }

  return isMobile ? LEVEL_NODE_RADIUS_MOBILE : LEVEL_NODE_RADIUS;
};
/**
 * 響應式圖佈局配置
 * 根據螢幕尺寸提供不同的間距設定
 */

export interface LayoutConfig {
  layerSpacing: number;      // 垂直層間距 (px)
  branchSpacing: number;      // 水平分支間距 (px)
  nodeSpacing: number;        // 節點間距 (px)
}

// 響應式斷點
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
} as const;

// Desktop 配置 (≥1024px)
export const DESKTOP_CONFIG: LayoutConfig = {
  layerSpacing: 180,
  branchSpacing: 200,
  nodeSpacing: 0,
};

// Tablet 配置 (768-1023px)
export const TABLET_CONFIG: LayoutConfig = {
  layerSpacing: 150,
  branchSpacing: 150,
  nodeSpacing: 100,
};

// Mobile 配置 (<768px)
export const MOBILE_CONFIG: LayoutConfig = {
  layerSpacing: 150 ,
  branchSpacing: 120,
  nodeSpacing: 80,
};

/**
 * 根據視窗寬度獲取當前佈局配置
 * @param width 視窗寬度
 * @returns 對應的佈局配置
 */
export function getLayoutConfig(width?: number): LayoutConfig {
  const screenWidth = width ?? (typeof window !== 'undefined' ? window.innerWidth : 1920);

  if (screenWidth < BREAKPOINTS.MOBILE) {
    return MOBILE_CONFIG;
  }

  if (screenWidth < BREAKPOINTS.TABLET) {
    return TABLET_CONFIG;
  }

  return DESKTOP_CONFIG;
}

/**
 * 獲取當前水平偏移量（用於左右分支）
 * 基於 branchSpacing 的一半
 */
export function getHorizontalOffset(config?: LayoutConfig): number {
  const layoutConfig = config ?? getLayoutConfig();
  return layoutConfig.branchSpacing / 2;
}

/**
 * 獲取當前垂直間距
 */
export function getVerticalSpacing(config?: LayoutConfig): number {
  const layoutConfig = config ?? getLayoutConfig();
  return layoutConfig.layerSpacing;
}
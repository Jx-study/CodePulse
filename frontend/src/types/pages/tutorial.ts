import React from "react";

/**
 * 面板分類
 */
export type PanelCategory = "visualization" | "control" | "info";

/**
 * 面板配置介面
 * 定義每個面板的元數據
 */
export interface PanelConfig {
  id: string;             // 唯一標識符
  title: string;          // 顯示名稱
  icon?: React.ReactNode; // 圖標
  component: React.ComponentType<any>; // 組件
  defaultSize?: number;     // 默認大小(%)
  category: PanelCategory;  // 分類
  required?: boolean;       // 是否必須顯示(不能被關閉)
  isTab?: boolean;          // 是否作為 Tab 渲染
  tabGroup?: string;        // Tab 所屬的 Group (e.g., "inspector")
}

/**
 * 面板註冊表類型
 */
export type PanelRegistry = Record<string, PanelConfig>;

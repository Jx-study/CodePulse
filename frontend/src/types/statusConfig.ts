/**
 * Status configuration types for customizable colors per algorithm/data structure
 * 狀態配置型別系統：支援每個演算法/資料結構自訂狀態顏色
 */

/**
 * Individual status definition
 * 單一狀態定義
 */
export interface StatusDefinition {
  /** Status identifier (used in code) - 狀態識別碼（程式碼中使用） */
  key: string;
  /** Display name (Chinese label) - 顯示名稱（中文標籤） */
  label: string;
  /** Hex color code - 十六進位顏色碼 */
  color: string;
}

/**
 * Complete status configuration for an implementation
 * 完整的狀態配置
 */
export interface StatusConfig {
  /** Array of status definitions (ordered for legend display) - 狀態陣列（依序顯示於圖例） */
  statuses: StatusDefinition[];
}

/**
 * Helper type: Map from status key to color
 * 輔助型別：狀態鍵值到顏色的映射表
 */
export type StatusColorMap = Record<string, string>;

/**
 * Default status configuration (matches current 5 statuses)
 * 預設狀態配置（對應目前的5個狀態）
 */
export const DEFAULT_STATUS_CONFIG: StatusConfig = {
  statuses: [
    { key: "unfinished", label: "未完成", color: "#1d79cfff" },
    { key: "prepare", label: "準備中", color: "#f59e0b" },
    { key: "target", label: "目標", color: "#ff6b35" },
    { key: "complete", label: "完成", color: "#46f336ff" },
    { key: "inactive", label: "未啟用", color: "#555555" },
  ],
};

/**
 * Build a color map from status configuration for efficient lookup
 * 從狀態配置建立顏色映射表（O(1) 查找）
 *
 * @param config - The status configuration
 * @returns A record mapping status keys to colors
 *
 * @example
 * const colorMap = buildStatusColorMap(config);
 * const color = colorMap["prepare"]; // "#f59e0b"
 */
export function buildStatusColorMap(config: StatusConfig): StatusColorMap {
  const map: StatusColorMap = {};
  config.statuses.forEach((status) => {
    map[status.key] = status.color;
  });
  return map;
}

/**
 * Get color for a status key with fallback mechanism
 * 取得狀態顏色（含 fallback 機制）
 *
 * @param statusKey - The status key to look up
 * @param colorMap - The color map to search in
 * @param fallbackColor - Fallback color if key not found (default: "#888888")
 * @returns The color code
 *
 * @example
 * const color = getStatusColor("prepare", colorMap); // Returns color or fallback
 */
export function getStatusColor(
  statusKey: string,
  colorMap: StatusColorMap,
  fallbackColor: string = "#888888"
): string {
  return colorMap[statusKey] ?? fallbackColor;
}

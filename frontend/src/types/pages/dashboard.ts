/**
 * Learning Dashboard Page Types
 * 學習儀表板頁面相關的類型定義
 */

import type { DialogProps } from "../components/feedback";
// 關卡分類：從 levels.json 的 categories key 自動推導，新增 category 只需改 JSON
import type { CategoryType } from "@/services/adapters/levelAdapter";
export type { CategoryType };

// 先決條件類型
export type PrerequisiteType = "AND" | "OR" | "NONE";

// 難度類型（1-5 星）
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// 分數等級（0-3 星）
export type ScoreLevel = 0 | 1 | 2 | 3;

// 關卡狀態類型
export type LevelStatus = "locked" | "unlocked" | "in-progress" | "completed";

/**
 * pathType 說明：
 * `main`：主線路徑
 * `branch`：分支路徑
 * `convergence`：匯流點（多條路徑匯入）
 * `choice-point`：選擇點（一條路徑分出多條）
 * `boss`：Boss Level
 * `portal`：Portal Node
 */
export type PathType =
  | "main"
  | "branch"
  | "convergence"
  | "choice-point"
  | "boss"
  | "portal";

//路徑元數據
export interface PathMetadata {
  pathType: PathType;
  branchLabel?: string; // 分支標籤（'Sorting Path'）
  colorTheme?: string; // 自定義顏色（覆蓋 Category 主題色）
  targetCategory?: CategoryType; // Portal 目標 Category（僅 Portal Node，當 pathType === 'portal'）
}

// ==================== Category Types ====================

export interface Category {
  id: CategoryType;
  name: string; // '資料結構'
  nameEn: string; // 'Data Structures'
  description: string; // 簡介
  icon?: string; // FontAwesome icon name
  colorTheme: string; // 主題色（例：'#635bff', '#ff6b6b'）
  isDeveloped: boolean; // 是否已開發（false 表示尚未開發，按鈕 disabled）
  order: number; // 順序（決定解鎖順序）
}

// ==================== Level Types ====================
// 前置條件配置
export interface PrerequisiteConfig {
  type: PrerequisiteType;
  levelIds: string[]; // 前置關卡 ID 列表
}

export interface Level {
  id: string;
  name: string;
  nameEn: string;
  category: CategoryType;
  difficulty: DifficultyLevel;
  description?: string;
  learningObjectives?: string[];
  isDeveloped: boolean;
  isUnlocked: boolean;

  prerequisites?: PrerequisiteConfig;
  graphPosition?: GraphPosition;
  pathMetadata?: PathMetadata;
  ghostReferences?: GhostReference[]; // 幽靈參考節點列表
}

export interface LevelConfig extends Level {
  implementationKey: string; // 例如: 'sorting/quick-sort' 或 'linear/stack'
}

export interface LevelProgress {
  levelId: string;
  status: LevelStatus;
  stars: ScoreLevel;
  attempts: number;
  bestTime: number;
  completedAt?: string;
}

export interface UserProgress {
  userId: string;
  levels: {
    [levelId: string]: LevelProgress;
  };
  totalStarsEarned: number;
  totalLevelsCompleted: number;
  lastAccessedDate: string;

  categoryUnlocks: {
    [K in CategoryType]?: boolean;
  };
  activeCategory: CategoryType; // 使用者目前解鎖到的最高 Category ID
}

// ==================== Level Dialog Component ====================
export interface LevelDialogProps extends Pick<
  DialogProps,
  "isOpen" | "onClose"
> {
  level: Level;
  onStartTutorial: () => void;
  onStartPractice: () => void;
  onCompleteLevel?: () => void; // 測試用：完成關卡（練習頁面完成後可移除）
  userProgress: LevelProgress;

  // 雙模式權限控制
  tutorialLocked: boolean; // Tutorial 永遠為 false
  practiceLocked: boolean; // Practice 依賴前置關卡
  prerequisiteInfo?: PrerequisiteConfig; // 前置關卡配置
}

// ==================== Level Node Component ====================
// 2D 座標點
export interface Point2D {
  x: number;
  y: number;
}

export interface NodePosition {
  x: string; // CSS 位置（例：'calc(50% - 120px)'）
  y: number; // 像素值
  alignment: "left" | "right" | "center"; // 水平對齊方式
}

// 節點共用屬性
export interface BaseNodeProps {
  position: NodePosition;
  onClick: () => void;
}

export interface LevelNodeProps extends BaseNodeProps {
  level: Level;
  status: LevelStatus;
  stars: ScoreLevel;
  isLocked: boolean;

  isBossLevel?: boolean; // 是否為 Boss Level
  pathMetadata?: PathMetadata; // 路徑元數據
  categoryColor?: string; // 分類主題色（Boss Level 光暈用）
}

export interface PortalNodeProps extends BaseNodeProps {
  targetCategory: CategoryType;
  targetCategoryName: string;
  isUnlocked: boolean; // 是否解鎖（完成 Boss Level）
}

export interface GhostNodeProps extends BaseNodeProps {
  targetLevelId: string; // 目標 Level ID（用於跳轉和查詢）
  label: string; // 顯示標籤（如 "陣列"）
}

export interface PathConnectionProps {
  fromNode: NodePosition;
  toNode: NodePosition;
  status: "locked" | "unlocked" | "completed";
  containerWidth?: number;
  connectionType?: PrerequisiteType | "GHOST"; // 新增 GHOST 類型
}

// 顯示分支路徑的標籤
export interface BranchLabelProps {
  label: string; // 路徑名稱
  position: Point2D;
  color?: string; // 標籤顏色（對應路徑主題色）
}

// ==================== Graph Container ====================}
export interface LayoutConfig {
  layerSpacing: number; // 垂直間距
  branchSpacing: number; // 分支間距
  nodeSpacing: number; // 同分支節點間距
  containerWidth: number; // 容器寬度
  containerHeight: number; // 容器高度
  startY: number; // 起始 Y 座標（底部）
}

export interface GraphContainerProps {
  levels: Level[]; // 當前 Graph 的關卡清單
  userProgress: UserProgress; // 使用者進度
  children: (
    level: Level,
    index: number,
    position: NodePosition,
  ) => React.ReactNode;
  isDialogOpen?: boolean; // Dialog 或 Sidebar 開啟時停用縮放事件
  isSidebarOpen?: boolean; // Sidebar 開啟時停用縮放事件
}

export interface GraphPosition {
  layer: number; // 層級（0 = 底部入口）
  branch: string; // 分支名稱（'sorting-basic', 'search-path'）
  horizontalIndex: number; // 同一層內的水平位置（0, 1, 2...）
}

// ==================== Ghost Reference Nodes ====================
// 幽靈參考節點配置
export interface GhostReference {
  targetLevelId: string; // 目標 Level ID (如 'array')
  position: GraphPosition; // 幽靈節點在當前 category 的位置
  label?: string; // 自定義標籤（預設使用 targetLevel.name）
}

// ==================== Category Filter Component ====================
export interface CategoryFilterItem extends Category {
  levels: Level[]; // 該 Category 的所有關卡
  bossLevelId?: string; // Boss Level 的 ID
  portalTargetCategory?: CategoryType; // Portal 目標 Category ID
}

// ==================== Progress Stats Dialog Component ====================
// Category 進度資訊
export interface CategoryProgressInfo {
  name: string;
  icon?: string;
  colorTheme: string;
  completedLevels: number;
  totalLevels: number;
  completionRate: number;
  isBossCompleted: boolean; // Boss Level 是否完成
}

export interface ProgressStatsDialogProps extends Pick<
  DialogProps,
  "isOpen" | "onClose"
> {
  // 總體進度
  totalLevels: number; // 所有 Graph 的關卡總數
  completedLevels: number; // 已完成關卡總數
  totalStars: number; // 總星數
  earnedStars: number; // 已獲得星數
  completionRate: number; // 總完成度百分比

  // 按 Category 分組進度
  categoryProgress: {
    [K in CategoryType]?: CategoryProgressInfo;
  };
}

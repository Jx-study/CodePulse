/**
 * Learning Dashboard Page Types
 * 學習儀表板頁面相關的類型定義
 */

import type { DialogProps } from '../components/feedback';

// 先決條件類型
export type PrerequisiteType = 'AND' | 'OR' |'NONE';

// 難度類型（1-5 星）
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// 關卡狀態類型
export type LevelStatus = "locked" | "unlocked" | "in-progress" | "completed";

// 關卡分類
export type AlgorithmCategory =
  | "data-structures"
  | "sorting"
  | "searching"
  | "graph";
  
/**
 * pathType 說明：
 * `main`：主線路徑
 * `branch`：分支路徑
 * `convergence`：匯流點（多條路徑匯入）
 * `choice-point`：選擇點（一條路徑分出多條）
 * `boss`：Boss Level
 * `portal`：Portal Node
 */
export type PathType = 'main' | 'branch' | 'convergence' | 'choice-point' | 'boss' | 'portal';


//路徑元數據
export interface PathMetadata {
  pathType: PathType;
  branchLabel?: string;             // 分支標籤（'Sorting Path'）
  colorTheme?: string;              // 自定義顏色（覆蓋 Category 主題色）
  targetCategory?: AlgorithmCategory;          // Portal 目標 Category（僅 Portal Node，當 pathType === 'portal'）
}

// ==================== Category Types ====================
export interface Category {
  id: AlgorithmCategory;
  name: string; // '資料結構'
  nameEn: string; // 'Data Structures'
  description: string; // 簡介
  icon?: string; // FontAwesome icon name
  colorTheme: string; // 主題色（例：'#635bff', '#ff6b6b'）
  isUnlocked: boolean; // 是否解鎖（完成前一個 Boss Level）
  order: number; // 順序（決定解鎖順序）
}

export interface CategoryFilterProps {
  categories: Category[];
  activeCategory: AlgorithmCategory; // 當前選中的 Category ID
  onCategoryChange: (categoryId: AlgorithmCategory) => void;
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
  category: AlgorithmCategory;
  difficulty: DifficultyLevel;
  description?: string;  
  learningObjectives?: string[];  
  isDeveloped: boolean;
  isUnlocked: boolean;

  prerequisites?: PrerequisiteConfig;
  graphPosition?: GraphPosition;
  pathMetadata?: PathMetadata;
}

export interface LevelConfig extends Level {
  implementationType: "algorithm" | "dataStructure";
  implementationKey: string; // 例如: 'sorting/quick-sort' 或 'linear/stack'
}

export interface LevelProgress {
  levelId: string;
  status: LevelStatus;
  stars: DifficultyLevel;
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
    [K in AlgorithmCategory]?: boolean;
  };
  activeCategory: AlgorithmCategory; // 使用者目前解鎖到的最高 Category ID
}

// ==================== Level Dialog Component ====================
export interface LevelDialogProps extends Pick<DialogProps, 'isOpen' | 'onClose'> {
  level: Level;
  onStartTutorial: () => void;
  onStartPractice: () => void;
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
  stars: DifficultyLevel;
  isLocked: boolean;

  isBossLevel?: boolean;        // 是否為 Boss Level
  pathMetadata?: PathMetadata;  // 路徑元數據
}

export interface PortalNodeProps extends BaseNodeProps {
  targetCategory: AlgorithmCategory;
  targetCategoryName: string;
  isUnlocked: boolean;          // 是否解鎖（完成 Boss Level）
}

export interface PathConnectionProps {
  fromNode: NodePosition;
  toNode: NodePosition;
  /** v2.5: 連線狀態 - locked(灰黑) / unlocked(藍色) / completed(綠色) */
  status: 'locked' | 'unlocked' | 'completed';
  containerWidth?: number;
  /** v2.0: 連線類型 - AND(實線) / OR(虛線) / NONE(預設) */
  connectionType?: PrerequisiteType;
}

// 顯示分支路徑的標籤
export interface BranchLabelProps {
  label: string; // 路徑名稱
  position: Point2D;
  color?: string; // 標籤顏色（對應路徑主題色）
}

// ==================== Graph Container ====================
// TODO: remove
export interface DragState {
  isDragging: boolean;
  startY: number;
  scrollTop: number;
}

// TODO: remove
export interface VerticalLevelMapProps {
  levels: Level[];
  userProgress: UserProgress;
  onLevelClick: (level: Level) => void;
}

export interface LayoutConfig {
  layerSpacing: number; // 垂直間距
  branchSpacing: number; // 分支間距
  nodeSpacing: number; // 同分支節點間距
  containerWidth: number; // 容器寬度
  containerHeight: number; // 容器高度
  startY: number; // 起始 Y 座標（底部）
}

export interface GraphContainerProps {
  levels: Level[];              // 當前 Graph 的關卡清單
  userProgress: UserProgress;   // 使用者進度
  children: (level: Level, index: number, position: NodePosition) => React.ReactNode;
}

export interface GraphPosition {
  layer: number;                // 層級（0 = 底部入口）
  branch: string;               // 分支名稱（'sorting-basic', 'search-path'）
  horizontalIndex: number;      // 同一層內的水平位置（0, 1, 2...）
}

export interface ZoomControlsProps {
  currentZoom: number; // 0.5 - 2.0
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

// ==================== Category Filter Component ====================
export interface CategoryFilterItem extends Category {
  levels: Level[]; // 該 Category 的所有關卡
  bossLevelId?: string; // Boss Level 的 ID
  portalTargetCategory?: AlgorithmCategory; // Portal 目標 Category ID
}

// ==================== Progress Stats Dialog Component ====================
// Category 進度資訊
export interface CategoryProgressInfo {
  name: string;
  completedLevels: number;
  totalLevels: number;
  completionRate: number;
  isBossCompleted: boolean; // Boss Level 是否完成
}

export interface ProgressStatsDialogProps extends Pick<DialogProps, 'isOpen' | 'onClose'> {
  // 總體進度
  totalLevels: number; // 所有 Graph 的關卡總數
  completedLevels: number; // 已完成關卡總數
  totalStars: number; // 總星數
  earnedStars: number; // 已獲得星數
  completionRate: number; // 總完成度百分比

  // 按 Category 分組進度
  categoryProgress: {
    [K in AlgorithmCategory]?: CategoryProgressInfo;
  };
}

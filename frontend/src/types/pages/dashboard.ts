/**
 * Learning Dashboard Page Types
 * 學習儀表板頁面相關的類型定義
 */

// ==================== Level Types ====================
export interface Level {
  id: string;
  levelNumber: number;
  name: string;
  nameEn: string;
  category:
    | "sorting"
    | "searching"
    | "graph"
    | "dynamic-programming"
    | "data-structures";
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: number;
  description: string;
  learningObjectives: string[];
  isDeveloped: boolean;
  isUnlocked: boolean;
}

export interface LevelProgress {
  levelId: string;
  status: "locked" | "unlocked" | "in-progress" | "completed";
  stars: number;
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
}

// ==================== Level Dialog Component ====================
export interface LevelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  level: Level | null;
  progress: LevelProgress | null;
}

export interface TutorialSectionProps {
  level: Level;
}

export interface PracticeSectionProps {
  level: Level;
  progress: LevelProgress;
}

// ==================== Level Node Component ====================
export interface LevelNodeProps {
  level: Level;
  progress: LevelProgress;
  onClick?: (level: Level) => void;
}

// ==================== Vertical Level Map Component ====================
export interface DragState {
  isDragging: boolean;
  startY: number;
  scrollTop: number;
}

export interface VerticalLevelMapProps {
  levels: Level[];
  userProgress: UserProgress;
  onLevelClick: (level: Level) => void;
}

// ==================== Category Filter Component ====================
export type DashboardCategory =
  | "all"
  | "sorting"
  | "searching"
  | "graph"
  | "dynamic-programming"
  | "data-structures";

export interface CategoryFilterProps {
  selectedCategory: DashboardCategory;
  onCategoryChange: (category: DashboardCategory) => void;
}

// ==================== Progress Stats Dialog Component ====================
export interface ProgressStatsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userProgress: UserProgress;
  levels: Level[];
}

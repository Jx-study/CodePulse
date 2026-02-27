import type { ReactNode } from 'react';
import type { AnimationStep, ComplexityInfo, CodeConfig } from '@/types';
import type { StatusConfig } from './statusConfig';

/**
 * 補充問題參考資料結構
 * 用於展示演算法在不同情境下的應用範例
 */
export interface ProblemReference {
  id: string | number;
  title: string;
  concept: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  url: string;
}

// ─── ActionBar Props 分層型別 ────────────────────────────────

export type AlgorithmViewMode = "graph" | "grid" | "longest_lte" | "shortest_gte";

export interface RunParams {
  searchValue?: number;
  range?: [number, number];
  mode?: AlgorithmViewMode;
  rows?: number;
  cols?: number;
  startNode?: string;
  endNode?: string;
  targetSum?: number;
}

/** 基礎共用（所有 ActionBar 都需要） */
export interface BaseActionBarProps {
  onLoadData: (data: string) => void;
  onResetData: () => void;
  onRandomData: (params?: any) => void;
  onMaxNodesChange?: (count: number) => void;
  onLimitExceeded?: () => void;
  disabled?: boolean;
}

/** 資料結構專用 */
export interface DSActionBarProps extends BaseActionBarProps {
  onAddNode: (value: number, mode: string, index?: number) => void;
  onDeleteNode: (mode: string, index?: number) => void;
  onSearchNode: (value: number, mode?: string) => void;
  onPeek?: () => void;
  onTailModeChange?: (hasTail: boolean) => void;
  onGraphAction?: (action: string, payload: any) => void;
  isDirected?: boolean;
  onIsDirectedChange?: (val: boolean) => void;
}

/** 演算法專用 */
export interface AlgoActionBarProps extends BaseActionBarProps {
  onRun: (params?: RunParams) => void;
  viewMode?: AlgorithmViewMode;
  onViewModeChange?: (mode: AlgorithmViewMode) => void;
  currentData?: any;
}

/** renderActionBar 的參數型別（聯合型別） */
export type ActionBarProps = DSActionBarProps | AlgoActionBarProps;

// ─── LevelImplementationConfig ───────────────────────────────

/**
 * 統一的實作配置介面
 * 合併了 AlgorithmConfig 和 DataStructureConfig
 */
export interface LevelImplementationConfig {
  id: string;
  type: "algorithm" | "dataStructure";
  name: string;
  categoryName: string;
  description: string;
  codeConfig: CodeConfig; // 結構化代碼配置（必填）
  complexity: ComplexityInfo;
  introduction: string;
  defaultData: any;
  createAnimationSteps: (
    data: any,
    action?: any,
    config?: any
  ) => AnimationStep[];
  relatedProblems?: ProblemReference[];
  /** Optional custom status configuration - 可選的自訂狀態配置 */
  statusConfig?: StatusConfig;
  getCodeConfig?: (payload?: any) => CodeConfig;
  /** 各資料結構/演算法自行定義的 ActionBar 元件 */
  renderActionBar?: (props: ActionBarProps) => ReactNode;
}

/**
 * 所有實作的 ID 聯集
 */
export type ImplementationId =
  // 資料結構
  | "array"
  | "linkedlist"
  | "stack"
  | "queue"
  | "tree"
  | "graph"
  // 演算法
  | "bubblesort"
  | "selectionsort"
  | "insertionsort"
  | "binarysearch"
  | "linearsearch"
  | "prefixsum"
  | "slidingwindow"
  | "twopointers"
  | "fibonacci"
  | "knapsack";

/**
 * 實作配置映射表
 */
export type ImplementationMap = Record<string, LevelImplementationConfig>;

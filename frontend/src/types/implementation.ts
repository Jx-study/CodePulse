import type { AnimationStep, ComplexityInfo, CodeConfig } from '@/types';
import type { StatusConfig } from './statusConfig';

/**
 * 真實世界應用故事結構
 */
export interface RealWorldStory {
  id: string | number;
  title: string;
  content: string;
}

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
  realWorldStories?: RealWorldStory[];
  /** Optional custom status configuration - 可選的自訂狀態配置 */
  statusConfig?: StatusConfig;
  getCodeConfig?: (payload?: any) => CodeConfig;
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

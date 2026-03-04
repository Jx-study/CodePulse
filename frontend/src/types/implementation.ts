import type { AnimationStep, ComplexityInfo, CodeConfig } from '@/types';
import type { StatusConfig } from './statusConfig';

/**
 * 故事影片結構（YouTube）
 */
export interface StoryVideo {
  url: string;
  title: string;
  duration?: string;
}

/**
 * Python 互動控制項
 */
export interface PythonInput {
  label: string;
  variable: string;
  type: 'slider' | 'text' | 'select';
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

/**
 * Python 互動小程序
 */
export interface PythonDemo {
  title: string;
  code: string;
  inputs?: PythonInput[];
}

/**
 * 延伸資源類型
 */
export type StoryResourceType = 'article' | 'paper' | 'link';

/**
 * 延伸資源結構
 */
export interface StoryResource {
  type: StoryResourceType;
  url: string;
  title: string;
  source?: string;
}

/**
 * 真實世界應用故事結構
 */
export interface RealWorldStory {
  id: string | number;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  video?: StoryVideo;
  resources?: StoryResource[];
  pythonDemo?: PythonDemo;
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

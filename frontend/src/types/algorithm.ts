import type { AnimationStep, ComplexityInfo } from '@/types';

/**
 * 演算法完整配置
 */
export interface AlgorithmConfig {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  description: string;
  pseudoCode: string;
  complexity: ComplexityInfo;
  introduction: string;
  defaultData: any;
  createAnimationSteps: (
    data: any,
    action?: any,
    config?: any
  ) => AnimationStep[];
}

/**
 * 演算法類別
 */
// 關卡分類
export type AlgorithmCategory =
  | "data-structures"
  | "sorting"
  | "searching"
  | "graph";
/**
 * 演算法 ID
 */
export type AlgorithmId =
  | "selectionsort"
  | "insertionsort"
  | "bubblesort"
  | "binarysearch"
  | "linearsearch"
  | "prefixsum"
  | "slidingwindow"
  | "twopointers"
  | "fibonacci"
  | "knapsack";

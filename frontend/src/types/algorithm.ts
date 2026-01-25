import type { AnimationStep, ComplexityInfo } from './animation';

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
export type AlgorithmCategory = 'sorting' | 'searching' | 'graph' | 'tree' | 'dynamic-programming';

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

import { BaseElement } from '../modules/core/DataLogic/BaseElement';

/**
 * 動畫步驟資料結構
 */
export interface AnimationStep {
  stepNumber: number;
  description: string;
  elements: BaseElement[];
}

/**
 * 複雜度資訊
 */
export interface ComplexityInfo {
  timeBest: string;
  timeAverage: string;
  timeWorst: string;
  space: string;
}

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
  createAnimationSteps: () => AnimationStep[];
}

/**
 * 演算法類別
 */
export type AlgorithmCategory = 'sorting' | 'searching' | 'graph' | 'tree' | 'dynamic-programming';

/**
 * 演算法 ID
 */
export type AlgorithmId = 'quicksort' | 'mergesort' | 'bubblesort' | 'binarysearch' | 'linearsearch';

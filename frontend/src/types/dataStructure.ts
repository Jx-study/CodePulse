import { BaseElement } from "../modules/core/DataLogic/BaseElement";

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
 * 資料結構完整配置
 */
export interface DataStructureConfig {
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
 * 資料結構類別
 */
export type DataStructureCategory = "linear" | "nonlinear";

/**
 * 資料結構 ID
 */
export type DataStructureId =
  | "linkedlist"
  | "array"
  | "stack"
  | "queue"
  | "binarytree"
  | "graph";

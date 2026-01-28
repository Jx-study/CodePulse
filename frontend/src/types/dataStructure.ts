import type { AnimationStep, ComplexityInfo, CodeConfig } from './animation';

/**
 * 資料結構完整配置
 */
export interface DataStructureConfig {
  id: string;
  name: string;
  category: string;
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

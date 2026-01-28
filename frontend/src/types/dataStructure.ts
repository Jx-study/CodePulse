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
  pseudoCode: string; // 保持相容性，舊的純文字
  codeConfig?: CodeConfig; // 新增：結構化代碼配置
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

import { BaseElement } from "../modules/core/DataLogic/BaseElement";

/**
 * 動畫步驟資料結構
 */
export interface AnimationStep {
  stepNumber: number;
  description: string;
  elements: BaseElement[];
  actionTag?: string; // 新增：用於對應代碼高亮的標籤
}

/**
 * 代碼配置介面
 */
export interface CodeConfig {
  pseudo: {
    content: string;
    mappings: Record<string, number[]>; // actionTag -> 行號陣列 (0-based)
  };
  python: {
    content: string;
    mappings: Record<string, number[]>; // 預留
  };
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
  | "tree"
  | "graph";

import { BaseElement } from '../modules/core/DataLogic/BaseElement';

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
 * 複雜度資訊
 */
export interface ComplexityInfo {
  timeBest: string;
  timeAverage: string;
  timeWorst: string;
  space: string;
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
  };
}
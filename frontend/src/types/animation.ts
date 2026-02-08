import { BaseElement } from "../modules/core/DataLogic/BaseElement";

/**
 * 動畫步驟資料結構
 */
export interface AnimationStep {
  stepNumber: number;
  description: string;
  elements: BaseElement[];
  links?: {
    sourceId: string;
    targetId: string;
    status?: string;
  }[];
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

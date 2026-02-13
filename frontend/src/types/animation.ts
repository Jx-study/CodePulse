import { BaseElement } from "../modules/core/DataLogic/BaseElement";
import { linkStatus } from "@/modules/core/Render/D3Renderer";

/**
 * 動畫步驟資料結構
 */
export interface AnimationStep {
  stepNumber: number;
  description: string;
  elements: BaseElement[];
  actionTag?: string; // 用於對應代碼高亮的標籤
  variables?: Record<string, string | number | boolean | null>; // 變數狀態追蹤
  links?: {
    sourceId: string;
    targetId: string;
    status?: linkStatus;
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

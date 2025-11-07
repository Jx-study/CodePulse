import { DataStructureConfig } from "../../types/dataStructure";
import { linkedListConfig } from "./linear/LinkedList";
import { StackConfig } from "./linear/Stack";

/**
 * 所有資料結構配置的集合
 * 使用 category/dataStructure 作為 key
 */
export const dataStructuresMap: Record<string, DataStructureConfig> = {
  "linear/linkedlist": linkedListConfig,
  "linear/stack": StackConfig,
};

/**
 * 根據 subcategory 和 dataStructure 獲取資料結構配置
 * @param subcategory 資料結構類別（如 'linear', 'nonlinear'）
 * @param dataStructure 資料結構 ID（如 'quicksort', 'mergesort'）
 * @returns 資料結構配置，如果不存在則返回 null
 */
export function getDataStructureConfig(
  subcategory: string,
  dataStructure: string
): DataStructureConfig | null {
  const key = `${subcategory}/${dataStructure}`;
  return dataStructuresMap[key] || null;
}

/**
 * 獲取所有資料結構配置
 * @returns 所有資料結構配置的陣列
 */
export function getAlldataStructures(): DataStructureConfig[] {
  return Object.values(dataStructuresMap);
}

/**
 * 根據類別獲取資料結構列表
 * @param category 資料結構類別
 * @returns 該類別下的所有資料結構配置
 */
export function getdataStructuresByCategory(
  category: string
): DataStructureConfig[] {
  return Object.values(dataStructuresMap).filter(
    (config) => config.category === category
  );
}

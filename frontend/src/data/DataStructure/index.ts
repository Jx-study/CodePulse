import { DataStructureConfig } from '../../types/dataStructure';
import { linkedListConfig } from './List/LinkedList';

/**
 * 所有演算法配置的集合
 * 使用 category/algorithm 作為 key
 */
export const dataStructuresMap: Record<string, DataStructureConfig> = {
  'list/linkedlist': linkedListConfig,
};

/**
 * 根據 category 和 algorithm 獲取演算法配置
 * @param category 演算法類別（如 'sorting', 'searching'）
 * @param algorithm 演算法 ID（如 'quicksort', 'mergesort'）
 * @returns 演算法配置，如果不存在則返回 null
 */
export function getDataStructureConfig(
  category: string,
  algorithm: string
): DataStructureConfig | null {
  const key = `${category}/${algorithm}`;
  return dataStructuresMap[key] || null;
}

/**
 * 獲取所有演算法配置
 * @returns 所有演算法配置的陣列
 */
export function getAllAlgorithms(): DataStructureConfig[] {
  return Object.values(dataStructuresMap);
}

/**
 * 根據類別獲取演算法列表
 * @param category 演算法類別
 * @returns 該類別下的所有演算法配置
 */
export function getAlgorithmsByCategory(category: string): DataStructureConfig[] {
  return Object.values(dataStructuresMap).filter(
    (config) => config.category === category
  );
}

import { AlgorithmConfig } from "../../types/algorithm";
import { bubbleSortConfig } from "./sorting/bubbleSort";
import { selectionSortConfig } from "./sorting/selectionSort";
import { insertionSortConfig } from "./sorting/insertionSort";
import { binarySearchConfig } from "./searching/binarysearch";

/**
 * 所有演算法配置的集合
 * 使用 category/algorithm 作為 key
 */
export const algorithmsMap: Record<string, AlgorithmConfig> = {
  "sorting/bubblesort": bubbleSortConfig,
  "sorting/selectionsort": selectionSortConfig,
  "sorting/insertionsort": insertionSortConfig,
  "searching/binarysearch": binarySearchConfig,
};

/**
 * 根據 category 和 algorithm 獲取演算法配置
 * @param category 演算法類別（如 'sorting', 'searching'）
 * @param algorithm 演算法 ID（如 'bubblesort', 'selectionsort'）
 * @returns 演算法配置，如果不存在則返回 null
 */
export function getAlgorithmConfig(
  category: string,
  algorithm: string
): AlgorithmConfig | null {
  const key = `${category}/${algorithm}`;
  return algorithmsMap[key] || null;
}

/**
 * 獲取所有演算法配置
 * @returns 所有演算法配置的陣列
 */
export function getAllAlgorithms(): AlgorithmConfig[] {
  return Object.values(algorithmsMap);
}

/**
 * 根據類別獲取演算法列表
 * @param category 演算法類別
 * @returns 該類別下的所有演算法配置
 */
export function getAlgorithmsByCategory(category: string): AlgorithmConfig[] {
  return Object.values(algorithmsMap).filter(
    (config) => config.category === category
  );
}

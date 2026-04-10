import type { ImplementationMap } from "@/types/implementation";

// Import DataStructure Configs
import { ArrayConfig } from "../DataStructure/linear/Array/Array";
import { linkedListConfig } from "../DataStructure/linear/LinkedList/LinkedList";
import { StackConfig } from "../DataStructure/linear/Stack/Stack";
import { QueueConfig } from "../DataStructure/linear/Queue/Queue";
import { BinaryTreeConfig } from "../DataStructure/nonlinear/BinaryTree/BinaryTree";
import { BinarySearchTreeConfig } from "../DataStructure/nonlinear/BinarySearchTree/BinarySearchTree";
import { GraphConfig } from "../DataStructure/nonlinear/Graph/Graph";

// Import Algorithm Configs
import { bubbleSortConfig } from "../algorithms/sorting/bubbleSort";
import { selectionSortConfig } from "../algorithms/sorting/selectionSort";
import { insertionSortConfig } from "../algorithms/sorting/insertionSort";
import { mergeSortConfig } from "../algorithms/sorting/mergeSort";
import { binarySearchConfig } from "../algorithms/searching/binarySearch";
import { BFSConfig } from "../algorithms/searching/BFS";
import { DFSConfig } from "../algorithms/searching/DFS";
import { prefixSumConfig } from "../algorithms/technique/prefixSum";
import { slidingWindowConfig } from "../algorithms/technique/slidingWindow";
import { dijkstraConfig } from "../algorithms/searching/dijkstra";
import { knapsackConfig } from "../algorithms/dp/knapsack";
import { nQueensConfig } from "../algorithms/recursive/nQueens";
import { topologicalSortConfig } from "../algorithms/sorting/topologicalSort";

/**
 * 統一的實作註冊表
 * 整合所有資料結構和演算法的配置
 * 使用 implementationKey 作為 key，對應到 levels.json 中的 implementationKey
 */
export const implementationsMap: ImplementationMap = {
  // Data Structures
  array: ArrayConfig,
  linkedList: linkedListConfig,
  stack: StackConfig,
  queue: QueueConfig,
  binaryTree: BinaryTreeConfig,
  bst: BinarySearchTreeConfig,
  graph: GraphConfig,

  // Algorithms
  bubbleSort: bubbleSortConfig,
  selectionSort: selectionSortConfig,
  insertionSort: insertionSortConfig,
  mergeSort: mergeSortConfig,
  binarySearch: binarySearchConfig,
  bfs: BFSConfig,
  dfs: DFSConfig,
  prefixSum: prefixSumConfig,
  slidingWindow: slidingWindowConfig,
  dijkstra: dijkstraConfig,
  knapsack: knapsackConfig,
  nQueens: nQueensConfig,
  topologicalSort: topologicalSortConfig,
};

/**
 * 根據 implementationKey 獲取實作配置
 * @param implementationKey 實作 key（如 'array', 'bubblesort'）
 * @returns 實作配置，如果不存在則返回 null
 */
export function getImplementation(implementationKey: string) {
  return implementationsMap[implementationKey] || null;
}

/**
 * 獲取所有實作配置
 * @returns 所有實作配置的陣列
 */
export function getAllImplementations() {
  return Object.values(implementationsMap);
}

/**
 * 根據類型獲取實作列表
 * @param type 實作類型（'algorithm' 或 'dataStructure'）
 * @returns 該類型下的所有實作配置
 */
export function getImplementationsByType(type: "algorithm" | "dataStructure") {
  return Object.values(implementationsMap).filter(
    (config) => config.type === type,
  );
}

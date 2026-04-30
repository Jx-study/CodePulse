import type { AlgorithmId, AlgorithmMeta } from "../types/lab";

export const ALGORITHM_META: Record<AlgorithmId, AlgorithmMeta> = {
  bubbleSort: {
    id: "bubbleSort",
    label: "Bubble Sort",
    color: "#635bff",
    theoreticalComplexity: {
      random: "O(n²)",
      sorted: "O(n)",
      reversed: "O(n²)",
    },
  },
  selectionSort: {
    id: "selectionSort",
    label: "Selection Sort",
    color: "#00c4a7",
    theoreticalComplexity: {
      random: "O(n²)",
      sorted: "O(n²)",
      reversed: "O(n²)",
    },
  },
  insertionSort: {
    id: "insertionSort",
    label: "Insertion Sort",
    color: "#ff6b35",
    theoreticalComplexity: {
      random: "O(n²)",
      sorted: "O(n)",
      reversed: "O(n²)",
    },
  },
  mergeSort: {
    id: "mergeSort",
    label: "Merge Sort",
    color: "#e040fb",
    theoreticalComplexity: {
      random: "O(n log n)",
      sorted: "O(n log n)",
      reversed: "O(n log n)",
    },
  },
  quickSort: {
    id: "quickSort",
    label: "Quick Sort",
    color: "#ffc107",
    theoreticalComplexity: {
      random: "O(n log n)",
      sorted: "O(n²)",
      reversed: "O(n²)",
    },
  },
};

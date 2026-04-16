import type { AlgorithmId, AlgorithmMeta } from "../types/lab";



export const ALGORITHM_META: Record<AlgorithmId, AlgorithmMeta> = {

  bubbleSort: {

    id: "bubbleSort",

    label: "Bubble Sort",

    color: "#635bff",

  },

  selectionSort: {

    id: "selectionSort",

    label: "Selection Sort",

    color: "#00c4a7",

  },

  insertionSort: {

    id: "insertionSort",

    label: "Insertion Sort",

    color: "#ff6b35",

  },

  mergeSort: {

    id: "mergeSort",

    label: "Merge Sort",

    color: "#e040fb",

  },

  quickSort: {

    id: "quickSort",

    label: "Quick Sort",

    color: "#ffc107",

  },

};


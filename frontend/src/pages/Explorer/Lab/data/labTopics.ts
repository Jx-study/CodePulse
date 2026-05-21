import type { AlgorithmId, TopicId } from "../types/lab";

export const LAB_TOPICS: Record<
  TopicId,
  { id: TopicId; label: string; algorithms: AlgorithmId[] }
> = {
  sorting: {
    id: "sorting",
    label: "排序",
    algorithms: [
      "bubbleSort",
      "selectionSort",
      "insertionSort",
      "mergeSort",
      "quickSort",
    ],
  },
};

export const TOPIC_OPTIONS: { value: TopicId; label: string }[] = [
  { value: "sorting", label: "排序演算法" },
];

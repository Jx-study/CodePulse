import { AnimationStep, AlgorithmConfig } from "../../../types/algorithm";

export function createSelectionSortAnimationSteps(): AnimationStep[] {
  const steps: AnimationStep[] = [];
  return steps;
}

export const selectionSortConfig: AlgorithmConfig = {
  id: "selectionsort",
  name: "選擇排序",
  category: "sorting",
  categoryName: "排序演算法",
  description: "排序演算法",
  pseudoCode: `function selectionsort:
    return result`,
  complexity: {
    timeBest: "O(n log n)",
    timeAverage: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(n)",
  },
  introduction: `選擇排序是一種排序演算法。`,
  defaultData: [],
  createAnimationSteps: createSelectionSortAnimationSteps,
};

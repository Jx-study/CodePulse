import { AnimationStep, AlgorithmConfig } from "../../../types/algorithm";

export function createInsertionSortAnimationSteps(): AnimationStep[] {
  const steps: AnimationStep[] = [];
  return steps;
}

export const insertionSortConfig: AlgorithmConfig = {
  id: "insertionsort",
  name: "插入排序",
  category: "sorting",
  categoryName: "排序演算法",
  description: "排序演算法",
  pseudoCode: `return result`,
  complexity: {
    timeBest: "O(n log n)",
    timeAverage: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(n)",
  },
  introduction: `插入排序可以插入。`,
  defaultData: [],
  createAnimationSteps: createInsertionSortAnimationSteps,
};

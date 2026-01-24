import { AnimationStep, AlgorithmConfig } from "../../../types/algorithm";

export function createPrefixSumAnimationSteps(
  inputData: any[],
  action?: any
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  return steps;
}

export const prefixSumConfig: AlgorithmConfig = {
  id: "prefixsum",
  name: "前綴和 (Prefix Sum)",
  category: "technique",
  categoryName: "演算法",
  description: "演算法，適用於陣列",
  pseudoCode: `return -1`,
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(1)",
  },
  introduction: `資料是`,
  defaultData: [
    { id: "box-0", value: 10 },
    { id: "box-1", value: 25 },
    { id: "box-2", value: 32 },
    { id: "box-3", value: 42 },
  ],
  createAnimationSteps: createPrefixSumAnimationSteps,
};

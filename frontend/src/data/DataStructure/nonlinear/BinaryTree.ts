import { DataStructureConfig } from "@/types/dataStructure";
import { AnimationStep } from "@/types";
import { createTreeNodes } from "./utils";

export function createBinaryTreeAnimationSteps(
  inputData: any[], // 初始資料: [{id:1, val:1}, {id:2, val:2}]
  action?: any
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  const elements = createTreeNodes(inputData, { degree: 2 });

  // Step 0: 初始狀態
  steps.push({
    stepNumber: 0,
    description: `二元樹建立完成 (節點數: ${inputData.length})`,
    elements: elements,
  });

  return steps;
}

export const BinaryTreeConfig: DataStructureConfig = {
  id: "binarytree",
  name: "二元樹 (Binary Tree)",
  category: "nonlinear",
  categoryName: "非線性表",
  description: "每個節點可以有多個子節點的樹狀結構",
  pseudoCode: `class TreeNode:\n    val: int\n    children: List[TreeNode]`,
  complexity: {
    timeBest: "O(log n)",
    timeAverage: "O(log n)",
    timeWorst: "O(n)",
    space: "O(n)",
  },
  introduction: `在二元樹中，每個節點可以有兩個子節點。`,
  defaultData: [
    { id: "node-1", value: 1 },
    { id: "node-2", value: 2 },
    { id: "node-3", value: 3 },
    { id: "node-4", value: 4 },
    { id: "node-5", value: 5 },
    { id: "node-6", value: 6 },
    { id: "node-7", value: 7 },
  ],
  createAnimationSteps: createBinaryTreeAnimationSteps,
};

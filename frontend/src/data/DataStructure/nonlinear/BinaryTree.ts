import {
  AnimationStep,
  DataStructureConfig,
} from "../../../types/dataStructure";
import { createTreeNodes } from "./utils";

export function createBinaryTreeAnimationSteps(
  inputData: any[] // 初始資料: [{id:1, val:1}, {id:2, val:2}]
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  // === Step 0: 初始狀態 ===
  steps.push({
    stepNumber: 0,
    description: "初始二元樹",
    elements: createTreeNodes(inputData, { degree: 2 }),
  });

  // === 模擬插入一個新節點 (例如插入 3) ===
  // 1. 複製並修改資料 (Logic 層的操作)
  const newData = [
    ...inputData,
    { id: "node-11", value: 3 }, // 新增這個節點
  ];

  // 2. 呼叫 Utils 重新建構 (Utils 會自動算出新位置並接上 Pointer)
  const newElements = createTreeNodes(newData, { degree: 2 });

  // 3. 產生新的一幀
  steps.push({
    stepNumber: 1,
    description: "插入節點 3：樹狀結構自動重新排列",
    elements: newElements,
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
    timeBest: "O(log_k n)",
    timeAverage: "O(log_k n)",
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
    { id: "node-8", value: 8 },
    { id: "node-9", value: 9 },
    { id: "node-10", value: 10 },
  ],
  createAnimationSteps: createBinaryTreeAnimationSteps,
};

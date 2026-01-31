import { LevelImplementationConfig } from "@/types/implementation";
import { AnimationStep } from "@/types";
import { createTreeNodes } from "./utils";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Node } from "@/modules/core/DataLogic/Node";

// 1. 定義邏輯節點
interface LogicTreeNode {
  id: string;
  value: number;
  left?: LogicTreeNode;
  right?: LogicTreeNode;
}

// 2. 輔助函式：將線性資料轉為邏輯樹 (Level Order)
function buildLogicalTree(data: any[]): LogicTreeNode | null {
  if (data.length === 0) return null;
  const nodes = data.map((d) => ({ ...d }));
  const root = nodes[0];

  return root;
}

// 3. 輔助函式：產生 Frame
const generateFrame = (
  inputData: any[],
  statusMap: Record<string, Status>,
  description: string
): AnimationStep => {
  const treeElements = createTreeNodes(inputData, {
    degree: 2,
    width: 1000,
    height: 400,
    offsetX: 0,
    offsetY: 50,
  });

  // 根據 statusMap 更新節點顏色
  treeElements.forEach((el) => {
    if (el instanceof Node) {
      const status = statusMap[el.id] ? statusMap[el.id] : "inactive";
      el.setStatus(status);
    }
  });

  return {
    stepNumber: 0, // 外部會重算，這裡填 0 即可
    description,
    elements: [...treeElements],
  };
};

export function createBinarySearchTreeAnimationSteps(
  inputData: any[],
  action?: any
): AnimationStep[] {
  // 預設：只顯示初始結構
  const steps: AnimationStep[] = [];
  const elements = createTreeNodes(inputData, { degree: 2 });

  return steps;
}

export const BinarySearchTreeConfig: LevelImplementationConfig = {
  id: "bst",
  type: "dataStructure",
  name: "二元搜尋樹 (Binary Search Tree)",
  categoryName: "非線性表",
  description: "",
  pseudoCode: ``,
  complexity: {
    timeBest: "O(n)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(h)", // h 是樹高
  },
  introduction: ``,
  defaultData: [
    { id: "node-1", value: 1 },
    { id: "node-2", value: 2 },
    { id: "node-3", value: 3 },
    { id: "node-4", value: 4 },
    { id: "node-5", value: 5 },
    { id: "node-6", value: 6 },
    { id: "node-7", value: 7 },
  ],
  createAnimationSteps: createBinarySearchTreeAnimationSteps,
};

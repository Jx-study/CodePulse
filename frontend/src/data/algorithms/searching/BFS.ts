import type { AnimationStep } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";

export function createBFSAnimationSteps(
  inputData: any[],
  action?: any
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  return steps;
}

export const BFSConfig: LevelImplementationConfig = {
  id: "bfs",
  type: "algorithm",
  name: "廣度優先搜尋 (Breadth-First Search)",
  categoryName: "搜尋演算法",
  description: "廣度優先搜尋演算法，用於圖或樹的遍歷",
  pseudoCode: ``,
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(1)",
  },
  introduction: `廣度優先搜尋 (BFS) 是一種圖或樹的遍歷演算法，它從根節點開始，逐層遍歷所有節點。它使用佇列來管理待訪問的節點，確保每一層的節點都被訪問過一次。
BFS 的時間複雜度為 O(V + E)，其中 V 是節點數量，E 是邊數量。空間複雜度為 O(V)。`,
  defaultData: [
    { id: "node-0", value: 10 },
    { id: "node-1", value: 25 },
    { id: "node-2", value: 32 },
    { id: "node-3", value: 42 },
    { id: "node-4", value: 55 },
    { id: "node-5", value: 68 },
    { id: "node-6", value: 73 },
    { id: "node-7", value: 89 },
    { id: "node-8", value: 95 },
  ],
  createAnimationSteps: createBFSAnimationSteps,
};

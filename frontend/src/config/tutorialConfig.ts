import { ImplementationId } from "@/types";
// 教學內容配置
export interface TutorialItem {
  id: ImplementationId;
  name: string;
  description: string;
  difficulty: number;
  category: string;
  categoryName: string;
}

// 分類配置
export const CATEGORIES = {
  sorting: {
    id: "sorting",
    name: "排序演算法",
    path: "/dashboard?category=sorting",
  },
  searching: {
    id: "searching",
    name: "搜尋演算法",
    path: "/dashboard?category=searching",
  },
  dp: {
    id: "dynamic-programming",
    name: "動態規劃 (DP)",
    path: "/dashboard?category=dynamic-programming",
  },
  technique: {
    id: "technique",
    name: "演算法技巧 (Techniques)",
    path: "/dashboard?category=technique",
  },
  recursive: {
    id: "recursive",
    name: "遞迴 (Recursion)",
    path: "/dashboard?category=recursive",
  },
  datastructure: {
    id: "datastructure",
    name: "資料結構",
    path: "/dashboard?category=datastructure",
    subcategories: {
      linear: {
        id: "linear",
        name: "線性資料結構",
      },
      nonlinear: {
        id: "nonlinear",
        name: "非線性資料結構",
      },
      hashing: {
        id: "hashing",
        name: "雜湊結構",
      },
    },
  },
};

// 教學內容映射
export const TUTORIALS: Record<string, Record<string, TutorialItem>> = {
  sorting: {
    bubblesort: {
      id: "bubblesort",
      name: "泡沫排序",
      description: "基礎排序演算法",
      difficulty: 1,
      category: "sorting",
      categoryName: "排序演算法",
    },
    selectionsort: {
      id: "selectionsort",
      name: "選擇排序",
      description: "排序",
      difficulty: 2,
      category: "sorting",
      categoryName: "排序演算法",
    },
    insertionsort: {
      id: "insertionsort",
      name: "插入排序",
      description: "排序",
      difficulty: 2,
      category: "sorting",
      categoryName: "排序演算法",
    },
  },
  searching: {
    binarysearch: {
      id: "binarysearch",
      name: "二分搜尋",
      description: "高效搜尋演算法",
      difficulty: 2,
      category: "searching",
      categoryName: "搜尋演算法",
    },
  },
  technique: {
    prefixsum: {
      id: "prefixsum",
      name: "前綴和 (Prefix Sum)",
      description: "快速計算區間和",
      difficulty: 1,
      category: "technique",
      categoryName: "演算法技巧",
    },
    slidingwindow: {
      id: "slidingwindow",
      name: "滑動窗口 (Sliding Window)",
      description: "處理連續子陣列問題",
      difficulty: 2,
      category: "technique",
      categoryName: "演算法技巧",
    },
    twopointers: {
      id: "twopointers",
      name: "雙指標 (Two Pointers)",
      description: "遍歷陣列的高效技巧",
      difficulty: 2,
      category: "technique",
      categoryName: "演算法技巧",
    },
  },
  "dynamic-programming": {
    fibonacci: {
      id: "fibonacciDP",
      name: "費氏數列 (Fibonacci)",
      description: "DP 的入門磚",
      difficulty: 1,
      category: "dynamic-programming",
      categoryName: "動態規劃",
    },
    knapsack: {
      id: "knapsack",
      name: "背包問題 (Knapsack)",
      description: "經典 DP 問題",
      difficulty: 3,
      category: "dynamic-programming",
      categoryName: "動態規劃",
    },
  },
  recursive: {
    "n-queens": {
      id: "n-queens",
      name: "N 皇后問題",
      description: "在 NxN 的棋盤上放置 N 個皇后，使得她們互不攻擊。",
      difficulty: 5,
      category: "recursive",
      categoryName: "遞迴",
    },
  },
  datastructure: {
    linkedlist: {
      id: "linkedlist",
      name: "鏈結串列 (Linked List)",
      description: "動態資料結構基礎",
      difficulty: 2,
      category: "datastructure",
      categoryName: "資料結構",
    },
    stack: {
      id: "stack",
      name: "堆疊 (Stack)",
      description: "後進先出資料結構",
      difficulty: 1,
      category: "datastructure",
      categoryName: "資料結構",
    },
    queue: {
      id: "queue",
      name: "佇列 (Queue)",
      description: "先進先出資料結構",
      difficulty: 1,
      category: "datastructure",
      categoryName: "資料結構",
    },
  },
};

// 獲取教學內容
export function getTutorialData(
  category: string,
  algorithm: string,
): TutorialItem | null {
  return TUTORIALS[category]?.[algorithm] || null;
}

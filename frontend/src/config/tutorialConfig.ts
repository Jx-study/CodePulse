// 教學內容配置
export interface TutorialItem {
  id: string;
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
    mergesort: {
      id: "mergesort",
      name: "合併排序",
      description: "穩定的分治排序",
      difficulty: 3,
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
  algorithm: string
): TutorialItem | null {
  return TUTORIALS[category]?.[algorithm] || null;
}

// 獲取分類名稱
export function getCategoryName(category: string): string {
  return CATEGORIES[category as keyof typeof CATEGORIES]?.name || category;
}

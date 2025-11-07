import { Box } from '../../../modules/core/DataLogic/Box';
import { Status } from '../../../modules/core/DataLogic/BaseElement';
import { AnimationStep, AlgorithmConfig } from '../../../types/algorithm';

/**
 * 創建二分搜尋的動畫步驟
 */
export function createBinarySearchAnimationSteps(): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const values = [1, 3, 5, 7, 9, 11, 13, 15, 17];
  const target = 11;

  // Helper: 創建 box 元素
  const createBoxes = (statusMap: { [id: string]: Status } = {}) => {
    return values.map((value, i) => {
      const box = new Box();
      box.id = `box-${i}`;
      box.moveTo(100 + i * 70, 200);
      box.width = 50;
      box.height = 50;
      box.value = value;
      box.description = `${value}`;
      box.setStatus(statusMap[box.id] || 'unfinished');
      return box;
    });
  };

  // Step 1: 初始狀態
  steps.push({
    stepNumber: 1,
    description: `尋找目標值 ${target}，初始陣列（已排序）`,
    elements: createBoxes(),
  });

  // Step 2: 設定左右邊界
  steps.push({
    stepNumber: 2,
    description: '設定左邊界 left=0，右邊界 right=8',
    elements: createBoxes({
      'box-0': 'prepare',
      'box-8': 'prepare',
    }),
  });

  // Step 3: 計算中間值
  steps.push({
    stepNumber: 3,
    description: '計算中間位置 mid=4，檢查 arr[4]=9',
    elements: createBoxes({
      'box-0': 'prepare',
      'box-4': 'target',
      'box-8': 'prepare',
    }),
  });

  // Step 4: 比較並調整範圍
  steps.push({
    stepNumber: 4,
    description: `9 < ${target}，目標在右半部，設定 left=5`,
    elements: createBoxes({
      'box-0': 'complete',
      'box-1': 'complete',
      'box-2': 'complete',
      'box-3': 'complete',
      'box-4': 'complete',
      'box-5': 'prepare',
      'box-8': 'prepare',
    }),
  });

  // Step 5: 新的中間值
  steps.push({
    stepNumber: 5,
    description: '計算新的中間位置 mid=6，檢查 arr[6]=13',
    elements: createBoxes({
      'box-0': 'complete',
      'box-1': 'complete',
      'box-2': 'complete',
      'box-3': 'complete',
      'box-4': 'complete',
      'box-5': 'prepare',
      'box-6': 'target',
      'box-8': 'prepare',
    }),
  });

  // Step 6: 再次調整範圍
  steps.push({
    stepNumber: 6,
    description: `13 > ${target}，目標在左半部，設定 right=5`,
    elements: createBoxes({
      'box-0': 'complete',
      'box-1': 'complete',
      'box-2': 'complete',
      'box-3': 'complete',
      'box-4': 'complete',
      'box-5': 'prepare',
      'box-6': 'complete',
      'box-7': 'complete',
      'box-8': 'complete',
    }),
  });

  // Step 7: 找到目標
  steps.push({
    stepNumber: 7,
    description: `計算中間位置 mid=5，檢查 arr[5]=${target}`,
    elements: createBoxes({
      'box-0': 'complete',
      'box-1': 'complete',
      'box-2': 'complete',
      'box-3': 'complete',
      'box-4': 'complete',
      'box-5': 'target',
      'box-6': 'complete',
      'box-7': 'complete',
      'box-8': 'complete',
    }),
  });

  // Step 8: 完成
  steps.push({
    stepNumber: 8,
    description: `找到目標值 ${target}，位於索引 5`,
    elements: createBoxes({
      'box-0': 'complete',
      'box-1': 'complete',
      'box-2': 'complete',
      'box-3': 'complete',
      'box-4': 'complete',
      'box-5': 'complete',
      'box-6': 'complete',
      'box-7': 'complete',
      'box-8': 'complete',
    }),
  });

  return steps;
}

/**
 * 二分搜尋演算法配置
 */
export const binarySearchConfig: AlgorithmConfig = {
  id: 'binarysearch',
  name: '二分搜尋',
  category: 'searching',
  categoryName: '搜尋演算法',
  description: '高效的搜尋演算法，適用於已排序陣列',
  pseudoCode: `function binarySearch(arr, target):
    left = 0
    right = length of arr - 1

    while left <= right:
        mid = (left + right) / 2

        if arr[mid] == target:
            return mid
        else if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1  // 未找到`,
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(log n)',
    timeWorst: 'O(log n)',
    space: 'O(1)',
  },
  introduction: `二分搜尋是一種高效的搜尋演算法，用於在已排序的陣列中尋找特定元素。
它的核心思想是每次將搜尋範圍縮小一半，通過比較中間元素與目標值來決定接下來要搜尋左半部還是右半部。
由於每次都將搜尋範圍減半，因此時間複雜度為 O(log n)，比線性搜尋的 O(n) 快得多。`,
  createAnimationSteps: createBinarySearchAnimationSteps,
};

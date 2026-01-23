import { Box } from '@/modules/core/DataLogic/Box';
import type { AnimationStep, AlgorithmConfig } from '@/types';
import type { Status } from '@/modules/core/DataLogic/BaseElement';

/**
 * 創建合併排序的動畫步驟
 */
export function createMergeSortAnimationSteps(): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const values = [8, 3, 5, 1, 6];

  // Helper: 創建 box 元素
  const createBoxes = (
    customValues: number[] = values,
    statusMap: Record<string, Status> = {},
    xOffset: number = 150
  ) => {
    return customValues.map((value, i) => {
      const box = new Box();
      box.id = `box-${i}`;
      box.moveTo(xOffset + i * 80, 200);
      box.width = 60;
      box.height = 60;
      box.value = value;
      box.description = `${value}`;
      box.setStatus(statusMap[box.id] ?? 'unfinished');
      return box;
    });
  };

  // Step 1: 初始狀態
  steps.push({
    stepNumber: 1,
    description: '初始陣列 [8, 3, 5, 1, 6]',
    elements: createBoxes(),
  });

  // Step 2: 第一次分割
  steps.push({
    stepNumber: 2,
    description: '將陣列分成兩半：[8, 3, 5] 和 [1, 6]',
    elements: createBoxes(values, {
      'box-0': 'prepare',
      'box-1': 'prepare',
      'box-2': 'prepare',
      'box-3': 'target',
      'box-4': 'target',
    }),
  });

  // Step 3: 繼續分割左半部
  steps.push({
    stepNumber: 3,
    description: '分割左半部：[8] [3, 5]',
    elements: createBoxes(values, {
      'box-0': 'target',
      'box-1': 'prepare',
      'box-2': 'prepare',
    }),
  });

  // Step 4: 分割右半部
  steps.push({
    stepNumber: 4,
    description: '繼續分割：[8] [3] [5]',
    elements: createBoxes(values, {
      'box-0': 'target',
      'box-1': 'target',
      'box-2': 'target',
    }),
  });

  // Step 5: 開始合併
  steps.push({
    stepNumber: 5,
    description: '合併 [3] 和 [5] → [3, 5]',
    elements: createBoxes([8, 3, 5, 1, 6], {
      'box-1': 'complete',
      'box-2': 'complete',
    }),
  });

  // Step 6: 合併左半部
  steps.push({
    stepNumber: 6,
    description: '合併 [8] 和 [3, 5] → [3, 5, 8]',
    elements: createBoxes([3, 5, 8, 1, 6], {
      'box-0': 'complete',
      'box-1': 'complete',
      'box-2': 'complete',
    }),
  });

  // Step 7: 處理右半部
  steps.push({
    stepNumber: 7,
    description: '右半部 [1, 6] 已經是有序的',
    elements: createBoxes([3, 5, 8, 1, 6], {
      'box-0': 'complete',
      'box-1': 'complete',
      'box-2': 'complete',
      'box-3': 'complete',
      'box-4': 'complete',
    }),
  });

  // Step 8: 最終合併
  steps.push({
    stepNumber: 8,
    description: '最終合併：[3, 5, 8] 和 [1, 6] → [1, 3, 5, 6, 8]',
    elements: createBoxes([1, 3, 5, 6, 8], {
      'box-0': 'complete',
      'box-1': 'complete',
      'box-2': 'complete',
      'box-3': 'complete',
      'box-4': 'complete',
    }),
  });

  return steps;
}

/**
 * 合併排序演算法配置
 */
export const mergeSortConfig: AlgorithmConfig = {
  id: 'mergesort',
  name: '合併排序',
  category: 'sorting',
  categoryName: '排序演算法',
  description: '穩定的分治排序演算法',
  pseudoCode: `function mergeSort(arr):
    if length of arr <= 1:
        return arr

    mid = length of arr / 2
    left = mergeSort(arr[0...mid])
    right = mergeSort(arr[mid...end])

    return merge(left, right)

function merge(left, right):
    result = []
    i = 0, j = 0

    while i < length of left and j < length of right:
        if left[i] <= right[j]:
            result.append(left[i])
            i = i + 1
        else:
            result.append(right[j])
            j = j + 1

    append remaining elements from left or right
    return result`,
  complexity: {
    timeBest: 'O(n log n)',
    timeAverage: 'O(n log n)',
    timeWorst: 'O(n log n)',
    space: 'O(n)',
  },
  introduction: `合併排序是一種穩定的排序演算法，同樣採用分治法策略。
它將陣列不斷分割成較小的子陣列，直到每個子陣列只有一個元素，然後將這些子陣列兩兩合併，
在合併過程中進行排序。合併排序的時間複雜度在所有情況下都是 O(n log n)，是一種性能穩定的排序方法。`,
  createAnimationSteps: createMergeSortAnimationSteps,
};

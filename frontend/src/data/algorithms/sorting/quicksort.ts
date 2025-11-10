import { Box } from '../../../modules/core/DataLogic/Box';
import { Status } from '../../../modules/core/DataLogic/BaseElement';
import { AnimationStep, AlgorithmConfig } from '../../../types/algorithm';

/**
 * 創建快速排序的動畫步驟
 */
export function createQuickSortAnimationSteps(): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const values = [5, 2, 8, 1, 9];

  // Helper: 創建 box 元素
  const createBoxes = (statusMap: { [id: string]: Status } )=> {
    return values.map((value, i) => {
      const box = new Box();
      box.id = `box-${i}`;
      box.moveTo(150 + i * 80, 200);
      box.width = 60;
      box.height = 60;
      box.value = value;
      box.description = `${value}`;
      box.setStatus(statusMap[box.id] || 'unfinished');
      return box;
    });
  };

  // Step 1: 初始狀態
  steps.push({
    stepNumber: 1,
    description: '初始陣列',
    elements: createBoxes({}),
  });

  // Step 2: 選擇 pivot
  steps.push({
    stepNumber: 2,
    description: '選擇 pivot = 9（最右邊的元素）',
    elements: createBoxes({ 'box-4': 'target' }),
  });

  // Step 3: 開始分割
  steps.push({
    stepNumber: 3,
    description: '比較第一個元素 5 與 pivot 9',
    elements: createBoxes({ 'box-4': 'target', 'box-0': 'prepare' }),
  });

  // Step 4: 繼續比較
  steps.push({
    stepNumber: 4,
    description: '5 < 9，標記為完成，檢查下一個',
    elements: createBoxes({
      'box-4': 'target',
      'box-0': 'complete',
      'box-1': 'prepare',
    }),
  });

  // Step 5: 比較 2
  steps.push({
    stepNumber: 5,
    description: '2 < 9，標記為完成，檢查下一個',
    elements: createBoxes({
      'box-4': 'target',
      'box-0': 'complete',
      'box-1': 'complete',
      'box-2': 'prepare',
    }),
  });

  // Step 6: 比較 8
  steps.push({
    stepNumber: 6,
    description: '8 < 9，標記為完成，檢查下一個',
    elements: createBoxes({
      'box-4': 'target',
      'box-0': 'complete',
      'box-1': 'complete',
      'box-2': 'complete',
      'box-3': 'prepare',
    }),
  });

  // Step 7: 比較 1
  steps.push({
    stepNumber: 7,
    description: '1 < 9，所有元素都小於 pivot',
    elements: createBoxes({
      'box-4': 'target',
      'box-0': 'complete',
      'box-1': 'complete',
      'box-2': 'complete',
      'box-3': 'complete',
    }),
  });

  // Step 8: 完成分割
  steps.push({
    stepNumber: 8,
    description: '第一輪分割完成，pivot 就位',
    elements: createBoxes({
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
 * 快速排序演算法配置
 */
export const quickSortConfig: AlgorithmConfig = {
  id: 'quicksort',
  name: '快速排序',
  category: 'sorting',
  categoryName: '排序演算法',
  description: '高效的分治排序演算法',
  pseudoCode: `function quickSort(arr, left, right):
    if left < right:
        pivotIndex = partition(arr, left, right)
        quickSort(arr, left, pivotIndex - 1)
        quickSort(arr, pivotIndex + 1, right)

function partition(arr, left, right):
    pivot = arr[right]
    i = left - 1
    for j = left to right - 1:
        if arr[j] <= pivot:
            i = i + 1
            swap arr[i] and arr[j]
    swap arr[i + 1] and arr[right]
    return i + 1`,
  complexity: {
    timeBest: 'O(n log n)',
    timeAverage: 'O(n log n)',
    timeWorst: 'O(n²)',
    space: 'O(log n)',
  },
  introduction: `快速排序是一種高效的排序演算法，採用分治法（Divide and Conquer）策略。
它的核心思想是選擇一個基準值（pivot），將陣列分為兩部分：小於基準值的元素和大於基準值的元素，
然後遞迴地對這兩部分進行排序。`,
  createAnimationSteps: createQuickSortAnimationSteps,
};

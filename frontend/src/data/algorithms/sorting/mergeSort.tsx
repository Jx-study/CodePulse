import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { LinearData } from "@/data/DataStructure/linear/utils";
import { SortingActionBar } from "./SortingActionBar";
import { cloneData } from "@/modules/core/visualization/visualizationUtils";
import { DATA_LIMITS } from "@/constants/dataLimits";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";

function mergeSortActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: LinearData[],
  context: ActionContext,
): ActionResult<LinearData[]> | null {
  if (actionType === "random") {
    const count =
      (payload.randomCount as number) ?? DATA_LIMITS.DEFAULT_RANDOM_COUNT;
    const values = Array.from(
      { length: count },
      () => Math.floor(Math.random() * 100) - 20,
    );
    const newData = values.map((v) => ({
      id: context.nextId(),
      value: v,
    }));
    return { animationData: newData, isResetAction: true };
  }

  if (actionType === "load") {
    const values = payload.data as number[];
    if (!values?.length) return null;
    const newData = values.map((v) => ({
      id: context.nextId(),
      value: v,
    }));
    return { animationData: newData, isResetAction: true };
  }

  if (actionType === "reset") {
    const defaultData = (context.defaultData as LinearData[]) ?? data;
    return { animationData: cloneData(defaultData), isResetAction: true };
  }

  if (actionType === "run") {
    return { animationData: cloneData(data) };
  }

  return null;
}

const TAGS = {
  INIT: "INIT",
  IF_RETURN: "IF_RETURN",
  DIVIDE: "DIVIDE",
  MERGE_START: "MERGE_START",
  COMPARE: "COMPARE",
  LEFT_COPY: "LEFT_COPY",
  RIGHT_COPY: "RIGHT_COPY",
  REMAINING: "REMAINING",
  DONE: "DONE",
};

interface TrackedItem {
  id: string;
  value: number;
  x: number;
  y: number;
  description: string;
  status: Status;
}

const generateFrame = (items: TrackedItem[]) => {
  return items.map((item) => {
    const box = new Box();
    box.id = item.id;
    box.value = String(item.value);
    box.moveTo(item.x, item.y);
    box.width = 50;
    box.height = 50;
    box.description = item.description;
    box.setStatus(item.status);
    box.autoScale = true;
    return box;
  });
};

export function createMergeSortAnimationSteps(
  inputData: LinearData[],
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const startX = 50;
  const baseY = 150;
  const gap = 70;
  const yOffset = 40; // 每一層深度下降的 Y 軸距離

  const currentItems: TrackedItem[] = inputData.map((d, i) => ({
    id: d.id,
    value: Number(d.value),
    description: String(i),
    x: startX + i * gap,
    y: baseY,
    status: Status.Unfinished,
  }));

  const addStep = (desc: string, tag: string, vars: any = {}) => {
    steps.push({
      stepNumber: steps.length,
      description: desc,
      actionTag: tag,
      local_vars: vars,
      elements: generateFrame(currentItems) as any,
    });
  };

  addStep("開始合併排序 (Merge Sort)", TAGS.INIT);

  if (currentItems.length <= 1) {
    addStep(`剩餘元素數量為 1，直接返回`, TAGS.IF_RETURN, {
      chosenVal: currentItems[0].value,
    });
    return steps;
  }

  // 遞迴主程式
  const mergeSort = (
    items: TrackedItem[],
    depth: number,
    startIndex: number,
  ): TrackedItem[] => {
    if (items.length <= 1) {
      addStep(`剩餘元素數量為 1，直接返回`, TAGS.IF_RETURN, {
        chosenVal: items[0].value,
      });
      return items;
    }

    const mid = Math.floor(items.length / 2);
    const leftHalf = items.slice(0, mid);
    const rightHalf = items.slice(mid);

    // 視覺化：分割陣列並將它們往下推一層，description 重設為本地 index
    leftHalf.forEach((item, i) => {
      item.y = baseY + depth * yOffset;
      item.description = String(i);
    });
    rightHalf.forEach((item, i) => {
      item.y = baseY + depth * yOffset;
      item.description = String(i);
    });

    addStep(`將陣列分割為左右兩半並往下層遞迴 (深度: ${depth})`, TAGS.DIVIDE, {
      depth,
      start: startIndex,
      end: startIndex + items.length - 1,
    });

    // 遞迴左右兩邊
    const sortedLeft = mergeSort(leftHalf, depth + 1, startIndex);
    const sortedRight = mergeSort(rightHalf, depth + 1, startIndex + mid);

    // 合併
    return merge(sortedLeft, sortedRight, depth, startIndex);
  };

  // 合併主程式
  const merge = (
    left: TrackedItem[],
    right: TrackedItem[],
    depth: number,
    startIndex: number,
  ): TrackedItem[] => {
    const merged: TrackedItem[] = [];
    let i = 0;
    let j = 0;

    addStep(
      `準備將兩個已排序子陣列合併 (準備回到深度: ${depth - 1})`,
      TAGS.MERGE_START,
      { depth },
    );

    while (i < left.length && j < right.length) {
      left[i].status = Status.Prepare;
      right[j].status = Status.Prepare;
      addStep(`比較大小：${left[i].value} 與 ${right[j].value}`, TAGS.COMPARE, {
        leftVal: left[i].value,
        rightVal: right[j].value,
      });

      let chosen: TrackedItem;
      let copyTag: string;
      if (left[i].value <= right[j].value) {
        chosen = left[i];
        left[i].status = depth === 1 ? Status.Complete : Status.Target; // 如果是最後一層，標記為完成
        right[j].status = Status.Unfinished;
        i++;
        copyTag = TAGS.LEFT_COPY;
      } else {
        chosen = right[j];
        right[j].status = depth === 1 ? Status.Complete : Status.Target;
        left[i].status = Status.Unfinished;
        j++;
        copyTag = TAGS.RIGHT_COPY;
      }

      // 決定被選中的元素的新座標 (回到上一層 depth - 1，X 依據 merged.length 計算)
      chosen.x = startX + (startIndex + merged.length) * gap;
      chosen.y = baseY + (depth - 1) * yOffset;
      chosen.description = String(merged.length);
      merged.push(chosen);

      addStep(`選擇較小值 ${chosen.value} 並放入合併陣列`, copyTag, {
        chosenVal: chosen.value,
      });

      if (depth !== 1) chosen.status = Status.Unfinished; // 還沒到最頂層的話，復原顏色
    }

    // 處理左邊剩下的元素
    while (i < left.length) {
      const chosen = left[i];
      chosen.status = depth === 1 ? Status.Complete : Status.Target;
      chosen.x = startX + (startIndex + merged.length) * gap;
      chosen.y = baseY + (depth - 1) * yOffset;
      chosen.description = String(merged.length);
      merged.push(chosen);
      addStep(`將左側剩餘的 ${chosen.value} 放入合併陣列`, TAGS.REMAINING, {
        chosenVal: chosen.value,
      });
      if (depth !== 1) chosen.status = Status.Unfinished;
      i++;
    }

    // 處理右邊剩下的元素
    while (j < right.length) {
      const chosen = right[j];
      chosen.status = depth === 1 ? Status.Complete : Status.Target;
      chosen.x = startX + (startIndex + merged.length) * gap;
      chosen.y = baseY + (depth - 1) * yOffset;
      chosen.description = String(merged.length);
      merged.push(chosen);
      addStep(`將右側剩餘的 ${chosen.value} 放入合併陣列`, TAGS.REMAINING, {
        chosenVal: chosen.value,
      });
      if (depth !== 1) chosen.status = Status.Unfinished;
      j++;
    }

    return merged;
  };

  // 觸發遞迴 (起始深度設為 1，原本在深度 0)
  mergeSort(currentItems, 1, 0);

  // 最終步驟全轉為 Complete
  currentItems.forEach((item) => (item.status = Status.Complete));
  addStep("合併排序完成！", TAGS.DONE, { isSorted: true });

  return steps;
}

const mergeSortCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure MergeSort(collection):
  If length of collection ≤ 1 Then
    Return collection
  End If

  mid ← length of collection / 2
  left ← MergeSort(collection[0 to mid-1])
  right ← MergeSort(collection[mid to end])

  Return Merge(left, right)
End Procedure

Procedure Merge(left, right):
  result ← empty list
  leftIndex ← 0
  rightIndex ← 0
  While left is not empty And right is not empty Do
    If left[leftIndex] ≤ right[rightIndex] Then
      append left[leftIndex] to result
      remove first element from left
      leftIndex ← leftIndex + 1
    Else
      append right[rightIndex] to result
      remove first element from right
      rightIndex ← rightIndex + 1
    End If
  End While

  append remaining elements of left to result
  append remaining elements of right to result

  Return result
End Procedure`,
    mappings: {
      [TAGS.INIT]: [1],
      [TAGS.IF_RETURN]: [2, 3, 4],
      [TAGS.DIVIDE]: [6, 7, 8],
      [TAGS.MERGE_START]: [13, 14, 15, 16],
      [TAGS.COMPARE]: [17, 18, 22],
      [TAGS.LEFT_COPY]: [19, 20, 21],
      [TAGS.RIGHT_COPY]: [23, 24, 25],
      [TAGS.REMAINING]: [29, 30],
      [TAGS.DONE]: [32],
    },
  },
  python: {
    content: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
        
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
            
    result.extend(left[i:])
    result.extend(right[j:])
    
    return result`,
  },
};

export const mergeSortConfig: LevelImplementationConfig = {
  id: "mergesort",
  type: "algorithm",
  name: "合併排序 (Merge Sort)",
  categoryName: "排序演算法",
  description: "使用分治法將陣列切割成最小單位，再依序合併排序。",
  codeConfig: mergeSortCodeConfig,
  complexity: {
    timeBest: "O(n log n)",
    timeAverage: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(n)",
  },
  introduction: `合併排序（Merge Sort）是典型的分治法（Divide and Conquer）應用。
它將陣列從中間一分為二，持續切割直到每個子陣列只剩一個元素，接著將這些子陣列兩兩合併，在合併的過程中將它們排序好，最後合併成一個完整的已排序陣列。`,
  defaultData: [
    { id: "box-0", value: 38 },
    { id: "box-1", value: 27 },
    { id: "box-2", value: 43 },
    { id: "box-3", value: 3 },
    { id: "box-4", value: 9 },
    { id: "box-5", value: 82 },
    { id: "box-6", value: 10 },
  ],
  createAnimationSteps: createMergeSortAnimationSteps,
  actionHandler: mergeSortActionHandler,
  renderActionBar: (props) => <SortingActionBar {...(props as any)} />,
  relatedProblems: [
    {
      id: 912,
      title: "Sort an Array",
      concept: "基礎排序：適合用 Merge Sort 實現 O(n log n) 時間複雜度",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/sort-an-array/",
    },
    {
      id: 23,
      title: "Merge k Sorted Lists",
      concept: "Merge 過程的延伸應用",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/merge-k-sorted-lists/",
    },
  ],
  maxNodes: 20,
};

import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";

import { HeapActionBar } from "./HeapActionBar";
import { TAGS } from "./heap/tags";
import { simulateHeapTrace } from "./heap/simulateTrace";
import { heapTraceToSteps } from "./heap/traceToSteps";

const baseActionHandler = createLinearActionHandler();

export function heapActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: any[],
  context: ActionContext,
): ActionResult<any[]> | null {
  const newData = [...data];
  const oldData = [...data]; // 記下沒變動前的狀態交給 Trace 模擬

  if (actionType === "peek") {
    return {
      animationData: newData,
      animationParams: { isHeapAction: true, heapType: "peek", oldData },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if (actionType === "heapify") {
    // 執行標準 Bottom-up 建堆演算法，改變 newData 的狀態
    for (let i = Math.floor(newData.length / 2) - 1; i >= 0; i--) {
      let idx = i;
      while (true) {
        let left = 2 * idx + 1,
          right = 2 * idx + 2,
          largest = idx;
        if (
          left < newData.length &&
          newData[left].value > newData[largest].value
        )
          largest = left;
        if (
          right < newData.length &&
          newData[right].value > newData[largest].value
        )
          largest = right;
        if (largest !== idx) {
          const temp = newData[idx];
          newData[idx] = newData[largest];
          newData[largest] = temp;
          idx = largest;
        } else break;
      }
    }
    return {
      animationData: newData,
      animationParams: { isHeapAction: true, heapType: "heapify", oldData },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if (actionType === "add") {
    const value = payload.value as number;
    const targetId = context.nextId();
    newData.push({ id: targetId, value });

    let idx = newData.length - 1;
    while (idx > 0) {
      const p = Math.floor((idx - 1) / 2);
      if (newData[idx].value > newData[p].value) {
        const temp = newData[idx];
        newData[idx] = newData[p];
        newData[p] = temp;
        idx = p;
      } else break;
    }

    return {
      animationData: newData,
      animationParams: {
        isHeapAction: true,
        heapType: "add",
        value,
        targetId,
        oldData,
      },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if (actionType === "delete") {
    if (newData.length === 0) return null;
    const extractedVal = newData[0].value;

    if (newData.length > 1) {
      newData[0] = newData[newData.length - 1];
      newData.pop();
      let idx = 0;
      while (true) {
        let left = 2 * idx + 1,
          right = 2 * idx + 2,
          largest = idx;
        if (
          left < newData.length &&
          newData[left].value > newData[largest].value
        )
          largest = left;
        if (
          right < newData.length &&
          newData[right].value > newData[largest].value
        )
          largest = right;
        if (largest !== idx) {
          const temp = newData[idx];
          newData[idx] = newData[largest];
          newData[largest] = temp;
          idx = largest;
        } else break;
      }
    } else {
      newData.pop();
    }

    return {
      animationData: newData,
      animationParams: {
        isHeapAction: true,
        heapType: "delete",
        value: extractedVal,
        oldData,
      },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  return baseActionHandler(actionType, payload, data, context);
}

export function createHeapAnimationSteps(
  dataList: any[],
  action?: any,
): AnimationStep[] {
  const params = action?.isHeapAction ? action : action?.animationParams;

  // 如果是 Insert 或 Extract，取用 oldData 與參數讓 Trace 自己跑
  if (params && params.isHeapAction) {
    const trace = simulateHeapTrace(params.oldData, params);
    return heapTraceToSteps(trace);
  }

  // 如果是初始化 (INIT)、Random 或 Reset，直接畫出最終陣列即可
  const trace = simulateHeapTrace(dataList, { heapType: "init" });
  return heapTraceToSteps(trace);
}

const heapCodeConfig: CodeConfig = {
  pseudo: {
    content: `Class MaxHeap:
  Procedure Insert(value):
    array.push(value)
    HeapifyUp(array.length - 1)

  Procedure ExtractMax():
    maxValue ← array[0]
    array[0] ← array.pop()
    HeapifyDown(0)
    Return maxValue`,
    mappings: {
      [TAGS.INSERT_START]: [2],
      [TAGS.HEAPIFY_UP_COMPARE]: [3],
      [TAGS.HEAPIFY_UP_SWAP]: [3],
      [TAGS.EXTRACT_START]: [6],
      [TAGS.EXTRACT_SWAP_LAST]: [7],
      [TAGS.EXTRACT_REMOVE]: [7],
      [TAGS.HEAPIFY_DOWN_COMPARE]: [8],
      [TAGS.HEAPIFY_DOWN_SWAP]: [8],
    },
  },
  python: {
    content: `class MaxHeap:
    def insert(self, value):
        self.heap.append(value)
        self._heapify_up(len(self.heap) - 1)

    def extract_max(self):
        max_val = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._heapify_down(0)
        return max_val`,
  },
};

export const HeapConfig: LevelImplementationConfig = {
  id: "heap",
  type: "dataStructure",
  name: "最大堆積 (Max-Heap)",
  categoryName: "樹狀結構",
  description: "使用一維陣列實作的完全二元樹，根節點永遠是最大值。",
  codeConfig: heapCodeConfig,
  complexity: {
    timeBest: "O(log n)",
    timeAverage: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(n)",
  },
  introduction:
    "Heap（堆積）是一種非常特別的樹狀結構！雖然在畫面上你看到的是一棵「二元樹」，但我們實際上是將它儲存在一個「連續的陣列」中。\n\n💡 數學魔法：節點 `i` 的左子樹在 `2i + 1`，右子樹在 `2i + 2`，父節點在 `(i - 1) / 2`。不需要任何指標就能穿梭自如！",
  defaultData: [
    { id: "box-0", value: 90 },
    { id: "box-1", value: 80 },
    { id: "box-2", value: 70 },
    { id: "box-3", value: 60 },
    { id: "box-4", value: 50 },
    { id: "box-5", value: 40 },
  ],
  createAnimationSteps: createHeapAnimationSteps,
  actionHandler: heapActionHandler,
  renderActionBar: (props) => <HeapActionBar {...(props as any)} />,
  maxNodes: 15,
};

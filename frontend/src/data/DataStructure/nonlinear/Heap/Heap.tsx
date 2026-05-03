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
  const newData = data.map((d) => ({ ...d }));
  const oldData = data.map((d) => ({ ...d }));

  const isMinHeap = !!payload.isMinHeap;
  // 優先權判斷函數：如果是 Min-Heap，數字越小優先權越高 (a < b)
  const isPrior = (a: number, b: number) => (isMinHeap ? a < b : a > b);

  if (actionType === "peek") {
    return {
      animationData: newData,
      animationParams: {
        isHeapAction: true,
        heapType: "peek",
        oldData,
        isMinHeap,
      },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if (actionType === "heapify") {
    for (let i = Math.floor(newData.length / 2) - 1; i >= 0; i--) {
      let idx = i;
      while (true) {
        let left = 2 * idx + 1,
          right = 2 * idx + 2,
          target = idx;
        if (
          left < newData.length &&
          isPrior(newData[left].value, newData[target].value)
        )
          target = left;
        if (
          right < newData.length &&
          isPrior(newData[right].value, newData[target].value)
        )
          target = right;
        if (target !== idx) {
          const temp = newData[idx].value;
          newData[idx].value = newData[target].value;
          newData[target].value = temp;
          idx = target;
        } else break;
      }
    }
    return {
      animationData: newData,
      animationParams: {
        isHeapAction: true,
        heapType: "heapify",
        oldData,
        isMinHeap,
      },
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
      if (isPrior(newData[idx].value, newData[p].value)) {
        const temp = newData[idx].value;
        newData[idx].value = newData[p].value;
        newData[p].value = temp;
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
        isMinHeap,
      },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if (actionType === "delete") {
    if (newData.length === 0) return null;
    const extractedVal = newData[0].value;

    if (newData.length > 1) {
      newData[0].value = newData[newData.length - 1].value;
      newData.pop();

      let idx = 0;
      while (true) {
        let left = 2 * idx + 1,
          right = 2 * idx + 2,
          target = idx;
        if (
          left < newData.length &&
          isPrior(newData[left].value, newData[target].value)
        )
          target = left;
        if (
          right < newData.length &&
          isPrior(newData[right].value, newData[target].value)
        )
          target = right;
        if (target !== idx) {
          const temp = newData[idx].value;
          newData[idx].value = newData[target].value;
          newData[target].value = temp;
          idx = target;
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
        isMinHeap,
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

  if (params && params.isHeapAction) {
    const trace = simulateHeapTrace(params.oldData, params);
    return heapTraceToSteps(trace);
  }

  const trace = simulateHeapTrace(dataList, { heapType: "init" });
  return heapTraceToSteps(trace);
}

const heapCodeConfig: CodeConfig = {
  pseudo: {
    content: `Class Heap:
  Procedure BuildHeap(array):
    For i ← Floor(array.length / 2) - 1 Down To 0 Do
      HeapifyDown(i)
    End For

  Procedure Insert(value):
    array.push(value)
    HeapifyUp(array.length - 1)

  Procedure ExtractExtreme():
    extValue ← array[0]
    array[0] ← array.pop()
    HeapifyDown(0)
    Return extValue`,
    mappings: {
      [TAGS.HEAPIFY_START]: [2, 3, 4],
      [TAGS.INSERT_START]: [7],
      [TAGS.HEAPIFY_UP_COMPARE]: [8],
      [TAGS.HEAPIFY_UP_SWAP]: [8],
      [TAGS.EXTRACT_START]: [11],
      [TAGS.EXTRACT_SWAP_LAST]: [12],
      [TAGS.EXTRACT_REMOVE]: [12],
      [TAGS.HEAPIFY_DOWN_COMPARE]: [13],
      [TAGS.HEAPIFY_DOWN_SWAP]: [13],
    },
  },
  python: {
    content: `class Heap:
    def build_heap(self, arr):
        self.heap = arr
        for i in range(len(self.heap) // 2 - 1, -1, -1):
            self._heapify_down(i)
            
    def insert(self, value):
        self.heap.append(value)
        self._heapify_up(len(self.heap) - 1)

    def extract_extreme(self):
        ext_val = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._heapify_down(0)
        return ext_val`,
  },
};

export const HeapConfig: LevelImplementationConfig = {
  id: "heap",
  type: "dataStructure",
  name: "堆積 (Max/Min-Heap)",
  categoryName: "樹狀結構",
  description: "使用一維陣列實作的完全二元樹，支援最大或最小優先權動態切換。",
  codeConfig: heapCodeConfig,
  complexity: {
    timeBest: "O(log n)",
    timeAverage: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(n)",
  },
  introduction:
    "Heap（堆積）是一種非常有彈性的樹狀結構！你可以點擊 ActionBar 上的切換按鈕，觀察陣列如何瞬間在「Max-Heap」與「Min-Heap」之間重新洗牌 (Heapify)。\n\n💡 數學魔法：節點 `i` 的左子樹在 `2i + 1`，右子樹在 `2i + 2`，父節點在 `(i - 1) / 2`。不需要任何指標就能穿梭自如！",
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

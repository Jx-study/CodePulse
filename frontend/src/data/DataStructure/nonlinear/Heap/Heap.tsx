import { AnimationStep, CodeConfig, StatusConfig } from "@/types";
import { LevelImplementationConfig, DSActionBarProps } from "@/types/implementation";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";

import { HeapActionBar } from "./HeapActionBar";
import { TAGS } from "./heap/tags";
import {
  simulateHeapTrace,
  HeapNode,
  type HeapAction,
} from "./heap/simulateTrace";
import { heapTraceToSteps } from "./heap/traceToSteps";
import { Status } from "@/modules/core/DataLogic/BaseElement";

const HeapStatusConfig: StatusConfig = {
  i18nNs: "tutorials/heap",
  statuses: [
    { key: Status.Inactive,   label: "statusLegend.notBuilt",        color: "#555555" },
    { key: Status.Unfinished, label: "statusLegend.normalNode",       color: "#1d79cfff" },
    { key: Status.Prepare,    label: "statusLegend.comparing",        color: "#f59e0b" },
    { key: Status.Target,     label: "statusLegend.currentFocus",     color: "#ff6b35" },
    { key: Status.Complete,   label: "statusLegend.completeExtract",  color: "#46f336ff" },
  ],
};

const baseActionHandler = createLinearActionHandler();

function heapActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: HeapNode[],
  context: ActionContext,
): ActionResult<HeapNode[]> | null {
  const newData = data.map((d) => ({ ...d }));
  const oldData = data.map((d) => ({ ...d }));

  const isMinHeap = payload.isMinHeap === true;
  const isMaxHeap = payload.isMaxHeap === true;
  // 優先權判斷函式：如果是 Min-Heap，數字越小優先權越高 (a < b)
  const isPrior = (a: number, b: number) => (isMinHeap ? a < b : a > b);

  if (
    actionType === "random" ||
    actionType === "load" ||
    actionType === "reset"
  ) {
    // Heap data is a numeric-only subset of LinearData; the shared handler's
    // LinearData[] result is safely a HeapNode[] for this call site.
    const result = baseActionHandler(actionType, payload, data, context) as
      | ActionResult<HeapNode[]>
      | null;
    if (!result) return null;

    return {
      ...result,
      animationParams: {
        isHeapAction: true,
        heapType: "init",
        isMinHeap: false,
        isMaxHeap: actionType === "reset",
      },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if ((actionType === "peek" || actionType === "delete") && newData.length === 0) {
    return {
      animationData: newData,
      animationParams: {
        isHeapAction: true,
        heapType: actionType,
        oldData,
        isMinHeap,
        isMaxHeap,
        empty: true,
      },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if (actionType === "peek") {
    return {
      animationData: newData,
      animationParams: {
        isHeapAction: true,
        heapType: "peek",
        oldData,
        isMinHeap,
        isMaxHeap,
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
        isMaxHeap,
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
        isMaxHeap,
      },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if (actionType === "delete") {
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
        isMaxHeap,
      },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  // Heap data is a numeric-only subset of LinearData; the shared handler's
  // LinearData[] result is safely a HeapNode[] for this call site.
  return baseActionHandler(actionType, payload, data, context) as
    | ActionResult<HeapNode[]>
    | null;
}

interface HeapRunAction extends HeapAction {
  isHeapAction?: boolean;
  oldData?: HeapNode[];
  animationParams?: HeapAction & { isHeapAction?: boolean; oldData?: HeapNode[] };
}

function createHeapAnimationSteps(
  dataList: HeapNode[],
  action?: HeapRunAction,
): AnimationStep[] {
  const params = action?.isHeapAction ? action : action?.animationParams;

  if (params && params.isHeapAction) {
    const traceData =
      params.heapType === "init" ? dataList : (params.oldData ?? dataList);
    const trace = simulateHeapTrace(traceData, params);
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
    If array.length = 0 Then Return Error
    extValue ← array[0]
    If array.length = 1 Then
      array.pop()
      Return extValue
    array[0] ← array.pop()
    HeapifyDown(0)
    Return extValue

  Procedure Peek():
    If array.length = 0 Then Return Error
    Return array[0]

  Procedure HeapifyUp(i):
    While i > 0 Do
      parent ← Floor((i - 1) / 2)
      If array[i] has higher priority than array[parent] Then
        Swap(array[i], array[parent])
        i ← parent
      Else
        Break

  Procedure HeapifyDown(i):
    While True Do
      target ← i
      left ← 2 * i + 1
      right ← 2 * i + 2
      If left < array.length And array[left] has higher priority than array[target] Then target ← left
      If right < array.length And array[right] has higher priority than array[target] Then target ← right
      If target = i Then Break
      Swap(array[i], array[target])
      i ← target`,
    mappings: {
      [TAGS.HEAPIFY_START]: [2, 3, 4],
      [TAGS.INSERT_START]: [7, 8, 9],
      [TAGS.HEAPIFY_UP_COMPARE]: [26, 27, 28],
      [TAGS.HEAPIFY_UP_SWAP]: [29, 30],
      [TAGS.EXTRACT_START]: [11, 13],
      [TAGS.EXTRACT_EMPTY]: [12],
      [TAGS.EXTRACT_ONLY]: [14, 15, 16],
      [TAGS.EXTRACT_SWAP_LAST]: [17],
      [TAGS.EXTRACT_REMOVE]: [17, 18],
      [TAGS.HEAPIFY_DOWN_COMPARE]: [35, 36, 37, 38, 39, 40, 41],
      [TAGS.HEAPIFY_DOWN_SWAP]: [42, 43],
      [TAGS.PEEK]: [21, 23],
      [TAGS.PEEK_EMPTY]: [22],
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
        if not self.heap: raise IndexError("Heap Underflow")
        ext_val = self.heap[0]
        if len(self.heap) == 1:
            self.heap.pop()
            return ext_val
        self.heap[0] = self.heap.pop()
        self._heapify_down(0)
        return ext_val

    def peek(self):
        if not self.heap: raise IndexError("Heap Underflow")
        return self.heap[0]

    def _heapify_up(self, i):
        while i > 0:
            parent = (i - 1) // 2
            if self._has_priority(i, parent):
                self.heap[i], self.heap[parent] = self.heap[parent], self.heap[i]
                i = parent
            else:
                break

    def _heapify_down(self, i):
        n = len(self.heap)
        while True:
            target = i
            left, right = 2 * i + 1, 2 * i + 2
            if left < n and self._has_priority(left, target):
                target = left
            if right < n and self._has_priority(right, target):
                target = right
            if target == i:
                break
            self.heap[i], self.heap[target] = self.heap[target], self.heap[i]
            i = target

    def _has_priority(self, a, b):
        return self.heap[a] < self.heap[b]`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(1)'                       },  // class Heap:
      { lineNumber: 2,  complexity: 'O(n)'                       },  // def build_heap(self, arr): — overall O(n)
      { lineNumber: 3,  complexity: 'O(1)'                       },  // self.heap = arr — simple assign outside loop
      { lineNumber: 4,  complexity: 'O(n)'                       },  // for i in range(...) — top-level for, O(n) iterations
      { lineNumber: 5,  complexity: 'O(h)', context: 'O(n)' },  // _heapify_down(i) — O(h) per node (h = node height), called O(n) times
      { lineNumber: 7,  complexity: 'O(log n)'                   },  // def insert(self, value): — overall O(log n)
      { lineNumber: 8,  complexity: 'O(1)'                       },  // self.heap.append — list.append is O(1) amortized
      { lineNumber: 9,  complexity: 'O(log n)'                   },  // self._heapify_up(...) — O(log n) bubble-up
      { lineNumber: 11, complexity: 'O(log n)'                   },  // def extract_extreme(self): — overall O(log n)
      { lineNumber: 12, complexity: 'O(1)'                       },  // if not self.heap: raise IndexError
      { lineNumber: 13, complexity: 'O(1)'                       },  // ext_val = self.heap[0] — O(1) index access
      { lineNumber: 14, complexity: 'O(1)'                       },  // if len(self.heap) == 1:
      { lineNumber: 15, complexity: 'O(1)'                       },  // self.heap.pop()
      { lineNumber: 16, complexity: 'O(1)'                       },  // return ext_val
      { lineNumber: 17, complexity: 'O(1)'                       },  // self.heap[0] = self.heap.pop() — O(1)
      { lineNumber: 18, complexity: 'O(log n)'                   },  // self._heapify_down(0) — O(log n) sift-down
      { lineNumber: 19, complexity: 'O(1)'                       },  // return ext_val
      { lineNumber: 21, complexity: 'O(1)'                       },  // def peek(self):
      { lineNumber: 22, complexity: 'O(1)'                       },  // if not self.heap: raise IndexError
      { lineNumber: 23, complexity: 'O(1)'                       },  // return self.heap[0]
      { lineNumber: 25, complexity: 'O(log n)'                   },  // def _heapify_up(self, i): — overall O(log n)
      { lineNumber: 26, complexity: 'O(log n)'                   },  // while i > 0: — at most tree height iterations
      { lineNumber: 27, complexity: 'O(1)', context: 'O(log n)'  },  // parent = (i - 1) // 2
      { lineNumber: 28, complexity: 'O(1)', context: 'O(log n)'  },  // if self._has_priority(i, parent):
      { lineNumber: 29, complexity: 'O(1)', context: 'O(log n)'  },  // swap with parent
      { lineNumber: 30, complexity: 'O(1)', context: 'O(log n)'  },  // i = parent
      { lineNumber: 31, complexity: 'O(1)', context: 'O(log n)'  },  // else:
      { lineNumber: 32, complexity: 'O(1)', context: 'O(log n)'  },  // break
      { lineNumber: 34, complexity: 'O(log n)'                   },  // def _heapify_down(self, i): — overall O(log n)
      { lineNumber: 35, complexity: 'O(1)'                       },  // n = len(self.heap)
      { lineNumber: 36, complexity: 'O(log n)'                   },  // while True: — at most tree height iterations
      { lineNumber: 37, complexity: 'O(1)', context: 'O(log n)'  },  // target = i
      { lineNumber: 38, complexity: 'O(1)', context: 'O(log n)'  },  // left, right = 2 * i + 1, 2 * i + 2
      { lineNumber: 39, complexity: 'O(1)', context: 'O(log n)'  },  // if left < n and ...
      { lineNumber: 40, complexity: 'O(1)', context: 'O(log n)'  },  // target = left
      { lineNumber: 41, complexity: 'O(1)', context: 'O(log n)'  },  // if right < n and ...
      { lineNumber: 42, complexity: 'O(1)', context: 'O(log n)'  },  // target = right
      { lineNumber: 43, complexity: 'O(1)', context: 'O(log n)'  },  // if target == i:
      { lineNumber: 44, complexity: 'O(1)', context: 'O(log n)'  },  // break
      { lineNumber: 45, complexity: 'O(1)', context: 'O(log n)'  },  // swap with target
      { lineNumber: 46, complexity: 'O(1)', context: 'O(log n)'  },  // i = target
      { lineNumber: 48, complexity: 'O(1)'                       },  // def _has_priority(self, a, b):
      { lineNumber: 49, complexity: 'O(1)'                       },  // return self.heap[a] < self.heap[b]
    ],
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
    timeBest: "O(1)",
    timeAverage: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(n)",
  },
  i18nNamespace: "tutorials/heap",
  introduction: { key: "introduction" },
  defaultData: [
    { id: "box-0", value: 90 },
    { id: "box-1", value: 80 },
    { id: "box-2", value: 70 },
    { id: "box-3", value: 60 },
    { id: "box-4", value: 50 },
    { id: "box-5", value: 40 },
  ],
  createAnimationSteps: createHeapAnimationSteps,
  statusConfig: HeapStatusConfig,
  hasEmptyGuard: true,
  actionHandler: heapActionHandler,
  renderActionBar: (props) => <HeapActionBar {...(props as DSActionBarProps)} />,
  relatedProblems: [
    {
      id: 703,
      title: "Kth Largest Element in a Stream",
      concept: "relatedProblems.703",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
    },
    {
      id: 215,
      title: "Kth Largest Element in an Array",
      concept: "relatedProblems.215",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    },
    {
      id: 347,
      title: "Top K Frequent Elements",
      concept: "relatedProblems.347",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/top-k-frequent-elements/",
    },
    {
      id: 295,
      title: "Find Median from Data Stream",
      concept: "relatedProblems.295",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/find-median-from-data-stream/",
    },
    {
      id: 23,
      title: "Merge K Sorted Lists",
      concept: "relatedProblems.23",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/merge-k-sorted-lists/",
    },
  ],
  maxNodes: 15,
};

import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import {
  LinearData as BoxData,
  LinearAction as ActionType,
} from "../utils";
import { ArrayActionBar } from "./ArrayActionBar";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { DATA_LIMITS } from "@/constants/dataLimits";
import { arrayRealWorldStories } from "./array.stories";
import { TAGS } from "./array/tags";
import { simulateArrayTrace } from "./array/simulateTrace";
import { arrayTraceToSteps } from "./array/traceToSteps";


export function createArrayAnimationSteps(
  dataList: BoxData[],
  action?: ActionType,
): AnimationStep[] {
  const trace = simulateArrayTrace(dataList, action);
  return arrayTraceToSteps(trace);
}

const arrayCodeConfig: CodeConfig = {
  pseudo: {
    content: `Class Array:
  Data:
    length ← 0
    data ← []

  Procedure search(target):
    For i ← 0 to length - 1:
      If data[i] == target Then
        Return i  // Found
      End If
    End For
    Return -1     // Not Found
  End Procedure

  Procedure update(index, value):
    If value is Empty Then
      Alert "Value cannot be empty"
      Return
    End If
    
    data[index] ← value
  End Procedure

  Procedure insert(index, value):
    // 1. Expand array size (append at back)
    length ← length + 1
    
    // 2. Shift elements to the right
    // (Prepare space for the new value at index)
    For i ← length - 1 down to index + 1:
      data[i] ← data[i - 1]
    End For
    
    // 3. Insert value
    data[index] ← value
  End Procedure

  Procedure delete(index):
    If index < 0 or index ≥ length Then
      Return Error
    End If

    // Shift elements to the left
    For i ← index to length - 2:
      data[i] ← data[i + 1]
    End For

    // Remove last element
    length ← length - 1
  End Procedure`,
    mappings: {
      [TAGS.SEARCH_START]: [6],
      [TAGS.SEARCH_COMPARE]: [7, 8],
      [TAGS.SEARCH_FOUND]: [9],
      [TAGS.SEARCH_NOT_FOUND]: [12],
      [TAGS.UPDATE_START]: [15],
      [TAGS.UPDATE_ERROR]: [16, 17, 18],
      [TAGS.UPDATE_ASSIGN]: [21],
      [TAGS.UPDATE_COMPLETE]: [22],
      [TAGS.INSERT_START]: [24, 25],
      [TAGS.INSERT_SHIFT]: [28, 29, 30, 31],
      [TAGS.INSERT_ASSIGN]: [34, 35],
      [TAGS.INSERT_COMPLETE]: [36],
      [TAGS.DELETE_START]: [38],
      [TAGS.DELETE_SHIFT]: [43, 44, 45],
      [TAGS.DELETE_REMOVE]: [48, 49],
      [TAGS.DELETE_COMPLETE]: [50],
    },
  },
  python: {
    content: `class Array:
    def search(self, target):
        for i in range(len(self.arr)):
            if self.arr[i] == target:
                return i
        return -1

    def update(self, index, value):
        if index < 0 or index >= len(self.arr):
            raise IndexError("Index out of bounds")
        self.arr[index] = value

    def insert(self, index, value):
        # Python's list.insert handles shifting
        self.arr.insert(index, value)

    def delete(self, index):
        # Python's list.pop handles shifting
        self.arr.pop(index)`,
  },
};

/** Array actionHandler */
function arrayActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: BoxData[],
  context: ActionContext,
): ActionResult<BoxData[]> | null {
  const { value, mode, index } = payload as {
    value?: number;
    mode?: string;
    index?: number;
  };
  const newData = data.map((d) => ({ ...d }));

  if (actionType === "add" && mode === "Insert") {
    const idx = index ?? newData.length;
    const safeIdx = Math.max(0, Math.min(idx, newData.length));
    const newId = context.nextId();
    const tailBox = { id: newId, value: 0 };
    newData.push(tailBox);
    for (let i = newData.length - 1; i > safeIdx; i--)
      newData[i].value = newData[i - 1].value;
    newData[safeIdx].value = value!;
    return {
      animationData: newData,
      animationParams: { targetId: newId, value, index: safeIdx },
    };
  }

  if (actionType === "add" && mode === "Update") {
    const idx = index ?? -1;
    if (idx >= 0 && idx < newData.length) {
      const oldValue = newData[idx].value;
      newData[idx] = { ...newData[idx], value: value! };
      return {
        animationData: newData,
        animationParams: {
          targetId: newData[idx].id,
          value,
          index: idx,
          oldValue: Number(oldValue),
        },
      };
    }
    return null;
  }

  if (actionType === "delete") {
    const idx = index;
    if (newData.length === 0) {
      context.toast.warning("Array is empty");
      return null;
    }
    if (idx === undefined || idx >= newData.length || idx < 0) {
      context.toast.warning("Invalid index");
      return null;
    }
    const deletedValue = newData[idx].value;
    const lastBox = newData[newData.length - 1];
    for (let i = idx; i < newData.length - 1; i++)
      newData[i].value = newData[i + 1].value;
    newData.pop();
    return {
      animationData: newData,
      animationParams: {
        targetId: lastBox.id,
        value: deletedValue,
        index: idx,
      },
    };
  }

  if (actionType === "search") {
    return { animationData: data };
  }

  if (["random", "reset", "load", "refresh"].includes(actionType)) {
    if (actionType === "random") {
      const count =
        (payload.randomCount as number) ?? DATA_LIMITS.DEFAULT_RANDOM_COUNT;
      const randData = Array.from({ length: count }, () => ({
        id: context.nextId(),
        value: Math.floor(Math.random() * 100),
      }));
      return { animationData: randData, isResetAction: true };
    }
    if (actionType === "reset") {
      const defaultData =
        (context.defaultData as BoxData[] | undefined) ?? data;
      const resetData = defaultData.map((d) => ({
        ...d,
        id: context.nextId(),
      }));
      return { animationData: resetData, isResetAction: true };
    }
    if (actionType === "load") {
      const loadArr = (payload.data as number[]) ?? [];
      const loadData = loadArr.map((v) => ({ id: context.nextId(), value: v }));
      return { animationData: loadData, isResetAction: true };
    }
    return { animationData: data, isResetAction: true };
  }

  return null;
}

export const ArrayConfig: LevelImplementationConfig = {
  id: "array",
  type: "dataStructure",
  name: "陣列 (Array)",
  categoryName: "資料結構",
  description: "連續記憶體空間",
  codeConfig: arrayCodeConfig,
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(n)",
  },
  introduction:
    "陣列使用連續的記憶體位置來儲存資料，支援隨機存取(Random Access)。",
  defaultData: [
    { id: "box-0", value: 10 },
    { id: "box-1", value: 20 },
    { id: "box-2", value: 30 },
    { id: "box-3", value: 40 },
    { id: "box-4", value: 50 },
  ],
  createAnimationSteps: createArrayAnimationSteps,
  actionHandler: arrayActionHandler,
  renderActionBar: (props) => <ArrayActionBar {...(props as any)} />,
  relatedProblems: [
    {
      id: 1,
      title: "Two Sum",
      concept: "陣列基礎應用：在陣列中尋找兩數之和",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/two-sum/",
    },
    {
      id: 27,
      title: "Remove Element",
      concept: "陣列刪除操作：移除指定元素 (In-place)",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/remove-element/",
    },
    {
      id: 189,
      title: "Rotate Array",
      concept: "陣列操作進階：旋轉陣列元素",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/rotate-array/",
    },
  ],
  maxNodes: 20,
  realWorldStories: arrayRealWorldStories,
};

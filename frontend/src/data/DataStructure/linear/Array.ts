import { Status } from "@/modules/core/DataLogic/BaseElement";
import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import {
  LinearData as BoxData,
  LinearAction as ActionType,
  createBoxes as baseCreateBoxes,
} from "./utils";

const TAGS = {
  SEARCH_START: "SEARCH_START",
  SEARCH_COMPARE: "SEARCH_COMPARE",
  SEARCH_FOUND: "SEARCH_FOUND",
  SEARCH_NOT_FOUND: "SEARCH_NOT_FOUND",

  UPDATE_START: "UPDATE_START",
  UPDATE_ASSIGN: "UPDATE_ASSIGN",
  UPDATE_COMPLETE: "UPDATE_COMPLETE",
  UPDATE_ERROR: "UPDATE_ERROR",

  INSERT_START: "INSERT_START",
  INSERT_SHIFT: "INSERT_SHIFT",
  INSERT_ASSIGN: "INSERT_ASSIGN",
  INSERT_COMPLETE: "INSERT_COMPLETE",

  DELETE_START: "DELETE_START",
  DELETE_SHIFT: "DELETE_SHIFT",
  DELETE_REMOVE: "DELETE_REMOVE",
  DELETE_COMPLETE: "DELETE_COMPLETE",
};

const createBoxes = (
  list: BoxData[],
  highlightIndex: number = -1,
  status: Status = Status.Unfinished,
  forceXShiftIndex: number = -1,
  shiftDirection: number = 0,
  overrideStatusMap: Record<number, Status> = {}
) => {
  return baseCreateBoxes(list, {
    startX: 50,
    startY: 200,
    gap: 70,
    highlightIndex,
    status,
    forceXShiftIndex,
    shiftDirection,
    overrideStatusMap,
    getDescription: (_, i) => `${i}`,
  });
};

export function createArrayAnimationSteps(
  dataList: BoxData[],
  action?: ActionType
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  if (!action) {
    steps.push({
      stepNumber: 1,
      description: "Array 狀態",
      elements: createBoxes(dataList || []),
      variables: { length: dataList?.length || 0 },
    });
    return steps;
  }

  const { type, value, index } = action;

  if (type === "search") {
    let found = false;
    
    steps.push({
        stepNumber: steps.length + 1,
        description: `開始搜尋數值 ${value}`,
        elements: createBoxes(dataList),
        actionTag: TAGS.SEARCH_START,
        variables: { target: value, i: -1 }
    });

    for (let i = 0; i < dataList.length; i++) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `檢查 Index ${i}: ${dataList[i].value} 是否等於 ${value}?`,
        elements: createBoxes(dataList, i, Status.Target),
        actionTag: TAGS.SEARCH_COMPARE,
        variables: { target: value, i: i, current_val: dataList[i].value || 0 }
      });

      if (dataList[i].value === value) {
        found = true;
        steps.push({
          stepNumber: steps.length + 1,
          description: `找到了！數值 ${value} 位於 Index ${i}`,
          elements: createBoxes(dataList, i, Status.Complete),
          actionTag: TAGS.SEARCH_FOUND,
          variables: { target: value, i: i, found_index: i }
        });
        break;
      }
    }
    if (!found) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `搜尋結束：未找到數值 ${value}`,
        elements: createBoxes(dataList),
        actionTag: TAGS.SEARCH_NOT_FOUND,
        variables: { target: value, i: dataList.length, found_index: -1 }
      });
    }
  }

  else if (type === "add" && action.mode === "Update") {
    const idx = index !== undefined ? index : -1;
    const oldValue =
      (action as any).oldValue !== undefined ? (action as any).oldValue : value;

    if (idx >= 0 && idx < dataList.length) {
      const s1Boxes = createBoxes(dataList, idx, Status.Target);
      s1Boxes[idx].value = oldValue;

      steps.push({
        stepNumber: 1,
        description: `存取 Index ${idx}`,
        elements: s1Boxes,
        actionTag: TAGS.UPDATE_START,
        variables: { index: idx, value: value, [`data[${idx}]`]: oldValue }
      });

      steps.push({
        stepNumber: 2,
        description: `將 Index ${idx} 更新為 ${value}`,
        elements: createBoxes(dataList, idx, Status.Target),
        actionTag: TAGS.UPDATE_ASSIGN,
        variables: { index: idx, value: value, [`data[${idx}]`]: value }
      });

      steps.push({
        stepNumber: 3,
        description: "更新完成",
        elements: createBoxes(dataList, idx, Status.Complete),
        actionTag: TAGS.UPDATE_COMPLETE,
        variables: { index: idx, value: value, [`data[${idx}]`]: value }
      });
    } else {
      steps.push({
        stepNumber: 1,
        description: `錯誤：Index ${idx} 超出範圍`,
        elements: createBoxes(dataList),
        actionTag: TAGS.UPDATE_ERROR,
        variables: { index: idx, length: dataList.length }
      });
    }
  }

  else if (type === "add") {
    const idx = index !== undefined ? index : dataList.length - 1;

    let currentList = dataList.map((item) => ({ ...item }));

    for (let i = idx; i < dataList.length - 1; i++) {
      currentList[i].value = dataList[i + 1].value;
    }

    currentList[currentList.length - 1].value = undefined;

    steps.push({
      stepNumber: 1,
      description: "在陣列尾端擴充一個空間",
      elements: createBoxes(currentList, currentList.length - 1, Status.Target),
      actionTag: TAGS.INSERT_START,
      variables: { index: idx, value: value, length: currentList.length }
    });

    for (let i = currentList.length - 1; i > idx; i--) {
      const mapPrepare: Record<number, Status> = {};
      mapPrepare[i] = Status.Prepare; 
      mapPrepare[i - 1] = Status.Prepare; 

      steps.push({
        stepNumber: steps.length + 1,
        description: `準備將 Index ${i - 1} (${currentList[i - 1].value
          }) 右移至 Index ${i}`,
        elements: createBoxes(currentList, -1, Status.Unfinished, -1, 0, mapPrepare),
        actionTag: TAGS.INSERT_SHIFT,
        variables: { 
            i: i, 
            index: idx,
            [`data[${i-1}]`]: currentList[i-1].value ?? null,  
            [`data[${i}]`]: currentList[i].value ?? null,   
        }
      });

      currentList[i].value = currentList[i - 1].value;

      const mapSwap: Record<number, Status> = {};
      mapSwap[i] = Status.Target; 
      mapSwap[i - 1] = Status.Prepare; 

      steps.push({
        stepNumber: steps.length + 1,
        description: `搬移完成：Index ${i} 現在是 ${currentList[i].value}`,
        elements: createBoxes(currentList, -1, Status.Unfinished, -1, 0, mapSwap),
        actionTag: TAGS.INSERT_SHIFT,
        variables: { 
            i: i, 
            index: idx,
            [`data[${i}]`]: currentList[i].value ?? null
        }
      });
    }

    currentList[idx].value = value;

    steps.push({
      stepNumber: steps.length + 1,
      description: `在 Index ${idx} 填入新數值 ${value}`,
      elements: createBoxes(currentList, idx, Status.Target),
      actionTag: TAGS.INSERT_ASSIGN,
      variables: { index: idx, value: value, [`data[${idx}]`]: value }
    });

    steps.push({
      stepNumber: steps.length + 1,
      description: "插入完成",
      elements: createBoxes(dataList, -1, Status.Complete),
      actionTag: TAGS.INSERT_COMPLETE,
      variables: { index: idx, value: value, [`data[${idx}]`]: value }
    });
  }

  else if (type === "delete") {
    const idx = index !== undefined ? index : -1;
    if (idx >= 0) {
      const poppedNode = {
        id: (action as any).targetId || "temp-pop",
        value: 0,
      };

      let currentList = [...dataList, poppedNode].map((item) => ({ ...item }));

      for (let i = currentList.length - 1; i > idx; i--) {
        currentList[i].value = currentList[i - 1].value;
      }
      currentList[idx].value = value;

      steps.push({
        stepNumber: 1,
        description: `標記 Index ${idx} (值: ${value}) 準備刪除`,
        elements: createBoxes(currentList, idx, Status.Target),
        actionTag: TAGS.DELETE_START,
        variables: { index: idx, value: value }
      });

      for (let i = idx; i < currentList.length - 1; i++) {
        const mapPrepare: Record<number, Status> = {};
        mapPrepare[i] = Status.Prepare;
        mapPrepare[i + 1] = Status.Prepare;

        steps.push({
          stepNumber: steps.length + 1,
          description: `準備將 Index ${i + 1} (${currentList[i + 1].value
            }) 移至 Index ${i}`,
          elements: createBoxes(
            currentList,
            -1,
            Status.Unfinished,
            -1,
            0,
            mapPrepare
          ),
          actionTag: TAGS.DELETE_SHIFT,
          variables: { 
            i: i, 
            index: idx,
            [`data[${i}]`]: currentList[i].value ?? null,   
            [`data[${i+1}]`]: currentList[i+1].value ?? null 
          }
        });

        currentList[i].value = currentList[i + 1].value;

        const mapSwap: Record<number, Status> = {};
        mapSwap[i] = Status.Target; 
        mapSwap[i + 1] = Status.Prepare; 
        
        steps.push({
          stepNumber: steps.length + 1,
          description: `搬移完成：Index ${i} 現在是 ${currentList[i].value}`,
          elements: createBoxes(currentList, -1, Status.Unfinished, -1, 0, mapSwap),
          actionTag: TAGS.DELETE_SHIFT,
          variables: { 
            i: i, 
            index: idx,
            [`data[${i}]`]: currentList[i].value ?? null 
          }
        });
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: "刪除最後一個多餘的空間",
        elements: createBoxes(currentList, currentList.length - 1, Status.Target),
        actionTag: TAGS.DELETE_REMOVE,
        variables: { length: currentList.length }
      });

      steps.push({
        stepNumber: steps.length + 1,
        description: "刪除完成",
        elements: createBoxes(dataList, -1, Status.Complete),
        actionTag: TAGS.DELETE_COMPLETE,
        variables: { length: dataList.length }
      });
    }
  }
  return steps;
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

export const ArrayConfig: LevelImplementationConfig = {
  id: "array",
  type: "dataStructure",
  name: "陣列 (Array)",
  categoryName: "線性表",
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
};

import { Status } from "../../../modules/core/DataLogic/BaseElement";
import {
  AnimationStep,
  DataStructureConfig,
} from "../../../types/dataStructure";
import {
  LinearData as BoxData,
  LinearAction as ActionType,
  createBoxes as baseCreateBoxes,
} from "./utils";

// Array 的 description 顯示的是 Index 0, 1...
const createBoxes = (
  list: BoxData[],
  highlightIndex: number = -1,
  status: Status = "unfinished",
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

  // 1. 靜態渲染
  if (!action) {
    steps.push({
      stepNumber: 1,
      description: "Array 狀態",
      elements: createBoxes(dataList || []),
    });
    return steps;
  }

  const { type, value, index } = action;

  // Search (Linear Search)
  if (type === "search") {
    let found = false;
    for (let i = 0; i < dataList.length; i++) {
      // Step A: 比較中
      steps.push({
        stepNumber: steps.length + 1,
        description: `檢查 Index ${i}: ${dataList[i].value} 是否等於 ${value}?`,
        elements: createBoxes(dataList, i, "target"),
      });

      // Step B: 找到
      if (dataList[i].value === value) {
        found = true;
        steps.push({
          stepNumber: steps.length + 1,
          description: `找到了！數值 ${value} 位於 Index ${i}`,
          elements: createBoxes(dataList, i, "complete"),
        });
        break;
      }
    }
    if (!found) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `搜尋結束：未找到數值 ${value}`,
        elements: createBoxes(dataList),
      });
    }
  }

  // Update (Access & Modify)
  else if (type === "add" && action.mode === "Update") {
    const idx = index !== undefined ? index : -1;
    const oldValue =
      (action as any).oldValue !== undefined ? (action as any).oldValue : value;

    if (idx >= 0 && idx < dataList.length) {
      // Step 1: 標記目標 (顯示舊數值)
      const s1Boxes = createBoxes(dataList, idx, "target");
      s1Boxes[idx].value = oldValue;

      steps.push({
        stepNumber: 1,
        description: `存取 Index ${idx}`,
        elements: s1Boxes,
      });

      // Step 2: 數值變更 (顯示新數值)
      steps.push({
        stepNumber: 2,
        description: `將 Index ${idx} 更新為 ${value}`,
        elements: createBoxes(dataList, idx, "target"),
      });

      // Step 3: 完成 (變綠色)
      steps.push({
        stepNumber: 3,
        description: "更新完成",
        elements: createBoxes(dataList, idx, "complete"),
      });
    } else {
      steps.push({
        stepNumber: 1,
        description: `錯誤：Index ${idx} 超出範圍`,
        elements: createBoxes(dataList),
      });
    }
  }

  // Insert (Shift Right)
  else if (type === "add") {
    const idx = index !== undefined ? index : dataList.length - 1;

    let currentList = dataList.map((item) => ({ ...item }));

    // 還原數值：
    // 目前 dataList 在 idx 處是新值，idx 之後的值都已經被往右移了一格
    // 要左移回去，來模擬「還沒搬移」的狀態
    // [10, New, 20, 30] -> [10, 20, 30, 0]

    // 把 dataList[i+1] 的值還原給 currentList[i]
    for (let i = idx; i < dataList.length - 1; i++) {
      currentList[i].value = dataList[i + 1].value;
    }

    currentList[currentList.length - 1].value = undefined;

    // Step 1: 標記新增的空位
    steps.push({
      stepNumber: 1,
      description: "在陣列尾端擴充一個空間",
      elements: createBoxes(currentList, currentList.length - 1, "target"),
    });

    // 開始搬移迴圈：從尾端開始，把 i-1 搬給 i
    // [10, 20, 30, 0] -> [10, 20, 30, 30] -> [10, 20, 20, 30]
    for (let i = currentList.length - 1; i > idx; i--) {
      const mapPrepare: Record<number, Status> = {};
      mapPrepare[i] = "prepare"; // 目標空位
      mapPrepare[i - 1] = "prepare"; // 來源值

      steps.push({
        stepNumber: steps.length + 1,
        description: `準備將 Index ${i - 1} (${currentList[i - 1].value
          }) 右移至 Index ${i}`,
        elements: createBoxes(currentList, -1, "unfinished", -1, 0, mapPrepare),
      });

      // Step B: 搬移
      currentList[i].value = currentList[i - 1].value;

      const mapSwap: Record<number, Status> = {};
      mapSwap[i] = "target"; // 變成新值
      mapSwap[i - 1] = "prepare"; // 來源位

      steps.push({
        stepNumber: steps.length + 1,
        description: `搬移完成：Index ${i} 現在是 ${currentList[i].value}`,
        elements: createBoxes(currentList, -1, "unfinished", -1, 0, mapSwap),
      });
    }

    // Step Final: 填入新數值
    // 此時 currentList 在 idx 的位置是舊值 (例如 [10, 20, 20, 30])
    // 我們要將 idx 更新為 new value
    currentList[idx].value = value;

    steps.push({
      stepNumber: steps.length + 1,
      description: `在 Index ${idx} 填入新數值 ${value}`,
      elements: createBoxes(currentList, idx, "target"),
    });

    // Step Done: 完成 (全亮)
    steps.push({
      stepNumber: steps.length + 1,
      description: "插入完成",
      elements: createBoxes(dataList, -1, "complete"),
    });
  }

  // Delete (Shift Left)
  else if (type === "delete") {
    const idx = index !== undefined ? index : -1;
    if (idx >= 0) {
      const poppedNode = {
        id: (action as any).targetId || "temp-pop",
        value: 0, // 數值稍後會被還原邏輯覆蓋
      };

      // 複製一份 dataList 並把 pop 的加回去
      // currentList 初始狀態: [20, 30, 0] (ID: box-0, box-1, box-2)
      let currentList = [...dataList, poppedNode].map((item) => ({ ...item }));

      // 還原數值：從尾端開始，把 i-1 的值給 i
      // 也就是把 [20, 30, ?] 還原成 [10, 20, 30]
      for (let i = currentList.length - 1; i > idx; i--) {
        currentList[i].value = currentList[i - 1].value;
      }
      // 最後把被刪除的值 (10) 放回 idx
      currentList[idx].value = value;

      // Step 1: 標記要刪除的目標
      steps.push({
        stepNumber: 1,
        description: `標記 Index ${idx} (值: ${value}) 準備刪除`,
        elements: createBoxes(currentList, idx, "target"),
      });

      for (let i = idx; i < currentList.length - 1; i++) {
        // Step A: 標記 prepare (兩個都要變色)
        const mapPrepare: Record<number, Status> = {};
        mapPrepare[i] = "prepare";
        mapPrepare[i + 1] = "prepare";

        steps.push({
          stepNumber: steps.length + 1,
          description: `準備將 Index ${i + 1} (${currentList[i + 1].value
            }) 移至 Index ${i}`,
          elements: createBoxes(
            currentList,
            -1,
            "unfinished",
            -1,
            0,
            mapPrepare
          ),
        });

        // Step B: 執行搬移 (數值覆蓋)
        currentList[i].value = currentList[i + 1].value;

        const mapSwap: Record<number, Status> = {};
        mapSwap[i] = "target"; // 變成新值了
        mapSwap[i + 1] = "prepare"; // 來源

        steps.push({
          stepNumber: steps.length + 1,
          description: `搬移完成：Index ${i} 現在是 ${currentList[i].value}`,
          elements: createBoxes(currentList, -1, "unfinished", -1, 0, mapSwap),
        });
      }

      // Step Final: 標記最後一個多餘的空間 (準備 Pop)
      steps.push({
        stepNumber: steps.length + 1,
        description: "刪除最後一個多餘的空間",
        elements: createBoxes(currentList, currentList.length - 1, "target"),
      });

      // Step Done: 顯示最終結果
      steps.push({
        stepNumber: steps.length + 1,
        description: "刪除完成",
        elements: createBoxes(dataList, -1, "complete"),
      });
    }
  }
  return steps;
}

export const ArrayConfig: DataStructureConfig = {
  id: "array",
  name: "陣列 (Array)",
  category: "linear",
  categoryName: "線性表",
  description: "連續記憶體空間",
  pseudoCode: `arr[i] = value  // O(1)\narr.insert(i, val) // O(n)\narr.remove(i) // O(n)`,
  complexity: {
    timeBest: "O(1)", // Access
    timeAverage: "O(n)", // Insert/Delete/Search
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
};

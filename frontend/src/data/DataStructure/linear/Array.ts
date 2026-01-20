import { Box } from "../../../modules/core/DataLogic/Box";
import { Status } from "../../../modules/core/DataLogic/BaseElement";
import {
  AnimationStep,
  DataStructureConfig,
} from "../../../types/dataStructure";

interface BoxData {
  id: string;
  value: number;
}

interface ActionType {
  type: string;
  value: number;
  mode: string; // "Index" (Update), "Value" (Search)
  index?: number;
  targetId?: string;
}

// Array 的 description 顯示的是 Index 0, 1...
const createBoxes = (
  list: BoxData[],
  highlightIndex: number = -1,
  status: Status = "unfinished",
  forceXShiftIndex: number = -1, // 從哪個 index 開始強迫右移 (用於 Insert 動畫)
  shiftDirection: number = 0, // 0: 不移, 1: 右移, -1: 左移
  overrideStatusMap: Record<number, Status> = {}
) => {
  const startX = 50;
  const startY = 200;
  const gap = 70;

  return list.map((item, i) => {
    const box = new Box();
    box.id = item.id;

    let x = startX + i * gap;

    // 處理位移動畫邏輯
    if (forceXShiftIndex !== -1) {
      // Insert: 從 forceXShiftIndex 開始往右移
      if (shiftDirection === 1 && i >= forceXShiftIndex) {
        x += gap;
      }
      // Delete: 從 forceXShiftIndex 開始往左移 (通常是刪除後的補位)
      else if (shiftDirection === -1 && i >= forceXShiftIndex) {
        x -= gap;
      }
    }

    box.moveTo(x, startY);
    box.width = 60;
    box.height = 60;
    box.value = item.value;
    box.description = `${i}`; // 顯示 Index

    if (overrideStatusMap[i]) {
      box.setStatus(overrideStatusMap[i]);
    } else if (highlightIndex === -1) {
      box.setStatus(status);
    } else if (i === highlightIndex) {
      box.setStatus(status === "unfinished" ? "target" : status);
    } else {
      box.setStatus("unfinished");
    }

    if (forceXShiftIndex !== -1 && i >= forceXShiftIndex) {
      if (i !== highlightIndex) box.setStatus("prepare");
    }

    return box;
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
    // mode === "Insert" or "Head"/"Tail"
    // dataList 是插入後的結果： [A, B, New, C]
    // 我們需要還原插入前的狀態： [A, B, C]

    const idx = index !== undefined ? index : dataList.length - 1;
    const newNode = dataList[idx];

    // 還原舊列表
    const oldList = [...dataList];
    oldList.splice(idx, 1); // 移除新元素

    // Step 1: 標記插入點之後的元素 (準備右移)
    // 使用 oldList，但在 idx 之後的元素標記為 prepare
    steps.push({
      stepNumber: 1,
      description: `準備在 Index ${idx} 插入：後方元素準備右移`,
      elements: createBoxes(oldList, -1, "unfinished", idx, 0), // 0 表示還沒移，但可標記顏色
    });

    // Step 2: 右移騰出空間
    // 這裡我們用 createBoxes 的 forceXShiftIndex 功能
    // 讓 oldList 從 idx 開始的元素畫在 x + gap 的位置
    steps.push({
      stepNumber: 2,
      description: `元素右移，騰出 Index ${idx} 的空間`,
      elements: createBoxes(oldList, -1, "unfinished", idx, 1), // 1 表示右移
    });

    // Step 3: 放入新元素
    // 舊元素保持右移狀態，新元素從上方出現
    const movedBoxes = createBoxes(oldList, -1, "unfinished", idx, 1);

    const s3NewBox = new Box();
    s3NewBox.id = newNode.id;
    s3NewBox.value = newNode.value;
    s3NewBox.width = 60;
    s3NewBox.height = 60;
    s3NewBox.moveTo(50 + idx * 80, 200 - 80); // 出現在目標位置上方
    s3NewBox.setStatus("target");
    s3NewBox.description = "New";

    steps.push({
      stepNumber: 3,
      description: `放入新元素 ${value}`,
      elements: [...movedBoxes, s3NewBox],
    });

    // Step 4: 完成
    steps.push({
      stepNumber: 4,
      description: "插入完成",
      elements: createBoxes(dataList, idx, "complete"),
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
          description: `準備將 Index ${i + 1} (${
            currentList[i + 1].value
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

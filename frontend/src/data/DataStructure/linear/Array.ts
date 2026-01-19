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
  shiftDirection: number = 0 // 0: 不移, 1: 右移, -1: 左移
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

    if (i === highlightIndex) {
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
  //   const startX = 50;
  //   const startY = 200;
  //   const gap = 70;

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

    if (idx >= 0 && idx < dataList.length) {
      // dataList 已經是更新後的結果了，我們需要模擬一下「原本的樣子」
      // 但為了簡化，我們直接顯示「選中 -> 變更」

      // Step 1: 選中該格 (顯示新值或舊值都可以，這裡顯示新值但標記 target)
      steps.push({
        stepNumber: 1,
        description: `存取 Index ${idx}`,
        elements: createBoxes(dataList, idx, "target"),
      });

      // Step 2: 完成
      steps.push({
        stepNumber: 2,
        description: `將 Index ${idx} 更新為 ${value}`,
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
      // dataList 是刪除後的結果
      // 還原舊列表 (包含被刪除的那個)
      const deletedNode = {
        id: (action as any).targetId || "del-temp",
        value: value,
      };
      const oldList = [...dataList];
      oldList.splice(idx, 0, deletedNode); // 插回去

      // Step 1: 標記要刪除的元素
      steps.push({
        stepNumber: 1,
        description: `選取 Index ${idx} 準備刪除`,
        elements: createBoxes(oldList, idx, "target"),
      });

      // Step 2: 元素消失，留下空位
      // 我們過濾掉 idx 的元素，但後面的元素位置暫時不變
      const s2Boxes = createBoxes(oldList).filter((_, i) => i !== idx);
      // 此時 s2Boxes 裡的元素位置還是原本的 (會有空缺)

      steps.push({
        stepNumber: 2,
        description: "移除元素，留下空位",
        elements: s2Boxes,
      });

      // Step 3: 左移補位
      // 這其實就是 dataList 的標準排列，但我們可以加個說明
      // 為了動畫順暢，如果能模擬移動更好，但直接顯示 dataList D3 也會自動補間
      steps.push({
        stepNumber: 3,
        description: "後方元素左移補位",
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

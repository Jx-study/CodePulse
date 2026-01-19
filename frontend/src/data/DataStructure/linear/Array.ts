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

// Helper: 產生 Box 陣列
// Array 的 description 顯示的是 Index [0], [1]...
const createBoxes = (
  list: BoxData[],
  highlightIndex: number = -1,
  status: Status = "unfinished"
) => {
  const startX = 50; // Array 通常比較長，從左邊一點開始
  const startY = 200;
  const gap = 70;

  return list.map((item, i) => {
    const box = new Box();
    box.id = item.id;
    box.moveTo(startX + i * gap, startY);
    box.width = 60;
    box.height = 60;
    box.value = item.value;
    box.description = `[${i}]`; // 顯示 Index

    if (i === highlightIndex) {
      box.setStatus(status === "unfinished" ? "target" : status);
    } else {
      box.setStatus("unfinished");
    }

    return box;
  });
};

export function createArrayAnimationSteps(
  dataList: BoxData[],
  action?: ActionType
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const startX = 50;
  const startY = 200;
  const gap = 70;

  // 1. 靜態渲染
  if (!action || ["refresh", "reset", "load", "random"].includes(action.type)) {
    steps.push({
      stepNumber: 1,
      description: "Array 狀態",
      elements: createBoxes(dataList || []),
    });
    return steps;
  }

  const { type, value, index } = action;

  // ============================================
  // Search (Linear Search)
  // ============================================
  if (type === "search") {
    let found = false;
    for (let i = 0; i < dataList.length; i++) {
      // Step A: 比較中
      steps.push({
        stepNumber: steps.length + 1,
        description: `檢查 Index [${i}]: ${dataList[i].value} 是否等於 ${value}?`,
        elements: createBoxes(dataList, i, "target"), // 橘色
      });

      // Step B: 找到
      if (dataList[i].value === value) {
        found = true;
        steps.push({
          stepNumber: steps.length + 1,
          description: `找到了！在 Index [${i}]`,
          elements: createBoxes(dataList, i, "complete"), // 綠色
        });
        break;
      }
    }
    if (!found) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `未找到數值 ${value}`,
        elements: createBoxes(dataList),
      });
    }
  }

  // ============================================
  // Update (Access via Index)
  // ============================================
  else if (type === "update" && index !== undefined) {
    if (index >= 0 && index < dataList.length) {
      // Step 1: 標記位置
      // 這裡 dataList 已經是更新後的值了，我們需要一個「舊值」的狀態
      // 但為了簡化，直接顯示目標位置
      steps.push({
        stepNumber: 1,
        description: `存取 Index [${index}]`,
        elements: createBoxes(dataList, index, "target"),
      });

      // Step 2: 更新完成
      steps.push({
        stepNumber: 2,
        description: `更新 Index [${index}] 為 ${value}`,
        elements: createBoxes(dataList, index, "complete"),
      });
    }
  }

  // ============================================
  // Insert (Shift Right)
  // ============================================
  else if (type === "add") {
    const idx = index !== undefined ? index : dataList.length - 1; // 預設最後

    // dataList 是插入後的 [0, 1, new, 2, 3]
    // 我們需要還原插入前的狀態 [0, 1, 2, 3]
    const newNode = dataList[idx];
    const oldList = [...dataList];
    oldList.splice(idx, 1); // 移除新元素，變回舊列表

    // Step 1: 標記插入點之後的元素 (準備右移)
    // 視覺上：[0] [1] [2(橘)] [3(橘)] ...
    const s1Boxes = oldList.map((item, i) => {
      const b = new Box();
      b.id = item.id;
      b.value = item.value;
      b.moveTo(startX + i * gap, startY);
      b.width = 60;
      b.height = 60;
      b.description = `[${i}]`;
      if (i >= idx) b.setStatus("prepare"); // 準備移動的設為黃色/橘色
      return b;
    });

    steps.push({
      stepNumber: 1,
      description: `準備在 Index [${idx}] 插入`,
      elements: s1Boxes,
    });

    // Step 2: 右移騰出空間
    // [0] [1] [空] [2] [3]
    const s2Boxes = oldList.map((item, i) => {
      const b = new Box();
      b.id = item.id;
      b.value = item.value;
      // 如果是插入點之後的，x 座標 + 1 個 gap
      let x = startX + i * gap;
      if (i >= idx) x += gap;

      b.moveTo(x, startY);
      b.width = 60;
      b.height = 60;
      // 這裡 index 顯示有點尷尬，暫時不顯示或顯示舊 index
      b.description = i >= idx ? `[${i + 1}]` : `[${i}]`;
      if (i >= idx) b.setStatus("prepare");
      return b;
    });

    steps.push({
      stepNumber: 2,
      description: `Index [${idx}] 之後的元素右移`,
      elements: s2Boxes,
    });

    // Step 3: 放入新元素
    const s3NewBox = new Box();
    s3NewBox.id = newNode.id;
    s3NewBox.value = newNode.value;
    s3NewBox.width = 60;
    s3NewBox.height = 60;
    s3NewBox.moveTo(startX + idx * gap, startY - 80); // 上方出現
    s3NewBox.setStatus("target");
    s3NewBox.description = "New";

    steps.push({
      stepNumber: 3,
      description: `放入新元素 ${value}`,
      elements: [...s2Boxes, s3NewBox],
    });

    // Step 4: 完成
    steps.push({
      stepNumber: 4,
      description: "插入完成",
      elements: createBoxes(dataList, idx, "complete"),
    });
  }

  // ============================================
  // Delete (Shift Left)
  // ============================================
  else if (type === "delete") {
    const idx = index !== undefined ? index : -1;

    // dataList 是刪除後的
    // 還原舊列表
    const deletedNode = { id: (action as any).targetId || "del", value: value };
    const oldList = [...dataList];
    if (idx >= 0) oldList.splice(idx, 0, deletedNode);

    // Step 1: 標記要刪除的元素
    steps.push({
      stepNumber: 1,
      description: `標記 Index [${idx}] (數值 ${value})`,
      elements: createBoxes(oldList, idx, "target"),
    });

    // Step 2: 元素移除 (消失)
    const s2Boxes = oldList
      .map((item, i) => {
        if (i === idx) return null; // 被刪除的不畫
        const b = new Box();
        b.id = item.id;
        b.value = item.value;
        b.width = 60;
        b.height = 60;
        // 位置還是在舊位置
        b.moveTo(startX + i * gap, startY);
        b.description = `[${i}]`;
        // 標記需要左移的元素
        if (i > idx) b.setStatus("prepare");
        return b;
      })
      .filter(Boolean) as Box[];

    steps.push({
      stepNumber: 2,
      description: "移除元素，留下空位",
      elements: s2Boxes,
    });

    // Step 3: 左移補位 (其實就是 dataList 的標準排列)
    // 但為了動畫順暢，我們可以讓 prepare 狀態持續一下
    steps.push({
      stepNumber: 3,
      description: "後方元素左移補位",
      elements: createBoxes(dataList, -1, "complete"), // 全部畫出來，位置自動修正
    });
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

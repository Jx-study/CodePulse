import { Box } from "../../../modules/core/DataLogic/Box";
import { Status } from "../../../modules/core/DataLogic/BaseElement";
import { AnimationStep, CodeConfig } from "../../../types/animation";
import { DataStructureConfig } from "../../../types/dataStructure";
import { 
  LinearData as BoxData,
  LinearAction as ActionType,
  createBoxes as baseCreateBoxes, 
} from "./utils";

const createBoxes = (list: BoxData[], status: Status = "unfinished") => {
  return baseCreateBoxes(list, {
    startX: 100,
    startY: 200,
    gap: 70,
    status,
    getDescription: (_, i, total) => (i === total - 1 ? "Top" : ""),
  });
};

export function createStackAnimationSteps(
  dataList: BoxData[],
  action?: ActionType
): AnimationStep[] {
  console.log("Generating Stack Steps. Data:", dataList, "Action:", action);
  const steps: AnimationStep[] = [];
  const startX = 100;
  const startY = 200;
  const gap = 70;

  if (!action) {
    steps.push({
      stepNumber: 1,
      description: "Stack 狀態",
      elements: createBoxes(dataList),
      actionTag: "INITIAL",
    });
    return steps;
  }

  const { type, value } = action;

  // Push
  if (type === "add") {
    // const maxNodes = action.maxNodes || 15;

    // 如果加入新元素後超過 maxNodes，代表原本就已經滿了 (或剛好滿)
    // 注意：dataList 是執行動作後的狀態
    // if (dataList.length > maxNodes) {
    //   const oldList = dataList.slice(0, -1);
    //   steps.push({
    //     stepNumber: 1,
    //     description: `Push 失敗: 堆疊已滿 (Stack Overflow)`,
    //     elements: createBoxes(oldList),
    //     actionTag: "PUSH_IS_FULL",
    //   });
    //   return steps;
    // }

    const oldList = dataList.slice(0, -1);
    const newNode = dataList[dataList.length - 1];

    // Step 1: 顯示舊元素，新元素從右側滑入
    const s1Boxes = createBoxes(oldList);
    const s1NewBox = new Box();
    s1NewBox.id = newNode.id;
    s1NewBox.value = newNode.value;
    s1NewBox.width = 60;
    s1NewBox.height = 60;
    s1NewBox.moveTo(950, startY);
    s1NewBox.setStatus("target");
    s1NewBox.description = "New";

    steps.push({
      stepNumber: 1,
      description: `Push ${value}: 新元素準備入棧`,
      elements: [...s1Boxes, s1NewBox],
      actionTag: "PUSH_START",
    });

    // Step 2: 下放
    steps.push({
      stepNumber: 2,
      description: `Push ${value}: 放入堆疊頂端`,
      elements: createBoxes(dataList, "complete"),
      actionTag: "PUSH_WRITE",
    });
  }
  // Pop
  else if (type === "delete") {
    // 檢查是否為空 (Stack Underflow 邏輯)
    if (dataList.length === 0 && !action.value) {
      steps.push({
        stepNumber: 1,
        description: "Pop 失敗: 堆疊為空 (Stack Underflow)",
        elements: [],
        actionTag: "POP_IS_EMPTY",
      });
      return steps;
    }

    const deletedNode = {
      id: (action as any).targetId || "deleted-temp",
      value: value,
    };
    const fullList = [...dataList, deletedNode];

    // Step 1: 標記 Top (準備刪除)
    const s1Boxes = fullList.map((item, i) => {
      const b = new Box();
      b.id = item.id;
      b.value = item.value;
      b.width = 60;
      b.height = 60;
      b.moveTo(startX + i * gap, startY);

      if (i === fullList.length - 1) {
        b.setStatus("target");
        b.description = "Top";
      } else {
        b.setStatus("unfinished");
      }
      return b;
    });

    steps.push({
      stepNumber: 1,
      description: `Pop ${value}: 標記頂端元素`,
      elements: s1Boxes,
      actionTag: "POP_START",
    });

    // Step 2: 往右移除
    const s2Boxes = fullList.map((item, i) => {
      const b = new Box();
      b.id = item.id;
      b.value = item.value;
      b.width = 60;
      b.height = 60;

      if (i === fullList.length - 1) {
        // 被刪除的節點：往右移
        b.moveTo(950, startY);
        b.setStatus("target");
      } else {
        // 其他節點：位置不變
        b.moveTo(startX + i * gap, startY);
        b.setStatus("unfinished");

        // 標記新的 Top (倒數第二個)
        if (i === fullList.length - 2) b.description = "Top";
      }
      return b;
    });

    steps.push({
      stepNumber: 2,
      description: "Pop: 移出頂端元素，Top 更新",
      elements: s2Boxes,
      actionTag: "POP_DEC_TOP",
    });

    // Step 3: 消失
    steps.push({
      stepNumber: 3,
      description: "Pop 完成",
      elements: createBoxes(dataList, "complete"),
      actionTag: "POP_END",
    });
  } else if (type === "peek") {
    // 檢查是否為空
    if (dataList.length === 0) {
      steps.push({
        stepNumber: 1,
        description: "Peek 失敗: 堆疊為空",
        elements: [],
        actionTag: "PEEK_IS_EMPTY",
      });
      return steps;
    }

    const s1Boxes = dataList.map((item, i) => {
      const b = new Box();
      b.id = item.id;
      b.value = item.value;
      b.width = 60;
      b.height = 60;
      b.moveTo(startX + i * gap, startY);

      if (i === dataList.length - 1) {
        b.setStatus("prepare");
        b.description = "Top";
      } else {
        b.setStatus("unfinished");
      }
      return b;
    });

    steps.push({
      stepNumber: 1,
      description: `Peek: 標記 Top，會回傳該 value`,
      elements: s1Boxes,
      actionTag: "PEEK_CHECK_EMPTY",
    });

    const s2Boxes = dataList.map((item, i) => {
      const b = new Box();
      b.id = item.id;
      b.value = item.value;
      b.width = 60;
      b.height = 60;
      b.moveTo(startX + i * gap, startY);

      if (i === dataList.length - 1) {
        b.setStatus("complete");
        b.description = "Top";
      } else {
        b.setStatus("unfinished");
      }
      return b;
    });

    steps.push({
      stepNumber: 2,
      description: `Peek: 回傳為 ${value}`,
      elements: s2Boxes,
      actionTag: "PEEK_RETURN",
    });
  }

  return steps;
}

// 定義 Stack 的結構化代碼配置
const stackCodeConfig: CodeConfig = {
  pseudo: {
    content: `Class Stack:
  Data:
    top ← -1
    stack ← Array of Size

  Procedure push(value):
    top ← top + 1
    stack[top] ← value
  End Procedure

  Procedure pop():
    If is_empty() Then
      Return Error
    End If
    removed_value ← stack[top]
    top ← top - 1
    Return removed_value
  End Procedure

  Procedure peek():
    If is_empty() Then
      Return null
    End If
    Return stack[top]
  End Procedure`,
    mappings: {
      // TODO: animation的動作&描述與pseudo code的行號有不對應的情況，需要修正
      "INITIAL": [2, 3, 4],
      // Push 區塊
      "PUSH_START": [6],  // 進入函式並執行 is_full 檢查
      "PUSH_WRITE": [7, 8],       // 核心動作：位移與寫入
      // Pop 區塊
      "POP_START": [15],        // 開始
      "POP_CHECK_EMPTY": [12], // 進入函式並執行 is_empty 檢查
      "POP_IS_EMPTY": [13],     // 錯誤路徑：空值報錯
      "POP_READ": [17],             // TODO:讀取暫存
      "POP_DEC_TOP": [16],      // 核心動作：讀取與位移
      "POP_END": [18],              // 結束
      // Peek 區塊
      "PEEK_START": [24],
      "PEEK_CHECK_EMPTY": [21], // 進入函式並執行 is_empty 檢查
      "PEEK_IS_EMPTY": [22],    // 錯誤路徑：空值報錯
      "PEEK_RETURN": [24],          // 核心動作：回傳
    },
  },
  python: {
    content: `class Stack:
    def __init__(self, size: int):
        self.stack = []
        self.size = size
        self.top = -1

    def push(self, value: int) -> None:
        if self.top >= self.size - 1:
            raise Exception("Stack Overflow")
        self.top += 1
        self.stack.append(value)

    def pop(self) -> int:
        if self.top == -1:
            raise Exception("Stack Underflow")
        value = self.stack[self.top]
        self.top -= 1
        return value

    def peek(self) -> int:
        if self.top == -1:
            return None
        return self.stack[self.top]`,
  },
};

export const StackConfig: DataStructureConfig = {
  id: "stack",
  name: "堆疊 (Stack)",
  category: "linear",
  categoryName: "線性表",
  description: "LIFO (Last In First Out)",
  codeConfig: stackCodeConfig,
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(1)",
    timeWorst: "O(1)",
    space: "O(n)",
  },
  introduction: `堆疊是一種後進先出的資料結構...堆起來。`,
  defaultData: [
    { id: "box-1", value: 1 },
    { id: "box-2", value: 2 },
    { id: "box-3", value: 3 },
  ],
  createAnimationSteps: createStackAnimationSteps,
};

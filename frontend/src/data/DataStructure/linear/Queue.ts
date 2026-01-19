import { Box } from "../../../modules/core/DataLogic/Box";
import { Status } from "../../../modules/core/DataLogic/BaseElement";
import {
  AnimationStep,
  CodeConfig,
  DataStructureConfig,
} from "../../../types/dataStructure";

interface BoxData {
  id: string;
  value: number;
}

interface ActionType {
  type: string;
  value: number;
  mode: string; // "Enqueue", "Dequeue"
  maxNodes?: number;
}

// 定義 Queue 的結構化代碼配置
const queueCodeConfig: CodeConfig = {
  pseudo: {
    content: `Class Queue:
  Data:
    front ← 0
    rear ← -1
    size ← 0
    queue ← Array of Size
    capacity ← Size

  Procedure enqueue(value):
    If is_full() Then
      Return Error
    End If
    rear ← (rear + 1) % capacity
    queue[rear] ← value
    size ← size + 1
  End Procedure

  Procedure dequeue():
    If is_empty() Then
      Return Error
    End If
    removed_value ← queue[front]
    front ← (front + 1) % capacity
    size ← size - 1
    Return removed_value
  End Procedure

  Procedure peek():
    If is_empty() Then
      Return null
    End If
    Return queue[front]
  End Procedure`,
    mappings: {
      "INITIAL": [2, 3, 4, 5, 6],
      // Enqueue 區塊
      "ENQUEUE_START": [8, 9],
      "ENQUEUE_FULL": [9, 10],
      "ENQUEUE_UPDATE": [12, 14],
      "ENQUEUE_WRITE": [13],
      // Dequeue 區塊
      "DEQUEUE_START": [17, 18],
      "DEQUEUE_EMPTY": [18, 19],
      "DEQUEUE_READ": [21],
      "DEQUEUE_UPDATE": [22, 23],
      "DEQUEUE_END": [24],
      // Peek 區塊
      "PEEK_START": [27],
      "PEEK_CHECK_EMPTY": [28],
      "PEEK_IS_EMPTY": [29],
      "PEEK_RETURN": [31],
    },
  },
  python: {
    content: `class Queue:
    def __init__(self, capacity: int):
        self.queue = [None] * capacity
        self.capacity = capacity
        self.front = 0
        self.rear = -1
        self.size = 0

    def enqueue(self, value: int) -> None:
        if self.size >= self.capacity:
            raise Exception("Queue Overflow")
        self.rear = (self.rear + 1) % self.capacity
        self.queue[self.rear] = value
        self.size += 1

    def dequeue(self) -> int:
        if self.size == 0:
            raise Exception("Queue Underflow")
        value = self.queue[self.front]
        self.front = (self.front + 1) % self.capacity
        self.size -= 1
        return value

    def peek(self) -> int:
        if self.size == 0:
            return None
        return self.queue[self.front]`,
    mappings: {
      "INITIAL": [2, 3, 4, 5, 6, 7],
      "ENQUEUE_START": [9, 10],
      "ENQUEUE_FULL": [10, 11],
      "ENQUEUE_UPDATE": [12, 14],
      "ENQUEUE_WRITE": [13],
      "DEQUEUE_START": [16, 17],
      "DEQUEUE_EMPTY": [17, 18],
      "DEQUEUE_READ": [19],
      "DEQUEUE_UPDATE": [20, 21],
      "DEQUEUE_END": [22],
      "PEEK_START": [24, 25],
      "PEEK_CHECK_EMPTY": [25],
      "PEEK_IS_EMPTY": [26],
      "PEEK_RETURN": [27],
    },
  },
};

const createBoxes = (list: BoxData[], status: Status = "unfinished") => {
  const startX = 100;
  const startY = 200;
  const gap = 70;

  return list.map((item, i) => {
    const box = new Box();
    box.id = item.id;
    box.moveTo(startX + i * gap, startY);
    box.width = 60;
    box.height = 60;
    box.value = item.value;

    let desc = "";
    if (i === 0) desc = "Front";
    if (i === list.length - 1) desc += desc ? "/Rear" : "Rear";
    box.description = desc;
    box.setStatus(status);

    return box;
  });
};

export function createQueueAnimationSteps(
  dataList: BoxData[],
  action?: ActionType
): AnimationStep[] {
  if (dataList == undefined) {
    dataList = [];
  }
  const steps: AnimationStep[] = [];
  const startX = 100;
  const startY = 200;
  const gap = 70;

  if (!action) {
    steps.push({
      stepNumber: 1,
      description: "Queue 狀態",
      elements: createBoxes(dataList),
      actionTag: "INITIAL",
    });
    return steps;
  }

  const { type, value } = action;

  // Enqueue
  if (type === "add") {
    const maxNodes = action.maxNodes || 15;

    // 檢查 Overflow
    if (dataList.length > maxNodes) {
      const oldList = dataList.slice(0, -1);
      steps.push({
        stepNumber: 1,
        description: `Enqueue 失敗: 佇列已滿 (Queue Overflow)`,
        elements: createBoxes(oldList),
        actionTag: "ENQUEUE_FULL",
      });
      return steps;
    }

    const oldList = dataList.slice(0, -1);
    const newNode = dataList[dataList.length - 1];

    // Step 1: 新元素從右側出現
    const s1Boxes = createBoxes(oldList);
    const s1NewBox = new Box();
    s1NewBox.id = newNode.id;
    s1NewBox.value = newNode.value;
    s1NewBox.width = 60;
    s1NewBox.height = 60;
    s1NewBox.moveTo(950, startY); // 右側滑入
    s1NewBox.setStatus("target");
    s1NewBox.description = "New";

    steps.push({
      stepNumber: 1,
      description: `Enqueue ${value}: 檢查空間並更新 Rear`,
      elements: [...s1Boxes, s1NewBox],
      actionTag: "ENQUEUE_START",
    });

    // Step 2: 移入
    steps.push({
      stepNumber: 2,
      description: `Enqueue ${value}: 寫入數據並更新 Size`,
      elements: createBoxes(dataList, "complete"),
      actionTag: "ENQUEUE_WRITE",
    });
  }
  // Dequeue
  else if (type === "delete") {
    // 檢查是否為空 (Queue Underflow)
    if (dataList.length === 0 && !action.value) {
      steps.push({
        stepNumber: 1,
        description: "Dequeue 失敗: 佇列為空 (Queue Underflow)",
        elements: [],
        actionTag: "DEQUEUE_EMPTY",
      });
      return steps;
    }

    // dataList 是刪除後的 [1...N]
    // 重建被刪除的 Front
    const deletedNode = {
      id: (action as any).targetId || "del-temp",
      value: value,
    };
    const fullList = [deletedNode, ...dataList];

    // Step 1: 標記 Front
    const s1Boxes = fullList.map((item, i) => {
      const b = new Box();
      b.id = item.id;
      b.value = item.value;
      b.width = 60;
      b.height = 60;
      b.moveTo(startX + i * gap, startY);

      let desc = "";
      if (i === 0) desc = "Front";
      else if (i === fullList.length - 1) desc = "Rear";
      b.description = desc;

      if (i === 0) b.setStatus("target"); // 標記要刪除的
      else b.setStatus("unfinished");
      return b;
    });

    steps.push({
      stepNumber: 1,
      description: "Dequeue: 檢查佇列是否為空，標記 Front",
      elements: s1Boxes,
      actionTag: "DEQUEUE_START",
    });

    // Step 2: Front 消失 (往左移)，其餘暫時不動
    const s2Boxes = fullList.map((item, i) => {
      const b = new Box();
      b.id = item.id;
      b.value = item.value;
      b.width = 60;
      b.height = 60;
      if (i === 0) {
        // 被刪除的節點：往左移
        b.moveTo(startX - 150, startY);
        b.setStatus("target");
      } else {
        // 其他節點：位置不變 (i * gap)
        b.moveTo(startX + i * gap, startY);
        b.setStatus("unfinished");

        if (i === fullList.length - 1) b.description = "Rear";
      }
      return b;
    });

    steps.push({
      stepNumber: 2,
      description: "Dequeue: 讀取數據並更新 Front 指標",
      elements: s2Boxes,
      actionTag: "DEQUEUE_READ",
    });

    // Step 3: 全體左移
    steps.push({
      stepNumber: 3,
      description: "Dequeue 完成: 更新 Size 並重整位置",
      elements: createBoxes(dataList, "complete"),
      actionTag: "DEQUEUE_END",
    });
  } else if (type === "peek") {
    // 檢查是否為空
    if (dataList.length === 0) {
      steps.push({
        stepNumber: 1,
        description: "Peek 失敗: 佇列為空",
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

      if (i === 0) {
        b.setStatus("prepare");
        b.description = "Front";
      } else {
        b.setStatus("unfinished");
      }
      return b;
    });

    steps.push({
      stepNumber: 1,
      description: `Peek: 檢查是否為空，標記 Front`,
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

      if (i === 0) {
        b.setStatus("complete");
        b.description = "Front";
      } else {
        b.setStatus("unfinished");
      }
      return b;
    });

    steps.push({
      stepNumber: 2,
      description: `Peek: 回傳前端元素 ${value}`,
      elements: s2Boxes,
      actionTag: "PEEK_RETURN",
    });
  }

  return steps;
}

export const QueueConfig: DataStructureConfig = {
  id: "queue",
  name: "佇列 (Queue)",
  category: "linear",
  categoryName: "線性表",
  description: "FIFO (First In First Out)",
  pseudoCode: `// 已移動至 codeConfig`,
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(1)",
    timeWorst: "O(1)",
    space: "O(n)",
  },
  introduction: `佇列是一種先進先出的資料結構，類似於排隊。最早進入佇列的元素最先被移除。核心操作為入列 (Enqueue) 與出列 (Dequeue)。`,
  codeConfig: queueCodeConfig,
  defaultData: [
    { id: "box-0", value: 1 },
    { id: "box-1", value: 2 },
    { id: "box-2", value: 3 },
  ],
  createAnimationSteps: createQueueAnimationSteps,
};

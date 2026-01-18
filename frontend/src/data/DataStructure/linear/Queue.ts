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
  mode: string; // "Enqueue", "Dequeue"
}

const createBoxes = (
  list: BoxData[],
  highlightId: string | null = null,
  status: Status = "unfinished"
) => {
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

    if (item.id === highlightId) box.setStatus("target");
    else box.setStatus(status);

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
    });
    return steps;
  }

  const { type, value } = action;

  // Enqueue (Add Tail)
  if (type === "add") {
    const oldList = dataList.slice(0, -1);
    const newNode = dataList[dataList.length - 1];

    // Step 1: 新元素從右側出現
    const s1Boxes = createBoxes(oldList);
    const s1NewBox = new Box();
    s1NewBox.id = newNode.id;
    s1NewBox.value = newNode.value;
    s1NewBox.width = 60;
    s1NewBox.height = 60;
    s1NewBox.moveTo(startX + oldList.length * gap + 100, startY); // 右側
    s1NewBox.setStatus("target");
    s1NewBox.description = "New";

    steps.push({
      stepNumber: 1,
      description: `Enqueue ${value}: 新元素準備入列`,
      elements: [...s1Boxes, s1NewBox],
    });

    // Step 2: 移入
    steps.push({
      stepNumber: 2,
      description: `Enqueue ${value} 完成`,
      elements: createBoxes(dataList, newNode.id, "complete"),
    });
  }
  // Dequeue (Delete Head)
  else if (type === "delete") {
    // dataList 是刪除後的 [1...N]
    // 重建被刪除的 Front
    const deletedNode = { id: "del-temp", value: value };
    const fullList = [deletedNode, ...dataList];

    // Step 1: 標記 Front
    // 這裡我們手動建立 fullList 的位置
    const s1Boxes = fullList.map((item, i) => {
      const b = new Box();
      b.id = item.id;
      b.value = item.value;
      b.width = 60;
      b.height = 60;
      b.moveTo(startX + i * gap, startY);
      if (i === 0) {
        b.setStatus("target");
        b.description = "Front";
      } else {
        b.setStatus("unfinished");
      }
      return b;
    });

    steps.push({
      stepNumber: 1,
      description: "Dequeue: 標記 Front 元素",
      elements: s1Boxes,
    });

    // Step 2: Front 消失 (下沉或淡出)，其餘暫時不動
    const s2Boxes = dataList.map((item, i) => {
      // dataList 的第 0 個其實是原本的第 1 個，所以位置要 +1 gap
      const b = new Box();
      b.id = item.id;
      b.value = item.value;
      b.width = 60;
      b.height = 60;
      b.moveTo(startX + (i + 1) * gap, startY);
      b.setStatus("prepare");
      return b;
    });

    steps.push({
      stepNumber: 2,
      description: "Dequeue: 移除 Front",
      elements: s2Boxes,
    });

    // Step 3: 全體左移
    steps.push({
      stepNumber: 3,
      description: "調整位置",
      elements: createBoxes(dataList, null, "complete"),
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
  pseudoCode: `class box:
    value: any
    next: box

class Queue:
    head: box

    // 在頭部插入節點
    insertAtHead(value):
        newbox = new box(value)
        newbox.next = head
        head = newbox

    // 在尾部插入節點
    insertAtTail(value):
        newbox = new box(value)
        if head is null:
            head = newbox
        else:
            current = head
            while current.next is not null:
                current = current.next
            current.next = newbox

    // 刪除節點
    deletebox(value):
        if head is null:
            return
        if head.value == value:
            head = head.next
            return
        current = head
        while current.next is not null:
            if current.next.value == value:
                current.next = current.next.next
                return
            current = current.next

    // 遍歷鏈表
    traverse():
        current = head
        while current is not null:
            print(current.value)
            current = current.next`,
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(1)",
    timeWorst: "O(1)",
    space: "O(n)",
  },
  introduction: `佇列是一種先進先出的資料結構...`,
  defaultData: [
    { id: "box-0", value: 1 },
    { id: "box-1", value: 2 },
    { id: "box-2", value: 3 },
  ],
  createAnimationSteps: createQueueAnimationSteps,
};

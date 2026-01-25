import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { AnimationStep } from "@/types/animation";
import { DataStructureConfig } from "@/types/dataStructure";
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
    });
    return steps;
  }

  const { type, value } = action;

  // Push
  if (type === "add") {
    // dataList 已經包含新元素 (在最後面)
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
    });

    // Step 2: 下放
    steps.push({
      stepNumber: 2,
      description: `Push ${value}: 放入堆疊頂端`,
      elements: createBoxes(dataList, "complete"),
    });
  }
  // Pop
  else if (type === "delete") {
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
    });

    // Step 3: 消失
    steps.push({
      stepNumber: 3,
      description: "Pop 完成",
      elements: createBoxes(dataList, "complete"),
    });
  } else if (type === "peek") {
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
    });
  }

  return steps;
}

export const StackConfig: DataStructureConfig = {
  id: "stack",
  name: "堆疊 (Stack)",
  category: "linear",
  categoryName: "線性表",
  description: "LIFO (Last In First Out)",
  pseudoCode: `class box:
    value: any
    next: box

class Stack:
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
  introduction: `堆疊是一種後進先出的資料結構...堆起來。`,
  defaultData: [
    { id: "box-1", value: 1 },
    { id: "box-2", value: 2 },
    { id: "box-3", value: 3 },
  ],
  createAnimationSteps: createStackAnimationSteps,
};

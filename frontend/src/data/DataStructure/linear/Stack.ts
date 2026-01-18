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
  mode: string; // "Push", "Pop"
}

const createBoxes = (
  list: BoxData[],
  highlightIndex: number = -1,
  status: Status = "unfinished"
) => {
  const startX = 100;
  const startY = 200;
  const gap = 70;

  return list.map((item, i) => {
    const box = new Box();
    box.id = item.id;
    // Stack 視覺化：橫向排列 (0 是底部，最後一個是頂部)
    box.moveTo(startX + i * gap, startY);
    box.width = 60;
    box.height = 60;
    box.value = item.value;
    box.description = i === list.length - 1 ? "Top" : "";

    if (i === highlightIndex) box.setStatus("target");
    else
      box.setStatus(
        status === "unfinished" && i === highlightIndex ? "target" : status
      );

    return box;
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

    // Step 1: 舊元素不動，新元素出現在上方
    const s1Boxes = createBoxes(oldList);
    const s1NewBox = new Box();
    s1NewBox.id = newNode.id;
    s1NewBox.value = newNode.value;
    s1NewBox.width = 60;
    s1NewBox.height = 60;
    s1NewBox.moveTo(startX + oldList.length * gap, startY - 100); // 上方
    s1NewBox.setStatus("target");
    s1NewBox.description = "New";

    steps.push({
      stepNumber: 1,
      description: `Push ${value}: 新元素出現`,
      elements: [...s1Boxes, s1NewBox],
    });

    // Step 2: 下放
    steps.push({
      stepNumber: 2,
      description: `Push ${value}: 放入堆疊頂端`,
      elements: createBoxes(dataList, dataList.length - 1),
    });
  }
  // Pop
  else if (type === "delete") {
    //因為沒有傳入被刪除的節點資訊，我們只能做簡單的消失動畫
    // 更好的做法是在 useDataStructureLogic 傳入 targetId 和 value
    // 這裡假設 action.value 是被刪除的值

    // 重建被刪除的節點 (ID 暫時用 fake，如果能從 action 傳入最好)
    const deletedNode = { id: "deleted-temp", value: value };
    const fullList = [...dataList, deletedNode];

    // Step 1: 標記 Top (準備刪除)
    steps.push({
      stepNumber: 1,
      description: "Pop: 標記頂端元素",
      elements: createBoxes(fullList, fullList.length - 1, "target"),
    });

    // Step 2: 移出 (上浮)
    const s2Boxes = createBoxes(dataList); // 剩下的
    const s2DelBox = new Box();
    s2DelBox.id = deletedNode.id;
    s2DelBox.value = deletedNode.value;
    s2DelBox.width = 60;
    s2DelBox.height = 60;
    s2DelBox.moveTo(startX + dataList.length * gap, startY - 100);
    s2DelBox.setStatus("target");

    steps.push({
      stepNumber: 2,
      description: "Pop: 移出頂端元素",
      elements: [...s2Boxes, s2DelBox],
    });

    // Step 3: 消失
    steps.push({
      stepNumber: 3,
      description: "Pop 完成",
      elements: createBoxes(dataList, -1, "complete"),
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

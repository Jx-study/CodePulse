import { Box } from "../../../modules/core/DataLogic/Box";
import { Status } from "../../../modules/core/DataLogic/BaseElement";
import {
  AnimationStep,
  DataStructureConfig,
} from "../../../types/dataStructure";

export function createStackAnimationSteps(): AnimationStep[] {
  const steps: AnimationStep[] = [];

  const createboxs = (
    boxCount: number,
    values: number[],
    statusMap: { [id: string]: Status } = {},
    startX: number = 100
  ) => {
    const boxs: Box[] = [];
    for (let i = 0; i < boxCount; i++) {
      const box = new Box();
      box.id = `box-${i}`;
      box.moveTo(startX + i * 120, 200);
      box.width = 80;
      box.height = 60;
      box.value = values[i];
      box.description = `${values[i]}`;
      box.setStatus(statusMap[box.id] || "unfinished");
      boxs.push(box);
    }
    return boxs;
  };

  return steps;
}

/**
 * 鏈表數據結構配置
 */
export const StackConfig: DataStructureConfig = {
  id: "Stack",
  name: "堆疊 (Stack)",
  category: "linear",
  categoryName: "線性表",
  description: "動態的線性數據結構",
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
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(1)",
  },
  introduction: `堆起來。`,
  createAnimationSteps: createStackAnimationSteps,
};

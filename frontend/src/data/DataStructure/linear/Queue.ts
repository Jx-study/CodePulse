import { Box } from "../../../modules/core/DataLogic/Box";
import { Status } from "../../../modules/core/DataLogic/BaseElement";
import {
  AnimationStep,
  DataStructureConfig,
} from "../../../types/dataStructure";

export function createQueueAnimationSteps(): AnimationStep[] {
  const steps: AnimationStep[] = [];

  const createBoxes = (
    boxCount: number,
    values: number[],
    statusMap: { [id: string]: Status } = {},
    startX: number = 100
  ) => {
    const boxs: Box[] = [];
    for (let i = 0; i < boxCount; i++) {
      const box = new Box();
      box.id = `box-${i}`;
      box.moveTo(startX + i * 80, 200);
      box.width = 60;
      box.height = 60;
      box.value = values[i];
      box.description = `${i}`;
      box.setStatus(statusMap[box.id] || "unfinished");
      boxs.push(box);
    }
    return boxs;
  };

  // Step 1: 初始佇列
  steps.push({
    stepNumber: 1,
    description: "初始佇列：1 → 2 → 3 → null",
    elements: createBoxes(3, [4, 5, 6]),
  });

  return steps;
}

/**
 * 鏈表數據結構配置
 */
export const QueueConfig: DataStructureConfig = {
  id: "Queue",
  name: "佇列 (Queue)",
  category: "linear",
  categoryName: "線性表",
  description: "動態的線性數據結構",
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
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(1)",
  },
  introduction: `AAA`,
  createAnimationSteps: createQueueAnimationSteps,
};

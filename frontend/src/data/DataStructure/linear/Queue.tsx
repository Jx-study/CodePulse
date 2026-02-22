import React from "react";
import { Box } from "@/modules/core/DataLogic/Box";
import { Pointer } from "@/modules/core/DataLogic/Pointer";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import {
  LinearData as BoxData,
  LinearAction as ActionType,
  createBoxes as baseCreateBoxes,
} from "./utils";
import { QueueActionBar } from "./QueueActionBar";

const TAGS = {
  INIT: "INIT",

  ENQUEUE_START: "ENQUEUE_START",
  ENQUEUE_INC_REAR: "ENQUEUE_INC_REAR",
  ENQUEUE_ASSIGN: "ENQUEUE_ASSIGN",
  ENQUEUE_COMPLETE: "ENQUEUE_COMPLETE",

  DEQUEUE_START: "DEQUEUE_START",
  DEQUEUE_CHECK_EMPTY: "DEQUEUE_CHECK_EMPTY",
  DEQUEUE_ERROR: "DEQUEUE_ERROR",
  DEQUEUE_GET_VALUE: "DEQUEUE_GET_VALUE",
  DEQUEUE_SHIFT: "DEQUEUE_SHIFT",
  DEQUEUE_DEC_REAR: "DEQUEUE_DEC_REAR",
  DEQUEUE_RETURN: "DEQUEUE_RETURN",
  DEQUEUE_COMPLETE: "DEQUEUE_COMPLETE",

  PEEK_START: "PEEK_START",
  PEEK_CHECK_EMPTY: "PEEK_CHECK_EMPTY",
  PEEK_ERROR: "PEEK_ERROR",
  PEEK_RETURN: "PEEK_RETURN",
  PEEK_COMPLETE: "PEEK_COMPLETE",
};

const createBoxes = (list: BoxData[], status: Status = Status.Unfinished) => {
  return baseCreateBoxes(list, {
    startX: 100,
    startY: 200,
    gap: 70,
    status,
    getDescription: (_, i) => String(i),
  });
};

const createQueuePointers = (
  frontIndex: number,
  rearIndex: number,
  startX: number,
  startY: number,
  gap: number,
) => {
  const pointers: Pointer[] = [];

  if (frontIndex >= 0) {
    const frontPtr = new Pointer("Front");
    frontPtr.id = `front-pointer`;

    const xOffset = frontIndex === rearIndex ? -20 : 0;
    frontPtr.moveTo(startX + frontIndex * gap + xOffset, startY + 50);
    pointers.push(frontPtr);
  }

  const rearPtr = new Pointer("Rear");
  rearPtr.id = `rear-pointer`;
  const rearXOffset = frontIndex === rearIndex ? 20 : 0;
  rearPtr.moveTo(startX + rearIndex * gap + rearXOffset, startY + 50);
  pointers.push(rearPtr);

  return pointers;
};

export function createQueueAnimationSteps(
  dataList: BoxData[],
  action?: ActionType,
): AnimationStep[] {
  if (dataList == undefined) {
    dataList = [];
  }
  const steps: AnimationStep[] = [];
  const startX = 100;
  const startY = 200;
  const gap = 70;

  if (!action) {
    const size = dataList.length;
    const rear = size - 1;
    steps.push({
      stepNumber: 1,
      description: "Queue 初始化",
      elements: [
        ...createBoxes(dataList),
        ...createQueuePointers(0, rear, startX, startY, gap),
      ],
      actionTag: TAGS.INIT,
      variables: { front: 0, rear: rear },
    });
    return steps;
  }

  const { type, value } = action;

  if (type === "add") {
    const oldList = dataList.slice(0, -1);
    const newNode = dataList[dataList.length - 1];
    let currentRear = oldList.length - 1;

    const s1Boxes = createBoxes(oldList);
    const s1NewBox = new Box();
    s1NewBox.id = newNode.id;
    s1NewBox.value = newNode.value;
    s1NewBox.width = 60;
    s1NewBox.height = 60;
    s1NewBox.moveTo(950, startY);
    s1NewBox.setStatus(Status.Prepare);
    s1NewBox.description = "New";

    steps.push({
      stepNumber: 1,
      description: `Enqueue(${value}): 準備入列`,
      elements: [
        ...s1Boxes,
        s1NewBox,
        ...createQueuePointers(0, currentRear, startX, startY, gap),
      ],
      actionTag: TAGS.ENQUEUE_START,
      variables: { front: 0, rear: currentRear, value },
    });

    currentRear++;
    const s2Boxes = createBoxes(oldList);
    const emptyBox = new Box();
    emptyBox.id = "empty-slot";
    emptyBox.value = undefined;
    emptyBox.width = 60;
    emptyBox.height = 60;
    emptyBox.moveTo(startX + currentRear * gap, startY);
    emptyBox.setStatus(Status.Inactive);
    emptyBox.borderStyle = "dashed";
    emptyBox.description = String(currentRear);

    const s2NewBox = new Box();
    Object.assign(s2NewBox, s1NewBox);

    steps.push({
      stepNumber: 2,
      description: `rear = rear + 1 (現在 rear 指向 ${currentRear})`,
      elements: [
        ...s2Boxes,
        emptyBox,
        s2NewBox,
        ...createQueuePointers(0, currentRear, startX, startY, gap),
      ],
      actionTag: TAGS.ENQUEUE_INC_REAR,
      variables: { front: 0, rear: currentRear, value },
    });

    const s3Boxes = createBoxes(oldList);
    const s3NewBox = new Box();
    s3NewBox.id = newNode.id;
    s3NewBox.value = newNode.value;
    s3NewBox.width = 60;
    s3NewBox.height = 60;
    s3NewBox.moveTo(startX + currentRear * gap, startY);
    s3NewBox.setStatus(Status.Target);
    s3NewBox.description = String(currentRear);

    steps.push({
      stepNumber: 3,
      description: `queue[rear] = ${value}`,
      elements: [
        ...s3Boxes,
        s3NewBox,
        ...createQueuePointers(0, currentRear, startX, startY, gap),
      ],
      actionTag: TAGS.ENQUEUE_ASSIGN,
      variables: { front: 0, rear: currentRear, value },
    });

    steps.push({
      stepNumber: 4,
      description: "Enqueue 完成",
      elements: [
        ...createBoxes(dataList, Status.Complete),
        ...createQueuePointers(0, currentRear, startX, startY, gap),
      ],
      actionTag: TAGS.ENQUEUE_COMPLETE,
      variables: { front: 0, rear: currentRear, value },
    });
  } else if (type === "delete") {
    if (value === undefined) {
      steps.push({
        stepNumber: 1,
        description: "Dequeue: 佇列為空",
        elements: [...createQueuePointers(0, -1, startX, startY, gap)],
        actionTag: TAGS.DEQUEUE_CHECK_EMPTY,
        variables: { front: 0, rear: -1 },
      });
      steps.push({
        stepNumber: 2,
        description: "錯誤: 佇列下溢 (Queue Underflow)",
        elements: [...createQueuePointers(0, -1, startX, startY, gap)],
        actionTag: TAGS.DEQUEUE_ERROR,
        variables: { front: 0, rear: -1 },
      });
      return steps;
    }

    const deletedNode = {
      id: (action as any).targetId || "del-temp",
      value: value,
    };

    const fullList = [deletedNode, ...dataList];
    const oldRear = fullList.length - 1;

    steps.push({
      stepNumber: 1,
      description: "Dequeue(): 檢查是否為空",
      elements: [
        ...createBoxes(fullList),
        ...createQueuePointers(0, oldRear, startX, startY, gap),
      ],
      actionTag: TAGS.DEQUEUE_CHECK_EMPTY,
      variables: { front: 0, rear: oldRear },
    });

    const s2Boxes = createBoxes(fullList);
    s2Boxes[0].setStatus(Status.Unfinished);
    s2Boxes[0].appearAnim = "instant";
    s2Boxes[0].id = `${deletedNode.id}-remove`;

    const movingBox = new Box();
    movingBox.id = `${deletedNode.id}`;
    movingBox.value = deletedNode.value;
    movingBox.width = 60;
    movingBox.height = 60;
    movingBox.description = "removed_value";
    movingBox.moveTo(startX - gap, startY);
    movingBox.setStatus(Status.Prepare);

    steps.push({
      stepNumber: 2,
      description: `removed_value = queue[front] (${value})`,
      elements: [
        ...s2Boxes,
        movingBox,
        ...createQueuePointers(0, oldRear, startX, startY, gap),
      ],
      actionTag: TAGS.DEQUEUE_GET_VALUE,
      variables: { front: 0, rear: oldRear, removed_value: value },
    });

    const s3Boxes: Box[] = [];

    dataList.forEach((item, i) => {
      const b = new Box();
      b.id = item.id;
      b.value = item.value;
      b.width = 60;
      b.height = 60;
      b.description = String(i);
      b.moveTo(startX + i * gap, startY);
      b.setStatus(Status.Unfinished);
      s3Boxes.push(b);
    });

    const lastNode = fullList[fullList.length - 1];
    const lastBoxGhost = new Box();
    lastBoxGhost.id = `${lastNode.id}-ghost`;
    lastBoxGhost.value = lastNode.value;
    lastBoxGhost.width = 60;
    lastBoxGhost.height = 60;
    lastBoxGhost.description = String(oldRear);
    lastBoxGhost.moveTo(startX + oldRear * gap, startY);
    lastBoxGhost.setStatus(Status.Unfinished);
    lastBoxGhost.appearAnim = "instant";

    steps.push({
      stepNumber: 3,
      description: "Shift Left: 所有元素往左移動",
      elements: [
        ...s3Boxes,
        lastBoxGhost,
        movingBox,
        ...createQueuePointers(0, oldRear, startX, startY, gap),
      ],
      actionTag: TAGS.DEQUEUE_SHIFT,
      variables: { front: 0, rear: oldRear, removed_value: value },
    });

    const newRear = oldRear - 1;

    lastBoxGhost.setStatus(Status.Inactive);
    lastBoxGhost.borderStyle = "dashed";

    steps.push({
      stepNumber: 4,
      description: `rear = rear - 1 (現在 rear 指向 ${newRear})`,
      elements: [
        ...s3Boxes,
        lastBoxGhost,
        movingBox,
        ...createQueuePointers(0, newRear, startX, startY, gap),
      ],
      actionTag: TAGS.DEQUEUE_DEC_REAR,
      variables: { front: 0, rear: newRear, removed_value: value },
    });

    const s5MovingBox = new Box();
    Object.assign(s5MovingBox, movingBox);
    s5MovingBox.setStatus(Status.Target);

    steps.push({
      stepNumber: 5,
      description: `標記回傳值 ${value}`,
      elements: [
        ...s3Boxes,
        lastBoxGhost,
        s5MovingBox,
        ...createQueuePointers(0, newRear, startX, startY, gap),
      ],
      actionTag: TAGS.DEQUEUE_RETURN,
      variables: { front: 0, rear: newRear, removed_value: value },
    });

    steps.push({
      stepNumber: 6,
      description: "Dequeue 完成",
      elements: [
        ...createBoxes(dataList, Status.Complete),
        ...createQueuePointers(0, newRear, startX, startY, gap),
      ],
      actionTag: TAGS.DEQUEUE_COMPLETE,
      variables: { front: 0, rear: newRear, removed_value: value },
    });
  } else if (type === "peek") {
    const size = dataList.length;
    const rear = size - 1;

    if (size === 0) {
      steps.push({
        stepNumber: 1,
        description: "Peek: 佇列為空",
        elements: [...createQueuePointers(0, -1, startX, startY, gap)],
        actionTag: TAGS.PEEK_CHECK_EMPTY,
        variables: { front: 0, rear: -1 },
      });
      steps.push({
        stepNumber: 2,
        description: "回傳 Null",
        elements: [...createQueuePointers(0, -1, startX, startY, gap)],
        actionTag: TAGS.PEEK_ERROR,
        variables: { front: 0, rear: -1 },
      });
      return steps;
    }

    steps.push({
      stepNumber: 1,
      description: "Peek(): 檢查是否為空",
      elements: [
        ...createBoxes(dataList),
        ...createQueuePointers(0, rear, startX, startY, gap),
      ],
      actionTag: TAGS.PEEK_CHECK_EMPTY,
      variables: { front: 0, rear: rear },
    });

    const s2Boxes = createBoxes(dataList);
    s2Boxes[0].setStatus(Status.Target);

    steps.push({
      stepNumber: 2,
      description: `回傳 queue[front] (${value})`,
      elements: [
        ...s2Boxes,
        ...createQueuePointers(0, rear, startX, startY, gap),
      ],
      actionTag: TAGS.PEEK_RETURN,
      variables: { front: 0, rear: rear, value },
    });

    steps.push({
      stepNumber: 3,
      description: "Peek 完成",
      elements: [
        ...createBoxes(dataList, Status.Complete),
        ...createQueuePointers(0, rear, startX, startY, gap),
      ],
      actionTag: TAGS.PEEK_COMPLETE,
      variables: { front: 0, rear: rear, value },
    });
  }

  return steps;
}

const queueCodeConfig: CodeConfig = {
  pseudo: {
    content: `Class Queue:
  Data:
    front ← 0
    rear ← -1
    queue ← Array of Size

  Procedure enqueue(value):
    rear ← rear + 1
    queue[rear] ← value
  End Procedure

  Procedure dequeue():
    If is_empty() Then
      Return Error
    End If
    removed_value ← queue[front]
    shift_left()
    rear ← rear - 1
    Return removed_value
  End Procedure

  Procedure peek():
    If is_empty() Then
      Return null
    End If
    Return queue[front]
  End Procedure`,
    mappings: {
      [TAGS.INIT]: [2, 3, 4, 5],
      [TAGS.ENQUEUE_START]: [7],
      [TAGS.ENQUEUE_INC_REAR]: [8],
      [TAGS.ENQUEUE_ASSIGN]: [9],
      [TAGS.ENQUEUE_COMPLETE]: [10],
      [TAGS.DEQUEUE_START]: [12],
      [TAGS.DEQUEUE_CHECK_EMPTY]: [13],
      [TAGS.DEQUEUE_ERROR]: [14],
      [TAGS.DEQUEUE_GET_VALUE]: [16],
      [TAGS.DEQUEUE_SHIFT]: [17],
      [TAGS.DEQUEUE_DEC_REAR]: [18],
      [TAGS.DEQUEUE_RETURN]: [19],
      [TAGS.DEQUEUE_COMPLETE]: [20],
      [TAGS.PEEK_START]: [22],
      [TAGS.PEEK_CHECK_EMPTY]: [23],
      [TAGS.PEEK_ERROR]: [24],
      [TAGS.PEEK_RETURN]: [26],
      [TAGS.PEEK_COMPLETE]: [27],
    },
  },
  python: {
    content: `class Queue:
    def __init__(self, capacity: int):
        self.queue = []
        self.front = 0
        self.rear = -1

    def enqueue(self, value: int) -> None:
        self.rear += 1
        self.queue.append(value)

    def dequeue(self) -> int:
        if len(self.queue) == 0:
            raise Exception("Queue Underflow")
        value = self.queue[0]
        self.queue.pop(0)
        self.rear -= 1
        return value

    def peek(self) -> int:
        if len(self.queue) == 0:
            return None
        return self.queue[0]`,
  },
};

export const QueueConfig: LevelImplementationConfig = {
  id: "queue",
  type: "dataStructure",
  name: "佇列 (Queue)",
  categoryName: "線性表",
  description: "FIFO (First In First Out)",
  codeConfig: queueCodeConfig,
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(n)",
  },
  introduction: `佇列是一種先進先出的資料結構，類似於排隊。最早進入佇列的元素最先被移除。在此實作中，我們展示基於陣列的線性移動 (Shifting) 實作。`,
  defaultData: [
    { id: "box-0", value: 1 },
    { id: "box-1", value: 2 },
    { id: "box-2", value: 3 },
  ],
  createAnimationSteps: createQueueAnimationSteps,
  renderActionBar: (props) => <QueueActionBar {...(props as any)} />,
  relatedProblems: [
    {
      id: 225,
      title: "Implement Stack using Queues",
      concept: "佇列應用：用佇列實作堆疊的功能",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/implement-stack-using-queues/",
    },
    {
      id: 622,
      title: "Design Circular Queue",
      concept: "佇列設計：實作環形佇列 (Circular Queue)",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/design-circular-queue/",
    },
    {
      id: 933,
      title: "Number of Recent Calls",
      concept: "佇列的實際應用：計算最近請求數量 (滑動窗口)",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/number-of-recent-calls/",
    },
  ],
};

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

const TAGS = {
  INIT: "INIT",

  PUSH_START: "PUSH_START",
  PUSH_INC_TOP: "PUSH_INC_TOP",
  PUSH_ASSIGN: "PUSH_ASSIGN",
  PUSH_COMPLETE: "PUSH_COMPLETE",

  POP_START: "POP_START",
  POP_CHECK_EMPTY: "POP_CHECK_EMPTY",
  POP_ERROR: "POP_ERROR",
  POP_GET_VALUE: "POP_GET_VALUE",
  POP_DEC_TOP: "POP_DEC_TOP",
  POP_RETURN: "POP_RETURN",
  POP_COMPLETE: "POP_COMPLETE",

  PEEK_START: "PEEK_START",
  PEEK_CHECK_EMPTY: "PEEK_CHECK_EMPTY",
  PEEK_ERROR: "PEEK_ERROR",
  PEEK_RETURN: "PEEK_RETURN",
  PEEK_COMPLETE: "PEEK_COMPLETE",
};

const createBoxes = (list: BoxData[], status: Status = "unfinished") => {
  return baseCreateBoxes(list, {
    startX: 100,
    startY: 200,
    gap: 70,
    status,
    getDescription: (_, i, total) => String(i),
  });
};

const createTopPointer = (
  index: number,
  startX: number,
  startY: number,
  gap: number,
) => {
  const ptr = new Pointer("Top");

  ptr.moveTo(startX + index * gap, startY + 50);
  return ptr;
};

export function createStackAnimationSteps(
  dataList: BoxData[],
  action?: ActionType,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const startX = 100;
  const startY = 200;
  const gap = 70;

  if (!action) {
    const currentTop = dataList.length - 1;
    steps.push({
      stepNumber: 1,
      description: "Stack 初始化",
      elements: [
        ...createBoxes(dataList),
        createTopPointer(currentTop, startX, startY, gap),
      ],
      actionTag: TAGS.INIT,
      variables: { top: currentTop, size: dataList.length },
    });
    return steps;
  }

  const { type, value } = action;

  if (type === "add") {
    const oldList = dataList.slice(0, -1);
    const newNode = dataList[dataList.length - 1];
    let currentTop = oldList.length - 1;

    const s1Boxes = createBoxes(oldList);
    const s1NewBox = new Box();
    s1NewBox.id = newNode.id;
    s1NewBox.value = newNode.value;
    s1NewBox.width = 60;
    s1NewBox.height = 60;
    s1NewBox.moveTo(950, startY);
    s1NewBox.setStatus("prepare");
    s1NewBox.description = "New";

    steps.push({
      stepNumber: 1,
      description: `Push(${value}): 準備推入新元素`,
      elements: [
        ...s1Boxes,
        s1NewBox,
        createTopPointer(currentTop, startX, startY, gap),
      ],
      actionTag: TAGS.PUSH_START,
      variables: { top: currentTop, value },
    });

    currentTop++;
    const s2Boxes = createBoxes(oldList);

    const emptyBox = new Box();
    emptyBox.id = "empty-slot";
    emptyBox.value = undefined;
    emptyBox.width = 60;
    emptyBox.height = 60;
    emptyBox.moveTo(startX + currentTop * gap, startY);
    emptyBox.setStatus("inactive");
    emptyBox.borderStyle = "dashed";
    emptyBox.description = String(currentTop);

    const s2NewBox = new Box();
    Object.assign(s2NewBox, s1NewBox);

    const s2Pointer = createTopPointer(currentTop, startX, startY, gap);

    steps.push({
      stepNumber: 2,
      description: `top = top + 1 (現在 top 指向 ${currentTop})`,
      elements: [...s2Boxes, emptyBox, s2NewBox, s2Pointer],
      actionTag: TAGS.PUSH_INC_TOP,
      variables: { top: currentTop, value },
    });

    const s3Boxes = createBoxes(oldList);
    const s3NewBox = new Box();
    s3NewBox.id = newNode.id;
    s3NewBox.value = newNode.value;
    s3NewBox.width = 60;
    s3NewBox.height = 60;
    s3NewBox.moveTo(startX + currentTop * gap, startY);
    s3NewBox.setStatus("target");
    s3NewBox.description = String(currentTop);

    const s3Pointer = createTopPointer(currentTop, startX, startY, gap);

    steps.push({
      stepNumber: 3,
      description: `stack[${currentTop}] = ${value}`,
      elements: [...s3Boxes, s3NewBox, s3Pointer],
      actionTag: TAGS.PUSH_ASSIGN,
      variables: { top: currentTop, value },
    });

    steps.push({
      stepNumber: 4,
      description: "Push 完成",
      elements: [
        ...createBoxes(dataList, "complete"),
        createTopPointer(currentTop, startX, startY, gap),
      ],
      actionTag: TAGS.PUSH_COMPLETE,
      variables: { top: currentTop, value },
    });
  } else if (type === "delete") {
    if (value === undefined) {
      steps.push({
        stepNumber: 1,
        description: "Pop: 堆疊為空",
        elements: [createTopPointer(-1, startX, startY, gap)],
        actionTag: TAGS.POP_CHECK_EMPTY,
        variables: { top: -1 },
      });
      steps.push({
        stepNumber: 2,
        description: "錯誤: 堆疊下溢 (Stack Underflow)",
        elements: [createTopPointer(-1, startX, startY, gap)],
        actionTag: TAGS.POP_ERROR,
        variables: { top: -1 },
      });
      return steps;
    }

    const deletedNode = {
      id: (action as any).targetId || "deleted-temp",
      value: value,
    };
    const fullList = [...dataList, deletedNode];
    let currentTop = fullList.length - 1;

    steps.push({
      stepNumber: 1,
      description: "Pop(): 檢查是否為空",
      elements: [
        ...createBoxes(fullList),
        createTopPointer(currentTop, startX, startY, gap),
      ],
      actionTag: TAGS.POP_CHECK_EMPTY,
      variables: { top: currentTop },
    });

    const s2Boxes: Box[] = [];
    let movingBox: Box | null = null;
    let ghostBox: Box | null = null;

    fullList.forEach((item, i) => {
      if (i === currentTop) {
        movingBox = new Box();
        movingBox.id = item.id;
        movingBox.value = item.value;
        movingBox.width = 60;
        movingBox.height = 60;
        movingBox.description = "removed_value";
        movingBox.moveTo(950, startY);
        movingBox.setStatus("prepare");

        ghostBox = new Box();
        ghostBox.id = `${item.id}-ghost`;
        ghostBox.value = item.value;
        ghostBox.width = 60;
        ghostBox.height = 60;
        ghostBox.description = String(i);
        ghostBox.moveTo(startX + i * gap, startY);
        ghostBox.setStatus("unfinished");
        ghostBox.appearAnim = "instant";
      } else {
        const b = new Box();
        b.id = item.id;
        b.value = item.value;
        b.width = 60;
        b.height = 60;
        b.description = String(i);
        b.moveTo(startX + i * gap, startY);
        b.setStatus("unfinished");
        s2Boxes.push(b);
      }
    });

    const step2Elements: (Box | Pointer)[] = [...s2Boxes];
    if (ghostBox) step2Elements.push(ghostBox);
    if (movingBox) step2Elements.push(movingBox);
    step2Elements.push(createTopPointer(currentTop, startX, startY, gap));

    steps.push({
      stepNumber: 2,
      description: `removed_value = stack[${currentTop}] (${value})`,
      elements: step2Elements,
      actionTag: TAGS.POP_GET_VALUE,
      variables: { top: currentTop, removed_value: value },
    });

    currentTop--;

    const s3Boxes: Box[] = [];

    fullList.slice(0, -1).forEach((item, i) => {
      const b = new Box();
      b.id = item.id;
      b.value = item.value;
      b.width = 60;
      b.height = 60;
      b.description = String(i);
      b.moveTo(startX + i * gap, startY);
      b.setStatus("unfinished");
      s3Boxes.push(b);
    });

    const s3GhostBox = new Box();
    s3GhostBox.id = `${deletedNode.id}-ghost`;
    s3GhostBox.value = deletedNode.value;
    s3GhostBox.width = 60;
    s3GhostBox.height = 60;
    s3GhostBox.description = String(fullList.length - 1);
    s3GhostBox.moveTo(startX + (fullList.length - 1) * gap, startY);
    s3GhostBox.setStatus("inactive");
    s3GhostBox.borderStyle = "dashed";
    s3GhostBox.appearAnim = "instant";

    const s3MovingBox = new Box();
    s3MovingBox.id = deletedNode.id;
    s3MovingBox.value = deletedNode.value;
    s3MovingBox.width = 60;
    s3MovingBox.height = 60;
    s3MovingBox.description = "removed_value";
    s3MovingBox.moveTo(950, startY);
    s3MovingBox.setStatus("unfinished");

    steps.push({
      stepNumber: 3,
      description: `top = top - 1 (現在 top 指向 ${currentTop})`,
      elements: [
        ...s3Boxes,
        s3GhostBox,
        s3MovingBox,
        createTopPointer(currentTop, startX, startY, gap),
      ],
      actionTag: TAGS.POP_DEC_TOP,
      variables: { top: currentTop, removed_value: value },
    });

    const s4GhostBox = new Box();
    s4GhostBox.id = `${deletedNode.id}-ghost`;
    s4GhostBox.value = deletedNode.value;
    s4GhostBox.width = 60;
    s4GhostBox.height = 60;
    s4GhostBox.description = String(fullList.length - 1);
    s4GhostBox.moveTo(startX + (fullList.length - 1) * gap, startY);
    s4GhostBox.setStatus("inactive");
    s4GhostBox.borderStyle = "dashed";

    const s4ReturnBox = new Box();
    s4ReturnBox.id = deletedNode.id;
    s4ReturnBox.value = deletedNode.value;
    s4ReturnBox.width = 60;
    s4ReturnBox.height = 60;
    s4ReturnBox.description = "removed_value";
    s4ReturnBox.moveTo(950, startY);
    s4ReturnBox.setStatus("target");

    steps.push({
      stepNumber: 4,
      description: `回傳 ${value}`,
      elements: [
        ...createBoxes(dataList, "unfinished"),
        createTopPointer(currentTop, startX, startY, gap),
        s4ReturnBox,
        s4GhostBox,
      ],
      actionTag: TAGS.POP_RETURN,
      variables: { top: currentTop, removed_value: value },
    });

    steps.push({
      stepNumber: 5,
      description: "Pop 完成",
      elements: [
        ...createBoxes(dataList, "complete"),
        createTopPointer(currentTop, startX, startY, gap),
      ],
      actionTag: TAGS.POP_COMPLETE,
      variables: { top: currentTop, removed_value: value },
    });
  } else if (type === "peek") {
    let currentTop = dataList.length - 1;

    if (dataList.length === 0) {
      steps.push({
        stepNumber: 1,
        description: "Peek: 堆疊為空",
        elements: [createTopPointer(-1, startX, startY, gap)],
        actionTag: TAGS.PEEK_CHECK_EMPTY,
        variables: { top: -1 },
      });
      steps.push({
        stepNumber: 2,
        description: "回傳 Null",
        elements: [createTopPointer(-1, startX, startY, gap)],
        actionTag: TAGS.PEEK_ERROR,
        variables: { top: -1 },
      });
      return steps;
    }

    steps.push({
      stepNumber: 1,
      description: "Peek(): 檢查是否為空",
      elements: [
        ...createBoxes(dataList),
        createTopPointer(currentTop, startX, startY, gap),
      ],
      actionTag: TAGS.PEEK_CHECK_EMPTY,
      variables: { top: currentTop },
    });

    const s2Boxes = createBoxes(dataList);
    s2Boxes[currentTop].setStatus("target");

    steps.push({
      stepNumber: 2,
      description: `回傳 stack[${currentTop}] (${value})`,
      elements: [...s2Boxes, createTopPointer(currentTop, startX, startY, gap)],
      actionTag: TAGS.PEEK_RETURN,
      variables: { top: currentTop, value: value },
    });

    steps.push({
      stepNumber: 3,
      description: "Peek 完成",
      elements: [
        ...createBoxes(dataList, "complete"),
        createTopPointer(currentTop, startX, startY, gap),
      ],
      actionTag: TAGS.PEEK_COMPLETE,
      variables: { top: currentTop, value: value },
    });
  }

  return steps;
}

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
      [TAGS.INIT]: [2, 3, 4],
      [TAGS.PUSH_START]: [6],
      [TAGS.PUSH_INC_TOP]: [7],
      [TAGS.PUSH_ASSIGN]: [8],
      [TAGS.PUSH_COMPLETE]: [9],
      [TAGS.POP_START]: [11],
      [TAGS.POP_CHECK_EMPTY]: [12],
      [TAGS.POP_ERROR]: [13],
      [TAGS.POP_GET_VALUE]: [15],
      [TAGS.POP_DEC_TOP]: [16],
      [TAGS.POP_RETURN]: [17],
      [TAGS.POP_COMPLETE]: [18],
      [TAGS.PEEK_START]: [20],
      [TAGS.PEEK_CHECK_EMPTY]: [21],
      [TAGS.PEEK_ERROR]: [22],
      [TAGS.PEEK_RETURN]: [24],
      [TAGS.PEEK_COMPLETE]: [25],
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

export const StackConfig: LevelImplementationConfig = {
  id: "stack",
  type: "dataStructure",
  name: "堆疊 (Stack)",
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
  relatedProblems: [
    {
      id: 20,
      title: "Valid Parentheses",
      concept: "堆疊經典應用：檢查括號是否匹配",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/valid-parentheses/",
    },
    {
      id: 155,
      title: "Min Stack",
      concept: "堆疊設計：實作支援 O(1) 取得最小值的堆疊",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/min-stack/",
    },
    {
      id: 232,
      title: "Implement Queue using Stacks",
      concept: "堆疊應用：用堆疊實作佇列的功能",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/implement-queue-using-stacks/",
    },
  ],
};

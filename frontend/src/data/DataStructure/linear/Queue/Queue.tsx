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
} from "../utils";
import { QueueActionBar } from "./QueueActionBar";
import { queueRealWorldStories } from "./queue.stories";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { DATA_LIMITS } from "@/constants/dataLimits";

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
    s1NewBox.value =
      newNode.value !== undefined && newNode.value !== null
        ? String(newNode.value)
        : "";
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
    emptyBox.value = "";
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
    s3NewBox.value =
      newNode.value !== undefined && newNode.value !== null
        ? String(newNode.value)
        : "";
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
    movingBox.value =
      deletedNode.value !== undefined && deletedNode.value !== null
        ? String(deletedNode.value)
        : "";
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
      b.value =
        item.value !== undefined && item.value !== null
          ? String(item.value)
          : "";
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
    lastBoxGhost.value =
      lastNode.value !== undefined && lastNode.value !== null
        ? String(lastNode.value)
        : "";
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
      actionTag: TAGS.DEQUEUE_DEC_REAR,
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

    const peekCompleteBoxes = createBoxes(dataList, Status.Unfinished);
    peekCompleteBoxes[0].setStatus(Status.Complete);

    steps.push({
      stepNumber: 3,
      description: "Peek 完成",
      elements: [
        ...peekCompleteBoxes,
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
    size ← 0
    queue ← Array of Size

  Procedure enqueue(value):
    If size = Size Then
        Return Error
    End If
    size ← size + 1
    rear ← rear + 1
    queue[rear] ← value
  End Procedure

  Procedure dequeue():
    If size = 0 Then
        Return Error
    End If
    removed_value ← queue[front]
    front ← front + 1
    size ← size - 1
    Return removed_value
  End Procedure

  Procedure peek():
    If size = 0 Then
        Return null
    End If
    Return queue[front]
  End Procedure`,
    mappings: {
      [TAGS.INIT]: [2, 3, 4, 5, 6],
      [TAGS.ENQUEUE_START]: [8],
      [TAGS.ENQUEUE_INC_REAR]: [12, 13],
      [TAGS.ENQUEUE_ASSIGN]: [14],
      [TAGS.ENQUEUE_COMPLETE]: [15],
      [TAGS.DEQUEUE_START]: [17],
      [TAGS.DEQUEUE_CHECK_EMPTY]: [18],
      [TAGS.DEQUEUE_ERROR]: [19],
      [TAGS.DEQUEUE_GET_VALUE]: [21],
      [TAGS.DEQUEUE_DEC_REAR]: [22, 23],
      [TAGS.DEQUEUE_RETURN]: [24],
      [TAGS.DEQUEUE_COMPLETE]: [25],
      [TAGS.PEEK_START]: [27],
      [TAGS.PEEK_CHECK_EMPTY]: [28],
      [TAGS.PEEK_ERROR]: [29],
      [TAGS.PEEK_RETURN]: [31],
      [TAGS.PEEK_COMPLETE]: [32],
    },
  },
  python: {
    content: `from collections import deque

class Queue:
    def __init__(self):
        # 使用 deque 作為底層儲存
        self.queue = deque()

    def enqueue(self, value):
        # 從右邊（尾部）加入
        self.queue.append(value)

    def dequeue(self):
        # 從左邊（頭部）取出
        if self.is_empty():
            raise Exception("Queue Underflow")
        return self.queue.popleft()

    def peek(self):
        if self.is_empty():
            return None
        return self.queue[0]

    def is_empty(self):
        return len(self.queue) == 0

    def size(self):
        return len(self.queue)`,
  },
};

/** Queue actionHandler */
function queueActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: BoxData[],
  context: ActionContext,
): ActionResult<BoxData[]> | null {
  const { value } = payload as { value?: number };
  const newData = [...data];

  if (actionType === "add") {
    const newId = context.nextId();
    newData.push({ id: newId, value: value! });
    return {
      animationData: newData,
      animationParams: { targetId: newId, value, mode: "Enqueue" },
    };
  }

  if (actionType === "delete") {
    let targetId: string | undefined;
    let delValue: number | undefined;
    const delBox = newData.shift();
    if (delBox) {
      targetId = delBox.id;
      delValue = Number(delBox.value);
    }
    return {
      animationData: newData,
      animationParams: { targetId, value: delValue, mode: "Dequeue" },
    };
  }

  if (actionType === "peek") {
    let targetId: string | undefined;
    let peekValue: number | undefined;
    if (newData.length > 0) {
      const frontNode = newData[0];
      targetId = frontNode.id;
      peekValue = Number(frontNode.value);
    }
    return {
      animationData: data,
      animationParams: { targetId, value: peekValue, mode: "Peek" },
    };
  }

  if (["random", "reset", "load", "refresh"].includes(actionType)) {
    if (actionType === "random") {
      const count =
        (payload.randomCount as number) ?? DATA_LIMITS.DEFAULT_RANDOM_COUNT;
      const randData = Array.from({ length: count }, () => ({
        id: context.nextId(),
        value: Math.floor(Math.random() * 100),
      }));
      return { animationData: randData, isResetAction: true };
    }
    if (actionType === "reset") {
      const defaultData =
        (context.defaultData as BoxData[] | undefined) ?? data;
      const resetData = defaultData.map((d) => ({
        ...d,
        id: context.nextId(),
      }));
      return { animationData: resetData, isResetAction: true };
    }
    if (actionType === "load") {
      const loadArr = (payload.data as number[]) ?? [];
      const loadData = loadArr.map((v) => ({ id: context.nextId(), value: v }));
      return { animationData: loadData, isResetAction: true };
    }
    return { animationData: data, isResetAction: true };
  }

  return null;
}

export const QueueConfig: LevelImplementationConfig = {
  id: "queue",
  type: "dataStructure",
  name: "佇列 (Queue)",
  categoryName: "資料結構",
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
  actionHandler: queueActionHandler,
  realWorldStories: queueRealWorldStories,
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
  maxNodes: 12,
  realWorldStories: [
    {
      id: "queue-multidomain-applications",
      title: "佇列 (Queue) 無所不在：從演算法到大型系統架構的底層核心",
      category: "電腦科學與系統設計",
      tags: ["Queue", "系統設計", "作業系統", "演算法", "資料結構"],
      content: `【演算法的基礎：廣度優先搜尋 (BFS)】
在圖形或樹狀結構中，廣度優先搜尋 (BFS) 是一種逐層探索的演算法，對於尋找無權重圖的最短路徑非常有用。BFS 的核心依賴於「先進先出 (FIFO)」特性的佇列 (Queue) 資料結構。當我們造訪一個節點時，會將其尚未造訪的相鄰節點加入佇列的後端，並從前端取出下一個節點來處理，以此確保同一層級的節點都會被優先探索完畢，才會進入下一層。

【系統設計的利器：訊息佇列 (Message Queues)】
在大型分散式系統（例如電商平台）中，瞬間的尖峰流量可能會嚴重拖慢系統效能。訊息佇列 (Message Queue) 提供了一種支援「非同步通訊」的緩衝機制。它將發布訊息的「生產者」與處理任務的「消費者（伺服器）」解耦。這不僅提升了系統的擴展性 (Scalability)，也保障了高度的可靠性——因為佇列通常會將資料儲存在持久性的磁碟中，即使伺服器或系統崩潰，等待處理的資料也不會遺失，待系統恢復後即可繼續消化佇列中的任務。

【作業系統的排程樞紐：排程佇列 (Scheduling Queues)】
作業系統必須管理多個同時競爭 CPU 資源的程式，它是透過建立多個不同的排程佇列來實現這個複雜的任務。當任何程式剛啟動時，會先進入包含所有進程的工作佇列 (Job Queue)。接著，準備好執行並等待 CPU 資源的進程會被放入就緒佇列 (Ready Queue)；而如果進程正在等待外部設備（如硬碟讀取、網路資料），則會被暫停並移入裝置佇列 (Device Queues) 中等待。作業系統的排程器會不斷在這些佇列間調度進程，以維持電腦的高效運行。

【日常設備的隱形幫手：列印多工緩衝處理器 (Print Spooler)】
佇列的概念也存在於我們日常的硬體操作中。由於印表機的處理速度較慢且記憶體有限，無法瞬間處理大量要求，Windows 作業系統內建了「列印多工緩衝處理器 (Print Spooler)」。它會將所有的列印任務暫存到緩衝區（即佇列）中，並自動排程將任務逐一傳送給印表機。這個機制讓使用者在送出列印任務後可以繼續操作電腦，而不需要枯等印表機完成工作。`,
      video: {
        url: "https://youtu.be/S3wJi91kESg",
        title: "Message Queues in System Design",
      },
      resources: [
        {
          type: "article",
          url: "https://www.geeksforgeeks.org/websites-apps/what-is-a-print-spooler/",
          title: "What is a Print Spooler?",
          source: "GeeksforGeeks",
        },
        {
          type: "article",
          url: "https://unwiredlearning.com/blog/scheduling-queues-guide",
          title: "Scheduling Queues and Schedulers Explained (OS Guide)",
          source: "Unwired Learning",
        },
        {
          type: "article",
          url: "https://www.interviewcake.com/concept/java/bfs",
          title: "Breadth-First Search (BFS) - Shortest Paths in Unweighted Graphs",
          source: "Interview Cake",
        },
      ],
    },
  ],
};

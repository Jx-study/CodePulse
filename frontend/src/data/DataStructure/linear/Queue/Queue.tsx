import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { LinearData as BoxData, LinearAction as ActionType } from "../utils";
import { QueueActionBar } from "./QueueActionBar";
import { queueRealWorldStories } from "./queue.stories";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { DATA_LIMITS } from "@/constants/dataLimits";
import { simulateQueueTrace } from "./simulateTrace";
import { queueTraceToSteps } from "./traceToSteps";
import { TAGS } from "./tags";

export function createQueueAnimationSteps(
  dataList: BoxData[],
  action?: ActionType,
): AnimationStep[] {
  const trace = simulateQueueTrace(dataList, action);
  return queueTraceToSteps(trace);
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
  i18nNamespace: "tutorials/queue",
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
};

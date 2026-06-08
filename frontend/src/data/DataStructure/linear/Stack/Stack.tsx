import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { LinearData as BoxData, LinearAction as ActionType } from "../utils";
import { StackActionBar } from "./StackActionBar";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { DATA_LIMITS } from "@/constants/dataLimits";
import { TAGS } from "./tags";
import { simulateStackTrace } from "./simulateTrace";
import { stackTraceToSteps } from "./traceToSteps";

export function createStackAnimationSteps(
  dataList: BoxData[],
  action?: ActionType,
): AnimationStep[] {
  const trace = simulateStackTrace(dataList, action);
  return stackTraceToSteps(trace);
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
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(1)' },  // class Stack:
      { lineNumber: 2,  complexity: 'O(1)' },  // def __init__(self, size: int):
      { lineNumber: 3,  complexity: 'O(1)' },  // self.stack = []
      { lineNumber: 4,  complexity: 'O(1)' },  // self.size = size
      { lineNumber: 5,  complexity: 'O(1)' },  // self.top = -1
      { lineNumber: 7,  complexity: 'O(1)' },  // def push(self, value: int) -> None:
      { lineNumber: 8,  complexity: 'O(1)' },  // if self.top >= self.size - 1:
      { lineNumber: 9,  complexity: 'O(1)' },  // raise Exception("Stack Overflow")
      { lineNumber: 10, complexity: 'O(1)' },  // self.top += 1
      { lineNumber: 11, complexity: 'O(1)' },  // self.stack.append(value)
      { lineNumber: 13, complexity: 'O(1)' },  // def pop(self) -> int:
      { lineNumber: 14, complexity: 'O(1)' },  // if self.top == -1:
      { lineNumber: 15, complexity: 'O(1)' },  // raise Exception("Stack Underflow")
      { lineNumber: 16, complexity: 'O(1)' },  // value = self.stack[self.top]
      { lineNumber: 17, complexity: 'O(1)' },  // self.top -= 1
      { lineNumber: 18, complexity: 'O(1)' },  // return value
      { lineNumber: 20, complexity: 'O(1)' },  // def peek(self) -> int:
      { lineNumber: 21, complexity: 'O(1)' },  // if self.top == -1:
      { lineNumber: 22, complexity: 'O(1)' },  // return None
      { lineNumber: 23, complexity: 'O(1)' },  // return self.stack[self.top]
    ],
  },
};

/** Stack actionHandler */
function stackActionHandler(
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
      animationParams: { targetId: newId, value, mode: "Push" },
    };
  }

  if (actionType === "delete") {
    let targetId: string | undefined;
    let delValue: number | undefined;
    if (newData.length > 0) {
      const delBox = newData.pop()!;
      targetId = delBox.id;
      delValue = Number(delBox.value);
    }
    return {
      animationData: newData,
      animationParams: { targetId, value: delValue, mode: "Pop" },
    };
  }

  if (actionType === "peek") {
    let targetId: string | undefined;
    let peekValue: number | undefined;
    if (newData.length > 0) {
      const topNode = newData[newData.length - 1];
      targetId = topNode.id;
      peekValue = Number(topNode.value);
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

export const StackConfig: LevelImplementationConfig = {
  id: "stack",
  type: "dataStructure",
  name: "堆疊 (Stack)",
  categoryName: "資料結構",
  description: "LIFO (Last In First Out)",
  codeConfig: stackCodeConfig,
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(1)",
    timeWorst: "O(1)",
    space: "O(n)",
  },
  i18nNamespace: "tutorials/stack",
  introduction: { key: "introduction" },
  defaultData: [
    { id: "box-1", value: 1 },
    { id: "box-2", value: 2 },
    { id: "box-3", value: 3 },
  ],
  createAnimationSteps: createStackAnimationSteps,
  actionHandler: stackActionHandler,
  renderActionBar: (props) => <StackActionBar {...(props as any)} />,
  i18nNamespace: "tutorials/stack",
  relatedProblems: [
    {
      id: 20,
      title: "Valid Parentheses",
      concept: "relatedProblems.20",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/valid-parentheses/",
    },
    {
      id: 155,
      title: "Min Stack",
      concept: "relatedProblems.155",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/min-stack/",
    },
    {
      id: 232,
      title: "Implement Queue using Stacks",
      concept: "relatedProblems.232",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/implement-queue-using-stacks/",
    },
  ],
  realWorldStories: [
    {
      id: "basic-stack-intro",
      title: "堆疊的隱形力量 — 從復原鍵到瀏覽器的幕後英雄",
      category: "軟體開發 / 日常應用",
      tags: ["LIFO", "後進先出", "資料結構", "Undo/Redo"],
      content: `【生活中的直覺法則】
每天我們都在不知不覺中遵守著「堆疊」的秩序。想像自助餐檯上的一疊盤子，或是只能單向進出的單線道停車場，我們永遠只能從「最上面」拿取盤子，最後開進去的車子也必須最先開出來。這種「後進先出」（LIFO, Last In, First Out）的簡單規則，不僅是空間有限下最有效率的管理方式，更是數位世界運作的核心骨架。

【軟體的時光機：復原與重做】
當你打錯字按下「復原」（Undo）時，彷彿時光倒流。這背後其實是系統將你的每個動作「推入」（Push）堆疊中。當需要復原時，就把最上面的動作「彈出」（Pop）。更聰明的是，系統會同時維護兩個堆疊來實現「重做」（Redo）功能，將復原的動作悄悄移到隔壁的重做堆疊裡，讓你隨時可以再次套用。

【網頁導覽的幕後推手】
瀏覽器的「上一頁」與「下一頁」同樣是雙堆疊概念的完美應用。每一個點開的新網頁都會被存入「上一頁堆疊」，當你點擊上一頁時，目前的網頁就會被彈出並存入「下一頁堆疊」，讓你在複雜的網頁歷史紀錄中穿梭自如。

【支撐程式運作的隱形守護者】
在程式碼的最底層，堆疊更是無所不在。「呼叫堆疊」（Call Stack）就像是程式在迷宮中沿路留下的麵包屑，確保主程式在呼叫無數個子功能後，永遠能準確找到回來的路。此外，編譯器也依賴堆疊這個超級嚴格的檢查員來驗證括號是否正確配對，甚至開發者會利用堆疊「後進先出」的特性來快速完成字串反轉。`,
      video: {
        url: "https://youtu.be/4C2iPT6N_GI",
        title: "堆疊的隱形力量",
        duration: "7:32",
      },
      resources: [
        {
          type: "article",
          url: "https://www.enjoyalgorithms.com/blog/application-of-stack-data-structure-in-programming",
          title: "Real-life Applications of Stack Data Structure",
          source: "EnjoyAlgorithms",
        },
        {
          type: "article",
          url: "https://www.geeksforgeeks.org/projects/implement-undo-and-redo-features-of-a-text-editor/",
          title: "Implement Undo and Redo",
          source: "GeeksforGeeks",
        },
        {
          type: "article",
          url: "https://www.upgrad.com/blog/stack-example-in-real-life/",
          title: "Top 12 Stack Examples in Real Life",
          source: "upGrad",
        },
      ],
    },
    {
      id: 2,
      title: "PopupStack 彈窗大戰 — 體驗後進先出的真實感",
      content: `【遊戲背景】
你的電腦突然遭受神秘教授的彈窗攻擊！
一個個視窗接連彈出，塞滿了你的螢幕……

【Stack 就藏在這裡】
當你同時打開多個應用程式視窗時，作業系統用 Stack 來管理「焦點順序」——最後彈出的視窗永遠在最上層，你必須從最上層開始逐一關閉，這正是 LIFO（後進先出）的體現。

【挑戰開始】
每個彈窗都有自己的個性：有的會四處逃跑，有的需要你答對問題，有的甚至會呼叫小弟增援。但規則只有一條：必須先關閉最後出現的彈窗！

【完成挑戰後，你將理解】
Stack 的 push（堆入）和 pop（彈出）不只是抽象概念，而是你每天都在無意識中體驗的真實機制。`,
      category: "資料結構 / 互動遊戲",
      tags: ["LIFO", "後進先出", "Stack", "互動遊戲"],
      interactiveGame: {
        type: "stack-popup-game",
      },
    },
  ],
  maxNodes: 12,
};

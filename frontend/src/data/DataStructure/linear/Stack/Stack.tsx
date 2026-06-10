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
      video: {
        url: "https://youtu.be/4C2iPT6N_GI",
        duration: "7:32",
      },
      resources: [
        {
          type: "article",
          url: "https://www.enjoyalgorithms.com/blog/application-of-stack-data-structure-in-programming",
        },
        {
          type: "article",
          url: "https://www.geeksforgeeks.org/projects/implement-undo-and-redo-features-of-a-text-editor/",
        },
        {
          type: "article",
          url: "https://www.upgrad.com/blog/stack-example-in-real-life/",
        },
      ],
    },
    {
      id: 2,
      interactiveGame: {
        type: "stack-popup-game",
      },
    },
  ],
  maxNodes: 12,
};

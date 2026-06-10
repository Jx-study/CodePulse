import { LevelImplementationConfig } from "@/types/implementation";
import { AnimationStep, CodeConfig, StatusConfig } from "@/types";
import { BinaryTreeActionBar } from "./BinaryTreeActionBar";
import { simulateBinaryTreeTrace } from "./simulateTrace";
import { binaryTreeTraceToSteps } from "./traceToSteps";
import { BTStatus, TAGS } from "./tags";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { DATA_LIMITS } from "@/constants/dataLimits";

export const BTStatusConfig: StatusConfig = {
  i18nNs: "tutorials/binary-tree",
  statuses: [
    { key: BTStatus.Inactive,  label: "statusLegend.notVisited",      color: "#555555" },
    { key: BTStatus.Visited,   label: "statusLegend.enqueued",        color: "#1d79cfff" },
    { key: BTStatus.Prepare,   label: "statusLegend.preparingExplore", color: "#f59e0b" },
    { key: BTStatus.Target,    label: "statusLegend.currentFocus",    color: "#ff6b35" },
    { key: BTStatus.Complete,  label: "statusLegend.completeVisit",   color: "#46f336ff" },
  ],
};

export function createBinaryTreeAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  const trace = simulateBinaryTreeTrace(inputData, action);
  return binaryTreeTraceToSteps(trace);
}

const binaryTreeCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure Preorder(node):
  If node is Null Then Return
  Visit(node)
  Preorder(node.left)
  Preorder(node.right)

Procedure Inorder(node):
  If node is Null Then Return
  Inorder(node.left)
  Visit(node)
  Inorder(node.right)

Procedure Postorder(node):
  If node is Null Then Return
  Postorder(node.left)
  Postorder(node.right)
  Visit(node)

Procedure BFS(root):
  Queue ← [root]
  While Queue is not Empty:
    curr ← Dequeue(Queue)
    Visit(curr)
    If curr.left ≠ Null Then Enqueue(Queue, curr.left)
    If curr.right ≠ Null Then Enqueue(Queue, curr.right)`,
    mappings: {
      [TAGS.PRE_INIT]: [1],
      [TAGS.PRE_NULL]: [2],
      [TAGS.PRE_VISIT]: [3],
      [TAGS.PRE_LEFT]: [4],
      [TAGS.PRE_RIGHT]: [5],
      [TAGS.IN_INIT]: [7],
      [TAGS.IN_NULL]: [8],
      [TAGS.IN_LEFT]: [9],
      [TAGS.IN_VISIT]: [10],
      [TAGS.IN_RIGHT]: [11],
      [TAGS.POST_INIT]: [13],
      [TAGS.POST_NULL]: [14],
      [TAGS.POST_LEFT]: [15],
      [TAGS.POST_RIGHT]: [16],
      [TAGS.POST_VISIT]: [17],
      [TAGS.BFS_INIT]: [20],
      [TAGS.BFS_WHILE]: [21],
      [TAGS.BFS_DEQUEUE]: [22],
      [TAGS.BFS_VISIT]: [23],
      [TAGS.BFS_ENQUEUE]: [24, 25],
    },
  },
  python: {
    content: `def preorder(node):
    if not node: return
    visit(node)
    preorder(node.left)
    preorder(node.right)

def inorder(node):
    if not node: return
    inorder(node.left)
    visit(node)
    inorder(node.right)

def postorder(node):
    if not node: return
    postorder(node.left)
    postorder(node.right)
    visit(node)

def bfs(root):
    queue = [root]
    while queue:
        node = queue.pop(0)
        visit(node)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(n)'                  },  // def preorder(node): — overall O(n)
      { lineNumber: 2,  complexity: 'O(1)', context: 'O(n)' },  // if not node: return — O(1) × n (called n times)
      { lineNumber: 3,  complexity: 'O(1)', context: 'O(n)' },  // visit(node) — O(1) × n
      { lineNumber: 4,  complexity: 'O(1)', context: 'O(n)' },  // preorder(node.left) — O(1) call overhead × n
      { lineNumber: 5,  complexity: 'O(1)', context: 'O(n)' },  // preorder(node.right) — O(1) call overhead × n
      { lineNumber: 7,  complexity: 'O(n)'                  },  // def inorder(node): — overall O(n)
      { lineNumber: 8,  complexity: 'O(1)', context: 'O(n)' },  // if not node: return — O(1) × n
      { lineNumber: 9,  complexity: 'O(1)', context: 'O(n)' },  // inorder(node.left) — O(1) × n
      { lineNumber: 10, complexity: 'O(1)', context: 'O(n)' },  // visit(node) — O(1) × n
      { lineNumber: 11, complexity: 'O(1)', context: 'O(n)' },  // inorder(node.right) — O(1) × n
      { lineNumber: 13, complexity: 'O(n)'                  },  // def postorder(node): — overall O(n)
      { lineNumber: 14, complexity: 'O(1)', context: 'O(n)' },  // if not node: return — O(1) × n
      { lineNumber: 15, complexity: 'O(1)', context: 'O(n)' },  // postorder(node.left) — O(1) × n
      { lineNumber: 16, complexity: 'O(1)', context: 'O(n)' },  // postorder(node.right) — O(1) × n
      { lineNumber: 17, complexity: 'O(1)', context: 'O(n)' },  // visit(node) — O(1) × n
      { lineNumber: 19, complexity: 'O(n)'                  },  // def bfs(root): — overall O(n)
      { lineNumber: 20, complexity: 'O(1)'                  },  // queue = [root] — outside loop
      { lineNumber: 21, complexity: 'O(n)'                  },  // while queue — top-level while, O(n) iterations
      { lineNumber: 22, complexity: 'O(n)', context: 'O(n)' },  // node = queue.pop(0) — O(1) × n
      { lineNumber: 23, complexity: 'O(1)', context: 'O(n)' },  // visit(node) — O(1) × n
      { lineNumber: 24, complexity: 'O(1)', context: 'O(n)' },  // if node.left: queue.append — O(1) × n
      { lineNumber: 25, complexity: 'O(1)', context: 'O(n)' },  // if node.right: queue.append — O(1) × n
    ],
  },
};

/** BinaryTree actionHandler */
function binaryTreeActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: any[],
  context: ActionContext,
): ActionResult<any[]> | null {
  const { value, index } = payload as { value?: number; index?: number };
  const newData = [...data];

  if (actionType === "add") {
    const newId = context.nextId();
    newData.push({ id: newId, value: value! });
    return {
      animationData: newData,
      animationParams: { targetId: newId, value },
    };
  }

  if (actionType === "delete") {
    const delValue = index ?? value;
    const delIndex = newData.findIndex((n: any) => n.value === delValue);
    if (delIndex === -1) {
      context.toast.warning(`數值 ${delValue} 不存在`);
      return null;
    }
    newData.splice(delIndex, 1);
    return { animationData: newData, animationParams: { value: delValue } };
  }

  if (actionType === "search") {
    return { animationData: data };
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
      const defaultData = (context.defaultData as any[] | undefined) ?? data;
      const resetData = defaultData.map((d: any) => ({
        ...d,
        id: context.nextId(),
      }));
      return { animationData: resetData, isResetAction: true };
    }
    if (actionType === "load") {
      const loadArr = (payload.data as number[]) ?? [];
      const loadData = loadArr.map((v) => ({
        id: context.nextId(),
        value: v,
      }));
      return { animationData: loadData, isResetAction: true };
    }
    return { animationData: data, isResetAction: true };
  }

  return null;
}

export const BinaryTreeConfig: LevelImplementationConfig = {
  id: "binarytree",
  type: "dataStructure",
  name: "二元樹 (Binary Tree)",
  categoryName: "資料結構",
  description: "每個節點最多有兩個子節點的樹狀結構",
  codeConfig: binaryTreeCodeConfig,
  complexity: {
    timeBest: "O(n)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(h)",
  },
  i18nNamespace: "tutorials/binary-tree",
  introduction: { key: "introduction" },
  defaultData: [
    { id: "node-1", value: 1 },
    { id: "node-2", value: 2 },
    { id: "node-3", value: 3 },
    { id: "node-4", value: 4 },
    { id: "node-5", value: 5 },
    { id: "node-6", value: 6 },
    { id: "node-7", value: 7 },
  ],
  linkAnimConfig: {
    animateOn: ["prepare"],
    directOn: ["complete"],
  },
  createAnimationSteps: createBinaryTreeAnimationSteps,
  actionHandler: binaryTreeActionHandler,
  renderActionBar: (props) => <BinaryTreeActionBar {...(props as any)} />,
  statusConfig: BTStatusConfig,
  relatedProblems: [
    {
      id: 144,
      title: "Binary Tree Preorder Traversal",
      concept: "relatedProblems.144",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    },
    {
      id: 94,
      title: "Binary Tree Inorder Traversal",
      concept: "relatedProblems.94",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    },
    {
      id: 102,
      title: "Binary Tree Level Order Traversal",
      concept: "relatedProblems.102",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    },
  ],
  maxNodes: 25,
};

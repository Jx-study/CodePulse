import { LevelImplementationConfig } from "@/types/implementation";
import { AnimationStep, CodeConfig, StatusConfig } from "@/types";
import { BSTActionBar } from "./BSTActionBar";
import { simulateBSTTrace, getBSTArrayAfterDelete } from "./simulateTrace";
import { bstTraceToSteps } from "./traceToSteps";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { DATA_LIMITS } from "@/constants/dataLimits";
import { TAGS, BSTStatus } from "./tags";

export const BSTStatusConfig: StatusConfig = {
  i18nNs: "tutorials/bst",
  statuses: [
    { key: BSTStatus.Inactive,  label: "statusLegend.notVisited",       color: "#555555" },
    { key: BSTStatus.Visited,   label: "statusLegend.visitedPath",      color: "#1d79cfff" },
    { key: BSTStatus.Prepare,   label: "statusLegend.exploreDirection", color: "#f59e0b" },
    { key: BSTStatus.Target,    label: "statusLegend.currentNode",      color: "#ff6b35" },
    { key: BSTStatus.Complete,  label: "statusLegend.completeTarget",   color: "#46f336ff" },
  ],
};

function bstActionHandler(
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
      animationParams: { targetId: newId, value, mode: "Insert" },
    };
  }

  if (actionType === "delete") {
    const delValue = index ?? value;
    return {
      animationData: newData,
      stateData: getBSTArrayAfterDelete(newData, delValue!),
      animationParams: { value: delValue, mode: "DeleteValue" },
    };
  }

  if (actionType === "search") {
    const { mode, value: searchValue } = payload as {
      mode?: string;
      value?: number;
    };
    return {
      animationData: data,
      useRawAnimationParams: true,
      animationParams: { mode, value: searchValue },
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

export function createBinarySearchTreeAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  const traceAction =
    action?.type === "add"
      ? { mode: "Insert", value: action.value }
      : action?.type === "delete"
        ? { mode: "DeleteValue", value: action.index }
        : action; // mode: search/min/max/floor/ceil 的格式已對齊

  const trace = simulateBSTTrace(inputData, traceAction);
  return bstTraceToSteps(trace);
}

const binarySearchTreeCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure Insert(root, value):
  curr ← root
  While curr ≠ Null:
    If value = curr.value Then count++; Return
    If value < curr.value Then
      If curr.left ≠ Null Then curr ← curr.left
      Else curr.left ← newNode(value); Return
    Else
      If curr.right ≠ Null Then curr ← curr.right
      Else curr.right ← newNode(value); Return

Procedure Search(root, target):
  If root is Null Then Return Not Found
  curr ← root
  While curr ≠ Null:
    If target = curr.value Then Return Found
    If target < curr.value Then curr ← curr.left (if exists)
    Else curr ← curr.right (if exists)
  Return Not Found

Procedure Delete(root, target):
  node ← Search(root, target)
  If node is Null Then Return

  If node.count > 1 Then
    node.count ← node.count - 1
    Return

  If node has no children Then
    Remove node
  Else If node has only one child Then
    Replace node with its child
  Else
    successor ← Min(node.right)
    node.value ← successor.value
    Delete successor node from node.right

Procedure Min(root):
  curr ← root
  While curr.left ≠ Null: curr ← curr.left
  Return curr.value

Procedure Max(root):
  curr ← root
  While curr.right ≠ Null: curr ← curr.right
  Return curr.value

Procedure Floor(root, target):
  curr ← root; floor ← Null
  While curr ≠ Null:
    If curr.value = target Then Return curr.value
    If curr.value > target Then curr ← curr.left
    Else floor ← curr; curr ← curr.right
  Return floor

Procedure Ceil(root, target):
  curr ← root; ceil ← Null
  While curr ≠ Null:
    If curr.value = target Then Return curr.value
    If curr.value < target Then curr ← curr.right
    Else ceil ← curr; curr ← curr.left
  Return ceil`,
    mappings: {
      [TAGS.INS_INIT_EMPTY]: [1],
      [TAGS.INS_INIT]: [1, 2],
      [TAGS.INS_COMPARE]: [3, 4, 5, 8],
      [TAGS.INS_EQUAL]: [4],
      [TAGS.INS_LEFT]: [5, 6],
      [TAGS.INS_RIGHT]: [8, 9],
      [TAGS.INS_PLACE_LEFT]: [7],
      [TAGS.INS_PLACE_RIGHT]: [10],

      [TAGS.SRCH_INIT]: [12, 14],
      [TAGS.SRCH_EMPTY]: [13],
      [TAGS.SRCH_COMPARE]: [15, 16],
      [TAGS.SRCH_FOUND]: [16],
      [TAGS.SRCH_LEFT]: [17],
      [TAGS.SRCH_RIGHT]: [18],
      [TAGS.SRCH_NOT_FOUND]: [19],

      [TAGS.DEL_INIT]: [21, 22],
      [TAGS.DEL_EMPTY]: [23],

      [TAGS.DEL_SEARCH]: [15, 16],
      [TAGS.DEL_FOUND]: [16, 22],
      [TAGS.DEL_LEFT]: [17],
      [TAGS.DEL_RIGHT]: [18],
      [TAGS.DEL_NOT_FOUND]: [19, 23, 24],

      [TAGS.DEL_COUNT_DEC]: [25, 26, 27],

      [TAGS.DEL_LEAF]: [29, 30],
      [TAGS.DEL_LEAF_REMOVE]: [30],
      [TAGS.DEL_ONE_CHILD_REPLACE]: [31, 32],
      [TAGS.DEL_ONE_CHILD_DONE]: [32],

      [TAGS.DEL_TWO_CHILD]: [33, 34],
      [TAGS.DEL_SUCCESSOR_FIND]: [34, 41],
      [TAGS.DEL_SUCCESSOR_REPLACE]: [35],
      [TAGS.DEL_SUCCESSOR_REMOVE]: [36],

      [TAGS.MIN_INIT]: [38, 39],
      [TAGS.MIN_TRAVERSE]: [40],
      [TAGS.MIN_FOUND]: [41],

      [TAGS.MAX_INIT]: [43, 44],
      [TAGS.MAX_TRAVERSE]: [45],
      [TAGS.MAX_FOUND]: [46],

      [TAGS.FLOOR_INIT]: [48, 49],
      [TAGS.FLOOR_EQUAL]: [51],
      [TAGS.FLOOR_COMPARE]: [50, 51, 52, 53],
      [TAGS.FLOOR_LEFT]: [52],
      [TAGS.FLOOR_RIGHT]: [53],
      [TAGS.FLOOR_FOUND]: [54],
      [TAGS.FLOOR_NOT_FOUND]: [54],

      [TAGS.CEIL_INIT]: [56, 57],
      [TAGS.CEIL_COMPARE]: [58, 59, 60, 61],
      [TAGS.CEIL_EQUAL]: [59],
      [TAGS.CEIL_LEFT]: [61],
      [TAGS.CEIL_RIGHT]: [60],
      [TAGS.CEIL_FOUND]: [62],
      [TAGS.CEIL_NOT_FOUND]: [62],
    },
  },
  python: {
    content: `class Node:
    def __init__(self, value):
        self.value = value
        self.count = 1
        self.left = None
        self.right = None

def insert(root, value):
    if not root: return Node(value)
    curr = root
    while curr:
        if value == curr.value:
            curr.count += 1
            return root
        if value < curr.value:
            if curr.left: curr = curr.left
            else:
                curr.left = Node(value)
                break
        else:
            if curr.right: curr = curr.right
            else:
                curr.right = Node(value)
                break
    return root

def search(root, target):
    curr = root
    while curr:
        if target == curr.value: return curr
        curr = curr.left if target < curr.value else curr.right
    return None

def delete(root, target):
    if not root: return None
    
    if target < root.value:
        root.left = delete(root.left, target)
    elif target > root.value:
        root.right = delete(root.right, target)
    else:
        
        if root.count > 1:
            root.count -= 1
            return root
        
        if not root.left: return root.right
        if not root.right: return root.left
        
        successor = root.right
        while successor.left:
            successor = successor.left
        root.value = successor.value
        
        root.right = delete(root.right, successor.value)
        
    return root

def find_min(root):
    curr = root
    while curr and curr.left:
        curr = curr.left
    return curr.value if curr else None

def find_max(root):
    curr = root
    while curr and curr.right:
        curr = curr.right
    return curr.value if curr else None

def floor(root, target):
    curr, res = root, None
    while curr:
        if curr.value == target: return curr.value
        if curr.value > target:
            curr = curr.left
        else:
            res = curr.value
            curr = curr.right
    return res

def ceil(root, target):
    curr, res = root, None
    while curr:
        if curr.value == target: return curr.value
        if curr.value < target:
            curr = curr.right
        else:
            res = curr.value
            curr = curr.left
    return res`,
  },
};

export const BinarySearchTreeConfig: LevelImplementationConfig = {
  id: "bst",
  type: "dataStructure",
  linkAnimConfig: {
    animateOn: ["prepare"],
    directOn: ["target", "complete"],
  },
  name: "二元搜尋樹 (BST)",
  categoryName: "資料結構",
  description:
    "具有排序性質的二元樹，左子樹小於根，右子樹大於根，重複值以計數顯示",
  codeConfig: binarySearchTreeCodeConfig,
  complexity: {
    timeBest: "O(log n)",
    timeAverage: "O(log n)",
    timeWorst: "O(n)",
    space: "O(h)",
  },
  introduction: `二元搜尋樹 (BST) 是一種特殊的二元樹。
  特性：
  1. 若左子樹不為空，則左子樹上所有節點的值均小於根節點的值。
  2. 若右子樹不為空，則右子樹上所有節點的值均大於根節點的值。
  3. **重複值處理**：當數值相同時，不新增節點，而是增加該節點的計數器 (Count)。`,
  defaultData: [
    { id: "node-1", value: 50 },
    { id: "node-2", value: 30 },
    { id: "node-3", value: 70 },
    { id: "node-4", value: 20 },
    { id: "node-5", value: 40 },
    { id: "node-6", value: 60 },
    { id: "node-7", value: 80 },
  ],
  createAnimationSteps: createBinarySearchTreeAnimationSteps,
  statusConfig: BSTStatusConfig,
  actionHandler: bstActionHandler,
  renderActionBar: (props) => <BSTActionBar {...(props as any)} />,
  i18nNamespace: "tutorials/bst",
  relatedProblems: [
    {
      id: 700,
      title: "Search in a Binary Search Tree",
      concept: "relatedProblems.700",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/search-in-a-binary-search-tree/",
    },
    {
      id: 701,
      title: "Insert into a Binary Search Tree",
      concept: "relatedProblems.701",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/insert-into-a-binary-search-tree/",
    },
    {
      id: 98,
      title: "Validate Binary Search Tree",
      concept: "relatedProblems.98",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/validate-binary-search-tree/",
    },
  ],
  maxNodes: 20,
};

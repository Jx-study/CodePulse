import {
  LevelImplementationConfig,
  DSActionBarProps,
} from "@/types/implementation";
import { AnimationStep, CodeConfig } from "@/types";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { DATA_LIMITS } from "@/constants/dataLimits";
import { AVLTreeActionBar } from "./AVLTreeActionBar";
import { AVLStatusConfig, TAGS } from "./tags";
import {
  buildAVL,
  deleteItem,
  fromState,
  insertItem,
  toState,
} from "./avl";
import {
  simulateAVLTrace,
  type AVLAction,
  type AVLInputItem,
} from "./simulateTrace";
import { avlTraceToSteps } from "./traceToSteps";

const buildState = (items: AVLInputItem[]): AVLInputItem[] =>
  toState(buildAVL(items));

const DEFAULT_DATA = buildState(
  [40, 20, 60, 10, 30, 50, 70].map((value, i) => ({ id: `avl-${i}`, value })),
);

function avlActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: AVLInputItem[],
  context: ActionContext,
): ActionResult<AVLInputItem[]> | null {
  if (actionType === "add") {
    const value = payload.value as number;
    const newId = context.nextId();
    const inserted = insertItem(fromState(data) ?? undefined, {
      id: newId,
      value,
    });
    return {
      animationData: data,
      stateData: toState(inserted),
      animationParams: { mode: "Insert", value, targetId: newId },
    };
  }

  if (actionType === "delete") {
    const value = Math.round(Number(payload.index ?? payload.value));
    const remaining = deleteItem(fromState(data) ?? undefined, value);
    return {
      animationData: data,
      stateData: toState(remaining),
      animationParams: { mode: "Delete", value },
    };
  }

  if (actionType === "random") {
    const count =
      (payload.randomCount as number) ?? DATA_LIMITS.DEFAULT_RANDOM_COUNT;
    const items = Array.from({ length: count }, () => ({
      id: context.nextId(),
      value: Math.floor(Math.random() * 100),
    }));
    return { animationData: buildState(items), isResetAction: true };
  }

  if (actionType === "reset") {
    const defaults =
      (context.defaultData as AVLInputItem[] | undefined) ?? data;
    const items = defaults.map((d) => ({ ...d, id: context.nextId() }));
    return { animationData: buildState(items), isResetAction: true };
  }

  if (actionType === "load") {
    const values = (payload.data as number[]) ?? [];
    const items = values.map((value) => ({ id: context.nextId(), value }));
    return { animationData: buildState(items), isResetAction: true };
  }

  if (actionType === "refresh") {
    return { animationData: data, isResetAction: true };
  }

  return null;
}

function createAVLAnimationSteps(
  inputData: AVLInputItem[],
  action?: AVLAction,
): AnimationStep[] {
  return avlTraceToSteps(simulateAVLTrace(inputData, action));
}

const avlCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure Insert(node, value):
  If node is Null Then Return NewNode(value)
  If value = node.value Then
    node.count ← node.count + 1
    Return node
  If value < node.value Then node.left ← Insert(node.left, value)
  Else node.right ← Insert(node.right, value)
  UpdateHeight(node)
  Return Rebalance(node)
End Procedure

Procedure Height(node):
  If node is Null Then Return 0
  Return node.height
End Procedure

Procedure UpdateHeight(node):
  node.height ← 1 + Max(Height(node.left), Height(node.right))
End Procedure

Procedure BalanceFactor(node):
  Return Height(node.left) - Height(node.right)
End Procedure

Procedure RotateRight(y):
  x ← y.left
  y.left ← x.right
  x.right ← y
  UpdateHeight(y)
  UpdateHeight(x)
  Return x
End Procedure

Procedure RotateLeft(x):
  y ← x.right
  x.right ← y.left
  y.left ← x
  UpdateHeight(x)
  UpdateHeight(y)
  Return y
End Procedure

Procedure Rebalance(node):
  bf ← BalanceFactor(node)
  If bf > 1 Then
    If BalanceFactor(node.left) < 0 Then node.left ← RotateLeft(node.left)
    Return RotateRight(node)
  If bf < -1 Then
    If BalanceFactor(node.right) > 0 Then node.right ← RotateRight(node.right)
    Return RotateLeft(node)
  Return node
End Procedure

Procedure Delete(node, value):
  If node is Null Then Return Null
  If value < node.value Then node.left ← Delete(node.left, value)
  Else If value > node.value Then node.right ← Delete(node.right, value)
  Else
    If node.count > 1 Then
      node.count ← node.count - 1
      Return node
    If node.left is Null Then Return node.right
    If node.right is Null Then Return node.left
    s ← MinNode(node.right)
    node.value ← s.value
    node.count ← s.count
    node.right ← RemoveMin(node.right)
  UpdateHeight(node)
  Return Rebalance(node)
End Procedure

Procedure MinNode(node):
  If node.left is Null Then Return node
  Return MinNode(node.left)
End Procedure

Procedure RemoveMin(node):
  If node.left is Null Then Return node.right
  node.left ← RemoveMin(node.left)
  UpdateHeight(node)
  Return Rebalance(node)
End Procedure`,
    mappings: {
      [TAGS.INS_COMPARE]: [2, 3],
      [TAGS.INS_LEFT]: [6],
      [TAGS.INS_RIGHT]: [7],
      [TAGS.INS_EQUAL]: [3, 4, 5],
      [TAGS.INS_PLACE]: [2],
      [TAGS.BF_CHECK]: [8, 17, 18, 12, 13, 14, 9, 44, 21, 22],
      [TAGS.BALANCED]: [45, 48, 51],
      [TAGS.UNBALANCED_LEFT]: [45, 46],
      [TAGS.UNBALANCED_RIGHT]: [48, 49],
      [TAGS.ROTATE_CHILD_LEFT]: [46],
      [TAGS.ROTATE_CHILD_RIGHT]: [49],
      [TAGS.ROTATE_RIGHT]: [47],
      [TAGS.ROTATE_LEFT]: [50],
      [TAGS.ROT_RIGHT_PIVOT]: [26],
      [TAGS.ROT_RIGHT_MOVE]: [27],
      [TAGS.ROT_RIGHT_LINK]: [28],
      [TAGS.ROT_RIGHT_HEIGHT_NODE]: [29, 17, 18],
      [TAGS.ROT_RIGHT_HEIGHT_PIVOT]: [30, 17, 18],
      [TAGS.ROT_RIGHT_RETURN]: [31],
      [TAGS.ROT_LEFT_PIVOT]: [35],
      [TAGS.ROT_LEFT_MOVE]: [36],
      [TAGS.ROT_LEFT_LINK]: [37],
      [TAGS.ROT_LEFT_HEIGHT_NODE]: [38, 17, 18],
      [TAGS.ROT_LEFT_HEIGHT_PIVOT]: [39, 17, 18],
      [TAGS.ROT_LEFT_RETURN]: [40],
      [TAGS.INS_DONE]: [10],
      [TAGS.DEL_EMPTY]: [55],
      [TAGS.DEL_COMPARE]: [56, 57],
      [TAGS.DEL_LEFT]: [56],
      [TAGS.DEL_RIGHT]: [57],
      [TAGS.DEL_NOT_FOUND]: [55],
      [TAGS.DEL_FOUND]: [58, 59],
      [TAGS.DEL_COUNT_DEC]: [59, 60, 61],
      [TAGS.DEL_LEAF]: [62],
      [TAGS.DEL_ONE_CHILD]: [62, 63],
      [TAGS.DEL_REMOVE]: [62, 63],
      [TAGS.DEL_TWO_CHILD]: [62, 63],
      [TAGS.DEL_SUCC_FIND]: [64, 72, 73, 74],
      [TAGS.DEL_SUCC_COPY]: [65, 66],
      [TAGS.DEL_SUCC_REMOVE]: [67, 78],
      [TAGS.DEL_BF_CHECK]: [68, 69, 17, 18, 12, 13, 14, 44, 21, 22],
      [TAGS.DEL_BF_CHECK_SUCC]: [79, 80, 81, 17, 18, 12, 13, 14, 44, 21, 22],
      [TAGS.DEL_DONE]: [69],
    },
  },
  python: {
    content: `class Node:
    def __init__(self, value):
        self.value = value
        self.count = 1
        self.height = 1
        self.left = None
        self.right = None

def insert(node, value):
    if node is None:
        return Node(value)
    if value == node.value:
        node.count += 1
        return node
    if value < node.value:
        node.left = insert(node.left, value)
    else:
        node.right = insert(node.right, value)
    update_height(node)
    return rebalance(node)

def height(node):
    return node.height if node else 0

def update_height(node):
    node.height = 1 + max(height(node.left), height(node.right))

def balance_factor(node):
    return height(node.left) - height(node.right)

def rotate_right(y):
    x = y.left
    y.left = x.right
    x.right = y
    update_height(y)
    update_height(x)
    return x

def rotate_left(x):
    y = x.right
    x.right = y.left
    y.left = x
    update_height(x)
    update_height(y)
    return y

def rebalance(node):
    bf = balance_factor(node)
    if bf > 1:
        if balance_factor(node.left) < 0:
            node.left = rotate_left(node.left)
        return rotate_right(node)
    if bf < -1:
        if balance_factor(node.right) > 0:
            node.right = rotate_right(node.right)
        return rotate_left(node)
    return node

def delete(node, value):
    if node is None:
        return None
    if value < node.value:
        node.left = delete(node.left, value)
    elif value > node.value:
        node.right = delete(node.right, value)
    else:
        if node.count > 1:
            node.count -= 1
            return node
        if node.left is None:
            return node.right
        if node.right is None:
            return node.left
        s = min_node(node.right)
        node.value = s.value
        node.count = s.count
        node.right = remove_min(node.right)
    update_height(node)
    return rebalance(node)

def min_node(node):
    return node if node.left is None else min_node(node.left)

def remove_min(node):
    if node.left is None:
        return node.right
    node.left = remove_min(node.left)
    update_height(node)
    return rebalance(node)`,
    lineComplexity: [
      { lineNumber: 1, complexity: 'O(1)' }, // class Node:
      { lineNumber: 2, complexity: 'O(1)' }, // def __init__(self, value):
      { lineNumber: 3, complexity: 'O(1)' }, // self.value = value
      { lineNumber: 4, complexity: 'O(1)' }, // self.count = 1
      { lineNumber: 5, complexity: 'O(1)' }, // self.height = 1
      { lineNumber: 6, complexity: 'O(1)' }, // self.left = None
      { lineNumber: 7, complexity: 'O(1)' }, // self.right = None
      { lineNumber: 9, complexity: 'O(log n)' }, // def insert(node, value):
      { lineNumber: 10, complexity: 'O(1)' }, // if node is None:
      { lineNumber: 11, complexity: 'O(1)' }, // return Node(value)
      { lineNumber: 12, complexity: 'O(1)' }, // if value == node.value:
      { lineNumber: 13, complexity: 'O(1)' }, // node.count += 1
      { lineNumber: 14, complexity: 'O(1)' }, // return node
      { lineNumber: 15, complexity: 'O(1)' }, // if value < node.value:
      { lineNumber: 16, complexity: 'O(log n)' }, // node.left = insert(node.left, value)
      { lineNumber: 17, complexity: 'O(1)' }, // else:
      { lineNumber: 18, complexity: 'O(log n)' }, // node.right = insert(node.right, value)
      { lineNumber: 19, complexity: 'O(1)' }, // update_height(node)
      { lineNumber: 20, complexity: 'O(1)' }, // return rebalance(node)
      { lineNumber: 22, complexity: 'O(1)' }, // def height(node):
      { lineNumber: 23, complexity: 'O(1)' }, // return node.height if node else 0
      { lineNumber: 25, complexity: 'O(1)' }, // def update_height(node):
      { lineNumber: 26, complexity: 'O(1)' }, // node.height = 1 + max(height(node.left), height(node.right))
      { lineNumber: 28, complexity: 'O(1)' }, // def balance_factor(node):
      { lineNumber: 29, complexity: 'O(1)' }, // return height(node.left) - height(node.right)
      { lineNumber: 31, complexity: 'O(1)' }, // def rotate_right(y):
      { lineNumber: 32, complexity: 'O(1)' }, // x = y.left
      { lineNumber: 33, complexity: 'O(1)' }, // y.left = x.right
      { lineNumber: 34, complexity: 'O(1)' }, // x.right = y
      { lineNumber: 35, complexity: 'O(1)' }, // update_height(y)
      { lineNumber: 36, complexity: 'O(1)' }, // update_height(x)
      { lineNumber: 37, complexity: 'O(1)' }, // return x
      { lineNumber: 39, complexity: 'O(1)' }, // def rotate_left(x):
      { lineNumber: 40, complexity: 'O(1)' }, // y = x.right
      { lineNumber: 41, complexity: 'O(1)' }, // x.right = y.left
      { lineNumber: 42, complexity: 'O(1)' }, // y.left = x
      { lineNumber: 43, complexity: 'O(1)' }, // update_height(x)
      { lineNumber: 44, complexity: 'O(1)' }, // update_height(y)
      { lineNumber: 45, complexity: 'O(1)' }, // return y
      { lineNumber: 47, complexity: 'O(1)' }, // def rebalance(node):
      { lineNumber: 48, complexity: 'O(1)' }, // bf = balance_factor(node)
      { lineNumber: 49, complexity: 'O(1)' }, // if bf > 1:
      { lineNumber: 50, complexity: 'O(1)' }, // if balance_factor(node.left) < 0:
      { lineNumber: 51, complexity: 'O(1)' }, // node.left = rotate_left(node.left)
      { lineNumber: 52, complexity: 'O(1)' }, // return rotate_right(node)
      { lineNumber: 53, complexity: 'O(1)' }, // if bf < -1:
      { lineNumber: 54, complexity: 'O(1)' }, // if balance_factor(node.right) > 0:
      { lineNumber: 55, complexity: 'O(1)' }, // node.right = rotate_right(node.right)
      { lineNumber: 56, complexity: 'O(1)' }, // return rotate_left(node)
      { lineNumber: 57, complexity: 'O(1)' }, // return node
      { lineNumber: 59, complexity: 'O(log n)' }, // def delete(node, value):
      { lineNumber: 60, complexity: 'O(1)' }, // if node is None:
      { lineNumber: 61, complexity: 'O(1)' }, // return None
      { lineNumber: 62, complexity: 'O(1)' }, // if value < node.value:
      { lineNumber: 63, complexity: 'O(log n)' }, // node.left = delete(node.left, value)
      { lineNumber: 64, complexity: 'O(1)' }, // elif value > node.value:
      { lineNumber: 65, complexity: 'O(log n)' }, // node.right = delete(node.right, value)
      { lineNumber: 66, complexity: 'O(1)' }, // else:
      { lineNumber: 67, complexity: 'O(1)' }, // if node.count > 1:
      { lineNumber: 68, complexity: 'O(1)' }, // node.count -= 1
      { lineNumber: 69, complexity: 'O(1)' }, // return node
      { lineNumber: 70, complexity: 'O(1)' }, // if node.left is None:
      { lineNumber: 71, complexity: 'O(1)' }, // return node.right
      { lineNumber: 72, complexity: 'O(1)' }, // if node.right is None:
      { lineNumber: 73, complexity: 'O(1)' }, // return node.left
      { lineNumber: 74, complexity: 'O(log n)' }, // s = min_node(node.right)
      { lineNumber: 75, complexity: 'O(1)' }, // node.value = s.value
      { lineNumber: 76, complexity: 'O(1)' }, // node.count = s.count
      { lineNumber: 77, complexity: 'O(log n)' }, // node.right = remove_min(node.right)
      { lineNumber: 78, complexity: 'O(1)' }, // update_height(node)
      { lineNumber: 79, complexity: 'O(1)' }, // return rebalance(node)
      { lineNumber: 81, complexity: 'O(log n)' }, // def min_node(node):
      { lineNumber: 82, complexity: 'O(log n)' }, // return node if node.left is None else min_node(node.left)
      { lineNumber: 84, complexity: 'O(log n)' }, // def remove_min(node):
      { lineNumber: 85, complexity: 'O(1)' }, // if node.left is None:
      { lineNumber: 86, complexity: 'O(1)' }, // return node.right
      { lineNumber: 87, complexity: 'O(log n)' }, // node.left = remove_min(node.left)
      { lineNumber: 88, complexity: 'O(1)' }, // update_height(node)
      { lineNumber: 89, complexity: 'O(1)' }, // return rebalance(node)
    ],
  },
};

export const avlTreeConfig: LevelImplementationConfig = {
  id: "avl-tree",
  type: "dataStructure",
  name: "AVL 樹 (AVL Tree)",
  categoryName: "樹狀結構",
  description: "自動維持平衡的二元搜尋樹，每個節點左右子樹的高度差不超過 1",
  i18nNamespace: "tutorials/avl-tree",
  complexity: {
    timeBest: "O(log n)",
    timeAverage: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(n)",
  },
  introduction: { key: "introduction" },
  codeConfig: avlCodeConfig,
  defaultData: DEFAULT_DATA,
  statusConfig: AVLStatusConfig,
  actionHandler: avlActionHandler,
  createAnimationSteps: createAVLAnimationSteps,
  renderActionBar: (props) => (
    <AVLTreeActionBar {...(props as DSActionBarProps)} />
  ),
  maxNodes: 20,
};

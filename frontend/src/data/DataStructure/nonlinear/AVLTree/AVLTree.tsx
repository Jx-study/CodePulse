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
import { AVLStatusConfig } from "./tags";
import { buildAVL, toState } from "./avl";
import { simulateAVLTrace, type AVLInputItem } from "./simulateTrace";
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

function createAVLAnimationSteps(inputData: AVLInputItem[]): AnimationStep[] {
  return avlTraceToSteps(simulateAVLTrace(inputData));
}

const avlCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure Height(node):
  If node is Null Then Return 0
  Return 1 + Max(Height(node.left), Height(node.right))
End Procedure

Procedure BalanceFactor(node):
  Return Height(node.left) - Height(node.right)
End Procedure

Procedure RotateRight(y):
  x ← y.left
  y.left ← x.right
  x.right ← y
  Return x
End Procedure

Procedure RotateLeft(x):
  y ← x.right
  x.right ← y.left
  y.left ← x
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
End Procedure`,
    mappings: {},
  },
  python: {
    content: `def height(node):
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))

def balance_factor(node):
    return height(node.left) - height(node.right)

def rotate_right(y):
    x = y.left
    y.left = x.right
    x.right = y
    return x

def rotate_left(x):
    y = x.right
    x.right = y.left
    y.left = x
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
    return node`,
    lineComplexity: [
      { lineNumber: 1, complexity: 'O(n)' },    // def height(node):
      { lineNumber: 2, complexity: 'O(1)' },    // if node is None:
      { lineNumber: 3, complexity: 'O(1)' },    // return 0
      { lineNumber: 4, complexity: 'O(n)' },    // return 1 + max(height(node.left), height(node.right))
      { lineNumber: 6, complexity: 'O(n)' },    // def balance_factor(node):
      { lineNumber: 7, complexity: 'O(n)' },    // return height(node.left) - height(node.right)
      { lineNumber: 9, complexity: 'O(1)' },    // def rotate_right(y):
      { lineNumber: 10, complexity: 'O(1)' },   // x = y.left
      { lineNumber: 11, complexity: 'O(1)' },   // y.left = x.right
      { lineNumber: 12, complexity: 'O(1)' },   // x.right = y
      { lineNumber: 13, complexity: 'O(1)' },   // return x
      { lineNumber: 15, complexity: 'O(1)' },   // def rotate_left(x):
      { lineNumber: 16, complexity: 'O(1)' },   // y = x.right
      { lineNumber: 17, complexity: 'O(1)' },   // x.right = y.left
      { lineNumber: 18, complexity: 'O(1)' },   // y.left = x
      { lineNumber: 19, complexity: 'O(1)' },   // return y
      { lineNumber: 21, complexity: 'O(n)' },   // def rebalance(node):
      { lineNumber: 22, complexity: 'O(n)' },   // bf = balance_factor(node)
      { lineNumber: 23, complexity: 'O(1)' },   // if bf > 1:
      { lineNumber: 24, complexity: 'O(n)' },   // if balance_factor(node.left) < 0:
      { lineNumber: 25, complexity: 'O(1)' },   // node.left = rotate_left(node.left)
      { lineNumber: 26, complexity: 'O(1)' },   // return rotate_right(node)
      { lineNumber: 27, complexity: 'O(1)' },   // if bf < -1:
      { lineNumber: 28, complexity: 'O(n)' },   // if balance_factor(node.right) > 0:
      { lineNumber: 29, complexity: 'O(1)' },   // node.right = rotate_right(node.right)
      { lineNumber: 30, complexity: 'O(1)' },   // return rotate_left(node)
      { lineNumber: 31, complexity: 'O(1)' },   // return node
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

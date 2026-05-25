import { AnimationStep, CodeConfig } from "@/types";
import {
  AlgoActionBarProps,
  LevelImplementationConfig,
} from "@/types/implementation";
import { NQueensActionBar } from "./NQueensActionBar";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { cloneData } from "@/modules/core/visualization/visualizationUtils";
import { NQueensStatusConfig, TAGS } from "./nQueens/tags";
import { simulateNQueensTrace, NQueensData } from "./nQueens/simulateTrace";
import { nQueensTraceToSteps } from "./nQueens/traceToSteps";

function nQueensActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: NQueensData[],
  context: ActionContext,
): ActionResult<NQueensData[]> | null {
  if (actionType === "load") {
    const raw = payload.data as string;
    if (!raw?.startsWith("NQUEENS:")) return null;

    const parts = raw.split(":");
    if (parts.length < 2) return null;

    const n = parseInt(parts[1], 10);
    if (isNaN(n) || n < 1) return null;

    return {
      animationData: [{ n }],
      animationParams: { nQueensCount: n },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if (actionType === "reset") {
    return {
      animationData: cloneData(context.defaultData as NQueensData[]),
      isResetAction: true,
    };
  }

  if (actionType === "run") {
    return {
      animationData: cloneData(data),
      animationParams: payload,
    };
  }

  return null;
}

export function createNQueensAnimationSteps(
  inputData: unknown,
  action?: unknown,
): AnimationStep[] {
  const trace = simulateNQueensTrace(inputData, action);
  return nQueensTraceToSteps(trace);
}

const nQueensCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure SolveNQueens(row):
  If row == N Then
    Return True
  For col from 0 to N-1:
    If IsSafe(row, col) Then
      PlaceQueen(row, col)
      If SolveNQueens(row + 1) Then
        Return True
      RemoveQueen(row, col) // Backtrack
  Return False`,
    mappings: {
      [TAGS.INIT]: [1],
      [TAGS.CHECK_SAFE]: [4],
      [TAGS.ATTACKED]: [4],
      [TAGS.PLACE_QUEEN]: [5],
      [TAGS.RECURSE]: [6],
      [TAGS.SUCCESS]: [2, 7],
      [TAGS.BACKTRACK]: [8],
      [TAGS.FAIL]: [9],
    },
  },
  python: {
    content: `def solve_n_queens(row, n, board):
    if row == n:
        return True
        
    for col in range(n):
        if is_safe(row, col, board):
            board[row] = col
            if solve_n_queens(row + 1, n, board):
                return True
            board[row] = -1 # Backtrack
            
    return False`,
  },
};

export const nQueensConfig: LevelImplementationConfig = {
  id: "n-queens",
  type: "algorithm",
  name: "N 皇后問題",
  categoryName: "回溯法 (Backtracking)",
  description: "在 NxN 的棋盤上放置 N 個皇后，使得她們互不攻擊。",
  codeConfig: nQueensCodeConfig,
  statusConfig: NQueensStatusConfig,
  complexity: {
    timeBest: "O(N!)",
    timeAverage: "O(N!)",
    timeWorst: "O(N!)",
    space: "O(N)",
  },
  introduction: `N 皇后問題是回溯法的經典題。我們逐列 (Row) 嘗試放置皇后，如果該位置不在任何已放置皇后的攻擊範圍（同行、同列、對角線）內，就暫時放上去，並繼續遞迴尋找下一列。如果下一列找不到解，我們就「回溯（拔起皇后）」，換下一個位置繼續試。`,
  defaultData: [{ n: 4 }],
  actionHandler: nQueensActionHandler,
  createAnimationSteps: createNQueensAnimationSteps,
  renderActionBar: (props) => (
    <NQueensActionBar {...(props as AlgoActionBarProps)} />
  ),
  i18nNamespace: "tutorials/n-queens",
};

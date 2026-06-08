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
    content: `def is_safe(row, col, cols, diags, anti_diags):
    return (col not in cols
            and (row - col) not in diags
            and (row + col) not in anti_diags)

def solve_n_queens(row, n, board, cols, diags, anti_diags):
    if row == n:
        return True

    for col in range(n):
        if is_safe(row, col, cols, diags, anti_diags):
            board[row] = col
            cols.add(col)
            diags.add(row - col)
            anti_diags.add(row + col)
            if solve_n_queens(row + 1, n, board, cols, diags, anti_diags):
                return True
            board[row] = -1 # Backtrack
            cols.discard(col)
            diags.discard(row - col)
            anti_diags.discard(row + col)

    return False`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(1)' },                                  // def is_safe(row, col, cols, diags, anti_diags):
      { lineNumber: 2,  complexity: 'O(1)' },                                  //     return (col not in cols
      { lineNumber: 3,  complexity: 'O(1)' },                                  //             and (row - col) not in diags
      { lineNumber: 4,  complexity: 'O(1)' },                                  //             and (row + col) not in anti_diags)
      { lineNumber: 6,  complexity: 'O(n!)' },                                 // def solve_n_queens(row, n, board, cols, diags, anti_diags):
      { lineNumber: 7,  complexity: 'O(1)' },                                  //     if row == n:
      { lineNumber: 8,  complexity: 'O(1)' },                                  //         return True
      { lineNumber: 10, complexity: 'O(n)' },                                  //     for col in range(n):
      { lineNumber: 11, complexity: 'O(1)', context: 'O(n)' },                 //         if is_safe(row, col, cols, diags, anti_diags):
      { lineNumber: 12, complexity: 'O(1)', context: 'O(n)' },                 //             board[row] = col
      { lineNumber: 13, complexity: 'O(1)', context: 'O(n)' },                 //             cols.add(col)
      { lineNumber: 14, complexity: 'O(1)', context: 'O(n)' },                 //             diags.add(row - col)
      { lineNumber: 15, complexity: 'O(1)', context: 'O(n)' },                 //             anti_diags.add(row + col)
      { lineNumber: 16, complexity: 'O(n!)', context: 'O(n)' },                //             if solve_n_queens(row + 1, n, board, cols, diags, anti_diags):
      { lineNumber: 17, complexity: 'O(1)', context: 'O(n)' },                 //                 return True
      { lineNumber: 18, complexity: 'O(1)', context: 'O(n)' },                 //             board[row] = -1 # Backtrack
      { lineNumber: 19, complexity: 'O(1)', context: 'O(n)' },                 //             cols.discard(col)
      { lineNumber: 20, complexity: 'O(1)', context: 'O(n)' },                 //             diags.discard(row - col)
      { lineNumber: 21, complexity: 'O(1)', context: 'O(n)' },                 //             anti_diags.discard(row + col)
      { lineNumber: 23, complexity: 'O(1)' },                                  //     return False
    ],
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

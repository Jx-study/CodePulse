import type { AnimationStep, CodeConfig, StatusConfig } from "@/types";
import type {
  AlgoActionBarProps,
  LevelImplementationConfig,
} from "@/types/implementation";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Box } from "@/modules/core/DataLogic/Box";
import { NQueensActionBar } from "@/data/algorithms/recursive/NQueensActionBar";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { cloneData } from "@/modules/core/visualization/visualizationUtils";

const TAGS = {
  INIT: "INIT",
  LOOP_COL: "LOOP_COL",
  CHECK_SAFE: "CHECK_SAFE",
  ATTACKED: "ATTACKED",
  PLACE_QUEEN: "PLACE_QUEEN",
  RECURSE: "RECURSE",
  BACKTRACK: "BACKTRACK",
  SUCCESS: "SUCCESS",
  FAIL: "FAIL",
};

export const NQueensStatus = {
  Inactive: Status.Inactive,
  Target: Status.Target,
  Complete: Status.Complete,
  Attacked: "attacked",
  Backtrack: "backtrack",
} as const;

export const NQueensStatusConfig: StatusConfig = {
  statuses: [
    { key: NQueensStatus.Inactive, label: "安全空格", color: "#475569" },
    { key: NQueensStatus.Target, label: "嘗試中", color: "#f59e0b" },
    { key: NQueensStatus.Complete, label: "已放置皇后", color: "#10b981" },
    { key: NQueensStatus.Attacked, label: "被攻擊範圍", color: "#ef4444" },
    { key: NQueensStatus.Backtrack, label: "回溯拔除", color: "#a855f7" },
  ],
};

type NQueensData = { n: number };

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
      // 將解析出的 N 存入全域資料，確保不會被重置
      animationData: [{ n }],
      animationParams: { nQueensCount: n },
      isResetAction: true,
      useRawAnimationParams: true, // 確保 nQueensCount 參數不被重置清掉
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
  const steps: AnimationStep[] = [];

  // 預設為 4 皇后，最大建議 8 (超過 8 動畫會非常長)
  const typedData = Array.isArray(inputData)
    ? (inputData as NQueensData[])
    : [];
  const typedAction = action as { nQueensCount?: number } | undefined;
  const inputN = typedData.length > 0 ? typedData[0].n : undefined;
  const N = typedAction?.nQueensCount ?? inputN ?? 4;

  // queens[r] = c 代表第 r 行的皇后放在第 c 列。-1 代表未放置。
  const queens: number[] = Array(N).fill(-1);

  const boxW = 50;
  const boxH = 50;
  const startX = 250 - (N * boxW) / 2; // 讓棋盤置中
  const startY = 80;

  // 計算棋盤上哪些位置正在被「已放置的皇后」攻擊
  const getAttackedGrid = (currentQueens: number[]) => {
    const grid = Array(N)
      .fill(0)
      .map(() => Array(N).fill(false));
    for (let r = 0; r < N; r++) {
      const c = currentQueens[r];
      if (c === -1) continue; // 該行尚未放置

      // 標記該皇后攻擊的範圍
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          if (
            i === r || // 同行
            j === c || // 同列
            Math.abs(i - r) === Math.abs(j - c) // 對角線
          ) {
            grid[i][j] = true;
          }
        }
      }
    }
    return grid;
  };

  const recordStep = (
    desc: string,
    tag: string,
    currentRow: number,
    currentCol: number,
    state: "try" | "attacked" | "place" | "backtrack" | "success" | "fail",
  ) => {
    const elements: Box[] = [];
    const attackedGrid = getAttackedGrid(queens);

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const box = new Box();
        box.id = `cell-${r}-${c}`;
        box.moveTo(startX + c * boxW, startY + r * boxH);
        box.width = boxW;
        box.height = boxH;

        const isPlacedQueen = queens[r] === c;
        const isCurrentTarget = r === currentRow && c === currentCol;

        if (isPlacedQueen) {
          // 已放置的皇后
          box.value = "♕";
          box.setStatus(Status.Complete);
        } else if (isCurrentTarget) {
          // 目前正在操作的格子
          if (state === "try") {
            box.value = "?";
            box.setStatus(Status.Target);
          } else if (state === "attacked") {
            box.value = "×";
            box.setStatus(NQueensStatus.Attacked);
          } else if (state === "place") {
            box.value = "♕";
            box.setStatus(Status.Complete);
          } else if (state === "backtrack") {
            box.value = "";
            box.setStatus(NQueensStatus.Backtrack);
          } else {
            box.value = "";
            box.setStatus(Status.Inactive);
          }
        } else if (attackedGrid[r][c]) {
          // 被攻擊的空格
          box.value = "";
          box.setStatus(NQueensStatus.Attacked);
        } else {
          // 安全的空格
          box.value = "";
          box.setStatus(Status.Inactive);
        }

        elements.push(box);
      }
    }

    steps.push({
      stepNumber: steps.length,
      description: desc,
      actionTag: tag,
      elements,
      local_vars: {
        "棋盤大小 (N)": N,
        "目前搜尋列 (Row)": currentRow === -1 ? "完成" : currentRow,
        "目前搜尋行 (Col)": currentCol === -1 ? "-" : currentCol,
      },
    });
  };

  // 回溯演算法核心
  const solve = (row: number): boolean => {
    if (row === N) {
      recordStep(
        `成功在所有列放置皇后，找到一組解！`,
        TAGS.SUCCESS,
        -1,
        -1,
        "success",
      );
      return true; // 找到第一組解就停止 (避免動畫過長)
    }

    for (let col = 0; col < N; col++) {
      recordStep(
        `嘗試在第 ${row} 列，第 ${col} 行放置皇后`,
        TAGS.CHECK_SAFE,
        row,
        col,
        "try",
      );

      const attacked = getAttackedGrid(queens);
      if (attacked[row][col]) {
        recordStep(
          `位置 (${row}, ${col}) 位於其他皇后的攻擊範圍內，無法放置！`,
          TAGS.ATTACKED,
          row,
          col,
          "attacked",
        );
        continue;
      }

      queens[row] = col;
      recordStep(
        `位置 (${row}, ${col}) 安全，放置皇后！`,
        TAGS.PLACE_QUEEN,
        row,
        col,
        "place",
      );

      if (solve(row + 1)) {
        return true;
      }

      queens[row] = -1;
      recordStep(
        `從第 ${row + 1} 列回溯，移除 (${row}, ${col}) 的皇后，尋找下一個位置`,
        TAGS.BACKTRACK,
        row,
        col,
        "backtrack",
      );
    }

    return false;
  };

  recordStep(
    `初始化 ${N}x${N} 棋盤，開始從第 0 列尋找解。`,
    TAGS.INIT,
    0,
    -1,
    "try",
  );

  const hasSolution = solve(0);

  if (!hasSolution) {
    recordStep(
      `窮舉所有可能後，發現在 ${N}x${N} 棋盤上無解！`,
      TAGS.FAIL,
      -1,
      -1,
      "fail",
    );
  }

  return steps;
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
};

import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";

export type NQueensData = { n: number };

export function simulateNQueensTrace(
  inputData: unknown,
  action?: unknown,
): ExecutionTrace {
  const trace: TraceEvent[] = [];

  const typedData = Array.isArray(inputData)
    ? (inputData as NQueensData[])
    : [];
  const typedAction = action as { nQueensCount?: number } | undefined;
  const inputN = typedData.length > 0 ? typedData[0].n : undefined;
  const N = typedAction?.nQueensCount ?? inputN ?? 4;

  const queens: number[] = Array(N).fill(-1);

  const getAttackedGrid = (currentQueens: number[]) => {
    const grid = Array(N)
      .fill(0)
      .map(() => Array(N).fill(false));
    for (let r = 0; r < N; r++) {
      const c = currentQueens[r];
      if (c === -1) continue;
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          if (i === r || j === c || Math.abs(i - r) === Math.abs(j - c)) {
            grid[i][j] = true;
          }
        }
      }
    }
    return grid;
  };

  const pushTrace = (
    tag: string,
    currentRow: number,
    currentCol: number,
    state: "try" | "attacked" | "place" | "backtrack" | "success" | "fail",
  ) => {
    const snapshot = queens.map((col, row) => ({
      id: `queen-${row}`,
      value: col === -1 ? -1 : col, // 存入該 row 放置的 column index
    }));

    trace.push({
      tag,
      local_vars: { N, currentRow, currentCol, state },
      dataSnapshot: snapshot,
      meta: { attackedGrid: getAttackedGrid(queens) },
    });
  };

  const solve = (row: number): boolean => {
    if (row === N) {
      pushTrace(TAGS.SUCCESS, -1, -1, "success");
      return true;
    }

    for (let col = 0; col < N; col++) {
      pushTrace(TAGS.CHECK_SAFE, row, col, "try");
      const attacked = getAttackedGrid(queens);

      if (attacked[row][col]) {
        pushTrace(TAGS.ATTACKED, row, col, "attacked");
        continue;
      }

      queens[row] = col;
      pushTrace(TAGS.PLACE_QUEEN, row, col, "place");

      if (solve(row + 1)) {
        return true;
      }

      queens[row] = -1;
      pushTrace(TAGS.BACKTRACK, row, col, "backtrack");
    }

    return false;
  };

  pushTrace(TAGS.INIT, 0, -1, "try");
  const hasSolution = solve(0);

  if (!hasSolution) {
    pushTrace(TAGS.FAIL, -1, -1, "fail");
  }

  return trace;
}

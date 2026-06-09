import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { TAGS, NQueensStatus } from "./tags";

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "animation.init",
    params: { N: e.local_vars.N },
  }),
  [TAGS.CHECK_SAFE]: (e) => ({
    key: "animation.check_safe",
    params: { row: e.local_vars.currentRow, col: e.local_vars.currentCol },
  }),
  [TAGS.ATTACKED]: (e) => ({
    key: "animation.attacked",
    params: { row: e.local_vars.currentRow, col: e.local_vars.currentCol },
  }),
  [TAGS.PLACE_QUEEN]: (e) => ({
    key: "animation.place_queen",
    params: { row: e.local_vars.currentRow, col: e.local_vars.currentCol },
  }),
  [TAGS.BACKTRACK]: (e) => ({
    key: "animation.backtrack",
    params: {
      row: e.local_vars.currentRow + 1,
      prevRow: e.local_vars.currentRow,
      prevCol: e.local_vars.currentCol,
    },
  }),
  [TAGS.SUCCESS]: () => ({ key: "animation.success" }),
  [TAGS.FAIL]: (e) => ({
    key: "animation.fail",
    params: { N: e.local_vars.N },
  }),
};

export function nQueensTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const { N, currentRow, currentCol, state } = event.local_vars;
    const snapshotItems = event.dataSnapshot as { id: string; value: number }[];
    const queens = snapshotItems.map((item) => item.value);
    const attackedGrid = (event.meta?.attackedGrid as boolean[][]) ?? [];

    const boxW = 50;
    const boxH = 50;
    const startX = 250 - (N * boxW) / 2;
    const startY = 80;
    const elements: Box[] = [];

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
          box.value = "♕";
          box.setStatus(Status.Complete);
        } else if (isCurrentTarget) {
          if (state === "try") {
            box.value = "?";
            box.setStatus(Status.Target);
          } else if (state === "attacked") {
            box.value = "×";
            box.setStatus(NQueensStatus.Attacked as Status);
          } else if (state === "place") {
            box.value = "♕";
            box.setStatus(Status.Complete);
          } else if (state === "backtrack") {
            box.value = "";
            box.setStatus(NQueensStatus.Backtrack as Status);
          } else {
            box.value = "";
            box.setStatus(Status.Inactive);
          }
        } else if (attackedGrid[r]?.[c]) {
          box.value = "";
          box.setStatus(NQueensStatus.Attacked as Status);
        } else {
          box.value = "";
          box.setStatus(Status.Inactive);
        }

        elements.push(box);
      }
    }

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: {
        "N (Size)": N,
        Row: currentRow === -1 ? "-" : currentRow,
        Col: currentCol === -1 ? "-" : currentCol,
      },
      elements: elements as any,
    };
  });
}

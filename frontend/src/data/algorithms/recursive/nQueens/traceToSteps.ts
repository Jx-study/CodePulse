import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { asTrace } from "@/data/shared/traceValue";
import { TAGS, NQueensStatus } from "./tags";

interface NQueensLocalVars {
  N?: number;
  currentRow?: number;
  currentCol?: number;
  state?: "try" | "attacked" | "place" | "backtrack";
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "animation.init",
    params: { N: asTrace<NQueensLocalVars>(e.local_vars).N ?? null },
  }),
  [TAGS.CHECK_SAFE]: (e) => {
    const lv = asTrace<NQueensLocalVars>(e.local_vars);
    return {
      key: "animation.check_safe",
      params: { row: lv.currentRow ?? null, col: lv.currentCol ?? null },
    };
  },
  [TAGS.ATTACKED]: (e) => {
    const lv = asTrace<NQueensLocalVars>(e.local_vars);
    return {
      key: "animation.attacked",
      params: { row: lv.currentRow ?? null, col: lv.currentCol ?? null },
    };
  },
  [TAGS.PLACE_QUEEN]: (e) => {
    const lv = asTrace<NQueensLocalVars>(e.local_vars);
    return {
      key: "animation.place_queen",
      params: { row: lv.currentRow ?? null, col: lv.currentCol ?? null },
    };
  },
  [TAGS.BACKTRACK]: (e) => {
    const lv = asTrace<NQueensLocalVars>(e.local_vars);
    return {
      key: "animation.backtrack",
      params: {
        row: lv.currentRow !== undefined ? lv.currentRow + 1 : null,
        prevRow: lv.currentRow ?? null,
        prevCol: lv.currentCol ?? null,
      },
    };
  },
  [TAGS.SUCCESS]: () => ({ key: "animation.success" }),
  [TAGS.FAIL]: (e) => ({
    key: "animation.fail",
    params: { N: asTrace<NQueensLocalVars>(e.local_vars).N ?? null },
  }),
};

export function nQueensTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const { N, currentRow, currentCol, state } =
      asTrace<NQueensLocalVars>(event.local_vars);
    const safeN = N ?? 0;
    const snapshotItems = event.dataSnapshot as { id: string; value: number }[];
    const queens = snapshotItems.map((item) => item.value);
    const attackedGrid =
      asTrace<{ attackedGrid?: boolean[][] }>(event.meta).attackedGrid ?? [];

    const boxW = 50;
    const boxH = 50;
    const startX = 250 - (safeN * boxW) / 2;
    const startY = 80;
    const elements: Box[] = [];

    for (let r = 0; r < safeN; r++) {
      for (let c = 0; c < safeN; c++) {
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
        "N (Size)": N ?? null,
        Row: currentRow === -1 ? "-" : (currentRow ?? null),
        Col: currentCol === -1 ? "-" : (currentCol ?? null),
      },
      elements,
    };
  });
}

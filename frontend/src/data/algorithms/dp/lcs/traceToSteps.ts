import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { asTrace } from "@/data/shared/traceValue";
import { TAGS, LCSStatus } from "./tags";

interface LCSLocalVars {
  m?: number;
  n?: number;
  i?: number;
  j?: number;
  charA?: string;
  charB?: string;
  char?: string;
  diag?: number;
  up?: number;
  left?: number;
  dpVal?: number;
  length?: number;
  lcs?: string;
}

interface LCSMeta {
  textA?: string;
  textB?: string;
  dp?: (number | null)[][];
  statusMap?: Record<string, string>;
}

const lv = (e: TraceEvent) => asTrace<LCSLocalVars>(e.local_vars);

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "animation.init",
    params: { m: lv(e).m ?? null, n: lv(e).n ?? null },
  }),
  [TAGS.MATCH]: (e) => {
    const v = lv(e);
    return {
      key: "animation.match",
      params: {
        i: v.i ?? null,
        j: v.j ?? null,
        char: v.charA ?? null,
        diag: v.diag ?? null,
        dpVal: v.dpVal ?? null,
      },
    };
  },
  [TAGS.NO_MATCH]: (e) => {
    const v = lv(e);
    return {
      key: "animation.no_match",
      params: {
        i: v.i ?? null,
        j: v.j ?? null,
        charA: v.charA ?? null,
        charB: v.charB ?? null,
        up: v.up ?? null,
        left: v.left ?? null,
        dpVal: v.dpVal ?? null,
      },
    };
  },
  [TAGS.TRACE_START]: (e) => ({
    key: "animation.trace_start",
    params: { i: lv(e).i ?? null, j: lv(e).j ?? null, length: lv(e).length ?? null },
  }),
  [TAGS.TRACE_MATCH]: (e) => ({
    key: "animation.trace_match",
    params: {
      i: lv(e).i ?? null,
      j: lv(e).j ?? null,
      char: lv(e).char ?? null,
      lcs: lv(e).lcs ?? null,
    },
  }),
  [TAGS.TRACE_UP]: (e) => ({
    key: "animation.trace_up",
    params: { up: lv(e).up ?? null, left: lv(e).left ?? null },
  }),
  [TAGS.TRACE_LEFT]: (e) => ({
    key: "animation.trace_left",
    params: { up: lv(e).up ?? null, left: lv(e).left ?? null },
  }),
  [TAGS.DONE]: (e) => ({
    key: lv(e).length ? "animation.done" : "animation.done_empty",
    params: { length: lv(e).length ?? 0, lcs: lv(e).lcs ?? "" },
  }),
};

export function lcsTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = asTrace<LCSMeta>(event.meta);
    const textA = meta.textA ?? "";
    const textB = meta.textB ?? "";
    const dp = meta.dp ?? [];
    const statusMap = meta.statusMap ?? {};

    const elements: Box[] = [];
    const boxW = 50;
    const boxH = 50;

    const createBox = (
      id: string,
      value: string,
      x: number,
      y: number,
      status: string,
    ) => {
      const b = new Box();
      b.id = id;
      b.value = value;
      b.moveTo(x, y);
      b.width = boxW;
      b.height = boxH;
      b.setStatus(status as Status);
      return b;
    };

    // 左上角與表頭：欄為 textB、列為 textA，第 0 欄 / 列代表空字串
    elements.push(createBox("corner", "A\\B", -boxW, -boxH, LCSStatus.Inactive));

    for (let j = 0; j <= textB.length; j++) {
      elements.push(
        createBox(
          `col-${j}`,
          j === 0 ? "∅" : textB[j - 1],
          j * boxW,
          -boxH,
          statusMap[`col-${j}`] ?? LCSStatus.Inactive,
        ),
      );
    }

    for (let i = 0; i <= textA.length; i++) {
      elements.push(
        createBox(
          `row-${i}`,
          i === 0 ? "∅" : textA[i - 1],
          -boxW,
          i * boxH,
          statusMap[`row-${i}`] ?? LCSStatus.Inactive,
        ),
      );
    }

    for (let i = 0; i <= textA.length; i++) {
      for (let j = 0; j <= textB.length; j++) {
        const key = `${i}-${j}`;
        const val = dp[i]?.[j];
        const isBase = i === 0 || j === 0;
        elements.push(
          createBox(
            `dp-${key}`,
            val === null || val === undefined ? "" : String(val),
            j * boxW,
            i * boxH,
            statusMap[key] ??
              (isBase ? LCSStatus.Inactive : LCSStatus.Unfinished),
          ),
        );
      }
    }

    return {
      stepNumber: idx,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      local_vars: event.local_vars,
      elements,
    };
  });
}

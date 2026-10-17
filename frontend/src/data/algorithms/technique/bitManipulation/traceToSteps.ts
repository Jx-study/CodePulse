import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { asTrace } from "@/data/shared/traceValue";
import { TAGS, BitManipulationStatus } from "./tags";
import type { BitRow } from "./simulateTrace";

type BitManipulationLocalVars = Record<string, string | number | boolean | undefined>;

interface BitManipulationMeta {
  width?: number;
  rows?: BitRow[];
  statusMap?: Record<string, string>;
}

const lv = (e: TraceEvent) => asTrace<BitManipulationLocalVars>(e.local_vars);

/** 把 local_vars 的指定欄位原樣帶進 i18n 參數 */
const pick =
  (key: string, fields: string[]) =>
  (e: TraceEvent): StepDescription => {
    const v = lv(e);
    const params: Record<string, string | number | null> = {};
    for (const f of fields) {
      const value = v[f];
      params[f] = value === undefined || typeof value === "boolean" ? null : value;
    }
    return { key, params };
  };

const OP_SUFFIX: Record<string, string> = { "~": "_not", "<<": "_shl", ">>": "_shr" };

const binaryBit = pick("animation.ops_bit", ["k", "bitA", "bitB", "op", "bit"]);

const shiftStep = (e: TraceEvent): StepDescription => {
  const v = lv(e);
  const dir = OP_SUFFIX[v.op as string];
  if (v.phase === "fill") return pick(`animation.ops_shift_fill${dir}`, ["s"])(e);
  if (!v.s) return pick("animation.ops_shift_none", [])(e);
  return pick(`animation.ops_shift_move${dir}`, ["s", "dropped"])(e);
};

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.OPS_INIT]: (e) =>
    pick(`animation.ops_init${OP_SUFFIX[lv(e).op as string] ?? ""}`, ["a", "b", "op", "s"])(e),
  [TAGS.OPS_BIT_AND]: binaryBit,
  [TAGS.OPS_BIT_OR]: binaryBit,
  [TAGS.OPS_BIT_XOR]: binaryBit,
  [TAGS.OPS_BIT_NOT]: pick("animation.ops_bit_not", ["k", "bitA", "bit"]),
  [TAGS.OPS_BIT_SHL]: shiftStep,
  [TAGS.OPS_BIT_SHR]: shiftStep,
  [TAGS.OPS_DONE]: (e) => {
    const v = lv(e);
    const overflow = v.op === "<<" && (v.full as number) > (v.result as number);
    const suffix = (OP_SUFFIX[v.op as string] ?? "") + (overflow ? "_overflow" : "");
    return pick(`animation.ops_done${suffix}`, ["a", "b", "op", "s", "full", "result"])(e);
  },
  [TAGS.SINGLE_INIT]: pick("animation.single_init", ["a", "k", "bit"]),
  [TAGS.SINGLE_MASK]: (e) => {
    const v = lv(e);
    const isClear = (((v.mask as number) >> (v.k as number)) & 1) === 0;
    return pick(isClear ? "animation.single_mask_clear" : "animation.single_mask", ["k", "mask"])(e);
  },
  [TAGS.SINGLE_SET]: pick("animation.single_set", ["k", "bit", "result"]),
  [TAGS.SINGLE_TEST]: (e) =>
    pick(lv(e).result ? "animation.single_test_1" : "animation.single_test_0", ["k", "result"])(e),
  [TAGS.SINGLE_CLEAR]: pick("animation.single_clear", ["k", "bit", "result"]),
  [TAGS.SINGLE_TOGGLE]: (e) => {
    const v = lv(e);
    return {
      key: "animation.single_toggle",
      params: {
        k: (v.k as number) ?? null,
        bit: (v.bit as number) ?? null,
        newBit: 1 - ((v.bit as number) ?? 0),
        result: (v.result as number) ?? null,
      },
    };
  },
  [TAGS.SWAP_INIT]: pick("animation.swap_init", ["a", "b"]),
  [TAGS.SWAP_STEP1]: pick("animation.swap_step1", ["a"]),
  [TAGS.SWAP_STEP2]: pick("animation.swap_step2", ["b"]),
  [TAGS.SWAP_STEP3]: pick("animation.swap_step3", ["a"]),
  [TAGS.SWAP_DONE]: pick("animation.swap_done", ["a", "b"]),
  [TAGS.LOWBIT_INIT]: pick("animation.lowbit_init", ["a"]),
  [TAGS.LOWBIT_NOT]: pick("animation.lowbit_not", ["a", "notA"]),
  [TAGS.LOWBIT_NEG]: (e) =>
    pick(lv(e).low === null ? "animation.lowbit_neg_zero" : "animation.lowbit_neg", ["notA", "negA", "low"])(e),
  [TAGS.LOWBIT_AND]: (e) =>
    pick(lv(e).low === null ? "animation.lowbit_and_zero" : "animation.lowbit_and", ["a", "negA", "result", "low"])(e),
  [TAGS.COUNT_INIT]: pick("animation.count_init", ["n"]),
  [TAGS.COUNT_MINUS_ONE]: pick("animation.count_minus_one", ["n", "minus", "lowestBit"]),
  [TAGS.COUNT_CLEAR]: pick("animation.count_clear", ["n", "minus", "next", "count"]),
  [TAGS.COUNT_DONE]: (e) => {
    const v = lv(e);
    const suffix = v.isPowerOfTwo ? "power" : v.count === 0 ? "zero" : "normal";
    return {
      key: `animation.count_done_${suffix}`,
      params: {
        n: (v.n as number) ?? null,
        count: (v.count as number) ?? 0,
        parity: (v.n as number) & 1,
      },
    };
  },
  [TAGS.SUBSET_INIT]: pick("animation.subset_init", ["n", "total", "target"]),
  [TAGS.SUBSET_CHECK]: pick("animation.subset_check", ["mask", "binary", "subset", "sum", "target"]),
  [TAGS.SUBSET_FOUND]: pick("animation.subset_found", ["mask", "binary", "subset", "sum"]),
  [TAGS.SUBSET_DONE]: (e) => {
    const v = lv(e);
    return {
      key: v.count ? "animation.subset_done" : "animation.subset_done_empty",
      params: {
        total: (v.total as number) ?? null,
        target: (v.target as number) ?? null,
        count: (v.count as number) ?? 0,
        found: (v.found as string) ?? "",
      },
    };
  },
};

const BOX = 50;
const ROW_GAP = 12;
const SIDE_GAP = 12;
const LABEL_W = 120;
const VALUE_W = 100;
/** 右上角狀態圖例的寬度（viewBox 單位的估計值），用隱形方塊把表格往左推，避免被圖例蓋住 */
const LEGEND_SPACE = 190;

const defaultCellStatus = (row: BitRow, cell: string) => {
  if (row.header || cell === "") return BitManipulationStatus.Inactive;
  return cell === "1" ? BitManipulationStatus.One : BitManipulationStatus.Unfinished;
};

export function bitManipulationTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = asTrace<BitManipulationMeta>(event.meta);
    const width = meta.width ?? 0;
    const rows = meta.rows ?? [];
    const statusMap = meta.statusMap ?? {};

    const elements: Box[] = [];
    const createBox = (
      id: string,
      value: string,
      x: number,
      y: number,
      w: number,
      status: string,
    ) => {
      const b = new Box();
      b.id = id;
      b.value = value;
      b.moveTo(x, y);
      b.width = w;
      b.height = BOX;
      b.setStatus(status as Status);
      elements.push(b);
    };

    // 最高位在左、第 0 位在最右邊，與二進位的書寫順序一致
    const cellX = (k: number) => (width - 1 - k) * BOX;
    const labelX = -BOX / 2 - SIDE_GAP - LABEL_W / 2;
    const valueX = (width - 1) * BOX + BOX / 2 + SIDE_GAP + VALUE_W / 2;

    rows.forEach((row, r) => {
      const y = r * (BOX + ROW_GAP);
      createBox(`${row.id}-label`, row.label, labelX, y, LABEL_W, BitManipulationStatus.Inactive);
      for (let k = 0; k < width; k++) {
        const cell = row.cells[k] ?? "";
        createBox(
          `${row.id}-${k}`,
          cell,
          cellX(k),
          y,
          BOX,
          statusMap[`${row.id}-${k}`] ?? defaultCellStatus(row, cell),
        );
      }
      createBox(
        `${row.id}-value`,
        row.value,
        valueX,
        y,
        VALUE_W,
        statusMap[`${row.id}-value`] ?? BitManipulationStatus.Inactive,
      );
    });

    // opacity 0 的方塊不會顯示，但仍計入畫布的外框，讓右上角留給圖例
    createBox(
      "legend-space",
      "",
      valueX + VALUE_W / 2 + LEGEND_SPACE / 2,
      0,
      LEGEND_SPACE,
      BitManipulationStatus.Inactive,
    );
    elements[elements.length - 1].opacity = 0;

    return {
      stepNumber: idx,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      local_vars: event.local_vars,
      elements,
    };
  });
}

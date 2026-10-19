import type { ExecutionTrace, TraceEvent, JsonValue } from "@/types/trace";
import type { BitManipulationMode } from "@/types/implementation";
import { TAGS, BitManipulationStatus } from "./tags";

export type { BitManipulationMode };
export type BitOp = "AND" | "OR" | "XOR" | "NOT" | "SHL" | "SHR";
export type SingleBitOp = "SET" | "TEST" | "CLEAR" | "TOGGLE";

export type BitManipulationData = {
  mode: BitManipulationMode;
  a: number;
  /** 二元運算的第二個運算元；移位時代表位移量 */
  b: number;
  op: BitOp;
  k: number;
  singleOp: SingleBitOp;
  n: number;
  items: number[];
  target: number;
};

/** 位元運算與計算 1 的個數都以 8 位元顯示（0 ~ 255） */
export const BIT_WIDTH = 8;
export const MAX_BIT_VALUE = (1 << BIT_WIDTH) - 1;
/** 子集枚舉最多保留幾列找到的答案，避免畫面被撐得太高 */
export const MAX_FOUND_ROWS = 4;

export const OP_SYMBOL: Record<BitOp, string> = {
  AND: "&",
  OR: "|",
  XOR: "^",
  NOT: "~",
  SHL: "<<",
  SHR: ">>",
};

const BINARY_OPS: BitOp[] = ["AND", "OR", "XOR"];

/**
 * 畫面上的一列：label | cells（index k = 第 k 位，畫在右起第 k 格）| value
 * header 列預設為 Inactive；其餘列 "1" 為 One、"0" 為 Unfinished、空白為 Inactive
 */
export type BitRow = {
  id: string;
  label: string;
  cells: string[];
  value: string;
  header?: boolean;
};

const toBits = (value: number, width: number): string[] =>
  Array.from({ length: width }, (_, k) => String((value >> k) & 1));

const blankRow = (id: string, label: string, width = BIT_WIDTH): BitRow => ({
  id,
  label,
  cells: Array(width).fill(""),
  value: "",
});

const weightRow = (value = ""): BitRow => ({
  id: "weight",
  label: "2^k",
  cells: Array.from({ length: BIT_WIDTH }, (_, k) => String(1 << k)),
  value,
  header: true,
});

const makePush =
  (trace: TraceEvent[], width: number) =>
  (
    tag: string,
    vars: Record<string, JsonValue>,
    rows: BitRow[],
    statusMap: Record<string, string> = {},
  ) => {
    trace.push({
      tag,
      local_vars: vars,
      dataSnapshot: [],
      meta: { width, rows, statusMap },
    });
  };

function simulateBitOps(a: number, b: number, op: BitOp): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const push = makePush(trace, BIT_WIDTH);
  const symbol = OP_SYMBOL[op];
  const isBinary = BINARY_OPS.includes(op);
  const isShift = op === "SHL" || op === "SHR";
  const shift = Math.min(Math.max(b, 0), BIT_WIDTH);
  const resultCells: string[] = Array(BIT_WIDTH).fill("");
  let result = 0;

  const resultLabel = isBinary
    ? `a ${symbol} b`
    : op === "NOT"
      ? "~a"
      : `a ${symbol} ${shift}`;

  const rows = (resultValue: string): BitRow[] => [
    weightRow(),
    { id: "a", label: "a", cells: toBits(a, BIT_WIDTH), value: String(a) },
    ...(isBinary
      ? [{ id: "b", label: "b", cells: toBits(b, BIT_WIDTH), value: String(b) }]
      : []),
    { id: "result", label: resultLabel, cells: [...resultCells], value: resultValue },
  ];

  push(
    TAGS.OPS_INIT,
    isShift ? { a, op: symbol, s: shift } : isBinary ? { a, b, op: symbol } : { a, op: symbol },
    rows(""),
  );

  const tag = TAGS[`OPS_BIT_${op}` as keyof typeof TAGS];

  if (isShift) {
    // 移位是整排位元一起搬，不是一次搬一格：先整排移動，再把空出來的位置補 0
    // 左移：結果第 k 位來自 a 的第 k - s 位；右移：來自第 k + s 位
    const sourceOf = (k: number) => (op === "SHL" ? k - shift : k + shift);
    const moveStatus: Record<string, string> = {};
    const fillStatus: Record<string, string> = {};
    for (let k = 0; k < BIT_WIDTH; k++) {
      const from = sourceOf(k);
      if (from >= 0 && from < BIT_WIDTH) {
        const bit = (a >> from) & 1;
        if (bit) result |= 1 << k;
        resultCells[k] = String(bit);
        moveStatus[`a-${from}`] = BitManipulationStatus.Prepare;
      } else {
        fillStatus[`result-${k}`] = BitManipulationStatus.Target;
      }
    }
    // 沒有搬進結果的位元就是被移出去的
    for (let k = 0; k < BIT_WIDTH; k++) {
      if (!moveStatus[`a-${k}`]) moveStatus[`a-${k}`] = BitManipulationStatus.Inactive;
    }
    const dropped = Math.min(shift, BIT_WIDTH);
    push(
      tag,
      { op: symbol, s: shift, dropped, phase: "move" },
      rows(""),
      moveStatus,
    );
    if (shift > 0) {
      for (let k = 0; k < BIT_WIDTH; k++) {
        if (resultCells[k] === "") resultCells[k] = "0";
      }
      push(tag, { op: symbol, s: shift, phase: "fill", result }, rows(String(result)), fillStatus);
    }
  }

  for (let k = 0; !isShift && k < BIT_WIDTH; k++) {
    const bitA = (a >> k) & 1;
    const statusMap: Record<string, string> = {
      [`weight-${k}`]: BitManipulationStatus.Prepare,
      [`result-${k}`]: BitManipulationStatus.Target,
    };
    let bit: number;
    let vars: Record<string, JsonValue>;

    if (op === "NOT") {
      bit = 1 - bitA;
      statusMap[`a-${k}`] = BitManipulationStatus.Prepare;
      vars = { k, bitA, bit };
    } else {
      const bitB = (b >> k) & 1;
      bit = op === "AND" ? bitA & bitB : op === "OR" ? bitA | bitB : bitA ^ bitB;
      statusMap[`a-${k}`] = BitManipulationStatus.Prepare;
      statusMap[`b-${k}`] = BitManipulationStatus.Prepare;
      vars = { k, bitA, bitB, op: symbol, bit };
    }

    if (bit) result |= 1 << k;
    resultCells[k] = String(bit);
    push(tag, { ...vars, result }, rows(String(result)), statusMap);
  }

  const doneStatus: Record<string, string> = { "result-value": BitManipulationStatus.Complete };
  for (let k = 0; k < BIT_WIDTH; k++) {
    if ((result >> k) & 1) doneStatus[`result-${k}`] = BitManipulationStatus.Complete;
  }
  const doneVars: Record<string, JsonValue> = isShift
    ? { a, op: symbol, s: shift, full: op === "SHL" ? a * 2 ** shift : result, result }
    : isBinary
      ? { a, b, op: symbol, result }
      : { a, op: symbol, result };
  push(TAGS.OPS_DONE, doneVars, rows(String(result)), doneStatus);

  return trace;
}

const SINGLE_LABEL: Record<SingleBitOp, string> = {
  SET: "a | (1 << k)",
  TEST: "a & (1 << k)",
  CLEAR: "a & ~(1 << k)",
  TOGGLE: "a ^ (1 << k)",
};

function simulateSingleBit(a: number, k: number, op: SingleBitOp): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const push = makePush(trace, BIT_WIDTH);
  const bit = 1 << k;
  // 清除要用「只有第 k 位是 0」的遮罩，也就是把 1 << k 反轉（這裡只看 8 位元）
  const mask = op === "CLEAR" ? ~bit & MAX_BIT_VALUE : bit;
  const maskLabel = op === "CLEAR" ? "~(1 << k)" : "1 << k";
  const original = (a >> k) & 1;

  const aRow: BitRow = { id: "a", label: "a", cells: toBits(a, BIT_WIDTH), value: String(a) };
  const maskRow: BitRow = {
    id: "mask",
    label: maskLabel,
    cells: toBits(mask, BIT_WIDTH),
    value: String(mask),
  };
  const column = {
    [`weight-${k}`]: BitManipulationStatus.Prepare,
    [`a-${k}`]: BitManipulationStatus.Target,
  };

  push(
    TAGS.SINGLE_INIT,
    { a, k, bit: original },
    [weightRow(), aRow, blankRow("mask", maskLabel), blankRow("result", SINGLE_LABEL[op])],
    column,
  );

  push(
    TAGS.SINGLE_MASK,
    { k, mask },
    [weightRow(), aRow, maskRow, blankRow("result", SINGLE_LABEL[op])],
    { ...column, [`mask-${k}`]: BitManipulationStatus.Target },
  );

  const result =
    op === "SET" ? a | mask : op === "TOGGLE" ? a ^ mask : a & mask;
  push(
    TAGS[`SINGLE_${op}` as keyof typeof TAGS],
    { a, k, mask, result, bit: original },
    [
      weightRow(),
      aRow,
      maskRow,
      {
        id: "result",
        label: SINGLE_LABEL[op],
        cells: toBits(result, BIT_WIDTH),
        value: String(result),
      },
    ],
    {
      ...column,
      [`mask-${k}`]: BitManipulationStatus.Prepare,
      [`a-${k}`]: BitManipulationStatus.Prepare,
      [`result-${k}`]: BitManipulationStatus.Complete,
      "result-value": BitManipulationStatus.Complete,
    },
  );

  return trace;
}

function simulateXorSwap(originalA: number, originalB: number): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const push = makePush(trace, BIT_WIDTH);
  let a = originalA;
  let b = originalB;

  const rows = (): BitRow[] => [
    weightRow(),
    { id: "a", label: "a", cells: toBits(a, BIT_WIDTH), value: String(a) },
    { id: "b", label: "b", cells: toBits(b, BIT_WIDTH), value: String(b) },
  ];

  /** 被賦值的那一列標出有變化的位元，另一列整排標成來源 */
  const changed = (target: "a" | "b", before: number, after: number) => {
    const source = target === "a" ? "b" : "a";
    const statusMap: Record<string, string> = {};
    for (let k = 0; k < BIT_WIDTH; k++) {
      statusMap[`${source}-${k}`] = BitManipulationStatus.Prepare;
      if (((before ^ after) >> k) & 1) statusMap[`${target}-${k}`] = BitManipulationStatus.Target;
    }
    statusMap[`${target}-value`] = BitManipulationStatus.Target;
    return statusMap;
  };

  push(TAGS.SWAP_INIT, { a, b }, rows());

  let before = a;
  a ^= b;
  push(TAGS.SWAP_STEP1, { a, b }, rows(), changed("a", before, a));

  before = b;
  b ^= a;
  push(TAGS.SWAP_STEP2, { a, b, originalA }, rows(), changed("b", before, b));

  before = a;
  a ^= b;
  push(TAGS.SWAP_STEP3, { a, b, originalB }, rows(), changed("a", before, a));

  push(TAGS.SWAP_DONE, { a, b }, rows(), {
    "a-value": BitManipulationStatus.Complete,
    "b-value": BitManipulationStatus.Complete,
  });

  return trace;
}

function simulateLowbit(a: number): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const push = makePush(trace, BIT_WIDTH);
  // 8 位元的二補數：-a 就是 ~a + 1，再只保留最低 8 位元
  const notA = ~a & MAX_BIT_VALUE;
  const negA = (notA + 1) & MAX_BIT_VALUE;
  const result = a & negA;
  const low = a === 0 ? null : Math.log2(result);

  const aRow: BitRow = { id: "a", label: "a", cells: toBits(a, BIT_WIDTH), value: String(a) };
  const notRow: BitRow = { id: "not", label: "~a", cells: toBits(notA, BIT_WIDTH), value: String(notA) };
  const negRow: BitRow = { id: "neg", label: "-a = ~a + 1", cells: toBits(negA, BIT_WIDTH), value: String(negA) };
  const resultRow: BitRow = {
    id: "result",
    label: "a & -a",
    cells: toBits(result, BIT_WIDTH),
    value: String(result),
  };

  push(TAGS.LOWBIT_INIT, { a }, [
    weightRow(),
    aRow,
    blankRow("not", "~a"),
    blankRow("neg", "-a = ~a + 1"),
    blankRow("result", "a & -a"),
  ]);

  const notStatus: Record<string, string> = {};
  for (let k = 0; k < BIT_WIDTH; k++) notStatus[`not-${k}`] = BitManipulationStatus.Prepare;
  push(TAGS.LOWBIT_NOT, { a, notA }, [
    weightRow(),
    aRow,
    notRow,
    blankRow("neg", "-a = ~a + 1"),
    blankRow("result", "a & -a"),
  ], notStatus);

  // +1 會把 ~a 右邊連續的 1 進位成 0，直到碰到第一個 0（正好是 a 最低位的 1）
  const carryStatus: Record<string, string> = {};
  const carryEnd = low ?? BIT_WIDTH - 1;
  for (let k = 0; k <= carryEnd; k++) carryStatus[`neg-${k}`] = BitManipulationStatus.Target;
  push(TAGS.LOWBIT_NEG, { notA, negA, low }, [
    weightRow(),
    aRow,
    notRow,
    negRow,
    blankRow("result", "a & -a"),
  ], carryStatus);

  const andStatus: Record<string, string> = { "result-value": BitManipulationStatus.Complete };
  if (low !== null) {
    andStatus[`weight-${low}`] = BitManipulationStatus.Prepare;
    andStatus[`a-${low}`] = BitManipulationStatus.Prepare;
    andStatus[`neg-${low}`] = BitManipulationStatus.Prepare;
    andStatus[`result-${low}`] = BitManipulationStatus.Complete;
  }
  push(TAGS.LOWBIT_AND, { a, negA, result, low }, [weightRow(), aRow, notRow, negRow, resultRow], andStatus);

  return trace;
}

function simulateCountBits(original: number): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const push = makePush(trace, BIT_WIDTH);

  let n = original;
  let count = 0;

  push(TAGS.COUNT_INIT, { n, count }, [
    weightRow(`count = ${count}`),
    { id: "n", label: "n", cells: toBits(n, BIT_WIDTH), value: String(n) },
    blankRow("minus", "n - 1"),
    blankRow("and", "n & (n-1)"),
  ]);

  while (n !== 0) {
    const minus = n - 1;
    const next = n & minus;
    const low = Math.log2(n & -n); // 最低位的 1 在第幾位
    const nRow: BitRow = { id: "n", label: "n", cells: toBits(n, BIT_WIDTH), value: String(n) };
    const minusRow: BitRow = {
      id: "minus",
      label: "n - 1",
      cells: toBits(minus, BIT_WIDTH),
      value: String(minus),
    };

    // n - 1 會把最低位的 1 變成 0，並把它右邊的 0 全部變成 1
    const flipped: Record<string, string> = { [`n-${low}`]: BitManipulationStatus.Target };
    for (let k = 0; k <= low; k++) flipped[`minus-${k}`] = BitManipulationStatus.Prepare;

    push(
      TAGS.COUNT_MINUS_ONE,
      { n, minus, lowestBit: low, count },
      [weightRow(`count = ${count}`), nRow, minusRow, blankRow("and", "n & (n-1)")],
      flipped,
    );

    count++;
    push(
      TAGS.COUNT_CLEAR,
      { n, minus, next, count },
      [
        weightRow(`count = ${count}`),
        nRow,
        minusRow,
        { id: "and", label: "n & (n-1)", cells: toBits(next, BIT_WIDTH), value: String(next) },
      ],
      {
        [`n-${low}`]: BitManipulationStatus.Target,
        [`and-${low}`]: BitManipulationStatus.Complete,
        "weight-value": BitManipulationStatus.Complete,
      },
    );
    n = next;
  }

  const isPowerOfTwo = original > 0 && (original & (original - 1)) === 0;
  const isOdd = (original & 1) === 1;
  const doneStatus: Record<string, string> = { "weight-value": BitManipulationStatus.Complete };
  for (let k = 0; k < BIT_WIDTH; k++) {
    if ((original >> k) & 1) doneStatus[`n-${k}`] = BitManipulationStatus.Complete;
  }
  push(
    TAGS.COUNT_DONE,
    { n: original, count, isPowerOfTwo, isOdd },
    [
      weightRow(`count = ${count}`),
      { id: "n", label: "n", cells: toBits(original, BIT_WIDTH), value: String(original) },
      blankRow("minus", "n - 1"),
      blankRow("and", "n & (n-1)"),
    ],
    doneStatus,
  );

  return trace;
}

function simulateSubsets(items: number[], target: number): ExecutionTrace {
  const width = items.length;
  const trace: TraceEvent[] = [];
  const push = makePush(trace, width);
  const found: string[] = [];
  // 找到的答案各佔一列，並一路保留到最後一步
  const foundRows: BitRow[] = [];
  const foundStatus: Record<string, string> = {};

  const chosenCells = (mask: number) =>
    items.map((v, j) => ((mask >> j) & 1 ? String(v) : ""));

  const rows = (mask: number | null, sum: number | null): BitRow[] => {
    const extra = found.length - foundRows.length;
    return [
      {
        id: "index",
        label: "j",
        cells: Array.from({ length: width }, (_, j) => String(j)),
        value: "",
        header: true,
      },
      {
        id: "item",
        label: "arr[j]",
        cells: items.map(String),
        value: `target = ${target}`,
        header: true,
      },
      mask === null
        ? blankRow("mask", "mask", width)
        : { id: "mask", label: "mask", cells: toBits(mask, width), value: String(mask) },
      {
        id: "chosen",
        label: "chosen",
        cells: mask === null ? Array(width).fill("") : chosenCells(mask),
        value: sum === null ? "" : `sum = ${sum}`,
        header: true,
      },
      ...foundRows,
      ...(extra > 0
        ? [{ ...blankRow("found-more", `+${extra}`, width), header: true }]
        : []),
    ];
  };

  const total = 1 << width;
  push(TAGS.SUBSET_INIT, { n: width, total, target }, rows(null, null));

  for (let mask = 0; mask < total; mask++) {
    const chosen: number[] = [];
    const statusMap: Record<string, string> = { ...foundStatus };
    for (let j = 0; j < width; j++) {
      if ((mask >> j) & 1) {
        chosen.push(items[j]);
        statusMap[`item-${j}`] = BitManipulationStatus.Prepare;
        statusMap[`chosen-${j}`] = BitManipulationStatus.Prepare;
      }
    }
    const sum = chosen.reduce((acc, v) => acc + v, 0);
    const subset = `{${chosen.join(", ")}}`;
    const binary = mask.toString(2).padStart(width, "0");

    if (sum === target) {
      found.push(subset);
      if (foundRows.length < MAX_FOUND_ROWS) {
        const id = `found${foundRows.length}`;
        foundRows.push({
          id,
          label: `mask = ${mask}`,
          cells: chosenCells(mask),
          value: `sum = ${sum}`,
          header: true,
        });
        for (let j = 0; j < width; j++) {
          if ((mask >> j) & 1) foundStatus[`${id}-${j}`] = BitManipulationStatus.Complete;
        }
        foundStatus[`${id}-value`] = BitManipulationStatus.Complete;
      }
      for (let j = 0; j < width; j++) {
        if ((mask >> j) & 1) {
          statusMap[`item-${j}`] = BitManipulationStatus.Complete;
          statusMap[`chosen-${j}`] = BitManipulationStatus.Complete;
        }
      }
      statusMap["chosen-value"] = BitManipulationStatus.Complete;
      push(
        TAGS.SUBSET_FOUND,
        { mask, binary, subset, sum, target, found: found.join(" ") },
        rows(mask, sum),
        { ...statusMap, ...foundStatus },
      );
    } else {
      push(
        TAGS.SUBSET_CHECK,
        { mask, binary, subset, sum, target, found: found.join(" ") },
        rows(mask, sum),
        statusMap,
      );
    }
  }

  push(
    TAGS.SUBSET_DONE,
    { total, target, count: found.length, found: found.join(" ") },
    rows(null, null),
    { ...foundStatus },
  );

  return trace;
}

export function simulateBitManipulationTrace(inputData: BitManipulationData): ExecutionTrace {
  switch (inputData?.mode) {
    case "single_bit":
      return simulateSingleBit(inputData.a, inputData.k, inputData.singleOp);
    case "xor_swap":
      return simulateXorSwap(inputData.a, inputData.b);
    case "lowbit":
      return simulateLowbit(inputData.a);
    case "count_bits":
      return simulateCountBits(inputData.n);
    case "subsets":
      return simulateSubsets(inputData.items, inputData.target);
    default:
      return simulateBitOps(inputData.a, inputData.b, inputData.op);
  }
}

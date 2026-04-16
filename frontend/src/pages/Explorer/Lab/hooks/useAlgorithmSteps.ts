import type { AnimationStep } from "@/types";
import type { LinearData } from "@/data/DataStructure/linear/utils";
import { createBubbleSortAnimationSteps } from "@/data/algorithms/sorting/bubbleSort";
import { createSelectionSortAnimationSteps } from "@/data/algorithms/sorting/selectionSort";
import { createInsertionSortAnimationSteps } from "@/data/algorithms/sorting/insertionSort";
import { createMergeSortAnimationSteps } from "@/data/algorithms/sorting/mergeSort";
import { createQuickSortAnimationSteps } from "@/data/algorithms/sorting/quickSort";
import type { AlgorithmId, BenchmarkPoint, LabAlgorithmState } from "../types/lab";

const OP_TAGS = new Set([
  "COMPARE",
  "SWAP",
  "SHIFT",
  "COPY",
  "UPDATE_MIN",
  "INSERT",
]);

const COMPARE_TAGS = new Set(["COMPARE", "UPDATE_MIN"]);
const MOVE_TAGS = new Set(["SWAP", "SHIFT", "COPY", "INSERT"]);

export function buildOpCountPerStep(steps: AnimationStep[]): number[] {
  let count = 0;
  return steps.map((s) => {
    if (s.actionTag && OP_TAGS.has(s.actionTag)) count++;
    return count;
  });
}

export function buildCompareCountPerStep(steps: AnimationStep[]): number[] {
  let count = 0;
  return steps.map((s) => {
    if (s.actionTag && COMPARE_TAGS.has(s.actionTag)) count++;
    return count;
  });
}

export function buildMoveCountPerStep(steps: AnimationStep[]): number[] {
  let count = 0;
  return steps.map((s) => {
    if (s.actionTag && MOVE_TAGS.has(s.actionTag)) count++;
    return count;
  });
}

export function buildStackDepthPerStep(steps: AnimationStep[]): number[] {
  let depth = 0;
  return steps.map((s) => {
    if (typeof s.variables?.stackDepth === "number") {
      depth = s.variables.stackDepth as number;
    }
    return depth;
  });
}

export function buildAuxSizePerStep(steps: AnimationStep[]): number[] {
  let auxSize = 0;
  return steps.map((s) => {
    if (typeof s.variables?.auxSize === "number") {
      auxSize = s.variables.auxSize as number;
    }
    return auxSize;
  });
}

export function numbersToLinearData(nums: number[]): LinearData[] {
  return nums.map((v, i) => ({ id: String(i), value: v }));
}

function createStepsFor(id: AlgorithmId, data: LinearData[]): AnimationStep[] {
  switch (id) {
    case "bubbleSort":
      return createBubbleSortAnimationSteps(data);
    case "selectionSort":
      return createSelectionSortAnimationSteps(data);
    case "insertionSort":
      return createInsertionSortAnimationSteps(data);
    case "mergeSort":
      return createMergeSortAnimationSteps(data);
    case "quickSort":
      return createQuickSortAnimationSteps(data);
    default:
      return [];
  }
}

// Pure sort implementations for real timing benchmark (no animation step overhead)
function pureBubble(arr: number[]): void {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
      }
    }
  }
}

function pureSelection(arr: number[]): void {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      const tmp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = tmp;
    }
  }
}

function pureInsertion(arr: number[]): void {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
}

function pureMergeHelper(arr: number[], lo: number, hi: number): void {
  if (hi - lo <= 1) return;
  const mid = Math.floor((lo + hi) / 2);
  pureMergeHelper(arr, lo, mid);
  pureMergeHelper(arr, mid, hi);
  const left = arr.slice(lo, mid);
  const right = arr.slice(mid, hi);
  let i = 0, j = 0, k = lo;
  while (i < left.length && j < right.length) {
    arr[k++] = left[i] <= right[j] ? left[i++] : right[j++];
  }
  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
}

function pureMerge(arr: number[]): void {
  pureMergeHelper(arr, 0, arr.length);
}

function pureQuickHelper(arr: number[], lo: number, hi: number): void {
  if (lo >= hi) return;
  const pivot = arr[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      i++;
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
  }
  const tmp = arr[i + 1];
  arr[i + 1] = arr[hi];
  arr[hi] = tmp;
  const p = i + 1;
  pureQuickHelper(arr, lo, p - 1);
  pureQuickHelper(arr, p + 1, hi);
}

function pureQuick(arr: number[]): void {
  pureQuickHelper(arr, 0, arr.length - 1);
}

function pureSort(id: AlgorithmId, arr: number[]): void {
  switch (id) {
    case "bubbleSort": pureBubble(arr); break;
    case "selectionSort": pureSelection(arr); break;
    case "insertionSort": pureInsertion(arr); break;
    case "mergeSort": pureMerge(arr); break;
    case "quickSort": pureQuick(arr); break;
  }
}

const BENCHMARK_N = 5000;

// 固定使用 5000 筆資料 benchmark，確保 O(n²) vs O(n log n) 差距明顯可見
const BENCHMARK_DATA = Array.from(
  { length: BENCHMARK_N },
  () => Math.floor(Math.random() * 10000),
);

export function benchmarkExecMs(id: AlgorithmId, data?: number[]): number {
  const source = data ?? BENCHMARK_DATA;
  const MIN_TOTAL_MS = 20;
  const MAX_RUNS = 200;
  let runs = 0;
  const t0 = performance.now();
  let elapsed = 0;
  do {
    const copy = source.slice();
    pureSort(id, copy);
    runs++;
    elapsed = performance.now() - t0;
  } while (elapsed < MIN_TOTAL_MS && runs < MAX_RUNS);
  return elapsed / runs;
}

export const BENCHMARK_NS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export function buildBenchmarkPoints(id: AlgorithmId): BenchmarkPoint[] {
  return BENCHMARK_NS.map((n) => {
    const data = Array.from({ length: n }, () =>
      Math.floor(Math.random() * 1000),
    );
    return { n, ms: benchmarkExecMs(id, data) };
  });
}

export function buildAlgorithmStates(
  selectedIds: AlgorithmId[],
  inputData: number[],
): LabAlgorithmState[] {
  const linear = numbersToLinearData(inputData);
  return selectedIds.map((id) => {
    const steps = createStepsFor(id, linear);
    return {
      id,
      steps,
      opCountPerStep: buildOpCountPerStep(steps),
      compareCountPerStep: buildCompareCountPerStep(steps),
      moveCountPerStep: buildMoveCountPerStep(steps),
      stackDepthPerStep: buildStackDepthPerStep(steps),
      auxSizePerStep: buildAuxSizePerStep(steps),
      execTimeMs: benchmarkExecMs(id),
      benchmarkPoints: [],
    };
  });
}

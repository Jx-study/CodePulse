import type { AnimationStep, CodeConfig } from "@/types";
import type { LevelImplementationConfig, AlgoActionBarProps } from "@/types/implementation";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { cloneData } from "@/modules/core/visualization/visualizationUtils";
import { BitManipulationActionBar } from "./BitManipulationActionBar";
import {
  simulateBitManipulationTrace,
  type BitManipulationData,
  type BitManipulationMode,
} from "./bitManipulation/simulateTrace";
import { bitManipulationTraceToSteps } from "./bitManipulation/traceToSteps";
import { TAGS, BitManipulationStatusConfig } from "./bitManipulation/tags";
import { bitManipulationRealWorldStories } from "./bitManipulation.stories";

const MODES: BitManipulationMode[] = [
  "bit_ops",
  "single_bit",
  "xor_swap",
  "lowbit",
  "count_bits",
  "subsets",
];

const toMode = (raw: unknown, fallback: BitManipulationMode): BitManipulationMode =>
  MODES.includes(raw as BitManipulationMode) ? (raw as BitManipulationMode) : fallback;

const INPUT_KEYS = ["a", "b", "op", "k", "singleOp", "n", "items", "target"] as const;

function mergeInputs(payload: Record<string, unknown>, data: BitManipulationData): BitManipulationData {
  const merged = { ...data, mode: toMode(payload.mode, data.mode) };
  INPUT_KEYS.forEach((key) => {
    if (payload[key] !== undefined) Object.assign(merged, { [key]: payload[key] });
  });
  return merged;
}

function bitManipulationActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: BitManipulationData,
  context: ActionContext,
): ActionResult<BitManipulationData> | null {
  if (actionType === "run" || actionType === "random") {
    return { animationData: mergeInputs(payload, data), isResetAction: true };
  }

  // 模式存在資料裡，切換時只換模式、保留各模式上次的輸入
  if (actionType === "switchMode") {
    return {
      animationData: { ...data, mode: toMode(payload.mode, data.mode) },
      isResetAction: true,
    };
  }

  if (actionType === "reset") {
    const defaults = cloneData(context.defaultData as BitManipulationData);
    return {
      animationData: { ...defaults, mode: data.mode },
      isResetAction: true,
    };
  }

  return null;
}

function createBitManipulationAnimationSteps(inputData: BitManipulationData): AnimationStep[] {
  return bitManipulationTraceToSteps(simulateBitManipulationTrace(inputData));
}

const bitOpsCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure BitwiseOp(a, b, op):
  result ← 0
  For k from 0 to 7:
    If op = AND Then r ← a[k] AND b[k]
    If op = OR Then r ← a[k] OR b[k]
    If op = XOR Then r ← a[k] XOR b[k]
    If op = NOT Then r ← 1 - a[k]
    If op = SHL Then r ← a[k - b] if k ≥ b else 0
    If op = SHR Then r ← a[k + b] if k + b ≤ 7 else 0
    result[k] ← r
  End For
  Return result
End Procedure`,
    mappings: {
      [TAGS.OPS_INIT]: [2],
      [TAGS.OPS_BIT_AND]: [3, 4, 10],
      [TAGS.OPS_BIT_OR]: [3, 5, 10],
      [TAGS.OPS_BIT_XOR]: [3, 6, 10],
      [TAGS.OPS_BIT_NOT]: [3, 7, 10],
      [TAGS.OPS_BIT_SHL]: [3, 8, 10],
      [TAGS.OPS_BIT_SHR]: [3, 9, 10],
      [TAGS.OPS_DONE]: [12],
    },
  },
  python: {
    content: `def bitwise_ops(a, b):
    return {
        "a & b": a & b,
        "a | b": a | b,
        "a ^ b": a ^ b,
        "~a": ~a & 0xFF,
        "a << b": (a << b) & 0xFF,
        "a >> b": a >> b,
    }`,
    lineComplexity: [
      { lineNumber: 1, complexity: 'O(1)' }, // def bitwise_ops(a, b):
      { lineNumber: 3, complexity: 'O(1)' }, // "a & b": a & b,
      { lineNumber: 4, complexity: 'O(1)' }, // "a | b": a | b,
      { lineNumber: 5, complexity: 'O(1)' }, // "a ^ b": a ^ b,
      { lineNumber: 6, complexity: 'O(1)' }, // "~a": ~a & 0xFF,
      { lineNumber: 7, complexity: 'O(1)' }, // "a << b": (a << b) & 0xFF,
      { lineNumber: 8, complexity: 'O(1)' }, // "a >> b": a >> b,
    ],
  },
};

const singleBitCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure SingleBit(a, k, op):
  bit ← 1 << k
  If op = SET Then Return a OR bit
  If op = TEST Then Return (a AND bit) ≠ 0
  If op = CLEAR Then Return a AND (NOT bit)
  If op = TOGGLE Then Return a XOR bit
End Procedure`,
    mappings: {
      [TAGS.SINGLE_INIT]: [1],
      [TAGS.SINGLE_MASK]: [2],
      [TAGS.SINGLE_SET]: [3],
      [TAGS.SINGLE_TEST]: [4],
      [TAGS.SINGLE_CLEAR]: [5],
      [TAGS.SINGLE_TOGGLE]: [6],
    },
  },
  python: {
    content: `def set_bit(a, k):
    return a | (1 << k)


def test_bit(a, k):
    return a & (1 << k) != 0


def clear_bit(a, k):
    return a & ~(1 << k)


def toggle_bit(a, k):
    return a ^ (1 << k)`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(1)' }, // def set_bit(a, k):
      { lineNumber: 2,  complexity: 'O(1)' }, // return a | (1 << k)
      { lineNumber: 5,  complexity: 'O(1)' }, // def test_bit(a, k):
      { lineNumber: 6,  complexity: 'O(1)' }, // return a & (1 << k) != 0
      { lineNumber: 9,  complexity: 'O(1)' }, // def clear_bit(a, k):
      { lineNumber: 10, complexity: 'O(1)' }, // return a & ~(1 << k)
      { lineNumber: 13, complexity: 'O(1)' }, // def toggle_bit(a, k):
      { lineNumber: 14, complexity: 'O(1)' }, // return a ^ (1 << k)
    ],
  },
};

const xorSwapCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure XorSwap(a, b):
  a ← a XOR b
  b ← a XOR b
  a ← a XOR b
  Return (a, b)
End Procedure`,
    mappings: {
      [TAGS.SWAP_INIT]: [1],
      [TAGS.SWAP_STEP1]: [2],
      [TAGS.SWAP_STEP2]: [3],
      [TAGS.SWAP_STEP3]: [4],
      [TAGS.SWAP_DONE]: [5],
    },
  },
  python: {
    content: `def xor_swap(a, b):
    a = a ^ b
    b = a ^ b
    a = a ^ b
    return a, b`,
    lineComplexity: [
      { lineNumber: 1, complexity: 'O(1)' }, // def xor_swap(a, b):
      { lineNumber: 2, complexity: 'O(1)' }, // a = a ^ b
      { lineNumber: 3, complexity: 'O(1)' }, // b = a ^ b
      { lineNumber: 4, complexity: 'O(1)' }, // a = a ^ b
      { lineNumber: 5, complexity: 'O(1)' }, // return a, b
    ],
  },
};

const lowbitCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure LowBit(a):
  notA ← NOT a
  negA ← notA + 1
  Return a AND negA
End Procedure`,
    mappings: {
      [TAGS.LOWBIT_INIT]: [1],
      [TAGS.LOWBIT_NOT]: [2],
      [TAGS.LOWBIT_NEG]: [3],
      [TAGS.LOWBIT_AND]: [4],
    },
  },
  python: {
    content: `def lowbit(a):
    return a & -a`,
    lineComplexity: [
      { lineNumber: 1, complexity: 'O(1)' }, // def lowbit(a):
      { lineNumber: 2, complexity: 'O(1)' }, // return a & -a
    ],
  },
};

const countBitsCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure CountBits(n):
  count ← 0
  While n ≠ 0:
    m ← n - 1
    n ← n AND m
    count ← count + 1
  End While
  isPowerOfTwo ← (count = 1)
  Return count, isPowerOfTwo
End Procedure`,
    mappings: {
      [TAGS.COUNT_INIT]: [2],
      [TAGS.COUNT_MINUS_ONE]: [3, 4],
      [TAGS.COUNT_CLEAR]: [5, 6],
      [TAGS.COUNT_DONE]: [8, 9],
    },
  },
  python: {
    content: `def count_bits(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    is_power_of_two = count == 1
    return count, is_power_of_two`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(n)' },                  // def count_bits(n): (迴圈次數 = 1 的個數)
      { lineNumber: 2,  complexity: 'O(1)' },                  // count = 0
      { lineNumber: 3,  complexity: 'O(n)' },                  // while n:
      { lineNumber: 4,  complexity: 'O(1)', context: 'O(n)' }, // n &= n - 1
      { lineNumber: 5,  complexity: 'O(1)', context: 'O(n)' }, // count += 1
      { lineNumber: 6,  complexity: 'O(1)' },                  // is_power_of_two = count == 1
      { lineNumber: 7,  complexity: 'O(1)' },                  // return count, is_power_of_two
    ],
  },
};

const subsetsCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure SubsetSum(arr, target):
  n ← length(arr), result ← []
  For mask from 0 to 2^n - 1:
    sum ← 0
    For j from 0 to n - 1:
      If (mask >> j) & 1 = 1 Then
        sum ← sum + arr[j]
      End If
    End For
    If sum = target Then
      Append subset(mask) to result
    End If
  End For
  Return result
End Procedure`,
    mappings: {
      [TAGS.SUBSET_INIT]: [2],
      [TAGS.SUBSET_CHECK]: [3, 4, 5, 6, 7, 10],
      [TAGS.SUBSET_FOUND]: [10, 11],
      [TAGS.SUBSET_DONE]: [14],
    },
  },
  python: {
    content: `def subset_sum(arr, target):
    n = len(arr)
    result = []
    for mask in range(1 << n):
        total = 0
        for j in range(n):
            if (mask >> j) & 1:
                total += arr[j]
        if total == target:
            result.append([arr[j] for j in range(n) if (mask >> j) & 1])
    return result`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(2^n)' },                   // def subset_sum(arr, target):
      { lineNumber: 2,  complexity: 'O(1)' },                     // n = len(arr)
      { lineNumber: 3,  complexity: 'O(1)' },                     // result = []
      { lineNumber: 4,  complexity: 'O(2^n)' },                   // for mask in range(1 << n):
      { lineNumber: 5,  complexity: 'O(1)', context: 'O(2^n)' },  // total = 0
      { lineNumber: 6,  complexity: 'O(n)', context: 'O(2^n)' },  // for j in range(n):
      { lineNumber: 7,  complexity: 'O(1)', context: 'O(2^n)' },  // if (mask >> j) & 1:
      { lineNumber: 8,  complexity: 'O(1)', context: 'O(2^n)' },  // total += arr[j]
      { lineNumber: 9,  complexity: 'O(1)', context: 'O(2^n)' },  // if total == target:
      { lineNumber: 10, complexity: 'O(n)', context: 'O(2^n)' },  // result.append(...)
      { lineNumber: 11, complexity: 'O(1)' },                     // return result
    ],
  },
};

const CODE_CONFIGS: Record<BitManipulationMode, CodeConfig> = {
  bit_ops: bitOpsCodeConfig,
  single_bit: singleBitCodeConfig,
  xor_swap: xorSwapCodeConfig,
  lowbit: lowbitCodeConfig,
  count_bits: countBitsCodeConfig,
  subsets: subsetsCodeConfig,
};

export const bitManipulationConfig: LevelImplementationConfig = {
  id: "bitmanipulation",
  type: "algorithm",
  defaultViewMode: "bit_ops",
  name: "位元運算 (Bit Manipulation)",
  categoryName: "演算法技巧",
  description: "直接操作整數的二進位位元，用 O(1) 的運算完成判斷、計數與狀態壓縮",
  i18nNamespace: "tutorials/bit-manipulation",
  codeConfig: bitOpsCodeConfig,
  getCodeConfig: (payload?: { mode?: string }) =>
    CODE_CONFIGS[toMode(payload?.mode, "bit_ops")],
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(n · 2^n)",
    timeWorst: "O(n · 2^n)",
    space: "O(1)",
  },
  introduction: { key: "introduction" },
  defaultData: {
    mode: "bit_ops",
    a: 12,
    b: 10,
    op: "AND",
    k: 2,
    singleOp: "SET",
    n: 44,
    items: [3, 5, 2, 7],
    target: 10,
  } satisfies BitManipulationData,
  actionHandler: bitManipulationActionHandler,
  createAnimationSteps: createBitManipulationAnimationSteps,
  renderActionBar: (props) => <BitManipulationActionBar {...(props as AlgoActionBarProps)} />,
  statusConfig: BitManipulationStatusConfig,
  realWorldStories: bitManipulationRealWorldStories,
  relatedProblems: [
    {
      id: 191,
      title: "Number of 1 Bits",
      concept: "relatedProblems.191",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/number-of-1-bits/",
    },
    {
      id: 231,
      title: "Power of Two",
      concept: "relatedProblems.231",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/power-of-two/",
    },
    {
      id: 136,
      title: "Single Number",
      concept: "relatedProblems.136",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/single-number/",
    },
    {
      id: 461,
      title: "Hamming Distance",
      concept: "relatedProblems.461",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/hamming-distance/",
    },
    {
      id: 338,
      title: "Counting Bits",
      concept: "relatedProblems.338",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/counting-bits/",
    },
    {
      id: 78,
      title: "Subsets",
      concept: "relatedProblems.78",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/subsets/",
    },
  ],
};

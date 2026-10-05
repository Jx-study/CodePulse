import type { AnimationStep, CodeConfig } from "@/types";
import type { LevelImplementationConfig, AlgoActionBarProps } from "@/types/implementation";
import { LCSActionBar } from "@/data/algorithms/dp/LCSActionBar";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { cloneData } from "@/modules/core/visualization/visualizationUtils";
import { DATA_LIMITS } from "@/constants/dataLimits";
import { simulateLCSTrace, LCSData } from "./lcs/simulateTrace";
import { lcsTraceToSteps } from "./lcs/traceToSteps";
import { TAGS, LCSStatusConfig } from "./lcs/tags";

const sanitizeText = (raw: unknown): string =>
  String(raw ?? "")
    .replace(/\s+/g, "")
    .slice(0, DATA_LIMITS.MAX_LCS_LENGTH);

function lcsActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: LCSData,
  context: ActionContext,
): ActionResult<LCSData> | null {
  if (actionType === "run") {
    const next: LCSData = {
      textA: sanitizeText(payload.textA ?? data.textA),
      textB: sanitizeText(payload.textB ?? data.textB),
    };
    return {
      animationData: next,
      isResetAction: true,
    };
  }

  if (actionType === "reset") {
    return {
      animationData: cloneData(context.defaultData as LCSData),
      isResetAction: true,
    };
  }

  return null;
}

function createLCSAnimationSteps(inputData: LCSData): AnimationStep[] {
  const trace = simulateLCSTrace(inputData);
  return lcsTraceToSteps(trace);
}

const lcsCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure LCS(textA, textB):
  m ← length(textA), n ← length(textB)
  dp ← (m+1) × (n+1) table filled with 0
  For i from 1 to m:
    For j from 1 to n:
      If textA[i-1] = textB[j-1] Then
        dp[i][j] ← dp[i-1][j-1] + 1
      Else
        dp[i][j] ← max(dp[i-1][j], dp[i][j-1])
      End If
    End For
  End For
  result ← "", i ← m, j ← n
  While i > 0 and j > 0:
    If textA[i-1] = textB[j-1] Then
      result ← textA[i-1] + result
      i ← i-1, j ← j-1
    Else If dp[i-1][j] ≥ dp[i][j-1] Then
      i ← i-1
    Else
      j ← j-1
    End If
  End While
  Return result
End Procedure`,
    mappings: {
      [TAGS.INIT]: [2, 3],
      [TAGS.MATCH]: [6, 7],
      [TAGS.NO_MATCH]: [6, 8, 9],
      [TAGS.TRACE_START]: [13],
      [TAGS.TRACE_MATCH]: [15, 16, 17],
      [TAGS.TRACE_UP]: [18, 19],
      [TAGS.TRACE_LEFT]: [20, 21],
      [TAGS.DONE]: [24],
    },
  },
  python: {
    content: `def lcs(text_a, text_b):
    m, n = len(text_a), len(text_b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text_a[i - 1] == text_b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    result = []
    i, j = m, n
    while i > 0 and j > 0:
        if text_a[i - 1] == text_b[j - 1]:
            result.append(text_a[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return "".join(reversed(result))`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(n^2)' },                                // def lcs(text_a, text_b):
      { lineNumber: 2,  complexity: 'O(1)' },                                  // m, n = len(text_a), len(text_b)
      { lineNumber: 3,  complexity: 'O(n^2)' },                                // dp = [[0] * (n + 1) for _ in range(m + 1)]
      { lineNumber: 5,  complexity: 'O(n)' },                                  // for i in range(1, m + 1):
      { lineNumber: 6,  complexity: 'O(n)', context: 'O(n)' },                 // for j in range(1, n + 1):
      { lineNumber: 7,  complexity: 'O(1)', context: 'O(n^2)' },               // if text_a[i - 1] == text_b[j - 1]:
      { lineNumber: 8,  complexity: 'O(1)', context: 'O(n^2)' },               // dp[i][j] = dp[i - 1][j - 1] + 1
      { lineNumber: 9,  complexity: 'O(1)', context: 'O(n^2)' },               // else:
      { lineNumber: 10, complexity: 'O(1)', context: 'O(n^2)' },               // dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
      { lineNumber: 12, complexity: 'O(1)' },                                  // result = []
      { lineNumber: 13, complexity: 'O(1)' },                                  // i, j = m, n
      { lineNumber: 14, complexity: 'O(n)' },                                  // while i > 0 and j > 0:
      { lineNumber: 15, complexity: 'O(1)', context: 'O(n)' },                 // if text_a[i - 1] == text_b[j - 1]:
      { lineNumber: 16, complexity: 'O(1)', context: 'O(n)' },                 // result.append(text_a[i - 1])
      { lineNumber: 17, complexity: 'O(1)', context: 'O(n)' },                 // i -= 1
      { lineNumber: 18, complexity: 'O(1)', context: 'O(n)' },                 // j -= 1
      { lineNumber: 19, complexity: 'O(1)', context: 'O(n)' },                 // elif dp[i - 1][j] >= dp[i][j - 1]:
      { lineNumber: 20, complexity: 'O(1)', context: 'O(n)' },                 // i -= 1
      { lineNumber: 21, complexity: 'O(1)', context: 'O(n)' },                 // else:
      { lineNumber: 22, complexity: 'O(1)', context: 'O(n)' },                 // j -= 1
      { lineNumber: 23, complexity: 'O(n)' },                                  // return "".join(reversed(result))
    ],
  },
};

export const lcsConfig: LevelImplementationConfig = {
  id: "lcs",
  type: "algorithm",
  name: "最長公共子序列 (LCS)",
  categoryName: "動態規劃 (DP)",
  description: "找出兩個字串中，依原順序都出現、且長度最長的共同子序列。",
  i18nNamespace: "tutorials/lcs",
  codeConfig: lcsCodeConfig,
  complexity: {
    timeBest: "O(m * n)",
    timeAverage: "O(m * n)",
    timeWorst: "O(m * n)",
    space: "O(m * n)",
  },
  introduction: `最長公共子序列（LCS）是字串型動態規劃的經典問題。子序列不需要連續，只要保持原本的先後順序即可。我們定義 dp[i][j] 為：textA 的前 i 個字元與 textB 的前 j 個字元之間的 LCS 長度。若兩個字元相同，就從左上角 dp[i-1][j-1] 加 1；若不同，就取上方 dp[i-1][j] 與左方 dp[i][j-1] 中較大者。填完表後，再從右下角沿著來源回溯，就能還原出子序列本身。`,
  defaultData: { textA: "ABCBDAB", textB: "BDCABA" },
  actionHandler: lcsActionHandler,
  createAnimationSteps: createLCSAnimationSteps,
  renderActionBar: (props) => <LCSActionBar {...(props as AlgoActionBarProps)} />,
  statusConfig: LCSStatusConfig,
  relatedProblems: [
    {
      id: 1143,
      title: "Longest Common Subsequence",
      concept: "relatedProblems.1143",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/longest-common-subsequence/",
    },
    {
      id: 583,
      title: "Delete Operation for Two Strings",
      concept: "relatedProblems.583",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/delete-operation-for-two-strings/",
    },
    {
      id: 1035,
      title: "Uncrossed Lines",
      concept: "relatedProblems.1035",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/uncrossed-lines/",
    },
    {
      id: 72,
      title: "Edit Distance",
      concept: "relatedProblems.72",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/edit-distance/",
    },
    {
      id: 1092,
      title: "Shortest Common Supersequence",
      concept: "relatedProblems.1092",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/shortest-common-supersequence/",
    },
  ],
};

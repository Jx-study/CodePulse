import { PracticeQuiz, Question } from '@/types/practice';

// 題組情境：可變窗口結構（供 group-sw-variable 展示）
const swWindowTraceCode = `
def sliding_window_longest(arr, target):
    left = 0
    curr_sum = 0
    max_len = 0
    for right in range(len(arr)):
        curr_sum += arr[right]
        while curr_sum > target and left <= right:
            curr_sum -= arr[left]
            left += 1
        if right - left + 1 > max_len:
            max_len = right - left + 1
    return max_len`;

// fill-code 可變窗口（4 個空格）
const swFillCode = `
def sliding_window_longest(arr, target):
    left = 0
    curr_sum = 0
    max_len = 0
    for right in range(len(arr)):
        curr_sum += (a)
        while curr_sum > (b) and left <= right:
            curr_sum -= (c)
            left += 1
        if right - left + 1 > max_len:
            max_len = (d)
    return max_len`;

// fill-code 固定窗口（3 個空格）
const swFixedFillCode = `
def max_sum_fixed(arr, k):
    window_sum = sum(arr[:k])
    max_sum = (a)
    for i in range(1, len(arr) - k + 1):
        window_sum = window_sum + arr[(b)] - arr[i - 1]
        if window_sum > max_sum:
            max_sum = (c)
    return max_sum`;

// predict-line（共 12 行，含行號標籤）
const swPredictCode = `
def sliding_window(arr, target):        # L1
    left = 0                            # L2
    curr_sum = 0                        # L3
    max_len = 0                         # L4
    for right in range(len(arr)):       # L5
        curr_sum += arr[right]          # L6
        while curr_sum > target:        # L7
            curr_sum -= arr[left]       # L8
            left += 1                   # L9
        if right - left + 1 > max_len: # L10
            max_len = right - left + 1 # L11
    return max_len                      # L12`;

// --- 題目定義 ---

const questions: Question[] = [
  // ── Basic 800-950 (5 題) ──────────────────────────────

  {
    id: 'sw-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '滑動窗口 (Sliding Window) 技巧最主要用來解決哪類問題？',
    options: [
      { id: 'A', text: '在已排序陣列中尋找特定元素' },
      { id: 'B', text: '連續子陣列或子字串的最佳化問題' },
      { id: 'C', text: '將陣列遞增排序' },
      { id: 'D', text: '計算所有非連續子集合的總和' }
    ],
    correctAnswer: 'B',
    explanation:
      '滑動窗口透過維護 left、right 雙指標組成的「窗口」，高效解決連續子陣列的最大值、最小長度等問題，不適用於需要跳躍選取的子集合。',
    points: 1
  },

  {
    id: 'sw-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: '滑動窗口技巧的「窗口大小」一定是固定的。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'false',
    explanation:
      '錯誤。滑動窗口分為兩類：固定窗口（Fixed Window，如「大小為 k 的子陣列最大和」）以及可變窗口（Variable Window，如「和不超過 target 的最長子陣列」），後者的窗口大小會隨條件動態伸縮。',
    points: 1
  },

  {
    id: 'sw-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '在可變大小的滑動窗口中，left 指標（窗口左端）何時向右移動？',
    options: [
      { id: 'A', text: '每次 right 移動後，left 也固定跟著移動' },
      { id: 'B', text: '當窗口內的資料「不符合條件」時，left 向右縮小窗口' },
      { id: 'C', text: 'left 從不移動，只有 right 移動' },
      { id: 'D', text: '當 right 到達陣列末尾時，left 才開始移動' }
    ],
    correctAnswer: 'B',
    explanation:
      '可變窗口的核心邏輯：right 不斷向右擴展窗口；一旦窗口不滿足條件（如總和超過 target），就將 left 向右移動縮小窗口，直到條件再次成立為止。',
    points: 1
  },

  {
    id: 'sw-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '滑動窗口的時間複雜度通常是 O(n)，因為每個元素最多只會被 left 和 right 指標各「進出」窗口一次。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation:
      '正確。right 從左到右掃描，每個元素最多進窗口一次；left 也是單向向右移動，每個元素最多離開窗口一次。因此整體操作次數為 O(2n) = O(n)。',
    points: 1
  },

  {
    id: 'sw-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '基本滑動窗口演算法（只追蹤 left、right 與累計值）的空間複雜度是多少？',
    options: [
      { id: 'A', text: 'O(n)' },
      { id: 'B', text: 'O(k)，其中 k 是窗口大小' },
      { id: 'C', text: 'O(1)' },
      { id: 'D', text: 'O(log n)' }
    ],
    correctAnswer: 'C',
    explanation:
      '基本滑動窗口只需要常數個額外變數（left、right、curr_sum、max_len），不需要額外的陣列或雜湊表，因此空間複雜度為 O(1)。',
    points: 1
  },

  // ── Application 1000-1250 (8 題) ─────────────────────

  {
    id: 'sw-group-1',
    groupId: 'group-sw-variable',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title:
      '給定 arr = [3, 1, 2, 7, 4]，target = 7。當 right 指標處理完 index 2（值為 2）後，當前 max_len 是多少？',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '2' },
      { id: 'C', text: '3' },
      { id: 'D', text: '4' }
    ],
    correctAnswer: 'C',
    explanation:
      'right=2 時：curr_sum = 3+1+2 = 6 ≤ 7，窗口 [3,1,2]（left=0, right=2），長度 = 3 > 原 max_len=2，因此 max_len 更新為 3。',
    points: 2
  },

  {
    id: 'sw-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title:
      '在可變窗口的 while 迴圈中，條件為 `curr_sum > target and left <= right`。加入 `left <= right` 這個子條件的目的是什麼？',
    options: [
      { id: 'A', text: '提升迴圈的執行效率' },
      { id: 'B', text: '防止 left 超越 right，避免產生無效的空窗口' },
      { id: 'C', text: '確保每次迴圈都至少執行一次' },
      { id: 'D', text: '允許窗口包含負數元素' }
    ],
    correctAnswer: 'B',
    explanation:
      '若不加此條件，當陣列中單一元素就超過 target 時，left 可能會一直遞增超過 right，導致窗口無效（負長度）。加上 left <= right 可確保窗口至少包含一個元素再繼續縮減。',
    points: 2
  },

  {
    id: 'sw-group-2',
    groupId: 'group-sw-variable',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title:
      '承上題（arr = [3, 1, 2, 7, 4]，target = 7）。當 right 指標處理完 index 3（值為 7）後，left 指標落在哪個 index？',
    options: [
      { id: 'A', text: 'Index 0' },
      { id: 'B', text: 'Index 1' },
      { id: 'C', text: 'Index 2' },
      { id: 'D', text: 'Index 3' }
    ],
    correctAnswer: 'D',
    explanation:
      'right=3 時 curr_sum=6+7=13 > 7，開始縮窗：移除 arr[0]=3 → sum=10；移除 arr[1]=1 → sum=9；移除 arr[2]=2 → sum=7；7 ≤ 7 停止。此時 left=3，窗口只剩 [7] 一個元素，長度=1 < max_len=3 不更新。',
    points: 2
  },

  {
    id: 'sw-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '給定 arr = [2, 1, 5, 1, 3, 2]，使用「固定窗口大小 k=3」求最大子陣列和，結果為何？',
    options: [
      { id: 'A', text: '8' },
      { id: 'B', text: '9' },
      { id: 'C', text: '7' },
      { id: 'D', text: '6' }
    ],
    correctAnswer: 'B',
    explanation:
      '依序計算固定窗口大小為 3 的子陣列和：[2,1,5]=8、[1,5,1]=7、[5,1,3]=9、[1,3,2]=6。最大值為 9，對應窗口 [5,1,3]（index 2-4）。',
    points: 2
  },

  {
    id: 'sw-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title:
      '若使用「暴力法（雙層迴圈）」解決「固定窗口大小 k 的最大子陣列和」，時間複雜度為 O(n·k)。改用滑動窗口後，時間複雜度變為？',
    options: [
      { id: 'A', text: 'O(n²)' },
      { id: 'B', text: 'O(n log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(k)' }
    ],
    correctAnswer: 'C',
    explanation:
      '固定窗口技巧的關鍵：滑動時只需「加入新右端元素、移除舊左端元素」即可更新窗口總和，避免每次重新累加，將 O(n·k) 降至 O(n)。',
    points: 1
  },

  {
    id: 'sw-q7',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title:
      '以下哪個問題「無法」單純用基本的滑動窗口（無額外資料結構）在 O(n) 內解決？',
    options: [
      { id: 'A', text: '大小為 k 的子陣列最大和' },
      { id: 'B', text: '總和不超過 target 的最長子陣列（所有元素為正整數）' },
      {
        id: 'C',
        text: '「含有負數」的陣列中，找子陣列總和「恰好等於」k 的數量'
      },
      { id: 'D', text: '總和大於等於 target 的最短子陣列（所有元素為正整數）' }
    ],
    correctAnswer: 'C',
    explanation:
      '當陣列含有負數時，縮小窗口（left++）不能保證 sum 一定減少，因此可變窗口的「單調性」被破壞，無法直接使用。此類問題需改用前綴和 + 雜湊表（HashMap）解法。',
    points: 2
  },

  {
    id: 'sw-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '以下哪些情境「適合」使用滑動窗口解決？（多選）',
    options: [
      { id: 'opt1', text: '正整數陣列中，找總和 ≥ target 的最短連續子陣列' },
      { id: 'opt2', text: '找字串中「最長不含重複字元的子字串」' },
      {
        id: 'opt3',
        text: "在含有負數的陣列中找最大子陣列和（Kadane's Algorithm 變體）"
      },
      { id: 'opt4', text: '計算大小為 k 的所有連續子陣列的平均值' }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt4'],
    explanation:
      "opt1、opt4 是標準的滑動窗口應用。opt2（最長不重複子字串）可用滑動窗口搭配 Set 解決。opt3 雖然也有雙指標做法，但傳統 Kadane's 不用滑動窗口，且有負數時需要特殊處理。",
    points: 2
  },

  {
    id: 'sw-q8',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title: '固定窗口與可變窗口滑動窗口最根本的區別是什麼？',
    options: [
      { id: 'A', text: '固定窗口只能用於排序陣列，可變窗口可用於任意陣列' },
      {
        id: 'B',
        text: '固定窗口每次移動時 left 和 right 同步前進一步；可變窗口 left 由條件驅動'
      },
      { id: 'C', text: '固定窗口時間複雜度為 O(n²)，可變窗口為 O(n)' },
      { id: 'D', text: '可變窗口需要額外的雜湊表，固定窗口不需要' }
    ],
    correctAnswer: 'B',
    explanation:
      '固定窗口：每個 for 迴圈步驟，right 進一，left 也進一（窗口大小維持 k）。可變窗口：right 持續向右；left 僅在窗口條件被違反時才向右縮減，不保證每步都移動。',
    points: 2
  },

  // ── Complexity 1300-1500 (5 題) ──────────────────────

  {
    id: 'sw-group-3',
    groupId: 'group-sw-variable',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title:
      '請填入下方可變滑動窗口（longest_lte 模式）實作中 (a)(b)(c)(d) 缺失的程式碼。',
    code: swFillCode,
    language: 'python',
    options: [
      { id: 'a', text: '' },
      { id: 'b', text: '' },
      { id: 'c', text: '' },
      { id: 'd', text: '' }
    ],
    correctAnswer: ['arr[right]', 'target', 'arr[left]', 'right - left + 1'],
    explanation:
      '(a) 右指標擴展：將新加入的元素累加到 curr_sum。(b) while 的退出條件：當 curr_sum 不再超過 target 時停止縮窗。(c) 縮窗時移除左端元素的值。(d) 更新最大長度：當前窗口的長度公式為 right - left + 1。',
    points: 5
  },

  {
    id: 'sw-q9',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title:
      '為什麼滑動窗口的時間複雜度是 O(n) 而非 O(n²)，即使程式碼包含一個 while 迴圈巢狀在 for 迴圈內？',
    options: [
      {
        id: 'A',
        text: '因為 while 迴圈最多只執行 n 次，所以 for + while 總共最多 2n 次操作'
      },
      { id: 'B', text: '因為 while 迴圈使用了 break 提早結束' },
      { id: 'C', text: '因為 left 和 right 每次迴圈都只移動 1 步，互相抵消' },
      { id: 'D', text: '因為現代 CPU 可以並行執行兩個迴圈' }
    ],
    correctAnswer: 'A',
    explanation:
      '分析攤還複雜度（Amortized Analysis）：left 從 0 出發，一路向右最多移動 n 次；right 也最多移動 n 次。整個演算法中 left 和 right 合計移動次數不超過 2n，因此總複雜度為 O(n)，而非 O(n²)。',
    points: 2
  },

  {
    id: 'sw-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title:
      '以下哪些條件必須「同時成立」，才能放心使用基本可變滑動窗口（不搭配額外資料結構）？（多選）',
    options: [
      { id: 'opt1', text: '陣列中所有元素為非負數（或正整數）' },
      { id: 'opt2', text: '問題要求的是「連續子陣列」而非任意子集合' },
      { id: 'opt3', text: '陣列必須先排序' },
      {
        id: 'opt4',
        text: '當 right 擴展使條件惡化時，left 縮小必能使條件改善（單調性）'
      }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt4'],
    explanation:
      'opt1 保證縮窗（left++）能有效減少 sum（負數會破壞此性質）。opt2 限定問題類型為連續子陣列。opt4 是可變窗口正確性的核心前提：窗口的「條件評估函數」對 left、right 必須具備單調性。陣列無需排序（opt3 錯誤）。',
    points: 2
  },

  {
    id: 'sw-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title: '請填入下方「固定窗口」最大子陣列和實作中 (a)(b)(c) 缺失的程式碼。',
    code: swFixedFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['window_sum', 'i + k - 1', 'window_sum'],
    explanation:
      '(a) 初始最大值等於第一個窗口的總和。(b) 滑動時，新加入右端元素的 index 為 i + k - 1（i 是窗口的新起點，長度 k，所以末端 = i + k - 1）。(c) 若當前窗口和更大，更新 max_sum。這是固定窗口的精髓：O(1) 滑動更新取代 O(k) 的重新累加。',
    points: 5
  },

  {
    id: 'sw-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title:
      '給定 arr = [3, 1, 2]，target = 4，執行 sliding_window([3, 1, 2], 4)。請填寫執行經過的行號序列（以空格分隔）。',
    code: swPredictCode,
    language: 'python',
    options: [],
    correctAnswer:
      '1 2 3 4 5 6 7 10 11 5 6 7 10 11 5 6 7 8 9 7 10 12',
    explanation:
      'right=0：L5→L6(sum=3)→L7(3>4?No)→L10(1>0?Yes)→L11(maxLen=1)。right=1：L5→L6(sum=4)→L7(4>4?No)→L10(2>1?Yes)→L11(maxLen=2)。right=2：L5→L6(sum=6)→L7(6>4?Yes)→L8(sum=3)→L9(left=1)→L7(3>4?No)→L10(2>2?No，不執行L11)→L12。注意：while 條件行 L7 每次判斷都計入；for 迴圈不計 exit 的 L5。',
    points: 5
  }
];

// --- Export ---

export const slidingWindowQuiz: PracticeQuiz = {
  levelId: 'slidingwindow',
  levelName: '滑動窗口 (Sliding Window)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-sw-variable',
      title: '題組：可變窗口的狀態追蹤',
      description:
        '滑動窗口的關鍵在於「左縮右擴」的決策時機。請參考下方 longest_lte 模式的實作，追蹤 arr = [3, 1, 2, 7, 4]，target = 7 的執行過程。',
      code: swWindowTraceCode,
      language: 'python',
      questionIds: ['sw-group-1', 'sw-group-2', 'sw-group-3']
    }
  ]
};

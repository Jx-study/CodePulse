import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

const psumQueryCode = `def query_range(prefix_sum, i, j):
    # i 為起始索引，j 為結束索引 (均為包含)
    return prefix_sum[j + 1] - prefix_sum[i]`;

const psumFillCode = `def build_and_query(arr, left, right):
    P = [0] * (len(arr) + 1)
    for i in range(len(arr)):
        P[i + 1] = (a) + arr[i]
    
    # 執行區間查詢 [left, right]
    return (b) - (c)`;

const psumPredictCode = `def build_prefix_sum(arr):           # L1
    n = len(arr)                      # L2
    prefix_sum = [0] * (n + 1)        # L3
    for i in range(n):                # L4
        prefix_sum[i + 1] = prefix_sum[i] + arr[i] # L5
    return prefix_sum                 # L6`;

const questions: Question[] = [
  // 【Basic 基礎】 800-950
  {
    id: 'psum-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '前綴和 (Prefix Sum) 這種技巧的主要目的是什麼？',
    options: [
      { id: 'A', text: '將陣列進行排序' },
      { id: 'B', text: '減少「區間和查詢」的時間複雜度' },
      { id: 'C', text: '壓縮資料以節省記憶體' },
      { id: 'D', text: '尋找陣列中的最大值' }
    ],
    correctAnswer: 'B',
    explanation: '前綴和透過預先計算累加值，將原本需要 O(n) 的區間和查詢優化至 O(1)。',
    points: 1
  },
  {
    id: 'psum-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: '實作前綴和時，我們通常會讓前綴和陣列 P 的長度比原陣列 arr 多 1，並讓 P[0] = 0。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '正確。設定 P[0] = 0 是為了處理從原陣列 Index 0 開始的區間查詢，使公式統一且不需要額外的 if 判斷。',
    points: 1
  },
  {
    id: 'psum-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '若原陣列 arr = [1, 2, 3]，對應的補零前綴和陣列 P 會是多少？',
    options: [
      { id: 'A', text: '[1, 3, 6]' },
      { id: 'B', text: '[0, 1, 3, 6]' },
      { id: 'C', text: '[0, 1, 2, 3]' },
      { id: 'D', text: '[1, 2, 3, 0]' }
    ],
    correctAnswer: 'B',
    explanation: 'P[0]=0, P[1]=0+1=1, P[2]=1+2=3, P[3]=3+3=6。因此結果為 [0, 1, 3, 6]。',
    points: 1
  },
  {
    id: 'psum-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '前綴和技術屬於「空間換時間」的一種應用。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '正確。我們額外消耗了 O(n) 的空間來儲存前綴和陣列，以換取查詢時的 O(1) 高效率。',
    points: 1
  },
  {
    id: 'psum-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '計算前綴和陣列的「預處理」過程，其時間複雜度是多少？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(n²)' }
    ],
    correctAnswer: 'C',
    explanation: '預處理只需要掃描一次陣列，將前一個累加值加上當前元素即可，因此是線性時間 O(n)。',
    points: 1
  },

  // 【Application 應用】 1000-1250
  {
    id: 'psum-group-1',
    groupId: 'group-psum-query',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title: '給定前綴和陣列 P = [0, 5, 12, 18, 20]。若要計算原陣列中索引 1 到 3 的和（含邊界），應該使用哪個計算式？',
    options: [
      { id: 'A', text: 'P[3] - P[1]' },
      { id: 'B', text: 'P[4] - P[1]' },
      { id: 'C', text: 'P[3] - P[0]' },
      { id: 'D', text: 'P[4] - P[0]' }
    ],
    correctAnswer: 'B',
    explanation: '根據公式 Sum(i, j) = P[j+1] - P[i]。此處 i=1, j=3，因此為 P[3+1] - P[1] = P[4] - P[1]。',
    points: 2
  },
  {
    id: 'psum-group-2',
    groupId: 'group-psum-query',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '承上題 P = [0, 5, 12, 18, 20]，計算出的區間 [1, 3] 之和是多少？',
    options: [
      { id: 'A', text: '13' },
      { id: 'B', text: '15' },
      { id: 'C', text: '18' },
      { id: 'D', text: '20' }
    ],
    correctAnswer: 'B',
    explanation: 'P[4] - P[1] = 20 - 5 = 15。',
    points: 2
  },
  {
    id: 'psum-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '若一個陣列的查詢次數非常多（例如 M 次查詢），而陣列內容「完全不會變動」，則最適合使用哪種方式？',
    options: [
      { id: 'A', text: '每次查詢都重新迴圈累加 (O(M * N))' },
      { id: 'B', text: '前綴和 (預處理 O(N), 查詢 O(M))' },
      { id: 'C', text: '二分搜尋法' },
      { id: 'D', text: '將陣列先排序' }
    ],
    correctAnswer: 'B',
    explanation: '前綴和特別適合「靜態資料、大量查詢」的場景。',
    points: 1
  },
  {
    id: 'psum-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '前綴和陣列 P 中，P[i] 的數值物理意義代表什麼？',
    options: [
      { id: 'A', text: '原陣列第 i 個元素的值' },
      { id: 'B', text: '原陣列前 i 個元素 (索引 0 到 i-1) 的總和' },
      { id: 'C', text: '原陣列第 i 個元素之後的所有和' },
      { id: 'D', text: '原陣列中最大的 i 個數之和' }
    ],
    correctAnswer: 'B',
    explanation: '在補零實作中，P[i] 儲存的是從 arr[0] 加到 arr[i-1] 的結果。',
    points: 1
  },
  {
    id: 'psum-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '關於前綴和的應用場景，以下哪些敘述是正確的？（多選）',
    options: [
      { id: 'opt1', text: '快速計算子陣列的和' },
      { id: 'opt2', text: '配合哈希表解決「和為 K 的子陣列數量」問題' },
      { id: 'opt3', text: '處理頻繁的「單點修改」與「區間查詢」' },
      { id: 'opt4', text: '擴展到二維空間計算矩陣區域和' }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt4'],
    explanation: '前綴和不擅長單點修改 (opt3)，因為修改一個值會導致後方所有前綴和失效 (O(N))。頻繁修改建議使用線段樹或樹狀陣列。',
    points: 2
  },
  {
    id: 'psum-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title: '若原陣列包含「負數」，前綴和陣列 P 是否仍具有單調遞增的特性？',
    options: [
      { id: 'A', text: '是，前綴和永遠是遞增的' },
      { id: 'B', text: '否，遇到負數時前綴和會減少' },
      { id: 'C', text: '是，因為 P[i] 總是包含更多元素' },
      { id: 'D', text: '不一定，取決於第一個元素是否為正' }
    ],
    correctAnswer: 'B',
    explanation: '如果元素有負數，累加值可能會變小，因此前綴和陣列不保證單調性。若均為非負數，則保證單調遞增。',
    points: 1
  },

  // 【Complexity 進階/複雜度】 1300-1500
  {
    id: 'psum-group-3',
    groupId: 'group-psum-query',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title: '請填入前綴和實作中 (a)(b)(c) 缺失的程式碼。',
    code: psumFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['P[i]', 'P[right + 1]', 'P[left]'],
    explanation: '(a) 累加邏輯：當前 P[i+1] 是前一項 P[i] 加原陣列值。(b)(c) 查詢邏輯：對應 Sum 公式。',
    points: 5
  },
  {
    id: 'psum-q7',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: '在二維前綴和 (2D Prefix Sum) 中，計算 (r1, c1) 到 (r2, c2) 的矩形區域和，公式需要用到幾個項？',
    options: [
      { id: 'A', text: '2 個' },
      { id: 'B', text: '3 個' },
      { id: 'C', text: '4 個' },
      { id: 'D', text: '1 個' }
    ],
    correctAnswer: 'C',
    explanation: '二維公式為：P[r2][c2] - P[r1-1][c2] - P[r2][c1-1] + P[r1-1][c1-1]，共涉及 4 個項。',
    points: 2
  },
  {
    id: 'psum-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '若需要解決「區間加值」而非查詢問題，哪種技術通常與前綴和「互為逆運算」？',
    options: [
      { id: 'opt1', text: '差分陣列 (Difference Array)' },
      { id: 'opt2', text: '滑動窗口 (Sliding Window)' },
      { id: 'opt3', text: '動態規劃 (DP)' },
      { id: 'opt4', text: '二分搜尋' }
    ],
    correctAnswer: ['opt1'],
    explanation: '差分陣列是前綴和的逆運算：對差分陣列求前綴和可還原原陣列。差分適合 O(1) 區間修改，前綴和適合 O(1) 區間查詢。',
    points: 2
  },
  {
    id: 'psum-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title: '請填入下方實作「和為 K 的子陣列數量」的核心邏輯。',
    code: `def count_sum_k(arr, k):
    count = 0
    curr_sum = 0
    sums_map = {0: 1} # 紀錄前綴和出現次數
    for x in arr:
        curr_sum += x
        # 如果 curr_sum - k 在 map 中，代表存在子陣列和為 k
        if (a) in sums_map:
            count += sums_map[(b)]
        sums_map[curr_sum] = sums_map.get(curr_sum, 0) + (c)
    return count`,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['curr_sum - k', 'curr_sum - k', '1'],
    explanation: '這是前綴和最經典的進階應用：利用 $P[j] - P[i] = k$ 變形為 $P[i] = P[j] - k$，透過 Map 記錄 $P[i]$ 的次數，達到 $O(n)$ 求解。',
    points: 5
  },
  {
    id: 'psum-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title: '給定 arr = [10, 20]，執行 build_prefix_sum([10, 20])。請填寫經過的行號序列（以空格分隔）。',
    code: psumPredictCode,
    language: 'python',
    options: [],
    correctAnswer: '1 2 3 4 5 4 5 4 6',
    explanation: '進入(L1) -> 取得長度2(L2) -> 初始化(L3) -> 迴圈 i=0(L4) -> 累加(L5) -> 迴圈 i=1(L4) -> 累加(L5) -> 迴圈結束回傳(L4,L6)。',
    points: 5
  }
];

export const prefixSumQuiz: PracticeQuiz = {
  levelId: 'prefixsum',
  levelName: '前綴和 (Prefix Sum)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-psum-query',
      title: '題組：高效區間查詢',
      description: '前綴和陣列 P 的核心優勢在於將 $O(N)$ 的查詢優化為 $O(1)$ 的減法運算。請仔細觀察索引的對應關係。',
      code: psumQueryCode,
      language: 'python',
      questionIds: ['psum-group-1', 'psum-group-2', 'psum-group-3']
    }
  ]
};
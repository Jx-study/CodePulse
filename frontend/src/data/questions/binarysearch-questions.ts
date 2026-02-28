import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

// 1. 尋找插入位置 完整實作 (用於題組顯示)
const insertCode = `def search_insert(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    # 找不到目標時，left 指標剛好就是該插入的正確位置
    return left`;

// 2. 尋找插入位置 Fill-code 版本
const insertFillCode = `def search_insert(arr, target):
    left = 0
    right = len(arr) - 1
    while (a):
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = (b)
        else:
            right = (c)
    return left`;

// 3. 標準二分搜尋 Fill-code 版本
const bsFillCode = `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return (a)
        elif arr[mid] < target:
            (b) = mid + 1
        else:
            (c) = mid - 1
    return -1`;

// 4. 二分搜尋 Predict-line 版本 (含行號)
const bsPredictCode = `def binary_search(arr, target):           # L1
    left = 0                              # L2
    right = len(arr) - 1                  # L3
    while left <= right:                  # L4
        mid = (left + right) // 2         # L5
        if arr[mid] == target:            # L6
            return mid                    # L7
        elif arr[mid] < target:           # L8
            left = mid + 1                # L9
        else:                             # L10
            right = mid - 1               # L11
    return -1                             # L12`;

// --- 題目定義 ---

const questions: Question[] = [
  // 【Basic 基礎】 800-950
  {
    id: 'bs-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '要使用二分搜尋法 (Binary Search)，前提是該陣列 (Array) 內的資料必須是「已排序 (Sorted)」的。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '正確。二分搜尋的核心邏輯是透過比較中間值來決定要捨棄左半邊還是右半邊，這必須建立在資料具備順序性的前提下。',
    points: 1
  },
  {
    id: 'bs-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '二分搜尋法的核心策略是什麼？',
    options: [
      { id: 'A', text: '每次比較後，將搜尋範圍縮小一半' },
      { id: 'B', text: '從陣列第一個元素開始逐一比對' },
      { id: 'C', text: '將陣列分成多個區塊並行搜尋' },
      { id: 'D', text: '使用雜湊函數直接計算出索引位置' }
    ],
    correctAnswer: 'A',
    explanation: '二分搜尋每次都會檢查中間的元素，並將下一次的搜尋範圍減半，這使得它非常高效。選項 B 是線性搜尋，選項 D 是 Hash Table 的特性。',
    points: 1
  },
  {
    id: 'bs-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: '對於一個長度為 n 的陣列，二分搜尋法初始的 left 和 right 指標通常設為多少？',
    options: [
      { id: 'A', text: 'left = 1, right = n' },
      { id: 'B', text: 'left = 0, right = n - 1' },
      { id: 'C', text: 'left = 0, right = n' },
      { id: 'D', text: 'left = -1, right = n' }
    ],
    correctAnswer: 'B',
    explanation: '在多數使用 Zero-indexed（從 0 開始索引）的語言中，陣列的第一個元素索引為 0，最後一個元素索引為 n - 1。',
    points: 1
  },
  {
    id: 'bs-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '在迴圈中，我們如何計算中間位置 (mid) 的索引？',
    options: [
      { id: 'A', text: 'mid = left + right' },
      { id: 'B', text: 'mid = (left + right) * 2' },
      { id: 'C', text: 'mid = (left + right) // 2' },
      { id: 'D', text: 'mid = right - left' }
    ],
    correctAnswer: 'C',
    explanation: '中間索引是左右邊界的平均值，通常會使用整數除法（無條件捨去小數），以確保索引是個整數。',
    points: 1
  },
  {
    id: 'bs-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '若中間元素的值大於目標值 (arr[mid] > target)，我們應該將 left 指標更新為 mid + 1。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'false',
    explanation: '錯誤。如果中間元素比目標值還要大，代表目標值一定在「左半邊」，此時應該把右邊界縮小，即更新 right = mid - 1。',
    points: 1
  },

  // 【Application 應用】 1000-1250
  {
    id: 'bs-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title: '二分搜尋中，while 迴圈的繼續條件通常是什麼？',
    options: [
      { id: 'A', text: 'while left < right' },
      { id: 'B', text: 'while left <= right' },
      { id: 'C', text: 'while left != right' },
      { id: 'D', text: 'while left > right' }
    ],
    correctAnswer: 'B',
    explanation: '當 left == right 時，範圍內還有「最後一個」元素尚未檢查。因此必須使用 left <= right 來確保所有可能性都被檢查到。',
    points: 1
  },
  {
    id: 'bs-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '給定已排序陣列 arr = [10, 20, 30, 40, 50]，尋找目標 target = 40。第一次迴圈算出的 mid 索引為 2（數值為 30），接著會執行什麼操作？',
    options: [
      { id: 'A', text: '更新 right = 1' },
      { id: 'B', text: '更新 left = 3' },
      { id: 'C', text: '更新 left = 2' },
      { id: 'D', text: '回傳 mid' }
    ],
    correctAnswer: 'B',
    explanation: '因為 arr[mid] (30) < target (40)，目標值在右半部，所以要將左邊界移過中間點，更新 left = mid + 1，也就是 3。',
    points: 1
  },
  {
    id: 'bs-group-1',
    groupId: 'group-bs-insert',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '若在 arr = [1, 3, 5, 6] 中執行上述 search_insert 尋找目標值 2。迴圈結束時，left 的值會是多少？',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '1' },
      { id: 'C', text: '2' },
      { id: 'D', text: '3' }
    ],
    correctAnswer: 'B',
    explanation: '初始 left=0, right=3。第一次 mid=1 (值3)，3>2 所以 right=0。第二次 left=0, right=0, mid=0 (值1)，1<2 所以 left=1。此時 left > right，迴圈結束。left=1 即為正確插入位置。',
    points: 2
  },
  {
    id: 'bs-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '二分搜尋法的「最佳情況 (Best Case)」時間複雜度為何？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(n log n)' }
    ],
    correctAnswer: 'A',
    explanation: '最佳情況發生在「第一次檢查的中間元素，剛好就是目標值」時，只需要常數時間 O(1) 就能完成搜尋。',
    points: 1
  },
  {
    id: 'bs-group-2',
    groupId: 'group-bs-insert',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '為什麼在找不到目標值時，回傳 left 指標剛好就是「應該插入的位置」？',
    options: [
      { id: 'A', text: '因為 left 永遠指向陣列的第一個元素' },
      { id: 'B', text: '因為迴圈結束時，left 會停在第一個「大於」目標值的元素上' },
      { id: 'C', text: '因為 left 和 right 最後會加總' },
      { id: 'D', text: '這只是一個巧合，有時候也可能要回傳 right' }
    ],
    correctAnswer: 'B',
    explanation: '當迴圈條件 left <= right 被打破時，意味著 left 剛好跨過了 right。此時 left 會剛好落在第一個比 target 大的元素位置上，這正符合保持陣列排序的「插入位置」。',
    points: 2
  },
  {
    id: 'bs-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '以下哪些資料結構適合直接使用二分搜尋法？（多選）',
    options: [
      { id: 'opt1', text: '已排序的陣列 (Array)' },
      { id: 'opt2', text: '已排序的單向鏈結串列 (Singly Linked List)' },
      { id: 'opt3', text: '已排序的動態陣列 (如 Python 的 List)' },
      { id: 'opt4', text: '雜湊表 (Hash Table)' }
    ],
    correctAnswer: ['opt1', 'opt3'],
    explanation: '二分搜尋依賴 O(1) 的隨機存取 (Random Access) 來快速讀取中間元素。Array 與動態陣列支援這點。Linked List 要找中間元素必須從頭遍歷 O(n)，會失去二分搜尋的效率優勢。',
    points: 2
  },
  {
    id: 'bs-q7',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '以下哪一個生活中的行為最符合二分搜尋的概念？',
    options: [
      { id: 'A', text: '在未分類的一疊考卷中尋找自己的考卷' },
      { id: 'B', text: '翻開字典的正中間找單字，再根據字母順序決定往前翻還是往後翻' },
      { id: 'C', text: '排隊買票時依序前進' },
      { id: 'D', text: '把所有撲克牌攤開在桌上同時尋找鬼牌' }
    ],
    correctAnswer: 'B',
    explanation: '字典的單字是「已排序」的。翻開中間並比較字母大小，然後只在剩下一半的頁數中尋找，這就是經典的二分搜尋法。',
    points: 1
  },
  {
    id: 'bs-q8',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title: '如果陣列中包含多個「重複的目標值」（例如 arr=[10, 20, 20, 20, 30], target=20），標準的二分搜尋會回傳哪一個？',
    options: [
      { id: 'A', text: '保證回傳第一個（最左邊）出現的 20' },
      { id: 'B', text: '保證回傳最後一個（最右邊）出現的 20' },
      { id: 'C', text: '可能回傳其中任意一個 20，視陣列長度與 mid 計算而定' },
      { id: 'D', text: '會拋出錯誤' }
    ],
    correctAnswer: 'C',
    explanation: '標準二分搜尋只要遇到 arr[mid] == target 就會立刻 return，無法保證它是第一個還是最後一個。如果要找邊界，必須使用 `lower_bound` 或修改相等時的指標移動邏輯。',
    points: 2
  },

  // 【Complexity 進階/複雜度】 1300-1500
  {
    id: 'bs-group-3',
    groupId: 'group-bs-insert',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title: '請填入 search_insert 程式碼中 (a)(b)(c) 處缺失的部分。',
    code: insertFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['left <= right', 'mid + 1', 'mid - 1'],
    explanation: '(a) 迴圈條件需包含等號；(b) 值太小時，左邊界往右縮圈 (mid + 1)；(c) 值太大時，右邊界往左縮圈 (mid - 1)。',
    points: 5
  },
  {
    id: 'bs-q9',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: '二分搜尋法的「平均與最壞情況」時間複雜度為何？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(n log n)' }
    ],
    correctAnswer: 'B',
    explanation: '由於每次比較都將資料量除以 2（N, N/2, N/4...），直到剩下 1 個元素為止。除以 2 的次數即為 log₂(N)，因此最壞和平均的時間複雜度都是 O(log n)。',
    points: 2
  },
  {
    id: 'bs-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '請填入下方標準二分搜尋邏輯中 (a)(b)(c) 缺失的變數名稱。',
    code: bsFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['mid', 'left', 'right'],
    explanation: '(a) 找到目標時回傳索引 mid。(b) 目標在右側，更新 left。(c) 目標在左側，更新 right。',
    points: 5
  },
  {
    id: 'bs-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title: '在某些靜態型別語言（如 C++ 或 Java）中，計算 mid 時常寫成 mid = left + (right - left) / 2，而不是 mid = (left + right) / 2。這樣做的主要原因為何？（多選）',
    options: [
      { id: 'opt1', text: '因為這樣計算出來的結果比較精準' },
      { id: 'opt2', text: '為了防止 left + right 產生整數溢位 (Integer Overflow)' },
      { id: 'opt3', text: '當陣列極大時，left+right 可能超過 32-bit 整數的上限' },
      { id: 'opt4', text: '這樣程式執行的速度會快很多' }
    ],
    correctAnswer: ['opt2', 'opt3'],
    explanation: '在 C++ 或 Java 中，如果 left 和 right 都很大，把它們相加可能會超過 int 的最大值導致負數溢位 (opt2, opt3 正確)。Python 會自動處理大數，所以沒這問題。這與精準度或執行速度無關。',
    points: 2
  },
  {
    id: 'bs-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title: '給定已排序陣列 arr = [10, 30, 50]，尋找目標 target = 50。呼叫 binary_search(arr, 50) 時，請依序填寫執行的行號序列（以空格分隔）。',
    code: bsPredictCode,
    language: 'python',
    options: [],
    correctAnswer: '1 2 3 4 5 6 8 9 4 5 6 7',
    explanation: '初始 left=0, right=2 (L1,L2,L3)。進迴圈(L4) -> mid=1, 值為30(L5)。30==50 為假(L6) -> 30<50 為真(L8) -> left=2(L9)。第二圈(L4) -> mid=2, 值為50(L5) -> 50==50 為真(L6) -> return 2(L7)。',
    points: 5
  }
];

export const binarySearchQuiz: PracticeQuiz = {
  levelId: 'binary-search',
  levelName: '二分搜尋 (Binary Search)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-bs-insert',
      title: '題組：尋找插入位置 (Search Insert Position)',
      description: '二分搜尋不僅能找存在的元素，還能用來找出「元素應該被插入的位置」(LeetCode 35)。請參考下方程式碼回答問題。',
      code: insertCode,
      language: 'python',
      questionIds: ['bs-group-1', 'bs-group-2', 'bs-group-3']
    }
  ]
};
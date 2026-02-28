import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

const isortSimplifiedCode = `def insert_logic(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key`;

const isortFillCode = `def insertion_sort(collection):
    for i in range(1, len(collection)):
        key = collection[i]
        j = i - 1
        while (a) and (b):
            collection[j + 1] = collection[j]
            j -= 1
        collection[(c)] = key`;

const isortPredictCode = `def insertion_sort(collection):           # L1
    for i in range(1, len(collection)):               # L2
        key = collection[i]                           # L3
        j = i - 1                                     # L4
        while j >= 0 and collection[j] > key:         # L5
            collection[j + 1] = collection[j]         # L6
            j -= 1                                    # L7
        collection[j + 1] = key                       # L8
    return collection                                 # L9`;

const questions: Question[] = [
  // 【Basic 基礎】 800-950
  {
    id: 'isort-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '哪一種日常生活中的行為最適合用來描述插入排序 (Insertion Sort) 的運作方式？',
    options: [
      { id: 'A', text: '在超市排隊結帳' },
      { id: 'B', text: '打撲克牌時將拿到的手牌由小到大整理好' },
      { id: 'C', text: '將一大堆不同長度的木板疊在一起' },
      { id: 'D', text: '在字典中搜尋單字' }
    ],
    correctAnswer: 'B',
    explanation: '插入排序就像整理撲克牌：左手持有一堆已排好的牌，右手每次取出一張新牌，並在左手中從右往左比對，找到合適位置後「插入」。',
    points: 1
  },
  {
    id: 'isort-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: '插入排序與泡沫排序一樣，都屬於「穩定排序 (Stable Sort)」。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '正確。插入排序在比對時，如果遇到與 `key` 數值相同的元素，並不會將其平移。因此相同數值的相對順序會保持不變，符合穩定排序的定義。',
    points: 1
  },
  {
    id: 'isort-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '在插入排序的執行過程中，陣列會被邏輯性地分為哪兩部分？',
    options: [
      { id: 'A', text: '左半邊是已排序區，右半邊是待排序區' },
      { id: 'B', text: '奇數位置與偶數位置' },
      { id: 'C', text: '大於平均值的部分與小於平均值的部分' },
      { id: 'D', text: '上半區與下半區' }
    ],
    correctAnswer: 'A',
    explanation: '插入排序會從左向右推進。索引 `i` 左側的元素永遠保持排序狀態（儘管位置可能因平移而改變），右側則是尚未處理的原始數列。',
    points: 1
  },
  {
    id: 'isort-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '插入排序是一種「原地排序 (In-place Sort)」，它不需要額外的陣列空間來存放資料。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '正確。插入排序直接在原始陣列上進行平移與覆寫，僅需要一個額外的 `key` 變數空間，因此空間複雜度為 O(1)。',
    points: 1
  },
  {
    id: 'isort-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '插入排序的外部迴圈通常從索引 (Index) 多少開始？',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '1' },
      { id: 'C', text: '-1' },
      { id: 'D', text: '陣列長度的中間點' }
    ],
    correctAnswer: 'B',
    explanation: '我們通常假設 Index 0 的第一個元素「本身已經排序好」了。所以從 Index 1 開始處理第二個元素，並嘗試將其插入到前面的排序區。',
    points: 1
  },

  // 【Application 應用】 1000-1250
  {
    id: 'isort-group-1',
    groupId: 'group-isort-logic',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title: '給定陣列 arr = [4, 3, 2, 10, 12, 1]。當執行到 i = 3 時（即 key = 10），內層 while 迴圈會執行幾次？',
    options: [
      { id: 'A', text: '0 次' },
      { id: 'B', text: '1 次' },
      { id: 'C', text: '2 次' },
      { id: 'D', text: '3 次' }
    ],
    correctAnswer: 'A',
    explanation: '當 i=3 時，已排序區為 [2, 3, 4]，key=10。比較 10 與左邊的 4，發現 10 > 4，條件 `arr[j] > key` 直接不成立，while 迴圈執行 0 次。',
    points: 2
  },
  {
    id: 'isort-q8',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '在插入排序中，為什麼要先將 `arr[i]` 暫存到 `key` 變數，再執行平移操作？',
    options: [
      { id: 'A', text: '因為 Python 語法規定必須先暫存' },
      { id: 'B', text: '因為平移操作 `arr[j+1] = arr[j]` 會直接覆寫 `arr[i]`，若不先暫存，原始值就遺失了' },
      { id: 'C', text: '為了讓演算法更節省記憶體空間' },
      { id: 'D', text: '只是一種編程習慣，不影響結果' }
    ],
    correctAnswer: 'B',
    explanation: '平移的本質是「往右複製一格」：`arr[j+1] = arr[j]`。當 j 等於 i-1 時，arr[i] 的位置就會被 arr[j] 覆蓋。若不提前用 key 保存，原始要插入的值便永久遺失。這是插入排序使用 key 暫存的根本原因。',
    points: 2
  },
  {
    id: 'isort-group-2',
    groupId: 'group-isort-logic',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '承上題，如果此時 key = 1（最後一個元素），while 迴圈會發生什麼事？',
    options: [
      { id: 'A', text: '直接結束' },
      { id: 'B', text: '所有比 1 大的元素都向右平移一格，1 最後被放到 Index 0' },
      { id: 'C', text: '發生索引越界錯誤' },
      { id: 'D', text: '陣列內容不變' }
    ],
    correctAnswer: 'B',
    explanation: '這是插入排序的最壞情況。由於 1 小於前方所有已排序元素，j 指標會一路減少到 -1，並讓所有元素右移，最後 key 被存放在 Index 0。',
    points: 2
  },
  {
    id: 'isort-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '插入排序在處理哪一種資料集時，效能表現最差（最壞情況）？',
    options: [
      { id: 'A', text: '已經排序好的資料' },
      { id: 'B', text: '完全反向排序的資料' },
      { id: 'C', text: '隨機分布的資料' },
      { id: 'D', text: '包含大量重複值的資料' }
    ],
    correctAnswer: 'B',
    explanation: '在完全反向的情況下，每一個新取出的 `key` 都必須與前方「所有」元素進行比較並位移，總比較次數達到最大值 O(n²)。',
    points: 1
  },
  {
    id: 'isort-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '插入排序在「最佳情況 (Best Case)」下的時間複雜度是多少？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(n)' },
      { id: 'C', text: 'O(n log n)' },
      { id: 'D', text: 'O(n²)' }
    ],
    correctAnswer: 'B',
    explanation: '當輸入陣列已完全排序好時，內部 while 迴圈每一次都只會進行一次比較且不平移。總共執行 n-1 次比較，因此時間複雜度為線性 O(n)。',
    points: 1
  },
  {
    id: 'isort-q9',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '在最佳情況（輸入陣列已排序好）下，插入排序的內部 while 迴圈共執行了幾次？',
    options: [
      { id: 'A', text: '0 次' },
      { id: 'B', text: 'n - 1 次' },
      { id: 'C', text: 'n(n-1)/2 次' },
      { id: 'D', text: '不一定' }
    ],
    correctAnswer: 'A',
    explanation: '陣列已排序時，對每個 i，`arr[j] > key` 的條件從一開始就不成立（左邊元素 ≤ key），while 迴圈一次都不執行，直接在原位插入。外層 for 跑 n-1 次，每次 while 執行 0 次，共 0 次。這也解釋了為何最佳情況是 O(n)。',
    points: 2
  },
  {
    id: 'isort-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '關於插入排序的特性，哪些敘述是正確的？（多選）',
    options: [
      { id: 'opt1', text: '它在資料量極小時非常有效率' },
      { id: 'opt2', text: '它是外部排序的一種' },
      { id: 'opt3', text: '對於「幾乎排序好」的陣列，其表現優於快速排序 (Quick Sort)' },
      { id: 'opt4', text: '它是一種分而治之 (Divide and Conquer) 的演算法' }
    ],
    correctAnswer: ['opt1', 'opt3'],
    explanation: '插入排序在小資料量或幾乎排好序的資料中效能卓越，常被混合到進階演算法（如 Timsort 或 Introsort）中作為底層優化 (opt1, opt3 正確)。它不是分治法，也不是外部排序。',
    points: 2
  },
  {
    id: 'isort-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title: '在插入排序中，j 指標在 while 迴圈結束後的最終狀態代表什麼？',
    options: [
      { id: 'A', text: 'key 應該被插入的位置' },
      { id: 'B', text: 'key 應該被插入位置的前一個位置' },
      { id: 'C', text: '陣列的最末端' },
      { id: 'D', text: '當前最大值的位置' }
    ],
    correctAnswer: 'B',
    explanation: '迴圈終止於 `arr[j] <= key` 或 `j < 0`。這意味著真正的空位是在 `j + 1`，所以 j 本身是空位的前一格。',
    points: 2
  },

  // 【Complexity 進階/複雜度】 1300-1500
  {
    id: 'isort-group-3',
    groupId: 'group-isort-logic',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title: '請填入下方插入排序實作中 (a)(b)(c) 缺失的條件或變數名稱。',
    code: isortFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['j >= 0', 'collection[j] > key', 'j + 1'],
    explanation: '(a) 防禦邊界條件：確保索引不會低於 0。(b) 平移條件：左邊的元素比 key 大時才右移。(c) 最終位置：j 指向的是第一個「不大於 key」的元素，故 key 應插入其右側 j+1 處。',
    points: 5
  },
  {
    id: 'isort-q7',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: '對於一個長度為 n 的陣列，插入排序在最壞情況下總共會執行幾次「比較 (Comparison)」？',
    options: [
      { id: 'A', text: 'n - 1 次' },
      { id: 'B', text: 'n log n 次' },
      { id: 'C', text: 'n(n-1)/2 次' },
      { id: 'D', text: 'n² 次' }
    ],
    correctAnswer: 'C',
    explanation: '最壞情況（反向）下，i=1 時比較 1 次，i=2 時比較 2 次... i=n-1 時比較 n-1 次。總和為 1+2+...+(n-1) = n(n-1)/2。',
    points: 2
  },
  {
    id: 'isort-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '下列關於各排序演算法空間複雜度 (Space Complexity) 的描述，正確的有？（多選）',
    options: [
      { id: 'opt1', text: '插入排序為 O(1)' },
      { id: 'opt2', text: '選擇排序為 O(1)' },
      { id: 'opt3', text: '歸併排序 (Merge Sort) 通常為 O(n)' },
      { id: 'opt4', text: '泡沫排序為 O(n)' }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt3'],
    explanation: 'Insertion, Selection, Bubble 都是原地排序，空間為 O(1)。Merge Sort 因為需要額外陣列來儲存合併結果，通常為 O(n)。',
    points: 2
  },
  {
    id: 'isort-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title: '這是一個遞迴版本的插入排序邏輯。請填入正確的遞迴終止條件與參數。',
    code: `def recursive_insertion_sort(arr, n):
    if n <= (a):
        return
    recursive_insertion_sort(arr, (b))
    last = arr[n-1]
    j = n - 2
    while j >= 0 and arr[j] > last:
        arr[j+1] = arr[j]
        j -= 1
    arr[j+1] = (c)`,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['1', 'n - 1', 'last'],
    explanation: '(a) 當陣列長度小於等於 1，不需排序直接回傳。(b) 遞迴處理前 n-1 個元素。(c) 處理完子問題後，將最後一個元素「插入」正確位置。',
    points: 5
  },
  {
    id: 'isort-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title: '給定 arr = [3, 1]，執行教學區實作的 insertion_sort([3, 1])。請寫下經過的行號序列（以空格分隔）。',
    code: isortPredictCode,
    language: 'python',
    options: [],
    correctAnswer: '1 2 3 4 5 6 7 5 8 9',
    explanation: '進入(L1) -> 迴圈 i=1(L2) -> key=1(L3) -> j=0(L4) -> 比較(L5:T) -> 平移(L6) -> j=-1(L7) -> 比較(L5:F) -> 插入(L8) -> 迴圈結束回傳(L9)。',
    points: 5
  }
];

export const insertionSortQuiz: PracticeQuiz = {
  levelId: 'insertion-sort',
  levelName: '插入排序 (Insertion Sort)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-isort-logic',
      title: '題組：插入排序的平移機制',
      description: '插入排序透過平移元素來騰出空間，這比交換操作更有效率。請仔細觀察平移發生的條件。',
      code: isortSimplifiedCode,
      language: 'python',
      questionIds: ['isort-group-1', 'isort-group-2', 'isort-group-3']
    }
  ]
};
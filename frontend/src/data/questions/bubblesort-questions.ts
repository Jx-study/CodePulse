import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

// 1. 簡化版泡沫排序 (用於題組顯示)
const bsortSimplifiedCode = `def bubble_sort_simplified(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                # 交換元素
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`;

// 2. 優化版泡沫排序 Fill-code 版本
const bsortOptimizedFillCode = `def bubble_sort_optimized(arr):
    n = len(arr)
    for i in range(n - 1):
        (a) = False
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                (b) = True
        if not (c):
            break
    return arr`;

// 3. 遞減排序 Fill-code 版本
const bsortDescFillCode = `def bubble_sort_descending(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if arr[j] (a) arr[j + 1]:      # 注意遞減的需求
                arr[j], arr[j+1] = arr[j+1], (b)
    return (c)`;

// 4. 優化版泡沫排序 Predict-line 版本 (含行號)
const bsortPredictCode = `def bubble_sort(collection):                           # L1
    total_items = len(collection)                      # L2
    for round in range(total_items - 1):               # L3
        has_swapped = False                            # L4
        unsorted_range = total_items - 1 - round       # L5
        for index in range(unsorted_range):            # L6
            if collection[index] > collection[index+1]:# L7
                collection[index], collection[index+1] = collection[index+1], collection[index] # L8
                has_swapped = True                     # L9
        if not has_swapped:                            # L10
            break                                      # L11
    return collection                                  # L12`;

// --- 題目定義 ---

const questions: Question[] = [
  // 【Basic 基礎】 800-950
  {
    id: 'bsort-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '泡沫排序 (Bubble Sort) 的名稱由來是什麼？',
    options: [
      { id: 'A', text: '因為演算法執行時產生的記憶體碎片像泡沫一樣多' },
      { id: 'B', text: '因為較大（或較小）的元素會像水中的氣泡一樣，逐漸「浮」到陣列的頂端（末端）' },
      { id: 'C', text: '發明者的名字叫 Bubble' },
      { id: 'D', text: '因為它的時間複雜度膨脹得像泡沫一樣快' }
    ],
    correctAnswer: 'B',
    explanation: '泡沫排序的核心特徵是：每一輪都會將當前未排序部分的最大值（如果是遞增排序），透過不斷與右邊相鄰元素交換，一路推擠到陣列的最右側。',
    points: 1
  },
  {
    id: 'bsort-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: '在泡沫排序中，我們主要透過「比較並交換相鄰的兩個元素」來達成排序的目的。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '沒錯。泡沫排序每次都只看相鄰的兩個元素（例如 index j 和 index j+1），如果它們的順序錯了（例如前面的比後面的大），就把它們對調。',
    points: 1
  },
  {
    id: 'bsort-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '泡沫排序是一種「穩定排序 (Stable Sort)」嗎？（穩定排序指的是：數值相同的元素，在排序後會保持原本的相對順序）',
    options: [
      { id: 'A', text: '是，因為我們只有在「嚴格大於 (>)」時才交換，相等時不交換' },
      { id: 'B', text: '否，因為元素會在陣列中不斷跳躍移動' },
      { id: 'C', text: '不一定，取決於陣列原本的資料分佈' },
      { id: 'D', text: '只有當陣列完全反向時才是穩定的' }
    ],
    correctAnswer: 'A',
    explanation: '泡沫排序是穩定的。程式碼中 `if arr[j] > arr[j + 1]` 確保了只有在左邊嚴格大於右邊時才會發生交換，遇到兩個相等的數值時它們不會交換位置，因此相對順序得以保留。',
    points: 1
  },
  {
    id: 'bsort-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '即使一個陣列已經是完全排序好的狀態，最原始的泡沫排序（未加入提早終止優化）依然會執行所有回合的比較。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '正確。未優化的泡沫排序有固定的兩層迴圈，即使陣列一開始就排好了（不會發生任何交換），它還是會傻傻地把所有比較動作做完，時間複雜度仍是 O(n²)。因此實務上通常會加入 `has_swapped` 旗標來優化。',
    points: 1
  },
  {
    id: 'bsort-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '教學區的 Python 程式碼中，用來交換兩個變數值的簡潔寫法是什麼？',
    options: [
      { id: 'A', text: 'swap(arr[j], arr[j+1])' },
      { id: 'B', text: 'arr[j], arr[j+1] = arr[j+1], arr[j]' },
      { id: 'C', text: 'arr[j] = arr[j+1]; arr[j+1] = arr[j]' },
      { id: 'D', text: 'arr.exchange(j, j+1)' }
    ],
    correctAnswer: 'B',
    explanation: 'Python 支援多重賦值 (Multiple Assignment)，`a, b = b, a` 是 Python 中非常經典且優雅的交換變數寫法，不需要額外宣告 temp 暫存變數。',
    points: 1
  },

  // 【Application 應用】 1000-1250
  {
    id: 'bsort-group-1',
    groupId: 'group-bsort-process',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title: '給定陣列 arr = [5, 1, 4, 2, 8]。執行「第一輪 (i = 0)」的完整泡沫排序後，陣列會變成什麼樣子？',
    options: [
      { id: 'A', text: '[1, 4, 2, 5, 8]' },
      { id: 'B', text: '[1, 5, 4, 2, 8]' },
      { id: 'C', text: '[1, 2, 4, 5, 8]' },
      { id: 'D', text: '[8, 5, 4, 2, 1]' }
    ],
    correctAnswer: 'A',
    explanation: '追蹤第一輪：\n5與1比 -> 交換 [1, 5, 4, 2, 8]\n5與4比 -> 交換 [1, 4, 5, 2, 8]\n5與2比 -> 交換 [1, 4, 2, 5, 8]\n5與8比 -> 不換 [1, 4, 2, 5, 8]\n此時最大的 8 已經確認在最後一個位置了。',
    points: 2
  },
  {
    id: 'bsort-group-2',
    groupId: 'group-bsort-process',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '承上題，在執行「第二輪 (i = 1)」的內層迴圈時，我們還需要去比較最後一個元素（即數值 8）嗎？',
    options: [
      { id: 'A', text: '需要，為了確保它真的是最大的' },
      { id: 'B', text: '需要，因為迴圈的設計無法略過特定元素' },
      { id: 'C', text: '不需要，因為每一輪都會將當前最大值就定位，內層比較的範圍會逐漸縮小' },
      { id: 'D', text: '不需要，因為 8 本來就是在最後面' }
    ],
    correctAnswer: 'C',
    explanation: '泡沫排序每一輪結束時，都會有一個最大值「浮」到正確的位置。因此第二輪時，最後一個元素已經是全陣列最大，不需要再被比較。這反映在程式碼 `range(n - 1 - i)` 中，每次比較的長度都會減 1。',
    points: 2
  },
  {
    id: 'bsort-q8',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '對於長度為 n 的陣列，簡化版泡沫排序的外層迴圈 `for i in range(n - 1)` 最多會執行幾次？',
    options: [
      { id: 'A', text: 'n 次' },
      { id: 'B', text: 'n - 1 次' },
      { id: 'C', text: 'n / 2 次' },
      { id: 'D', text: 'n² 次' }
    ],
    correctAnswer: 'B',
    explanation: '外層迴圈控制「回合數」。對於 n 個元素，最多只需要 n - 1 輪：每一輪至少確認一個最大值就位，經過 n - 1 輪後前 n - 1 個元素都排好，剩下最後一個自然也在正確位置，不需要第 n 輪。`range(n - 1)` 即對應此邏輯。',
    points: 2
  },
  {
    id: 'bsort-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '為什麼教學區的優化版泡沫排序要加入 `has_swapped = False` 這個變數？',
    options: [
      { id: 'A', text: '為了追蹤總共交換了幾次，方便計算效能' },
      { id: 'B', text: '這是一個語法要求，否則會報錯' },
      { id: 'C', text: '用來檢查某一輪中是否發生過交換。如果一整輪都沒交換，代表陣列已完全排序，可以提早結束迴圈 (Break)' },
      { id: 'D', text: '用來防止出現無限迴圈' }
    ],
    correctAnswer: 'C',
    explanation: '這是泡沫排序最常見的優化 (Early Optimization)。如果某一整輪從頭比到尾都沒有發生任何交換，就意味著所有的相鄰元素都已經符合大小關係，陣列已經排序完成，可以直接 Break 省下後續不必要的比較。',
    points: 2
  },
  {
    id: 'bsort-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '加入「提前終止 (has_swapped)」優化後，泡沫排序的「最佳情況 (Best Case)」時間複雜度會變成多少？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(n²)' }
    ],
    correctAnswer: 'C',
    explanation: '當陣列已經是排序好的狀態時（最佳情況），優化版的演算法只需要跑完「第一輪」的比較（共 n-1 次），發現 `has_swapped` 仍是 False，就會立刻結束。因此最佳時間複雜度為 O(n)。',
    points: 2
  },
  {
    id: 'bsort-q9',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '若將泡沫排序的比較條件由「嚴格大於 (`arr[j] > arr[j+1]`)」改為「大於等於 (`arr[j] >= arr[j+1]`)」，會對演算法產生什麼影響？',
    options: [
      { id: 'A', text: '排序速度變快，因為交換次數增加' },
      { id: 'B', text: '排序結果不變，但演算法將失去「穩定排序 (Stable Sort)」的特性' },
      { id: 'C', text: '會導致程式進入無限迴圈' },
      { id: 'D', text: '不會有任何影響，穩定性與結果皆相同' }
    ],
    correctAnswer: 'B',
    explanation: '改為 >= 後，當兩個相等的元素相鄰時也會執行交換。例如 [2a, 2b]（相同數值，a 原本在 b 前），使用 >= 會將它們對調，破壞原始相對順序。泡沫排序的穩定性正是依賴「只有嚴格大於 (>) 才交換」這個條件，改成 >= 即失去穩定性。',
    points: 2
  },
  {
    id: 'bsort-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '關於泡沫排序的複雜度，以下哪些敘述是正確的？（多選）',
    options: [
      { id: 'opt1', text: '最壞情況時間複雜度為 O(n²)' },
      { id: 'opt2', text: '平均情況時間複雜度為 O(n²)' },
      { id: 'opt3', text: '空間複雜度為 O(1)（In-place 排序）' },
      { id: 'opt4', text: '空間複雜度為 O(n)，因為需要額外的陣列來暫存交換的元素' }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt3'],
    explanation: '泡沫排序需要雙層迴圈，平均和最壞情況（如反向排序）都需要 O(n²) 的時間。但因為它直接在原陣列上交換元素，只需極少數變數（如 temp, swapped），因此空間複雜度為 O(1)，屬於 In-place 排序 (opt4 錯誤)。',
    points: 2
  },
  {
    id: 'bsort-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title: '如果一個長度為 5 的陣列 arr = [5, 4, 3, 2, 1]（完全反向排序），使用泡沫排序將其排為遞增，總共會發生幾次「交換 (Swap)」？',
    options: [
      { id: 'A', text: '5 次' },
      { id: 'B', text: '10 次' },
      { id: 'C', text: '15 次' },
      { id: 'D', text: '20 次' }
    ],
    correctAnswer: 'B',
    explanation: '完全反向時是泡沫排序的最壞情況，每相鄰的一對都需要交換。公式為 n(n-1)/2。所以長度 5 的陣列需要交換 5*4/2 = 10 次。',
    points: 2
  },

  // 【Complexity 進階/複雜度】 1300-1500
  {
    id: 'bsort-group-3',
    groupId: 'group-bsort-process',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title: '請填入優化版泡沫排序中 (a)(b)(c) 處缺失的「旗標變數」名稱（注意拼字）。',
    code: bsortOptimizedFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['has_swapped', 'has_swapped', 'has_swapped'],
    explanation: '(a) 每一輪開始前，必須將 has_swapped 重置為 False。(b) 如果在這輪中發生了任何一次交換，就將其設為 True。(c) 一輪結束後檢查，如果 not has_swapped（即整輪都沒交換），就代表陣列已排序完畢，可以 break。',
    points: 5
  },
  {
    id: 'bsort-q7',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: '在泡沫排序中，內層迴圈的範圍通常寫為 `for j in range(n - 1 - i)`（i 為當前輪數）。為什麼要減去 `i`？',
    options: [
      { id: 'A', text: '因為前 i 個元素已經排好了，不需要再比' },
      { id: 'B', text: '因為後 i 個元素已經是最大的並排在正確位置上了，不需要再比' },
      { id: 'C', text: '為了避免索引越界 (Index Out of Bounds)' },
      { id: 'D', text: '只是一個編程習慣，減不減 i 效能都一樣' }
    ],
    correctAnswer: 'B',
    explanation: '每一輪泡沫排序都會把當前未排序部分的最大值推到最後面。經過 i 輪後，最後面就有 i 個元素是已經確認排序好的最大值，所以內層迴圈的比較範圍可以縮小，減去 i 能顯著減少不必要的比較，提升效能。',
    points: 2
  },
  {
    id: 'bsort-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '在實務的軟體開發中，我們通常不會使用泡沫排序法來處理大量資料。主要原因有哪些？（多選）',
    options: [
      { id: 'opt1', text: '因為 O(n²) 的時間複雜度，在資料量龐大時效率極低' },
      { id: 'opt2', text: '因為頻繁地在記憶體中進行相鄰元素的讀寫與交換，常數時間消耗大' },
      { id: 'opt3', text: '因為泡沫排序是一種不穩定的排序演算法' },
      { id: 'opt4', text: '因為多數語言內建的排序演算法（如 Python 的 Timsort，Java 的 Dual-Pivot Quicksort）效率遠高於泡沫排序' }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt4'],
    explanation: '泡沫排序是穩定的，所以 opt3 是錯的。它被淘汰的主因是 O(n²) 實在太慢了 (opt1 正確)，而且一直做無謂的相鄰交換操作很耗效能 (opt2 正確)。實務上我們都直接使用語言內建的 O(n log n) 演算法 (opt4 正確)。泡沫排序主要用於教學目的。',
    points: 2
  },
  {
    id: 'bsort-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title: '這是一個想要實作「遞減」排序（把最小的浮到最後面）的泡沫排序。請填入正確的比較運算子及變數，使其邏輯正確。',
    code: bsortDescFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['<', 'arr[j]', 'arr'],
    explanation: '(a) 要改成遞減排序，就必須把「較小」的數字往後推。如果左邊小於右邊，順序就錯了，需要交換，所以填 `<`。(b) Python 多重賦值的對應項，右側應為 `arr[j]`。(c) 排序完成後回傳陣列 `arr`。',
    points: 5
  },
  {
    id: 'bsort-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title: '給定已排序陣列 collection = [1, 2]，呼叫下方優化版 bubble_sort([1, 2])。請依序填寫執行的行號序列（空格分隔）。',
    code: bsortPredictCode,
    language: 'python',
    options: [],
    correctAnswer: '1 2 3 4 5 6 7 6 10 11 12',
    explanation: '長度為 2 (L2)。進外圈第0輪(L3)，初始False(L4)，範圍1(L5)。進內圈(L6)，比較 1 > 2 為假(L7)。內圈結束返回for(L6)。檢查提早結束 not False(L10)。觸發 Break 中斷外圈(L11)。回傳結果(L12)。',
    points: 5
  }
];

export const bubbleSortQuiz: PracticeQuiz = {
  levelId: 'bubble-sort',
  levelName: '泡沫排序 (Bubble Sort)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-bsort-process',
      title: '題組：泡沫排序的單輪過程',
      description: '泡沫排序的核心機制是透過不斷比較並交換相鄰元素，每一輪 (Round) 都能將該輪最大（或最小）的元素「浮」到陣列的末端。請觀察這段過程並回答問題。',
      code: bsortSimplifiedCode,
      language: 'python',
      questionIds: ['bsort-group-1', 'bsort-group-2', 'bsort-group-3']
    }
  ]
};
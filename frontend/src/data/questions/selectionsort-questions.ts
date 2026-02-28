import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

const ssortSimplifiedCode = `def find_min_and_swap(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        # 執行交換
        arr[i], arr[min_idx] = arr[min_idx], arr[i]`;

const ssortFillCode = `def selection_sort(collection):
    total_items = len(collection)
    for current_pos in range(total_items - 1):
        min_pos = (a)
        for scan_pos in range(current_pos + 1, total_items):
            if collection[scan_pos] < collection[min_pos]:
                min_pos = (b)
        if min_pos != (c):
            collection[current_pos], collection[min_pos] = collection[min_pos], collection[current_pos]`;

const ssortPredictCode = `def selection_sort(collection):           # L1
    total_items = len(collection)                      # L2
    for current_pos in range(total_items - 1):         # L3
        min_pos = current_pos                          # L4
        for scan_pos in range(current_pos + 1, total_items): # L5
            scan_val = collection[scan_pos]            # L6
            min_val = collection[min_pos]              # L7
            if scan_val < min_val:                     # L8
                min_pos = scan_pos                     # L9
        if min_pos != current_pos:                     # L10
            collection[current_pos], collection[min_pos] = collection[min_pos], collection[current_pos] # L11
    return collection                                  # L12`;

const questions: Question[] = [
  // 【Basic 基礎】 800-950
  {
    id: 'ssort-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '選擇排序 (Selection Sort) 的核心運作機制為何？',
    options: [
      { id: 'A', text: '不斷比較相鄰元素並交換' },
      { id: 'B', text: '每一輪從未排序部分挑選出最小值，放到已排序部分的末尾' },
      { id: 'C', text: '將陣列分成兩半，分別排序後再合併' },
      { id: 'D', text: '利用雜湊函數將元素放入正確的桶子中' }
    ],
    correctAnswer: 'B',
    explanation: '選擇排序每一輪都會掃描未排序區域來「選擇」一個最小值，然後與該區域的第一個元素進行交換。',
    points: 1
  },
  {
    id: 'ssort-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: '在選擇排序中，每一輪排序「最多」只會發生一次元素交換 (Swap)？',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '正確。每一輪會在掃描完所有未排序元素後，確定了最終的 `min_pos`，才進行一次交換。這與泡沫排序頻繁的相鄰交換不同。',
    points: 1
  },
  {
    id: 'ssort-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '與泡沫排序 (Bubble Sort) 相比，選擇排序主要的優點是什麼？',
    options: [
      { id: 'A', text: '它是穩定的排序演算法' },
      { id: 'B', text: '它的平均時間複雜度更優' },
      { id: 'C', text: '它減少了不必要的「交換 (Swap)」操作' },
      { id: 'D', text: '它可以處理鏈結串列 (Linked List)' }
    ],
    correctAnswer: 'C',
    explanation: '選擇排序雖然比較次數與泡沫排序相當，但交換次數顯著減少（每輪最多一次），這在交換成本很高的場景下較具優勢。',
    points: 1
  },
  {
    id: 'ssort-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '即使輸入的陣列已經完全排序好了，選擇排序依然會執行所有回合的比較。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '正確。選擇排序的機制是「找最小值」，它無法在掃描過程中提早知道剩下的元素是否已排序，因此其最佳情況的時間複雜度仍是 O(n²)。',
    points: 1
  },
  {
    id: 'ssort-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '一個長度為 n 的陣列，在選擇排序完全結束後，總共會執行幾輪 (Rounds) 外部迴圈？',
    options: [
      { id: 'A', text: 'n 輪' },
      { id: 'B', text: 'n - 1 輪' },
      { id: 'C', text: 'log n 輪' },
      { id: 'D', text: '1 輪' }
    ],
    correctAnswer: 'B',
    explanation: '因為當前 n-1 個元素都已經就定位後，最後一個元素自然也會在正確位置上，所以只需進行 n-1 輪。',
    points: 1
  },

  // 【Application 應用】 1000-1250
  {
    id: 'ssort-group-1',
    groupId: 'group-ssort-logic',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title: '給定陣列 arr = [29, 10, 14, 37, 13]。執行「第一輪」選擇排序（i=0）後，陣列內容為何？',
    options: [
      { id: 'A', text: '[10, 29, 14, 37, 13]' },
      { id: 'B', text: '[10, 14, 29, 37, 13]' },
      { id: 'C', text: '[10, 13, 14, 29, 37]' },
      { id: 'D', text: '[29, 10, 14, 13, 37]' }
    ],
    correctAnswer: 'A',
    explanation: '未排序部分為 [29, 10, 14, 37, 13]，最小值為 10（Index 1）。將 10 與 Index 0 的 29 交換，結果為 [10, 29, 14, 37, 13]。',
    points: 2
  },
  {
    id: 'ssort-q8',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '在選擇排序的每一輪開始時，為什麼要將 `min_idx` 初始設為 `i`（目前輪次的起始位置）？',
    options: [
      { id: 'A', text: '因為 i 是全陣列最小值的位置' },
      { id: 'B', text: '先假設未排序區的第一個元素就是最小值，若後續掃描發現更小的才更新' },
      { id: 'C', text: '為了確保內層迴圈從 i+1 開始掃描' },
      { id: 'D', text: '這是一個語法上的要求，沒有邏輯意義' }
    ],
    correctAnswer: 'B',
    explanation: '`min_idx = i` 相當於「暫時假設第 i 個位置的元素是最小的」。內層迴圈從 i+1 開始往後掃描，每當遇到比 `collection[min_idx]` 更小的元素，就更新 `min_idx`。掃描完畢後，`min_idx` 才是確定的最小值位置。',
    points: 2
  },
  {
    id: 'ssort-group-2',
    groupId: 'group-ssort-logic',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '承上題，在執行「第二輪」排序（i=1）時，掃描範圍（scan_pos）是從哪裡開始到哪裡結束？',
    options: [
      { id: 'A', text: 'Index 0 到 4' },
      { id: 'B', text: 'Index 1 到 4' },
      { id: 'C', text: 'Index 2 到 4' },
      { id: 'D', text: 'Index 2 到 3' }
    ],
    correctAnswer: 'C',
    explanation: '第二輪時 i=1，`min_idx` 初始設為 1。內層迴圈從 `i + 1` 開始，也就是 Index 2，一路掃描到最後一個元素 Index 4。',
    points: 2
  },
  {
    id: 'ssort-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '選擇排序在處理「完全反向」的數列時，其時間複雜度為何？',
    options: [
      { id: 'A', text: 'O(n)' },
      { id: 'B', text: 'O(n log n)' },
      { id: 'C', text: 'O(n²)' },
      { id: 'D', text: 'O(1)' }
    ],
    correctAnswer: 'C',
    explanation: '選擇排序無論初始資料分佈如何，比較的次數都是固定的 n(n-1)/2 次，因此時間複雜度恆為 O(n²)。',
    points: 1
  },
  {
    id: 'ssort-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '如果在內層迴圈判斷式改為 `if arr[j] > arr[min_idx]`，最後排序結果會變成？',
    options: [
      { id: 'A', text: '依然是遞增排序' },
      { id: 'B', text: '變成遞減排序' },
      { id: 'C', text: '完全不排序' },
      { id: 'D', text: '會拋出程式錯誤' }
    ],
    correctAnswer: 'B',
    explanation: '條件改為大於，意味著每一輪會挑選出「最大值」放到最前面，因此會變成遞減排序。',
    points: 1
  },
  {
    id: 'ssort-q9',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '對於長度為 n 的陣列，選擇排序執行完 n-1 輪後，為什麼不需要對最後剩下的一個元素單獨處理？',
    options: [
      { id: 'A', text: '因為最後一個元素一定是最大值' },
      { id: 'B', text: '因為前 n-1 個元素都已各自就定位，剩下那個元素邏輯上也只能在正確位置' },
      { id: 'C', text: '因為 range(n-1) 最後一輪會自動處理最後一個元素' },
      { id: 'D', text: '這是一個設計缺陷，實際上可能會漏掉最後一個元素' }
    ],
    correctAnswer: 'B',
    explanation: '每一輪選擇排序都能確保一個最小值就位。n-1 輪後，前 n-1 個位置都已放入正確的值，整個陣列只剩最後一個元素沒有被「選擇」到，但其他位置都已填好，它唯一可能出現的位置就是最末端，因此自然就定位了。',
    points: 2
  },
  {
    id: 'ssort-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '以下關於選擇排序複雜度的敘述，哪些是正確的？（多選）',
    options: [
      { id: 'opt1', text: '最佳情況時間複雜度為 O(n²)' },
      { id: 'opt2', text: '空間複雜度為 O(1)' },
      { id: 'opt3', text: '最壞情況交換次數為 O(n)' },
      { id: 'opt4', text: '最壞情況時間複雜度為 O(n log n)' }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt3'],
    explanation: '選擇排序時間複雜度恆為 O(n²)。它是原地排序，空間 O(1)。交換次數每一輪最多一次，共 n-1 次，所以是 O(n)。',
    points: 2
  },
  {
    id: 'ssort-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title: '選擇排序通常被認為是「不穩定」的排序演算法，其主要原因是什麼？',
    options: [
      { id: 'A', text: '因為它包含兩層迴圈' },
      { id: 'B', text: '因為長距離的交換可能會改變相同數值元素的相對順序' },
      { id: 'C', text: '因為它無法提早結束' },
      { id: 'D', text: '因為它需要額外的輔助空間' }
    ],
    correctAnswer: 'B',
    explanation: '例如 [5, 5*, 2]，第一輪會把 2 與第一個 5 交換，變成 [2, 5*, 5]，原本在前的 5 跑到了 5* 後面，穩定的相對關係被破壞了。',
    points: 2
  },

  // 【Complexity 進階/複雜度】 1300-1500
  {
    id: 'ssort-group-3',
    groupId: 'group-ssort-logic',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title: '請填入下方選擇排序實作中 (a)(b)(c) 缺失的變數名稱（請注意代碼邏輯）。',
    code: ssortFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['current_pos', 'scan_pos', 'current_pos'],
    explanation: '(a) 每一輪掃描前，先假設「目前第一個位置」就是最小值。(b) 發現更小的值時，更新最小值的索引位置為 scan_pos。(c) 只有當最小值位置不在原處時，才執行交換。',
    points: 5
  },
  {
    id: 'ssort-q7',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: '選擇排序的「比較次數」是否會隨著陣列的原始排序狀態而改變？',
    options: [
      { id: 'A', text: '會，已排序好的陣列比較次數較少' },
      { id: 'B', text: '會，完全反向的陣列比較次數較多' },
      { id: 'C', text: '不會，無論資料為何，比較次數固定' },
      { id: 'D', text: '只有在資料量大於 100 時才會改變' }
    ],
    correctAnswer: 'C',
    explanation: '選擇排序沒有任何提早結束的判斷邏輯，兩層迴圈的次數是硬性規定的，因此比較次數始終是 n(n-1)/2 次。',
    points: 2
  },
  {
    id: 'ssort-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '在何種情況下，選擇排序可能比泡沫排序更合適？（多選）',
    options: [
      { id: 'opt1', text: '當記憶體寫入操作 (Swap) 的代價遠高於讀取操作時' },
      { id: 'opt2', text: '當我們需要保證演算法是穩定排序時' },
      { id: 'opt3', text: '當資料量極小，且我們偏好減少交換次數時' },
      { id: 'opt4', text: '當陣列已經接近排序完成時' }
    ],
    correctAnswer: ['opt1', 'opt3'],
    explanation: '選擇排序最大的特點就是交換次數少（O(n)），如果硬體交換成本很高，它比泡沫排序 (O(n²)) 好。但它是不穩定的，且對於接近排序完成的資料，其效率不如優化後的泡沫排序。',
    points: 2
  },
  {
    id: 'ssort-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title: '以下程式碼嘗試在「一輪掃描」中同時找最大值與最小值（雙向選擇排序）。請填入缺失的部分。',
    code: `def double_selection_sort(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        min_idx = max_idx = left
        for i in range(left + 1, right + 1):
            if arr[i] < arr[min_idx]: min_idx = (a)
            if arr[i] > arr[max_idx]: max_idx = (b)
        arr[left], arr[min_idx] = arr[min_idx], arr[left]
        # 注意：如果 left 剛好是最大值，交換後最大值位置會變到 min_idx
        if max_idx == left: max_idx = (c)
        arr[right], arr[max_idx] = arr[max_idx], arr[right]
        left += 1; right -= 1`,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['i', 'i', 'min_idx'],
    explanation: '(a)(b) 記錄新的極值索引。(c) 這是一個經典陷阱：如果原本的 left 是最大值，經過與 min_idx 交換後，最大值已經搬到 min_idx 了，後續交換 right 必須使用修正後的索引。',
    points: 5
  },
  {
    id: 'ssort-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title: '給定 collection = [2, 1, 3]，執行 selection_sort([2, 1, 3])。請填寫經過的行號序列（以空格分隔）。',
    code: ssortPredictCode,
    language: 'python',
    options: [],
    correctAnswer: '1 2 3 4 5 6 7 8 9 5 6 7 8 10 11 3 4 5 6 7 8 10 12',
    explanation: '第一輪(pos=0)：找最小值1，發生交換(L10,L11)。第二輪(pos=1)：掃描Index 2(值3)，不比2小，不發生交換(L11跳過)。最後回傳(L12)。',
    points: 5
  }
];

export const selectionSortQuiz: PracticeQuiz = {
  levelId: 'selection-sort',
  levelName: '選擇排序 (Selection Sort)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-ssort-logic',
      title: '題組：選擇排序的最小化邏輯',
      description: '選擇排序透過記錄索引來減少實體交換的次數。請觀察其索引更新的時機與判斷條件。',
      code: ssortSimplifiedCode,
      language: 'python',
      questionIds: ['ssort-group-1', 'ssort-group-2', 'ssort-group-3']
    }
  ]
};
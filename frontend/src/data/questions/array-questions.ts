import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

// 1. 倉庫管理完整實作 (用於題組顯示)
const warehouseCode = `class Warehouse:
    def __init__(self):
        self.inventory = []  # 儲存商品 ID 的陣列

    def add_item(self, index, item_id):
        """在指定位置插入商品（手動位移實作）"""
        n = len(self.inventory)
        self.inventory.append(None)    # 擴展一格
        i = n
        while i > index:
            self.inventory[i] = self.inventory[i - 1]
            i -= 1
        self.inventory[index] = item_id

    def remove_item(self, index):
        """移除指定位置的商品（手動位移實作）"""
        n = len(self.inventory)
        for i in range(index, n - 1):
            self.inventory[i] = self.inventory[i + 1]
        self.inventory.pop()

    def find_item(self, item_id):
        """線性搜尋，回傳 index；找不到回傳 -1"""
        for i in range(len(self.inventory)):
            if self.inventory[i] == item_id:
                return i
        return -1`;

// 2. 倉庫管理 Fill-code 版本
const warehouseFillCode = `def add_item(self, index, item_id):
    n = len(self.inventory)
    self.inventory.append((a))    # 擴展一格空間（預留位置）
    i = n
    while i > (b):                # 需要移動的條件
        self.inventory[i] = self.inventory[(c)]  # 向右移動
        i -= 1
    self.inventory[index] = item_id`;

// 3. 教學區 Array 實作 (用於 predict-line)
const arrayPredictCode = `class Array:                                     # L1
    def search(self, target):                    # L2
        for i in range(len(self.arr)):           # L3
            if self.arr[i] == target:            # L4
                return i                          # L5
        return -1                                # L6
                                                 # L7
    def update(self, index, value):              # L8
        if index < 0 or index >= len(self.arr): # L9
            raise IndexError("Index out of bounds") # L10
        self.arr[index] = value                  # L11
                                                 # L12
    def insert(self, index, value):              # L13
        # Python's list.insert handles shifting  # L14
        self.arr.insert(index, value)            # L15
                                                 # L16
    def delete(self, index):                     # L17
        # Python's list.pop handles shifting     # L18
        self.arr.pop(index)                      # L19`;

// 4. 通用刪除實作 Fill-code
const arrayDeleteFillCode = `def delete_at(arr, index):
    n = len(arr)
    for i in range(index, (a)):    # 左移的迴圈範圍
        arr[i] = arr[(b)]           # 將右側元素左移
    arr.(c)()                       # 移除末端多餘的位置`;

// --- 題目定義 ---

const questions: Question[] = [
  // 【Basic】 800-950
  {
    id: 'array-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '陣列 (Array) 將資料儲存在連續的記憶體空間，因此可以透過 Index 直接計算任意元素的記憶體位址，實現 O(1) 的隨機存取。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '陣列的記憶體位址公式為：base_address + index × element_size。因為記憶體連續，可以直接計算位址而不需遍歷。',
    points: 1
  },
  {
    id: 'array-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: 'Python 陣列（List）的索引是從哪個數字開始的？',
    options: [
      { id: 'A', text: '0（Zero-indexed）' },
      { id: 'B', text: '1' },
      { id: 'C', text: '-1' },
      { id: 'D', text: '視陣列大小而定' }
    ],
    correctAnswer: 'A',
    explanation: 'Python 使用零索引，第一個元素為 arr[0]，有效範圍為 0 到 n-1。',
    points: 1
  },
  {
    id: 'array-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: '在陣列中，透過 Index 直接存取元素（如 arr[3]）的時間複雜度是多少？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(n²)' }
    ],
    correctAnswer: 'A',
    explanation: '隨機存取 (Random Access) 是陣列的核心優勢，根據公式直接計算位址，時間複雜度為 O(1)。',
    points: 1
  },
  {
    id: 'array-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '以下哪個陣列操作在最壞情況下時間複雜度最高？',
    options: [
      { id: 'A', text: '透過 Index 讀取元素' },
      { id: 'B', text: '在陣列末端新增元素' },
      { id: 'C', text: '在陣列首端(Index 0)新增元素' },
      { id: 'D', text: '修改已知 Index 的元素值' }
    ],
    correctAnswer: 'C',
    explanation: '首端插入需將插入點後的所有元素右移，需搬動 n 個元素，複雜度為 O(n)。',
    points: 1
  },
  {
    id: 'array-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '在一個有 n 個元素的陣列中，於 Index 0 插入一個新元素，需要移動全部 n 個現有元素。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '在首端插入是陣列最昂貴的操作之一，必須先清出空間，導致所有後續元素都必須位移。',
    points: 1
  },

  // 【Application】 1000-1200
  {
    id: 'array-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title: '給定 arr = [5, 3, 8, 1, 9]，執行 arr[2] 的回傳值是多少？',
    options: [{ id: 'A', text: '3' }, { id: 'B', text: '8' }, { id: 'C', text: '1' }, { id: 'D', text: '2' }],
    correctAnswer: 'B',
    explanation: '索引追蹤：arr[0]=5, arr[1]=3, arr[2]=8。',
    points: 1
  },
  {
    id: 'array-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: 'arr = [10, 20, 30, 40]，在 Index 2 插入數值 25 後，arr[3] 的值是多少？',
    options: [{ id: 'A', text: '20' }, { id: 'B', text: '25' }, { id: 'C', text: '30' }, { id: 'D', text: '40' }],
    correctAnswer: 'C',
    explanation: '插入後變為 [10, 20, 25, 30, 40]，原本在 index 2 的 30 被擠到了 index 3。',
    points: 1
  },
  {
    id: 'array-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: 'arr = [10, 20, 30, 40, 50]，刪除 Index 1（值為 20）後，陣列內容為何？',
    options: [
      { id: 'A', text: '[20, 30, 40, 50]' },
      { id: 'B', text: '[10, 30, 40, 50]' },
      { id: 'C', text: '[10, 20, 40, 50]' },
      { id: 'D', text: '[10, 20, 30, 50]' }
    ],
    correctAnswer: 'B',
    explanation: '刪除 20 後，後方的 30, 40, 50 分別向左遞補一個位置。',
    points: 1
  },
  {
    id: 'array-q7',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '對 arr = [1, 2, 3, 4, 5] 依序執行：del arr[2]、arr.insert(1, 10)、del arr[0]。最終 arr 的長度是多少？',
    options: [{ id: 'A', text: '3' }, { id: 'B', text: '4' }, { id: 'C', text: '5' }, { id: 'D', text: '6' }],
    correctAnswer: 'B',
    explanation: '步驟：[1,2,3,4,5] -> [1,2,4,5] -> [1,10,2,4,5] -> [10,2,4,5]。長度從 5 變為 4。',
    points: 2
  },
  {
    id: 'array-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '以下哪些操作在 Python List 中時間複雜度為 O(1)？（多選）',
    options: [
      { id: 'opt1', text: 'arr[i]（透過 Index 存取）' },
      { id: 'opt2', text: 'arr.append(val)（在末端新增）' },
      { id: 'opt3', text: 'arr.insert(0, val)（在首端插入）' },
      { id: 'opt4', text: 'del arr[0]（刪除首端）' }
    ],
    correctAnswer: ['opt1', 'opt2'],
    explanation: '隨機存取與末端新增皆為 O(1)；但任何涉及首端的操作都需要位移全部元素，為 O(n)。',
    points: 2
  },
  {
    id: 'array-q8',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '在需要頻繁於「中間插入或刪除」元素的場景，相較於 Array，哪個資料結構通常效能更好？',
    options: [
      { id: 'A', text: 'Linked List（鏈結串列）' },
      { id: 'B', text: 'Stack（堆疊）' },
      { id: 'C', text: 'Queue（佇列）' },
      { id: 'D', text: 'Hash Table' }
    ],
    correctAnswer: 'A',
    explanation: 'Linked List 只需修改指標即可完成中間操作 (O(1))，不需搬移資料，在已知位置時比陣列快。',
    points: 1
  },
  {
    id: 'array-group-1',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    groupId: 'group-array-inventory',
    title: '假設 warehouse.inventory = [101, 102, 103, 104]，執行 add_item(2, 105) 後，inventory[3] 的值是多少？',
    options: [{ id: 'A', text: '102' }, { id: 'B', text: '103' }, { id: 'C', text: '104' }, { id: 'D', text: '105' }],
    correctAnswer: 'B',
    explanation: 'index 2 插入 105，導致原本 index 2 的 103 右移至 index 3。',
    points: 2
  },
  {
    id: 'array-group-2',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    groupId: 'group-array-inventory',
    title: '承上題，inventory = [101, 102, 105, 103, 104]。執行 remove_item(4) 後，再執行 find_item(105)，回傳值是多少？',
    options: [{ id: 'A', text: '1' }, { id: 'B', text: '2' }, { id: 'C', text: '3' }, { id: 'D', text: '-1' }],
    correctAnswer: 'B',
    explanation: '刪除末端 104 不影響 105 的位置，105 依然位在 index 2。',
    points: 2
  },

  // 【Complexity】 1250-1500
  {
    id: 'array-q9',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1250,
    title: '對於大小為 n 的陣列，以下哪項複雜度分析完全正確？',
    options: [
      { id: 'A', text: '存取 O(1)、線性搜尋 O(n)、在 index 0 插入 O(n)' },
      { id: 'B', text: '存取 O(n)、線性搜尋 O(n)、插入 O(1)' },
      { id: 'C', text: '存取 O(1)、線性搜尋 O(log n)、插入 O(1)' },
      { id: 'D', text: '存取 O(1)、線性搜尋 O(1)、插入 O(1)' }
    ],
    correctAnswer: 'A',
    explanation: '陣列強於隨機存取 (O(1))，但弱於搜尋與非末端的插入/刪除 (O(n))。',
    points: 2
  },
  {
    id: 'array-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: '以下關於 Array 特性的敘述，哪些是正確的？（多選）',
    options: [
      { id: 'opt1', text: '支援隨機存取 (Random Access)，時間複雜度 O(1)' },
      { id: 'opt2', text: '在任意位置插入元素時，插入點之後的元素需向右移動' },
      { id: 'opt3', text: '陣列元素在記憶體中必須連續存放' },
      { id: 'opt4', text: '在陣列頭部插入與在尾部插入的時間複雜度相同' }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt3'],
    explanation: '頭部插入 (O(n)) 與尾部插入 (O(1)) 的複雜度不同。',
    points: 2
  },
  {
    id: 'array-group-3',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    groupId: 'group-array-inventory',
    title: '請填入 add_item 方法中 (a)(b)(c) 處缺失的程式碼，使其邏輯正確（注意 Python 語法與大小寫）。',
    code: warehouseFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['None', 'index', 'i - 1'],
    explanation: 'append(None) 預留空間；while i > index 確保只移動插入點後的元素；i-1 是將左側值搬到右側。',
    points: 5
  },
  {
    id: 'array-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '請填入下方 delete_at 函數中 (a)(b)(c) 處缺失的程式碼，使其正確實作「刪除並左移」。',
    code: arrayDeleteFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['n - 1', 'i + 1', 'pop'],
    explanation: '左移範圍至 n-1；複製右側 i+1 的值；最後 pop() 移除末端多餘空間。',
    points: 5
  },
  {
    id: 'array-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title: '給定 arr 物件，其 arr.arr = [10, 30]（共 2 個元素），接著執行 arr.search(5)（搜尋不存在的元素）。請依序填寫 search() 方法執行時，經過的行號序列（以空格分隔）。',
    code: arrayPredictCode,
    language: 'python',
    options: [],
    correctAnswer: '2 3 4 3 4 6',
    explanation: '執行流程如下：\n1. 進入 search 方法 (L2)\n2. for 迴圈開始，i=0 (L3)\n3. 判斷 arr[0]=10 是否等於 5？不等於，繼續 (L4)\n4. for 迴圈下一輪，i=1 (L3)\n5. 判斷 arr[1]=30 是否等於 5？不等於，繼續 (L4)\n6. 迴圈結束（range(2) 已耗盡），執行 return -1 (L6)\n注意：L5 從未執行（if 條件始終為 False）。',
    points: 5
  }
];

export const arrayQuiz: PracticeQuiz = {
  levelId: 'array',
  levelName: '陣列 (Array)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-array-inventory',
      title: '題組：倉庫存貨管理系統',
      description: '某倉庫使用陣列 (Array) 管理商品 ID 列表，並自行實作元素位移邏輯，以呈現陣列操作的底層行為。請參考下方程式碼回答問題。',
      code: warehouseCode,
      language: 'python',
      questionIds: ['array-group-1', 'array-group-2', 'array-group-3']
    }
  ]
};
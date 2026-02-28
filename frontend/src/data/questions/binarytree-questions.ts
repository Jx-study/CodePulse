import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

// 1. 廣度優先搜尋 (BFS) 完整實作 (用於題組顯示)
const bfsCode = `def bfs(root):
    queue = [root]
    while queue:
        node = queue.pop(0)
        visit(node)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)`;

// 2. 廣度優先搜尋 (BFS) Fill-code 版本
const bfsFillCode = `def bfs(root):
    queue = [(a)]
    while (b):
        node = queue.(c)
        visit(node)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)`;

// 3. 中序遍歷 (Inorder) Fill-code 版本
const inorderFillCode = `def inorder(node):
    if not (a): return
    inorder((b))
    visit((c))
    inorder(node.right)`;

// 4. 前序遍歷 (Preorder) 實作 (用於 predict-line，含行號)
const preorderPredictCode = `class BinaryTree:
    def preorder(node):                  # L1
        if not node: return              # L2
        visit(node)                      # L3
        preorder(node.left)              # L4
        preorder(node.right)             # L5`;

// --- 題目定義 ---

const questions: Question[] = [
  // 【Basic 基礎】 800-950
  {
    id: 'bt-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '在二元樹 (Binary Tree) 中，每個節點最多只能有兩個子節點（通常稱為左子節點與右子節點）。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '這是二元樹的最基本定義。一個節點可以有 0 個、1 個或 2 個子節點，但絕對不能超過 2 個。',
    points: 1
  },
  {
    id: 'bt-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '二元樹的「前序遍歷 (Preorder Traversal)」是指依照什麼順序訪問節點？',
    options: [
      { id: 'A', text: '根節點 -> 左子樹 -> 右子樹' },
      { id: 'B', text: '左子樹 -> 根節點 -> 右子樹' },
      { id: 'C', text: '左子樹 -> 右子樹 -> 根節點' },
      { id: 'D', text: '逐層由上而下訪問' }
    ],
    correctAnswer: 'A',
    explanation: '前序 (Pre-order) 的 "Pre" 代表「根節點」最先被訪問，接著才遞迴訪問左子樹與右子樹。',
    points: 1
  },
  {
    id: 'bt-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: '二元樹的「中序遍歷 (Inorder Traversal)」是指依照什麼順序訪問節點？',
    options: [
      { id: 'A', text: '根節點 -> 左子樹 -> 右子樹' },
      { id: 'B', text: '左子樹 -> 根節點 -> 右子樹' },
      { id: 'C', text: '左子樹 -> 右子樹 -> 根節點' },
      { id: 'D', text: '右子樹 -> 左子樹 -> 根節點' }
    ],
    correctAnswer: 'B',
    explanation: '中序 (In-order) 的 "In" 代表「根節點」在中間被訪問，順序為：左 -> 根 -> 右。在二元搜尋樹 (BST) 中，中序遍歷會由小到大印出所有節點。',
    points: 1
  },
  {
    id: 'bt-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '二元樹的「後序遍歷 (Postorder Traversal)」是指依照什麼順序訪問節點？',
    options: [
      { id: 'A', text: '根節點 -> 左子樹 -> 右子樹' },
      { id: 'B', text: '左子樹 -> 根節點 -> 右子樹' },
      { id: 'C', text: '左子樹 -> 右子樹 -> 根節點' },
      { id: 'D', text: '右子樹 -> 根節點 -> 左子樹' }
    ],
    correctAnswer: 'C',
    explanation: '後序 (Post-order) 的 "Post" 代表「根節點」最後被訪問，必須先處理完左右子樹。',
    points: 1
  },
  {
    id: 'bt-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '廣度優先搜尋 (BFS / 層序遍歷) 會保證靠近根節點的層級被優先訪問，然後才訪問更深層的節點。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: 'BFS 的特性就是「逐層向外擴張」，因此 Level 1 (根) 會比 Level 2 先訪問，Level 2 會比 Level 3 先訪問，以此類推。',
    points: 1
  },

  // 【Application 應用】 1000-1250
  {
    id: 'bt-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title: '實作層序遍歷 (BFS) 時，通常需要搭配哪種資料結構來暫存節點？',
    options: [
      { id: 'A', text: 'Stack (堆疊)' },
      { id: 'B', text: 'Queue (佇列)' },
      { id: 'C', text: 'Hash Table (雜湊表)' },
      { id: 'D', text: 'Linked List (單純的鏈結串列)' }
    ],
    correctAnswer: 'B',
    explanation: 'BFS 需要「先進先出 (FIFO)」的特性來確保先發現的節點（較淺層）能先被處理，因此必須使用 Queue。',
    points: 1
  },
  {
    id: 'bt-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '遞迴實作深度優先搜尋 (DFS, 包括前/中/後序遍歷) 時，程式底層隱含使用了哪種資料結構？',
    options: [
      { id: 'A', text: 'Queue (佇列)' },
      { id: 'B', text: 'Call Stack (呼叫堆疊)' },
      { id: 'C', text: 'Min Heap (最小堆積)' },
      { id: 'D', text: 'Graph (圖)' }
    ],
    correctAnswer: 'B',
    explanation: '遞迴函數的執行依賴作業系統的 Call Stack 來記錄每次函數呼叫的狀態與返回位址，這本身就是一種 Stack (LIFO) 行為。',
    points: 1
  },
  {
    id: 'bt-group-1',
    groupId: 'group-bt-bfs',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '在上述 BFS 程式碼中，queue.pop(0) 這行程式碼的作用是模擬 Queue 的哪種基本操作？',
    options: [
      { id: 'A', text: 'Enqueue (入隊)' },
      { id: 'B', text: 'Dequeue (出隊)' },
      { id: 'C', text: 'Peek (查看頂端)' },
      { id: 'D', text: 'Clear (清空)' }
    ],
    correctAnswer: 'B',
    explanation: 'pop(0) 會移除並回傳陣列中的第 0 個（最前面）的元素，這正是 Queue 先進先出的 Dequeue 行為。',
    points: 2
  },
  {
    id: 'bt-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '有一棵二元樹，根節點為 A，A 的左子節點為 B，A 的右子節點為 C。請問其中序遍歷 (Inorder) 的結果為何？',
    options: [
      { id: 'A', text: 'A, B, C' },
      { id: 'B', text: 'B, A, C' },
      { id: 'C', text: 'B, C, A' },
      { id: 'D', text: 'C, B, A' }
    ],
    correctAnswer: 'B',
    explanation: '中序遍歷順序為「左 -> 根 -> 右」。因此先訪問左子節點 B，接著訪問根節點 A，最後訪問右子節點 C。',
    points: 2
  },
  {
    id: 'bt-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '以下哪些演算法屬於二元樹的「深度優先搜尋 (DFS)」？（多選）',
    options: [
      { id: 'opt1', text: '前序遍歷 (Preorder)' },
      { id: 'opt2', text: '中序遍歷 (Inorder)' },
      { id: 'opt3', text: '後序遍歷 (Postorder)' },
      { id: 'opt4', text: '層序遍歷 (Level Order / BFS)' }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt3'],
    explanation: '前、中、後序遍歷都是優先沿著子節點深入到樹的底部，屬於 DFS。層序遍歷則是逐層水平走訪，屬於 BFS。',
    points: 2
  },
  {
    id: 'bt-group-2',
    groupId: 'group-bt-bfs',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '若當前取出的 node 沒有任何子節點 (葉節點)，執行完這次 while 迴圈後，queue 的長度會發生什麼變化？',
    options: [
      { id: 'A', text: '增加 2' },
      { id: 'B', text: '維持不變' },
      { id: 'C', text: '減少 1' },
      { id: 'D', text: '變成 0' }
    ],
    correctAnswer: 'C',
    explanation: '迴圈開頭 pop(0) 會讓長度減 1。因為 node 沒有左右子節點，兩次 if 條件皆為 False，不會 append 新元素。因此整體長度淨減少 1。',
    points: 2
  },
  {
    id: 'bt-q7',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '如果我們想要在記憶體中安全地「刪除整棵二元樹」，應該使用哪種遍歷方式最適合？',
    options: [
      { id: 'A', text: '前序遍歷 (Preorder)' },
      { id: 'B', text: '中序遍歷 (Inorder)' },
      { id: 'C', text: '後序遍歷 (Postorder)' },
      { id: 'D', text: '層序遍歷 (BFS)' }
    ],
    correctAnswer: 'C',
    explanation: '刪除節點時，必須確保其左右子樹都已經被安全刪除後，才能刪除該節點本身。後序遍歷 (左->右->根) 完美符合這個「先處理子、再處理父」的需求。',
    points: 2
  },
  {
    id: 'bt-q8',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title: '在一棵完全退化成「只有右子節點」的二元樹（形狀像 Linked List）上執行遞迴 DFS，若有 n 個節點，其空間複雜度（Call Stack 深度）為何？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(n²)' }
    ],
    correctAnswer: 'C',
    explanation: 'DFS 的空間複雜度取決於樹的最大高度 (O(h))。在退化樹中，高度 h 等於節點數 n，因此 Call Stack 會累積 n 層，空間複雜度為 O(n)。這可能導致 Stack Overflow。',
    points: 2
  },

  // 【Complexity 進階/複雜度】 1300-1500
  {
    id: 'bt-group-3',
    groupId: 'group-bt-bfs',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title: '請填入 BFS 程式碼中 (a)(b)(c) 處缺失的部分（注意 Python 語法）。',
    code: bfsFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['root', 'queue', 'pop(0)'],
    explanation: '(a) 初始化 Queue 時須放入起點 root。(b) 迴圈條件為 queue 不為空。(c) 使用 pop(0) 模擬 Dequeue 操作，取出最前方的元素。',
    points: 5
  },
  {
    id: 'bt-q9',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: '對於包含 n 個節點的二元樹，無論使用哪種遍歷演算法 (Preorder, Inorder, Postorder, BFS)，其時間複雜度都是多少？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(n log n)' }
    ],
    correctAnswer: 'C',
    explanation: '遍歷的定義就是「拜訪樹中的每一個節點剛好一次」。因為有 n 個節點，無論順序為何，總共都需要執行 n 次訪問操作，因此時間複雜度恆為 O(n)。',
    points: 2
  },
  {
    id: 'bt-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '以下是中序遍歷 (Inorder) 的遞迴實作。請填入 (a)(b)(c) 缺失的 Python 變數與邏輯。',
    code: inorderFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['node', 'node.left', 'node'],
    explanation: '中序的邏輯：(a) 檢查當前 node 是否為空 (終止條件)。(b) 遞迴進入左子樹 node.left。(c) 訪問當前 node 本身。最後遞迴右子樹。',
    points: 5
  },
  {
    id: 'bt-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title: '關於遞迴走訪二元樹的複雜度分析，以下哪些敘述是正確的？（多選）',
    options: [
      { id: 'opt1', text: '時間複雜度始終為 O(n)，因為每個節點都會被訪問。' },
      { id: 'opt2', text: '空間複雜度取決於樹的高度 h，表示為 O(h)。' },
      { id: 'opt3', text: '對於完美平衡的二元樹，空間複雜度最佳可達 O(log n)。' },
      { id: 'opt4', text: '遞迴實作不需要消耗任何額外的記憶體空間。' }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt3'],
    explanation: '遞迴會消耗 Call Stack，空間為 O(h)。最壞情況退化樹 h=n (O(n))，最好情況平衡樹 h=log n (O(log n))。因此 opt4 是錯誤的。',
    points: 2
  },
  {
    id: 'bt-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title: '給定一棵只有根節點 root 的二元樹（root.left = None 且 root.right = None）。呼叫 preorder(root) 時，請依序填寫執行的行號序列（空格分隔）。',
    code: preorderPredictCode,
    language: 'python',
    options: [],
    correctAnswer: '1 2 3 4 1 2 5 1 2',
    explanation: '進入 root(L1,L2,L3) -> 呼叫左子樹 node.left(L4) -> 進入 None(L1)，觸發 return(L2) -> 返回 root 呼叫右子樹 node.right(L5) -> 進入 None(L1)，觸發 return(L2)。因此序列為 1 2 3 4 1 2 5 1 2。',
    points: 5
  }
];

export const binaryTreeQuiz: PracticeQuiz = {
  levelId: 'binarytree',
  levelName: '二元樹 (Binary Tree)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-bt-bfs',
      title: '題組：廣度優先搜尋 (BFS / Level Order Traversal)',
      description: '以下是教學區中實作二元樹「層序遍歷 (BFS)」的 Python 程式碼，使用陣列模擬 Queue (佇列)。請閱讀後回答問題。',
      code: bfsCode,
      language: 'python',
      questionIds: ['bt-group-1', 'bt-group-2', 'bt-group-3']
    }
  ]
};
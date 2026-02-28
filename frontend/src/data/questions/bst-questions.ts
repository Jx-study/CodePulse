import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

// 1. 數值逼近搜尋 Floor 完整實作 (用於題組顯示)
const floorCode = `def floor(root, target):
    curr, res = root, None
    while curr:
        if curr.value == target: return curr.value
        if curr.value > target:
            curr = curr.left
        else:
            res = curr.value
            curr = curr.right
    return res`;

// 2. 數值逼近搜尋 Floor Fill-code 版本
const floorFillCode = `def floor(root, target):
    curr, res = root, None
    while curr:
        if curr.value == target: return curr.value
        if curr.value > target:
            curr = (a)           # 目標比較小，往左子樹尋找
        else:
            res = (b)            # 暫時記錄可能的答案
            curr = (c)           # 繼續往右子樹尋找更接近的值
    return res`;

// 3. 簡化版插入邏輯 Fill-code 版本
const insertFillCode = `def insert(root, value):
    curr = root
    while curr:
        if value < curr.value:
            if curr.left:
                curr = (a)       # 繼續往左下移
            else:
                curr.left = Node(value)
                break
        elif value > curr.value:
            if (b):              # 判斷是否有右子樹
                curr = (c)       # 繼續往右下移
            else:
                curr.right = Node(value)
                break`;

// 4. 搜尋邏輯 Predict-line 版本 (含行號)
const searchPredictCode = `def search(root, target):                                       # L1
    curr = root                                                 # L2
    while curr:                                                 # L3
        if target == curr.value: return curr                    # L4
        curr = curr.left if target < curr.value else curr.right # L5
    return None                                                 # L6`;

// --- 題目定義 ---

const questions: Question[] = [
  // 【Basic 基礎】 800-950
  {
    id: 'bst-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '在二元搜尋樹 (BST) 中，任意節點的左子樹上所有節點的值都小於該節點的值；右子樹上所有節點的值都大於該節點的值。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '這是 BST 的核心定義。因為這個特性，我們在搜尋時可以每次排除掉一半的子樹，從而達到 O(log n) 的搜尋效率。',
    points: 1
  },
  {
    id: 'bst-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: '對一棵二元搜尋樹 (BST) 進行「中序遍歷 (Inorder Traversal)」，得到的數值序列會有什麼特性？',
    options: [
      { id: 'A', text: '由大到小遞減排列' },
      { id: 'B', text: '由小到大遞增排列' },
      { id: 'C', text: '隨機無序' },
      { id: 'D', text: '呈現階層式 (Level) 分布' }
    ],
    correctAnswer: 'B',
    explanation: '中序遍歷的順序是「左子樹 -> 根節點 -> 右子樹」。配合 BST 左小右大的特性，遍歷出來的結果剛好會是一個由小到大的遞增排序序列。',
    points: 1
  },
  {
    id: 'bst-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: '教學區實作的 BST 中，當嘗試插入一個「已經存在於樹中的數值」時，系統會如何處理？',
    options: [
      { id: 'A', text: '在左子樹建立一個新節點' },
      { id: 'B', text: '在右子樹建立一個新節點' },
      { id: 'C', text: '拋出 (Raise) 錯誤並中斷程式' },
      { id: 'D', text: '不建立新節點，而是將該節點的計數器 (count) 屬性加 1' }
    ],
    correctAnswer: 'D',
    explanation: '為了節省空間與維持樹的平衡，本系統在遇到重複值時，會直接增加該節點的 count 屬性，而不會建立多餘的新節點。',
    points: 1
  },
  {
    id: 'bst-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '若要在一棵 BST 中尋找「最小值 (Minimum)」，應該如何追蹤？',
    options: [
      { id: 'A', text: '從根節點一路往右子樹走，直到沒有右子節點為止' },
      { id: 'B', text: '從根節點一路往左子樹走，直到沒有左子節點為止' },
      { id: 'C', text: '查看根節點的值' },
      { id: 'D', text: '查看所有的葉子節點並比較' }
    ],
    correctAnswer: 'B',
    explanation: '因為 BST 的左子樹永遠小於根節點，因此不斷往左子節點走到底，最後一個無法再往左走的節點，就是整棵樹的最小值。',
    points: 1
  },
  {
    id: 'bst-q4',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '一棵包含 n 個節點且「完美平衡」的二元搜尋樹，其搜尋操作的時間複雜度為何？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(n log n)' }
    ],
    correctAnswer: 'B',
    explanation: '在完美平衡的情況下，樹的高度為 log n。每次比較都能排除一半的節點（類似二分搜尋法），因此時間複雜度為 O(log n)。',
    points: 1
  },

  // 【Application 應用】 1000-1250
  {
    id: 'bst-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title: '在 BST 中，若要刪除的目標節點是一個「葉子節點 (Leaf Node，無子節點)」，該如何處理？',
    options: [
      { id: 'A', text: '直接移除該節點，並將其父節點對應的指標設為 Null' },
      { id: 'B', text: '將該節點的值設為 0' },
      { id: 'C', text: '尋找右子樹的最小值來替換' },
      { id: 'D', text: '尋找左子樹的最大值來替換' }
    ],
    correctAnswer: 'A',
    explanation: '葉子節點沒有任何子節點，因此可以直接將它從樹中移除，不會破壞 BST 的結構。',
    points: 1
  },
  {
    id: 'bst-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '在 BST 中，若要刪除的目標節點「同時擁有左、右兩個子節點」，常見的替換策略是找誰來取代它的位置？',
    options: [
      { id: 'A', text: '該節點的左子節點' },
      { id: 'B', text: '該節點的右子節點' },
      { id: 'C', text: '該節點「右子樹中的最小值（後繼者）」或「左子樹中的最大值（前驅者）」' },
      { id: 'D', text: '整棵樹的根節點' }
    ],
    correctAnswer: 'C',
    explanation: '為了在刪除後仍保持 BST「左小右大」的特性，必須用剛好大於該節點的最小值（右子樹最左側），或剛好小於該節點的最大值（左子樹最右側）來替換它的值，然後再刪除那個替換的節點。',
    points: 2
  },
  {
    id: 'bst-q7',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '依序將 [50, 30, 70, 20, 40] 插入空的 BST 後，請問 40 會成為哪個節點的子節點？',
    options: [
      { id: 'A', text: '50 的左子節點' },
      { id: 'B', text: '30 的左子節點' },
      { id: 'C', text: '30 的右子節點' },
      { id: 'D', text: '70 的左子節點' }
    ],
    correctAnswer: 'C',
    explanation: '追蹤插入過程：根為 50；30 < 50 放左邊；70 > 50 放右邊；20 < 50 且 < 30，放 30 的左邊；40 < 50 但 > 30，因此會放在 30 的右子節點。',
    points: 2
  },
  {
    id: 'bst-group-1',
    groupId: 'group-bst-floor-ceil',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '給定 BST 包含數值 [20, 30, 40, 50, 70]。執行 floor(45) 的回傳值是多少？',
    options: [
      { id: 'A', text: '30' },
      { id: 'B', text: '40' },
      { id: 'C', text: '45' },
      { id: 'D', text: '50' }
    ],
    correctAnswer: 'B',
    explanation: 'Floor(45) 意指「在樹中尋找小於等於 45 的最大值」。樹中小於 45 的值有 20, 30, 40，其中最大的是 40。',
    points: 2
  },
  {
    id: 'bst-group-2',
    groupId: 'group-bst-floor-ceil',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '承上題，如果執行 ceil(35)，回傳值會是多少？',
    options: [
      { id: 'A', text: '30' },
      { id: 'B', text: '40' },
      { id: 'C', text: '50' },
      { id: 'D', text: '70' }
    ],
    correctAnswer: 'B',
    explanation: 'Ceil(35) 意指「在樹中尋找大於等於 35 的最小值」。樹中大於 35 的值有 40, 50, 70，其中最小的是 40。',
    points: 2
  },
  {
    id: 'bst-q8',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '如果依序將一個「已排序」的陣列 [10, 20, 30, 40, 50] 插入空的 BST 中，這棵樹的形狀會變成什麼樣子？',
    options: [
      { id: 'A', text: '完美平衡的二元樹' },
      { id: 'B', text: '只有左子節點的斜樹 (退化成鏈結串列)' },
      { id: 'C', text: '只有右子節點的斜樹 (退化成鏈結串列)' },
      { id: 'D', text: '變成一個雜湊表' }
    ],
    correctAnswer: 'C',
    explanation: '因為每個插入的數字都比上一個大，所以新節點永遠都會被加在右子樹上。這會導致 BST 完全退化成一條只有右指標的鏈結串列。',
    points: 2
  },
  {
    id: 'bst-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title: '以下哪些操作在 BST 中的時間複雜度與「樹的高度 (h)」成正比（即 O(h)）？（多選）',
    options: [
      { id: 'opt1', text: '插入新節點 (Insert)' },
      { id: 'opt2', text: '搜尋特定值 (Search)' },
      { id: 'opt3', text: '尋找最小值 (Find Min)' },
      { id: 'opt4', text: '清除整棵樹 (Clear)' }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt3'],
    explanation: '插入、搜尋與尋找最小值都只需要沿著從根節點到葉子節點的一條路徑往下走，最大步數即為樹的高度 h，複雜度 O(h)。清除整棵樹必須走訪每一個節點，複雜度為 O(n)。',
    points: 2
  },
  {
    id: 'bst-tf-2',
    type: 'true-false',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title: '在最壞的情況下（例如退化成斜樹），二元搜尋樹的搜尋時間複雜度會退化成 O(n)。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '正確。如果樹退化成一條直線（高度 h = n），要找的元素又在最底層，我們就必須走訪全部 n 個節點，這時效能等同於 Array 的線性搜尋 O(n)。這也是為什麼實務上常需要 AVL Tree 或 Red-Black Tree 來維持平衡。',
    points: 1
  },

  // 【Complexity 進階/複雜度】 1300-1500
  {
    id: 'bst-group-3',
    groupId: 'group-bst-floor-ceil',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title: '請填寫 floor 程式碼中 (a)(b)(c) 缺失的變數或屬性名稱（注意 Python 語法）。',
    code: floorFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['curr.left', 'curr.value', 'curr.right'],
    explanation: '(a) 當前值大於 target，答案必定在左子樹。 (b) 當前值小於 target，它可能就是 floor 答案，因此記錄 curr.value 給 res。 (c) 記錄後，往右子樹尋找看看有沒有「更大但依然小於等於 target」的更佳解。',
    points: 5
  },
  {
    id: 'bst-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: '關於「二元樹 (Binary Tree)」與「二元搜尋樹 (BST)」的比較，以下哪些敘述是正確的？（多選）',
    options: [
      { id: 'opt1', text: 'BST 是二元樹的一種特例' },
      { id: 'opt2', text: '二元樹支援 O(log n) 的快速搜尋，而 BST 不一定' },
      { id: 'opt3', text: 'BST 要求節點數值必須具備可比較的排序性質，二元樹則不需要' },
      { id: 'opt4', text: '若想快速獲取資料集中的最大值，BST 的結構比一般二元樹更有優勢' }
    ],
    correctAnswer: ['opt1', 'opt3', 'opt4'],
    explanation: 'BST 加上了左小右大的排序限制 (opt1, opt3 正確)，這使得找最大/最小值非常快 (opt4 正確)。一般的 Binary Tree 沒有排序規則，搜尋任何值都必須 O(n) 遍歷，因此 opt2 是完全說反了。',
    points: 2
  },
  {
    id: 'bst-q9',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '對一棵擁有 n 個節點的 BST 執行刪除操作 (Delete)，其「空間複雜度 (Space Complexity)」取決於什麼？',
    options: [
      { id: 'A', text: '始終為 O(1)' },
      { id: 'B', text: '取決於該節點是否有子節點' },
      { id: 'C', text: '若是遞迴實作，取決於樹的高度 O(h)；若是迭代實作，為 O(1)' },
      { id: 'D', text: '始終為 O(n)' }
    ],
    correctAnswer: 'C',
    explanation: '遞迴實作在 Call Stack 上會累積與樹高相同的層數，因此空間複雜度為 O(h)。如果改用 while 迴圈（迭代實作），只需幾個指標變數即可完成，空間複雜度可優化至 O(1)。',
    points: 2
  },
  {
    id: 'bst-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title: '以下是簡化版的插入 (Insert) 邏輯。請填入 (a)(b)(c) 處的 Python 程式碼，完成往左或往右子樹延伸的判斷。',
    code: insertFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['curr.left', 'curr.right', 'curr.right'],
    explanation: '(a) 還有左子樹時，將 curr 指標移至 curr.left 繼續迴圈。(b) 判斷 curr.right 是否存在。(c) 若存在，將 curr 指標移至 curr.right 繼續往下探。',
    points: 5
  },
  {
    id: 'bst-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title: '請閱讀 search 函數。給定一棵 BST，root 為 50，左子節點為 30。呼叫 search(root, 30) 時，請依序填寫執行的行號序列（以空格分隔）。',
    code: searchPredictCode,
    language: 'python',
    options: [],
    correctAnswer: '1 2 3 4 5 3 4',
    explanation: '進入 L1 -> curr=50(L2) -> 進入 while(L3) -> 30==50 為 False(L4) -> 30<50 所以 curr=30(L5) -> 再次迴圈(L3) -> 30==30 為 True 並 return(L4)。注意 L4 與 L5 的條件跳轉關係。',
    points: 5
  }
];

export const binarySearchTreeQuiz: PracticeQuiz = {
  levelId: 'bst',
  levelName: '二元搜尋樹 (BST)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-bst-floor-ceil',
      title: '題組：數值逼近搜尋 (Floor & Ceil)',
      description: '二元搜尋樹 (BST) 常被用來尋找最接近目標的數值。Floor(target) 代表尋找「小於等於 target 的最大值」；Ceil(target) 代表尋找「大於等於 target 的最小值」。請參考下方的 floor 實作程式碼回答問題。',
      code: floorCode,
      language: 'python',
      questionIds: ['bst-group-1', 'bst-group-2', 'bst-group-3']
    }
  ]
};
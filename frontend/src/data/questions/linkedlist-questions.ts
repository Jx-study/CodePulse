import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

// 1. 音樂播放清單完整實作 (用於題組顯示)
const playlistCode = `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class Playlist:
    def __init__(self):
        self.head = None

    def add_to_end(self, song):
        new_node = Node(song)
        if self.head is None:
            self.head = new_node
            return
        current = self.head
        while current.next is not None:
            current = current.next
        current.next = new_node

    def play_and_remove(self):
        if self.head is None:
            return "No songs"
        song = self.head.value
        self.head = self.head.next
        return song

    def remove_song(self, song_name):
        if self.head is None:
            return False
        if self.head.value == song_name:
            self.head = self.head.next
            return True
        prev = self.head
        current = self.head.next
        while current is not None:
            if current.value == song_name:
                prev.next = current.next
                return True
            prev = current
            current = current.next
        return False`;

// 2. 音樂播放清單 Fill-code 版本
const playlistFillCode = `def add_to_end(self, song):
    new_node = Node(song)
    if self.head is (a):         # 判斷串列是否為空
        self.head = new_node
        return
    current = self.head
    while (b) is not None:       # 遍歷直到找到尾節點
        current = current.next
    current.next = (c)           # 將尾節點連接到新節點`;

// 3. 教學區 LinkedList 實作 Fill-code (頭部插入)
const llInsertFillCode = `class Node:
    def __init__(self, value):
        self.value = value
        self.next = (a)          # 新節點初始化時，下一個節點為空

class LinkedList:
    def __init__(self):
        self.head = (b)          # 初始化時串列為空

    def insert_at_head(self, value):
        new_node = Node(value)
        new_node.next = self.head  # 新節點指向原本的 head
        self.head = (c)            # 更新 head 為新插入的節點`;

// 4. 教學區 LinkedList 實作 (用於 predict-line)
const llPredictCode = `class Node:                              # L1
    def __init__(self, value):           # L2
        self.value = value               # L3
        self.next = None                 # L4
                                         # L5
class LinkedList:                        # L6
    def __init__(self):                  # L7
        self.head = None                 # L8
                                         # L9
    def search(self, value):             # L10
        current = self.head              # L11
        index = 0                        # L12
        while current:                   # L13
            if current.value == value:   # L14
                return index             # L15
            current = current.next       # L16
            index += 1                   # L17
        return -1                        # L18`;

// --- 題目定義 ---

const questions: Question[] = [
  // 【Basic 基礎】 800-950
  {
    id: 'll-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: 'Linked List（鏈結串列）的節點在記憶體中不必連續存放，每個節點透過指標連接到下一個節點。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '正確！這是 Linked List 與 Array 的最核心差異。Array 需要連續記憶體（因此支援 O(1) 隨機存取），而 Linked List 的節點可以分散在記憶體各處，每個節點透過 next 指標連接到下一節點。這使得 Linked List 在動態新增/刪除上更有彈性，但失去了隨機存取的能力。',
    points: 1
  },
  {
    id: 'll-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '在 Singly Linked List（單向鏈結串列）中，每個 Node（節點）通常包含哪兩個部分？',
    options: [
      { id: 'A', text: '鍵 (Key) 和值 (Value)' },
      { id: 'B', text: '資料 (Data/Value) 和指向下一節點的指標 (Next Pointer)' },
      { id: 'C', text: '索引 (Index) 和資料 (Data)' },
      { id: 'D', text: '前驅指標 (Prev) 和後繼指標 (Next)' }
    ],
    correctAnswer: 'B',
    explanation: 'Singly Linked List 的每個節點包含兩部分：\n1. 資料 (Data/Value)：儲存節點的實際數據。\n2. Next 指標：指向串列中下一個節點的位址。\n選項 D 描述的是 Doubly Linked List（雙向鏈結串列），它有 prev 和 next 兩個指標。',
    points: 1
  },
  {
    id: 'll-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: '在 Singly Linked List 中，最後一個節點（尾節點）的 next 指標通常指向什麼？',
    options: [
      { id: 'A', text: '第一個節點（形成環狀串列）' },
      { id: 'B', text: 'None（表示串列結束）' },
      { id: 'C', text: '自己本身' },
      { id: 'D', text: '前一個節點' }
    ],
    correctAnswer: 'B',
    explanation: '在標準 Singly Linked List 中，尾節點的 next 指標設為 None（在 Python 中）或 null（在其他語言），表示串列到此結束。這是判斷「是否到達尾端」的依據，在遍歷時常用 while current.next is not None 來找到尾節點。選項 A 描述的是 Circular Linked List（環狀串列）。',
    points: 1
  },
  {
    id: 'll-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '在 Singly Linked List 的頭部插入元素（insert_at_head）不需要遍歷整個串列，時間複雜度為 O(1)。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '正確！insert_at_head 的步驟：\n1. 建立新節點 (new_node)\n2. 讓 new_node.next 指向原本的 head\n3. 更新 head = new_node\n這三個步驟都是常數時間操作，不需要遍歷，時間複雜度為 O(1)。這是 Linked List 相較於 Array 的優勢之一（Array 在頭部插入需要移動所有元素，O(n)）。',
    points: 1
  },
  {
    id: 'll-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '對一個空的 LinkedList 依序執行：insert_at_head(10)、insert_at_head(20)、insert_at_head(30)。操作完成後，head.value 的值是多少？',
    options: [
      { id: 'A', text: '10' },
      { id: 'B', text: '20' },
      { id: 'C', text: '30' },
      { id: 'D', text: '無法確定' }
    ],
    correctAnswer: 'C',
    explanation: 'insert_at_head 每次把新節點插在串列最前面：\n1. insert_at_head(10) → head=10，串列: [10]\n2. insert_at_head(20) → 20 插在 10 前面，head=20，串列: [20→10]\n3. insert_at_head(30) → 30 插在 20 前面，head=30，串列: [30→20→10]\n因此 head.value = 30。\n規律：每次新插入的值都會成為新的 head。',
    points: 1
  },

  // 【Application 應用】 1000-1250
  {
    id: 'll-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title: '在沒有 tail 指標的 Singly Linked List 中，執行 insert_at_tail（在尾部插入元素）需要做什麼？',
    options: [
      { id: 'A', text: '直接更新 head 指標，時間複雜度 O(1)' },
      { id: 'B', text: '從 head 開始遍歷，找到最後一個 next 為 None 的節點，再連接新節點，時間複雜度 O(n)' },
      { id: 'C', text: '使用二元搜尋找到尾端位置，O(log n)' },
      { id: 'D', text: '根據節點數量直接計算尾端記憶體位址，O(1)' }
    ],
    correctAnswer: 'B',
    explanation: '沒有 tail 指標時，無法直接存取尾節點。必須從 head 開始，逐一走訪每個節點，直到找到 next == None 的節點，才能在其後連接新節點。有 n 個節點時需走 n 步，時間複雜度 O(n)。\n若有 tail 指標，則可直接 tail.next = new_node，時間複雜度 O(1)。',
    points: 1
  },
  {
    id: 'll-group-1',
    groupId: 'group-ll-playlist',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title: '若播放清單目前已有 3 首歌曲，執行 add_to_end(\'新歌\') 的時間複雜度是多少？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(3)（固定走 3 步）' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(log n)' }
    ],
    correctAnswer: 'C',
    explanation: 'add_to_end 需要從 head 開始遍歷整個串列，找到 current.next == None 的尾節點後才能連接新節點。\n當清單有 n 首歌時，需要走 n 步（走訪 n 個節點）。雖然本例中 n=3，但演算法的時間複雜度以「串列長度 n」來表示，為 O(n)。\n若程式碼改用 tail 指標，insert_at_tail 可達到 O(1)。',
    points: 2
  },
  {
    id: 'll-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '在 Singly Linked List 中搜尋特定值（search）的最壞情況時間複雜度是多少？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(n²)' }
    ],
    correctAnswer: 'C',
    explanation: 'Linked List 不支援隨機存取，搜尋只能從 head 開始，逐一比較每個節點的值。\n最壞情況：目標值在尾端，或根本不存在（需走訪全部 n 個節點）。\n時間複雜度為 O(n)。\n這與 Array 的線性搜尋相同，但 Array 還有 O(1) 的索引存取優勢，而 Linked List 沒有。',
    points: 1
  },
  {
    id: 'll-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '以下哪些是 Linked List 相較於 Array 的優點？（多選）',
    options: [
      { id: 'opt1', text: '在頭部插入或刪除元素為 O(1)，不需移動其他元素' },
      { id: 'opt2', text: '支援 O(1) 的隨機存取（按索引直接存取元素）' },
      { id: 'opt3', text: '動態調整大小無需複製整個資料結構到新記憶體空間' },
      { id: 'opt4', text: '搜尋特定值的時間複雜度低於 Array' }
    ],
    correctAnswer: ['opt1', 'opt3'],
    explanation: 'opt1 ✓：insert_at_head 僅需修改指標，O(1)；Array 在頭部插入需右移所有元素，O(n)。\nopt2 ✗：Linked List 無法隨機存取，要找第 k 個元素必須從 head 走 k 步，O(n)；Array 可 O(1) 存取。\nopt3 ✓：Linked List 動態分配每個節點，隨時可增減，不需預先分配固定大小或重新複製；Array 擴容時需分配新陣列並複製所有元素。\nopt4 ✗：兩者都是 O(n) 線性搜尋，Linked List 並無優勢。',
    points: 2
  },
  {
    id: 'll-group-2',
    groupId: 'group-ll-playlist',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '對空的 Playlist 依序執行：add_to_end(\'A\')、add_to_end(\'B\')、add_to_end(\'C\')、play_and_remove()、play_and_remove()。第二次 play_and_remove() 的回傳值是什麼？',
    options: [
      { id: 'A', text: '\'A\'' },
      { id: 'B', text: '\'B\'' },
      { id: 'C', text: '\'C\'' },
      { id: 'D', text: '\'No songs\'' }
    ],
    correctAnswer: 'B',
    explanation: '逐步追蹤串列狀態：\n1. add_to_end(\'A\') → [A]\n2. add_to_end(\'B\') → [A→B]\n3. add_to_end(\'C\') → [A→B→C]\n4. play_and_remove() → 取出 head.value=\'A\'，head 移到 B，回傳 \'A\'，剩 [B→C]\n5. play_and_remove() → 取出 head.value=\'B\'，head 移到 C，回傳 \'B\'，剩 [C]\n\n第二次回傳 \'B\'。\n注意：play_and_remove 操作類似 Queue 的 dequeue（FIFO 原則）。',
    points: 2
  },
  {
    id: 'll-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '若已知要刪除的節點的「前一個節點（prev）」，在 Singly Linked List 中執行刪除的時間複雜度是多少？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(n²)' }
    ],
    correctAnswer: 'A',
    explanation: '已知 prev 指標時，刪除操作只需一步：prev.next = prev.next.next（或 prev.next = target_node.next）。\n這個操作修改指標，不需要走訪其他節點，時間複雜度 O(1)。\n這是 Linked List 的核心優勢：在「已知節點位置」的情況下，插入和刪除都是 O(1)。\n但注意：找到 prev 本身需要 O(n) 的遍歷，整體刪除（含搜尋）仍是 O(n)。',
    points: 2
  },
  {
    id: 'll-q7',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '在需要「頻繁在頭部插入與刪除」的應用場景中，Linked List 比 Array 更有效率的原因是什麼？',
    options: [
      { id: 'A', text: 'Linked List 使用的記憶體比 Array 少' },
      { id: 'B', text: 'Linked List 在頭部插入/刪除為 O(1)，而 Array 需要移動所有元素，為 O(n)' },
      { id: 'C', text: 'Linked List 的搜尋比 Array 更快' },
      { id: 'D', text: 'Linked List 支援隨機存取而 Array 不支援' }
    ],
    correctAnswer: 'B',
    explanation: 'Linked List 在頭部操作的優勢：\n• insert_at_head：建立新節點 + 修改 head 指標，O(1)。\n• delete_at_head：更新 head = head.next，O(1)。\n\nArray 在頭部操作的劣勢：\n• 在 index 0 插入：需將所有 n 個元素右移一格，O(n)。\n• 刪除 index 0：需將所有 n-1 個元素左移一格，O(n)。\n\n因此在「頻繁頭部操作」場景（如實作 Stack 或 Queue），Linked List 效率更高。',
    points: 2
  },
  {
    id: 'll-q8',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title: '在沒有 tail 指標的 Singly Linked List 中，delete_at_tail（刪除尾節點）的時間複雜度是多少？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(1)，因為 head 指標可以直接找到尾節點' }
    ],
    correctAnswer: 'C',
    explanation: '刪除尾節點需要找到「倒數第二個節點（prev）」才能執行 prev.next = None。\n但 Singly Linked List 沒有 prev 指標，也沒有 tail 指標，唯一的方法是從 head 開始遍歷，走到 current.next == None 的前一步停下。\n有 n 個節點時需走 n-1 步，時間複雜度 O(n)。\n若有 tail 指標（但仍無 prev），仍需 O(n) 找 prev。需要 Doubly Linked List + tail 指標才能達到 O(1)。',
    points: 2
  },

  // 【Complexity 進階/複雜度】 1300-1500
  {
    id: 'll-group-3',
    groupId: 'group-ll-playlist',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title: '請填入 add_to_end 方法中 (a)(b)(c) 處缺失的程式碼，使其正確實作「在播放清單尾端加入歌曲」的功能（注意 Python 語法）。',
    code: playlistFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['None', 'current.next', 'new_node'],
    explanation: '(a) self.head is None：判斷串列是否為空，None 是 Python 表示「無值/空指標」的關鍵字。\n(b) current.next is not None：遍歷條件。當 current.next 還不是 None，表示 current 還不是尾節點，繼續移動。迴圈結束時 current 正好是尾節點。\n(c) current.next = new_node：將尾節點的 next 指向新節點，完成連接。',
    points: 5
  },
  {
    id: 'll-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: '以下關於 Singly Linked List 特性的敘述，哪些是正確的？（多選）',
    options: [
      { id: 'opt1', text: '節點在記憶體中不需要連續存放' },
      { id: 'opt2', text: '支援 O(1) 的尾端刪除（在沒有 tail 指標的情況下）' },
      { id: 'opt3', text: '插入或刪除節點時，不需要搬移其他節點的資料，只需修改指標' },
      { id: 'opt4', text: 'Singly Linked List 只能從 head 開始單向遍歷，無法直接存取前一個節點' }
    ],
    correctAnswer: ['opt1', 'opt3', 'opt4'],
    explanation: 'opt1 ✓：Linked List 的核心特性，節點透過指標連接，記憶體無需連續。\nopt2 ✗：沒有 tail 指標時，delete_at_tail 必須從 head 遍歷找到倒數第二個節點，O(n)。\nopt3 ✓：插入/刪除只需修改相關節點的 next 指標，不需要像 Array 一樣移動大量元素。\nopt4 ✓：Singly 的意思就是「單向」，每個節點只有 next 指標，無法直接回頭找 prev 節點。Doubly Linked List 才有 prev 指標。',
    points: 2
  },
  {
    id: 'll-q9',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '以下哪項對 Singly Linked List（無 tail 指標）各操作的時間複雜度分析完全正確？',
    options: [
      { id: 'A', text: '頭部插入 O(1)、尾部插入 O(n)、按值搜尋 O(n)' },
      { id: 'B', text: '頭部插入 O(1)、尾部插入 O(1)、按值搜尋 O(n)' },
      { id: 'C', text: '頭部插入 O(n)、尾部插入 O(n)、按值搜尋 O(1)' },
      { id: 'D', text: '頭部插入 O(1)、尾部插入 O(1)、按值搜尋 O(log n)' }
    ],
    correctAnswer: 'A',
    explanation: 'Singly Linked List（無 tail 指標）時間複雜度：\n• 頭部插入（insert_at_head）：O(1)，只修改 head 指標。\n• 尾部插入（insert_at_tail）：O(n)，需從 head 遍歷找尾節點。\n• 按值搜尋（search）：O(n)，需線性遍歷，最壞走完整個串列。\n\nB、D 錯在「尾部插入 O(1)」——沒有 tail 指標時做不到。\nC 錯在「頭部插入 O(n)」——頭部插入根本不需遍歷。\nD 還錯在「搜尋 O(log n)」——那是有序資料結構（如 BST）才有的優勢。',
    points: 2
  },
  {
    id: 'll-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title: '請填入下方 Node 類別與 insert_at_head 方法中 (a)(b)(c) 處缺失的程式碼，使其正確實作「在 LinkedList 頭部插入節點」的功能。',
    code: llInsertFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['None', 'None', 'new_node'],
    explanation: '(a) self.next = None：新建節點時，next 初始化為 None，表示尚未連接任何後續節點。\n(b) self.head = None：空的 LinkedList，head 指向 None，表示串列尚無任何節點。\n(c) self.head = new_node：執行 insert_at_head 的最後一步——把 head 更新為剛建立的新節點。\n注意順序：必須先讓 new_node.next = self.head（保存舊 head），再更新 self.head = new_node，否則會失去對原串列的連結。',
    points: 5
  },
  {
    id: 'll-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title: '請閱讀下方程式碼。假設 LinkedList 已建立節點串列 [5, 10]（head 指向值 5 的節點，5.next = 10，10.next = None），執行 search(10)（搜尋串列尾端的元素）。\n\n請依序填寫 search() 方法執行時，經過的行號序列（以空格分隔）。',
    code: llPredictCode,
    language: 'python',
    options: [],
    correctAnswer: '10 11 12 13 14 16 17 13 14 15',
    explanation: '執行 search(10) 在串列 [5→10] 上的逐行流程：\n1. 進入 search 方法 (L10)\n2. current = self.head（節點 5）(L11)\n3. index = 0 (L12)\n【第 1 次迴圈 - 節點 5】\n4. while current → True（節點 5 不是 None）(L13)\n5. 判斷 5 == 10？False (L14)\n6. current = current.next（移到節點 10）(L16)\n7. index = 1 (L17)\n【第 2 次迴圈 - 節點 10】\n8. while current → True（節點 10 不是 None）(L13)\n9. 判斷 10 == 10？True (L14)\n10. return 1（找到了，在 index 1）(L15)\n\n注意：L18 不執行（元素存在）；L15 是在第 2 次迴圈中 L14 為 True 時直接回傳。',
    points: 5
  }
];

export const linkedListQuiz: PracticeQuiz = {
  levelId: 'linked-list',
  levelName: '鏈結串列 (Linked List)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-ll-playlist',
      title: '題組：音樂播放清單',
      description: '某音樂 App 使用 Singly Linked List 實作播放清單功能，新增歌曲到尾端、播放並移除頭部歌曲、以及依名稱移除指定歌曲。請參考下方程式碼回答問題。',
      code: playlistCode,
      language: 'python',
      questionIds: ['ll-group-1', 'll-group-2', 'll-group-3']
    }
  ]
};
import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

const dfsSimplifiedCode = `# 測試用有向圖：
# A → B → D
# A → C → E
graph = {
    'A': ['B', 'C'],
    'B': ['D'],
    'C': ['E'],
    'D': [],
    'E': []
}

def dfs(graph, start):
    visited = set([start])    # 提早標記，避免重複入棧
    stack = [start]
    result = []
    while stack:
        curr = stack.pop()
        result.append(curr)
        for nb in reversed(graph[curr]):  # 反向加入，確保字母小的先被訪問
            if nb not in visited:
                visited.add(nb)
                stack.append(nb)
    return result`;

const dfsFillCode = `def dfs_recursive(graph, start):
    visited = (a)
    result = []

    def _dfs(node):
        visited.add(node)
        result.append(node)
        for nb in graph[node]:
            if nb not in (b):
                _dfs((c))

    _dfs(start)
    return result`;

const dfsGridFillCode = `def grid_dfs(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    visited = {start}
    stack = [(a)]
    dirs = [(0,1),(0,-1),(1,0),(-1,0)]
    while stack:
        pos = (b)
        row, col = pos
        if pos == end:
            return True
        for dr, dc in dirs:
            nr, nc = row+dr, col+dc
            new_pos = (nr, nc)
            if 0<=nr<rows and 0<=nc<cols and (c)!='#' and new_pos not in visited:
                visited.add(new_pos)
                stack.append(new_pos)
    return False`;

const dfsPredictCode = `def dfs(graph, start):               # L1
    visited = set()                  # L2
    stack = [start]                  # L3
    result = []                      # L4
    while stack:                     # L5
        curr = stack.pop()           # L6
        if curr in visited:          # L7
            continue                 # L8
        visited.add(curr)            # L9
        result.append(curr)          # L10
        for nb in graph[curr]:       # L11
            if nb not in visited:    # L12
                stack.append(nb)     # L13
    return result                    # L14`;

// --- 題目定義 ---

const questions: Question[] = [
  // 【Basic 基礎】800–950（5 題）

  // #1 dfs-q1 (800) 單選 — DFS 核心策略
  {
    id: 'dfs-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: 'DFS（深度優先搜尋）的核心搜尋策略為何？',
    options: [
      { id: 'A', text: '從起始節點逐層向外擴張，先訪問所有直接鄰居再進入下一層' },
      { id: 'B', text: '沿著一條路徑盡可能深入，直到無路可走才回溯至上一個分叉點' },
      { id: 'C', text: '隨機選擇未訪問的節點進行搜尋' },
      { id: 'D', text: '優先訪問距離起點最近（邊數最少）的節點' }
    ],
    correctAnswer: 'B',
    explanation:
      'DFS 的核心是「不撞南牆不回頭」——沿著一條路徑一直深入，直到碰壁（Dead End）或找到目標，才回溯到上一個有未訪問鄰居的節點。選項 A 是 BFS；選項 D 是 Dijkstra 算法。',
    points: 1
  },

  // #2 dfs-tf-1 (850) 是非 — 迭代 vs 遞迴的 Stack
  {
    id: 'dfs-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title:
      '迭代（非遞迴）版本的 DFS 核心資料結構是堆疊（Stack）；而遞迴版本的 DFS，則隱含使用了作業系統的呼叫堆疊（Call Stack）。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation:
      '無論是手動 Stack 還是遞迴，DFS 都依賴後進先出（LIFO）特性。遞迴函數的每一層呼叫都在 Call Stack 上建立一個「棧框（Stack Frame）」，函數 return 時自動彈出，這就是隱式的回溯機制。',
    points: 1
  },

  // #3 dfs-q2 (900) 單選 — DFS vs BFS 記憶體
  {
    id: 'dfs-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '相較於 BFS，DFS 在哪種圖結構中通常更節省記憶體？',
    options: [
      { id: 'A', text: '「寬而淺」的圖（每個節點有大量鄰居，但深度很淺）' },
      { id: 'B', text: '「深而窄」的圖（每個節點鄰居少，但深度很深）' },
      { id: 'C', text: '兩者記憶體消耗完全相同' },
      { id: 'D', text: '完全圖（Complete Graph，每對節點之間都有邊）' }
    ],
    correctAnswer: 'B',
    explanation:
      'DFS 的 Stack 最多只存放「當前路徑上」的節點，空間與圖的深度成正比。BFS 的 Queue 最壞情況需存放整層節點（廣度），對「寬而淺」的圖可達 O(V)。因此「深而窄」時 DFS 比 BFS 省記憶體；「寬而淺」時反之。',
    points: 1
  },

  // #4 dfs-tf-2 (900) 是非 — DFS 不保證最短路徑
  {
    id: 'dfs-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title:
      '在無加權圖中，DFS 從起點首次到達某節點時，所走過的路徑必然是最短路徑（最少邊數）。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'false',
    explanation:
      '錯誤。DFS 沿一條路徑深入，此路徑不一定最短。例：圖中同時存在 A→B→C 和 A→C，DFS 若先走 A→B→C 到達 C（2 條邊），而最短路徑 A→C 只需 1 條邊。保證最短路徑（邊數）的是 BFS。',
    points: 1
  },

  // #5 dfs-q3 (950) 單選 — 遞迴 DFS 遍歷順序
  {
    id: 'dfs-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title:
      '對有向圖（A→B, A→C, B→D，C 和 D 無出邊）執行遞迴版 DFS，從 A 開始，鄰居按字母順序訪問，遍歷順序為何？',
    options: [
      { id: 'A', text: 'A → B → C → D' },
      { id: 'B', text: 'A → B → D → C' },
      { id: 'C', text: 'A → C → B → D' },
      { id: 'D', text: 'A → D → B → C' }
    ],
    correctAnswer: 'B',
    explanation:
      '遞迴 DFS：從 A 開始，字母順序第一個鄰居是 B，遞迴進入 B；B 的唯一鄰居 D，遞迴進入 D；D 無出邊，return 回 B，return 回 A；繼續訪問 A 的第二個鄰居 C，C 無出邊，return。最終順序：A → B → D → C。',
    points: 1
  },

  // 【Application 應用】1000–1250（8 題）

  // #6 dfs-group-1 (1000) 題組 — 第一步後 stack 內容
  {
    id: 'dfs-group-1',
    groupId: 'group-dfs-traversal',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title:
      "執行 dfs(graph, 'A') 的「第一步」（彈出 A 並處理所有鄰居後），堆疊（stack）的內容為何？（頂端在右側）",
    options: [
      { id: 'A', text: "['A', 'B', 'C']" },
      { id: 'B', text: "['C', 'B']" },
      { id: 'C', text: "['B', 'D']" },
      { id: 'D', text: "['B']" }
    ],
    correctAnswer: 'B',
    explanation:
      "初始：visited={'A'}, stack=['A']。彈出 'A'，加入 result=['A']。reversed(['B','C']) = ['C','B']：先處理 'C'（未在 visited）→ visited.add('C')，push 'C' → stack=['C']；再處理 'B'（未在 visited）→ visited.add('B')，push 'B' → stack=['C','B']。第一步結束後 stack=['C','B']，頂端為 'B'，下一步將彈出 'B'。",
    points: 2
  },

  // #7 dfs-q4 (1050) 單選 — 適用 DFS 的場景
  {
    id: 'dfs-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '以下哪種情境最適合使用 DFS 而非 BFS？',
    options: [
      { id: 'A', text: '在社交網路中找出兩個用戶之間的最短關係鏈（最少中間人數）' },
      {
        id: 'B',
        text: '在迷宮遊戲中，判斷「是否存在」一條從入口到出口的路徑'
      },
      { id: 'C', text: '在無加權城市路網中，找出兩城市之間的最少轉乘方案' },
      { id: 'D', text: '計算每個節點距起點的最短距離（層數）' }
    ],
    correctAnswer: 'B',
    explanation:
      '「路徑存在性」問題只需找到任意一條路徑即可，DFS 沿一條路徑深入，一旦找到終點就成功返回，無需窮舉所有可能。選項 A/C/D 均涉及「最短距離或最少邊數」，需要 BFS 的逐層保證。',
    points: 2
  },

  // #8 dfs-group-2 (1100) 題組 — 完整遍歷順序
  {
    id: 'dfs-group-2',
    groupId: 'group-dfs-traversal',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: "dfs(graph, 'A') 最終返回的 result（完整訪問順序）為何？",
    options: [
      { id: 'A', text: "['A', 'B', 'C', 'D', 'E']" },
      { id: 'B', text: "['A', 'B', 'D', 'C', 'E']" },
      { id: 'C', text: "['A', 'C', 'E', 'B', 'D']" },
      { id: 'D', text: "['A', 'D', 'B', 'E', 'C']" }
    ],
    correctAnswer: 'B',
    explanation:
      "pop 'A'→result=['A']，push reversed(['B','C'])=['C','B']，頂端 'B'；pop 'B'→result=['A','B']，push reversed(['D'])=['D']；pop 'D'→result=['A','B','D']，無鄰居；pop 'C'→result=['A','B','D','C']，push reversed(['E'])=['E']；pop 'E'→result=['A','B','D','C','E']。對比 BFS 結果 ['A','B','C','D','E']：DFS 先深入 B→D 這條路徑，才回頭處理 C→E。",
    points: 2
  },

  // #9 dfs-q5 (1100) 單選 — 連通分量
  {
    id: 'dfs-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '如何使用 DFS 計算一個無向圖中「連通分量（Connected Components）」的數量？',
    options: [
      { id: 'A', text: '只需從任意一點執行一次 DFS，查看 visited 大小即可' },
      {
        id: 'B',
        text: '遍歷所有節點，每遇到「未被訪問」的節點就啟動一次新 DFS，每次啟動代表發現一個新的連通分量，統計啟動次數'
      },
      {
        id: 'C',
        text: '對每個節點都獨立執行一次完整 DFS，取最大 visited 集合大小'
      },
      { id: 'D', text: '連通分量只能用 BFS 計算，DFS 無法處理' }
    ],
    correctAnswer: 'B',
    explanation:
      '每次啟動 DFS 能標記起點所在整個連通分量的所有節點。外層迴圈下次遇到未訪問節點，代表進入新的連通分量，計數 +1。單次 DFS（選項 A）只能到達起點的分量，無法感知孤立節點。',
    points: 2
  },

  // #10 dfs-q6 (1150) 單選 — 回溯時機
  {
    id: 'dfs-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: 'DFS 的「回溯（Backtrack）」具體在什麼時機發生？',
    options: [
      { id: 'A', text: '每訪問一個新節點後立即回溯' },
      {
        id: 'B',
        text: '當目前節點的所有鄰居都已被訪問，無新路徑可繼續深入時'
      },
      { id: 'C', text: '當 Stack 的元素數量超過節點總數的一半時' },
      { id: 'D', text: '當找到最短路徑後自動觸發' }
    ],
    correctAnswer: 'B',
    explanation:
      '回溯發生在「死胡同（Dead End）」：目前節點所有鄰居均已在 visited 中。遞迴 DFS 中：函數執行完所有遞迴子呼叫後 return（自動彈出 Call Stack）。迭代 DFS 中：pop 出節點後沒有新鄰居推入 Stack，下次迴圈 pop 出的是「上一層」的節點，繼續從那裡探索。',
    points: 2
  },

  // #11 dfs-q7 (1150) 單選 — 遞迴深度超限
  {
    id: 'dfs-q7',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '遞迴版 DFS 中，若圖的最大深度達到 10,000，可能發生什麼問題？',
    options: [
      { id: 'A', text: 'DFS 會自動切換為迭代版本，不受影響' },
      {
        id: 'B',
        text: '可能導致「遞迴深度超限（RecursionError / Stack Overflow）」，因為每層遞迴都需要一個 Call Stack Frame'
      },
      { id: 'C', text: 'DFS 的時間複雜度會從 O(V+E) 退化為 O(V²)' },
      { id: 'D', text: 'DFS 將無法正確偵測圖中的環' }
    ],
    correctAnswer: 'B',
    explanation:
      'Python 預設遞迴深度限制約為 1,000 層（可透過 sys.setrecursionlimit 調整，但 Call Stack 仍有上限）。深度達萬時，遞迴 DFS 會觸發 RecursionError。解決方案：改用迭代 DFS，手動維護 Stack，徹底解除深度限制。',
    points: 2
  },

  // #12 dfs-multi-1 (1200) 多選 — DFS 應用場景
  {
    id: 'dfs-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '以下哪些問題或應用，DFS 是核心演算法之一？（多選）',
    options: [
      {
        id: 'opt1',
        text: '在有向圖中偵測「環（Cycle Detection）」（利用遞迴堆疊 rec_stack）'
      },
      { id: 'opt2', text: '在無加權圖中尋找兩節點間的最短路徑（最少邊數）' },
      {
        id: 'opt3',
        text: '隨機 DFS 生成迷宮（Maze Generation，每次隨機選擇未訪問的鄰居）'
      },
      {
        id: 'opt4',
        text: '解決需要回溯的組合問題（如 N 皇后、數獨）'
      }
    ],
    correctAnswer: ['opt1', 'opt3', 'opt4'],
    explanation:
      'opt1 正確：DFS + rec_stack 是有向圖環偵測的經典方法。opt2 錯誤：最短路徑（最少邊數）需用 BFS，DFS 不保證最短。opt3 正確：Randomized DFS 是生成完美迷宮的標準算法，確保無環且全連通。opt4 正確：N 皇后、數獨本質上是在「解空間樹」中 DFS + Backtracking，遇到衝突就回溯。',
    points: 2
  },

  // #13 dfs-q8 (1250) 單選 — 遞迴 vs 迭代順序差異
  {
    id: 'dfs-q8',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title:
      '對同一張有向圖執行「遞迴 DFS」與「迭代 DFS（手動 Stack）」時，鄰居訪問順序可能不同，根本原因是什麼？',
    options: [
      { id: 'A', text: '兩者使用不同的底層資料結構（Queue vs Stack）' },
      {
        id: 'B',
        text: '迭代版依序 push 鄰居，LIFO 使最後 push 的最先彈出；遞迴版則從第一個鄰居開始依序遞迴呼叫'
      },
      { id: 'C', text: '遞迴版不支援有向圖，只能處理無向圖' },
      { id: 'D', text: '兩者的遍歷結果永遠完全相同，不存在差異' }
    ],
    correctAnswer: 'B',
    explanation:
      '鄰居為 [B, C] 時：遞迴版先呼叫 B 再呼叫 C，訪問順序 B→C；迭代版依序 push B 再 push C，LIFO 使 C 先彈出，訪問順序 C→B。若要讓迭代版與遞迴版一致，需「反向」push（先 push C 再 push B，B 先彈出），這正是題組程式碼使用 reversed() 的原因。',
    points: 2
  },

  // 【Complexity 進階】1300–1500（5 題）

  // #14 dfs-group-3 (1300) 題組 — fill-code 遞迴 DFS
  {
    id: 'dfs-group-3',
    groupId: 'group-dfs-traversal',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title: '請填入以下遞迴版 DFS 實作中 (a)(b)(c) 缺失的部分（注意 Python 語法）。',
    code: dfsFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['set()', 'visited', 'nb'],
    explanation:
      '(a) visited 必須是可變且跨遞迴共享的集合，初始化為空 set()。(b) 判斷鄰居是否已訪問，需檢查 visited 集合（與 (a) 一致）。(c) 遞迴深入時傳入 nb（當前正在處理的鄰居節點），探索其子樹。',
    points: 5
  },

  // #15 dfs-q9 (1350) 單選 — 空間複雜度
  {
    id: 'dfs-q9',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: 'DFS 的空間複雜度在最壞情況下為何？（V = 節點數，使用鄰接表）',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(E)' },
      { id: 'C', text: 'O(V)' },
      { id: 'D', text: 'O(V × E)' }
    ],
    correctAnswer: 'C',
    explanation:
      'DFS 空間需求：(1) Stack（迭代）或 Call Stack（遞迴）：最壞為線性鏈，深度達 V，需 O(V)。(2) visited 集合：最多存放 V 個節點，需 O(V)。整體最壞情況：O(V)。BFS 同為 O(V)，但最壞情況（星狀圖）Queue 一次裝下所有鄰居節點。',
    points: 2
  },

  // #16 dfs-multi-2 (1400) 多選 — DFS 正確敘述
  {
    id: 'dfs-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '以下關於 DFS 的敘述，哪些是正確的？（多選）',
    options: [
      {
        id: 'opt1',
        text: '在無向圖中，從某起點執行 DFS 後，visited 集合恰好是起點所在的整個連通分量'
      },
      {
        id: 'opt2',
        text: 'DFS 的時間複雜度（鄰接表）為 O(V+E)，與 BFS 相同'
      },
      {
        id: 'opt3',
        text: '對同一張圖從同一起點，DFS 和 BFS 的遍歷結果永遠相同'
      },
      {
        id: 'opt4',
        text: 'DFS 後序遍歷（Post-order）的反轉序列可作為有向無環圖（DAG）的拓撲排序'
      }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt4'],
    explanation:
      'opt1 正確：DFS 能到達且僅能到達起點所在連通分量的所有節點。opt2 正確：每個節點訪問一次(V)、每條邊最多檢查一次(E)，O(V+E)。opt3 錯誤：DFS 結果 A,B,D,C,E；BFS 結果 A,B,C,D,E，通常不同。opt4 正確：DFS 後序（子孫全訪問完才加入序列）的反轉即為合法拓撲排序。',
    points: 2
  },

  // #17 dfs-fill-1 (1450) fill-code — 網格迷宮 DFS
  {
    id: 'dfs-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title:
      "以下是格狀迷宮 DFS 實作，'#' 表示牆壁，從 start 判斷能否到達 end。請填入 (a)(b)(c)。",
    code: dfsGridFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['start', 'stack.pop()', 'grid[nr][nc]'],
    explanation:
      "(a) Stack 初始需放入起點 start，作為 DFS 出發點。(b) DFS 必須從 Stack「頂端」取出節點（LIFO），應使用 pop()；若誤用 pop(0) 則變成 BFS。(c) 需檢查新位置 (nr,nc) 的格子是否為牆壁 '#'，應寫 grid[nr][nc]（先確認邊界合法 0<=nr<rows 再取值）。",
    points: 5
  },

  // #18 dfs-pred-1 (1500) predict-line — 行號追蹤
  {
    id: 'dfs-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title:
      "給定 graph = {'A': ['B'], 'B': []}，執行 dfs(graph, 'A')。請填寫執行的行號序列（以空格分隔）。注意：for 迴圈有零次迭代時不計入序列。",
    code: dfsPredictCode,
    language: 'python',
    options: [],
    correctAnswer: '1 2 3 4 5 6 7 9 10 11 12 13 5 6 7 9 10 5 14',
    explanation:
      "初始（L1~L4）：def → visited=set() → stack=['A'] → result=[]。第一輪 curr='A'（L5 True→L6→L7 False→L9→L10）：graph['A']=['B']，nb='B'（L11→L12 True→L13，push 'B'）。第二輪 curr='B'（L5 True→L6→L7 False→L9→L10）：graph['B']=[] 零次迭代，L11 不計入。結束（L5 False→L14）：return ['A','B']。",
    points: 5
  }
];

export const dfsQuiz: PracticeQuiz = {
  levelId: 'dfs',
  levelName: '深度優先搜尋 (DFS)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-dfs-traversal',
      title: '題組：DFS 遍歷機制與回溯',
      description:
        'DFS 使用堆疊（Stack）的後進先出（LIFO）特性，沿著一條路徑盡可能深入，碰壁後才回溯。以下使用與 BFS 相同的有向圖，觀察兩種演算法的遍歷順序差異。',
      code: dfsSimplifiedCode,
      language: 'python',
      questionIds: ['dfs-group-1', 'dfs-group-2', 'dfs-group-3']
    }
  ]
};

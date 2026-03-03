import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

const bfsSimplifiedCode = `from collections import deque

# 測試用有向圖：
# A → B → D
# A → C → E
graph = {
    'A': ['B', 'C'],
    'B': ['D'],
    'C': ['E'],
    'D': [],
    'E': []
}

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    result = []
    while queue:
        curr = queue.popleft()
        result.append(curr)
        for nb in graph[curr]:
            if nb not in visited:
                visited.add(nb)
                queue.append(nb)
    return result`;

const bfsDistanceFillCode = `from collections import deque

def bfs_distance(graph, start):
    dist = {(a): 0}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for nb in graph[node]:
            if nb not in (b):
                dist[nb] = (c) + 1
                queue.append(nb)
    return dist`;

const bfsGridFillCode = `from collections import deque

def grid_bfs(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    visited = {start}
    queue = deque([(start, 0)])
    dirs = [(0,1),(0,-1),(1,0),(-1,0)]
    while queue:
        pos, steps = (a)
        row, col = pos
        if pos == end:
            return steps
        for dr, dc in dirs:
            nr, nc = row+dr, col+dc
            new_pos = (nr, nc)
            if 0<=nr<rows and 0<=nc<cols and (b)!='#' and new_pos not in visited:
                visited.add(new_pos)
                queue.append((new_pos, (c)+1))
    return -1`;

const bfsPredictCode = `from collections import deque

def bfs(graph, start):              # L1
    visited = set([start])          # L2
    queue = deque([start])          # L3
    result = []                     # L4
    while queue:                    # L5
        curr = queue.popleft()      # L6
        result.append(curr)         # L7
        for nb in graph[curr]:      # L8
            if nb not in visited:   # L9
                visited.add(nb)     # L10
                queue.append(nb)    # L11
    return result                   # L12`;

// --- 題目定義 ---

const questions: Question[] = [
  // 【Basic 基礎】800–950（5 題）

  // 1. bfs-q1 (800) 單選 — BFS 逐層策略
  {
    id: 'bfs-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: 'BFS（廣度優先搜尋）的核心搜尋策略為何？',
    options: [
      { id: 'A', text: '沿著一條路徑盡可能深入，直到無路可走才回溯' },
      { id: 'B', text: '從起始節點開始，先訪問所有距離為 1 的鄰居，再訪問距離為 2 的節點，以此類推' },
      { id: 'C', text: '隨機選擇未訪問的節點進行搜尋' },
      { id: 'D', text: '優先訪問權重最小的邊所連接的節點' }
    ],
    correctAnswer: 'B',
    explanation:
      'BFS 的核心特性是「逐層（Level by Level）」搜尋。使用佇列（Queue）的 FIFO 特性確保同一層的節點全部訪問完畢後，才進入下一層。選項 A 描述的是 DFS；D 描述的是 Dijkstra 最短路徑算法。',
    points: 1
  },

  // 2. bfs-tf-1 (850) 是非 — BFS 使用 Queue 且 FIFO 關鍵
  {
    id: 'bfs-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title:
      '若將 BFS 實作中的佇列（Queue，FIFO）改換為堆疊（Stack，LIFO），其搜尋行為將等同於 DFS（深度優先搜尋）。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation:
      '正確。BFS 的「逐層」特性完全依賴佇列的 FIFO：最先入隊的節點（較近的）最先被處理。若改用堆疊（LIFO），最後加入的鄰居反而最先被處理，演算法就會沿著一條路徑一路深入——這正是 DFS 的行為。',
    points: 1
  },

  // 3. bfs-q2 (900) 單選 — 最短路徑保證（對照加權圖限制）
  {
    id: 'bfs-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title:
      '在「無加權圖（Unweighted Graph）」中，BFS 從起點出發首次到達某個節點時，所走的路徑是最短路徑嗎？',
    options: [
      { id: 'A', text: '不一定，需要配合 Dijkstra 算法才能保證最短' },
      { id: 'B', text: '是的，BFS 保證首次到達時，走過的邊數是最少的' },
      { id: 'C', text: '不一定，取決於圖中節點的訪問順序' },
      { id: 'D', text: '只在節點數量少於 100 時才能保證' }
    ],
    correctAnswer: 'B',
    explanation:
      'BFS 以逐層方式擴展：第 k 層的節點必在所有第 k-1 層處理完後才被加入佇列。因此 BFS 第一次到達某節點時，所走的層數（邊數）必然是最少的。注意：在「加權圖」中，每條邊成本不同，邊數最少不等於總成本最低，此時需要 Dijkstra 算法。',
    points: 1
  },

  // 4. bfs-tf-2 (900) 是非 — 記憶體消耗比較
  {
    id: 'bfs-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title:
      '在「寬而淺（Wide and Shallow）」的圖中（例如每個節點有 1000 個鄰居），BFS 所需的記憶體空間通常比 DFS 更大。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation:
      '正確。BFS 的佇列在最壞情況下需存放整層節點，對寬廣的圖來說可能達到 O(V)。DFS 的遞迴深度（或手動堆疊大小）與圖的「深度」成正比，對寬而淺的圖反而佔用較少記憶體。反之，對「深而窄」的圖，DFS 可能反而佔用更多空間。',
    points: 1
  },

  // 5. bfs-q3 (950) 單選 — 為何提早標記 visited
  {
    id: 'bfs-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title:
      'BFS 實作中，為何要在「將節點加入佇列時」立即標記 visited，而非等到「從佇列取出後」才標記？',
    options: [
      { id: 'A', text: '這只是慣例寫法，兩種時機對結果沒有實際影響' },
      {
        id: 'B',
        text: '若等到取出才標記，同一節點可能被多個不同的鄰居重複加入佇列，造成重複處理'
      },
      { id: 'C', text: '提早標記可以加速 popleft() 操作的執行速度' },
      { id: 'D', text: 'Python 的語法規定必須在加入 deque 前先執行 set.add()' }
    ],
    correctAnswer: 'B',
    explanation:
      '考慮節點 W 同時是 Y 和 Z 的鄰居：若等到取出才標記，Y 被處理時 W 加入佇列但未標記；Z 被處理時 W 再次加入佇列。結果 W 被處理兩次，可能導致錯誤結果或效能浪費。提早在「入隊」時標記 visited，能確保每個節點最多只入隊一次。',
    points: 1
  },

  // 【Application 應用】1000–1250（8 題）

  // 6. bfs-group-1 (1000) 題組 — 第一步後 queue 內容
  {
    id: 'bfs-group-1',
    groupId: 'group-bfs-traversal',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title:
      '依據題組圖，執行 bfs(graph, \'A\') 的「第一步」（彈出 A 並處理其所有鄰居後），佇列（queue）的內容為何？',
    options: [
      { id: 'A', text: "['A', 'B', 'C']" },
      { id: 'B', text: "['B', 'C']" },
      { id: 'C', text: "['D', 'E']" },
      { id: 'D', text: "['B']" }
    ],
    correctAnswer: 'B',
    explanation:
      "初始：visited={'A'}, queue=['A']。彈出 A（取出 queue 最前端），處理鄰居 B 和 C：兩者均未在 visited 中，依序加入 visited 和 queue。第一步結束後：visited={'A','B','C'}，queue=['B', 'C']。",
    points: 2
  },

  // 7. bfs-q4 (1050) 單選 — 適用 BFS 的場景選擇
  {
    id: 'bfs-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '以下哪種情境最適合使用 BFS 而非 DFS？',
    options: [
      {
        id: 'A',
        text: '記憶體極為有限，且圖非常寬廣（每個節點有大量鄰居）'
      },
      {
        id: 'B',
        text: '找出無加權圖中，從起點 S 到終點 T 的最少邊數路徑'
      },
      {
        id: 'C',
        text: '在一個深度達數千層的遊戲決策樹中搜尋'
      },
      {
        id: 'D',
        text: '執行有向無環圖（DAG）的拓撲排序'
      }
    ],
    correctAnswer: 'B',
    explanation:
      "BFS 的逐層特性使其天然保證最短邊數，最適合無加權圖的最短路徑問題。選項 A：BFS 在寬廣圖中反而更耗記憶體（佇列可能很大），DFS 更省。選項 C：深度優先的 DFS 更省記憶體適合深樹。選項 D：拓撲排序通常用 DFS 或 Kahn's Algorithm。",
    points: 2
  },

  // 8. bfs-group-2 (1100) 題組 — 完整遍歷順序
  {
    id: 'bfs-group-2',
    groupId: 'group-bfs-traversal',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title:
      "依據題組圖，bfs(graph, 'A') 最終返回的 result（完整節點訪問順序）為何？",
    options: [
      { id: 'A', text: "['A', 'B', 'D', 'C', 'E']" },
      { id: 'B', text: "['A', 'B', 'C', 'D', 'E']" },
      { id: 'C', text: "['A', 'C', 'E', 'B', 'D']" },
      { id: 'D', text: "['A', 'D', 'E', 'B', 'C']" }
    ],
    correctAnswer: 'B',
    explanation:
      "BFS 逐層訪問：Level 0 = {A}；Level 1 = {B, C}（A 的鄰居，按 graph['A'] 順序）；Level 2 = {D, E}（B 的鄰居 D 先入隊，C 的鄰居 E 後入隊）。因此 result = ['A', 'B', 'C', 'D', 'E']。選項 A 的 D 在 C 前，那是 DFS 的行為（深入 B→D 後才回到 C）。",
    points: 2
  },

  // 9. bfs-q5 (1100) 單選 — 距離計算
  {
    id: 'bfs-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title:
      '在有向圖（A→B、A→C、B→D、C→E）中，若 BFS 從 A 出發並追蹤距離（起點距離為 0），以下哪個距離計算正確？',
    options: [
      { id: 'A', text: 'dist[B] = 2' },
      { id: 'B', text: 'dist[D] = 2' },
      { id: 'C', text: 'dist[C] = 2' },
      { id: 'D', text: 'dist[E] = 3' }
    ],
    correctAnswer: 'B',
    explanation:
      'BFS 距離追蹤：A=0（起點）→ B=1（A→B，1 條邊）→ C=1（A→C，1 條邊）→ D=2（A→B→D，2 條邊）→ E=2（A→C→E，2 條邊）。因此 dist[D]=2 正確。選項 A（dist[B]=2）有誤，實際 dist[B]=1；選項 C（dist[C]=2）有誤，實際 dist[C]=1；選項 D（dist[E]=3）有誤，實際 dist[E]=2。',
    points: 2
  },

  // 10. bfs-q6 (1150) 單選 — 格狀迷宮 BFS 原理
  {
    id: 'bfs-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '在格狀迷宮（Grid Maze）中，BFS 搜尋最短路徑的關鍵機制為何？',
    options: [
      { id: 'A', text: '先隨機走，走不通再回頭' },
      {
        id: 'B',
        text: '同時從起點和終點向中間搜尋（雙向 BFS）'
      },
      {
        id: 'C',
        text: '將每個格子視為圖的節點，相鄰可通行格子之間存在邊，BFS 的逐層擴展保證首次到達終點時路徑最短'
      },
      { id: 'D', text: '依照格子的座標大小順序訪問' }
    ],
    correctAnswer: 'C',
    explanation:
      "格狀迷宮 BFS 將每個可通行格子視為圖節點，上下左右（4-connectivity）或八個方向（8-connectivity）的相鄰格子之間有邊相連。BFS 從起點逐層擴展，第一次抵達終點時即為最短步數（每步距離相等的情況下）。選項 B 描述的「雙向 BFS」雖然存在，但它是進階最佳化技巧，不是「關鍵機制」。",
    points: 2
  },

  // 11. bfs-multi-1 (1200) 多選 — BFS 實際應用場景
  {
    id: 'bfs-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '以下哪些是 BFS 的實際應用場景？（多選）',
    options: [
      {
        id: 'opt1',
        text: '社交網路中尋找兩人之間的最短社交距離（Friend of a Friend）'
      },
      {
        id: 'opt2',
        text: '電腦網路路由中找到最少跳躍次數（Hop Count）的路徑'
      },
      {
        id: 'opt3',
        text: 'GPS 地圖中在「路況均等」情況下的路線規劃'
      },
      {
        id: 'opt4',
        text: '數獨（Sudoku）遊戲的解題程式（回溯搜尋）'
      }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt3'],
    explanation:
      'opt1：社交距離（如朋友的朋友相隔幾層）就是無加權圖的最短路徑問題，BFS 完美適用。opt2：網路路由的 hop count 是無加權邊的最短路徑，BFS 是基礎原型。opt3：當路段成本相等時，GPS 的最少轉彎或最少路段即為 BFS 場景。opt4 錯誤：數獨解題需要 DFS + 回溯（Backtracking），屬於深度優先的選擇樹，不是逐層擴展問題。',
    points: 2
  },

  // 12. bfs-q7 (1250) 單選 — 六度分隔理論
  {
    id: 'bfs-q7',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title:
      '「六度分隔理論（Six Degrees of Separation）」認為全球任兩人最多透過 6 個中間人相連。若要用 BFS 驗證兩個特定人物之間是否滿足此理論，BFS 最多搜尋到第幾層即可停止？',
    options: [
      { id: 'A', text: '第 3 層（距離 3）' },
      { id: 'B', text: '第 6 層（距離 6）' },
      { id: 'C', text: '第 7 層（距離 7）' },
      { id: 'D', text: '必須搜尋到所有節點才能確認' }
    ],
    correctAnswer: 'B',
    explanation:
      '「六度分隔」表示兩人之間最多有 6 條邊（6 個中間人）。BFS 的距離從 0（自己）開始：距離 1 = 直接朋友，距離 2 = 朋友的朋友，...，距離 6 = 「六度」關係。若 BFS 在搜尋到距離 6 時找到目標，代表滿足六度分隔。若距離超過 6 或搜尋完整個圖都找不到，則不滿足。因此最多搜尋第 6 層即可。',
    points: 2
  },

  // 【Complexity 進階】1300–1500（5 題）

  // 13. bfs-group-3 (1300) 題組 — fill-code BFS 距離追蹤
  {
    id: 'bfs-group-3',
    groupId: 'group-bfs-traversal',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title:
      '承接題組中的圖，請填入以下 BFS 距離追蹤函數中 (a)(b)(c) 缺失的部分。',
    code: bfsDistanceFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['start', 'dist', 'dist[node]'],
    explanation:
      '(a) 初始化距離字典，起始節點距離為 0，因此 key 應為 start。(b) 利用 dist 字典同時作為 visited 的判斷——若 nb 已在 dist 中，代表已被訪問過，不需要額外的 visited set。(c) 新鄰居的距離 = 當前節點距離 + 1，因此應填 dist[node]，實現逐層遞增。',
    points: 5
  },

  // 14. bfs-q8 (1350) 單選 — 空間複雜度分析
  {
    id: 'bfs-q8',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: 'BFS 的空間複雜度在最壞情況下為何？（V = 節點數）',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log V)' },
      { id: 'C', text: 'O(V)' },
      { id: 'D', text: 'O(V²)' }
    ],
    correctAnswer: 'C',
    explanation:
      'BFS 需要的額外空間包含：(1) 佇列（queue）：最壞情況（星狀圖，起點連到所有其他 V-1 個節點），一次全部進入佇列，需 O(V)。(2) visited 集合：最多存放所有 V 個節點，需 O(V)。因此整體空間複雜度為 O(V)。',
    points: 2
  },

  // 15. bfs-multi-2 (1400) 多選 — BFS 正確敘述
  {
    id: 'bfs-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '以下關於 BFS 的敘述，哪些是正確的？（多選）',
    options: [
      {
        id: 'opt1',
        text: '在「有向圖」中，若 BFS 從 A 出發可以到達 B，不代表從 B 出發也可以到達 A'
      },
      {
        id: 'opt2',
        text: '若圖以「鄰接矩陣（Adjacency Matrix）」表示，BFS 時間複雜度會升為 O(V²)'
      },
      {
        id: 'opt3',
        text: 'BFS 可以用來偵測無向圖是否存在環（Cycle）'
      },
      {
        id: 'opt4',
        text: '對同一個圖從同一起點執行 BFS，其遍歷順序是唯一確定的'
      }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt3'],
    explanation:
      'opt1 正確：有向圖中邊有方向性，可達性不對稱。opt2 正確：鄰接矩陣 BFS 需對每個節點掃描全部 V 個可能鄰居，總體 O(V²)，而鄰接表只需 O(V+E)。opt3 正確：BFS 遇到已 visited 且非父節點的節點，即代表有環（無向圖）。opt4 錯誤：BFS 遍歷順序取決於鄰居陣列的順序，鄰居若以不同順序儲存，遍歷結果可能不同。',
    points: 2
  },

  // 16. bfs-fill-1 (1450) fill-code — 格狀迷宮 BFS
  {
    id: 'bfs-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title:
      "以下是格狀迷宮 BFS 的實作。'#' 表示牆壁，BFS 找從 start 到 end 的最短步數。請填入 (a)(b)(c)。",
    code: bfsGridFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['queue.popleft()', 'grid[nr][nc]', 'steps'],
    explanation:
      "(a) BFS 必須用 popleft() 從佇列「前端」取出，維持 FIFO 順序，確保逐層搜尋。若用 pop()（後端）則變成 DFS。(b) 需要檢查新位置 (nr, nc) 的格子內容是否為牆壁 '#'，應寫 grid[nr][nc]。(c) 加入佇列時，新格子的步數 = 當前步數 + 1，應填 steps（而非 row 或 col，那是座標）。",
    points: 5
  },

  // 17. bfs-pred-1 (1500) predict-line — 行號追蹤
  {
    id: 'bfs-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title:
      "給定 graph = {'A': ['B', 'C'], 'B': [], 'C': []}，執行 bfs(graph, 'A')。請填寫執行的行號序列（以空格分隔）。注意：for 迴圈有零次迭代時不計入序列。",
    code: bfsPredictCode,
    language: 'python',
    options: [],
    correctAnswer: '1 2 3 4 5 6 7 8 9 10 11 8 9 10 11 5 6 7 5 6 7 5 12',
    explanation:
      "初始（L1~L4）：def → visited={'A'} → queue=['A'] → result=[]。第一輪 curr='A'（L5 True → L6 → L7）：遍歷 graph['A']=['B','C']。nb='B'（L8→L9 True→L10→L11），nb='C'（L8→L9 True→L10→L11）。第二輪 curr='B'（L5 True → L6 → L7）：graph['B']=[]，for 迴圈零次迭代，L8 不計入。第三輪 curr='C'（L5 True → L6 → L7）：同上，L8 不計入。結束（L5 False → L12）：返回 ['A','B','C']。",
    points: 5
  }
];

export const bfsQuiz: PracticeQuiz = {
  levelId: 'bfs',
  levelName: '廣度優先搜尋 (BFS)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-bfs-traversal',
      title: '題組：BFS 遍歷機制與距離追蹤',
      description:
        'BFS 使用佇列（Queue）逐層訪問節點，並可追蹤每個節點距起點的最短距離。請觀察以下有向圖和 BFS 實作，回答問題。',
      code: bfsSimplifiedCode,
      language: 'python',
      questionIds: ['bfs-group-1', 'bfs-group-2', 'bfs-group-3']
    }
  ]
};

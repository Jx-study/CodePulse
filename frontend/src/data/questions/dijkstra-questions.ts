import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

const dijkstraSimplifiedCode = `import heapq

# 測試用加權有向圖（節點 0 為起點）：
# 0 → 1 (權重 4), 0 → 2 (權重 2)
# 1 → 2 (權重 5), 1 → 3 (權重 10)
# 2 → 4 (權重 3)
# 4 → 3 (權重 4)
# 3 → 2 (權重 6)
graph = {
    0: [(1, 4), (2, 2)],
    1: [(2, 5), (3, 10)],
    2: [(4, 3)],
    3: [(2, 6)],
    4: [(3, 4)]
}

def dijkstra(graph, start):
    dist = {v: float('inf') for v in graph}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            new_d = dist[u] + w
            if new_d < dist[v]:
                dist[v] = new_d
                heapq.heappush(pq, (new_d, v))
    return dist`;

const dijkstraFillCode = `import heapq

def dijkstra(graph, start):
    dist = {(a): float('inf') for v in graph}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > (b):
            continue
        for v, w in graph[u]:
            new_d = dist[u] + (c)
            if new_d < dist[v]:
                dist[v] = new_d
                heapq.heappush(pq, (new_d, v))
    return dist`;

const dijkstraRelaxFillCode = `def dijkstra_relax(dist, u, v, weight):
    # 鬆弛操作：若透過 u 到 v 的距離更短，則更新 dist[v]
    alt = (a) + (b)
    if alt < dist[v]:
        dist[v] = (c)
        return True
    return False`;

const dijkstraPredictCode = `import heapq

def dijkstra(graph, start):           # L1
    dist = {v: float('inf') for v in graph}  # L2
    dist[start] = 0                   # L3
    pq = [(0, start)]                # L4
    while pq:                         # L5
        d, u = heapq.heappop(pq)     # L6
        if d > dist[u]:              # L7
            continue                 # L8
        for v, w in graph[u]:        # L9
            new_d = dist[u] + w       # L10
            if new_d < dist[v]:       # L11
                dist[v] = new_d       # L12
                heapq.heappush(pq, (new_d, v))  # L13
    return dist                       # L14`;

// --- 題目定義 ---

const questions: Question[] = [
  // 【Basic 基礎】800–950（5 題）

  // #1 dijkstra-q1 (800) 單選 — Dijkstra 核心策略
  {
    id: 'dijkstra-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: 'Dijkstra 演算法的核心貪婪策略為何？',
    options: [
      { id: 'A', text: '每次從未完成的節點中，選取距離起點「當前距離最小」的節點進行鬆弛' },
      { id: 'B', text: '先訪問所有直接鄰居，再逐層向外擴展（類似 BFS）' },
      { id: 'C', text: '沿一條路徑盡可能深入，碰壁後回溯（類似 DFS）' },
      { id: 'D', text: '隨機選擇未訪問節點，直到所有節點都被處理' }
    ],
    correctAnswer: 'A',
    explanation:
      'Dijkstra 的貪婪性質：每次都從「未確定最短路徑」的節點中，挑選目前距離起點最短的節點 u，將 u 標記為已確定，並對其所有鄰居執行鬆弛。此順序保證 u 的最短路徑已不會再被更新。選項 B 是 BFS；C 是 DFS。',
    points: 1
  },

  // #2 dijkstra-tf-1 (850) 是非 — 負權重邊
  {
    id: 'dijkstra-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title:
      'Dijkstra 演算法「不支援」圖中存在負權重邊（Negative Weight Edge）；若圖有負權重邊，需改用 Bellman-Ford 等演算法。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation:
      '正確。Dijkstra 的貪婪性質依賴「已確定的節點距離不再被更新」——一旦選出距離最小的節點並標記完成，就假設其最短路徑已定。負權重邊可能使已確定的節點透過另一條路徑變得更短，破壞此假設。Bellman-Ford 可處理負權重（含負環偵測）。',
    points: 1
  },

  // #3 dijkstra-q2 (900) 單選 — Dijkstra vs BFS
  {
    id: 'dijkstra-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: 'Dijkstra 與 BFS 的主要差異為何？',
    options: [
      { id: 'A', text: 'Dijkstra 使用堆疊，BFS 使用佇列' },
      {
        id: 'B',
        text: 'BFS 適用無加權圖（邊數最少即最短路徑）；Dijkstra 適用加權圖（需考慮邊的權重總和）'
      },
      { id: 'C', text: 'Dijkstra 可以處理負權重邊，BFS 不行' },
      { id: 'D', text: '兩者時間複雜度完全相同' }
    ],
    correctAnswer: 'B',
    explanation:
      'BFS 假設每條邊成本相同，逐層擴展天然保證「邊數最少」即最短路徑。加權圖中邊成本不同，邊數少不一定總成本低。Dijkstra 透過貪婪選取當前距離最小的節點並鬆弛鄰居，能正確處理非負權重加權圖的最短路徑。',
    points: 1
  },

  // #4 dijkstra-tf-2 (900) 是非 —  priority queue
  {
    id: 'dijkstra-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title:
      'Dijkstra 的實作核心需要「優先佇列（Priority Queue）」，用來高效取得目前距離最小的未完成節點；若改用普通佇列（FIFO），則無法正確求出加權圖的最短路徑。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation:
      '正確。Dijkstra 必須依「當前距離」遞增順序處理節點，否則貪婪性質失效。普通佇列（Queue）無法依距離排序；優先佇列（如最小堆）能在 O(log n) 取出最小元素，使整體複雜度為 O((V+E) log V)。',
    points: 1
  },

  // #5 dijkstra-q3 (950) 單選 — 鬆弛操作
  {
    id: 'dijkstra-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: 'Dijkstra 中的「鬆弛（Relaxation）」操作是在做什麼？',
    options: [
      { id: 'A', text: '將節點從未完成集合移至已完成集合' },
      {
        id: 'B',
        text: '對邊 (u,v)，檢查「dist[u] + weight(u,v)」是否小於 dist[v]，若是則更新 dist[v]'
      },
      { id: 'C', text: '將優先佇列中的所有元素重新排序' },
      { id: 'D', text: '移除圖中的負權重邊' }
    ],
    correctAnswer: 'B',
    explanation:
      '鬆弛即嘗試「經由 u 到 v 是否更短」：若 dist[u] + weight(u,v) < dist[v]，表示發現更短路徑，更新 dist[v]。這是最短路徑演算法的核心操作，Dijkstra 與 Bellman-Ford 皆使用此概念。',
    points: 1
  },

  // 【Application 應用】1000–1250（8 題）

  // #6 dijkstra-group-1 (1000) 題組 — 第一步後 dist 內容
  {
    id: 'dijkstra-group-1',
    groupId: 'group-dijkstra-path',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title:
      "依據題組圖（0 為起點），Dijkstra 執行「第一步」：取出節點 0 並鬆弛其鄰居後，dist 的內容為何？",
    options: [
      { id: 'A', text: '{0: 0, 1: ∞, 2: ∞, 3: ∞, 4: ∞}' },
      { id: 'B', text: '{0: 0, 1: 4, 2: 2, 3: ∞, 4: ∞}' },
      { id: 'C', text: '{0: 0, 1: 4, 2: 2, 3: 14, 4: 5}' },
      { id: 'D', text: '{0: 0, 1: 2, 2: 4, 3: ∞, 4: ∞}' }
    ],
    correctAnswer: 'B',
    explanation:
      "起點 dist[0]=0。節點 0 的鄰居：1 (權重 4)、2 (權重 2)。鬆弛：dist[1] = 0+4 = 4；dist[2] = 0+2 = 2。節點 3、4 尚無路徑，維持 ∞。因此 dist = {0: 0, 1: 4, 2: 2, 3: ∞, 4: ∞}。",
    points: 2
  },

  // #7 dijkstra-q4 (1050) 單選 — 適用場景
  {
    id: 'dijkstra-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '以下哪種情境最適合使用 Dijkstra 演算法？',
    options: [
      { id: 'A', text: '在社交網路中找出兩人之間的最少中間人數量（六度分隔）' },
      {
        id: 'B',
        text: '在地圖 App 中根據道路距離/時間找出從 A 地到 B 地的最短路徑'
      },
      { id: 'C', text: '在有負權重邊的圖中求單源最短路徑' },
      { id: 'D', text: '判斷圖中是否存在環（Cycle Detection）' }
    ],
    correctAnswer: 'B',
    explanation:
      '地圖道路有距離或時間權重，且通常為非負（不會有「負距離」），Dijkstra 完美適用。選項 A 是無加權圖，BFS 即可。選項 C 需 Bellman-Ford。選項 D 需 DFS 或 BFS 做環偵測。',
    points: 2
  },

  // #8 dijkstra-group-2 (1100) 題組 — 0 到 3 的最短距離
  {
    id: 'dijkstra-group-2',
    groupId: 'group-dijkstra-path',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title:
      "依據題組圖，從節點 0 到節點 3 的最短路徑距離為何？（0→2→4→3 或 0→1→3 等）",
    options: [
      { id: 'A', text: '10（路徑 0→1→3）' },
      { id: 'B', text: '9（路徑 0→2→4→3）' },
      { id: 'C', text: '14（路徑 0→1→2→4→3）' },
      { id: 'D', text: '5（路徑 0→2→3）' }
    ],
    correctAnswer: 'B',
    explanation:
      "0→2 (2) + 2→4 (3) + 4→3 (4) = 9。0→1→3 = 4+10 = 14 較長。0→2→3 不存在（2 的鄰居只有 4）。0→1→2→4→3 = 4+5+3+4 = 16。最短路徑為 0→2→4→3，距離 9。",
    points: 2
  },

  // #9 dijkstra-q5 (1100) 單選 — 提早結束
  {
    id: 'dijkstra-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title:
      '若只需知道「起點 S 到終點 T」的最短路徑，Dijkstra 可在何時提早結束以提升效能？',
    options: [
      { id: 'A', text: '只要 T 第一次被加入優先佇列即可結束' },
      {
        id: 'B',
        text: '當從優先佇列中「取出」T 時，表示 T 的最短路徑已確定，可提早結束'
      },
      { id: 'C', text: 'Dijkstra 無法提早結束，必須處理完所有節點' },
      { id: 'D', text: '當 dist[T] 第一次被更新時即可結束' }
    ],
    correctAnswer: 'B',
    explanation:
      'Dijkstra 的特性：從 PQ 取出的節點，其距離已確定為最短路徑。因此當 T 被取出時，dist[T] 即為 S 到 T 的最短路徑，無需繼續處理剩餘節點。選項 A、D 時機過早，T 的距離可能還會被鬆弛更新。',
    points: 2
  },

  // #10 dijkstra-q6 (1150) 單選 — d > dist[u] 的 continue
  {
    id: 'dijkstra-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title:
      '在 Dijkstra 的實作中，heappop 取出 (d, u) 後，為何要檢查「if d > dist[u]: continue」？',
    options: [
      { id: 'A', text: '避免重複處理同一節點，純粹為了正確性' },
      {
        id: 'B',
        text: '因為同一節點可能多次入堆（每次發現更短路徑就 push），此時堆中可能留有舊的較大距離的副本，應跳過'
      },
      { id: 'C', text: '這是為了偵測負權重環' },
      { id: 'D', text: '若不加這段，會導致程式崩潰' }
    ],
    correctAnswer: 'B',
    explanation:
      '每次鬆弛成功時會 push (new_d, v)，同一節點 v 可能有多個 (d, v) 在堆中（懶惰刪除 Lazy Deletion）。先取出的常是較舊、較大的 d。若 d > dist[u]，表示 u 的最短路徑已由後續的鬆弛更新過，當前副本已過時，直接跳過。',
    points: 2
  },

  // #11 dijkstra-q7 (1150) 單選 — 有向 vs 無向
  {
    id: 'dijkstra-q7',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: 'Dijkstra 能否同時處理「有向圖」與「無向圖」？',
    options: [
      { id: 'A', text: '只能處理有向圖，無向圖需先轉為有向圖' },
      {
        id: 'B',
        text: '兩者皆可。無向圖可視為雙向有向圖，每條無向邊 (u,v) 建兩條有向邊 u→v、v→u 即可'
      },
      { id: 'C', text: '只能處理無向圖' },
      { id: 'D', text: 'Dijkstra 不支援圖結構，只能處理樹' }
    ],
    correctAnswer: 'B',
    explanation:
      'Dijkstra 本質是處理加權有向圖；無向圖的邊 (u,v) 可視為 u↔v 雙向，建鄰接表時分別加入 u→v 與 v→u，權重相同。演算法本身不需修改，僅在讀圖時區分有向/無向的建邊方式。',
    points: 2
  },

  // #12 dijkstra-multi-1 (1200) 多選 — Dijkstra 應用
  {
    id: 'dijkstra-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '以下哪些是 Dijkstra 的典型應用場景？（多選）',
    options: [
      {
        id: 'opt1',
        text: 'GPS 導航系統中計算從出發地到目的地的最短路徑（依距離或預估時間）'
      },
      {
        id: 'opt2',
        text: '電腦網路中的 OSPF 路由協定（Open Shortest Path First）'
      },
      {
        id: 'opt3',
        text: '在存在負權重邊（如可獲利的套匯路徑）的圖中求最短路徑'
      },
      {
        id: 'opt4',
        text: '遊戲地圖中根據地形權重（沼澤較慢、平地較快）計算單位移動成本最小路徑'
      }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt4'],
    explanation:
      'opt1、opt2、opt4 皆為非負權重加權圖的最短路徑問題，Dijkstra 適用。opt3 錯誤：負權重需 Bellman-Ford；套匯、最長路徑等問題需不同演算法。',
    points: 2
  },

  // #13 dijkstra-q8 (1250) 單選 — 單源最短路徑
  {
    id: 'dijkstra-q8',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title: '「單源最短路徑（Single-Source Shortest Path）」的含意為何？',
    options: [
      { id: 'A', text: '圖中只有一條最短路徑' },
      {
        id: 'B',
        text: '從「單一指定起點」到圖中所有其他節點的最短路徑'
      },
      { id: 'C', text: '每對節點之間的最短路徑（All-Pairs Shortest Path）' },
      { id: 'D', text: '只計算起點到終點的一條路徑' }
    ],
    correctAnswer: 'B',
    explanation:
      '單源（Single-Source）即指定一個起點 S，目標是求出 S 到圖中每個可達節點 v 的最短距離 dist[v]。Dijkstra 與 Bellman-Ford 皆解決此問題。若需求是「每對節點」的最短距離，則需 Floyd-Warshall 或執行 V 次 Dijkstra。',
    points: 2
  },

  // 【Complexity 進階】1300–1500（5 題）

  // #14 dijkstra-group-3 (1300) 題組 — fill-code
  {
    id: 'dijkstra-group-3',
    groupId: 'group-dijkstra-path',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title: '請填入以下 Dijkstra 實作中 (a)(b)(c) 缺失的部分。',
    code: dijkstraFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['v', 'dist[u]', 'w'],
    explanation:
      '(a) 初始化距離字典，對圖中每個節點 v 設為無窮大，key 應為 v。(b) 若堆中取出的 d 大於目前 dist[u]，表示此為過時副本，應跳過；故填 dist[u]。(c) 新距離 = 當前節點距離 + 邊權重，應填 w。',
    points: 5
  },

  // #15 dijkstra-q9 (1350) 單選 — 時間複雜度
  {
    id: 'dijkstra-q9',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title:
      '使用二元堆（Binary Heap）實作優先佇列時，Dijkstra 的時間複雜度為何？（V=節點數，E=邊數）',
    options: [
      { id: 'A', text: 'O(V + E)' },
      { id: 'B', text: 'O(V²)' },
      { id: 'C', text: 'O((V + E) log V)' },
      { id: 'D', text: 'O(V log E)' }
    ],
    correctAnswer: 'C',
    explanation:
      '每個節點最多 extractMin 一次：O(V log V)。每條邊最多觸發一次鬆弛，若鬆弛成功則 heappush：O(E log V)。總計 O((V+E) log V)。若使用 Fibonacci Heap 可達 O(E + V log V)，但常數較大，實務上常用二元堆。',
    points: 2
  },

  // #16 dijkstra-multi-2 (1400) 多選 — 正確敘述
  {
    id: 'dijkstra-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '以下關於 Dijkstra 的敘述，哪些是正確的？（多選）',
    options: [
      {
        id: 'opt1',
        text: 'Dijkstra 的貪婪性質保證：一旦某節點被選為「當前距離最小」並完成鬆弛，其最短路徑即已確定'
      },
      {
        id: 'opt2',
        text: '若圖中所有邊權重皆為 1，Dijkstra 的行為與 BFS 等價（均為逐「層」擴展）'
      },
      {
        id: 'opt3',
        text: 'Dijkstra 可用於求最長路徑（將權重取負後執行）'
      },
      {
        id: 'opt4',
        text: '空間複雜度為 O(V)，主要用於 dist 陣列、visited 標記及優先佇列'
      }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt4'],
    explanation:
      'opt1 正確：此為貪婪正確性的核心。opt2 正確：權重皆為 1 時，距離=邊數，Dijkstra 等同 BFS 層序。opt3 錯誤：取負後產生負權重，Dijkstra 不適用。opt4 正確：dist O(V)、PQ 最壞 O(V)、visited O(V)，總計 O(V)。',
    points: 2
  },

  // #17 dijkstra-fill-1 (1450) fill-code — 鬆弛函數
  {
    id: 'dijkstra-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title: '請填入以下鬆弛函數中 (a)(b)(c) 缺失的部分。',
    code: dijkstraRelaxFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['dist[u]', 'weight', 'alt'],
    explanation:
      '(a) 候選路徑距離 = 當前節點 u 的最短距離 + 邊的權重，應填 dist[u]。(b) 加上邊 (u,v) 的成本，應填 weight。(c) 鬆弛成功後，需將 v 的距離更新為計算好的候選值，應填 alt（即 dist[u] + weight）。',
    points: 5
  },

  // #18 dijkstra-pred-1 (1500) predict-line — 行號追蹤
  {
    id: 'dijkstra-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title:
      "給定 graph = {'A': [('B', 5), ('C', 2)], 'C': [('B', 1)], 'B': []}，執行 dijkstra(graph, 'A')。請填寫執行的行號序列（以空格分隔）。注意：for 迴圈有零次迭代時不計入序列。",
    code: dijkstraPredictCode,
    language: 'python',
    options: [],
    correctAnswer: '1 2 3 4 5 6 7 9 10 11 12 13 9 10 11 12 13 5 6 7 9 10 11 12 13 5 6 7 5 6 7 8 5 14',
    explanation:
      "初始（L1~L4）：dist={'A':∞,'C':∞,'B':∞}→dist['A']=0→pq=[(0,'A')]。\n第1輪 pop(0,'A')（L5,L6）：L7(0>0?No)→('B',5)(L9,L10,L11 True,L12,L13)→('C',2)(L9,L10,L11 True,L12,L13)，dist={'A':0,'B':5,'C':2}，pq=[(2,'C'),(5,'B')]。\n第2輪 pop(2,'C')（L5,L6）：L7(2>2?No)→('B',1)(L9,L10 nd=3,L11 3<5 True,L12,L13)，dist['B']=3，pq=[(3,'B'),(5,'B')]。\n第3輪 pop(3,'B')（L5,L6）：L7(3>3?No)→graph['B']=[]，for 零次迭代不計→回 L5。\n第4輪 pop(5,'B')（L5,L6）：L7(5>dist['B']=3? YES)→L8(continue)→回 L5。\nL5(False)→L14 return。【關鍵】L8 的 continue 正是 Lazy Deletion 機制：跳過 PQ 中殘留的過期舊記錄。",
    points: 5
  }
];

export const dijkstraQuiz: PracticeQuiz = {
  levelId: 'dijkstra',
  levelName: 'Dijkstra 最短路徑',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-dijkstra-path',
      title: '題組：Dijkstra 在加權圖中的最短路徑',
      description:
        'Dijkstra 使用優先佇列每次選取距離最小的節點進行鬆弛，逐步確定各節點的最短路徑。請觀察以下加權有向圖與實作，回答問題。',
      code: dijkstraSimplifiedCode,
      language: 'python',
      questionIds: ['dijkstra-group-1', 'dijkstra-group-2', 'dijkstra-group-3']
    }
  ]
};

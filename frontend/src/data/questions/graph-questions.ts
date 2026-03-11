import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

// 1. 廣度優先搜尋 (BFS) 完整實作 (用於題組顯示)
const bfsCode = `def check_connected(graph, start_node):
    visited = set([start_node])
    queue = [start_node]
    
    while queue:
        curr = queue.pop(0)
        for neighbor in graph[curr]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
                
    # 如果走訪過的節點數等於圖的總節點數，代表全部連通
    return len(visited) == len(graph)`;

// 2. 廣度優先搜尋 (BFS) Fill-code 版本
const bfsFillCode = `def check_connected(graph, start_node):
    visited = set([start_node])
    queue = [(a)]
    
    while queue:
        curr = queue.(b)
        for neighbor in graph[curr]:
            if neighbor not in (c):
                visited.add(neighbor)
                queue.append(neighbor)
                
    return len(visited) == len(graph)`;

// 3. DFS 偵測環 Fill-code 版本
const dfsCycleFillCode = `def dfs_cycle(curr, visited, rec_stack, graph):
    visited.add(curr)
    rec_stack.add(curr)
    
    for neighbor in graph[curr]:
        if neighbor not in visited:
            if dfs_cycle(neighbor, visited, rec_stack, graph):
                return True
        elif neighbor in (a):           # 若鄰居已在目前的遞迴路徑中
            return (b)                  # 發現環！
            
    rec_stack.remove((c))               # 回溯，離開節點
    return False`;

// 4. 計算入度 Predict-line 版本 (含行號)
const inDegreePredictCode = `def get_in_degree(graph_dict, target):          # L1
    in_degree = 0                               # L2
    for node in graph_dict:                     # L3 (依序取出 A, B, C)
        if target in graph_dict[node]:          # L4
            in_degree += 1                      # L5
    return in_degree                            # L6`;

// --- 題目定義 ---

const questions: Question[] = [
  // 【Basic 基礎】 800-950
  {
    id: 'graph-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '圖 (Graph) 是一種非線性的資料結構，由節點 (Vertex/Node) 與邊 (Edge) 所組成，用來表示物件與物件之間的關係。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '這是圖的最基本定義。例如：地圖上的城市(節點)與道路(邊)、社群網路中的人(節點)與好友關係(邊)，都能用圖來建模。',
    points: 1
  },
  {
    id: 'graph-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '若圖中的邊「具有方向性」（例如 A 指向 B，但不代表 B 指向 A），這種圖稱為什麼？',
    options: [
      { id: 'A', text: '無向圖 (Undirected Graph)' },
      { id: 'B', text: '有向圖 (Directed Graph)' },
      { id: 'C', text: '加權圖 (Weighted Graph)' },
      { id: 'D', text: '完全圖 (Complete Graph)' }
    ],
    correctAnswer: 'B',
    explanation: '有向圖的邊 (A -> B) 只能單向通行，常用來表示如網頁連結、追蹤者關係等單向邏輯。',
    points: 1
  },
  {
    id: 'graph-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: '在「無向圖」中，與某個節點直接相連的邊的總數，稱為該節點的什麼？',
    options: [
      { id: 'A', text: '高度 (Height)' },
      { id: 'B', text: '權重 (Weight)' },
      { id: 'C', text: '深度 (Depth)' },
      { id: 'D', text: '度數 (Degree)' }
    ],
    correctAnswer: 'D',
    explanation: 'Degree (度數) 代表一個節點擁有的邊數。在有向圖中，則會進一步細分為入度 (In-Degree) 和出度 (Out-Degree)。',
    points: 1
  },
  {
    id: 'graph-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '在「有向圖」中，指向目標節點的邊的數量，被稱為什麼？',
    options: [
      { id: 'A', text: '出度 (Out-Degree)' },
      { id: 'B', text: '入度 (In-Degree)' },
      { id: 'C', text: '總度數 (Total Degree)' },
      { id: 'D', text: '連通度 (Connectivity)' }
    ],
    correctAnswer: 'B',
    explanation: '入度 (In-Degree) 是指「進入」該節點的邊數；出度 (Out-Degree) 則是指從該節點「出去」的邊數。',
    points: 1
  },
  {
    id: 'graph-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '若一個圖中存在一條路徑，其起點與終點為同一個節點，且路徑長度大於 0，這稱為「環 (Cycle)」。',
    options: [{ id: 'true', text: '正確' }, { id: 'false', text: '錯誤' }],
    correctAnswer: 'true',
    explanation: '環 (Cycle) 是圖論中非常重要的概念，代表圖中存在封閉的迴路。沒有任何環的圖稱為無環圖 (Acyclic Graph)，例如樹 (Tree) 就是一種特殊的無環連通圖。',
    points: 1
  },

  // 【Application 應用】 1000-1250
  {
    id: 'graph-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title: '實務上儲存「稀疏圖 (Sparse Graph，節點很多但邊很少)」時，為了節省記憶體空間，最常使用哪種底層結構？',
    options: [
      { id: 'A', text: '鄰接矩陣 (Adjacency Matrix)' },
      { id: 'B', text: '鄰接表 (Adjacency List)' },
      { id: 'C', text: '二元搜尋樹 (BST)' },
      { id: 'D', text: '雜湊表 (Hash Table)' }
    ],
    correctAnswer: 'B',
    explanation: '鄰接表只儲存實際存在的邊，空間複雜度為 O(V+E)，非常適合稀疏圖。鄰接矩陣無論邊有多少，都需要 O(V²) 的空間，會造成嚴重的記憶體浪費。',
    points: 1
  },
  {
    id: 'graph-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '若要實作圖的「深度優先搜尋 (DFS)」，演算法的底層（或手動實作時）通常必須搭配哪一種資料結構？',
    options: [
      { id: 'A', text: '佇列 (Queue)' },
      { id: 'B', text: '堆疊 (Stack)' },
      { id: 'C', text: '最小堆積 (Min Heap)' },
      { id: 'D', text: '雜湊集 (Hash Set)' }
    ],
    correctAnswer: 'B',
    explanation: 'DFS 採用「不撞南牆不回頭」的策略，必須記錄上一層的節點以便回溯 (Backtracking)。這符合後進先出 (LIFO) 的特性，因此依賴作業系統的 Call Stack（遞迴）或手動維護的 Stack。',
    points: 1
  },
  {
    id: 'graph-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '給定節點數為 V、邊數為 E 的圖（使用鄰接表儲存），進行一次完整的 BFS 或 DFS 遍歷，其時間複雜度為？',
    options: [
      { id: 'A', text: 'O(V)' },
      { id: 'B', text: 'O(E)' },
      { id: 'C', text: 'O(V + E)' },
      { id: 'D', text: 'O(V²)' }
    ],
    correctAnswer: 'C',
    explanation: '在完整的遍歷中，每個節點 (V) 都會被訪問一次，且每條邊 (E) 也都會被檢查一次，因此總時間複雜度為 O(V + E)。',
    points: 2
  },
  {
    id: 'graph-group-1',
    groupId: 'group-graph-bfs',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '根據上述程式碼，BFS 採用「逐層向外擴張」的策略。這個特性使得 BFS 在無權圖 (Unweighted Graph) 中，特別適合用來尋找什麼？',
    options: [
      { id: 'A', text: '圖中是否存在環 (Cycle)' },
      { id: 'B', text: '起點到目標節點的最短路徑 (最少邊數)' },
      { id: 'C', text: '所有節點的拓撲排序' },
      { id: 'D', text: '圖的最大深度' }
    ],
    correctAnswer: 'B',
    explanation: '因為 BFS 是一層一層往外找，所以當它第一次遇到目標節點時，所走過的層數（邊數）必定是起點到該節點的「最短路徑」。',
    points: 2
  },
  {
    id: 'graph-group-2',
    groupId: 'group-graph-bfs',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '如果圖中包含一個不與起點相連的「孤島節點」(即圖不連通)，此 check_connected 函數最終會回傳什麼？',
    options: [
      { id: 'A', text: 'True' },
      { id: 'B', text: 'False' },
      { id: 'C', text: '拋出 IndexError' },
      { id: 'D', text: '陷入無限迴圈' }
    ],
    correctAnswer: 'B',
    explanation: '因為起點無法抵達孤島節點，該孤島不會被加入 visited 集合中。最終 len(visited) 會小於 len(graph)，函數回傳 False，正確指出該圖不連通。',
    points: 2
  },
  {
    id: 'graph-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '關於「鄰接矩陣 (Adjacency Matrix)」的敘述，以下哪些是正確的？（多選）',
    options: [
      { id: 'opt1', text: '空間複雜度為 O(V²)，其中 V 是節點數' },
      { id: 'opt2', text: '查詢兩個特定節點之間是否存在邊，只需 O(1) 的時間' },
      { id: 'opt3', text: '適合用來儲存邊數非常少的「稀疏圖」' },
      { id: 'opt4', text: '無向圖的鄰接矩陣必定是對稱矩陣' }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt4'],
    explanation: '鄰接矩陣是一個 V x V 的二維陣列，占用 O(V²) 空間 (opt1 正確)，可以直接透過 array[i][j] 檢查邊是否存在 (O(1)，opt2 正確)。若為無向圖，A 連到 B 等同 B 連到 A，因此矩陣對稱 (opt4 正確)。由於極耗空間，它只適合「稠密圖」，不適合「稀疏圖」 (opt3 錯誤)。',
    points: 2
  },
  {
    id: 'graph-q-topo',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '「拓撲排序 (Topological Sort)」只能在哪種類型的圖上執行？',
    options: [
      { id: 'A', text: '無向圖 (Undirected Graph)' },
      { id: 'B', text: '有向無環圖 (DAG, Directed Acyclic Graph)' },
      { id: 'C', text: '加權圖 (Weighted Graph)' },
      { id: 'D', text: '任意有向圖（含環）' }
    ],
    correctAnswer: 'B',
    explanation: '拓撲排序的前提是圖必須是「有向無環圖 (DAG)」。若圖中存在環，則節點之間有循環依賴，無法建立合法的線性排序。\n常見應用：工作排程、程式編譯依賴、課程修習順序等。\nA 錯：無向圖沒有方向性，拓撲排序無意義。C/D 錯：加權或含環圖均不滿足前提條件。',
    points: 2
  },
  {
    id: 'graph-q7',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title: '在有向圖中（假設節點數為 V，邊數為 E），計算一個節點的「出度 (Out-Degree)」，若使用鄰接表 (Adjacency List) 儲存，時間複雜度是多少？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(V)' },
      { id: 'C', text: 'O(E)' },
      { id: 'D', text: '與該節點的鄰居數量成正比' }
    ],
    correctAnswer: 'D',
    explanation: '在鄰接表中，只需讀取該節點對應的陣列 (List) 長度即可。如果只是取得長度，時間為 O(1)；如果要走訪列出所有指向的節點，則時間與其鄰居數量成正比。',
    points: 2
  },

  // 【Complexity 進階/複雜度】 1300-1500
  {
    id: 'graph-group-3',
    groupId: 'group-graph-bfs',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title: '請填寫 BFS 程式碼中 (a)(b)(c) 缺失的變數或方法名稱（注意 Python 語法）。',
    code: bfsFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['start_node', 'pop(0)', 'visited'],
    explanation: '(a) Queue 初始需放入起點 start_node。(b) 使用 pop(0) 模擬 Dequeue 操作，取出佇列最前面的元素。(c) 檢查 neighbor 是否尚未被訪問過 (not in visited)。',
    points: 5
  },
  {
    id: 'graph-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: '關於在圖中「偵測環 (Cycle Detection)」的演算法，以下哪些觀念是正確的？（多選）',
    options: [
      { id: 'opt1', text: '無向圖可以使用 DFS，只要走到已經 visited 且不是自己 parent (父節點) 的節點，就代表有環。' },
      { id: 'opt2', text: '有向圖的 DFS 找環，通常需要額外維護一個 recursion stack (遞迴堆疊) 集合，來確認是否走回當前路徑中的節點。' },
      { id: 'opt3', text: 'BFS 完全無法用來偵測圖中是否有環。' },
      { id: 'opt4', text: '若一個圖有 V 個節點且邊數 E >= V，則該無向連通圖必然存在至少一個環。' }
    ],
    correctAnswer: ['opt1', 'opt2', 'opt4'],
    explanation: 'DFS 是最常用來找環的方法 (opt1, opt2 正確)。一棵 V 個節點的樹最多只能有 V-1 條邊，只要邊數達到 V 條，必然會產生環 (opt4 正確)。BFS 其實也可以用來找環 (例如紀錄 parent 或使用拓撲排序 Kahn\'s Algorithm)，所以 opt3 錯誤。',
    points: 2
  },
  {
    id: 'graph-q8',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '在一個以「鄰接表 (Adjacency List)」儲存的「有向圖」中（假設節點數為 V，邊數為 E），若要計算特定目標節點的「入度 (In-Degree)」，最壞情況的時間複雜度是多少？',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(V)' },
      { id: 'C', text: 'O(E)' },
      { id: 'D', text: 'O(V + E)' }
    ],
    correctAnswer: 'D',
    explanation: '因為鄰接表只記錄了「誰指向誰 (出度)」，沒有記錄「誰被誰指 (入度)」。要算入度，必須掃描整張圖的所有節點 (V) 及其所有邊 (E)，檢查目標節點是否出現在別人的鄰居陣列中，因此複雜度為 O(V + E)。',
    points: 2
  },
  {
    id: 'graph-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title: '以下是利用 DFS 偵測「有向圖」是否有環的核心程式碼。請填入 (a)(b)(c) 處正確的變數。',
    code: dfsCycleFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['rec_stack', 'True', 'curr'],
    explanation: '(a) 發現已訪問的鄰居時，如果它還在 rec_stack 裡，代表我們繞了一圈回到當前路徑的祖先，即發生環。(b) 發現環，回傳 True。(c) 該節點的分支全探索完畢，進行回溯 (Backtrack)，將 curr 從 rec_stack 移除。',
    points: 5
  },
  {
    id: 'graph-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title: '給定有向圖 graph = {\'A\': [\'B\'], \'B\': [\'C\'], \'C\': [\'B\']}。呼叫 get_in_degree(graph, \'B\') 計算節點 B 的入度。請依序填寫執行的行號序列（以空格分隔）。',
    code: inDegreePredictCode,
    language: 'python',
    options: [],
    correctAnswer: '1 2 3 4 5 3 4 3 4 5 6',
    explanation: '初始化(L1,L2)。迴圈 A (L3) -> \'B\' in [\'B\'](L4) -> +1(L5)。迴圈 B (L3) -> \'B\' in [\'C\']為假(L4)。迴圈 C (L3) -> \'B\' in [\'B\'](L4) -> +1(L5)。迴圈結束 -> return 2(L6)。序列為 1 2 3 4 5 3 4 3 4 5 6。',
    points: 5
  }
];

export const graphQuiz: PracticeQuiz = {
  levelId: 'graph',
  levelName: '圖 (Graph)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-graph-bfs',
      title: '題組：廣度優先搜尋與連通性 (BFS & Connectivity)',
      description: '教學區使用廣度優先搜尋 (BFS) 來檢查圖的「連通性」。以下是基於鄰接表 (Adjacency List) 實作的 BFS 檢查程式碼，請閱讀後回答問題。',
      code: bfsCode,
      language: 'python',
      questionIds: ['graph-group-1', 'graph-group-2', 'graph-group-3']
    }
  ]
};
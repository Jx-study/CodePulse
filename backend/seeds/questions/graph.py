BFS_CODE = """def check_connected(graph, start_node):
    visited = set([start_node])
    queue = [start_node]

    while queue:
        curr = queue.pop(0)
        for neighbor in graph[curr]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    # 如果走訪過的節點數等於圖的總節點數，代表全部連通
    return len(visited) == len(graph)"""

BFS_FILL_CODE = """def check_connected(graph, start_node):
    visited = set([start_node])
    queue = [(a)]

    while queue:
        curr = queue.(b)
        for neighbor in graph[curr]:
            if neighbor not in (c):
                visited.add(neighbor)
                queue.append(neighbor)

    return len(visited) == len(graph)"""

DFS_CYCLE_FILL_CODE = """def dfs_cycle(curr, visited, rec_stack, graph):
    visited.add(curr)
    rec_stack.add(curr)

    for neighbor in graph[curr]:
        if neighbor not in visited:
            if dfs_cycle(neighbor, visited, rec_stack, graph):
                return True
        elif neighbor in (a):           # 若鄰居已在目前的遞迴路徑中
            return (b)                  # 發現環！

    rec_stack.remove((c))               # 回溯，離開節點
    return False"""

IN_DEGREE_PREDICT_CODE = """def get_in_degree(graph_dict, target):          # L1
    in_degree = 0                               # L2
    for node in graph_dict:                     # L3 (依序取出 A, B, C)
        if target in graph_dict[node]:          # L4
            in_degree += 1                      # L5
    return in_degree                            # L6"""

DATA = {
    "slug": "graph",
    "groups": [
        {
            "id": "group-graph-bfs",
            "translations": {
                "zh-TW": {
                    "title": "題組：廣度優先搜尋與連通性 (BFS & Connectivity)",
                    "description": "教學區使用廣度優先搜尋 (BFS) 來檢查圖的「連通性」。以下是基於鄰接表 (Adjacency List) 實作的 BFS 檢查程式碼，請閱讀後回答問題。",
                },
                "en": {
                    "title": "Group: Breadth-First Search & Connectivity (BFS & Connectivity)",
                    "description": "The tutorial uses BFS to check graph connectivity. The following BFS implementation is based on an adjacency list. Read the code and answer the questions.",
                },
            },
            "code": BFS_CODE,
            "language": "python",
        }
    ],
    "questions": [
        {
            "id": "graph-tf-1",
            "type": "true-false",
            "baseRating": 800,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "圖 (Graph) 是一種非線性的資料結構，由節點 (Vertex/Node) 與邊 (Edge) 所組成，用來表示物件與物件之間的關係。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "這是圖的最基本定義。例如：地圖上的城市(節點)與道路(邊)、社群網路中的人(節點)與好友關係(邊)，都能用圖來建模。",
                },
                "en": {
                    "title": "A Graph is a non-linear data structure composed of vertices (nodes) and edges, used to represent relationships between objects.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "This is the most basic definition of a graph. Examples: cities (nodes) and roads (edges) on a map; people (nodes) and friendships (edges) in a social network.",
                },
            },
        },
        {
            "id": "graph-q1",
            "type": "single-choice",
            "baseRating": 800,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若圖中的邊「具有方向性」（例如 A 指向 B，但不代表 B 指向 A），這種圖稱為什麼？",
                    "options": [
                        {"id": "A", "text": "無向圖 (Undirected Graph)"},
                        {"id": "B", "text": "有向圖 (Directed Graph)"},
                        {"id": "C", "text": "加權圖 (Weighted Graph)"},
                        {"id": "D", "text": "完全圖 (Complete Graph)"},
                    ],
                    "explanation": "有向圖的邊 (A -> B) 只能單向通行，常用來表示如網頁連結、追蹤者關係等單向邏輯。",
                },
                "en": {
                    "title": "If the edges in a graph have direction (e.g., A points to B but not vice versa), what is this type of graph called?",
                    "options": [
                        {"id": "A", "text": "Undirected Graph"},
                        {"id": "B", "text": "Directed Graph"},
                        {"id": "C", "text": "Weighted Graph"},
                        {"id": "D", "text": "Complete Graph"},
                    ],
                    "explanation": "A directed graph's edges (A -> B) are one-way, commonly used to represent web links, follower relationships, and other unidirectional logic.",
                },
            },
        },
        {
            "id": "graph-q2",
            "type": "single-choice",
            "baseRating": 850,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "在「無向圖」中，與某個節點直接相連的邊的總數，稱為該節點的什麼？",
                    "options": [
                        {"id": "A", "text": "高度 (Height)"},
                        {"id": "B", "text": "權重 (Weight)"},
                        {"id": "C", "text": "深度 (Depth)"},
                        {"id": "D", "text": "度數 (Degree)"},
                    ],
                    "explanation": "Degree (度數) 代表一個節點擁有的邊數。在有向圖中，則會進一步細分為入度 (In-Degree) 和出度 (Out-Degree)。",
                },
                "en": {
                    "title": "In an undirected graph, the total number of edges directly connected to a node is called its what?",
                    "options": [
                        {"id": "A", "text": "Height"},
                        {"id": "B", "text": "Weight"},
                        {"id": "C", "text": "Depth"},
                        {"id": "D", "text": "Degree"},
                    ],
                    "explanation": "Degree represents the number of edges a node has. In directed graphs, this is further split into In-Degree and Out-Degree.",
                },
            },
        },
        {
            "id": "graph-q3",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在「有向圖」中，指向目標節點的邊的數量，被稱為什麼？",
                    "options": [
                        {"id": "A", "text": "出度 (Out-Degree)"},
                        {"id": "B", "text": "入度 (In-Degree)"},
                        {"id": "C", "text": "總度數 (Total Degree)"},
                        {"id": "D", "text": "連通度 (Connectivity)"},
                    ],
                    "explanation": "入度 (In-Degree) 是指「進入」該節點的邊數；出度 (Out-Degree) 則是指從該節點「出去」的邊數。",
                },
                "en": {
                    "title": "In a directed graph, the number of edges pointing toward a target node is called what?",
                    "options": [
                        {"id": "A", "text": "Out-Degree"},
                        {"id": "B", "text": "In-Degree"},
                        {"id": "C", "text": "Total Degree"},
                        {"id": "D", "text": "Connectivity"},
                    ],
                    "explanation": "In-Degree is the count of edges entering a node; Out-Degree is the count of edges leaving a node.",
                },
            },
        },
        {
            "id": "graph-tf-2",
            "type": "true-false",
            "baseRating": 950,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "若一個圖中存在一條路徑，其起點與終點為同一個節點，且路徑長度大於 0，這稱為「環 (Cycle)」。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "環 (Cycle) 是圖論中非常重要的概念，代表圖中存在封閉的迴路。沒有任何環的圖稱為無環圖 (Acyclic Graph)，例如樹 (Tree) 就是一種特殊的無環連通圖。",
                },
                "en": {
                    "title": "If a graph contains a path where the start and end node are the same, and the path length is greater than 0, this is called a 'Cycle'.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "A Cycle is a fundamental concept in graph theory representing a closed loop. A graph with no cycles is called an Acyclic Graph — for example, a Tree is a special connected acyclic graph.",
                },
            },
        },
        {
            "id": "graph-q4",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "實務上儲存「稀疏圖 (Sparse Graph，節點很多但邊很少)」時，為了節省記憶體空間，最常使用哪種底層結構？",
                    "options": [
                        {"id": "A", "text": "鄰接矩陣 (Adjacency Matrix)"},
                        {"id": "B", "text": "鄰接表 (Adjacency List)"},
                        {"id": "C", "text": "二元搜尋樹 (BST)"},
                        {"id": "D", "text": "雜湊表 (Hash Table)"},
                    ],
                    "explanation": "鄰接表只儲存實際存在的邊，空間複雜度為 O(V+E)，非常適合稀疏圖。鄰接矩陣無論邊有多少，都需要 O(V²) 的空間，會造成嚴重的記憶體浪費。",
                },
                "en": {
                    "title": "For storing a sparse graph (many nodes, few edges), which underlying structure is most commonly used to save memory?",
                    "options": [
                        {"id": "A", "text": "Adjacency Matrix"},
                        {"id": "B", "text": "Adjacency List"},
                        {"id": "C", "text": "Binary Search Tree (BST)"},
                        {"id": "D", "text": "Hash Table"},
                    ],
                    "explanation": "An Adjacency List stores only actual edges — O(V+E) space — ideal for sparse graphs. An Adjacency Matrix always requires O(V²) space regardless of edge count, wasting memory for sparse graphs.",
                },
            },
        },
        {
            "id": "graph-q5",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若要實作圖的「深度優先搜尋 (DFS)」，演算法的底層（或手動實作時）通常必須搭配哪一種資料結構？",
                    "options": [
                        {"id": "A", "text": "佇列 (Queue)"},
                        {"id": "B", "text": "堆疊 (Stack)"},
                        {"id": "C", "text": "最小堆積 (Min Heap)"},
                        {"id": "D", "text": "雜湊集 (Hash Set)"},
                    ],
                    "explanation": "DFS 採用「不撞南牆不回頭」的策略，必須記錄上一層的節點以便回溯 (Backtracking)。這符合後進先出 (LIFO) 的特性，因此依賴作業系統的 Call Stack（遞迴）或手動維護的 Stack。",
                },
                "en": {
                    "title": "When implementing graph Depth-First Search (DFS), which data structure does the algorithm rely on (explicitly or implicitly)?",
                    "options": [
                        {"id": "A", "text": "Queue"},
                        {"id": "B", "text": "Stack"},
                        {"id": "C", "text": "Min Heap"},
                        {"id": "D", "text": "Hash Set"},
                    ],
                    "explanation": "DFS explores as deep as possible before backtracking, requiring LIFO (last-in-first-out) behavior. It relies on the OS Call Stack (recursion) or a manually maintained Stack.",
                },
            },
        },
        {
            "id": "graph-q6",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "給定節點數為 V、邊數為 E 的圖（使用鄰接表儲存），進行一次完整的 BFS 或 DFS 遍歷，其時間複雜度為？",
                    "options": [
                        {"id": "A", "text": "O(V)"},
                        {"id": "B", "text": "O(E)"},
                        {"id": "C", "text": "O(V + E)"},
                        {"id": "D", "text": "O(V²)"},
                    ],
                    "explanation": "在完整的遍歷中，每個節點 (V) 都會被訪問一次，且每條邊 (E) 也都會被檢查一次，因此總時間複雜度為 O(V + E)。",
                },
                "en": {
                    "title": "For a graph with V vertices and E edges (stored as adjacency list), what is the time complexity of a complete BFS or DFS traversal?",
                    "options": [
                        {"id": "A", "text": "O(V)"},
                        {"id": "B", "text": "O(E)"},
                        {"id": "C", "text": "O(V + E)"},
                        {"id": "D", "text": "O(V²)"},
                    ],
                    "explanation": "In a complete traversal, every vertex (V) is visited once and every edge (E) is examined once — total time complexity is O(V + E).",
                },
            },
        },
        {
            "id": "graph-group-1",
            "groupId": "group-graph-bfs",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "根據上述程式碼，BFS 採用「逐層向外擴張」的策略。這個特性使得 BFS 在無權圖 (Unweighted Graph) 中，特別適合用來尋找什麼？",
                    "options": [
                        {"id": "A", "text": "圖中是否存在環 (Cycle)"},
                        {"id": "B", "text": "起點到目標節點的最短路徑 (最少邊數)"},
                        {"id": "C", "text": "所有節點的拓撲排序"},
                        {"id": "D", "text": "圖的最大深度"},
                    ],
                    "explanation": "因為 BFS 是一層一層往外找，所以當它第一次遇到目標節點時，所走過的層數（邊數）必定是起點到該節點的「最短路徑」。",
                },
                "en": {
                    "title": "Based on the code above, BFS expands layer by layer. This makes BFS especially suitable for finding what in an unweighted graph?",
                    "options": [
                        {"id": "A", "text": "Whether the graph contains a cycle"},
                        {"id": "B", "text": "The shortest path (fewest edges) from start to target"},
                        {"id": "C", "text": "Topological ordering of all nodes"},
                        {"id": "D", "text": "The maximum depth of the graph"},
                    ],
                    "explanation": "Since BFS explores level by level, the first time it reaches the target node, the number of layers traversed is guaranteed to be the shortest path (minimum edges).",
                },
            },
        },
        {
            "id": "graph-group-2",
            "groupId": "group-graph-bfs",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "如果圖中包含一個不與起點相連的「孤島節點」(即圖不連通)，此 check_connected 函數最終會回傳什麼？",
                    "options": [
                        {"id": "A", "text": "True"},
                        {"id": "B", "text": "False"},
                        {"id": "C", "text": "拋出 IndexError"},
                        {"id": "D", "text": "陷入無限迴圈"},
                    ],
                    "explanation": "因為起點無法抵達孤島節點，該孤島不會被加入 visited 集合中。最終 len(visited) 會小於 len(graph)，函數回傳 False，正確指出該圖不連通。",
                },
                "en": {
                    "title": "If the graph contains an isolated node not connected to the start node (i.e., graph is disconnected), what will check_connected return?",
                    "options": [
                        {"id": "A", "text": "True"},
                        {"id": "B", "text": "False"},
                        {"id": "C", "text": "Raises IndexError"},
                        {"id": "D", "text": "Infinite loop"},
                    ],
                    "explanation": "Since the start node cannot reach the isolated node, it will never be added to visited. len(visited) < len(graph), so the function returns False, correctly indicating the graph is disconnected.",
                },
            },
        },
        {
            "id": "graph-multi-1",
            "type": "multiple-choice",
            "baseRating": 1200,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "關於「鄰接矩陣 (Adjacency Matrix)」的敘述，以下哪些是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "空間複雜度為 O(V²)，其中 V 是節點數"},
                        {"id": "opt2", "text": "查詢兩個特定節點之間是否存在邊，只需 O(1) 的時間"},
                        {"id": "opt3", "text": "適合用來儲存邊數非常少的「稀疏圖」"},
                        {"id": "opt4", "text": "無向圖的鄰接矩陣必定是對稱矩陣"},
                    ],
                    "explanation": "鄰接矩陣是一個 V x V 的二維陣列，占用 O(V²) 空間 (opt1 正確)，可以直接透過 array[i][j] 檢查邊是否存在 (O(1)，opt2 正確)。若為無向圖，A 連到 B 等同 B 連到 A，因此矩陣對稱 (opt4 正確)。由於極耗空間，它只適合「稠密圖」，不適合「稀疏圖」 (opt3 錯誤)。",
                },
                "en": {
                    "title": "Which statements about an Adjacency Matrix are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Space complexity is O(V²), where V is the number of vertices"},
                        {"id": "opt2", "text": "Checking if an edge exists between two specific nodes takes O(1) time"},
                        {"id": "opt3", "text": "Suitable for storing sparse graphs with very few edges"},
                        {"id": "opt4", "text": "An undirected graph's adjacency matrix is always symmetric"},
                    ],
                    "explanation": "An adjacency matrix is a V×V 2D array — O(V²) space (opt1 correct). Edge existence is checked via array[i][j] in O(1) (opt2 correct). For undirected graphs, A-B implies B-A, so the matrix is symmetric (opt4 correct). Due to high space usage, it's only suitable for dense graphs, not sparse ones (opt3 incorrect).",
                },
            },
        },
        {
            "id": "graph-q-topo",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "「拓撲排序 (Topological Sort)」只能在哪種類型的圖上執行？",
                    "options": [
                        {"id": "A", "text": "無向圖 (Undirected Graph)"},
                        {"id": "B", "text": "有向無環圖 (DAG, Directed Acyclic Graph)"},
                        {"id": "C", "text": "加權圖 (Weighted Graph)"},
                        {"id": "D", "text": "任意有向圖（含環）"},
                    ],
                    "explanation": "拓撲排序的前提是圖必須是「有向無環圖 (DAG)」。若圖中存在環，則節點之間有循環依賴，無法建立合法的線性排序。\n常見應用：工作排程、程式編譯依賴、課程修習順序等。\nA 錯：無向圖沒有方向性，拓撲排序無意義。C/D 錯：加權或含環圖均不滿足前提條件。",
                },
                "en": {
                    "title": "On which type of graph can Topological Sort be performed?",
                    "options": [
                        {"id": "A", "text": "Undirected Graph"},
                        {"id": "B", "text": "Directed Acyclic Graph (DAG)"},
                        {"id": "C", "text": "Weighted Graph"},
                        {"id": "D", "text": "Any directed graph (including those with cycles)"},
                    ],
                    "explanation": "Topological Sort requires a DAG (Directed Acyclic Graph). If the graph has a cycle, nodes have circular dependencies and a valid linear ordering cannot be established. Common applications: task scheduling, build dependency resolution, course prerequisite ordering.",
                },
            },
        },
        {
            "id": "graph-q7",
            "type": "single-choice",
            "baseRating": 1250,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "在有向圖中（假設節點數為 V，邊數為 E），計算一個節點的「出度 (Out-Degree)」，若使用鄰接表 (Adjacency List) 儲存，時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(V)"},
                        {"id": "C", "text": "O(E)"},
                        {"id": "D", "text": "與該節點的鄰居數量成正比"},
                    ],
                    "explanation": "在鄰接表中，只需讀取該節點對應的陣列 (List) 長度即可。如果只是取得長度，時間為 O(1)；如果要走訪列出所有指向的節點，則時間與其鄰居數量成正比。",
                },
                "en": {
                    "title": "In a directed graph with V vertices and E edges (stored as adjacency list), what is the time complexity to compute a node's Out-Degree?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(V)"},
                        {"id": "C", "text": "O(E)"},
                        {"id": "D", "text": "Proportional to the node's number of neighbors"},
                    ],
                    "explanation": "In an adjacency list, just read the length of the node's list. Getting the length is O(1); iterating through all neighbors is proportional to the number of neighbors.",
                },
            },
        },
        {
            "id": "graph-group-3",
            "groupId": "group-graph-bfs",
            "type": "fill-code",
            "baseRating": 1300,
            "correctAnswer": ["start_node", "pop(0)", "visited"],
            "code": BFS_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 BFS 程式碼中 (a)(b)(c) 缺失的變數或方法名稱（注意 Python 語法）。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Queue 初始需放入起點 start_node。(b) 使用 pop(0) 模擬 Dequeue 操作，取出佇列最前面的元素。(c) 檢查 neighbor 是否尚未被訪問過 (not in visited)。",
                },
                "en": {
                    "title": "Fill in the missing variable or method names at (a)(b)(c) in the BFS code (Python syntax).",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Initialize the queue with the starting node start_node. (b) Use pop(0) to simulate Dequeue — take the front element. (c) Check if the neighbor has not yet been visited (not in visited).",
                },
            },
        },
        {
            "id": "graph-multi-2",
            "type": "multiple-choice",
            "baseRating": 1350,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "關於在圖中「偵測環 (Cycle Detection)」的演算法，以下哪些觀念是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "無向圖可以使用 DFS，只要走到已經 visited 且不是自己 parent (父節點) 的節點，就代表有環。"},
                        {"id": "opt2", "text": "有向圖的 DFS 找環，通常需要額外維護一個 recursion stack (遞迴堆疊) 集合，來確認是否走回當前路徑中的節點。"},
                        {"id": "opt3", "text": "BFS 完全無法用來偵測圖中是否有環。"},
                        {"id": "opt4", "text": "若一個圖有 V 個節點且邊數 E >= V，則該無向連通圖必然存在至少一個環。"},
                    ],
                    "explanation": "DFS 是最常用來找環的方法 (opt1, opt2 正確)。一棵 V 個節點的樹最多只能有 V-1 條邊，只要邊數達到 V 條，必然會產生環 (opt4 正確)。BFS 其實也可以用來找環 (例如紀錄 parent 或使用拓撲排序 Kahn's Algorithm)，所以 opt3 錯誤。",
                },
                "en": {
                    "title": "Which statements about Cycle Detection algorithms in graphs are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "For undirected graphs, DFS detects a cycle when it visits an already-visited node that is not the current node's parent."},
                        {"id": "opt2", "text": "For directed graphs, DFS cycle detection typically requires an extra recursion stack set to check if we're revisiting a node on the current path."},
                        {"id": "opt3", "text": "BFS cannot be used at all to detect cycles in a graph."},
                        {"id": "opt4", "text": "If an undirected connected graph has V nodes and E >= V edges, it must contain at least one cycle."},
                    ],
                    "explanation": "DFS is the most common method for cycle detection (opt1, opt2 correct). A tree with V nodes has at most V-1 edges — reaching V edges guarantees a cycle (opt4 correct). BFS can also detect cycles (e.g., via parent tracking or Kahn's topological sort), so opt3 is incorrect.",
                },
            },
        },
        {
            "id": "graph-q8",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "在一個以「鄰接表 (Adjacency List)」儲存的「有向圖」中（假設節點數為 V，邊數為 E），若要計算特定目標節點的「入度 (In-Degree)」，最壞情況的時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(V)"},
                        {"id": "C", "text": "O(E)"},
                        {"id": "D", "text": "O(V + E)"},
                    ],
                    "explanation": "因為鄰接表只記錄了「誰指向誰 (出度)」，沒有記錄「誰被誰指 (入度)」。要算入度，必須掃描整張圖的所有節點 (V) 及其所有邊 (E)，檢查目標節點是否出現在別人的鄰居陣列中，因此複雜度為 O(V + E)。",
                },
                "en": {
                    "title": "In a directed graph stored as an adjacency list (V vertices, E edges), what is the worst-case time complexity to compute a specific node's In-Degree?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(V)"},
                        {"id": "C", "text": "O(E)"},
                        {"id": "D", "text": "O(V + E)"},
                    ],
                    "explanation": "The adjacency list only records out-edges (who points to whom), not in-edges. To compute in-degree, you must scan all V nodes and all E edges to check if the target appears in anyone's neighbor list — O(V + E).",
                },
            },
        },
        {
            "id": "graph-fill-1",
            "type": "fill-code",
            "baseRating": 1450,
            "correctAnswer": ["rec_stack", "True", "curr"],
            "code": DFS_CYCLE_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "以下是利用 DFS 偵測「有向圖」是否有環的核心程式碼。請填入 (a)(b)(c) 處正確的變數。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 發現已訪問的鄰居時，如果它還在 rec_stack 裡，代表我們繞了一圈回到當前路徑的祖先，即發生環。(b) 發現環，回傳 True。(c) 該節點的分支全探索完畢，進行回溯 (Backtrack)，將 curr 從 rec_stack 移除。",
                },
                "en": {
                    "title": "The following is the core DFS code for detecting cycles in a directed graph. Fill in (a)(b)(c) with the correct variables.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) When a visited neighbor is still in rec_stack, we've looped back to an ancestor on the current path — a cycle. (b) Cycle found, return True. (c) All branches of this node are fully explored — backtrack by removing curr from rec_stack.",
                },
            },
        },
        {
            "id": "graph-pred-1",
            "type": "predict-line",
            "baseRating": 1500,
            "correctAnswer": "1 2 3 4 5 3 4 3 4 5 6",
            "code": IN_DEGREE_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "給定有向圖 graph = {'A': ['B'], 'B': ['C'], 'C': ['B']}。呼叫 get_in_degree(graph, 'B') 計算節點 B 的入度。請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "初始化(L1,L2)。迴圈 A (L3) -> 'B' in ['B'](L4) -> +1(L5)。迴圈 B (L3) -> 'B' in ['C']為假(L4)。迴圈 C (L3) -> 'B' in ['B'](L4) -> +1(L5)。迴圈結束 -> return 2(L6)。序列為 1 2 3 4 5 3 4 3 4 5 6。",
                },
                "en": {
                    "title": "Given directed graph = {'A': ['B'], 'B': ['C'], 'C': ['B']}, calling get_in_degree(graph, 'B') to compute node B's in-degree — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "Initialize(L1,L2). Loop A(L3) -> 'B' in ['B'](L4) -> +1(L5). Loop B(L3) -> 'B' in ['C'] is False(L4). Loop C(L3) -> 'B' in ['B'](L4) -> +1(L5). Loop ends -> return 2(L6). Sequence: 1 2 3 4 5 3 4 3 4 5 6.",
                },
            },
        },
    ],
}

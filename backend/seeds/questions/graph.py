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

ADJ_MATRIX_FILL_CODE = """def add_undirected_edge(matrix, u, v):
    matrix[(a)][(b)] = 1
    matrix[(c)][u] = 1
    return matrix"""

KAHN_FILL_CODE = """from collections import deque

def topo_sort(graph, indegree):
    queue = deque([node for node in graph if indegree[node] == (a)])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nb in graph[node]:
            indegree[nb] -= 1
            if indegree[nb] == 0:
                queue.append((b))
    return order if len(order) == (c) else []"""

TOPO_PREDICT_CODE = """from collections import deque

def topo_order(graph, indegree):     # L1
    queue = deque([n for n in graph if indegree[n] == 0])  # L2
    order = []                       # L3
    while queue:                     # L4
        node = queue.popleft()       # L5
        order.append(node)           # L6
        for nb in graph[node]:       # L7
            indegree[nb] -= 1        # L8
            if indegree[nb] == 0:    # L9
                queue.append(nb)     # L10
    return order                     # L11"""

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
            # baseRating = 800 + 0(TF) + 50(L1 單一定義) + 0(直觀) = 850
            "baseRating": 850,
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
            # baseRating = 800 + 50(SC) + 50(L1 單一定義) + 0(直觀) = 900
            "baseRating": 900,
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
            # baseRating = 800 + 50(SC) + 50(L1 單一定義) + 0(直觀) = 900
            "baseRating": 900,
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
            # baseRating = 800 + 50(SC) + 50(L1 單一定義) + 0(直觀) = 900
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
            # baseRating = 800 + 0(TF) + 50(L1 單一定義) + 0(直觀) = 850
            "baseRating": 850,
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
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 0(直觀) = 950
            "baseRating": 950,
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
                    "explanation": "稀疏圖的重點是「大多數可能的連線其實不存在」。適合的表示法應該把空白關係省略，只記錄真的相連的鄰居，而不是替每一對節點都保留位置。",
                },
                "en": {
                    "title": "For storing a sparse graph (many nodes, few edges), which underlying structure is most commonly used to save memory?",
                    "options": [
                        {"id": "A", "text": "Adjacency Matrix"},
                        {"id": "B", "text": "Adjacency List"},
                        {"id": "C", "text": "Binary Search Tree (BST)"},
                        {"id": "D", "text": "Hash Table"},
                    ],
                    "explanation": "The key property of a sparse graph is that most possible connections do not exist. A suitable representation omits empty relationships and records only actual neighbors, instead of reserving a slot for every pair of nodes.",
                },
            },
        },
        {
            "id": "graph-q5",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 50(視覺/相似度干擾) = 950
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若要實作圖的「深度優先搜尋 (DFS)」，演算法的底層（或手動實作時）通常必須搭配哪一種資料結構？",
                    "options": [
                        {"id": "A", "text": "佇列 (Queue)"},
                        {"id": "B", "text": "堆疊 (Stack)"},
                        {"id": "C", "text": "遞迴呼叫的 Call Stack（只適用遞迴寫法）"},
                        {"id": "D", "text": "雙向佇列 (deque)"},
                    ],
                    "explanation": "DFS 需要能回到最近尚未完成的分支，因此核心是後進先出的控制流程。遞迴寫法會借用呼叫堆疊；若題目問一般演算法或手動實作，應辨認出同一種抽象資料結構。",
                },
                "en": {
                    "title": "When implementing graph Depth-First Search (DFS), which data structure does the algorithm rely on (explicitly or implicitly)?",
                    "options": [
                        {"id": "A", "text": "Queue"},
                        {"id": "B", "text": "Stack"},
                        {"id": "C", "text": "The recursive call stack (only for recursive implementations)"},
                        {"id": "D", "text": "Deque"},
                    ],
                    "explanation": "DFS must return to the most recent unfinished branch, so its control flow is last-in-first-out. Recursive code borrows the call stack; for the general algorithm or a manual implementation, identify the same abstract data structure.",
                },
            },
        },
        {
            "id": "graph-q6",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 複雜度比較) + 0(直觀) = 950
            "baseRating": 950,
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
                    "explanation": "完整遍歷不只處理節點本身，也必須沿著每個節點的鄰居清單檢查可走的邊。使用 visited 後，重複繞回的節點不會被反覆展開。",
                },
                "en": {
                    "title": "For a graph with V vertices and E edges (stored as adjacency list), what is the time complexity of a complete BFS or DFS traversal?",
                    "options": [
                        {"id": "A", "text": "O(V)"},
                        {"id": "B", "text": "O(E)"},
                        {"id": "C", "text": "O(V + E)"},
                        {"id": "D", "text": "O(V²)"},
                    ],
                    "explanation": "A complete traversal handles both the vertices themselves and the neighbor lists attached to them. With a visited set, nodes reached again through cycles are not expanded repeatedly.",
                },
            },
        },
        {
            "id": "graph-group-1",
            "groupId": "group-graph-bfs",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 演算法特性判斷) + 0(直觀) = 950
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "根據上述程式碼，BFS 採用「逐層向外擴張」的策略。這個特性使得 BFS 在無權圖 (Unweighted Graph) 中，特別適合用來尋找什麼？",
                    "options": [
                        {"id": "A", "text": "從起點出發的所有節點距離層數"},
                        {"id": "B", "text": "起點到目標節點的最短路徑 (最少邊數)"},
                        {"id": "C", "text": "判斷圖是否為二分圖 (Bipartite Graph)"},
                        {"id": "D", "text": "找出任意兩節點的最長路徑"},
                    ],
                    "explanation": "逐層展開會先處理距離起點較近的節點，再處理更遠的節點。當問題要求的是無權圖中的最少步數時，這種順序正好對應到距離層級。",
                },
                "en": {
                    "title": "Based on the code above, BFS expands layer by layer. This makes BFS especially suitable for finding what in an unweighted graph?",
                    "options": [
                        {"id": "A", "text": "The distance level of every node reachable from the start"},
                        {"id": "B", "text": "The shortest path (fewest edges) from start to target"},
                        {"id": "C", "text": "Checking whether the graph is bipartite"},
                        {"id": "D", "text": "Finding the longest path between any two nodes"},
                    ],
                    "explanation": "Layer-by-layer expansion processes nodes closer to the start before farther nodes. When the problem asks for the fewest steps in an unweighted graph, that order matches distance levels.",
                },
            },
        },
        {
            "id": "graph-group-2",
            "groupId": "group-graph-bfs",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(新手誤區) = 1200
            "baseRating": 1200,
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
                    "explanation": "這個函式只會沿著起點能到達的邊擴張。若圖有不連通的區塊，該區塊不會被 BFS 掃到，因此最後的連通性判斷不會通過。",
                },
                "en": {
                    "title": "If the graph contains an isolated node not connected to the start node (i.e., graph is disconnected), what will check_connected return?",
                    "options": [
                        {"id": "A", "text": "True"},
                        {"id": "B", "text": "False"},
                        {"id": "C", "text": "Raises IndexError"},
                        {"id": "D", "text": "Infinite loop"},
                    ],
                    "explanation": "This function expands only along edges reachable from the start. If the graph has a disconnected region, BFS never crosses into it, so the final connectivity check does not pass.",
                },
            },
        },
        {
            "id": "graph-multi-1",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 100(L2 多重比較) + 100(新手誤區) = 1100
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "關於「鄰接矩陣 (Adjacency Matrix)」的敘述，以下哪些是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "空間複雜度為 O(V²)，其中 V 是節點數"},
                        {"id": "opt2", "text": "查詢兩個特定節點之間是否存在邊，只需 O(1) 的時間"},
                        {"id": "opt3", "text": "無向圖只要儲存矩陣上三角，查詢任意方向仍然可以完全不用轉換索引"},
                        {"id": "opt4", "text": "無向圖的鄰接矩陣必定是對稱矩陣"},
                    ],
                    "explanation": "矩陣表示法替每一對節點保留固定位置，因此空間會隨節點對數成長，也能用索引快速查詢特定兩點。無向邊沒有方向差異，所以完整矩陣會呈現對稱；若只存一半，查詢時仍需額外處理方向對應。",
                },
                "en": {
                    "title": "Which statements about an Adjacency Matrix are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Space complexity is O(V²), where V is the number of vertices"},
                        {"id": "opt2", "text": "Checking if an edge exists between two specific nodes takes O(1) time"},
                        {"id": "opt3", "text": "For undirected graphs, storing only the upper triangle still allows every direction to be queried with no index conversion"},
                        {"id": "opt4", "text": "An undirected graph's adjacency matrix is always symmetric"},
                    ],
                    "explanation": "A matrix representation reserves a fixed position for each pair of nodes, so its space grows with node pairs and specific adjacency can be checked by indexing. Undirected edges have no direction difference, so the full matrix is symmetric; if only half is stored, queries still need extra direction handling.",
                },
            },
        },
        {
            "id": "graph-q-topo",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 50(視覺/相似度干擾) = 950
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "「拓撲排序 (Topological Sort)」只能在哪種類型的圖上執行？",
                    "options": [
                        {"id": "A", "text": "有向圖（允許循環依賴）"},
                        {"id": "B", "text": "有向無環圖 (DAG, Directed Acyclic Graph)"},
                        {"id": "C", "text": "強連通圖 (Strongly Connected Graph)"},
                        {"id": "D", "text": "樹 (Tree)"},
                    ],
                    "explanation": "拓撲排序想把依賴關係攤平成一條線，讓每條邊的前置項都排在後置項之前。一旦存在循環依賴，線性序列就無法同時滿足所有先後條件。",
                },
                "en": {
                    "title": "On which type of graph can Topological Sort be performed?",
                    "options": [
                        {"id": "A", "text": "Directed graph that allows circular dependencies"},
                        {"id": "B", "text": "Directed Acyclic Graph (DAG)"},
                        {"id": "C", "text": "Strongly Connected Graph"},
                        {"id": "D", "text": "Tree"},
                    ],
                    "explanation": "Topological sort flattens dependencies into one line, placing every prerequisite before what depends on it. Once circular dependency exists, no linear sequence can satisfy all ordering constraints at the same time.",
                },
            },
        },
        {
            "id": "graph-q7",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 複雜度比較) + 100(新手誤區) = 1050
            "baseRating": 1050,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "在有向圖中（假設節點數為 V，邊數為 E），若使用鄰接表走訪並列出某節點所有「出邊 (Out-Edges)」，時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(V)"},
                        {"id": "C", "text": "O(E)"},
                        {"id": "D", "text": "與該節點的鄰居數量成正比"},
                    ],
                    "explanation": "鄰接表會把不同節點的出邊分開存放。查詢單一節點時，不需要掃描整張圖；成本只受該節點自己連出去多少邊影響。",
                },
                "en": {
                    "title": "In a directed graph with V vertices and E edges (stored as an adjacency list), what is the time complexity to traverse and list all outgoing edges of one node?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(V)"},
                        {"id": "C", "text": "O(E)"},
                        {"id": "D", "text": "Proportional to the node's number of neighbors"},
                    ],
                    "explanation": "An adjacency list stores outgoing edges separately for each node. Querying one node does not require scanning the whole graph; the cost depends only on how many edges leave that node.",
                },
            },
        },
        {
            "id": "graph-group-3",
            "groupId": "group-graph-bfs",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 100(L2 單步追蹤) + 0(直觀) = 1050
            "baseRating": 1050,
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
            # baseRating = 800 + 100(MC) + 600(L5 系統級分析) + 100(新手誤區) = 1600
            "baseRating": 1600,
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
                    "explanation": "環偵測的核心是判斷搜尋過程是否回到不該回到的既有路徑；有向圖尤其需要區分「已完全處理」與「仍在目前路徑上」的節點。另一方面，無向連通圖若邊數超過樹能容納的上限，就不可能仍保持無環。",
                },
                "en": {
                    "title": "Which statements about Cycle Detection algorithms in graphs are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "For undirected graphs, DFS detects a cycle when it visits an already-visited node that is not the current node's parent."},
                        {"id": "opt2", "text": "For directed graphs, DFS cycle detection typically requires an extra recursion stack set to check if we're revisiting a node on the current path."},
                        {"id": "opt3", "text": "BFS cannot be used at all to detect cycles in a graph."},
                        {"id": "opt4", "text": "If an undirected connected graph has V nodes and E >= V edges, it must contain at least one cycle."},
                    ],
                    "explanation": "Cycle detection is about whether the search reaches an existing path it should not return to. Directed graphs especially need to distinguish fully processed nodes from nodes still on the current path. Separately, an undirected connected graph whose edge count exceeds the tree limit cannot remain acyclic.",
                },
            },
        },
        {
            "id": "graph-q8",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜度邊界分析) + 150(邊界) = 1400
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
                    "explanation": "鄰接表天然擅長回答「這個節點指向誰」，但不會直接保存「誰指向這個節點」。若沒有額外維護反向索引或入度表，就必須從出邊資料中反查來源。",
                },
                "en": {
                    "title": "In a directed graph stored as an adjacency list (V vertices, E edges), what is the worst-case time complexity to compute a specific node's In-Degree?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(V)"},
                        {"id": "C", "text": "O(E)"},
                        {"id": "D", "text": "O(V + E)"},
                    ],
                    "explanation": "An adjacency list naturally answers 'who does this node point to,' but it does not directly store 'who points to this node.' Without a reverse index or indegree table, the source has to be inferred from outgoing-edge data.",
                },
            },
        },
        {
            "id": "graph-fill-1",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 250(L3 多步狀態) + 100(新手誤區) = 1300
            "baseRating": 1300,
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
            # baseRating = 800 + 150(PL) + 250(L3 多步狀態) + 150(邊界) = 1350
            "baseRating": 1350,
            "correctAnswer": "1 2 3 4 5 3 4 3 4 5 6",
            "code": IN_DEGREE_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "給定有向圖 graph = {'A': ['B'], 'B': ['C'], 'C': ['B']}。呼叫 get_in_degree(graph, 'B') 計算節點 B 的入度。請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "先執行函式進入與初始化，再對每個 node 回到迴圈行。每次都會檢查 target 是否在該 node 的鄰居串列中；命中時才進入累加行，未命中則回到下一輪迴圈。",
                },
                "en": {
                    "title": "Given directed graph = {'A': ['B'], 'B': ['C'], 'C': ['B']}, calling get_in_degree(graph, 'B') to compute node B's in-degree — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "Enter the function and initialize first, then return to the loop line for each node. Each iteration checks whether the target appears in that node's neighbor list; only matches enter the increment line, while misses move to the next loop iteration.",
                },
            },
        },
        {
            "id": "graph-q19",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 50(視覺/相似度干擾) = 1000
            "baseRating": 1000,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "若一張圖非常稠密，幾乎任兩個節點之間都有邊，而且最常做的操作是查詢兩點是否相鄰，哪種表示法最合適？",
                    "options": [
                        {"id": "A", "text": "固定大小的二維布林表，讓任兩點關係可直接定位"},
                        {"id": "B", "text": "鄰接表，因為永遠比矩陣省空間"},
                        {"id": "C", "text": "用 dict 儲存 (u, v) -> 是否有邊"},
                        {"id": "D", "text": "以排序鄰接表儲存，查詢時二分搜尋"},
                    ],
                    "explanation": "稠密圖中，多數節點對都可能真的相連，因此為節點對保留固定查詢位置的成本較能被利用。若主要需求是大量相鄰查詢，應優先考慮能用節點對直接定位關係的表示法。",
                },
                "en": {
                    "title": "If a graph is very dense and the most common operation is checking whether two nodes are adjacent, which representation is most suitable?",
                    "options": [
                        {"id": "A", "text": "A fixed-size 2D boolean table, so any pair relationship can be located directly"},
                        {"id": "B", "text": "Adjacency list, because it is always more space-efficient than a matrix"},
                        {"id": "C", "text": "A dict storing (u, v) -> edge existence"},
                        {"id": "D", "text": "Sorted adjacency lists, using binary search for lookup"},
                    ],
                    "explanation": "In dense graphs, many node pairs may actually be connected, so the cost of reserving a fixed lookup position for node pairs is better utilized. If the main workload is many adjacency queries, prefer a representation that can locate a pair's relationship directly.",
                },
            },
        },
        {
            "id": "graph-q20",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 100(L2 演算法適用性判斷) + 100(新手誤區) = 1000
            "baseRating": 1000,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "BFS 逐層擴張，所以在任何加權圖中都能找到總權重最小的最短路徑。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "逐層擴張中的「層」代表經過幾條邊，而不是累積成本。判斷這句話時，要確認每多走一層是否一定等於多付相同代價。",
                },
                "en": {
                    "title": "Because BFS expands level by level, it can find the minimum-total-weight shortest path in any weighted graph.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "A BFS level represents how many edges have been taken, not accumulated cost. To evaluate the statement, check whether moving one more level always means paying the same additional cost.",
                },
            },
        },
        {
            "id": "graph-q21",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 100(新手誤區) = 1050
            "baseRating": 1050,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在選擇最短路徑演算法時，若圖中可能出現負權重邊，但沒有負權重環，應優先考慮哪個演算法？",
                    "options": [
                        {"id": "A", "text": "BFS"},
                        {"id": "B", "text": "DFS"},
                        {"id": "C", "text": "Bellman-Ford"},
                        {"id": "D", "text": "Kruskal"},
                    ],
                    "explanation": "含負權重時，關鍵能力是允許距離估計被反覆鬆弛，因為較晚處理到的邊仍可能改善先前結果。選演算法時要看它是否具備這種反覆修正能力。",
                },
                "en": {
                    "title": "When choosing a shortest-path algorithm, if the graph may contain negative-weight edges but no negative-weight cycles, which algorithm should you prefer?",
                    "options": [
                        {"id": "A", "text": "BFS"},
                        {"id": "B", "text": "DFS"},
                        {"id": "C", "text": "Bellman-Ford"},
                        {"id": "D", "text": "Kruskal"},
                    ],
                    "explanation": "With negative weights, the key ability is repeated relaxation: a later edge may still improve a distance estimate found earlier. Choose the algorithm by whether it supports that kind of repeated correction.",
                },
            },
        },
        {
            "id": "graph-q22",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 情境判斷) + 50(視覺/相似度干擾) = 1000
            "baseRating": 1000,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "若目標是「用最低總成本連接所有節點」，而不是找某兩點之間的最短路徑，應對應到哪類問題？",
                    "options": [
                        {"id": "A", "text": "單源最短路徑"},
                        {"id": "B", "text": "最短路徑樹 (Shortest Path Tree)"},
                        {"id": "C", "text": "斯坦納樹 (Steiner Tree)"},
                        {"id": "D", "text": "最小生成樹 (Minimum Spanning Tree)"},
                    ],
                    "explanation": "這類問題關心的是選出一組邊讓所有節點被連起來，並控制整體連線成本。它不是以某個起點為中心，也不是只服務指定的少數終端點。",
                },
                "en": {
                    "title": "If the goal is to connect all nodes with the lowest total cost, rather than find the shortest path between two nodes, what kind of problem is it?",
                    "options": [
                        {"id": "A", "text": "Single-source shortest path"},
                        {"id": "B", "text": "Shortest Path Tree"},
                        {"id": "C", "text": "Steiner Tree"},
                        {"id": "D", "text": "Minimum Spanning Tree"},
                    ],
                    "explanation": "This kind of problem chooses a set of edges that connects every node while controlling total connection cost. It is not centered on one source, and it is not limited to a chosen subset of terminal nodes.",
                },
            },
        },
        {
            "id": "graph-q23",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在邊會不斷新增的無向圖中，若要反覆回答「兩個節點目前是否屬於同一個連通群」，且不需要輸出完整路徑，哪種做法通常最合適？",
                    "options": [
                        {"id": "A", "text": "每次查詢都從其中一點重新 BFS"},
                        {"id": "B", "text": "預先用 DFS 標記元件 ID，之後完全不更新"},
                        {"id": "C", "text": "並查集 (Disjoint-set / Union-Find)"},
                        {"id": "D", "text": "用鄰接矩陣搭配 visited 快照保存每次查詢結果"},
                    ],
                    "explanation": "這個情境有兩個限制：邊會新增、查詢會重複發生。理想做法應能在新增連線時合併群組，並讓之後的同群查詢不必重新遍歷圖；但它不負責重建實際路徑。",
                },
                "en": {
                    "title": "In an undirected graph where edges are continually added, if you repeatedly need to answer whether two nodes currently belong to the same connected component without outputting the full path, which approach is usually best?",
                    "options": [
                        {"id": "A", "text": "Run a fresh BFS from one of the nodes for every query"},
                        {"id": "B", "text": "Pre-label component IDs with DFS once, then never update them"},
                        {"id": "C", "text": "Disjoint-set / Union-Find"},
                        {"id": "D", "text": "Use an adjacency matrix with a visited snapshot saved for each query"},
                    ],
                    "explanation": "This scenario has two constraints: edges are added over time and queries are repeated. A good approach should merge groups when a new connection appears and avoid retraversing the graph for later same-component checks, while not trying to reconstruct the actual path.",
                },
            },
        },
        {
            "id": "graph-q24",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "要計算無向圖中有幾個連通元件，且圖可能包含孤立節點與多個小群，常見做法是什麼？",
                    "options": [
                        {"id": "A", "text": "只從任意一個起點跑一次 BFS，把 visited 大小當作元件數"},
                        {"id": "B", "text": "依序掃描所有節點；遇到未 visited 的節點就啟動 BFS/DFS，並把元件數加一"},
                        {"id": "C", "text": "對每個節點都各跑一次 BFS，最後取最大的 visited 集合大小"},
                        {"id": "D", "text": "先把所有度數為 0 的節點刪除，再從剩下的圖跑一次 BFS"},
                    ],
                    "explanation": "關鍵是不要讓第一次選到的起點決定整張圖的答案。演算法需要能發現尚未被任何遍歷覆蓋的區塊，孤立節點也必須被視為自己的元件。",
                },
                "en": {
                    "title": "What is the common way to count connected components in an undirected graph that may contain isolated nodes and multiple small groups?",
                    "options": [
                        {"id": "A", "text": "Run BFS once from any start and treat visited size as the component count"},
                        {"id": "B", "text": "Scan all nodes; whenever an unvisited node is found, start BFS/DFS and increment the component count"},
                        {"id": "C", "text": "Run BFS once from every node, then take the largest visited-set size"},
                        {"id": "D", "text": "Delete all degree-0 nodes first, then run one BFS on the remaining graph"},
                    ],
                    "explanation": "The key is not letting the first chosen start node determine the whole answer. The algorithm must discover regions not covered by previous traversals, and isolated nodes still count as their own components.",
                },
            },
        },
        {
            "id": "graph-q25",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 400(L4 複雜控制流) + 150(邊界) = 1500
            "baseRating": 1500,
            "correctAnswer": ["u", "v", "v"],
            "code": ADJ_MATRIX_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "以下函式會在鄰接矩陣中加入一條無向邊 u-v。請填入 (a)(b)(c) 讓矩陣保持對稱。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "無向邊沒有方向差異，因此矩陣中兩個相反方向的位置必須同步更新。填空時要先確認列與欄分別代表哪個端點，再補上鏡像位置。",
                },
                "en": {
                    "title": "The function below adds an undirected edge u-v to an adjacency matrix. Fill in (a)(b)(c) so the matrix remains symmetric.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "An undirected edge has no direction, so the two opposite-direction cells in the matrix must be updated together. When filling the blanks, identify which endpoint is the row and which is the column, then mirror the position.",
                },
            },
        },
        {
            "id": "graph-q26",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在有向圖中，若要建立「反向圖」(Transpose Graph) 供可達性分析使用，對原本每條邊 u -> v 應如何處理？",
                    "options": [
                        {"id": "A", "text": "同時保留 u -> v 並新增 v -> u，讓圖變成雙向"},
                        {"id": "B", "text": "只反轉屬於同一強連通分量內的邊"},
                        {"id": "C", "text": "把每條邊 u -> v 改成 v -> u"},
                        {"id": "D", "text": "只把沒有回邊的 u -> v 反轉，已互通的邊保持不變"},
                    ],
                    "explanation": "反向圖保留原本的節點集合，並用一致規則重新建立邊方向。它不是把圖改成無向，也不是只處理某些局部結構；重點是讓原本的可達方向整體翻轉。",
                },
                "en": {
                    "title": "In a directed graph, when building the transpose graph for reachability analysis, what should happen to each original edge u -> v?",
                    "options": [
                        {"id": "A", "text": "Keep u -> v and also add v -> u, making the graph bidirectional"},
                        {"id": "B", "text": "Reverse only edges inside the same strongly connected component"},
                        {"id": "C", "text": "Reverse each edge u -> v into v -> u"},
                        {"id": "D", "text": "Reverse only edges that do not already have a back edge; leave mutual pairs unchanged"},
                    ],
                    "explanation": "A transpose graph keeps the same node set and rebuilds edge directions with one consistent rule. It does not make the graph undirected or handle only local structures; the point is to flip the original reachability direction globally.",
                },
            },
        },
        {
            "id": "graph-q27",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 400(L4 多重比較/邊界分析) + 150(邊界) = 1450
            "baseRating": 1450,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "關於鄰接表與鄰接矩陣的取捨，以下哪些敘述正確？（多選）",
                    "options": [
                        {"id": "opt1", "text": "鄰接矩陣查詢兩點是否相鄰通常是 O(1)"},
                        {"id": "opt2", "text": "鄰接表的空間通常是 O(V+E)，適合稀疏圖"},
                        {"id": "opt3", "text": "當邊數 E 接近 V² 時，鄰接矩陣的空間一定優於鄰接表"},
                        {"id": "opt4", "text": "若要列出某節點所有鄰居，鄰接表通常很直接"},
                    ],
                    "explanation": "矩陣用固定位置換取快速相鄰查詢；列表只存實際存在的邊，也方便列出某節點鄰居。當圖非常稠密時兩者空間量級會接近，但不能忽略實作常數與儲存內容差異，不能直接宣稱矩陣一定更省。",
                },
                "en": {
                    "title": "Which statements about trade-offs between adjacency lists and adjacency matrices are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "An adjacency matrix usually checks whether two nodes are adjacent in O(1)"},
                        {"id": "opt2", "text": "An adjacency list usually uses O(V+E) space and suits sparse graphs"},
                        {"id": "opt3", "text": "When E is close to V², an adjacency matrix is always more space-efficient than an adjacency list"},
                        {"id": "opt4", "text": "Listing all neighbors of one node is usually direct with an adjacency list"},
                    ],
                    "explanation": "A matrix trades fixed positions for fast adjacency checks; a list stores existing edges and directly lists a node's neighbors. When a graph is very dense, their space scale can get close, but implementation constants and stored content still matter, so the matrix is not automatically more space-efficient.",
                },
            },
        },
        {
            "id": "graph-q28",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/依賴分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "給定任務依賴 A -> C、B -> C、C -> D，以下哪個序列是合法的拓撲排序？",
                    "options": [
                        {"id": "A", "text": "C, A, B, D"},
                        {"id": "B", "text": "A, B, C, D"},
                        {"id": "C", "text": "A, C, B, D"},
                        {"id": "D", "text": "D, C, B, A"},
                    ],
                    "explanation": "拓撲排序只需檢查一件事：每條依賴邊 u -> v 中，u 是否都排在 v 之前。逐一用這個規則檢查四個序列即可。",
                },
                "en": {
                    "title": "Given task dependencies A -> C, B -> C, and C -> D, which sequence is a valid topological order?",
                    "options": [
                        {"id": "A", "text": "C, A, B, D"},
                        {"id": "B", "text": "A, B, C, D"},
                        {"id": "C", "text": "A, C, B, D"},
                        {"id": "D", "text": "D, C, B, A"},
                    ],
                    "explanation": "Topological order is checked by one rule: for every dependency edge u -> v, u must appear before v. Apply that rule to each of the four sequences.",
                },
            },
        },
        {
            "id": "graph-q29",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 400(L4 複雜控制流) + 150(邊界) = 1500
            "baseRating": 1500,
            "correctAnswer": ["0", "nb", "len(graph)"],
            "code": KAHN_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "以下是 Kahn 演算法版本的拓撲排序。請填入 (a)(b)(c)，使它能從沒有前置依賴的節點開始，並在有環時回傳空串列。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 起點應該選目前沒有任何前置依賴的節點。(b) 某個後繼節點的所有前置依賴都被移除後，它就成為下一批可處理節點。(c) 最後要比對輸出長度與圖的規模，確認是否仍有循環依賴卡住。",
                },
                "en": {
                    "title": "This is topological sort using Kahn's algorithm. Fill in (a)(b)(c) so it starts from nodes with no prerequisites and returns an empty list when a cycle exists.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) The starting batch should contain nodes with no current prerequisites. (b) Once a successor has had all prerequisites removed, it becomes part of the next processable batch. (c) At the end, compare the output length with the graph size to detect whether a circular dependency remains stuck.",
                },
            },
        },
        {
            "id": "graph-q30",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 400(L4 複雜控制流) + 150(邊界) = 1500
            "baseRating": 1500,
            "correctAnswer": "1 2 3 4 5 6 7 8 9 4 5 6 7 8 9 10 4 5 6 4 11",
            "code": TOPO_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "給定 graph = {'A': ['C'], 'B': ['C'], 'C': []}、indegree = {'A': 0, 'B': 0, 'C': 2}，呼叫 topo_order(graph, indegree)。請依序填寫執行行號（以空格分隔）。",
                    "options": [],
                    "explanation": "控制流先完成初始化，再處理一開始就可執行的兩個節點。前一次處理只讓 C 更接近可執行狀態；後一次處理才讓 C 進入待處理佇列。最後處理沒有後繼的 C，迴圈結束後回傳。",
                },
                "en": {
                    "title": "Given graph = {'A': ['C'], 'B': ['C'], 'C': []} and indegree = {'A': 0, 'B': 0, 'C': 2}, call topo_order(graph, indegree). Write the executed line-number sequence (space-separated).",
                    "options": [],
                    "explanation": "The control flow initializes first, then processes the two nodes that are ready at the start. The earlier processing step only moves C closer to being ready; the later one puts C into the pending queue. Finally C has no successors, the loop ends, and the function returns.",
                },
            },
        },
    ],
}

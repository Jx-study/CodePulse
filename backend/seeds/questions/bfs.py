BFS_SIMPLIFIED_CODE = """from collections import deque

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
    return result"""

BFS_DISTANCE_FILL_CODE = """from collections import deque

def bfs_distance(graph, start):
    dist = {(a): 0}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for nb in graph[node]:
            if nb not in (b):
                dist[nb] = (c) + 1
                queue.append(nb)
    return dist"""

BFS_GRID_FILL_CODE = """from collections import deque

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
    return -1"""

BFS_PREDICT_CODE = """from collections import deque

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
    return result                   # L12"""

DATA = {
    "slug": "bfs",
    "groups": [
        {
            "id": "group-bfs-traversal",
            "translations": {
                "zh-TW": {
                    "title": "題組：BFS 遍歷機制與距離追蹤",
                    "description": "BFS 使用佇列（Queue）逐層訪問節點，並可追蹤每個節點距起點的最短距離。請觀察以下有向圖和 BFS 實作，回答問題。",
                },
                "en": {
                    "title": "Group: BFS Traversal Mechanism & Distance Tracking",
                    "description": "BFS uses a Queue to visit nodes level by level, and can track each node's shortest distance from the start. Observe the following directed graph and BFS implementation to answer the questions.",
                },
            },
            "code": BFS_SIMPLIFIED_CODE,
            "language": "python",
        }
    ],
    "questions": [
        {
            "id": "bfs-q1",
            "type": "single-choice",
            "baseRating": 800,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "廣度優先搜尋（BFS）使用哪種資料結構來決定節點的訪問順序？",
                    "options": [
                        {"id": "A", "text": "堆疊（Stack）"},
                        {"id": "B", "text": "佇列（Queue）"},
                        {"id": "C", "text": "優先佇列（Priority Queue）"},
                        {"id": "D", "text": "雜湊表（Hash Map）"},
                    ],
                    "explanation": "BFS 使用佇列（Queue）的先進先出（FIFO）特性，確保同一層的節點先被訪問完畢後，才進入下一層，實現逐層展開的效果。",
                },
                "en": {
                    "title": "Which data structure does Breadth-First Search (BFS) use to determine node visit order?",
                    "options": [
                        {"id": "A", "text": "Stack"},
                        {"id": "B", "text": "Queue"},
                        {"id": "C", "text": "Priority Queue"},
                        {"id": "D", "text": "Hash Map"},
                    ],
                    "explanation": "BFS uses a Queue's FIFO (First-In-First-Out) property to ensure all nodes at the same level are visited before moving to the next level, achieving layer-by-layer expansion.",
                },
            },
        },
        {
            "id": "bfs-tf-1",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "BFS 能夠找到在「無權重圖」中，兩點之間經過邊數最少的最短路徑。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。BFS 逐層展開的特性保證了最先到達目標節點的路徑，就是經過邊數最少的路徑（即無權重圖中的最短路徑）。",
                },
                "en": {
                    "title": "BFS can find the shortest path between two nodes in an unweighted graph, measured by minimum number of edges.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. BFS's layer-by-layer expansion guarantees that the first time a target node is reached, it is via the fewest edges — the shortest path in an unweighted graph.",
                },
            },
        },
        {
            "id": "bfs-q2",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對題組中的有向圖執行 bfs(graph, 'A')，回傳的 result 串列為何？",
                    "options": [
                        {"id": "A", "text": "['A', 'B', 'D', 'C', 'E']"},
                        {"id": "B", "text": "['A', 'B', 'C', 'D', 'E']"},
                        {"id": "C", "text": "['A', 'C', 'E', 'B', 'D']"},
                        {"id": "D", "text": "['A', 'D', 'E', 'B', 'C']"},
                    ],
                    "explanation": "BFS 從 A 開始，先將 A 的鄰居 B, C 加入佇列。接著依序取出 B（加入 D）和 C（加入 E）。最後取出 D 和 E（無新鄰居）。遍歷順序：A -> B -> C -> D -> E。",
                },
                "en": {
                    "title": "Running bfs(graph, 'A') on the group's directed graph, what does the result list contain?",
                    "options": [
                        {"id": "A", "text": "['A', 'B', 'D', 'C', 'E']"},
                        {"id": "B", "text": "['A', 'B', 'C', 'D', 'E']"},
                        {"id": "C", "text": "['A', 'C', 'E', 'B', 'D']"},
                        {"id": "D", "text": "['A', 'D', 'E', 'B', 'C']"},
                    ],
                    "explanation": "BFS starts at A, enqueues its neighbors B and C. Dequeue B (enqueue D), then C (enqueue E). Finally dequeue D and E (no new neighbors). Traversal order: A -> B -> C -> D -> E.",
                },
            },
        },
        {
            "id": "bfs-tf-2",
            "type": "true-false",
            "baseRating": 900,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "在 BFS 中，節點在被加入佇列時就應該標記為已訪問（visited），而不是等到從佇列取出時才標記，以防止重複加入。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。若在取出時才標記，同一個節點可能被多個鄰居重複加入佇列，造成重複處理。在加入佇列時立即標記，可確保每個節點只被加入一次。",
                },
                "en": {
                    "title": "In BFS, a node should be marked as visited when it is added to the queue, not when it is dequeued, to prevent duplicate entries.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. If nodes are marked only when dequeued, the same node may be enqueued multiple times by different neighbors, causing redundant processing. Marking immediately upon enqueue ensures each node is added only once.",
                },
            },
        },
        {
            "id": "bfs-q3",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對一個有 V 個節點、E 條邊的圖執行 BFS，時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(V)"},
                        {"id": "B", "text": "O(V + E)"},
                        {"id": "C", "text": "O(V × E)"},
                        {"id": "D", "text": "O(E²)"},
                    ],
                    "explanation": "BFS 最多訪問每個節點一次（O(V)），並遍歷每條邊一次（O(E)），因此總時間複雜度為 O(V + E)。",
                },
                "en": {
                    "title": "What is the time complexity of BFS on a graph with V vertices and E edges?",
                    "options": [
                        {"id": "A", "text": "O(V)"},
                        {"id": "B", "text": "O(V + E)"},
                        {"id": "C", "text": "O(V × E)"},
                        {"id": "D", "text": "O(E²)"},
                    ],
                    "explanation": "BFS visits each node at most once (O(V)) and traverses each edge once (O(E)). Total time complexity is O(V + E).",
                },
            },
        },
        {
            "id": "bfs-group-1",
            "groupId": "group-bfs-traversal",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "參考題組程式碼，若將 bfs 函數修改為同時追蹤每個節點的距離，節點 D 距起點 A 的最短距離（邊數）為何？",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "4"},
                    ],
                    "explanation": "從 A 到 D 的路徑：A → B → D，需要 2 條邊。BFS 保證第一次到達 D 時就是最短路徑。",
                },
                "en": {
                    "title": "Using the group code, if the bfs function is modified to also track each node's distance, what is the shortest distance (edge count) from start A to node D?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "4"},
                    ],
                    "explanation": "Path from A to D: A → B → D, requiring 2 edges. BFS guarantees that the first time D is reached is via the shortest path.",
                },
            },
        },
        {
            "id": "bfs-q4",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在迷宮問題中，使用 BFS 找到從入口到出口的最短路徑，每個格子的移動成本相同。為什麼 BFS 適合這類問題？",
                    "options": [
                        {"id": "A", "text": "因為 BFS 使用遞迴，比迭代更快"},
                        {"id": "B", "text": "因為 BFS 逐層展開，第一次到達終點時保證是步數最少的路徑"},
                        {"id": "C", "text": "因為 BFS 能處理負權重邊"},
                        {"id": "D", "text": "因為 BFS 的空間複雜度是 O(1)"},
                    ],
                    "explanation": "BFS 保證在等權重（或無權重）圖中找到最少步數的路徑。由於每次移動成本相同，步數最少即等於路徑最短，這正是 BFS 逐層展開的優勢所在。",
                },
                "en": {
                    "title": "When using BFS to find the shortest path from entrance to exit in a maze (each cell has equal movement cost), why is BFS suitable?",
                    "options": [
                        {"id": "A", "text": "Because BFS uses recursion, which is faster than iteration"},
                        {"id": "B", "text": "Because BFS expands layer by layer, guaranteeing the first time the exit is reached it is via the fewest steps"},
                        {"id": "C", "text": "Because BFS can handle negative-weight edges"},
                        {"id": "D", "text": "Because BFS has O(1) space complexity"},
                    ],
                    "explanation": "BFS guarantees finding the path with the fewest steps in equal-weight (or unweighted) graphs. Since each move has the same cost, fewest steps equals shortest path — BFS's layer-by-layer expansion is perfect for this.",
                },
            },
        },
        {
            "id": "bfs-group-2",
            "groupId": "group-bfs-traversal",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若使用 bfs_distance 函數（追蹤距離版本）對題組圖執行，回傳的 dist 字典中，節點 E 對應的值為何？",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "dist 中不包含 E"},
                    ],
                    "explanation": "從 A 到 E 的路徑：A → C → E，需要 2 條邊。因此 dist['E'] = 2。",
                },
                "en": {
                    "title": "If bfs_distance (the distance-tracking version) is run on the group's graph starting from 'A', what is the value for node E in the returned dist dictionary?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "E is not in dist"},
                    ],
                    "explanation": "Path from A to E: A → C → E, requiring 2 edges. Therefore dist['E'] = 2.",
                },
            },
        },
        {
            "id": "bfs-q5",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在進行圖的 BFS 時，如果不使用 visited 集合追蹤已訪問的節點，在含有環的圖中會發生什麼問題？",
                    "options": [
                        {"id": "A", "text": "BFS 會找到更長的路徑"},
                        {"id": "B", "text": "BFS 會陷入無限迴圈，永遠無法終止"},
                        {"id": "C", "text": "BFS 會跳過部分節點"},
                        {"id": "D", "text": "BFS 會自動偵測環並停止"},
                    ],
                    "explanation": "若不追蹤已訪問節點，一旦遇到環（如 A→B→A），節點 A 會被重複加入佇列，導致無限迴圈。visited 集合確保每個節點只被處理一次。",
                },
                "en": {
                    "title": "If BFS is performed on a graph without a visited set to track visited nodes, what happens in a graph with cycles?",
                    "options": [
                        {"id": "A", "text": "BFS finds longer paths"},
                        {"id": "B", "text": "BFS enters an infinite loop and never terminates"},
                        {"id": "C", "text": "BFS skips some nodes"},
                        {"id": "D", "text": "BFS automatically detects cycles and stops"},
                    ],
                    "explanation": "Without tracking visited nodes, encountering a cycle (e.g., A→B→A) causes node A to be re-enqueued repeatedly, resulting in an infinite loop. The visited set ensures each node is processed only once.",
                },
            },
        },
        {
            "id": "bfs-q6",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "BFS 應用於社群網路中，若要找出某人的「二度好友」（朋友的朋友，但非直接好友），應該在 BFS 的哪個層級收集？",
                    "options": [
                        {"id": "A", "text": "第 0 層（起點本身）"},
                        {"id": "B", "text": "第 1 層（直接好友）"},
                        {"id": "C", "text": "第 2 層（朋友的朋友）"},
                        {"id": "D", "text": "所有層"},
                    ],
                    "explanation": "BFS 逐層展開：第 0 層是起點自己，第 1 層是直接好友，第 2 層是朋友的朋友（二度好友）。收集第 2 層的節點（排除已是直接好友的節點）即可得到二度好友名單。",
                },
                "en": {
                    "title": "When applying BFS to a social network to find 'second-degree connections' (friends of friends, not direct friends), which BFS level should you collect?",
                    "options": [
                        {"id": "A", "text": "Level 0 (the start node itself)"},
                        {"id": "B", "text": "Level 1 (direct friends)"},
                        {"id": "C", "text": "Level 2 (friends of friends)"},
                        {"id": "D", "text": "All levels"},
                    ],
                    "explanation": "BFS expands layer by layer: level 0 is the starting person, level 1 is direct friends, level 2 is friends of friends (second-degree connections). Collect level-2 nodes (excluding direct friends) to get the second-degree connection list.",
                },
            },
        },
        {
            "id": "bfs-multi-1",
            "type": "multiple-choice",
            "baseRating": 1200,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些問題適合使用 BFS 解決？（多選）",
                    "options": [
                        {"id": "opt1", "text": "在無權重圖中找兩點之間的最短路徑"},
                        {"id": "opt2", "text": "判斷圖是否為二部圖（Bipartite Graph）"},
                        {"id": "opt3", "text": "在網格地圖中找最少步數的路徑"},
                        {"id": "opt4", "text": "在加權圖中找最短路徑（邊有不同權重）"},
                    ],
                    "explanation": "BFS 適合無權重的最短路徑（opt1, opt3 正確）以及層次化的圖分析如二部圖判斷（opt2 正確）。加權圖的最短路徑需要 Dijkstra 演算法，BFS 不適用（opt4 錯誤）。",
                },
                "en": {
                    "title": "Which problems are suitable for BFS? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Shortest path between two nodes in an unweighted graph"},
                        {"id": "opt2", "text": "Determining if a graph is bipartite"},
                        {"id": "opt3", "text": "Fewest-steps path in a grid map"},
                        {"id": "opt4", "text": "Shortest path in a weighted graph (edges have different weights)"},
                    ],
                    "explanation": "BFS is suited for unweighted shortest paths (opt1, opt3 correct) and level-based graph analysis like bipartite checking (opt2 correct). Shortest paths in weighted graphs require Dijkstra's algorithm — BFS is not applicable (opt4 wrong).",
                },
            },
        },
        {
            "id": "bfs-q7",
            "type": "single-choice",
            "baseRating": 1250,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在 BFS 中，「層（Level）」的概念對應到現實問題中的什麼？",
                    "options": [
                        {"id": "A", "text": "圖中節點的度數（Degree）"},
                        {"id": "B", "text": "從起點出發，到達該節點所需的最少邊數（距離）"},
                        {"id": "C", "text": "節點在圖中出現的順序"},
                        {"id": "D", "text": "節點被加入 visited 集合的順序"},
                    ],
                    "explanation": "BFS 的「層」直接對應到「從起點出發的最短距離（邊數）」。第 k 層的所有節點，其距離起點恰好為 k 條邊，這正是 BFS 在無權重圖中解決最短路徑問題的核心依據。",
                },
                "en": {
                    "title": "In BFS, what does the concept of a 'level' correspond to in real problems?",
                    "options": [
                        {"id": "A", "text": "The degree of a node in the graph"},
                        {"id": "B", "text": "The minimum number of edges (distance) needed to reach the node from the start"},
                        {"id": "C", "text": "The order in which nodes appear in the graph"},
                        {"id": "D", "text": "The order in which nodes are added to the visited set"},
                    ],
                    "explanation": "A BFS 'level' directly corresponds to 'shortest distance (edge count) from the start.' All nodes at level k are exactly k edges away from the start — this is the core basis for BFS solving shortest path problems in unweighted graphs.",
                },
            },
        },
        {
            "id": "bfs-group-3",
            "groupId": "group-bfs-traversal",
            "type": "fill-code",
            "baseRating": 1300,
            "correctAnswer": ["start", "dist", "dist[node]"],
            "code": BFS_DISTANCE_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 bfs_distance 程式碼中 (a)(b)(c) 缺失的表達式，完成距離追蹤版 BFS 的實作。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 初始化 dist 字典，起點的距離為 0：{start: 0}。(b) 判斷鄰居是否已在 dist 字典中（等同於判斷是否已訪問）。(c) 鄰居的距離為當前節點距離加 1：dist[node] + 1。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in bfs_distance to complete the distance-tracking BFS implementation.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Initialize the dist dictionary with the start node at distance 0: {start: 0}. (b) Check if the neighbor is already in dist (equivalent to checking if visited). (c) The neighbor's distance is the current node's distance plus 1: dist[node] + 1.",
                },
            },
        },
        {
            "id": "bfs-q8",
            "type": "single-choice",
            "baseRating": 1350,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "BFS 在最壞情況下的空間複雜度為何（以節點數 V 和邊數 E 表示）？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(E)"},
                        {"id": "C", "text": "O(V)"},
                        {"id": "D", "text": "O(V × E)"},
                    ],
                    "explanation": "BFS 需要儲存 visited 集合（最多 V 個節點）和佇列（最多同時存放一層的節點，最壞情況下接近 V 個節點），因此空間複雜度為 O(V)。",
                },
                "en": {
                    "title": "What is the worst-case space complexity of BFS (in terms of vertex count V and edge count E)?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(E)"},
                        {"id": "C", "text": "O(V)"},
                        {"id": "D", "text": "O(V × E)"},
                    ],
                    "explanation": "BFS stores a visited set (at most V nodes) and a queue (holding at most one full level, up to V nodes in the worst case). Space complexity is O(V).",
                },
            },
        },
        {
            "id": "bfs-multi-2",
            "type": "multiple-choice",
            "baseRating": 1400,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "關於 BFS 與 DFS 的比較，以下哪些敘述是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "BFS 使用佇列；DFS 使用堆疊（或遞迴）"},
                        {"id": "opt2", "text": "BFS 適合找無權重圖的最短路徑；DFS 適合拓撲排序或找連通元件"},
                        {"id": "opt3", "text": "BFS 在廣而淺的圖中較省記憶體；DFS 在窄而深的圖中較省記憶體"},
                        {"id": "opt4", "text": "DFS 保證找到最短路徑；BFS 不保證"},
                    ],
                    "explanation": "opt1, opt2, opt3 均正確。BFS 與 DFS 的資料結構、應用場景和記憶體特性均有差異。opt4 錯誤：在無權重圖中，BFS 才保證最短路徑，DFS 不保證。",
                },
                "en": {
                    "title": "Which statements about the comparison between BFS and DFS are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "BFS uses a queue; DFS uses a stack (or recursion)"},
                        {"id": "opt2", "text": "BFS suits unweighted shortest paths; DFS suits topological sort or finding connected components"},
                        {"id": "opt3", "text": "BFS is more memory-efficient on wide and shallow graphs; DFS is more efficient on narrow and deep graphs"},
                        {"id": "opt4", "text": "DFS guarantees finding the shortest path; BFS does not"},
                    ],
                    "explanation": "opt1, opt2, opt3 are all correct. BFS and DFS differ in data structure, use case, and memory characteristics. opt4 is wrong: in unweighted graphs, BFS guarantees the shortest path, not DFS.",
                },
            },
        },
        {
            "id": "bfs-fill-1",
            "type": "fill-code",
            "baseRating": 1450,
            "correctAnswer": ["queue.popleft()", "grid[nr][nc]", "steps"],
            "code": BFS_GRID_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 grid_bfs 程式碼中 (a)(b)(c) 缺失的表達式，完成網格 BFS 的最短路徑實作。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 從佇列取出 (pos, steps) 元組，使用 queue.popleft()。(b) 邊界判斷時同時檢查格子是否為障礙物：grid[nr][nc]。(c) 將新格子加入佇列時，步數加 1：steps + 1。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in grid_bfs to complete the grid BFS shortest path implementation.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Dequeue a (pos, steps) tuple using queue.popleft(). (b) When checking boundaries, also verify the cell is not a wall: grid[nr][nc]. (c) When enqueuing a new cell, increment steps by 1: steps + 1.",
                },
            },
        },
        {
            "id": "bfs-pred-1",
            "type": "predict-line",
            "baseRating": 1500,
            "correctAnswer": "1 2 3 4 5 6 7 8 9 10 11 8 9 10 11 5 6 7 5 6 7 5 12",
            "code": BFS_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 bfs 函數。使用題組中的有向圖，呼叫 bfs(graph, 'A') 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "L1-L4 初始化；L5 while queue 非空；L6 取出 A；L7 加入 result；L8-L11 將 B 和 C 加入佇列並標記；L5 再次進入；L6 取出 B；L7；L8-L11 將 D 加入；繼續取出 C 和 D，E；最後佇列空，L5 條件失敗，L12 return。",
                },
                "en": {
                    "title": "Read the bfs function. Using the directed graph from the group, calling bfs(graph, 'A') — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "L1-L4 initialize; L5 while queue non-empty; L6 dequeue A; L7 append to result; L8-L11 enqueue and mark B and C; L5 again; L6 dequeue B; L7; L8-L11 enqueue D; continue dequeuing C, D, E; finally queue empty, L5 condition fails, L12 return.",
                },
            },
        },
    ],
}

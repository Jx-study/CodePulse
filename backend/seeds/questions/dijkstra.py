DIJKSTRA_SIMPLIFIED_CODE = """import heapq

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
    return dist"""

DIJKSTRA_FILL_CODE = """import heapq

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
    return dist"""

DIJKSTRA_RELAX_FILL_CODE = """def dijkstra_relax(dist, u, v, weight):
    # 鬆弛操作：若透過 u 到 v 的距離更短，則更新 dist[v]
    alt = (a) + (b)
    if alt < dist[v]:
        dist[v] = (c)
        return True
    return False"""

DIJKSTRA_PREDICT_CODE = """import heapq

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
    return dist                       # L14"""

DATA = {
    "slug": "dijkstra",
    "groups": [
        {
            "id": "group-dijkstra-path",
            "translations": {
                "zh-TW": {
                    "title": "題組：Dijkstra 在加權圖中的最短路徑",
                    "description": "Dijkstra 使用優先佇列每次選取距離最小的節點進行鬆弛，逐步確定各節點的最短路徑。請觀察以下加權有向圖與實作，回答問題。",
                },
                "en": {
                    "title": "Group: Dijkstra's Shortest Path in Weighted Graph",
                    "description": "Dijkstra uses a priority queue to always select the node with the smallest current distance for relaxation, gradually determining shortest paths for all nodes. Study the weighted directed graph and implementation below.",
                },
            },
            "code": DIJKSTRA_SIMPLIFIED_CODE,
            "language": "python",
        }
    ],
    "questions": [
        {
            "id": "dijkstra-q1",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 800,
            "correctAnswer": "A",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "Dijkstra 演算法用來解決哪類問題？",
                    "options": [
                        {"id": "A", "text": "在非負權重的加權圖中，找出單一起點到所有其他節點的最短路徑"},
                        {"id": "B", "text": "在無權重圖中，找出兩點之間的最少邊數路徑"},
                        {"id": "C", "text": "在含有負權重邊的圖中，找出最短路徑"},
                        {"id": "D", "text": "找出圖中所有節點之間的最短路徑"},
                    ],
                    "explanation": "Dijkstra 演算法專門處理邊權重非負的加權圖，從單一起點出發，求出到圖中所有其他節點的最短路徑。含負權重邊需改用 Bellman-Ford；所有點對最短路徑需使用 Floyd-Warshall。",
                },
                "en": {
                    "title": "What type of problem does Dijkstra's algorithm solve?",
                    "options": [
                        {"id": "A", "text": "Single-source shortest paths in a weighted graph with non-negative edge weights"},
                        {"id": "B", "text": "Fewest-edge path between two nodes in an unweighted graph"},
                        {"id": "C", "text": "Shortest paths in a graph with negative-weight edges"},
                        {"id": "D", "text": "Shortest paths between all pairs of nodes in a graph"},
                    ],
                    "explanation": "Dijkstra's algorithm handles weighted graphs with non-negative edges, finding shortest paths from a single source to all other nodes. Negative-weight edges require Bellman-Ford; all-pairs shortest paths use Floyd-Warshall.",
                },
            },
        },
        {
            "id": "dijkstra-tf-1",
            "type": "true-false",
            "category": "basic",
            "difficultyRating": 850,
            "correctAnswer": "true",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "Dijkstra 演算法使用優先佇列（Priority Queue / Min-Heap），每次從中取出距離最小的節點進行鬆弛操作。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。Dijkstra 的核心是「貪心」策略：使用最小堆（Min-Heap），每次取出當前距離最小的節點，對其所有鄰居嘗試鬆弛（更新最短距離），逐步確定各節點的最終最短距離。",
                },
                "en": {
                    "title": "Dijkstra's algorithm uses a Priority Queue (Min-Heap), always extracting the node with the smallest current distance for relaxation.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. Dijkstra's core is a 'greedy' strategy: using a Min-Heap, always extract the node with the smallest current distance and relax (update shortest distances for) all its neighbors, gradually finalizing each node's shortest distance.",
                },
            },
        },
        {
            "id": "dijkstra-q2",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 900,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "在 Dijkstra 演算法中，「鬆弛（Relaxation）」操作的目的是什麼？",
                    "options": [
                        {"id": "A", "text": "將節點從優先佇列中移除"},
                        {"id": "B", "text": "若透過當前節點到達鄰居的路徑比已知的更短，則更新鄰居的距離"},
                        {"id": "C", "text": "將圖中的所有邊按照權重排序"},
                        {"id": "D", "text": "重置所有節點的距離為無限大"},
                    ],
                    "explanation": "鬆弛操作：若 dist[u] + w(u,v) < dist[v]，則更新 dist[v] = dist[u] + w(u,v)，並將 (新距離, v) 推入優先佇列。這個步驟逐步找出每個節點的最短距離。",
                },
                "en": {
                    "title": "In Dijkstra's algorithm, what is the purpose of the 'relaxation' operation?",
                    "options": [
                        {"id": "A", "text": "To remove a node from the priority queue"},
                        {"id": "B", "text": "To update a neighbor's distance if the path through the current node is shorter than the known distance"},
                        {"id": "C", "text": "To sort all edges in the graph by weight"},
                        {"id": "D", "text": "To reset all nodes' distances to infinity"},
                    ],
                    "explanation": "Relaxation: if dist[u] + w(u,v) < dist[v], update dist[v] = dist[u] + w(u,v) and push (new_dist, v) into the priority queue. This step progressively discovers each node's shortest distance.",
                },
            },
        },
        {
            "id": "dijkstra-tf-2",
            "type": "true-false",
            "category": "basic",
            "difficultyRating": 900,
            "correctAnswer": "true",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "Dijkstra 演算法無法正確處理含有負權重邊的圖，因為貪心策略的前提是「已確定的最短距離不會再被更短的路徑改善」。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。Dijkstra 的貪心假設：一旦節點從優先佇列取出，其距離就是最終最短距離。但若有負權重邊，後續的路徑可能讓「已確定」的距離變得更短，打破此假設，導致結果錯誤。",
                },
                "en": {
                    "title": "Dijkstra's algorithm cannot correctly handle graphs with negative-weight edges, because the greedy strategy assumes 'a finalized shortest distance cannot be improved by a shorter path later'.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. Dijkstra's greedy assumption: once a node is extracted from the priority queue, its distance is the final shortest distance. With negative-weight edges, a later path could improve an 'already finalized' distance, breaking this assumption and producing incorrect results.",
                },
            },
        },
        {
            "id": "dijkstra-q3",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 950,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "在題組的加權有向圖中，從節點 0 出發，到達節點 3 的最短距離為何？",
                    "options": [
                        {"id": "A", "text": "9"},
                        {"id": "B", "text": "9（路徑：0→2→4→3，成本 2+3+4=9）"},
                        {"id": "C", "text": "14（路徑：0→1→3，成本 4+10=14）"},
                        {"id": "D", "text": "10"},
                    ],
                    "explanation": "可能路徑：0→1→3（成本 4+10=14）；0→2→4→3（成本 2+3+4=9）；0→1→2→4→3（成本 4+5+3+4=16）。最短路徑為 0→2→4→3，距離為 9。",
                },
                "en": {
                    "title": "In the group's weighted directed graph, what is the shortest distance from node 0 to node 3?",
                    "options": [
                        {"id": "A", "text": "9"},
                        {"id": "B", "text": "9 (path: 0→2→4→3, cost 2+3+4=9)"},
                        {"id": "C", "text": "14 (path: 0→1→3, cost 4+10=14)"},
                        {"id": "D", "text": "10"},
                    ],
                    "explanation": "Possible paths: 0→1→3 (cost 4+10=14); 0→2→4→3 (cost 2+3+4=9); 0→1→2→4→3 (cost 4+5+3+4=16). Shortest path is 0→2→4→3 with distance 9.",
                },
            },
        },
        {
            "id": "dijkstra-group-1",
            "groupId": "group-dijkstra-path",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1000,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "參考題組程式碼，執行 dijkstra(graph, 0) 時，第一個從優先佇列取出的節點（第一次 heappop）是哪個？",
                    "options": [
                        {"id": "A", "text": "節點 1"},
                        {"id": "B", "text": "節點 0（距離 0）"},
                        {"id": "C", "text": "節點 2"},
                        {"id": "D", "text": "隨機取出"},
                    ],
                    "explanation": "初始 pq = [(0, 0)]，第一次 heappop 取出 (d=0, u=0)。節點 0 是起點，距離為 0，故最先被取出處理。",
                },
                "en": {
                    "title": "Using the group code, when executing dijkstra(graph, 0), which node is extracted from the priority queue first (first heappop)?",
                    "options": [
                        {"id": "A", "text": "Node 1"},
                        {"id": "B", "text": "Node 0 (distance 0)"},
                        {"id": "C", "text": "Node 2"},
                        {"id": "D", "text": "Random extraction"},
                    ],
                    "explanation": "Initial pq = [(0, 0)]. The first heappop extracts (d=0, u=0). Node 0 is the start with distance 0, so it is processed first.",
                },
            },
        },
        {
            "id": "dijkstra-q4",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1050,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "在 Dijkstra 的程式碼中，有一行 `if d > dist[u]: continue`，這行的目的是什麼？",
                    "options": [
                        {"id": "A", "text": "跳過所有距離大於 0 的節點"},
                        {"id": "B", "text": "跳過已過時（Stale）的優先佇列條目，因為同一節點可能被多次加入佇列"},
                        {"id": "C", "text": "防止訪問距離為無限大的節點"},
                        {"id": "D", "text": "確保節點按照字母順序被訪問"},
                    ],
                    "explanation": "優先佇列中可能存在同一節點的多個舊版本（當節點的距離被更新後，舊的 (距離, 節點) 不會被刪除）。若取出的距離 d 大於目前已知的最短距離 dist[u]，代表這是一個過時的條目，直接跳過即可。",
                },
                "en": {
                    "title": "In Dijkstra's code, there is a line `if d > dist[u]: continue`. What is its purpose?",
                    "options": [
                        {"id": "A", "text": "To skip all nodes with distance greater than 0"},
                        {"id": "B", "text": "To skip stale priority queue entries, since the same node may be pushed multiple times"},
                        {"id": "C", "text": "To prevent visiting nodes with infinite distance"},
                        {"id": "D", "text": "To ensure nodes are visited in alphabetical order"},
                    ],
                    "explanation": "The priority queue may contain multiple stale entries for the same node (old (distance, node) entries are not removed when a node's distance is updated). If the extracted distance d exceeds the current known shortest distance dist[u], this is a stale entry — skip it.",
                },
            },
        },
        {
            "id": "dijkstra-group-2",
            "groupId": "group-dijkstra-path",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1100,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "執行 dijkstra(graph, 0) 後，dist[2] 的最終值為何？",
                    "options": [
                        {"id": "A", "text": "5（路徑：0→1→2，成本 4+5=9... 不對）"},
                        {"id": "B", "text": "2（路徑：0→2，成本 2）"},
                        {"id": "C", "text": "7（路徑：0→1→2，成本 4+5=9... 不對）"},
                        {"id": "D", "text": "0"},
                    ],
                    "explanation": "到達節點 2 的路徑：直接 0→2（成本 2）；或 0→1→2（成本 4+5=9）；最短為 2。因此 dist[2] = 2。",
                },
                "en": {
                    "title": "After executing dijkstra(graph, 0), what is the final value of dist[2]?",
                    "options": [
                        {"id": "A", "text": "5"},
                        {"id": "B", "text": "2 (path: 0→2, cost 2)"},
                        {"id": "C", "text": "7"},
                        {"id": "D", "text": "0"},
                    ],
                    "explanation": "Paths to node 2: direct 0→2 (cost 2); or 0→1→2 (cost 4+5=9). Shortest is 2. Therefore dist[2] = 2.",
                },
            },
        },
        {
            "id": "dijkstra-q5",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1100,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "Dijkstra 演算法中，初始化時所有節點的距離設為 float('inf')（無限大），起點設為 0。這樣設計的原因是什麼？",
                    "options": [
                        {"id": "A", "text": "為了讓所有節點都能被訪問到"},
                        {"id": "B", "text": "inf 表示「尚未發現任何到達該節點的路徑」，任何實際路徑的成本都比 inf 小，確保第一次更新一定會成功"},
                        {"id": "C", "text": "避免除以零的錯誤"},
                        {"id": "D", "text": "只是慣例，實際上可以初始化為 -1"},
                    ],
                    "explanation": "初始化為 inf 代表「目前還不知道任何路徑」。當第一條路徑被發現時（距離為有限值），由於有限值 < inf，鬆弛條件 new_d < dist[v] 必然成立，因此會被更新。起點設為 0 表示到達自身距離為 0。",
                },
                "en": {
                    "title": "In Dijkstra's algorithm, why are all nodes initialized to float('inf') with the start set to 0?",
                    "options": [
                        {"id": "A", "text": "To ensure all nodes can be visited"},
                        {"id": "B", "text": "inf means 'no path to this node has been found yet'; any actual path cost is less than inf, guaranteeing the first update always succeeds"},
                        {"id": "C", "text": "To avoid division by zero errors"},
                        {"id": "D", "text": "Just a convention — could be initialized to -1"},
                    ],
                    "explanation": "Initializing to inf means 'no path is known yet.' When the first path is found (a finite cost), since finite < inf, the relaxation condition new_d < dist[v] is guaranteed to hold, so the update succeeds. Setting the start to 0 means the distance to itself is 0.",
                },
            },
        },
        {
            "id": "dijkstra-q6",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1150,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "Dijkstra 演算法的時間複雜度（使用二元堆 Min-Heap，V 個節點，E 條邊）為何？",
                    "options": [
                        {"id": "A", "text": "O(V²)"},
                        {"id": "B", "text": "O((V + E) log V)"},
                        {"id": "C", "text": "O(E log E)"},
                        {"id": "D", "text": "O(V × E)"},
                    ],
                    "explanation": "每個節點最多被加入堆一次（O(V log V)），每條邊最多觸發一次鬆弛操作並可能推入堆（O(E log V)），因此總時間複雜度為 O((V + E) log V)。在稠密圖中可退化至 O(E log V)。",
                },
                "en": {
                    "title": "What is the time complexity of Dijkstra's algorithm (using a binary Min-Heap, V nodes, E edges)?",
                    "options": [
                        {"id": "A", "text": "O(V²)"},
                        {"id": "B", "text": "O((V + E) log V)"},
                        {"id": "C", "text": "O(E log E)"},
                        {"id": "D", "text": "O(V × E)"},
                    ],
                    "explanation": "Each node is pushed to the heap at most once (O(V log V)); each edge triggers at most one relaxation and potential heap push (O(E log V)). Total: O((V + E) log V). In dense graphs this simplifies to O(E log V).",
                },
            },
        },
        {
            "id": "dijkstra-q7",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1150,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "Dijkstra 演算法與 BFS 的最主要差異是什麼？",
                    "options": [
                        {"id": "A", "text": "Dijkstra 使用堆疊，BFS 使用佇列"},
                        {"id": "B", "text": "Dijkstra 使用優先佇列（按距離排序），可處理加權邊；BFS 使用普通佇列，只適合無權重或等權重圖"},
                        {"id": "C", "text": "BFS 比 Dijkstra 快，因為不需要排序"},
                        {"id": "D", "text": "Dijkstra 只能處理有向圖，BFS 只能處理無向圖"},
                    ],
                    "explanation": "BFS 用普通佇列按「發現順序」展開，等同於每條邊權重為 1（或無權重）。Dijkstra 用優先佇列按「累計距離」排序，能夠正確處理不同邊權重，確保每次取出的是全局最小距離節點。",
                },
                "en": {
                    "title": "What is the key difference between Dijkstra's algorithm and BFS?",
                    "options": [
                        {"id": "A", "text": "Dijkstra uses a stack; BFS uses a queue"},
                        {"id": "B", "text": "Dijkstra uses a priority queue (sorted by distance) and handles weighted edges; BFS uses a plain queue and only works for unweighted or equal-weight graphs"},
                        {"id": "C", "text": "BFS is faster than Dijkstra because it doesn't require sorting"},
                        {"id": "D", "text": "Dijkstra only works on directed graphs; BFS only works on undirected graphs"},
                    ],
                    "explanation": "BFS uses a plain queue and expands in discovery order, equivalent to edge weight 1 (or unweighted). Dijkstra uses a priority queue sorted by cumulative distance, correctly handling different edge weights by always extracting the globally minimum distance node.",
                },
            },
        },
        {
            "id": "dijkstra-multi-1",
            "type": "multiple-choice",
            "category": "application",
            "difficultyRating": 1200,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "以下哪些是 Dijkstra 演算法的實際應用場景？（多選）",
                    "options": [
                        {"id": "opt1", "text": "GPS 導航中尋找最短駕車路線"},
                        {"id": "opt2", "text": "網路路由協定（如 OSPF）中計算最短路徑"},
                        {"id": "opt3", "text": "在含有負債（負權重邊）的金融網路中計算套利機會"},
                        {"id": "opt4", "text": "遊戲 AI 中尋找最短移動路徑（非負移動成本）"},
                    ],
                    "explanation": "GPS 路線規劃（opt1）、網路路由（opt2）和遊戲 AI 路徑（opt4）都是 Dijkstra 的典型應用（邊權重非負）。含負權重的金融套利需要 Bellman-Ford（opt3 不適用 Dijkstra）。",
                },
                "en": {
                    "title": "Which of the following are practical applications of Dijkstra's algorithm? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Finding the shortest driving route in GPS navigation"},
                        {"id": "opt2", "text": "Computing shortest paths in network routing protocols (e.g., OSPF)"},
                        {"id": "opt3", "text": "Computing arbitrage opportunities in a financial network with negative-weight edges (debts)"},
                        {"id": "opt4", "text": "Finding shortest movement paths in game AI (non-negative movement costs)"},
                    ],
                    "explanation": "GPS navigation (opt1), network routing (opt2), and game AI pathfinding (opt4) are all classic Dijkstra applications (non-negative edge weights). Financial arbitrage with negative weights requires Bellman-Ford (opt3 is not suitable for Dijkstra).",
                },
            },
        },
        {
            "id": "dijkstra-q8",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1250,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "在 Dijkstra 演算法執行完畢後，若某個節點的 dist 值仍為 float('inf')，代表什麼？",
                    "options": [
                        {"id": "A", "text": "該節點是起點"},
                        {"id": "B", "text": "從起點出發無法到達該節點（不連通）"},
                        {"id": "C", "text": "該節點的邊全部為負權重"},
                        {"id": "D", "text": "演算法出現了錯誤"},
                    ],
                    "explanation": "Dijkstra 只更新可到達節點的距離。若執行完畢後 dist[v] 仍為 inf，表示從起點出發，圖中不存在任何能到達 v 的路徑（即 v 與起點不連通）。",
                },
                "en": {
                    "title": "After Dijkstra's algorithm finishes, if a node's dist value is still float('inf'), what does that mean?",
                    "options": [
                        {"id": "A", "text": "The node is the start node"},
                        {"id": "B", "text": "The node is unreachable from the start (not connected)"},
                        {"id": "C", "text": "All of the node's edges have negative weights"},
                        {"id": "D", "text": "The algorithm encountered an error"},
                    ],
                    "explanation": "Dijkstra only updates distances of reachable nodes. If dist[v] remains inf after completion, it means there is no path in the graph from the start to v (v is disconnected from the start).",
                },
            },
        },
        {
            "id": "dijkstra-group-3",
            "groupId": "group-dijkstra-path",
            "type": "fill-code",
            "category": "complexity",
            "difficultyRating": 1300,
            "correctAnswer": ["v", "dist[u]", "w"],
            "points": 5,
            "code": DIJKSTRA_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 dijkstra 程式碼中 (a)(b)(c) 缺失的表達式，完成 Dijkstra 最短路徑演算法的實作。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 字典推導式中的迭代變數為 v，表示每個節點。(b) 過時條目判斷：若 d > dist[u]，跳過。(c) 鬆弛時計算新距離：dist[u] + w（當前節點距離加邊的權重）。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in the dijkstra code to complete the Dijkstra shortest path implementation.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) The iteration variable in the dict comprehension is v, representing each node. (b) Stale entry check: if d > dist[u], skip. (c) Relaxation computes new distance: dist[u] + w (current node's distance plus edge weight).",
                },
            },
        },
        {
            "id": "dijkstra-q9",
            "type": "single-choice",
            "category": "complexity",
            "difficultyRating": 1350,
            "correctAnswer": "C",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "為什麼 Dijkstra 演算法不能處理含有「負權重環（Negative Weight Cycle）」的圖？",
                    "options": [
                        {"id": "A", "text": "因為優先佇列無法儲存負數"},
                        {"id": "B", "text": "因為負數會讓 float('inf') 的初始化失效"},
                        {"id": "C", "text": "因為負權重環會讓路徑成本無限降低，導致演算法永不終止或得到錯誤答案"},
                        {"id": "D", "text": "因為 Python 的 heapq 不支援負數"},
                    ],
                    "explanation": "在負權重環中，每繞環一圈路徑成本就減少，可以無限降低。Dijkstra 的貪心策略假設已取出的節點距離為最終值，但負環使這個假設失效，導致演算法陷入無限迴圈或得到錯誤結果。",
                },
                "en": {
                    "title": "Why can't Dijkstra's algorithm handle graphs with negative weight cycles?",
                    "options": [
                        {"id": "A", "text": "Because the priority queue cannot store negative numbers"},
                        {"id": "B", "text": "Because negative numbers invalidate the float('inf') initialization"},
                        {"id": "C", "text": "Because a negative weight cycle keeps reducing path cost indefinitely, causing the algorithm to never terminate or produce wrong answers"},
                        {"id": "D", "text": "Because Python's heapq does not support negative numbers"},
                    ],
                    "explanation": "In a negative weight cycle, each traversal of the cycle reduces the path cost — infinitely. Dijkstra's greedy assumption that an extracted node's distance is final is violated by negative cycles, causing infinite loops or incorrect results.",
                },
            },
        },
        {
            "id": "dijkstra-multi-2",
            "type": "multiple-choice",
            "category": "complexity",
            "difficultyRating": 1400,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "關於 Dijkstra 演算法的特性，以下哪些敘述是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "Dijkstra 是一種「貪心演算法」，每次選取當前距離最小的節點"},
                        {"id": "opt2", "text": "Dijkstra 可以視為 BFS 在加權圖上的推廣"},
                        {"id": "opt3", "text": "Dijkstra 在稀疏圖上的效能通常優於在稠密圖上"},
                        {"id": "opt4", "text": "Dijkstra 只能找到最短路徑的距離，若需要路徑本身需額外記錄前驅節點"},
                    ],
                    "explanation": "opt1 正確：貪心策略。opt2 正確：BFS 在無權重圖中等效，Dijkstra 推廣到加權版本。opt3 錯誤描述（使用二元堆時稀疏和稠密都是 O((V+E)logV)，但 Fibonacci Heap 在稀疏圖更有優勢）。opt4 正確：標準 Dijkstra 只計算距離，需 prev 陣列重建路徑。",
                },
                "en": {
                    "title": "Which statements about Dijkstra's algorithm are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Dijkstra is a 'greedy algorithm' — it always selects the node with the smallest current distance"},
                        {"id": "opt2", "text": "Dijkstra can be seen as a generalization of BFS to weighted graphs"},
                        {"id": "opt3", "text": "Dijkstra generally performs better on sparse graphs than on dense graphs"},
                        {"id": "opt4", "text": "Dijkstra only finds the shortest distances; to reconstruct the actual path, a predecessor array must be maintained"},
                    ],
                    "explanation": "opt1 correct: greedy strategy. opt2 correct: BFS is equivalent for unweighted graphs; Dijkstra extends this to weighted. opt3 is imprecisely stated (binary heap gives O((V+E)logV) for both; Fibonacci Heap gives an advantage in sparse graphs). opt4 correct: standard Dijkstra only computes distances; a prev array is needed to reconstruct paths.",
                },
            },
        },
        {
            "id": "dijkstra-fill-1",
            "type": "fill-code",
            "category": "complexity",
            "difficultyRating": 1450,
            "correctAnswer": ["dist[u]", "weight", "alt"],
            "points": 5,
            "code": DIJKSTRA_RELAX_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 dijkstra_relax 程式碼中 (a)(b)(c) 缺失的表達式，完成鬆弛操作的實作。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 計算透過 u 到達 v 的替代路徑成本：dist[u]。(b) 加上邊的權重：weight。(c) 若替代路徑更短，更新 dist[v] = alt。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in dijkstra_relax to complete the relaxation operation.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Compute the alternative path cost through u: dist[u]. (b) Add the edge weight: weight. (c) If the alternative path is shorter, update dist[v] = alt.",
                },
            },
        },
        {
            "id": "dijkstra-pred-1",
            "type": "predict-line",
            "category": "complexity",
            "difficultyRating": 1500,
            "correctAnswer": "1 2 3 4 5 6 7 9 10 11 12 13 9 10 11 12 13 5 6 7 9 10 11 12 13 5 6 7 5 6 7 8 5 14",
            "points": 5,
            "code": DIJKSTRA_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 dijkstra 函數。使用圖 graph = {0: [(1, 1)], 1: []}（節點 0 有一條權重 1 的邊指向節點 1），呼叫 dijkstra(graph, 0) 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "L1-L4 初始化；L5 while pq；L6 pop (0,0)；L7 0>0? No；L9 處理節點 0 的邊 (1,1)；L10 new_d=1；L11 1<inf? Yes；L12 dist[1]=1；L13 push；L5 再進；L6 pop (1,1)；L7 1>1? No；L9 節點 1 無邊，迴圈空；L5 pq 空，結束；L14 return。",
                },
                "en": {
                    "title": "Read the dijkstra function. Using graph = {0: [(1, 1)], 1: []} (node 0 has one edge with weight 1 to node 1), calling dijkstra(graph, 0) — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "L1-L4 initialize; L5 while pq; L6 pop (0,0); L7 0>0? No; L9 process node 0's edge (1,1); L10 new_d=1; L11 1<inf? Yes; L12 dist[1]=1; L13 push; L5 again; L6 pop (1,1); L7 1>1? No; L9 node 1 has no edges, loop empty; L5 pq empty, exit; L14 return.",
                },
            },
        },
    ],
}

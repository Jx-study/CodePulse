TOPO_FILL_CODE = """from collections import deque

def topo_sort(graph):
    in_degree = {u: 0 for u in graph}
    for u in graph:
        for v in graph[u]:
            in_degree[v] += 1

    queue = deque(u for u in graph if in_degree[u] == (a))
    result = []
    while queue:
        u = queue.(b)
        result.append(u)
        for v in graph[u]:
            in_degree[v] -= 1
            if (c):
                queue.append(v)
    return result if len(result) == len(graph) else None"""

TOPO_PREDICT_CODE = """from collections import deque

def kahn(graph, in_degree, queue):     # L1
    result = []                        # L2
    while queue:                       # L3
        u = queue.popleft()            # L4
        result.append(u)               # L5
        for v in graph[u]:             # L6
            in_degree[v] -= 1          # L7
            if in_degree[v] == 0:      # L8
                queue.append(v)        # L9
    return result                      # L10"""

DATA = {
    "slug": "topological-sort",
    "groups": [
    ],
    "questions": [
        {
            "id": "topological-sort-q1",
            "type": "single-choice",
            "baseRating": 850,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "拓撲排序（Topological Sort）只能用在哪一種圖上？",
                    "options": [
                        {"id": "A", "text": "任何無向圖"},
                        {"id": "B", "text": "帶負權重的圖"},
                        {"id": "C", "text": "有向無環圖（DAG）"},
                        {"id": "D", "text": "完全圖"},
                    ],
                    "explanation": "拓撲排序要求圖是有向且沒有環。若有環，環上的節點彼此互為先決條件，就找不到合法的線性順序。",
                },
                "en": {
                    "title": "On which kind of graph can topological sorting be applied?",
                    "options": [
                        {"id": "A", "text": "Any undirected graph"},
                        {"id": "B", "text": "A graph with negative weights"},
                        {"id": "C", "text": "A directed acyclic graph (DAG)"},
                        {"id": "D", "text": "A complete graph"},
                    ],
                    "explanation": "Topological sort requires a directed graph without cycles. With a cycle, the nodes on it are prerequisites of each other and no valid linear order exists.",
                },
            },
        },
        {
            "id": "topological-sort-q2",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "含有環的有向圖不存在拓撲排序。",
                    "options": [
                        {"id": "true", "text": "正確"},
                        {"id": "false", "text": "錯誤"},
                    ],
                    "explanation": "正確。環上的節點彼此互相依賴，沒有任何一個能排在其他節點之前，因此不存在合法的拓撲順序。",
                },
                "en": {
                    "title": "A directed graph that contains a cycle has no topological ordering.",
                    "options": [
                        {"id": "true", "text": "True"},
                        {"id": "false", "text": "False"},
                    ],
                    "explanation": "True. The nodes on a cycle depend on each other, so none can come before the others and no valid topological order exists.",
                },
            },
        },
        {
            "id": "topological-sort-q3",
            "type": "true-false",
            "baseRating": 950,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "同一個 DAG 的拓撲排序結果一定是唯一的。",
                    "options": [
                        {"id": "true", "text": "正確"},
                        {"id": "false", "text": "錯誤"},
                    ],
                    "explanation": "錯誤。只要有兩個節點之間沒有先後關係，它們的順序就可以互換。例如 A→B、A→C 時，A B C 與 A C B 都是合法的拓撲排序。",
                },
                "en": {
                    "title": "The topological ordering of a given DAG is always unique.",
                    "options": [
                        {"id": "true", "text": "True"},
                        {"id": "false", "text": "False"},
                    ],
                    "explanation": "False. Whenever two nodes have no ordering constraint between them they can be swapped. For A→B and A→C, both A B C and A C B are valid orders.",
                },
            },
        },
        {
            "id": "topological-sort-q4",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "Kahn 演算法一開始會把哪些節點放進佇列？",
                    "options": [
                        {"id": "A", "text": "出度（out-degree）為 0 的節點"},
                        {"id": "B", "text": "入度（in-degree）為 0 的節點"},
                        {"id": "C", "text": "度數最大的節點"},
                        {"id": "D", "text": "編號最小的節點"},
                    ],
                    "explanation": "入度為 0 代表沒有任何先決條件，可以最先處理。Kahn 演算法從這些節點開始，每處理一個就把它指向的節點入度減 1。",
                },
                "en": {
                    "title": "Which nodes does Kahn's algorithm put into the queue at the start?",
                    "options": [
                        {"id": "A", "text": "Nodes with out-degree 0"},
                        {"id": "B", "text": "Nodes with in-degree 0"},
                        {"id": "C", "text": "The node with the largest degree"},
                        {"id": "D", "text": "The node with the smallest id"},
                    ],
                    "explanation": "In-degree 0 means no prerequisites, so those nodes can be processed first. Kahn's algorithm starts from them and decrements the in-degree of each neighbor after processing a node.",
                },
            },
        },
        {
            "id": "topological-sort-q5",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "使用鄰接串列時，Kahn 演算法的時間複雜度為何（V 為節點數、E 為邊數）？",
                    "options": [
                        {"id": "A", "text": "O(V + E)"},
                        {"id": "B", "text": "O(V²)"},
                        {"id": "C", "text": "O(E log V)"},
                        {"id": "D", "text": "O(V × E)"},
                    ],
                    "explanation": "計算入度需要走訪所有邊（O(E)），每個節點進出佇列一次（O(V)），處理每個節點時走訪它的出邊，所有節點加總為 O(E)，所以整體是 O(V + E)。",
                },
                "en": {
                    "title": "With an adjacency list, what is the time complexity of Kahn's algorithm (V nodes, E edges)?",
                    "options": [
                        {"id": "A", "text": "O(V + E)"},
                        {"id": "B", "text": "O(V²)"},
                        {"id": "C", "text": "O(E log V)"},
                        {"id": "D", "text": "O(V × E)"},
                    ],
                    "explanation": "Computing in-degrees visits every edge (O(E)), each node enters and leaves the queue once (O(V)), and processing a node scans its outgoing edges, totalling O(E). The overall cost is O(V + E).",
                },
            },
        },
        {
            "id": "topological-sort-q6",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "Kahn 演算法結束後，要如何判斷圖中存在環？",
                    "options": [
                        {"id": "A", "text": "只有佇列一開始是空的才表示有環"},
                        {"id": "B", "text": "result 中出現重複節點"},
                        {"id": "C", "text": "有任何節點的入度為負數"},
                        {"id": "D", "text": "result 的節點數少於圖的節點數"},
                    ],
                    "explanation": "環上的節點入度永遠無法降到 0，不會進入佇列，所以 result 的長度會小於節點總數。這就是 Kahn 演算法偵測環的方法。",
                },
                "en": {
                    "title": "After Kahn's algorithm finishes, how do you tell that the graph contains a cycle?",
                    "options": [
                        {"id": "A", "text": "Only if the queue is empty at the start"},
                        {"id": "B", "text": "A node appears twice in result"},
                        {"id": "C", "text": "Some node has a negative in-degree"},
                        {"id": "D", "text": "result contains fewer nodes than the graph"},
                    ],
                    "explanation": "Nodes on a cycle never reach in-degree 0 and never enter the queue, so result is shorter than the node count. That is how Kahn's algorithm detects a cycle.",
                },
            },
        },
        {
            "id": "topological-sort-q7",
            "type": "multiple-choice",
            "baseRating": 1000,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些情境適合使用拓撲排序？（多選）",
                    "options": [
                        {"id": "opt1", "text": "課程之間有先修關係，安排修課順序"},
                        {"id": "opt2", "text": "套件／專案編譯時處理相依關係"},
                        {"id": "opt3", "text": "排定有前後依賴的工作任務"},
                        {"id": "opt4", "text": "在含負權重的圖中求最短路徑"},
                    ],
                    "explanation": "先修課程（opt1）、建置相依（opt2）、任務排程（opt3）都是「必須先做 A 才能做 B」的依賴關係，正是拓撲排序的用途。最短路徑（opt4）屬於另一類問題。",
                },
                "en": {
                    "title": "Which scenarios are suitable for topological sorting? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Ordering courses that have prerequisites"},
                        {"id": "opt2", "text": "Resolving dependencies when building packages/projects"},
                        {"id": "opt3", "text": "Scheduling tasks that depend on one another"},
                        {"id": "opt4", "text": "Finding shortest paths in a graph with negative weights"},
                    ],
                    "explanation": "Course prerequisites (opt1), build dependencies (opt2) and task scheduling (opt3) are all \"A must come before B\" relations, which is exactly what topological sorting handles. Shortest paths (opt4) is a different problem.",
                },
            },
        },
        {
            "id": "topological-sort-q8",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "圖的邊為 A→B、A→C、B→D、C→D。下列哪一個是合法的拓撲排序？",
                    "options": [
                        {"id": "A", "text": "A, B, C, D"},
                        {"id": "B", "text": "B, A, C, D"},
                        {"id": "C", "text": "A, D, B, C"},
                        {"id": "D", "text": "D, B, C, A"},
                    ],
                    "explanation": "A 必須在 B、C 之前，B、C 必須在 D 之前。只有 A, B, C, D（以及 A, C, B, D）符合；其他選項違反了某條邊的先後順序。",
                },
                "en": {
                    "title": "The edges are A→B, A→C, B→D, C→D. Which one is a valid topological order?",
                    "options": [
                        {"id": "A", "text": "A, B, C, D"},
                        {"id": "B", "text": "B, A, C, D"},
                        {"id": "C", "text": "A, D, B, C"},
                        {"id": "D", "text": "D, B, C, A"},
                    ],
                    "explanation": "A must come before B and C, and B and C must come before D. Only A, B, C, D (and A, C, B, D) satisfy this; the others break at least one edge.",
                },
            },
        },
        {
            "id": "topological-sort-q9",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "除了 Kahn 演算法之外，另一種常見的拓撲排序做法是什麼？",
                    "options": [
                        {"id": "A", "text": "對圖做廣度優先搜尋並直接輸出走訪順序"},
                        {"id": "B", "text": "對圖做深度優先搜尋，並將節點「完成走訪」的順序反轉"},
                        {"id": "C", "text": "使用 Dijkstra 演算法"},
                        {"id": "D", "text": "使用快速排序對節點編號排序"},
                    ],
                    "explanation": "DFS 版本在一個節點的所有後代都處理完畢時才把它加入列表，最後將列表反轉就是拓撲順序。單純的 BFS 順序並不保證滿足依賴。",
                },
                "en": {
                    "title": "Besides Kahn's algorithm, what is another common way to compute a topological order?",
                    "options": [
                        {"id": "A", "text": "Run BFS and output the visit order directly"},
                        {"id": "B", "text": "Run DFS and reverse the order in which nodes finish"},
                        {"id": "C", "text": "Use Dijkstra's algorithm"},
                        {"id": "D", "text": "Sort the node ids with quick sort"},
                    ],
                    "explanation": "The DFS approach appends a node only after all its descendants are finished, and reversing that list gives the topological order. A plain BFS visit order does not guarantee the dependencies.",
                },
            },
        },
        {
            "id": "topological-sort-q10",
            "type": "single-choice",
            "baseRating": 1250,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "圖的邊為 A→B、B→C、C→B。對它執行 Kahn 演算法，結果如何？",
                    "options": [
                        {"id": "A", "text": "回傳 A, B, C"},
                        {"id": "B", "text": "回傳 A, C, B"},
                        {"id": "C", "text": "只處理到 A，result 長度為 1，小於 3，判定圖中有環"},
                        {"id": "D", "text": "佇列一開始就是空的"},
                    ],
                    "explanation": "入度：A=0、B=2（來自 A 與 C）、C=1。只有 A 入度為 0，處理 A 後 B 的入度變成 1，仍不為 0，佇列變空。result 只有 [A]，長度 1 < 3，判定有環（B 與 C 互相依賴）。",
                },
                "en": {
                    "title": "The edges are A→B, B→C, C→B. What happens when running Kahn's algorithm on it?",
                    "options": [
                        {"id": "A", "text": "It returns A, B, C"},
                        {"id": "B", "text": "It returns A, C, B"},
                        {"id": "C", "text": "It only processes A; result has length 1 < 3, so a cycle is detected"},
                        {"id": "D", "text": "The queue is empty from the start"},
                    ],
                    "explanation": "In-degrees: A=0, B=2 (from A and C), C=1. Only A starts in the queue; after processing A, B's in-degree drops to 1, not 0, and the queue empties. result is just [A], length 1 < 3, so a cycle is detected (B and C depend on each other).",
                },
            },
        },
        {
            "id": "topological-sort-q11",
            "type": "fill-code",
            "baseRating": 1250,
            "correctAnswer": ["0", "popleft()", "in_degree[v] == 0"],
            "code": TOPO_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 topo_sort 程式碼中 (a)(b)(c) 缺失的表達式。",
                    "options": [
                        {"id": "a", "text": ""},
                        {"id": "b", "text": ""},
                        {"id": "c", "text": ""},
                    ],
                    "explanation": "(a) 起始佇列放入入度為 0 的節點。(b) 以 popleft() 從佇列前端取出節點（先進先出）。(c) 將鄰居入度減 1 後，若剛好變成 0 就代表先決條件都完成了，可以加入佇列：in_degree[v] == 0。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in the topo_sort code.",
                    "options": [
                        {"id": "a", "text": ""},
                        {"id": "b", "text": ""},
                        {"id": "c", "text": ""},
                    ],
                    "explanation": "(a) The initial queue holds nodes whose in-degree is 0. (b) popleft() takes a node from the front of the queue (FIFO). (c) After decrementing a neighbor's in-degree, if it becomes exactly 0 all its prerequisites are done and it can be enqueued: in_degree[v] == 0.",
                },
            },
        },
        {
            "id": "topological-sort-q12",
            "type": "predict-line",
            "baseRating": 1600,
            "correctAnswer": "1 2 3 4 5 6 7 8 9 6 7 8 6 3 4 5 6 7 8 9 6 3 4 5 6 3 10",
            "code": TOPO_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 kahn 函數。圖為 A→B、A→C、B→C，初始 in_degree = {'A': 0, 'B': 1, 'C': 2}，queue = deque(['A'])。呼叫 kahn(graph, in_degree, queue) 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "L1 L2 進入並初始化。取出 A：L3 L4 L5，L6 走訪鄰居 B：L7 入度變 0，L8 成立，L9 加入佇列；L6 再走訪 C：L7 入度 2→1，L8 不成立；L6 鄰居走完。取出 B：L3 L4 L5，L6 鄰居 C：L7 入度 1→0，L8 成立，L9 加入佇列；L6 結束。取出 C：L3 L4 L5，L6 沒有鄰居。佇列已空，L3 結束迴圈，L10 回傳 ['A', 'B', 'C']。完整序列：1 2 3 4 5 6 7 8 9 6 7 8 6 3 4 5 6 7 8 9 6 3 4 5 6 3 10。",
                },
                "en": {
                    "title": "Read the kahn function. The graph is A→B, A→C, B→C with in_degree = {'A': 0, 'B': 1, 'C': 2} and queue = deque(['A']). Calling kahn(graph, in_degree, queue) — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "L1 L2 enter and initialize. Dequeue A: L3 L4 L5; L6 visits neighbor B: L7 its in-degree becomes 0, L8 is true, L9 enqueues it; L6 visits C: L7 in-degree 2→1, L8 is false; L6 ends. Dequeue B: L3 L4 L5; L6 neighbor C: L7 in-degree 1→0, L8 true, L9 enqueues it; L6 ends. Dequeue C: L3 L4 L5, L6 has no neighbors. The queue is empty so L3 ends the loop and L10 returns ['A', 'B', 'C']. Full sequence: 1 2 3 4 5 6 7 8 9 6 7 8 6 3 4 5 6 7 8 9 6 3 4 5 6 3 10.",
                },
            },
        },
    ],
}

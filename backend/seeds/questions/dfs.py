DFS_SIMPLIFIED_CODE = """# 測試用有向圖：
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
    return result"""

DFS_FILL_CODE = """def dfs_recursive(graph, start):
    visited = (a)
    result = []

    def _dfs(node):
        visited.add(node)
        result.append(node)
        for nb in graph[node]:
            if nb not in (b):
                _dfs((c))

    _dfs(start)
    return result"""

DFS_GRID_FILL_CODE = """def grid_dfs(grid, start, end):
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
    return False"""

DFS_PREDICT_CODE = """def dfs(graph, start):               # L1
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
    return result                    # L14"""

DATA = {
    "slug": "dfs",
    "groups": [
        {
            "id": "group-dfs-traversal",
            "translations": {
                "zh-TW": {
                    "title": "題組：DFS 遍歷機制與回溯",
                    "description": "DFS 使用堆疊（Stack）的後進先出（LIFO）特性，沿著一條路徑盡可能深入，碰壁後才回溯。以下使用與 BFS 相同的有向圖，觀察兩種演算法的遍歷順序差異。",
                },
                "en": {
                    "title": "Group: DFS Traversal Mechanism & Backtracking",
                    "description": "DFS uses a Stack's LIFO property to go as deep as possible along one path before backtracking. Using the same directed graph as BFS, observe the traversal order difference between the two algorithms.",
                },
            },
            "code": DFS_SIMPLIFIED_CODE,
            "language": "python",
        }
    ],
    "questions": [
        {
            "id": "dfs-q1",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "深度優先搜尋（DFS）使用哪種資料結構來決定節點的訪問順序？",
                    "options": [
                        {"id": "A", "text": "佇列（Queue）"},
                        {"id": "B", "text": "堆疊（Stack）"},
                        {"id": "C", "text": "優先佇列（Priority Queue）"},
                        {"id": "D", "text": "雜湊表（Hash Map）"},
                    ],
                    "explanation": "DFS 使用堆疊（Stack）的後進先出（LIFO）特性，確保每次都沿著最新加入的路徑深入探索，直到無法繼續才回溯到上一個分支點。",
                },
                "en": {
                    "title": "Which data structure does Depth-First Search (DFS) use to determine node visit order?",
                    "options": [
                        {"id": "A", "text": "Queue"},
                        {"id": "B", "text": "Stack"},
                        {"id": "C", "text": "Priority Queue"},
                        {"id": "D", "text": "Hash Map"},
                    ],
                    "explanation": "DFS uses a Stack's LIFO (Last-In-First-Out) property to always explore the most recently added path as deeply as possible before backtracking to a previous branch point.",
                },
            },
        },
        {
            "id": "dfs-tf-1",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "DFS 可以使用遞迴（Recursion）實作，因為遞迴的呼叫堆疊（Call Stack）本身就扮演了堆疊的角色。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。遞迴版 DFS 利用系統的呼叫堆疊（Call Stack）隱式地扮演堆疊的角色：每次遞迴呼叫就是「壓入」一層深度，函數返回就是「彈出」並回溯。",
                },
                "en": {
                    "title": "DFS can be implemented using recursion, because the recursive call stack itself acts as a stack.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. Recursive DFS uses the system's call stack implicitly as a stack: each recursive call 'pushes' one level deeper; returning from a function 'pops' and backtracks.",
                },
            },
        },
        {
            "id": "dfs-q2",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對題組中的有向圖執行 dfs(graph, 'A')（使用反向加入確保字母順序），回傳的 result 串列為何？",
                    "options": [
                        {"id": "A", "text": "['A', 'C', 'E', 'B', 'D']"},
                        {"id": "B", "text": "['A', 'B', 'D', 'C', 'E']"},
                        {"id": "C", "text": "['A', 'B', 'C', 'D', 'E']"},
                        {"id": "D", "text": "['A', 'D', 'B', 'E', 'C']"},
                    ],
                    "explanation": "從 A 開始，反向加入 C 再加入 B（使 B 在頂部），彈出 B，反向加入 D（堆疊頂），彈出 D（無鄰居），彈回，彈出 C，加入 E，彈出 E。結果：A -> B -> D -> C -> E。",
                },
                "en": {
                    "title": "Running dfs(graph, 'A') on the group's directed graph (using reversed insertion to ensure alphabetical order), what does result contain?",
                    "options": [
                        {"id": "A", "text": "['A', 'C', 'E', 'B', 'D']"},
                        {"id": "B", "text": "['A', 'B', 'D', 'C', 'E']"},
                        {"id": "C", "text": "['A', 'B', 'C', 'D', 'E']"},
                        {"id": "D", "text": "['A', 'D', 'B', 'E', 'C']"},
                    ],
                    "explanation": "Starting from A, push C then B in reversed order (B is on top); pop B, push D; pop D (no neighbors); pop C, push E; pop E. Result: A -> B -> D -> C -> E.",
                },
            },
        },
        {
            "id": "dfs-tf-2",
            "type": "true-false",
            "baseRating": 950,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "DFS 和 BFS 對同一張圖的遍歷結果（節點訪問順序）一定相同。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "錯誤。DFS 和 BFS 的遍歷順序通常不同。BFS 逐層展開（廣度優先），DFS 沿一條路徑深入（深度優先）。以題組圖為例，BFS 結果為 A,B,C,D,E，DFS 結果為 A,B,D,C,E。",
                },
                "en": {
                    "title": "DFS and BFS always produce the same traversal result (node visit order) on the same graph.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "False. DFS and BFS traversal orders are generally different. BFS expands layer by layer (breadth-first); DFS goes as deep as possible along a path (depth-first). For the group's graph: BFS gives A,B,C,D,E while DFS gives A,B,D,C,E.",
                },
            },
        },
        {
            "id": "dfs-q3",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對一個有 V 個節點、E 條邊的圖執行 DFS，時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(V)"},
                        {"id": "B", "text": "O(V + E)"},
                        {"id": "C", "text": "O(V × E)"},
                        {"id": "D", "text": "O(V²)"},
                    ],
                    "explanation": "DFS 最多訪問每個節點一次（O(V)），並遍歷每條邊一次（O(E)），因此總時間複雜度與 BFS 相同，為 O(V + E)。",
                },
                "en": {
                    "title": "What is the time complexity of DFS on a graph with V vertices and E edges?",
                    "options": [
                        {"id": "A", "text": "O(V)"},
                        {"id": "B", "text": "O(V + E)"},
                        {"id": "C", "text": "O(V × E)"},
                        {"id": "D", "text": "O(V²)"},
                    ],
                    "explanation": "DFS visits each node at most once (O(V)) and traverses each edge once (O(E)). Total time complexity is the same as BFS: O(V + E).",
                },
            },
        },
        {
            "id": "dfs-group-1",
            "groupId": "group-dfs-traversal",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "參考題組的迭代版 DFS，執行 dfs(graph, 'A') 時，當第一次執行 stack.pop() 後，堆疊中包含哪些元素？",
                    "options": [
                        {"id": "A", "text": "['B', 'C']"},
                        {"id": "B", "text": "['C', 'B']"},
                        {"id": "C", "text": "['A', 'B']"},
                        {"id": "D", "text": "['D', 'E']"},
                    ],
                    "explanation": "初始堆疊 ['A']，彈出 A，以 reversed(['B','C']) 即 ['C','B'] 的順序依序加入堆疊（C 先 push，B 後 push），使堆疊變為 ['C', 'B']（B 在頂部，下次先被彈出）。",
                },
                "en": {
                    "title": "Using the iterative DFS from the group, when executing dfs(graph, 'A'), what elements are in the stack after the first stack.pop()?",
                    "options": [
                        {"id": "A", "text": "['B', 'C']"},
                        {"id": "B", "text": "['C', 'B']"},
                        {"id": "C", "text": "['A', 'B']"},
                        {"id": "D", "text": "['D', 'E']"},
                    ],
                    "explanation": "Initial stack: ['A']. Pop A, then push neighbors in reversed(['B','C']) order — C first, then B — giving stack ['C', 'B'] (B on top, popped next).",
                },
            },
        },
        {
            "id": "dfs-q4",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "以下哪個問題最適合使用 DFS 解決？",
                    "options": [
                        {"id": "A", "text": "在無權重圖中找兩點之間的最短路徑"},
                        {"id": "B", "text": "判斷圖中是否存在環（Cycle Detection）"},
                        {"id": "C", "text": "找到離起點最近的節點"},
                        {"id": "D", "text": "計算社群網路中的六度分隔"},
                    ],
                    "explanation": "環偵測（opt B）是 DFS 的經典應用：DFS 沿路徑深入，若遇到已在當前路徑上的節點，就代表有環。BFS 更適合最短路徑（opt A）和距離計算（opt C, opt D）。",
                },
                "en": {
                    "title": "Which problem is most suitable for DFS?",
                    "options": [
                        {"id": "A", "text": "Finding shortest path between two nodes in an unweighted graph"},
                        {"id": "B", "text": "Detecting whether a cycle exists in a graph"},
                        {"id": "C", "text": "Finding the node closest to the start"},
                        {"id": "D", "text": "Computing six degrees of separation in a social network"},
                    ],
                    "explanation": "Cycle detection (opt B) is a classic DFS application: DFS goes deep along a path; if it encounters a node already on the current path, a cycle exists. BFS is better suited for shortest paths (opt A) and distance calculations (opt C, opt D).",
                },
            },
        },
        {
            "id": "dfs-group-2",
            "groupId": "group-dfs-traversal",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "承上（題組圖，dfs(graph, 'A')），完整執行後 result 的內容為何？請與 BFS 的結果比較。",
                    "options": [
                        {"id": "A", "text": "['A', 'B', 'C', 'D', 'E']（與 BFS 相同）"},
                        {"id": "B", "text": "['A', 'B', 'D', 'C', 'E']（DFS 先深入 B→D，再回頭訪問 C→E）"},
                        {"id": "C", "text": "['A', 'C', 'E', 'B', 'D']（DFS 先深入 C→E，再訪問 B→D）"},
                        {"id": "D", "text": "['D', 'E', 'B', 'C', 'A']（由葉節點開始）"},
                    ],
                    "explanation": "反向加入使 B 在堆疊頂部，因此先深入 B→D，再回溯訪問 C→E。DFS 結果為 ['A', 'B', 'D', 'C', 'E']，而 BFS 結果為 ['A', 'B', 'C', 'D', 'E']，兩者順序不同。",
                },
                "en": {
                    "title": "Continuing the trace (group graph, dfs(graph, 'A')), what is the final result? Compare with the BFS result.",
                    "options": [
                        {"id": "A", "text": "['A', 'B', 'C', 'D', 'E'] (same as BFS)"},
                        {"id": "B", "text": "['A', 'B', 'D', 'C', 'E'] (DFS goes deep into B→D first, then backtracks to C→E)"},
                        {"id": "C", "text": "['A', 'C', 'E', 'B', 'D'] (DFS goes deep into C→E first, then visits B→D)"},
                        {"id": "D", "text": "['D', 'E', 'B', 'C', 'A'] (starting from leaf nodes)"},
                    ],
                    "explanation": "Reversed insertion puts B on top of the stack, so DFS goes deep into B→D first, then backtracks to visit C→E. DFS result: ['A', 'B', 'D', 'C', 'E'], while BFS gives ['A', 'B', 'C', 'D', 'E'] — different orders.",
                },
            },
        },
        {
            "id": "dfs-q5",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在 DFS 中，「回溯（Backtracking）」是指什麼？",
                    "options": [
                        {"id": "A", "text": "從後往前重新掃描整個陣列"},
                        {"id": "B", "text": "當前路徑無法繼續深入時，返回上一個分支點，嘗試其他選擇"},
                        {"id": "C", "text": "重新從起點開始搜尋"},
                        {"id": "D", "text": "將已訪問的節點從 visited 中移除"},
                    ],
                    "explanation": "回溯是 DFS 的核心機制：當一條路徑走到底（無未訪問的鄰居）時，堆疊彈出（或遞迴返回），回到上一個決策點，然後嘗試另一條分支，直到找到解或窮盡所有可能。",
                },
                "en": {
                    "title": "In DFS, what does 'backtracking' mean?",
                    "options": [
                        {"id": "A", "text": "Rescanning the entire array from back to front"},
                        {"id": "B", "text": "When the current path can go no deeper, returning to the previous branch point to try other choices"},
                        {"id": "C", "text": "Restarting the search from the beginning"},
                        {"id": "D", "text": "Removing visited nodes from the visited set"},
                    ],
                    "explanation": "Backtracking is DFS's core mechanism: when a path reaches a dead end (no unvisited neighbors), the stack pops (or recursion returns) to the previous decision point, then tries another branch — until a solution is found or all possibilities are exhausted.",
                },
            },
        },
        {
            "id": "dfs-q6",
            "type": "single-choice",
            "baseRating": 1450,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "DFS 在「拓撲排序（Topological Sort）」問題中如何應用？",
                    "options": [
                        {"id": "A", "text": "DFS 遍歷後直接輸出 result 即為拓撲排序"},
                        {"id": "B", "text": "DFS 在節點完成（所有鄰居都已訪問）時將其加入結果，最後反轉即為拓撲排序"},
                        {"id": "C", "text": "DFS 無法應用於拓撲排序，應使用 BFS（Kahn's Algorithm）"},
                        {"id": "D", "text": "DFS 在找到環時自動輸出拓撲排序"},
                    ],
                    "explanation": "拓撲排序的 DFS 做法：當一個節點的所有子孫都已處理完（遞迴返回時），將該節點加入結果串列的頭部（或加入 stack 後反轉）。這樣得到的序列保證每條邊 u→v 中，u 在 v 之前。",
                },
                "en": {
                    "title": "How is DFS applied to Topological Sort?",
                    "options": [
                        {"id": "A", "text": "The DFS traversal result directly gives the topological order"},
                        {"id": "B", "text": "When a node is fully processed (all neighbors visited), add it to the result; reverse at the end for topological order"},
                        {"id": "C", "text": "DFS cannot be used for topological sort — use BFS (Kahn's Algorithm) instead"},
                        {"id": "D", "text": "DFS automatically outputs a topological sort when it finds a cycle"},
                    ],
                    "explanation": "Topological sort with DFS: when a node's descendants are all processed (on recursive return), add the node to the front of the result (or push to a stack then reverse). This guarantees for every edge u→v, u appears before v.",
                },
            },
        },
        {
            "id": "dfs-q7",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "使用遞迴版 DFS 在非常深的圖（深度接近 10^5）上執行，可能會發生什麼問題？",
                    "options": [
                        {"id": "A", "text": "時間複雜度增加為 O(N²)"},
                        {"id": "B", "text": "呼叫堆疊（Call Stack）溢位（Stack Overflow / RecursionError）"},
                        {"id": "C", "text": "無法找到正確的路徑"},
                        {"id": "D", "text": "visited 集合耗盡記憶體"},
                    ],
                    "explanation": "遞迴版 DFS 的每一層遞迴都佔用一個 Call Stack Frame。Python 的預設遞迴深度限制約為 1000。當圖的深度超過此限制，Python 會拋出 RecursionError（即 Stack Overflow），此時應改用迭代版 DFS。",
                },
                "en": {
                    "title": "When running recursive DFS on a very deep graph (depth close to 10^5), what problem might occur?",
                    "options": [
                        {"id": "A", "text": "Time complexity increases to O(N²)"},
                        {"id": "B", "text": "Call Stack overflow (Stack Overflow / RecursionError)"},
                        {"id": "C", "text": "The correct path cannot be found"},
                        {"id": "D", "text": "The visited set exhausts memory"},
                    ],
                    "explanation": "Each recursive DFS call occupies a Call Stack Frame. Python's default recursion limit is approximately 1000. If the graph depth exceeds this, Python raises a RecursionError (i.e., Stack Overflow). Iterative DFS should be used instead.",
                },
            },
        },
        {
            "id": "dfs-multi-1",
            "type": "multiple-choice",
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt3", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些問題適合使用 DFS 解決？（多選）",
                    "options": [
                        {"id": "opt1", "text": "找出圖中所有的連通元件（Connected Components）"},
                        {"id": "opt2", "text": "在無權重圖中找兩點之間的最短路徑"},
                        {"id": "opt3", "text": "判斷有向圖中是否存在環（Cycle Detection）"},
                        {"id": "opt4", "text": "生成迷宮（探索所有可能路徑）"},
                    ],
                    "explanation": "DFS 適合全圖探索（opt1, opt4 正確）和拓撲/環相關問題（opt3 正確）。無權重圖的最短路徑是 BFS 的強項，DFS 不保證找到最短路徑（opt2 不適合）。",
                },
                "en": {
                    "title": "Which problems are suitable for DFS? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Finding all connected components in a graph"},
                        {"id": "opt2", "text": "Shortest path between two nodes in an unweighted graph"},
                        {"id": "opt3", "text": "Detecting cycles in a directed graph"},
                        {"id": "opt4", "text": "Maze generation (exploring all possible paths)"},
                    ],
                    "explanation": "DFS is suited for full-graph exploration (opt1, opt4 correct) and topology/cycle-related problems (opt3 correct). Shortest path in unweighted graphs is BFS's strength — DFS does not guarantee the shortest path (opt2 not suitable).",
                },
            },
        },
        {
            "id": "dfs-q8",
            "type": "single-choice",
            "baseRating": 1550,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在 DFS 的迭代版本中（使用顯式堆疊），為何有時需要在「取出時」才標記 visited，而不是「加入時」？",
                    "options": [
                        {"id": "A", "text": "因為迭代版不需要 visited 集合"},
                        {"id": "B", "text": "某些問題需要允許同一節點從不同路徑被重新探索，取出時標記可模擬遞迴 DFS 的行為"},
                        {"id": "C", "text": "加入時標記會導致時間複雜度變成 O(N²)"},
                        {"id": "D", "text": "兩種標記方式完全等效，沒有任何差異"},
                    ],
                    "explanation": "迭代版 DFS 若在「加入堆疊時」標記，會導致遍歷順序與遞迴 DFS 不同（因為堆疊可能有重複節點）。在「取出時」才標記（並加 if curr in visited: continue），行為更接近遞迴版，但代價是堆疊中可能有重複元素。",
                },
                "en": {
                    "title": "In the iterative DFS version (using an explicit stack), why might you mark visited when dequeuing rather than when enqueuing?",
                    "options": [
                        {"id": "A", "text": "Because iterative DFS doesn't need a visited set"},
                        {"id": "B", "text": "Some problems need to allow re-exploration from different paths; marking on dequeue better mimics recursive DFS behavior"},
                        {"id": "C", "text": "Marking on enqueue increases time complexity to O(N²)"},
                        {"id": "D", "text": "Both approaches are completely equivalent with no difference"},
                    ],
                    "explanation": "If iterative DFS marks visited on push, the traversal order may differ from recursive DFS (the stack may contain duplicate nodes). Marking on pop (with 'if curr in visited: continue') more closely mirrors recursive behavior, at the cost of potential duplicates in the stack.",
                },
            },
        },
        {
            "id": "dfs-group-3",
            "groupId": "group-dfs-traversal",
            "type": "fill-code",
            "baseRating": 1100,
            "correctAnswer": ["set()", "visited", "nb"],
            "code": DFS_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 dfs_recursive 程式碼中 (a)(b)(c) 缺失的表達式，完成遞迴版 DFS 的實作。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 初始化 visited 為空集合 set()。(b) 判斷鄰居是否在 visited 集合中，避免重複訪問。(c) 遞迴呼叫 _dfs 並傳入鄰居 nb。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in dfs_recursive to complete the recursive DFS implementation.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Initialize visited as an empty set: set(). (b) Check if the neighbor is in the visited set to avoid revisiting. (c) Recursively call _dfs with the neighbor nb.",
                },
            },
        },
        {
            "id": "dfs-q9",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "遞迴版 DFS 的空間複雜度取決於什麼？",
                    "options": [
                        {"id": "A", "text": "O(1)，不需要額外空間"},
                        {"id": "B", "text": "O(V)，需要儲存所有節點"},
                        {"id": "C", "text": "O(h)，其中 h 是 DFS 樹的最大深度（最長路徑）"},
                        {"id": "D", "text": "O(E)，取決於邊的數量"},
                    ],
                    "explanation": "遞迴 DFS 的 Call Stack 深度取決於 DFS 樹的高度（最深路徑長度）h。最壞情況下（線性圖）h = V，空間為 O(V)；一般情況下空間為 O(h)，h ≤ V。",
                },
                "en": {
                    "title": "What does the space complexity of recursive DFS depend on?",
                    "options": [
                        {"id": "A", "text": "O(1) — no extra space needed"},
                        {"id": "B", "text": "O(V) — need to store all nodes"},
                        {"id": "C", "text": "O(h), where h is the maximum depth of the DFS tree (longest path)"},
                        {"id": "D", "text": "O(E) — depends on edge count"},
                    ],
                    "explanation": "Recursive DFS call stack depth depends on the DFS tree height (longest path length) h. In the worst case (linear graph) h = V, giving O(V) space. In general, space is O(h) where h ≤ V.",
                },
            },
        },
        {
            "id": "dfs-multi-2",
            "type": "multiple-choice",
            "baseRating": 1600,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "關於 DFS 的特性與限制，以下哪些敘述是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "DFS 的時間複雜度為 O(V + E)，與 BFS 相同"},
                        {"id": "opt2", "text": "DFS 不保證在無權重圖中找到最短路徑"},
                        {"id": "opt3", "text": "DFS 在任何情況下都比 BFS 更省記憶體"},
                        {"id": "opt4", "text": "DFS 可用於拓撲排序，而 BFS 需要特殊處理（Kahn's Algorithm）"},
                    ],
                    "explanation": "opt1 正確：DFS 和 BFS 都是 O(V + E)。opt2 正確：DFS 不保證最短路徑，可能走較長的路。opt3 錯誤：BFS 在窄深圖較省記憶體，DFS 在寬淺圖較省。opt4 正確：DFS 的遞迴完成順序自然適合拓撲排序；BFS 版本（Kahn）需要計算入度。",
                },
                "en": {
                    "title": "Which statements about DFS characteristics and limitations are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "DFS time complexity is O(V + E), same as BFS"},
                        {"id": "opt2", "text": "DFS does not guarantee finding the shortest path in an unweighted graph"},
                        {"id": "opt3", "text": "DFS is always more memory-efficient than BFS in any situation"},
                        {"id": "opt4", "text": "DFS can be used for topological sort, while BFS requires special handling (Kahn's Algorithm)"},
                    ],
                    "explanation": "opt1 correct: both DFS and BFS are O(V + E). opt2 correct: DFS may take longer paths. opt3 wrong: BFS is more memory-efficient on narrow-deep graphs; DFS is more efficient on wide-shallow ones. opt4 correct: DFS recursive completion order naturally suits topological sort; BFS version (Kahn's) requires tracking in-degrees.",
                },
            },
        },
        {
            "id": "dfs-fill-1",
            "type": "fill-code",
            "baseRating": 1300,
            "correctAnswer": ["start", "stack.pop()", "grid[nr][nc]"],
            "code": DFS_GRID_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 grid_dfs 程式碼中 (a)(b)(c) 缺失的表達式，完成網格 DFS 的路徑存在性判斷。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 初始化堆疊，以起始位置 start 為第一個元素。(b) 從堆疊取出當前位置，使用 stack.pop()。(c) 邊界和障礙物判斷中檢查格子內容：grid[nr][nc]。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in grid_dfs to complete the grid DFS path existence check.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Initialize the stack with the starting position start as the first element. (b) Pop the current position from the stack using stack.pop(). (c) In the boundary and obstacle check, inspect the cell content: grid[nr][nc].",
                },
            },
        },
        {
            "id": "dfs-pred-1",
            "type": "predict-line",
            "baseRating": 1450,
            "correctAnswer": "1 2 3 4 5 6 7 9 10 11 12 13 5 6 7 9 10 5 14",
            "code": DFS_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 dfs 函數（取出時標記版本）。使用圖 graph = {'A': ['B'], 'B': []}，呼叫 dfs(graph, 'A') 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "L1-L4 初始化，stack=['A']；L5 while；L6 pop A；L7 A in visited({})?No；L9 add A；L10 append；L11-L13 push B；L5 while；L6 pop B；L7 B in visited?No；L9 add B；L10 append；L11 L12 no unvisited；L5 while stack 空?No... stack 空，L5 失敗；L14 return。序列：1 2 3 4 5 6 7 9 10 11 12 13 5 6 7 9 10 5 14。",
                },
                "en": {
                    "title": "Read the dfs function (mark-on-dequeue version). Using graph = {'A': ['B'], 'B': []}, calling dfs(graph, 'A') — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "L1-L4 initialize, stack=['A']; L5 while; L6 pop A; L7 A in visited({})? No; L9 add A; L10 append; L11-L13 push B; L5 while; L6 pop B; L7 B in visited? No; L9 add B; L10 append; L11-L12 no unvisited neighbors; L5 stack empty → L14 return. Sequence: 1 2 3 4 5 6 7 9 10 11 12 13 5 6 7 9 10 5 14.",
                },
            },
        },
    ],
}

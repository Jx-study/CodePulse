BFS_CODE = """def bfs(root):
    queue = [root]
    while queue:
        node = queue.pop(0)
        visit(node)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)"""

BFS_FILL_CODE = """def bfs(root):
    queue = [(a)]
    while (b):
        node = queue.(c)
        visit(node)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)"""

INORDER_FILL_CODE = """def inorder(node):
    if not (a): return
    inorder((b))
    visit((c))
    inorder(node.right)"""

PREORDER_PREDICT_CODE = """class BinaryTree:
    def preorder(node):                  # L1
        if not node: return              # L2
        visit(node)                      # L3
        preorder(node.left)              # L4
        preorder(node.right)             # L5"""

ARRAY_STORAGE_CODE = """# Complete binary tree stored in a zero-indexed array
# index:  0    1    2    3    4    5    6
tree = ["A", "B", "C", "D", "E", None, "F"]

def left(i): return 2 * i + 1
def right(i): return 2 * i + 2
def parent(i): return (i - 1) // 2"""

ITERATIVE_PREORDER_FILL_CODE = """def preorder_iter(root):
    if not root: return
    stack = [root]
    while stack:
        node = stack.pop()
        visit(node)
        if node.right: stack.append((a))
        if node.left: stack.append((b))"""

HEIGHT_FILL_CODE = """def height(node):
    if not node:
        return (a)
    left_h = height(node.left)
    right_h = height(node.right)
    return (b) + max((c), right_h)"""

DATA = {
    "slug": "binarytree",
    "groups": [
        {
            "id": "group-bt-bfs",
            "translations": {
                "zh-TW": {
                    "title": "題組：廣度優先搜尋 (BFS / Level Order Traversal)",
                    "description": "以下是教學區中實作二元樹「層序遍歷 (BFS)」的 Python 程式碼，使用陣列模擬 Queue (佇列)。請閱讀後回答問題。",
                },
                "en": {
                    "title": "Group: Breadth-First Search (BFS / Level Order Traversal)",
                    "description": "The following Python code implements Binary Tree Level Order Traversal (BFS) using a list to simulate a Queue. Read the code and answer the questions.",
                },
            },
            "code": BFS_CODE,
            "language": "python",
        },
        {
            "id": "group-bt-array-storage",
            "translations": {
                "zh-TW": {
                    "title": "題組：二元樹的陣列儲存索引",
                    "description": "以下示範用零起始陣列儲存一棵近似完全二元樹。請根據 left/right/parent 的索引公式回答問題。",
                },
                "en": {
                    "title": "Group: Array Index Storage for Binary Trees",
                    "description": "The code below stores an almost-complete binary tree in a zero-indexed array. Use the left/right/parent index formulas to answer the questions.",
                },
            },
            "code": ARRAY_STORAGE_CODE,
            "language": "python",
        },
    ],
    "questions": [
        {
            "id": "bt-tf-1",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 單一理論與定義) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "在二元樹 (Binary Tree) 中，每個節點最多只能有兩個子節點（通常稱為左子節點與右子節點）。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "這是二元樹的最基本定義。一個節點可以有 0 個、1 個或 2 個子節點，但絕對不能超過 2 個。",
                },
                "en": {
                    "title": "In a Binary Tree, each node can have at most two children (typically called the left child and the right child).",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "This is the most fundamental definition of a binary tree. A node can have 0, 1, or 2 children, but never more than 2.",
                },
            },
        },
        {
            "id": "bt-q1",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "二元樹的「前序遍歷 (Preorder Traversal)」是指依照什麼順序訪問節點？",
                    "options": [
                        {"id": "A", "text": "根節點 -> 左子樹 -> 右子樹"},
                        {"id": "B", "text": "左子樹 -> 根節點 -> 右子樹"},
                        {"id": "C", "text": "左子樹 -> 右子樹 -> 根節點"},
                        {"id": "D", "text": "逐層由上而下訪問"},
                    ],
                    "explanation": "前序 (Pre-order) 的 \"Pre\" 代表「根節點」最先被訪問，接著才遞迴訪問左子樹與右子樹。",
                },
                "en": {
                    "title": "What is the node visiting order for 'Preorder Traversal' in a binary tree?",
                    "options": [
                        {"id": "A", "text": "Root -> Left subtree -> Right subtree"},
                        {"id": "B", "text": "Left subtree -> Root -> Right subtree"},
                        {"id": "C", "text": "Left subtree -> Right subtree -> Root"},
                        {"id": "D", "text": "Level by level from top to bottom"},
                    ],
                    "explanation": "The 'Pre' in Pre-order means the root is visited first, then the left subtree is recursively traversed, followed by the right subtree.",
                },
            },
        },
        {
            "id": "bt-q2",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "二元樹的「中序遍歷 (Inorder Traversal)」是指依照什麼順序訪問節點？",
                    "options": [
                        {"id": "A", "text": "根節點 -> 左子樹 -> 右子樹"},
                        {"id": "B", "text": "左子樹 -> 根節點 -> 右子樹"},
                        {"id": "C", "text": "左子樹 -> 右子樹 -> 根節點"},
                        {"id": "D", "text": "右子樹 -> 左子樹 -> 根節點"},
                    ],
                    "explanation": "中序 (In-order) 的 \"In\" 代表「根節點」在中間被訪問，順序為：左 -> 根 -> 右。在二元搜尋樹 (BST) 中，中序遍歷會由小到大印出所有節點。",
                },
                "en": {
                    "title": "What is the node visiting order for 'Inorder Traversal' in a binary tree?",
                    "options": [
                        {"id": "A", "text": "Root -> Left subtree -> Right subtree"},
                        {"id": "B", "text": "Left subtree -> Root -> Right subtree"},
                        {"id": "C", "text": "Left subtree -> Right subtree -> Root"},
                        {"id": "D", "text": "Right subtree -> Left subtree -> Root"},
                    ],
                    "explanation": "The 'In' in In-order means the root is visited in the middle: Left -> Root -> Right. In a Binary Search Tree (BST), inorder traversal prints all nodes in ascending order.",
                },
            },
        },
        {
            "id": "bt-q3",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "二元樹的「後序遍歷 (Postorder Traversal)」是指依照什麼順序訪問節點？",
                    "options": [
                        {"id": "A", "text": "根節點 -> 左子樹 -> 右子樹"},
                        {"id": "B", "text": "左子樹 -> 根節點 -> 右子樹"},
                        {"id": "C", "text": "左子樹 -> 右子樹 -> 根節點"},
                        {"id": "D", "text": "右子樹 -> 根節點 -> 左子樹"},
                    ],
                    "explanation": "後序 (Post-order) 的 \"Post\" 代表「根節點」最後被訪問，必須先處理完左右子樹。",
                },
                "en": {
                    "title": "What is the node visiting order for 'Postorder Traversal' in a binary tree?",
                    "options": [
                        {"id": "A", "text": "Root -> Left subtree -> Right subtree"},
                        {"id": "B", "text": "Left subtree -> Root -> Right subtree"},
                        {"id": "C", "text": "Left subtree -> Right subtree -> Root"},
                        {"id": "D", "text": "Right subtree -> Root -> Left subtree"},
                    ],
                    "explanation": "The 'Post' in Post-order means the root is visited last — both subtrees must be fully processed before the root.",
                },
            },
        },
        {
            "id": "bt-tf-2",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 單一理論與定義) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "廣度優先搜尋 (BFS / 層序遍歷) 會保證靠近根節點的層級被優先訪問，然後才訪問更深層的節點。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "BFS 的特性就是「逐層向外擴張」，因此 Level 1 (根) 會比 Level 2 先訪問，Level 2 會比 Level 3 先訪問，以此類推。",
                },
                "en": {
                    "title": "Breadth-First Search (BFS / Level Order Traversal) guarantees that nodes closer to the root are visited before nodes at deeper levels.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "BFS expands level by level — Level 1 (root) is visited before Level 2, Level 2 before Level 3, and so on.",
                },
            },
        },
        {
            "id": "bt-q4",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 100(新手誤區) = 1050
            "baseRating": 1050,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "實作層序遍歷 (BFS) 時，通常需要搭配哪種資料結構來暫存節點？",
                    "options": [
                        {"id": "A", "text": "Stack (堆疊)"},
                        {"id": "B", "text": "Queue (佇列)"},
                        {"id": "C", "text": "Hash Table (雜湊表)"},
                        {"id": "D", "text": "Linked List (單純的鏈結串列)"},
                    ],
                    "explanation": "BFS 需要「先進先出 (FIFO)」的特性來確保先發現的節點（較淺層）能先被處理，因此必須使用 Queue。",
                },
                "en": {
                    "title": "When implementing Level Order Traversal (BFS), which data structure is typically used to temporarily store nodes?",
                    "options": [
                        {"id": "A", "text": "Stack"},
                        {"id": "B", "text": "Queue"},
                        {"id": "C", "text": "Hash Table"},
                        {"id": "D", "text": "Linked List"},
                    ],
                    "explanation": "BFS requires FIFO (First-In-First-Out) behavior to ensure shallower nodes are processed before deeper ones, so a Queue must be used.",
                },
            },
        },
        {
            "id": "bt-q5",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 50(視覺/相似度干擾) = 950
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "遞迴實作深度優先搜尋 (DFS, 包括前/中/後序遍歷) 時，程式底層隱含使用了哪種資料結構？",
                    "options": [
                        {"id": "A", "text": "Queue (佇列)"},
                        {"id": "B", "text": "Call Stack (呼叫堆疊)"},
                        {"id": "C", "text": "Min Heap (最小堆積)"},
                        {"id": "D", "text": "Graph (圖)"},
                    ],
                    "explanation": "遞迴函數的執行依賴作業系統的 Call Stack 來記錄每次函數呼叫的狀態與返回位址，這本身就是一種 Stack (LIFO) 行為。",
                },
                "en": {
                    "title": "When implementing DFS (Preorder/Inorder/Postorder) recursively, which data structure is implicitly used by the program?",
                    "options": [
                        {"id": "A", "text": "Queue"},
                        {"id": "B", "text": "Call Stack"},
                        {"id": "C", "text": "Min Heap"},
                        {"id": "D", "text": "Graph"},
                    ],
                    "explanation": "Recursive function execution relies on the OS Call Stack to record each function call's state and return address — this is inherently LIFO (Stack) behavior.",
                },
            },
        },
        {
            "id": "bt-group-1",
            "groupId": "group-bt-bfs",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 100(新手誤區) = 1000
            "baseRating": 1000,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在上述 BFS 程式碼中，queue.pop(0) 這行程式碼的作用是模擬 Queue 的哪種基本操作？",
                    "options": [
                        {"id": "A", "text": "Enqueue (入隊)"},
                        {"id": "B", "text": "Dequeue (出隊)"},
                        {"id": "C", "text": "Peek (查看頂端)"},
                        {"id": "D", "text": "Clear (清空)"},
                    ],
                    "explanation": "pop(0) 會移除並回傳陣列中的第 0 個（最前面）的元素，這正是 Queue 先進先出的 Dequeue 行為。",
                },
                "en": {
                    "title": "In the BFS code above, what Queue operation does `queue.pop(0)` simulate?",
                    "options": [
                        {"id": "A", "text": "Enqueue"},
                        {"id": "B", "text": "Dequeue"},
                        {"id": "C", "text": "Peek"},
                        {"id": "D", "text": "Clear"},
                    ],
                    "explanation": "pop(0) removes and returns the element at index 0 (the front), which is exactly the FIFO Dequeue behavior of a Queue.",
                },
            },
        },
        {
            "id": "bt-q6",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 150(L2 單步追蹤) + 100(新手誤區) = 1100
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "有一棵二元樹，根節點為 A，A 的左子節點為 B，A 的右子節點為 C。請問其中序遍歷 (Inorder) 的結果為何？",
                    "options": [
                        {"id": "A", "text": "A, B, C"},
                        {"id": "B", "text": "B, A, C"},
                        {"id": "C", "text": "B, C, A"},
                        {"id": "D", "text": "C, B, A"},
                    ],
                    "explanation": "中序遍歷順序為「左 -> 根 -> 右」。因此先訪問左子節點 B，接著訪問根節點 A，最後訪問右子節點 C。",
                },
                "en": {
                    "title": "A binary tree has root A, left child B, and right child C. What is the Inorder traversal result?",
                    "options": [
                        {"id": "A", "text": "A, B, C"},
                        {"id": "B", "text": "B, A, C"},
                        {"id": "C", "text": "B, C, A"},
                        {"id": "D", "text": "C, B, A"},
                    ],
                    "explanation": "Inorder traversal follows Left -> Root -> Right. So: left child B first, then root A, then right child C.",
                },
            },
        },
        {
            "id": "bt-multi-1",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 50(L1 單一理論與定義) + 50(視覺/相似度干擾) = 1000
            "baseRating": 1000,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些演算法屬於二元樹的「深度優先搜尋 (DFS)」？（多選）",
                    "options": [
                        {"id": "opt1", "text": "前序遍歷 (Preorder)"},
                        {"id": "opt2", "text": "中序遍歷 (Inorder)"},
                        {"id": "opt3", "text": "後序遍歷 (Postorder)"},
                        {"id": "opt4", "text": "層序遍歷 (Level Order / BFS)"},
                    ],
                    "explanation": "前、中、後序遍歷都是優先沿著子節點深入到樹的底部，屬於 DFS。層序遍歷則是逐層水平走訪，屬於 BFS。",
                },
                "en": {
                    "title": "Which of the following algorithms are Depth-First Search (DFS) on a binary tree? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Preorder Traversal"},
                        {"id": "opt2", "text": "Inorder Traversal"},
                        {"id": "opt3", "text": "Postorder Traversal"},
                        {"id": "opt4", "text": "Level Order Traversal (BFS)"},
                    ],
                    "explanation": "Preorder, Inorder, and Postorder all traverse deeply along child nodes first — these are DFS. Level Order traversal visits nodes horizontally level by level — that is BFS.",
                },
            },
        },
        {
            "id": "bt-group-2",
            "groupId": "group-bt-bfs",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態改變) + 100(新手誤區) = 1200
            "baseRating": 1200,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "若當前取出的 node 沒有任何子節點 (葉節點)，執行完這次 while 迴圈後，queue 的長度會發生什麼變化？",
                    "options": [
                        {"id": "A", "text": "增加 2"},
                        {"id": "B", "text": "維持不變"},
                        {"id": "C", "text": "減少 1"},
                        {"id": "D", "text": "變成 0"},
                    ],
                    "explanation": "迴圈開頭 pop(0) 會讓長度減 1。因為 node 沒有左右子節點，兩次 if 條件皆為 False，不會 append 新元素。因此整體長度淨減少 1。",
                },
                "en": {
                    "title": "If the current node popped from the queue is a leaf node (no children), how does the queue length change after this while loop iteration?",
                    "options": [
                        {"id": "A", "text": "Increases by 2"},
                        {"id": "B", "text": "Stays the same"},
                        {"id": "C", "text": "Decreases by 1"},
                        {"id": "D", "text": "Becomes 0"},
                    ],
                    "explanation": "pop(0) at the start decreases the length by 1. Since the leaf node has no children, both if conditions are False and nothing is appended. Net change: -1.",
                },
            },
        },
        {
            "id": "bt-q7",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 50(視覺/相似度干擾) = 950
            "baseRating": 950,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "如果我們想要在記憶體中安全地「刪除整棵二元樹」，應該使用哪種遍歷方式最適合？",
                    "options": [
                        {"id": "A", "text": "前序遍歷 (Preorder)"},
                        {"id": "B", "text": "中序遍歷 (Inorder)"},
                        {"id": "C", "text": "後序遍歷 (Postorder)"},
                        {"id": "D", "text": "層序遍歷 (BFS)"},
                    ],
                    "explanation": "刪除節點時，必須確保其左右子樹都已經被安全刪除後，才能刪除該節點本身。後序遍歷 (左->右->根) 完美符合這個「先處理子、再處理父」的需求。",
                },
                "en": {
                    "title": "Which traversal is most suitable for safely deleting an entire binary tree from memory?",
                    "options": [
                        {"id": "A", "text": "Preorder"},
                        {"id": "B", "text": "Inorder"},
                        {"id": "C", "text": "Postorder"},
                        {"id": "D", "text": "Level Order (BFS)"},
                    ],
                    "explanation": "When deleting nodes, you must ensure both subtrees are safely deleted before deleting the node itself. Postorder (Left -> Right -> Root) perfectly satisfies this 'children before parent' requirement.",
                },
            },
        },
        {
            "id": "bt-q8",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在一棵完全退化成「只有右子節點」的二元樹（形狀像 Linked List）上執行遞迴 DFS，若有 n 個節點，其空間複雜度（Call Stack 深度）為何？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "DFS 的空間複雜度取決於樹的最大高度 (O(h))。在退化樹中，高度 h 等於節點數 n，因此 Call Stack 會累積 n 層，空間複雜度為 O(n)。這可能導致 Stack Overflow。",
                },
                "en": {
                    "title": "For a degenerate binary tree with only right children (shaped like a Linked List) with n nodes, what is the space complexity (Call Stack depth) of recursive DFS?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "DFS space complexity depends on the maximum tree height O(h). In a degenerate tree, height h equals n, so the Call Stack accumulates n frames — O(n) space. This can cause Stack Overflow.",
                },
            },
        },
        {
            "id": "bt-group-3",
            "groupId": "group-bt-bfs",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 50(L1 單一理論與定義) + 50(視覺/相似度干擾) = 1050
            "baseRating": 1050,
            "correctAnswer": ["root", "queue", "pop(0)"],
            "code": BFS_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入 BFS 程式碼中 (a)(b)(c) 處缺失的部分（注意 Python 語法）。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 初始化 Queue 時須放入起點 root。(b) 迴圈條件為 queue 不為空。(c) 使用 pop(0) 模擬 Dequeue 操作，取出最前方的元素。",
                },
                "en": {
                    "title": "Fill in the blanks (a)(b)(c) in the BFS code (Python syntax).",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Initialize the queue with the starting node root. (b) Loop condition: queue is not empty. (c) Use pop(0) to simulate Dequeue — remove the front element.",
                },
            },
        },
        {
            "id": "bt-q9",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 0(直觀) = 950
            "baseRating": 950,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "對於包含 n 個節點的二元樹，無論使用哪種遍歷演算法 (Preorder, Inorder, Postorder, BFS)，其時間複雜度都是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "遍歷的定義就是「拜訪樹中的每一個節點剛好一次」。因為有 n 個節點，無論順序為何，總共都需要執行 n 次訪問操作，因此時間複雜度恆為 O(n)。",
                },
                "en": {
                    "title": "For a binary tree with n nodes, what is the time complexity of any traversal algorithm (Preorder, Inorder, Postorder, BFS)?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "Traversal by definition visits every node exactly once. With n nodes, regardless of order, exactly n visit operations are performed — time complexity is always O(n).",
                },
            },
        },
        {
            "id": "bt-fill-1",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 150(L2 單步追蹤) + 100(新手誤區) = 1200
            "baseRating": 1200,
            "correctAnswer": ["node", "node.left", "node"],
            "code": INORDER_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "以下是中序遍歷 (Inorder) 的遞迴實作。請填入 (a)(b)(c) 缺失的 Python 變數與邏輯。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "中序的邏輯：(a) 檢查當前 node 是否為空 (終止條件)。(b) 遞迴進入左子樹 node.left。(c) 訪問當前 node 本身。最後遞迴右子樹。",
                },
                "en": {
                    "title": "The following is a recursive Inorder Traversal implementation. Fill in the missing Python variables/logic at (a)(b)(c).",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "Inorder logic: (a) check if current node is None (base case). (b) recursively enter the left subtree node.left. (c) visit the current node itself. Then recurse into the right subtree.",
                },
            },
        },
        {
            "id": "bt-multi-2",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 400(L4 複雜控制流/邊界分析) + 250(複合陷阱) = 1550
            "baseRating": 1550,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "關於遞迴走訪二元樹的複雜度分析，以下哪些敘述是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "時間複雜度始終為 O(n)，因為每個節點都會被訪問。"},
                        {"id": "opt2", "text": "空間複雜度取決於樹的高度 h，表示為 O(h)。"},
                        {"id": "opt3", "text": "對於完美平衡的二元樹，空間複雜度最佳可達 O(log n)。"},
                        {"id": "opt4", "text": "遞迴實作不需要消耗任何額外的記憶體空間。"},
                    ],
                    "explanation": "遞迴會消耗 Call Stack，空間為 O(h)。最壞情況退化樹 h=n (O(n))，最好情況平衡樹 h=log n (O(log n))。因此 opt4 是錯誤的。",
                },
                "en": {
                    "title": "Which statements about the complexity of recursive binary tree traversal are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Time complexity is always O(n) because every node is visited."},
                        {"id": "opt2", "text": "Space complexity depends on tree height h, expressed as O(h)."},
                        {"id": "opt3", "text": "For a perfectly balanced binary tree, space complexity can be as good as O(log n)."},
                        {"id": "opt4", "text": "Recursive implementation consumes no extra memory space."},
                    ],
                    "explanation": "Recursion consumes Call Stack space of O(h). Worst case (degenerate tree): h=n → O(n). Best case (balanced tree): h=log n → O(log n). Therefore opt4 is incorrect.",
                },
            },
        },
        {
            "id": "bt-pred-1",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1500
            "baseRating": 1500,
            "correctAnswer": "1 2 3 4 1 2 5 1 2",
            "code": PREORDER_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "給定一棵只有根節點 root 的二元樹（root.left = None 且 root.right = None）。呼叫 preorder(root) 時，請依序填寫執行的行號序列（空格分隔）。",
                    "options": [],
                    "explanation": "進入 root(L1,L2,L3) -> 呼叫左子樹 node.left(L4) -> 進入 None(L1)，觸發 return(L2) -> 返回 root 呼叫右子樹 node.right(L5) -> 進入 None(L1)，觸發 return(L2)。因此序列為 1 2 3 4 1 2 5 1 2。",
                },
                "en": {
                    "title": "Given a binary tree with only a root node (root.left = None and root.right = None), calling preorder(root) — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "Enter root(L1,L2,L3) -> call left subtree(L4) -> enter None(L1), trigger return(L2) -> back to root, call right subtree(L5) -> enter None(L1), trigger return(L2). Sequence: 1 2 3 4 1 2 5 1 2.",
                },
            },
        },
        {
            "id": "bt-q19",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 單一理論與定義) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "在「完全二元樹 (Complete Binary Tree)」中，每一個節點都必須剛好有 0 個或 2 個子節點。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "這是錯誤的。完全二元樹要求除了最後一層外都填滿，最後一層由左到右填入；「每個節點有 0 或 2 個子節點」描述的是滿二元樹 (Full Binary Tree) 的性質。",
                },
                "en": {
                    "title": "In a Complete Binary Tree, every node must have exactly 0 or 2 children.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "False. A complete binary tree fills every level except possibly the last, and the last level is filled from left to right. The 0-or-2-children rule describes a full binary tree.",
                },
            },
        },
        {
            "id": "bt-q20",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 0(直觀) = 950
            "baseRating": 950,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "使用物件節點儲存二元樹時，一個典型 Node 物件最少需要保存哪些連結？",
                    "options": [
                        {"id": "A", "text": "只需要 parent 指標"},
                        {"id": "B", "text": "只需要 next 指標"},
                        {"id": "C", "text": "left、right、next 三個指標一定都需要"},
                        {"id": "D", "text": "value，以及指向 left 和 right 子節點的參考"},
                    ],
                    "explanation": "二元樹節點的核心是資料值與左右子節點參考。parent 或 next 可以依需求額外加入，但不是最基本的二元樹表示法必備欄位。",
                },
                "en": {
                    "title": "When storing a binary tree with linked node objects, what links does a typical Node need at minimum?",
                    "options": [
                        {"id": "A", "text": "Only a parent pointer"},
                        {"id": "B", "text": "Only a next pointer"},
                        {"id": "C", "text": "left, right, and next pointers are always required"},
                        {"id": "D", "text": "A value plus references to left and right children"},
                    ],
                    "explanation": "The core binary tree node stores a value and references to left and right children. parent or next links may be added for special needs, but they are not required in the basic representation.",
                },
            },
        },
        {
            "id": "bt-q21",
            "groupId": "group-bt-array-storage",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 150(L2 單步追蹤) + 100(新手誤區) = 1100
            "baseRating": 1100,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在上述陣列儲存方式中，索引 2 的右子節點位於哪個索引？",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "5"},
                        {"id": "C", "text": "6"},
                        {"id": "D", "text": "7"},
                    ],
                    "explanation": "零起始陣列中，右子節點索引為 2*i+2。當 i=2 時，2*2+2=6，因此索引 2 的右子節點是索引 6。",
                },
                "en": {
                    "title": "In the array storage shown above, what index stores the right child of index 2?",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "5"},
                        {"id": "C", "text": "6"},
                        {"id": "D", "text": "7"},
                    ],
                    "explanation": "In zero-indexed array storage, the right child index is 2*i+2. For i=2, 2*2+2=6.",
                },
            },
        },
        {
            "id": "bt-q22",
            "groupId": "group-bt-array-storage",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態改變) + 100(新手誤區) = 1200
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在上述陣列中，節點 E 位於索引 4。它的父節點索引與值分別是什麼？",
                    "options": [
                        {"id": "A", "text": "索引 0，值 A"},
                        {"id": "B", "text": "索引 1，值 B"},
                        {"id": "C", "text": "索引 2，值 C"},
                        {"id": "D", "text": "索引 3，值 D"},
                    ],
                    "explanation": "父節點索引為 (i-1)//2。i=4 時得到 (4-1)//2=1，索引 1 的值是 B。",
                },
                "en": {
                    "title": "In the array above, node E is at index 4. What are its parent index and value?",
                    "options": [
                        {"id": "A", "text": "Index 0, value A"},
                        {"id": "B", "text": "Index 1, value B"},
                        {"id": "C", "text": "Index 2, value C"},
                        {"id": "D", "text": "Index 3, value D"},
                    ],
                    "explanation": "The parent index is (i-1)//2. For i=4, (4-1)//2=1, and index 1 stores B.",
                },
            },
        },
        {
            "id": "bt-q23",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 150(L2 單步追蹤) + 100(新手誤區) = 1200
            "baseRating": 1200,
            "correctAnswer": ["0", "1", "left_h"],
            "code": HEIGHT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "以下函式以「節點數」計算二元樹高度。請填入 (a)(b)(c)。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "空節點高度為 0；非空節點高度為 1 加上左右子樹高度最大值，所以回傳 1 + max(left_h, right_h)。",
                },
                "en": {
                    "title": "The function below computes binary tree height by counting nodes. Fill in (a)(b)(c).",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "An empty node has height 0. A non-empty node has height 1 plus the maximum height of its left and right subtrees: 1 + max(left_h, right_h).",
                },
            },
        },
        {
            "id": "bt-q24",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若用「邊數」定義高度，只有一個根節點的二元樹高度是多少？",
                    "options": [
                        {"id": "A", "text": "-1，因為空樹才是 0"},
                        {"id": "B", "text": "0；若改用節點數定義才會是 1"},
                        {"id": "C", "text": "1；任何非空樹高度都至少為 1"},
                        {"id": "D", "text": "2，因為 root 有 left 和 right 兩個欄位"},
                    ],
                    "explanation": "高度有兩種常見定義。若以最長路徑的邊數計算，單一根節點沒有邊，因此高度為 0；若以節點數計算則為 1。",
                },
                "en": {
                    "title": "If height is defined by the number of edges, what is the height of a binary tree with only one root node?",
                    "options": [
                        {"id": "A", "text": "-1, because only an empty tree is 0"},
                        {"id": "B", "text": "0; it would be 1 only under the node-count definition"},
                        {"id": "C", "text": "1; any non-empty tree has height at least 1"},
                        {"id": "D", "text": "2, because root has left and right fields"},
                    ],
                    "explanation": "There are two common height definitions. By edge count, a single root node has no edges, so height is 0. By node count, it is 1.",
                },
            },
        },
        {
            "id": "bt-q25",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "用 Stack 迭代實作前序遍歷 (Root -> Left -> Right) 時，若每次 pop 後想先處理左子節點，應該用什麼 push 順序？",
                    "options": [
                        {"id": "A", "text": "先 push left，再 push right"},
                        {"id": "B", "text": "只 push left，right 交給下一輪 BFS"},
                        {"id": "C", "text": "先 push right，再 push left"},
                        {"id": "D", "text": "left 和 right 的 push 順序不影響結果"},
                    ],
                    "explanation": "Stack 是 LIFO。若想讓 left 先被 pop 出來，就要後放 left；因此要先 push right，再 push left。",
                },
                "en": {
                    "title": "When implementing preorder traversal (Root -> Left -> Right) iteratively with a Stack, what push order makes the left child processed first?",
                    "options": [
                        {"id": "A", "text": "Push left first, then right"},
                        {"id": "B", "text": "Push only left; let BFS handle right"},
                        {"id": "C", "text": "Push right first, then left"},
                        {"id": "D", "text": "The order of pushing left and right does not matter"},
                    ],
                    "explanation": "A stack is LIFO. To pop left first, left must be pushed last. Therefore, push right first, then left.",
                },
            },
        },
        {
            "id": "bt-q26",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1500
            "baseRating": 1500,
            "correctAnswer": ["node.right", "node.left"],
            "code": ITERATIVE_PREORDER_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "以下是用 Stack 迭代實作前序遍歷。請填入 (a)(b)，讓輸出順序維持 Root -> Left -> Right。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}],
                    "explanation": "因為 Stack 後進先出，要先把右子節點放入，再把左子節點放入，下一輪 pop 時才會先取出左子節點。",
                },
                "en": {
                    "title": "The code below implements preorder traversal iteratively with a Stack. Fill in (a)(b) to preserve Root -> Left -> Right order.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}],
                    "explanation": "Because a stack is LIFO, push the right child first and the left child second, so the left child is popped next.",
                },
            },
        },
        {
            "id": "bt-q27",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "執行 BFS 走訪完美二元樹時，Queue 在最寬的一層附近可能同時保存多少節點？",
                    "options": [
                        {"id": "A", "text": "永遠只有 1 個節點"},
                        {"id": "B", "text": "O(log n)，因為樹高是 log n"},
                        {"id": "C", "text": "O(n)，因為最後一層可能包含接近一半節點"},
                        {"id": "D", "text": "O(1)，因為每次都會立刻 pop"},
                    ],
                    "explanation": "BFS 的額外空間取決於樹的最大寬度。完美二元樹最後一層節點數約為 n/2，因此 Queue 可能達到 O(n) 大小。",
                },
                "en": {
                    "title": "During BFS on a perfect binary tree, how many nodes can the Queue hold near the widest level?",
                    "options": [
                        {"id": "A", "text": "Always only 1 node"},
                        {"id": "B", "text": "O(log n), because tree height is log n"},
                        {"id": "C", "text": "O(n), because the last level can contain almost half the nodes"},
                        {"id": "D", "text": "O(1), because each node is popped immediately"},
                    ],
                    "explanation": "BFS extra space depends on maximum tree width. In a perfect binary tree, the last level contains about n/2 nodes, so the queue can grow to O(n).",
                },
            },
        },
        {
            "id": "bt-q28",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "已知一棵二元樹沒有重複值，若給定 preorder=[A, B, D, E, C] 與 inorder=[D, B, E, A, C]，根節點與左子樹節點集合為何？",
                    "options": [
                        {"id": "A", "text": "根 B；左子樹 {D}"},
                        {"id": "B", "text": "根 A；左子樹 {D, B, E}"},
                        {"id": "C", "text": "根 A；左子樹 {C}"},
                        {"id": "D", "text": "根 D；左子樹 {A, B, E}"},
                    ],
                    "explanation": "Preorder 第一個元素是根 A。在 inorder 中，A 左側的 D, B, E 都屬於左子樹，A 右側的 C 屬於右子樹。",
                },
                "en": {
                    "title": "A binary tree has no duplicate values. Given preorder=[A, B, D, E, C] and inorder=[D, B, E, A, C], what are the root and the left-subtree node set?",
                    "options": [
                        {"id": "A", "text": "Root B; left subtree {D}"},
                        {"id": "B", "text": "Root A; left subtree {D, B, E}"},
                        {"id": "C", "text": "Root A; left subtree {C}"},
                        {"id": "D", "text": "Root D; left subtree {A, B, E}"},
                    ],
                    "explanation": "The first preorder element is the root A. In the inorder list, D, B, and E are left of A, so they belong to the left subtree; C is in the right subtree.",
                },
            },
        },
        {
            "id": "bt-q29",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 400(L4 複雜控制流/邊界分析) + 250(複合陷阱) = 1600
            "baseRating": 1600,
            "correctAnswer": "1 2 3 4 1 2 3 4 1 2 5 1 2 5 1 2",
            "code": PREORDER_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "給定 root=A，A.left=B，且 A.right、B.left、B.right 都是 None。呼叫 preorder(root) 時，請依序填寫執行的行號序列（空格分隔）。",
                    "options": [],
                    "explanation": "先進入 A 並 visit，接著 L4 遞迴 B；B 會 visit 後分別呼叫空的 left/right。回到 A 後再執行 L5 呼叫空的 right，因此序列為 1 2 3 4 1 2 3 4 1 2 5 1 2 5 1 2。",
                },
                "en": {
                    "title": "Given root=A, A.left=B, and A.right, B.left, B.right are all None. Calling preorder(root), write the executed line-number sequence (space-separated).",
                    "options": [],
                    "explanation": "Enter A and visit it, then L4 recurses into B. B visits itself and calls its empty left/right children. Back at A, L5 calls the empty right child. Sequence: 1 2 3 4 1 2 3 4 1 2 5 1 2 5 1 2.",
                },
            },
        },
        {
            "id": "bt-q30",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "一般二元樹中，若 root=A，A.left=B，A.right=C，且 B.left=D，請問 D 與 C 的最低共同祖先 (LCA) 是誰？",
                    "options": [
                        {"id": "A", "text": "A"},
                        {"id": "B", "text": "B"},
                        {"id": "C", "text": "C"},
                        {"id": "D", "text": "D"},
                    ],
                    "explanation": "D 位於 A 的左子樹，C 位於 A 的右子樹。兩條往根回溯的路徑第一次交會在 A，因此最低共同祖先是 A。",
                },
                "en": {
                    "title": "In a general binary tree, root=A, A.left=B, A.right=C, and B.left=D. What is the lowest common ancestor (LCA) of D and C?",
                    "options": [
                        {"id": "A", "text": "A"},
                        {"id": "B", "text": "B"},
                        {"id": "C", "text": "C"},
                        {"id": "D", "text": "D"},
                    ],
                    "explanation": "D is in A's left subtree, while C is in A's right subtree. Their upward paths first meet at A, so A is the lowest common ancestor.",
                },
            },
        },
    ],
}

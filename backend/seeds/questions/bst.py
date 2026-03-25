FLOOR_CODE = """def floor(root, target):
    curr, res = root, None
    while curr:
        if curr.value == target: return curr.value
        if curr.value > target:
            curr = curr.left
        else:
            res = curr.value
            curr = curr.right
    return res"""

FLOOR_FILL_CODE = """def floor(root, target):
    curr, res = root, None
    while curr:
        if curr.value == target: return curr.value
        if curr.value > target:
            curr = (a)           # 目標比較小，往左子樹尋找
        else:
            res = (b)            # 暫時記錄可能的答案
            curr = (c)           # 繼續往右子樹尋找更接近的值
    return res"""

INSERT_FILL_CODE = """def insert(root, value):
    curr = root
    while curr:
        if value < curr.value:
            if curr.left:
                curr = (a)       # 繼續往左下移
            else:
                curr.left = Node(value)
                break
        elif value > curr.value:
            if (b):              # 判斷是否有右子樹
                curr = (c)       # 繼續往右下移
            else:
                curr.right = Node(value)
                break"""

SEARCH_PREDICT_CODE = """def search(root, target):                                       # L1
    curr = root                                                 # L2
    while curr:                                                 # L3
        if target == curr.value: return curr                    # L4
        curr = curr.left if target < curr.value else curr.right # L5
    return None                                                 # L6"""

DATA = {
    "slug": "bst",
    "groups": [
        {
            "id": "group-bst-floor-ceil",
            "translations": {
                "zh-TW": {
                    "title": "題組：數值逼近搜尋 (Floor & Ceil)",
                    "description": "二元搜尋樹 (BST) 常被用來尋找最接近目標的數值。Floor(target) 代表尋找「小於等於 target 的最大值」；Ceil(target) 代表尋找「大於等於 target 的最小值」。請參考下方的 floor 實作程式碼回答問題。",
                },
                "en": {
                    "title": "Group: Approximate Value Search (Floor & Ceil)",
                    "description": "BSTs are often used to find values closest to a target. Floor(target) finds the largest value less than or equal to target; Ceil(target) finds the smallest value greater than or equal to target. Read the floor implementation below and answer the questions.",
                },
            },
            "code": FLOOR_CODE,
            "language": "python",
        }
    ],
    "questions": [
        {
            "id": "bst-tf-1",
            "type": "true-false",
            "baseRating": 800,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "在二元搜尋樹 (BST) 中，任意節點的左子樹上所有節點的值都小於該節點的值；右子樹上所有節點的值都大於該節點的值。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "這是 BST 的核心定義。因為這個特性，我們在搜尋時可以每次排除掉一半的子樹，從而達到 O(log n) 的搜尋效率。",
                },
                "en": {
                    "title": "In a Binary Search Tree (BST), all values in a node's left subtree are less than the node's value, and all values in the right subtree are greater.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "This is the core BST property. Because of this, we can eliminate half the subtree at each comparison step, achieving O(log n) search efficiency.",
                },
            },
        },
        {
            "id": "bst-q1",
            "type": "single-choice",
            "baseRating": 850,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對一棵二元搜尋樹 (BST) 進行「中序遍歷 (Inorder Traversal)」，得到的數值序列會有什麼特性？",
                    "options": [
                        {"id": "A", "text": "由大到小遞減排列"},
                        {"id": "B", "text": "由小到大遞增排列"},
                        {"id": "C", "text": "隨機無序"},
                        {"id": "D", "text": "呈現階層式 (Level) 分布"},
                    ],
                    "explanation": "中序遍歷的順序是「左子樹 -> 根節點 -> 右子樹」。配合 BST 左小右大的特性，遍歷出來的結果剛好會是一個由小到大的遞增排序序列。",
                },
                "en": {
                    "title": "What is a characteristic of the value sequence obtained by performing Inorder Traversal on a BST?",
                    "options": [
                        {"id": "A", "text": "Sorted in descending order"},
                        {"id": "B", "text": "Sorted in ascending order"},
                        {"id": "C", "text": "Random, unordered"},
                        {"id": "D", "text": "Distributed by levels"},
                    ],
                    "explanation": "Inorder traversal visits nodes in Left -> Root -> Right order. Combined with BST's left-smaller-right-larger property, the result is a sorted ascending sequence.",
                },
            },
        },
        {
            "id": "bst-q2",
            "type": "single-choice",
            "baseRating": 850,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "教學區實作的 BST 中，當嘗試插入一個「已經存在於樹中的數值」時，系統會如何處理？",
                    "options": [
                        {"id": "A", "text": "在左子樹建立一個新節點"},
                        {"id": "B", "text": "在右子樹建立一個新節點"},
                        {"id": "C", "text": "拋出 (Raise) 錯誤並中斷程式"},
                        {"id": "D", "text": "不建立新節點，而是將該節點的計數器 (count) 屬性加 1"},
                    ],
                    "explanation": "為了節省空間與維持樹的平衡，本系統在遇到重複值時，會直接增加該節點的 count 屬性，而不會建立多餘的新節點。",
                },
                "en": {
                    "title": "In the BST implementation in the tutorial, what happens when you try to insert a value that already exists in the tree?",
                    "options": [
                        {"id": "A", "text": "Creates a new node in the left subtree"},
                        {"id": "B", "text": "Creates a new node in the right subtree"},
                        {"id": "C", "text": "Raises an error and terminates"},
                        {"id": "D", "text": "Does not create a new node — instead increments the node's count attribute by 1"},
                    ],
                    "explanation": "To save space and maintain balance, the system increments the existing node's count attribute instead of creating duplicate nodes.",
                },
            },
        },
        {
            "id": "bst-q3",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若要在一棵 BST 中尋找「最小值 (Minimum)」，應該如何追蹤？",
                    "options": [
                        {"id": "A", "text": "從根節點一路往右子樹走，直到沒有右子節點為止"},
                        {"id": "B", "text": "從根節點一路往左子樹走，直到沒有左子節點為止"},
                        {"id": "C", "text": "查看根節點的值"},
                        {"id": "D", "text": "查看所有的葉子節點並比較"},
                    ],
                    "explanation": "因為 BST 的左子樹永遠小於根節點，因此不斷往左子節點走到底，最後一個無法再往左走的節點，就是整棵樹的最小值。",
                },
                "en": {
                    "title": "How do you find the minimum value in a BST?",
                    "options": [
                        {"id": "A", "text": "Traverse right from the root until there is no right child"},
                        {"id": "B", "text": "Traverse left from the root until there is no left child"},
                        {"id": "C", "text": "Look at the root node's value"},
                        {"id": "D", "text": "Check all leaf nodes and compare"},
                    ],
                    "explanation": "Since BST left subtrees are always smaller than the root, keep going left until you can't go further — that node is the minimum.",
                },
            },
        },
        {
            "id": "bst-q4",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "一棵包含 n 個節點且「完美平衡」的二元搜尋樹，其搜尋操作的時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "在完美平衡的情況下，樹的高度為 log n。每次比較都能排除一半的節點（類似二分搜尋法），因此時間複雜度為 O(log n)。",
                },
                "en": {
                    "title": "What is the time complexity of a search operation on a perfectly balanced BST with n nodes?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "In a perfectly balanced tree, height is log n. Each comparison eliminates half the nodes (similar to binary search), so time complexity is O(log n).",
                },
            },
        },
        {
            "id": "bst-q5",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "在 BST 中，若要刪除的目標節點是一個「葉子節點 (Leaf Node，無子節點)」，該如何處理？",
                    "options": [
                        {"id": "A", "text": "直接移除該節點，並將其父節點對應的指標設為 Null"},
                        {"id": "B", "text": "將該節點的值設為 0"},
                        {"id": "C", "text": "尋找右子樹的最小值來替換"},
                        {"id": "D", "text": "尋找左子樹的最大值來替換"},
                    ],
                    "explanation": "葉子節點沒有任何子節點，因此可以直接將它從樹中移除，不會破壞 BST 的結構。",
                },
                "en": {
                    "title": "In a BST, how should you handle deleting a node that is a leaf node (no children)?",
                    "options": [
                        {"id": "A", "text": "Simply remove it and set the parent's corresponding pointer to Null"},
                        {"id": "B", "text": "Set the node's value to 0"},
                        {"id": "C", "text": "Replace it with the minimum value from the right subtree"},
                        {"id": "D", "text": "Replace it with the maximum value from the left subtree"},
                    ],
                    "explanation": "A leaf node has no children, so it can be directly removed without breaking the BST structure.",
                },
            },
        },
        {
            "id": "bst-q6",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在 BST 中，若要刪除的目標節點「同時擁有左、右兩個子節點」，常見的替換策略是找誰來取代它的位置？",
                    "options": [
                        {"id": "A", "text": "該節點的左子節點"},
                        {"id": "B", "text": "該節點的右子節點"},
                        {"id": "C", "text": "該節點「右子樹中的最小值（後繼者）」或「左子樹中的最大值（前驅者）」"},
                        {"id": "D", "text": "整棵樹的根節點"},
                    ],
                    "explanation": "為了在刪除後仍保持 BST「左小右大」的特性，必須用剛好大於該節點的最小值（右子樹最左側），或剛好小於該節點的最大值（左子樹最右側）來替換它的值，然後再刪除那個替換的節點。",
                },
                "en": {
                    "title": "In a BST, when deleting a node that has both left and right children, which replacement strategy is commonly used?",
                    "options": [
                        {"id": "A", "text": "The node's left child"},
                        {"id": "B", "text": "The node's right child"},
                        {"id": "C", "text": "The minimum value in the right subtree (successor) or maximum in the left subtree (predecessor)"},
                        {"id": "D", "text": "The tree's root node"},
                    ],
                    "explanation": "To maintain BST ordering after deletion, replace the deleted node's value with either the in-order successor (leftmost in right subtree) or predecessor (rightmost in left subtree), then delete that replacement node.",
                },
            },
        },
        {
            "id": "bst-q7",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "依序將 [50, 30, 70, 20, 40] 插入空的 BST 後，請問 40 會成為哪個節點的子節點？",
                    "options": [
                        {"id": "A", "text": "50 的左子節點"},
                        {"id": "B", "text": "30 的左子節點"},
                        {"id": "C", "text": "30 的右子節點"},
                        {"id": "D", "text": "70 的左子節點"},
                    ],
                    "explanation": "追蹤插入過程：根為 50；30 < 50 放左邊；70 > 50 放右邊；20 < 50 且 < 30，放 30 的左邊；40 < 50 但 > 30，因此會放在 30 的右子節點。",
                },
                "en": {
                    "title": "After inserting [50, 30, 70, 20, 40] into an empty BST in order, which node becomes the parent of 40?",
                    "options": [
                        {"id": "A", "text": "50's left child"},
                        {"id": "B", "text": "30's left child"},
                        {"id": "C", "text": "30's right child"},
                        {"id": "D", "text": "70's left child"},
                    ],
                    "explanation": "Tracing insertions: root=50; 30<50 goes left; 70>50 goes right; 20<50 and <30 goes left of 30; 40<50 but >30, so 40 becomes 30's right child.",
                },
            },
        },
        {
            "id": "bst-group-1",
            "groupId": "group-bst-floor-ceil",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "給定 BST 包含數值 [20, 30, 40, 50, 70]。執行 floor(45) 的回傳值是多少？",
                    "options": [
                        {"id": "A", "text": "30"},
                        {"id": "B", "text": "40"},
                        {"id": "C", "text": "45"},
                        {"id": "D", "text": "50"},
                    ],
                    "explanation": "Floor(45) 意指「在樹中尋找小於等於 45 的最大值」。樹中小於 45 的值有 20, 30, 40，其中最大的是 40。",
                },
                "en": {
                    "title": "Given a BST containing values [20, 30, 40, 50, 70], what does floor(45) return?",
                    "options": [
                        {"id": "A", "text": "30"},
                        {"id": "B", "text": "40"},
                        {"id": "C", "text": "45"},
                        {"id": "D", "text": "50"},
                    ],
                    "explanation": "floor(45) finds the largest value ≤ 45 in the tree. Values less than 45 are 20, 30, 40 — the largest is 40.",
                },
            },
        },
        {
            "id": "bst-group-2",
            "groupId": "group-bst-floor-ceil",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "承上題，如果執行 ceil(35)，回傳值會是多少？",
                    "options": [
                        {"id": "A", "text": "30"},
                        {"id": "B", "text": "40"},
                        {"id": "C", "text": "50"},
                        {"id": "D", "text": "70"},
                    ],
                    "explanation": "Ceil(35) 意指「在樹中尋找大於等於 35 的最小值」。樹中大於 35 的值有 40, 50, 70，其中最小的是 40。",
                },
                "en": {
                    "title": "Using the same BST, what does ceil(35) return?",
                    "options": [
                        {"id": "A", "text": "30"},
                        {"id": "B", "text": "40"},
                        {"id": "C", "text": "50"},
                        {"id": "D", "text": "70"},
                    ],
                    "explanation": "ceil(35) finds the smallest value ≥ 35 in the tree. Values greater than 35 are 40, 50, 70 — the smallest is 40.",
                },
            },
        },
        {
            "id": "bst-q8",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "如果依序將一個「已排序」的陣列 [10, 20, 30, 40, 50] 插入空的 BST 中，這棵樹的形狀會變成什麼樣子？",
                    "options": [
                        {"id": "A", "text": "完美平衡的二元樹"},
                        {"id": "B", "text": "只有左子節點的斜樹 (退化成鏈結串列)"},
                        {"id": "C", "text": "只有右子節點的斜樹 (退化成鏈結串列)"},
                        {"id": "D", "text": "變成一個雜湊表"},
                    ],
                    "explanation": "因為每個插入的數字都比上一個大，所以新節點永遠都會被加在右子樹上。這會導致 BST 完全退化成一條只有右指標的鏈結串列。",
                },
                "en": {
                    "title": "If you insert a sorted array [10, 20, 30, 40, 50] into an empty BST in order, what shape does the tree become?",
                    "options": [
                        {"id": "A", "text": "A perfectly balanced binary tree"},
                        {"id": "B", "text": "A skewed tree with only left children (degenerated to linked list)"},
                        {"id": "C", "text": "A skewed tree with only right children (degenerated to linked list)"},
                        {"id": "D", "text": "A hash table"},
                    ],
                    "explanation": "Since each inserted value is larger than the previous, new nodes always go to the right subtree. The BST degenerates into a right-only linked list.",
                },
            },
        },
        {
            "id": "bst-multi-1",
            "type": "multiple-choice",
            "baseRating": 1250,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些操作在 BST 中的時間複雜度與「樹的高度 (h)」成正比（即 O(h)）？（多選）",
                    "options": [
                        {"id": "opt1", "text": "插入新節點 (Insert)"},
                        {"id": "opt2", "text": "搜尋特定值 (Search)"},
                        {"id": "opt3", "text": "尋找最小值 (Find Min)"},
                        {"id": "opt4", "text": "清除整棵樹 (Clear)"},
                    ],
                    "explanation": "插入、搜尋與尋找最小值都只需要沿著從根節點到葉子節點的一條路徑往下走，最大步數即為樹的高度 h，複雜度 O(h)。清除整棵樹必須走訪每一個節點，複雜度為 O(n)。",
                },
                "en": {
                    "title": "Which BST operations have time complexity proportional to tree height h (i.e., O(h))? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Insert"},
                        {"id": "opt2", "text": "Search"},
                        {"id": "opt3", "text": "Find Min"},
                        {"id": "opt4", "text": "Clear (delete all nodes)"},
                    ],
                    "explanation": "Insert, Search, and Find Min all traverse a single root-to-leaf path — at most h steps, so O(h). Clearing the tree must visit every node — O(n).",
                },
            },
        },
        {
            "id": "bst-tf-2",
            "type": "true-false",
            "baseRating": 1250,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "在最壞的情況下（例如退化成斜樹），二元搜尋樹的搜尋時間複雜度會退化成 O(n)。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。如果樹退化成一條直線（高度 h = n），要找的元素又在最底層，我們就必須走訪全部 n 個節點，這時效能等同於 Array 的線性搜尋 O(n)。這也是為什麼實務上常需要 AVL Tree 或 Red-Black Tree 來維持平衡。",
                },
                "en": {
                    "title": "In the worst case (e.g., a degenerate skewed tree), BST search time complexity degrades to O(n).",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. If the tree degenerates into a straight line (height h = n), finding an element at the bottom requires visiting all n nodes — equivalent to linear search O(n). This is why AVL Trees and Red-Black Trees are used in practice to maintain balance.",
                },
            },
        },
        {
            "id": "bst-group-3",
            "groupId": "group-bst-floor-ceil",
            "type": "fill-code",
            "baseRating": 1300,
            "correctAnswer": ["curr.left", "curr.value", "curr.right"],
            "code": FLOOR_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 floor 程式碼中 (a)(b)(c) 缺失的變數或屬性名稱（注意 Python 語法）。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 當前值大於 target，答案必定在左子樹。 (b) 當前值小於 target，它可能就是 floor 答案，因此記錄 curr.value 給 res。 (c) 記錄後，往右子樹尋找看看有沒有「更大但依然小於等於 target」的更佳解。",
                },
                "en": {
                    "title": "Fill in the missing variable or attribute names at (a)(b)(c) in the floor code (Python syntax).",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Current value > target, so the answer must be in the left subtree. (b) Current value < target, it might be the floor — record curr.value in res. (c) After recording, go right to look for a closer (larger but still ≤ target) answer.",
                },
            },
        },
        {
            "id": "bst-multi-2",
            "type": "multiple-choice",
            "baseRating": 1350,
            "correctAnswer": ["opt1", "opt3", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "關於「二元樹 (Binary Tree)」與「二元搜尋樹 (BST)」的比較，以下哪些敘述是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "BST 是二元樹的一種特例"},
                        {"id": "opt2", "text": "二元樹支援 O(log n) 的快速搜尋，而 BST 不一定"},
                        {"id": "opt3", "text": "BST 要求節點數值必須具備可比較的排序性質，二元樹則不需要"},
                        {"id": "opt4", "text": "若想快速獲取資料集中的最大值，BST 的結構比一般二元樹更有優勢"},
                    ],
                    "explanation": "BST 加上了左小右大的排序限制 (opt1, opt3 正確)，這使得找最大/最小值非常快 (opt4 正確)。一般的 Binary Tree 沒有排序規則，搜尋任何值都必須 O(n) 遍歷，因此 opt2 是完全說反了。",
                },
                "en": {
                    "title": "Which statements about the comparison between Binary Tree and BST are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "BST is a special case of Binary Tree"},
                        {"id": "opt2", "text": "Binary Tree supports O(log n) fast search, while BST does not necessarily"},
                        {"id": "opt3", "text": "BST requires node values to have a comparable ordering property; Binary Tree does not"},
                        {"id": "opt4", "text": "To quickly find the maximum value in a dataset, BST's structure has an advantage over a general binary tree"},
                    ],
                    "explanation": "BST adds the left-smaller-right-larger constraint (opt1, opt3 correct), making min/max lookup fast (opt4 correct). A general Binary Tree has no ordering, so any search is O(n) — opt2 has it backwards.",
                },
            },
        },
        {
            "id": "bst-q9",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "對一棵擁有 n 個節點的 BST 執行刪除操作 (Delete)，其「空間複雜度 (Space Complexity)」取決於什麼？",
                    "options": [
                        {"id": "A", "text": "始終為 O(1)"},
                        {"id": "B", "text": "取決於該節點是否有子節點"},
                        {"id": "C", "text": "若是遞迴實作，取決於樹的高度 O(h)；若是迭代實作，為 O(1)"},
                        {"id": "D", "text": "始終為 O(n)"},
                    ],
                    "explanation": "遞迴實作在 Call Stack 上會累積與樹高相同的層數，因此空間複雜度為 O(h)。如果改用 while 迴圈（迭代實作），只需幾個指標變數即可完成，空間複雜度可優化至 O(1)。",
                },
                "en": {
                    "title": "For a BST Delete operation with n nodes, what does the space complexity depend on?",
                    "options": [
                        {"id": "A", "text": "Always O(1)"},
                        {"id": "B", "text": "Depends on whether the node has children"},
                        {"id": "C", "text": "If recursive: O(h) for tree height; if iterative: O(1)"},
                        {"id": "D", "text": "Always O(n)"},
                    ],
                    "explanation": "Recursive implementation accumulates Call Stack frames equal to tree height — O(h). An iterative (while loop) implementation only needs a few pointer variables — O(1) space.",
                },
            },
        },
        {
            "id": "bst-fill-1",
            "type": "fill-code",
            "baseRating": 1450,
            "correctAnswer": ["curr.left", "curr.right", "curr.right"],
            "code": INSERT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "以下是簡化版的插入 (Insert) 邏輯。請填入 (a)(b)(c) 處的 Python 程式碼，完成往左或往右子樹延伸的判斷。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 還有左子樹時，將 curr 指標移至 curr.left 繼續迴圈。(b) 判斷 curr.right 是否存在。(c) 若存在，將 curr 指標移至 curr.right 繼續往下探。",
                },
                "en": {
                    "title": "The following is a simplified Insert logic. Fill in (a)(b)(c) with Python code to complete the left/right subtree traversal decisions.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) If there is a left subtree, move curr pointer to curr.left to continue looping. (b) Check if curr.right exists. (c) If it does, move curr pointer to curr.right to continue downward.",
                },
            },
        },
        {
            "id": "bst-pred-1",
            "type": "predict-line",
            "baseRating": 1500,
            "correctAnswer": "1 2 3 4 5 3 4",
            "code": SEARCH_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 search 函數。給定一棵 BST，root 為 50，左子節點為 30。呼叫 search(root, 30) 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "進入 L1 -> curr=50(L2) -> 進入 while(L3) -> 30==50 為 False(L4) -> 30<50 所以 curr=30(L5) -> 再次迴圈(L3) -> 30==30 為 True 並 return(L4)。注意 L4 與 L5 的條件跳轉關係。",
                },
                "en": {
                    "title": "Read the search function. Given a BST where root=50 and its left child=30, calling search(root, 30) — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "Enter L1 -> curr=50(L2) -> enter while(L3) -> 30==50 is False(L4) -> 30<50 so curr=30(L5) -> loop again(L3) -> 30==30 is True, return(L4). Sequence: 1 2 3 4 5 3 4.",
                },
            },
        },
    ],
}

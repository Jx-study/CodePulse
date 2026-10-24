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

DELETE_SUCCESSOR_FILL_CODE = """def delete_with_successor(root):
    successor_parent = root
    successor = root.right
    while successor.left:
        successor_parent = (a)
        successor = (b)
    root.value = successor.value
    if successor_parent == root:
        successor_parent.right = (c)
    else:
        successor_parent.left = successor.right"""

VALIDATE_BST_PREDICT_CODE = """def is_valid(node, low, high):                                  # L1
    if not node: return True                                    # L2
    if not (low < node.value < high): return False              # L3
    return is_valid(node.left, low, node.value) and \\
           is_valid(node.right, node.value, high)               # L4"""

DATA = {
    "slug": "bst",
    "groups": [
        {
            "id": "bst-group-1",
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
            "id": "bst-q1",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 單一理論與定義) + 0(直觀) = 850
            "baseRating": 850,
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
            "id": "bst-q2",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 0(直觀) = 900
            "baseRating": 900,
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
            "id": "bst-q3",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 100(新手誤區) = 1000
            "baseRating": 1000,
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
                    "explanation": "這題考的是教學區實作對重複值的特殊處理。若不確定，可回到視覺化操作觀察重複插入時樹的結構是否新增節點。",
                },
                "en": {
                    "title": "In the BST implementation in the tutorial, what happens when you try to insert a value that already exists in the tree?",
                    "options": [
                        {"id": "A", "text": "Creates a new node in the left subtree"},
                        {"id": "B", "text": "Creates a new node in the right subtree"},
                        {"id": "C", "text": "Raises an error and terminates"},
                        {"id": "D", "text": "Does not create a new node — instead increments the node's count attribute by 1"},
                    ],
                    "explanation": "This checks the tutorial implementation's special handling of duplicate values. If unsure, revisit the visualization and observe whether duplicate insertion creates a new node.",
                },
            },
        },
        {
            "id": "bst-q4",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 0(直觀) = 900
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
            "id": "bst-q5",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 0(直觀) = 950
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
            "id": "bst-q6",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 50(視覺/相似度干擾) = 950
            "baseRating": 950,
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
            "id": "bst-q7",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 50(視覺/相似度干擾) = 950
            "baseRating": 950,
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
            "id": "bst-q8",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 150(L2 單步追蹤) + 100(新手誤區) = 1100
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
            "id": "bst-q9",
            "groupId": "bst-group-1",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態改變) + 100(新手誤區) = 1200
            "baseRating": 1200,
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
                    "explanation": "Floor(target) 的定義是「小於等於 target 的最大值」。回到程式碼追蹤 curr 與 res 的更新方式，特別注意何時往右尋找更接近的候選值。",
                },
                "en": {
                    "title": "Given a BST containing values [20, 30, 40, 50, 70], what does floor(45) return?",
                    "options": [
                        {"id": "A", "text": "30"},
                        {"id": "B", "text": "40"},
                        {"id": "C", "text": "45"},
                        {"id": "D", "text": "50"},
                    ],
                    "explanation": "floor(target) means the largest value less than or equal to target. Trace how curr and res change in the code, especially when the search moves right to look for a closer candidate.",
                },
            },
        },
        {
            "id": "bst-q10",
            "groupId": "bst-group-1",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態改變) + 100(新手誤區) = 1200
            "baseRating": 1200,
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
                    "explanation": "Ceil(target) 的定義是「大於等於 target 的最小值」。可對照 floor 的方向邏輯反推：遇到較大的節點時，先記錄候選值，再嘗試往左縮小答案。",
                },
                "en": {
                    "title": "Using the same BST, what does ceil(35) return?",
                    "options": [
                        {"id": "A", "text": "30"},
                        {"id": "B", "text": "40"},
                        {"id": "C", "text": "50"},
                        {"id": "D", "text": "70"},
                    ],
                    "explanation": "ceil(target) means the smallest value greater than or equal to target. Mirror the floor logic: when a larger node is found, record it as a candidate, then try moving left to tighten the answer.",
                },
            },
        },
        {
            "id": "bst-q11",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態改變) + 100(新手誤區) = 1200
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
            "id": "bst-q12",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 100(L2 多重比較) + 100(新手誤區) = 1100
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt2", "opt3", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些操作在 BST 中的時間複雜度與「樹的高度 (h)」成正比（即 O(h)）？（多選）",
                    "options": [
                        {"id": "opt1", "text": "插入新節點 (Insert)"},
                        {"id": "opt2", "text": "搜尋特定值 (Search)"},
                        {"id": "opt3", "text": "尋找最小值 (Find Min)"},
                        {"id": "opt4", "text": "尋找某節點的後繼者 (Find Successor)"},
                    ],
                    "explanation": "插入、搜尋、尋找最小值與尋找後繼者都只會沿著有限的樹高路徑移動；後繼者可能往右子樹找最左節點，或往祖先方向回溯，仍與高度 h 成正比。",
                },
                "en": {
                    "title": "Which BST operations have time complexity proportional to tree height h (i.e., O(h))? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Insert"},
                        {"id": "opt2", "text": "Search"},
                        {"id": "opt3", "text": "Find Min"},
                        {"id": "opt4", "text": "Find Successor"},
                    ],
                    "explanation": "Insert, Search, Find Min, and Find Successor all move along bounded tree-height paths. Successor lookup may go to the leftmost node in the right subtree or climb through ancestors, still proportional to h.",
                },
            },
        },
        {
            "id": "bst-q13",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 單一理論與定義) + 50(視覺/相似度干擾) = 900
            "baseRating": 900,
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
            "id": "bst-q14",
            "groupId": "bst-group-1",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 250(L3 多步狀態改變) + 100(新手誤區) = 1300
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
            "id": "bst-q15",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 100(L2 多重比較) + 100(新手誤區) = 1100
            "baseRating": 1100,
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
            "id": "bst-q16",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "對一棵擁有 n 個節點的 BST 執行刪除操作 (Delete)，其「空間複雜度 (Space Complexity)」取決於什麼？",
                    "options": [
                        {"id": "A", "text": "始終為 O(1)，因為刪除只修改常數個指標"},
                        {"id": "B", "text": "遞迴與迭代都一定是 O(h)，因為都要沿著樹高搜尋"},
                        {"id": "C", "text": "若是遞迴實作，取決於樹的高度 O(h)；若是迭代實作，為 O(1)"},
                        {"id": "D", "text": "若刪除雙子節點才是 O(h)，刪除葉節點一定是 O(1)"},
                    ],
                    "explanation": "遞迴實作在 Call Stack 上會累積與樹高相同的層數，因此空間複雜度為 O(h)。如果改用 while 迴圈（迭代實作），只需幾個指標變數即可完成，空間複雜度可優化至 O(1)。",
                },
                "en": {
                    "title": "For a BST Delete operation with n nodes, what does the space complexity depend on?",
                    "options": [
                        {"id": "A", "text": "Always O(1), because deletion only changes a constant number of pointers"},
                        {"id": "B", "text": "Both recursive and iterative versions are always O(h), because both search along tree height"},
                        {"id": "C", "text": "If recursive: O(h) for tree height; if iterative: O(1)"},
                        {"id": "D", "text": "Only deleting a two-child node is O(h); deleting a leaf is always O(1)"},
                    ],
                    "explanation": "Recursive implementation accumulates Call Stack frames equal to tree height — O(h). An iterative (while loop) implementation only needs a few pointer variables — O(1) space.",
                },
            },
        },
        {
            "id": "bst-q17",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 250(L3 多步狀態改變) + 100(新手誤區) = 1300
            "baseRating": 1300,
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
            "id": "bst-q18",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 250(L3 多步狀態改變) + 150(邊界) = 1350
            "baseRating": 1350,
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
        {
            "id": "bst-q19",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 單一理論與定義) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "一棵合法的 BST 不只根節點要符合左小右大，每一棵子樹也都必須各自符合 BST 規則。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。BST 的限制是遞迴性的：任意節點的左子樹、右子樹本身都必須也是合法 BST，不能只檢查根節點附近的一層。",
                },
                "en": {
                    "title": "A valid BST requires not only the root to follow left-smaller-right-larger; every subtree must also satisfy the BST rule.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. The BST constraint is recursive: every node's left and right subtree must also be valid BSTs, not just the immediate children of the root.",
                },
            },
        },
        {
            "id": "bst-q20",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "若要在一棵 BST 中尋找「最大值 (Maximum)」，應該如何追蹤？",
                    "options": [
                        {"id": "A", "text": "從根節點一路往右子樹走，直到沒有右子節點為止"},
                        {"id": "B", "text": "從根節點一路往左子樹走，直到沒有左子節點為止"},
                        {"id": "C", "text": "直接回傳根節點"},
                        {"id": "D", "text": "先做中序遍歷再取第一個節點"},
                    ],
                    "explanation": "BST 的右子樹保存較大的值，因此最大值會出現在最右側節點，也就是一路往右走到不能再走的位置。",
                },
                "en": {
                    "title": "How do you find the maximum value in a BST?",
                    "options": [
                        {"id": "A", "text": "Traverse right from the root until there is no right child"},
                        {"id": "B", "text": "Traverse left from the root until there is no left child"},
                        {"id": "C", "text": "Return the root directly"},
                        {"id": "D", "text": "Run inorder traversal and take the first node"},
                    ],
                    "explanation": "A BST stores larger values in the right subtree, so the maximum is the rightmost node reached by repeatedly moving right.",
                },
            },
        },
        {
            "id": "bst-q21",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 50(視覺/相似度干擾) = 950
            "baseRating": 950,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在 BST 中刪除一個「只有一個子節點」的節點時，正確作法是什麼？",
                    "options": [
                        {"id": "A", "text": "一定要尋找右子樹最小值替換"},
                        {"id": "B", "text": "直接刪除整棵子樹"},
                        {"id": "C", "text": "讓唯一的子節點接到被刪節點原本的父節點位置"},
                        {"id": "D", "text": "把被刪節點的值改成 None，但保留指標"},
                    ],
                    "explanation": "單一子節點案例只需要把子節點往上接到父節點即可，不需要像雙子節點那樣尋找前驅或後繼。",
                },
                "en": {
                    "title": "When deleting a BST node that has exactly one child, what is the correct handling?",
                    "options": [
                        {"id": "A", "text": "Always find the minimum value in the right subtree"},
                        {"id": "B", "text": "Delete the entire child subtree"},
                        {"id": "C", "text": "Connect the only child to the deleted node's former parent position"},
                        {"id": "D", "text": "Set the deleted node's value to None but keep its pointers"},
                    ],
                    "explanation": "With one child, the child can be linked upward to the parent. No predecessor or successor search is needed.",
                },
            },
        },
        {
            "id": "bst-q22",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "有一棵樹：根為 10，左子節點為 5，右子節點為 15，而 15 的左子節點是 6。這棵樹為何不是合法 BST？",
                    "options": [
                        {"id": "A", "text": "因為 5 小於 10"},
                        {"id": "B", "text": "因為 15 大於 10"},
                        {"id": "C", "text": "因為 6 位在 10 的右子樹中，卻小於 10"},
                        {"id": "D", "text": "因為 BST 不能有高度超過 2 的節點"},
                    ],
                    "explanation": "驗證 BST 不能只看父子關係。6 雖然小於 15，符合 15 的左子節點條件，但它位於 10 的右子樹，必須同時大於 10，因此違反全域上下界。",
                },
                "en": {
                    "title": "A tree has root 10, left child 5, right child 15, and 15's left child is 6. Why is this not a valid BST?",
                    "options": [
                        {"id": "A", "text": "Because 5 is less than 10"},
                        {"id": "B", "text": "Because 15 is greater than 10"},
                        {"id": "C", "text": "Because 6 is in 10's right subtree but is less than 10"},
                        {"id": "D", "text": "Because a BST cannot have nodes deeper than height 2"},
                    ],
                    "explanation": "BST validation cannot check only parent-child pairs. Although 6 is less than 15, it is inside 10's right subtree, so it must also be greater than 10.",
                },
            },
        },
        {
            "id": "bst-q23",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "依序插入 [50, 30, 70, 20, 40, 35, 45] 後，若刪除 30 並採用「右子樹最小值」作為後繼者，30 會先被哪個值取代？",
                    "options": [
                        {"id": "A", "text": "20"},
                        {"id": "B", "text": "35"},
                        {"id": "C", "text": "40"},
                        {"id": "D", "text": "45"},
                    ],
                    "explanation": "30 的右子樹根為 40，而 40 的左子節點是 35。右子樹中的最小值是 35，因此刪除 30 時可先用 35 取代，再移除原本的 35 節點。",
                },
                "en": {
                    "title": "After inserting [50, 30, 70, 20, 40, 35, 45], deleting 30 with the right-subtree-minimum successor strategy first replaces 30 with which value?",
                    "options": [
                        {"id": "A", "text": "20"},
                        {"id": "B", "text": "35"},
                        {"id": "C", "text": "40"},
                        {"id": "D", "text": "45"},
                    ],
                    "explanation": "30's right subtree is rooted at 40, whose left child is 35. The minimum in that right subtree is 35, so 35 replaces 30 before the old 35 node is removed.",
                },
            },
        },
        {
            "id": "bst-q24",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "若依序將 [50, 40, 30, 20, 10] 插入空 BST，接著搜尋 10，搜尋路徑與最壞時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "50 -> 10，O(log n)"},
                        {"id": "B", "text": "50 -> 40 -> 30 -> 20 -> 10，O(log n)"},
                        {"id": "C", "text": "10 -> 20 -> 30 -> 40 -> 50，O(n)"},
                        {"id": "D", "text": "50 -> 40 -> 30 -> 20 -> 10，O(n)"},
                    ],
                    "explanation": "遞減輸入會讓每個新節點都接在左側，BST 退化成左斜鏈。搜尋 10 需要沿著所有節點往下走，因此是 O(n)。",
                },
                "en": {
                    "title": "If [50, 40, 30, 20, 10] is inserted into an empty BST, then 10 is searched, what are the search path and worst-case time complexity?",
                    "options": [
                        {"id": "A", "text": "50 -> 10, O(log n)"},
                        {"id": "B", "text": "50 -> 40 -> 30 -> 20 -> 10, O(log n)"},
                        {"id": "C", "text": "10 -> 20 -> 30 -> 40 -> 50, O(n)"},
                        {"id": "D", "text": "50 -> 40 -> 30 -> 20 -> 10, O(n)"},
                    ],
                    "explanation": "Descending input makes each new node attach to the left, degenerating the BST into a left-skewed chain. Searching for 10 visits every node, so it is O(n).",
                },
            },
        },
        {
            "id": "bst-q25",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 600(L5 演算法創造/系統級分析) + 0(直觀) = 1400
            "baseRating": 1400,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "AVL 樹與紅黑樹屬於自平衡 BST，目的之一是在連續插入極端資料時仍維持 O(log n) 的搜尋、插入與刪除效能。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。自平衡搜尋樹會透過旋轉、變色等機制控制樹高，避免一般 BST 因有序輸入而退化成 O(n) 的鏈結串列。",
                },
                "en": {
                    "title": "AVL trees and Red-Black trees are self-balancing BSTs designed partly to keep search, insert, and delete at O(log n) even under extreme insertion orders.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. Self-balancing search trees use mechanisms such as rotations and recoloring to control tree height, avoiding the O(n) linked-list degeneration of a plain BST.",
                },
            },
        },
        {
            "id": "bst-q26",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 600(L5 演算法創造/系統級分析) + 150(邊界) = 1600
            "baseRating": 1600,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "【進階應用】用可維護子樹大小的 BST 從右往左處理 [5, 2, 6, 1]，計算每個元素右側較小值個數，結果應為何？",
                    "options": [
                        {"id": "A", "text": "[2, 1, 1, 0]"},
                        {"id": "B", "text": "[1, 0, 1, 0]"},
                        {"id": "C", "text": "[3, 1, 1, 0]"},
                        {"id": "D", "text": "[0, 1, 1, 2]"},
                    ],
                    "explanation": "5 右側較小值為 2、1，共 2 個；2 右側較小值為 1，共 1 個；6 右側較小值為 1，共 1 個；1 右側沒有元素。",
                },
                "en": {
                    "title": "[Advanced Application] Using a BST augmented with subtree sizes from right to left on [5, 2, 6, 1], what is the count of smaller elements to the right for each value?",
                    "options": [
                        {"id": "A", "text": "[2, 1, 1, 0]"},
                        {"id": "B", "text": "[1, 0, 1, 0]"},
                        {"id": "C", "text": "[3, 1, 1, 0]"},
                        {"id": "D", "text": "[0, 1, 1, 2]"},
                    ],
                    "explanation": "For 5, smaller values on the right are 2 and 1. For 2, it is 1. For 6, it is 1. For 1, there are no values to its right.",
                },
            },
        },
        {
            "id": "bst-q27",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1500
            "baseRating": 1500,
            "correctAnswer": ["successor", "successor.left", "successor.right"],
            "code": DELETE_SUCCESSOR_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "刪除雙子節點時，以下程式用右子樹最小值作為後繼者。請填入 (a)(b)(c) 的 Python 程式碼。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 先記錄目前 successor 作為 parent；(b) 持續往左找右子樹最小值；(c) 若後繼者就是 root.right，要把父節點的 right 接到 successor.right。",
                },
                "en": {
                    "title": "When deleting a node with two children, this code uses the minimum value in the right subtree as the successor. Fill in (a)(b)(c) with Python code.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Record the current successor as the parent; (b) keep moving left to find the right subtree minimum; (c) if the successor is root.right, reconnect the parent's right pointer to successor.right.",
                },
            },
        },
        {
            "id": "bst-q28",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 400(L4 複雜控制流/邊界分析) + 250(複合陷阱) = 1600
            "baseRating": 1600,
            "correctAnswer": "1 2 3 4 1 2 1 2 3 4 1 2 3",
            "code": VALIDATE_BST_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "閱讀 is_valid。給定 root=10、left=None、right=15，且 15.left=6，呼叫 is_valid(root, -inf, inf) 時，請填寫執行行號序列。",
                    "options": [],
                    "explanation": "注意 BST 驗證傳入的 low/high 邊界如何隨遞迴更新。請特別追蹤值 6 被檢查時所在的允許範圍，而不是只比較它與直接父節點 15。",
                },
                "en": {
                    "title": "Read is_valid. Given root=10, left=None, right=15, and 15.left=6, calling is_valid(root, -inf, inf) — write the executed line-number sequence.",
                    "options": [],
                    "explanation": "Pay attention to how the low/high bounds update through recursion. In particular, trace the allowed range when value 6 is checked, instead of comparing it only with its direct parent 15.",
                },
            },
        },
        {
            "id": "bst-q29",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "若刪除根節點 50，且採用「左子樹最大值」作為前驅者；樹中已有 [50, 30, 70, 20, 40, 35, 45]。根節點會先被哪個值取代？",
                    "options": [
                        {"id": "A", "text": "20"},
                        {"id": "B", "text": "30"},
                        {"id": "C", "text": "35"},
                        {"id": "D", "text": "45"},
                    ],
                    "explanation": "50 的左子樹根為 30，其中最大值要一路往右找：30 -> 40 -> 45。因此採用前驅者策略時，根節點 50 會先被 45 取代。",
                },
                "en": {
                    "title": "Deleting root 50 with the left-subtree-maximum predecessor strategy in a tree containing [50, 30, 70, 20, 40, 35, 45], which value first replaces the root?",
                    "options": [
                        {"id": "A", "text": "20"},
                        {"id": "B", "text": "30"},
                        {"id": "C", "text": "35"},
                        {"id": "D", "text": "45"},
                    ],
                    "explanation": "The left subtree of 50 is rooted at 30. Its maximum is found by moving right: 30 -> 40 -> 45. So 45 first replaces the root.",
                },
            },
        },
        {
            "id": "bst-q30",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 400(L4 複雜控制流/邊界分析) + 250(複合陷阱) = 1450
            "baseRating": 1450,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "自平衡 BST 進行旋轉後，中序遍歷順序可能改變，因為旋轉會改變節點的父子關係。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "錯誤。旋轉確實會改變父子關係與樹的形狀，但必須保留 BST 的相對大小關係；因此中序遍歷仍應維持相同的遞增序列。",
                },
                "en": {
                    "title": "After rotations in a self-balancing BST, the inorder traversal order may change because rotations change parent-child relationships.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "False. Rotations do change parent-child relationships and tree shape, but they must preserve the BST ordering relationship, so inorder traversal should remain the same ascending sequence.",
                },
            },
        },
    ],
}

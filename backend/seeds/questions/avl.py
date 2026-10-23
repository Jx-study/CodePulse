ROTATE_RIGHT_FILL_CODE = """def rotate_right(y):
    x = y.left
    y.left = (a)         # 把 x 原本的右子樹 T2 掛到 y 的左邊
    x.right = (b)        # y 變成 x 的右子節點
    update_height(y)
    update_height(x)
    return (c)           # x 成為這棵子樹新的根"""

ROTATE_LEFT_FILL_CODE = """def rotate_left(x):
    y = x.right
    x.right = (a)        # 把 y 原本的左子樹 T2 掛到 x 的右邊
    y.left = (b)         # x 變成 y 的左子節點
    update_height(x)
    update_height(y)
    return (c)           # y 成為這棵子樹新的根"""

REBALANCE_FILL_CODE = """def rebalance(node):
    bf = balance_factor(node)
    if bf > 1:
        if balance_factor(node.left) < 0:
            node.left = (a)          # LR：先把左子節點左旋
        return (b)                   # 再把 node 右旋
    if bf < -1:
        if balance_factor(node.right) > 0:
            node.right = (c)         # RL：先把右子節點右旋
        return rotate_left(node)
    return node"""

REBALANCE_PREDICT_CODE = """def rebalance(node):                               # L1
    bf = balance_factor(node)                      # L2
    if bf > 1:                                     # L3
        if balance_factor(node.left) < 0:          # L4
            node.left = rotate_left(node.left)     # L5
        return rotate_right(node)                  # L6
    if bf < -1:                                    # L7
        if balance_factor(node.right) > 0:         # L8
            node.right = rotate_right(node.right)  # L9
        return rotate_left(node)                   # L10
    return node                                    # L11"""

TRUE_FALSE_OPTIONS_ZH = [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}]
TRUE_FALSE_OPTIONS_EN = [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}]

DATA = {
    "slug": "avl-tree",
    "groups": [],
    "questions": [
        {
            "id": "avl-tree-q1",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 單一理論與定義) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "AVL 樹是一種二元搜尋樹，除了「左小右大」之外，還要求每個節點的左、右子樹高度差不超過 1。",
                    "options": TRUE_FALSE_OPTIONS_ZH,
                    "explanation": "正確。AVL 樹保留了 BST 的大小順序，再多加一條平衡規則：每個節點的平衡因子（左子樹高度減右子樹高度）只能是 -1、0 或 +1。",
                },
                "en": {
                    "title": "An AVL tree is a binary search tree that, besides 'left smaller, right larger', also requires the heights of every node's two subtrees to differ by at most 1.",
                    "options": TRUE_FALSE_OPTIONS_EN,
                    "explanation": "True. An AVL tree keeps the BST ordering and adds one balance rule: the balance factor of every node (height of the left subtree minus height of the right subtree) must be -1, 0 or +1.",
                },
            },
        },
        {
            "id": "avl-tree-q2",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 100(新手誤區) = 1000
            "baseRating": 1000,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "AVL 樹中某個節點的「平衡因子 (Balance Factor, BF)」是怎麼計算的？",
                    "options": [
                        {"id": "A", "text": "右子樹高度 - 左子樹高度"},
                        {"id": "B", "text": "左子樹高度 - 右子樹高度"},
                        {"id": "C", "text": "左子樹節點數 - 右子樹節點數"},
                        {"id": "D", "text": "這個節點離根節點的距離"},
                    ],
                    "explanation": "BF = 左子樹高度 - 右子樹高度。注意是「高度」而不是「節點數」：兩邊節點數一樣多，高度也可能不同；BF 為正代表偏左，為負代表偏右。",
                },
                "en": {
                    "title": "How is the balance factor (BF) of a node in an AVL tree calculated?",
                    "options": [
                        {"id": "A", "text": "height of the right subtree - height of the left subtree"},
                        {"id": "B", "text": "height of the left subtree - height of the right subtree"},
                        {"id": "C", "text": "number of nodes in the left subtree - number of nodes in the right subtree"},
                        {"id": "D", "text": "the distance from this node to the root"},
                    ],
                    "explanation": "BF = height of the left subtree - height of the right subtree. It is about height, not node count: two subtrees can hold the same number of nodes and still differ in height. A positive BF means left-heavy, a negative one right-heavy.",
                },
            },
        },
        {
            "id": "avl-tree-q3",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在一棵合法的 AVL 樹中，每個節點的平衡因子只可能是哪些值？",
                    "options": [
                        {"id": "A", "text": "只有 0"},
                        {"id": "B", "text": "0 或 +1"},
                        {"id": "C", "text": "-1、0 或 +1"},
                        {"id": "D", "text": "任意整數"},
                    ],
                    "explanation": "AVL 規則要求每個節點的 |BF| ≤ 1，所以只能是 -1、0、+1。只有當 BF 變成 +2 或 -2 的瞬間，才需要旋轉修正。",
                },
                "en": {
                    "title": "In a valid AVL tree, which values can the balance factor of a node take?",
                    "options": [
                        {"id": "A", "text": "Only 0"},
                        {"id": "B", "text": "0 or +1"},
                        {"id": "C", "text": "-1, 0 or +1"},
                        {"id": "D", "text": "Any integer"},
                    ],
                    "explanation": "The AVL rule requires |BF| <= 1 for every node, so only -1, 0 and +1 are allowed. A rotation is needed only at the moment a BF becomes +2 or -2.",
                },
            },
        },
        {
            "id": "avl-tree-q4",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 100(新手誤區) = 1000
            "baseRating": 1000,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "AVL 樹在最壞情況下，搜尋一個值的時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(n)"},
                        {"id": "C", "text": "O(n log n)"},
                        {"id": "D", "text": "O(log n)"},
                    ],
                    "explanation": "AVL 規則讓樹高永遠維持在 O(log n)，所以搜尋、插入、刪除的最壞情況都是 O(log n)。一般 BST 沒有這個保證，最壞會退化成 O(n)。",
                },
                "en": {
                    "title": "What is the worst-case time complexity of searching for a value in an AVL tree?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(n)"},
                        {"id": "C", "text": "O(n log n)"},
                        {"id": "D", "text": "O(log n)"},
                    ],
                    "explanation": "The AVL rule keeps the height at O(log n), so search, insert and delete are all O(log n) even in the worst case. A plain BST has no such guarantee and can degrade to O(n).",
                },
            },
        },
        {
            "id": "avl-tree-q5",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 單一理論與定義) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "旋轉只會改變樹的形狀，不會破壞 BST 的大小順序，旋轉前後的中序走訪結果完全相同。",
                    "options": TRUE_FALSE_OPTIONS_ZH,
                    "explanation": "正確。旋轉只是重新安排幾個節點的上下關係，每個節點仍然落在「比它小的在左邊、比它大的在右邊」的位置，所以中序走訪得到的遞增序列不變。",
                },
                "en": {
                    "title": "A rotation only changes the shape of the tree and never breaks the BST ordering: the inorder traversal is identical before and after.",
                    "options": TRUE_FALSE_OPTIONS_EN,
                    "explanation": "True. A rotation just rearranges which nodes sit above which, and every node still has smaller values on its left and larger ones on its right, so the ascending inorder sequence does not change.",
                },
            },
        },
        {
            "id": "avl-tree-q6",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 100(新手誤區) = 1000
            "baseRating": 1000,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "某節點的 BF 是 +2，而且它的左子節點 BF 是 +1（左左，LL 情況）。要怎麼修正？",
                    "options": [
                        {"id": "A", "text": "對這個節點做一次右旋"},
                        {"id": "B", "text": "對這個節點做一次左旋"},
                        {"id": "C", "text": "先左旋左子節點，再右旋這個節點"},
                        {"id": "D", "text": "先右旋左子節點，再左旋這個節點"},
                    ],
                    "explanation": "LL 情況是整條路徑一直往左偏，把左子節點拉上來當新的根，也就是一次右旋。名稱裡的「左左」說的是失衡的方向，而動作剛好相反，是「右旋」。",
                },
                "en": {
                    "title": "A node has BF +2 and its left child has BF +1 (the left-left, LL case). How is it fixed?",
                    "options": [
                        {"id": "A", "text": "One right rotation on this node"},
                        {"id": "B", "text": "One left rotation on this node"},
                        {"id": "C", "text": "Rotate the left child left, then rotate this node right"},
                        {"id": "D", "text": "Rotate the left child right, then rotate this node left"},
                    ],
                    "explanation": "In the LL case the whole path leans left, so the left child is pulled up as the new root: a single right rotation. 'Left-left' names the direction of the imbalance, while the fix goes the opposite way.",
                },
            },
        },
        {
            "id": "avl-tree-q7",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 100(新手誤區) = 1050
            "baseRating": 1050,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "某節點的 BF 是 -2，但它的右子節點 BF 是 +1（右左，RL 情況）。要怎麼修正？",
                    "options": [
                        {"id": "A", "text": "對這個節點做一次右旋"},
                        {"id": "B", "text": "對這個節點做一次左旋"},
                        {"id": "C", "text": "先左旋這個節點，再右旋右子節點"},
                        {"id": "D", "text": "先右旋右子節點，再左旋這個節點"},
                    ],
                    "explanation": "右子節點偏左，形狀是一個「>」的折線，直接左旋會把失衡轉到另一邊。要先把右子節點右旋，讓形狀變成右右的一直線，再對這個節點左旋。",
                },
                "en": {
                    "title": "A node has BF -2 but its right child has BF +1 (the right-left, RL case). How is it fixed?",
                    "options": [
                        {"id": "A", "text": "One right rotation on this node"},
                        {"id": "B", "text": "One left rotation on this node"},
                        {"id": "C", "text": "Rotate this node left, then rotate the right child right"},
                        {"id": "D", "text": "Rotate the right child right, then rotate this node left"},
                    ],
                    "explanation": "The right child leans left, so the path bends. A single left rotation would only move the imbalance to the other side. First rotate the right child right to straighten it into a right-right line, then rotate this node left.",
                },
            },
        },
        {
            "id": "avl-tree-q8",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 100(新手誤區) = 1050
            "baseRating": 1050,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "某節點的 BF 是 +2，它的左子節點 BF 是 -1。這屬於哪一種失衡情況？",
                    "options": [
                        {"id": "A", "text": "左左 (LL)"},
                        {"id": "B", "text": "左右 (LR)"},
                        {"id": "C", "text": "右右 (RR)"},
                        {"id": "D", "text": "右左 (RL)"},
                    ],
                    "explanation": "節點 BF +2 代表偏左；左子節點 BF -1 代表它又偏右，所以是「先左再右」的左右 (LR) 情況，需要先左旋左子節點，再右旋這個節點。",
                },
                "en": {
                    "title": "A node has BF +2 and its left child has BF -1. Which imbalance case is this?",
                    "options": [
                        {"id": "A", "text": "Left-left (LL)"},
                        {"id": "B", "text": "Left-right (LR)"},
                        {"id": "C", "text": "Right-right (RR)"},
                        {"id": "D", "text": "Right-left (RL)"},
                    ],
                    "explanation": "BF +2 means the node leans left, and the left child's BF -1 means that child leans right, so the path goes left then right: the LR case. Rotate the left child left first, then rotate this node right.",
                },
            },
        },
        {
            "id": "avl-tree-q9",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 100(新手誤區) = 1050
            "baseRating": 1050,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在 AVL 樹插入一個新節點後，最多需要修正幾個失衡的節點，整棵樹就會恢復平衡？",
                    "options": [
                        {"id": "A", "text": "最多 log n 個"},
                        {"id": "B", "text": "最多 n 個"},
                        {"id": "C", "text": "最多一個（做一次單旋或雙旋）"},
                        {"id": "D", "text": "每一層都要修正"},
                    ],
                    "explanation": "插入後，修好最低的那個失衡節點，該子樹的高度就回到插入前的高度，祖先的 BF 也就不再受影響，所以插入最多只需要一次重新平衡（一次或兩次旋轉）。",
                },
                "en": {
                    "title": "After inserting a node into an AVL tree, how many unbalanced nodes need fixing at most before the whole tree is balanced again?",
                    "options": [
                        {"id": "A", "text": "Up to log n of them"},
                        {"id": "B", "text": "Up to n of them"},
                        {"id": "C", "text": "At most one (a single or a double rotation)"},
                        {"id": "D", "text": "Every level has to be fixed"},
                    ],
                    "explanation": "Once the lowest unbalanced node is fixed, its subtree returns to the height it had before the insertion, so the ancestors are no longer affected. An insertion therefore needs at most one rebalancing (one or two rotations).",
                },
            },
        },
        {
            "id": "avl-tree-q10",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 100(L2 多重比較) + 100(新手誤區) = 1000
            "baseRating": 1000,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "在 AVL 樹刪除節點時，沿著路徑往上檢查的過程中，可能有好幾個層級都需要旋轉。",
                    "options": TRUE_FALSE_OPTIONS_ZH,
                    "explanation": "正確。刪除之後，旋轉可能讓那棵子樹的高度比刪除前少 1，於是上一層又失衡，需要再旋轉，最壞情況會一路轉到根。這跟插入「最多一次」不同。",
                },
                "en": {
                    "title": "When deleting from an AVL tree, several levels may need a rotation while walking back up the path.",
                    "options": TRUE_FALSE_OPTIONS_EN,
                    "explanation": "True. After a deletion, a rotation can leave that subtree one level shorter than before, which unbalances the level above and needs another rotation; in the worst case this goes all the way to the root. Insertion, in contrast, needs at most one.",
                },
            },
        },
        {
            "id": "avl-tree-q11",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態改變) + 100(新手誤區) = 1200
            "baseRating": 1200,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "高度為 5（最長路徑上有 5 個節點）的 AVL 樹，最少需要幾個節點？",
                    "options": [
                        {"id": "A", "text": "12"},
                        {"id": "B", "text": "9"},
                        {"id": "C", "text": "16"},
                        {"id": "D", "text": "31"},
                    ],
                    "explanation": "要用最少的節點撐起高度，就讓一邊高度 h-1、另一邊高度 h-2：N(h) = N(h-1) + N(h-2) + 1。N(1)=1、N(2)=2、N(3)=4、N(4)=7、N(5)=12。31 是高度 5 的完美二元樹的節點數，那是「最多」而不是「最少」。",
                },
                "en": {
                    "title": "What is the minimum number of nodes in an AVL tree of height 5 (5 nodes on the longest path)?",
                    "options": [
                        {"id": "A", "text": "12"},
                        {"id": "B", "text": "9"},
                        {"id": "C", "text": "16"},
                        {"id": "D", "text": "31"},
                    ],
                    "explanation": "To reach a height with as few nodes as possible, make one side h-1 high and the other h-2: N(h) = N(h-1) + N(h-2) + 1. N(1)=1, N(2)=2, N(3)=4, N(4)=7, N(5)=12. 31 is the size of a perfect binary tree of height 5, which is the maximum, not the minimum.",
                },
            },
        },
        {
            "id": "avl-tree-q12",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 100(L2 多重比較) + 100(新手誤區) = 1100
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt2"],
            "translations": {
                "zh-TW": {
                    "title": "在 AVL 樹插入一個新節點後，哪些節點的高度或 BF 有可能改變？（多選）",
                    "options": [
                        {"id": "opt1", "text": "新節點的父節點"},
                        {"id": "opt2", "text": "從根到新節點這條路徑上的其他祖先"},
                        {"id": "opt3", "text": "另一條分支上、和這條路徑無關的節點"},
                        {"id": "opt4", "text": "新節點的兄弟子樹裡的節點"},
                    ],
                    "explanation": "高度只會沿著「從新節點往上到根」的路徑被影響，所以只有父節點和其他祖先的高度、BF 可能改變。路徑以外的節點（包含兄弟子樹）的子樹完全沒動，所以不用重新檢查。這也是為什麼插入只需要沿路徑往上檢查。",
                },
                "en": {
                    "title": "After inserting a node into an AVL tree, which nodes can have their height or BF changed? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "The parent of the new node"},
                        {"id": "opt2", "text": "The other ancestors on the path from the root to the new node"},
                        {"id": "opt3", "text": "Nodes on a different branch that is unrelated to this path"},
                        {"id": "opt4", "text": "Nodes inside the sibling subtree of the new node"},
                    ],
                    "explanation": "Heights are only affected along the path from the new node up to the root, so only the parent and the other ancestors can change. Nodes off the path, including the sibling subtree, have exactly the same subtrees as before and need no re-check. That is why an insertion only checks upward along the path.",
                },
            },
        },
        {
            "id": "avl-tree-q13",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 單一理論與定義) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "單次旋轉只需要改動固定數量的指標，所以時間複雜度是 O(1)。",
                    "options": TRUE_FALSE_OPTIONS_ZH,
                    "explanation": "正確。右旋或左旋只會改動兩三個指標，再更新兩個節點的高度，跟樹有多大完全無關，所以是 O(1)。AVL 操作的 O(log n) 來自於要沿著路徑走訪的節點數。",
                },
                "en": {
                    "title": "A single rotation changes a fixed number of pointers, so it takes O(1) time.",
                    "options": TRUE_FALSE_OPTIONS_EN,
                    "explanation": "True. A left or right rotation changes just two or three pointers and updates two heights, regardless of how large the tree is, so it is O(1). The O(log n) of AVL operations comes from the number of nodes along the path.",
                },
            },
        },
        {
            "id": "avl-tree-q14",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 250(L3 多步狀態改變) + 100(新手誤區) = 1300
            "baseRating": 1300,
            "correctAnswer": ["x.right", "y", "x"],
            "code": ROTATE_RIGHT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫右旋 rotate_right 程式碼中 (a)(b)(c) 缺失的運算式。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) y.left = x.right：x 原本的右子樹 T2 比 x 大、比 y 小，剛好可以接到 y 的左邊。(b) x.right = y：y 變成 x 的右子節點。(c) return x：x 取代 y，成為這棵子樹新的根，呼叫者要把父節點改成指向它。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in the rotate_right code.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) y.left = x.right: the old right subtree T2 of x is larger than x and smaller than y, so it fits on the left of y. (b) x.right = y: y becomes the right child of x. (c) return x: x replaces y as the new root of the subtree, and the caller must point the parent to it.",
                },
            },
        },
        {
            "id": "avl-tree-q15",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 100(新手誤區) = 1050
            "baseRating": 1050,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "和紅黑樹相比，AVL 樹的取捨是什麼？",
                    "options": [
                        {"id": "A", "text": "AVL 樹的平衡規則比較寬鬆，所以旋轉比較少"},
                        {"id": "B", "text": "AVL 樹的平衡規則比較嚴格，樹通常更矮、查詢更快，但插入和刪除旋轉得更頻繁"},
                        {"id": "C", "text": "兩者的樹高上限完全一樣"},
                        {"id": "D", "text": "AVL 樹不需要旋轉"},
                    ],
                    "explanation": "AVL 要求高度差不超過 1，比紅黑樹嚴格，所以樹高通常更低、讀取更快；代價是寫入時需要更常旋轉。因此讀多寫少的場合偏好 AVL，寫入頻繁時紅黑樹比較划算。",
                },
                "en": {
                    "title": "What is the trade-off of an AVL tree compared with a red-black tree?",
                    "options": [
                        {"id": "A", "text": "AVL trees balance more loosely, so they rotate less"},
                        {"id": "B", "text": "AVL trees balance more strictly, so they are usually shallower and faster to read, but rotate more often on insert and delete"},
                        {"id": "C", "text": "Their maximum heights are exactly the same"},
                        {"id": "D", "text": "AVL trees never need rotations"},
                    ],
                    "explanation": "AVL allows a height difference of at most 1, which is stricter than a red-black tree, so the tree is usually shallower and reads are faster, at the price of more rotations on writes. That is why AVL suits read-heavy workloads while red-black trees pay off when writes are frequent.",
                },
            },
        },
        {
            "id": "avl-tree-q16",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 100(新手誤區) = 1050
            "baseRating": 1050,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "一棵有 7 個節點、完全平衡的 AVL 樹（40, 20, 60, 10, 30, 50, 70），最壞情況搜尋一個存在的值，最多會比較幾個節點？",
                    "options": [
                        {"id": "A", "text": "1 個"},
                        {"id": "B", "text": "2 個"},
                        {"id": "C", "text": "7 個"},
                        {"id": "D", "text": "3 個"},
                    ],
                    "explanation": "7 個節點的完全平衡樹高度是 3，從根走到最底層的葉節點最多比較 3 個節點。如果同樣 7 個值是按 1、2、3、…、7 的順序插入一般 BST，會退化成一條鏈，搜尋 7 要比較 7 個節點。",
                },
                "en": {
                    "title": "In a perfectly balanced AVL tree with 7 nodes (40, 20, 60, 10, 30, 50, 70), how many nodes are compared at most when searching for a value that exists?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "7"},
                        {"id": "D", "text": "3"},
                    ],
                    "explanation": "A perfectly balanced tree with 7 nodes has height 3, so going from the root to a bottom leaf compares at most 3 nodes. If the same 7 values are inserted as 1, 2, 3, ..., 7 into a plain BST, it degenerates into a chain and searching for 7 compares 7 nodes.",
                },
            },
        },
        {
            "id": "avl-tree-q17",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 250(L3 多步狀態改變) + 100(新手誤區) = 1300
            "baseRating": 1300,
            "correctAnswer": ["y.left", "x", "y"],
            "code": ROTATE_LEFT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫左旋 rotate_left 程式碼中 (a)(b)(c) 缺失的運算式。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) x.right = y.left：y 原本的左子樹 T2 比 x 大、比 y 小，可以接到 x 的右邊。(b) y.left = x：x 變成 y 的左子節點。(c) return y：y 取代 x，成為這棵子樹新的根。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in the rotate_left code.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) x.right = y.left: the old left subtree T2 of y is larger than x and smaller than y, so it fits on the right of x. (b) y.left = x: x becomes the left child of y. (c) return y: y replaces x as the new root of the subtree.",
                },
            },
        },
        {
            "id": "avl-tree-q18",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 250(L3 多步狀態改變) + 100(新手誤區) = 1300
            "baseRating": 1300,
            "correctAnswer": "1 2 3 4 5 6",
            "code": REBALANCE_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 rebalance 函數。傳入的 node 的 BF 是 +2，而且它的左子節點的 BF 是 -1。請依序填寫 rebalance 本身執行的行號序列（以空格分隔，不用追進 rotate 函數裡面）。",
                    "options": [],
                    "explanation": "進入 L1，算出 bf = 2 (L2)，bf > 1 成立 (L3)；左子節點 BF 為 -1，< 0 成立 (L4)，所以先左旋左子節點 (L5)，再右旋 node 並回傳 (L6)。後面的 bf < -1 區塊都不會執行。序列：1 2 3 4 5 6。",
                },
                "en": {
                    "title": "Read the rebalance function. The node passed in has BF +2 and its left child has BF -1. Write the sequence of line numbers that rebalance itself executes (space-separated; do not follow into the rotate functions).",
                    "options": [],
                    "explanation": "Enter L1, bf = 2 (L2), bf > 1 is true (L3); the left child's BF is -1 and < 0 is true (L4), so rotate the left child left first (L5), then rotate node right and return (L6). The bf < -1 block never runs. Sequence: 1 2 3 4 5 6.",
                },
            },
        },
        {
            "id": "avl-tree-q19",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 100(新手誤區) = 1000
            "baseRating": 1000,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "刪除 AVL 樹中一個「左右子樹都存在」的節點時，教學區的做法是什麼？",
                    "options": [
                        {"id": "A", "text": "直接把這個節點拿掉，兩棵子樹都接到父節點上"},
                        {"id": "B", "text": "把整棵右子樹丟掉"},
                        {"id": "C", "text": "用右子樹中最小的值（中序後繼者）取代它的值，再刪除那個後繼者節點"},
                        {"id": "D", "text": "隨便挑一個葉節點來取代它"},
                    ],
                    "explanation": "右子樹中最小的值剛好比被刪的節點大、又比右子樹其他值小，拿來取代後，BST 的大小順序仍然成立。後繼者最多只有一個右子節點，刪除起來最簡單。刪完之後再沿著路徑往上重新平衡。",
                },
                "en": {
                    "title": "How does the tutorial delete a node that has both a left and a right subtree from an AVL tree?",
                    "options": [
                        {"id": "A", "text": "Remove the node and attach both subtrees to its parent"},
                        {"id": "B", "text": "Throw away the whole right subtree"},
                        {"id": "C", "text": "Replace its value with the smallest value of the right subtree (the inorder successor), then delete that successor node"},
                        {"id": "D", "text": "Pick any leaf and use it as the replacement"},
                    ],
                    "explanation": "The smallest value of the right subtree is larger than the deleted node and smaller than the rest of the right subtree, so the BST ordering still holds after the swap. The successor has at most one right child, which makes it the easiest node to remove. Afterwards the tree is rebalanced upward along the path.",
                },
            },
        },
        {
            "id": "avl-tree-q20",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 0(直觀) = 950
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "從空的 AVL 樹依序插入 30、20、10，完成後的根節點是哪一個？",
                    "options": [
                        {"id": "A", "text": "20"},
                        {"id": "B", "text": "30"},
                        {"id": "C", "text": "10"},
                        {"id": "D", "text": "無法確定"},
                    ],
                    "explanation": "插入 30、20、10 後形成一條往左的鏈，30 的 BF 變成 +2（LL 情況），對 30 右旋，20 上來當根，左右各是 10 和 30。",
                },
                "en": {
                    "title": "Starting from an empty AVL tree, 30, 20 and 10 are inserted in that order. Which node is the root afterwards?",
                    "options": [
                        {"id": "A", "text": "20"},
                        {"id": "B", "text": "30"},
                        {"id": "C", "text": "10"},
                        {"id": "D", "text": "Cannot be determined"},
                    ],
                    "explanation": "Inserting 30, 20, 10 builds a chain leaning left, so 30 gets BF +2 (the LL case). A right rotation at 30 lifts 20 to the root with 10 and 30 below it.",
                },
            },
        },
        {
            "id": "avl-tree-q21",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 100(新手誤區) = 1050
            "baseRating": 1050,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "從空的 AVL 樹依序插入 10、30、20，完成後的根節點是哪一個？",
                    "options": [
                        {"id": "A", "text": "10"},
                        {"id": "B", "text": "30"},
                        {"id": "C", "text": "20"},
                        {"id": "D", "text": "無法確定"},
                    ],
                    "explanation": "10 是根，30 在右邊，20 插在 30 的左邊，10 的 BF 變成 -2，而右子節點 30 偏左（右左，RL 情況）。先右旋 30，再左旋 10，最後 20 成為根。第一個插入的值不一定永遠是根。",
                },
                "en": {
                    "title": "Starting from an empty AVL tree, 10, 30 and 20 are inserted in that order. Which node is the root afterwards?",
                    "options": [
                        {"id": "A", "text": "10"},
                        {"id": "B", "text": "30"},
                        {"id": "C", "text": "20"},
                        {"id": "D", "text": "Cannot be determined"},
                    ],
                    "explanation": "10 is the root, 30 goes to its right and 20 to the left of 30, so 10 gets BF -2 while its right child leans left (the RL case). Rotating 30 right and then 10 left makes 20 the root. The first value inserted is not always the root.",
                },
            },
        },
        {
            "id": "avl-tree-q22",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 單一理論與定義) + 100(新手誤區) = 950
            "baseRating": 950,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "如果某個節點的 BF 是 0，代表它的左子樹和右子樹的節點數量一樣多。",
                    "options": TRUE_FALSE_OPTIONS_ZH,
                    "explanation": "錯誤。BF 比的是「高度」，不是節點數。例如左子樹是一個完整的兩層（3 個節點），右子樹是向左彎的兩層（2 個節點），兩邊高度都是 2，BF 是 0，但節點數不同。",
                },
                "en": {
                    "title": "If a node has BF 0, its left and right subtrees contain the same number of nodes.",
                    "options": TRUE_FALSE_OPTIONS_EN,
                    "explanation": "False. BF compares heights, not node counts. For example, a left subtree with a full two levels (3 nodes) and a right subtree with two levels but only 2 nodes both have height 2, so BF is 0 even though the node counts differ.",
                },
            },
        },
        {
            "id": "avl-tree-q23",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 100(新手誤區) = 1050
            "baseRating": 1050,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "在 rotate_right(y) 旋轉之後，要更新兩個節點的高度。正確的順序是？",
                    "options": [
                        {"id": "A", "text": "先更新 x，再更新 y"},
                        {"id": "B", "text": "順序不影響結果"},
                        {"id": "C", "text": "不用更新，高度不會改變"},
                        {"id": "D", "text": "先更新 y，再更新 x"},
                    ],
                    "explanation": "右旋之後 y 變成 x 的右子節點，x 的高度要用 y 的高度算出來，所以必須先更新位置較低的 y，再更新位置較高的 x。順序反過來，x 會用到 y 過時的高度。",
                },
                "en": {
                    "title": "After rotate_right(y) the heights of two nodes must be updated. What is the correct order?",
                    "options": [
                        {"id": "A", "text": "Update x first, then y"},
                        {"id": "B", "text": "The order does not matter"},
                        {"id": "C", "text": "No update is needed, the heights do not change"},
                        {"id": "D", "text": "Update y first, then x"},
                    ],
                    "explanation": "After a right rotation y is the right child of x, and the height of x is computed from the height of y. So the lower node y has to be updated first and the higher node x second; the other way round, x would use a stale height of y.",
                },
            },
        },
        {
            "id": "avl-tree-q24",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 250(L3 多步狀態改變) + 100(新手誤區) = 1250
            "baseRating": 1250,
            "correctAnswer": ["opt1", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "從空的 AVL 樹開始，依下列順序插入，哪些會觸發旋轉？（多選）",
                    "options": [
                        {"id": "opt1", "text": "10, 20, 30"},
                        {"id": "opt2", "text": "20, 10, 30"},
                        {"id": "opt3", "text": "30, 10, 20"},
                        {"id": "opt4", "text": "20, 10, 30, 5"},
                    ],
                    "explanation": "10, 20, 30 會排成往右的鏈，需要左旋 (RR)。30, 10, 20 是 30 左邊的 10 再往右插 20，需要先左旋再右旋 (LR)。20, 10, 30 本來就是完整的三個節點，不用旋轉。20, 10, 30, 5 的根 BF 只有 +1，也沒有失衡。",
                },
                "en": {
                    "title": "Starting from an empty AVL tree, which of these insertion orders trigger a rotation? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "10, 20, 30"},
                        {"id": "opt2", "text": "20, 10, 30"},
                        {"id": "opt3", "text": "30, 10, 20"},
                        {"id": "opt4", "text": "20, 10, 30, 5"},
                    ],
                    "explanation": "10, 20, 30 forms a chain leaning right and needs a left rotation (RR). In 30, 10, 20 the 20 goes right of the 10 that sits left of 30, which needs a left then a right rotation (LR). 20, 10, 30 is already a full three-node tree, and in 20, 10, 30, 5 the root only gets BF +1, so nothing is unbalanced.",
                },
            },
        },
        {
            "id": "avl-tree-q25",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態改變) + 0(直觀) = 1100
            "baseRating": 1100,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "刪除節點後，在某一層做完旋轉，為什麼還是要繼續往上檢查祖先？",
                    "options": [
                        {"id": "A", "text": "因為旋轉之後，這棵子樹的高度可能比刪除前少 1，會讓上一層失衡"},
                        {"id": "B", "text": "因為旋轉會破壞 BST 的大小順序，要往上修復"},
                        {"id": "C", "text": "因為要更新每個節點的計數"},
                        {"id": "D", "text": "其實不需要，旋轉一次就一定全部平衡了"},
                    ],
                    "explanation": "刪除時，旋轉修好了這個節點，但整棵子樹可能因此變矮 1。上一層看到的高度變了，BF 可能剛好變成 ±2，所以必須繼續往上檢查。這是刪除和插入最大的差別。",
                },
                "en": {
                    "title": "After a deletion, why does the walk continue upward even after a rotation was done at some level?",
                    "options": [
                        {"id": "A", "text": "Because after the rotation the subtree can be one level shorter than before the deletion, which can unbalance the level above"},
                        {"id": "B", "text": "Because the rotation breaks the BST ordering, which has to be repaired upward"},
                        {"id": "C", "text": "Because the count of every node has to be updated"},
                        {"id": "D", "text": "It does not; one rotation always balances everything"},
                    ],
                    "explanation": "The rotation fixes the current node, but the whole subtree may end up one level shorter. The level above then sees a different height and its BF may become exactly ±2, so the walk must go on. This is the biggest difference between deletion and insertion.",
                },
            },
        },
        {
            "id": "avl-tree-q26",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 100(新手誤區) = 1000
            "baseRating": 1000,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在教學區用「載入資料」輸入 1, 2, 3。載入時資料依序插入、不做旋轉，樹的根節點是哪一個？",
                    "options": [
                        {"id": "A", "text": "2"},
                        {"id": "B", "text": "1"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "無法確定"},
                    ],
                    "explanation": "載入的資料會照輸入順序建成一般 BST，不會自動旋轉，所以第一個值 1 是根，形成一條往右的鏈，節點 1 的 BF 是 -2。要按「重新平衡」才會用旋轉把 2 轉上來當根。",
                },
                "en": {
                    "title": "In the tutorial you load the values 1, 2, 3. Loading inserts them in order without any rotation. Which node is the root?",
                    "options": [
                        {"id": "A", "text": "2"},
                        {"id": "B", "text": "1"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "Cannot be determined"},
                    ],
                    "explanation": "Loaded values are built as a plain BST in the order typed and are not rotated automatically, so the first value 1 is the root and the tree is a chain leaning right with BF -2 at node 1. Only pressing Rebalance rotates 2 up to become the root.",
                },
            },
        },
        {
            "id": "avl-tree-q27",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 250(L3 多步狀態改變) + 100(新手誤區) = 1300
            "baseRating": 1300,
            "correctAnswer": ["rotate_left(node.left)", "rotate_right(node)", "rotate_right(node.right)"],
            "code": REBALANCE_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 rebalance 程式碼中 (a)(b)(c) 缺失的運算式（雙旋轉的情況）。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) LR 情況要先把偏右的左子節點左旋，讓形狀變成一直線：rotate_left(node.left)。(b) 之後再把 node 右旋並回傳新的根：rotate_right(node)。(c) RL 情況對稱，先把偏左的右子節點右旋：rotate_right(node.right)。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in the rebalance code (the double-rotation cases).",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) In the LR case the left child leans right, so rotate it left first to straighten the path: rotate_left(node.left). (b) Then rotate node right and return the new root: rotate_right(node). (c) The RL case is symmetric: first rotate the right child, which leans left, to the right: rotate_right(node.right).",
                },
            },
        },
        {
            "id": "avl-tree-q28",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 100(新手誤區) = 1000
            "baseRating": 1000,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "對一棵「不平衡」的二元搜尋樹（例如依序插入 1 到 7 形成的鏈）執行搜尋，會發生什麼事？",
                    "options": [
                        {"id": "A", "text": "找不到值，因為樹不平衡"},
                        {"id": "B", "text": "會自動重新平衡後再搜尋"},
                        {"id": "C", "text": "結果仍然正確，但最壞情況要比較 O(n) 個節點"},
                        {"id": "D", "text": "無法執行搜尋"},
                    ],
                    "explanation": "搜尋只依賴 BST 的大小順序，與平衡無關，所以結果一定正確。但樹高變成 n 時，搜尋要走 n 層，時間複雜度退化成 O(n)。重新平衡之後，同一個搜尋就只需要 O(log n)。",
                },
                "en": {
                    "title": "What happens when you search an unbalanced binary search tree, for example the chain made by inserting 1 to 7 in order?",
                    "options": [
                        {"id": "A", "text": "The value is not found because the tree is unbalanced"},
                        {"id": "B", "text": "It rebalances itself first and then searches"},
                        {"id": "C", "text": "The result is still correct, but the worst case compares O(n) nodes"},
                        {"id": "D", "text": "The search cannot run"},
                    ],
                    "explanation": "Search only relies on the BST ordering, not on balance, so the result is always correct. But when the height grows to n, a search walks n levels and degrades to O(n). After rebalancing, the same search needs only O(log n).",
                },
            },
        },
        {
            "id": "avl-tree-q29",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論與定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "為了能快速判斷是否失衡，AVL 樹的每個節點通常會額外儲存什麼資訊？",
                    "options": [
                        {"id": "A", "text": "父節點的指標"},
                        {"id": "B", "text": "左右子樹的節點數"},
                        {"id": "C", "text": "這個節點離根的距離"},
                        {"id": "D", "text": "這個節點所在子樹的高度（或直接存 BF）"},
                    ],
                    "explanation": "每次要算 BF 都重新數子樹高度會很慢。AVL 樹在每個節點記錄子樹高度（或 BF），插入、刪除、旋轉之後只更新受影響的節點，就能在 O(1) 時間算出 BF。",
                },
                "en": {
                    "title": "To tell quickly whether a node is unbalanced, what extra information does each node of an AVL tree usually store?",
                    "options": [
                        {"id": "A", "text": "A pointer to its parent"},
                        {"id": "B", "text": "The number of nodes in its left and right subtrees"},
                        {"id": "C", "text": "The distance from this node to the root"},
                        {"id": "D", "text": "The height of the subtree rooted here (or the BF directly)"},
                    ],
                    "explanation": "Recounting the height of the subtrees every time a BF is needed would be slow. An AVL tree stores the subtree height (or the BF) in every node and only updates the affected nodes after an insertion, deletion or rotation, so the BF is available in O(1).",
                },
            },
        },
        {
            "id": "avl-tree-q30",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 100(L2 多重比較) + 150(邊界) = 1200
            "baseRating": 1200,
            "correctAnswer": "1 2 3 7 11",
            "code": REBALANCE_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 rebalance 函數。傳入的 node 的 BF 是 +1（還在允許範圍內）。請依序填寫 rebalance 執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "進入 L1，算出 bf = 1 (L2)。bf > 1 不成立，跳過整個區塊 (L3)；bf < -1 也不成立 (L7)；直接回傳原本的 node (L11)。已經平衡的節點不會被旋轉。序列：1 2 3 7 11。",
                },
                "en": {
                    "title": "Read the rebalance function. The node passed in has BF +1 (still within the allowed range). Write the sequence of line numbers that rebalance executes (space-separated).",
                    "options": [],
                    "explanation": "Enter L1, bf = 1 (L2). bf > 1 is false so the whole block is skipped (L3); bf < -1 is false too (L7); the original node is returned (L11). A node that is already balanced is never rotated. Sequence: 1 2 3 7 11.",
                },
            },
        },
    ],
}

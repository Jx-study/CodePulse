WAREHOUSE_CODE = """\
class Warehouse:
    def __init__(self):
        self.inventory = []  # 儲存商品 ID 的陣列

    def add_item(self, index, item_id):
        \"\"\"在指定位置插入商品（手動位移實作）\"\"\"
        n = len(self.inventory)
        self.inventory.append(None)    # 擴展一格
        i = n
        while i > index:
            self.inventory[i] = self.inventory[i - 1]
            i -= 1
        self.inventory[index] = item_id

    def remove_item(self, index):
        \"\"\"移除指定位置的商品（手動位移實作）\"\"\"
        n = len(self.inventory)
        for i in range(index, n - 1):
            self.inventory[i] = self.inventory[i + 1]
        self.inventory.pop()

    def find_item(self, item_id):
        \"\"\"線性搜尋，回傳 index；找不到回傳 -1\"\"\"
        for i in range(len(self.inventory)):
            if self.inventory[i] == item_id:
                return i
        return -1"""

WAREHOUSE_FILL_CODE = """\
def add_item(self, index, item_id):
    n = len(self.inventory)
    self.inventory.append((a))    # 擴展一格空間（預留位置）
    i = n
    while i > (b):                # 需要移動的條件
        self.inventory[i] = self.inventory[(c)]  # 向右移動
        i -= 1
    self.inventory[index] = item_id"""

ARRAY_PREDICT_CODE = """\
class Array:
    def search(self, target):
        for i in range(len(self.arr)):
            if self.arr[i] == target:
                return i
        return -1"""

ARRAY_DELETE_FILL_CODE = """\
def delete_at(arr, index):
    n = len(arr)
    for i in range(index, (a)):    # 左移的迴圈範圍
        arr[i] = arr[(b)]           # 將右側元素左移
    arr.(c)()                       # 移除末端多餘的位置"""

ARRAY_RESIZE_FILL_CODE = """\
def append_with_resize(arr, size, capacity, value):
    if size == capacity:
        new_capacity = capacity * (a)
        new_arr = [None] * new_capacity
        for i in range((b)):
            new_arr[i] = arr[i]
        arr = new_arr
        capacity = new_capacity
    arr[(c)] = value
    size += 1
    return arr, size, capacity"""

MATRIX_TRANSPOSE_PREDICT_CODE = """\
matrix = [[1, 2], [3, 4]]
result = []
for col in range(2):
    row_values = []
    for row in range(2):
        row_values.append(matrix[row][col])
    result.append(row_values)"""

DATA = {
    "slug": "array",
    "groups": [
        {
            "id": "array-group-1",
            "translations": {
                "zh-TW": {
                    "title": "題組：倉庫存貨管理系統",
                    "description": "某倉庫使用陣列 (Array) 管理商品 ID 列表，並自行實作元素位移邏輯，以呈現陣列操作的底層行為。請參考下方程式碼回答問題。",
                },
                "en": {
                    "title": "Group: Warehouse Inventory Management System",
                    "description": "A warehouse uses an Array to manage a list of product IDs and manually implements element-shifting logic to demonstrate the underlying behavior of array operations. Refer to the code below to answer the questions.",
                },
            },
            "code": WAREHOUSE_CODE,
            "language": "python",
        }
    ],
    "questions": [
        # 【Basic 基礎】 800-950
        # baseRating = 800 + 0(TF) + 50(L1 隨機存取定義) + 0(直觀) = 850
        {
            "id": "array-q1",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "陣列 (Array) 透過 Index 存取元素的時間複雜度為 O(n)，因為需要從頭逐一遍歷到指定位置。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "陣列的核心優勢是可透過索引直接定位元素，不需要像線性搜尋一樣從頭逐一檢查。",
                },
                "en": {
                    "title": "Accessing an Array element by index takes O(n), because the array must be traversed from the beginning to the target position.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "The key advantage of an array is direct indexed access. It does not need to scan from the beginning like a linear search.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 0(L0 Zero-indexed 常識) + 0(直觀) = 850
        {
            "id": "array-q2",
            "type": "single-choice",
            "baseRating": 850,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "Python 陣列（List）的索引是從哪個數字開始的？",
                    "options": [
                        {"id": "A", "text": "0（Zero-indexed）"},
                        {"id": "B", "text": "1"},
                        {"id": "C", "text": "-1"},
                        {"id": "D", "text": "視陣列大小而定"},
                    ],
                    "explanation": "Python 使用零索引，第一個元素為 arr[0]，有效範圍為 0 到 n-1。",
                },
                "en": {
                    "title": "What index does a Python List (Array) start at?",
                    "options": [
                        {"id": "A", "text": "0 (zero-indexed)"},
                        {"id": "B", "text": "1"},
                        {"id": "C", "text": "-1"},
                        {"id": "D", "text": "Depends on the array size"},
                    ],
                    "explanation": "Python uses zero-based indexing. The first element is arr[0], and valid indices range from 0 to n-1.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 50(L1 複雜度定義) + 0(直觀) = 900
        {
            "id": "array-q3",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "在陣列中，透過 Index 直接存取元素（如 arr[3]）的時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "隨機存取 (Random Access) 是陣列的核心優勢，根據公式直接計算位址，時間複雜度為 O(1)。",
                },
                "en": {
                    "title": "What is the time complexity of directly accessing an element by index (e.g., arr[3]) in an array?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "Random access is the core advantage of arrays — the address is computed directly by formula, giving O(1) time complexity.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 0(直觀) = 950
        {
            "id": "array-q4",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "以下哪個陣列操作在最壞情況下時間複雜度最高？",
                    "options": [
                        {"id": "A", "text": "透過 Index 讀取元素"},
                        {"id": "B", "text": "在陣列末端新增元素"},
                        {"id": "C", "text": "在陣列首端(Index 0)新增元素"},
                        {"id": "D", "text": "修改已知 Index 的元素值"},
                    ],
                    "explanation": "首端插入需將插入點後的所有元素右移，需搬動 n 個元素，複雜度為 O(n)。",
                },
                "en": {
                    "title": "Which array operation has the highest worst-case time complexity?",
                    "options": [
                        {"id": "A", "text": "Reading an element by index"},
                        {"id": "B", "text": "Appending an element at the end"},
                        {"id": "C", "text": "Inserting an element at the front (index 0)"},
                        {"id": "D", "text": "Updating the value at a known index"},
                    ],
                    "explanation": "Inserting at the front requires shifting all n elements one position to the right, resulting in O(n) complexity.",
                },
            },
        },
        # baseRating = 800 + 0(TF) + 50(L1 位移概念) + 0(直觀) = 850
        {
            "id": "array-q5",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "在一個有 n 個元素的陣列中，於 Index 0 插入一個新元素，需要移動全部 n 個現有元素。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "在首端插入是陣列最昂貴的操作之一，必須先清出空間，導致所有後續元素都必須位移。",
                },
                "en": {
                    "title": "Inserting a new element at index 0 in an array of n elements requires moving all n existing elements.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Inserting at the front is one of the most expensive array operations — space must be made by shifting all subsequent elements.",
                },
            },
        },
        # 【Application 應用】 1000-1200
        # baseRating = 800 + 50(SC) + 150(L2 單步追蹤) + 100(Zero-indexed 新手誤區) = 1100
        {
            "id": "array-q6",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "給定 arr = [5, 3, 8, 1, 9]，執行 arr[2] 的回傳值是多少？",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "8"},
                        {"id": "C", "text": "1"},
                        {"id": "D", "text": "2"},
                    ],
                    "explanation": "陣列採用零索引（Zero-indexed），解題時要先把第一個位置視為 index 0，再對照目標索引。",
                },
                "en": {
                    "title": "Given arr = [5, 3, 8, 1, 9], what does arr[2] return?",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "8"},
                        {"id": "C", "text": "1"},
                        {"id": "D", "text": "2"},
                    ],
                    "explanation": "Arrays use zero-based indexing. Treat the first position as index 0, then match the target index to the array.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(插入位移新手誤區) = 1200
        {
            "id": "array-q7",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "arr = [10, 20, 30, 40]，在 Index 2 插入數值 25 後，arr[3] 的值是多少？",
                    "options": [
                        {"id": "A", "text": "20"},
                        {"id": "B", "text": "25"},
                        {"id": "C", "text": "30"},
                        {"id": "D", "text": "40"},
                    ],
                    "explanation": "插入後變為 [10, 20, 25, 30, 40]，原本在 index 2 的 30 被擠到了 index 3。",
                },
                "en": {
                    "title": "Given arr = [10, 20, 30, 40], after inserting 25 at index 2, what is arr[3]?",
                    "options": [
                        {"id": "A", "text": "20"},
                        {"id": "B", "text": "25"},
                        {"id": "C", "text": "30"},
                        {"id": "D", "text": "40"},
                    ],
                    "explanation": "After insertion: [10, 20, 25, 30, 40]. The original 30 at index 2 is shifted to index 3.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 150(L2 單步追蹤) + 100(刪除位移新手誤區) = 1100
        {
            "id": "array-q8",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "arr = [10, 20, 30, 40, 50]，刪除 Index 1後，陣列內容為何？",
                    "options": [
                        {"id": "A", "text": "[20, 30, 40, 50]"},
                        {"id": "B", "text": "[10, 30, 40, 50]"},
                        {"id": "C", "text": "[10, 20, 40, 50]"},
                        {"id": "D", "text": "[10, 20, 30, 50]"},
                    ],
                    "explanation": "刪除 20 後，後方的 30, 40, 50 分別向左遞補一個位置。",
                },
                "en": {
                    "title": "Given arr = [10, 20, 30, 40, 50], after deleting index 1, what is the array content?",
                    "options": [
                        {"id": "A", "text": "[20, 30, 40, 50]"},
                        {"id": "B", "text": "[10, 30, 40, 50]"},
                        {"id": "C", "text": "[10, 20, 40, 50]"},
                        {"id": "D", "text": "[10, 20, 30, 50]"},
                    ],
                    "explanation": "After deleting 20, the elements 30, 40, 50 each shift one position to the left.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(索引變動新手誤區) = 1200
        {
            "id": "array-q9",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對 arr = [1, 2, 3, 4, 5] 依序執行：del arr[2]、arr.insert(1, 10)、del arr[0]。最終 arr 的長度是多少？",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "5"},
                        {"id": "D", "text": "6"},
                    ],
                    "explanation": "步驟：[1,2,3,4,5] -> [1,2,4,5] -> [1,10,2,4,5] -> [10,2,4,5]。長度從 5 變為 4。",
                },
                "en": {
                    "title": "Starting with arr = [1, 2, 3, 4, 5], execute in order: del arr[2], arr.insert(1, 10), del arr[0]. What is the final length of arr?",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "5"},
                        {"id": "D", "text": "6"},
                    ],
                    "explanation": "Steps: [1,2,3,4,5] → [1,2,4,5] → [1,10,2,4,5] → [10,2,4,5]. Length goes from 5 to 4.",
                },
            },
        },
        # baseRating = 800 + 100(MC) + 100(L2 多重比較) + 100(操作複雜度新手誤區) = 1100
        {
            "id": "array-q10",
            "type": "multiple-choice",
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt2"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些操作在 Python List 中時間複雜度為 O(1)？（多選）",
                    "options": [
                        {"id": "opt1", "text": "arr[i]（透過 Index 存取）"},
                        {"id": "opt2", "text": "arr.append(val)（在末端新增）"},
                        {"id": "opt3", "text": "arr.insert(0, val)（在首端插入）"},
                        {"id": "opt4", "text": "del arr[0]（刪除首端）"},
                    ],
                    "explanation": "隨機存取與末端新增皆為 O(1)；但任何涉及首端的操作都需要位移全部元素，為 O(n)。",
                },
                "en": {
                    "title": "Which of the following Python List operations have O(1) time complexity? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "arr[i] (access by index)"},
                        {"id": "opt2", "text": "arr.append(val) (append at end)"},
                        {"id": "opt3", "text": "arr.insert(0, val) (insert at front)"},
                        {"id": "opt4", "text": "del arr[0] (delete at front)"},
                    ],
                    "explanation": "Random access and appending at the end are both O(1). Any operation involving the front requires shifting all elements — O(n).",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 50(L1 資料結構適用情境) + 0(直觀) = 900
        {
            "id": "array-q11",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "在需要頻繁於「中間插入或刪除」元素的場景，相較於 Array，哪個資料結構通常效能更好？",
                    "options": [
                        {"id": "A", "text": "Linked List（鏈結串列）"},
                        {"id": "B", "text": "Stack（堆疊）"},
                        {"id": "C", "text": "Queue（佇列）"},
                        {"id": "D", "text": "Hash Table"},
                    ],
                    "explanation": "Linked List 在已知插入或刪除點位置的前提下，只需修改指標即可完成中間操作，時間複雜度為 O(1)，不需像陣列那樣搬移大量資料，因此在頻繁異動的場景下表現更好。",
                },
                "en": {
                    "title": "When frequent insertions or deletions in the middle are required, which data structure generally outperforms Array?",
                    "options": [
                        {"id": "A", "text": "Linked List"},
                        {"id": "B", "text": "Stack"},
                        {"id": "C", "text": "Queue"},
                        {"id": "D", "text": "Hash Table"},
                    ],
                    "explanation": "A Linked List only needs to update pointers for mid-list operations when the insertion or deletion point is already known (O(1) given a reference), avoiding the need to shift many elements as in an array.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(插入位移新手誤區) = 1200
        {
            "id": "array-q12",
            "groupId": "array-group-1",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "假設 warehouse.inventory = [101, 102, 103, 104]，執行 add_item(2, 105) 後，inventory[3] 的值是多少？",
                    "options": [
                        {"id": "A", "text": "102"},
                        {"id": "B", "text": "103"},
                        {"id": "C", "text": "104"},
                        {"id": "D", "text": "105"},
                    ],
                    "explanation": "index 2 插入 105，導致原本 index 2 的 103 右移至 index 3。",
                },
                "en": {
                    "title": "Given warehouse.inventory = [101, 102, 103, 104], after calling add_item(2, 105), what is inventory[3]?",
                    "options": [
                        {"id": "A", "text": "102"},
                        {"id": "B", "text": "103"},
                        {"id": "C", "text": "104"},
                        {"id": "D", "text": "105"},
                    ],
                    "explanation": "Inserting 105 at index 2 shifts the original 103 (at index 2) to index 3.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(刪除後索引新手誤區) = 1200
        {
            "id": "array-q13",
            "groupId": "array-group-1",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "承上題，inventory = [101, 102, 105, 103, 104]。執行 remove_item(4) 後，再執行 find_item(105)，回傳值是多少？",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "-1"},
                    ],
                    "explanation": "刪除末端 104 不影響 105 的位置，105 依然位在 index 2。",
                },
                "en": {
                    "title": "Continuing from the previous question, inventory = [101, 102, 105, 103, 104]. After calling remove_item(4), what does find_item(105) return?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "-1"},
                    ],
                    "explanation": "Removing the last element (104) does not affect 105's position. It remains at index 2.",
                },
            },
        },
        # 【Complexity 複雜度】 1250-1500
        # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 0(直觀) = 950
        {
            "id": "array-q14",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "對於大小為 n 的陣列，以下哪項複雜度分析完全正確？",
                    "options": [
                        {"id": "A", "text": "存取 O(1)、線性搜尋 O(n)、在 index 0 插入 O(n)"},
                        {"id": "B", "text": "存取 O(n)、線性搜尋 O(n)、插入 O(1)"},
                        {"id": "C", "text": "存取 O(1)、線性搜尋 O(log n)、插入 O(1)"},
                        {"id": "D", "text": "存取 O(1)、線性搜尋 O(1)、插入 O(1)"},
                    ],
                    "explanation": "陣列強於隨機存取 (O(1))，但弱於搜尋與非末端的插入/刪除 (O(n))。",
                },
                "en": {
                    "title": "For an array of size n, which complexity analysis is completely correct?",
                    "options": [
                        {"id": "A", "text": "Access O(1), linear search O(n), insert at index 0 O(n)"},
                        {"id": "B", "text": "Access O(n), linear search O(n), insert O(1)"},
                        {"id": "C", "text": "Access O(1), linear search O(log n), insert O(1)"},
                        {"id": "D", "text": "Access O(1), linear search O(1), insert O(1)"},
                    ],
                    "explanation": "Arrays excel at random access (O(1)) but are slow for search and non-tail insertion/deletion (O(n)).",
                },
            },
        },
        # baseRating = 800 + 100(MC) + 100(L2 多重比較) + 100(陣列特性新手誤區) = 1100
        {
            "id": "array-q15",
            "type": "multiple-choice",
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下關於 Array 特性的敘述，哪些是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "支援隨機存取 (Random Access)，時間複雜度 O(1)"},
                        {"id": "opt2", "text": "在任意位置插入元素時，插入點之後的元素需向右移動"},
                        {"id": "opt3", "text": "陣列元素在記憶體中必須連續存放"},
                        {"id": "opt4", "text": "在陣列頭部插入與在尾部插入的時間複雜度相同"},
                    ],
                    "explanation": "頭部插入 (O(n)) 與尾部插入 (O(1)) 的複雜度不同。",
                },
                "en": {
                    "title": "Which of the following statements about Array characteristics are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Supports random access with O(1) time complexity"},
                        {"id": "opt2", "text": "Inserting at any position requires shifting all elements after the insertion point to the right"},
                        {"id": "opt3", "text": "Array elements must be stored in contiguous memory"},
                        {"id": "opt4", "text": "Inserting at the head and at the tail have the same time complexity"},
                    ],
                    "explanation": "Head insertion is O(n) while tail insertion is O(1) — they are not the same.",
                },
            },
        },
        # baseRating = 800 + 150(FC) + 400(L4 複雜控制流/邊界分析) + 150(插入邊界) = 1500
        {
            "id": "array-q16",
            "groupId": "array-group-1",
            "type": "fill-code",
            "baseRating": 1500,
            "code": WAREHOUSE_FILL_CODE,
            "language": "python",
            "correctAnswer": ["None", "index", "i - 1"],
            "translations": {
                "zh-TW": {
                    "title": "請填入 add_item 方法中 (a)(b)(c) 處缺失的程式碼，使其邏輯正確（注意 Python 語法與大小寫）。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "append(None) 預留空間；while i > index 確保只移動插入點後的元素；i-1 是將左側值搬到右側。",
                },
                "en": {
                    "title": "Fill in the missing code at (a), (b), and (c) in the add_item method to make the logic correct (mind Python syntax and casing).",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "append(None) reserves space; while i > index ensures only elements after the insertion point are moved; i-1 copies the left-side value into the right position.",
                },
            },
        },
        # baseRating = 800 + 150(FC) + 400(L4 複雜控制流/邊界分析) + 150(刪除邊界) = 1500
        {
            "id": "array-q17",
            "type": "fill-code",
            "baseRating": 1500,
            "code": ARRAY_DELETE_FILL_CODE,
            "language": "python",
            "correctAnswer": ["n - 1", "i + 1", "pop"],
            "translations": {
                "zh-TW": {
                    "title": "請填入下方 delete_at 函數中 (a)(b)(c) 處缺失的程式碼，使其正確實作「刪除並左移」。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "左移範圍至 n-1；複製右側 i+1 的值；最後 pop() 移除末端多餘空間。",
                },
                "en": {
                    "title": "Fill in the missing code at (a), (b), and (c) in the delete_at function to correctly implement 'delete and left-shift'.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "Left-shift loop range goes to n-1; copy the value from i+1 on the right; finally pop() removes the extra slot at the end.",
                },
            },
        },
        # baseRating = 800 + 150(PL) + 250(L3 多步狀態) + 150(找不到目標邊界) = 1350
        {
            "id": "array-q18",
            "type": "predict-line",
            "baseRating": 1350,
            "code": ARRAY_PREDICT_CODE,
            "language": "python",
            "correctAnswer": "2 3 4 3 4 6",
            "translations": {
                "zh-TW": {
                    "title": "給定 arr 物件，其 arr.arr = [10, 30]（共 2 個元素），接著執行 arr.search(5)（搜尋不存在的元素）。請依序填寫 search() 方法執行時，經過的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "執行流程如下：\n1. 進入 search 方法 (L2)\n2. for 迴圈開始，i=0 (L3)\n3. 判斷 arr[0]=10 是否等於 5？不等於，繼續 (L4)\n4. for 迴圈下一輪，i=1 (L3)\n5. 判斷 arr[1]=30 是否等於 5？不等於，繼續 (L4)\n6. 迴圈結束（range(2) 已耗盡），執行 return -1 (L6)\n注意：L5 從未執行（if 條件始終為 False）。",
                },
                "en": {
                    "title": "Given an Array object with arr.arr = [10, 30] (2 elements), calling arr.search(5) (searching for a non-existent element). Write the sequence of line numbers executed by the search() method (space-separated).",
                    "options": [],
                    "explanation": "Execution flow:\n1. Enter search method (L2)\n2. for loop starts, i=0 (L3)\n3. arr[0]=10 == 5? No, continue (L4)\n4. for loop next iteration, i=1 (L3)\n5. arr[1]=30 == 5? No, continue (L4)\n6. Loop ends (range(2) exhausted), execute return -1 (L6)\nNote: L5 is never reached (if condition always False).",
                },
            },
        },
        # baseRating = 800 + 0(TF) + 50(L1 陣列同質性定義) + 0(直觀) = 850
        {
            "id": "array-q19",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "傳統陣列可以在同一個陣列中任意混放整數、字串與物件，且這正是它的核心優勢。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "傳統陣列的核心特性是同質資料與連續儲存；若需要混放不同型別，通常是列表或其他更彈性的容器較合適。",
                },
                "en": {
                    "title": "A traditional array can freely mix integers, strings, and objects in the same array, and this is its main advantage.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "A traditional array is mainly homogeneous and contiguous. If mixed types are needed, a list or another flexible container is usually more appropriate.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 50(L1 固定長度定義) + 0(直觀) = 900
        {
            "id": "array-q20",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "下列哪一項最符合「傳統陣列」的長度特性？",
                    "options": [
                        {"id": "A", "text": "建立時通常需要先決定固定大小"},
                        {"id": "B", "text": "每次新增資料都會自動變成雜湊表"},
                        {"id": "C", "text": "長度永遠等於目前非空元素數量"},
                        {"id": "D", "text": "不需要索引即可直接找到任意元素"},
                    ],
                    "explanation": "傳統陣列通常需要預先配置固定空間；若資料量無法估計，動態陣列或列表會更有彈性。",
                },
                "en": {
                    "title": "Which statement best describes the size behavior of a traditional array?",
                    "options": [
                        {"id": "A", "text": "Its fixed size is usually chosen when it is created"},
                        {"id": "B", "text": "It automatically becomes a hash table after each append"},
                        {"id": "C", "text": "Its length is always the number of non-empty elements"},
                        {"id": "D", "text": "It can find any element directly without an index"},
                    ],
                    "explanation": "A traditional array usually reserves a fixed amount of space up front. For unknown sizes, a dynamic array or list is more flexible.",
                },
            },
        },
        # baseRating = 800 + 0(TF) + 50(L1 連續記憶體定義) + 0(直觀) = 850
        {
            "id": "array-q21",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "陣列的元素在底層通常連續存放，因此可用起始位址、索引與元素大小直接推算元素位置。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "連續記憶體是陣列能 O(1) 隨機存取的關鍵，位置可由 base_address + index × element_size 推算。",
                },
                "en": {
                    "title": "Array elements are usually stored contiguously, so an element location can be computed from the base address, index, and element size.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Contiguous memory is what enables O(1) random access: the location can be computed as base_address + index × element_size.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 0(直觀) = 950
        {
            "id": "array-q22",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "下列哪個場景最適合優先考慮使用陣列？",
                    "options": [
                        {"id": "A", "text": "需要頻繁在中間插入與刪除節點"},
                        {"id": "B", "text": "需要大量透過固定索引讀取矩陣或向量資料"},
                        {"id": "C", "text": "每筆資料型別都不同且數量完全未知"},
                        {"id": "D", "text": "只需要依照先進先出順序取出資料"},
                    ],
                    "explanation": "陣列適合矩陣、向量與查詢表等需要固定索引與頻繁隨機存取的情境。",
                },
                "en": {
                    "title": "Which scenario is the best fit for choosing an array first?",
                    "options": [
                        {"id": "A", "text": "Frequent insertions and deletions in the middle"},
                        {"id": "B", "text": "Heavy indexed reads over matrix or vector data"},
                        {"id": "C", "text": "Every value has a different type and the count is unknown"},
                        {"id": "D", "text": "Only first-in-first-out removal is needed"},
                    ],
                    "explanation": "Arrays are a strong fit for matrices, vectors, and lookup tables where fixed indexes and frequent random access matter.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 100(L2 動態想像) + 100(動態擴充新手誤區) = 1050
        {
            "id": "array-q23",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "動態陣列在容量已滿時又要 append 新元素，底層最可能先做什麼？",
                    "options": [
                        {"id": "A", "text": "直接覆蓋 index 0 的元素"},
                        {"id": "B", "text": "把所有元素改成字串以節省空間"},
                        {"id": "C", "text": "配置更大的連續空間並複製原本元素"},
                        {"id": "D", "text": "改用線性搜尋避免搬移資料"},
                    ],
                    "explanation": "動態陣列滿載時通常會配置更大的新空間，再把舊元素複製過去，因此單次 append 可能有 O(n) 隱藏成本。",
                },
                "en": {
                    "title": "When a dynamic array is full and another value is appended, what is it most likely to do first internally?",
                    "options": [
                        {"id": "A", "text": "Overwrite the element at index 0"},
                        {"id": "B", "text": "Convert every element to a string to save space"},
                        {"id": "C", "text": "Allocate a larger contiguous block and copy existing elements"},
                        {"id": "D", "text": "Use linear search to avoid moving data"},
                    ],
                    "explanation": "When full, a dynamic array usually allocates a larger block and copies old elements into it, so one append can have hidden O(n) cost.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(滿載擴充邊界) = 1400
        {
            "id": "array-q24",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "某動態陣列目前 size=4、capacity=4，擴充規則為滿載時 capacity 加倍。依序 append 5、6 後，size 與 capacity 分別是多少？",
                    "options": [
                        {"id": "A", "text": "size=5, capacity=5"},
                        {"id": "B", "text": "size=6, capacity=6"},
                        {"id": "C", "text": "size=6, capacity=8"},
                        {"id": "D", "text": "size=8, capacity=8"},
                    ],
                    "explanation": "append 5 前已滿載，因此先擴充 capacity 到 8，再放入 5；append 6 時尚有空間，不再擴充。最後 size=6、capacity=8。",
                },
                "en": {
                    "title": "A dynamic array has size=4 and capacity=4. Its capacity doubles when full. After appending 5 and then 6, what are size and capacity?",
                    "options": [
                        {"id": "A", "text": "size=5, capacity=5"},
                        {"id": "B", "text": "size=6, capacity=6"},
                        {"id": "C", "text": "size=6, capacity=8"},
                        {"id": "D", "text": "size=8, capacity=8"},
                    ],
                    "explanation": "Before appending 5 the array is full, so capacity doubles to 8, then 5 is stored. Appending 6 uses remaining space. Final size=6 and capacity=8.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(底層表示邊界) = 1400
        {
            "id": "array-q25",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "關於「傳統陣列」與「Python List」的底層差異，下列哪一項最精確？",
                    "options": [
                        {"id": "A", "text": "兩者都必須只儲存同一種實體數值，且永遠不能擴充"},
                        {"id": "B", "text": "傳統陣列偏向連續儲存同質值；Python List 可動態調整，底層主要儲存物件參照"},
                        {"id": "C", "text": "Python List 不使用索引，因此無法 O(1) 讀取元素"},
                        {"id": "D", "text": "傳統陣列每次讀取元素都需要線性搜尋"},
                    ],
                    "explanation": "傳統陣列強調同質、固定大小與連續實體資料；Python List 是動態容器，能調整大小，並以參照管理物件。",
                },
                "en": {
                    "title": "Which statement most accurately compares a traditional array and a Python List internally?",
                    "options": [
                        {"id": "A", "text": "Both must store only one kind of raw value and can never grow"},
                        {"id": "B", "text": "A traditional array tends to store homogeneous values contiguously; a Python List can resize and mainly stores object references"},
                        {"id": "C", "text": "A Python List does not use indexes, so it cannot read elements in O(1)"},
                        {"id": "D", "text": "A traditional array needs linear search every time it reads an element"},
                    ],
                    "explanation": "Traditional arrays emphasize homogeneous fixed-size contiguous data. Python Lists are dynamic containers that can resize and manage object references.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(最壞情況邊界) = 1400
        {
            "id": "array-q26",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "關於動態陣列 append 的時間成本，下列哪一項最正確？",
                    "options": [
                        {"id": "A", "text": "多數 append 很快，但滿載觸發擴充時，單次 append 可能需要 O(n) 複製"},
                        {"id": "B", "text": "每一次 append 都必定需要 O(n) 複製全部元素"},
                        {"id": "C", "text": "append 永遠是 O(1)，即使容量已滿也不需搬移"},
                        {"id": "D", "text": "append 的成本與陣列容量無關，只和元素型別名稱長度有關"},
                    ],
                    "explanation": "動態陣列常用預留容量換取多數 append 的效率；但容量滿載時，擴充與複製會讓該次操作變成 O(n)。",
                },
                "en": {
                    "title": "Which statement about the cost of appending to a dynamic array is most accurate?",
                    "options": [
                        {"id": "A", "text": "Most appends are fast, but an append that triggers resizing may copy n elements in O(n)"},
                        {"id": "B", "text": "Every append must copy all elements in O(n)"},
                        {"id": "C", "text": "Append is always O(1), even when capacity is full"},
                        {"id": "D", "text": "Append cost depends only on the length of the element type name"},
                    ],
                    "explanation": "Dynamic arrays reserve extra capacity so most appends are efficient. When capacity is full, resizing and copying can make that one append O(n).",
                },
            },
        },
        # baseRating = 800 + 150(FC) + 400(L4 複雜控制流/邊界分析) + 150(滿載擴充邊界) = 1500
        {
            "id": "array-q27",
            "type": "fill-code",
            "baseRating": 1500,
            "code": ARRAY_RESIZE_FILL_CODE,
            "language": "python",
            "correctAnswer": ["2", "size", "size"],
            "translations": {
                "zh-TW": {
                    "title": "請填入 append_with_resize 函數中 (a)(b)(c) 處缺失的程式碼，使動態陣列在滿載時加倍擴充並正確追加新值。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "滿載時 capacity 乘以 2；只需複製目前有效的 size 個元素；新值應放在原本的 size 位置。",
                },
                "en": {
                    "title": "Fill in (a), (b), and (c) in append_with_resize so the dynamic array doubles when full and appends the new value correctly.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "When full, capacity is multiplied by 2. Only the current size valid elements need copying. The new value belongs at the old size index.",
                },
            },
        },
        # baseRating = 800 + 150(PL) + 400(L4 複雜控制流/邊界分析) + 50(巢狀迴圈視覺干擾) = 1400
        {
            "id": "array-q28",
            "type": "predict-line",
            "baseRating": 1400,
            "code": MATRIX_TRANSPOSE_PREDICT_CODE,
            "language": "python",
            "correctAnswer": "1 2 3 4 5 6 5 6 7 3 4 5 6 5 6 7",
            "translations": {
                "zh-TW": {
                    "title": "上方程式會轉置 2x2 矩陣。請依序填寫實際執行到的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "先執行 L1、L2。外層 col=0 時執行 L3、L4，內層 row=0、1 各執行 L5、L6，接著 L7；外層 col=1 重複同樣流程。因此序列為 1 2 3 4 5 6 5 6 7 3 4 5 6 5 6 7。",
                },
                "en": {
                    "title": "The code above transposes a 2x2 matrix. Write the executed line-number sequence in order (space-separated).",
                    "options": [],
                    "explanation": "L1 and L2 run first. For outer col=0, L3 and L4 run, then inner row=0 and row=1 each run L5 and L6, followed by L7. Outer col=1 repeats the same flow. The sequence is 1 2 3 4 5 6 5 6 7 3 4 5 6 5 6 7.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(擴充邊界) = 1400
        {
            "id": "array-q29",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "某動態陣列目前 size=3、capacity=4，擴充規則為「滿載時 capacity 加倍，並複製所有既有元素」。依序 append A、B、C 後，哪項描述正確？",
                    "options": [
                        {"id": "A", "text": "三次 append 都會觸發擴充，因此總共複製 3 + 4 + 5 個元素"},
                        {"id": "B", "text": "append A 後立刻擴充到 capacity=8，因為 size 變成 4"},
                        {"id": "C", "text": "append B 前才會觸發擴充；最後 size=6、capacity=8，且擴充時複製 4 個既有元素"},
                        {"id": "D", "text": "append C 會再次觸發擴充；最後 size=6、capacity=16"},
                    ],
                    "explanation": "初始還有 1 格空間，所以 append A 後 size=4、capacity=4，尚未搬移；append B 前已滿載，先擴充到 8 並複製 4 個元素，再放入 B；append C 不需再擴充，最後 size=6、capacity=8。",
                },
                "en": {
                    "title": "A dynamic array currently has size=3 and capacity=4. Its rule is: when full, double capacity and copy all existing elements. After appending A, B, and C in order, which statement is correct?",
                    "options": [
                        {"id": "A", "text": "All three appends trigger resizing, so 3 + 4 + 5 elements are copied"},
                        {"id": "B", "text": "Appending A immediately grows capacity to 8 because size becomes 4"},
                        {"id": "C", "text": "Resizing happens right before appending B; final size=6 and capacity=8, with 4 existing elements copied during resizing"},
                        {"id": "D", "text": "Appending C triggers another resize; final size=6 and capacity=16"},
                    ],
                    "explanation": "Initially there is one free slot, so appending A makes size=4 and capacity=4 without copying. Before appending B, the array is full, so it grows to 8 and copies 4 elements. Appending C needs no further resize, so final size=6 and capacity=8.",
                },
            },
        },
        # baseRating = 800 + 100(MC) + 400(L4 複雜控制流/邊界分析) + 100(Zero-indexed 位址新手誤區) = 1400
        {
            "id": "array-q30",
            "type": "multiple-choice",
            "baseRating": 1400,
            "correctAnswer": ["opt1", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "某整數陣列起始位址為 1000，每個元素佔 4 bytes。關於 arr[3] 的位址計算，哪些敘述正確？（多選）",
                    "options": [
                        {"id": "opt1", "text": "arr[3] 的位址是 1000 + 3 × 4 = 1012"},
                        {"id": "opt2", "text": "arr[3] 是第四個元素，所以位址是 1000 + 4 × 4 = 1016"},
                        {"id": "opt3", "text": "能這樣直接計算，是因為陣列元素連續儲存且大小固定"},
                        {"id": "opt4", "text": "若元素不連續儲存，仍然可以只靠 index 與 element_size 直接算出位址"},
                    ],
                    "explanation": "陣列採零索引，因此 arr[3] 偏移量是 3 個元素大小。直接位址計算依賴連續儲存與固定元素大小。",
                },
                "en": {
                    "title": "An integer array starts at address 1000, and each element uses 4 bytes. Which statements about the address of arr[3] are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "The address of arr[3] is 1000 + 3 × 4 = 1012"},
                        {"id": "opt2", "text": "arr[3] is the fourth element, so the address is 1000 + 4 × 4 = 1016"},
                        {"id": "opt3", "text": "This direct calculation works because array elements are contiguous and fixed-size"},
                        {"id": "opt4", "text": "Even if elements are not contiguous, index and element_size alone still determine the address"},
                    ],
                    "explanation": "Arrays are zero-indexed, so arr[3] has an offset of 3 element sizes. Direct address calculation depends on contiguous storage and fixed element size.",
                },
            },
        },
    ],
}

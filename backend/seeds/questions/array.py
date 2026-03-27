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
        return -1
                                                 
    def update(self, index, value): 
        if index < 0 or index >= len(self.arr): # L9
            raise IndexError(\"Index out of bounds\")
        self.arr[index] = value
                                                 
    def insert(self, index, value):
        # Python's list.insert handles shifting
        self.arr.insert(index, value)

    def delete(self, index):
        # Python's list.pop handles shifting
        self.arr.pop(index)"""

ARRAY_DELETE_FILL_CODE = """\
def delete_at(arr, index):
    n = len(arr)
    for i in range(index, (a)):    # 左移的迴圈範圍
        arr[i] = arr[(b)]           # 將右側元素左移
    arr.(c)()                       # 移除末端多餘的位置"""

DATA = {
    "slug": "array",
    "groups": [
        {
            "id": "group-array-inventory",
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
        {
            "id": "array-tf-1",
            "type": "true-false",
            "baseRating": 800,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "陣列 (Array) 將資料儲存在連續的記憶體空間，因此可以透過 Index 直接計算任意元素的記憶體位址，實現 O(1) 的隨機存取。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "陣列的記憶體位址公式為：base_address + index × element_size。因為記憶體連續，可以直接計算位址而不需遍歷。",
                },
                "en": {
                    "title": "An Array stores data in contiguous memory, allowing any element's address to be computed directly via index, enabling O(1) random access.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "The memory address formula is: base_address + index × element_size. Because memory is contiguous, the address can be computed directly without traversal.",
                },
            },
        },
        {
            "id": "array-q1",
            "type": "single-choice",
            "baseRating": 800,
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
        {
            "id": "array-q2",
            "type": "single-choice",
            "baseRating": 850,
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
        {
            "id": "array-q3",
            "type": "single-choice",
            "baseRating": 900,
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
        {
            "id": "array-tf-2",
            "type": "true-false",
            "baseRating": 950,
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
        {
            "id": "array-q4",
            "type": "single-choice",
            "baseRating": 1000,
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
                    "explanation": "索引追蹤：arr[0]=5, arr[1]=3, arr[2]=8。",
                },
                "en": {
                    "title": "Given arr = [5, 3, 8, 1, 9], what does arr[2] return?",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "8"},
                        {"id": "C", "text": "1"},
                        {"id": "D", "text": "2"},
                    ],
                    "explanation": "Index trace: arr[0]=5, arr[1]=3, arr[2]=8.",
                },
            },
        },
        {
            "id": "array-q5",
            "type": "single-choice",
            "baseRating": 1050,
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
        {
            "id": "array-q6",
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
        {
            "id": "array-q7",
            "type": "single-choice",
            "baseRating": 1150,
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
        {
            "id": "array-multi-1",
            "type": "multiple-choice",
            "baseRating": 1150,
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
        {
            "id": "array-q8",
            "type": "single-choice",
            "baseRating": 1200,
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
                    "explanation": "Linked List 只需修改指標即可完成中間操作 (O(1))，不需搬移資料，在已知位置時比陣列快。",
                },
                "en": {
                    "title": "When frequent insertions or deletions in the middle are required, which data structure generally outperforms Array?",
                    "options": [
                        {"id": "A", "text": "Linked List"},
                        {"id": "B", "text": "Stack"},
                        {"id": "C", "text": "Queue"},
                        {"id": "D", "text": "Hash Table"},
                    ],
                    "explanation": "A Linked List only needs to update pointers for mid-list operations (O(1) given a reference), avoiding the need to shift elements as in an array.",
                },
            },
        },
        {
            "id": "array-group-1",
            "groupId": "group-array-inventory",
            "type": "single-choice",
            "baseRating": 1000,
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
        {
            "id": "array-group-2",
            "groupId": "group-array-inventory",
            "type": "single-choice",
            "baseRating": 1100,
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
        {
            "id": "array-q9",
            "type": "single-choice",
            "baseRating": 1250,
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
        {
            "id": "array-multi-2",
            "type": "multiple-choice",
            "baseRating": 1350,
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
        {
            "id": "array-group-3",
            "groupId": "group-array-inventory",
            "type": "fill-code",
            "baseRating": 1300,
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
        {
            "id": "array-fill-1",
            "type": "fill-code",
            "baseRating": 1400,
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
        {
            "id": "array-pred-1",
            "type": "predict-line",
            "baseRating": 1500,
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
    ],
}

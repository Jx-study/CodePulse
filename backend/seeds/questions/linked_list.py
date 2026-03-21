PLAYLIST_CODE = """\
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class Playlist:
    def __init__(self):
        self.head = None

    def add_to_end(self, song):
        new_node = Node(song)
        if self.head is None:
            self.head = new_node
            return
        current = self.head
        while current.next is not None:
            current = current.next
        current.next = new_node

    def play_and_remove(self):
        if self.head is None:
            return "No songs"
        song = self.head.value
        self.head = self.head.next
        return song

    def remove_song(self, song_name):
        if self.head is None:
            return False
        if self.head.value == song_name:
            self.head = self.head.next
            return True
        prev = self.head
        current = self.head.next
        while current is not None:
            if current.value == song_name:
                prev.next = current.next
                return True
            prev = current
            current = current.next
        return False"""

PLAYLIST_FILL_CODE = """\
def add_to_end(self, song):
    new_node = Node(song)
    if self.head is (a):         # 判斷串列是否為空
        self.head = new_node
        return
    current = self.head
    while (b) is not None:       # 遍歷直到找到尾節點
        current = current.next
    current.next = (c)           # 將尾節點連接到新節點"""

LL_INSERT_FILL_CODE = """\
class Node:
    def __init__(self, value):
        self.value = value
        self.next = (a)          # 新節點初始化時，下一個節點為空

class LinkedList:
    def __init__(self):
        self.head = (b)          # 初始化時串列為空

    def insert_at_head(self, value):
        new_node = Node(value)
        new_node.next = self.head  # 新節點指向原本的 head
        self.head = (c)            # 更新 head 為新插入的節點"""

LL_PREDICT_CODE = """\
class Node:                              # L1
    def __init__(self, value):           # L2
        self.value = value               # L3
        self.next = None                 # L4
                                         # L5
class LinkedList:                        # L6
    def __init__(self):                  # L7
        self.head = None                 # L8
                                         # L9
    def search(self, value):             # L10
        current = self.head              # L11
        index = 0                        # L12
        while current:                   # L13
            if current.value == value:   # L14
                return index             # L15
            current = current.next       # L16
            index += 1                   # L17
        return -1                        # L18"""

DATA = {
    "slug": "linked-list",
    "groups": [
        {
            "id": "group-ll-playlist",
            "translations": {
                "zh-TW": {
                    "title": "題組：音樂播放清單",
                    "description": "某音樂 App 使用 Singly Linked List 實作播放清單功能，新增歌曲到尾端、播放並移除頭部歌曲、以及依名稱移除指定歌曲。請參考下方程式碼回答問題。",
                },
                "en": {
                    "title": "Group: Music Playlist",
                    "description": "A music app uses a Singly Linked List to implement playlist functionality: adding songs to the end, playing and removing the head song, and removing a specific song by name. Refer to the code below to answer the questions.",
                },
            },
            "code": PLAYLIST_CODE,
            "language": "python",
        }
    ],
    "questions": [
        # 【Basic 基礎】 800-950
        {
            "id": "ll-tf-1",
            "type": "true-false",
            "category": "basic",
            "difficultyRating": 800,
            "correctAnswer": "true",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "Linked List（鏈結串列）的節點在記憶體中不必連續存放，每個節點透過指標連接到下一個節點。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確！這是 Linked List 與 Array 的最核心差異。Array 需要連續記憶體（因此支援 O(1) 隨機存取），而 Linked List 的節點可以分散在記憶體各處，每個節點透過 next 指標連接到下一節點。這使得 Linked List 在動態新增/刪除上更有彈性，但失去了隨機存取的能力。",
                },
                "en": {
                    "title": "Linked List nodes do not need to be stored in contiguous memory — each node connects to the next via a pointer.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Correct! This is the most fundamental difference between a Linked List and an Array. Arrays require contiguous memory (enabling O(1) random access), while Linked List nodes can be scattered in memory, each connected via a next pointer. This gives Linked Lists flexibility for dynamic insertion/deletion but loses random access.",
                },
            },
        },
        {
            "id": "ll-q1",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 800,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "在 Singly Linked List（單向鏈結串列）中，每個 Node（節點）通常包含哪兩個部分？",
                    "options": [
                        {"id": "A", "text": "鍵 (Key) 和值 (Value)"},
                        {"id": "B", "text": "資料 (Data/Value) 和指向下一節點的指標 (Next Pointer)"},
                        {"id": "C", "text": "索引 (Index) 和資料 (Data)"},
                        {"id": "D", "text": "前驅指標 (Prev) 和後繼指標 (Next)"},
                    ],
                    "explanation": "Singly Linked List 的每個節點包含兩部分：\n1. 資料 (Data/Value)：儲存節點的實際數據。\n2. Next 指標：指向串列中下一個節點的位址。\n選項 D 描述的是 Doubly Linked List（雙向鏈結串列），它有 prev 和 next 兩個指標。",
                },
                "en": {
                    "title": "In a Singly Linked List, what two parts does each node typically contain?",
                    "options": [
                        {"id": "A", "text": "Key and Value"},
                        {"id": "B", "text": "Data (Value) and a pointer to the next node (Next Pointer)"},
                        {"id": "C", "text": "Index and Data"},
                        {"id": "D", "text": "Previous pointer (Prev) and Next pointer (Next)"},
                    ],
                    "explanation": "Each node in a Singly Linked List contains two parts:\n1. Data/Value: stores the actual data.\n2. Next pointer: points to the address of the next node.\nOption D describes a Doubly Linked List, which has both prev and next pointers.",
                },
            },
        },
        {
            "id": "ll-q2",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 850,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "在 Singly Linked List 中，最後一個節點（尾節點）的 next 指標通常指向什麼？",
                    "options": [
                        {"id": "A", "text": "第一個節點（形成環狀串列）"},
                        {"id": "B", "text": "None（表示串列結束）"},
                        {"id": "C", "text": "自己本身"},
                        {"id": "D", "text": "前一個節點"},
                    ],
                    "explanation": "在標準 Singly Linked List 中，尾節點的 next 指標設為 None（在 Python 中）或 null（在其他語言），表示串列到此結束。選項 A 描述的是 Circular Linked List（環狀串列）。",
                },
                "en": {
                    "title": "In a Singly Linked List, what does the next pointer of the last node (tail) typically point to?",
                    "options": [
                        {"id": "A", "text": "The first node (forming a circular list)"},
                        {"id": "B", "text": "None (indicating end of list)"},
                        {"id": "C", "text": "Itself"},
                        {"id": "D", "text": "The previous node"},
                    ],
                    "explanation": "In a standard Singly Linked List, the tail node's next pointer is set to None (Python) or null (other languages) to mark the end of the list. Option A describes a Circular Linked List.",
                },
            },
        },
        {
            "id": "ll-tf-2",
            "type": "true-false",
            "category": "basic",
            "difficultyRating": 900,
            "correctAnswer": "true",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "在 Singly Linked List 的頭部插入元素（insert_at_head）不需要遍歷整個串列，時間複雜度為 O(1)。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確！insert_at_head 的步驟：\n1. 建立新節點 (new_node)\n2. 讓 new_node.next 指向原本的 head\n3. 更新 head = new_node\n這三個步驟都是常數時間操作，不需要遍歷，時間複雜度為 O(1)。",
                },
                "en": {
                    "title": "Inserting at the head of a Singly Linked List (insert_at_head) does not require traversal and has O(1) time complexity.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Correct! insert_at_head steps:\n1. Create new_node\n2. Set new_node.next = current head\n3. Update head = new_node\nAll three are constant-time operations — no traversal needed — so O(1).",
                },
            },
        },
        {
            "id": "ll-q3",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 950,
            "correctAnswer": "C",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "對一個空的 LinkedList 依序執行：insert_at_head(10)、insert_at_head(20)、insert_at_head(30)。操作完成後，head.value 的值是多少？",
                    "options": [
                        {"id": "A", "text": "10"},
                        {"id": "B", "text": "20"},
                        {"id": "C", "text": "30"},
                        {"id": "D", "text": "無法確定"},
                    ],
                    "explanation": "insert_at_head 每次把新節點插在串列最前面：\n1. insert_at_head(10) → [10]\n2. insert_at_head(20) → [20→10]\n3. insert_at_head(30) → [30→20→10]\n因此 head.value = 30。",
                },
                "en": {
                    "title": "On an empty LinkedList, execute: insert_at_head(10), insert_at_head(20), insert_at_head(30). What is head.value?",
                    "options": [
                        {"id": "A", "text": "10"},
                        {"id": "B", "text": "20"},
                        {"id": "C", "text": "30"},
                        {"id": "D", "text": "Cannot be determined"},
                    ],
                    "explanation": "insert_at_head always inserts at the front:\n1. insert_at_head(10) → [10]\n2. insert_at_head(20) → [20→10]\n3. insert_at_head(30) → [30→20→10]\nSo head.value = 30.",
                },
            },
        },
        # 【Application】 1000-1250
        {
            "id": "ll-q4",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1000,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "在沒有 tail 指標的 Singly Linked List 中，執行 insert_at_tail（在尾部插入元素）需要做什麼？",
                    "options": [
                        {"id": "A", "text": "直接更新 head 指標，時間複雜度 O(1)"},
                        {"id": "B", "text": "從 head 開始遍歷，找到最後一個 next 為 None 的節點，再連接新節點，時間複雜度 O(n)"},
                        {"id": "C", "text": "使用二元搜尋找到尾端位置，O(log n)"},
                        {"id": "D", "text": "根據節點數量直接計算尾端記憶體位址，O(1)"},
                    ],
                    "explanation": "沒有 tail 指標時，無法直接存取尾節點。必須從 head 開始，逐一走訪每個節點，直到找到 next == None 的節點，才能在其後連接新節點，時間複雜度 O(n)。",
                },
                "en": {
                    "title": "Without a tail pointer in a Singly Linked List, what is required to insert at the tail?",
                    "options": [
                        {"id": "A", "text": "Directly update the head pointer — O(1)"},
                        {"id": "B", "text": "Traverse from head to find the last node (next == None), then attach the new node — O(n)"},
                        {"id": "C", "text": "Use binary search to find the tail position — O(log n)"},
                        {"id": "D", "text": "Compute the tail's memory address directly from the node count — O(1)"},
                    ],
                    "explanation": "Without a tail pointer, the tail node cannot be accessed directly. You must traverse from head until finding the node where next == None, then attach the new node — O(n).",
                },
            },
        },
        {
            "id": "ll-group-1",
            "groupId": "group-ll-playlist",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1000,
            "correctAnswer": "C",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "若播放清單目前已有 3 首歌曲，執行 add_to_end('新歌') 的時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(3)（固定走 3 步）"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(log n)"},
                    ],
                    "explanation": "add_to_end 需要從 head 開始遍歷整個串列，找到 current.next == None 的尾節點後才能連接新節點。當清單有 n 首歌時，需要走 n 步，時間複雜度為 O(n)。",
                },
                "en": {
                    "title": "If the playlist already has 3 songs, what is the time complexity of add_to_end('new_song')?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(3) (fixed 3 steps)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(log n)"},
                    ],
                    "explanation": "add_to_end must traverse from head until finding the tail node (current.next == None), then attach the new node. With n songs it takes n steps — O(n).",
                },
            },
        },
        {
            "id": "ll-q5",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1050,
            "correctAnswer": "C",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "在 Singly Linked List 中搜尋特定值（search）的最壞情況時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "Linked List 不支援隨機存取，搜尋只能從 head 開始，逐一比較每個節點的值。最壞情況：目標值在尾端，或根本不存在（需走訪全部 n 個節點），時間複雜度為 O(n)。",
                },
                "en": {
                    "title": "What is the worst-case time complexity of searching for a specific value in a Singly Linked List?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "Linked Lists do not support random access. Search must start from head and compare each node one by one. Worst case: target is at the tail or doesn't exist — all n nodes must be visited — O(n).",
                },
            },
        },
        {
            "id": "ll-multi-1",
            "type": "multiple-choice",
            "category": "application",
            "difficultyRating": 1100,
            "correctAnswer": ["opt1", "opt3"],
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "以下哪些是 Linked List 相較於 Array 的優點？（多選）",
                    "options": [
                        {"id": "opt1", "text": "在頭部插入或刪除元素為 O(1)，不需移動其他元素"},
                        {"id": "opt2", "text": "支援 O(1) 的隨機存取（按索引直接存取元素）"},
                        {"id": "opt3", "text": "動態調整大小無需複製整個資料結構到新記憶體空間"},
                        {"id": "opt4", "text": "搜尋特定值的時間複雜度低於 Array"},
                    ],
                    "explanation": "opt1 ✓：insert_at_head 僅需修改指標，O(1)。\nopt2 ✗：Linked List 無法隨機存取，需從 head 走 k 步，O(n)。\nopt3 ✓：Linked List 動態分配每個節點，不需預先分配固定大小。\nopt4 ✗：兩者都是 O(n) 線性搜尋，Linked List 並無優勢。",
                },
                "en": {
                    "title": "Which of the following are advantages of a Linked List over an Array? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Head insertion and deletion are O(1) — no element shifting needed"},
                        {"id": "opt2", "text": "Supports O(1) random access (direct access by index)"},
                        {"id": "opt3", "text": "Dynamic resizing without copying the entire structure to new memory"},
                        {"id": "opt4", "text": "Searching for a specific value has lower time complexity than Array"},
                    ],
                    "explanation": "opt1 ✓: insert_at_head only modifies pointers — O(1).\nopt2 ✗: Linked List cannot random access; requires k steps from head — O(n).\nopt3 ✓: Each node is dynamically allocated — no need for a fixed pre-allocated block.\nopt4 ✗: Both are O(n) linear search — no advantage for Linked List.",
                },
            },
        },
        {
            "id": "ll-group-2",
            "groupId": "group-ll-playlist",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1100,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "對空的 Playlist 依序執行：add_to_end('A')、add_to_end('B')、add_to_end('C')、play_and_remove()、play_and_remove()。第二次 play_and_remove() 的回傳值是什麼？",
                    "options": [
                        {"id": "A", "text": "'A'"},
                        {"id": "B", "text": "'B'"},
                        {"id": "C", "text": "'C'"},
                        {"id": "D", "text": "'No songs'"},
                    ],
                    "explanation": "逐步追蹤：\n[A] → [A→B] → [A→B→C]\nplay_and_remove() → 回傳 'A'，剩 [B→C]\nplay_and_remove() → 回傳 'B'，剩 [C]\n第二次回傳 'B'。",
                },
                "en": {
                    "title": "On an empty Playlist, execute: add_to_end('A'), add_to_end('B'), add_to_end('C'), play_and_remove(), play_and_remove(). What does the second play_and_remove() return?",
                    "options": [
                        {"id": "A", "text": "'A'"},
                        {"id": "B", "text": "'B'"},
                        {"id": "C", "text": "'C'"},
                        {"id": "D", "text": "'No songs'"},
                    ],
                    "explanation": "Trace:\n[A] → [A→B] → [A→B→C]\nplay_and_remove() → returns 'A', remaining [B→C]\nplay_and_remove() → returns 'B', remaining [C]\nThe second call returns 'B'.",
                },
            },
        },
        {
            "id": "ll-q6",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1150,
            "correctAnswer": "A",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "若已知要刪除的節點的「前一個節點（prev）」，在 Singly Linked List 中執行刪除的時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "已知 prev 指標時，刪除操作只需一步：prev.next = prev.next.next。不需要走訪其他節點，時間複雜度 O(1)。注意：找到 prev 本身需要 O(n) 的遍歷，整體刪除（含搜尋）仍是 O(n)。",
                },
                "en": {
                    "title": "If you already know the previous node (prev) of the node to delete in a Singly Linked List, what is the time complexity of the deletion?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "Given a prev pointer, deletion takes one step: prev.next = prev.next.next. No traversal needed — O(1). Note: finding prev itself requires O(n) traversal, so the full delete-including-search is still O(n).",
                },
            },
        },
        {
            "id": "ll-q7",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1200,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "在需要「頻繁在頭部插入與刪除」的應用場景中，Linked List 比 Array 更有效率的原因是什麼？",
                    "options": [
                        {"id": "A", "text": "Linked List 使用的記憶體比 Array 少"},
                        {"id": "B", "text": "Linked List 在頭部插入/刪除為 O(1)，而 Array 需要移動所有元素，為 O(n)"},
                        {"id": "C", "text": "Linked List 的搜尋比 Array 更快"},
                        {"id": "D", "text": "Linked List 支援隨機存取而 Array 不支援"},
                    ],
                    "explanation": "Linked List 在頭部操作的優勢：\n• insert_at_head：O(1)。\n• delete_at_head：O(1)。\n\nArray 在頭部操作：\n• 在 index 0 插入：需將所有 n 個元素右移，O(n)。\n• 刪除 index 0：需將所有 n-1 個元素左移，O(n)。",
                },
                "en": {
                    "title": "In scenarios with frequent head insertions and deletions, why is a Linked List more efficient than an Array?",
                    "options": [
                        {"id": "A", "text": "Linked List uses less memory than Array"},
                        {"id": "B", "text": "Linked List head insert/delete is O(1), while Array must shift all elements — O(n)"},
                        {"id": "C", "text": "Linked List search is faster than Array"},
                        {"id": "D", "text": "Linked List supports random access but Array does not"},
                    ],
                    "explanation": "Linked List head operation advantage:\n• insert_at_head: O(1)\n• delete_at_head: O(1)\n\nArray head operation:\n• Insert at index 0: shift all n elements right — O(n)\n• Delete at index 0: shift all n-1 elements left — O(n)",
                },
            },
        },
        {
            "id": "ll-q8",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1250,
            "correctAnswer": "C",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "在沒有 tail 指標的 Singly Linked List 中，delete_at_tail（刪除尾節點）的時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(1)，因為 head 指標可以直接找到尾節點"},
                    ],
                    "explanation": "刪除尾節點需要找到「倒數第二個節點（prev）」才能執行 prev.next = None。沒有 tail 指標時，必須從 head 開始遍歷，時間複雜度 O(n)。",
                },
                "en": {
                    "title": "Without a tail pointer in a Singly Linked List, what is the time complexity of delete_at_tail?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(1), because the head pointer can directly find the tail"},
                    ],
                    "explanation": "Deleting the tail requires finding the second-to-last node (prev) to set prev.next = None. Without a tail pointer, traversal from head is required — O(n).",
                },
            },
        },
        # 【Complexity】 1300-1500
        {
            "id": "ll-group-3",
            "groupId": "group-ll-playlist",
            "type": "fill-code",
            "category": "complexity",
            "difficultyRating": 1300,
            "code": PLAYLIST_FILL_CODE,
            "language": "python",
            "correctAnswer": ["None", "current.next", "new_node"],
            "points": 5,
            "translations": {
                "zh-TW": {
                    "title": "請填入 add_to_end 方法中 (a)(b)(c) 處缺失的程式碼，使其正確實作「在播放清單尾端加入歌曲」的功能（注意 Python 語法）。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) self.head is None：判斷串列是否為空。\n(b) current.next is not None：遍歷條件，迴圈結束時 current 是尾節點。\n(c) current.next = new_node：將尾節點連接到新節點。",
                },
                "en": {
                    "title": "Fill in the missing code at (a)(b)(c) in the add_to_end method to correctly implement 'append a song to the playlist end' (mind Python syntax).",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) self.head is None: checks if the list is empty.\n(b) current.next is not None: traversal condition; when the loop ends, current is the tail.\n(c) current.next = new_node: links the tail to the new node.",
                },
            },
        },
        {
            "id": "ll-multi-2",
            "type": "multiple-choice",
            "category": "complexity",
            "difficultyRating": 1350,
            "correctAnswer": ["opt1", "opt3", "opt4"],
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "以下關於 Singly Linked List 特性的敘述，哪些是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "節點在記憶體中不需要連續存放"},
                        {"id": "opt2", "text": "支援 O(1) 的尾端刪除（在沒有 tail 指標的情況下）"},
                        {"id": "opt3", "text": "插入或刪除節點時，不需要搬移其他節點的資料，只需修改指標"},
                        {"id": "opt4", "text": "Singly Linked List 只能從 head 開始單向遍歷，無法直接存取前一個節點"},
                    ],
                    "explanation": "opt1 ✓：Linked List 的核心特性。\nopt2 ✗：沒有 tail 指標時，delete_at_tail 必須遍歷找到倒數第二個節點，O(n)。\nopt3 ✓：插入/刪除只需修改相關節點的 next 指標。\nopt4 ✓：Singly 即單向，每個節點只有 next 指標。",
                },
                "en": {
                    "title": "Which of the following statements about Singly Linked List characteristics are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Nodes do not need to be stored in contiguous memory"},
                        {"id": "opt2", "text": "Supports O(1) tail deletion (without a tail pointer)"},
                        {"id": "opt3", "text": "Insertion and deletion only require modifying pointers, not moving other nodes' data"},
                        {"id": "opt4", "text": "A Singly Linked List can only be traversed forward from head — there is no direct access to the previous node"},
                    ],
                    "explanation": "opt1 ✓: Core property of Linked Lists.\nopt2 ✗: Without a tail pointer, delete_at_tail must traverse to the second-to-last node — O(n).\nopt3 ✓: Only pointer modifications needed.\nopt4 ✓: 'Singly' means one direction — only next pointers exist.",
                },
            },
        },
        {
            "id": "ll-q9",
            "type": "single-choice",
            "category": "complexity",
            "difficultyRating": 1400,
            "correctAnswer": "A",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "以下哪項對 Singly Linked List（無 tail 指標）各操作的時間複雜度分析完全正確？",
                    "options": [
                        {"id": "A", "text": "頭部插入 O(1)、尾部插入 O(n)、按值搜尋 O(n)"},
                        {"id": "B", "text": "頭部插入 O(1)、尾部插入 O(1)、按值搜尋 O(n)"},
                        {"id": "C", "text": "頭部插入 O(n)、尾部插入 O(n)、按值搜尋 O(1)"},
                        {"id": "D", "text": "頭部插入 O(1)、尾部插入 O(1)、按值搜尋 O(log n)"},
                    ],
                    "explanation": "Singly Linked List（無 tail 指標）時間複雜度：\n• 頭部插入：O(1)，只修改 head 指標。\n• 尾部插入：O(n)，需從 head 遍歷找尾節點。\n• 按值搜尋：O(n)，需線性遍歷。",
                },
                "en": {
                    "title": "Which time complexity analysis for Singly Linked List (no tail pointer) operations is completely correct?",
                    "options": [
                        {"id": "A", "text": "Head insert O(1), tail insert O(n), search by value O(n)"},
                        {"id": "B", "text": "Head insert O(1), tail insert O(1), search by value O(n)"},
                        {"id": "C", "text": "Head insert O(n), tail insert O(n), search by value O(1)"},
                        {"id": "D", "text": "Head insert O(1), tail insert O(1), search by value O(log n)"},
                    ],
                    "explanation": "Singly Linked List (no tail pointer) complexities:\n• Head insert: O(1) — only updates the head pointer.\n• Tail insert: O(n) — must traverse from head to find the tail.\n• Search by value: O(n) — linear traversal.",
                },
            },
        },
        {
            "id": "ll-fill-1",
            "type": "fill-code",
            "category": "complexity",
            "difficultyRating": 1450,
            "code": LL_INSERT_FILL_CODE,
            "language": "python",
            "correctAnswer": ["None", "None", "new_node"],
            "points": 5,
            "translations": {
                "zh-TW": {
                    "title": "請填入下方 Node 類別與 insert_at_head 方法中 (a)(b)(c) 處缺失的程式碼，使其正確實作「在 LinkedList 頭部插入節點」的功能。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) self.next = None：新建節點時，next 初始化為 None。\n(b) self.head = None：空的 LinkedList，head 指向 None。\n(c) self.head = new_node：把 head 更新為新建立的節點。\n注意順序：必須先讓 new_node.next = self.head，再更新 self.head = new_node。",
                },
                "en": {
                    "title": "Fill in the missing code at (a)(b)(c) in the Node class and insert_at_head method to correctly implement 'insert a node at the head of the LinkedList'.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) self.next = None: initialize next to None when creating a new node.\n(b) self.head = None: an empty LinkedList has head pointing to None.\n(c) self.head = new_node: update head to the newly created node.\nOrder matters: first set new_node.next = self.head, then update self.head = new_node.",
                },
            },
        },
        {
            "id": "ll-pred-1",
            "type": "predict-line",
            "category": "complexity",
            "difficultyRating": 1500,
            "code": LL_PREDICT_CODE,
            "language": "python",
            "correctAnswer": "10 11 12 13 14 16 17 13 14 15",
            "points": 5,
            "translations": {
                "zh-TW": {
                    "title": "請閱讀下方程式碼。假設 LinkedList 已建立節點串列 [5, 10]（head 指向值 5 的節點，5.next = 10，10.next = None），執行 search(10)（搜尋串列尾端的元素）。\n\n請依序填寫 search() 方法執行時，經過的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "執行 search(10) 在串列 [5→10] 上：\n1. 進入 search 方法 (L10)\n2. current = head（節點 5）(L11)\n3. index = 0 (L12)\n【第 1 次迴圈 - 節點 5】\n4. while current → True (L13)\n5. 判斷 5 == 10？False (L14)\n6. current = current.next（移到節點 10）(L16)\n7. index = 1 (L17)\n【第 2 次迴圈 - 節點 10】\n8. while current → True (L13)\n9. 判斷 10 == 10？True (L14)\n10. return 1 (L15)",
                },
                "en": {
                    "title": "Read the code below. Assume a LinkedList [5, 10] exists (head points to node 5, 5.next = 10, 10.next = None), then search(10) is called.\n\nWrite the sequence of line numbers executed by search() (space-separated).",
                    "options": [],
                    "explanation": "Executing search(10) on [5→10]:\n1. Enter search (L10)\n2. current = head (node 5) (L11)\n3. index = 0 (L12)\n[Round 1 - node 5]\n4. while current → True (L13)\n5. 5 == 10? False (L14)\n6. current = current.next (move to node 10) (L16)\n7. index = 1 (L17)\n[Round 2 - node 10]\n8. while current → True (L13)\n9. 10 == 10? True (L14)\n10. return 1 (L15)",
                },
            },
        },
    ],
}

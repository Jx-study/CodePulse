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

LL_REVERSE_FILL_CODE = """\
def reverse(head):
    prev = (a)
    current = head
    while current is not None:
        next_node = (b)        # 暫存下一個節點，避免斷鏈
        current.next = (c)     # 反轉目前節點的指標方向
        prev = current
        current = (d)
    return prev"""

LL_MIDDLE_PREDICT_CODE = """\
def middle_value(head):                  # L1
    slow = head                          # L2
    fast = head                          # L3
    while fast is not None and fast.next is not None:  # L4
        slow = slow.next                 # L5
        fast = fast.next.next            # L6
    return slow.value                    # L7"""

DATA = {
    "slug": "linked-list",
    "groups": [
        {
            "id": "group-ll-playlist",
            "visual_type": "image",
            "visual_data": {
                "url": "https://res.cloudinary.com/dpte4xere/image/upload/v1778994992/linked-list01_wi7kbk.png"
            },
            "translations": {
                "zh-TW": {
                    "title": "題組：音樂播放清單",
                    "description": "某音樂 App 使用 Singly Linked List 實作播放清單功能，新增歌曲到尾端、播放並移除頭部歌曲、以及依名稱移除指定歌曲。請參考下方程式碼回答問題。",
                    "visual_alt": "單向鏈結串列結構示意圖：head → Node(A) → Node(B) → Node(C) → None",
                },
                "en": {
                    "title": "Group: Music Playlist",
                    "description": "A music app uses a Singly Linked List to implement playlist functionality: adding songs to the end, playing and removing the head song, and removing a specific song by name. Refer to the code below to answer the questions.",
                    "visual_alt": "Singly linked list: head → Node(A) → Node(B) → Node(C) → None",
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
            # baseRating = 800 + 0(TF) + 50(L1 節點記憶體定義) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "true",
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
            # baseRating = 800 + 50(SC) + 50(L1 節點組成定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "B",
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
            # baseRating = 800 + 50(SC) + 50(L1 尾節點定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "B",
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
            # baseRating = 800 + 0(TF) + 50(L1 頭部插入複雜度) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "在 Singly Linked List 的頭部插入元素（insert_at_head），其時間複雜度為 O(1)。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。頭部插入只需要調整新節點與 head 之間的指標關係，不需要從頭走訪整條串列，因此屬於常數時間操作。",
                },
                "en": {
                    "title": "In a Singly Linked List, insert_at_head has O(1) time complexity.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Correct. Head insertion only adjusts the pointer relationship between the new node and head. It does not traverse the list, so it is a constant-time operation.",
                },
            },
        },
        {
            "id": "ll-q3",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(頭插順序新手誤區) = 1200
            "baseRating": 1200,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "對一個空的 LinkedList 依序執行：insert_at_head(10)、insert_at_head(20)、insert_at_head(30)。操作完成後，head.value 的值是多少？",
                    "options": [
                        {"id": "A", "text": "10"},
                        {"id": "B", "text": "20"},
                        {"id": "C", "text": "30"},
                        {"id": "D", "text": "無法確定"},
                    ],
                    "explanation": "insert_at_head 的核心規則是：最新插入的節點會成為新的 head。連續執行多次時，最後一次插入的值會出現在串列最前面。",
                },
                "en": {
                    "title": "On an empty LinkedList, execute: insert_at_head(10), insert_at_head(20), insert_at_head(30). What is head.value?",
                    "options": [
                        {"id": "A", "text": "10"},
                        {"id": "B", "text": "20"},
                        {"id": "C", "text": "30"},
                        {"id": "D", "text": "Cannot be determined"},
                    ],
                    "explanation": "The key rule of insert_at_head is that the newest node becomes the new head. After several head insertions, the last inserted value appears at the front.",
                },
            },
        },
        # 【Application】 1000-1250
        {
            "id": "ll-q4",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 尾部插入流程) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在沒有 tail 指標的 Singly Linked List 中，執行 insert_at_tail（在尾部插入元素）需要做什麼？",
                    "options": [
                        {"id": "A", "text": "直接更新 head 指標，時間複雜度 O(1)"},
                        {"id": "B", "text": "從 head 開始遍歷，找到最後一個 next 為 None 的節點，再連接新節點，時間複雜度 O(n)"},
                        {"id": "C", "text": "只要維護節點數量，就能用 O(1) 找到尾端位置"},
                        {"id": "D", "text": "可根據第 n 個節點的指標位移直接跳到尾端，O(1)"},
                    ],
                    "explanation": "沒有 tail 指標時，無法直接存取尾節點。必須從 head 開始，逐一走訪每個節點，直到找到 next == None 的節點，才能在其後連接新節點，時間複雜度 O(n)。",
                },
                "en": {
                    "title": "Without a tail pointer in a Singly Linked List, what is required to insert at the tail?",
                    "options": [
                        {"id": "A", "text": "Directly update the head pointer — O(1)"},
                        {"id": "B", "text": "Traverse from head to find the last node (next == None), then attach the new node — O(n)"},
                        {"id": "C", "text": "If the node count is maintained, the tail position can be found in O(1)"},
                        {"id": "D", "text": "Jump directly to the tail by pointer offset from the n-th node — O(1)"},
                    ],
                    "explanation": "Without a tail pointer, the tail node cannot be accessed directly. You must traverse from head until finding the node where next == None, then attach the new node — O(n).",
                },
            },
        },
        {
            "id": "ll-group-1",
            "groupId": "group-ll-playlist",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 尾端新增複雜度) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "C",
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
            # baseRating = 800 + 50(SC) + 50(L1 搜尋複雜度) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "C",
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
            # baseRating = 800 + 100(MC) + 100(L2 陣列串列多重比較) + 100(隨機存取新手誤區) = 1100
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt3"],
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
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(佇列式移除新手誤區) = 1200
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對空的 Playlist 依序執行：add_to_end('A')、add_to_end('B')、add_to_end('C')、play_and_remove()、play_and_remove()。第二次 play_and_remove() 的回傳值是什麼？",
                    "options": [
                        {"id": "A", "text": "'A'"},
                        {"id": "B", "text": "'B'"},
                        {"id": "C", "text": "'C'"},
                        {"id": "D", "text": "'No songs'"},
                    ],
                    "explanation": "play_and_remove 會回傳目前 head 的歌曲，並把 head 往下一個節點移動。因為 add_to_end 保持加入順序，連續播放時會依 FIFO 順序取出歌曲。",
                },
                "en": {
                    "title": "On an empty Playlist, execute: add_to_end('A'), add_to_end('B'), add_to_end('C'), play_and_remove(), play_and_remove(). What does the second play_and_remove() return?",
                    "options": [
                        {"id": "A", "text": "'A'"},
                        {"id": "B", "text": "'B'"},
                        {"id": "C", "text": "'C'"},
                        {"id": "D", "text": "'No songs'"},
                    ],
                    "explanation": "play_and_remove returns the current head song, then advances head to the next node. Because add_to_end preserves insertion order, repeated plays remove songs in FIFO order.",
                },
            },
        },
        {
            "id": "ll-q6",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 已知 prev 刪除複雜度) + 100(搜尋與刪除混淆新手誤區) = 1000
            "baseRating": 1000,
            "correctAnswer": "A",
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
            # baseRating = 800 + 50(SC) + 100(L2 陣列串列多重比較) + 0(直觀) = 950
            "baseRating": 950,
            "correctAnswer": "B",
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
            # baseRating = 800 + 50(SC) + 50(L1 尾部刪除複雜度) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在沒有 tail 指標的 Singly Linked List 中，delete_at_tail（刪除尾節點）的時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(1)，因為只需把最後一個節點的 next 設為 None"},
                    ],
                    "explanation": "刪除尾節點需要找到「倒數第二個節點（prev）」才能執行 prev.next = None。沒有 tail 指標時，必須從 head 開始遍歷，時間複雜度 O(n)。",
                },
                "en": {
                    "title": "Without a tail pointer in a Singly Linked List, what is the time complexity of delete_at_tail?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(1), because only the last node's next pointer must be set to None"},
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
            # baseRating = 800 + 150(FC) + 250(L3 多步狀態) + 100(尾端連接新手誤區) = 1300
            "baseRating": 1300,
            "code": PLAYLIST_FILL_CODE,
            "language": "python",
            "correctAnswer": ["None", "current.next", "new_node"],
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
            # baseRating = 800 + 100(MC) + 100(L2 多重特性比較) + 100(尾刪常見新手誤區) = 1100
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt3", "opt4"],
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
            # baseRating = 800 + 50(SC) + 600(L5 系統級複雜度分析) + 250(複合陷阱) = 1700
            "baseRating": 1700,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "以下哪項對 Singly Linked List（無 tail 指標）各操作的時間複雜度分析完全正確？",
                    "options": [
                        {"id": "A", "text": "頭部插入 O(1)、尾部插入 O(n)、尾部刪除 O(n)、按值搜尋 O(n)"},
                        {"id": "B", "text": "頭部插入 O(1)、維護節點數後尾部插入 O(1)、尾部刪除 O(n)、按值搜尋 O(n)"},
                        {"id": "C", "text": "頭部插入 O(1)、若有 tail 指標則尾部插入 O(1)、尾部刪除也必為 O(1)、按值搜尋 O(n)"},
                        {"id": "D", "text": "頭部插入 O(1)、已知 prev 時刪除 O(1)、按值刪除 O(1)、按值搜尋 O(n)"},
                    ],
                    "explanation": "無 tail 指標時，能否直接抵達目標節點是判斷關鍵。頭部操作可直接改 head；尾部插入與尾部刪除都需要先定位尾端或尾端前一個節點；按值搜尋也必須沿著 next 線性檢查。",
                },
                "en": {
                    "title": "Which time complexity analysis for Singly Linked List (no tail pointer) operations is completely correct?",
                    "options": [
                        {"id": "A", "text": "Head insert O(1), tail insert O(n), tail deletion O(n), search by value O(n)"},
                        {"id": "B", "text": "Head insert O(1), tail insert O(1) if node count is stored, tail deletion O(n), search by value O(n)"},
                        {"id": "C", "text": "Head insert O(1), tail insert O(1) with a tail pointer, tail deletion must also be O(1), search by value O(n)"},
                        {"id": "D", "text": "Head insert O(1), deletion with known prev O(1), deletion by value O(1), search by value O(n)"},
                    ],
                    "explanation": "Without a tail pointer, the key question is whether the target node can be reached directly. Head operations can update head immediately; tail insertion and tail deletion still need traversal to locate the tail or the node before it; search by value also follows next pointers linearly.",
                },
            },
        },
        {
            "id": "ll-fill-1",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 250(L3 多步狀態) + 100(指標順序新手誤區) = 1300
            "baseRating": 1300,
            "code": LL_INSERT_FILL_CODE,
            "language": "python",
            "correctAnswer": ["None", "None", "new_node"],
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
            # baseRating = 800 + 150(PL) + 250(L3 多步狀態) + 150(搜尋尾端邊界) = 1350
            "baseRating": 1350,
            "code": LL_PREDICT_CODE,
            "language": "python",
            "correctAnswer": "10 11 12 13 14 16 17 13 14 15",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀下方程式碼。假設 LinkedList 已建立節點串列 [5, 10]（head 指向值 5 的節點，5.next = 10，10.next = None），執行 search(10)（搜尋串列尾端的元素）。\n\n請依序填寫 search() 方法執行時，經過的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "search 會從 head 開始，讓 current 逐一沿著 next 往後走，並同步累加 index。每一輪先比較目前節點值；只有找到目標值時才回傳目前 index，否則繼續前進。",
                },
                "en": {
                    "title": "Read the code below. Assume a LinkedList [5, 10] exists (head points to node 5, 5.next = 10, 10.next = None), then search(10) is called.\n\nWrite the sequence of line numbers executed by search() (space-separated).",
                    "options": [],
                    "explanation": "search starts from head, moves current along next one node at a time, and increments index along the way. Each loop compares the current node's value; it returns the current index only when the target is found.",
                },
            },
        },
        {
            "id": "ll-q19",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 記憶體開銷定義) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "Linked List 的每個節點通常需要額外空間儲存 next 指標，因此不一定比 Array 更省記憶體。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。Linked List 可以動態配置節點，但每個節點除了資料本身，還需要額外儲存指向下一節點的 next 指標；Array 則不需要為每個元素額外保存指標。",
                },
                "en": {
                    "title": "Each Linked List node usually stores an extra next pointer, so a Linked List is not always more memory-efficient than an Array.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Correct. A Linked List can allocate nodes dynamically, but each node stores both data and an extra next pointer. Arrays do not need a per-element pointer field.",
                },
            },
        },
        {
            "id": "ll-q20",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 陣列串列多重比較) + 100(索引存取新手誤區) = 1050
            "baseRating": 1050,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "若要讀取第 k 個元素，Array 與 Singly Linked List 的主要差異是什麼？",
                    "options": [
                        {"id": "A", "text": "兩者都可用索引直接 O(1) 讀取"},
                        {"id": "B", "text": "Linked List 可直接跳到第 k 個節點，Array 必須從頭掃描"},
                        {"id": "C", "text": "Array 可用索引 O(1) 存取；Linked List 通常需從 head 走 k 步"},
                        {"id": "D", "text": "兩者都必須使用二元搜尋才能找到第 k 個元素"},
                    ],
                    "explanation": "Array 的元素位於連續記憶體，可透過索引計算位址，因此讀取第 k 個元素是 O(1)。Singly Linked List 沒有索引捷徑，通常必須從 head 沿著 next 走到目標節點。",
                },
                "en": {
                    "title": "What is the main difference between an Array and a Singly Linked List when reading the k-th element?",
                    "options": [
                        {"id": "A", "text": "Both can access it directly by index in O(1)"},
                        {"id": "B", "text": "A Linked List can jump directly to the k-th node, while an Array must scan from the start"},
                        {"id": "C", "text": "An Array can access by index in O(1); a Linked List usually walks k steps from head"},
                        {"id": "D", "text": "Both require binary search to find the k-th element"},
                    ],
                    "explanation": "Arrays store elements contiguously, so an index can compute the address in O(1). A Singly Linked List has no index shortcut and usually follows next pointers from head to the target node.",
                },
            },
        },
        {
            "id": "ll-q21",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(單節點刪除新手誤區) = 1200
            "baseRating": 1200,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "若 LinkedList 只有一個節點 X，執行 delete_at_head() 後，head 應該指向哪裡？",
                    "options": [
                        {"id": "A", "text": "仍然指向 X"},
                        {"id": "B", "text": "指向 X.next.next"},
                        {"id": "C", "text": "指向新的空節點"},
                        {"id": "D", "text": "None"},
                    ],
                    "explanation": "刪除頭節點通常做 head = head.next。當串列只有 X 時，X.next 是 None，因此刪除後 head 應指向 None，表示串列變空。",
                },
                "en": {
                    "title": "If a LinkedList has only one node X, where should head point after delete_at_head()?",
                    "options": [
                        {"id": "A", "text": "Still to X"},
                        {"id": "B", "text": "To X.next.next"},
                        {"id": "C", "text": "To a new empty node"},
                        {"id": "D", "text": "None"},
                    ],
                    "explanation": "Head deletion usually does head = head.next. With only node X, X.next is None, so head should become None to represent an empty list.",
                },
            },
        },
        {
            "id": "ll-q22",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 指標連動推演) + 150(斷鏈邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "反轉 Singly Linked List 時，為什麼通常要先暫存 next_node = current.next，再改 current.next = prev？",
                    "options": [
                        {"id": "A", "text": "為了先找出反轉後的新 head"},
                        {"id": "B", "text": "避免改掉 current.next 後，失去原本後續節點的入口"},
                        {"id": "C", "text": "只要交換 prev 與 current 變數，就能完成反轉，不需額外暫存"},
                        {"id": "D", "text": "只要把所有節點的 value 逆序排列，就等同反轉指標"},
                    ],
                    "explanation": "反轉時一旦執行 current.next = prev，原本通往下一個節點的連線就會被覆蓋。因此必須先把 current.next 存到 next_node，才能在反轉後繼續往後走。",
                },
                "en": {
                    "title": "When reversing a Singly Linked List, why do we usually save next_node = current.next before setting current.next = prev?",
                    "options": [
                        {"id": "A", "text": "To find the new head of the reversed list first"},
                        {"id": "B", "text": "To avoid losing the original path to the remaining nodes after overwriting current.next"},
                        {"id": "C", "text": "Swapping prev and current variables is enough to reverse the list without saving anything"},
                        {"id": "D", "text": "Reordering all node values in reverse is equivalent to reversing pointers"},
                    ],
                    "explanation": "Once current.next = prev runs, the original link to the next node is overwritten. Saving current.next first lets the algorithm keep traversing after reversing the current link.",
                },
            },
        },
        {
            "id": "ll-q23",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(空串列邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "實作 delete_at_head() 時，哪個檢查最能避免空串列造成的 None 屬性存取錯誤？",
                    "options": [
                        {"id": "A", "text": "先檢查 if self.head is None，再存取 self.head.next"},
                        {"id": "B", "text": "先執行 self.head = self.head.next，再檢查是否為 None"},
                        {"id": "C", "text": "只要把尾節點指向 None 即可"},
                        {"id": "D", "text": "先把所有節點值複製到 Array"},
                    ],
                    "explanation": "空串列時 self.head 是 None，若直接讀取 self.head.next 會發生錯誤。刪除前應先判斷 head 是否存在，再更新 head。",
                },
                "en": {
                    "title": "When implementing delete_at_head(), which check best prevents a None attribute access on an empty list?",
                    "options": [
                        {"id": "A", "text": "Check if self.head is None before accessing self.head.next"},
                        {"id": "B", "text": "Run self.head = self.head.next first, then check for None"},
                        {"id": "C", "text": "Only set the tail node to None"},
                        {"id": "D", "text": "Copy all node values into an Array first"},
                    ],
                    "explanation": "When the list is empty, self.head is None. Accessing self.head.next immediately would fail, so the head existence check must come first.",
                },
            },
        },
        {
            "id": "ll-q24",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 指標連動推演) + 250(複合陷阱) = 1500
            "baseRating": 1500,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "串列 A → B → C → None 中，若 prev 指向 A、current 指向 B，刪除 current 的正確指標更新與結果為何？",
                    "options": [
                        {"id": "A", "text": "current.next = prev，結果 A → B → A"},
                        {"id": "B", "text": "prev = current.next，結果 head 直接變成 C"},
                        {"id": "C", "text": "prev.next = current.next，結果 A → C → None"},
                        {"id": "D", "text": "current = None 即可，結果 A 會自動指向 C"},
                    ],
                    "explanation": "刪除中間節點 B 時，必須讓前一個節點 A 的 next 跳過 B，改指向 C，也就是 prev.next = current.next。單純把 current 設為 None 不會改變 A.next。",
                },
                "en": {
                    "title": "In A → B → C → None, if prev points to A and current points to B, which pointer update correctly deletes current?",
                    "options": [
                        {"id": "A", "text": "current.next = prev, resulting in A → B → A"},
                        {"id": "B", "text": "prev = current.next, making head become C directly"},
                        {"id": "C", "text": "prev.next = current.next, resulting in A → C → None"},
                        {"id": "D", "text": "current = None is enough; A will automatically point to C"},
                    ],
                    "explanation": "To delete middle node B, A.next must skip B and point to C: prev.next = current.next. Setting current to None alone does not change A.next.",
                },
            },
        },
        {
            "id": "ll-q25",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 400(L4 指標連動推演) + 150(斷鏈邊界) = 1500
            "baseRating": 1500,
            "code": LL_REVERSE_FILL_CODE,
            "language": "python",
            "correctAnswer": ["None", "current.next", "prev", "next_node"],
            "translations": {
                "zh-TW": {
                    "title": "請填入 reverse(head) 中 (a)(b)(c)(d) 的程式碼，使其正確反轉 Singly Linked List。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}, {"id": "d", "text": ""}],
                    "explanation": "(a) prev 初始為 None；(b) 先暫存 current.next；(c) 讓目前節點指回 prev 完成反轉；(d) 再移動到剛剛暫存的 next_node。順序錯誤會讓後續節點遺失。",
                },
                "en": {
                    "title": "Fill in (a)(b)(c)(d) in reverse(head) so it correctly reverses a Singly Linked List.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}, {"id": "d", "text": ""}],
                    "explanation": "(a) prev starts as None; (b) save current.next first; (c) point the current node back to prev; (d) move to the saved next_node. If the order is wrong, the remaining nodes can be lost.",
                },
            },
        },
        {
            "id": "ll-q26",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 400(L4 快慢指標追蹤) + 100(迴圈條件新手誤區) = 1450
            "baseRating": 1450,
            "code": LL_MIDDLE_PREDICT_CODE,
            "language": "python",
            "correctAnswer": "1 2 3 4 5 6 4 7",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀下方程式碼。假設 head 指向串列 [1, 2, 3]，執行 middle_value(head)。請依序填寫經過的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "快慢指標的核心是：slow 每輪前進一個節點，fast 每輪前進兩個節點。當 fast 無法再前進兩步時，slow 所在位置就是中點；作答時要特別注意 while 條件也會被再次檢查。",
                },
                "en": {
                    "title": "Read the code below. Assume head points to [1, 2, 3], then middle_value(head) is called. Write the executed line-number sequence (space-separated).",
                    "options": [],
                    "explanation": "The fast/slow pointer idea is that slow advances one node per loop while fast advances two. When fast can no longer move two steps, slow is at the middle; remember that the while condition itself is checked again before returning.",
                },
            },
        },
        {
            "id": "ll-q27",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 快慢指標邊界分析) + 150(偶數長度邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "使用 slow 每次走 1 步、fast 每次走 2 步，且條件為 while fast and fast.next。對串列 [1, 2, 3, 4]，迴圈結束時 slow 會停在哪個值？",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "4"},
                    ],
                    "explanation": "使用 `while fast and fast.next` 時，fast 能完成成對前進才會進入下一輪。偶數長度串列會讓 slow 停在偏右的中點，因為最後一輪仍會把 slow 往後推進一次。",
                },
                "en": {
                    "title": "Using slow moves 1 step, fast moves 2 steps, and while fast and fast.next. For [1, 2, 3, 4], where does slow stop?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "4"},
                    ],
                    "explanation": "With `while fast and fast.next`, the loop continues only when fast can complete a paired move. On an even-length list, slow stops at the right-middle node because the final valid loop still advances slow once.",
                },
            },
        },
        {
            "id": "ll-q28",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 合併控制流分析) + 150(剩餘節點邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "合併兩條已排序 Singly Linked List 時，主迴圈結束後若其中一條串列還有剩餘節點，通常應該怎麼處理？",
                    "options": [
                        {"id": "A", "text": "把目前尾節點的 next 直接接到剩餘串列的頭"},
                        {"id": "B", "text": "逐一複製剩餘節點的值到 Array"},
                        {"id": "C", "text": "丟棄剩餘節點，因為它們一定比較大"},
                        {"id": "D", "text": "把剩餘串列反轉後再接回去"},
                    ],
                    "explanation": "兩條串列都已排序時，當一邊先耗盡，另一邊剩下的節點本身仍保持排序。只需把合併串列的尾端接到剩餘串列即可，不必搬移節點資料。",
                },
                "en": {
                    "title": "When merging two sorted Singly Linked Lists, what should usually happen if one list still has remaining nodes after the main loop?",
                    "options": [
                        {"id": "A", "text": "Attach the current tail's next directly to the head of the remaining list"},
                        {"id": "B", "text": "Copy each remaining value into an Array"},
                        {"id": "C", "text": "Discard the remaining nodes because they must be larger"},
                        {"id": "D", "text": "Reverse the remaining list before attaching it"},
                    ],
                    "explanation": "Because both lists are already sorted, when one side is exhausted the other side's remaining nodes are still in sorted order. The merged tail can point directly to that remainder.",
                },
            },
        },
        {
            "id": "ll-q29",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 多指標重組) + 250(複合陷阱) = 1500
            "baseRating": 1500,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "將串列 [1, 2, 3, 4, 5] 依節點位置重組成「奇數位置節點在前、偶數位置節點在後」且保持相對順序，結果應為何？",
                    "options": [
                        {"id": "A", "text": "1 → 3 → 5 → 4 → 2"},
                        {"id": "B", "text": "5 → 3 → 1 → 2 → 4"},
                        {"id": "C", "text": "1 → 2 → 3 → 4 → 5"},
                        {"id": "D", "text": "1 → 3 → 5 → 2 → 4"},
                    ],
                    "explanation": "這裡的奇偶指的是節點位置，不是節點值。奇數位置為 1、3、5，偶數位置為 2、4；保持各自相對順序後串接，得到 1 → 3 → 5 → 2 → 4。",
                },
                "en": {
                    "title": "Reorder [1, 2, 3, 4, 5] so odd-position nodes come before even-position nodes while preserving relative order. What is the result?",
                    "options": [
                        {"id": "A", "text": "1 → 3 → 5 → 4 → 2"},
                        {"id": "B", "text": "5 → 3 → 1 → 2 → 4"},
                        {"id": "C", "text": "1 → 2 → 3 → 4 → 5"},
                        {"id": "D", "text": "1 → 3 → 5 → 2 → 4"},
                    ],
                    "explanation": "Odd/even here means node position, not node value. Odd positions are 1, 3, 5 and even positions are 2, 4. Preserving each group's relative order gives 1 → 3 → 5 → 2 → 4.",
                },
            },
        },
        {
            "id": "ll-q30",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 400(L4 終止條件邊界分析) + 250(複合陷阱) = 1450
            "baseRating": 1450,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "若 Singly Linked List 的尾節點 next 不小心指回前面的節點，依賴 current is None 結束的遍歷可能永遠不會停止。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。一般 Singly Linked List 依靠尾節點 next = None 作為終止訊號。若指標形成環，current 會一直沿著環移動而無法遇到 None，因此需要額外的 cycle detection 才能防止無限迴圈。",
                },
                "en": {
                    "title": "If a Singly Linked List tail's next accidentally points back to an earlier node, traversal that relies on current is None may never stop.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Correct. A normal Singly Linked List uses tail.next = None as its stopping signal. If pointers form a cycle, current keeps moving around the cycle and never reaches None unless cycle detection is used.",
                },
            },
        },
    ],
}

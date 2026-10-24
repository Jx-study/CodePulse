CIRCULAR_QUEUE_CODE = """\
class CircularQueue:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.queue = [None] * capacity
        self.front = 0
        self.rear = 0
        self.size = 0

    def enqueue(self, value):
        if self.size == self.capacity:
            raise Exception("Queue Overflow")

        self.queue[self.rear] = value
        self.rear = (self.rear + 1) % self.capacity
        self.size += 1

    def dequeue(self):
        if self.size == 0:
            raise Exception("Queue Underflow")

        value = self.queue[self.front]
        self.front = (self.front + 1) % self.capacity
        self.size -= 1
        return value

    def peek(self):
        if self.size == 0:
            return None
        return self.queue[self.front]"""

CIRCULAR_QUEUE_FILL_CODE = """\
class CircularQueue:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.queue = [None] * capacity
        self.front = (a)
        self.rear = 0
        self.size = 0

    def enqueue(self, value):
        if self.size == self.capacity:
            raise Exception("Queue Overflow")

        self.queue[self.rear] = value
        self.rear = (self.rear + 1) % self.capacity
        self.size += 1

    def dequeue(self):
        if self.size == 0:
            raise Exception("Queue Underflow")

        value = self.queue[self.front]
        self.front = (self.front + 1) % (b)
        self.size -= 1
        return value

    def peek(self):
        if self.size == (c):
            return None
        return self.queue[self.front]"""

PRINT_BUFFER_CODE = """\
class PrintBuffer:
    def __init__(self, size):
        self.capacity = size
        self.queue = []

    def add_job(self, document):
        if len(self.queue) >= self.capacity:
            return "Buffer Full"
        self.queue.append(document)
        return "Added"

    def process_job(self):
        if not self.queue:
            return "No Jobs"
        return self.queue.pop(0)  # List pop(0) acts as dequeue"""

DATA = {
    "slug": "queue",
    "groups": [
        {
            "id": "queue-group-1",
            "translations": {
                "zh-TW": {
                    "title": "題組：印表機緩衝區管理",
                    "description": "某辦公室使用一個容量為 3 的印表機緩衝區 (Print Buffer) 來管理列印工作。該緩衝區使用 Queue 資料結構實作，採 FIFO 原則。請參考下方實作程式碼回答下列問題。",
                },
                "en": {
                    "title": "Group: Printer Buffer Management",
                    "description": "An office uses a print buffer with capacity 3 to manage print jobs. The buffer uses a Queue data structure following the FIFO principle. Refer to the implementation code below to answer the questions.",
                },
            },
            "code": PRINT_BUFFER_CODE,
            "language": "python",
        }
    ],
    "questions": [
        # 【Basic】 800-950
        {
            "id": "queue-q1",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 定義辨識) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "Queue 是一種 LIFO (Last-In, First-Out) 的資料結構。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "Queue 是 FIFO (First-In, First-Out)，Stack 才是 LIFO。",
                },
                "en": {
                    "title": "A Queue is a LIFO (Last-In, First-Out) data structure.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "A Queue is FIFO (First-In, First-Out). It is the Stack that is LIFO.",
                },
            },
        },
        {
            "id": "queue-q2",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 FIFO 定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "在佇列 (Queue) 資料結構中，最先進入的元素會如何被處理？",
                    "options": [
                        {"id": "A", "text": "最先被取出"},
                        {"id": "B", "text": "最後被取出"},
                        {"id": "C", "text": "隨機被取出"},
                        {"id": "D", "text": "永遠留在佇列中"},
                    ],
                    "explanation": "沒錯！這就是 FIFO (First-In, First-Out) 原則，就像排隊買票一樣，先排隊的人會先被服務。",
                },
                "en": {
                    "title": "In a Queue data structure, how is the first element that entered processed?",
                    "options": [
                        {"id": "A", "text": "It is removed first"},
                        {"id": "B", "text": "It is removed last"},
                        {"id": "C", "text": "It is removed randomly"},
                        {"id": "D", "text": "It stays in the queue forever"},
                    ],
                    "explanation": "This is the FIFO (First-In, First-Out) principle — like a ticket queue, the first person in line is served first.",
                },
            },
        },
        {
            "id": "queue-q3",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 操作定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "Queue 的 enqueue 操作是在哪裡加入新元素？",
                    "options": [
                        {"id": "A", "text": "前端 (Front)"},
                        {"id": "B", "text": "後端 (Rear/Back)"},
                        {"id": "C", "text": "中間位置"},
                        {"id": "D", "text": "任意位置"},
                    ],
                    "explanation": "enqueue 操作總是在佇列的後端 (Rear) 加入新元素，這就像新來的人必須排在隊伍的最後面。",
                },
                "en": {
                    "title": "Where does the enqueue operation add a new element in a Queue?",
                    "options": [
                        {"id": "A", "text": "At the front"},
                        {"id": "B", "text": "At the rear (back)"},
                        {"id": "C", "text": "In the middle"},
                        {"id": "D", "text": "At any position"},
                    ],
                    "explanation": "enqueue always adds the new element at the rear of the Queue — like a newcomer going to the back of the line.",
                },
            },
        },
        {
            "id": "queue-q4",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 操作定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "Queue 的 dequeue 操作會執行什麼動作？",
                    "options": [
                        {"id": "A", "text": "從後端移除並返回元素"},
                        {"id": "B", "text": "從前端移除並返回元素"},
                        {"id": "C", "text": "查看前端元素但不移除"},
                        {"id": "D", "text": "清空整個佇列"},
                    ],
                    "explanation": "dequeue 操作會從佇列的前端 (Front) 移除並返回元素，就像排在最前面的人會先離開隊伍去被服務。",
                },
                "en": {
                    "title": "What does the dequeue operation do on a Queue?",
                    "options": [
                        {"id": "A", "text": "Removes and returns the element from the rear"},
                        {"id": "B", "text": "Removes and returns the element from the front"},
                        {"id": "C", "text": "Views the front element without removing it"},
                        {"id": "D", "text": "Clears the entire Queue"},
                    ],
                    "explanation": "dequeue removes and returns the element from the front — like the person at the head of the line leaving to be served.",
                },
            },
        },
        {
            "id": "queue-q5",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 名詞辨識) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "以下哪個操作可以查看 Queue 前端的元素但不移除它？",
                    "options": [
                        {"id": "A", "text": "enqueue"},
                        {"id": "B", "text": "dequeue"},
                        {"id": "C", "text": "front / peek"},
                        {"id": "D", "text": "isEmpty"},
                    ],
                    "explanation": "front (或稱為 peek) 操作允許我們查看佇列前端的元素而不移除它，這在需要檢查下一個要處理的元素時非常有用。",
                },
                "en": {
                    "title": "Which operation lets you view the front element of a Queue without removing it?",
                    "options": [
                        {"id": "A", "text": "enqueue"},
                        {"id": "B", "text": "dequeue"},
                        {"id": "C", "text": "front / peek"},
                        {"id": "D", "text": "isEmpty"},
                    ],
                    "explanation": "front (or peek) lets you inspect the front element without removing it — useful when you need to check what will be processed next.",
                },
            },
        },
        # 【Application】 1000-1200
        {
            "id": "queue-q6",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(新手誤區) = 1200
            "baseRating": 1200,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "對一個空的 Queue 依序執行以下操作：enqueue(1), enqueue(2), dequeue(), enqueue(3), dequeue()。最後佇列中剩下什麼元素？",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "空的"},
                    ],
                    "explanation": "Queue 遵循 FIFO：最早進入的元素會最早被移除。解這類題目時，可用紙筆記錄每次 enqueue 從後端加入、每次 dequeue 從前端移除，最後保留尚未被移除的元素。",
                },
                "en": {
                    "title": "On an empty Queue, execute: enqueue(1), enqueue(2), dequeue(), enqueue(3), dequeue(). What element remains?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "Empty"},
                    ],
                    "explanation": "A Queue follows FIFO: the earliest inserted element is removed first. For this kind of question, track each enqueue at the rear and each dequeue at the front, then keep the element that has not been removed.",
                },
            },
        },
        {
            "id": "queue-q7",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 應用辨識) + 50(相似場景干擾) = 950
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "Queue 最常用於解決以下哪個問題？",
                    "options": [
                        {"id": "A", "text": "括號匹配"},
                        {"id": "B", "text": "廣度優先搜尋 (BFS)"},
                        {"id": "C", "text": "記錄 undo / redo 歷史"},
                        {"id": "D", "text": "依權重挑選最急任務"},
                    ],
                    "explanation": "Queue 的 FIFO 特性非常適合 BFS：先被發現的節點會先被處理。undo / redo 通常使用 Stack，依權重挑選任務則較接近 Priority Queue。",
                },
                "en": {
                    "title": "Which problem is a Queue most commonly used to solve?",
                    "options": [
                        {"id": "A", "text": "Bracket matching"},
                        {"id": "B", "text": "Breadth-First Search (BFS)"},
                        {"id": "C", "text": "Tracking undo / redo history"},
                        {"id": "D", "text": "Selecting the most urgent weighted task"},
                    ],
                    "explanation": "The FIFO property of a Queue is ideal for BFS: nodes discovered first are processed first. undo / redo is usually Stack-based, while choosing by weight is closer to a Priority Queue.",
                },
            },
        },
        {
            "id": "queue-q8",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 應用辨識) + 50(相似排程結構干擾) = 950
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "作業系統中，CPU 處理多個程式時通常使用什麼資料結構來管理任務排程？",
                    "options": [
                        {"id": "A", "text": "Priority Queue (優先佇列)"},
                        {"id": "B", "text": "Queue (佇列)"},
                        {"id": "C", "text": "Linked List (鏈結串列)"},
                        {"id": "D", "text": "Binary Tree (二元樹)"},
                    ],
                    "explanation": "在強調先來先服務的基本排程模型中，Queue 可管理待處理程式並維持 FIFO 公平性。若排程規則加入優先權，才會改用 Priority Queue 等變體。",
                },
                "en": {
                    "title": "In an operating system, what data structure is typically used to manage CPU task scheduling?",
                    "options": [
                        {"id": "A", "text": "Priority Queue"},
                        {"id": "B", "text": "Queue"},
                        {"id": "C", "text": "Linked List"},
                        {"id": "D", "text": "Binary Tree"},
                    ],
                    "explanation": "In a basic first-come-first-served scheduling model, a Queue manages pending tasks and preserves FIFO fairness. If the scheduler includes priority rules, a Priority Queue variant may be used instead.",
                },
            },
        },
        {
            "id": "queue-q9",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 應用辨識) + 50(相似結構干擾) = 950
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "印表機處理列印任務時，為什麼使用 Queue 而不是 Stack？",
                    "options": [
                        {"id": "A", "text": "Queue 佔用更少的記憶體"},
                        {"id": "B", "text": "Queue 可以確保先送出的文件先列印"},
                        {"id": "C", "text": "Stack 無法處理多個任務"},
                        {"id": "D", "text": "印表機硬體只支援 Queue"},
                    ],
                    "explanation": "印表機使用 Queue 是因為 FIFO 原則確保公平性：先送出列印請求的人，文件會先被列印。如果使用 Stack (LIFO)，後送出的文件反而會先印，這對其他使用者不公平。",
                },
                "en": {
                    "title": "Why does a printer use a Queue rather than a Stack to process print jobs?",
                    "options": [
                        {"id": "A", "text": "Queue uses less memory"},
                        {"id": "B", "text": "Queue ensures the first document submitted is printed first"},
                        {"id": "C", "text": "A Stack cannot handle multiple tasks"},
                        {"id": "D", "text": "Printer hardware only supports Queue"},
                    ],
                    "explanation": "Printers use a Queue because FIFO ensures fairness: the first print request submitted gets printed first. Using a Stack (LIFO) would print the most recently submitted document first — unfair to other users.",
                },
            },
        },
        {
            "id": "queue-q10",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 100(L2 多重比較) + 100(新手誤區) = 1100
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些場景適合使用 Queue (佇列)？(多選)",
                    "options": [
                        {"id": "opt1", "text": "印表機的列印任務排程"},
                        {"id": "opt2", "text": "線程池的先來先服務任務分配"},
                        {"id": "opt3", "text": "廣度優先搜尋 (BFS)"},
                        {"id": "opt4", "text": "遞迴函數的呼叫管理"},
                    ],
                    "explanation": "印表機排程、BFS、線程池先來先服務任務分配都符合 FIFO。遞迴函數呼叫管理則是典型 Stack 場景。",
                },
                "en": {
                    "title": "Which of the following scenarios are well-suited for a Queue? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Printer job scheduling"},
                        {"id": "opt2", "text": "First-come-first-served task dispatch in a thread pool"},
                        {"id": "opt3", "text": "Breadth-First Search (BFS)"},
                        {"id": "opt4", "text": "Recursive function call management"},
                    ],
                    "explanation": "Printer scheduling, BFS, and first-come-first-served thread-pool dispatch all fit FIFO behavior. Recursive function call management is a typical Stack use case.",
                },
            },
        },
        # 【Complexity】 1300-1500
        {
            "id": "queue-q11",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 0(L0 常見操作複雜度) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "Queue 的 enqueue 和 dequeue 操作的時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "Queue 的 enqueue 和 dequeue 操作都只需要在固定的位置進行（後端加入、前端移除），不需要移動其他元素，因此時間複雜度為 O(1)（常數時間）。",
                },
                "en": {
                    "title": "What are the time complexities of enqueue and dequeue on a Queue?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "Both enqueue and dequeue operate at fixed positions (add at rear, remove at front) without moving other elements, so both are O(1).",
                },
            },
        },
        {
            "id": "queue-q12",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 複雜度定義) + 50(相似複雜度干擾) = 950
            "baseRating": 950,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "如果要在 Queue 中搜尋某個特定元素，最壞情況下的時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "Queue 只保證前後端操作快，沒有排序或索引搜尋能力。因此找特定元素時，最壞情況必須逐個檢查，不能套用 O(log n) 的二分搜尋直覺。",
                },
                "en": {
                    "title": "What is the worst-case time complexity of searching for a specific element in a Queue?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "A Queue only makes front and rear operations fast; it does not provide sorted or indexed search. Finding a specific element may require checking items one by one, so the O(log n) binary-search intuition does not apply.",
                },
            },
        },
        # 【Group Questions】
        {
            "id": "queue-q13",
            "groupId": "queue-group-1",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 150(容量邊界) = 1250
            "baseRating": 1250,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若依序執行：add_job('DocA'), add_job('DocB'), add_job('DocC'), add_job('DocD')。請問最後一個操作的回傳值是什麼？",
                    "options": [
                        {"id": "A", "text": "Added"},
                        {"id": "B", "text": "Buffer Full"},
                        {"id": "C", "text": "Error"},
                        {"id": "D", "text": "DocD"},
                    ],
                    "explanation": "緩衝區容量為 3。加入 A, B, C 後佇列已滿 ([A, B, C])。第四個 DocD 加入時會觸發 'Buffer Full'。",
                },
                "en": {
                    "title": "After calling: add_job('DocA'), add_job('DocB'), add_job('DocC'), add_job('DocD') — what does the last call return?",
                    "options": [
                        {"id": "A", "text": "Added"},
                        {"id": "B", "text": "Buffer Full"},
                        {"id": "C", "text": "Error"},
                        {"id": "D", "text": "DocD"},
                    ],
                    "explanation": "Buffer capacity is 3. After adding A, B, C the buffer is full ([A, B, C]). The fourth call for DocD returns 'Buffer Full'.",
                },
            },
        },
        {
            "id": "queue-q14",
            "groupId": "queue-group-1",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 動態想像) + 50(相似文件干擾) = 1000
            "baseRating": 1000,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "承上題狀態 (Queue內容為 [DocA, DocB, DocC])，若現在執行一次 process_job()，哪一份文件會被印出？",
                    "options": [
                        {"id": "A", "text": "DocA"},
                        {"id": "B", "text": "DocB"},
                        {"id": "C", "text": "DocC"},
                        {"id": "D", "text": "No Jobs"},
                    ],
                    "explanation": "Queue 是 FIFO 結構，process_job 使用 pop(0) 移除最前端元素。DocA 是最早進入的，因此最先被移除。",
                },
                "en": {
                    "title": "Continuing from the previous state (Queue = [DocA, DocB, DocC]), which document is printed when process_job() is called?",
                    "options": [
                        {"id": "A", "text": "DocA"},
                        {"id": "B", "text": "DocB"},
                        {"id": "C", "text": "DocC"},
                        {"id": "D", "text": "No Jobs"},
                    ],
                    "explanation": "Queue is FIFO. process_job uses pop(0) to remove the frontmost element. DocA entered first, so it is removed first.",
                },
            },
        },
        {
            "id": "queue-q15",
            "groupId": "queue-group-1",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 50(L1 複雜度與工具辨識) + 0(直觀) = 1000
            "baseRating": 1000,
            "correctAnswer": ["n", "deque"],
            "translations": {
                "zh-TW": {
                    "title": "Python 的 list `pop(0)` 可以模擬 dequeue。請問 `pop(0)` 的時間複雜度是 O(___)？若要達到 O(1)，應該改用 Python `collections` 模組中的哪個資料結構？(請填入兩個答案)",
                    "options": [{"id": "1", "text": "複雜度"}, {"id": "2", "text": "資料結構"}],
                    "explanation": "1. Python list 底層是陣列，移除第一個元素需要移動剩餘所有元素，故為 O(n)。\n2. `collections.deque` (雙端佇列) 支援 O(1) 的兩端操作。",
                },
                "en": {
                    "title": "Python's list `pop(0)` can simulate dequeue. What is the time complexity of `pop(0)`? And what data structure in Python's `collections` module achieves O(1) dequeue? (Fill in two answers)",
                    "options": [{"id": "1", "text": "Complexity"}, {"id": "2", "text": "Data structure"}],
                    "explanation": "1. A Python list is backed by an array; removing the first element shifts all remaining elements, so it's O(n).\n2. `collections.deque` (double-ended queue) supports O(1) operations at both ends.",
                },
            },
        },
        {
            "id": "queue-q16",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 400(L4 指標與邊界分析) + 150(環狀邊界) = 1500
            "baseRating": 1500,
            "code": CIRCULAR_QUEUE_FILL_CODE,
            "language": "python",
            "correctAnswer": ["0", "self.capacity", "0"],
            "translations": {
                "zh-TW": {
                    "title": "請閱讀下方的 Circular Queue 實作程式碼，並填入 (a), (b), (c) 處缺失的變數或數值，使其邏輯正確。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "1. (a) 初始化 front 指標為 0。\n2. (b) 環狀佇列移動指標需取餘數 capacity (self.capacity)。\n3. (c) 判斷佇列是否為空，檢查 size 是否為 0。",
                },
                "en": {
                    "title": "Read the Circular Queue implementation below and fill in the missing values at (a), (b), (c) to make the logic correct.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "1. (a) Initialize the front pointer to 0.\n2. (b) Circular pointer movement requires modulo by capacity (self.capacity).\n3. (c) Check if the queue is empty by testing whether size equals 0.",
                },
            },
        },
        {
            "id": "queue-q17",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 250(L3 多步狀態) + 150(環狀邊界) = 1350
            "baseRating": 1350,
            "code": CIRCULAR_QUEUE_CODE,
            "language": "python",
            "correctAnswer": "17 18 21 22 23 24",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀下方的 Circular Queue 實作程式碼。假設目前 Queue 內資料為 [1, 2, 3] (Capacity=5)，且 front=0, rear=3, size=3。\n\n若執行一次 `dequeue()` 操作，請依序填寫程式執行的行號序列 (以空格分隔)。",
                    "options": [],
                    "explanation": "dequeue 的邏輯是先檢查佇列是否為空；若不是空，才讀取 front 位置的值，接著讓 front 以環狀方式前進並更新元素數量，最後回傳取出的值。填行號時請對照這些邏輯階段。",
                },
                "en": {
                    "title": "Read the Circular Queue implementation below. Assume the queue contains [1, 2, 3] (Capacity=5) with front=0, rear=3, size=3.\n\nAfter calling `dequeue()`, write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "The dequeue logic first checks whether the queue is empty. If it is not empty, it reads the value at front, advances front circularly, updates the element count, and returns the removed value. Map these logical phases back to the code lines.",
                },
            },
        },
        {
            "id": "queue-q18",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 動態想像) + 50(相似狀態干擾) = 1000
            "baseRating": 1000,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "線性陣列佇列中，若 rear 已到陣列最後，但 front 前方已有空格，這種「空間還在卻不能加入」的問題稱為什麼？",
                    "options": [
                        {"id": "A", "text": "Queue Underflow"},
                        {"id": "B", "text": "Priority Inversion"},
                        {"id": "C", "text": "假性滿溢"},
                        {"id": "D", "text": "遞迴溢位"},
                    ],
                    "explanation": "線性佇列只讓 rear 往後走，前端被 dequeue 後留下的空格無法再利用，就會出現假性滿溢。改用環狀佇列可讓 rear 繞回前方空位。",
                },
                "en": {
                    "title": "In a linear array queue, rear has reached the last index but there are free slots before front. What is this 'space exists but enqueue fails' problem called?",
                    "options": [
                        {"id": "A", "text": "Queue underflow"},
                        {"id": "B", "text": "Priority inversion"},
                        {"id": "C", "text": "False overflow"},
                        {"id": "D", "text": "Recursion overflow"},
                    ],
                    "explanation": "A linear queue only moves rear forward, so freed slots before front cannot be reused. This is false overflow. A circular queue lets rear wrap around to those slots.",
                },
            },
        },
        {
            "id": "queue-q19",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 100(L2 狀態比較) + 150(環狀邊界) = 1050
            "baseRating": 1050,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "若環狀佇列額外維護 size，就能用 size == 0 判斷空、size == capacity 判斷滿，不必只靠 front == rear。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。front == rear 在某些設計中可能同時代表空或滿；維護 size 可以明確區分兩種狀態。",
                },
                "en": {
                    "title": "If a circular queue also maintains size, it can use size == 0 for empty and size == capacity for full instead of relying only on front == rear.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. In some designs, front == rear can mean either empty or full. Keeping size distinguishes the two states clearly.",
                },
            },
        },
        {
            "id": "queue-q20",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 場景比較) + 150(容量邊界) = 1100
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在非同步資料緩衝中，生產者速度短時間大於消費者速度時，固定容量 Queue 最需要先處理哪個狀態？",
                    "options": [
                        {"id": "A", "text": "佇列搜尋失敗"},
                        {"id": "B", "text": "緩衝區滿溢或背壓處理"},
                        {"id": "C", "text": "遞迴深度過深"},
                        {"id": "D", "text": "二元樹失衡"},
                    ],
                    "explanation": "固定容量佇列在生產速度超過消費速度時會逐漸填滿，因此要先設計滿溢處理，例如拒收、等待、丟棄或背壓。",
                },
                "en": {
                    "title": "In an asynchronous data buffer, if the producer is temporarily faster than the consumer, what state must a fixed-capacity Queue handle first?",
                    "options": [
                        {"id": "A", "text": "Queue search failure"},
                        {"id": "B", "text": "Buffer overflow or backpressure"},
                        {"id": "C", "text": "Excessive recursion depth"},
                        {"id": "D", "text": "Binary tree imbalance"},
                    ],
                    "explanation": "A fixed-capacity queue fills up when producers outpace consumers, so it needs an overflow strategy such as rejecting, waiting, dropping, or applying backpressure.",
                },
            },
        },
        {
            "id": "queue-q21",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(新手誤區) = 1200
            "baseRating": 1200,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "容量為 4 的環狀佇列從空開始，依序 enqueue('A'), enqueue('B'), enqueue('C'), dequeue(), enqueue('D')。若使用 size 記錄元素數量，最後 front、rear、size 分別為何？",
                    "options": [
                        {"id": "A", "text": "front=0, rear=3, size=3"},
                        {"id": "B", "text": "front=1, rear=3, size=2"},
                        {"id": "C", "text": "front=0, rear=0, size=3"},
                        {"id": "D", "text": "front=1, rear=0, size=3"},
                    ],
                    "explanation": "環狀佇列的 rear 代表下一次寫入的位置，enqueue 後會以 modulo capacity 前進；dequeue 則移動 front 並減少 size。請分別追蹤 front、rear、size，特別注意 rear 可能繞回 0。",
                },
                "en": {
                    "title": "A circular queue with capacity 4 starts empty. Execute enqueue('A'), enqueue('B'), enqueue('C'), dequeue(), enqueue('D'). If size tracks the element count, what are front, rear, and size at the end?",
                    "options": [
                        {"id": "A", "text": "front=0, rear=3, size=3"},
                        {"id": "B", "text": "front=1, rear=3, size=2"},
                        {"id": "C", "text": "front=0, rear=0, size=3"},
                        {"id": "D", "text": "front=1, rear=0, size=3"},
                    ],
                    "explanation": "In a circular queue, rear points to the next write position and advances modulo capacity after enqueue. dequeue advances front and decreases size. Track front, rear, and size separately, especially when rear wraps to 0.",
                },
            },
        },
        {
            "id": "queue-q22",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 邊界分析) + 150(環狀邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "使用「浪費一格」的環狀佇列判斷滿：`(rear + 1) % capacity == front`。若 capacity=5、front=2、rear=1，狀態為何？",
                    "options": [
                        {"id": "A", "text": "空，因為 rear 在 front 前面"},
                        {"id": "B", "text": "滿，因為 (1 + 1) % 5 == 2"},
                        {"id": "C", "text": "只剩一個元素"},
                        {"id": "D", "text": "無法判斷，必須排序陣列"},
                    ],
                    "explanation": "在浪費一格的設計中，rear 的下一格若正好是 front，就代表再 enqueue 會覆蓋 front，因此視為 full。",
                },
                "en": {
                    "title": "A circular queue uses the one-empty-slot full check: `(rear + 1) % capacity == front`. If capacity=5, front=2, rear=1, what is the state?",
                    "options": [
                        {"id": "A", "text": "Empty, because rear is before front"},
                        {"id": "B", "text": "Full, because (1 + 1) % 5 == 2"},
                        {"id": "C", "text": "It contains only one element"},
                        {"id": "D", "text": "Impossible to know unless the array is sorted"},
                    ],
                    "explanation": "With the one-empty-slot design, the queue is full when rear's next slot is front; another enqueue would overwrite the front element.",
                },
            },
        },
        {
            "id": "queue-q23",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 400(L4 指標與邊界分析) + 150(環狀邊界) = 1500
            "baseRating": 1500,
            "code": "class OneSlotCircularQueue:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.items = [None] * capacity\n        self.front = 0\n        self.rear = 0\n\n    def is_full(self):\n        return (a)\n\n    def is_empty(self):\n        return (b)\n\n    def enqueue(self, value):\n        if self.is_full():\n            raise Exception('Queue Overflow')\n        self.items[self.rear] = value\n        self.rear = (c)",
            "language": "python",
            "correctAnswer": [
                "(self.rear + 1) % self.capacity == self.front",
                "self.front == self.rear",
                "(self.rear + 1) % self.capacity",
            ],
            "translations": {
                "zh-TW": {
                    "title": "以下是浪費一格的環狀佇列。請填入 (a), (b), (c)，讓滿、空與 rear 環狀前進邏輯正確。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) rear 下一格等於 front 表示滿；(b) front 與 rear 相等表示空；(c) rear 前進時必須對 capacity 取餘數，才能繞回陣列開頭。",
                },
                "en": {
                    "title": "This is a one-empty-slot circular queue. Fill in (a), (b), and (c) so the full, empty, and rear-advance logic is correct.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Full means rear's next slot is front. (b) Empty means front equals rear. (c) rear must advance modulo capacity so it can wrap around.",
                },
            },
        },
        {
            "id": "queue-q24",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 250(L3 多步狀態) + 250(複合陷阱) = 1450
            "baseRating": 1450,
            "code": CIRCULAR_QUEUE_CODE,
            "language": "python",
            "correctAnswer": "9 10 13 14 15",
            "translations": {
                "zh-TW": {
                    "title": "閱讀 Circular Queue 程式碼。假設 capacity=5、front=2、rear=4、size=2，且 queue[2] 與 queue[3] 有資料。呼叫 `enqueue(9)` 時，請寫出執行行號序列。",
                    "options": [],
                    "explanation": "enqueue 的邏輯可分成三段：先檢查是否已滿，接著把新值寫入目前 rear 指向的位置，最後讓 rear 以環狀方式前進並更新元素數量。請依這些階段回到程式碼找行號。",
                },
                "en": {
                    "title": "Read the Circular Queue code. Assume capacity=5, front=2, rear=4, size=2, and queue[2] and queue[3] contain data. When `enqueue(9)` is called, write the executed line sequence.",
                    "options": [],
                    "explanation": "enqueue has three logical phases: first check whether the queue is full, then write the value at the current rear position, and finally advance rear circularly while updating the element count. Map those phases back to the code lines.",
                },
            },
        },
        {
            "id": "queue-q25",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 600(L5 系統級分析) + 0(直觀) = 1450
            "baseRating": 1450,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "若任務有「緊急程度」差異，不能單純依先到先處理，最適合改用哪種資料結構？",
                    "options": [
                        {"id": "A", "text": "一般 Queue，因為 FIFO 永遠最公平"},
                        {"id": "B", "text": "Stack，因為最新任務通常最急"},
                        {"id": "C", "text": "Priority Queue，讓高優先權任務先處理"},
                        {"id": "D", "text": "Set，因為它會自動排序任務"},
                    ],
                    "explanation": "一般 Queue 只保證先進先出，不會考慮權重或緊急程度。需要依優先權插隊時，應改用 Priority Queue。",
                },
                "en": {
                    "title": "If tasks have different urgency levels and cannot simply be processed first-come-first-served, which data structure is the best replacement?",
                    "options": [
                        {"id": "A", "text": "A normal Queue, because FIFO is always fairest"},
                        {"id": "B", "text": "A Stack, because newest tasks are usually urgent"},
                        {"id": "C", "text": "A Priority Queue, so high-priority tasks are processed first"},
                        {"id": "D", "text": "A Set, because it automatically sorts tasks"},
                    ],
                    "explanation": "A normal Queue only guarantees FIFO order and ignores weights or urgency. If tasks must jump ahead by priority, use a Priority Queue.",
                },
            },
        },
        {
            "id": "queue-q26",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 400(L4 複雜控制流分析) + 250(複合陷阱) = 1450
            "baseRating": 1450,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "為了避免線性佇列的假性滿溢，每次 dequeue 後把所有元素往前搬一格，就能同時保留 O(1) dequeue 效能。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "錯。搬移所有元素雖然可回收前方空間，但每次 dequeue 會變成 O(n)。環狀佇列用指標取餘數前進，才能避免搬移。",
                },
                "en": {
                    "title": "To avoid false overflow in a linear queue, shifting all elements left after every dequeue preserves O(1) dequeue performance.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "False. Shifting reclaims front space, but each dequeue becomes O(n). A circular queue avoids shifting by advancing pointers modulo capacity.",
                },
            },
        },
        {
            "id": "queue-q27",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 邊界分析) + 150(環狀邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "環狀佇列若沒有 size、沒有 tag，也不浪費一格，只用 `front == rear` 判斷狀態，最大的問題是什麼？",
                    "options": [
                        {"id": "A", "text": "enqueue 會變成 O(n)"},
                        {"id": "B", "text": "無法分辨全空與全滿"},
                        {"id": "C", "text": "rear 永遠不能繞回 0"},
                        {"id": "D", "text": "dequeue 會刪除最後端元素"},
                    ],
                    "explanation": "在不額外記錄資訊的環狀佇列中，front == rear 可能代表沒有元素，也可能代表剛好繞回且已滿，因此必須引入 size、tag，或浪費一格。",
                },
                "en": {
                    "title": "If a circular queue has no size, no tag, and does not reserve one empty slot, but uses only `front == rear` to decide its state, what is the main problem?",
                    "options": [
                        {"id": "A", "text": "enqueue becomes O(n)"},
                        {"id": "B", "text": "It cannot distinguish empty from full"},
                        {"id": "C", "text": "rear can never wrap back to 0"},
                        {"id": "D", "text": "dequeue removes the rear element"},
                    ],
                    "explanation": "Without extra information, front == rear can mean either empty or full after wraparound. Use size, a tag flag, or reserve one empty slot.",
                },
            },
        },
        {
            "id": "queue-q28",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 600(L5 系統級分析) + 0(直觀) = 1450
            "baseRating": 1450,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "若一個演算法需要在前端移除過期資料，也需要在後端加入新資料，偶爾還要從後端移除較差候選值，哪個結構比一般 Queue 更合適？",
                    "options": [
                        {"id": "A", "text": "Deque，因為前後兩端都能 O(1) 操作"},
                        {"id": "B", "text": "一般 Queue，因為只能從 front 移除更安全"},
                        {"id": "C", "text": "Stack，因為後端操作越多越適合 LIFO"},
                        {"id": "D", "text": "Binary Search Tree，因為它一定保留插入順序"},
                    ],
                    "explanation": "滑動視窗或單調佇列常需要兩端操作。一般 Queue 只提供 rear 加入、front 移除；Deque 才能自然支援前後端 O(1) 存取。",
                },
                "en": {
                    "title": "An algorithm must remove expired data from the front, append new data at the rear, and sometimes remove worse candidates from the rear. Which structure fits better than a normal Queue?",
                    "options": [
                        {"id": "A", "text": "Deque, because both ends support O(1) operations"},
                        {"id": "B", "text": "Normal Queue, because removing only from front is safer"},
                        {"id": "C", "text": "Stack, because more rear operations mean LIFO fits"},
                        {"id": "D", "text": "Binary Search Tree, because it always preserves insertion order"},
                    ],
                    "explanation": "Sliding-window and monotonic-queue patterns often need operations at both ends. A normal Queue only enqueues at rear and dequeues at front; a Deque supports both ends in O(1).",
                },
            },
        },
        {
            "id": "queue-q29",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 指標連動推演) + 250(複合陷阱) = 1500
            "baseRating": 1500,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "環狀佇列執行 dequeue 並回傳 front 元素後，下列哪個更新最能維持正確不變量？",
                    "options": [
                        {"id": "A", "text": "front = (front + 1) % capacity，size 不變"},
                        {"id": "B", "text": "front = front + 1，size -= 1"},
                        {"id": "C", "text": "front = (front + 1) % capacity，rear -= 1"},
                        {"id": "D", "text": "front = (front + 1) % capacity，size -= 1"},
                    ],
                    "explanation": "dequeue 移除的是 front 元素，因此要讓 front 環狀前進並減少 size。常見錯誤是忘記同步更新 size、忘記取餘數，或誤改 rear。",
                },
                "en": {
                    "title": "After a circular queue dequeues and returns the front element, which update best preserves the correct invariant?",
                    "options": [
                        {"id": "A", "text": "front = (front + 1) % capacity, size unchanged"},
                        {"id": "B", "text": "front = front + 1, size -= 1"},
                        {"id": "C", "text": "front = (front + 1) % capacity, rear -= 1"},
                        {"id": "D", "text": "front = (front + 1) % capacity, size -= 1"},
                    ],
                    "explanation": "dequeue removes the front element, so front advances modulo capacity and size decreases. Common mistakes are forgetting to update size, forgetting modulo wraparound, or changing rear.",
                },
            },
        },
        {
            "id": "queue-q30",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流分析) + 150(邊界情況) = 1400
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在 BFS 中，為了避免同一個節點被不同鄰居重複加入 Queue，通常應該在什麼時機標記 visited？",
                    "options": [
                        {"id": "A", "text": "節點從 Queue dequeue 後才標記，這樣最省記憶體"},
                        {"id": "B", "text": "每一層 BFS 結束後再統一標記"},
                        {"id": "C", "text": "節點被 enqueue 的當下就標記"},
                        {"id": "D", "text": "不需要 visited，FIFO 會自動去重"},
                    ],
                    "explanation": "若等到 dequeue 才標記，同一節點可能在被取出前已被多個鄰居重複 enqueue。加入 Queue 時立即標記，能避免重複排隊。",
                },
                "en": {
                    "title": "In BFS, when should a node usually be marked visited to prevent different neighbors from enqueuing it repeatedly?",
                    "options": [
                        {"id": "A", "text": "Only after the node is dequeued, to save memory"},
                        {"id": "B", "text": "After each BFS level finishes"},
                        {"id": "C", "text": "At the moment the node is enqueued"},
                        {"id": "D", "text": "visited is unnecessary because FIFO deduplicates automatically"},
                    ],
                    "explanation": "If marking waits until dequeue, the same node can be enqueued by multiple neighbors before it is processed. Marking when enqueued prevents duplicate queue entries.",
                },
            },
        },
    ],
}

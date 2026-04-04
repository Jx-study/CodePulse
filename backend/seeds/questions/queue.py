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
            "id": "group-print-buffer",
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
            "id": "queue-tf-1",
            "type": "true-false",
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
            "id": "queue-q1",
            "type": "single-choice",
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
            "id": "queue-q2",
            "type": "single-choice",
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
            "id": "queue-q3",
            "type": "single-choice",
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
            "id": "queue-q4",
            "type": "single-choice",
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
            "id": "queue-q5",
            "type": "single-choice",
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
                    "explanation": "逐步追蹤：\n1. enqueue(1) → Queue: [1]\n2. enqueue(2) → Queue: [1, 2]\n3. dequeue() → 移除 1，Queue: [2]\n4. enqueue(3) → Queue: [2, 3]\n5. dequeue() → 移除 2，Queue: [3]\n最後剩下元素 3。",
                },
                "en": {
                    "title": "On an empty Queue, execute: enqueue(1), enqueue(2), dequeue(), enqueue(3), dequeue(). What element remains?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "Empty"},
                    ],
                    "explanation": "Step-by-step:\n1. enqueue(1) → [1]\n2. enqueue(2) → [1, 2]\n3. dequeue() → remove 1, [2]\n4. enqueue(3) → [2, 3]\n5. dequeue() → remove 2, [3]\nFinal remaining element: 3.",
                },
            },
        },
        {
            "id": "queue-q6",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "Queue 最常用於解決以下哪個問題？",
                    "options": [
                        {"id": "A", "text": "括號匹配"},
                        {"id": "B", "text": "廣度優先搜尋 (BFS)"},
                        {"id": "C", "text": "函數調用管理"},
                        {"id": "D", "text": "後序表達式求值"},
                    ],
                    "explanation": "Queue 的 FIFO 特性非常適合用於廣度優先搜尋 (BFS)。在 BFS 中，我們需要按照發現節點的順序來處理它們，先發現的節點先處理，這正是 Queue 的特性。",
                },
                "en": {
                    "title": "Which problem is a Queue most commonly used to solve?",
                    "options": [
                        {"id": "A", "text": "Bracket matching"},
                        {"id": "B", "text": "Breadth-First Search (BFS)"},
                        {"id": "C", "text": "Function call management"},
                        {"id": "D", "text": "Postfix expression evaluation"},
                    ],
                    "explanation": "The FIFO property of a Queue is ideal for BFS — nodes discovered first are processed first, which is exactly what BFS requires.",
                },
            },
        },
        {
            "id": "queue-q7",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "作業系統中，CPU 處理多個程序時通常使用什麼數據結構來管理任務排程？",
                    "options": [
                        {"id": "A", "text": "Stack (堆疊)"},
                        {"id": "B", "text": "Queue (佇列)"},
                        {"id": "C", "text": "Linked List (鏈結串列)"},
                        {"id": "D", "text": "Binary Tree (二元樹)"},
                    ],
                    "explanation": "CPU 排程通常使用 Queue 來管理待處理的程序。這確保了公平性：先提交的任務會先被處理，這就是 FIFO 調度的基本原則。",
                },
                "en": {
                    "title": "In an operating system, what data structure is typically used to manage CPU task scheduling?",
                    "options": [
                        {"id": "A", "text": "Stack"},
                        {"id": "B", "text": "Queue"},
                        {"id": "C", "text": "Linked List"},
                        {"id": "D", "text": "Binary Tree"},
                    ],
                    "explanation": "CPU scheduling typically uses a Queue to manage pending tasks, ensuring fairness: tasks submitted first are processed first — the basic FIFO scheduling principle.",
                },
            },
        },
        {
            "id": "queue-q8",
            "type": "single-choice",
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
            "id": "queue-multi-1",
            "type": "multiple-choice",
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些場景適合使用 Queue (佇列)？(多選)",
                    "options": [
                        {"id": "opt1", "text": "印表機的列印任務排程"},
                        {"id": "opt2", "text": "瀏覽器的上一頁功能"},
                        {"id": "opt3", "text": "廣度優先搜尋 (BFS)"},
                        {"id": "opt4", "text": "遞迴函數的呼叫管理"},
                    ],
                    "explanation": "印表機排程和 BFS 都需要「先來先服務」的特性，因此使用 Queue。瀏覽器上一頁和遞迴呼叫則使用 Stack。",
                },
                "en": {
                    "title": "Which of the following scenarios are well-suited for a Queue? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Printer job scheduling"},
                        {"id": "opt2", "text": "Browser back navigation"},
                        {"id": "opt3", "text": "Breadth-First Search (BFS)"},
                        {"id": "opt4", "text": "Recursive function call management"},
                    ],
                    "explanation": "Printer scheduling and BFS both require 'first-come, first-served' behavior — use a Queue. Browser back and recursive calls use a Stack.",
                },
            },
        },
        # 【Complexity】 1300-1500
        {
            "id": "queue-q9",
            "type": "single-choice",
            "baseRating": 900,
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
            "id": "queue-q10",
            "type": "single-choice",
            "baseRating": 900,
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
                    "explanation": "在 Queue 中搜尋元素需要從前端開始逐個檢查，最壞情況下要檢查所有 n 個元素，時間複雜度為 O(n)。",
                },
                "en": {
                    "title": "What is the worst-case time complexity of searching for a specific element in a Queue?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "Searching a Queue requires checking elements from the front one by one. In the worst case all n elements must be checked — O(n).",
                },
            },
        },
        # 【Group Questions】
        {
            "id": "q-group-1",
            "groupId": "group-print-buffer",
            "type": "single-choice",
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
            "id": "q-group-2",
            "groupId": "group-print-buffer",
            "type": "single-choice",
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
            "id": "q-group-3",
            "groupId": "group-print-buffer",
            "type": "fill-code",
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
            "id": "queue-code-fill-1",
            "type": "fill-code",
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
            "id": "queue-code-1",
            "type": "predict-line",
            "baseRating": 1350,
            "code": CIRCULAR_QUEUE_CODE,
            "language": "python",
            "correctAnswer": "17 18 21 22 23 24",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀下方的 Circular Queue 實作程式碼。假設目前 Queue 內資料為 [1, 2, 3] (Capacity=5)，且 front=0, rear=3, size=3。\n\n若執行一次 `dequeue()` 操作，請依序填寫程式執行的行號序列 (以空格分隔)。",
                    "options": [],
                    "explanation": "執行流程如下：\n1. 呼叫 dequeue (L17)\n2. 檢查 size 是否為 0 (L18)，目前 size=3，條件為 False\n3. 取出 value (L21)\n4. 更新 front 指標 (L22)\n5. 更新 size (L23)\n6. 回傳 value (L24)",
                },
                "en": {
                    "title": "Read the Circular Queue implementation below. Assume the queue contains [1, 2, 3] (Capacity=5) with front=0, rear=3, size=3.\n\nAfter calling `dequeue()`, write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "Execution flow:\n1. Call dequeue (L17)\n2. Check if size == 0 (L18) — size=3, condition is False\n3. Retrieve value (L21)\n4. Update front pointer (L22)\n5. Update size (L23)\n6. Return value (L24)",
                },
            },
        },
    ],
}

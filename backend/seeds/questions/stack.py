STACK_CODE = """\
class Stack:
    def __init__(self, size: int):
        self.stack = []
        self.size = size
        self.top = -1

    def push(self, value: int) -> None:
        if self.top >= self.size - 1:
            raise Exception("Stack Overflow")
        self.top += 1
        self.stack.append(value)

    def pop(self) -> int:
        if self.top == -1:
            raise Exception("Stack Underflow")
        value = self.stack[self.top]
        self.top -= 1
        return value

    def peek(self) -> int:
        if self.top == -1:
            return None
        return self.stack[self.top]"""

STACK_FILL_CODE = """\
class Stack:
    def __init__(self, size: int):
        self.stack = []
        self.size = size
        self.top = (a)          # top 指標初始值

    def push(self, value: int) -> None:
        if self.top >= (b):     # 判斷是否已滿
            raise Exception("Stack Overflow")
        self.top += 1
        self.stack.append(value)

    def pop(self) -> int:
        if self.top == (c):     # 判斷是否為空
            raise Exception("Stack Underflow")
        value = self.stack[self.top]
        (d)                     # 更新 top 指標
        return value"""

STACK_PREDICT_CODE = """\
class Stack:                               # L1
    def __init__(self, size: int):        # L2
        self.stack = []                   # L3
        self.size = size                  # L4
        self.top = -1                     # L5
                                          # L6
    def push(self, value: int) -> None:   # L7
        if self.top >= self.size - 1:    # L8
            raise Exception("Stack Overflow")  # L9
        self.top += 1                     # L10
        self.stack.append(value)          # L11
                                          # L12
    def pop(self) -> int:                 # L13
        if self.top == -1:               # L14
            raise Exception("Stack Underflow") # L15
        value = self.stack[self.top]     # L16
        self.top -= 1                    # L17
        return value                      # L18"""

MIN_STACK_FILL_CODE = """\
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val: int) -> None:
        self.stack.append(val)
        if not self.min_stack or val <= (a):
            self.min_stack.append(val)

    def pop(self) -> None:
        val = self.stack.pop()
        if val == self.get_min():
            (b)

    def get_min(self) -> int:
        return (c)"""

DATA = {
    "slug": "stack",
    "groups": [
        {
            "id": "group-stack-impl",
            "translations": {
                "zh-TW": {
                    "title": "題組：堆疊操作追蹤（教學區同款實作）",
                    "description": "以下程式碼與教學區「堆疊 (Stack)」使用的 Python 實作完全相同，請仔細閱讀後回答問題。",
                },
                "en": {
                    "title": "Group: Stack Operation Tracing (Tutorial Implementation)",
                    "description": "The following code is identical to the Python Stack implementation used in the tutorial. Read it carefully before answering the questions.",
                },
            },
            "code": STACK_CODE,
            "language": "python",
        }
    ],
    "questions": [
        # 【Basic】 800-950
        {
            "id": "stack-tf-1",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "堆疊 (Stack) 是一種 LIFO (Last-In, First-Out) 的資料結構，意即最後放入的元素，會第一個被取出。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "Stack 的 LIFO 特性意味著最後放入的元素最先被取出。相對地，Queue 是 FIFO（先進先出）。",
                },
                "en": {
                    "title": "A Stack is a LIFO (Last-In, First-Out) data structure, meaning the last element pushed is the first to be popped.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "The LIFO property of a Stack means the last element added is the first to be removed. In contrast, a Queue is FIFO (First-In, First-Out).",
                },
            },
        },
        {
            "id": "stack-q1",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "Stack 的 push 操作會在哪裡加入新元素？",
                    "options": [
                        {"id": "A", "text": "頂端 (Top)"},
                        {"id": "B", "text": "底端 (Bottom)"},
                        {"id": "C", "text": "中間位置"},
                        {"id": "D", "text": "任意位置"},
                    ],
                    "explanation": "push 永遠在 Stack 的頂端加入新元素，這也是 LIFO 原則的實作方式。",
                },
                "en": {
                    "title": "Where does the push operation add a new element in a Stack?",
                    "options": [
                        {"id": "A", "text": "At the top"},
                        {"id": "B", "text": "At the bottom"},
                        {"id": "C", "text": "In the middle"},
                        {"id": "D", "text": "At any position"},
                    ],
                    "explanation": "push always adds a new element at the top of the Stack — this is how the LIFO principle is implemented.",
                },
            },
        },
        {
            "id": "stack-q2",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "Stack 的 pop 操作會執行什麼動作？",
                    "options": [
                        {"id": "A", "text": "在頂端加入一個新元素"},
                        {"id": "B", "text": "查看頂端元素但不移除"},
                        {"id": "C", "text": "移除並回傳頂端元素"},
                        {"id": "D", "text": "清空整個 Stack"},
                    ],
                    "explanation": "pop 會取得頂端值、將指標減 1 並回傳該值。對空 Stack 執行會觸發 Underflow。",
                },
                "en": {
                    "title": "What does the pop operation do on a Stack?",
                    "options": [
                        {"id": "A", "text": "Adds a new element at the top"},
                        {"id": "B", "text": "Views the top element without removing it"},
                        {"id": "C", "text": "Removes and returns the top element"},
                        {"id": "D", "text": "Clears the entire Stack"},
                    ],
                    "explanation": "pop retrieves the top value, decrements the pointer, and returns that value. Calling pop on an empty Stack triggers an Underflow error.",
                },
            },
        },
        {
            "id": "stack-q3",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "以下哪個操作可以查看 Stack 頂端的元素，但不移除它？",
                    "options": [
                        {"id": "A", "text": "push"},
                        {"id": "B", "text": "pop"},
                        {"id": "C", "text": "peek"},
                        {"id": "D", "text": "isEmpty"},
                    ],
                    "explanation": "peek 只讀取頂端值而不移動指標，保持 Stack 內容不變。",
                },
                "en": {
                    "title": "Which operation looks at the top element of a Stack without removing it?",
                    "options": [
                        {"id": "A", "text": "push"},
                        {"id": "B", "text": "pop"},
                        {"id": "C", "text": "peek"},
                        {"id": "D", "text": "isEmpty"},
                    ],
                    "explanation": "peek reads the top value without moving the pointer, leaving the Stack unchanged.",
                },
            },
        },
        {
            "id": "stack-q4",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "程式中常見的 \"Stack Overflow\" 錯誤，最可能的原因是？",
                    "options": [
                        {"id": "A", "text": "對空 Stack 執行 pop 操作"},
                        {"id": "B", "text": "遞迴函數缺少終止條件，導致 Call Stack 無限累積"},
                        {"id": "C", "text": "Stack 的記憶體不夠大"},
                        {"id": "D", "text": "push 和 pop 順序錯誤"},
                    ],
                    "explanation": "無限遞迴會導致 Call Stack 持續增長直到超過系統限制，即為 Stack Overflow。",
                },
                "en": {
                    "title": "What is the most likely cause of a 'Stack Overflow' error in a program?",
                    "options": [
                        {"id": "A", "text": "Calling pop on an empty Stack"},
                        {"id": "B", "text": "A recursive function missing a base case, causing the Call Stack to grow infinitely"},
                        {"id": "C", "text": "The Stack's memory is not large enough"},
                        {"id": "D", "text": "Incorrect push and pop ordering"},
                    ],
                    "explanation": "Infinite recursion causes the Call Stack to keep growing until it exceeds the system limit — this is a Stack Overflow.",
                },
            },
        },
        # 【Application】 1000-1200
        {
            "id": "stack-q5",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "對一個空的 Stack 依序執行：push(1), push(2), pop(), push(3), pop()。最後剩下什麼？",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "Stack 為空"},
                    ],
                    "explanation": "過程：[1] -> [1,2] -> [1] -> [1,3] -> [1]。最終剩下 1。",
                },
                "en": {
                    "title": "On an empty Stack, execute in order: push(1), push(2), pop(), push(3), pop(). What remains?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "Stack is empty"},
                    ],
                    "explanation": "Trace: [1] → [1,2] → [1] → [1,3] → [1]. The final element remaining is 1.",
                },
            },
        },
        {
            "id": "stack-q6",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "Stack 的 LIFO 特性最適合用於解決以下哪個問題？",
                    "options": [
                        {"id": "A", "text": "印表機的列印任務排程"},
                        {"id": "B", "text": "括號是否正確匹配（如 \"{[()]}\"）"},
                        {"id": "C", "text": "廣度優先搜尋 (BFS)"},
                        {"id": "D", "text": "CPU 任務排程"},
                    ],
                    "explanation": "括號匹配需要「最後開啟的括號最先關閉」，這正是 Stack 的 LIFO 特性。",
                },
                "en": {
                    "title": "The LIFO property of a Stack is best suited for which of the following problems?",
                    "options": [
                        {"id": "A", "text": "Print job scheduling for a printer"},
                        {"id": "B", "text": "Checking whether brackets are correctly matched (e.g., \"{[()]}\")"},
                        {"id": "C", "text": "Breadth-First Search (BFS)"},
                        {"id": "D", "text": "CPU task scheduling"},
                    ],
                    "explanation": "Bracket matching requires 'the last opened bracket to be closed first' — exactly the LIFO property of a Stack.",
                },
            },
        },
        {
            "id": "stack-q7",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "作業系統使用什麼資料結構來管理函數的呼叫順序？",
                    "options": [
                        {"id": "A", "text": "Queue（佇列）"},
                        {"id": "B", "text": "Stack（堆疊）"},
                        {"id": "C", "text": "Hash Table"},
                        {"id": "D", "text": "Binary Tree"},
                    ],
                    "explanation": "Call Stack 管理函數呼叫，確保最後被呼叫的函數能最先執行完畢並回傳。",
                },
                "en": {
                    "title": "What data structure does the operating system use to manage the order of function calls?",
                    "options": [
                        {"id": "A", "text": "Queue"},
                        {"id": "B", "text": "Stack"},
                        {"id": "C", "text": "Hash Table"},
                        {"id": "D", "text": "Binary Tree"},
                    ],
                    "explanation": "The Call Stack manages function calls, ensuring the last-called function completes and returns first.",
                },
            },
        },
        {
            "id": "stack-q8",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "瀏覽器的「上一頁」功能可用 Stack 實作。請問 push(currentPage) 應在何時觸發？",
                    "options": [
                        {"id": "A", "text": "使用者點擊「上一頁」時"},
                        {"id": "B", "text": "使用者開啟新頁面時"},
                        {"id": "C", "text": "使用者點擊「下一頁」時"},
                        {"id": "D", "text": "瀏覽器關閉頁籤時"},
                    ],
                    "explanation": "每當瀏覽新頁面，就將目前頁面 push 進 History Stack 以便日後回退。",
                },
                "en": {
                    "title": "A browser's 'back' feature can be implemented with a Stack. When should push(currentPage) be triggered?",
                    "options": [
                        {"id": "A", "text": "When the user clicks 'back'"},
                        {"id": "B", "text": "When the user navigates to a new page"},
                        {"id": "C", "text": "When the user clicks 'forward'"},
                        {"id": "D", "text": "When the browser closes a tab"},
                    ],
                    "explanation": "Whenever a new page is visited, push the current page onto the History Stack so it can be returned to later.",
                },
            },
        },
        {
            "id": "stack-multi-1",
            "type": "multiple-choice",
            "baseRating": 1000,
            "correctAnswer": ["opt1", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些場景適合使用 Stack？（多選）",
                    "options": [
                        {"id": "opt1", "text": "括號匹配驗證"},
                        {"id": "opt2", "text": "作業系統 CPU 任務排程"},
                        {"id": "opt3", "text": "深度優先搜尋 (DFS) 的迭代實作"},
                        {"id": "opt4", "text": "廣度優先搜尋 (BFS)"},
                    ],
                    "explanation": "括號匹配與 DFS 迭代版皆使用 Stack；CPU 排程與 BFS 則使用 Queue。",
                },
                "en": {
                    "title": "Which of the following scenarios are well-suited for a Stack? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Bracket matching validation"},
                        {"id": "opt2", "text": "OS CPU task scheduling"},
                        {"id": "opt3", "text": "Iterative implementation of Depth-First Search (DFS)"},
                        {"id": "opt4", "text": "Breadth-First Search (BFS)"},
                    ],
                    "explanation": "Bracket matching and iterative DFS both use a Stack; CPU scheduling and BFS use a Queue.",
                },
            },
        },
        # 【Complexity】 1250-1500
        {
            "id": "stack-q9",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "Stack 的 push 和 pop 操作，時間複雜度分別是多少？",
                    "options": [
                        {"id": "A", "text": "兩者皆為 O(1)"},
                        {"id": "B", "text": "push O(1), pop O(n)"},
                        {"id": "C", "text": "兩者皆為 O(n)"},
                        {"id": "D", "text": "push O(n), pop O(1)"},
                    ],
                    "explanation": "Stack 只在頂端操作，不需遍歷，故皆為常數時間 O(1)。",
                },
                "en": {
                    "title": "What are the time complexities of push and pop on a Stack?",
                    "options": [
                        {"id": "A", "text": "Both O(1)"},
                        {"id": "B", "text": "push O(1), pop O(n)"},
                        {"id": "C", "text": "Both O(n)"},
                        {"id": "D", "text": "push O(n), pop O(1)"},
                    ],
                    "explanation": "Stack operations only touch the top element — no traversal needed — so both are O(1) constant time.",
                },
            },
        },
        {
            "id": "stack-q10",
            "type": "single-choice",
            "baseRating": 1450,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "以 Python list 實作 Stack 時，append() 和 pop() 的「均攤」時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "兩者皆為 O(1)"},
                        {"id": "B", "text": "append O(n), pop O(1)"},
                        {"id": "C", "text": "append O(1), pop O(n)"},
                        {"id": "D", "text": "兩者皆為 O(n)"},
                    ],
                    "explanation": "雖然 append 偶爾需擴容，但均攤後為 O(1)；末端 pop 始終為 O(1)。",
                },
                "en": {
                    "title": "When implementing a Stack with a Python list, what is the amortized time complexity of append() and pop()?",
                    "options": [
                        {"id": "A", "text": "Both O(1)"},
                        {"id": "B", "text": "append O(n), pop O(1)"},
                        {"id": "C", "text": "append O(1), pop O(n)"},
                        {"id": "D", "text": "Both O(n)"},
                    ],
                    "explanation": "Although append occasionally triggers a resize, its amortized cost is O(1). Popping from the end is always O(1).",
                },
            },
        },
        # 【Group Questions】
        {
            "id": "stack-group-1",
            "groupId": "group-stack-impl",
            "type": "single-choice",
            "baseRating": 1250,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "根據上方程式碼，執行 s=Stack(3); s.push(10); s.push(20); s.pop(); 後，s.top 的值是多少？",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "1"},
                        {"id": "C", "text": "2"},
                        {"id": "D", "text": "-1"},
                    ],
                    "explanation": "top 變化：-1 -> 0 -> 1 -> 0。最終為 0。",
                },
                "en": {
                    "title": "Based on the code above, after s=Stack(3); s.push(10); s.push(20); s.pop(), what is the value of s.top?",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "1"},
                        {"id": "C", "text": "2"},
                        {"id": "D", "text": "-1"},
                    ],
                    "explanation": "top changes: -1 → 0 → 1 → 0. Final value is 0.",
                },
            },
        },
        {
            "id": "stack-group-2",
            "groupId": "group-stack-impl",
            "type": "single-choice",
            "baseRating": 1250,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "根據上方程式碼，s = Stack(2) 後依序執行 push(10), push(20), push(30)。請問第三次 push 會發生什麼事？",
                    "options": [
                        {"id": "A", "text": "正常執行，top = 2"},
                        {"id": "B", "text": "拋出 \"Stack Overflow\" 例外"},
                        {"id": "C", "text": "覆蓋 stack[1] 的值，top 不變"},
                        {"id": "D", "text": "拋出 \"Stack Underflow\" 例外"},
                    ],
                    "explanation": "size=2, top 達到 size-1 (即 1) 時再 push 就會拋出 Overflow。",
                },
                "en": {
                    "title": "Based on the code above, with s = Stack(2), after push(10), push(20), push(30) — what happens on the third push?",
                    "options": [
                        {"id": "A", "text": "Executes normally, top = 2"},
                        {"id": "B", "text": "Raises a 'Stack Overflow' exception"},
                        {"id": "C", "text": "Overwrites stack[1], top unchanged"},
                        {"id": "D", "text": "Raises a 'Stack Underflow' exception"},
                    ],
                    "explanation": "With size=2, once top reaches size-1 (which is 1), another push raises Overflow.",
                },
            },
        },
        {
            "id": "stack-group-3",
            "groupId": "group-stack-impl",
            "type": "fill-code",
            "baseRating": 1500,
            "code": STACK_FILL_CODE,
            "language": "python",
            "correctAnswer": ["-1", "self.size - 1", "-1", "self.top -= 1"],
            "translations": {
                "zh-TW": {
                    "title": "請填入 (a)(b)(c)(d) 處缺失的 Python 程式碼，使邏輯與教學區完全相同（注意大小寫；(d) 處請使用複合賦值運算子）。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}, {"id": "d", "text": ""}],
                    "explanation": "top 初始為 -1；Overflow 判定為 size-1；Underflow 判定為 -1；pop 後指標遞減。",
                },
                "en": {
                    "title": "Fill in the missing Python code at (a)(b)(c)(d) to match the tutorial implementation exactly (mind casing; use a compound assignment operator for (d)).",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}, {"id": "d", "text": ""}],
                    "explanation": "top initializes to -1; Overflow check is size-1; Underflow check is -1; after pop, decrement the pointer.",
                },
            },
        },
        {
            "id": "stack-adv-pred",
            "type": "predict-line",
            "baseRating": 1350,
            "code": STACK_PREDICT_CODE,
            "language": "python",
            "correctAnswer": "13 14 16 17 18",
            "translations": {
                "zh-TW": {
                    "title": "給定 s = Stack(3) 且已執行 s.push(5)（目前 top=0，stack=[5]），接著執行 s.pop()。請依序填寫 pop() 方法執行時，經過的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "進入 pop(L13) -> 檢查 top(L14) -> 取得值(L16) -> 指標減一(L17) -> 回傳(L18)。",
                },
                "en": {
                    "title": "Given s = Stack(3) with s.push(5) already called (top=0, stack=[5]), then s.pop() is called. Write the sequence of line numbers executed by pop() (space-separated).",
                    "options": [],
                    "explanation": "Enter pop (L13) → check top (L14) → get value (L16) → decrement pointer (L17) → return (L18).",
                },
            },
        },
        {
            "id": "stack-adv-fill",
            "type": "fill-code",
            "baseRating": 1600,
            "code": MIN_STACK_FILL_CODE,
            "language": "python",
            "correctAnswer": ["self.min_stack[-1]", "self.min_stack.pop()", "self.min_stack[-1]"],
            "translations": {
                "zh-TW": {
                    "title": "Min Stack 支援 O(1) 取得最小值。請填入 (a)(b)(c) 處缺失的程式碼（注意 Python 語法）。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "使用輔助 Stack 同步存儲當前最小值。[-1] 用於讀取頂端，pop() 同步移除。",
                },
                "en": {
                    "title": "A MinStack supports O(1) retrieval of the minimum value. Fill in the missing code at (a)(b)(c) (mind Python syntax).",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "An auxiliary stack synchronously stores the current minimum. [-1] reads the top; pop() removes it in sync.",
                },
            },
        },
    ],
}

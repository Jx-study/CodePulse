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

BRACKET_FILL_CODE = """\
def is_valid_brackets(text: str) -> bool:
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}

    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack[-1] != (a):
                return False
            (b)

    return (c)"""

RECURSION_PREDICT_CODE = """\
def countdown(n):          # L1
    if n == 0:             # L2
        return "done"      # L3
    return countdown(n-1)  # L4
                           # L5
countdown(2)               # L6"""

MONO_STACK_PREDICT_CODE = """\
nums = [2, 1, 3]                 # L1
stack = []                       # L2
answer = [-1] * len(nums)        # L3
for i, x in enumerate(nums):     # L4
    while stack and nums[stack[-1]] < x:  # L5
        j = stack.pop()          # L6
        answer[j] = x            # L7
    stack.append(i)              # L8
print(answer)                    # L9"""

TWO_STACK_QUEUE_FILL_CODE = """\
class QueueByStacks:
    def __init__(self):
        self.in_stack = []
        self.out_stack = []

    def push(self, x):
        self.in_stack.append(x)

    def pop(self):
        if not self.out_stack:
            while self.in_stack:
                (a)
        if not self.out_stack:
            raise Exception("empty queue")
        return (b)"""

DATA = {
    "slug": "stack",
    "groups": [
        {
            "id": "stack-group-1",
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
            "id": "stack-q1",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 單一定義) + 0(直觀) = 850
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
            "id": "stack-q2",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一操作定義) + 0(直觀) = 900
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
            "id": "stack-q3",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一操作定義) + 0(直觀) = 900
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
                    "explanation": "pop 遵循 LIFO 原則，會移除最近加入的元素；對空 Stack 執行則會觸發 Underflow。",
                },
                "en": {
                    "title": "What does the pop operation do on a Stack?",
                    "options": [
                        {"id": "A", "text": "Adds a new element at the top"},
                        {"id": "B", "text": "Views the top element without removing it"},
                        {"id": "C", "text": "Removes and returns the top element"},
                        {"id": "D", "text": "Clears the entire Stack"},
                    ],
                    "explanation": "pop follows the LIFO principle and removes the most recently added element. Calling pop on an empty Stack triggers an Underflow error.",
                },
            },
        },
        {
            "id": "stack-q4",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一操作定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "以下哪個操作可以查看 Stack 頂端的元素，但不移除它？",
                    "options": [
                        {"id": "A", "text": "push"},
                        {"id": "B", "text": "pop"},
                        {"id": "C", "text": "peek"},
                        {"id": "D", "text": "top"},
                    ],
                    "explanation": "peek 只讀取頂端值而不移動指標，保持 Stack 內容不變。",
                },
                "en": {
                    "title": "Which operation looks at the top element of a Stack without removing it?",
                    "options": [
                        {"id": "A", "text": "push"},
                        {"id": "B", "text": "pop"},
                        {"id": "C", "text": "peek"},
                        {"id": "D", "text": "top"},
                    ],
                    "explanation": "peek reads the top value without moving the pointer, leaving the Stack unchanged.",
                },
            },
        },
        {
            "id": "stack-q5",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 100(新手誤區) = 1050
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
            "id": "stack-q6",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(新手誤區) = 1200
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
            "id": "stack-q7",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 適用場景辨識) + 50(視覺/相似度干擾) = 950
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
            "id": "stack-q8",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "作業系統使用什麼資料結構來管理函數的呼叫順序？",
                    "options": [
                        {"id": "A", "text": "Queue（佇列）"},
                        {"id": "B", "text": "Stack（堆疊）"},
                        {"id": "C", "text": "Linked List"},
                        {"id": "D", "text": "Priority Queue"},
                    ],
                    "explanation": "Call Stack 管理函數呼叫，確保最後被呼叫的函數能最先執行完畢並回傳。",
                },
                "en": {
                    "title": "What data structure does the operating system use to manage the order of function calls?",
                    "options": [
                        {"id": "A", "text": "Queue"},
                        {"id": "B", "text": "Stack"},
                        {"id": "C", "text": "Linked List"},
                        {"id": "D", "text": "Priority Queue"},
                    ],
                    "explanation": "The Call Stack manages function calls, ensuring the last-called function completes and returns first.",
                },
            },
        },
        {
            "id": "stack-q9",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一應用概念) + 0(直觀) = 900
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
            "id": "stack-q10",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 100(L2 多重比較) + 0(直觀) = 1000
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
            "id": "stack-q11",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 0(L0 反射常識) + 0(直觀) = 800
            "baseRating": 800,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "Stack 的 push 和 pop 操作通常都屬於 O(1) 的頂端操作。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "Stack 設計上保證高效的頂端操作。",
                },
                "en": {
                    "title": "Stack push and pop operations are usually O(1) top-end operations.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "A Stack is designed to provide efficient operations at the top end.",
                },
            },
        },
        {
            "id": "stack-q12",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 均攤與邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
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
                    "explanation": "均攤表示偶爾較耗時的擴容成本，平均到多次操作後仍可視為常數時間；末端 pop 始終為 O(1)。",
                },
                "en": {
                    "title": "When implementing a Stack with a Python list, what is the amortized time complexity of append() and pop()?",
                    "options": [
                        {"id": "A", "text": "Both O(1)"},
                        {"id": "B", "text": "append O(n), pop O(1)"},
                        {"id": "C", "text": "append O(1), pop O(n)"},
                        {"id": "D", "text": "Both O(n)"},
                    ],
                    "explanation": "Amortized means occasional costly resizes are averaged across many operations, so the cost is still treated as constant time. Popping from the end is O(1).",
                },
            },
        },
        # 【Group Questions】
        {
            "id": "stack-q13",
            "groupId": "stack-group-1",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 150(邊界) = 1250
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
            "id": "stack-q14",
            "groupId": "stack-group-1",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 150(邊界) = 1250
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
            "id": "stack-q15",
            "groupId": "stack-group-1",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1500
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
            "id": "stack-q16",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 150(L2 單步追蹤) + 50(視覺/相似度干擾) = 1150
            "baseRating": 1150,
            "code": STACK_PREDICT_CODE,
            "language": "python",
            "correctAnswer": "13 14 16 17 18",
            "translations": {
                "zh-TW": {
                    "title": "給定 s = Stack(3) 且已執行 s.push(5)（目前 top=0，stack=[5]），接著執行 s.pop()。請依序填寫 pop() 方法執行時，經過的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "此題只追蹤一次有效的 pop 呼叫，因此會走完 pop 方法的正常回傳路徑。",
                },
                "en": {
                    "title": "Given s = Stack(3) with s.push(5) already called (top=0, stack=[5]), then s.pop() is called. Write the sequence of line numbers executed by pop() (space-separated).",
                    "options": [],
                    "explanation": "This traces one valid pop call, so execution follows the normal return path of the pop method.",
                },
            },
        },
        {
            "id": "stack-q17",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 400(L4 複雜控制流/邊界分析) + 250(複合) = 1600
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
        {
            "id": "stack-q18",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 複雜度定義) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "若只能透過 Stack 頂端逐一彈出來尋找元素，Search 操作的時間複雜度是 O(n)。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "Stack 的存取限制使搜尋效率遠低於 O(1) 的頂端操作。",
                },
                "en": {
                    "title": "If an element can only be found by popping from the top of a Stack one by one, the Search operation is O(n).",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "A Stack's access restrictions make search much less efficient than O(1) top-end operations.",
                },
            },
        },
        {
            "id": "stack-q19",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一操作定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在教學區同款實作中，對空 Stack 執行 peek() 會回傳什麼？",
                    "options": [
                        {"id": "A", "text": "Stack Underflow"},
                        {"id": "B", "text": "-1"},
                        {"id": "C", "text": "None"},
                        {"id": "D", "text": "空字串"},
                    ],
                    "explanation": "peek() 在 top == -1 時直接回傳 None，和 pop() 對空堆疊拋出例外不同。",
                },
                "en": {
                    "title": "In the tutorial implementation, what does peek() return on an empty Stack?",
                    "options": [
                        {"id": "A", "text": "Stack Underflow"},
                        {"id": "B", "text": "-1"},
                        {"id": "C", "text": "None"},
                        {"id": "D", "text": "An empty string"},
                    ],
                    "explanation": "peek() returns None when top == -1, unlike pop(), which raises an exception on an empty stack.",
                },
            },
        },
        {
            "id": "stack-q20",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 150(邊界) = 1100
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若在單執行緒中需要穩定的雙端 O(1) 操作，且想避開 list 擴容造成的搬移成本，較適合選哪個工具？",
                    "options": [
                        {"id": "A", "text": "list"},
                        {"id": "B", "text": "deque"},
                        {"id": "C", "text": "LifoQueue"},
                        {"id": "D", "text": "dict"},
                    ],
                    "explanation": "deque 提供穩定的雙端 O(1) 操作，且不需要像 list 一樣偶爾進行整段記憶體重配置。",
                },
                "en": {
                    "title": "In a single-threaded case, which tool is better for stable O(1) operations at both ends while avoiding list resize-copy costs?",
                    "options": [
                        {"id": "A", "text": "list"},
                        {"id": "B", "text": "deque"},
                        {"id": "C", "text": "LifoQueue"},
                        {"id": "D", "text": "dict"},
                    ],
                    "explanation": "deque provides stable O(1) operations at both ends and avoids the occasional contiguous-memory resize cost of list.",
                },
            },
        },
        {
            "id": "stack-q21",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 動態想像) + 150(邊界) = 1100
            "baseRating": 1100,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "下列哪個需求最不適合用 Stack 作為主要資料結構，應優先考慮 Array 或其他結構？",
                    "options": [
                        {"id": "A", "text": "需要記錄 Undo 歷史"},
                        {"id": "B", "text": "需要迭代實作 DFS"},
                        {"id": "C", "text": "需要括號配對檢查"},
                        {"id": "D", "text": "需要頻繁依索引讀取中間元素"},
                    ],
                    "explanation": "Stack 擅長頂端操作與狀態回溯；若常要直接讀取中間位置，Array 會更合適。",
                },
                "en": {
                    "title": "Which requirement is least suitable for using a Stack as the primary data structure, and should favor an Array or another structure instead?",
                    "options": [
                        {"id": "A", "text": "Recording Undo history"},
                        {"id": "B", "text": "Implementing DFS iteratively"},
                        {"id": "C", "text": "Checking bracket matching"},
                        {"id": "D", "text": "Frequently reading middle elements by index"},
                    ],
                    "explanation": "A Stack is good at top-end operations and state backtracking. If middle positions are read often, an Array is a better fit.",
                },
            },
        },
        {
            "id": "stack-q22",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 150(L2 單步追蹤) + 100(新手誤區) = 1200
            "baseRating": 1200,
            "code": BRACKET_FILL_CODE,
            "language": "python",
            "correctAnswer": ["pairs[ch]", "stack.pop()", "not stack"],
            "translations": {
                "zh-TW": {
                    "title": "請補齊括號匹配函式：遇到右括號時確認頂端是否為對應左括號，最後確認 Stack 已清空。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 取出右括號對應的左括號；匹配後 (b) 彈出頂端；最後必須 (c) 確認沒有未閉合左括號。",
                },
                "en": {
                    "title": "Complete the bracket matcher: when seeing a closing bracket, check whether the top is the matching opener, then ensure the Stack is empty.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) gets the required opener for the closing bracket; after a match, (b) pops the top; finally, (c) ensures no opener remains unclosed.",
                },
            },
        },
        {
            "id": "stack-q23",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 250(L3 多步狀態) + 100(新手誤區) = 1300
            "baseRating": 1300,
            "code": RECURSION_PREDICT_CODE,
            "language": "python",
            "correctAnswer": "6 1 2 4 1 2 4 1 2 3",
            "translations": {
                "zh-TW": {
                    "title": "執行 countdown(2) 時，請寫出實際經過的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "先從 L6 呼叫；n=2 與 n=1 都走到遞迴呼叫 L4；n=0 時命中基底條件並在 L3 回傳。",
                },
                "en": {
                    "title": "When countdown(2) runs, write the actual sequence of executed line numbers (space-separated).",
                    "options": [],
                    "explanation": "The call starts at L6. For n=2 and n=1, execution reaches recursive call L4; when n=0, the base case returns at L3.",
                },
            },
        },
        {
            "id": "stack-q24",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "單調堆疊最常用來解決哪類問題？",
                    "options": [
                        {"id": "A", "text": "依照先到先服務順序處理任務"},
                        {"id": "B", "text": "尋找下一個更大值、相鄰極值或邊界"},
                        {"id": "C", "text": "在 O(1) 時間內隨機讀取任意索引"},
                        {"id": "D", "text": "保證多執行緒寫入一定安全"},
                    ],
                    "explanation": "單調堆疊透過維持遞增或遞減關係，常用於下一個更大值、左右邊界與相鄰極值問題。",
                },
                "en": {
                    "title": "What kind of problem is a monotonic stack most commonly used for?",
                    "options": [
                        {"id": "A", "text": "Processing tasks in first-come, first-served order"},
                        {"id": "B", "text": "Finding next greater values, nearby extrema, or boundaries"},
                        {"id": "C", "text": "Reading any random index in O(1) time"},
                        {"id": "D", "text": "Guaranteeing thread-safe writes"},
                    ],
                    "explanation": "A monotonic stack maintains an increasing or decreasing relationship, making it useful for next greater value, boundary, and nearby-extreme problems.",
                },
            },
        },
        {
            "id": "stack-q25",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "用兩個 Stack 實作 Queue 時，為何需要把 in_stack 的元素倒到 out_stack？",
                    "options": [
                        {"id": "A", "text": "為了讓所有操作變成 O(n)"},
                        {"id": "B", "text": "為了刪除重複元素"},
                        {"id": "C", "text": "利用兩次 LIFO 反轉，恢復 FIFO 出隊順序"},
                        {"id": "D", "text": "為了讓 Stack 支援隨機存取"},
                    ],
                    "explanation": "第一次推入 in_stack 會反轉一次；倒入 out_stack 再反轉一次，最早進入的元素就會位於 out_stack 頂端。",
                },
                "en": {
                    "title": "When implementing a Queue with two Stacks, why move elements from in_stack to out_stack?",
                    "options": [
                        {"id": "A", "text": "To make every operation O(n)"},
                        {"id": "B", "text": "To remove duplicate elements"},
                        {"id": "C", "text": "To use two LIFO reversals and restore FIFO dequeue order"},
                        {"id": "D", "text": "To make a Stack support random access"},
                    ],
                    "explanation": "Pushing into in_stack reverses order once. Moving into out_stack reverses it again, placing the earliest element at the top of out_stack.",
                },
            },
        },
        {
            "id": "stack-q26",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 250(L3 多步狀態) + 250(複合) = 1450
            "baseRating": 1450,
            "code": MONO_STACK_PREDICT_CODE,
            "language": "python",
            "correctAnswer": "1 2 3 4 5 8 4 5 8 4 5 6 7 5 6 7 5 8 9",
            "translations": {
                "zh-TW": {
                    "title": "執行這段單調堆疊程式時，請寫出實際經過的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "這段程式最後會印出 [3, 3, -1]；行號序列需依實際控制流程逐步追蹤。",
                },
                "en": {
                    "title": "When this monotonic stack program runs, write the actual sequence of executed line numbers (space-separated).",
                    "options": [],
                    "explanation": "This program finally prints [3, 3, -1]; the line sequence must be traced from the actual control flow.",
                },
            },
        },
        {
            "id": "stack-q27",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1500
            "baseRating": 1500,
            "code": TWO_STACK_QUEUE_FILL_CODE,
            "language": "python",
            "correctAnswer": ["self.out_stack.append(self.in_stack.pop())", "self.out_stack.pop()"],
            "translations": {
                "zh-TW": {
                    "title": "請補齊兩個 Stack 實作 Queue 的 pop()：out_stack 空時先搬移，最後彈出最早進入的元素。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}],
                    "explanation": "搬移時從 in_stack pop 再 append 到 out_stack，完成兩次反轉；真正出隊時從 out_stack pop。",
                },
                "en": {
                    "title": "Complete pop() for a Queue implemented with two Stacks: refill out_stack when empty, then pop the earliest element.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}],
                    "explanation": "Refilling pops from in_stack and appends to out_stack, creating the second reversal. Dequeue then pops from out_stack.",
                },
            },
        },
        {
            "id": "stack-q28",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "當 MinStack 需要正確處理「重複最小值」時，push(val) 為何常用 val <= min_stack[-1]，而不是只用 val < min_stack[-1]？",
                    "options": [
                        {"id": "A", "text": "因為 Python 不允許比較整數大小"},
                        {"id": "B", "text": "為了正確處理重複最小值被逐一 pop 的情況"},
                        {"id": "C", "text": "為了讓 get_min() 變成 O(n)"},
                        {"id": "D", "text": "因為 Stack 必須由小到大排序"},
                    ],
                    "explanation": "題目已指定重複最小值情境。使用 <= 會把每個最小值同步記錄到 min_stack；彈出其中一個時仍能保留下一個最小值。",
                },
                "en": {
                    "title": "When a MinStack must correctly handle duplicate minimum values, why does push(val) often use val <= min_stack[-1] instead of only val < min_stack[-1]?",
                    "options": [
                        {"id": "A", "text": "Because Python cannot compare integers"},
                        {"id": "B", "text": "To correctly handle repeated minimum values being popped one by one"},
                        {"id": "C", "text": "To make get_min() become O(n)"},
                        {"id": "D", "text": "Because a Stack must stay sorted in ascending order"},
                    ],
                    "explanation": "The question is specifically about duplicate minimum values. <= records each minimum in min_stack, so when one is popped, the next minimum is still preserved.",
                },
            },
        },
        {
            "id": "stack-q29",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "下列哪個做法最能避免遞迴過深造成的 Stack Overflow？",
                    "options": [
                        {"id": "A", "text": "設定明確終止條件，必要時改用迭代法"},
                        {"id": "B", "text": "只增大系統允許的 Stack 大小限制"},
                        {"id": "C", "text": "加入 try-except 捕捉所有例外"},
                        {"id": "D", "text": "把遞迴函式改成名稱較短的函式"},
                    ],
                    "explanation": "Stack Overflow 常來自遞迴層數失控。明確的 base case、限制深度或改寫為迭代法，才是有效防範方式。",
                },
                "en": {
                    "title": "Which approach best helps prevent Stack Overflow caused by overly deep recursion?",
                    "options": [
                        {"id": "A", "text": "Set a clear base case and use iteration when needed"},
                        {"id": "B", "text": "Only increase the system's allowed Stack size"},
                        {"id": "C", "text": "Add try-except to catch every exception"},
                        {"id": "D", "text": "Rename the recursive function to a shorter name"},
                    ],
                    "explanation": "Stack Overflow often comes from uncontrolled recursion depth. A clear base case, depth limits, or an iterative rewrite are effective safeguards.",
                },
            },
        },
        {
            "id": "stack-q30",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 400(L4 複雜控制流/邊界分析) + 250(複合) = 1550
            "baseRating": 1550,
            "correctAnswer": ["opt1", "opt3", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "關於 Stack 進階變體與工具選擇，哪些敘述正確？（多選）",
                    "options": [
                        {"id": "opt1", "text": "MinStack 可用輔助堆疊在 O(1) 取得最小值"},
                        {"id": "opt2", "text": "單調堆疊主要用來維持 FIFO 出隊順序"},
                        {"id": "opt3", "text": "兩個 Stack 可透過兩次反轉實作 Queue"},
                        {"id": "opt4", "text": "LifoQueue 適合需要執行緒安全的 LIFO 場景"},
                    ],
                    "explanation": "MinStack、雙 Stack Queue 與 LifoQueue 的敘述皆正確；單調堆疊用於邊界/極值，不是為了 FIFO 出隊。",
                },
                "en": {
                    "title": "Which statements about advanced Stack variants and tool choices are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "MinStack can use an auxiliary stack to get the minimum in O(1)"},
                        {"id": "opt2", "text": "A monotonic stack mainly maintains FIFO dequeue order"},
                        {"id": "opt3", "text": "Two Stacks can implement a Queue through two reversals"},
                        {"id": "opt4", "text": "LifoQueue fits LIFO scenarios that require thread safety"},
                    ],
                    "explanation": "The MinStack, two-Stack Queue, and LifoQueue statements are correct. A monotonic stack is for boundaries/extrema, not FIFO dequeue order.",
                },
            },
        },
    ],
}

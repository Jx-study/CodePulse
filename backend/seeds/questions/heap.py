HEAP_SCHEDULER_CODE = """\
import heapq

class TaskScheduler:
    def __init__(self):
        self.tasks = []

    def add_task(self, priority, name):
        heapq.heappush(self.tasks, (priority, name))

    def peek_next(self):
        if not self.tasks:
            return None
        return self.tasks[0]

    def run_next(self):
        if not self.tasks:
            return None
        return heapq.heappop(self.tasks)"""

HEAP_PUSH_FILL_CODE = """\
def push_min_heap(heap, value):
    heap.append(value)
    i = len(heap) - 1
    while i > 0:
        parent = (a)
        if heap[parent] <= heap[i]:
            break
        heap[parent], heap[i] = (b)
        i = (c)"""

HEAP_POP_FILL_CODE = """\
def pop_min_heap(heap):
    if not heap:
        return None
    root = heap[0]
    last = heap.pop()
    if heap:
        heap[0] = last
        sift_down(heap, (a))
    return (b)"""

HEAP_PREDICT_CODE = """\
def sift_up(heap, i):                         # L1
    while i > 0:                              # L2
        parent = (i - 1) // 2                 # L3
        if heap[parent] <= heap[i]:           # L4
            break                             # L5
        heap[parent], heap[i] = heap[i], heap[parent]  # L6
        i = parent                            # L7"""

DATA = {
    "slug": "heap",
    "groups": [
        {
            "id": "group-heap-scheduler",
            "translations": {
                "zh-TW": {
                    "title": "題組：任務排程器",
                    "description": "某系統使用 Python 的 heapq 實作最小 Heap。priority 數字越小，任務越早執行。請參考下方程式碼回答問題。",
                },
                "en": {
                    "title": "Group: Task Scheduler",
                    "description": "A system uses Python heapq as a min-heap. The smaller the priority number, the earlier the task runs. Refer to the code below to answer the questions.",
                },
            },
            "code": HEAP_SCHEDULER_CODE,
            "language": "python",
        }
    ],
    "questions": [
        # 【Basic 基礎】 10 題，baseRating < 1000
        # [核心概念] 800 + 0(TF) + 50(L1 定義) + 0(直觀) = 850
        {
            "id": "heap-q1",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "Heap 的根節點永遠是整個結構中第一個被插入的元素。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "Heap 會在插入與刪除後調整節點位置。根節點代表目前的優先順序結果，而不是元素進入資料結構的時間。",
                },
                "en": {
                    "title": "The root of a heap is always the first element that was inserted into the structure.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "A heap adjusts node positions after insertion and deletion. The root reflects the current priority order, not the time at which an element entered the structure.",
                },
            },
        },
        # [核心概念] 800 + 50(SC) + 50(L1 定義) + 0(直觀) = 900
        {
            "id": "heap-q2",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "Heap 通常在概念上被視為哪一種樹狀結構？",
                    "options": [
                        {"id": "A", "text": "任意二元樹"},
                        {"id": "B", "text": "完全二元樹"},
                        {"id": "C", "text": "二元搜尋樹"},
                        {"id": "D", "text": "滿二元樹"},
                    ],
                    "explanation": "Heap 依賴完全二元樹的形狀，才能用陣列連續存放並透過索引計算父子關係。它不要求左小右大，因此不是二元搜尋樹。",
                },
                "en": {
                    "title": "Conceptually, what tree shape is a heap usually based on?",
                    "options": [
                        {"id": "A", "text": "Any binary tree"},
                        {"id": "B", "text": "Complete binary tree"},
                        {"id": "C", "text": "Binary search tree"},
                        {"id": "D", "text": "Full binary tree"},
                    ],
                    "explanation": "A heap relies on the complete binary tree shape so it can be stored continuously in an array and mapped through indices. It does not enforce left-smaller-right-larger ordering.",
                },
            },
        },
        # [核心概念] 800 + 50(SC) + 50(L1 定義) + 50(視覺/相似) = 950
        {
            "id": "heap-q3",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "以下哪一項最精準描述 min-heap 的堆積性質？",
                    "options": [
                        {"id": "A", "text": "每個左子節點都小於右子節點"},
                        {"id": "B", "text": "每一層都必須由小到大排序"},
                        {"id": "C", "text": "每個父節點都小於等於它的子節點"},
                        {"id": "D", "text": "任意節點的左子樹都小於右子樹"},
                    ],
                    "explanation": "min-heap 只約束父子之間的大小關係，不保證兄弟節點、同層節點或左右子樹之間有完整排序。",
                },
                "en": {
                    "title": "Which statement best describes the heap property of a min-heap?",
                    "options": [
                        {"id": "A", "text": "Every left child is smaller than every right child"},
                        {"id": "B", "text": "Each level must be sorted from small to large"},
                        {"id": "C", "text": "Every parent is less than or equal to its children"},
                        {"id": "D", "text": "Every left subtree is smaller than every right subtree"},
                    ],
                    "explanation": "A min-heap only constrains parent-child order. It does not fully sort siblings, levels, or left and right subtrees.",
                },
            },
        },
        # [操作複雜度] 800 + 50(SC) + 50(L1 定義) + 0(直觀) = 900
        {
            "id": "heap-q4",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "在 Heap 中直接讀取極值的時間複雜度是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "極值固定在根節點，也就是陣列索引 0，因此只需要讀取第一個位置即可。",
                },
                "en": {
                    "title": "What is the time complexity of reading the extreme value from a heap?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "The extreme value is fixed at the root, which is array index 0, so reading it only touches the first slot.",
                },
            },
        },
        # [陣列與樹對應] 800 + 0(TF) + 50(L1 定義) + 100(新手誤區) = 950
        {
            "id": "heap-q5",
            "type": "true-false",
            "baseRating": 950,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "Heap 必須用 Node 與 pointer 來實作，因為它本質上是一棵二元樹。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "Heap 概念上是完全二元樹，但不代表實作一定需要指標節點。完全二元樹的形狀緊湊，允許用更連續的方式保存結構。",
                },
                "en": {
                    "title": "A heap must be implemented with nodes and pointers because it is fundamentally a binary tree.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "A heap is conceptually a complete binary tree, but that does not mean it must use pointer-based nodes. The compact shape allows the structure to be stored more continuously.",
                },
            },
        },
        # [陣列與樹對應] 800 + 50(SC) + 50(L1 定義) + 50(視覺/相似) = 950
        {
            "id": "heap-q6",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在 0-indexed 陣列表示的 Heap 中，索引 i 的左子節點索引是多少？",
                    "options": [
                        {"id": "A", "text": "2i"},
                        {"id": "B", "text": "2i + 1"},
                        {"id": "C", "text": "2i + 2"},
                        {"id": "D", "text": "(i - 1) // 2"},
                    ],
                    "explanation": "0-indexed Heap 的根節點在 0，因此左、右子節點分別用 2i + 1 與 2i + 2 定位。",
                },
                "en": {
                    "title": "In a 0-indexed array representation of a heap, what is the left child index of index i?",
                    "options": [
                        {"id": "A", "text": "2i"},
                        {"id": "B", "text": "2i + 1"},
                        {"id": "C", "text": "2i + 2"},
                        {"id": "D", "text": "(i - 1) // 2"},
                    ],
                    "explanation": "With a 0-indexed heap, the root is at 0, so the left and right children are located at 2i + 1 and 2i + 2.",
                },
            },
        },
        # [陣列與樹對應] 800 + 50(SC) + 50(L1 定義) + 50(視覺/相似) = 950
        {
            "id": "heap-q7",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "在 0-indexed 陣列表示的 Heap 中，索引 i 的父節點索引是多少？",
                    "options": [
                        {"id": "A", "text": "i // 2"},
                        {"id": "B", "text": "2i + 1"},
                        {"id": "C", "text": "2i + 2"},
                        {"id": "D", "text": "(i - 1) // 2"},
                    ],
                    "explanation": "扣掉根節點偏移後再做整數除法，能把左右子節點都映射回同一個父節點。",
                },
                "en": {
                    "title": "In a 0-indexed array representation of a heap, what is the parent index of index i?",
                    "options": [
                        {"id": "A", "text": "i // 2"},
                        {"id": "B", "text": "2i + 1"},
                        {"id": "C", "text": "2i + 2"},
                        {"id": "D", "text": "(i - 1) // 2"},
                    ],
                    "explanation": "Subtracting the root offset before integer division maps both left and right children back to the same parent.",
                },
            },
        },
        # [優先佇列差異] 800 + 50(SC) + 50(L1 定義) + 50(視覺/相似) = 950
        {
            "id": "heap-q8",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "優先佇列與 Heap 的關係，哪個說法最正確？",
                    "options": [
                        {"id": "A", "text": "優先佇列是抽象行為，Heap 是常見的高效實作"},
                        {"id": "B", "text": "優先佇列一定只能用 Heap 實作"},
                        {"id": "C", "text": "Heap 是優先佇列的抽象規格"},
                        {"id": "D", "text": "優先佇列必須維持 FIFO 順序，與 Heap 的行為相反"},
                    ],
                    "explanation": "優先佇列定義的是取出最高或最低優先權的行為；Heap 是能讓這些操作維持高效率的具體資料結構。",
                },
                "en": {
                    "title": "Which statement best describes the relationship between a priority queue and a heap?",
                    "options": [
                        {"id": "A", "text": "A priority queue is abstract behavior; a heap is a common efficient implementation"},
                        {"id": "B", "text": "A priority queue can only be implemented with a heap"},
                        {"id": "C", "text": "A heap is the abstract specification of a priority queue"},
                        {"id": "D", "text": "A priority queue must preserve FIFO order, which is the opposite of heap behavior"},
                    ],
                    "explanation": "A priority queue defines behavior for removing the highest or lowest priority item. A heap is a concrete structure that keeps those operations efficient.",
                },
            },
        },
        # [可以優化什麼] 800 + 50(SC) + 50(L1 定義) + 50(視覺/相似) = 950
        {
            "id": "heap-q9",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "Heap 最不擅長下列哪一種操作？",
                    "options": [
                        {"id": "A", "text": "讀取極值"},
                        {"id": "B", "text": "插入新元素"},
                        {"id": "C", "text": "尋找任意指定值"},
                        {"id": "D", "text": "刪除目前極值"},
                    ],
                    "explanation": "Heap 只保證父子大小關係，沒有提供任意值的排序位置。若要快速定位特定元素，常需要額外的字典或索引表。",
                },
                "en": {
                    "title": "Which operation is a heap least suited for?",
                    "options": [
                        {"id": "A", "text": "Reading the extreme value"},
                        {"id": "B", "text": "Inserting a new element"},
                        {"id": "C", "text": "Finding an arbitrary target value"},
                        {"id": "D", "text": "Deleting the current extreme value"},
                    ],
                    "explanation": "A heap only guarantees parent-child order; it does not give arbitrary values a searchable sorted position. Fast target lookup often needs an extra dictionary or index map.",
                },
            },
        },
        # [適合處理的問題] 800 + 50(SC) + 50(L1 定義) + 50(視覺/相似) = 950
        {
            "id": "heap-q10",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "看到哪一類需求時，最容易聯想到使用 Heap？",
                    "options": [
                        {"id": "A", "text": "需要保留所有元素的插入順序"},
                        {"id": "B", "text": "需要依照 key 做 O(1) 查找"},
                        {"id": "C", "text": "需要經常在陣列頭部插入元素"},
                        {"id": "D", "text": "需要反覆取得目前最大或最小的元素"},
                    ],
                    "explanation": "Heap 的核心價值是讓動態資料中的極值保持在根節點，適合 Top-k、排程與多路合併這類需求。",
                },
                "en": {
                    "title": "Which requirement most strongly suggests using a heap?",
                    "options": [
                        {"id": "A", "text": "Preserving insertion order for all elements"},
                        {"id": "B", "text": "Looking up by key in O(1)"},
                        {"id": "C", "text": "Frequently inserting at the front of an array"},
                        {"id": "D", "text": "Repeatedly retrieving the current largest or smallest element"},
                    ],
                    "explanation": "The core value of a heap is keeping the extreme value of dynamic data at the root, which fits Top-k, scheduling, and k-way merge problems.",
                },
            },
        },
        # 【Application 應用】 10 題，1000 <= baseRating < 1400
        # [題組/優先佇列差異] 800 + 50(SC) + 100(L2 比較/動態) + 50(視覺/相似) = 1000
        {
            "id": "heap-q11",
            "groupId": "group-heap-scheduler",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "依序執行 add_task(3, 'build')、add_task(1, 'deploy')、add_task(2, 'test') 後，peek_next() 會回傳哪個任務？",
                    "options": [
                        {"id": "A", "text": "(3, 'build')"},
                        {"id": "B", "text": "(1, 'deploy')"},
                        {"id": "C", "text": "(2, 'test')"},
                        {"id": "D", "text": "None"},
                    ],
                    "explanation": "peek 與 pop 的差別在於是否改變資料結構。排程題要先判斷目前排在最前面的項目，再確認這次操作是否會取走它。",
                },
                "en": {
                    "title": "After add_task(3, 'build'), add_task(1, 'deploy'), and add_task(2, 'test'), what does peek_next() return?",
                    "options": [
                        {"id": "A", "text": "(3, 'build')"},
                        {"id": "B", "text": "(1, 'deploy')"},
                        {"id": "C", "text": "(2, 'test')"},
                        {"id": "D", "text": "None"},
                    ],
                    "explanation": "The difference between peek and pop is whether the data structure changes. In scheduling questions, first identify the front item, then check whether the operation removes it.",
                },
            },
        },
        # [題組/操作複雜度] 800 + 50(SC) + 100(L2 比較/動態) + 50(視覺/相似) = 1000
        {
            "id": "heap-q12",
            "groupId": "group-heap-scheduler",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在 TaskScheduler 中，add_task 使用 heappush。當目前有 n 個任務時，新增一個任務的時間複雜度通常是多少？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(n)"},
                        {"id": "C", "text": "O(log n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "新項目先放到陣列尾端，再沿著樹高向上調整。完全二元樹的高度與 log n 同階。",
                },
                "en": {
                    "title": "TaskScheduler uses heappush in add_task. With n existing tasks, what is the usual time complexity of adding one task?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(n)"},
                        {"id": "C", "text": "O(log n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "The new item is placed at the end of the array and then adjusted upward along the tree height. A complete binary tree has height proportional to log n.",
                },
            },
        },
        # [題組/操作複雜度] 800 + 50(SC) + 100(L2 比較/動態) + 50(視覺/相似) = 1000
        {
            "id": "heap-q13",
            "groupId": "group-heap-scheduler",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "若 tasks 目前為空，呼叫 run_next() 的回傳值是什麼？",
                    "options": [
                        {"id": "A", "text": "None"},
                        {"id": "B", "text": "()"},
                        {"id": "C", "text": "IndexError"},
                        {"id": "D", "text": "0"},
                    ],
                    "explanation": "run_next 先檢查空 Heap。這類邊界處理能避免對空陣列執行 heappop 而造成錯誤。",
                },
                "en": {
                    "title": "If tasks is currently empty, what does run_next() return?",
                    "options": [
                        {"id": "A", "text": "None"},
                        {"id": "B", "text": "()"},
                        {"id": "C", "text": "IndexError"},
                        {"id": "D", "text": "0"},
                    ],
                    "explanation": "run_next checks for an empty heap first. This boundary handling avoids calling heappop on an empty array.",
                },
            },
        },
        # [核心概念] 800 + 100(MC) + 100(L2 比較/動態) + 100(新手誤區) = 1100
        {
            "id": "heap-q14",
            "type": "multiple-choice",
            "baseRating": 1100,
            "correctAnswer": ["A", "C"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些陣列可能是合法的 min-heap？（多選）",
                    "options": [
                        {"id": "A", "text": "[1, 3, 2, 7, 8, 4]"},
                        {"id": "B", "text": "[1, 5, 2, 3, 4, 6]"},
                        {"id": "C", "text": "[2, 4, 3, 9, 7, 5]"},
                        {"id": "D", "text": "[3, 1, 4, 5, 6, 7]"},
                    ],
                    "explanation": "min-heap 的合法性是局部性質，與整個陣列是否呈現全域遞增順序是兩件不同的事。",
                },
                "en": {
                    "title": "Which arrays could be valid min-heaps? (Multiple choice)",
                    "options": [
                        {"id": "A", "text": "[1, 3, 2, 7, 8, 4]"},
                        {"id": "B", "text": "[1, 5, 2, 3, 4, 6]"},
                        {"id": "C", "text": "[2, 4, 3, 9, 7, 5]"},
                        {"id": "D", "text": "[3, 1, 4, 5, 6, 7]"},
                    ],
                    "explanation": "Min-heap validity is a local property. It is separate from whether the whole array appears in globally increasing order.",
                },
            },
        },
        # [操作複雜度] 800 + 50(SC) + 100(L2 比較/動態) + 100(新手誤區) = 1050
        {
            "id": "heap-q15",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "從 min-heap 刪除根節點後，通常會先把哪個元素移到根節點再向下調整？",
                    "options": [
                        {"id": "A", "text": "左子節點"},
                        {"id": "B", "text": "右子節點"},
                        {"id": "C", "text": "陣列最後一個元素"},
                        {"id": "D", "text": "陣列中第二小的元素"},
                    ],
                    "explanation": "用最後一個元素補到根節點，可以維持完全二元樹的緊密形狀，接著再透過 sift down 修復堆積性質。",
                },
                "en": {
                    "title": "After deleting the root of a min-heap, which element is usually moved to the root before sifting down?",
                    "options": [
                        {"id": "A", "text": "The left child"},
                        {"id": "B", "text": "The right child"},
                        {"id": "C", "text": "The last element in the array"},
                        {"id": "D", "text": "The second-smallest element in the array"},
                    ],
                    "explanation": "Moving the last element to the root preserves the compact complete-tree shape. Then sift down repairs the heap property.",
                },
            },
        },
        # [操作複雜度] 800 + 0(TF) + 250(L3 多步狀態) + 100(新手誤區) = 1150
        {
            "id": "heap-q16",
            "type": "true-false",
            "baseRating": 1150,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "把 n 個元素逐一 heappush 到空 Heap，總時間一定是 O(n)，因為每次插入都只改動一個位置。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "逐一插入與一次建堆的成本模型不同。插入會觸發局部調整；若目標是從既有資料建立 Heap，heapify 才是另一種需要分開分析的做法。",
                },
                "en": {
                    "title": "Pushing n elements one by one into an empty heap is always O(n), because each insertion changes only one position.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Repeated insertion and building a heap at once have different cost models. Insertion triggers local adjustment; heapify is a separate approach when the goal is to build from existing data.",
                },
            },
        },
        # [適合處理的問題] 800 + 50(SC) + 100(L2 比較/動態) + 100(新手誤區) = 1050
        {
            "id": "heap-q17",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若要從大量數字串流中維持目前前 10 大元素，最適合的策略是哪一個？",
                    "options": [
                        {"id": "A", "text": "每次新數字進來都完整排序全部資料"},
                        {"id": "B", "text": "維持大小為 10 的 min-heap"},
                        {"id": "C", "text": "維持大小為 10 的 stack"},
                        {"id": "D", "text": "只保留最後 10 個輸入值"},
                    ],
                    "explanation": "Top-k 場景只需要保留候選集合。用固定大小的 min-heap，可讓根節點代表目前前 10 大中最小的門檻值。",
                },
                "en": {
                    "title": "To maintain the current top 10 largest numbers from a large stream, which strategy fits best?",
                    "options": [
                        {"id": "A", "text": "Sort all data after every new number"},
                        {"id": "B", "text": "Maintain a min-heap of size 10"},
                        {"id": "C", "text": "Maintain a stack of size 10"},
                        {"id": "D", "text": "Keep only the last 10 input values"},
                    ],
                    "explanation": "Top-k problems only need a candidate set. A fixed-size min-heap makes the root the threshold among the current top 10 values.",
                },
            },
        },
        # [適合處理的問題] 800 + 50(SC) + 100(L2 比較/動態) + 100(新手誤區) = 1050
        {
            "id": "heap-q18",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "在 Dijkstra 演算法中，Heap 常用來加速哪個步驟？",
                    "options": [
                        {"id": "A", "text": "取出目前距離起點最近的未處理節點"},
                        {"id": "B", "text": "檢查圖是否為二分圖"},
                        {"id": "C", "text": "把邊依照輸入順序保存"},
                        {"id": "D", "text": "用遞迴列出所有路徑"},
                    ],
                    "explanation": "Dijkstra 會反覆選出目前距離最小的候選節點。min-heap 能讓這個選擇在動態更新中保持高效率。",
                },
                "en": {
                    "title": "In Dijkstra's algorithm, what step is a heap commonly used to speed up?",
                    "options": [
                        {"id": "A", "text": "Extracting the unprocessed node with the smallest current distance from the start"},
                        {"id": "B", "text": "Checking whether the graph is bipartite"},
                        {"id": "C", "text": "Storing edges in input order"},
                        {"id": "D", "text": "Recursively listing all paths"},
                    ],
                    "explanation": "Dijkstra repeatedly chooses the candidate node with the smallest current distance. A min-heap keeps that choice efficient under updates.",
                },
            },
        },
        # [適合處理的問題] 800 + 50(SC) + 100(L2 比較/動態) + 100(新手誤區) = 1050
        {
            "id": "heap-q19",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "要合併 k 個已排序資料流時，Heap 中通常會放入什麼？",
                    "options": [
                        {"id": "A", "text": "所有資料流的完整內容"},
                        {"id": "B", "text": "每個資料流的最後一個元素"},
                        {"id": "C", "text": "資料流的長度"},
                        {"id": "D", "text": "每個資料流目前尚未輸出的最小候選元素"},
                    ],
                    "explanation": "多路合併每次只需要知道下一個最小候選者。Heap 保存各資料流的目前候選元素，就能逐步產生排序輸出。",
                },
                "en": {
                    "title": "When merging k sorted streams, what is usually stored in the heap?",
                    "options": [
                        {"id": "A", "text": "The complete content of every stream"},
                        {"id": "B", "text": "The last element of each stream"},
                        {"id": "C", "text": "The length of each stream"},
                        {"id": "D", "text": "The current smallest not-yet-output candidate from each stream"},
                    ],
                    "explanation": "K-way merge only needs the next smallest candidate each time. Storing each stream's current candidate in a heap produces sorted output step by step.",
                },
            },
        },
        # [陣列與樹對應] 800 + 50(SC) + 100(L2 比較/動態) + 100(新手誤區) = 1050
        {
            "id": "heap-q20",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在陣列 heap = [2, 5, 3, 9, 7, 4] 中，索引 2 的右子節點值是多少？",
                    "options": [
                        {"id": "A", "text": "不存在"},
                        {"id": "B", "text": "3"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "7"},
                    ],
                    "explanation": "用陣列索引看 Heap 時，應先計算子節點位置，再確認該位置是否落在陣列範圍內。",
                },
                "en": {
                    "title": "In heap = [2, 5, 3, 9, 7, 4], what is the value of the right child of index 2?",
                    "options": [
                        {"id": "A", "text": "It does not exist"},
                        {"id": "B", "text": "3"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "7"},
                    ],
                    "explanation": "When reading a heap as an array, compute the child index first, then check whether that index is inside the array bounds.",
                },
            },
        },
        # 【Complexity 複雜度】 10 題，baseRating >= 1400
        # [操作複雜度] 800 + 50(SC) + 400(L4 複雜控制流) + 250(複合陷阱) = 1500
        {
            "id": "heap-q21",
            "type": "single-choice",
            "baseRating": 1500,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "對一個大小維持約 n 的 Heap，重複執行 n 次「讀取極值、刪除極值、再插入一個新元素」，總時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "單輪操作包含常數時間讀取與兩個對數級更新；當這個流程被重複 n 輪時，主導成本會被外層次數放大。",
                },
                "en": {
                    "title": "For a heap whose size stays around n, repeat this n times: read the extreme value, delete it, then insert one new element. What is the total time complexity?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "One round contains a constant-time read and two logarithmic updates. When that workflow repeats n times, the outer count multiplies the dominant cost.",
                },
            },
        },
        # [陣列與樹對應] 800 + 50(SC) + 400(L4 複雜控制流) + 250(複合陷阱) = 1500
        {
            "id": "heap-q22",
            "type": "single-choice",
            "baseRating": 1500,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "陣列 [4, 9, 6, 10, 12, 8, 7] 表示一個 min-heap。刪除根節點後，若先把最後元素 7 放到根節點，第一次 sift down 應該與哪個子節點交換？",
                    "options": [
                        {"id": "A", "text": "與值 6 的右子節點交換"},
                        {"id": "B", "text": "與值 9 的左子節點交換"},
                        {"id": "C", "text": "與值 10 的節點交換"},
                        {"id": "D", "text": "不需要交換"},
                    ],
                    "explanation": "sift down 的交換對象必須讓交換後的位置仍有機會滿足 min-heap 的父子大小限制，而不是只看單一路徑。",
                },
                "en": {
                    "title": "The array [4, 9, 6, 10, 12, 8, 7] is a min-heap. After deleting the root and moving the last element 7 to the root, which child should the first sift-down swap with?",
                    "options": [
                        {"id": "A", "text": "Swap with the right child whose value is 6"},
                        {"id": "B", "text": "Swap with the left child whose value is 9"},
                        {"id": "C", "text": "Swap with the node whose value is 10"},
                        {"id": "D", "text": "No swap is needed"},
                    ],
                    "explanation": "The swap target in sift down must keep the position capable of satisfying the min-heap parent-child constraint, rather than considering only one path.",
                },
            },
        },
        # [核心概念] 800 + 100(MC) + 400(L4 複雜控制流) + 250(複合陷阱) = 1550
        {
            "id": "heap-q23",
            "type": "multiple-choice",
            "baseRating": 1550,
            "correctAnswer": ["A", "D"],
            "translations": {
                "zh-TW": {
                    "title": "以下關於 Heap 與排序的敘述，哪些正確？（多選）",
                    "options": [
                        {"id": "A", "text": "Heap 陣列不一定是完整排序的陣列"},
                        {"id": "B", "text": "min-heap 的任意左子樹都必然小於任意右子樹"},
                        {"id": "C", "text": "只要根節點最小，就一定是合法 min-heap"},
                        {"id": "D", "text": "Heap 可用於 heapsort，但維持 heap 本身不等於已排序"},
                    ],
                    "explanation": "Heap 約束的範圍與全序排序的範圍不同；它保存的是能支援極值操作的結構性關係。",
                },
                "en": {
                    "title": "Which statements about heaps and sorting are correct? (Multiple choice)",
                    "options": [
                        {"id": "A", "text": "A heap array is not necessarily fully sorted"},
                        {"id": "B", "text": "In a min-heap, every left subtree must be smaller than every right subtree"},
                        {"id": "C", "text": "If the root is the minimum, the structure must be a valid min-heap"},
                        {"id": "D", "text": "A heap can be used for heapsort, but maintaining a heap is not the same as being sorted"},
                    ],
                    "explanation": "The scope of heap constraints differs from the scope of total ordering; a heap preserves the structural relationship needed for extreme-value operations.",
                },
            },
        },
        # [操作複雜度] 800 + 50(SC) + 400(L4 複雜控制流) + 250(複合陷阱) = 1500
        {
            "id": "heap-q24",
            "type": "single-choice",
            "baseRating": 1500,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "若用「未排序陣列」實作優先佇列，與用 Heap 實作相比，下列複雜度組合哪個正確？",
                    "options": [
                        {"id": "A", "text": "未排序陣列插入 O(log n)，刪除極值 O(log n)"},
                        {"id": "B", "text": "未排序陣列插入 O(n)，刪除極值 O(1)"},
                        {"id": "C", "text": "未排序陣列插入 O(1)，刪除極值 O(n)；Heap 兩者常為 O(log n)"},
                        {"id": "D", "text": "未排序陣列插入 O(1)，刪除極值 O(log n)"},
                    ],
                    "explanation": "未排序陣列新增很便宜，但取出極值前必須掃描找出最佳項目。Heap 則把成本分攤到每次局部調整。",
                },
                "en": {
                    "title": "If a priority queue is implemented with an unsorted array instead of a heap, which complexity comparison is correct?",
                    "options": [
                        {"id": "A", "text": "Unsorted array insertion O(log n), delete extreme O(log n)"},
                        {"id": "B", "text": "Unsorted array insertion O(n), delete extreme O(1)"},
                        {"id": "C", "text": "Unsorted array insertion O(1), delete extreme O(n); heap often makes both O(log n)"},
                        {"id": "D", "text": "Unsorted array insertion O(1), delete extreme O(log n)"},
                    ],
                    "explanation": "An unsorted array makes insertion cheap, but deleting the extreme requires scanning for the best item. A heap distributes the cost through local adjustments.",
                },
            },
        },
        # [適合處理的問題] 800 + 50(SC) + 400(L4 複雜控制流) + 250(複合陷阱) = 1500
        {
            "id": "heap-q25",
            "type": "single-choice",
            "baseRating": 1500,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "用大小為 k 的 min-heap 掃描 n 個數字維持前 k 大，最後再把 heap 內 k 個候選值逐一 pop 出形成排序結果，總時間複雜度通常是多少？",
                    "options": [
                        {"id": "A", "text": "O(n log k)"},
                        {"id": "B", "text": "O(n log k + k log k)"},
                        {"id": "C", "text": "O(n²)"},
                        {"id": "D", "text": "O(n log n + k)"},
                    ],
                    "explanation": "這題包含兩段成本：掃描資料時維持固定大小候選集合，以及最後把候選集合輸出。兩段都要保留，不能只看其中一段。",
                },
                "en": {
                    "title": "Use a min-heap of size k to scan n numbers and maintain the top k. Then pop the k candidate values from the heap to produce a sorted result. What is the usual total time complexity?",
                    "options": [
                        {"id": "A", "text": "O(n log k)"},
                        {"id": "B", "text": "O(n log k + k log k)"},
                        {"id": "C", "text": "O(n²)"},
                        {"id": "D", "text": "O(n log n + k)"},
                    ],
                    "explanation": "This question has two cost phases: maintaining the fixed-size candidate set while scanning data, and then outputting that candidate set. Both phases matter.",
                },
            },
        },
        # [操作複雜度] 800 + 150(FC) + 250(L3 多步狀態) + 250(複合陷阱) = 1450
        {
            "id": "heap-q26",
            "type": "fill-code",
            "baseRating": 1450,
            "code": HEAP_PUSH_FILL_CODE,
            "language": "python",
            "correctAnswer": ["(i - 1) // 2", "heap[i], heap[parent]", "parent"],
            "translations": {
                "zh-TW": {
                    "title": "請填入 push_min_heap 中 (a)(b)(c) 的程式碼，使新元素能向上調整並維持 min-heap 性質。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "向上調整需要找到父節點，當父節點較大時交換父子位置，並把目前索引移到父節點繼續檢查。",
                },
                "en": {
                    "title": "Fill in (a)(b)(c) in push_min_heap so the new element sifts upward and preserves the min-heap property.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "Sifting upward finds the parent, swaps when the parent is larger, and moves the current index to the parent for the next check.",
                },
            },
        },
        # [操作複雜度] 800 + 150(FC) + 250(L3 多步狀態) + 250(複合陷阱) = 1450
        {
            "id": "heap-q27",
            "type": "fill-code",
            "baseRating": 1450,
            "code": HEAP_POP_FILL_CODE,
            "language": "python",
            "correctAnswer": ["0", "root"],
            "translations": {
                "zh-TW": {
                    "title": "請填入 pop_min_heap 中 (a)(b) 的程式碼，使函式刪除並回傳原本的根節點。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}],
                    "explanation": "刪除根節點後，最後元素補到索引 0，向下調整也必須從根節點開始；函式最後回傳的是一開始保存的極值。",
                },
                "en": {
                    "title": "Fill in (a)(b) in pop_min_heap so the function removes and returns the original root.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}],
                    "explanation": "After removing the root, the last element is placed at index 0, so sifting down starts from the root. The function returns the extreme value saved at the start.",
                },
            },
        },
        # [操作複雜度] 800 + 150(PL) + 400(L4 複雜控制流) + 250(複合陷阱) = 1600
        {
            "id": "heap-q28",
            "type": "predict-line",
            "baseRating": 1600,
            "code": HEAP_PREDICT_CODE,
            "language": "python",
            "correctAnswer": "1 2 3 4 6 7 2 3 4 6 7",
            "translations": {
                "zh-TW": {
                    "title": "給定 heap = [3, 5, 4, 9, 1]，執行 sift_up(heap, 4)。請依序填寫執行經過的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "sift_up 每一輪都會先檢查目前索引是否仍有父節點，再比較父子大小；若違反 min-heap 性質就交換並繼續往根節點方向前進。",
                },
                "en": {
                    "title": "Given heap = [3, 5, 4, 9, 1], run sift_up(heap, 4). Write the executed line-number sequence, separated by spaces.",
                    "options": [],
                    "explanation": "Each sift_up round first checks whether the current index still has a parent, then compares parent and child. If the min-heap property is violated, it swaps and continues toward the root.",
                },
            },
        },
        # [可以優化什麼] 800 + 50(SC) + 600(L5 系統級分析) + 250(複合陷阱) = 1700
        {
            "id": "heap-q29",
            "type": "single-choice",
            "baseRating": 1700,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "某系統需要頻繁 decrease-key 並合併多個 Heap；若二元 Heap 成為瓶頸，教學中建議可考慮哪類替代結構？",
                    "options": [
                        {"id": "A", "text": "Stack 或 Queue"},
                        {"id": "B", "text": "斐波那契堆積或配對堆"},
                        {"id": "C", "text": "未排序陣列"},
                        {"id": "D", "text": "平衡 BST（如紅黑樹）"},
                    ],
                    "explanation": "二元 Heap 在一般優先權操作很穩定，但合併與鍵值更新頻繁時，進階堆積結構可能提供更合適的成本模型。",
                },
                "en": {
                    "title": "A system frequently performs decrease-key and merges multiple heaps. If a binary heap becomes the bottleneck, what alternative structures does the lesson suggest considering?",
                    "options": [
                        {"id": "A", "text": "Stack or Queue"},
                        {"id": "B", "text": "Fibonacci heap or pairing heap"},
                        {"id": "C", "text": "Unsorted array"},
                        {"id": "D", "text": "Balanced BST, such as a red-black tree"},
                    ],
                    "explanation": "A binary heap is reliable for common priority operations, but frequent merging and key updates may benefit from advanced heap structures with a more suitable cost model.",
                },
            },
        },
        # [適合處理的問題] 800 + 50(SC) + 600(L5 系統級分析) + 250(複合陷阱) = 1700
        {
            "id": "heap-q30",
            "type": "single-choice",
            "baseRating": 1700,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "你要設計一個事件模擬器：事件會動態新增，系統每次都要處理時間戳記最早的事件。哪個設計最符合 Heap 的強項？",
                    "options": [
                        {"id": "A", "text": "用 stack 保存事件，讓最後加入的事件先處理"},
                        {"id": "B", "text": "用排序好的陣列保存事件，每次取首端並 shift"},
                        {"id": "C", "text": "用 hash map 依事件名稱查找，忽略時間順序"},
                        {"id": "D", "text": "用 min-heap 以時間戳記作為 priority 管理事件"},
                    ],
                    "explanation": "事件模擬器需要在動態新增與反覆取最早事件之間取得平衡。min-heap 能讓最早時間戳記停在根節點，新增與取出都維持對數級調整。",
                },
                "en": {
                    "title": "You are designing an event simulator: events are added dynamically, and the system must always process the event with the earliest timestamp. Which design best matches a heap's strength?",
                    "options": [
                        {"id": "A", "text": "Use a stack so the most recently added event runs first"},
                        {"id": "B", "text": "Store events in a sorted array, then take from the front and shift each time"},
                        {"id": "C", "text": "Use a hash map by event name and ignore time order"},
                        {"id": "D", "text": "Use a min-heap with timestamp as the priority"},
                    ],
                    "explanation": "An event simulator needs to balance dynamic insertion with repeated earliest-event extraction. A min-heap keeps the earliest timestamp at the root while insertion and extraction stay logarithmic.",
                },
            },
        },
    ],
}

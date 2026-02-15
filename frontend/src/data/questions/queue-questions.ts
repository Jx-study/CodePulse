/**
 * Queue (佇列) 練習題庫
 * 包含基礎特性題、應用題和複雜度分析題
 */

import type { PracticeQuiz } from "@/types/practice";

const circularQueueCode = `class CircularQueue:
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
        return self.queue[self.front]`;

const circularQueueFillCode = `class CircularQueue:
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
        return self.queue[self.front]`;

const printBufferCode = `class PrintBuffer:
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
        return self.queue.pop(0)  # List pop(0) acts as dequeue`;

export const queueQuiz: PracticeQuiz = {
  levelId: "queue",
  levelName: "佇列 (Queue)",
  passingScore: 60,
  groups: [
    {
      id: "group-print-buffer",
      title: "題組：印表機緩衝區管理",
      description:
        "某辦公室使用一個容量為 3 的印表機緩衝區 (Print Buffer) 來管理列印工作。該緩衝區使用 Queue 資料結構實作，採 FIFO 原則。請參考下方實作程式碼回答下列問題。",
      code: printBufferCode,
      language: "python",
      questionIds: ["q-group-1", "q-group-2", "q-group-3"],
    },
  ],
  questions: [
    {
      id: "q-group-1",
      groupId: "group-print-buffer",
      type: "single-choice",
      category: "application",
      difficulty: 2,
      difficultyRating: 1000,
      title:
        "若依序執行：add_job('DocA'), add_job('DocB'), add_job('DocC'), add_job('DocD')。請問最後一個操作的回傳值是什麼？",
      options: [
        { id: "A", text: "Added" },
        { id: "B", text: "Buffer Full" }, // 容量為 3，第四個會滿
        { id: "C", text: "Error" },
        { id: "D", text: "DocD" },
      ],
      correctAnswer: "B",
      explanation:
        "緩衝區容量為 3。加入 A, B, C 後佇列已滿 ([A, B, C])。第四個 DocD 加入時會觸發 'Buffer Full'。",
      points: 2,
    },
    {
      id: "q-group-2",
      groupId: "group-print-buffer",
      type: "single-choice",
      category: "application",
      difficulty: 2,
      difficultyRating: 1100,
      title:
        "承上題狀態 (Queue內容為 [DocA, DocB, DocC])，若現在執行一次 process_job()，哪一份文件會被印出？",
      options: [
        { id: "A", text: "DocA" },
        { id: "B", text: "DocB" },
        { id: "C", text: "DocC" },
        { id: "D", text: "No Jobs" },
      ],
      correctAnswer: "A",
      explanation:
        "Queue 是 FIFO 結構，process_job 使用 pop(0) 移除最前端元素。DocA 是最早進入的，因此最先被移除。",
      points: 2,
    },
    {
      id: "q-group-3",
      groupId: "group-print-buffer",
      type: "fill-code",
      category: "complexity",
      difficulty: 3,
      difficultyRating: 1300,
      title:
        "Python 的 list `pop(0)` 操作雖然能模擬 dequeue，但在時間複雜度上並不高效。請問 `pop(0)` 的時間複雜度是 O(___)？若要達到 O(1)，應該改用 Python `collections` 模組中的哪個資料結構？(請填入兩個答案)",
      options: [
        { id: "1", text: "複雜度" },
        { id: "2", text: "資料結構" },
      ],
      correctAnswer: ["n", "deque"],
      explanation:
        "1. Python list 底層是陣列，移除第一個元素需要移動剩餘所有元素，故為 O(n)。\n2. `collections.deque` (雙端佇列) 支援 O(1) 的兩端操作。",
      points: 3,
    },
    {
      id: "queue-code-fill-1",
      type: "fill-code",
      category: "application",
      difficulty: 3,
      difficultyRating: 1450,
      title:
        "請閱讀下方的 Circular Queue 實作程式碼，並填入 (a), (b), (c) 處缺失的變數或數值，使其邏輯正確。",
      code: circularQueueFillCode,
      language: "python",
      // 定義填空欄位
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
      ],
      // 正確答案 (順序對應 options)
      correctAnswer: ["0", "self.capacity", "0"],
      explanation:
        "1. (a) 初始化 front 指標為 0。\n2. (b) 環狀佇列移動指標需取餘數 capacity (self.capacity)。\n3. (c) 判斷佇列是否為空，檢查 size 是否為 0。",
      points: 5,
    },
    {
      id: "queue-code-1",
      type: "predict-line",
      category: "application",
      difficulty: 3,
      difficultyRating: 1500,
      title:
        "請閱讀下方的 Circular Queue 實作程式碼。假設目前 Queue 內資料為 [1, 2, 3] (Capacity=5)，且 front=0, rear=3, size=3。\n\n若執行一次 `dequeue()` 操作，請依序填寫程式執行的行號序列 (以空格分隔)。",
      code: circularQueueCode,
      language: "python",
      // 選項可以是空的，因為這是填充題
      options: [],
      // 正確答案 (字串形式)
      correctAnswer: "17 18 21 22 23 24",
      explanation:
        "執行流程如下：\n1. 呼叫 dequeue (L17)\n2. 檢查 size 是否為 0 (L18)，目前 size=3，條件為 False\n3. 取出 value (L21)\n4. 更新 front 指標 (L22)\n5. 更新 size (L23)\n6. 回傳 value (L24)",
      points: 5,
    },
    {
      id: "queue-tf-1",
      type: "true-false",
      category: "basic",
      difficulty: 1,
      difficultyRating: 800,
      title: "Queue 是一種 LIFO (Last-In, First-Out) 的資料結構。",
      options: [
        { id: "true", text: "正確" },
        { id: "false", text: "錯誤" },
      ],
      correctAnswer: "false", // 答案對應 option.id
      explanation: "Queue 是 FIFO (First-In, First-Out)，Stack 才是 LIFO。",
      points: 1,
    },
    {
      id: "queue-multi-1",
      type: "multiple-choice",
      category: "application",
      difficulty: 2,
      difficultyRating: 1100,
      title: "以下哪些場景適合使用 Queue (佇列)？(多選)",
      options: [
        { id: "opt1", text: "印表機的列印任務排程" },
        { id: "opt2", text: "瀏覽器的上一頁功能" }, // 這是 Stack
        { id: "opt3", text: "廣度優先搜尋 (BFS)" },
        { id: "opt4", text: "遞迴函數的呼叫管理" }, // 這是 Stack
      ],
      correctAnswer: ["opt1", "opt3"], // 陣列形式
      explanation:
        "印表機排程和 BFS 都需要「先來先服務」的特性，因此使用 Queue。瀏覽器上一頁和遞迴呼叫則使用 Stack。",
      points: 2,
    },
    {
      id: "queue-q1",
      type: "single-choice",
      category: "basic",
      difficulty: 1,
      difficultyRating: 800,
      title: "在佇列 (Queue) 資料結構中，最先進入的元素會如何被處理？",
      options: [
        { id: "A", text: "最先被取出" },
        { id: "B", text: "最後被取出" },
        { id: "C", text: "隨機被取出" },
        { id: "D", text: "永遠留在佇列中" },
      ],
      correctAnswer: "A",
      explanation:
        "沒錯！這就是 FIFO (First-In, First-Out) 原則，就像排隊買票一樣，先排隊的人會先被服務。",
      points: 1,
    },
    {
      id: "queue-q2",
      type: "single-choice",
      category: "basic",
      difficulty: 1,
      difficultyRating: 850,
      title: "Queue 的 enqueue 操作是在哪裡加入新元素？",
      options: [
        { id: "A", text: "前端 (Front)" },
        { id: "B", text: "後端 (Rear/Back)" },
        { id: "C", text: "中間位置" },
        { id: "D", text: "任意位置" },
      ],
      correctAnswer: "B",
      explanation:
        "enqueue 操作總是在佇列的後端 (Rear) 加入新元素，這就像新來的人必須排在隊伍的最後面。",
      points: 1,
    },
    {
      id: "queue-q3",
      type: "single-choice",
      category: "basic",
      difficulty: 1,
      difficultyRating: 850,
      title: "Queue 的 dequeue 操作會執行什麼動作？",
      options: [
        { id: "A", text: "從後端移除並返回元素" },
        { id: "B", text: "從前端移除並返回元素" },
        { id: "C", text: "查看前端元素但不移除" },
        { id: "D", text: "清空整個佇列" },
      ],
      correctAnswer: "B",
      explanation:
        "dequeue 操作會從佇列的前端 (Front) 移除並返回元素，就像排在最前面的人會先離開隊伍去被服務。",
      points: 1,
    },
    {
      id: "queue-q4",
      type: "single-choice",
      category: "basic",
      difficulty: 1,
      difficultyRating: 900,
      title: "以下哪個操作可以查看 Queue 前端的元素但不移除它？",
      options: [
        { id: "A", text: "enqueue" },
        { id: "B", text: "dequeue" },
        { id: "C", text: "front / peek" },
        { id: "D", text: "isEmpty" },
      ],
      correctAnswer: "C",
      explanation:
        "front (或稱為 peek) 操作允許我們查看佇列前端的元素而不移除它，這在需要檢查下一個要處理的元素時非常有用。",
      points: 1,
    },

    {
      id: "queue-q5",
      type: "single-choice",
      category: "application",
      difficulty: 2,
      difficultyRating: 1100,
      title:
        "對一個空的 Queue 依序執行以下操作：enqueue(1), enqueue(2), dequeue(), enqueue(3), dequeue()。最後佇列中剩下什麼元素？",
      options: [
        { id: "A", text: "1" },
        { id: "B", text: "2" },
        { id: "C", text: "3" },
        { id: "D", text: "空的" },
      ],
      correctAnswer: "C",
      explanation:
        "讓我們逐步追蹤：\n1. enqueue(1) → Queue: [1]\n2. enqueue(2) → Queue: [1, 2]\n3. dequeue() → 移除 1，Queue: [2]\n4. enqueue(3) → Queue: [2, 3]\n5. dequeue() → 移除 2，Queue: [3]\n最後剩下元素 3。",
      points: 1,
    },
    {
      id: "queue-q6",
      type: "single-choice",
      category: "application",
      difficulty: 2,
      difficultyRating: 1050,
      title: "Queue 最常用於解決以下哪個問題？",
      options: [
        { id: "A", text: "括號匹配" },
        { id: "B", text: "廣度優先搜尋 (BFS)" },
        { id: "C", text: "函數調用管理" },
        { id: "D", text: "後序表達式求值" },
      ],
      correctAnswer: "B",
      explanation:
        "Queue 的 FIFO 特性非常適合用於廣度優先搜尋 (BFS)。在 BFS 中，我們需要按照發現節點的順序來處理它們，先發現的節點先處理，這正是 Queue 的特性。",
      points: 1,
    },
    {
      id: "queue-q7",
      type: "single-choice",
      category: "application",
      difficulty: 2,
      difficultyRating: 1150,
      title:
        "作業系統中，CPU 處理多個程序時通常使用什麼數據結構來管理任務排程？",
      options: [
        { id: "A", text: "Stack (堆疊)" },
        { id: "B", text: "Queue (佇列)" },
        { id: "C", text: "Linked List (鏈結串列)" },
        { id: "D", text: "Binary Tree (二元樹)" },
      ],
      correctAnswer: "B",
      explanation:
        "CPU 排程通常使用 Queue 來管理待處理的程序。這確保了公平性：先提交的任務會先被處理，這就是 FIFO 調度的基本原則。",
      points: 1,
    },
    {
      id: "queue-q8",
      type: "single-choice",
      category: "application",
      difficulty: 2,
      difficultyRating: 1000,
      title: "印表機處理列印任務時，為什麼使用 Queue 而不是 Stack？",
      options: [
        { id: "A", text: "Queue 佔用更少的記憶體" },
        { id: "B", text: "Queue 可以確保先送出的文件先列印" },
        { id: "C", text: "Stack 無法處理多個任務" },
        { id: "D", text: "印表機硬體只支援 Queue" },
      ],
      correctAnswer: "B",
      explanation:
        "印表機使用 Queue 是因為 FIFO 原則確保公平性：先送出列印請求的人，文件會先被列印。如果使用 Stack (LIFO)，後送出的文件反而會先印，這對其他使用者不公平。",
      points: 1,
    },

    {
      id: "queue-q9",
      type: "single-choice",
      category: "complexity",
      difficulty: 3,
      difficultyRating: 1300,
      title: "Queue 的 enqueue 和 dequeue 操作的時間複雜度是多少？",
      options: [
        { id: "A", text: "O(1)" },
        { id: "B", text: "O(log n)" },
        { id: "C", text: "O(n)" },
        { id: "D", text: "O(n²)" },
      ],
      correctAnswer: "A",
      explanation:
        "Queue 的 enqueue 和 dequeue 操作都只需要在固定的位置進行（後端加入、前端移除），不需要移動其他元素，因此時間複雜度為 O(1)（常數時間）。",
      points: 1,
    },
    {
      id: "queue-q10",
      type: "single-choice",
      category: "complexity",
      difficulty: 3,
      difficultyRating: 1400,
      title:
        "如果要在 Queue 中搜尋某個特定元素，最壞情況下的時間複雜度是多少？",
      options: [
        { id: "A", text: "O(1)" },
        { id: "B", text: "O(log n)" },
        { id: "C", text: "O(n)" },
        { id: "D", text: "O(n log n)" },
      ],
      correctAnswer: "C",
      explanation:
        "在 Queue 中搜尋元素需要從前端開始逐個檢查，最壞情況下要檢查所有 n 個元素，時間複雜度為 O(n)。注意：Queue 並不是設計來做搜尋的數據結構，它是為了高效的 FIFO 操作而設計的。",
      points: 1,
    },
  ],
};

/**
 * Stack (堆疊) 練習題庫
 * 包含基礎特性題、應用題和複雜度分析題
 */

import { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

// 1. 完整教學實作 (用於題組顯示)
const stackCode = `class Stack:
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
        return self.stack[self.top]`;

// 2. Fill-code 專用 (含標記)
const stackFillCode = `class Stack:
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
        return value`;

// 3. Predict-line 專用 (含行號)
const stackPredictCode = `class Stack:                               # L1
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
        return value                      # L18`;

// 4. Min Stack 實作
const minStackFillCode = `class MinStack:
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
        return (c)`;

// --- 題目定義 ---

const questions: Question[] = [
  // 【Basic】
  {
    id: 'stack-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '堆疊 (Stack) 是一種 LIFO (Last-In, First-Out) 的資料結構，意即最後放入的元素，會第一個被取出。',
    options: [
      { id: 'true', text: '正確' },
      { id: 'false', text: '錯誤' }
    ],
    correctAnswer: 'true',
    explanation: 'Stack 的 LIFO 特性意味著最後放入的元素最先被取出。相對地，Queue 是 FIFO（先進先出）。',
    points: 1
  },
  {
    id: 'stack-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: 'Stack 的 push 操作會在哪裡加入新元素？',
    options: [
      { id: 'A', text: '頂端 (Top)' },
      { id: 'B', text: '底端 (Bottom)' },
      { id: 'C', text: '中間位置' },
      { id: 'D', text: '任意位置' }
    ],
    correctAnswer: 'A',
    explanation: 'push 永遠在 Stack 的頂端加入新元素，這也是 LIFO 原則的實作方式。',
    points: 1
  },
  {
    id: 'stack-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: 'Stack 的 pop 操作會執行什麼動作？',
    options: [
      { id: 'A', text: '在頂端加入一個新元素' },
      { id: 'B', text: '查看頂端元素但不移除' },
      { id: 'C', text: '移除並回傳頂端元素' },
      { id: 'D', text: '清空整個 Stack' }
    ],
    correctAnswer: 'C',
    explanation: 'pop 會取得頂端值、將指標減 1 並回傳該值。對空 Stack 執行會觸發 Underflow。',
    points: 1
  },
  {
    id: 'stack-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '以下哪個操作可以查看 Stack 頂端的元素，但不移除它？',
    options: [
      { id: 'A', text: 'push' },
      { id: 'B', text: 'pop' },
      { id: 'C', text: 'peek' },
      { id: 'D', text: 'isEmpty' }
    ],
    correctAnswer: 'C',
    explanation: 'peek 只讀取頂端值而不移動指標，保持 Stack 內容不變。',
    points: 1
  },
  {
    id: 'stack-q4',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '程式中常見的 "Stack Overflow" 錯誤，最可能的原因是？',
    options: [
      { id: 'A', text: '對空 Stack 執行 pop 操作' },
      { id: 'B', text: '遞迴函數缺少終止條件，導致 Call Stack 無限累積' },
      { id: 'C', text: 'Stack 的記憶體不夠大' },
      { id: 'D', text: 'push 和 pop 順序錯誤' }
    ],
    correctAnswer: 'B',
    explanation: '無限遞迴會導致 Call Stack 持續增長直到超過系統限制，即為 Stack Overflow。',
    points: 1
  },

  // 【Application】
  {
    id: 'stack-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title: '對一個空的 Stack 依序執行：push(1), push(2), pop(), push(3), pop()。最後剩下什麼？',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '2' },
      { id: 'C', text: '3' },
      { id: 'D', text: 'Stack 為空' }
    ],
    correctAnswer: 'A',
    explanation: '過程：[1] -> [1,2] -> [1] -> [1,3] -> [1]。最終剩下 1。',
    points: 1
  },
  {
    id: 'stack-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: 'Stack 的 LIFO 特性最適合用於解決以下哪個問題？',
    options: [
      { id: 'A', text: '印表機的列印任務排程' },
      { id: 'B', text: '括號是否正確匹配（如 "{[()]}"）' },
      { id: 'C', text: '廣度優先搜尋 (BFS)' },
      { id: 'D', text: 'CPU 任務排程' }
    ],
    correctAnswer: 'B',
    explanation: '括號匹配需要「最後開啟的括號最先關閉」，這正是 Stack 的 LIFO 特性。',
    points: 1
  },
  {
    id: 'stack-q7',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '作業系統使用什麼資料結構來管理函數的呼叫順序？',
    options: [
      { id: 'A', text: 'Queue（佇列）' },
      { id: 'B', text: 'Stack（堆疊）' },
      { id: 'C', text: 'Hash Table' },
      { id: 'D', text: 'Binary Tree' }
    ],
    correctAnswer: 'B',
    explanation: 'Call Stack 管理函數呼叫，確保最後被呼叫的函數能最先執行完畢並回傳。',
    points: 1
  },
  {
    id: 'stack-q8',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '瀏覽器的「上一頁」功能可用 Stack 實作。請問 push(currentPage) 應在何時觸發？',
    options: [
      { id: 'A', text: '使用者點擊「上一頁」時' },
      { id: 'B', text: '使用者開啟新頁面時' },
      { id: 'C', text: '使用者點擊「下一頁」時' },
      { id: 'D', text: '瀏覽器關閉頁籤時' }
    ],
    correctAnswer: 'B',
    explanation: '每當瀏覽新頁面，就將目前頁面 push 進 History Stack 以便日後回退。',
    points: 1
  },
  {
    id: 'stack-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '以下哪些場景適合使用 Stack？（多選）',
    options: [
      { id: 'opt1', text: '括號匹配驗證' },
      { id: 'opt2', text: '作業系統 CPU 任務排程' },
      { id: 'opt3', text: '深度優先搜尋 (DFS) 的迭代實作' },
      { id: 'opt4', text: '廣度優先搜尋 (BFS)' }
    ],
    correctAnswer: ['opt1', 'opt3'],
    explanation: '括號匹配與 DFS 迭代版皆使用 Stack；CPU 排程與 BFS 則使用 Queue。',
    points: 2
  },

  // 【Complexity】
  {
    id: 'stack-q9',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1250,
    title: 'Stack 的 push 和 pop 操作，時間複雜度分別是多少？',
    options: [
      { id: 'A', text: '兩者皆為 O(1)' },
      { id: 'B', text: 'push O(1), pop O(n)' },
      { id: 'C', text: '兩者皆為 O(n)' },
      { id: 'D', text: 'push O(n), pop O(1)' }
    ],
    correctAnswer: 'A',
    explanation: 'Stack 只在頂端操作，不需遍歷，故皆為常數時間 O(1)。',
    points: 1
  },
  {
    id: 'stack-q10',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: '以 Python list 實作 Stack 時，append() 和 pop() 的「均攤」時間複雜度是多少？',
    options: [
      { id: 'A', text: '兩者皆為 O(1)' },
      { id: 'B', text: 'append O(n), pop O(1)' },
      { id: 'C', text: 'append O(1), pop O(n)' },
      { id: 'D', text: '兩者皆為 O(n)' }
    ],
    correctAnswer: 'A',
    explanation: '雖然 append 偶爾需擴容，但均攤後為 O(1)；末端 pop 始終為 O(1)。',
    points: 2
  },

  // 【Group Questions】
  {
    id: 'stack-group-1',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    groupId: 'group-stack-impl',
    title: '根據上方程式碼，執行 s=Stack(3); s.push(10); s.push(20); s.pop(); 後，s.top 的值是多少？',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '1' },
      { id: 'C', text: '2' },
      { id: 'D', text: '-1' }
    ],
    correctAnswer: 'A',
    explanation: 'top 變化：-1 -> 0 -> 1 -> 0。最終為 0。',
    points: 2
  },
  {
    id: 'stack-group-2',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    groupId: 'group-stack-impl',
    title: '根據上方程式碼，s = Stack(2) 後依序執行 push(10), push(20), push(30)。請問第三次 push 會發生什麼事？',
    options: [
      { id: 'A', text: '正常執行，top = 2' },
      { id: 'B', text: '拋出 "Stack Overflow" 例外' },
      { id: 'C', text: '覆蓋 stack[1] 的值，top 不變' },
      { id: 'D', text: '拋出 "Stack Underflow" 例外' }
    ],
    correctAnswer: 'B',
    explanation: 'size=2, top 達到 size-1 (即 1) 時再 push 就會拋出 Overflow。',
    points: 2
  },
  {
    id: 'stack-group-3',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    groupId: 'group-stack-impl',
    title: '請填入 (a)(b)(c)(d) 處缺失的 Python 程式碼，使邏輯與教學區完全相同（注意大小寫；(d) 處請使用複合賦值運算子）。',
    code: stackFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }],
    correctAnswer: ['-1', 'self.size - 1', '-1', 'self.top -= 1'],
    explanation: 'top 初始為 -1；Overflow 判定為 size-1；Underflow 判定為 -1；pop 後指標遞減。',
    points: 5
  },

  // 【Advanced】
  {
    id: 'stack-adv-pred',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title: '給定 s = Stack(3) 且已執行 s.push(5)（目前 top=0，stack=[5]），接著執行 s.pop()。請依序填寫 pop() 方法執行時，經過的行號序列（以空格分隔）。',
    code: stackPredictCode,
    language: 'python',
    options: [],
    correctAnswer: '13 14 16 17 18',
    explanation: '進入 pop(L13) -> 檢查 top(L14) -> 取得值(L16) -> 指標減一(L17) -> 回傳(L18)。',
    points: 5
  },
  {
    id: 'stack-adv-fill',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title: 'Min Stack 支援 O(1) 取得最小值。請填入 (a)(b)(c) 處缺失的程式碼（注意 Python 語法）。',
    code: minStackFillCode,
    language: 'python',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }],
    correctAnswer: ['self.min_stack[-1]', 'self.min_stack.pop()', 'self.min_stack[-1]'],
    explanation: '使用輔助 Stack 同步存儲當前最小值。[-1] 用於讀取頂端，pop() 同步移除。',
    points: 5
  }
];

export const stackQuiz: PracticeQuiz = {
  levelId: 'stack',
  levelName: '堆疊 (Stack)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-stack-impl',
      title: '題組：堆疊操作追蹤（教學區同款實作）',
      description: '以下程式碼與教學區「堆疊 (Stack)」使用的 Python 實作完全相同，請仔細閱讀後回答問題。',
      code: stackCode,
      language: 'python',
      questionIds: ['stack-group-1', 'stack-group-2', 'stack-group-3']
    }
  ]
};
/**
 * Stack (堆疊) 練習題庫
 * 包含基礎特性題、應用題和複雜度分析題
 */

import type { PracticeQuiz } from '@/types/practice';

export const stackQuiz: PracticeQuiz = {
  levelId: 'stack',
  levelName: '堆疊 (Stack)',
  passingScore: 60,
  questions: [
    {
      id: 'stack-q1',
      type: 'single-choice',
      category: 'basic',
      difficulty: 1,
      title: '在堆疊 (Stack) 資料結構中，最後一個進入的元素會如何被處理？',
      options: [
        { id: 'A', text: '最後一個被取出' },
        { id: 'B', text: '第一個被取出' },
        { id: 'C', text: '隨機被取出' },
        { id: 'D', text: '永遠留在堆疊中' },
      ],
      correctAnswer: 'B',
      explanation:
        '沒錯！這就是 LIFO (Last-In, First-Out) 原則，就像洗碗時疊起來的盤子，你總是先拿走最上面（最後放上去）的那一個。',
      points: 1,
    },
    {
      id: 'stack-q2',
      type: 'single-choice',
      category: 'basic',
      difficulty: 1,
      title: 'Stack 的 push 操作是在哪裡加入新元素？',
      options: [
        { id: 'A', text: '頂端 (Top)' },
        { id: 'B', text: '底端 (Bottom)' },
        { id: 'C', text: '中間位置' },
        { id: 'D', text: '任意位置' },
      ],
      correctAnswer: 'A',
      explanation:
        'push 操作總是在堆疊的頂端加入新元素，這是 Stack 的基本操作之一。就像往盤子堆上再疊一個新盤子。',
      points: 1,
    },
    {
      id: 'stack-q3',
      type: 'single-choice',
      category: 'basic',
      difficulty: 1,
      title: 'Stack 的 pop 操作會執行什麼動作？',
      options: [
        { id: 'A', text: '加入一個新元素' },
        { id: 'B', text: '查看頂端元素但不移除' },
        { id: 'C', text: '移除並返回頂端元素' },
        { id: 'D', text: '清空整個堆疊' },
      ],
      correctAnswer: 'C',
      explanation:
        'pop 操作會移除並返回堆疊頂端的元素。如果只是想查看頂端元素而不移除，應該使用 peek 操作。',
      points: 1,
    },
    {
      id: 'stack-q4',
      type: 'single-choice',
      category: 'basic',
      difficulty: 1,
      title: '以下哪個操作可以查看 Stack 頂端的元素但不移除它？',
      options: [
        { id: 'A', text: 'push' },
        { id: 'B', text: 'pop' },
        { id: 'C', text: 'peek' },
        { id: 'D', text: 'isEmpty' },
      ],
      correctAnswer: 'C',
      explanation:
        'peek (或稱為 top) 操作允許我們查看堆疊頂端的元素而不移除它，這在需要檢查下一個元素是什麼時非常有用。',
      points: 1,
    },

    {
      id: 'stack-q5',
      type: 'single-choice',
      category: 'application',
      difficulty: 2,
      title:
        '對一個空的 Stack 依序執行以下操作：push(1), push(2), pop(), push(3), pop()。最後堆疊中剩下什麼元素？',
      options: [
        { id: 'A', text: '1' },
        { id: 'B', text: '2' },
        { id: 'C', text: '3' },
        { id: 'D', text: '空的' },
      ],
      correctAnswer: 'A',
      explanation:
        '讓我們逐步追蹤：\n1. push(1) → Stack: [1]\n2. push(2) → Stack: [1, 2]\n3. pop() → 移除 2，Stack: [1]\n4. push(3) → Stack: [1, 3]\n5. pop() → 移除 3，Stack: [1]\n最後剩下元素 1。',
      points: 1,
    },
    {
      id: 'stack-q6',
      type: 'single-choice',
      category: 'application',
      difficulty: 2,
      title: 'Stack 最常用於解決以下哪個問題？',
      options: [
        { id: 'A', text: '排序數據' },
        { id: 'B', text: '檢查括號是否匹配' },
        { id: 'C', text: '搜尋最短路徑' },
        { id: 'D', text: '管理優先級隊列' },
      ],
      correctAnswer: 'B',
      explanation:
        'Stack 的 LIFO 特性非常適合用於括號匹配問題。當遇到左括號時 push，遇到右括號時 pop 並檢查是否匹配。這也是為什麼編譯器常用 Stack 來檢查程式碼的括號是否正確配對。',
      points: 1,
    },
    {
      id: 'stack-q7',
      type: 'single-choice',
      category: 'application',
      difficulty: 2,
      title: '函數調用過程中，系統使用什麼數據結構來管理函數的調用順序？',
      options: [
        { id: 'A', text: 'Queue (隊列)' },
        { id: 'B', text: 'Stack (堆疊)' },
        { id: 'C', text: 'Hash Table (雜湊表)' },
        { id: 'D', text: 'Binary Tree (二元樹)' },
      ],
      correctAnswer: 'B',
      explanation:
        '系統使用 Call Stack (調用堆疊) 來管理函數調用。當函數被調用時，其資訊被 push 到堆疊；函數返回時，對應資訊被 pop 出來。這就是為什麼遞迴過深會導致 "Stack Overflow" 錯誤。',
      points: 1,
    },
    {
      id: 'stack-q8',
      type: 'single-choice',
      category: 'application',
      difficulty: 2,
      title: '要將一個 Stack 中的元素反轉，最少需要幾個額外的 Stack？',
      options: [
        { id: 'A', text: '0 個（不需要額外 Stack）' },
        { id: 'B', text: '1 個' },
        { id: 'C', text: '2 個' },
        { id: 'D', text: '3 個' },
      ],
      correctAnswer: 'B',
      explanation:
        '只需要 1 個額外的 Stack。將原 Stack 的所有元素依次 pop 出來並 push 到新 Stack 中，由於 Stack 的 LIFO 特性，元素順序就會反轉。例如：原 Stack [1,2,3]（top 是 3）→ 新 Stack [3,2,1]（top 是 1）。',
      points: 1,
    },

    {
      id: 'stack-q9',
      type: 'single-choice',
      category: 'complexity',
      difficulty: 3,
      title: 'Stack 的 push 和 pop 操作的時間複雜度是多少？',
      options: [
        { id: 'A', text: 'O(1)' },
        { id: 'B', text: 'O(log n)' },
        { id: 'C', text: 'O(n)' },
        { id: 'D', text: 'O(n²)' },
      ],
      correctAnswer: 'A',
      explanation:
        'Stack 的 push 和 pop 操作都只需要在頂端進行，不需要移動其他元素，因此時間複雜度為 O(1)（常數時間）。這也是 Stack 效率高的原因之一。',
      points: 1,
    },
    {
      id: 'stack-q10',
      type: 'single-choice',
      category: 'complexity',
      difficulty: 3,
      title: '如果要在 Stack 中搜尋某個特定元素，最壞情況下的時間複雜度是多少？',
      options: [
        { id: 'A', text: 'O(1)' },
        { id: 'B', text: 'O(log n)' },
        { id: 'C', text: 'O(n)' },
        { id: 'D', text: 'O(n log n)' },
      ],
      correctAnswer: 'C',
      explanation:
        '在 Stack 中搜尋元素需要逐個檢查，最壞情況下要檢查所有 n 個元素，時間複雜度為 O(n)。注意：Stack 並不是設計來做搜尋的數據結構，如果需要頻繁搜尋，應該考慮使用 Hash Table 或 Binary Search Tree。',
      points: 1,
    },
  ],
};

/**
 * Queue (佇列) 練習題庫
 * 包含基礎特性題、應用題和複雜度分析題
 */

import type { PracticeQuiz } from "@/types/practice";

export const queueQuiz: PracticeQuiz = {
  levelId: "queue",
  levelName: "佇列 (Queue)",
  passingScore: 60,
  questions: [
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

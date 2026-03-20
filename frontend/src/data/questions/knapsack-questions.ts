/**
 * 0/1 背包問題 (Knapsack) 練習題庫
 * 涵蓋 DP 狀態定義、轉移方程追蹤、一維優化實作等核心概念
 */

import type { PracticeQuiz, Question } from '@/types/practice';

// --- 程式碼片段定義 ---

const dpTraceCode = `# 物品清單：item1=(重量2,價值3)、item2=(重量3,價值4)、item3=(重量4,價值5)
items = [(2, 3), (3, 4), (4, 5)]
capacity = 5

dp = [[0] * (capacity + 1) for _ in range(len(items) + 1)]

for i, (w, v) in enumerate(items, 1):
    for j in range(1, capacity + 1):
        if w > j:
            dp[i][j] = dp[i-1][j]
        else:
            dp[i][j] = max(dp[i-1][j], dp[i-1][j-w] + v)`;

const knapsackFillCode = `def knapsack(capacity, weights, values, num_items):
    dp = [[0] * (capacity + 1) for _ in range(num_items + 1)]
    for item_idx in range(1, num_items + 1):
        for curr_capacity in range(1, capacity + 1):
            current_weight = weights[item_idx - 1]
            current_value = values[item_idx - 1]
            if current_weight <= curr_capacity:
                skip_val = dp[item_idx-1][curr_capacity]
                take_val = dp[(a)][curr_capacity - current_weight] + (b)
                dp[item_idx][curr_capacity] = (c)
            else:
                dp[item_idx][curr_capacity] = (d)
    return dp[num_items][capacity]`;

const knapsack1dFillCode = `def knapsack_1d(capacity, weights, values, num_items):
    dp = [0] * (capacity + 1)
    for item_idx in range(num_items):
        for curr_capacity in range((a), -1, -1):
            w = weights[item_idx]
            v = values[item_idx]
            if w <= curr_capacity:
                dp[curr_capacity] = max(dp[curr_capacity], (b) + v)
    return dp[(c)]`;

const dpSingleItemCode = `def dp_single_item(w, v, cap, prev):  # L1
    if w > cap:                            # L2
        return prev[cap]                   # L3
    skip_val = prev[cap]                   # L4
    take_val = prev[cap - w] + v           # L5
    return max(skip_val, take_val)         # L6`;

// --- 題目清單 ---

const questions: Question[] = [
  // === Basic 800-950 ===
  {
    id: 'kp-tf-1',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 800,
    title: '在 0/1 背包問題中，每件物品只能選擇「完整放入」或「不放入」，不能只放入一部分。',
    options: [
      { id: 'true', text: '正確' },
      { id: 'false', text: '錯誤' },
    ],
    correctAnswer: 'true',
    explanation:
      '這正是「0/1」名稱的由來：每件物品的選擇只有 0（不放）或 1（放入），不允許分割。若物品可以任意分割，則稱為「分數背包（Fractional Knapsack）」，該問題用貪婪法即可解決。',
    points: 1,
  },
  {
    id: 'kp-q1',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 850,
    title: '在 0/1 背包的 DP 解法中，dp[i][j] 代表什麼含義？',
    options: [
      { id: 'A', text: '第 i 件物品的重量乘以容量 j' },
      { id: 'B', text: '考慮前 i 件物品、背包容量為 j 時，能獲得的最大價值' },
      { id: 'C', text: '前 i 件物品的總重量' },
      { id: 'D', text: '恰好裝滿容量 j 時的最小物品數' },
    ],
    correctAnswer: 'B',
    explanation:
      'dp[i][j] 是 0/1 背包的核心狀態定義：「只考慮前 i 件物品，在背包容量為 j 的限制下，所能獲得的最大總價值」。這樣的定義讓我們可以用前一行的結果推導出當前行。',
    points: 1,
  },
  {
    id: 'kp-q2',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 900,
    title: '建立 0/1 背包的 DP 表格時，dp[0][j]（第 0 列）與 dp[i][0]（第 0 行）應初始化為何值？',
    options: [
      { id: 'A', text: 'dp[0][j] = j，dp[i][0] = i（填入索引值）' },
      { id: 'B', text: '都初始化為無限大 (∞)' },
      { id: 'C', text: '都初始化為 0' },
      { id: 'D', text: 'dp[0][j] = 0，dp[i][0] = -1' },
    ],
    correctAnswer: 'C',
    explanation:
      'dp[0][j] 表示「沒有任何物品可選」，最大價值自然為 0；dp[i][0] 表示「背包容量為 0」，無法放入任何物品，最大價值也是 0。因此 DP 表格的第 0 列與第 0 行全部初始化為 0。',
    points: 1,
  },
  {
    id: 'kp-tf-2',
    type: 'true-false',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '0/1 背包問題的時間複雜度為 O(N × W)，其中 N 為物品數量，W 為背包容量。',
    options: [
      { id: 'true', text: '正確' },
      { id: 'false', text: '錯誤' },
    ],
    correctAnswer: 'true',
    explanation:
      '由於需要填寫一個 (N+1) × (W+1) 的 DP 表格，且每格計算時間為 O(1)，總時間複雜度為 O(N × W)。空間複雜度同樣為 O(N × W)，但可透過滾動陣列優化至 O(W)。',
    points: 1,
  },
  {
    id: 'kp-q3',
    type: 'single-choice',
    category: 'basic',
    difficulty: 1,
    difficultyRating: 950,
    title: '0/1 背包問題屬於哪一類演算法策略？',
    options: [
      { id: 'A', text: '貪婪法 (Greedy)' },
      { id: 'B', text: '分治法 (Divide and Conquer)' },
      { id: 'C', text: '動態規劃 (Dynamic Programming)' },
      { id: 'D', text: '回溯法 (Backtracking)' },
    ],
    correctAnswer: 'C',
    explanation:
      '0/1 背包問題具備「最優子結構」與「重疊子問題」兩個 DP 的核心特徵。貪婪法在此問題中不保證最優解（例如：按價值密度排序的貪婪結果，可能不如某個特定組合），必須使用 DP 確保全局最優。',
    points: 1,
  },

  // === Application 1000-1300（獨立題） ===
  {
    id: 'kp-q4',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1000,
    title: '在填寫 dp[i][j] 時，若第 i 件物品的重量 w > j（目前背包容量），則 dp[i][j] 應如何計算？',
    options: [
      { id: 'A', text: 'dp[i][j] = dp[i][j-1]（繼承左邊的值）' },
      { id: 'B', text: 'dp[i][j] = dp[i-1][j]（繼承上一列的值）' },
      { id: 'C', text: 'dp[i][j] = 0（重置為 0）' },
      { id: 'D', text: 'dp[i][j] = dp[i-1][j-1] + v（強制放入）' },
    ],
    correctAnswer: 'B',
    explanation:
      '當物品重量超過當前背包容量，物品根本放不進去。此時只能繼承「不考慮第 i 件物品」的最優解，即 dp[i-1][j]。這個值代表只看前 i-1 件物品、容量為 j 時的最佳結果。',
    points: 1,
  },
  {
    id: 'kp-q5',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1100,
    title: '在填寫 dp[i][j] 時，若第 i 件物品重量 w ≤ j（放得下），則狀態轉移方程為？',
    options: [
      { id: 'A', text: 'dp[i][j] = dp[i-1][j] + v（直接加入價值）' },
      { id: 'B', text: 'dp[i][j] = max(dp[i-1][j], dp[i-1][j-w] + v)（取不放與放的最大值）' },
      { id: 'C', text: 'dp[i][j] = dp[i-1][j-w] + v（只考慮放入）' },
      { id: 'D', text: 'dp[i][j] = min(dp[i-1][j], dp[i-1][j-w] + v)（取最小值）' },
    ],
    correctAnswer: 'B',
    explanation:
      '放得下時有兩種選擇：\n1. 不放 (skip)：dp[i-1][j]，即不選第 i 件物品的最優解\n2. 放入 (take)：dp[i-1][j-w] + v，騰出 w 的容量後再放入第 i 件\n取兩者中較大的值，確保決策最優。',
    points: 2,
  },
  {
    id: 'kp-multi-1',
    type: 'multiple-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '以下哪些現實場景可以建模為 0/1 背包問題？（多選）',
    options: [
      { id: 'opt1', text: '在時間限制內選擇要完成哪些高價值任務' },
      { id: 'opt2', text: '用固定預算購買哪些物品以最大化效用' },
      { id: 'opt3', text: '將整數陣列分成兩個總和相等的子集（LeetCode 416）' },
      { id: 'opt4', text: '計算城市間最短路徑（Dijkstra 問題）' },
    ],
    correctAnswer: ['opt1', 'opt2', 'opt3'],
    explanation:
      '任務排程（時間=重量，價值=任務報酬）和購物選擇（預算=容量）都是直觀的背包應用。LeetCode 416 可轉換為：capacity = sum/2，看能否湊出恰好等於 sum/2 的子集，是 0/1 背包的變形。Dijkstra 是圖論最短路徑問題，與背包無關。',
    points: 2,
  },
  {
    id: 'kp-q6',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1200,
    title: '有 3 件物品（重量/價值：A:1/2, B:2/5, C:3/6），背包容量為 3。哪個組合能獲得最大總價值？',
    options: [
      { id: 'A', text: '只選 A（重量1，價值2）' },
      { id: 'B', text: '只選 B（重量2，價值5）' },
      { id: 'C', text: '只選 C（重量3，價值6）' },
      { id: 'D', text: '選 A + B（重量3，價值7）' },
    ],
    correctAnswer: 'D',
    explanation:
      '逐一分析所有可行組合：\n- 只選 A：重1≤3，價值 2\n- 只選 B：重2≤3，價值 5\n- 只選 C：重3≤3，價值 6\n- A+B：重1+2=3≤3，價值 2+5=7（最大！）\n- A+C：重1+3=4>3，不可行\n- B+C：重2+3=5>3，不可行\n因此最優解是選 A+B，總價值為 7。',
    points: 2,
  },
  {
    id: 'kp-q7',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1250,
    title: '「無限背包（Unbounded Knapsack）」與「0/1 背包」的最主要差異是什麼？',
    options: [
      { id: 'A', text: '無限背包的背包容量沒有上限' },
      { id: 'B', text: '無限背包中每件物品可以選取任意次數' },
      { id: 'C', text: '無限背包使用貪婪法而非動態規劃' },
      { id: 'D', text: '無限背包的時間複雜度更低' },
    ],
    correctAnswer: 'B',
    explanation:
      '0/1 背包：每件物品最多用一次（0 次或 1 次）。無限背包（完全背包）：每件物品可以用無限次。在實作上，0/1 背包的一維 DP 需要「倒序」遍歷容量，而無限背包則「正序」遍歷，差別就在這裡。',
    points: 2,
  },

  // === 題組：dp-trace（1050, 1150, 1300） ===
  {
    id: 'kp-grp-1',
    groupId: 'group-dp-trace',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1050,
    title: '執行上方程式碼後，dp[1][2] 的值是多少？（i=1 代表 item1：重量=2, 價值=3）',
    options: [
      { id: 'A', text: '0（容量 2 放不下重量 2 的物品）' },
      { id: 'B', text: '3（放入 item1）' },
      { id: 'C', text: '4（放入 item2）' },
      { id: 'D', text: '7（放入 item1+item2）' },
    ],
    correctAnswer: 'B',
    explanation:
      'dp[1][2] 計算：item1 重量=2，容量 j=2，2≤2 可放入。\n- skip = dp[0][2] = 0\n- take = dp[0][2-2] + 3 = dp[0][0] + 3 = 0 + 3 = 3\n- dp[1][2] = max(0, 3) = 3',
    points: 2,
  },
  {
    id: 'kp-grp-2',
    groupId: 'group-dp-trace',
    type: 'single-choice',
    category: 'application',
    difficulty: 2,
    difficultyRating: 1150,
    title: '執行上方程式碼後，dp[2][5] 的值是多少？（i=2 代表 item2：重量=3, 價值=4，此時 dp[1] = [0,0,3,3,3,3]）',
    options: [
      { id: 'A', text: '3（只選 item1）' },
      { id: 'B', text: '4（只選 item2）' },
      { id: 'C', text: '5（只選 item3）' },
      { id: 'D', text: '7（同時選 item1 + item2）' },
    ],
    correctAnswer: 'D',
    explanation:
      'dp[2][5] 計算：item2 重量=3，容量 j=5，3≤5 可放入。\n- skip = dp[1][5] = 3\n- take = dp[1][5-3] + 4 = dp[1][2] + 4 = 3 + 4 = 7\n- dp[2][5] = max(3, 7) = 7（同時選 item1 和 item2）',
    points: 2,
  },
  {
    id: 'kp-grp-3',
    groupId: 'group-dp-trace',
    type: 'single-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1300,
    title: '執行上方程式碼直到結束，最終 dp[3][5]（最大總價值）是多少？',
    options: [
      { id: 'A', text: '5（只選 item3）' },
      { id: 'B', text: '7（選 item1 + item2，或其他等價組合）' },
      { id: 'C', text: '9（選 item1 + item2 + item3）' },
      { id: 'D', text: '12（所有物品總價值）' },
    ],
    correctAnswer: 'B',
    explanation:
      'dp[3][5] 計算：item3 重量=4，容量 j=5，4≤5 可放入。\n- skip = dp[2][5] = 7\n- take = dp[2][5-4] + 5 = dp[2][1] + 5 = 0 + 5 = 5\n- dp[3][5] = max(7, 5) = 7\n最優解是 item1(v=3) + item2(v=4) = 7。三件同時選重量=9 > 容量5，不可行；只選 item3 得 5 不如 7。',
    points: 3,
  },

  // === Complexity 1350-1550 ===
  {
    id: 'kp-tf-3',
    type: 'true-false',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1350,
    title: '0/1 背包的一維 DP 優化中，內層迴圈必須「從大到小」（倒序）遍歷容量，才能確保每件物品只被選一次。',
    options: [
      { id: 'true', text: '正確' },
      { id: 'false', text: '錯誤' },
    ],
    correctAnswer: 'true',
    explanation:
      '這是 0/1 背包一維 DP 的關鍵：\n- 倒序遍歷：計算 dp[j] 時用到的 dp[j-w] 還是「舊值」（前一輪的值），代表物品還沒被選過，確保每件物品最多選一次。\n- 若改為正序：dp[j-w] 可能已被本輪更新，相當於允許同一物品被重複選取（變成完全背包的行為）。',
    points: 2,
  },
  {
    id: 'kp-fill-1',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1400,
    title: '請填入 0/1 背包核心邏輯中 (a)(b)(c)(d) 缺失的程式碼，使其完整實作狀態轉移方程。',
    code: knapsackFillCode,
    language: 'python',
    options: [
      { id: 'a', text: '' },
      { id: 'b', text: '' },
      { id: 'c', text: '' },
      { id: 'd', text: '' },
    ],
    correctAnswer: [
      'item_idx-1',
      'current_value',
      'max(skip_val, take_val)',
      'dp[item_idx-1][curr_capacity]',
    ],
    explanation:
      '(a) take_val 需使用「上一列」的資料（不包含第 i 件物品）：dp[item_idx-1][...]。\n(b) 放入物品時需加上該物品的價值 current_value。\n(c) 在「放」與「不放」之間取最大值 max(skip_val, take_val)。\n(d) 放不下時直接繼承上一列同格：dp[item_idx-1][curr_capacity]。',
    points: 5,
  },
  {
    id: 'kp-fill-2',
    type: 'fill-code',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1450,
    title: '請填入一維 DP 優化版本的 (a)(b)(c) 缺失部分，使其正確實作 0/1 背包（每個物品只選一次）。',
    code: knapsack1dFillCode,
    language: 'python',
    options: [
      { id: 'a', text: '' },
      { id: 'b', text: '' },
      { id: 'c', text: '' },
    ],
    correctAnswer: ['capacity', 'dp[curr_capacity - w]', 'capacity'],
    explanation:
      '(a) 內層迴圈從 capacity 開始倒序到 0，確保每件物品只選一次。\n(b) 「放入」時讀取 dp[curr_capacity - w]（騰出重量 w 後的舊值），這個值尚未被本輪更新過。\n(c) 最終答案在 dp[capacity]（背包滿容量時的最大價值）。',
    points: 5,
  },
  {
    id: 'kp-pred-1',
    type: 'predict-line',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1500,
    title:
      '呼叫 dp_single_item(w=3, v=4, cap=4, prev=[0, 0, 3, 3, 3])，請依序填寫執行到的行號（以空格分隔）。',
    code: dpSingleItemCode,
    language: 'python',
    options: [],
    correctAnswer: '1 2 4 5 6',
    explanation:
      '執行流程：\n1. 進入函數 (L1)\n2. 判斷 w=3 > cap=4？No，不走 L3 (L2)\n3. skip_val = prev[4] = 3 (L4)\n4. take_val = prev[4-3] + 4 = prev[1] + 4 = 0 + 4 = 4 (L5)\n5. return max(3, 4) = 4 (L6)\n（因為 w≤cap，跳過 L3，依序執行 L4→L5→L6）',
    points: 5,
  },
  {
    id: 'kp-multi-2',
    type: 'multiple-choice',
    category: 'complexity',
    difficulty: 3,
    difficultyRating: 1550,
    title: '以下哪些 LeetCode 題目屬於 0/1 背包問題的變體？（多選）',
    options: [
      { id: 'opt1', text: 'LeetCode 416 — Partition Equal Subset Sum（分割等和子集）' },
      { id: 'opt2', text: 'LeetCode 494 — Target Sum（目標和）' },
      { id: 'opt3', text: 'LeetCode 322 — Coin Change（硬幣找零）' },
      { id: 'opt4', text: 'LeetCode 1049 — Last Stone Weight II（最後一塊石頭的重量 II）' },
    ],
    correctAnswer: ['opt1', 'opt2', 'opt4'],
    explanation:
      '416（能否湊出 sum/2）和 1049（最小化兩堆差）都是子集和型 0/1 背包；494（賦予正負號達成目標和）可轉化為尋找特定子集的 0/1 背包。322（硬幣找零）每種硬幣可無限使用，屬於「完全背包（Unbounded Knapsack）」，不是 0/1 背包。',
    points: 3,
  },
];

export const knapsackQuiz: PracticeQuiz = {
  levelId: 'knapsack',
  levelName: '0/1 背包問題 (Knapsack)',
  passingScore: 60,
  questions,
  groups: [
    {
      id: 'group-dp-trace',
      title: '題組：DP 表格逐格追蹤',
      description:
        '下方程式碼對 3 件物品（item1=(重量2,價值3), item2=(重量3,價值4), item3=(重量4,價值5)）在背包容量=5 的條件下執行 0/1 背包演算法。請根據程式碼回答下列關於 DP 表格填寫的問題。',
      code: dpTraceCode,
      language: 'python',
      questionIds: ['kp-grp-1', 'kp-grp-2', 'kp-grp-3'],
    },
  ],
};

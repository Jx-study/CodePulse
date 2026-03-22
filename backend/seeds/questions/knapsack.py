DP_TRACE_CODE = """# 物品清單：item1=(重量2,價值3)、item2=(重量3,價值4)、item3=(重量4,價值5)
items = [(2, 3), (3, 4), (4, 5)]
capacity = 5

dp = [[0] * (capacity + 1) for _ in range(len(items) + 1)]

for i, (w, v) in enumerate(items, 1):
    for j in range(1, capacity + 1):
        if w > j:
            dp[i][j] = dp[i-1][j]
        else:
            dp[i][j] = max(dp[i-1][j], dp[i-1][j-w] + v)"""

KNAPSACK_FILL_CODE = """def knapsack(capacity, weights, values, num_items):
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
    return dp[num_items][capacity]"""

KNAPSACK_1D_FILL_CODE = """def knapsack_1d(capacity, weights, values, num_items):
    dp = [0] * (capacity + 1)
    for item_idx in range(num_items):
        for curr_capacity in range((a), -1, -1):
            w = weights[item_idx]
            v = values[item_idx]
            if w <= curr_capacity:
                dp[curr_capacity] = max(dp[curr_capacity], (b) + v)
    return dp[(c)]"""

DP_SINGLE_ITEM_CODE = """def dp_single_item(w, v, cap, prev):  # L1
    if w > cap:                            # L2
        return prev[cap]                   # L3
    skip_val = prev[cap]                   # L4
    take_val = prev[cap - w] + v           # L5
    return max(skip_val, take_val)         # L6"""

DOUBLE_SEL_SORT_FILL = """def double_selection_sort(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        min_idx = max_idx = left
        for i in range(left + 1, right + 1):
            if arr[i] < arr[min_idx]: min_idx = (a)
            if arr[i] > arr[max_idx]: max_idx = (b)
        arr[left], arr[min_idx] = arr[min_idx], arr[left]
        if max_idx == left: max_idx = (c)
        arr[right], arr[max_idx] = arr[max_idx], arr[right]
        left += 1; right -= 1"""

DATA = {
    "slug": "knapsack",
    "groups": [
        {
            "id": "group-dp-trace",
            "translations": {
                "zh-TW": {
                    "title": "題組：DP 表格逐格追蹤",
                    "description": "下方程式碼對 3 件物品（item1=(重量2,價值3), item2=(重量3,價值4), item3=(重量4,價值5)）在背包容量=5 的條件下執行 0/1 背包演算法。請根據程式碼回答下列關於 DP 表格填寫的問題。",
                },
                "en": {
                    "title": "Group: DP Table Cell-by-Cell Tracing",
                    "description": "The code below runs the 0/1 Knapsack algorithm on 3 items (item1=(weight=2,value=3), item2=(weight=3,value=4), item3=(weight=4,value=5)) with capacity=5. Answer the following questions about the DP table filling process.",
                },
            },
            "code": DP_TRACE_CODE,
            "language": "python",
        }
    ],
    "questions": [
        {
            "id": "kp-tf-1",
            "type": "true-false",
            "category": "basic",
            "difficultyRating": 800,
            "correctAnswer": "true",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "0/1 背包問題中，每件物品只能選擇「放入」或「不放入」背包，不能分割或重複選取。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。「0/1」代表每件物品只有兩種選擇：0（不取）或 1（取一件）。這與「分數背包問題」（可分割物品取部分）和「無限背包問題」（可重複取）不同。",
                },
                "en": {
                    "title": "In the 0/1 Knapsack problem, each item can only be either 'included' or 'excluded' from the knapsack — no splitting or repeated selection is allowed.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. '0/1' means each item has exactly two choices: 0 (do not take) or 1 (take one). This differs from the Fractional Knapsack (items can be split) and Unbounded Knapsack (items can be taken multiple times).",
                },
            },
        },
        {
            "id": "kp-q1",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 850,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "0/1 背包問題的二維 DP 陣列 dp[i][j] 的定義是什麼？",
                    "options": [
                        {"id": "A", "text": "前 i 件物品中，剛好取 j 件物品能達到的最大價值"},
                        {"id": "B", "text": "考慮前 i 件物品，背包容量為 j 時能裝入的最大價值"},
                        {"id": "C", "text": "第 i 件物品，佔用 j 個重量單位的價值"},
                        {"id": "D", "text": "背包中已放入 i 件物品，剩餘容量為 j"},
                    ],
                    "explanation": "dp[i][j] 的定義是：「從前 i 件物品中選取，在背包容量限制為 j 的條件下，能獲得的最大總價值」。這個定義決定了狀態轉移方程的推導方式。",
                },
                "en": {
                    "title": "What is the definition of dp[i][j] in the 2D DP array for the 0/1 Knapsack problem?",
                    "options": [
                        {"id": "A", "text": "The maximum value achievable by taking exactly j items from the first i items"},
                        {"id": "B", "text": "The maximum value that can be packed when considering the first i items with knapsack capacity j"},
                        {"id": "C", "text": "The value of item i occupying j weight units"},
                        {"id": "D", "text": "Having packed i items into the knapsack with j remaining capacity"},
                    ],
                    "explanation": "dp[i][j] is defined as: 'the maximum total value achievable by selecting from the first i items, subject to a knapsack capacity constraint of j.' This definition determines the state transition equation.",
                },
            },
        },
        {
            "id": "kp-q2",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 900,
            "correctAnswer": "C",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "0/1 背包問題的狀態轉移方程（當第 i 件物品重量 w ≤ 當前容量 j 時）為何？",
                    "options": [
                        {"id": "A", "text": "dp[i][j] = dp[i-1][j] + values[i]"},
                        {"id": "B", "text": "dp[i][j] = dp[i-1][j-w]"},
                        {"id": "C", "text": "dp[i][j] = max(dp[i-1][j], dp[i-1][j-w] + values[i])"},
                        {"id": "D", "text": "dp[i][j] = dp[i][j-1] + values[i]"},
                    ],
                    "explanation": "當物品 i 可以放入（w ≤ j）時，有兩種選擇：不放（取上一行同列 dp[i-1][j]）或放入（扣掉重量 w 後的上一行最大值，再加上物品 i 的價值 dp[i-1][j-w] + v）。兩者取最大值。",
                },
                "en": {
                    "title": "What is the state transition equation for the 0/1 Knapsack when item i's weight w ≤ current capacity j?",
                    "options": [
                        {"id": "A", "text": "dp[i][j] = dp[i-1][j] + values[i]"},
                        {"id": "B", "text": "dp[i][j] = dp[i-1][j-w]"},
                        {"id": "C", "text": "dp[i][j] = max(dp[i-1][j], dp[i-1][j-w] + values[i])"},
                        {"id": "D", "text": "dp[i][j] = dp[i][j-1] + values[i]"},
                    ],
                    "explanation": "When item i can fit (w ≤ j), there are two choices: skip it (take the same-column previous row dp[i-1][j]) or include it (previous row with reduced capacity, plus item i's value: dp[i-1][j-w] + v). Take the maximum.",
                },
            },
        },
        {
            "id": "kp-tf-2",
            "type": "true-false",
            "category": "basic",
            "difficultyRating": 950,
            "correctAnswer": "true",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "在 0/1 背包的二維 DP 實作中，dp 陣列的第 0 列（i=0，不考慮任何物品）和第 0 行（j=0，容量為 0）均應初始化為 0。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。dp[0][j] = 0（無物品可選，價值為 0）；dp[i][0] = 0（背包容量為 0，放不下任何物品）。Python 的串列初始化為 0 的預設行為符合這個要求。",
                },
                "en": {
                    "title": "In a 2D DP implementation of 0/1 Knapsack, both row 0 (i=0, no items considered) and column 0 (j=0, capacity 0) should be initialized to 0.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. dp[0][j] = 0 (no items to choose from, value is 0); dp[i][0] = 0 (capacity is 0, no item can fit). Python's default list initialization to 0 satisfies this requirement.",
                },
            },
        },
        {
            "id": "kp-q3",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 950,
            "correctAnswer": "C",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "0/1 背包問題二維 DP 解法的時間複雜度與空間複雜度分別為何（N 件物品，容量為 W）？",
                    "options": [
                        {"id": "A", "text": "時間 O(N)，空間 O(N)"},
                        {"id": "B", "text": "時間 O(N + W)，空間 O(N + W)"},
                        {"id": "C", "text": "時間 O(N × W)，空間 O(N × W)"},
                        {"id": "D", "text": "時間 O(2^N)，空間 O(2^N)"},
                    ],
                    "explanation": "二維 DP 需要填寫 (N+1) × (W+1) 的表格，每格計算 O(1)，因此時間複雜度為 O(N × W)，空間複雜度也是 O(N × W)。若使用一維滾動陣列可將空間優化至 O(W)。",
                },
                "en": {
                    "title": "What are the time and space complexities of the 2D DP solution for 0/1 Knapsack (N items, capacity W)?",
                    "options": [
                        {"id": "A", "text": "Time O(N), Space O(N)"},
                        {"id": "B", "text": "Time O(N + W), Space O(N + W)"},
                        {"id": "C", "text": "Time O(N × W), Space O(N × W)"},
                        {"id": "D", "text": "Time O(2^N), Space O(2^N)"},
                    ],
                    "explanation": "The 2D DP fills an (N+1) × (W+1) table with O(1) per cell, giving O(N × W) time and O(N × W) space. Using a 1D rolling array reduces space to O(W).",
                },
            },
        },
        {
            "id": "kp-q4",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1000,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "在題組的 DP 表格中，dp[1][2]（考慮第 1 件物品，容量 2）的值為何？",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "3"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "5"},
                    ],
                    "explanation": "item1 重量=2，價值=3。dp[1][2]：容量剛好等於 item1 的重量，可以放入。dp[1][2] = max(dp[0][2], dp[0][2-2] + 3) = max(0, 0+3) = 3。",
                },
                "en": {
                    "title": "In the group's DP table, what is dp[1][2] (considering item 1 with capacity 2)?",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "3"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "5"},
                    ],
                    "explanation": "item1 weight=2, value=3. dp[1][2]: capacity exactly equals item1's weight, can include it. dp[1][2] = max(dp[0][2], dp[0][2-2] + 3) = max(0, 0+3) = 3.",
                },
            },
        },
        {
            "id": "kp-grp-1",
            "groupId": "group-dp-trace",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1050,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "參考題組程式碼，dp[2][5]（考慮前 2 件物品，容量 5）的值為何？",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "7"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "6"},
                    ],
                    "explanation": "item2 重量=3，價值=4。dp[2][5]：放入 item2（需容量 3），剩餘容量 2 能再放 item1（價值 3）。dp[2][5] = max(dp[1][5], dp[1][5-3] + 4) = max(dp[1][5], dp[1][2] + 4) = max(3, 3+4) = 7。",
                },
                "en": {
                    "title": "Using the group code, what is dp[2][5] (first 2 items, capacity 5)?",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "7"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "6"},
                    ],
                    "explanation": "item2 weight=3, value=4. dp[2][5]: include item2 (needs capacity 3), remaining capacity 2 can fit item1 (value 3). dp[2][5] = max(dp[1][5], dp[1][5-3] + 4) = max(3, 3+4) = 7.",
                },
            },
        },
        {
            "id": "kp-q5",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1100,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "執行題組程式碼後，dp[3][5]（考慮全部 3 件物品，容量 5）的最終值為何？這也是背包問題的答案。",
                    "options": [
                        {"id": "A", "text": "5"},
                        {"id": "B", "text": "7"},
                        {"id": "C", "text": "9"},
                        {"id": "D", "text": "12"},
                    ],
                    "explanation": "item3 重量=4，價值=5。dp[3][5]：放入 item3（需容量 4），剩餘容量 1 無法再放其他物品，價值=5。不放 item3 = dp[2][5] = 7。因此 dp[3][5] = max(7, dp[2][1] + 5) = max(7, 0+5) = 7。最佳解是取 item1 + item2，總價值 = 3 + 4 = 7。",
                },
                "en": {
                    "title": "After running the group code, what is dp[3][5] (all 3 items, capacity 5)? This is also the knapsack problem's answer.",
                    "options": [
                        {"id": "A", "text": "5"},
                        {"id": "B", "text": "7"},
                        {"id": "C", "text": "9"},
                        {"id": "D", "text": "12"},
                    ],
                    "explanation": "item3 weight=4, value=5. dp[3][5]: include item3 (needs capacity 4), remaining capacity 1 can fit nothing else, value=5. Skip item3 = dp[2][5] = 7. So dp[3][5] = max(7, dp[2][1] + 5) = max(7, 0+5) = 7. Optimal: take item1 + item2, total value = 3 + 4 = 7.",
                },
            },
        },
        {
            "id": "kp-multi-1",
            "type": "multiple-choice",
            "category": "application",
            "difficultyRating": 1150,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "以下哪些是動態規劃（DP）解決問題的必要條件？（多選）",
                    "options": [
                        {"id": "opt1", "text": "問題具有「重疊子問題（Overlapping Subproblems）」的特性"},
                        {"id": "opt2", "text": "問題具有「最優子結構（Optimal Substructure）」的特性"},
                        {"id": "opt3", "text": "可以定義清晰的「狀態（State）」和「狀態轉移方程」"},
                        {"id": "opt4", "text": "問題的解空間必須可以用二維陣列表示"},
                    ],
                    "explanation": "DP 的兩大必要條件是「重疊子問題」（opt1）和「最優子結構」（opt2）。此外，需要清楚定義狀態和轉移方程（opt3）。解空間不一定是二維的，許多 DP 問題用一維或多維陣列，甚至字典（opt4 不正確）。",
                },
                "en": {
                    "title": "Which of the following are necessary conditions for Dynamic Programming (DP) to be applicable? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "The problem has 'Overlapping Subproblems'"},
                        {"id": "opt2", "text": "The problem has 'Optimal Substructure'"},
                        {"id": "opt3", "text": "A clear 'state' and 'state transition equation' can be defined"},
                        {"id": "opt4", "text": "The solution space must be representable as a 2D array"},
                    ],
                    "explanation": "The two necessary conditions for DP are 'Overlapping Subproblems' (opt1) and 'Optimal Substructure' (opt2). A clear state definition and transition equation are also required (opt3). The solution space doesn't have to be 2D — many DP problems use 1D, multi-dimensional arrays, or even dictionaries (opt4 is incorrect).",
                },
            },
        },
        {
            "id": "kp-grp-2",
            "groupId": "group-dp-trace",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1150,
            "correctAnswer": "D",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "在題組的 DP 表格中，當 i=2（item2，重量 3），j=2（容量 2）時，dp[2][2] 的值為何？",
                    "options": [
                        {"id": "A", "text": "4"},
                        {"id": "B", "text": "7"},
                        {"id": "C", "text": "0"},
                        {"id": "D", "text": "3"},
                    ],
                    "explanation": "item2 重量=3 > j=2（容量不夠），無法放入 item2。因此 dp[2][2] = dp[1][2] = 3（只考慮 item1 時，容量 2 的最大價值）。",
                },
                "en": {
                    "title": "In the group's DP table, when i=2 (item2, weight 3) and j=2 (capacity 2), what is dp[2][2]?",
                    "options": [
                        {"id": "A", "text": "4"},
                        {"id": "B", "text": "7"},
                        {"id": "C", "text": "0"},
                        {"id": "D", "text": "3"},
                    ],
                    "explanation": "item2 weight=3 > j=2 (insufficient capacity), cannot include item2. Therefore dp[2][2] = dp[1][2] = 3 (maximum value with only item1, capacity 2).",
                },
            },
        },
        {
            "id": "kp-q6",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1200,
            "correctAnswer": "D",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "在 0/1 背包的一維滾動陣列優化中，為何內層迴圈（容量）必須「從大到小」（倒序）遍歷？",
                    "options": [
                        {"id": "A", "text": "因為從大到小遍歷速度更快"},
                        {"id": "B", "text": "因為背包容量通常較大"},
                        {"id": "C", "text": "因為順序無關緊要，兩個方向都可以"},
                        {"id": "D", "text": "避免同一件物品被重複計入（每件物品只能選一次）。若從小到大遍歷，已更新的較小容量結果會被再次使用，導致物品被計算超過一次"},
                    ],
                    "explanation": "一維 dp 是滾動更新的。若從容量小往大遍歷，dp[j-w] 在更新 dp[j] 之前可能已被當前物品更新過，相當於允許同一物品被選兩次。從大到小遍歷確保 dp[j-w] 仍是「不含當前物品的舊值」。",
                },
                "en": {
                    "title": "In the 1D rolling array optimization of 0/1 Knapsack, why must the inner loop (over capacity) traverse in reverse order (large to small)?",
                    "options": [
                        {"id": "A", "text": "Because traversing large-to-small is faster"},
                        {"id": "B", "text": "Because knapsack capacity is usually large"},
                        {"id": "C", "text": "Order doesn't matter — both directions work"},
                        {"id": "D", "text": "To prevent the same item from being counted more than once. Forward traversal would reuse already-updated smaller-capacity results, effectively selecting the item twice"},
                    ],
                    "explanation": "The 1D dp is updated in-place. If traversing small-to-large, dp[j-w] may have already been updated by the current item before dp[j] is computed — equivalent to selecting the same item twice. Reverse traversal ensures dp[j-w] still holds the 'old value without the current item.'",
                },
            },
        },
        {
            "id": "kp-q7",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1250,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "以下哪個問題本質上是 0/1 背包問題的變形？",
                    "options": [
                        {"id": "A", "text": "給定一組硬幣面值，找出湊出某金額所需的最少硬幣數（每種面值無限供應）"},
                        {"id": "B", "text": "給定一組任務，每個任務有執行時間和收益，在有限時間內選擇最大化總收益"},
                        {"id": "C", "text": "對一個陣列進行合併排序"},
                        {"id": "D", "text": "找出字串中最長的回文子字串"},
                    ],
                    "explanation": "「在有限資源內選擇子集使價值最大化」是 0/1 背包的核心（opt B 正確）。硬幣找零（無限供應）是無限背包問題（opt A）。合併排序和回文子字串不是背包問題（opt C, D）。",
                },
                "en": {
                    "title": "Which of the following is fundamentally a variant of the 0/1 Knapsack problem?",
                    "options": [
                        {"id": "A", "text": "Given coin denominations, find the minimum number of coins to make a certain amount (each denomination has unlimited supply)"},
                        {"id": "B", "text": "Given a set of tasks, each with execution time and profit, select tasks to maximize total profit within a time limit"},
                        {"id": "C", "text": "Performing merge sort on an array"},
                        {"id": "D", "text": "Finding the longest palindromic substring"},
                    ],
                    "explanation": "'Selecting a subset within limited resources to maximize value' is the core of 0/1 Knapsack (opt B correct). Coin change with unlimited supply is the Unbounded Knapsack (opt A). Merge sort and palindromic substrings are not knapsack problems (opt C, D).",
                },
            },
        },
        {
            "id": "kp-grp-3",
            "groupId": "group-dp-trace",
            "type": "single-choice",
            "category": "complexity",
            "difficultyRating": 1300,
            "correctAnswer": "B",
            "points": 3,
            "translations": {
                "zh-TW": {
                    "title": "在題組的 DP 表格中，從 dp[1][1] 到 dp[3][5]，哪個格子第一次讓「總價值超過 5」？",
                    "options": [
                        {"id": "A", "text": "dp[2][4]"},
                        {"id": "B", "text": "dp[2][5]"},
                        {"id": "C", "text": "dp[3][4]"},
                        {"id": "D", "text": "dp[3][5]"},
                    ],
                    "explanation": "逐列追蹤：dp[1][*] 最大值為 3（item1）；dp[2][4] = max(dp[1][4], dp[1][1]+4) = max(3, 0+4) = 4；dp[2][5] = max(dp[1][5], dp[1][2]+4) = max(3, 3+4) = 7 > 5。因此 dp[2][5] 是第一個超過 5 的格子。",
                },
                "en": {
                    "title": "In the group's DP table, which cell is the first to have a total value exceeding 5, from dp[1][1] to dp[3][5]?",
                    "options": [
                        {"id": "A", "text": "dp[2][4]"},
                        {"id": "B", "text": "dp[2][5]"},
                        {"id": "C", "text": "dp[3][4]"},
                        {"id": "D", "text": "dp[3][5]"},
                    ],
                    "explanation": "Tracing row by row: dp[1][*] max is 3 (item1); dp[2][4] = max(dp[1][4], dp[1][1]+4) = max(3, 0+4) = 4; dp[2][5] = max(dp[1][5], dp[1][2]+4) = max(3, 3+4) = 7 > 5. So dp[2][5] is the first cell to exceed 5.",
                },
            },
        },
        {
            "id": "kp-tf-3",
            "type": "true-false",
            "category": "complexity",
            "difficultyRating": 1350,
            "correctAnswer": "true",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "0/1 背包問題使用 DP 的時間複雜度 O(N × W) 被稱為「偽多項式時間（Pseudo-Polynomial Time）」，因為 W（容量）不是輸入數量 N 的函數，而是輸入的值。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。O(N × W) 中的 W 是輸入的數值（容量），而非問題規模的多項式。若 W 可以非常大（例如 10^9），O(N × W) 就不再是多項式時間。這就是 0/1 背包問題是 NP-Complete 的根本原因。",
                },
                "en": {
                    "title": "The O(N × W) time complexity of the DP solution for 0/1 Knapsack is called 'Pseudo-Polynomial Time', because W (capacity) is a value in the input rather than a function of the input size N.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. The W in O(N × W) is an input value (capacity), not a polynomial of the problem size. If W can be very large (e.g., 10^9), O(N × W) is no longer polynomial time. This is the fundamental reason 0/1 Knapsack is NP-Complete.",
                },
            },
        },
        {
            "id": "kp-fill-1",
            "type": "fill-code",
            "category": "complexity",
            "difficultyRating": 1400,
            "correctAnswer": ["item_idx-1", "current_value", "max(skip_val, take_val)", "dp[item_idx-1][curr_capacity]"],
            "points": 5,
            "code": KNAPSACK_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 knapsack 程式碼中 (a)(b)(c)(d) 缺失的表達式，完成 0/1 背包二維 DP 的實作。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}, {"id": "d", "text": ""}],
                    "explanation": "(a) 「放入」時，查詢上一列（不含當前物品）扣除重量後的最大值：dp[item_idx-1]。(b) 加上當前物品的價值：current_value。(c) 選不放（skip_val）與放入（take_val）的最大值。(d) 無法放入時，直接繼承上一列同容量的值：dp[item_idx-1][curr_capacity]。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c)(d) in the knapsack code to complete the 0/1 Knapsack 2D DP implementation.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}, {"id": "d", "text": ""}],
                    "explanation": "(a) When 'taking' the item, look up the previous row (without current item) after subtracting weight: dp[item_idx-1]. (b) Add the current item's value: current_value. (c) Maximum of skipping (skip_val) and taking (take_val). (d) When the item cannot fit, inherit the previous row's value at the same capacity: dp[item_idx-1][curr_capacity].",
                },
            },
        },
        {
            "id": "kp-fill-2",
            "type": "fill-code",
            "category": "complexity",
            "difficultyRating": 1450,
            "correctAnswer": ["capacity", "dp[curr_capacity - w]", "capacity"],
            "points": 5,
            "code": KNAPSACK_1D_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 knapsack_1d 程式碼中 (a)(b)(c) 缺失的表達式，完成 0/1 背包一維滾動陣列優化的實作。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 倒序遍歷從 capacity 開始，確保物品不被重複計算。(b) 放入物品後查詢剩餘容量的最大值：dp[curr_capacity - w]。(c) 最終答案是 dp[capacity]，即滿容量時的最大價值。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in knapsack_1d to complete the 1D rolling array optimization for 0/1 Knapsack.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Reverse traversal starts from capacity to ensure each item is not counted twice. (b) After including the item, look up the remaining capacity's best value: dp[curr_capacity - w]. (c) The final answer is dp[capacity] — the maximum value at full capacity.",
                },
            },
        },
        {
            "id": "kp-pred-1",
            "type": "predict-line",
            "category": "complexity",
            "difficultyRating": 1500,
            "correctAnswer": "1 2 4 5 6",
            "points": 5,
            "code": DP_SINGLE_ITEM_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 dp_single_item 函數。給定 w=2, v=3, cap=3, prev=[0,0,0,5]，呼叫 dp_single_item(2, 3, 3, [0,0,0,5]) 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "L1 進入函數；L2 判斷 w(2) > cap(3)？否；L4 skip_val = prev[3] = 5；L5 take_val = prev[3-2] + 3 = prev[1] + 3 = 0 + 3 = 3；L6 return max(5, 3) = 5。行號序列：1 2 4 5 6。",
                },
                "en": {
                    "title": "Read the dp_single_item function. Given w=2, v=3, cap=3, prev=[0,0,0,5], calling dp_single_item(2, 3, 3, [0,0,0,5]) — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "L1 enter function; L2 w(2) > cap(3)? No; L4 skip_val = prev[3] = 5; L5 take_val = prev[3-2] + 3 = prev[1] + 3 = 0 + 3 = 3; L6 return max(5, 3) = 5. Line sequence: 1 2 4 5 6.",
                },
            },
        },
        {
            "id": "kp-multi-2",
            "type": "multiple-choice",
            "category": "complexity",
            "difficultyRating": 1550,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "points": 3,
            "translations": {
                "zh-TW": {
                    "title": "關於 0/1 背包與其他背包問題的比較，以下哪些敘述是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "0/1 背包：每件物品最多選一次；無限背包（完全背包）：每件物品可選無限次"},
                        {"id": "opt2", "text": "無限背包一維 DP 的內層迴圈應從小到大（正序）遍歷，以允許物品被重複選取"},
                        {"id": "opt3", "text": "分數背包（物品可分割）無法用 DP 解決，必須用暴力搜尋"},
                        {"id": "opt4", "text": "多重背包（每件物品有數量限制）可以透過將物品拆解為 0/1 背包的子問題，或使用二進位拆分技巧來處理"},
                    ],
                    "explanation": "opt1 正確：核心差異。opt2 正確：無限背包內層正向遍歷使同一物品可被反覆使用。opt3 錯誤：分數背包可以用貪心演算法（按價值/重量排序）在 O(N log N) 時間解決，比 DP 更快。opt4 正確：多重背包的常見解法。",
                },
                "en": {
                    "title": "Which statements about 0/1 Knapsack compared to other knapsack variants are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "0/1 Knapsack: each item can be selected at most once; Unbounded Knapsack: each item can be selected unlimited times"},
                        {"id": "opt2", "text": "The 1D DP inner loop for Unbounded Knapsack should traverse forward (small to large) to allow repeated item selection"},
                        {"id": "opt3", "text": "Fractional Knapsack (items can be split) cannot be solved with DP and requires brute-force search"},
                        {"id": "opt4", "text": "Bounded Knapsack (each item has a quantity limit) can be handled by decomposing into 0/1 Knapsack subproblems or using binary splitting"},
                    ],
                    "explanation": "opt1 correct: core difference. opt2 correct: forward traversal in the 1D inner loop allows the same item to be selected repeatedly. opt3 wrong: Fractional Knapsack can be solved greedily (sort by value/weight ratio) in O(N log N) — faster than DP. opt4 correct: common approach for Bounded Knapsack.",
                },
            },
        },
    ],
}

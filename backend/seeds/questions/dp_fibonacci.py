DPFIB_CODE = """def fibonacci_dp(n):
    dp = [0] * (n + 1)
    dp[0] = 0
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]"""

DPFIB_FILL_CODE = """def fibonacci_dp(n):
    size = (a)
    dp = [0] * size
    dp[0] = 0
    dp[1] = (b)
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + (c)
    return dp[n]"""

DPFIB_PREDICT_CODE = """def fibonacci_dp(n):                   # L1
    dp = [0] * (n + 1)                 # L2
    dp[0] = 0                          # L3
    dp[1] = 1                          # L4
    for i in range(2, n + 1):          # L5
        dp[i] = dp[i - 1] + dp[i - 2]  # L6
    return dp[n]                       # L7"""

DATA = {
    "slug": "dp-fibonacci",
    "groups": [
        {
            "id": "dp-fibonacci-group-1",
            "translations": {
                "zh-TW": {
                    "title": "題組：費氏數列的 DP 實作",
                    "description": "以下是用動態規劃（由下而上填表）計算第 n 個費氏數的實作。請閱讀程式碼並回答問題。",
                },
                "en": {
                    "title": "Group: Fibonacci DP Implementation",
                    "description": "Below is a bottom-up dynamic programming implementation that computes the n-th Fibonacci number. Read the code and answer the questions.",
                },
            },
            "code": DPFIB_CODE,
            "language": "python",
        },
    ],
    "questions": [
        {
            "id": "dp-fibonacci-q1",
            "type": "single-choice",
            "baseRating": 800,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "用動態規劃（陣列 dp）計算第 n 個費氏數，時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(2ⁿ)"},
                        {"id": "B", "text": "O(n)"},
                        {"id": "C", "text": "O(n²)"},
                        {"id": "D", "text": "O(log n)"},
                    ],
                    "explanation": "迴圈從 2 跑到 n，每次只做一次加法並寫入 dp[i]，共 n - 1 次，因此是 O(n)。相比之下，未優化的遞迴版是 O(2ⁿ)。",
                },
                "en": {
                    "title": "Using dynamic programming (a dp array) to compute the n-th Fibonacci number, what is the time complexity?",
                    "options": [
                        {"id": "A", "text": "O(2ⁿ)"},
                        {"id": "B", "text": "O(n)"},
                        {"id": "C", "text": "O(n²)"},
                        {"id": "D", "text": "O(log n)"},
                    ],
                    "explanation": "The loop runs from 2 to n and does one addition per iteration, n - 1 iterations in total, so it is O(n). The unoptimized recursive version is O(2ⁿ).",
                },
            },
        },
        {
            "id": "dp-fibonacci-q2",
            "groupId": "dp-fibonacci-group-1",
            "type": "single-choice",
            "baseRating": 850,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "在這段 DP 程式中，dp[i] 代表什麼？",
                    "options": [
                        {"id": "A", "text": "第 i 個費氏數"},
                        {"id": "B", "text": "前 i 個費氏數的總和"},
                        {"id": "C", "text": "迴圈執行的次數"},
                        {"id": "D", "text": "i 的階乘"},
                    ],
                    "explanation": "dp[i] 儲存的是第 i 個費氏數 F(i)，並且由已算出的 dp[i-1] 與 dp[i-2] 相加而得。",
                },
                "en": {
                    "title": "In this DP code, what does dp[i] represent?",
                    "options": [
                        {"id": "A", "text": "The i-th Fibonacci number"},
                        {"id": "B", "text": "The sum of the first i Fibonacci numbers"},
                        {"id": "C", "text": "The number of loop iterations"},
                        {"id": "D", "text": "The factorial of i"},
                    ],
                    "explanation": "dp[i] stores the i-th Fibonacci number F(i), obtained by adding the already computed dp[i-1] and dp[i-2].",
                },
            },
        },
        {
            "id": "dp-fibonacci-q3",
            "type": "true-false",
            "baseRating": 900,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "DP 版本之所以比單純遞迴快，是因為每個子問題只計算一次並把結果存起來。",
                    "options": [
                        {"id": "true", "text": "正確"},
                        {"id": "false", "text": "錯誤"},
                    ],
                    "explanation": "正確。F(2) 到 F(n) 各只算一次，之後需要時直接從 dp 陣列讀取，不會像遞迴那樣重複計算相同的子問題。",
                },
                "en": {
                    "title": "The DP version is faster than plain recursion because each subproblem is computed once and its result is stored.",
                    "options": [
                        {"id": "true", "text": "True"},
                        {"id": "false", "text": "False"},
                    ],
                    "explanation": "True. F(2) through F(n) are each computed once and then read from the dp array when needed, instead of recomputing the same subproblems like plain recursion.",
                },
            },
        },
        {
            "id": "dp-fibonacci-q4",
            "groupId": "dp-fibonacci-group-1",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "「由上而下（記憶化遞迴）」與「由下而上（本題的迴圈填表）」最主要的差別是什麼？",
                    "options": [
                        {"id": "A", "text": "由上而下的時間複雜度一定較高"},
                        {"id": "B", "text": "由下而上無法得到正確答案"},
                        {"id": "C", "text": "由下而上從 base case 開始依序往上算，不需要遞迴；由上而下則從目標問題往下遞迴並快取"},
                        {"id": "D", "text": "兩者完全相同，只是名稱不同"},
                    ],
                    "explanation": "兩者都避免重複計算、複雜度相同。由下而上用迴圈從最小的子問題逐步推到 n，沒有遞迴開銷；由上而下則由 n 往下遞迴，遇到算過的值就直接取用。",
                },
                "en": {
                    "title": "What is the main difference between top-down (memoized recursion) and bottom-up (the loop filling the table here)?",
                    "options": [
                        {"id": "A", "text": "Top-down always has a higher time complexity"},
                        {"id": "B", "text": "Bottom-up cannot produce the right answer"},
                        {"id": "C", "text": "Bottom-up starts from the base cases and builds upward without recursion; top-down recurses from the target and caches results"},
                        {"id": "D", "text": "They are identical, only the names differ"},
                    ],
                    "explanation": "Both avoid recomputation and have the same complexity. Bottom-up uses a loop to go from the smallest subproblems up to n without recursion overhead, while top-down recurses from n and reuses cached values.",
                },
            },
        },
        {
            "id": "dp-fibonacci-q5",
            "groupId": "dp-fibonacci-group-1",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "呼叫 fibonacci_dp(6) 會回傳多少？（F(0)=0、F(1)=1）",
                    "options": [
                        {"id": "A", "text": "5"},
                        {"id": "B", "text": "6"},
                        {"id": "C", "text": "7"},
                        {"id": "D", "text": "8"},
                    ],
                    "explanation": "dp = [0, 1, 1, 2, 3, 5, 8]，dp[6] = 8。",
                },
                "en": {
                    "title": "What does fibonacci_dp(6) return? (F(0)=0, F(1)=1)",
                    "options": [
                        {"id": "A", "text": "5"},
                        {"id": "B", "text": "6"},
                        {"id": "C", "text": "7"},
                        {"id": "D", "text": "8"},
                    ],
                    "explanation": "dp = [0, 1, 1, 2, 3, 5, 8], so dp[6] = 8.",
                },
            },
        },
        {
            "id": "dp-fibonacci-q6",
            "groupId": "dp-fibonacci-group-1",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "這段 DP 程式的空間複雜度為 O(n)。若只需要最後一個答案，可以優化成什麼？",
                    "options": [
                        {"id": "A", "text": "只用兩個變數滾動保存前兩項，空間降為 O(1)"},
                        {"id": "B", "text": "空間無法再降低"},
                        {"id": "C", "text": "改用二維陣列"},
                        {"id": "D", "text": "改用遞迴，空間降為 O(1)"},
                    ],
                    "explanation": "計算 F(i) 只會用到 F(i-1) 與 F(i-2)，所以只需保留最近兩個值並滾動更新，空間可以降到 O(1)，時間仍是 O(n)。遞迴版反而需要 O(n) 的呼叫堆疊。",
                },
                "en": {
                    "title": "This DP code uses O(n) space. If only the final answer is needed, what optimization is possible?",
                    "options": [
                        {"id": "A", "text": "Keep only the previous two values in two rolling variables, reducing space to O(1)"},
                        {"id": "B", "text": "The space cannot be reduced further"},
                        {"id": "C", "text": "Use a 2D array"},
                        {"id": "D", "text": "Switch to recursion, which uses O(1) space"},
                    ],
                    "explanation": "Computing F(i) only needs F(i-1) and F(i-2), so keeping the latest two values and rolling them forward reduces space to O(1) while time stays O(n). A recursive version actually needs an O(n) call stack.",
                },
            },
        },
        {
            "id": "dp-fibonacci-q7",
            "type": "multiple-choice",
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt2"],
            "translations": {
                "zh-TW": {
                    "title": "一個問題適合用動態規劃解決，通常需要具備哪些性質？（多選）",
                    "options": [
                        {"id": "opt1", "text": "重疊子問題（相同子問題會被重複需要）"},
                        {"id": "opt2", "text": "最佳子結構（大問題的答案可由小問題的答案組合而成）"},
                        {"id": "opt3", "text": "輸入資料必須事先排序"},
                        {"id": "opt4", "text": "問題規模必須是 2 的次方"},
                    ],
                    "explanation": "動態規劃的兩個核心性質是重疊子問題（opt1）與最佳子結構（opt2）。費氏數兩者皆有。是否排序（opt3）與是否為 2 的次方（opt4）和 DP 無關。",
                },
                "en": {
                    "title": "Which properties usually make a problem suitable for dynamic programming? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Overlapping subproblems (the same subproblems are needed repeatedly)"},
                        {"id": "opt2", "text": "Optimal substructure (the answer is built from answers to smaller problems)"},
                        {"id": "opt3", "text": "The input must be sorted beforehand"},
                        {"id": "opt4", "text": "The problem size must be a power of two"},
                    ],
                    "explanation": "The two core properties of DP are overlapping subproblems (opt1) and optimal substructure (opt2); Fibonacci has both. Sorted input (opt3) and power-of-two sizes (opt4) are unrelated to DP.",
                },
            },
        },
        {
            "id": "dp-fibonacci-q8",
            "groupId": "dp-fibonacci-group-1",
            "type": "single-choice",
            "baseRating": 1250,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "呼叫程式碼中的 fibonacci_dp(0) 會發生什麼事？",
                    "options": [
                        {"id": "A", "text": "回傳 0"},
                        {"id": "B", "text": "發生 IndexError，因為 dp 長度只有 1，卻存取了 dp[1]"},
                        {"id": "C", "text": "回傳 1"},
                        {"id": "D", "text": "進入無窮迴圈"},
                    ],
                    "explanation": "n = 0 時 dp = [0] * 1，長度為 1。執行 dp[1] = 1 會存取超出範圍的索引而丟出 IndexError。實務上通常會在函式開頭加上 if n <= 1: return n 這類邊界處理。",
                },
                "en": {
                    "title": "What happens when calling fibonacci_dp(0) with the code shown?",
                    "options": [
                        {"id": "A", "text": "It returns 0"},
                        {"id": "B", "text": "An IndexError, because dp has length 1 but dp[1] is accessed"},
                        {"id": "C", "text": "It returns 1"},
                        {"id": "D", "text": "It loops forever"},
                    ],
                    "explanation": "For n = 0, dp = [0] * 1 has length 1. Executing dp[1] = 1 accesses an out-of-range index and raises an IndexError. In practice you add a boundary check such as if n <= 1: return n at the start.",
                },
            },
        },
        {
            "id": "dp-fibonacci-q9",
            "groupId": "dp-fibonacci-group-1",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "呼叫 fibonacci_dp(5) 結束時，dp 陣列的內容為何？",
                    "options": [
                        {"id": "A", "text": "[0, 1, 2, 3, 4, 5]"},
                        {"id": "B", "text": "[1, 1, 2, 3, 5, 8]"},
                        {"id": "C", "text": "[0, 1, 1, 2, 3, 5]"},
                        {"id": "D", "text": "[0, 1, 1, 2, 4, 8]"},
                    ],
                    "explanation": "dp[0]=0、dp[1]=1，之後 dp[2]=1、dp[3]=2、dp[4]=3、dp[5]=5，所以 dp = [0, 1, 1, 2, 3, 5]。",
                },
                "en": {
                    "title": "After fibonacci_dp(5) finishes, what does the dp array contain?",
                    "options": [
                        {"id": "A", "text": "[0, 1, 2, 3, 4, 5]"},
                        {"id": "B", "text": "[1, 1, 2, 3, 5, 8]"},
                        {"id": "C", "text": "[0, 1, 1, 2, 3, 5]"},
                        {"id": "D", "text": "[0, 1, 1, 2, 4, 8]"},
                    ],
                    "explanation": "dp[0]=0 and dp[1]=1, then dp[2]=1, dp[3]=2, dp[4]=3, dp[5]=5, so dp = [0, 1, 1, 2, 3, 5].",
                },
            },
        },
        {
            "id": "dp-fibonacci-q10",
            "type": "fill-code",
            "baseRating": 1100,
            "correctAnswer": ["n + 1", "1", "dp[i - 2]"],
            "code": DPFIB_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 fibonacci_dp 程式碼中 (a)(b)(c) 缺失的表達式。",
                    "options": [
                        {"id": "a", "text": ""},
                        {"id": "b", "text": ""},
                        {"id": "c", "text": ""},
                    ],
                    "explanation": "(a) 要能存取 dp[n]，陣列長度（size）需要 n + 1。(b) F(1) = 1。(c) 狀態轉移為 dp[i] = dp[i - 1] + dp[i - 2]。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in the fibonacci_dp code.",
                    "options": [
                        {"id": "a", "text": ""},
                        {"id": "b", "text": ""},
                        {"id": "c", "text": ""},
                    ],
                    "explanation": "(a) To access dp[n] the array length (size) needs to be n + 1. (b) F(1) = 1. (c) The transition is dp[i] = dp[i - 1] + dp[i - 2].",
                },
            },
        },
        {
            "id": "dp-fibonacci-q11",
            "groupId": "dp-fibonacci-group-1",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "迴圈 `for i in range(2, n + 1)` 為什麼從 2 開始，而不是從 0 開始？",
                    "options": [
                        {"id": "A", "text": "因為 dp[0] 與 dp[1] 是已經直接給定的初始值（base case），從 2 開始才需要用前兩項計算"},
                        {"id": "B", "text": "因為 Python 的 range 不能從 0 開始"},
                        {"id": "C", "text": "因為費氏數列從第 2 項才有意義"},
                        {"id": "D", "text": "這只是寫法習慣，從 0 開始結果也一樣"},
                    ],
                    "explanation": "dp[0] 與 dp[1] 已經被直接設定，不需要計算。dp[i] = dp[i-1] + dp[i-2] 需要前兩項存在，所以必須從 i = 2 開始；若從 0 或 1 開始會存取到負索引而得到錯誤結果。",
                },
                "en": {
                    "title": "Why does the loop `for i in range(2, n + 1)` start at 2 instead of 0?",
                    "options": [
                        {"id": "A", "text": "dp[0] and dp[1] are given base values, and only from 2 on do we need the previous two terms"},
                        {"id": "B", "text": "Python's range cannot start at 0"},
                        {"id": "C", "text": "Fibonacci numbers only make sense from the second term"},
                        {"id": "D", "text": "It is just a habit; starting at 0 gives the same result"},
                    ],
                    "explanation": "dp[0] and dp[1] are set directly and need no computation. dp[i] = dp[i-1] + dp[i-2] requires two earlier terms, so i must start at 2; starting at 0 or 1 would use negative indices and give wrong results.",
                },
            },
        },
        {
            "id": "dp-fibonacci-q12",
            "type": "predict-line",
            "baseRating": 1250,
            "correctAnswer": "1 2 3 4 5 6 5 6 5 6 5 7",
            "code": DPFIB_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 fibonacci_dp 函數。呼叫 fibonacci_dp(4) 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "L1 進入，L2 建立陣列，L3 L4 設定 base case。迴圈 i = 2、3、4 各執行一次：L5 判斷後進入 L6 計算。迴圈結束時 L5 再判斷一次離開，L7 回傳 3。完整序列：1 2 3 4 5 6 5 6 5 6 5 7。",
                },
                "en": {
                    "title": "Read the fibonacci_dp function. Calling fibonacci_dp(4) — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "L1 enters, L2 creates the array, L3 L4 set the base cases. The loop runs for i = 2, 3, 4: L5 checks and enters, L6 computes. After the last iteration L5 checks once more and exits, then L7 returns 3. Full sequence: 1 2 3 4 5 6 5 6 5 6 5 7.",
                },
            },
        },
    ],
}

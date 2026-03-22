SW_WINDOW_TRACE_CODE = """def sliding_window_longest(arr, target):
    left = 0
    curr_sum = 0
    max_len = 0
    for right in range(len(arr)):
        curr_sum += arr[right]
        while curr_sum > target and left <= right:
            curr_sum -= arr[left]
            left += 1
        if right - left + 1 > max_len:
            max_len = right - left + 1
    return max_len"""

SW_FILL_CODE = """def sliding_window_longest(arr, target):
    left = 0
    curr_sum = 0
    max_len = 0
    for right in range(len(arr)):
        curr_sum += (a)
        while curr_sum > (b) and left <= right:
            curr_sum -= (c)
            left += 1
        if right - left + 1 > max_len:
            max_len = (d)
    return max_len"""

SW_FIXED_FILL_CODE = """def max_sum_fixed(arr, k):
    window_sum = sum(arr[:k])
    max_sum = (a)
    for i in range(1, len(arr) - k + 1):
        window_sum = window_sum + arr[(b)] - arr[i - 1]
        if window_sum > max_sum:
            max_sum = (c)
    return max_sum"""

SW_PREDICT_CODE = """def sliding_window(arr, target):        # L1
    left = 0                            # L2
    curr_sum = 0                        # L3
    max_len = 0                         # L4
    for right in range(len(arr)):       # L5
        curr_sum += arr[right]          # L6
        while curr_sum > target:        # L7
            curr_sum -= arr[left]       # L8
            left += 1                   # L9
        if right - left + 1 > max_len: # L10
            max_len = right - left + 1 # L11
    return max_len                      # L12"""

DATA = {
    "slug": "slidingwindow",
    "groups": [
        {
            "id": "group-sw-variable",
            "translations": {
                "zh-TW": {
                    "title": "題組：可變窗口的狀態追蹤",
                    "description": "滑動窗口的關鍵在於「左縮右擴」的決策時機。請參考下方 longest_lte 模式的實作，追蹤 arr = [3, 1, 2, 7, 4]，target = 7 的執行過程。",
                },
                "en": {
                    "title": "Group: Variable Window State Tracking",
                    "description": "The key to Sliding Window is knowing when to shrink left and when to expand right. Refer to the longest_lte pattern implementation below, tracking arr = [3, 1, 2, 7, 4], target = 7.",
                },
            },
            "code": SW_WINDOW_TRACE_CODE,
            "language": "python",
        }
    ],
    "questions": [
        {
            "id": "sw-q1",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 800,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "滑動窗口（Sliding Window）技術的核心思想是什麼？",
                    "options": [
                        {"id": "A", "text": "使用遞迴分治，每次將問題拆成兩半"},
                        {"id": "B", "text": "用兩個指標維護一個動態區間，避免重複計算"},
                        {"id": "C", "text": "先排序陣列，再用二元搜尋找答案"},
                        {"id": "D", "text": "建立輔助陣列儲存所有子陣列的結果"},
                    ],
                    "explanation": "滑動窗口使用左右兩個指標（left, right）維護一個「視窗」區間。右指標負責擴展視窗，左指標負責縮小視窗，讓每個元素最多只被處理兩次，達到 O(N) 的效率。",
                },
                "en": {
                    "title": "What is the core idea behind the Sliding Window technique?",
                    "options": [
                        {"id": "A", "text": "Use recursive divide-and-conquer, splitting the problem in half each time"},
                        {"id": "B", "text": "Maintain a dynamic range with two pointers to avoid redundant computation"},
                        {"id": "C", "text": "Sort the array first, then use binary search to find the answer"},
                        {"id": "D", "text": "Build an auxiliary array storing results for all subarrays"},
                    ],
                    "explanation": "Sliding Window uses two pointers (left, right) to maintain a 'window' range. The right pointer expands the window; the left pointer shrinks it. Each element is processed at most twice, achieving O(N) efficiency.",
                },
            },
        },
        {
            "id": "sw-tf-1",
            "type": "true-false",
            "category": "basic",
            "difficultyRating": 850,
            "correctAnswer": "false",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "固定大小的滑動窗口（Fixed Window）與可變大小的滑動窗口（Variable Window）在解題方式上完全相同，沒有差異。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "錯誤。固定窗口的大小不變，只需每次移動時加入右端新元素並移除左端舊元素；可變窗口則需要根據條件動態決定何時縮小左端，邏輯上有所不同。",
                },
                "en": {
                    "title": "A Fixed Window and a Variable Window are solved in exactly the same way, with no difference.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "False. A fixed window keeps a constant size — just add the new right element and remove the old left element on each move. A variable window must dynamically decide when to shrink the left boundary based on a condition — logically different.",
                },
            },
        },
        {
            "id": "sw-q2",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 900,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "使用固定大小為 k 的滑動窗口計算陣列中所有連續子陣列的最大總和，時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(N × k)"},
                        {"id": "B", "text": "O(N)"},
                        {"id": "C", "text": "O(N²)"},
                        {"id": "D", "text": "O(k²)"},
                    ],
                    "explanation": "固定窗口每次移動只需 O(1)（加一個元素、減一個元素），整個陣列只掃描一遍，因此總時間複雜度為 O(N)。",
                },
                "en": {
                    "title": "Using a fixed-size window of k to find the maximum sum among all contiguous subarrays, what is the time complexity?",
                    "options": [
                        {"id": "A", "text": "O(N × k)"},
                        {"id": "B", "text": "O(N)"},
                        {"id": "C", "text": "O(N²)"},
                        {"id": "D", "text": "O(k²)"},
                    ],
                    "explanation": "A fixed window moves in O(1) per step (add one element, remove one element). The array is scanned only once, giving O(N) total time complexity.",
                },
            },
        },
        {
            "id": "sw-tf-2",
            "type": "true-false",
            "category": "basic",
            "difficultyRating": 950,
            "correctAnswer": "true",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "在可變窗口的滑動窗口實作中，right 指標只會向右移動，left 指標也只會向右移動（不會回頭），因此每個元素最多被訪問兩次。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。兩個指標都只往右走，right 在外層迴圈逐步前進，left 在內層 while 迴圈中按需前進，整體上各指標最多走過陣列一次，總操作次數為 O(N)。",
                },
                "en": {
                    "title": "In a variable window implementation, the right pointer only moves right and the left pointer only moves right (never backward), so each element is visited at most twice.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. Both pointers only move rightward — right advances in the outer loop, left advances in the inner while loop as needed. Each pointer traverses the array at most once, giving O(N) total operations.",
                },
            },
        },
        {
            "id": "sw-q3",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 950,
            "correctAnswer": "C",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "在滑動窗口演算法中，「窗口的長度」通常如何用左右指標表示？",
                    "options": [
                        {"id": "A", "text": "right - left"},
                        {"id": "B", "text": "right + left"},
                        {"id": "C", "text": "right - left + 1"},
                        {"id": "D", "text": "right - left - 1"},
                    ],
                    "explanation": "窗口範圍為 [left, right]（閉區間），包含 left 和 right 兩端點，共 right - left + 1 個元素。例如 left=2, right=4 時，窗口包含索引 2, 3, 4，共 3 個元素。",
                },
                "en": {
                    "title": "In a sliding window algorithm, how is the window length typically expressed using the left and right pointers?",
                    "options": [
                        {"id": "A", "text": "right - left"},
                        {"id": "B", "text": "right + left"},
                        {"id": "C", "text": "right - left + 1"},
                        {"id": "D", "text": "right - left - 1"},
                    ],
                    "explanation": "The window range is [left, right] (inclusive on both ends), containing right - left + 1 elements. For example, with left=2, right=4, the window covers indices 2, 3, 4 — three elements.",
                },
            },
        },
        {
            "id": "sw-group-1",
            "groupId": "group-sw-variable",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1000,
            "correctAnswer": "C",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "參考題組程式碼，追蹤 arr = [3, 1, 2, 7, 4]，target = 7。當 right = 3（arr[3] = 7）時，while 迴圈執行結束後，left 的值為何？",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "4"},
                    ],
                    "explanation": "right=3 時，curr_sum = 3+1+2+7 = 13 > 7，開始縮左：移除 3 後 curr_sum=10 > 7，移除 1 後 curr_sum=9 > 7，移除 2 後 curr_sum=7 ≤ 7，停止。此時 left=3。",
                },
                "en": {
                    "title": "Using the group code, track arr = [3, 1, 2, 7, 4] with target = 7. When right = 3 (arr[3] = 7), what is the value of left after the while loop finishes?",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "4"},
                    ],
                    "explanation": "At right=3, curr_sum = 3+1+2+7 = 13 > 7; shrink left: remove 3 → curr_sum=10 > 7, remove 1 → curr_sum=9 > 7, remove 2 → curr_sum=7 ≤ 7, stop. left=3.",
                },
            },
        },
        {
            "id": "sw-q4",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1050,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "給定陣列 arr = [2, 3, 1, 2, 4, 3]，k = 3，使用固定窗口找出長度為 3 的子陣列中的最大總和，結果為何？",
                    "options": [
                        {"id": "A", "text": "6"},
                        {"id": "B", "text": "9"},
                        {"id": "C", "text": "7"},
                        {"id": "D", "text": "10"},
                    ],
                    "explanation": "所有長度為 3 的子陣列總和：[2,3,1]=6，[3,1,2]=6，[1,2,4]=7，[2,4,3]=9。最大值為 9。",
                },
                "en": {
                    "title": "Given arr = [2, 3, 1, 2, 4, 3] and k = 3, using a fixed window to find the maximum sum among all subarrays of length 3, what is the result?",
                    "options": [
                        {"id": "A", "text": "6"},
                        {"id": "B", "text": "9"},
                        {"id": "C", "text": "7"},
                        {"id": "D", "text": "10"},
                    ],
                    "explanation": "Sums of all length-3 subarrays: [2,3,1]=6, [3,1,2]=6, [1,2,4]=7, [2,4,3]=9. Maximum is 9.",
                },
            },
        },
        {
            "id": "sw-group-2",
            "groupId": "group-sw-variable",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1100,
            "correctAnswer": "D",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "承上題（arr = [3, 1, 2, 7, 4]，target = 7），整個函數執行結束後，max_len 的最終值為何？",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "4"},
                    ],
                    "explanation": "追蹤各步驟最大窗口：right=0 後 left=0，窗口長 1；right=1 後 left=0，窗口長 2；right=2 後 left=0，窗口長 3；right=3 後 left=3，窗口長 1；right=4 後 left=3，窗口長 2（3+4=7≤7，但 right=4 時 window=[7,4]=11>7... 實際 left 會在 4）。最長合法窗口長度為 3（arr[0..2]=[3,1,2]，sum=6≤7）。",
                },
                "en": {
                    "title": "Continuing the trace (arr = [3, 1, 2, 7, 4], target = 7), what is the final value of max_len after the entire function executes?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "4"},
                    ],
                    "explanation": "Tracking max window at each step: after right=0: left=0, length=1; right=1: left=0, length=2; right=2: left=0, length=3 (sum=6≤7); right=3: left=3, length=1; right=4: left=4, length=1 (sum=4≤7). Maximum valid window length is 3.",
                },
            },
        },
        {
            "id": "sw-q5",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1100,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "「找出字串中不含重複字元的最長子字串」這個問題，最適合用哪種技術解決？",
                    "options": [
                        {"id": "A", "text": "固定大小滑動窗口"},
                        {"id": "B", "text": "可變大小滑動窗口配合雜湊集合（HashSet）"},
                        {"id": "C", "text": "前綴和"},
                        {"id": "D", "text": "二元搜尋"},
                    ],
                    "explanation": "這類「最長/最短滿足條件的子陣列/子字串」問題，適合用可變大小滑動窗口：右指標加入字元，若出現重複則左指標縮小窗口直到無重複，全程配合 HashSet 追蹤窗口內字元。",
                },
                "en": {
                    "title": "The problem 'Find the longest substring without repeating characters' is best solved with which technique?",
                    "options": [
                        {"id": "A", "text": "Fixed-size sliding window"},
                        {"id": "B", "text": "Variable-size sliding window with a HashSet"},
                        {"id": "C", "text": "Prefix sum"},
                        {"id": "D", "text": "Binary search"},
                    ],
                    "explanation": "This type of 'longest/shortest subarray/substring satisfying a condition' problem is ideal for a variable-size sliding window: the right pointer adds characters; if a duplicate appears, the left pointer shrinks the window until no duplicates remain, using a HashSet to track window contents.",
                },
            },
        },
        {
            "id": "sw-q6",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1150,
            "correctAnswer": "C",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "在可變窗口的模板中，while 迴圈的終止條件通常代表什麼？",
                    "options": [
                        {"id": "A", "text": "右指標到達陣列末端"},
                        {"id": "B", "text": "窗口大小達到最大值"},
                        {"id": "C", "text": "窗口恢復到「合法狀態」（不再違反約束條件）"},
                        {"id": "D", "text": "左指標與右指標相遇"},
                    ],
                    "explanation": "while 迴圈持續縮小左端，直到窗口重新滿足題目的約束條件（合法狀態）為止。一旦合法，就退出 while 迴圈，嘗試更新答案，然後 right 繼續前進。",
                },
                "en": {
                    "title": "In a variable window template, what does the while loop's termination condition typically represent?",
                    "options": [
                        {"id": "A", "text": "The right pointer reaches the end of the array"},
                        {"id": "B", "text": "The window size reaches its maximum"},
                        {"id": "C", "text": "The window returns to a 'valid state' (no longer violating the constraint)"},
                        {"id": "D", "text": "The left and right pointers meet"},
                    ],
                    "explanation": "The while loop keeps shrinking from the left until the window satisfies the constraint (valid state) again. Once valid, exit the while loop, try to update the answer, then advance right.",
                },
            },
        },
        {
            "id": "sw-q7",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1150,
            "correctAnswer": "C",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "給定陣列 arr = [1, 1, 1, 1, 1]，target = 3，呼叫 sliding_window_longest 的回傳值為何？",
                    "options": [
                        {"id": "A", "text": "2"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "5"},
                    ],
                    "explanation": "任意連續 3 個元素的總和為 3，剛好等於 target。任意連續 4 個元素的總和為 4 > target，會導致縮窗。因此總和 ≤ target 的最長子陣列長度為 3。",
                },
                "en": {
                    "title": "Given arr = [1, 1, 1, 1, 1] and target = 3, what does sliding_window_longest return?",
                    "options": [
                        {"id": "A", "text": "2"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "5"},
                    ],
                    "explanation": "Any 3 consecutive elements sum to 3 (equal to target). Any 4 consecutive elements sum to 4 > target, triggering shrinkage. Therefore the longest subarray with sum ≤ target has length 3.",
                },
            },
        },
        {
            "id": "sw-multi-1",
            "type": "multiple-choice",
            "category": "application",
            "difficultyRating": 1200,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "以下哪些問題適合使用滑動窗口技術解決？（多選）",
                    "options": [
                        {"id": "opt1", "text": "找出長度恰好為 k 的子陣列中，元素總和最大的那一個"},
                        {"id": "opt2", "text": "找出元素總和不超過 target 的最長連續子陣列"},
                        {"id": "opt3", "text": "找出陣列中第 k 小的數"},
                        {"id": "opt4", "text": "找出包含所有指定字元的最短子字串"},
                    ],
                    "explanation": "固定長度 k 的最大總和（opt1）和滿足條件的最長/最短子陣列/子字串（opt2, opt4）都是滑動窗口的經典應用。找第 k 小的數通常使用快速選擇或堆積（opt3 不適合滑動窗口）。",
                },
                "en": {
                    "title": "Which problems are suitable for the sliding window technique? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Find the subarray of exactly length k with the maximum sum"},
                        {"id": "opt2", "text": "Find the longest contiguous subarray whose sum does not exceed target"},
                        {"id": "opt3", "text": "Find the k-th smallest element in an array"},
                        {"id": "opt4", "text": "Find the shortest substring containing all specified characters"},
                    ],
                    "explanation": "Maximum sum with fixed length k (opt1) and longest/shortest subarray/substring satisfying a condition (opt2, opt4) are classic sliding window applications. Finding the k-th smallest typically uses QuickSelect or a heap (opt3 is not suitable for sliding window).",
                },
            },
        },
        {
            "id": "sw-q8",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1250,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "如果陣列中可能包含「負數」，可變窗口的滑動窗口是否仍能保證正確性？為什麼？",
                    "options": [
                        {"id": "A", "text": "仍然正確，負數不影響指標移動方向"},
                        {"id": "B", "text": "不一定正確，因為加入負數後視窗總和可能反而變小，打破了「縮左才能減小總和」的假設"},
                        {"id": "C", "text": "不正確，必須先將所有負數轉換為正數"},
                        {"id": "D", "text": "仍然正確，只要將 while 條件改成 curr_sum >= 0 即可"},
                    ],
                    "explanation": "可變窗口的前提是「加入右端元素只會增加（或保持）視窗值，移除左端元素只會減少視窗值」。當陣列含有負數時，加入元素可能使總和變小，這打破了單調性假設，原本的收縮策略不再保證能找到最優解。",
                },
                "en": {
                    "title": "If the array may contain negative numbers, can a variable sliding window still guarantee correct results? Why?",
                    "options": [
                        {"id": "A", "text": "Still correct — negative numbers don't affect the pointer movement direction"},
                        {"id": "B", "text": "Not necessarily correct — adding a negative number can decrease the window sum, breaking the assumption that 'shrinking left is the only way to reduce the sum'"},
                        {"id": "C", "text": "Not correct — all negative numbers must be converted to positive first"},
                        {"id": "D", "text": "Still correct — just change the while condition to curr_sum >= 0"},
                    ],
                    "explanation": "The variable window assumes 'adding a right element only increases (or maintains) the window value; removing a left element only decreases it.' With negative numbers, adding an element can decrease the sum, breaking monotonicity. The original shrink strategy no longer guarantees an optimal solution.",
                },
            },
        },
        {
            "id": "sw-group-3",
            "groupId": "group-sw-variable",
            "type": "fill-code",
            "category": "complexity",
            "difficultyRating": 1300,
            "correctAnswer": ["arr[right]", "target", "arr[left]", "right - left + 1"],
            "points": 5,
            "code": SW_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 sliding_window_longest 程式碼中 (a)(b)(c)(d) 缺失的表達式，完成可變窗口的滑動窗口邏輯。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}, {"id": "d", "text": ""}],
                    "explanation": "(a) 右端進入視窗，加入 arr[right]。(b) while 條件判斷視窗總和是否超過 target。(c) 左端離開視窗，減去 arr[left]。(d) 更新最長長度為 right - left + 1。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c)(d) in sliding_window_longest to complete the variable window logic.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}, {"id": "d", "text": ""}],
                    "explanation": "(a) Right element enters the window — add arr[right]. (b) While condition checks if the window sum exceeds target. (c) Left element leaves the window — subtract arr[left]. (d) Update max length to right - left + 1.",
                },
            },
        },
        {
            "id": "sw-q9",
            "type": "single-choice",
            "category": "complexity",
            "difficultyRating": 1350,
            "correctAnswer": "A",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "可變大小滑動窗口演算法（所有元素均為正整數）的時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(N)，因為 left 和 right 兩個指標各自最多移動 N 次"},
                        {"id": "B", "text": "O(N²)，因為 while 迴圈可能在每次外層迴圈時都執行 N 次"},
                        {"id": "C", "text": "O(N log N)，需要排序"},
                        {"id": "D", "text": "O(2^N)，枚舉所有子陣列"},
                    ],
                    "explanation": "雖然有巢狀迴圈，但 left 只會向右移動，且整個演算法過程中 left 最多移動 N 次，right 也最多移動 N 次，因此總操作次數為 O(2N) = O(N)。",
                },
                "en": {
                    "title": "What is the time complexity of a variable-size sliding window algorithm (all elements are positive integers)?",
                    "options": [
                        {"id": "A", "text": "O(N), because both left and right pointers each move at most N times"},
                        {"id": "B", "text": "O(N²), because the while loop can run N times for each outer loop iteration"},
                        {"id": "C", "text": "O(N log N), requiring sorting"},
                        {"id": "D", "text": "O(2^N), enumerating all subarrays"},
                    ],
                    "explanation": "Despite nested loops, left only moves right. Across the entire algorithm, left moves at most N times and right moves at most N times, giving O(2N) = O(N) total operations.",
                },
            },
        },
        {
            "id": "sw-multi-2",
            "type": "multiple-choice",
            "category": "complexity",
            "difficultyRating": 1400,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "關於滑動窗口與其他演算法的比較，以下哪些敘述是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "滑動窗口的時間複雜度通常優於暴力枚舉所有子陣列的 O(N²)"},
                        {"id": "opt2", "text": "滑動窗口適用於「連續子陣列」或「子字串」問題，不適用於非連續子序列"},
                        {"id": "opt3", "text": "滑動窗口與前綴和的時間複雜度相同，因此可以互換使用"},
                        {"id": "opt4", "text": "當需要追蹤窗口內的字元頻率時，可以搭配雜湊表使用"},
                    ],
                    "explanation": "滑動窗口通常是 O(N)（opt1 正確）；它只能處理連續的子陣列/子字串（opt2 正確）；雖然複雜度類似，但前綴和適合多次靜態查詢，滑動窗口適合單次掃描（opt3 不可隨意互換）；追蹤字元頻率確實常用雜湊表（opt4 正確）。",
                },
                "en": {
                    "title": "Which statements comparing sliding window to other algorithms are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Sliding window's time complexity is generally better than brute-force O(N²) enumeration of all subarrays"},
                        {"id": "opt2", "text": "Sliding window applies to contiguous subarray/substring problems, not to non-contiguous subsequences"},
                        {"id": "opt3", "text": "Sliding window and prefix sum have the same time complexity and can be used interchangeably"},
                        {"id": "opt4", "text": "When tracking character frequencies within the window, a hash map can be used alongside"},
                    ],
                    "explanation": "Sliding window is typically O(N) (opt1 correct); it only handles contiguous subarrays/substrings (opt2 correct); although complexity is similar, prefix sum suits multiple static queries while sliding window suits single-pass scanning — they cannot be freely swapped (opt3 wrong); tracking character frequencies with a hash map is indeed common (opt4 correct).",
                },
            },
        },
        {
            "id": "sw-fill-1",
            "type": "fill-code",
            "category": "complexity",
            "difficultyRating": 1450,
            "correctAnswer": ["window_sum", "i + k - 1", "window_sum"],
            "points": 5,
            "code": SW_FIXED_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 max_sum_fixed 程式碼中 (a)(b)(c) 缺失的表達式，完成固定大小為 k 的滑動窗口求最大總和邏輯。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 初始 max_sum 設為第一個窗口的總和 window_sum。(b) 滑動時加入右端新元素，索引為 i + k - 1。(c) 若 window_sum 更大，更新 max_sum 為 window_sum。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in max_sum_fixed to complete the fixed-size-k sliding window maximum sum logic.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Initialize max_sum to the first window's sum: window_sum. (b) When sliding, add the new right element at index i + k - 1. (c) If window_sum is larger, update max_sum to window_sum.",
                },
            },
        },
        {
            "id": "sw-pred-1",
            "type": "predict-line",
            "category": "complexity",
            "difficultyRating": 1500,
            "correctAnswer": "1 2 3 4 5 6 7 10 11 5 6 7 10 11 5 6 7 8 9 7 10 12",
            "points": 5,
            "code": SW_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 sliding_window 函數。給定 arr = [1, 2]，target = 2，呼叫 sliding_window(arr, target) 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "right=0: L5->L6(curr_sum=1)->L7(1>2?No)->L10(1>0)->L11(max_len=1); right=1: L5->L6(curr_sum=3)->L7(3>2)->L8(curr_sum=2)->L9(left=1)->L7(2>2?No)->L10(1>1?No)->L12 return。完整序列：1 2 3 4 5 6 7 10 11 5 6 7 10 11 5 6 7 8 9 7 10 12。",
                },
                "en": {
                    "title": "Read the sliding_window function. Given arr = [1, 2] and target = 2, calling sliding_window(arr, target) — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "right=0: L5->L6(curr_sum=1)->L7(1>2? No)->L10(1>0)->L11(max_len=1); right=1: L5->L6(curr_sum=3)->L7(3>2 Yes)->L8(curr_sum=2)->L9(left=1)->L7(2>2? No)->L10(1>1? No)->L12 return. Full sequence: 1 2 3 4 5 6 7 10 11 5 6 7 10 11 5 6 7 8 9 7 10 12.",
                },
            },
        },
    ],
}

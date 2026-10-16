TP_TWO_SUM_TRACE_CODE = """def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        s = arr[left] + arr[right]
        if s == target:
            return left, right
        elif s < target:
            left += 1
        else:
            right -= 1
    return None"""

TP_TWO_SUM_FILL_CODE = """def two_sum_sorted(arr, target):
    left, right = 0, (a)
    while left < right:
        s = (b)
        if s == target:
            return left, right
        elif s < target:
            left = (c)
        else:
            right = (d)
    return None"""

TP_DEDUP_FILL_CODE = """def remove_duplicates(arr):
    if not arr:
        return 0
    slow = 0
    for fast in range(1, len(arr)):
        if arr[fast] == (a):
            continue
        slow += 1
        arr[(b)] = arr[fast]
    return (c)"""

TP_PREDICT_CODE = """def two_sum_sorted(arr, target):       # L1
    left, right = 0, len(arr) - 1       # L2
    while left < right:                 # L3
        s = arr[left] + arr[right]      # L4
        if s == target:                 # L5
            return left, right          # L6
        elif s < target:                # L7
            left += 1                   # L8
        else:                           # L9
            right -= 1                  # L10
    return None                         # L11"""

# slug 必須與 seed_tutorials.py / levels.json 的關卡 id 一致（"two-pointers"），
# 否則 seed_questions 會找不到 tutorial 而整份跳過
DATA = {
    "slug": "two-pointers",
    "groups": [
        {
            "id": "two-pointers-group-1",
            "translations": {
                "zh-TW": {
                    "title": "題組：對向雙指標的狀態追蹤",
                    "description": "對向雙指標的關鍵在於「每次比較都能排除一個元素」。請參考下方 two_sum_sorted 的實作，追蹤 arr = [1, 3, 4, 6, 8, 11]，target = 10 的執行過程。",
                },
                "en": {
                    "title": "Group: Opposite-Direction Pointer State Tracking",
                    "description": "The key to opposite-direction two pointers is that every comparison rules out one element. Refer to the two_sum_sorted implementation below, tracking arr = [1, 3, 4, 6, 8, 11], target = 10.",
                },
            },
            "code": TP_TWO_SUM_TRACE_CODE,
            "language": "python",
        }
    ],
    "questions": [
        {
            "id": "two-pointers-q1",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在排序陣列上用對向雙指標找「兩數和等於 target」，為什麼每次比較後都可以安全地移動其中一個指標？",
                    "options": [
                        {"id": "A", "text": "因為兩個指標最後一定會相遇，移哪個都一樣"},
                        {"id": "B", "text": "因為陣列有序，每次比較都能確定其中一端的元素不可能是答案，可以直接排除"},
                        {"id": "C", "text": "因為每個元素只會出現一次，不需要重複檢查"},
                        {"id": "D", "text": "因為指標移動後會重新排序陣列"},
                    ],
                    "explanation": "陣列有序時，若 arr[left] + arr[right] < target，arr[left] 配上目前區間內最大的 arr[right] 都不夠大，配其他數只會更小，所以 arr[left] 可以排除，left 右移；和太大時同理排除 arr[right]。每一步都縮小一格搜尋範圍，因此不會漏掉答案。",
                },
                "en": {
                    "title": "When using opposite-direction two pointers on a sorted array to find two numbers summing to target, why is it safe to move one pointer after each comparison?",
                    "options": [
                        {"id": "A", "text": "Because the pointers always meet eventually, so it does not matter which one moves"},
                        {"id": "B", "text": "Because the array is sorted, each comparison proves one end's element cannot be part of the answer, so it can be discarded"},
                        {"id": "C", "text": "Because each element appears only once, so nothing needs rechecking"},
                        {"id": "D", "text": "Because moving a pointer re-sorts the array"},
                    ],
                    "explanation": "In a sorted array, if arr[left] + arr[right] < target, even pairing arr[left] with the largest remaining value is too small, and any other partner is smaller still, so arr[left] can be discarded and left moves right. The same logic discards arr[right] when the sum is too large. Each step shrinks the search range by one without skipping the answer.",
                },
            },
        },
        {
            "id": "two-pointers-q2",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "對向雙指標求兩數之和的做法，直接套用在「未排序」的陣列上也能保證找到答案。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "錯誤。這個做法依賴「left 右移和會變大、right 左移和會變小」的單調性，只有在陣列有序時才成立。未排序陣列要嘛先排序（O(N log N)），要嘛改用雜湊表（O(N) 時間、O(N) 空間）。",
                },
                "en": {
                    "title": "The opposite-direction two pointers approach for Two Sum is guaranteed to find the answer even on an unsorted array.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "False. The approach relies on the monotonic property that moving left right increases the sum and moving right left decreases it, which only holds for a sorted array. For an unsorted array, either sort first (O(N log N)) or use a hash map (O(N) time, O(N) space).",
                },
            },
        },
        {
            "id": "two-pointers-q3",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在長度為 N 的排序陣列上，用對向雙指標找兩數之和，最壞情況的時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(N²)"},
                        {"id": "B", "text": "O(N)"},
                        {"id": "C", "text": "O(N log N)"},
                        {"id": "D", "text": "O(log N)"},
                    ],
                    "explanation": "每次迴圈 left 右移或 right 左移其中之一，兩指標間的距離每次減 1，最多 N - 1 次就會相遇，因此是 O(N)。相比暴力枚舉所有配對的 O(N²) 快很多。",
                },
                "en": {
                    "title": "On a sorted array of length N, what is the worst-case time complexity of finding Two Sum with opposite-direction two pointers?",
                    "options": [
                        {"id": "A", "text": "O(N²)"},
                        {"id": "B", "text": "O(N)"},
                        {"id": "C", "text": "O(N log N)"},
                        {"id": "D", "text": "O(log N)"},
                    ],
                    "explanation": "Each iteration moves either left right or right left, shrinking the gap by 1, so the pointers meet after at most N - 1 iterations: O(N). That is much faster than brute-forcing every pair in O(N²).",
                },
            },
        },
        {
            "id": "two-pointers-q4",
            "type": "true-false",
            "baseRating": 900,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "在快慢指標原地移除重複元素的做法中，slow 永遠不會超過 fast（slow ≤ fast 恆成立）。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。fast 每輪一定前進一格，slow 只有在遇到新值時才前進一格，所以 slow 前進的次數不會多於 fast。這也保證了寫入 arr[slow] 時，覆蓋的都是 fast 已經看過的位置，不會蓋掉還沒掃描的資料。",
                },
                "en": {
                    "title": "In the fast/slow pointer approach to removing duplicates in place, slow never passes fast (slow ≤ fast always holds).",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. fast advances every iteration, while slow advances only when a new value appears, so slow can never move more times than fast. This also guarantees that writing to arr[slow] only overwrites positions fast has already visited, never unscanned data.",
                },
            },
        },
        {
            "id": "two-pointers-q5",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "對向雙指標求兩數之和時，若 arr[left] + arr[right] < target，下一步應該怎麼做？",
                    "options": [
                        {"id": "A", "text": "left 右移（left += 1），換一個更大的數"},
                        {"id": "B", "text": "right 左移（right -= 1），換一個更小的數"},
                        {"id": "C", "text": "left 和 right 同時往中間移動"},
                        {"id": "D", "text": "直接回傳找不到"},
                    ],
                    "explanation": "和太小代表需要更大的數。陣列由小到大排序，left 右移會換到更大的值；right 左移只會讓和更小，方向錯了。",
                },
                "en": {
                    "title": "In opposite-direction Two Sum, if arr[left] + arr[right] < target, what should happen next?",
                    "options": [
                        {"id": "A", "text": "Move left right (left += 1) to a larger number"},
                        {"id": "B", "text": "Move right left (right -= 1) to a smaller number"},
                        {"id": "C", "text": "Move both left and right toward the middle"},
                        {"id": "D", "text": "Return not found immediately"},
                    ],
                    "explanation": "A sum that is too small needs a larger number. The array is sorted ascending, so moving left right picks a larger value; moving right left would only make the sum smaller.",
                },
            },
        },
        {
            "id": "two-pointers-q6",
            "groupId": "two-pointers-group-1",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "參考題組程式碼，追蹤 arr = [1, 3, 4, 6, 8, 11]，target = 10。函數回傳前，s = arr[left] + arr[right] 這一行總共被執行了幾次？",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "5"},
                        {"id": "D", "text": "6"},
                    ],
                    "explanation": "(0,5)：1+11=12 > 10，right 左移；(0,4)：1+8=9 < 10，left 右移；(1,4)：3+8=11 > 10，right 左移；(1,3)：3+6=9 < 10，left 右移；(2,3)：4+6=10，找到並回傳。共計算 5 次。",
                },
                "en": {
                    "title": "Using the group code, track arr = [1, 3, 4, 6, 8, 11] with target = 10. How many times does the line s = arr[left] + arr[right] run before the function returns?",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "5"},
                        {"id": "D", "text": "6"},
                    ],
                    "explanation": "(0,5): 1+11=12 > 10, move right; (0,4): 1+8=9 < 10, move left; (1,4): 3+8=11 > 10, move right; (1,3): 3+6=9 < 10, move left; (2,3): 4+6=10, found and returned. 5 computations in total.",
                },
            },
        },
        {
            "id": "two-pointers-q7",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對排序陣列 arr = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] 呼叫快慢指標版的 remove_duplicates(arr)，回傳值為何？",
                    "options": [
                        {"id": "A", "text": "4"},
                        {"id": "B", "text": "5"},
                        {"id": "C", "text": "6"},
                        {"id": "D", "text": "10"},
                    ],
                    "explanation": "不重複的值有 0, 1, 2, 3, 4 共 5 個。執行後 arr 的前 5 格變成 [0, 1, 2, 3, 4]，回傳 slow + 1 = 5；第 5 格之後的內容已經沒有意義。",
                },
                "en": {
                    "title": "Calling the fast/slow pointer remove_duplicates(arr) on the sorted array arr = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4], what is returned?",
                    "options": [
                        {"id": "A", "text": "4"},
                        {"id": "B", "text": "5"},
                        {"id": "C", "text": "6"},
                        {"id": "D", "text": "10"},
                    ],
                    "explanation": "There are 5 distinct values: 0, 1, 2, 3, 4. Afterwards the first 5 slots of arr hold [0, 1, 2, 3, 4] and slow + 1 = 5 is returned; anything beyond slot 5 is irrelevant.",
                },
            },
        },
        {
            "id": "two-pointers-q8",
            "groupId": "two-pointers-group-1",
            "type": "single-choice",
            "baseRating": 1300,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "承上題（arr = [1, 3, 4, 6, 8, 11]，target = 10），函數最後回傳的 (left, right) 為何？",
                    "options": [
                        {"id": "A", "text": "(1, 4)"},
                        {"id": "B", "text": "(2, 3)"},
                        {"id": "C", "text": "(0, 5)"},
                        {"id": "D", "text": "None"},
                    ],
                    "explanation": "追蹤到最後一步時 left = 2、right = 3，arr[2] + arr[3] = 4 + 6 = 10，等於 target，回傳 (2, 3)。注意 (1, 4) 的 3 + 8 = 11 並不等於 10。",
                },
                "en": {
                    "title": "Continuing the trace (arr = [1, 3, 4, 6, 8, 11], target = 10), what (left, right) does the function return?",
                    "options": [
                        {"id": "A", "text": "(1, 4)"},
                        {"id": "B", "text": "(2, 3)"},
                        {"id": "C", "text": "(0, 5)"},
                        {"id": "D", "text": "None"},
                    ],
                    "explanation": "At the final step left = 2 and right = 3, and arr[2] + arr[3] = 4 + 6 = 10 equals target, so (2, 3) is returned. Note that (1, 4) gives 3 + 8 = 11, not 10.",
                },
            },
        },
        {
            "id": "two-pointers-q9",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "「盛最多水的容器（Container With Most Water）」用對向雙指標解時，每一步應該移動哪一個指標？",
                    "options": [
                        {"id": "A", "text": "永遠移動左指標"},
                        {"id": "B", "text": "移動高度較高的那一邊"},
                        {"id": "C", "text": "移動高度較矮的那一邊"},
                        {"id": "D", "text": "兩邊同時移動"},
                    ],
                    "explanation": "水量由較矮的那一邊決定。移動較高的一邊時，寬度變小、高度上限仍被矮邊卡住，面積不可能變大；只有移動較矮的一邊，才有機會換到更高的牆讓面積變大。",
                },
                "en": {
                    "title": "When solving Container With Most Water with opposite-direction two pointers, which pointer should move at each step?",
                    "options": [
                        {"id": "A", "text": "Always the left pointer"},
                        {"id": "B", "text": "The side with the taller height"},
                        {"id": "C", "text": "The side with the shorter height"},
                        {"id": "D", "text": "Both sides at once"},
                    ],
                    "explanation": "The water level is limited by the shorter side. Moving the taller side shrinks the width while the height stays capped by the short side, so the area can never grow. Only moving the shorter side can reach a taller wall and a larger area.",
                },
            },
        },
        {
            "id": "two-pointers-q10",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "在快慢指標移除重複元素的做法中，slow 指標代表的意義是什麼？",
                    "options": [
                        {"id": "A", "text": "已確定不重複的區域中，最後一個元素的位置"},
                        {"id": "B", "text": "目前正在檢查的元素位置"},
                        {"id": "C", "text": "下一個重複元素的位置"},
                        {"id": "D", "text": "陣列中最大值的位置"},
                    ],
                    "explanation": "arr[0..slow] 是已經整理好、不含重複的區域，slow 指向它的最後一格；負責往前掃描、檢查每個元素的是 fast。",
                },
                "en": {
                    "title": "In the fast/slow pointer approach to removing duplicates, what does the slow pointer represent?",
                    "options": [
                        {"id": "A", "text": "The position of the last element in the confirmed duplicate-free region"},
                        {"id": "B", "text": "The position of the element currently being checked"},
                        {"id": "C", "text": "The position of the next duplicate"},
                        {"id": "D", "text": "The position of the maximum value"},
                    ],
                    "explanation": "arr[0..slow] is the finished, duplicate-free region, and slow points to its last slot. fast is the pointer that scans ahead and checks each element.",
                },
            },
        },
        {
            "id": "two-pointers-q11",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對 arr = [1, 2, 3, 4, 5] 呼叫 two_sum_sorted(arr, 100)，在回傳 None 之前，總共做了幾次 arr[left] + arr[right] 的比較？",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "5"},
                        {"id": "D", "text": "10"},
                    ],
                    "explanation": "任何兩數和都小於 100，所以每次都是 left 右移：(0,4)、(1,4)、(2,4)、(3,4) 共 4 次，之後 left = right = 4，迴圈結束。一般來說最多比較 N - 1 次。",
                },
                "en": {
                    "title": "Calling two_sum_sorted(arr, 100) on arr = [1, 2, 3, 4, 5], how many arr[left] + arr[right] comparisons happen before None is returned?",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "5"},
                        {"id": "D", "text": "10"},
                    ],
                    "explanation": "Every pair sums to less than 100, so left moves right each time: (0,4), (1,4), (2,4), (3,4), 4 comparisons. Then left = right = 4 and the loop ends. In general there are at most N - 1 comparisons.",
                },
            },
        },
        {
            "id": "two-pointers-q12",
            "type": "multiple-choice",
            "baseRating": 1000,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些問題適合使用雙指標技巧解決？（多選）",
                    "options": [
                        {"id": "opt1", "text": "在排序陣列中找出兩數和等於 target 的一組數"},
                        {"id": "opt2", "text": "原地移除排序陣列中的重複元素"},
                        {"id": "opt3", "text": "找出未排序陣列中出現次數最多的元素"},
                        {"id": "opt4", "text": "判斷一個字串是否為回文"},
                    ],
                    "explanation": "兩數之和（opt1）與回文判斷（opt4）是對向雙指標的經典題；原地去重（opt2）是同向快慢指標的經典題。找出現次數最多的元素（opt3）需要計數，通常用雜湊表。",
                },
                "en": {
                    "title": "Which problems are suitable for the two pointers technique? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Find a pair in a sorted array that sums to target"},
                        {"id": "opt2", "text": "Remove duplicates from a sorted array in place"},
                        {"id": "opt3", "text": "Find the most frequent element in an unsorted array"},
                        {"id": "opt4", "text": "Check whether a string is a palindrome"},
                    ],
                    "explanation": "Two Sum (opt1) and palindrome checking (opt4) are classic opposite-direction problems; in-place de-duplication (opt2) is a classic fast/slow problem. Finding the most frequent element (opt3) needs counting, usually with a hash map.",
                },
            },
        },
        {
            "id": "two-pointers-q13",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "同樣是在陣列中找兩數和等於 target，排序陣列 + 對向雙指標，和未排序陣列 + 雜湊表相比，雙指標的主要優勢是什麼？",
                    "options": [
                        {"id": "A", "text": "時間複雜度從 O(N) 降到 O(log N)"},
                        {"id": "B", "text": "可以處理未排序的陣列"},
                        {"id": "C", "text": "可以一次找出所有符合的組合，雜湊表做不到"},
                        {"id": "D", "text": "只需要 O(1) 的額外空間，雜湊表需要 O(N)"},
                    ],
                    "explanation": "兩者在已排序的前提下時間都是 O(N)，但雙指標只用兩個索引變數，額外空間 O(1)；雜湊表要存下看過的元素，額外空間 O(N)。反過來說，若陣列未排序，雜湊表省去排序的 O(N log N)。",
                },
                "en": {
                    "title": "For finding two numbers summing to target, what is the main advantage of a sorted array with opposite-direction pointers over an unsorted array with a hash map?",
                    "options": [
                        {"id": "A", "text": "Time complexity drops from O(N) to O(log N)"},
                        {"id": "B", "text": "It can handle unsorted arrays"},
                        {"id": "C", "text": "It can find all matching pairs at once, which a hash map cannot"},
                        {"id": "D", "text": "It needs only O(1) extra space, while a hash map needs O(N)"},
                    ],
                    "explanation": "Given a sorted array both run in O(N) time, but two pointers use only two index variables (O(1) extra space), while a hash map stores seen elements (O(N) extra space). Conversely, for an unsorted array the hash map avoids the O(N log N) sort.",
                },
            },
        },
        {
            "id": "two-pointers-q14",
            "groupId": "two-pointers-group-1",
            "type": "fill-code",
            "baseRating": 1150,
            "correctAnswer": [
                "len(arr) - 1",
                "arr[left] + arr[right]|arr[right] + arr[left]",
                "left + 1|1 + left",
                "right - 1",
            ],
            "code": TP_TWO_SUM_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 two_sum_sorted 程式碼中 (a)(b)(c)(d) 缺失的表達式，完成對向雙指標的兩數之和邏輯。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}, {"id": "d", "text": ""}],
                    "explanation": "(a) right 從最後一個索引 len(arr) - 1 出發。(b) 計算兩指標所指元素的和 arr[left] + arr[right]。(c) 和太小，left 右移為 left + 1。(d) 和太大，right 左移為 right - 1。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c)(d) in two_sum_sorted to complete the opposite-direction Two Sum logic.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}, {"id": "d", "text": ""}],
                    "explanation": "(a) right starts at the last index, len(arr) - 1. (b) Sum the elements under both pointers: arr[left] + arr[right]. (c) Sum too small: move left right to left + 1. (d) Sum too large: move right left to right - 1.",
                },
            },
        },
        {
            "id": "two-pointers-q15",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "用快慢指標原地移除長度為 N 的排序陣列中的重複元素，時間與額外空間複雜度分別為何？",
                    "options": [
                        {"id": "A", "text": "時間 O(N)，額外空間 O(1)"},
                        {"id": "B", "text": "時間 O(N)，額外空間 O(N)"},
                        {"id": "C", "text": "時間 O(N²)，額外空間 O(1)"},
                        {"id": "D", "text": "時間 O(N log N)，額外空間 O(1)"},
                    ],
                    "explanation": "fast 從頭到尾掃過一次，每個元素只做一次比較與最多一次寫入，時間 O(N)；結果直接寫回原陣列，只用了 slow、fast 兩個變數，額外空間 O(1)。",
                },
                "en": {
                    "title": "What are the time and extra space complexities of removing duplicates in place from a sorted array of length N with fast/slow pointers?",
                    "options": [
                        {"id": "A", "text": "O(N) time, O(1) extra space"},
                        {"id": "B", "text": "O(N) time, O(N) extra space"},
                        {"id": "C", "text": "O(N²) time, O(1) extra space"},
                        {"id": "D", "text": "O(N log N) time, O(1) extra space"},
                    ],
                    "explanation": "fast scans the array once, and each element gets one comparison and at most one write: O(N) time. Results are written back into the original array using only slow and fast: O(1) extra space.",
                },
            },
        },
        {
            "id": "two-pointers-q16",
            "type": "multiple-choice",
            "baseRating": 1000,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "關於雙指標技巧，以下哪些敘述是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "雙指標常能把暴力枚舉配對的 O(N²) 降到 O(N)"},
                        {"id": "opt2", "text": "滑動窗口可以看成同向雙指標的一種特例"},
                        {"id": "opt3", "text": "所有雙指標問題都必須先將陣列排序"},
                        {"id": "opt4", "text": "對向雙指標的迴圈通常在 left ≥ right 時結束"},
                    ],
                    "explanation": "雙指標讓每個元素只被看常數次，常見效果是 O(N²) → O(N)（opt1 正確）；滑動窗口的 left、right 都只往右走，正是同向雙指標（opt2 正確）；回文判斷、移動零等問題不需要排序（opt3 錯誤）；對向指標相遇或交錯時代表區間已搜尋完畢（opt4 正確）。",
                },
                "en": {
                    "title": "Which statements about the two pointers technique are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Two pointers often reduce brute-force O(N²) pair enumeration to O(N)"},
                        {"id": "opt2", "text": "A sliding window can be seen as a special case of same-direction two pointers"},
                        {"id": "opt3", "text": "Every two pointers problem requires sorting the array first"},
                        {"id": "opt4", "text": "An opposite-direction loop usually ends when left ≥ right"},
                    ],
                    "explanation": "Two pointers look at each element a constant number of times, typically turning O(N²) into O(N) (opt1 correct); in a sliding window both left and right only move right, which is same-direction two pointers (opt2 correct); palindrome checking and Move Zeroes need no sorting (opt3 wrong); when opposite pointers meet or cross, the range has been fully searched (opt4 correct).",
                },
            },
        },
        {
            "id": "two-pointers-q17",
            "type": "fill-code",
            "baseRating": 1150,
            "correctAnswer": ["arr[slow]", "slow", "slow + 1|1 + slow"],
            "code": TP_DEDUP_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 remove_duplicates 程式碼中 (a)(b)(c) 缺失的表達式，完成快慢指標原地移除重複元素的邏輯。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) fast 掃到的值和保留區最後一個值 arr[slow] 相同就跳過。(b) 遇到新值時 slow 先前進，再把值寫入 arr[slow]。(c) 保留區為 arr[0..slow]，長度為 slow + 1。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in remove_duplicates to complete the fast/slow in-place de-duplication logic.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) Skip when fast's value equals the last kept value, arr[slow]. (b) On a new value, slow advances first and the value is written to arr[slow]. (c) The kept region is arr[0..slow], whose length is slow + 1.",
                },
            },
        },
        {
            "id": "two-pointers-q18",
            "type": "predict-line",
            "baseRating": 1300,
            "correctAnswer": "1 2 3 4 5 7 8 3 4 5 6",
            "code": TP_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 two_sum_sorted 函數。給定 arr = [1, 2, 4]，target = 6，呼叫 two_sum_sorted(arr, target) 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "L1 進入函數 → L2(left=0, right=2) → L3(0<2) → L4(s=1+4=5) → L5(5==6? 否) → L7(5<6 是) → L8(left=1) → L3(1<2) → L4(s=2+4=6) → L5(6==6 是) → L6 回傳 (1, 2)。完整序列：1 2 3 4 5 7 8 3 4 5 6。",
                },
                "en": {
                    "title": "Read the two_sum_sorted function. Given arr = [1, 2, 4] and target = 6, calling two_sum_sorted(arr, target) — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "L1 enter → L2(left=0, right=2) → L3(0<2) → L4(s=1+4=5) → L5(5==6? No) → L7(5<6 Yes) → L8(left=1) → L3(1<2) → L4(s=2+4=6) → L5(6==6 Yes) → L6 return (1, 2). Full sequence: 1 2 3 4 5 7 8 3 4 5 6.",
                },
            },
        },
    ],
}

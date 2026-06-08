INSERT_CODE = """def search_insert(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    # 找不到目標時，left 指標剛好就是該插入的正確位置
    return left"""

INSERT_FILL_CODE = """def search_insert(arr, target):
    left = 0
    right = len(arr) - 1
    while (a):
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = (b)
        else:
            right = (c)
    return left"""

BS_FILL_CODE = """def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return (a)
        elif arr[mid] < target:
            (b) = mid + 1
        else:
            (c) = mid - 1
    return -1"""

BS_PREDICT_CODE = """def binary_search(arr, target):           # L1
    left = 0                              # L2
    right = len(arr) - 1                  # L3
    while left <= right:                  # L4
        mid = (left + right) // 2         # L5
        if arr[mid] == target:            # L6
            return mid                    # L7
        elif arr[mid] < target:           # L8
            left = mid + 1                # L9
        else:                             # L10
            right = mid - 1               # L11
    return -1                             # L12"""

DATA = {
    "slug": "binary-search",
    "groups": [
        {
            "id": "group-bs-insert",
            "translations": {
                "zh-TW": {
                    "title": "題組：尋找插入位置 (Search Insert Position)",
                    "description": "二分搜尋不僅能找存在的元素，還能用來找出「元素應該被插入的位置」(LeetCode 35)。請參考下方程式碼回答問題。",
                },
                "en": {
                    "title": "Group: Search Insert Position",
                    "description": "Binary Search can not only find existing elements, but also find the position where an element should be inserted (LeetCode 35). Read the code below and answer the questions.",
                },
            },
            "code": INSERT_CODE,
            "language": "python",
        }
    ],
    "questions": [
        # 【Basic 基礎】 800-950
        {
            "id": "bs-tf-1",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "二分搜尋 (Binary Search) 的前提條件是：陣列必須是已排序的 (sorted)。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。二分搜尋的核心邏輯是根據中間元素與目標的大小關係，決定要往左半邊還是右半邊繼續搜尋。這個邏輯只有在陣列已排序的前提下才能成立。",
                },
                "en": {
                    "title": "A prerequisite for Binary Search is that the array must be sorted.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Correct. The core logic of Binary Search relies on comparing the middle element with the target to decide whether to search the left or right half. This only works if the array is already sorted.",
                },
            },
        },
        {
            "id": "bs-q1",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "二分搜尋演算法在最理想的情況下（目標值剛好在中間），其時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "最佳情況是第一次就找到目標（目標恰好是中間元素），只需一次比較，時間複雜度為 O(1)。",
                },
                "en": {
                    "title": "What is the time complexity of Binary Search in the best case (target is exactly in the middle)?",
                    "options": [
                        {"id": "A", "text": "O(1)"},
                        {"id": "B", "text": "O(log n)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n log n)"},
                    ],
                    "explanation": "The best case is when the target is found on the first check (it is exactly the middle element), requiring only one comparison, giving O(1) time complexity.",
                },
            },
        },
        {
            "id": "bs-q2",
            "type": "single-choice",
            "baseRating": 850,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在二分搜尋中，`mid = (left + right) // 2` 這行程式碼的目的是什麼？",
                    "options": [
                        {"id": "A", "text": "計算陣列的平均值"},
                        {"id": "B", "text": "找出目前搜尋範圍的中間索引"},
                        {"id": "C", "text": "計算目標值與邊界的距離"},
                        {"id": "D", "text": "判斷陣列是否已排序"},
                    ],
                    "explanation": "`mid = (left + right) // 2` 使用整數除法計算 left 和 right 兩個邊界的中間索引，每次將搜尋範圍縮小一半。",
                },
                "en": {
                    "title": "In Binary Search, what is the purpose of `mid = (left + right) // 2`?",
                    "options": [
                        {"id": "A", "text": "To calculate the average value of the array"},
                        {"id": "B", "text": "To find the middle index of the current search range"},
                        {"id": "C", "text": "To calculate the distance between the target and the boundaries"},
                        {"id": "D", "text": "To check whether the array is sorted"},
                    ],
                    "explanation": "`mid = (left + right) // 2` uses integer division to compute the middle index between the left and right boundaries, halving the search range each iteration.",
                },
            },
        },
        {
            "id": "bs-q3",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在二分搜尋中，當 `arr[mid] < target` 時，下一步應該怎麼做？",
                    "options": [
                        {"id": "A", "text": "將 right 更新為 mid - 1，向左搜尋"},
                        {"id": "B", "text": "將 right 更新為 mid，向左搜尋"},
                        {"id": "C", "text": "將 left 更新為 mid + 1，向右搜尋"},
                        {"id": "D", "text": "將 left 更新為 mid，向右搜尋"},
                    ],
                    "explanation": "當中間元素小於目標時，目標一定在右半邊，因此將 left 更新為 mid + 1，排除 mid 及左半部，繼續在右半邊搜尋。",
                },
                "en": {
                    "title": "In Binary Search, when `arr[mid] < target`, what should the next step be?",
                    "options": [
                        {"id": "A", "text": "Update right to mid - 1 and search left"},
                        {"id": "B", "text": "Update right to mid and search left"},
                        {"id": "C", "text": "Update left to mid + 1 and search right"},
                        {"id": "D", "text": "Update left to mid and search right"},
                    ],
                    "explanation": "When the middle element is less than the target, the target must be in the right half. So we update left to mid + 1, discarding mid and everything to its left, and continue searching the right half.",
                },
            },
        },
        {
            "id": "bs-tf-2",
            "type": "true-false",
            "baseRating": 950,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "二分搜尋的迴圈條件 `while left <= right` 可以替換成 `while left < right`，結果完全相同。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "錯誤。使用 `while left < right` 時，當搜尋範圍縮小到只剩一個元素（left == right）時，迴圈就會提前結束，導致最後這個元素無法被檢查到，可能產生遺漏。",
                },
                "en": {
                    "title": "The loop condition `while left <= right` in Binary Search can be replaced with `while left < right` with identical results.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "False. Using `while left < right` causes the loop to exit early when the search range is down to one element (left == right), meaning that last element is never checked, which can lead to missed results.",
                },
            },
        },
        {
            "id": "bs-q4",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對已排序陣列 `[2, 5, 8, 12, 16, 23]` 執行二分搜尋，搜尋目標為 `23`。第一次迭代後，`left` 和 `right` 的值分別為何？",
                    "options": [
                        {"id": "A", "text": "left=0, right=2"},
                        {"id": "B", "text": "left=3, right=5"},
                        {"id": "C", "text": "left=3, right=4"},
                        {"id": "D", "text": "left=4, right=5"},
                    ],
                    "explanation": "第一輪中間元素小於目標，代表目標在右半邊，因此左邊界會往右推移。右邊界維持不變，新搜尋範圍從原本的中間點之後開始。",
                },
                "en": {
                    "title": "Binary Search is performed on the sorted array `[2, 5, 8, 12, 16, 23]` with target `23`. After the first iteration, what are the values of `left` and `right`?",
                    "options": [
                        {"id": "A", "text": "left=0, right=2"},
                        {"id": "B", "text": "left=3, right=5"},
                        {"id": "C", "text": "left=3, right=4"},
                        {"id": "D", "text": "left=4, right=5"},
                    ],
                    "explanation": "In the first round, the middle element is less than the target, so the target must be in the right half. The left boundary moves right past the midpoint; the right boundary stays unchanged.",
                },
            },
        },
        {
            "id": "bs-q5",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對已排序陣列 `[1, 3, 5, 7, 9, 11]` 執行二分搜尋，搜尋目標為 `6`（不存在）。最終函式會回傳什麼？",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "-1"},
                        {"id": "C", "text": "None"},
                        {"id": "D", "text": "3"},
                    ],
                    "explanation": "目標 6 不存在於陣列中，搜尋失敗。當 left > right 時迴圈結束，標準二分搜尋回傳 -1 表示找不到。",
                },
                "en": {
                    "title": "Binary Search is performed on the sorted array `[1, 3, 5, 7, 9, 11]` with target `6` (which does not exist). What will the function return?",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "-1"},
                        {"id": "C", "text": "None"},
                        {"id": "D", "text": "3"},
                    ],
                    "explanation": "Target 6 does not exist in the array, so the search fails. When left > right the loop ends, and the standard Binary Search returns -1 to indicate the element was not found.",
                },
            },
        },
        {
            "id": "bs-group-1",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "groupId": "group-bs-insert",
            "translations": {
                "zh-TW": {
                    "title": "在 `search_insert` 函式中，若目標值不存在於陣列中，函式最終回傳的 `left` 代表什麼意義？",
                    "options": [
                        {"id": "A", "text": "目標值在陣列中的前一個元素的索引"},
                        {"id": "B", "text": "若要將目標值插入並維持排序，應插入的位置索引"},
                        {"id": "C", "text": "陣列中最接近目標值的元素索引"},
                        {"id": "D", "text": "目標值在陣列中的後一個元素的索引"},
                    ],
                    "explanation": "當迴圈結束時（left > right），left 指向第一個大於目標值的元素位置，也就是要插入目標值以維持排序的正確位置。",
                },
                "en": {
                    "title": "In the `search_insert` function, if the target does not exist in the array, what does the returned `left` represent?",
                    "options": [
                        {"id": "A", "text": "The index of the element just before the target in the array"},
                        {"id": "B", "text": "The index where the target should be inserted to maintain sorted order"},
                        {"id": "C", "text": "The index of the element closest to the target in the array"},
                        {"id": "D", "text": "The index of the element just after the target in the array"},
                    ],
                    "explanation": "When the loop ends (left > right), left points to the first element greater than the target, which is exactly where the target should be inserted to keep the array sorted.",
                },
            },
        },
        {
            "id": "bs-q6",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "有一個包含 1024 個元素的已排序陣列，使用二分搜尋最多需要幾次比較才能確認某個元素存在或不存在？",
                    "options": [
                        {"id": "A", "text": "10 次"},
                        {"id": "B", "text": "512 次"},
                        {"id": "C", "text": "1024 次"},
                        {"id": "D", "text": "32 次"},
                    ],
                    "explanation": "二分搜尋每次將搜尋範圍減半，1024 = 2^10，因此最多需要 log₂(1024) = 10 次比較。",
                },
                "en": {
                    "title": "A sorted array has 1024 elements. How many comparisons does Binary Search need at most to confirm whether an element exists?",
                    "options": [
                        {"id": "A", "text": "10"},
                        {"id": "B", "text": "512"},
                        {"id": "C", "text": "1024"},
                        {"id": "D", "text": "32"},
                    ],
                    "explanation": "Binary Search halves the search range each time. Since 1024 = 2^10, at most log₂(1024) = 10 comparisons are needed.",
                },
            },
        },
        {
            "id": "bs-group-2",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "groupId": "group-bs-insert",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[1, 3, 5, 7]` 呼叫 `search_insert(arr, 4)`，函式會回傳什麼？",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "-1"},
                    ],
                    "explanation": "4 不在陣列中，迴圈結束後 `left` 指向第一個比 4 大的元素位置，也就是 4 若要插入以維持排序所在的索引。4 位於 3 和 5 之間，對應的插入位置恰好是索引 2。",
                },
                "en": {
                    "title": "Calling `search_insert(arr, 4)` on array `[1, 3, 5, 7]`, what will the function return?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "-1"},
                    ],
                    "explanation": "4 is not in the array. When the loop ends, `left` points to the first element greater than 4 — the correct insertion index to maintain sorted order. Since 4 falls between 3 and 5, the answer is index 2.",
                },
            },
        },
        {
            "id": "bs-multi-1",
            "type": "multiple-choice",
            "baseRating": 950,
            "correctAnswer": ["opt1", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些情境適合使用二分搜尋？（選擇所有正確答案）",
                    "options": [
                        {"id": "opt1", "text": "在已排序的電話簿中查找某人的電話號碼"},
                        {"id": "opt2", "text": "在一個無序的購物清單中尋找某個商品"},
                        {"id": "opt3", "text": "在已排序的分數列表中判斷某個分數是否存在"},
                        {"id": "opt4", "text": "在一棵隨機結構的樹中搜尋某個節點"},
                    ],
                    "explanation": "二分搜尋需要資料是已排序的線性結構。已排序的電話簿（opt1）和已排序的分數列表（opt3）都滿足此條件；無序的購物清單（opt2）無法使用二分搜尋；隨機樹（opt4）不是已排序的線性結構。",
                },
                "en": {
                    "title": "Which of the following scenarios are suitable for using Binary Search? (Select all that apply)",
                    "options": [
                        {"id": "opt1", "text": "Looking up a phone number in a sorted phone book"},
                        {"id": "opt2", "text": "Finding an item in an unsorted shopping list"},
                        {"id": "opt3", "text": "Checking if a score exists in a sorted score list"},
                        {"id": "opt4", "text": "Searching for a node in a randomly structured tree"},
                    ],
                    "explanation": "Binary Search requires sorted linear data. A sorted phone book (opt1) and a sorted score list (opt3) both meet this requirement. An unsorted shopping list (opt2) cannot use Binary Search. A random tree (opt4) is not a sorted linear structure.",
                },
            },
        },
        {
            "id": "bs-q7",
            "type": "single-choice",
            "baseRating": 1300,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在某些程式語言或極大型陣列中，`mid = (left + right) // 2` 可能會有整數溢位 (integer overflow) 的風險。以下哪種寫法可以避免此問題？",
                    "options": [
                        {"id": "A", "text": "mid = left + (right // 2)"},
                        {"id": "B", "text": "mid = left + (right - left) // 2"},
                        {"id": "C", "text": "mid = left - (right - left) // 2"},
                        {"id": "D", "text": "mid = (left + right) >> 1"},
                    ],
                    "explanation": "溢位的根源是 `left + right` 這個加法本身可能超出上限。正確做法是先計算區間長度 `right - left`（差值不會溢位），再加上 `left` 得到中點。選項 D 的位移寫法同樣先做加法，仍有相同風險。",
                },
                "en": {
                    "title": "In some languages or with very large arrays, `mid = (left + right) // 2` risks integer overflow. Which of the following avoids this?",
                    "options": [
                        {"id": "A", "text": "mid = left + (right // 2)"},
                        {"id": "B", "text": "mid = left + (right - left) // 2"},
                        {"id": "C", "text": "mid = left - (right - left) // 2"},
                        {"id": "D", "text": "mid = (left + right) >> 1"},
                    ],
                    "explanation": "The overflow comes from the addition `left + right` itself. The correct approach computes the interval length `right - left` first (a subtraction that cannot overflow), then adds `left` to find the midpoint. Option D uses a bit-shift but still performs the same addition first, carrying the same risk.",
                },
            },
        },
        {
            "id": "bs-q8",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "假設有一個已排序陣列 `[1, 2, 4, 4, 4, 7, 9]`，如果要找到值為 `4` 的「最左邊」索引，標準二分搜尋是否能保證找到最左邊的那個？",
                    "options": [
                        {"id": "A", "text": "能，標準二分搜尋一定回傳最左邊的索引"},
                        {"id": "B", "text": "能，只要陣列已排序就一定能找到最左邊"},
                        {"id": "C", "text": "不能，標準二分搜尋找到任意一個匹配的索引就回傳，不保證是最左邊"},
                        {"id": "D", "text": "不能，二分搜尋無法處理有重複元素的陣列"},
                    ],
                    "explanation": "標準二分搜尋在找到目標後立即回傳，不保證是最左邊的索引。若需找最左邊（或最右邊）的匹配位置，需要使用「左邊界二分搜尋」變體，找到目標後繼續向左縮小範圍。",
                },
                "en": {
                    "title": "Given the sorted array `[1, 2, 4, 4, 4, 7, 9]`, can standard Binary Search guarantee finding the leftmost index of value `4`?",
                    "options": [
                        {"id": "A", "text": "Yes, standard Binary Search always returns the leftmost index"},
                        {"id": "B", "text": "Yes, as long as the array is sorted, it will always find the leftmost one"},
                        {"id": "C", "text": "No, standard Binary Search returns any matching index and does not guarantee it is the leftmost"},
                        {"id": "D", "text": "No, Binary Search cannot handle arrays with duplicate elements"},
                    ],
                    "explanation": "Standard Binary Search returns immediately upon finding the target, with no guarantee it is the leftmost index. To find the leftmost (or rightmost) match, a 'left-boundary Binary Search' variant is needed, which continues narrowing left even after finding the target.",
                },
            },
        },
        {
            "id": "bs-group-3",
            "type": "fill-code",
            "baseRating": 1400,
            "correctAnswer": ["left <= right", "mid + 1", "mid - 1"],
            "groupId": "group-bs-insert",
            "code": INSERT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成 `search_insert` 函式。",
                    "options": [],
                    "explanation": "(a) 迴圈需在搜尋範圍「仍然有效」時持續執行，思考 left 與 right 的相對關係何時代表「還有元素可看」。(b)(c) 每次比較後必須把 mid 本身從範圍中排除——確認目標在哪一側，就把對應邊界移到 mid 的鄰格而非 mid 本身。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the `search_insert` function.",
                    "options": [],
                    "explanation": "(a) The loop should continue as long as the search range is still valid — think about what relationship between left and right means 'there are still elements to examine'. (b)(c) After each comparison, mid itself must be excluded from the new range: whichever side the target is on, move that boundary to the slot adjacent to mid, not to mid itself.",
                },
            },
        },
        {
            "id": "bs-q9",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "二分搜尋的平均與最壞情況時間複雜度，以及空間複雜度（迭代版本）分別是什麼？",
                    "options": [
                        {"id": "A", "text": "時間 O(n)，空間 O(1)"},
                        {"id": "B", "text": "時間 O(log n)，空間 O(1)"},
                        {"id": "C", "text": "時間 O(log n)，空間 O(log n)"},
                        {"id": "D", "text": "時間 O(n log n)，空間 O(1)"},
                    ],
                    "explanation": "迭代版本的二分搜尋每次將範圍減半，最壞情況需 O(log n) 次操作。由於只使用幾個額外變數（left, right, mid），空間複雜度為 O(1)。",
                },
                "en": {
                    "title": "What are the average/worst-case time complexity and space complexity (iterative version) of Binary Search?",
                    "options": [
                        {"id": "A", "text": "Time O(n), Space O(1)"},
                        {"id": "B", "text": "Time O(log n), Space O(1)"},
                        {"id": "C", "text": "Time O(log n), Space O(log n)"},
                        {"id": "D", "text": "Time O(n log n), Space O(1)"},
                    ],
                    "explanation": "The iterative Binary Search halves the range each time, requiring O(log n) operations in the worst case. Since it only uses a few extra variables (left, right, mid), the space complexity is O(1).",
                },
            },
        },
        {
            "id": "bs-fill-1",
            "type": "fill-code",
            "baseRating": 1100,
            "correctAnswer": ["mid", "left", "right"],
            "code": BS_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成標準的 `binary_search` 函式。",
                    "options": [],
                    "explanation": "(a) `mid`：找到目標時回傳其索引。(b) `left`：目標在右半邊，更新左邊界為 mid + 1。(c) `right`：目標在左半邊，更新右邊界為 mid - 1。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the standard `binary_search` function.",
                    "options": [],
                    "explanation": "(a) `mid`: return the index when the target is found. (b) `left`: target is in the right half, update the left boundary to mid + 1. (c) `right`: target is in the left half, update the right boundary to mid - 1.",
                },
            },
        },
        {
            "id": "bs-multi-2",
            "type": "multiple-choice",
            "baseRating": 1400,
            "correctAnswer": ["opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "關於二分搜尋，以下哪些陳述是正確的？（選擇所有正確答案）",
                    "options": [
                        {"id": "opt1", "text": "先對未排序陣列做二分搜尋，再對找到的結果做修正，整體仍能在 O(log n) 內完成"},
                        {"id": "opt2", "text": "遞迴版本的二分搜尋空間複雜度為 O(log n)（因為呼叫堆疊）"},
                        {"id": "opt3", "text": "只要問題的答案空間具備單調性，即使不是「在陣列中找值」，也可以套用二分搜尋"},
                        {"id": "opt4", "text": "二分搜尋可以用在任何具備單調性的資料結構（如隨機圖、無序樹）上"},
                    ],
                    "explanation": "opt2 正確：遞迴每深一層就多一個堆疊幀，最深到 O(log n) 層。opt3 正確：單調性是套用二分搜尋的充分條件，實際問題可以是「搜尋可行速度」、「搜尋最小容量」等，不限於陣列查值。opt1 錯誤：未排序陣列無法保證比較方向，修正機制並不存在。opt4 錯誤：單調性必須能在結構上定義明確的「左右排除」，隨機圖與無序樹不具備此性質。",
                },
                "en": {
                    "title": "Which of the following statements about Binary Search are correct? (Select all that apply)",
                    "options": [
                        {"id": "opt1", "text": "You can run Binary Search on an unsorted array first and then correct the result, still achieving O(log n) overall"},
                        {"id": "opt2", "text": "The recursive version of Binary Search has O(log n) space complexity due to the call stack"},
                        {"id": "opt3", "text": "As long as the answer space is monotonic, Binary Search applies even when the problem is not 'find a value in an array'"},
                        {"id": "opt4", "text": "Binary Search can be applied to any data structure with monotonicity, such as random graphs or unordered trees"},
                    ],
                    "explanation": "opt2 is correct: each additional recursion level adds one stack frame, up to O(log n) deep. opt3 is correct: monotonicity is the sufficient condition — the problem can be 'find the minimum feasible speed' or 'find the smallest valid capacity', not just array value search. opt1 is wrong: an unsorted array provides no reliable direction for comparisons; no correction mechanism can fix this. opt4 is wrong: monotonicity requires a well-defined 'left/right elimination' on the structure; random graphs and unordered trees do not have this.",
                },
            },
        },
        {
            "id": "bs-pred-1",
            "type": "predict-line",
            "baseRating": 1450,
            "correctAnswer": "1 2 3 4 5 6 8 9 4 5 6 7",
            "code": BS_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `arr = [1, 3, 5, 7, 9]` 呼叫 `binary_search(arr, 7)`，請依序寫出每次迭代中被執行到的行號（以空格分隔）。",
                    "options": [],
                    "explanation": "整體流程需要兩輪迭代：第一輪中間元素比目標小，走向右半邊的更新分支；第二輪中間元素命中，直接回傳。追蹤時留意每輪都必須先過 while 條件再計算 mid，命中則跳過後續 elif/else。",
                },
                "en": {
                    "title": "Calling `binary_search(arr, 7)` on `arr = [1, 3, 5, 7, 9]`, write the line numbers executed in each iteration in order (space-separated).",
                    "options": [],
                    "explanation": "The search takes two iterations. In the first round, the middle element is smaller than the target so execution follows the right-side update branch. In the second round, the middle element matches and the function returns immediately. Remember that every iteration begins by evaluating the while condition, then computing mid, then checking each branch in order.",
                },
            },
        },
        # ── 新增題目 q19–q30 ──────────────────────────────────────────
        # [邊界與迴圈設定] 800 + 0(true-false) + 100(L2多重比較) + 150(極端邊界) = 1050 → 調到 1100 符合初學者認知負擔
        {
            "id": "binary-search-q19",
            "type": "true-false",
            "baseRating": 1100,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "在二分搜尋中，無論使用 `while left < right` 或 `while left <= right`，只要邊界更新方式相同，兩種迴圈條件最終結果完全等價。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "迴圈條件與邊界更新必須配套。例如 `while left <= right` 搭配 `right = mid - 1`，若只把條件改成 `while left < right` 而不同步調整更新方式，搜尋範圍收斂的行為就會改變，可能遺漏最後一個元素或觸發無窮迴圈。",
                },
                "en": {
                    "title": "In Binary Search, as long as the boundary update logic stays the same, `while left < right` and `while left <= right` produce exactly equivalent results.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "The loop condition and boundary updates must be designed as a matched pair. For example, `while left <= right` pairs with `right = mid - 1`. Swapping only the condition to `while left < right` without adjusting the updates changes how the search range converges, potentially missing the last element or triggering an infinite loop.",
                },
            },
        },
        # [邊界與迴圈設定] 800 + 50(single) + 400(L4複雜控制流) + 150(極端邊界) = 1400
        {
            "id": "binary-search-q20",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "以下哪種二分搜尋邊界更新方式，在 `while left <= right` 條件下，最容易造成無窮迴圈？",
                    "options": [
                        {"id": "A", "text": "目標在右半邊時：`left = mid + 1`"},
                        {"id": "B", "text": "目標在左半邊時：`right = mid - 1`"},
                        {"id": "C", "text": "目標在右半邊時：`left = mid`（忘記加 1）"},
                        {"id": "D", "text": "找到目標時：`return mid`"},
                    ],
                    "explanation": "使用 `while left <= right` 時，若更新成 `left = mid` 而非 `left = mid + 1`，當搜尋範圍縮小至兩個元素且目標在右半邊時，`mid` 永遠等於 `left`，範圍無法繼續縮小，形成無窮迴圈。",
                },
                "en": {
                    "title": "With the condition `while left <= right`, which boundary update is most likely to cause an infinite loop?",
                    "options": [
                        {"id": "A", "text": "When target is in right half: `left = mid + 1`"},
                        {"id": "B", "text": "When target is in left half: `right = mid - 1`"},
                        {"id": "C", "text": "When target is in right half: `left = mid` (forgetting to add 1)"},
                        {"id": "D", "text": "When target is found: `return mid`"},
                    ],
                    "explanation": "With `while left <= right`, writing `left = mid` instead of `left = mid + 1` means that when the range shrinks to two elements and the target is in the right half, `mid` always equals `left` and the range never shrinks — an infinite loop.",
                },
            },
        },
        # [邊界與迴圈設定] 800 + 50(single) + 400(L4複雜控制流) + 150(極端邊界) = 1400
        {
            "id": "binary-search-q21",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "對單元素陣列 `[5]` 呼叫標準二分搜尋（`while left <= right`），搜尋目標為 `3`（不存在）。整個搜尋過程中，迴圈條件 `left <= right` 共被計算幾次？",
                    "options": [
                        {"id": "A", "text": "0 次"},
                        {"id": "B", "text": "1 次（僅進入後直接回傳）"},
                        {"id": "C", "text": "2 次（一次通過、一次拒絕）"},
                        {"id": "D", "text": "3 次（初始、迴圈內、迴圈後各一次）"},
                    ],
                    "explanation": "while 條件在每次「嘗試進入或繼續迴圈」時被計算一次。初始範圍只有一個元素，條件第一次為 true 進入迴圈；更新邊界後範圍變空，條件第二次為 false 結束。總計兩次，正好是「進入迴圈的次數 + 1」的通用規律。",
                },
                "en": {
                    "title": "Standard Binary Search (`while left <= right`) is called on single-element array `[5]` with target `3` (not found). How many times is the loop condition `left <= right` evaluated in total?",
                    "options": [
                        {"id": "A", "text": "0 times"},
                        {"id": "B", "text": "1 time (enters once and returns immediately)"},
                        {"id": "C", "text": "2 times (once passing, once rejected)"},
                        {"id": "D", "text": "3 times (once at entry, once inside, once after the loop)"},
                    ],
                    "explanation": "The while condition is evaluated once each time the program attempts to enter or continue the loop. With a single-element range it is true the first time — the loop body runs and the boundary update empties the range — then false the second time, ending the loop. Two evaluations total, following the general rule: number of loop iterations + 1.",
                },
            },
        },
        # [中間值計算陷阱] 800 + 50(single) + 100(L2多重比較) + 150(極端邊界) = 1100 → 提升至 1150 反映 C++ int 上限知識要求
        {
            "id": "binary-search-q22",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在 C++ 中，`left` 和 `right` 均宣告為 32-bit 有號整數（`int`）。若 `left = 1_000_000_000` 且 `right = 1_500_000_000`，直接寫 `mid = (left + right) / 2` 會發生什麼問題？",
                    "options": [
                        {"id": "A", "text": "結果會略小於正確中點，因為整數除法會無條件捨去"},
                        {"id": "B", "text": "發生整數溢位，因為兩數相加超過 32-bit 有號整數的最大值"},
                        {"id": "C", "text": "編譯器會自動升型為 long long，結果正確"},
                        {"id": "D", "text": "程式會拋出例外並終止"},
                    ],
                    "explanation": "32-bit 有號整數的上限約為 2.1×10⁹，而 left + right = 2.5×10⁹ 超過此值，發生溢位後得到錯誤的負數結果——不是略小，也不會拋出例外，C++ 不會自動升型。",
                },
                "en": {
                    "title": "In C++, `left` and `right` are declared as 32-bit signed integers (`int`). With `left = 1,000,000,000` and `right = 1,500,000,000`, what goes wrong with `mid = (left + right) / 2`?",
                    "options": [
                        {"id": "A", "text": "The result is slightly less than the true midpoint because integer division truncates"},
                        {"id": "B", "text": "Integer overflow, because the sum exceeds the maximum value of a 32-bit signed integer"},
                        {"id": "C", "text": "The compiler automatically promotes to long long, so the result is correct"},
                        {"id": "D", "text": "The program throws an exception and terminates"},
                    ],
                    "explanation": "A 32-bit signed int has a max of ~2.1×10⁹. left + right = 2.5×10⁹ exceeds this, producing an incorrect negative result due to overflow — not merely a truncated midpoint, no exception is thrown, and C++ does not automatically promote the type.",
                },
            },
        },
        # [中間值計算陷阱] 800 + 0(true-false) + 50(L1定義) + 0(直觀) = 850 → basic
        {
            "id": "binary-search-q23",
            "type": "single-choice",
            "baseRating": 850,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "為什麼 Python 的二分搜尋不需要擔心 `(left + right) // 2` 的整數溢位問題？",
                    "options": [
                        {"id": "A", "text": "Python 的整數具備任意精度，不受固定位元數限制"},
                        {"id": "B", "text": "Python 的 `//` 運算子會自動偵測並處理溢位"},
                        {"id": "C", "text": "Python 在溢位時會自動改用浮點數計算"},
                        {"id": "D", "text": "Python 的整數最大值比 C++ 大，但仍有上限"},
                    ],
                    "explanation": "Python 的整數是任意精度（bignum），可以無限擴展，不存在固定的上限。因此 left + right 永遠不會溢位。這是 Python 與 C++/Java 整數運算的根本差異。",
                },
                "en": {
                    "title": "Why doesn't Binary Search in Python need to worry about integer overflow in `(left + right) // 2`?",
                    "options": [
                        {"id": "A", "text": "Python integers have arbitrary precision and are not limited to a fixed bit width"},
                        {"id": "B", "text": "Python's `//` operator automatically detects and handles overflow"},
                        {"id": "C", "text": "Python automatically switches to floating-point when an overflow would occur"},
                        {"id": "D", "text": "Python integers have a higher maximum than C++ but still have a limit"},
                    ],
                    "explanation": "Python integers are arbitrary-precision (bignum) and can grow without bound, so there is no fixed maximum. Therefore left + right can never overflow — a fundamental difference from C++/Java.",
                },
            },
        },
        # [適合處理的問題/單調性] 800 + 50(single) + 100(L2多重比較) + 150(極端邊界) = 1100
        {
            "id": "binary-search-q24",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "「在排序陣列中找出目標值最後一次出現的索引」這個問題，需要對標準二分搜尋做什麼修改？",
                    "options": [
                        {"id": "A", "text": "找到目標後立即回傳，不需修改；重複元素只是干擾"},
                        {"id": "B", "text": "找到目標後不回傳，記錄當前索引後繼續把 left 往右推"},
                        {"id": "C", "text": "找到目標後把 right 更新為 mid，繼續向右縮範圍"},
                        {"id": "D", "text": "找到目標後把 left 更新為 mid，繼續向右縮範圍"},
                    ],
                    "explanation": "找最後一次出現（右邊界）的核心思路：命中後不能立刻停，要繼續向右探索是否還有更晚的出現。選項 C 把 right 移到 mid 會往左縮，反向錯誤；選項 D 用 mid 而非 mid+1 會讓範圍無法正常縮小，可能陷入迴圈。",
                },
                "en": {
                    "title": "To find the last occurrence of a target in a sorted array, what modification to standard Binary Search is needed?",
                    "options": [
                        {"id": "A", "text": "Return immediately upon finding the target — duplicates are just noise"},
                        {"id": "B", "text": "On finding the target, record the index and continue pushing left rightward"},
                        {"id": "C", "text": "On finding the target, set right = mid and keep narrowing rightward"},
                        {"id": "D", "text": "On finding the target, set left = mid and keep narrowing rightward"},
                    ],
                    "explanation": "Finding the last occurrence requires not stopping at the first hit — you must keep exploring rightward for a later one. Option C moves right to mid, which shrinks leftward (wrong direction). Option D uses mid instead of mid+1, which may prevent the range from shrinking and cause an infinite loop.",
                },
            },
        },
        # [適合處理的問題/單調性] 800 + 50(single) + 400(L4演算法創造) + 150(極端邊界) = 1400
        {
            "id": "binary-search-q25",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "LeetCode 875「Koko Eating Bananas」要求找出猴子吃香蕉的最小速度。為什麼此題可以用二分搜尋解決？",
                    "options": [
                        {"id": "A", "text": "因為香蕉堆已經排序好了"},
                        {"id": "B", "text": "因為答案範圍有限，可以直接列舉"},
                        {"id": "C", "text": "因為「某速度可行」後「更快速度也可行」，答案空間具備單調性"},
                        {"id": "D", "text": "因為此問題等價於在陣列中找特定值"},
                    ],
                    "explanation": "此題答案空間具備單調性：若速度 k 能在 H 小時內吃完，則所有速度 > k 也都能完成。這種「一旦成立、之後皆成立」的性質讓我們可以對速度範圍做二分搜尋，快速找到邊界最小值。",
                },
                "en": {
                    "title": "LeetCode 875 'Koko Eating Bananas' asks for the minimum eating speed. Why can Binary Search solve this problem?",
                    "options": [
                        {"id": "A", "text": "Because the banana piles are already sorted"},
                        {"id": "B", "text": "Because the answer range is small enough for brute-force enumeration"},
                        {"id": "C", "text": "Because 'if speed k works, any higher speed also works' — the answer space is monotonic"},
                        {"id": "D", "text": "Because the problem is equivalent to finding a specific value in an array"},
                    ],
                    "explanation": "The answer space has monotonicity: if speed k can finish within H hours, all speeds > k can too. This 'once true, always true' property allows Binary Search over the speed range to quickly locate the minimum boundary.",
                },
            },
        },
        # [適合處理的問題/乘法表第K小] 800 + 50(single) + 400(L4複雜控制流) + 250(複合陷阱) = 1500
        {
            "id": "binary-search-q26",
            "type": "single-choice",
            "baseRating": 1500,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "在 m×n 的乘法表中找第 K 小的數，使用二分搜尋的核心子問題是什麼？",
                    "options": [
                        {"id": "A", "text": "對一個候選值 x，快速計算乘法表中有多少個數 ≤ x"},
                        {"id": "B", "text": "將乘法表展開成一維陣列後排序，然後直接取索引 K"},
                        {"id": "C", "text": "對行數 m 做二分搜尋，找出答案在哪一行"},
                        {"id": "D", "text": "對列數 n 做二分搜尋，找出答案在哪一列"},
                    ],
                    "explanation": "二分搜尋的範圍不是陣列索引，而是「可能的答案值」。關鍵在於能快速判斷一個候選值是否「夠小」——即乘法表中有多少個數不超過它。能回答這個計數問題，二分搜尋才能決定向左還是向右縮範圍。",
                },
                "en": {
                    "title": "Finding the K-th smallest number in an m×n multiplication table via Binary Search — what is the core sub-problem?",
                    "options": [
                        {"id": "A", "text": "For a candidate value x, quickly count how many entries in the table are ≤ x"},
                        {"id": "B", "text": "Expand the table into a 1D sorted array and index directly at position K"},
                        {"id": "C", "text": "Binary search on the row index m to find which row contains the answer"},
                        {"id": "D", "text": "Binary search on the column index n to find which column contains the answer"},
                    ],
                    "explanation": "The binary search range is over possible answer values, not array indices. The key is being able to quickly judge whether a candidate value is 'small enough' — i.e., how many table entries do not exceed it. Only by answering that counting question can binary search decide which half to keep.",
                },
            },
        },
        # [操作複雜度/空間] 800 + 50(single) + 100(L2多重比較) + 100(新手誤區) = 1050 → 調至 1100 對齊難度感知
        {
            "id": "binary-search-q27",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "以下關於二分搜尋迭代版與遞迴版空間複雜度的比較，哪一項是正確的？",
                    "options": [
                        {"id": "A", "text": "兩者空間複雜度均為 O(1)"},
                        {"id": "B", "text": "兩者空間複雜度均為 O(log n)"},
                        {"id": "C", "text": "迭代版為 O(1)，遞迴版為 O(log n)（因呼叫堆疊深度）"},
                        {"id": "D", "text": "迭代版為 O(log n)，遞迴版為 O(1)"},
                    ],
                    "explanation": "迭代版只使用幾個固定變數，空間為 O(1)。遞迴版每層呼叫都佔用一個堆疊幀，最深遞迴深度為 O(log n)，因此空間為 O(log n)。",
                },
                "en": {
                    "title": "Which statement correctly compares the space complexity of iterative vs. recursive Binary Search?",
                    "options": [
                        {"id": "A", "text": "Both have O(1) space complexity"},
                        {"id": "B", "text": "Both have O(log n) space complexity"},
                        {"id": "C", "text": "Iterative is O(1); recursive is O(log n) due to the call stack depth"},
                        {"id": "D", "text": "Iterative is O(log n); recursive is O(1)"},
                    ],
                    "explanation": "The iterative version uses a constant number of variables — O(1) space. The recursive version pushes one stack frame per call; the maximum recursion depth is O(log n), so its space complexity is O(log n).",
                },
            },
        },
        # [可以優化什麼/替代結構] 800 + 50(single) + 400(L4系統設計) + 150(極端邊界) = 1400
        {
            "id": "binary-search-q28",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "一個線上系統需要頻繁地對資料集做插入、刪除與精確查詢（不需範圍查詢），哪種資料結構最合適？",
                    "options": [
                        {"id": "A", "text": "已排序陣列 + 二分搜尋，因查詢最快"},
                        {"id": "B", "text": "二元搜尋樹，兼顧查詢與修改"},
                        {"id": "C", "text": "堆積（Heap），支援快速插入"},
                        {"id": "D", "text": "字典（Hash Map），精確查詢與增刪均為 O(1) 平均"},
                    ],
                    "explanation": "若只需精確查詢且無範圍查詢需求，字典（Hash Map）提供 O(1) 平均的查詢、插入、刪除，遠優於需要 O(n) 插入的已排序陣列或 O(log n) 的 BST。",
                },
                "en": {
                    "title": "An online system needs frequent insertions, deletions, and exact lookups (no range queries). Which data structure is most suitable?",
                    "options": [
                        {"id": "A", "text": "Sorted array + Binary Search — fastest lookup"},
                        {"id": "B", "text": "Binary Search Tree — balances lookup and modification"},
                        {"id": "C", "text": "Heap — supports fast insertion"},
                        {"id": "D", "text": "Hash Map (dictionary) — O(1) average for exact lookup, insert, and delete"},
                    ],
                    "explanation": "For exact lookups with no range query requirement, a Hash Map offers O(1) average for all three operations — far better than a sorted array's O(n) insertion or a BST's O(log n).",
                },
            },
        },
        # [複雜追蹤/邊界與迴圈設定] 800 + 50(single) + 100(L2多重比較) + 150(極端邊界) = 1100
        {
            "id": "binary-search-q29",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對空陣列 `[]` 呼叫標準二分搜尋（`left=0, right=len(arr)-1`），搜尋目標為 `5`。函式會回傳什麼，以及 `while` 迴圈被執行幾次？",
                    "options": [
                        {"id": "A", "text": "回傳 0，迴圈執行 1 次"},
                        {"id": "B", "text": "回傳 -1，迴圈執行 0 次"},
                        {"id": "C", "text": "引發 IndexError，因為陣列為空"},
                        {"id": "D", "text": "回傳 None，迴圈執行 0 次"},
                    ],
                    "explanation": "空陣列時 `right` 的初始值會小於 0，使得 while 條件在第一次就不成立。迴圈完全不執行，程式直接走到最後的回傳語句。這說明標準二分搜尋能自然地處理空輸入，無需額外的邊界判斷。",
                },
                "en": {
                    "title": "Standard Binary Search (`left=0, right=len(arr)-1`) is called on the empty array `[]` with target `5`. What does it return and how many times does the `while` loop execute?",
                    "options": [
                        {"id": "A", "text": "Returns 0, loop executes 1 time"},
                        {"id": "B", "text": "Returns -1, loop executes 0 times"},
                        {"id": "C", "text": "Raises IndexError because the array is empty"},
                        {"id": "D", "text": "Returns None, loop executes 0 times"},
                    ],
                    "explanation": "With an empty array, the initial value of `right` is negative, so the while condition fails immediately. The loop never executes and execution falls through to the final return statement. This shows that standard Binary Search handles empty input gracefully without any special-case check.",
                },
            },
        },
        # [複雜追蹤/多步狀態] 800 + 50(single) + 400(L4複雜控制流) + 250(複合陷阱) = 1500
        {
            "id": "binary-search-q30",
            "type": "single-choice",
            "baseRating": 1500,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[2, 4, 4, 4, 8]` 使用「左邊界二分搜尋」（找目標首次出現的索引），搜尋目標 `4`。演算法在 `arr[mid] == target` 時將 `right = mid - 1` 繼續搜尋，完整過程後回傳什麼？",
                    "options": [
                        {"id": "A", "text": "0（第一個元素的索引）"},
                        {"id": "B", "text": "2（陣列中點的索引）"},
                        {"id": "C", "text": "1（首次出現 4 的索引）"},
                        {"id": "D", "text": "-1（找不到）"},
                    ],
                    "explanation": "左邊界二分搜尋的核心是：命中後不停下，而是把右邊界往左推，繼續向左探索是否有更早的出現。初次命中的索引並不保證是最左邊的，只有當搜尋範圍完全耗盡時，最後記錄的候選才是真正的左邊界。選項 B（中點）是第一次命中的位置，但此時還不能回傳。",
                },
                "en": {
                    "title": "Left-boundary Binary Search (find the first occurrence) is run on `[2, 4, 4, 4, 8]` with target `4`. When `arr[mid] == target`, the algorithm sets `right = mid - 1` and continues. What does it return?",
                    "options": [
                        {"id": "A", "text": "0 (index of the first element)"},
                        {"id": "B", "text": "2 (index of the array midpoint)"},
                        {"id": "C", "text": "1 (index of the first occurrence of 4)"},
                        {"id": "D", "text": "-1 (not found)"},
                    ],
                    "explanation": "The key of left-boundary Binary Search is: don't stop on a hit — push the right boundary left and keep exploring for an earlier occurrence. The first hit index is not necessarily the leftmost; only when the range is fully exhausted is the last recorded candidate the true left boundary. Option B (the midpoint) is where the first hit happens, but it cannot be returned at that point.",
                },
            },
        },
    ],
}

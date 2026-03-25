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
            "baseRating": 800,
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
            "baseRating": 800,
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
            "baseRating": 1000,
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
                    "explanation": "初始 left=0, right=5，mid=(0+5)//2=2，arr[2]=8 < 23，所以 left 更新為 mid+1=3。第一次迭代後：left=3, right=5。",
                },
                "en": {
                    "title": "Binary Search is performed on the sorted array `[2, 5, 8, 12, 16, 23]` with target `23`. After the first iteration, what are the values of `left` and `right`?",
                    "options": [
                        {"id": "A", "text": "left=0, right=2"},
                        {"id": "B", "text": "left=3, right=5"},
                        {"id": "C", "text": "left=3, right=4"},
                        {"id": "D", "text": "left=4, right=5"},
                    ],
                    "explanation": "Initially left=0, right=5. mid=(0+5)//2=2, arr[2]=8 < 23, so left is updated to mid+1=3. After the first iteration: left=3, right=5.",
                },
            },
        },
        {
            "id": "bs-q5",
            "type": "single-choice",
            "baseRating": 1050,
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
            "baseRating": 1050,
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
            "baseRating": 1100,
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
            "baseRating": 1100,
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
                    "explanation": "4 不在陣列中。搜尋過程：left=0,right=3 → mid=1,arr[1]=3<4,left=2 → mid=2,arr[2]=5>4,right=1 → left(2)>right(1) 結束，回傳 left=2。4 應插入在索引 2 的位置（在 3 和 5 之間）。",
                },
                "en": {
                    "title": "Calling `search_insert(arr, 4)` on array `[1, 3, 5, 7]`, what will the function return?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "-1"},
                    ],
                    "explanation": "4 is not in the array. Search: left=0,right=3 → mid=1,arr[1]=3<4,left=2 → mid=2,arr[2]=5>4,right=1 → left(2)>right(1), loop ends, return left=2. 4 should be inserted at index 2 (between 3 and 5).",
                },
            },
        },
        {
            "id": "bs-multi-1",
            "type": "multiple-choice",
            "baseRating": 1150,
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
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在某些程式語言或極大型陣列中，`mid = (left + right) // 2` 可能會有整數溢位 (integer overflow) 的風險。以下哪種寫法可以避免此問題？",
                    "options": [
                        {"id": "A", "text": "mid = (left * right) // 2"},
                        {"id": "B", "text": "mid = left + (right - left) // 2"},
                        {"id": "C", "text": "mid = left - (right - left) // 2"},
                        {"id": "D", "text": "mid = (left + right) % 2"},
                    ],
                    "explanation": "`left + (right - left) // 2` 先計算差值再加上 left，避免了 left + right 可能超出整數範圍的問題，在 C/Java 等語言中是防止溢位的標準寫法。Python 的整數不會溢位，但理解此概念仍然重要。",
                },
                "en": {
                    "title": "In some languages or with very large arrays, `mid = (left + right) // 2` risks integer overflow. Which of the following avoids this?",
                    "options": [
                        {"id": "A", "text": "mid = (left * right) // 2"},
                        {"id": "B", "text": "mid = left + (right - left) // 2"},
                        {"id": "C", "text": "mid = left - (right - left) // 2"},
                        {"id": "D", "text": "mid = (left + right) % 2"},
                    ],
                    "explanation": "`left + (right - left) // 2` computes the difference first before adding left, avoiding the potential overflow of left + right. This is the standard overflow-safe idiom in languages like C/Java. Python integers don't overflow, but understanding this concept is still important.",
                },
            },
        },
        {
            "id": "bs-q8",
            "type": "single-choice",
            "baseRating": 1250,
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
            "baseRating": 1300,
            "correctAnswer": ["left <= right", "mid + 1", "mid - 1"],
            "groupId": "group-bs-insert",
            "code": INSERT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成 `search_insert` 函式。",
                    "options": [],
                    "explanation": "(a) `left <= right`：迴圈持續條件，當搜尋範圍有效時繼續。(b) `mid + 1`：目標在右半邊，左邊界右移。(c) `mid - 1`：目標在左半邊，右邊界左移。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the `search_insert` function.",
                    "options": [],
                    "explanation": "(a) `left <= right`: loop continuation condition, keeps going while the search range is valid. (b) `mid + 1`: target is in the right half, move the left boundary right. (c) `mid - 1`: target is in the left half, move the right boundary left.",
                },
            },
        },
        {
            "id": "bs-q9",
            "type": "single-choice",
            "baseRating": 1350,
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
            "baseRating": 1400,
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
            "baseRating": 1450,
            "correctAnswer": ["opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "關於二分搜尋，以下哪些陳述是正確的？（選擇所有正確答案）",
                    "options": [
                        {"id": "opt1", "text": "二分搜尋可以在 O(log n) 時間內對未排序陣列進行搜尋"},
                        {"id": "opt2", "text": "遞迴版本的二分搜尋空間複雜度為 O(log n)（因為呼叫堆疊）"},
                        {"id": "opt3", "text": "二分搜尋也可以應用在「尋找某個條件成立的邊界值」等問題上"},
                        {"id": "opt4", "text": "二分搜尋只能用於整數型別的陣列"},
                    ],
                    "explanation": "opt2 正確：遞迴版本每層呼叫佔用堆疊空間，深度為 O(log n)。opt3 正確：二分搜尋可廣泛應用於「答案空間單調」的問題，例如 LeetCode 上許多「最小化最大值」的問題。opt1 錯誤：未排序陣列無法使用二分搜尋。opt4 錯誤：二分搜尋可以用在任何可比較大小的型別。",
                },
                "en": {
                    "title": "Which of the following statements about Binary Search are correct? (Select all that apply)",
                    "options": [
                        {"id": "opt1", "text": "Binary Search can search an unsorted array in O(log n) time"},
                        {"id": "opt2", "text": "The recursive version of Binary Search has O(log n) space complexity due to the call stack"},
                        {"id": "opt3", "text": "Binary Search can also be applied to problems like finding a boundary value where a condition holds"},
                        {"id": "opt4", "text": "Binary Search can only be used on arrays of integer type"},
                    ],
                    "explanation": "opt2 is correct: each recursive call occupies stack space, and the depth is O(log n). opt3 is correct: Binary Search can be broadly applied to problems with a monotonic answer space, such as many 'minimize the maximum' problems on LeetCode. opt1 is wrong: unsorted arrays cannot use Binary Search. opt4 is wrong: Binary Search works on any comparable type.",
                },
            },
        },
        {
            "id": "bs-pred-1",
            "type": "predict-line",
            "baseRating": 1500,
            "correctAnswer": "1 2 3 4 5 6 8 9 4 5 6 7",
            "code": BS_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `arr = [1, 3, 5, 7, 9]` 呼叫 `binary_search(arr, 7)`，請依序寫出每次迭代中被執行到的行號（以空格分隔）。",
                    "options": [],
                    "explanation": "初始：L1(定義),L2,L3 → 第1輪：L4(true),L5,L6(false),L8(true),L9(left=3) → 第2輪：L4(true),L5,L6(true),L7(return mid=3，即 arr[3]=7)。執行行號：1 2 3 4 5 6 8 9 4 5 6 7。",
                },
                "en": {
                    "title": "Calling `binary_search(arr, 7)` on `arr = [1, 3, 5, 7, 9]`, write the line numbers executed in each iteration in order (space-separated).",
                    "options": [],
                    "explanation": "Setup: L1(def),L2,L3 → Round 1: L4(true),L5,L6(false),L8(true),L9(left=3) → Round 2: L4(true),L5,L6(true),L7(return mid=3, arr[3]=7). Executed lines: 1 2 3 4 5 6 8 9 4 5 6 7.",
                },
            },
        },
    ],
}

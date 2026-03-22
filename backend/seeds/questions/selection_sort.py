SSORT_SIMPLIFIED_CODE = """def find_min_and_swap(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        # 執行交換
        arr[i], arr[min_idx] = arr[min_idx], arr[i]"""

SSORT_FILL_CODE = """def selection_sort(collection):
    total_items = len(collection)
    for current_pos in range(total_items - 1):
        min_pos = (a)
        for scan_pos in range(current_pos + 1, total_items):
            if collection[scan_pos] < collection[min_pos]:
                min_pos = (b)
        if min_pos != (c):
            collection[current_pos], collection[min_pos] = collection[min_pos], collection[current_pos]"""

SSORT_PREDICT_CODE = """def selection_sort(collection):           # L1
    total_items = len(collection)                      # L2
    for current_pos in range(total_items - 1):         # L3
        min_pos = current_pos                          # L4
        for scan_pos in range(current_pos + 1, total_items): # L5
            scan_val = collection[scan_pos]            # L6
            min_val = collection[min_pos]              # L7
            if scan_val < min_val:                     # L8
                min_pos = scan_pos                     # L9
        if min_pos != current_pos:                     # L10
            collection[current_pos], collection[min_pos] = collection[min_pos], collection[current_pos] # L11
    return collection                                  # L12"""

DOUBLE_SSORT_FILL_CODE = """def double_selection_sort(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        min_idx = max_idx = left
        for i in range(left + 1, right + 1):
            if arr[i] < arr[min_idx]: min_idx = (a)
            if arr[i] > arr[max_idx]: max_idx = (b)
        arr[left], arr[min_idx] = arr[min_idx], arr[left]
        # 注意：如果 left 剛好是最大值，交換後最大值位置會變到 min_idx
        if max_idx == left: max_idx = (c)
        arr[right], arr[max_idx] = arr[max_idx], arr[right]
        left += 1; right -= 1"""

DATA = {
    "slug": "selection-sort",
    "groups": [
        {
            "id": "group-ssort-logic",
            "translations": {
                "zh-TW": {
                    "title": "題組：選擇排序的最小化邏輯",
                    "description": "選擇排序透過記錄索引來減少實體交換的次數。請觀察其索引更新的時機與判斷條件。",
                },
                "en": {
                    "title": "Group: Selection Sort's Minimization Logic",
                    "description": "Selection Sort records an index to minimize the number of physical swaps. Pay attention to when and how the index is updated.",
                },
            },
            "code": SSORT_SIMPLIFIED_CODE,
            "language": "python",
        }
    ],
    "questions": [
        # 【Basic 基礎】 800-950
        {
            "id": "ssort-q1",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 800,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "選擇排序 (Selection Sort) 的核心概念是什麼？",
                    "options": [
                        {"id": "A", "text": "每次將相鄰的兩個元素進行比較和交換"},
                        {"id": "B", "text": "每次從未排序的部分找到最小（或最大）的元素，放到已排序部分的末尾"},
                        {"id": "C", "text": "每次將一個元素插入到已排序部分的正確位置"},
                        {"id": "D", "text": "將陣列分成兩半，各自排序後再合併"},
                    ],
                    "explanation": "選擇排序的核心是：每一輪從「未排序區」選出最小值，然後將它與未排序區的第一個元素交換，使其加入「已排序區」。",
                },
                "en": {
                    "title": "What is the core concept of Selection Sort?",
                    "options": [
                        {"id": "A", "text": "Each time, compare and swap two adjacent elements"},
                        {"id": "B", "text": "Each time, find the minimum (or maximum) element from the unsorted portion and place it at the end of the sorted portion"},
                        {"id": "C", "text": "Each time, insert one element into the correct position in the sorted portion"},
                        {"id": "D", "text": "Split the array in half, sort each half, then merge"},
                    ],
                    "explanation": "The core of Selection Sort is: each round selects the minimum value from the 'unsorted region' and swaps it with the first element of the unsorted region, adding it to the 'sorted region'.",
                },
            },
        },
        {
            "id": "ssort-tf-1",
            "type": "true-false",
            "category": "basic",
            "difficultyRating": 850,
            "correctAnswer": "true",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "選擇排序無論輸入資料的初始排列如何，其比較次數始終為 O(n²)。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。選擇排序的內層迴圈必須掃描整個未排序區才能找到最小值，不受輸入狀態影響。對於 n 個元素，比較次數始終是 (n-1)+(n-2)+...+1 = n(n-1)/2，即 O(n²)。",
                },
                "en": {
                    "title": "Regardless of the initial arrangement of input data, Selection Sort's number of comparisons is always O(n²).",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Correct. Selection Sort's inner loop must scan the entire unsorted region to find the minimum, regardless of the input state. For n elements, the number of comparisons is always (n-1)+(n-2)+...+1 = n(n-1)/2, which is O(n²).",
                },
            },
        },
        {
            "id": "ssort-q2",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 900,
            "correctAnswer": "C",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "選擇排序中，為什麼要記錄 `min_idx` 而不是直接在找到較小元素時立刻交換？",
                    "options": [
                        {"id": "A", "text": "直接交換會導致程式崩潰"},
                        {"id": "B", "text": "直接交換會破壞陣列結構"},
                        {"id": "C", "text": "先記錄索引，確認整個未排序區的真正最小值後再交換一次，比每次找到較小值就交換所需的交換次數更少"},
                        {"id": "D", "text": "這只是程式碼風格的選擇，兩種方式效率完全相同"},
                    ],
                    "explanation": "透過先掃描找到真正的最小值索引，每輪只需最多一次實體交換。若每次找到比當前值小的就立刻交換，則同一輪中可能多次交換，總交換次數更多，雖然比較次數相同但常數因子更大。",
                },
                "en": {
                    "title": "In Selection Sort, why record `min_idx` instead of immediately swapping when a smaller element is found?",
                    "options": [
                        {"id": "A", "text": "Swapping immediately would crash the program"},
                        {"id": "B", "text": "Swapping immediately would corrupt the array structure"},
                        {"id": "C", "text": "Recording the index first, then swapping once after confirming the true minimum of the unsorted region, requires fewer swaps than swapping every time a smaller value is found"},
                        {"id": "D", "text": "This is purely a style choice; both approaches are equally efficient"},
                    ],
                    "explanation": "By scanning first to find the true minimum index, only at most one physical swap is needed per round. If swapping immediately whenever a smaller element is found, there may be multiple swaps in the same round, increasing the total swap count (same comparison count but a larger constant factor).",
                },
            },
        },
        {
            "id": "ssort-tf-2",
            "type": "true-false",
            "category": "basic",
            "difficultyRating": 950,
            "correctAnswer": "true",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "選擇排序每輪最多只執行一次實體交換操作。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。選擇排序先找到整個未排序區的最小值索引，確認後若需要交換（min_idx != i）才執行一次交換。每輪最多一次交換，這是它相比氣泡排序的優勢之一。",
                },
                "en": {
                    "title": "Selection Sort performs at most one physical swap operation per round.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Correct. Selection Sort first finds the minimum index of the entire unsorted region, then performs one swap only if needed (min_idx != i). At most one swap per round — this is one of its advantages over Bubble Sort.",
                },
            },
        },
        {
            "id": "ssort-q3",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 950,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "對長度為 n 的陣列執行選擇排序，總共需要執行幾輪外層迴圈？",
                    "options": [
                        {"id": "A", "text": "n 輪"},
                        {"id": "B", "text": "n - 1 輪"},
                        {"id": "C", "text": "n / 2 輪"},
                        {"id": "D", "text": "n² 輪"},
                    ],
                    "explanation": "外層迴圈 `for i in range(n - 1)` 執行 n-1 輪。最後一個元素不需要選擇，因為其他 n-1 個元素都已排好，剩下的最後一個自然就在正確位置。",
                },
                "en": {
                    "title": "How many outer loop iterations does Selection Sort perform on an array of length n?",
                    "options": [
                        {"id": "A", "text": "n iterations"},
                        {"id": "B", "text": "n - 1 iterations"},
                        {"id": "C", "text": "n / 2 iterations"},
                        {"id": "D", "text": "n² iterations"},
                    ],
                    "explanation": "The outer loop `for i in range(n - 1)` runs n-1 iterations. The last element needs no selection because the other n-1 elements are already sorted, so the last one is automatically in the correct position.",
                },
            },
        },
        # 【Application 應用】 1000-1250
        {
            "id": "ssort-group-1",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1000,
            "correctAnswer": "A",
            "points": 2,
            "groupId": "group-ssort-logic",
            "translations": {
                "zh-TW": {
                    "title": "在題組的程式碼中，`min_idx = i` 這行初始化的意義是什麼？",
                    "options": [
                        {"id": "A", "text": "假設當前位置 i 的元素就是未排序區的最小值，以此作為比較的起點"},
                        {"id": "B", "text": "將 min_idx 設為 0，從頭開始搜尋"},
                        {"id": "C", "text": "記錄上一輪的最小值位置"},
                        {"id": "D", "text": "標記已排序區的終點"},
                    ],
                    "explanation": "將 min_idx 初始化為 i，代表「先假設當前輪次的第一個元素（位置 i）就是最小值」。隨後內層迴圈從 i+1 開始掃描，若找到更小的元素就更新 min_idx。",
                },
                "en": {
                    "title": "In the group code, what does the initialization `min_idx = i` mean?",
                    "options": [
                        {"id": "A", "text": "Assume the element at the current position i is the minimum of the unsorted region, using it as the starting point for comparison"},
                        {"id": "B", "text": "Set min_idx to 0 to start searching from the beginning"},
                        {"id": "C", "text": "Record the minimum position from the previous round"},
                        {"id": "D", "text": "Mark the end of the sorted region"},
                    ],
                    "explanation": "Initializing min_idx to i means 'assume the first element of the current round (position i) is the minimum'. The inner loop then scans from i+1, updating min_idx whenever a smaller element is found.",
                },
            },
        },
        {
            "id": "ssort-q8",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1050,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[64, 25, 12, 22, 11]` 執行選擇排序，第一輪結束後陣列狀態為何？",
                    "options": [
                        {"id": "A", "text": "[11, 64, 25, 12, 22]"},
                        {"id": "B", "text": "[11, 25, 12, 22, 64]"},
                        {"id": "C", "text": "[25, 11, 12, 22, 64]"},
                        {"id": "D", "text": "[12, 25, 64, 22, 11]"},
                    ],
                    "explanation": "第一輪（i=0）：掃描整個陣列，找到最小值 11 位於索引 4（min_idx=4）。交換 arr[0] 和 arr[4]，64 和 11 互換。結果：[11, 25, 12, 22, 64]。",
                },
                "en": {
                    "title": "After the first round of Selection Sort on `[64, 25, 12, 22, 11]`, what is the array state?",
                    "options": [
                        {"id": "A", "text": "[11, 64, 25, 12, 22]"},
                        {"id": "B", "text": "[11, 25, 12, 22, 64]"},
                        {"id": "C", "text": "[25, 11, 12, 22, 64]"},
                        {"id": "D", "text": "[12, 25, 64, 22, 11]"},
                    ],
                    "explanation": "Round 1 (i=0): scan the entire array, find minimum 11 at index 4 (min_idx=4). Swap arr[0] and arr[4], exchanging 64 and 11. Result: [11, 25, 12, 22, 64].",
                },
            },
        },
        {
            "id": "ssort-group-2",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1100,
            "correctAnswer": "C",
            "points": 2,
            "groupId": "group-ssort-logic",
            "translations": {
                "zh-TW": {
                    "title": "在題組的程式碼中，如果省略 `if min_idx != i:` 的判斷，直接執行交換，會有什麼影響？",
                    "options": [
                        {"id": "A", "text": "排序結果會錯誤"},
                        {"id": "B", "text": "程式會崩潰"},
                        {"id": "C", "text": "排序結果仍然正確，但會多執行一些不必要的自身交換（元素和自己交換），浪費效能"},
                        {"id": "D", "text": "排序速度會更快，因為少了一個條件判斷"},
                    ],
                    "explanation": "當 min_idx == i 時，最小值就是當前位置的元素，不需要交換。省略判斷會執行 arr[i], arr[i] = arr[i], arr[i] 這種無意義的自身交換，結果仍正確但浪費了操作。",
                },
                "en": {
                    "title": "In the group code, if the check `if min_idx != i:` is omitted and the swap is always executed, what happens?",
                    "options": [
                        {"id": "A", "text": "The sort result will be incorrect"},
                        {"id": "B", "text": "The program will crash"},
                        {"id": "C", "text": "The sort result remains correct, but unnecessary self-swaps (element swapped with itself) are performed, wasting effort"},
                        {"id": "D", "text": "The sort will be faster because one conditional check is eliminated"},
                    ],
                    "explanation": "When min_idx == i, the minimum is already at the current position and no swap is needed. Omitting the check causes arr[i], arr[i] = arr[i], arr[i], a meaningless self-swap. The result is still correct but operations are wasted.",
                },
            },
        },
        {
            "id": "ssort-q4",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1100,
            "correctAnswer": "C",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "選擇排序在下列哪種情況下，實際執行的交換次數最少？",
                    "options": [
                        {"id": "A", "text": "陣列完全逆序"},
                        {"id": "B", "text": "陣列元素完全隨機"},
                        {"id": "C", "text": "陣列已完全排序"},
                        {"id": "D", "text": "陣列中只有兩個元素"},
                    ],
                    "explanation": "當陣列已完全排序時，每輪找到的最小值都已在正確位置（min_idx == i），`if min_idx != i` 的條件始終為 False，因此交換次數為 0。這是選擇排序交換次數最少的情況。",
                },
                "en": {
                    "title": "In which case does Selection Sort perform the fewest actual swaps?",
                    "options": [
                        {"id": "A", "text": "The array is in completely reverse order"},
                        {"id": "B", "text": "The array elements are completely random"},
                        {"id": "C", "text": "The array is already fully sorted"},
                        {"id": "D", "text": "The array has only two elements"},
                    ],
                    "explanation": "When the array is already fully sorted, the minimum found each round is already in the correct position (min_idx == i), so the condition `if min_idx != i` is always False, resulting in 0 swaps. This is the case where Selection Sort performs the fewest swaps.",
                },
            },
        },
        {
            "id": "ssort-q5",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1150,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[3, 5, 1, 2, 4]` 執行選擇排序，前兩輪結束後，陣列狀態為何？",
                    "options": [
                        {"id": "A", "text": "[1, 2, 5, 3, 4]"},
                        {"id": "B", "text": "[1, 2, 3, 5, 4]"},
                        {"id": "C", "text": "[1, 2, 5, 3, 4]"},
                        {"id": "D", "text": "[1, 2, 4, 5, 3]"},
                    ],
                    "explanation": "第一輪（i=0）：最小值為 1（索引 2），與索引 0 交換 → [1, 5, 3, 2, 4]。等等，原陣列索引2是1，索引0是3。交換後 → [1, 5, 3, 2, 4]... 再看：[3,5,1,2,4]，第一輪最小=1(idx=2)，arr[0]↔arr[2] → [1,5,3,2,4]。第二輪（i=1）：掃描[5,3,2,4]，最小=2(idx=3)，arr[1]↔arr[3] → [1,2,3,5,4]。",
                },
                "en": {
                    "title": "After the first two rounds of Selection Sort on `[3, 5, 1, 2, 4]`, what is the array state?",
                    "options": [
                        {"id": "A", "text": "[1, 2, 5, 3, 4]"},
                        {"id": "B", "text": "[1, 2, 3, 5, 4]"},
                        {"id": "C", "text": "[1, 2, 5, 3, 4]"},
                        {"id": "D", "text": "[1, 2, 4, 5, 3]"},
                    ],
                    "explanation": "Round 1 (i=0): minimum is 1 (index 2), swap with index 0 → [1, 5, 3, 2, 4]. Round 2 (i=1): scan [5, 3, 2, 4], minimum is 2 (index 3), swap arr[1] and arr[3] → [1, 2, 3, 5, 4].",
                },
            },
        },
        {
            "id": "ssort-q9",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1150,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "選擇排序通常被認為是不穩定的排序演算法，以下哪個例子最能說明其不穩定性？",
                    "options": [
                        {"id": "A", "text": "[1, 2, 3] 排序後變成 [3, 2, 1]"},
                        {"id": "B", "text": "對 [5a, 5b, 2] 排序（5a 和 5b 值相同），結果可能是 [2, 5b, 5a]，5a 與 5b 的相對順序改變"},
                        {"id": "C", "text": "[3, 1, 2] 排序後多執行了一次不必要的交換"},
                        {"id": "D", "text": "陣列已排序時選擇排序仍然執行 O(n²) 次比較"},
                    ],
                    "explanation": "以 [5a, 5b, 2] 為例：第一輪找到最小值 2（索引 2），與索引 0 的 5a 交換，得 [2, 5b, 5a]。原本 5a 在 5b 前面，排序後 5b 在 5a 前面，相對順序改變，這說明了選擇排序的不穩定性。",
                },
                "en": {
                    "title": "Selection Sort is generally considered an unstable sort. Which example best illustrates this instability?",
                    "options": [
                        {"id": "A", "text": "[1, 2, 3] becomes [3, 2, 1] after sorting"},
                        {"id": "B", "text": "Sorting [5a, 5b, 2] (where 5a and 5b have the same value) may yield [2, 5b, 5a], changing the relative order of 5a and 5b"},
                        {"id": "C", "text": "[3, 1, 2] causes one extra unnecessary swap during sorting"},
                        {"id": "D", "text": "Selection Sort still performs O(n²) comparisons even when the array is already sorted"},
                    ],
                    "explanation": "Take [5a, 5b, 2]: in round 1 the minimum is 2 (index 2), swapped with 5a at index 0, giving [2, 5b, 5a]. Originally 5a was before 5b; after sorting 5b is before 5a — the relative order has changed, demonstrating Selection Sort's instability.",
                },
            },
        },
        {
            "id": "ssort-multi-1",
            "type": "multiple-choice",
            "category": "application",
            "difficultyRating": 1200,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "以下哪些是選擇排序的特性？（選擇所有正確答案）",
                    "options": [
                        {"id": "opt1", "text": "選擇排序是原地 (in-place) 排序演算法"},
                        {"id": "opt2", "text": "選擇排序的時間複雜度在所有情況下（最佳、平均、最壞）都是 O(n²)"},
                        {"id": "opt3", "text": "選擇排序每輪最多進行一次實體交換"},
                        {"id": "opt4", "text": "選擇排序是穩定的排序演算法"},
                    ],
                    "explanation": "opt1 正確：只使用 O(1) 額外空間。opt2 正確：無論輸入如何，內層迴圈都必須掃描完整個未排序區，比較次數固定為 O(n²)。opt3 正確：每輪找到最小值後最多交換一次。opt4 錯誤：選擇排序通常是不穩定的。",
                },
                "en": {
                    "title": "Which of the following are characteristics of Selection Sort? (Select all that apply)",
                    "options": [
                        {"id": "opt1", "text": "Selection Sort is an in-place sorting algorithm"},
                        {"id": "opt2", "text": "Selection Sort's time complexity is O(n²) in all cases (best, average, worst)"},
                        {"id": "opt3", "text": "Selection Sort performs at most one physical swap per round"},
                        {"id": "opt4", "text": "Selection Sort is a stable sorting algorithm"},
                    ],
                    "explanation": "opt1 is correct: only O(1) extra space is used. opt2 is correct: regardless of input, the inner loop must scan the entire unsorted region, fixing the comparison count at O(n²). opt3 is correct: after finding the minimum each round, at most one swap is performed. opt4 is wrong: Selection Sort is typically unstable.",
                },
            },
        },
        {
            "id": "ssort-q6",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1250,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "比較選擇排序與插入排序的交換（或移動）操作次數，哪個說法最正確？",
                    "options": [
                        {"id": "A", "text": "選擇排序的移動次數永遠多於插入排序"},
                        {"id": "B", "text": "選擇排序的交換次數最多為 O(n)，而插入排序的移動次數最壞情況為 O(n²)"},
                        {"id": "C", "text": "兩者的移動次數完全相同"},
                        {"id": "D", "text": "插入排序的移動次數永遠少於選擇排序"},
                    ],
                    "explanation": "選擇排序每輪至多一次交換，n 輪最多 n 次交換，即 O(n) 次交換。插入排序的移動操作（平移）在最壞情況（逆序陣列）下需要 O(n²) 次。因此在對寫入操作成本敏感的場景（如快閃記憶體），選擇排序可能更有優勢。",
                },
                "en": {
                    "title": "Comparing the number of swap (or move) operations between Selection Sort and Insertion Sort, which statement is most accurate?",
                    "options": [
                        {"id": "A", "text": "Selection Sort always has more moves than Insertion Sort"},
                        {"id": "B", "text": "Selection Sort's swap count is at most O(n), while Insertion Sort's move count is O(n²) in the worst case"},
                        {"id": "C", "text": "Both have exactly the same number of moves"},
                        {"id": "D", "text": "Insertion Sort always has fewer moves than Selection Sort"},
                    ],
                    "explanation": "Selection Sort does at most one swap per round, so at most n swaps over n rounds — O(n) swaps. Insertion Sort's shift operations in the worst case (reverse-sorted array) require O(n²) moves. Therefore, in write-sensitive scenarios (e.g. flash memory), Selection Sort may have an advantage.",
                },
            },
        },
        # 【Complexity 進階】 1300-1500
        {
            "id": "ssort-group-3",
            "type": "fill-code",
            "category": "complexity",
            "difficultyRating": 1300,
            "correctAnswer": ["current_pos", "scan_pos", "current_pos"],
            "points": 5,
            "groupId": "group-ssort-logic",
            "code": SSORT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成 `selection_sort` 函式。",
                    "options": [],
                    "explanation": "(a) `current_pos`：初始假設當前位置就是最小值位置。(b) `scan_pos`：找到更小的元素時，更新 min_pos 為當前掃描位置。(c) `current_pos`：若 min_pos 不等於 current_pos，才需要交換，避免不必要的自身交換。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the `selection_sort` function.",
                    "options": [],
                    "explanation": "(a) `current_pos`: initially assume the current position is the minimum position. (b) `scan_pos`: when a smaller element is found, update min_pos to the current scan position. (c) `current_pos`: only swap if min_pos differs from current_pos, avoiding unnecessary self-swaps.",
                },
            },
        },
        {
            "id": "ssort-q7",
            "type": "single-choice",
            "category": "complexity",
            "difficultyRating": 1350,
            "correctAnswer": "C",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "「雙端選擇排序 (Double Selection Sort)」是選擇排序的一個優化版本。它的主要改進是什麼？",
                    "options": [
                        {"id": "A", "text": "它同時對兩個不同的陣列進行排序"},
                        {"id": "B", "text": "它每輪進行兩次交換"},
                        {"id": "C", "text": "它每輪同時找到最小值和最大值，分別放到兩端，使每輪能縮短兩側的未排序範圍"},
                        {"id": "D", "text": "它使用兩個指標從中間向兩端掃描"},
                    ],
                    "explanation": "雙端選擇排序每輪同時找到最小值和最大值，最小值放到左端，最大值放到右端。雖然比較次數相同（仍是 O(n²)），但每輪未排序範圍縮小兩個位置，使迴圈輪次減少約一半，實際效能有所提升。",
                },
                "en": {
                    "title": "'Double Selection Sort' is an optimized version of Selection Sort. What is its main improvement?",
                    "options": [
                        {"id": "A", "text": "It sorts two different arrays simultaneously"},
                        {"id": "B", "text": "It performs two swaps per round"},
                        {"id": "C", "text": "Each round simultaneously finds both the minimum and maximum, placing them at both ends, so the unsorted range shrinks from both sides each round"},
                        {"id": "D", "text": "It uses two pointers scanning from the middle outward"},
                    ],
                    "explanation": "Double Selection Sort finds both the minimum and maximum each round, placing the minimum at the left end and the maximum at the right end. Although the comparison count is the same (still O(n²)), the unsorted range shrinks by two positions each round, reducing the number of iterations by about half and improving practical performance.",
                },
            },
        },
        {
            "id": "ssort-multi-2",
            "type": "multiple-choice",
            "category": "complexity",
            "difficultyRating": 1400,
            "correctAnswer": ["opt1", "opt3"],
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "以下關於選擇排序與其他排序演算法比較的陳述，哪些是正確的？（選擇所有正確答案）",
                    "options": [
                        {"id": "opt1", "text": "在寫入操作代價很高的環境中（如 EEPROM），選擇排序因其 O(n) 的交換次數而優於插入排序"},
                        {"id": "opt2", "text": "選擇排序的平均時間複雜度優於快速排序 (Quick Sort)"},
                        {"id": "opt3", "text": "選擇排序和氣泡排序的最壞情況時間複雜度相同，都是 O(n²)"},
                        {"id": "opt4", "text": "選擇排序在資料幾乎已排序的情況下效能接近 O(n)"},
                    ],
                    "explanation": "opt1 正確：選擇排序最多 O(n) 次交換，插入排序最壞 O(n²) 次移動，在寫入成本高的場景選擇排序更優。opt3 正確：兩者最壞時間複雜度都是 O(n²)。opt2 錯誤：快速排序平均 O(n log n)，優於選擇排序的 O(n²)。opt4 錯誤：選擇排序無論輸入如何都是 O(n²) 比較次數，不會因為幾乎已排序而加速。",
                },
                "en": {
                    "title": "Which of the following statements comparing Selection Sort to other sorting algorithms are correct? (Select all that apply)",
                    "options": [
                        {"id": "opt1", "text": "In environments where write operations are expensive (e.g. EEPROM), Selection Sort outperforms Insertion Sort due to its O(n) swap count"},
                        {"id": "opt2", "text": "Selection Sort has better average time complexity than Quick Sort"},
                        {"id": "opt3", "text": "Selection Sort and Bubble Sort have the same worst-case time complexity: O(n²)"},
                        {"id": "opt4", "text": "Selection Sort performs close to O(n) when the data is nearly sorted"},
                    ],
                    "explanation": "opt1 is correct: Selection Sort has at most O(n) swaps while Insertion Sort has O(n²) moves in the worst case, making Selection Sort better in write-expensive scenarios. opt3 is correct: both have O(n²) worst-case time complexity. opt2 is wrong: Quick Sort averages O(n log n), better than Selection Sort's O(n²). opt4 is wrong: Selection Sort always performs O(n²) comparisons regardless of input and does not speed up for nearly-sorted data.",
                },
            },
        },
        {
            "id": "ssort-fill-1",
            "type": "fill-code",
            "category": "complexity",
            "difficultyRating": 1450,
            "correctAnswer": ["i", "i", "min_idx"],
            "points": 5,
            "code": DOUBLE_SSORT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成雙端選擇排序 (Double Selection Sort) 函式。",
                    "options": [],
                    "explanation": "(a) `i`：找到比當前最小值更小的元素時，更新 min_idx 為當前掃描索引 i。(b) `i`：找到比當前最大值更大的元素時，更新 max_idx 為當前掃描索引 i。(c) `min_idx`：由於 left（原最大值位置）已被換到 min_idx 處，最大值現在在 min_idx，需更新 max_idx 以確保之後正確交換到右端。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the Double Selection Sort function.",
                    "options": [],
                    "explanation": "(a) `i`: when a smaller element is found, update min_idx to the current scan index i. (b) `i`: when a larger element is found, update max_idx to the current scan index i. (c) `min_idx`: since left (the original max position) has been swapped to min_idx, the maximum is now at min_idx; update max_idx accordingly so the subsequent swap to the right end is correct.",
                },
            },
        },
        {
            "id": "ssort-pred-1",
            "type": "predict-line",
            "category": "complexity",
            "difficultyRating": 1500,
            "correctAnswer": "1 2 3 4 5 6 7 8 9 5 6 7 8 10 11 3 4 5 6 7 8 10 12",
            "points": 5,
            "code": SSORT_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[3, 1, 2]` 呼叫 `selection_sort([3, 1, 2])`，請依序寫出每次被執行到的行號（以空格分隔）。",
                    "options": [],
                    "explanation": "L1,L2 → 外層 current_pos=0：L3,L4(min_pos=0) → scan_pos=1：L5,L6,L7,L8(1<3,true),L9(min_pos=1) → scan_pos=2：L5,L6,L7,L8(2>1,false) → L5(結束內層) → L10(min_pos=1≠0,true),L11(交換→[1,3,2]) → 外層 current_pos=1：L3,L4(min_pos=1) → scan_pos=2：L5,L6,L7,L8(2<3,true),L9(min_pos=2)... 等等，重新計算並對應：執行行號 1 2 3 4 5 6 7 8 9 5 6 7 8 10 11 3 4 5 6 7 8 10 12。",
                },
                "en": {
                    "title": "Calling `selection_sort([3, 1, 2])` on `[3, 1, 2]`, write the line numbers executed in order (space-separated).",
                    "options": [],
                    "explanation": "L1,L2 → outer current_pos=0: L3,L4(min_pos=0) → scan_pos=1: L5,L6,L7,L8(1<3,true),L9(min_pos=1) → scan_pos=2: L5,L6,L7,L8(2>1,false) → L5(inner loop ends) → L10(min_pos=1≠0,true),L11(swap→[1,3,2]) → outer current_pos=1: L3,L4(min_pos=1) → scan_pos=2: L5,L6,L7,L8(2<3,true),L9(min_pos=2) → L5(inner loop ends) → L10(min_pos=2≠1,true),L11(swap→[1,2,3]) → L3(outer loop ends) → L12(return). Lines: 1 2 3 4 5 6 7 8 9 5 6 7 8 10 11 3 4 5 6 7 8 10 12.",
                },
            },
        },
    ],
}

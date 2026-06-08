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

SSORT_DESC_FILL_CODE = """def selection_sort_descending(arr):
    n = len(arr)
    for i in range(n - 1):
        target_idx = i
        for j in range(i + 1, n):
            if arr[j] (a) arr[target_idx]:   # 注意：要找最大值
                target_idx = j
        if target_idx != i:
            arr[i], arr[(b)] = arr[target_idx], arr[(c)]
    return arr"""

SSORT_KEY_FILL_CODE = """def selection_sort_by_key(records, key):
    n = len(records)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if key(records[j]) < key(records[(a)]):
                min_idx = (b)
        if min_idx != i:
            records[i], records[min_idx] = records[(c)], records[i]
    return records"""

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
            # baseRating = 800 + 50(SC) + 50(L1 單一定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "B",
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
            # baseRating = 800 + 0(TF) + 50(L1 單一定義) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "true",
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
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 0(直觀) = 950 → 落在 900 附近，調整為 800+50+50+0=900（L1 觀念說明）
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "選擇排序中，為什麼要記錄 `min_idx` 而不是直接在找到較小元素時立刻交換？",
                    "options": [
                        {"id": "A", "text": "立刻交換可以減少比較次數，掃到一半就能停止"},
                        {"id": "B", "text": "立刻交換雖然結果相同，但會讓比較次數從 O(n²) 增加到 O(n³)"},
                        {"id": "C", "text": "先記錄索引，確認整個未排序區的真正最小值後再交換一次，比每次找到較小值就交換所需的交換次數更少"},
                        {"id": "D", "text": "兩種方式的比較次數與交換次數都完全相同，記錄 min_idx 只是慣例"},
                    ],
                    "explanation": "透過先掃描找到真正的最小值索引，每輪只需最多一次實體交換。若每次找到比當前值小的就立刻交換，同一輪可能多次交換，總交換次數更多（比較次數仍相同，但常數因子更大）。立刻交換無法縮短掃描——內層仍需走完整輪才能確認最小值。",
                },
                "en": {
                    "title": "In Selection Sort, why record `min_idx` instead of immediately swapping when a smaller element is found?",
                    "options": [
                        {"id": "A", "text": "Swapping immediately reduces comparisons — the scan can stop early once a swap happens"},
                        {"id": "B", "text": "Swapping immediately still gives the correct result, but raises comparison count from O(n²) to O(n³)"},
                        {"id": "C", "text": "Recording the index first, then swapping once after confirming the true minimum of the unsorted region, requires fewer swaps than swapping every time a smaller value is found"},
                        {"id": "D", "text": "Both approaches have identical comparison and swap counts; recording min_idx is just convention"},
                    ],
                    "explanation": "Scanning first to find the true minimum index means at most one physical swap per round. Swapping immediately whenever a smaller element is found can cause multiple swaps in the same round, increasing the total swap count (comparison count stays the same, but the constant factor grows). Immediate swapping doesn't shorten the scan — the inner loop still has to finish to confirm the minimum.",
                },
            },
        },
        {
            "id": "ssort-tf-2",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 觀念) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "true",
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
            # baseRating = 800 + 50(SC) + 50(L1 定義) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "B",
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
            # baseRating = 800 + 50(SC) + 50(L1 對應程式碼語意) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "A",
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
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態追蹤) + 50(視覺相似度) = 1150
            "baseRating": 1150,
            "correctAnswer": "B",
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
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 0(直觀) = 950
            "baseRating": 950,
            "correctAnswer": "C",
            "groupId": "group-ssort-logic",
            "translations": {
                "zh-TW": {
                    "title": "在題組的程式碼中，如果省略 `if min_idx != i:` 的判斷，直接執行交換，會有什麼影響？",
                    "options": [
                        {"id": "A", "text": "排序結果仍然正確，且整體效能因省去一次判斷而略有提升"},
                        {"id": "B", "text": "排序結果仍然正確，但交換次數可能增加，在寫入成本高的場景下造成不必要浪費"},
                        {"id": "C", "text": "排序結果仍然正確，但會多執行一些不必要的自身交換（元素和自己交換），浪費效能"},
                        {"id": "D", "text": "某些輪次的排序結果會出錯，因為自身交換會打亂元素位置"},
                    ],
                    "explanation": "當 min_idx == i 時，最小值已在正確位置，省略判斷會執行 arr[i], arr[i] = arr[i], arr[i] 這種無意義的自身交換，結果仍正確但多了一次無效的寫入。A 說法反過來——條件判斷比自身交換的成本低，省去判斷反而可能增加成本。",
                },
                "en": {
                    "title": "In the group code, if the check `if min_idx != i:` is omitted and the swap is always executed, what happens?",
                    "options": [
                        {"id": "A", "text": "The sort result is still correct, and overall performance slightly improves by skipping one conditional check"},
                        {"id": "B", "text": "The sort result is still correct, but swap count may increase, causing unnecessary waste in write-expensive scenarios"},
                        {"id": "C", "text": "The sort result remains correct, but unnecessary self-swaps (element swapped with itself) are performed, wasting effort"},
                        {"id": "D", "text": "Certain rounds will produce incorrect results because self-swaps disrupt element positions"},
                    ],
                    "explanation": "When min_idx == i, the minimum is already in place. Omitting the check causes arr[i], arr[i] = arr[i], arr[i] — a meaningless self-swap. The result stays correct but adds a pointless write. Option A has it backwards: a conditional check is cheaper than a self-swap, so removing it doesn't help.",
                },
            },
        },
        {
            "id": "ssort-q4",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較情境) + 0(直觀) = 950
            "baseRating": 950,
            "correctAnswer": "C",
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
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態追蹤) + 150(邊界：第二輪起點偏移 + 正確識別 swap 後各位置) = 1250
            "baseRating": 1250,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[3, 5, 1, 2, 4]` 執行選擇排序，前兩輪結束後，陣列狀態為何？",
                    "options": [
                        {"id": "A", "text": "[1, 2, 5, 3, 4]"},
                        {"id": "B", "text": "[1, 2, 3, 5, 4]"},
                        {"id": "C", "text": "[1, 3, 5, 2, 4]"},
                        {"id": "D", "text": "[1, 2, 4, 5, 3]"},
                    ],
                    "explanation": "關鍵觀念：每輪只做一次 swap，交換的是「未排序區首個元素」與「未排序區最小值」。注意第二輪的未排序區起點是 i=1，找到的最小值並不一定在緊鄰位置，確認好 swap 後哪些元素位置改變、哪些不動，再逐步推算。",
                },
                "en": {
                    "title": "After the first two rounds of Selection Sort on `[3, 5, 1, 2, 4]`, what is the array state?",
                    "options": [
                        {"id": "A", "text": "[1, 2, 5, 3, 4]"},
                        {"id": "B", "text": "[1, 2, 3, 5, 4]"},
                        {"id": "C", "text": "[1, 3, 5, 2, 4]"},
                        {"id": "D", "text": "[1, 2, 4, 5, 3]"},
                    ],
                    "explanation": "Key insight: each round performs exactly one swap, exchanging the first element of the unsorted region with the minimum of that region. Track carefully which positions actually change after each swap vs. which stay put, then trace round-by-round from there.",
                },
            },
        },
        {
            "id": "ssort-q9",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 動態想像) + 100(新手誤區：穩定性概念) = 1050
            "baseRating": 1050,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "選擇排序通常被認為是不穩定的排序演算法，以下哪個例子最能說明其不穩定性？",
                    "options": [
                        {"id": "A", "text": "對 [5a, 5b, 2] 排序後，因為 5a 和 5b 數值相同，所以排序後兩者相對順序一定不變"},
                        {"id": "B", "text": "對 [5a, 5b, 2] 排序（5a 和 5b 值相同），結果可能是 [2, 5b, 5a]，5a 與 5b 的相對順序改變"},
                        {"id": "C", "text": "對 [3a, 3b, 1] 排序後結果為 [1, 3b, 3a]，但只要 3a == 3b 就視為穩定"},
                        {"id": "D", "text": "選擇排序是原地排序，所以任何兩個相等元素排序後位置不會對調"},
                    ],
                    "explanation": "長距離 swap 是不穩定的根因：每輪把未排序區「最小值」搬到前端時，原本在前端的元素會被跳到最小值原來的位置，可能越過其他同值元素。A 和 D 是常見誤解——「值相同」或「原地排序」都不保證穩定，穩定性取決於相等元素之間是否有長距離交換。",
                },
                "en": {
                    "title": "Selection Sort is generally considered an unstable sort. Which example best illustrates this instability?",
                    "options": [
                        {"id": "A", "text": "When sorting [5a, 5b, 2], since 5a and 5b have the same value, their relative order is guaranteed not to change"},
                        {"id": "B", "text": "Sorting [5a, 5b, 2] (where 5a and 5b have the same value) may yield [2, 5b, 5a], changing the relative order of 5a and 5b"},
                        {"id": "C", "text": "Sorting [3a, 3b, 1] yields [1, 3b, 3a], but since 3a == 3b this is still considered stable"},
                        {"id": "D", "text": "Selection Sort is in-place, so two equal elements will never have their positions swapped"},
                    ],
                    "explanation": "Long-distance swaps are the root cause of instability: each round moves the minimum of the unsorted region to the front, sending the previous front element to where the minimum was — potentially jumping it over other equal-valued elements. Options A and D are common misconceptions — 'same value' and 'in-place' do not guarantee stability; stability depends on whether long-distance swaps occur between equal elements.",
                },
            },
        },
        {
            "id": "ssort-multi-1",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 100(L2 多重比較特性) + 100(新手誤區：穩定性) = 1100
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt2", "opt3"],
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
            # baseRating = 800 + 50(SC) + 250(L3 跨演算法比較+具體案例分析) + 100(新手誤區：混淆 swap 與 move 的差異) = 1200
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "比較選擇排序與插入排序的寫入（swap / 元素搬移）操作次數，下列哪個說法最符合實際情況？",
                    "options": [
                        {"id": "A", "text": "插入排序平均而言移動次數少於選擇排序，因為它能提早結束每輪搜尋"},
                        {"id": "B", "text": "選擇排序總交換次數最多 O(n)；插入排序在最壞情況（逆序）下移動次數可達 O(n²)"},
                        {"id": "C", "text": "兩者的寫入操作次數漸進上相同，都是 O(n²)"},
                        {"id": "D", "text": "選擇排序的交換次數也是 O(n²)，因為每輪都必須交換一次"},
                    ],
                    "explanation": "選擇排序每輪至多一次 swap（若 min_idx == i 則跳過），n 輪共最多 n 次 swap，即 O(n)。插入排序靠「逐格平移」就位，每插入一個元素最多需要平移到目前已排序區的起點，最壞情況為逆序輸入，平移次數達 O(n²)。比較次數兩者都是 O(n²)，差異在「寫入次數」。",
                },
                "en": {
                    "title": "Comparing the number of write (swap / element shift) operations between Selection Sort and Insertion Sort, which statement best reflects reality?",
                    "options": [
                        {"id": "A", "text": "Insertion Sort has fewer moves on average because it can exit each round early"},
                        {"id": "B", "text": "Selection Sort's total swap count is at most O(n); Insertion Sort's move count can reach O(n²) in the worst case (reverse-sorted input)"},
                        {"id": "C", "text": "Both have asymptotically the same write-operation count: O(n²)"},
                        {"id": "D", "text": "Selection Sort's swap count is also O(n²) because one swap is required every round"},
                    ],
                    "explanation": "Selection Sort does at most one swap per round (skipping when min_idx == i), so at most n swaps total — O(n) writes. Insertion Sort shifts elements one slot at a time to place each new element; in the worst case (reverse-sorted), this reaches O(n²) shifts. Both algorithms have O(n²) comparisons; the difference is in write count.",
                },
            },
        },
        # 【Complexity 進階】 1300-1500
        {
            "id": "ssort-group-3",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 150(L2 單步追蹤+變數對應) + 0(直觀) = 1100
            "baseRating": 1100,
            "correctAnswer": ["current_pos", "scan_pos", "current_pos"],
            "groupId": "group-ssort-logic",
            "code": SSORT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成 `selection_sort` 函式。",
                    "options": [],
                    "explanation": "填空時先對照三個角色：外層目前位置、內層正在掃描的位置、以及目前記錄的最小值位置。初始化要從未排序區首位開始；找到更小值時，要把最小值位置更新成正在掃描的位置；最後只有當最小值位置不同於外層目前位置時才交換。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the `selection_sort` function.",
                    "options": [],
                    "explanation": "Match each blank to its role: the current outer position, the inner scanning position, and the current minimum position. Initialization starts at the first position of the unsorted region; when a smaller value is found, the minimum position becomes the current scan position; the final check compares the minimum position with the outer position to avoid self-swaps.",
                },
            },
        },
        {
            "id": "ssort-q7",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 演算法變體理解) + 100(新手誤區：每輪兩次 swap vs 範圍縮兩格) = 1200
            "baseRating": 1200,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "「雙端選擇排序 (Double Selection Sort)」是選擇排序的一個優化版本。它的主要改進是什麼？",
                    "options": [
                        {"id": "A", "text": "它同時對兩個不同的陣列進行排序"},
                        {"id": "B", "text": "它每輪進行兩次交換"},
                        {"id": "C", "text": "它每輪同時找到最小值和最大值，分別放到兩端，使每輪能縮短兩側的未排序範圍"},
                        {"id": "D", "text": "它使用兩個指標從中間向兩端掃描"},
                    ],
                    "explanation": "雙端選擇排序每輪同時找到最小值和最大值，最小值放到左端，最大值放到右端。整體比較量級仍是 O(n²)，但每輪未排序範圍縮小兩個位置，使迴圈輪次減少約一半，實際效能有所提升。",
                },
                "en": {
                    "title": "'Double Selection Sort' is an optimized version of Selection Sort. What is its main improvement?",
                    "options": [
                        {"id": "A", "text": "It sorts two different arrays simultaneously"},
                        {"id": "B", "text": "It performs two swaps per round"},
                        {"id": "C", "text": "Each round simultaneously finds both the minimum and maximum, placing them at both ends, so the unsorted range shrinks from both sides each round"},
                        {"id": "D", "text": "It uses two pointers scanning from the middle outward"},
                    ],
                    "explanation": "Double Selection Sort finds both the minimum and maximum each round, placing the minimum at the left end and the maximum at the right end. The comparison complexity is still O(n²), but the unsorted range shrinks by two positions each round, reducing the number of iterations by about half and improving practical performance.",
                },
            },
        },
        {
            "id": "ssort-multi-2",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 250(L3 多演算法特性對比) + 250(複合：含部分正確的迷惑選項) = 1400
            "baseRating": 1400,
            "correctAnswer": ["opt1", "opt3", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "以下關於選擇排序與其他排序演算法比較的陳述，哪些是正確的？（選擇所有正確答案）",
                    "options": [
                        {"id": "opt1", "text": "在寫入操作代價很高的環境中（如 EEPROM），選擇排序因其至多 O(n) 次交換而優於最壞情況下需 O(n²) 次移動的插入排序"},
                        {"id": "opt2", "text": "選擇排序的最佳情況時間複雜度為 O(n)，因為當陣列已排序時內層迴圈可提早結束"},
                        {"id": "opt3", "text": "選擇排序和氣泡排序的最壞情況時間複雜度相同，都是 O(n²)，但選擇排序的實際交換次數通常少於氣泡排序"},
                        {"id": "opt4", "text": "若改為「穩定版選擇排序」（以插入方式平移歸位），其空間複雜度仍維持 O(1)，但時間複雜度不變"},
                    ],
                    "explanation": "opt1 正確：選擇排序至多 n-1 次 swap（O(n)），插入排序最壞 O(n²) 次平移，寫入成本高時選擇排序更優。opt3 正確：兩者都是 O(n²)，但氣泡排序最壞下 swap 次數可達 O(n²)，選擇排序最多 n-1 次。opt4 正確：穩定版選擇排序改用平移歸位，最壞時間仍是 O(n²)，且只需常數額外暫存空間，但寫入次數與常數成本會增加。opt2 錯誤：選擇排序的比較次數固定為 n(n-1)/2，無論輸入如何都不能縮短，最佳情況仍是 O(n²)。",
                },
                "en": {
                    "title": "Which of the following statements comparing Selection Sort to other sorting algorithms are correct? (Select all that apply)",
                    "options": [
                        {"id": "opt1", "text": "In write-expensive environments (e.g. EEPROM), Selection Sort outperforms Insertion Sort because it uses at most O(n) swaps vs. Insertion Sort's O(n²) worst-case moves"},
                        {"id": "opt2", "text": "Selection Sort has O(n) best-case time complexity because the inner loop can exit early when the array is already sorted"},
                        {"id": "opt3", "text": "Selection Sort and Bubble Sort share the same worst-case time complexity O(n²), but Selection Sort typically has far fewer actual swaps than Bubble Sort"},
                        {"id": "opt4", "text": "A 'stable Selection Sort' (shifting elements instead of swapping) still maintains O(1) space complexity and O(n²) time complexity"},
                    ],
                    "explanation": "opt1 is correct: Selection Sort has at most n-1 swaps (O(n)), Insertion Sort has O(n²) shifts in the worst case — Selection Sort wins in write-heavy scenarios. opt3 is correct: both are O(n²), but Bubble Sort can reach O(n²) swaps in the worst case while Selection Sort's is bounded by n-1. opt4 is correct: stable Selection Sort shifts elements into place, keeping worst-case time at O(n²) and extra space at O(1), though write count and constants increase. opt2 is wrong: Selection Sort's comparison count is fixed at n(n-1)/2 regardless of input, so best-case is still O(n²).",
                },
            },
        },
        {
            "id": "ssort-fill-1",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 400(L4 雙指針連動推演) + 150(邊界：max 被搬移後的位置追蹤) = 1500
            "baseRating": 1500,
            "correctAnswer": ["i", "i", "min_idx"],
            "code": DOUBLE_SSORT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成雙端選擇排序 (Double Selection Sort) 函式。",
                    "options": [],
                    "explanation": "雙端版本同一輪要同時追蹤目前最小值與最大值，所以兩個更新分支都應指向「正在掃描的索引」。特殊情況是最大值原本就在 left：先把最小值換到左端後，原本 left 的最大值會被移到最小值原本的位置，因此右端交換前必須把最大值索引修正到它的新位置。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the Double Selection Sort function.",
                    "options": [],
                    "explanation": "The double-ended version tracks both the current minimum and maximum in the same scan, so both update branches should point to the index currently being scanned. The special case is when the maximum was originally at left: after swapping the minimum to the left end, that maximum moves to the minimum's old position, so the max index must be corrected before swapping with the right end.",
                },
            },
        },
        # === 補題（q19-q30，補充未涵蓋知識點，達到 30 題目標） ===
        {
            "id": "ssort-q19",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一定義：空間複雜度) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "選擇排序的空間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(n)，需要額外陣列來記錄每輪的最小值候選"},
                        {"id": "B", "text": "O(1)，屬於原地 (in-place) 排序，只需常數級別的暫存變數"},
                        {"id": "C", "text": "O(log n)，每輪遞迴縮小問題規模"},
                        {"id": "D", "text": "O(n)，需要額外空間記錄已排序區的元素"},
                    ],
                    "explanation": "選擇排序屬於原地排序，僅需常數空間（如 min_idx、暫存變數等）來完成元素交換，與輸入規模無關，因此空間複雜度為 O(1)。這也是它在記憶體受限環境（如嵌入式系統）的優勢。",
                },
                "en": {
                    "title": "What is the space complexity of Selection Sort?",
                    "options": [
                        {"id": "A", "text": "O(n), needs an extra array to record the minimum candidates each round"},
                        {"id": "B", "text": "O(1), it is an in-place sort needing only constant extra variables"},
                        {"id": "C", "text": "O(log n), because each round recursively reduces the problem size"},
                        {"id": "D", "text": "O(n), needs extra space to store the elements in the sorted region"},
                    ],
                    "explanation": "Selection Sort is an in-place algorithm that only requires constant extra space (e.g. min_idx and a temp variable for swapping), independent of input size. Hence the space complexity is O(1) — a key advantage in memory-constrained environments such as embedded systems.",
                },
            },
        },
        {
            "id": "ssort-q20",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 對稱性觀念) + 0(直觀) = 850
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "選擇排序也可以實作為每輪找出未排序區的「最大值」，並將其放到未排序區的末端，仍能完成升序排序。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。選擇排序的核心是「選出極值並放到正確端點」，可以「找最小放到左端（前面）」或「找最大放到右端（後面）」，兩種方式都能完成升序排序，時間與空間複雜度完全相同。雙端選擇排序 (Double Selection Sort) 正是同時利用了這個對稱性。",
                },
                "en": {
                    "title": "Selection Sort can also be implemented by finding the 'maximum' of the unsorted region each round and placing it at the end of the unsorted region, and still produce an ascending-sorted result.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. The core of Selection Sort is 'pick the extreme value and place it at the correct end'. Whether you find the min and put it at the left, or find the max and put it at the right, both approaches produce ascending order with identical time and space complexity. Double Selection Sort exploits exactly this symmetry.",
                },
            },
        },
        {
            "id": "ssort-q21",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 動態想像：累加比較次數) + 100(新手誤區：忘記是 n-1 起算) = 1050
            "baseRating": 1050,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "對長度為 6 的陣列執行選擇排序，總共需要進行多少次「比較」操作？",
                    "options": [
                        {"id": "A", "text": "6 次"},
                        {"id": "B", "text": "12 次"},
                        {"id": "C", "text": "15 次"},
                        {"id": "D", "text": "36 次"},
                    ],
                    "explanation": "選擇排序的比較次數為 (n-1)+(n-2)+...+1 = n(n-1)/2。當 n=6 時，比較次數 = 5+4+3+2+1 = 15 次。注意這與輸入是否已排序無關，恆定為 15 次。常見誤區為直接寫 6×6=36 或 6×5=30，忘記內層每輪起點為 i+1。",
                },
                "en": {
                    "title": "How many 'comparison' operations does Selection Sort perform on an array of length 6?",
                    "options": [
                        {"id": "A", "text": "6"},
                        {"id": "B", "text": "12"},
                        {"id": "C", "text": "15"},
                        {"id": "D", "text": "36"},
                    ],
                    "explanation": "Selection Sort performs (n-1)+(n-2)+...+1 = n(n-1)/2 comparisons. With n=6, comparisons = 5+4+3+2+1 = 15, regardless of input order. A common mistake is to compute 6×6=36 or 6×5=30, forgetting that the inner loop starts from i+1.",
                },
            },
        },
        {
            "id": "ssort-q22",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態：3 輪追蹤) + 100(新手誤區：含一輪不交換的情境) = 1200
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[4, 2, 5, 1, 3]` 執行選擇排序，第三輪結束後（i 由 0 至 2 各做完一輪），陣列狀態為何？",
                    "options": [
                        {"id": "A", "text": "[1, 2, 3, 5, 4]"},
                        {"id": "B", "text": "[1, 2, 3, 4, 5]"},
                        {"id": "C", "text": "[1, 2, 5, 3, 4]"},
                        {"id": "D", "text": "[1, 2, 4, 5, 3]"},
                    ],
                    "explanation": "注意：選擇排序某些輪次可能不執行 swap（當 min_idx == i 時）。確認每輪未排序區的起點與最小值位置，再判斷是否真的發生交換，否則容易在第三輪起點算錯。",
                },
                "en": {
                    "title": "After three rounds of Selection Sort on `[4, 2, 5, 1, 3]` (i from 0 to 2), what is the array state?",
                    "options": [
                        {"id": "A", "text": "[1, 2, 3, 5, 4]"},
                        {"id": "B", "text": "[1, 2, 3, 4, 5]"},
                        {"id": "C", "text": "[1, 2, 5, 3, 4]"},
                        {"id": "D", "text": "[1, 2, 4, 5, 3]"},
                    ],
                    "explanation": "Watch out: Selection Sort may skip a swap in certain rounds (when min_idx == i). For each round, determine the unsorted region's starting point and the position of its minimum, then decide whether a swap actually happens before updating the array state. Getting the round-2 outcome wrong will cascade to round 3.",
                },
            },
        },
        {
            "id": "ssort-pred-1",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 250(L3 多步狀態+行號追蹤) + 250(複合：迴圈出口+條件判斷+交換) = 1450
            "baseRating": 1450,
            "correctAnswer": "1 2 3 4 5 6 7 8 9 5 6 7 8 10 11 3 4 5 6 7 8 10 12",
            "code": SSORT_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[3, 1, 2]` 呼叫 `selection_sort([3, 1, 2])`，請依序寫出每次被執行到的行號（以空格分隔）。",
                    "options": [],
                    "explanation": "追蹤提示：for 迴圈每次「迭代條件判斷」也算執行一行（含結束時的最後一次判斷）。外層兩輪共需兩次 swap（L11 各執行一次）。內層每輪從 current_pos+1 掃到末尾，注意掃描過程中 L9 只在找到更小值時才執行。依照上述規則逐行追蹤即可。",
                },
                "en": {
                    "title": "Calling `selection_sort([3, 1, 2])` on `[3, 1, 2]`, write the line numbers executed in order (space-separated).",
                    "options": [],
                    "explanation": "Tracing tip: each 'loop condition check' for a for-loop counts as executing that line, including the final check when the loop exits. The outer loop runs two rounds, and L11 (swap) executes once per round. The inner loop scans from current_pos+1 to the end each round; L9 only executes when a smaller value is actually found. Follow these rules line-by-line to build the sequence.",
                },
            },
        },
        {
            "id": "ssort-q23",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較情境) + 100(新手誤區：常誤以為已排序就會早結束) = 1050
            "baseRating": 1050,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "氣泡排序常用「沒發生交換就 break」做早期終止，為什麼選擇排序無法以類似方式提早結束？",
                    "options": [
                        {"id": "A", "text": "若某輪 min_idx == i（不交換），代表剩下的元素都已有序，可以直接 break"},
                        {"id": "B", "text": "只要連續兩輪都沒發生交換，就能確認排序已完成，應立即終止"},
                        {"id": "C", "text": "選擇排序必須掃完未排序區才能確定最小值的位置，無法在掃描過程中得知陣列「已經有序」，因此沒有可信賴的提早終止訊號"},
                        {"id": "D", "text": "選擇排序的比較次數固定，因此提早 break 會漏掉必要的比較，導致結果錯誤"},
                    ],
                    "explanation": "氣泡排序透過「本輪是否發生交換」推斷剩下是否已有序，這個訊號在掃描中就能取得。選擇排序的內層只負責找最小值索引，必須走完整輪才能知道結果，過程中沒有任何能宣告「整體已有序」的線索；即便整輪 min_idx==i 也只代表「該輪最小值剛好在前端」，不代表後面已有序。",
                },
                "en": {
                    "title": "Bubble Sort uses 'break if no swap happened' to terminate early. Why can Selection Sort not be similarly short-circuited?",
                    "options": [
                        {"id": "A", "text": "If a round has min_idx == i (no swap), it means the remaining elements are already sorted and we can break immediately"},
                        {"id": "B", "text": "If two consecutive rounds have no swap, sorting is complete and the loop can terminate"},
                        {"id": "C", "text": "Selection Sort must scan the entire unsorted region to determine the minimum position, so it has no reliable signal mid-scan that the array is already sorted"},
                        {"id": "D", "text": "Selection Sort's comparison count is fixed, so an early break would skip necessary comparisons and produce wrong results"},
                    ],
                    "explanation": "Bubble Sort's 'did any swap happen this round' is a reliable signal collected during scanning. Selection Sort's inner loop only tracks the min index — it has to finish a full scan to know anything, and even min_idx==i for one round only means 'the minimum of this round happens to sit at the front', not that the rest is sorted.",
                },
            },
        },
        {
            "id": "ssort-q24",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 跨演算法場景辨識) + 150(邊界：時間複雜度以外的取捨因素) = 1250
            "baseRating": 1250,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在以下哪個情境中，使用選擇排序最為合適？",
                    "options": [
                        {"id": "A", "text": "對 100 萬筆隨機整數排序，需要最快的平均時間"},
                        {"id": "B", "text": "在嵌入式裝置上排序少量資料 (n ≤ 30)，且儲存媒體寫入成本極高（如 EEPROM 有寫入次數壽命限制）"},
                        {"id": "C", "text": "資料幾乎已排序，僅有少數元素位置錯誤，希望快速完成排序"},
                        {"id": "D", "text": "需要穩定排序，保持相同數值元素的原始相對順序"},
                    ],
                    "explanation": "選擇排序的兩大優勢：1) O(1) 空間，適合記憶體受限的嵌入式環境；2) 每輪最多一次實體交換（總交換 ≤ n-1），適合寫入成本高的媒體。A 應該用快速排序；C 應該用插入排序（接近 O(n)）；D 應該用合併排序或插入排序（穩定）。B 完全對應其優勢場景。",
                },
                "en": {
                    "title": "In which scenario is Selection Sort most appropriate?",
                    "options": [
                        {"id": "A", "text": "Sorting 1 million random integers, where average-case speed is critical"},
                        {"id": "B", "text": "Sorting a small dataset (n ≤ 30) on an embedded device where storage media writes are expensive (e.g. EEPROM with limited write endurance)"},
                        {"id": "C", "text": "Data that's almost sorted with only a few elements misplaced, where fast completion is desired"},
                        {"id": "D", "text": "A scenario requiring a stable sort that preserves the relative order of equal-valued elements"},
                    ],
                    "explanation": "Selection Sort's two main advantages: 1) O(1) extra space, ideal for memory-constrained embedded contexts; 2) at most one physical swap per round (≤ n-1 swaps total), ideal for media with expensive writes. A → use Quick Sort; C → use Insertion Sort (near O(n)); D → use Merge Sort or Insertion Sort (stable). B matches Selection Sort's strengths perfectly.",
                },
            },
        },
        {
            "id": "ssort-q25",
            "type": "fill-code",
            "code": SSORT_DESC_FILL_CODE,
            "language": "python",
            # baseRating = 800 + 150(FC) + 150(L2 單步追蹤+語意對應) + 100(新手誤區：>/< 方向+變數命名語意翻轉) = 1200
            "baseRating": 1200,
            "correctAnswer": [">", "target_idx", "i"],
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成「降序」選擇排序 `selection_sort_descending` 函式。",
                    "options": [],
                    "explanation": "降序的邏輯與升序對稱：把「每輪找最小值」改為「每輪找最大值」，只需調整內層比較符號；swap 的兩端仍是「未排序區首位」與「已找到的極值位置」，順序一樣。注意變數名稱 target_idx 在這裡記錄的是當前最大值的索引。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the descending Selection Sort function `selection_sort_descending`.",
                    "options": [],
                    "explanation": "Descending logic is symmetric to ascending: change 'find minimum each round' to 'find maximum each round' by adjusting the inner comparison operator. The two sides of the swap remain 'first position of the unsorted region' and 'the index of the found extreme', same as before. Note that target_idx here tracks the index of the current maximum.",
                },
            },
        },
        {
            "id": "ssort-q26",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 多輪交換次數歸納推演) + 150(邊界：完全逆序但實際交換次數遠少於 n-1) = 1400
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對長度為 6 的完全逆序陣列 `[6, 5, 4, 3, 2, 1]` 執行選擇排序，總共會發生幾次「實際交換」？",
                    "options": [
                        {"id": "A", "text": "5 次（n-1）"},
                        {"id": "B", "text": "3 次"},
                        {"id": "C", "text": "6 次"},
                        {"id": "D", "text": "15 次"},
                    ],
                    "explanation": "關鍵：選擇排序每輪只在 min_idx != i 時才真正交換。逆序陣列的前幾輪確實會發生 swap，但隨著兩端同時歸位，中段會比你預期的早就「剛好有序」，讓後續輪次跳過交換。建議逐輪追蹤並記錄每輪交換後的陣列狀態，直到找到規律為止。",
                },
                "en": {
                    "title": "Performing Selection Sort on the fully reversed array `[6, 5, 4, 3, 2, 1]` of length 6, how many actual swaps occur in total?",
                    "options": [
                        {"id": "A", "text": "5 (i.e. n-1)"},
                        {"id": "B", "text": "3"},
                        {"id": "C", "text": "6"},
                        {"id": "D", "text": "15"},
                    ],
                    "explanation": "Key: Selection Sort only swaps when min_idx != i. In a reversed array, the first few rounds do swap, but as both ends get placed, the middle portion becomes 'already in order' sooner than you'd expect, causing later rounds to skip their swaps. Trace round-by-round, recording the array state after each swap, until you see the pattern.",
                },
            },
        },
        {
            "id": "ssort-q27",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 演算法結構改造+穩定性分析) + 150(邊界：理解為何 swap 必然破壞穩定性) = 1400
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "若要讓選擇排序變成「穩定排序」，下列哪個修改方向最合理？",
                    "options": [
                        {"id": "A", "text": "在找到相等元素時，優先選擇索引較小的那個（即保留「先遇到的就是最小者」的邏輯），不需改動 swap"},
                        {"id": "B", "text": "讓 if 條件改為 `arr[j] <= arr[min_idx]`（嚴格小於改為小於等於），使相同值的後者也會更新 min_idx"},
                        {"id": "C", "text": "捨棄直接交換，改為將最小值「插入」到未排序區前端，把中間元素逐一向右平移一格，類似插入排序的搬移方式"},
                        {"id": "D", "text": "改為找最大值放到末端（從右往左排），方向改變後等值元素的相對順序自然正確"},
                    ],
                    "explanation": "選擇排序不穩定的根因：當我們把未排序區最小值與前端 swap 時，前端那個元素被「丟到後面」，可能跨越其他與它同值的元素，破壞了原相對順序。要保持穩定，必須避免長距離 swap，改用「平移歸位」：把 min_idx 處的最小值取出，將 [i, min_idx-1] 區段全部右移一格，再把最小值放回 i。B 只是讓相同值的後者也更新 min_idx，仍然保留長距離 swap，甚至更容易改變相等元素的相對順序。",
                },
                "en": {
                    "title": "To make Selection Sort 'stable', which modification direction is most reasonable?",
                    "options": [
                        {"id": "A", "text": "When equal elements are found, prefer the one with the smaller index (i.e. keep 'first encountered = minimum' semantics), without changing the swap logic"},
                        {"id": "B", "text": "Change the condition to `arr[j] <= arr[min_idx]` (strict less-than becomes less-than-or-equal), so later equal elements also update min_idx"},
                        {"id": "C", "text": "Abandon the direct swap; instead 'insert' the minimum at the front of the unsorted region by shifting the in-between elements one slot to the right, similar to Insertion Sort's shifting"},
                        {"id": "D", "text": "Find the maximum and place it at the end (sort right-to-left); the changed direction naturally preserves the relative order of equal elements"},
                    ],
                    "explanation": "The root cause of instability: swapping the unsorted-region minimum with the front element flings the front element 'to the back', possibly crossing other equal-valued elements and breaking their original order. To stay stable, avoid long-distance swaps and shift instead: pop the min at min_idx, shift [i, min_idx-1] one slot right, then place the min at i. Option B only lets later equal values update min_idx; it keeps the long-distance swap and can make equal elements even more likely to change relative order.",
                },
            },
        },
        {
            "id": "ssort-q28",
            "type": "fill-code",
            "code": SSORT_KEY_FILL_CODE,
            "language": "python",
            # baseRating = 800 + 150(FC) + 400(L4 抽象化：泛型 key 函式對映原本索引比較) + 150(邊界：key 套用對象一致性) = 1500
            "baseRating": 1500,
            "correctAnswer": ["min_idx", "j", "min_idx"],
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成「依 key 函式排序」的泛型版本 `selection_sort_by_key`，使其能對 dict 或物件依某個鍵值排序。",
                    "options": [],
                    "explanation": "核心原則：比較時要讓 key() 套用在「同一個基準」上，才能正確找到最小值；swap 時要交換「整個物件」而非只更新 key。注意 min_idx 在迴圈中可能被更新，(a) 填入的索引必須反映「當前找到的最小值候選」，而非固定的起點。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the generic 'sort by key function' version `selection_sort_by_key` so it can sort dicts or objects by a chosen key.",
                    "options": [],
                    "explanation": "Core principle: key() must be applied to a consistent baseline so the minimum is found correctly; the swap must exchange the entire object, not just the key value. Note that min_idx may be updated inside the loop, so the index in slot (a) must reflect the current minimum candidate, not a fixed starting point.",
                },
            },
        },
        {
            "id": "ssort-q29",
            "type": "predict-line",
            "code": SSORT_PREDICT_CODE,
            "language": "python",
            # baseRating = 800 + 150(PL) + 250(L3 多步行號追蹤) + 150(邊界：已排序輸入 → L11 永不執行) = 1350
            "baseRating": 1350,
            "correctAnswer": "1 2 3 4 5 6 7 8 5 6 7 8 5 10 3 4 5 6 7 8 5 10 3 12",
            "translations": {
                "zh-TW": {
                    "title": "對已排序的陣列 `[1, 2, 3]` 呼叫 `selection_sort([1, 2, 3])`，請依序寫出每次被執行到的行號（以空格分隔）。",
                    "options": [],
                    "explanation": "提示：已排序輸入時 min_pos 永遠等於 current_pos，因此 L11 始終不執行。選擇排序沒有提早終止機制，兩輪外層迴圈都會完整走完。只需釐清 for 迴圈的行號執行順序（含最後一次「跳出」的條件檢查行），就能建立完整序列。",
                },
                "en": {
                    "title": "Calling `selection_sort([1, 2, 3])` on the already-sorted array `[1, 2, 3]`, write the line numbers executed in order (space-separated).",
                    "options": [],
                    "explanation": "Hint: on already-sorted input, min_pos always equals current_pos, so L11 never executes. Selection Sort has no early termination — both outer-loop rounds run to completion. You just need to understand the order in which a for-loop executes its lines (including the final condition-check line that exits the loop) to build the full sequence.",
                },
            },
        },
        {
            "id": "ssort-q30",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 跨演算法效能對照分析) + 150(邊界：交換成本 vs 比較成本的權衡判斷) = 1400
            "baseRating": 1400,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "假設我們要在「比較成本極低、但每次交換的成本是比較成本的 1000 倍」的環境中排序，下列哪個說法最合理？",
                    "options": [
                        {"id": "A", "text": "氣泡排序最適合，因為它能提早終止（已排序時不再交換），避免無謂浪費"},
                        {"id": "B", "text": "插入排序最適合，因為它在近乎有序時很快，且元素搬移次數可接近 O(n)"},
                        {"id": "C", "text": "快速排序最適合，因為平均 O(n log n) 的比較次數最少，總成本由比較主導"},
                        {"id": "D", "text": "選擇排序最適合：雖然比較次數固定為 O(n²)，但實際交換次數最多 n-1；在資料量不大且寫入成本遠高於讀取成本時，總成本通常優於高搬移量的排序法"},
                    ],
                    "explanation": "在寫入成本遠大於比較成本的場景，關鍵指標是「交換/搬移次數」而非比較次數。思考各演算法在最壞情況下的寫入次數，再結合 1000 倍的成本差距，判斷哪個的「交換 × 成本」項最小。注意 A 和 B 的干擾點都有一定道理——試著用具體例子反駁它們。",
                },
                "en": {
                    "title": "Suppose we sort in an environment where comparisons are very cheap but each swap costs 1000× a comparison. Which statement is most reasonable?",
                    "options": [
                        {"id": "A", "text": "Bubble Sort is best because it can terminate early (no swaps when sorted), avoiding unnecessary cost"},
                        {"id": "B", "text": "Insertion Sort is best because it's fast on nearly-sorted input and can achieve close to O(n) element shifts"},
                        {"id": "C", "text": "Quick Sort is best because its average O(n log n) comparison count is lowest, making comparisons dominate total cost"},
                        {"id": "D", "text": "Selection Sort is best: although comparisons are fixed at O(n²), the actual swap count is at most n-1; for modest input sizes with very expensive writes, it often beats algorithms with many moves"},
                    ],
                    "explanation": "When write cost far exceeds comparison cost, the key metric is swap/move count, not comparison count. Think through each algorithm's worst-case write count, apply the 1000× cost multiplier, and find which one minimizes the 'swaps × cost' term. Note that options A and B each have a grain of truth — try to construct a specific counterexample to rule them out.",
                },
            },
        },
    ],
}

BSORT_SIMPLIFIED_CODE = """\
def bubble_sort_simplified(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                # 交換元素
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr"""

BSORT_OPTIMIZED_FILL_CODE = """\
def bubble_sort_optimized(arr):
    n = len(arr)
    for i in range(n - 1):
        (a) = False
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                (b) = True
        if not (c):
            break
    return arr"""

BSORT_DESC_FILL_CODE = """\
def bubble_sort_descending(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if arr[j] (a) arr[j + 1]:      # 注意遞減的需求
                arr[j], arr[j+1] = arr[j+1], (b)
    return (c)"""

BSORT_PREDICT_CODE = """\
def bubble_sort(collection):                           # L1
    total_items = len(collection)                      # L2
    for round in range(total_items - 1):               # L3
        has_swapped = False                            # L4
        unsorted_range = total_items - 1 - round       # L5
        for index in range(unsorted_range):            # L6
            if collection[index] > collection[index+1]:# L7
                collection[index], collection[index+1] = collection[index+1], collection[index] # L8
                has_swapped = True                     # L9
        if not has_swapped:                            # L10
            break                                      # L11
    return collection                                  # L12"""

BSORT_BACKWARD_FILL_CODE = """\
def bubble_sort_backward(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - 1, i, -1):
            if arr[j] (a) arr[j - 1]:
                arr[j], arr[j - 1] = (b), arr[j]
    return (c)"""

BSORT_WRONG_BACKWARD_CODE = """\
def bubble_sort_wrong_backward(arr):                  # L1
    n = len(arr)                                      # L2
    for i in range(n - 1):                            # L3
        for j in range(n - 1, i, -1):                 # L4
            if arr[j] > arr[j + 1]:                   # L5
                arr[j], arr[j + 1] = arr[j + 1], arr[j] # L6
    return arr                                        # L7"""

DATA = {
    "slug": "bubble-sort",
    "groups": [
        {
            "id": "bubble-sort-group-1",
            "translations": {
                "zh-TW": {
                    "title": "題組：泡沫排序的單輪過程",
                    "description": "泡沫排序的核心機制是透過不斷比較並交換相鄰元素，每一輪 (Round) 都能將該輪最大（或最小）的元素「浮」到陣列的末端。請觀察這段過程並回答問題。",
                },
                "en": {
                    "title": "Group: A Single Round of Bubble Sort",
                    "description": "The core mechanism of Bubble Sort is to repeatedly compare and swap adjacent elements, so that the largest (or smallest) element 'bubbles' to the end of the array each round. Observe this process and answer the questions.",
                },
            },
            "code": BSORT_SIMPLIFIED_CODE,
            "language": "python",
        }
    ],
    "questions": [
        # 【Basic 基礎】 800-950
        {
            "id": "bubble-sort-q1",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一定義) + 0(直觀) = 900
            "baseRating": 900,
            "options": [
                {"id": "A", "text": "因為每次只交換相鄰兩格，移動軌跡像泡沫破裂"},
                {"id": "B", "text": "因為較大（或較小）的元素會像水中的氣泡一樣，逐漸「浮」到陣列的頂端（末端）"},
                {"id": "C", "text": "因為它是最早被命名的排序演算法之一"},
                {"id": "D", "text": "因為它會把資料分層，像泡沫的多層結構"},
            ],
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "泡沫排序 (Bubble Sort) 的名稱由來是什麼？",
                    "options": [
                        {"id": "A", "text": "因為每次只交換相鄰兩格，移動軌跡像泡沫破裂"},
                        {"id": "B", "text": "因為較大（或較小）的元素會像水中的氣泡一樣，逐漸「浮」到陣列的頂端（末端）"},
                        {"id": "C", "text": "因為它是最早被命名的排序演算法之一"},
                        {"id": "D", "text": "因為它會把資料分層，像泡沫的多層結構"},
                    ],
                    "explanation": "泡沫排序的核心特徵是：每一輪都會將當前未排序部分的最大值（如果是遞增排序），透過不斷與右邊相鄰元素交換，一路推擠到陣列的最右側。",
                },
                "en": {
                    "title": "Where does the name 'Bubble Sort' come from?",
                    "options": [
                        {"id": "A", "text": "Because each swap moves only adjacent cells, making the movement path look like bubbles popping"},
                        {"id": "B", "text": "Because larger (or smaller) elements gradually 'bubble up' to the top (end) of the array like air bubbles in water"},
                        {"id": "C", "text": "Because it was one of the earliest sorting algorithms to receive a name"},
                        {"id": "D", "text": "Because it layers data like the multi-layer structure of foam"},
                    ],
                    "explanation": "The key characteristic of Bubble Sort is that each round pushes the current maximum value (for ascending order) all the way to the rightmost position by repeatedly swapping it with the adjacent element to the right.",
                },
            },
        },
        {
            "id": "bubble-sort-q2",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 單一定義) + 0(直觀) = 850
            "baseRating": 850,
            "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "在泡沫排序中，我們主要透過「比較並交換相鄰的兩個元素」來達成排序的目的。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "沒錯。泡沫排序每次都只看相鄰的兩個元素（例如 index j 和 index j+1），如果它們的順序錯了（例如前面的比後面的大），就把它們對調。",
                },
                "en": {
                    "title": "In Bubble Sort, the sorting is achieved by repeatedly comparing and swapping adjacent elements.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Correct. Bubble Sort only looks at two adjacent elements at a time (e.g., index j and j+1), and swaps them if they are out of order.",
                },
            },
        },
        {
            "id": "bubble-sort-q3",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 50(視覺/相似度干擾) = 950
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "泡沫排序是一種「穩定排序 (Stable Sort)」嗎？（穩定排序指的是：數值相同的元素，在排序後會保持原本的相對順序）",
                    "options": [
                        {"id": "A", "text": "是，因為我們只有在「嚴格大於 (>)」時才交換，相等時不交換"},
                        {"id": "B", "text": "否，因為元素會在陣列中不斷跳躍移動"},
                        {"id": "C", "text": "不一定，取決於陣列原本的資料分佈"},
                        {"id": "D", "text": "只有當陣列完全反向時才是穩定的"},
                    ],
                    "explanation": "穩定性的判定只看相等元素相遇時會不會交換。解題時請對照程式碼中相等情況的行為，而不是只看大小不同時會如何交換。",
                },
                "en": {
                    "title": "Is Bubble Sort a 'Stable Sort'? (A stable sort preserves the relative order of elements with equal values.)",
                    "options": [
                        {"id": "A", "text": "Yes, because we only swap when strictly greater than (>), not on equality"},
                        {"id": "B", "text": "No, because elements keep jumping around the array"},
                        {"id": "C", "text": "It depends on the data distribution"},
                        {"id": "D", "text": "Only when the array is completely reversed"},
                    ],
                    "explanation": "Stability is decided by whether equal elements swap when they meet. Compare that equal-value case with the code behavior, rather than focusing only on swaps between different values.",
                },
            },
        },
        {
            "id": "bubble-sort-q4",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 50(L1 單一理論) + 50(視覺/相似度干擾) = 900
            "baseRating": 900,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "即使一個陣列已經是完全排序好的狀態，最原始的泡沫排序（未加入提早終止優化）依然會執行所有回合的比較。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。未優化的泡沫排序有固定的兩層迴圈，即使陣列一開始就排好了（不會發生任何交換），它還是會傻傻地把所有比較動作做完，時間複雜度仍是 O(n²)。因此實務上通常會加入 `has_swapped` 旗標來優化。",
                },
                "en": {
                    "title": "Even if an array is already fully sorted, the basic Bubble Sort (without early termination) will still perform all comparison rounds.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Correct. The unoptimized version has fixed nested loops and will complete all comparisons even if no swaps occur, resulting in O(n²) time. This is why the `has_swapped` flag optimization is commonly added.",
                },
            },
        },
        {
            "id": "bubble-sort-q5",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 語法特性) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "教學區的 Python 程式碼中，用來交換兩個變數值的簡潔寫法是什麼？",
                    "options": [
                        {"id": "A", "text": "arr[j], arr[j+1] = arr[j+1], arr[j+1]"},
                        {"id": "B", "text": "arr[j], arr[j+1] = arr[j+1], arr[j]"},
                        {"id": "C", "text": "arr[j] = arr[j+1]; arr[j+1] = arr[j]"},
                        {"id": "D", "text": "temp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = temp"},
                    ],
                    "explanation": "Python 支援多重賦值 (Multiple Assignment)，`a, b = b, a` 是 Python 中非常經典且優雅的交換變數寫法，不需要額外宣告 temp 暫存變數。",
                },
                "en": {
                    "title": "What is the concise Python syntax used in the tutorial to swap two variable values?",
                    "options": [
                        {"id": "A", "text": "arr[j], arr[j+1] = arr[j+1], arr[j+1]"},
                        {"id": "B", "text": "arr[j], arr[j+1] = arr[j+1], arr[j]"},
                        {"id": "C", "text": "arr[j] = arr[j+1]; arr[j+1] = arr[j]"},
                        {"id": "D", "text": "temp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = temp"},
                    ],
                    "explanation": "Python supports multiple assignment, so `a, b = b, a` is a classic and elegant way to swap two variables without needing a temporary variable.",
                },
            },
        },
        {
            "id": "bubble-sort-q6",
            "groupId": "bubble-sort-group-1",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 0(直觀) = 1100
            "baseRating": 1100,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "給定陣列 arr = [5, 1, 4, 2, 8]。執行「第一輪 (i = 0)」的完整泡沫排序後，陣列會變成什麼樣子？",
                    "options": [
                        {"id": "A", "text": "[1, 4, 2, 5, 8]"},
                        {"id": "B", "text": "[1, 5, 4, 2, 8]"},
                        {"id": "C", "text": "[1, 2, 4, 5, 8]"},
                        {"id": "D", "text": "[8, 5, 4, 2, 1]"},
                    ],
                    "explanation": "第一輪會沿著陣列由左往右檢查相鄰元素，讓目前未排序範圍中的最大值一路被推向最右端。解題時可先鎖定最大值最後的位置，再回頭確認沿途交換後的相對順序。",
                },
                "en": {
                    "title": "Given arr = [5, 1, 4, 2, 8]. After completing the first round (i = 0) of Bubble Sort, what does the array look like?",
                    "options": [
                        {"id": "A", "text": "[1, 4, 2, 5, 8]"},
                        {"id": "B", "text": "[1, 5, 4, 2, 8]"},
                        {"id": "C", "text": "[1, 2, 4, 5, 8]"},
                        {"id": "D", "text": "[8, 5, 4, 2, 1]"},
                    ],
                    "explanation": "The first round scans adjacent pairs from left to right and pushes the maximum value in the unsorted range to the far right. Start by locating that final maximum position, then verify the relative order left behind by the swaps.",
                },
            },
        },
        {
            "id": "bubble-sort-q7",
            "groupId": "bubble-sort-group-1",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 50(視覺/相似度干擾) = 950
            "baseRating": 950,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "承上題，在執行「第二輪 (i = 1)」的內層迴圈時，我們還需要去比較最後一個元素（即數值 8）嗎？",
                    "options": [
                        {"id": "A", "text": "需要，因為交換可能讓 8 不再是最大值"},
                        {"id": "B", "text": "需要，否則第二輪可能漏掉某個逆序對"},
                        {"id": "C", "text": "不需要，因為每一輪都會將當前最大值就定位，內層比較的範圍會逐漸縮小"},
                        {"id": "D", "text": "不需要，因為內層只會跑到 n - 2，8 本來就不會被讀到"},
                    ],
                    "explanation": "泡沫排序每一輪結束時，都會有一個最大值「浮」到正確的位置。因此第二輪時，最後一個元素已經是全陣列最大，不需要再被比較。這反映在程式碼 `range(n - 1 - i)` 中，每次比較的長度都會減 1。",
                },
                "en": {
                    "title": "Continuing from the previous question, in the second round (i = 1), do we need to compare the last element (value 8)?",
                    "options": [
                        {"id": "A", "text": "Yes, because swaps might make 8 no longer the maximum"},
                        {"id": "B", "text": "Yes, otherwise the second round might miss an inversion"},
                        {"id": "C", "text": "No, because each round places the current maximum in its correct position, shrinking the comparison range"},
                        {"id": "D", "text": "No, because the inner loop only runs to n - 2, so 8 is never read"},
                    ],
                    "explanation": "After each round of Bubble Sort, one maximum value is placed in its correct position. So in round 2, the last element is already confirmed as the largest and doesn't need to be compared again. This is reflected in `range(n - 1 - i)`, which reduces the comparison range by 1 each round.",
                },
            },
        },
        {
            "id": "bubble-sort-q8",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對於長度為 n 的陣列，簡化版泡沫排序的外層迴圈為什麼通常只需要 `range(n - 1)`？",
                    "options": [
                        {"id": "A", "text": "因為第 0 輪不會進行任何比較"},
                        {"id": "B", "text": "因為每輪至少固定一個極值，剩最後一個元素時自然就定位"},
                        {"id": "C", "text": "因為內層迴圈已經比較了所有可能的元素配對"},
                        {"id": "D", "text": "因為 Python 的 `range` 會自動少跑一次以避免越界"},
                    ],
                    "explanation": "外層迴圈控制「回合數」。對於 n 個元素，最多只需要 n - 1 輪：每一輪至少確認一個最大值就位，經過 n - 1 輪後前 n - 1 個元素都排好，剩下最後一個自然也在正確位置，不需要第 n 輪。`range(n - 1)` 即對應此邏輯。",
                },
                "en": {
                    "title": "For an array of length n, why does simplified Bubble Sort usually use `range(n - 1)` for the outer loop?",
                    "options": [
                        {"id": "A", "text": "Because round 0 performs no comparisons"},
                        {"id": "B", "text": "Because each round fixes at least one extreme value, and the final remaining element is automatically placed"},
                        {"id": "C", "text": "Because the inner loop has already compared every possible pair"},
                        {"id": "D", "text": "Because Python `range` automatically runs one fewer step to avoid out-of-bounds access"},
                    ],
                    "explanation": "The outer loop controls the number of rounds. For n elements, at most n - 1 rounds are needed: each round places at least one maximum in its correct position, so after n - 1 rounds, the first n - 1 elements are sorted and the last one is automatically correct.",
                },
            },
        },
        {
            "id": "bubble-sort-q9",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 0(直觀) = 900
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "為什麼教學區的優化版泡沫排序要加入 `has_swapped = False` 這個變數？",
                    "options": [
                        {"id": "A", "text": "為了追蹤總共交換了幾次，方便計算效能"},
                        {"id": "B", "text": "這是一個語法要求，否則會報錯"},
                        {"id": "C", "text": "用來檢查某一輪中是否發生過交換。如果一整輪都沒交換，代表陣列已完全排序，可以提早結束迴圈 (Break)"},
                        {"id": "D", "text": "用來防止出現無限迴圈"},
                    ],
                    "explanation": "這類優化會觀察一輪掃描中是否曾發生狀態改變。若整段流程都沒有改變陣列，代表後續重複掃描不會再帶來新資訊，因此可以提早停止。",
                },
                "en": {
                    "title": "Why does the optimized Bubble Sort in the tutorial introduce the variable `has_swapped = False`?",
                    "options": [
                        {"id": "A", "text": "To track the total number of swaps for performance analysis"},
                        {"id": "B", "text": "It is a syntax requirement, otherwise an error occurs"},
                        {"id": "C", "text": "To check whether any swap occurred in a round. If no swaps happen in a full round, the array is sorted and the loop can break early"},
                        {"id": "D", "text": "To prevent infinite loops"},
                    ],
                    "explanation": "This optimization watches whether a full scan changes the array state. If a pass makes no change, repeated scans will not add new information, so the algorithm can stop early.",
                },
            },
        },
        {
            "id": "bubble-sort-q10",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 0(直觀) = 950
            "baseRating": 950,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "加入「提前終止 (has_swapped)」優化後，泡沫排序的「最佳情況 (Best Case)」時間複雜度會變成多少？",
                    "options": [
                        {"id": "A", "text": "O(n log n)"},
                        {"id": "B", "text": "O(n - 1)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "當陣列已經是排序好的狀態時（最佳情況），優化版的演算法只需要跑完「第一輪」的比較（共 n-1 次），發現 `has_swapped` 仍是 False，就會立刻結束。因此最佳時間複雜度為 O(n)。",
                },
                "en": {
                    "title": "After adding the early-termination optimization (`has_swapped`), what is the best-case time complexity of Bubble Sort?",
                    "options": [
                        {"id": "A", "text": "O(n log n)"},
                        {"id": "B", "text": "O(n - 1)"},
                        {"id": "C", "text": "O(n)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "When the array is already sorted (best case), the optimized algorithm only needs to complete one round of n-1 comparisons, finds `has_swapped` still False, and terminates immediately. So the best-case time complexity is O(n).",
                },
            },
        },
        {
            "id": "bubble-sort-q11",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 100(新手誤區) = 1050
            "baseRating": 1050,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若將泡沫排序的比較條件由「嚴格大於 (`arr[j] > arr[j+1]`)」改為「大於等於 (`arr[j] >= arr[j+1]`)」，會對演算法產生什麼影響？",
                    "options": [
                        {"id": "A", "text": "排序速度變快，因為交換次數增加"},
                        {"id": "B", "text": "排序結果不變，但演算法將失去「穩定排序 (Stable Sort)」的特性"},
                        {"id": "C", "text": "會導致程式進入無限迴圈"},
                        {"id": "D", "text": "不會有任何影響，穩定性與結果皆相同"},
                    ],
                    "explanation": "這題的判斷重點在「相等元素」而非大小不同的元素。穩定性取決於相等值在排序過程中是否可能改變原本相對順序，因此要特別檢查新條件遇到相等值時會做什麼。",
                },
                "en": {
                    "title": "If the comparison in Bubble Sort is changed from strict greater-than (`arr[j] > arr[j+1]`) to greater-than-or-equal (`arr[j] >= arr[j+1]`), what is the effect?",
                    "options": [
                        {"id": "A", "text": "Sorting becomes faster because there are more swaps"},
                        {"id": "B", "text": "The sort result is unchanged, but the algorithm loses the 'Stable Sort' property"},
                        {"id": "C", "text": "The program will enter an infinite loop"},
                        {"id": "D", "text": "No effect — stability and result remain the same"},
                    ],
                    "explanation": "The key is equal elements, not elements with different values. Stability depends on whether equal values can change their original relative order during sorting, so check what the new condition does when two adjacent values are equal.",
                },
            },
        },
        {
            "id": "bubble-sort-q12",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 50(L1 單一理論) + 50(視覺/相似度干擾) = 1000
            "baseRating": 1000,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "關於泡沫排序的複雜度，以下哪些敘述是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "最壞情況時間複雜度為 O(n²)"},
                        {"id": "opt2", "text": "平均情況時間複雜度為 O(n²)"},
                        {"id": "opt3", "text": "空間複雜度為 O(1)（In-place 排序）"},
                        {"id": "opt4", "text": "空間複雜度為 O(log n)，因為遞迴呼叫會使用 call stack"},
                    ],
                    "explanation": "判斷複雜度時，先分開看時間與空間：時間由相鄰比較的輪數主導；空間則看是否建立與輸入規模成長的額外結構，或只是使用少量固定變數。",
                },
                "en": {
                    "title": "Which of the following statements about Bubble Sort complexity are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Worst-case time complexity is O(n²)"},
                        {"id": "opt2", "text": "Average-case time complexity is O(n²)"},
                        {"id": "opt3", "text": "Space complexity is O(1) (in-place sorting)"},
                        {"id": "opt4", "text": "Space complexity is O(log n) because recursive calls use the call stack"},
                    ],
                    "explanation": "When judging complexity, separate time from space. Time is driven by rounds of adjacent comparisons; space depends on whether the algorithm creates extra structures that grow with input size, or only uses a few fixed variables.",
                },
            },
        },
        {
            "id": "bubble-sort-q13",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(新手誤區) = 1200
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "如果一個長度為 5 的陣列 arr = [5, 4, 3, 2, 1]（完全反向排序），使用泡沫排序將其排為遞增，總共會發生幾次「交換 (Swap)」？",
                    "options": [
                        {"id": "A", "text": "5 次"},
                        {"id": "B", "text": "10 次"},
                        {"id": "C", "text": "15 次"},
                        {"id": "D", "text": "20 次"},
                    ],
                    "explanation": "完全反向時，每一對原本在左、但值較大的元素都形成逆序。泡沫排序一次相鄰交換只能消除一個這樣的逆序，因此可從逆序對數量推得交換次數。",
                },
                "en": {
                    "title": "For the fully reversed array arr = [5, 4, 3, 2, 1] (length 5), how many swaps does Bubble Sort perform to sort it in ascending order?",
                    "options": [
                        {"id": "A", "text": "5"},
                        {"id": "B", "text": "10"},
                        {"id": "C", "text": "15"},
                        {"id": "D", "text": "20"},
                    ],
                    "explanation": "In a fully reversed array, every pair with the larger value on the left forms an inversion. Each adjacent swap removes one inversion, so the swap count can be derived by counting inversions.",
                },
            },
        },
        {
            "id": "bubble-sort-q14",
            "groupId": "bubble-sort-group-1",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 50(L1 單一理論) + 0(直觀) = 1000
            "baseRating": 1000,
            "code": BSORT_OPTIMIZED_FILL_CODE,
            "language": "python",
            "correctAnswer": ["has_swapped", "has_swapped", "has_swapped"],
            "translations": {
                "zh-TW": {
                    "title": "請填入優化版泡沫排序中 (a)(b)(c) 處缺失的「旗標變數」名稱（注意拼字）。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 每一輪開始前，必須將 has_swapped 重置為 False。(b) 如果在這輪中發生了任何一次交換，就將其設為 True。(c) 一輪結束後檢查，如果 not has_swapped（即整輪都沒交換），就代表陣列已排序完畢，可以 break。",
                },
                "en": {
                    "title": "Fill in the missing flag variable name at positions (a), (b), and (c) in the optimized Bubble Sort (mind the spelling).",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) At the start of each round, reset has_swapped to False. (b) If any swap occurs during the round, set it to True. (c) After the round, check: if not has_swapped (no swaps occurred), the array is sorted — break.",
                },
            },
        },
        {
            "id": "bubble-sort-q15",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 50(視覺/相似度干擾) = 950
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在泡沫排序中，內層迴圈的範圍通常寫為 `for j in range(n - 1 - i)`（i 為當前輪數）。為什麼要減去 `i`？",
                    "options": [
                        {"id": "A", "text": "因為前 i 個元素已經排好了，不需要再比"},
                        {"id": "B", "text": "因為後 i 個元素已經是最大的並排在正確位置上了，不需要再比"},
                        {"id": "C", "text": "因為前 i 個元素是已排好的最小值，不需要再比"},
                        {"id": "D", "text": "因為內層 `range` 不能使用變數作為上界"},
                    ],
                    "explanation": "每一輪泡沫排序都會把當前未排序部分的最大值推到最後面。經過 i 輪後，最後面就有 i 個元素是已經確認排序好的最大值，所以內層迴圈的比較範圍可以縮小，減去 i 能顯著減少不必要的比較，提升效能。",
                },
                "en": {
                    "title": "In Bubble Sort, the inner loop range is typically `for j in range(n - 1 - i)` (where i is the current round). Why subtract `i`?",
                    "options": [
                        {"id": "A", "text": "Because the first i elements are already sorted and don't need comparison"},
                        {"id": "B", "text": "Because the last i elements are the largest and already in their correct positions"},
                        {"id": "C", "text": "Because the first i elements are the smallest values already sorted"},
                        {"id": "D", "text": "Because the inner `range` cannot use a variable as its upper bound"},
                    ],
                    "explanation": "Each round of Bubble Sort pushes the current maximum to the end. After i rounds, the last i elements are already confirmed in place, so the inner loop can shrink its range. Subtracting i significantly reduces unnecessary comparisons.",
                },
            },
        },
        {
            "id": "bubble-sort-q16",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 100(L2 多重比較) + 100(新手誤區) = 1100
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "在實務的軟體開發中，我們通常不會使用泡沫排序法來處理大量資料。主要原因有哪些？（多選）",
                    "options": [
                        {"id": "opt1", "text": "因為 O(n²) 的時間複雜度，在資料量龐大時效率極低"},
                        {"id": "opt2", "text": "因為頻繁地在記憶體中進行相鄰元素的讀寫與交換，常數時間消耗大"},
                        {"id": "opt3", "text": "因為泡沫排序是一種不穩定的排序演算法"},
                        {"id": "opt4", "text": "因為多數語言內建的排序演算法（如 Python 的 Timsort，Java 的 Dual-Pivot Quicksort）效率遠高於泡沫排序"},
                    ],
                    "explanation": "實務上選排序演算法時，通常會同時評估漸進複雜度、常數成本、是否就地排序、穩定性，以及語言內建實作是否已針對真實資料做過優化。",
                },
                "en": {
                    "title": "In real-world software development, Bubble Sort is rarely used for large datasets. Which of the following are the main reasons? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "O(n²) time complexity makes it extremely inefficient for large data"},
                        {"id": "opt2", "text": "Frequent adjacent read/write/swap operations result in high constant-factor overhead"},
                        {"id": "opt3", "text": "Bubble Sort is an unstable sorting algorithm"},
                        {"id": "opt4", "text": "Built-in sorting algorithms in most languages (e.g., Python's Timsort, Java's Dual-Pivot Quicksort) are far more efficient"},
                    ],
                    "explanation": "In practice, choosing a sorting algorithm involves asymptotic complexity, constant factors, in-place behavior, stability, and whether the language's built-in implementation is already optimized for real-world data.",
                },
            },
        },
        {
            "id": "bubble-sort-q17",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 100(L2 動態想像) + 100(新手誤區) = 1150
            "baseRating": 1150,
            "code": BSORT_DESC_FILL_CODE,
            "language": "python",
            "correctAnswer": ["<", "arr[j]", "arr"],
            "translations": {
                "zh-TW": {
                    "title": "這是一個想要實作「遞減」排序（把最小的浮到最後面）的泡沫排序。請填入正確的比較運算子及變數，使其邏輯正確。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 要改成遞減排序，就必須把「較小」的數字往後推。如果左邊小於右邊，順序就錯了，需要交換，所以填 `<`。(b) Python 多重賦值的對應項，右側應為 `arr[j]`。(c) 排序完成後回傳陣列 `arr`。",
                },
                "en": {
                    "title": "This Bubble Sort implementation aims to sort in descending order (smallest bubbles to the end). Fill in the correct comparison operator and variables.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) For descending order, push smaller numbers to the back. If left < right, they're out of order — swap. So fill `<`. (b) The right-hand side of the Python tuple swap should be `arr[j]`. (c) Return the sorted array `arr`.",
                },
            },
        },
        {
            "id": "bubble-sort-q18",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1500
            "baseRating": 1500,
            "code": BSORT_PREDICT_CODE,
            "language": "python",
            "correctAnswer": "1 2 3 4 5 6 7 8 9 6 7 8 9 6 10 3 4 5 6 7 6 10 11 12",
            "translations": {
                "zh-TW": {
                    "title": "給定 collection = [3, 1, 2]，呼叫下方優化版 bubble_sort([3, 1, 2])。請依序填寫執行的行號序列（空格分隔）。",
                    "options": [],
                    "explanation": "這組輸入第一輪會發生交換，因此不會在第一輪後提早停止；第二輪沒有交換，才會在旗標檢查時中止。請同時追蹤內層回到 `for` 的行號與外層進入下一輪的行號。",
                },
                "en": {
                    "title": "Given collection = [3, 1, 2], calling the optimized bubble_sort([3, 1, 2]) below. Write the executed line-number sequence (space-separated).",
                    "options": [],
                    "explanation": "This input performs swaps in the first round, so it does not stop after that round. The second round has no swap and stops at the flag check. Track both returns to the inner `for` line and the outer loop's next-round line.",
                },
            },
        },
        {
            "id": "bubble-sort-q19",
            "type": "true-false",
            # baseRating = 800 + 0(TF) + 250(L3 多步狀態) + 100(新手誤區) = 1150
            "baseRating": 1150,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "若資料已經近乎排序完成，加入提早結束機制的泡沫排序可能接近 O(n) 表現，因此不一定完全沒有實用場景。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。泡沫排序不適合大量隨機資料，但若資料只少量錯位，`has_swapped` 可在無交換的回合提早中止，使表現接近線性走訪。",
                },
                "en": {
                    "title": "For nearly sorted data, Bubble Sort with early termination can approach O(n), so it is not completely useless in every practical scenario.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. Bubble Sort is poor for large random data, but when the data is only slightly out of order, `has_swapped` can stop after a no-swap round, approaching a linear scan.",
                },
            },
        },
        {
            "id": "bubble-sort-q20",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 100(新手誤區) = 1050
            "baseRating": 1050,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在記憶體極小、資料量也很小的微型控制器上，泡沫排序仍可能被接受的主因是什麼？",
                    "options": [
                        {"id": "A", "text": "它的最壞時間複雜度比 Quicksort 更好"},
                        {"id": "B", "text": "它可以原地排序，額外空間只需要 O(1)"},
                        {"id": "C", "text": "它的最壞情況比內建排序少很多分支預測失誤"},
                        {"id": "D", "text": "它對連續記憶體存取友善，cache 命中率高"},
                    ],
                    "explanation": "泡沫排序的時間效率不佳，但它直接在原陣列交換相鄰元素，只需要少量旗標或暫存變數，因此空間複雜度是 O(1)。",
                },
                "en": {
                    "title": "On a tiny microcontroller with very little memory and very small data, why might Bubble Sort still be acceptable?",
                    "options": [
                        {"id": "A", "text": "Its worst-case time complexity is better than Quicksort's"},
                        {"id": "B", "text": "It sorts in place and needs only O(1) extra space"},
                        {"id": "C", "text": "Its worst case has far fewer branch prediction misses than built-in sorting"},
                        {"id": "D", "text": "It is friendly to contiguous memory access and has high cache hit rates"},
                    ],
                    "explanation": "Bubble Sort is not time-efficient, but it swaps adjacent elements directly in the original array and only needs a few variables, so its extra space is O(1).",
                },
            },
        },
        {
            "id": "bubble-sort-q21",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(新手誤區) = 1200
            "baseRating": 1200,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "使用優化版泡沫排序處理 arr = [1, 3, 2, 4] 時，第一輪結束後 `has_swapped` 的值會是什麼？接著會發生什麼事？",
                    "options": [
                        {"id": "A", "text": "False，立刻 break"},
                        {"id": "B", "text": "False，但仍繼續下一輪"},
                        {"id": "C", "text": "True，因此不會在第一輪後 break"},
                        {"id": "D", "text": "True，因此排序結果會錯誤"},
                    ],
                    "explanation": "`has_swapped` 只要在某一輪中發生任何一次交換就會被打開。判斷它的值，可以轉換成判斷該輪掃描範圍內是否仍存在相鄰逆序。",
                },
                "en": {
                    "title": "When optimized Bubble Sort handles arr = [1, 3, 2, 4], what is `has_swapped` after the first round, and what happens next?",
                    "options": [
                        {"id": "A", "text": "False, so it breaks immediately"},
                        {"id": "B", "text": "False, but it still continues"},
                        {"id": "C", "text": "True, so it does not break after the first round"},
                        {"id": "D", "text": "True, so the final result is wrong"},
                    ],
                    "explanation": "`has_swapped` turns on if any swap occurs during a round. To determine its value, check whether the scanned range still contains any adjacent inversion.",
                },
            },
        },
        {
            "id": "bubble-sort-q22",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 250(L3 多步狀態) + 250(複合陷阱) = 1400
            "baseRating": 1400,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "關於泡沫排序常見版本差異，哪些敘述正確？（多選）",
                    "options": [
                        {"id": "opt1", "text": "向右推最大值版本會從左往右比較相鄰元素"},
                        {"id": "opt2", "text": "Backward 版本在已部分排序的資料上，提早終止觸發時機可能與 Upward 不同"},
                        {"id": "opt3", "text": "兩種方向的主要差異是走訪方向與比較/交換位置"},
                        {"id": "opt4", "text": "理解方向差異後，就可以沿用 Upward 的內層邊界而不必重推"},
                    ],
                    "explanation": "比較不同版本時，要分開看三件事：掃描方向、被推到邊界的極值，以及內層會讀取哪一側的相鄰索引。方向改變通常也會牽動邊界推導。",
                },
                "en": {
                    "title": "Which statements about common Bubble Sort version differences are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "The version that pushes the maximum rightward compares adjacent elements from left to right"},
                        {"id": "opt2", "text": "On partially sorted data, the Backward version may trigger early termination at a different time from the Upward version"},
                        {"id": "opt3", "text": "The main differences are traversal direction and where comparisons/swaps happen"},
                        {"id": "opt4", "text": "Once the direction difference is understood, the Upward inner-loop boundary can be reused without re-deriving it"},
                    ],
                    "explanation": "When comparing versions, separate three ideas: scan direction, which extreme value moves to a boundary, and which adjacent index the inner loop reads. Changing direction usually changes the boundary reasoning too.",
                },
            },
        },
        {
            "id": "bubble-sort-q23",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若內層會讀取 `arr[j]` 與 `arr[j + 1]`，為什麼常見邊界是 `range(n - 1 - i)` 而不是 `range(n - i)`？",
                    "options": [
                        {"id": "A", "text": "因為 Python 的 range 不能使用變數"},
                        {"id": "B", "text": "因為最大 j 必須讓 `j + 1` 仍在陣列內，且後 i 個元素已排序"},
                        {"id": "C", "text": "因為泡沫排序只能比較偶數索引"},
                        {"id": "D", "text": "因為外層迴圈已經完成所有比較"},
                    ],
                    "explanation": "分析內層上界時要同時檢查兩件事：所有索引運算式在最大值時仍需合法，以及已經確定排序好的邊界範圍不必再納入比較。",
                },
                "en": {
                    "title": "If the inner loop reads `arr[j]` and `arr[j + 1]`, why is the usual boundary `range(n - 1 - i)` instead of `range(n - i)`?",
                    "options": [
                        {"id": "A", "text": "Because Python range cannot use variables"},
                        {"id": "B", "text": "Because the largest j must keep `j + 1` inside the array, and the last i items are already sorted"},
                        {"id": "C", "text": "Because Bubble Sort only compares even indexes"},
                        {"id": "D", "text": "Because the outer loop has already done every comparison"},
                    ],
                    "explanation": "To analyze the inner-loop upper bound, check two things at once: every indexed expression must remain valid at its maximum value, and the boundary region already known to be sorted can be excluded.",
                },
            },
        },
        {
            "id": "bubble-sort-q24",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "若有人把內層寫成 `for j in range(n - i)`，並仍在迴圈內比較 `arr[j] > arr[j + 1]`，最可能發生什麼問題？",
                    "options": [
                        {"id": "A", "text": "只會讓排序變成遞減"},
                        {"id": "B", "text": "只會多做一次安全的比較"},
                        {"id": "C", "text": "會自動略過最後一次比較"},
                        {"id": "D", "text": "當 j 走到範圍末端時，`arr[j + 1]` 可能越界"},
                    ],
                    "explanation": "當迴圈上界改變時，要重新計算迴圈內每個索引運算式可能取得的最大位置。只看 `j` 本身不夠，還要看由 `j` 推出的鄰近索引。",
                },
                "en": {
                    "title": "If someone writes `for j in range(n - i)` but still compares `arr[j] > arr[j + 1]` inside the loop, what is the most likely problem?",
                    "options": [
                        {"id": "A", "text": "It only changes the sort to descending order"},
                        {"id": "B", "text": "It only adds one safe comparison"},
                        {"id": "C", "text": "It automatically skips the last comparison"},
                        {"id": "D", "text": "When j reaches the end of the range, `arr[j + 1]` may be out of bounds"},
                    ],
                    "explanation": "Whenever the loop bound changes, recompute the maximum position reached by every indexed expression inside the loop. Looking only at `j` is not enough; also inspect neighboring indexes derived from `j`.",
                },
            },
        },
        {
            "id": "bubble-sort-q25",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1400
            "baseRating": 1400,
            "code": BSORT_WRONG_BACKWARD_CODE,
            "language": "python",
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "下方程式嘗試把 Upward 版本改成 Backward 版本。若輸入長度至少為 2，哪一行最先可能因相鄰索引方向錯誤而出問題？",
                    "options": [
                        {"id": "A", "text": "L4：`range(n - 1, i, -1)` 本身一定無法執行"},
                        {"id": "B", "text": "L5：第一次進入內層時會讀取不合法的右鄰索引"},
                        {"id": "C", "text": "L6：只有交換賦值本身會出問題"},
                        {"id": "D", "text": "L7：return 會回傳未排序的陣列"},
                    ],
                    "explanation": "反向掃描時，要先確認每一行使用的是左鄰還是右鄰。判斷最先出問題的位置，應從內層第一次迭代的 j 值開始，逐行檢查索引運算式。",
                },
                "en": {
                    "title": "The code below tries to change an Upward version into a Backward version. For input length at least 2, which line can first fail because the adjacent-index direction is wrong?",
                    "options": [
                        {"id": "A", "text": "L4: `range(n - 1, i, -1)` itself can never run"},
                        {"id": "B", "text": "L5: the first inner-loop iteration reads an invalid right-neighbor index"},
                        {"id": "C", "text": "L6: only the swap assignment itself can fail"},
                        {"id": "D", "text": "L7: return gives back an unsorted array"},
                    ],
                    "explanation": "When scanning backward, first check whether each line uses the left or right neighbor. To find the earliest problem, start with the first inner-loop j value and inspect indexed expressions line by line.",
                },
            },
        },
        {
            "id": "bubble-sort-q26",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 250(複合陷阱) = 1500
            "baseRating": 1500,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "Backward 版本第一輪從右往左處理 arr = [4, 1, 3, 2]，若 `arr[j] < arr[j-1]` 就交換。第一輪結束後陣列為何？",
                    "options": [
                        {"id": "A", "text": "[1, 4, 2, 3]"},
                        {"id": "B", "text": "[1, 2, 3, 4]"},
                        {"id": "C", "text": "[4, 1, 2, 3]"},
                        {"id": "D", "text": "[2, 4, 1, 3]"},
                    ],
                    "explanation": "Backward 第一輪從最右側一路掃到左側，每次比較目前位置與左鄰。它的效果是讓此輪範圍中的最小值逐步往左浮，而不是一次完成整個排序。",
                },
                "en": {
                    "title": "A Backward version processes arr = [4, 1, 3, 2] from right to left in the first round, swapping when `arr[j] < arr[j-1]`. What is the array after that round?",
                    "options": [
                        {"id": "A", "text": "[1, 4, 2, 3]"},
                        {"id": "B", "text": "[1, 2, 3, 4]"},
                        {"id": "C", "text": "[4, 1, 2, 3]"},
                        {"id": "D", "text": "[2, 4, 1, 3]"},
                    ],
                    "explanation": "A Backward first round scans from the right edge toward the left, comparing the current position with its left neighbor. Its effect is to move the minimum in that range leftward, not to finish the whole sort at once.",
                },
            },
        },
        {
            "id": "bubble-sort-q27",
            "type": "fill-code",
            # baseRating = 800 + 150(FC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1500
            "baseRating": 1500,
            "code": BSORT_BACKWARD_FILL_CODE,
            "language": "python",
            "correctAnswer": ["<", "arr[j - 1]", "arr"],
            "translations": {
                "zh-TW": {
                    "title": "請完成 Backward 版本泡沫排序：從右往左比較相鄰元素，讓較小值逐步浮到左側。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 若右側元素比左側小，需交換，所以是 `<`。(b) Python 多重賦值右側第一個值要放 `arr[j - 1]`。(c) 完成後回傳原陣列 `arr`。",
                },
                "en": {
                    "title": "Complete the Backward Bubble Sort: compare adjacent elements from right to left so smaller values move toward the left.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) If the right element is smaller than the left one, swap, so use `<`. (b) The first value on the right side of the tuple assignment is `arr[j - 1]`. (c) Return the original array `arr`.",
                },
            },
        },
        {
            "id": "bubble-sort-q28",
            "type": "single-choice",
            # baseRating = 800 + 50(SC) + 400(L4 複雜控制流/邊界分析) + 250(複合陷阱) = 1500
            "baseRating": 1500,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "雞尾酒排序 (Cocktail Sort) 相對於一般泡沫排序的核心改動是什麼？",
                    "options": [
                        {"id": "A", "text": "在每輪比較前加入二分搜尋，先找出最佳交換位置"},
                        {"id": "B", "text": "使用三元比較 `(a, b, c)`，一次處理三個相鄰元素"},
                        {"id": "C", "text": "在同一輪中交替向右推最大值、向左浮最小值"},
                        {"id": "D", "text": "將平均情況時間複雜度改善到 O(n log n)"},
                    ],
                    "explanation": "雞尾酒排序是泡沫排序的雙向走訪變形，會來回掃描，讓最大值與最小值更快到達兩側邊界；它改善的是移動方向與部分資料分佈下的常數表現，不是把平均情況提升到 O(n log n)。",
                },
                "en": {
                    "title": "What is the core change in Cocktail Sort compared with ordinary Bubble Sort?",
                    "options": [
                        {"id": "A", "text": "It adds binary search before each round to find the best swap position"},
                        {"id": "B", "text": "It uses ternary comparisons `(a, b, c)` to handle three adjacent elements at once"},
                        {"id": "C", "text": "It alternates between pushing the maximum rightward and bubbling the minimum leftward"},
                        {"id": "D", "text": "It improves average-case time complexity to O(n log n)"},
                    ],
                    "explanation": "Cocktail Sort is a bidirectional Bubble Sort variant. It scans back and forth so maximum and minimum values move toward both boundaries faster; it changes movement direction and constants for some data distributions, not the average case to O(n log n).",
                },
            },
        },
        {
            "id": "bubble-sort-q29",
            "type": "multiple-choice",
            # baseRating = 800 + 100(MC) + 400(L4 複雜控制流/邊界分析) + 150(邊界) = 1450
            "baseRating": 1450,
            "correctAnswer": ["opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "實作泡沫排序雙層迴圈邊界時，哪些做法能避免常見錯誤？（多選）",
                    "options": [
                        {"id": "opt1", "text": "內層永遠跑到 `n`，因為 Python 會自動處理越界"},
                        {"id": "opt2", "text": "若讀 `arr[j + 1]`，需確保 j 的最大值不會到最後一格"},
                        {"id": "opt3", "text": "每完成一輪，就可以排除已就位的邊界元素"},
                        {"id": "opt4", "text": "外層必須跑 `n²` 輪才會保證排序完成"},
                    ],
                    "explanation": "設計雙層迴圈邊界時，請分別檢查三件事：索引合法性、未排序範圍是否單調縮小，以及外層是否有明確的終止保證。",
                },
                "en": {
                    "title": "When implementing Bubble Sort loop boundaries, which practices avoid common mistakes? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Always run the inner loop to `n` because Python handles out-of-bounds automatically"},
                        {"id": "opt2", "text": "If reading `arr[j + 1]`, ensure the largest j does not reach the last slot"},
                        {"id": "opt3", "text": "After each round, exclude the boundary element that has reached its final position"},
                        {"id": "opt4", "text": "The outer loop must run `n²` rounds to guarantee sorting"},
                    ],
                    "explanation": "When designing nested-loop boundaries, check three things separately: index validity, whether the unsorted range shrinks monotonically, and whether the outer loop has a clear termination guarantee.",
                },
            },
        },
        {
            "id": "bubble-sort-q30",
            "type": "predict-line",
            # baseRating = 800 + 150(PL) + 600(L5 演算法創造/系統級分析) + 150(邊界) = 1700
            "baseRating": 1700,
            "code": BSORT_PREDICT_CODE,
            "language": "python",
            "correctAnswer": "1 2 3 4 5 6 7 8 9 6 7 6 10 3 4 5 6 7 6 10 11 12",
            "translations": {
                "zh-TW": {
                    "title": "給定 collection = [2, 1, 3]，呼叫下方優化版 bubble_sort([2, 1, 3])。請依序填寫執行的行號序列（空格分隔）。",
                    "options": [],
                    "explanation": "關鍵轉折是：第一輪曾發生交換，所以該輪結束不會提早中止；第二輪沒有交換，因此檢查旗標時會觸發中止。行號序列需依照外層回圈、內層回圈回到 for 的時機一起追蹤。",
                },
                "en": {
                    "title": "Given collection = [2, 1, 3], calling the optimized bubble_sort([2, 1, 3]) below. Write the executed line-number sequence (space-separated).",
                    "options": [],
                    "explanation": "The key turns are: round 1 has a swap, so it does not stop early; round 2 has no swap, so the flag check triggers termination. The line sequence must also account for when each loop returns to its `for` line.",
                },
            },
        },
    ],
}

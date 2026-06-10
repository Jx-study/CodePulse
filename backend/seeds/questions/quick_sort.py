QSORT_PARTITION_CODE = """def partition(arr, low, high):
    pivot = arr[high]       # L1
    i = low - 1             # L2
    for j in range(low, high):  # L3
        if arr[j] <= pivot:     # L4
            i += 1              # L5
            arr[i], arr[j] = arr[j], arr[i]  # L6
        j += 1                  # L7 (implicit loop increment shown)
    arr[i + 1], arr[high] = arr[high], arr[i + 1]  # L8
    return i + 1                # L9"""

QSORT_FILL_CODE = """def partition(arr, low, high):
    pivot = arr[high]
    i = (a)
    for j in range(low, high):
        if arr[j] (b) pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[(c)], arr[high] = arr[high], arr[(c)]
    return i + 1"""

QSORT_RECURSIVE_FILL_CODE = """def quick_sort(arr, low, high):
    if (a):
        pivot_idx = partition(arr, low, high)
        quick_sort(arr, (b), pivot_idx - 1)
        quick_sort(arr, pivot_idx + 1, (c))"""

QSORT_PREDICT_CODE = """def partition(arr, low, high):   # L1
    pivot = arr[high]                # L2
    i = low - 1                      # L3
    for j in range(low, high):       # L4
        if arr[j] <= pivot:          # L5
            i += 1                   # L6
            arr[i], arr[j] = arr[j], arr[i]  # L7
    arr[i + 1], arr[high] = arr[high], arr[i + 1]  # L8
    return i + 1                     # L9"""

DATA = {
    "slug": "quick-sort",
    "groups": [
        {
            "id": "quick-sort-group-1",
            "code": QSORT_PARTITION_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "題組：Partition 分區核心",
                    "description": "以下是快速排序的 Partition 函式。以 arr[high] 為基準點，使用單指標 i 追蹤小於等於基準的邊界。請仔細觀察指標 i、j 的移動邏輯與基準點歸位步驟。",
                },
                "en": {
                    "title": "Group: Partition Core",
                    "description": "The following is Quick Sort's Partition function. It uses arr[high] as the pivot and a single pointer i to track the boundary of elements ≤ pivot. Pay close attention to how i and j move and how the pivot is placed at its final position.",
                },
            },
        }
    ],
    "questions": [
        # ── Basic 基礎 (< 1000) ─────────────────────────────────────────────
        # [核心概念] 800 + 0(true-false) + 50(L1定義) + 0(直觀) = 850
        {
            "id": "quick-sort-q1",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "快速排序（Quick Sort）是基於分治法（Divide and Conquer）的排序演算法。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "快速排序的核心流程是：選定基準點、執行分區使左小右大，再對兩側遞迴重複此過程——這正是「分治」思想的直接體現。",
                },
                "en": {
                    "title": "Quick Sort is a sorting algorithm based on the Divide and Conquer strategy.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Quick Sort's core flow — pick a pivot, partition so smaller values go left and larger go right, then recursively repeat on both sides — is a direct application of divide and conquer.",
                },
            },
        },
        # [核心概念] 800 + 50(single) + 50(L1定義) + 100(常見誤區) = 1000 → 留 1000 (boundary basic)
        {
            "id": "quick-sort-q2",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "快速排序中，Partition（分區）操作完成後，基準點（pivot）所在位置有何保證？",
                    "options": [
                        {"id": "A", "text": "基準點左側的元素都已完整排序好"},
                        {"id": "B", "text": "基準點位於陣列的中間索引"},
                        {"id": "C", "text": "基準點左側的所有元素都不大於它，右側的所有元素都不小於它"},
                        {"id": "D", "text": "基準點左右兩側的子陣列長度相等"},
                    ],
                    "explanation": "Partition 的定義性保證是：基準點站上它在最終排序結果中的正確位置，此後不需再移動。左側元素雖然都 ≤ pivot，但它們彼此之間的順序尚未確定，需要繼續遞迴處理。",
                },
                "en": {
                    "title": "After a Partition operation in Quick Sort, what is guaranteed about the pivot's position?",
                    "options": [
                        {"id": "A", "text": "All elements to the left of the pivot are already fully sorted"},
                        {"id": "B", "text": "The pivot is located at the middle index of the array"},
                        {"id": "C", "text": "All elements to the pivot's left are ≤ it, and all to its right are ≥ it"},
                        {"id": "D", "text": "The two sub-arrays on either side of the pivot are equal in length"},
                    ],
                    "explanation": "Partition guarantees the pivot lands at its correct final sorted position and never moves again. Elements to its left are all ≤ pivot, but their mutual order is not yet determined — recursion is still needed.",
                },
            },
        },
        # [操作複雜度] 800 + 50(single) + 50(L1定義) + 50(視覺相似干擾) = 950
        {
            "id": "quick-sort-q3",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "快速排序的平均時間複雜度與最差時間複雜度分別是什麼？",
                    "options": [
                        {"id": "A", "text": "平均 O(n log n)，最差 O(n²)"},
                        {"id": "B", "text": "平均 O(n log n)，最差也是 O(n log n)"},
                        {"id": "C", "text": "平均 O(n)，最差 O(n log n)"},
                        {"id": "D", "text": "平均 O(n log n)，最差 O(n log² n)"},
                    ],
                    "explanation": "基準點選擇良好時每層分區將問題規模近似減半，產生 O(log n) 層遞迴，每層 O(n) 走訪，平均 O(n log n)。但每次基準點都落在極值時，遞迴退化至 n 層，最差為 O(n²)。C 是 Merge Sort 的特性，D 是不存在的複雜度。",
                },
                "en": {
                    "title": "What are the average and worst-case time complexities of Quick Sort?",
                    "options": [
                        {"id": "A", "text": "Average O(n log n), worst O(n²)"},
                        {"id": "B", "text": "Average O(n log n), worst also O(n log n)"},
                        {"id": "C", "text": "Average O(n), worst O(n log n)"},
                        {"id": "D", "text": "Average O(n log n), worst O(n log² n)"},
                    ],
                    "explanation": "When the pivot consistently splits the array near in half, O(log n) recursion levels each doing O(n) work gives average O(n log n). When the pivot always lands at an extreme, recursion degrades to n levels, giving O(n²) worst case. C describes Merge Sort; D does not correspond to any known algorithm.",
                },
            },
        },
        # [排序不穩定性] 800 + 0(true-false) + 50(L1定義) + 0(直觀) = 850
        {
            "id": "quick-sort-q4",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "快速排序是一種穩定排序（Stable Sort），排序後相同數值的元素能保持其原始相對順序。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "快速排序是不穩定排序。Partition 過程中的遠距離交換可能讓相同數值的元素跳過彼此，打亂其原始相對順序。",
                },
                "en": {
                    "title": "Quick Sort is a stable sort, meaning elements with equal values maintain their original relative order after sorting.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Quick Sort is unstable. The long-distance swaps in Partition can cause equal-valued elements to leapfrog each other, disrupting their original relative order.",
                },
            },
        },
        # [操作複雜度] 800 + 0(true-false) + 50(L1定義) + 100(常見誤區) = 950
        {
            "id": "quick-sort-q5",
            "type": "true-false",
            "baseRating": 950,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "快速排序的空間複雜度是 O(1)，因為它是原地排序，不需要任何額外記憶體。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "快速排序雖是原地排序（不需輔助陣列），但遞迴呼叫本身會佔用呼叫堆疊空間。平均遞迴深度 O(log n)，退化時達 O(n)，空間複雜度並非 O(1)。",
                },
                "en": {
                    "title": "Quick Sort has O(1) space complexity because it is in-place and requires no extra memory.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Although Quick Sort is in-place (no auxiliary array), its recursive calls consume call-stack space. Average recursion depth is O(log n); in the degenerate case it reaches O(n). Space complexity is therefore not O(1).",
                },
            },
        },
        # [核心概念] 800 + 50(single) + 50(L1定義) + 0(直觀) = 900
        {
            "id": "quick-sort-q6",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在快速排序的標準實作中，以下哪個基準點選取方式最容易導致最差時間複雜度 O(n²)？",
                    "options": [
                        {"id": "A", "text": "隨機選取陣列中的一個元素"},
                        {"id": "B", "text": "固定選取陣列的第一個或最後一個元素"},
                        {"id": "C", "text": "使用三點取中法（Median of Three）"},
                        {"id": "D", "text": "隨機打亂陣列後再選第一個元素"},
                    ],
                    "explanation": "固定選第一或最後一個元素，當輸入已排序（正序或逆序）時，每次分區都只能分出一個元素，遞迴深度退化至 n 層，導致 O(n²)。隨機化和三點取中法都是為了規避這個陷阱。",
                },
                "en": {
                    "title": "Which pivot selection strategy most easily leads to O(n²) worst-case time complexity?",
                    "options": [
                        {"id": "A", "text": "Randomly selecting an element from the array"},
                        {"id": "B", "text": "Always selecting the first or last element"},
                        {"id": "C", "text": "Using the Median-of-Three method"},
                        {"id": "D", "text": "Randomly shuffling the array and then picking the first element"},
                    ],
                    "explanation": "Always picking the first or last element degrades to O(n²) on sorted or reverse-sorted input, because each partition only separates one element, pushing recursion depth to n. Randomization and median-of-three are designed specifically to avoid this.",
                },
            },
        },
        # [可以優化什麼] 800 + 50(single) + 100(L2多重比較) + 100(常見誤區) = 1050 → 調至 1050 (application 邊界，放 basic 尾)
        # 審題建議 1100；重算 800+50+100+100=1050，合理放 application
        {
            "id": "quick-sort-q7",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "相較於合併排序（Merge Sort），快速排序在實務上通常更快的主要原因是什麼？",
                    "options": [
                        {"id": "A", "text": "快速排序的最差時間複雜度比合併排序更低"},
                        {"id": "B", "text": "快速排序每次分區後，子問題的數量比合併排序少"},
                        {"id": "C", "text": "快速排序使用的比較次數在所有情況下都少於合併排序"},
                        {"id": "D", "text": "快速排序是原地排序，不需額外記憶體，且對連續記憶體的存取具極佳快取區域性"},
                    ],
                    "explanation": "快速排序直接在原陣列上操作，不需額外空間，且連續存取記憶體的方式對 CPU 快取極為友善（快取區域性）。合併排序雖然複雜度穩定，但需要 O(n) 額外空間，頻繁存取輔助陣列會導致較多快取失效，實務上常數因子較大。",
                },
                "en": {
                    "title": "Compared to Merge Sort, what is the main reason Quick Sort is usually faster in practice?",
                    "options": [
                        {"id": "A", "text": "Quick Sort has a lower worst-case time complexity than Merge Sort"},
                        {"id": "B", "text": "Quick Sort produces fewer sub-problems per partition than Merge Sort"},
                        {"id": "C", "text": "Quick Sort always makes fewer comparisons than Merge Sort"},
                        {"id": "D", "text": "Quick Sort is in-place with no extra memory, and its sequential memory access gives excellent cache locality"},
                    ],
                    "explanation": "Quick Sort operates directly on the original array without extra space, and its sequential memory access is highly cache-friendly. Merge Sort has stable complexity but requires O(n) auxiliary space; accessing that auxiliary array causes more cache misses and a larger constant factor in practice.",
                },
            },
        },
        # [陣列分割步驟] 800 + 50(single) + 100(L2多重比較) + 100(常見誤區) = 1050 → 審題建議 1100
        # 重算 800+50+150(L2單步追蹤)+100=1100
        {
            "id": "quick-sort-q8",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在快速排序的 Partition 中，走訪迴圈結束後，為什麼要把末端的基準點換到 `i+1` 的位置？",
                    "options": [
                        {"id": "A", "text": "因為 i+1 是整個子陣列的中間索引"},
                        {"id": "B", "text": "為了讓基準點移至走訪過程中被跳過的第一個位置"},
                        {"id": "C", "text": "走訪結束後 i 指向最後一個 ≤ pivot 的元素，因此 i+1 正好是 pivot 在最終排序中的位置"},
                        {"id": "D", "text": "i+1 是走訪過程中第一個 > pivot 的元素，需要對調才能讓左側全為小值"},
                    ],
                    "explanation": "走訪結束時，索引 0..i 的元素都已確認 ≤ pivot，索引 i+2..high-1 的元素都 > pivot。把暫放在末端的 pivot 換到 i+1，恰好使 pivot 左小右大，完成歸位。選項 D 的敘述混淆了「第一個 > pivot 元素」的位置——它在 i+1，而 pivot 換過去後就恰好擠開了它。",
                },
                "en": {
                    "title": "In Quick Sort's Partition, after the traversal loop finishes, why is the pivot swapped from the end to position `i+1`?",
                    "options": [
                        {"id": "A", "text": "Because i+1 is the midpoint index of the sub-array"},
                        {"id": "B", "text": "To move the pivot to the first position that was skipped during traversal"},
                        {"id": "C", "text": "After traversal i points to the last element ≤ pivot, so i+1 is exactly where the pivot belongs in sorted order"},
                        {"id": "D", "text": "i+1 is the first element > pivot encountered during traversal, and swapping makes the left side all smaller"},
                    ],
                    "explanation": "After the loop, indices 0..i are all ≤ pivot and indices i+2..high-1 are all > pivot. Swapping the pivot from the end to i+1 places it exactly at its final sorted position — left side smaller, right side larger. Option D misidentifies the location: the first element > pivot is indeed at i+1, but the pivot swaps into that slot and pushes it aside.",
                },
            },
        },
        # [適合處理的問題] 800 + 50(single) + 100(L2多重比較) + 0(直觀) = 950
        {
            "id": "quick-sort-q9",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "以下哪種場景最適合使用快速排序而非合併排序？",
                    "options": [
                        {"id": "A", "text": "需要對鏈結串列（Linked List）進行排序"},
                        {"id": "B", "text": "對大型隨機陣列進行原地排序，且不要求穩定性"},
                        {"id": "C", "text": "需要保證相同數值的元素排序後維持原始順序"},
                        {"id": "D", "text": "資料量極大，無法全部載入記憶體，需要外部排序"},
                    ],
                    "explanation": "快速排序的優勢在原地排序的隨機陣列上最能發揮：不需額外空間、快取局部性佳、平均 O(n log n)。鏈結串列、穩定性需求或外部排序這三個場景都是合併排序的主場。",
                },
                "en": {
                    "title": "Which scenario is most suitable for Quick Sort over Merge Sort?",
                    "options": [
                        {"id": "A", "text": "Sorting a linked list"},
                        {"id": "B", "text": "In-place sorting of a large random array where stability is not required"},
                        {"id": "C", "text": "When equal-valued elements must maintain their original relative order"},
                        {"id": "D", "text": "External sorting where data is too large to fit in memory"},
                    ],
                    "explanation": "Quick Sort shines on random arrays with in-place constraints: no extra memory, excellent cache locality, average O(n log n). Linked lists, stability requirements, and external sorting are all Merge Sort's territory.",
                },
            },
        },
        # [適合處理的問題] 800 + 50(single) + 100(L2多重比較) + 50(視覺相似) = 1000
        {
            "id": "quick-sort-q10",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "「快速選擇（Quick Select）」演算法是快速排序的衍生，它主要用於解決哪類問題？",
                    "options": [
                        {"id": "A", "text": "在未排序陣列中找到第 K 大（或小）的元素"},
                        {"id": "B", "text": "在未排序陣列中找出前 K 個最大元素並維持其排列順序"},
                        {"id": "C", "text": "對陣列部分區間進行局部排序，再合併得到全局有序結果"},
                        {"id": "D", "text": "找出陣列中所有出現超過 K 次的元素"},
                    ],
                    "explanation": "Quick Select 利用 Partition 每次確定一個元素最終位置的特性，判斷目標排名落在哪一側，只遞迴進入那一側，不需完整排序整個陣列，平均時間 O(n)。B 描述的是部分排序問題，C 更像 Merge Sort 的思路，D 是頻率統計問題。",
                },
                "en": {
                    "title": "Quick Select is a derivative of Quick Sort. What class of problems does it primarily solve?",
                    "options": [
                        {"id": "A", "text": "Finding the Kth largest (or smallest) element in an unsorted array"},
                        {"id": "B", "text": "Finding the top K largest elements in an unsorted array while preserving their relative order"},
                        {"id": "C", "text": "Partially sorting a range of the array and merging to get a globally sorted result"},
                        {"id": "D", "text": "Finding all elements that appear more than K times in the array"},
                    ],
                    "explanation": "Quick Select uses Partition's property — one element reaches its final position per call — to determine which side contains the target rank, then recurses only into that side. Average time O(n) without fully sorting. B is a partial-sort problem; C resembles Merge Sort; D is a frequency-counting problem.",
                },
            },
        },

        # ── Application 應用 (1000–1399) ────────────────────────────────────
        # [陣列分割步驟-題組] 800 + 50(single) + 150(L2單步追蹤) + 100(常見誤區) = 1100
        {
            "id": "quick-sort-q11",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "groupId": "quick-sort-group-1",
            "translations": {
                "zh-TW": {
                    "title": "題組程式碼中，`i = low - 1` 的作用是什麼？",
                    "options": [
                        {"id": "A", "text": "指向陣列第一個元素，作為走訪起點"},
                        {"id": "B", "text": "初始化「已確認 ≤ pivot」區域的右邊界，此時區域為空"},
                        {"id": "C", "text": "記錄走訪指標 j 的初始位置"},
                        {"id": "D", "text": "暫存基準點的原始索引，以便最後歸位"},
                    ],
                    "explanation": "i 是「已確認 ≤ pivot」區域的末端指標。初始設為 low - 1 代表該區域目前為空（沒有任何元素被確認）。每當找到 ≤ pivot 的元素，i 先右移再與 j 交換，將該元素納入區域內。",
                },
                "en": {
                    "title": "In the group code, what is the purpose of `i = low - 1`?",
                    "options": [
                        {"id": "A", "text": "Points to the first element of the array to serve as the traversal start"},
                        {"id": "B", "text": "Initializes the right boundary of the 'confirmed ≤ pivot' region, which is empty at the start"},
                        {"id": "C", "text": "Records the initial position of traversal pointer j"},
                        {"id": "D", "text": "Saves the pivot's original index so it can be placed back at the end"},
                    ],
                    "explanation": "i is the tail pointer of the region confirmed to be ≤ pivot. Setting it to low - 1 means the region is initially empty. Whenever an element ≤ pivot is found, i increments first, then swaps with j to include that element in the region.",
                },
            },
        },
        # [陣列分割步驟-題組] 800 + 50(single) + 250(L3多步追蹤) + 0(直觀) = 1100 → 審題建議降至 1050
        # 重算 800+50+150(L2單步追蹤)+100=1100；只有 3 個元素，降至 1050
        {
            "id": "quick-sort-q12",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "C",
            "groupId": "quick-sort-group-1",
            "translations": {
                "zh-TW": {
                    "title": "對 `arr = [3, 1, 2]`（low=0, high=2）執行題組的 partition 函式，基準點為 arr[2]=2。函式的回傳值（基準點最終落點的索引）為何？",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "1"},
                        {"id": "D", "text": "-1"},
                    ],
                    "explanation": "i 初始為 -1，pivot=2。走訪時 3>2 跳過，1≤2 使 i 變 0 並交換 arr[0]↔arr[1]。走訪結束後執行最後一次交換，將 pivot 從末端換到 arr[i+1]。最終 pivot 落在索引 1，左側全部 ≤2，右側全部 ≥2。",
                },
                "en": {
                    "title": "Running partition on `arr = [3, 1, 2]` (low=0, high=2) with pivot arr[2]=2. What index does the function return?",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "1"},
                        {"id": "D", "text": "-1"},
                    ],
                    "explanation": "i starts at -1, pivot=2. During traversal 3>2 is skipped; 1≤2 causes i to become 0 and swaps arr[0]↔arr[1]. After the loop the final swap places the pivot at arr[i+1]. The pivot lands at index 1, with everything to its left ≤2 and to its right ≥2.",
                },
            },
        },
        # [陣列分割步驟-題組] 800 + 50(single) + 250(L3多步追蹤) + 100(常見誤區) = 1200
        {
            "id": "quick-sort-q13",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "D",
            "groupId": "quick-sort-group-1",
            "translations": {
                "zh-TW": {
                    "title": "對 `arr = [5, 3, 8, 1, 4]`（low=0, high=4）執行題組的 partition 函式，基準點為 arr[4]=4。執行完畢後，陣列的狀態為何？",
                    "options": [
                        {"id": "A", "text": "[1, 3, 4, 5, 8]"},
                        {"id": "B", "text": "[3, 1, 4, 8, 5]"},
                        {"id": "C", "text": "[1, 3, 8, 4, 5]"},
                        {"id": "D", "text": "[3, 1, 4, 5, 8]"},
                    ],
                    "explanation": "初始 i=-1，pivot=4。j=0: 5>4 跳過。j=1: 3≤4 → i=0，交換 arr[0]↔arr[1] → [3,5,8,1,4]。j=2: 8>4 跳過。j=3: 1≤4 → i=1，交換 arr[1]↔arr[3] → [3,1,8,5,4]。迴圈結束，交換 arr[i+1]=arr[2] 與 arr[4] → [3,1,4,5,8]。pivot 4 落在索引 2。",
                },
                "en": {
                    "title": "Running partition on `arr = [5, 3, 8, 1, 4]` (low=0, high=4) with pivot arr[4]=4. What is the array state after partition completes?",
                    "options": [
                        {"id": "A", "text": "[1, 3, 4, 5, 8]"},
                        {"id": "B", "text": "[3, 1, 4, 8, 5]"},
                        {"id": "C", "text": "[1, 3, 8, 4, 5]"},
                        {"id": "D", "text": "[3, 1, 4, 5, 8]"},
                    ],
                    "explanation": "i=-1, pivot=4. j=0: 5>4 skip. j=1: 3≤4 → i=0, swap arr[0]↔arr[1] → [3,5,8,1,4]. j=2: 8>4 skip. j=3: 1≤4 → i=1, swap arr[1]↔arr[3] → [3,1,8,5,4]. Loop ends; swap arr[i+1]=arr[2] with arr[4] → [3,1,4,5,8]. Pivot 4 lands at index 2.",
                },
            },
        },
        # [陣列分割步驟/fill-code] 800 + 150(fill) + 250(L3多步) + 100(常見誤區) = 1300
        {
            "id": "quick-sort-q14",
            "type": "fill-code",
            "baseRating": 1300,
            "correctAnswer": ["low - 1", "<= pivot", "i + 1"],
            "code": QSORT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確程式碼，完成 Lomuto Partition 函式。",
                    "options": [],
                    "explanation": "三個空格分別對應 Lomuto Partition 的三個關鍵設計決策：(a) 邊界指標的初始語意——代表「已確認區域為空」；(b) 決定哪些元素應被納入左側區域的條件；(c) 走訪結束後 pivot 歸位的目標索引。注意 (b) 若改成嚴格小於，遇到相等值時行為會出錯。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the Lomuto Partition function.",
                    "options": [],
                    "explanation": "The three blanks correspond to three key design decisions in Lomuto Partition: (a) the initial semantic of the boundary pointer — representing an empty confirmed region; (b) the condition that determines which elements belong in the left region; (c) the target index where the pivot is placed after traversal ends. Note: using strict less-than in (b) would mishandle equal values.",
                },
            },
        },
        # [排序不穩定性] 800 + 50(single) + 250(L3多步) + 50(視覺相似干擾) = 1150 → 審題建議 1100
        # 重算 800+50+150(L2單步)+100(常見誤區)=1100
        {
            "id": "quick-sort-q15",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[5a, 3, 5b, 1]`（5a 與 5b 數值相同但可區分）執行快速排序，以最後一個元素為基準點。排序完成後，5a 與 5b 的相對順序最可能是？",
                    "options": [
                        {"id": "A", "text": "5a 一定在 5b 前面，因為 5a 原本排在前面，比較時不會被移動"},
                        {"id": "B", "text": "5b 可能排在 5a 前面，因為 Partition 中的交換不考慮元素的原始位置"},
                        {"id": "C", "text": "兩者相對順序不變，因為 Partition 只移動與基準點大小不同的元素"},
                        {"id": "D", "text": "順序無法預測，因為快速排序每次都會把相等值全部反轉"},
                    ],
                    "explanation": "快速排序是不穩定排序，Partition 的交換操作只看大小關係，不考慮原始位置。相等值可能在過程中因被選為基準點或被遠距離交換而改變相對順序，但也不是「一定反轉」。",
                },
                "en": {
                    "title": "Given `[5a, 3, 5b, 1]` (5a and 5b have equal value but are distinguishable), Quick Sort runs with the last element as pivot. What is the most accurate statement about the relative order of 5a and 5b after sorting?",
                    "options": [
                        {"id": "A", "text": "5a is always before 5b because 5a was originally first and is never moved during comparisons"},
                        {"id": "B", "text": "5b may appear before 5a because Partition swaps disregard original positions"},
                        {"id": "C", "text": "Their relative order is unchanged because Partition only moves elements that differ from the pivot"},
                        {"id": "D", "text": "The order is unpredictable because Quick Sort always reverses equal elements"},
                    ],
                    "explanation": "Quick Sort is unstable; Partition swaps look only at size relationships, not original positions. Equal-valued elements can change relative order when one is chosen as a pivot or caught in a long-distance swap — but they are not guaranteed to be reversed either.",
                },
            },
        },
        # [可以優化什麼/三點取中] 800 + 50(single) + 100(L2多重比較) + 100(常見誤區) = 1050 → 審題建議 1050
        {
            "id": "quick-sort-q16",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "三點取中法（Median-of-Three）選取基準點的方式是？",
                    "options": [
                        {"id": "A", "text": "從陣列中隨機選取三個索引，取其中數值最小的元素作為基準點"},
                        {"id": "B", "text": "比較陣列頭、中、尾三個位置，取它們的平均位置索引作為基準點"},
                        {"id": "C", "text": "比較陣列頭、中、尾三個位置的值，取數值居中的元素作為基準點"},
                        {"id": "D", "text": "將陣列分成三等份，分別找各段的中位數後取平均值"},
                    ],
                    "explanation": "三點取中法比較 arr[low]、arr[mid]、arr[high] 三個位置的值，選數值大小居中的元素作為基準點。這能有效規避已排序陣列導致的 O(n²) 退化，且計算成本極低，是實務上常見的優化。注意 B 混淆了「索引位置」與「數值大小」。",
                },
                "en": {
                    "title": "What does the Median-of-Three pivot selection strategy do?",
                    "options": [
                        {"id": "A", "text": "Randomly pick three indices and use the element with the smallest value as the pivot"},
                        {"id": "B", "text": "Compare head, mid, and tail positions and use the average of their indices as the pivot index"},
                        {"id": "C", "text": "Compare the values at head, mid, and tail positions and use the element with the median value as the pivot"},
                        {"id": "D", "text": "Divide the array into three equal parts and use the average of each part's median as the pivot"},
                    ],
                    "explanation": "Median-of-three compares arr[low], arr[mid], arr[high] and selects the element with the median value as the pivot. This avoids O(n²) degeneration on sorted input at very low cost. Option B confuses index position with element value.",
                },
            },
        },
        # [操作複雜度/退化] 800 + 50(single) + 100(L2多重比較) + 100(常見誤區) = 1050
        {
            "id": "quick-sort-q17",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "快速排序對一個已完全排序的陣列（如 [1,2,3,4,5]）以最後一個元素為基準點進行排序，此時每一輪分區的結果為何？",
                    "options": [
                        {"id": "A", "text": "每次分區後左側子陣列長度為 n-1，右側為 0，遞迴深度達 O(n)"},
                        {"id": "B", "text": "每次分區都將陣列平均分成兩半，效能最佳"},
                        {"id": "C", "text": "第一輪分區直接完成排序，不需遞迴"},
                        {"id": "D", "text": "每次分區後左側為 0，右側為 n-1，結果相同"},
                    ],
                    "explanation": "對已排序陣列以最後元素為基準點，每次 pivot 都是當前子陣列的最大值，導致左側有 n-1 個元素、右側為空，遞迴深度線性增長至 n，時間複雜度退化為 O(n²)。",
                },
                "en": {
                    "title": "Quick Sort is run on a fully sorted array (e.g., [1,2,3,4,5]) with the last element as pivot. What happens at each partition step?",
                    "options": [
                        {"id": "A", "text": "Each partition produces a left sub-array of size n-1 and right size 0, so recursion depth reaches O(n)"},
                        {"id": "B", "text": "Each partition splits the array evenly in half, giving best performance"},
                        {"id": "C", "text": "The first partition completes the sort and no recursion is needed"},
                        {"id": "D", "text": "Each partition produces left size 0 and right size n-1, with the same outcome"},
                    ],
                    "explanation": "On a sorted array with the last element as pivot, every pivot is the sub-array's maximum, leaving n-1 elements on the left and none on the right. Recursion depth grows linearly to n, degrading time complexity to O(n²).",
                },
            },
        },
        # [可以優化什麼/fill-code] 800 + 150(fill) + 250(L3多步) + 100(off-by-one) = 1300
        {
            "id": "quick-sort-q18",
            "type": "fill-code",
            "baseRating": 1300,
            "correctAnswer": ["low < high", "low", "high"],
            "code": QSORT_RECURSIVE_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確程式碼，完成快速排序的遞迴函式。",
                    "options": [],
                    "explanation": "三個空格的語意：(a) 遞迴的終止條件，子陣列需有至少兩個元素才需排序（low >= high 代表 0 或 1 個元素，直接返回）；(b)(c) 左右子陣列的邊界——pivot_idx 已確定位置，左側遞迴不碰它，右側同理。注意邊界不對會產生無限遞迴或跳過元素。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the recursive Quick Sort function.",
                    "options": [],
                    "explanation": "The three blanks: (a) the recursion base case — at least two elements needed before sorting (low >= high means 0 or 1 element, return immediately); (b)(c) the boundaries of the left and right sub-arrays — pivot_idx is already in its final position and is excluded from both sides. Wrong boundaries cause either infinite recursion or skipped elements.",
                },
            },
        },
        # [操作複雜度/multiple-choice] 800 + 100(multiple) + 100(L2多重比較) + 100(常見誤區) = 1100
        {
            "id": "quick-sort-q19",
            "type": "multiple-choice",
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt3", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "以下關於快速排序的陳述，哪些是正確的？（選擇所有正確答案）",
                    "options": [
                        {"id": "opt1", "text": "快速排序是原地排序（In-place），不需要額外的輔助陣列"},
                        {"id": "opt2", "text": "快速排序是穩定排序，能保持相同數值元素的相對順序"},
                        {"id": "opt3", "text": "快速排序的最差情況發生在每次基準點都選到當前子陣列的極值時"},
                        {"id": "opt4", "text": "使用隨機化選取基準點可以讓最差情況的發生機率趨近於零"},
                    ],
                    "explanation": "原地、不穩定、最差情況為極值基準點、隨機化有效規避退化——這四點是快速排序最重要的特性。opt2 錯誤是最常見的觀念混淆，需特別注意。",
                },
                "en": {
                    "title": "Which of the following statements about Quick Sort are correct? (Select all that apply)",
                    "options": [
                        {"id": "opt1", "text": "Quick Sort is in-place and does not require an auxiliary array"},
                        {"id": "opt2", "text": "Quick Sort is stable and preserves the relative order of equal-valued elements"},
                        {"id": "opt3", "text": "Quick Sort's worst case occurs when the pivot is always an extreme value of the current sub-array"},
                        {"id": "opt4", "text": "Randomized pivot selection reduces the probability of the worst case to near zero"},
                    ],
                    "explanation": "In-place, unstable, worst case from extreme pivots, and randomization as a defense — these are the four most critical properties of Quick Sort. opt2 is the most common misconception and deserves special attention.",
                },
            },
        },

        # ── Complexity 挑戰 (≥ 1400) ─────────────────────────────────────────
        # [predict-line] 800 + 150(predict) + 400(L4複雜控制流) + 100(誤區off-by-one) = 1450
        {
            "id": "quick-sort-q20",
            "type": "predict-line",
            "baseRating": 1450,
            "correctAnswer": "1 2 3 4 5 4 5 6 7 4 8 9",
            "code": QSORT_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "對 `arr = [3, 1, 2]`（low=0, high=2）呼叫 partition 函式，請依序寫出每次被執行到的行號（以空格分隔）。",
                    "options": [],
                    "explanation": "關鍵是記住每次 for 迴圈進入下一輪時都會重新執行 L4，條件成立才進入 L5-L7，不成立則直接回到 L4。共兩輪：j=0 條件不成立（L4→L5→L4），j=1 條件成立（L4→L5→L6→L7→L4 迴圈結束）。最後執行 L8 pivot 歸位，L9 回傳。",
                },
                "en": {
                    "title": "Calling partition on `arr = [3, 1, 2]` (low=0, high=2). Write the line numbers executed in order (space-separated).",
                    "options": [],
                    "explanation": "Key: L4 re-executes at the start of every loop iteration. When the condition is false, execution goes L4→L5→L4; when true, it goes L4→L5→L6→L7→L4. Two iterations total: j=0 fails the condition; j=1 passes. After the loop, L8 places the pivot and L9 returns.",
                },
            },
        },
        # [操作複雜度/Sedgewick trick] 800 + 50(single) + 600(L5系統分析) + 150(複合) = 1600 → 審題建議 1550
        # 重算 800+50+550(L5)+150=1550
        {
            "id": "quick-sort-q21",
            "type": "single-choice",
            "baseRating": 1550,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "快速排序的遞迴呼叫在最差情況下空間複雜度為 O(n)，哪種技術可以將最差情況空間複雜度**保證**改善至 O(log n)？",
                    "options": [
                        {"id": "A", "text": "使用隨機化選取基準點，降低退化發生的機率"},
                        {"id": "B", "text": "改用完全迭代實作，以顯式堆疊取代系統呼叫堆疊"},
                        {"id": "C", "text": "每次優先遞迴較短的子陣列，較長的子陣列以尾遞迴展開（Tail Call Optimization）"},
                        {"id": "D", "text": "加入深度上限，超過閾值時改以插入排序收尾"},
                    ],
                    "explanation": "選項 A 只能降低機率，無法保證。選項 B 只是把系統堆疊換成顯式堆疊，最差仍需 O(n) 空間。選項 C（Sedgewick's trick）：每次先遞迴較短那側，較長那側以尾遞迴消除，由於較短側最多為總長度一半，遞迴深度有數學上界 O(log n)，即使最差分區下也成立。選項 D 是 IntroSort 的思路，目的是保住時間複雜度，不是空間。",
                },
                "en": {
                    "title": "Quick Sort's worst-case recursion stack is O(n). Which technique **guarantees** the worst-case space complexity improves to O(log n)?",
                    "options": [
                        {"id": "A", "text": "Randomized pivot selection, which lowers the probability of degeneration"},
                        {"id": "B", "text": "A fully iterative implementation that replaces the system call stack with an explicit stack"},
                        {"id": "C", "text": "Always recurse on the shorter sub-array first, and handle the longer one via tail call elimination"},
                        {"id": "D", "text": "Add a depth limit and switch to Insertion Sort when it is exceeded"},
                    ],
                    "explanation": "A only lowers probability, not a guarantee. B swaps the system stack for an explicit one — worst-case space is still O(n). C (Sedgewick's trick): by always recursing on the shorter half first and tail-eliminating the longer, the recursion depth is mathematically bounded at O(log n) even under the worst partition. D (IntroSort's approach) protects time complexity, not space.",
                },
            },
        },
        # [排序不穩定性/multi-key sort] 800 + 50(single) + 250(L3多步) + 150(複合陷阱) = 1250 → 審題建議 1250
        {
            "id": "quick-sort-q22",
            "type": "single-choice",
            "baseRating": 1250,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在多欄位排序情境中，先用穩定排序依「姓名」排序，再用快速排序依「分數」排序。最終結果中分數相同的記錄，其姓名順序是否正確？",
                    "options": [
                        {"id": "A", "text": "正確，因為第二次排序只移動「分數不同」的元素，分數相同的記錄位置不變"},
                        {"id": "B", "text": "不保證正確，快速排序是不穩定排序，分數相同的記錄可能打亂第一次建立的姓名順序"},
                        {"id": "C", "text": "正確，兩次排序的鍵值不同，不穩定性只影響相同鍵值的元素，不會跨欄位傳播"},
                        {"id": "D", "text": "不保證正確，但僅當所有記錄的分數完全相同時才會出現問題"},
                    ],
                    "explanation": "不穩定排序的影響正好發生在「第二個鍵值相同」的元素之間。快速排序對分數排序時，分數相同的多筆記錄的相對順序（由第一次依姓名排序建立）可能被打亂。這就是為何多鍵排序必須全程使用穩定排序的根本原因。選項 D 看似接近但錯誤——只要有「部分分數相同」就會有風險，不需要全部相同。",
                },
                "en": {
                    "title": "In a multi-column sort: first sort by 'name' using a stable sort, then sort by 'score' using Quick Sort. For records with equal scores, is the name order preserved correctly?",
                    "options": [
                        {"id": "A", "text": "Yes — the second sort only moves records with different scores, so equal-score records stay put"},
                        {"id": "B", "text": "Not guaranteed — Quick Sort is unstable, and equal-score records may have their name order scrambled"},
                        {"id": "C", "text": "Yes — the two sort keys differ, and instability only affects records with the same key, so it cannot propagate across columns"},
                        {"id": "D", "text": "Not guaranteed, but only when every record has the same score"},
                    ],
                    "explanation": "Instability affects exactly the elements sharing the same second key. When Quick Sort sorts by score, it may scramble the name-order (established by the first sort) among records sharing the same score. This is precisely why multi-key sorting must use stable sorts throughout. Option D is close but wrong: any partial score ties introduce the risk, not just when all scores are identical.",
                },
            },
        },
        # [適合問題/Quick Select 深度] 800 + 50(single) + 400(L4複雜分析) + 150(複合) = 1400
        {
            "id": "quick-sort-q23",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "Quick Select 的平均時間複雜度為 O(n)。以下哪個描述最準確地解釋了為何平均是 O(n) 而非 O(n log n)？",
                    "options": [
                        {"id": "A", "text": "每次分區後對兩側子陣列都繼續搜尋，總工作量形成 n + n/2 + n/4 + ... = O(n) 的收斂級數"},
                        {"id": "B", "text": "使用 Median of Medians 確保每次分區至少切除 30% 的元素，使遞迴深度降至 O(log n)"},
                        {"id": "C", "text": "只找單一目標，每次比較後直接定位，無需走訪剩餘元素"},
                        {"id": "D", "text": "每次分區後只遞迴進入包含目標排名的那一側，捨棄另一側；期望每次問題規模減半，總工作量為 n + n/2 + n/4 + ... = O(n)"},
                    ],
                    "explanation": "Quick Select 與 Quick Sort 的差異在於：分區後只選一側繼續，另一側直接捨棄。在隨機基準點下，期望每次問題規模減半，總工作量為幾何收斂級數 ≈ 2n = O(n)。選項 A 說「兩側都搜尋」是根本錯誤，那是 Quick Sort 的行為。選項 B 描述的是 Introselect，不是標準 Quick Select。",
                },
                "en": {
                    "title": "Quick Select averages O(n). Which description most accurately explains why it is O(n) rather than O(n log n)?",
                    "options": [
                        {"id": "A", "text": "After each partition both sub-arrays are searched, and total work n + n/2 + n/4 + ... converges to O(n)"},
                        {"id": "B", "text": "Median of Medians guarantees at least 30% elimination per step, reducing recursion depth to O(log n)"},
                        {"id": "C", "text": "Only one target is sought, so after each comparison the target is directly located without visiting remaining elements"},
                        {"id": "D", "text": "After each partition only the side containing the target rank is recursed into; on average the problem halves each step, giving total work n + n/2 + n/4 + ... = O(n)"},
                    ],
                    "explanation": "Quick Select differs from Quick Sort by choosing only one side after partition and discarding the other. With a random pivot, the expected problem size halves each step, and the geometric series ≈ 2n = O(n). Option A says 'both sides are searched' — that is Quick Sort behavior, not Quick Select. Option B describes Introselect, not standard Quick Select.",
                },
            },
        },
        # [操作複雜度/遞迴深度] 800 + 50(single) + 250(L3多步) + 100(常見誤區) = 1200 → 審題建議 1200
        {
            "id": "quick-sort-q24",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "對長度為 n 的陣列，快速排序最差情況下的遞迴堆疊深度為 O(n)。此最差情況的根本成因是什麼？",
                    "options": [
                        {"id": "A", "text": "每次分區都需要走訪整個陣列，使每層遞迴的時間成本過高"},
                        {"id": "B", "text": "基準點每次選到中間值，反而讓遞迴樹不平衡"},
                        {"id": "C", "text": "基準點每次都是當前子陣列的極值，導致每次分區只縮小一個元素，遞迴深度線性增長至 n"},
                        {"id": "D", "text": "大量重複元素使每次分區無法有效區分左右兩側"},
                    ],
                    "explanation": "當 pivot 每次都是極值（最大或最小），Partition 產生長度 n-1 與 0 的兩個子陣列。每層只解決一個元素，遞迴深度線性增長至 n，堆疊深度達 O(n)，時間複雜度也退化至 O(n²)。選項 B 相反——中間值是最理想的選擇；選項 D 是另一種退化情境，但機制不同。",
                },
                "en": {
                    "title": "For an array of length n, Quick Sort's worst-case recursion stack depth is O(n). What is the fundamental cause?",
                    "options": [
                        {"id": "A", "text": "Each partition must traverse the entire array, making the time cost of each recursion level too high"},
                        {"id": "B", "text": "The pivot always lands at the median, which causes the recursion tree to be unbalanced"},
                        {"id": "C", "text": "The pivot is always the extreme value of the current sub-array, so each partition shrinks the problem by only one element and recursion depth grows linearly to n"},
                        {"id": "D", "text": "Many duplicate elements prevent each partition from effectively separating the two sides"},
                    ],
                    "explanation": "When the pivot is always the extreme value, Partition produces sub-arrays of size n-1 and 0. Each level resolves only one element, so depth grows linearly to n, giving O(n) stack space and O(n²) time. Option B is backwards — the median is the ideal choice. Option D describes a different degeneration scenario with a different mechanism.",
                },
            },
        },
        # [可以優化什麼/三路分區] 800 + 50(single) + 400(L4複雜分析) + 100(常見誤區) = 1350 → 審題建議 1200
        # 重算 800+50+250(L3多步)+100=1200
        {
            "id": "quick-sort-q25",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "標準快速排序對含大量重複元素的陣列（如 [3,3,3,3,3]）效能很差，哪種技術能有效解決此問題？",
                    "options": [
                        {"id": "A", "text": "三路分區（Three-way Partition）：將陣列分為「小於」、「等於」、「大於」基準點三個區域，等於區域的元素不再遞迴"},
                        {"id": "B", "text": "隨機化選取基準點，避免每次都選到重複值"},
                        {"id": "C", "text": "先以 HashSet 去除重複元素，排序後再補回"},
                        {"id": "D", "text": "加入提前終止條件，當走訪到連續相同元素時直接略過"},
                    ],
                    "explanation": "三路分區（源自荷蘭國旗問題）將分區結果分為 < pivot、= pivot、> pivot 三塊。等於 pivot 的元素在一次分區後即確定最終位置，不再遞迴。重複率越高，等於區域越大，效能提升越顯著，全相同時達 O(n)。選項 B 無效，因為基準點仍是重複值，問題根源未解決。",
                },
                "en": {
                    "title": "Standard Quick Sort performs poorly on arrays with many duplicates (e.g., [3,3,3,3,3]). Which technique effectively solves this?",
                    "options": [
                        {"id": "A", "text": "Three-way Partition: divide the array into 'less than', 'equal to', and 'greater than' regions — elements in the equal region are never recursed into"},
                        {"id": "B", "text": "Randomized pivot selection to avoid picking duplicate values"},
                        {"id": "C", "text": "Use a HashSet to remove duplicates first, sort, then re-insert"},
                        {"id": "D", "text": "Add an early-exit condition to skip over runs of identical elements during traversal"},
                    ],
                    "explanation": "Three-way partition (from the Dutch National Flag problem) splits into < pivot, = pivot, > pivot. Equal elements are permanently placed in one partition call and never recursed into. The more duplicates, the larger the equal region and the greater the benefit — reaching O(n) when all elements are identical. Option B is ineffective; the pivot is still a duplicate value, so the root problem remains.",
                },
            },
        },
        # [綜合/multiple-choice] 800 + 100(multiple) + 400(L4分析) + 150(複合) = 1450
        {
            "id": "quick-sort-q26",
            "type": "multiple-choice",
            "baseRating": 1450,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些情境會讓快速排序的效能明顯劣於合併排序？（選擇所有正確答案）",
                    "options": [
                        {"id": "opt1", "text": "輸入陣列已完全正序或逆序，且使用固定選取末端元素的基準點策略"},
                        {"id": "opt2", "text": "需要對鏈結串列排序，快速排序無法高效進行原地分區"},
                        {"id": "opt3", "text": "輸入為完全隨機的大型陣列，且使用隨機化基準點"},
                        {"id": "opt4", "text": "需要多欄位穩定排序，確保分數相同的記錄依姓名維持原始順序"},
                    ],
                    "explanation": "判斷準則：已排序輸入讓固定 pivot 策略退化至 O(n²)；鏈結串列缺乏隨機存取讓原地分區效率低落；穩定性需求讓不穩定的快速排序直接失格。只有隨機陣列搭配隨機化 pivot 才是快速排序的最強場景，不該改用合併排序。",
                },
                "en": {
                    "title": "In which scenarios does Quick Sort's performance clearly fall behind Merge Sort? (Select all that apply)",
                    "options": [
                        {"id": "opt1", "text": "Input is fully sorted or reverse-sorted, and the pivot strategy always picks the last element"},
                        {"id": "opt2", "text": "Sorting a linked list — Quick Sort cannot efficiently perform in-place partitioning"},
                        {"id": "opt3", "text": "Input is a large fully random array with randomized pivot selection"},
                        {"id": "opt4", "text": "Multi-key stable sorting is required — equal-score records must remain ordered by name"},
                    ],
                    "explanation": "Decision criteria: sorted input degrades a fixed-pivot strategy to O(n²); linked lists lack random access making in-place partition inefficient; stability requirements disqualify the unstable Quick Sort. Only random arrays with randomized pivots represent Quick Sort's strongest scenario — that is not a case to switch to Merge Sort.",
                },
            },
        },
        # [系統級/Timsort] 800 + 50(single) + 400(L4複雜分析) + 150(複合) = 1400 → 審題建議 1400
        {
            "id": "quick-sort-q27",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "Python 的 `list.sort()` 使用 Timsort 而非快速排序。以下哪個選項最準確地說明了原因？",
                    "options": [
                        {"id": "A", "text": "Timsort 的平均時間複雜度為 O(n)，優於快速排序的 O(n log n)"},
                        {"id": "B", "text": "通用標準函式庫的排序需同時滿足穩定性與有保障的最差複雜度，快速排序兩者皆不符合"},
                        {"id": "C", "text": "快速排序需要陣列支援隨機存取，Python list 的實作不符合此前提"},
                        {"id": "D", "text": "Timsort 在所有情境下的比較次數都少於快速排序"},
                    ],
                    "explanation": "標準函式庫排序需滿足兩個工程需求：(1) 穩定性，讓多鍵排序正確組合；(2) 最差情況可預期（O(n log n)），避免特殊輸入導致效能崩潰。快速排序不穩定且最差 O(n²)，兩項都不達標。Timsort 融合 Merge Sort 的穩定性與對近乎有序資料的線性加速，同時保證最差 O(n log n)。A 和 D 都是錯誤的效能描述；C 混淆了語言層實作細節。",
                },
                "en": {
                    "title": "Python's `list.sort()` uses Timsort rather than Quick Sort. Which option most accurately explains why?",
                    "options": [
                        {"id": "A", "text": "Timsort's average time complexity is O(n), better than Quick Sort's O(n log n)"},
                        {"id": "B", "text": "A standard library sort must satisfy both stability and a guaranteed worst-case bound, and Quick Sort meets neither"},
                        {"id": "C", "text": "Quick Sort requires random access; Python list's internal implementation does not support this"},
                        {"id": "D", "text": "Timsort makes fewer comparisons than Quick Sort in every scenario"},
                    ],
                    "explanation": "A standard library sort must meet two engineering requirements: (1) stability, enabling correct multi-key sort composition; (2) predictable worst case (O(n log n)), preventing performance collapse on adversarial input. Quick Sort is unstable and has O(n²) worst case — it fails both. Timsort combines Merge Sort's stability with near-linear speed on partially sorted data, while guaranteeing O(n log n) worst case. A and D are incorrect performance claims; C confuses language-level implementation details.",
                },
            },
        },
        # [系統級/IntroSort] 800 + 50(single) + 400(L4複雜分析) + 150(複合) = 1400 → 審題建議 1450
        # 重算 800+50+450(L4-L5)+150=1450
        {
            "id": "quick-sort-q28",
            "type": "single-choice",
            "baseRating": 1450,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "IntroSort（C++ STL `std::sort` 所用）是快速排序、堆積排序與插入排序的混合體。它在什麼條件下切換至堆積排序，原因是什麼？",
                    "options": [
                        {"id": "A", "text": "當子陣列長度小於 16 時切換，因為堆積排序在小陣列上比快速排序快"},
                        {"id": "B", "text": "當偵測到陣列已部分排序時切換，因為堆積排序能利用現有順序加速"},
                        {"id": "C", "text": "當遞迴深度超過閾值（通常為 2⌊log₂n⌋）時切換，以保住 O(n log n) 的最差時間複雜度"},
                        {"id": "D", "text": "當連續多次分區都產生不平衡子陣列時切換，以重新隨機化基準點策略"},
                    ],
                    "explanation": "IntroSort 追蹤遞迴深度，超過 2⌊log₂n⌋ 時推斷快速排序正在退化，立刻切換至最差保證 O(n log n) 的堆積排序，使整體最差時間複雜度不超過 O(n log n)。切換至插入排序是另一條路（小子陣列），兩者目的不同。A 描述的是插入排序的切換條件；B 和 D 描述的切換條件在 IntroSort 中並不存在。",
                },
                "en": {
                    "title": "IntroSort (used by C++ STL `std::sort`) is a hybrid of Quick Sort, Heap Sort, and Insertion Sort. Under what condition does it switch to Heap Sort, and why?",
                    "options": [
                        {"id": "A", "text": "When sub-array length falls below 16, because Heap Sort is faster on small arrays"},
                        {"id": "B", "text": "When the array is detected to be partially sorted, because Heap Sort can exploit existing order"},
                        {"id": "C", "text": "When recursion depth exceeds a threshold (typically 2⌊log₂n⌋), to preserve O(n log n) worst-case time complexity"},
                        {"id": "D", "text": "When several consecutive partitions produce unbalanced sub-arrays, to re-randomize the pivot strategy"},
                    ],
                    "explanation": "IntroSort tracks recursion depth; exceeding 2⌊log₂n⌋ signals that Quick Sort is likely degenerating, so it immediately switches to Heap Sort, which guarantees O(n log n) worst case. Switching to Insertion Sort is the other branch (small sub-arrays) and serves a different purpose. A describes the Insertion Sort switch condition; B and D describe switch conditions that do not exist in IntroSort.",
                },
            },
        },
    ],
}

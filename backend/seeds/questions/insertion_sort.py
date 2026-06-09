ISORT_SIMPLIFIED_CODE = """def insert_logic(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key"""

ISORT_FILL_CODE = """def insertion_sort(collection):
    for i in range(1, len(collection)):
        key = collection[i]
        j = i - 1
        while (a) and (b):
            collection[j + 1] = collection[j]
            j -= 1
        collection[(c)] = key"""

ISORT_PREDICT_CODE = """def insertion_sort(collection):           # L1
    for i in range(1, len(collection)):               # L2
        key = collection[i]                           # L3
        j = i - 1                                     # L4
        while j >= 0 and collection[j] > key:         # L5
            collection[j + 1] = collection[j]         # L6
            j -= 1                                    # L7
        collection[j + 1] = key                       # L8
    return collection                                 # L9"""

RECURSIVE_ISORT_FILL_CODE = """def recursive_insertion_sort(arr, n):
    if n <= (a):
        return
    recursive_insertion_sort(arr, (b))
    last = arr[n-1]
    j = n - 2
    while j >= 0 and arr[j] > last:
        arr[j+1] = arr[j]
        j -= 1
    arr[j+1] = (c)"""

ISORT_PREDICT_CODE_2 = """def insertion_sort(collection):           # L1
    for i in range(1, len(collection)):               # L2
        key = collection[i]                           # L3
        j = i - 1                                     # L4
        while j >= 0 and collection[j] > key:         # L5
            collection[j + 1] = collection[j]         # L6
            j -= 1                                    # L7
        collection[j + 1] = key                       # L8
    return collection                                 # L9"""

ISORT_BINARY_FILL_CODE = """def binary_insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        lo, hi = 0, (a)
        while lo < hi:
            mid = (lo + hi) // 2
            if arr[mid] <= key:
                lo = (b)
            else:
                hi = mid
        j = i - 1
        while j >= lo:
            arr[j + 1] = arr[j]
            j -= 1
        arr[(c)] = key"""

DATA = {
    "slug": "insertion-sort",
    "groups": [
        {
            "id": "group-isort-logic",
            "translations": {
                "zh-TW": {
                    "title": "題組：插入排序的平移機制",
                    "description": "插入排序透過平移元素來騰出空間，這比交換操作更有效率。請仔細觀察平移發生的條件。",
                },
                "en": {
                    "title": "Group: Insertion Sort's Shift Mechanism",
                    "description": "Insertion Sort shifts elements to make room, which is more efficient than swapping. Pay close attention to when the shift condition triggers.",
                },
            },
            "code": ISORT_SIMPLIFIED_CODE,
            "language": "python",
        }
    ],
    "questions": [
        # 【Basic 基礎】 800-999
        # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 0(直觀) = 900
        {
            "id": "isort-q1",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "插入排序 (Insertion Sort) 的核心概念是什麼？",
                    "options": [
                        {"id": "A", "text": "每次找到最小元素並放到最前面"},
                        {"id": "B", "text": "每次將一個元素插入到已排序部分的正確位置"},
                        {"id": "C", "text": "每次比較並交換相鄰的兩個元素"},
                        {"id": "D", "text": "每次將陣列分成兩半分別排序"},
                    ],
                    "explanation": "插入排序的核心是維護一個「已排序區」，每次從「未排序區」取出一個元素（key），並將它插入到已排序區中正確的位置，就像整理撲克牌一樣。",
                },
                "en": {
                    "title": "What is the core concept of Insertion Sort?",
                    "options": [
                        {"id": "A", "text": "Find the minimum element each time and place it at the front"},
                        {"id": "B", "text": "Each time, insert one element into the correct position within the sorted portion"},
                        {"id": "C", "text": "Each time, compare and swap two adjacent elements"},
                        {"id": "D", "text": "Each time, split the array in half and sort each half"},
                    ],
                    "explanation": "The core of Insertion Sort is maintaining a 'sorted region'. Each iteration picks one element (key) from the 'unsorted region' and inserts it into the correct position in the sorted region, similar to sorting playing cards in hand.",
                },
            },
        },
        # baseRating = 800 + 0(TF) + 50(L1 單一理論) + 0(直觀) = 850
        {
            "id": "isort-tf-1",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "插入排序在資料幾乎已排序的情況下，效能接近 O(n)，遠優於它的最壞情況。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。當陣列幾乎已排序時，每個元素幾乎不需要向左平移，內層 while 迴圈幾乎不執行，整體複雜度接近 O(n)。這是插入排序相較於其他 O(n²) 演算法的一大優勢。",
                },
                "en": {
                    "title": "When the data is nearly sorted, Insertion Sort performs close to O(n), far better than its worst case.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Correct. When the array is nearly sorted, each element barely needs to shift left, so the inner while loop hardly executes, making the overall complexity close to O(n). This is a major advantage of Insertion Sort over other O(n²) algorithms.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 0(直觀) = 900
        {
            "id": "isort-q2",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "在插入排序中，外層迴圈 `for i in range(1, len(arr))` 從索引 1 開始，而不是從 0 開始，原因是什麼？",
                    "options": [
                        {"id": "A", "text": "索引 0 的元素被視為已排序區的初始元素，不需要被插入"},
                        {"id": "B", "text": "索引 0 的元素通常是最小值，不需要移動"},
                        {"id": "C", "text": "從 0 開始會導致索引越界錯誤"},
                        {"id": "D", "text": "這是 Python 的語法限制"},
                    ],
                    "explanation": "排序開始時，我們假設第一個元素（索引 0）本身構成一個只有一個元素的「已排序區」。從索引 1 開始，依次將每個元素插入到前面已排序的部分。",
                },
                "en": {
                    "title": "In Insertion Sort, the outer loop `for i in range(1, len(arr))` starts from index 1, not 0. Why?",
                    "options": [
                        {"id": "A", "text": "The element at index 0 is treated as the initial element of the sorted region and does not need to be inserted"},
                        {"id": "B", "text": "The element at index 0 is usually the minimum and does not need to move"},
                        {"id": "C", "text": "Starting from 0 would cause an index out-of-bounds error"},
                        {"id": "D", "text": "This is a Python syntax restriction"},
                    ],
                    "explanation": "At the start of sorting, we assume the first element (index 0) forms a 'sorted region' of one element by itself. Starting from index 1, each subsequent element is inserted into the already-sorted portion in front of it.",
                },
            },
        },
        # baseRating = 800 + 0(TF) + 50(L1 單一理論) + 100(新手誤區：誤以為嚴格大於不重要) = 950
        {
            "id": "isort-tf-2",
            "type": "true-false",
            "baseRating": 950,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "插入排序是一種穩定的 (stable) 排序演算法，即相同值的元素在排序後會保持其原始的相對順序。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。插入排序的平移條件是 `arr[j] > key`（嚴格大於），因此遇到相同值時不會平移，key 會插入到與其相同值的元素的右邊，維持了穩定性。",
                },
                "en": {
                    "title": "Insertion Sort is a stable sorting algorithm, meaning elements with equal values maintain their original relative order after sorting.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Correct. The shift condition in Insertion Sort is `arr[j] > key` (strictly greater than), so equal elements are not shifted. The key is inserted to the right of elements with the same value, preserving stability.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 100(新手誤區：誤以為重複元素=O(n log n)) = 1000  → 調回 950 維持 basic
        # baseRating = 800 + 50(SC) + 50(L1 定義) + 50(視覺干擾：O(n) / O(n²) 易混) = 950
        {
            "id": "isort-q3",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "插入排序的最壞情況是什麼？此時時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "陣列已完全排序好，時間複雜度 O(n)"},
                        {"id": "B", "text": "陣列完全逆序排列，時間複雜度 O(n²)"},
                        {"id": "C", "text": "陣列中有大量重複元素，時間複雜度 O(n log n)"},
                        {"id": "D", "text": "陣列長度為奇數，時間複雜度 O(n²)"},
                    ],
                    "explanation": "當陣列完全逆序時（例如 [5,4,3,2,1]），每個新元素都需要一路平移到最左邊，內層迴圈執行次數為 0+1+2+...+(n-1) = n(n-1)/2，時間複雜度為 O(n²)。",
                },
                "en": {
                    "title": "What is the worst case for Insertion Sort, and what is the time complexity in that case?",
                    "options": [
                        {"id": "A", "text": "The array is already fully sorted, time complexity O(n)"},
                        {"id": "B", "text": "The array is in completely reverse order, time complexity O(n²)"},
                        {"id": "C", "text": "The array has many duplicate elements, time complexity O(n log n)"},
                        {"id": "D", "text": "The array has an odd length, time complexity O(n²)"},
                    ],
                    "explanation": "When the array is in completely reverse order (e.g. [5,4,3,2,1]), each new element must shift all the way to the left. The inner loop executes 0+1+2+...+(n-1) = n(n-1)/2 times, giving O(n²) time complexity.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 0(直觀) = 900
        {
            "id": "isort-q5",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對一個長度為 n 的陣列執行插入排序，總共會執行幾輪外層迴圈？",
                    "options": [
                        {"id": "A", "text": "n 輪"},
                        {"id": "B", "text": "n - 1 輪"},
                        {"id": "C", "text": "n / 2 輪"},
                        {"id": "D", "text": "n² 輪"},
                    ],
                    "explanation": "外層迴圈 `for i in range(1, n)` 從 1 執行到 n-1，共執行 n-1 輪。第一個元素（索引 0）作為初始已排序區不需處理。",
                },
                "en": {
                    "title": "How many outer loop iterations does Insertion Sort perform on an array of length n?",
                    "options": [
                        {"id": "A", "text": "n iterations"},
                        {"id": "B", "text": "n - 1 iterations"},
                        {"id": "C", "text": "n / 2 iterations"},
                        {"id": "D", "text": "n² iterations"},
                    ],
                    "explanation": "The outer loop `for i in range(1, n)` runs from 1 to n-1, executing n-1 iterations in total. The first element (index 0) serves as the initial sorted region and needs no processing.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 100(新手誤區：交換與移位易混淆) = 1000  → 950 to keep basic
        # baseRating = 800 + 50(SC) + 50(L1 定義) + 50(視覺干擾：一次 vs 三次賦值) = 950
        {
            "id": "isort-q9",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "插入排序在實作上使用「平移」而非「交換」，這樣做的主要優點是什麼？",
                    "options": [
                        {"id": "A", "text": "平移每次只需一次賦值操作，而交換通常需要三次（藉助暫存變數），減少了操作次數"},
                        {"id": "B", "text": "平移不需要暫存變數 key，節省記憶體"},
                        {"id": "C", "text": "平移的時間複雜度比交換更低"},
                        {"id": "D", "text": "平移可以讓演算法在未排序陣列上運行"},
                    ],
                    "explanation": "交換兩個元素需要 3 次賦值（temp = a; a = b; b = temp）。平移只需一次賦值（arr[j+1] = arr[j]），並在最後將 key 放入正確位置。整體操作次數更少，常數因子更小。",
                },
                "en": {
                    "title": "Insertion Sort uses 'shifting' instead of 'swapping'. What is the main advantage of this approach?",
                    "options": [
                        {"id": "A", "text": "Shifting requires only one assignment per step, while a swap typically needs three (using a temp variable), reducing the total number of operations"},
                        {"id": "B", "text": "Shifting does not need the temp variable key, saving memory"},
                        {"id": "C", "text": "Shifting has lower time complexity than swapping"},
                        {"id": "D", "text": "Shifting allows the algorithm to run on unsorted arrays"},
                    ],
                    "explanation": "Swapping two elements requires 3 assignments (temp = a; a = b; b = temp). Shifting only requires one assignment per step (arr[j+1] = arr[j]) and places key at the end. The overall number of operations is smaller, giving a smaller constant factor.",
                },
            },
        },
        # 【新增 Basic】
        # baseRating = 800 + 0(TF) + 50(L1 單一理論) + 0(直觀) = 850
        {
            "id": "isort-q19",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "插入排序需要額外分配一個與原陣列等長的輔助陣列來存放排序結果。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "錯誤。插入排序是原地排序（in-place），直接在原陣列上操作，只需要 O(1) 的額外空間（用於暫存 key 的一個變數），不需要額外的輔助陣列。",
                },
                "en": {
                    "title": "Insertion Sort requires allocating an auxiliary array of the same length as the input to store the sorted result.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "False. Insertion Sort is an in-place algorithm that operates directly on the original array. It only requires O(1) extra space (one variable to store the key) and does not need an auxiliary array.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 50(L1 定義) + 100(新手誤區：混淆線上/離線排序概念) = 1000  → 950 for basic
        # baseRating = 800 + 50(SC) + 50(L1 定義) + 50(視覺干擾：線上/離線術語) = 900
        {
            "id": "isort-q20",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "為什麼說插入排序適合「線上排序（Online Sorting）」場景？",
                    "options": [
                        {"id": "A", "text": "因為它的時間複雜度是 O(n log n)，比其他排序快"},
                        {"id": "B", "text": "因為它需要先知道所有資料才能開始排序"},
                        {"id": "C", "text": "因為它可以在資料逐一抵達時，立即將新元素插入已排序的序列，無須等待全部資料"},
                        {"id": "D", "text": "因為它只能用於網路傳輸的資料"},
                    ],
                    "explanation": "線上排序指的是資料可以「邊接收邊排序」。插入排序天然支援此場景：每當一筆新資料抵達，只需將它插入目前已排好序的部分即可，不需要等待所有資料都到齊再開始。",
                },
                "en": {
                    "title": "Why is Insertion Sort well suited for 'Online Sorting' scenarios?",
                    "options": [
                        {"id": "A", "text": "Because its time complexity is O(n log n), faster than other sorts"},
                        {"id": "B", "text": "Because it needs all the data upfront before it can start sorting"},
                        {"id": "C", "text": "Because it can immediately insert each new element into the already-sorted sequence as data arrives, without waiting for all data"},
                        {"id": "D", "text": "Because it can only be used for data transmitted over networks"},
                    ],
                    "explanation": "Online sorting means data can be 'sorted as it arrives'. Insertion Sort naturally supports this: whenever a new piece of data arrives, it simply inserts it into the already-sorted portion without waiting for all data to be available.",
                },
            },
        },
        # 【Application 應用】 1000-1399
        # baseRating = 800 + 50(SC) + 50(L1 單一理論) + 100(新手誤區：暫存目的不清) = 1000
        {
            "id": "isort-group-1",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "A",
            "groupId": "group-isort-logic",
            "translations": {
                "zh-TW": {
                    "title": "在題組的程式碼中，`key = arr[i]` 這行程式碼的目的是什麼？",
                    "options": [
                        {"id": "A", "text": "暫存當前要被插入的元素，防止它在平移過程中被覆蓋"},
                        {"id": "B", "text": "計算當前元素與下一個元素的差值"},
                        {"id": "C", "text": "記錄已排序區的最後一個元素"},
                        {"id": "D", "text": "作為迴圈的終止條件"},
                    ],
                    "explanation": "在平移過程中，arr[i] 的位置會被 arr[i-1] 覆蓋（arr[j+1] = arr[j]），因此需要在平移開始前先將 arr[i] 的值暫存到 key 中，之後才能將它放到正確位置。",
                },
                "en": {
                    "title": "In the group's code, what is the purpose of `key = arr[i]`?",
                    "options": [
                        {"id": "A", "text": "Temporarily store the element to be inserted so it is not overwritten during the shift"},
                        {"id": "B", "text": "Calculate the difference between the current element and the next"},
                        {"id": "C", "text": "Record the last element of the sorted region"},
                        {"id": "D", "text": "Serve as the loop termination condition"},
                    ],
                    "explanation": "During the shift process, the position arr[i] gets overwritten by arr[i-1] (arr[j+1] = arr[j]). Therefore, the value of arr[i] must be saved into key before shifting begins, so it can be placed at the correct position afterward.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 250(L3 多步狀態：追蹤三輪後陣列) + 100(新手誤區：i=1/2 易算錯) = 1200
        {
            "id": "isort-q8",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[5, 2, 4, 6, 1, 3]` 執行插入排序，當外層迴圈 `i=2`（即 `key=4`）執行完畢後，陣列的狀態為何？",
                    "options": [
                        {"id": "A", "text": "[2, 5, 4, 6, 1, 3]"},
                        {"id": "B", "text": "[2, 4, 5, 6, 1, 3]"},
                        {"id": "C", "text": "[2, 5, 6, 4, 1, 3]"},
                        {"id": "D", "text": "[1, 2, 4, 5, 6, 3]"},
                    ],
                    "explanation": "i=1 結束後已排序區為 [2, 5]。當 i=2，key=4 時，向左掃描找到第一個不大於 4 的位置並插入，最終 4 會被插入在 2 和 5 之間。右半部分 [6, 1, 3] 此輪不受影響。",
                },
                "en": {
                    "title": "When Insertion Sort is applied to `[5, 2, 4, 6, 1, 3]` and the outer loop `i=2` (key=4) completes, what is the array state?",
                    "options": [
                        {"id": "A", "text": "[2, 5, 4, 6, 1, 3]"},
                        {"id": "B", "text": "[2, 4, 5, 6, 1, 3]"},
                        {"id": "C", "text": "[2, 5, 6, 4, 1, 3]"},
                        {"id": "D", "text": "[1, 2, 4, 5, 6, 3]"},
                    ],
                    "explanation": "After i=1 the sorted region is [2, 5]. When i=2, key=4, scanning left finds the first position where the element is not greater than 4, and key is inserted between 2 and 5. The right portion [6, 1, 3] is unaffected this round.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 100(L2 多重比較：j+1 語意分析) + 100(新手誤區：j 與 j+1 混淆) = 1050  → 1000
        # baseRating = 800 + 50(SC) + 100(L2 多重比較) + 50(視覺干擾：j vs j+1) = 1000
        {
            "id": "isort-group-2",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "B",
            "groupId": "group-isort-logic",
            "translations": {
                "zh-TW": {
                    "title": "在題組程式碼中，`while` 迴圈結束後，`arr[j + 1] = key` 的 `j + 1` 代表什麼？",
                    "options": [
                        {"id": "A", "text": "已排序區的最後一個位置"},
                        {"id": "B", "text": "key 應該被插入的正確位置"},
                        {"id": "C", "text": "key 的原始位置"},
                        {"id": "D", "text": "第一個比 key 大的元素的位置"},
                    ],
                    "explanation": "while 迴圈在 j < 0 或 arr[j] <= key 時停止。此時 j 指向第一個不大於 key 的元素（或 -1），所以 j+1 就是 key 應被插入的位置，左邊所有元素都 <= key，右邊已被平移騰出空間。",
                },
                "en": {
                    "title": "In the group code, after the `while` loop ends, what does `j + 1` in `arr[j + 1] = key` represent?",
                    "options": [
                        {"id": "A", "text": "The last position of the sorted region"},
                        {"id": "B", "text": "The correct position where key should be inserted"},
                        {"id": "C", "text": "The original position of key"},
                        {"id": "D", "text": "The position of the first element greater than key"},
                    ],
                    "explanation": "The while loop stops when j < 0 or arr[j] <= key. At that point, j points to the first element not greater than key (or -1), so j+1 is where key should be inserted: all elements to its left are <= key, and the space to the right has been freed by the shift.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 100(L2 多重比較：穩定 vs 不穩定) + 50(視覺干擾：選項描述互相鏡像) = 1000
        {
            "id": "isort-q4",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "插入排序與選擇排序 (Selection Sort) 的主要區別是什麼？",
                    "options": [
                        {"id": "A", "text": "插入排序需要額外的記憶體空間，選擇排序不需要"},
                        {"id": "B", "text": "插入排序是穩定的，選擇排序通常是不穩定的"},
                        {"id": "C", "text": "插入排序的時間複雜度優於選擇排序"},
                        {"id": "D", "text": "插入排序每次找最小值，選擇排序每次插入一個元素"},
                    ],
                    "explanation": "插入排序使用嚴格大於比較（`arr[j] > key`），相等元素不移動，因此是穩定的。標準選擇排序透過遠距離交換，可能改變相同元素的相對順序，通常是不穩定的。兩者最壞時間複雜度都是 O(n²)。",
                },
                "en": {
                    "title": "What is the main difference between Insertion Sort and Selection Sort?",
                    "options": [
                        {"id": "A", "text": "Insertion Sort requires extra memory, Selection Sort does not"},
                        {"id": "B", "text": "Insertion Sort is stable, Selection Sort is typically not stable"},
                        {"id": "C", "text": "Insertion Sort has better time complexity than Selection Sort"},
                        {"id": "D", "text": "Insertion Sort finds the minimum each time, Selection Sort inserts one element each time"},
                    ],
                    "explanation": "Insertion Sort uses strict greater-than comparison (`arr[j] > key`), so equal elements are not moved, making it stable. Standard Selection Sort swaps elements at a distance, potentially changing the relative order of equal elements, making it typically unstable. Both have O(n²) worst-case time complexity.",
                },
            },
        },
        # baseRating = 800 + 100(MC) + 100(L2 多重比較) + 100(新手誤區：O(n²) 是否恆成立) = 1100
        {
            "id": "isort-multi-1",
            "type": "multiple-choice",
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些關於插入排序的陳述是正確的？（選擇所有正確答案）",
                    "options": [
                        {"id": "opt1", "text": "插入排序是一種原地 (in-place) 排序演算法，不需要額外的陣列"},
                        {"id": "opt2", "text": "插入排序的時間複雜度在所有情況下都是 O(n²)"},
                        {"id": "opt3", "text": "插入排序適合用在小型資料集或幾乎已排序的資料上"},
                        {"id": "opt4", "text": "插入排序是不穩定的排序演算法"},
                    ],
                    "explanation": "opt1 正確：插入排序直接在原陣列操作，只使用 O(1) 額外空間。opt3 正確：對小資料集或幾乎已排序的資料，插入排序開銷低，實際上比 O(n log n) 的演算法更快。opt2 錯誤：最佳情況是 O(n)。opt4 錯誤：插入排序是穩定的。",
                },
                "en": {
                    "title": "Which of the following statements about Insertion Sort are correct? (Select all that apply)",
                    "options": [
                        {"id": "opt1", "text": "Insertion Sort is an in-place sorting algorithm that requires no additional array"},
                        {"id": "opt2", "text": "Insertion Sort's time complexity is O(n²) in all cases"},
                        {"id": "opt3", "text": "Insertion Sort is well-suited for small datasets or nearly sorted data"},
                        {"id": "opt4", "text": "Insertion Sort is an unstable sorting algorithm"},
                    ],
                    "explanation": "opt1 is correct: Insertion Sort operates directly on the original array, using only O(1) extra space. opt3 is correct: for small datasets or nearly sorted data, Insertion Sort has low overhead and is in practice faster than O(n log n) algorithms. opt2 is wrong: the best case is O(n). opt4 is wrong: Insertion Sort is stable.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 250(L3 多步狀態：追蹤穩定性具體例子) + 100(新手誤區：重複元素相對順序) = 1200  → 1100
        # baseRating = 800 + 50(SC) + 150(L2 單步追蹤：穩定性驗證) + 100(新手誤區) = 1100
        {
            "id": "isort-q6",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[3, 1, 4, 1, 5]` 執行插入排序，全部完成後結果為何？以下哪個描述最準確地說明了穩定性在此例中的體現？",
                    "options": [
                        {"id": "A", "text": "結果為 [1, 1, 3, 4, 5]，但無法確定兩個 1 的相對順序"},
                        {"id": "B", "text": "結果為 [1, 1, 3, 4, 5]，原本在索引 1 的 1 仍在原本在索引 3 的 1 之前"},
                        {"id": "C", "text": "結果為 [1, 1, 3, 4, 5]，原本在索引 3 的 1 會在原本在索引 1 的 1 之前"},
                        {"id": "D", "text": "結果為 [1, 3, 1, 4, 5]，插入排序無法處理重複元素"},
                    ],
                    "explanation": "插入排序是穩定的。條件 `arr[j] > key`（嚴格大於）確保相等元素不會被平移，因此原本排在前面的元素（索引 1 的 1）在排序後仍然排在前面，維持原始相對順序。",
                },
                "en": {
                    "title": "After Insertion Sort is applied to `[3, 1, 4, 1, 5]`, the result is `[1, 1, 3, 4, 5]`. Which description best illustrates stability in this example?",
                    "options": [
                        {"id": "A", "text": "The result is [1, 1, 3, 4, 5], but the relative order of the two 1s cannot be determined"},
                        {"id": "B", "text": "The result is [1, 1, 3, 4, 5], and the 1 originally at index 1 is still before the 1 originally at index 3"},
                        {"id": "C", "text": "The result is [1, 1, 3, 4, 5], and the 1 originally at index 3 comes before the 1 originally at index 1"},
                        {"id": "D", "text": "The result is [1, 3, 1, 4, 5]; Insertion Sort cannot handle duplicate elements"},
                    ],
                    "explanation": "Insertion Sort is stable. The condition `arr[j] > key` (strictly greater than) ensures equal elements are not shifted, so the element that was originally in front (the 1 at index 1) remains in front after sorting, preserving the original relative order.",
                },
            },
        },
        # baseRating = 800 + 100(MC) + 100(L2 多重比較：三種共同特性) + 100(新手誤區：最佳時間複雜度誤以為O(n log n)) = 1100
        {
            "id": "isort-multi-2",
            "type": "multiple-choice",
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些是插入排序與氣泡排序 (Bubble Sort) 的共同特性？（選擇所有正確答案）",
                    "options": [
                        {"id": "opt1", "text": "兩者都是原地 (in-place) 排序演算法"},
                        {"id": "opt2", "text": "兩者的最壞情況時間複雜度都是 O(n²)"},
                        {"id": "opt3", "text": "兩者都是穩定的排序演算法"},
                        {"id": "opt4", "text": "兩者在最佳情況下的時間複雜度都是 O(n log n)"},
                    ],
                    "explanation": "opt1 正確：兩者都只用 O(1) 額外空間。opt2 正確：兩者最壞情況都是 O(n²)。opt3 正確：兩者都是穩定排序（相等元素不交換）。opt4 錯誤：兩者最佳情況都是 O(n)，不是 O(n log n)。",
                },
                "en": {
                    "title": "Which of the following are shared characteristics of Insertion Sort and Bubble Sort? (Select all that apply)",
                    "options": [
                        {"id": "opt1", "text": "Both are in-place sorting algorithms"},
                        {"id": "opt2", "text": "Both have O(n²) worst-case time complexity"},
                        {"id": "opt3", "text": "Both are stable sorting algorithms"},
                        {"id": "opt4", "text": "Both have O(n log n) best-case time complexity"},
                    ],
                    "explanation": "opt1 is correct: both use only O(1) extra space. opt2 is correct: both have O(n²) worst case. opt3 is correct: both are stable (equal elements are not swapped). opt4 is wrong: both have O(n) best case, not O(n log n).",
                },
            },
        },
        # baseRating = 800 + 150(PL) + 250(L3 多步狀態：追蹤逐行執行) + 150(極端邊界：j<0 終止) = 1350  → 調 1300
        # baseRating = 800 + 150(PL) + 250(L3 多步狀態) + 100(新手誤區：while 再次進入與否) = 1300
        {
            "id": "isort-pred-1",
            "type": "predict-line",
            "baseRating": 1300,
            "correctAnswer": "1 2 3 4 5 6 7 5 8 9",
            "code": ISORT_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[3, 1]` 呼叫 `insertion_sort([3, 1])`，請依序寫出每次被執行到的行號（以空格分隔）。",
                    "options": [],
                    "explanation": "關鍵在於 while 迴圈（L5）：進入迴圈體後，j 遞減至 -1，再回到 L5 時條件不成立才退出。因此 L5 會被執行**兩次**（一次 true、一次 false）。掌握「條件失敗仍算一次執行」這個規律，就能正確算出行號序列。",
                },
                "en": {
                    "title": "Calling `insertion_sort([3, 1])` on `[3, 1]`, write the line numbers executed in order (space-separated).",
                    "options": [],
                    "explanation": "The key is the while loop (L5): after entering the loop body, j decrements to -1, then L5 is re-evaluated and the condition fails, exiting. So L5 executes **twice** — once true, once false. Remembering that a failed condition still counts as one execution of that line is the key to producing the correct sequence.",
                },
            },
        },
        # 【新增 Application】
        # baseRating = 800 + 50(SC) + 250(L3 多步狀態：追蹤完整五輪排序) + 100(新手誤區：最小值插到最左邊的過程) = 1200
        {
            "id": "isort-q21",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[4, 3, 2, 1]` 執行插入排序，全部完成後結果為 `[1, 2, 3, 4]`。在整個過程中，元素 `1`（原本在索引 3）總共被平移了幾次？",
                    "options": [
                        {"id": "A", "text": "0 次"},
                        {"id": "B", "text": "1 次"},
                        {"id": "C", "text": "2 次"},
                        {"id": "D", "text": "3 次"},
                    ],
                    "explanation": "每次掃描到一個比 key 大的左側元素，就觸發一次平移。而 key=1 在這個陣列中是最小值，意味著它需要一路掃到陣列最左端才能停止。從 key 的起始位置往左，有幾個元素比它大，就會觸發幾次平移。",
                },
                "en": {
                    "title": "After Insertion Sort completes on `[4, 3, 2, 1]`, producing `[1, 2, 3, 4]`, how many total shifts were triggered by inserting element `1` (originally at index 3)?",
                    "options": [
                        {"id": "A", "text": "0 shifts"},
                        {"id": "B", "text": "1 shift"},
                        {"id": "C", "text": "2 shifts"},
                        {"id": "D", "text": "3 shifts"},
                    ],
                    "explanation": "Each element to the left of key that is greater than key triggers one shift. Since key=1 is the minimum value in the array, it must scan all the way to the leftmost position. Count how many elements to the left of key's starting position are greater than it — that is the number of shifts.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 100(L2 多重比較：常數係數 vs 漸近複雜度的權衡) + 100(新手誤區：誤以為O(n log n)總是優於O(n²)) = 1050
        {
            "id": "isort-q22",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "Python 的內建排序演算法 Timsort 在處理小型子陣列（通常少於 64 個元素）時，會切換使用插入排序。以下哪個原因最能說明這個設計決策？",
                    "options": [
                        {"id": "A", "text": "插入排序的時間複雜度是 O(n log n)，與合併排序相同，且實作更簡單"},
                        {"id": "B", "text": "合併排序在小規模資料上的比較次數比插入排序多，因此插入排序在任何規模下都更快"},
                        {"id": "C", "text": "大 O 分析忽略常數係數：對小規模資料，插入排序簡單的迴圈結構遠比合併排序的遞迴呼叫與合併開銷輕量，實際執行速度更快"},
                        {"id": "D", "text": "插入排序是穩定排序，而合併排序是不穩定排序，Timsort 必須使用插入排序才能維持穩定性"},
                    ],
                    "explanation": "大 O 分析只描述漸近趨勢，忽略常數係數。對小規模資料，插入排序的簡單迴圈結構使得常數係數遠小於合併排序的遞迴與合併開銷，實際執行速度更快。D 是干擾選項：合併排序本身也是穩定排序。",
                },
                "en": {
                    "title": "Python's built-in Timsort switches to Insertion Sort when handling small sub-arrays (typically fewer than 64 elements). Which reason best explains this design decision?",
                    "options": [
                        {"id": "A", "text": "Insertion Sort has O(n log n) time complexity, the same as Merge Sort, but is simpler to implement"},
                        {"id": "B", "text": "Merge Sort makes more comparisons than Insertion Sort on small data, so Insertion Sort is faster at every scale"},
                        {"id": "C", "text": "Big-O analysis ignores constant factors: for small data, Insertion Sort's simple loop structure is far lighter than Merge Sort's recursive calls and merge overhead, making it faster in practice"},
                        {"id": "D", "text": "Insertion Sort is stable while Merge Sort is unstable, so Timsort must use Insertion Sort to preserve stability"},
                    ],
                    "explanation": "Big-O only describes asymptotic behaviour and ignores constant factors. For small data, Insertion Sort's simple loop has a far smaller constant than Merge Sort's recursion and merge overhead, making it faster in practice. Option D is a distractor: Merge Sort is also a stable sort.",
                },
            },
        },
        # 【Complexity 進階】 ≥1400
        # baseRating = 800 + 150(FC) + 400(L4 複雜控制流：雙條件 while + 越界) + 150(極端邊界：j=-1 越界) = 1500
        {
            "id": "isort-group-3",
            "type": "fill-code",
            "baseRating": 1500,
            "correctAnswer": ["j >= 0", "collection[j] > key", "j + 1"],
            "groupId": "group-isort-logic",
            "code": ISORT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成 `insertion_sort` 函式。",
                    "options": [],
                    "explanation": "三個空格各自守護一個核心邏輯：(a) 負責防止索引超出陣列左端；(b) 負責決定「是否繼續平移」的比較條件，注意這裡要用嚴格大於以維持穩定性；(c) 負責在迴圈結束後，把 key 放回到正確的空位——思考迴圈結束時 j 停在哪裡，空位又在哪裡。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the `insertion_sort` function.",
                    "options": [],
                    "explanation": "Each blank guards one core piece of logic: (a) prevents the index from going past the left end of the array; (b) determines the comparison condition for 'keep shifting' — note the comparison must be strict greater-than to preserve stability; (c) places key into the correct gap after the loop ends — think about where j lands when the loop stops, and where the empty slot is.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 250(L3 多步狀態：gap 收斂過程推理) + 100(新手誤區：與 merge sort / binary insertion 混淆) = 1200
        {
            "id": "isort-q7",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "希爾排序 (Shell Sort) 是插入排序的一種改進版本，專門解決插入排序在大間距逆序元素上效率低的問題。它的核心機制是什麼？",
                    "options": [
                        {"id": "A", "text": "先以遞迴方式將陣列分成兩半分別排序，再合併——與合併排序相同"},
                        {"id": "B", "text": "用二分搜尋取代線性掃描來找插入位置，減少比較次數，但不改變平移次數"},
                        {"id": "C", "text": "以較大的間距（gap）分組執行插入排序，讓元素快速靠近目標位置，再逐步縮小 gap 直到 1，此時大部分元素已接近有序"},
                        {"id": "D", "text": "每輪找到全域最小值並放到最前面，重複 n-1 輪完成排序"},
                    ],
                    "explanation": "插入排序的瓶頸在於遠距離元素必須一步一步平移。希爾排序用大 gap 讓元素「跨越」多個位置，快速接近目標，大幅減少後續小 gap 時的平移量。B 描述的是二元插入排序（Binary Insertion Sort），D 描述的是選擇排序。",
                },
                "en": {
                    "title": "Shell Sort is an improvement of Insertion Sort, designed to fix its inefficiency with far-apart out-of-order elements. What is its core mechanism?",
                    "options": [
                        {"id": "A", "text": "Recursively splits the array in half, sorts each half separately, then merges — identical to Merge Sort"},
                        {"id": "B", "text": "Replaces linear scanning with binary search to find the insertion position, reducing comparisons but not shifts"},
                        {"id": "C", "text": "Groups elements by a larger gap and runs Insertion Sort on each group, letting elements jump closer to their target quickly; then shrinks the gap to 1, by which point most elements are nearly sorted"},
                        {"id": "D", "text": "Finds the global minimum each round and places it at the front, repeated n-1 times"},
                    ],
                    "explanation": "Insertion Sort's bottleneck is that distant elements must shift one step at a time. Shell Sort uses a large gap so elements 'leap' many positions at once, greatly reducing the shift count in later small-gap passes. Option B describes Binary Insertion Sort; option D describes Selection Sort.",
                },
            },
        },
        # baseRating = 800 + 150(FC) + 400(L4 複雜控制流：遞迴追蹤 n-1 模式) + 150(極端邊界：n<=1 base case) = 1500
        {
            "id": "isort-fill-1",
            "type": "fill-code",
            "baseRating": 1500,
            "correctAnswer": ["1", "n - 1", "last"],
            "code": RECURSIVE_ISORT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成遞迴版本的插入排序。",
                    "options": [],
                    "explanation": "三個空格對應遞迴設計的三個關鍵決策：(a) 遞迴的終止條件——問自己「最小的已排序情況是幾個元素？」；(b) 遞迴呼叫的子問題規模——每次要縮小多少？(c) 子問題解決後，剩下要處理的是哪個元素，它應該放在哪裡？",
                },
                "en": {
                    "title": "Fill in the correct code to complete the recursive version of Insertion Sort.",
                    "options": [],
                    "explanation": "The three blanks correspond to three key decisions in the recursive design: (a) the base case — ask yourself 'what is the smallest already-sorted situation?'; (b) the sub-problem size for the recursive call — how much does it shrink each time? (c) after the sub-problem is solved, which element still needs to be handled, and where should it go?",
                },
            },
        },
        # 【新增 Complexity】
        # baseRating = 800 + 50(SC) + 400(L4 複雜控制流：最壞交換次數公式推導) + 150(極端邊界：完全逆序) = 1400
        {
            "id": "isort-q23",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "對長度為 n 的完全逆序陣列執行插入排序，內層 `while` 迴圈的總執行次數（即平移操作總次數）為何？",
                    "options": [
                        {"id": "A", "text": "n"},
                        {"id": "B", "text": "n²"},
                        {"id": "C", "text": "n(n-1)/2"},
                        {"id": "D", "text": "n(n+1)/2"},
                    ],
                    "explanation": "想想完全逆序時，外層第 i 輪最多會執行幾次內層平移？把每輪的最大平移次數加總起來，就是總次數。這個加總的結果是一個著名的等差數列公式。注意區分 n(n-1)/2 與 n(n+1)/2——前者從 1 加到 n-1，後者從 1 加到 n。",
                },
                "en": {
                    "title": "For a fully reversed array of length n, how many total times does the inner `while` loop execute (i.e., the total number of shift operations)?",
                    "options": [
                        {"id": "A", "text": "n"},
                        {"id": "B", "text": "n²"},
                        {"id": "C", "text": "n(n-1)/2"},
                        {"id": "D", "text": "n(n+1)/2"},
                    ],
                    "explanation": "For a fully reversed array, ask yourself: at outer loop iteration i, what is the maximum number of inner shifts? Sum those maximums across all rounds — the result is a well-known arithmetic series formula. Pay attention to the difference between n(n-1)/2 and n(n+1)/2: the former sums 1 through n-1, the latter sums 1 through n.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 400(L4 複雜控制流：二分搜尋改寫插入位置的效能分析) + 150(極端邊界：比較次數 vs 移位次數分離) = 1400
        {
            "id": "isort-q24",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "「二元插入排序（Binary Insertion Sort）」改用二分搜尋找插入位置。相較於標準插入排序，它改善了哪個維度的效能？",
                    "options": [
                        {"id": "A", "text": "減少了比較次數（從 O(n²) 降至 O(n log n)），但平移次數不變，整體時間複雜度仍為 O(n²)"},
                        {"id": "B", "text": "同時減少了比較次數與平移次數，整體時間複雜度降至 O(n log n)"},
                        {"id": "C", "text": "只減少了平移次數，比較次數不變"},
                        {"id": "D", "text": "改善了空間複雜度，從 O(1) 降至 O(log n)"},
                    ],
                    "explanation": "二分搜尋只負責「找到插入位置在哪」，但找到位置後，為了騰出空間，左側較大的元素仍必須逐一向右移動。這兩件事是分開的——比較與平移各自由不同機制決定，改善其中一個不一定能改善另一個。",
                },
                "en": {
                    "title": "Binary Insertion Sort uses binary search to find the insertion position. Compared to standard Insertion Sort, which dimension of performance does it improve?",
                    "options": [
                        {"id": "A", "text": "Reduces comparisons (from O(n²) to O(n log n)), but shift count is unchanged, so overall time complexity remains O(n²)"},
                        {"id": "B", "text": "Reduces both comparisons and shifts, bringing overall time complexity down to O(n log n)"},
                        {"id": "C", "text": "Only reduces the number of shifts; comparisons are unchanged"},
                        {"id": "D", "text": "Improves space complexity from O(1) to O(log n)"},
                    ],
                    "explanation": "Binary search only handles 'finding where to insert'. After the position is found, elements to its left still have to shift right one by one to make room. These are two separate operations — comparisons and shifts are governed by different mechanisms, so improving one does not necessarily improve the other.",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 400(L4 複雜控制流：迴圈不變量推理) + 250(複合陷阱：不變量違反時機+正確性推理) = 1500
        {
            "id": "isort-q25",
            "type": "single-choice",
            "baseRating": 1500,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "插入排序維持一個重要的「迴圈不變量（Loop Invariant）」：在外層迴圈每次迭代開始時，子陣列 `arr[0..i-1]` 一定是已排序的。以下哪個操作若存在，會違反此不變量？",
                    "options": [
                        {"id": "A", "text": "內層 while 使用嚴格大於（>），而非大於等於（>=）"},
                        {"id": "B", "text": "平移完成後，漏寫最後一行 `arr[j+1] = key`，直接進入下一輪"},
                        {"id": "C", "text": "外層迴圈從 i=1 而非 i=0 開始"},
                        {"id": "D", "text": "使用 while 迴圈而非 for 迴圈執行內層平移"},
                    ],
                    "explanation": "迴圈不變量要求每輪結束後左側區間是有序的。平移操作會在左側留下一個「空洞」（arr[j+1] 被覆寫後成為舊值的副本），若漏寫 `arr[j+1] = key`，key 就永遠消失、空洞未填，左側區間出現重複值，不變量被破壞。使用嚴格大於（A）只影響穩定性而不破壞有序性；從 i=1 開始（C）是正確的設計。",
                },
                "en": {
                    "title": "Insertion Sort maintains a key 'Loop Invariant': at the start of each outer loop iteration, the sub-array `arr[0..i-1]` is always sorted. Which operation, if present, would violate this invariant?",
                    "options": [
                        {"id": "A", "text": "The inner while uses strict greater-than (>) instead of greater-than-or-equal (>=)"},
                        {"id": "B", "text": "After shifting completes, omitting the final line `arr[j+1] = key` and proceeding to the next round"},
                        {"id": "C", "text": "The outer loop starts at i=1 instead of i=0"},
                        {"id": "D", "text": "Using a while loop instead of a for loop for the inner shifting"},
                    ],
                    "explanation": "The loop invariant requires the left region to be sorted after each round. The shift operation leaves a 'hole' (arr[j+1] becomes a stale copy). If `arr[j+1] = key` is omitted, key is lost and the hole unfilled, creating a duplicate in the left region and breaking the invariant. Using strict greater-than (A) only affects stability, not sorted order; starting at i=1 (C) is correct by design.",
                },
            },
        },
        # baseRating = 800 + 150(PL) + 400(L4 複雜控制流：追蹤含重複元素的穩定性行號) + 150(極端邊界：相等元素 while 不執行) = 1500
        {
            "id": "isort-pred-2",
            "type": "predict-line",
            "baseRating": 1500,
            "correctAnswer": "1 2 3 4 5 8 2 3 4 5 8 9",
            "code": ISORT_PREDICT_CODE_2,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[1, 1]` 呼叫 `insertion_sort([1, 1])`，請依序寫出每次被執行到的行號（以空格分隔）。",
                    "options": [],
                    "explanation": "此題的關鍵在於 while 條件（L5）遇到相等元素時的行為：條件使用嚴格大於（>），相等時**不成立**，迴圈體完全不執行。思考：從 L4 設好 j 之後，L5 的結果是什麼？接下來直接跳到哪一行？與 `[3, 1]` 那題相比，這裡少了哪幾個步驟？",
                },
                "en": {
                    "title": "Calling `insertion_sort([1, 1])` on `[1, 1]`, write the line numbers executed in order (space-separated).",
                    "options": [],
                    "explanation": "The key is the behaviour of the while condition (L5) with equal elements: the condition uses strict greater-than (>), which is false for equal values, so the loop body is never entered. Think: after L4 sets up j, what does L5 evaluate to? Which line comes next? Compared to the `[3, 1]` case, which steps are missing here?",
                },
            },
        },
        # baseRating = 800 + 150(FC) + 400(L4 複雜控制流：二分搜尋找插入點 + 邊界收斂) + 250(複合陷阱：lo=mid+1 vs hi=mid 的方向判斷) = 1600
        {
            "id": "isort-fill-2",
            "type": "fill-code",
            "baseRating": 1600,
            "correctAnswer": ["i", "mid + 1", "lo"],
            "code": ISORT_BINARY_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成「二元插入排序（Binary Insertion Sort）」，其使用二分搜尋找到每個元素的插入位置。",
                    "options": [],
                    "explanation": "三個空格對應二分搜尋「邊界設定 → 邊界收縮 → 取結果」三個步驟：(a) 要搜尋的範圍右端是哪裡？已排序區的長度是多少？(b) 當 arr[mid] 不大於 key 時，插入點在 mid 的哪一側？lo 應該往哪個方向移動？(c) 搜尋結束時，lo 與 hi 重合——這個位置代表什麼語義？",
                },
                "en": {
                    "title": "Fill in the correct code to complete Binary Insertion Sort, which uses binary search to find each element's insertion position.",
                    "options": [],
                    "explanation": "The three blanks map to the three steps of binary search — 'set bounds → shrink bounds → read result': (a) where is the right end of the search range? How long is the sorted region? (b) when arr[mid] is not greater than key, which side of mid is the insertion point, and which direction should lo move? (c) when the search ends lo and hi converge — what does that position mean?",
                },
            },
        },
        # baseRating = 800 + 50(SC) + 600(L5 系統級分析：最壞情況交換次數公式的逆向推導與情境辨別) + 250(複合陷阱：同時需要判斷陣列大小與逆序程度) = 1700
        {
            "id": "isort-q26",
            "type": "single-choice",
            "baseRating": 1700,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "有一個長度為 n 的陣列，對它執行插入排序後，統計到內層 while 迴圈總共執行了 `k` 次。以下哪個說法正確描述了 `k` 的含義與範圍？",
                    "options": [
                        {"id": "A", "text": "k 代表外層迴圈的執行輪數，範圍是 0 ≤ k ≤ n"},
                        {"id": "B", "text": "k 代表陣列中元素被交換的次數，範圍是 0 ≤ k ≤ n²"},
                        {"id": "C", "text": "k 代表元素比較次數，範圍是 n-1 ≤ k ≤ n(n-1)/2"},
                        {"id": "D", "text": "k 代表陣列中「逆序對（inversions）」的數量，範圍是 0 ≤ k ≤ n(n-1)/2"},
                    ],
                    "explanation": "插入排序的內層 while 迴圈每執行一次，恰好消除一個「逆序對」（inversion）：一個在排序前位置靠前但值較大的元素往右移動一格，消除了它與 key 的逆序關係。因此 k 恰好等於原陣列的逆序對總數。最少為 0（已排序），最多為 n(n-1)/2（完全逆序）。",
                },
                "en": {
                    "title": "After running Insertion Sort on an array of length n, the inner while loop executed a total of `k` times. Which statement correctly describes the meaning and range of `k`?",
                    "options": [
                        {"id": "A", "text": "k is the number of outer loop iterations, range 0 ≤ k ≤ n"},
                        {"id": "B", "text": "k is the number of element swaps, range 0 ≤ k ≤ n²"},
                        {"id": "C", "text": "k is the number of comparisons, range n-1 ≤ k ≤ n(n-1)/2"},
                        {"id": "D", "text": "k is the number of 'inversions' in the array, range 0 ≤ k ≤ n(n-1)/2"},
                    ],
                    "explanation": "Each execution of the inner while loop eliminates exactly one 'inversion': an element that is positionally before but larger than the key shifts right by one, removing that inversion. Therefore k equals the total number of inversions in the original array. The minimum is 0 (already sorted) and the maximum is n(n-1)/2 (fully reversed).",
                },
            },
        },
        # baseRating = 800 + 100(MC) + 400(L4 複雜控制流：多維度特性分析) + 100(新手誤區：binary insertion 誤以為整體加速、Timsort 需求誤解) = 1400
        {
            "id": "isort-q27",
            "type": "multiple-choice",
            "baseRating": 1400,
            "correctAnswer": ["opt1", "opt3", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "關於插入排序的進階特性，以下哪些陳述正確？（選擇所有正確答案）",
                    "options": [
                        {"id": "opt1", "text": "插入排序的執行時間（平移次數）與輸入資料的「逆序對數量」完全相等"},
                        {"id": "opt2", "text": "使用二分搜尋改寫插入排序後，整體時間複雜度可降至 O(n log n)"},
                        {"id": "opt3", "text": "Timsort 在小子陣列上選用插入排序，主因是它對近乎有序的短資料有極低的常數開銷，且是穩定排序"},
                        {"id": "opt4", "text": "在鏈結串列上實作插入排序時，找到插入點後只需調整指標，省去了陣列實作中的 O(n) 平移開銷"},
                    ],
                    "explanation": "opt1 正確：插入排序每次平移恰好消除一個逆序對，總平移次數 = 逆序對總數。opt2 錯誤：二元插入排序只將比較次數降至 O(n log n)，但平移次數仍為 O(n²)，整體複雜度不變。opt3 正確：Timsort 選用插入排序的理由是對短 run 的實際效能（低常數）以及穩定性——注意不是因為 in-place，Python Timsort 合併階段本身有 O(n) 輔助空間。opt4 正確：鏈結串列插入只需重接前後指標，不必平移。",
                },
                "en": {
                    "title": "Regarding the advanced properties of Insertion Sort, which of the following statements are correct? (Select all that apply)",
                    "options": [
                        {"id": "opt1", "text": "Insertion Sort's running time (shift count) exactly equals the number of 'inversions' in the input data"},
                        {"id": "opt2", "text": "Using binary search in Insertion Sort reduces the overall time complexity to O(n log n)"},
                        {"id": "opt3", "text": "Timsort uses Insertion Sort for small sub-arrays primarily because it has very low constant overhead on nearly-sorted short data and is a stable sort"},
                        {"id": "opt4", "text": "When Insertion Sort is implemented on a linked list, finding the insertion point requires only pointer adjustments, eliminating the O(n) shifting cost of an array implementation"},
                    ],
                    "explanation": "opt1 correct: each shift eliminates exactly one inversion; total shifts = total inversions. opt2 wrong: Binary Insertion Sort reduces comparisons to O(n log n) but shifts remain O(n²), so overall complexity is unchanged. opt3 correct: Timsort chooses Insertion Sort for its practical low-constant performance on short nearly-sorted runs and its stability — note that in-place is NOT the reason; Python Timsort's merge phase uses O(n) auxiliary space. opt4 correct: a linked list insert only relinks two pointers.",
                },
            },
        },
    ],
}

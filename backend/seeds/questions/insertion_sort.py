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
        # 【Basic 基礎】 800-950
        {
            "id": "isort-q1",
            "type": "single-choice",
            "baseRating": 800,
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
        # 【Application 應用】 1000-1250
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
        {
            "id": "isort-q8",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[5, 2, 4, 6, 1, 3]` 執行插入排序，當外層迴圈 `i=2`（即 `key=4`）執行完畢後，陣列的狀態為何？",
                    "options": [
                        {"id": "A", "text": "[2, 4, 5, 6, 1, 3]"},
                        {"id": "B", "text": "[2, 4, 5, 6, 1, 3]"},
                        {"id": "C", "text": "[2, 5, 4, 6, 1, 3]"},
                        {"id": "D", "text": "[1, 2, 4, 5, 6, 3]"},
                    ],
                    "explanation": "i=1 後已排序區為 [2,5]。i=2，key=4，j=1。arr[1]=5>4，平移，arr[2]=5，j=0。arr[0]=2<4，停止。arr[1]=4。結果：[2, 4, 5, 6, 1, 3]。",
                },
                "en": {
                    "title": "When Insertion Sort is applied to `[5, 2, 4, 6, 1, 3]` and the outer loop `i=2` (key=4) completes, what is the array state?",
                    "options": [
                        {"id": "A", "text": "[2, 4, 5, 6, 1, 3]"},
                        {"id": "B", "text": "[2, 4, 5, 6, 1, 3]"},
                        {"id": "C", "text": "[2, 5, 4, 6, 1, 3]"},
                        {"id": "D", "text": "[1, 2, 4, 5, 6, 3]"},
                    ],
                    "explanation": "After i=1 the sorted region is [2,5]. At i=2, key=4, j=1. arr[1]=5>4, shift: arr[2]=5, j=0. arr[0]=2<4, stop. arr[1]=4. Result: [2, 4, 5, 6, 1, 3].",
                },
            },
        },
        {
            "id": "isort-group-2",
            "type": "single-choice",
            "baseRating": 1100,
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
        {
            "id": "isort-q4",
            "type": "single-choice",
            "baseRating": 1100,
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
        {
            "id": "isort-q5",
            "type": "single-choice",
            "baseRating": 1150,
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
        {
            "id": "isort-q9",
            "type": "single-choice",
            "baseRating": 1150,
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
        {
            "id": "isort-multi-1",
            "type": "multiple-choice",
            "baseRating": 1200,
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
        {
            "id": "isort-q6",
            "type": "single-choice",
            "baseRating": 1250,
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
        # 【Complexity 進階】 1300-1500
        {
            "id": "isort-group-3",
            "type": "fill-code",
            "baseRating": 1300,
            "correctAnswer": ["j >= 0", "collection[j] > key", "j + 1"],
            "groupId": "group-isort-logic",
            "code": ISORT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成 `insertion_sort` 函式。",
                    "options": [],
                    "explanation": "(a) `j >= 0`：確保索引不越界，j 到達 -1 時停止平移。(b) `collection[j] > key`：只有當左邊的元素大於 key 時，才繼續平移。(c) `j + 1`：迴圈結束後，j+1 就是 key 應插入的正確位置。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the `insertion_sort` function.",
                    "options": [],
                    "explanation": "(a) `j >= 0`: ensures the index stays in bounds; shifting stops when j reaches -1. (b) `collection[j] > key`: only shift if the element to the left is greater than key. (c) `j + 1`: after the loop ends, j+1 is the correct position to insert key.",
                },
            },
        },
        {
            "id": "isort-q7",
            "type": "single-choice",
            "baseRating": 1350,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "希爾排序 (Shell Sort) 是插入排序的一種改進版本。它如何改善了插入排序的效能？",
                    "options": [
                        {"id": "A", "text": "它將陣列分成兩半，分別用插入排序，然後合併"},
                        {"id": "B", "text": "它先用選擇排序找到最小值，再用插入排序完成剩餘部分"},
                        {"id": "C", "text": "它先以較大的間距 (gap) 進行插入排序，使元素快速靠近目標位置，再逐步縮小間距直到間距為 1"},
                        {"id": "D", "text": "它使用二分搜尋來找到每個元素的插入位置，減少比較次數"},
                    ],
                    "explanation": "希爾排序透過「分組間距插入排序」來解決插入排序遠距離移動效率低的問題。先用大間距排序，讓遠距離的元素快速到達大致正確的位置，再逐漸縮小間距，最後間距為 1 時就是標準插入排序，但此時大部分元素已接近有序，效率大幅提升。",
                },
                "en": {
                    "title": "Shell Sort is an improvement of Insertion Sort. How does it improve performance?",
                    "options": [
                        {"id": "A", "text": "It splits the array in half, applies Insertion Sort to each half, then merges them"},
                        {"id": "B", "text": "It first uses Selection Sort to find the minimum, then Insertion Sort for the rest"},
                        {"id": "C", "text": "It first applies Insertion Sort with a large gap so elements quickly approach their target positions, then progressively reduces the gap until it reaches 1"},
                        {"id": "D", "text": "It uses Binary Search to find the insertion position of each element, reducing comparisons"},
                    ],
                    "explanation": "Shell Sort addresses the inefficiency of Insertion Sort's long-distance moves by using 'gap-based insertion sort'. It first sorts with a large gap so distant elements quickly reach roughly the right position, then gradually reduces the gap. When the gap reaches 1 it becomes standard Insertion Sort, but by then most elements are nearly sorted, greatly improving efficiency.",
                },
            },
        },
        {
            "id": "isort-multi-2",
            "type": "multiple-choice",
            "baseRating": 1400,
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
        {
            "id": "isort-fill-1",
            "type": "fill-code",
            "baseRating": 1450,
            "correctAnswer": ["1", "n - 1", "last"],
            "code": RECURSIVE_ISORT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成遞迴版本的插入排序。",
                    "options": [],
                    "explanation": "(a) `1`：基本情況，當只有 1 個或更少元素時直接返回，不需要排序。(b) `n - 1`：先遞迴排序前 n-1 個元素。(c) `last`：while 迴圈結束後，將暫存的最後一個元素放入正確位置。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the recursive version of Insertion Sort.",
                    "options": [],
                    "explanation": "(a) `1`: base case, when there is 1 or fewer elements return immediately, no sorting needed. (b) `n - 1`: first recursively sort the first n-1 elements. (c) `last`: after the while loop ends, place the saved last element into its correct position.",
                },
            },
        },
        {
            "id": "isort-pred-1",
            "type": "predict-line",
            "baseRating": 1500,
            "correctAnswer": "1 2 3 4 5 6 7 5 8 9",
            "code": ISORT_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[3, 1]` 呼叫 `insertion_sort([3, 1])`，請依序寫出每次被執行到的行號（以空格分隔）。",
                    "options": [],
                    "explanation": "L1(定義) → L2(i=1) → L3(key=1) → L4(j=0) → L5(j>=0 且 arr[0]=3>1，true) → L6(arr[1]=3) → L7(j=-1) → L5(j<0，false，退出迴圈) → L8(arr[0]=1) → L2(range結束) → L9(return)。行號：1 2 3 4 5 6 7 5 8 9。",
                },
                "en": {
                    "title": "Calling `insertion_sort([3, 1])` on `[3, 1]`, write the line numbers executed in order (space-separated).",
                    "options": [],
                    "explanation": "L1(def) → L2(i=1) → L3(key=1) → L4(j=0) → L5(j>=0 and arr[0]=3>1, true) → L6(arr[1]=3) → L7(j=-1) → L5(j<0, false, exit loop) → L8(arr[0]=1) → L2(range ends) → L9(return). Lines: 1 2 3 4 5 6 7 5 8 9.",
                },
            },
        },
    ],
}

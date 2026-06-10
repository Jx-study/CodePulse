MERGE_SORT_CODE = """def merge_sort(arr):
    if len(arr) <= 1:         # L2
        return arr            # L3
    mid = len(arr) // 2       # L4
    left = merge_sort(arr[:mid])   # L5
    right = merge_sort(arr[mid:])  # L6
    return merge(left, right)      # L7

def merge(left, right):
    result = []               # L9
    i = j = 0                 # L10
    while i < len(left) and j < len(right):  # L11
        if left[i] <= right[j]:              # L12
            result.append(left[i])           # L13
            i += 1                           # L14
        else:
            result.append(right[j])          # L16
            j += 1                           # L17
    result.extend(left[i:])   # L18
    result.extend(right[j:])  # L19
    return result              # L20"""

MERGE_GROUP_CODE = """def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result"""

MERGE_FILL_CODE = """def merge_sort(arr):
    if (a):
        return arr
    mid = len(arr) // 2
    left = merge_sort((b))
    right = merge_sort((c))
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result"""

MERGE_PREDICT_CODE = """def merge_sort(arr):          # L1
    if len(arr) <= 1:             # L2
        return arr                # L3
    mid = len(arr) // 2           # L4
    left = merge_sort(arr[:mid])  # L5
    right = merge_sort(arr[mid:]) # L6
    return merge(left, right)     # L7

def merge(left, right):           # L8
    result = []                   # L9
    i = j = 0                     # L10
    while i < len(left) and j < len(right):  # L11
        if left[i] <= right[j]:              # L12
            result.append(left[i])           # L13
            i += 1                           # L14
        else:
            result.append(right[j])          # L16
            j += 1                           # L17
    result.extend(left[i:])       # L18
    result.extend(right[j:])      # L19
    return result                 # L20"""

DATA = {
    "slug": "merge-sort",
    "groups": [
        {
            "id": "merge-sort-group-1",
            "code": MERGE_GROUP_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "題組：合併函式追蹤",
                    "description": "以下是 Merge Sort 的核心 merge() 函式。仔細觀察雙指標邏輯並回答問題。",
                },
                "en": {
                    "title": "Group: Merge Function Tracing",
                    "description": "The following is the core merge() function of Merge Sort. Study the dual-pointer logic carefully and answer the questions.",
                },
            },
        }
    ],
    "questions": [
        # ────────────────── Basic 基礎（<1000）── 10 題 ──────────────────

        # [核心概念] 800 + 0(true-false) + 50(L1定義) + 0(直觀) = 850
        {
            "id": "merge-sort-q1",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "Merge Sort 採用分治法（Divide and Conquer），會將陣列不斷對半拆解，直到每個子陣列只剩一個元素，再逐步合併還原。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "Merge Sort 的核心策略正是分治法：先遞迴地將問題拆小（Divide），再在合併（Conquer）時完成排序。單一元素的子陣列天然有序，是遞迴的終止條件。",
                },
                "en": {
                    "title": "Merge Sort uses Divide and Conquer — it repeatedly splits the array in half until each sub-array has only one element, then merges them back in sorted order.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Merge Sort's core strategy is Divide and Conquer: recursively break the problem down (Divide), then sort during the merge (Conquer). A single-element sub-array is trivially sorted and serves as the base case.",
                },
            },
        },

        # [核心概念] 800 + 50(single) + 50(L1定義) + 50(視覺干擾) = 900
        {
            "id": "merge-sort-q2",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "Merge Sort 被稱為「先樂後苦」的排序演算法，這句話的含意是什麼？",
                    "options": [
                        {"id": "A", "text": "Split 階段也需要比較元素大小，才能決定從哪裡切分"},
                        {"id": "B", "text": "排序發生在 Split 階段，Merge 只是把結果合回去"},
                        {"id": "C", "text": "對半拆解陣列十分容易，但如何正確合併兩個已排序子陣列才是實作難點"},
                        {"id": "D", "text": "遞迴呼叫本身很耗效能，所以前段「苦」、合併完成後才「樂」"},
                    ],
                    "explanation": "「先樂」指的是 Divide 階段——只需計算中點並遞迴，不需要任何比較或決策。「後苦」指的是 Merge 階段——需要雙指標逐一比較兩子陣列並依序放入暫存空間，是整個演算法最容易寫錯的核心。",
                },
                "en": {
                    "title": "Merge Sort is described as having an \"easy split, hard merge\" characteristic. What does this mean?",
                    "options": [
                        {"id": "A", "text": "The split phase also requires comparing elements to decide where to cut"},
                        {"id": "B", "text": "Sorting happens during the split phase; merge just reassembles the results"},
                        {"id": "C", "text": "Splitting the array in half is trivial, but correctly merging two sorted sub-arrays is the real implementation challenge"},
                        {"id": "D", "text": "The recursive calls themselves are expensive, so the early phase is 'hard' and only becomes 'easy' after merging"},
                    ],
                    "explanation": "The 'easy' part is the Divide phase — just compute the midpoint and recurse, no comparisons or decisions needed. The 'hard' part is the Merge phase — dual pointers must compare elements from two sub-arrays one by one and place them into auxiliary space, which is where most implementation bugs appear.",
                },
            },
        },

        # [操作複雜度] 800 + 0(true-false) + 50(L1定義) + 0(直觀) = 850
        {
            "id": "merge-sort-q3",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "Merge Sort 在最佳、平均、最壞三種情況下的時間複雜度都是 O(n log n)，不受輸入資料的初始排列順序影響。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "無論輸入已排序、反序還是隨機，Merge Sort 的遞迴深度都是 log n，每層都需要走訪 n 個元素進行合併，所以三種情況都是 O(n log n)。這與 Quick Sort 截然不同，Quick Sort 最壞情況會退化到 O(n²)。",
                },
                "en": {
                    "title": "Merge Sort has O(n log n) time complexity in the best, average, and worst cases, regardless of the initial order of the input.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "Whether the input is sorted, reversed, or random, Merge Sort's recursion depth is always log n, and each level requires traversing n elements during the merge. This gives O(n log n) in all three cases — unlike Quick Sort, which degrades to O(n²) in the worst case.",
                },
            },
        },

        # [操作複雜度] 800 + 50(single) + 50(L1定義) + 0(直觀) = 900
        {
            "id": "merge-sort-q4",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "Merge Sort 的空間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(1)，因為排序發生在原始陣列上"},
                        {"id": "B", "text": "O(n)，因為合併時需要額外的暫存陣列"},
                        {"id": "C", "text": "O(log n)，因為遞迴深度是 log n"},
                        {"id": "D", "text": "O(n log n)，與時間複雜度相同"},
                    ],
                    "explanation": "Merge Sort 是非原地排序。每次 merge 需要配置一個與兩子陣列加總大小相當的暫存陣列，整個演算法執行期間最多需要 O(n) 的額外空間。遞迴呼叫堆疊雖然是 O(log n)，但主要空間開銷來自合併時的暫存。",
                },
                "en": {
                    "title": "What is the space complexity of Merge Sort?",
                    "options": [
                        {"id": "A", "text": "O(1), because sorting happens in the original array"},
                        {"id": "B", "text": "O(n), because merging requires an auxiliary array"},
                        {"id": "C", "text": "O(log n), because the recursion depth is log n"},
                        {"id": "D", "text": "O(n log n), same as the time complexity"},
                    ],
                    "explanation": "Merge Sort is not in-place. Each merge requires allocating an auxiliary array proportional to the combined size of the two sub-arrays, so the total extra space needed is O(n). The recursion call stack is O(log n), but the dominant space cost comes from the temporary merge buffer.",
                },
            },
        },

        # [核心概念 / 穩定排序] 800 + 50(single) + 50(L1定義) + 0(直觀) = 900
        {
            "id": "merge-sort-q5",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "Merge Sort 是穩定排序（Stable Sort）。下列哪個條件保證了這個穩定性？",
                    "options": [
                        {"id": "A", "text": "合併時比較條件使用 ≤（小於等於），遇到相同值時優先取左側元素"},
                        {"id": "B", "text": "每次都從最小元素開始合併"},
                        {"id": "C", "text": "採用遞迴實作，遞迴本身具有穩定性"},
                        {"id": "D", "text": "每次都將陣列對半切，確保兩側長度相等"},
                    ],
                    "explanation": "在 merge 函式的比較條件 `left[i] <= right[j]` 中，當兩個值相等時，優先取左側（`left[i]`）並讓左指標前進。因為左半邊在原陣列中排在右半邊前面，這個選擇保留了相同元素的原始相對順序，從而實現穩定排序。",
                },
                "en": {
                    "title": "Merge Sort is a stable sort. Which condition guarantees this stability?",
                    "options": [
                        {"id": "A", "text": "The merge comparison uses ≤ (less than or equal), so when values are equal, the left element is picked first"},
                        {"id": "B", "text": "Merging always starts from the smallest element"},
                        {"id": "C", "text": "The recursive implementation inherently provides stability"},
                        {"id": "D", "text": "Splitting always in half ensures both sides have equal length"},
                    ],
                    "explanation": "In the merge function's condition `left[i] <= right[j]`, when two values are equal, the left element (`left[i]`) is chosen and the left pointer advances. Since the left half originally appeared before the right half in the array, this choice preserves the original relative order of equal elements, achieving stable sorting.",
                },
            },
        },

        # [適合處理的問題] 800 + 50(single) + 50(L1定義) + 50(視覺干擾) = 950
        {
            "id": "merge-sort-q6",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "為什麼 Merge Sort 特別適合對鏈結串列（Linked List）排序，而 Quick Sort 卻不然？",
                    "options": [
                        {"id": "A", "text": "兩者時間複雜度相同，但 Merge Sort 不需要 pivot，對串列更安全"},
                        {"id": "B", "text": "Quick Sort 在串列上也可以 O(n log n)，但 Merge Sort 需要額外空間所以反而更差"},
                        {"id": "C", "text": "Merge Sort 使用遞迴，串列天然支援遞迴走訪，因此相容性更好"},
                        {"id": "D", "text": "Quick Sort 的 partition 需要以索引隨機存取任意節點，鏈結串列做不到；Merge Sort 合併時只需順序推進兩個指標"},
                    ],
                    "explanation": "鏈結串列無法 O(1) 隨機存取任意位置。Quick Sort 的 partition 步驟需要在陣列上快速跳躍定位，這在串列上退化成 O(n)。Merge Sort 的合併只需要兩個各自順序前進的指標，完全不需要隨機存取，是鏈結串列排序的最佳選擇。",
                },
                "en": {
                    "title": "Why is Merge Sort particularly well-suited for sorting a Linked List, while Quick Sort is not?",
                    "options": [
                        {"id": "A", "text": "Both have the same time complexity, but Merge Sort needs no pivot so it is safer on lists"},
                        {"id": "B", "text": "Quick Sort can also run in O(n log n) on lists, but Merge Sort needs extra space so it is actually worse"},
                        {"id": "C", "text": "Merge Sort uses recursion and linked lists naturally support recursive traversal, so they are more compatible"},
                        {"id": "D", "text": "Quick Sort's partition needs indexed random access to arbitrary nodes, which linked lists cannot do; Merge Sort only advances two pointers sequentially during the merge"},
                    ],
                    "explanation": "A linked list cannot access an arbitrary node in O(1) time. Quick Sort's partition step requires rapid positional jumps that degrade to O(n) on a list. Merge Sort's merge only needs two pointers each advancing one step at a time, with zero random access, making it the optimal choice for linked list sorting.",
                },
            },
        },

        # [遞迴執行順序] 800 + 50(single) + 100(L2比較) + 100(新手誤區) = 1050 → 調低至 950 (L1定義+視覺干擾)
        # [遞迴執行順序] 800 + 50(single) + 50(L1定義) + 50(視覺干擾) = 950
        {
            "id": "merge-sort-q7",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[4, 2, 1, 3]` 執行 Merge Sort，程式碼實際的遞迴執行順序是什麼？",
                    "options": [
                        {"id": "A", "text": "逐層同時拆分：先把 [4,2] 和 [1,3] 都拆好，再一起處理"},
                        {"id": "B", "text": "先一路往左遞迴到底：[4,2,1,3] → [4,2] → [4]，再回頭處理 [2]，然後才是右半邊"},
                        {"id": "C", "text": "先找最小值 1，再依序插入其他元素"},
                        {"id": "D", "text": "先拆右半邊 [1,3]，再拆左半邊 [4,2]"},
                    ],
                    "explanation": "程式碼呼叫 `left = merge_sort(arr[:mid])` 後，會立刻遞迴進入左半邊，一路深入到單元素才開始回溯。靜態圖解讓人誤以為兩側同時分裂，但實際執行路徑是先把整棵左子樹跑完，才會輪到右子樹。",
                },
                "en": {
                    "title": "When Merge Sort is applied to `[4, 2, 1, 3]`, what is the actual recursion execution order?",
                    "options": [
                        {"id": "A", "text": "Split level by level simultaneously: split [4,2] and [1,3] first, then process together"},
                        {"id": "B", "text": "Recursively dive all the way down the left first: [4,2,1,3] → [4,2] → [4], then backtrack to [2], only then handle the right half"},
                        {"id": "C", "text": "Find the minimum value 1 first, then insert the remaining elements in order"},
                        {"id": "D", "text": "Split the right half [1,3] first, then the left half [4,2]"},
                    ],
                    "explanation": "After calling `left = merge_sort(arr[:mid])`, the program immediately recurses into the left half, diving all the way down to a single element before backtracking. Static diagrams create the illusion of simultaneous level-by-level splits, but the actual execution path completes the entire left subtree before touching the right subtree.",
                },
            },
        },

        # [可以優化什麼] 800 + 50(single) + 50(L1定義) + 0(直觀) = 900
        {
            "id": "merge-sort-q8",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在以下哪個場景中，Merge Sort 是最不適合的選擇？",
                    "options": [
                        {"id": "A", "text": "對儲存在硬碟上的超大型檔案（外部排序）進行排序"},
                        {"id": "B", "text": "需要保留相同分數學生原始名次的成績排序"},
                        {"id": "C", "text": "嵌入式裝置上對一個 10 個元素的小陣列排序，記憶體極為有限"},
                        {"id": "D", "text": "對一個包含一百萬個節點的鏈結串列進行排序"},
                    ],
                    "explanation": "Merge Sort 需要 O(n) 的額外輔助空間，在記憶體極度受限的嵌入式環境中代價過高。對 10 個元素的小陣列，Insertion Sort 的 O(1) 空間且低常數係數是更佳選擇。Merge Sort 的優勢在於大資料、鏈結串列與穩定排序需求。",
                },
                "en": {
                    "title": "In which of the following scenarios is Merge Sort the least suitable choice?",
                    "options": [
                        {"id": "A", "text": "Sorting a very large file stored on disk (external sorting)"},
                        {"id": "B", "text": "Sorting student scores while preserving the original rank of students with equal scores"},
                        {"id": "C", "text": "Sorting a 10-element array on an embedded device with extremely limited memory"},
                        {"id": "D", "text": "Sorting a linked list containing one million nodes"},
                    ],
                    "explanation": "Merge Sort requires O(n) auxiliary space, which is too costly in memory-constrained embedded environments. For a 10-element array, Insertion Sort with O(1) space and low constant factors is the better choice. Merge Sort's strengths are large datasets, linked lists, and stable sort requirements.",
                },
            },
        },

        # [關鍵的合併步驟] 800 + 50(single) + 100(L2動態想像) + 50(視覺干擾) = 1000 → 調為 basic 上限 950
        # [關鍵的合併步驟] 800 + 50(single) + 50(L1定義) + 50(視覺干擾) = 950
        {
            "id": "merge-sort-q9",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "在 merge([1, 3, 5], [2, 4]) 執行完畢後，結果陣列為何？",
                    "options": [
                        {"id": "A", "text": "[1, 2, 3, 4, 5]"},
                        {"id": "B", "text": "[1, 3, 5, 2, 4]"},
                        {"id": "C", "text": "[2, 4, 1, 3, 5]"},
                        {"id": "D", "text": "[1, 2, 3, 4, 5, 5]"},
                    ],
                    "explanation": "雙指標逐步比較：1<2 取1、2<3 取2、3<4 取3、4<5 取4。此時 right 已耗盡，left 剩餘的 [5] 直接 extend 至尾端，得 [1,2,3,4,5]。這道題展示了 merge 函式中「剩餘元素直接接尾」的重要邏輯。",
                },
                "en": {
                    "title": "After merge([1, 3, 5], [2, 4]) finishes, what is the result array?",
                    "options": [
                        {"id": "A", "text": "[1, 2, 3, 4, 5]"},
                        {"id": "B", "text": "[1, 3, 5, 2, 4]"},
                        {"id": "C", "text": "[2, 4, 1, 3, 5]"},
                        {"id": "D", "text": "[1, 2, 3, 4, 5, 5]"},
                    ],
                    "explanation": "The dual pointers compare step by step: 1<2 pick 1, 2<3 pick 2, 3<4 pick 3, 4<5 pick 4. At that point right is exhausted, and the remaining [5] from left is extended to the tail, giving [1,2,3,4,5]. This demonstrates the critical 'extend remaining elements' logic in the merge function.",
                },
            },
        },

        # [適合處理的問題 / 反轉對] 800 + 50(single) + 100(L2比較) + 0(直觀) = 950
        {
            "id": "merge-sort-q10",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "「計算反轉對（Counting Inversions）」是指統計陣列中所有「前大後小」的元素配對數。為何 Merge Sort 能在合併步驟中順便計算這個數值？",
                    "options": [
                        {"id": "A", "text": "因為 Merge Sort 會將陣列排成遞增序，最後比對原陣列即可算出差異"},
                        {"id": "B", "text": "每當右半邊的元素比左半邊某位置的元素小，左半邊該位置到末端的所有元素都與這個右半邊元素構成反轉對"},
                        {"id": "C", "text": "因為遞迴深度 log n 等於最大可能的反轉對數"},
                        {"id": "D", "text": "合併時若發生交換，就計數加一"},
                    ],
                    "explanation": "在 merge 時，若 right[j] < left[i]，代表 right[j] 比 left 中從 i 到末端的所有元素都小——這些都是反轉對，一次可累加 `len(left) - i` 個。Merge Sort 已經在做左右比較，這個計數幾乎是零成本的附加資訊。",
                },
                "en": {
                    "title": "Counting Inversions means counting all 'earlier-larger, later-smaller' pairs in an array. Why can Merge Sort count this during the merge step?",
                    "options": [
                        {"id": "A", "text": "Because Merge Sort produces a sorted array, and inversions can be counted by comparing with the original"},
                        {"id": "B", "text": "Whenever a right-half element is smaller than a left-half element at position i, all elements from i to the end of the left half form inversion pairs with that right-half element"},
                        {"id": "C", "text": "Because the recursion depth log n equals the maximum possible number of inversion pairs"},
                        {"id": "D", "text": "Every time a swap occurs during merge, the count increments by one"},
                    ],
                    "explanation": "During merge, if right[j] < left[i], then right[j] is smaller than every element from left[i] to the end of left — all of these are inversion pairs, so we can add `len(left) - i` at once. Since Merge Sort already compares left and right, this count comes almost for free.",
                },
            },
        },

        # ────────────────── Application 應用（1000–1399）── 10 題 ──────────────────

        # [關鍵的合併步驟 / 題組] 800 + 50(single) + 100(L2動態) + 100(新手誤區) = 1050
        {
            "id": "merge-sort-q11",
            "type": "single-choice",
            "baseRating": 1050,
            "groupId": "merge-sort-group-1",
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "在題組程式碼中，`while` 迴圈結束後，為什麼需要 `result.extend(left[i:])` 和 `result.extend(right[j:])`？",
                    "options": [
                        {"id": "A", "text": "這是錯誤的，merge 函式不需要這兩行"},
                        {"id": "B", "text": "用來重置 i 和 j 指標以便下次使用"},
                        {"id": "C", "text": "while 迴圈在其中一個子陣列耗盡時就停止，另一個可能還有剩餘元素，必須全部接到結果尾端"},
                        {"id": "D", "text": "用來將結果陣列反轉成降序"},
                    ],
                    "explanation": "while 迴圈的條件是兩個指標都未越界，只要有一個陣列走完就退出。這時另一個陣列的剩餘元素已經是有序的（子問題已解決），直接接尾即可，不需再比較。遺漏這兩行是 merge 函式最常見的 bug 來源。",
                },
                "en": {
                    "title": "In the group code, why are `result.extend(left[i:])` and `result.extend(right[j:])` needed after the while loop?",
                    "options": [
                        {"id": "A", "text": "They are wrong; the merge function does not need these two lines"},
                        {"id": "B", "text": "They reset the i and j pointers for the next use"},
                        {"id": "C", "text": "The while loop stops when one sub-array is exhausted; the other may still have remaining elements that must all be appended to the result"},
                        {"id": "D", "text": "They reverse the result array into descending order"},
                    ],
                    "explanation": "The while loop exits as soon as either pointer goes out of bounds. The remaining elements in the other sub-array are already sorted (the sub-problem is solved), so they can be appended directly without further comparison. Forgetting these two lines is the most common bug in the merge function.",
                },
            },
        },

        # [關鍵的合併步驟 / 題組] 800 + 50(single) + 250(L3多步追蹤) + 50(視覺干擾) = 1150
        {
            "id": "merge-sort-q12",
            "type": "single-choice",
            "baseRating": 1150,
            "groupId": "merge-sort-group-1",
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "呼叫 `merge([1, 4], [2, 3])` 時，while 迴圈中 `result.append()` 被呼叫了幾次？",
                    "options": [
                        {"id": "A", "text": "2 次"},
                        {"id": "B", "text": "3 次"},
                        {"id": "C", "text": "4 次"},
                        {"id": "D", "text": "5 次"},
                    ],
                    "explanation": "追蹤執行：1<2 → append(1), i=1；2<4 → append(2), j=1；3<4 → append(3), j=2。此時 j=2=len(right)，right 耗盡，while 退出。共呼叫 3 次。剩餘的 [4] 由 result.extend(left[1:]) 補上，不在 while 內計算。",
                },
                "en": {
                    "title": "When calling `merge([1, 4], [2, 3])`, how many times is `result.append()` called inside the while loop?",
                    "options": [
                        {"id": "A", "text": "2 times"},
                        {"id": "B", "text": "3 times"},
                        {"id": "C", "text": "4 times"},
                        {"id": "D", "text": "5 times"},
                    ],
                    "explanation": "Tracing: 1<2 → append(1), i=1; 2<4 → append(2), j=1; 3<4 → append(3), j=2. At this point j=2=len(right), right is exhausted, while exits. Total: 3 calls. The remaining [4] is added by result.extend(left[1:]) outside the while loop.",
                },
            },
        },

        # [遞迴執行順序] 800 + 50(single) + 250(L3多步) + 100(新手誤區) = 1200
        {
            "id": "merge-sort-q13",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[3, 1, 2]` 執行 Merge Sort，完整排序後第一個被合併（merge 函式第一次被呼叫）的兩個子陣列是什麼？",
                    "options": [
                        {"id": "A", "text": "merge([3], [1, 2])"},
                        {"id": "B", "text": "merge([3, 1], [2])"},
                        {"id": "C", "text": "merge([3], [1])"},
                        {"id": "D", "text": "merge([1], [2])"},
                    ],
                    "explanation": "遞迴優先深入左子樹再處理右子樹。外層 mid=1，左=[3] 只有一個元素直接返回。接著進入右半邊 [1,2]，其 mid=1，左=[1]、右=[2] 各為單元素立即返回，然後才呼叫 merge。因此 merge 第一次被呼叫時處理的是 [1,2] 的兩半，而非外層的 [3] 與 [1,2]。",
                },
                "en": {
                    "title": "When Merge Sort is applied to `[3, 1, 2]`, which are the first two sub-arrays to be merged (the first call to the merge function)?",
                    "options": [
                        {"id": "A", "text": "merge([3], [1, 2])"},
                        {"id": "B", "text": "merge([3, 1], [2])"},
                        {"id": "C", "text": "merge([3], [1])"},
                        {"id": "D", "text": "merge([1], [2])"},
                    ],
                    "explanation": "Recursion always completes the left subtree before the right. The outer call has mid=1; the left sub-array [3] is a single element and returns immediately. Then the right sub-array [1,2] is entered: its mid=1 produces [1] and [2], both single elements that return immediately, and merge is called on them. So the very first merge call processes the two halves of [1,2], not the outer [3] and [1,2].",
                },
            },
        },

        # [操作複雜度 / 比較] 800 + 50(single) + 100(L2多重比較) + 100(新手誤區) = 1050
        {
            "id": "merge-sort-q14",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "Merge Sort 與 Quick Sort 同為常見的 O(n log n) 排序演算法，下列比較何者正確？",
                    "options": [
                        {"id": "A", "text": "兩者平均時間相同，且都需要 O(n) 額外空間"},
                        {"id": "B", "text": "Quick Sort 需要 O(n) 額外空間；Merge Sort 是原地排序，空間複雜度 O(1)"},
                        {"id": "C", "text": "Merge Sort 在大量重複值時會退化成 O(n²)；Quick Sort 則不受影響"},
                        {"id": "D", "text": "Merge Sort 三種情況都是 O(n log n)；Quick Sort 在 pivot 每次都選到極端值時，可能退化到 O(n²)"},
                    ],
                    "explanation": "Merge Sort 的遞迴樹深度固定是 log n，無論輸入如何分布，三種情況都是 O(n log n)，但需要 O(n) 額外輔助空間。Quick Sort 幾乎原地排序（只用 O(log n) 遞迴堆疊），但若 pivot 每次都選到最大或最小值，partition 不均勻，退化成 O(n²)。",
                },
                "en": {
                    "title": "Both Merge Sort and Quick Sort are common O(n log n) sorting algorithms. Which comparison is correct?",
                    "options": [
                        {"id": "A", "text": "Both have the same average time and both need O(n) extra space"},
                        {"id": "B", "text": "Quick Sort needs O(n) extra space; Merge Sort is in-place with O(1) space complexity"},
                        {"id": "C", "text": "Merge Sort degrades to O(n²) with many duplicate values; Quick Sort is unaffected"},
                        {"id": "D", "text": "Merge Sort is O(n log n) in all three cases; Quick Sort can degrade to O(n²) when the pivot is always the extreme value"},
                    ],
                    "explanation": "Merge Sort's recursion tree is always log n levels deep regardless of input, giving O(n log n) in all three cases, but it requires O(n) auxiliary space. Quick Sort is nearly in-place (O(log n) call stack only), but if the pivot is always the min or max, partitions are completely unbalanced and it degrades to O(n²).",
                },
            },
        },

        # [關鍵的合併步驟] 800 + 100(multiple) + 100(L2比較) + 100(新手誤區) = 1100
        {
            "id": "merge-sort-q15",
            "type": "multiple-choice",
            "baseRating": 1100,
            "correctAnswer": ["opt2", "opt3", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "以下關於 Merge Sort 中 merge() 函式的陳述，哪些是正確的？（選擇所有正確答案）",
                    "options": [
                        {"id": "opt1", "text": "merge() 在原始陣列上就地合併，不需要額外空間"},
                        {"id": "opt2", "text": "merge() 使用雙指標分別追蹤兩個子陣列的進度"},
                        {"id": "opt3", "text": "當兩個值相等時，取左半邊的元素能保證穩定排序"},
                        {"id": "opt4", "text": "兩個指標的 while 迴圈結束後，必須將剩餘元素全數接到結果尾端"},
                    ],
                    "explanation": "opt1 錯：merge 需要配置與輸入等長的暫存陣列，是 Merge Sort O(n) 空間複雜度的來源。opt2 正確：i 追蹤 left，j 追蹤 right。opt3 正確：`left[i] <= right[j]` 確保相等時取左側，保留原始順序。opt4 正確：while 在任一陣列耗盡即退出，剩餘元素必須 extend。",
                },
                "en": {
                    "title": "Which of the following statements about the merge() function in Merge Sort are correct? (Select all that apply)",
                    "options": [
                        {"id": "opt1", "text": "merge() merges in-place on the original array and requires no extra space"},
                        {"id": "opt2", "text": "merge() uses dual pointers to track progress in each of the two sub-arrays"},
                        {"id": "opt3", "text": "When two values are equal, taking the left element guarantees stable sorting"},
                        {"id": "opt4", "text": "After the while loop for both pointers ends, all remaining elements must be appended to the result"},
                    ],
                    "explanation": "opt1 is wrong: merge needs to allocate an auxiliary array equal in length to the input — this is the source of Merge Sort's O(n) space complexity. opt2 is correct: i tracks left, j tracks right. opt3 is correct: `left[i] <= right[j]` ensures the left element is taken when equal, preserving original order. opt4 is correct: the while loop exits as soon as either array is exhausted, so remaining elements must be extended.",
                },
            },
        },

        # [遞迴執行順序] 800 + 50(single) + 250(L3多步) + 0(直觀) = 1100
        {
            "id": "merge-sort-q16",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[5, 3, 8, 1]` 執行 Merge Sort，排序完全結束前共呼叫了幾次 merge() 函式？",
                    "options": [
                        {"id": "A", "text": "3 次"},
                        {"id": "B", "text": "2 次"},
                        {"id": "C", "text": "4 次"},
                        {"id": "D", "text": "6 次"},
                    ],
                    "explanation": "每一次 merge 呼叫對應遞迴樹上的一個「非葉節點」。n=4 的陣列有 4 個葉節點，因此有 3 個非葉節點，即 3 次 merge。可以想：每個元素最終都被合併到根，過程中恰好形成 n-1 次兩兩合併。",
                },
                "en": {
                    "title": "When Merge Sort is applied to `[5, 3, 8, 1]`, how many times is merge() called in total before sorting is complete?",
                    "options": [
                        {"id": "A", "text": "3 times"},
                        {"id": "B", "text": "2 times"},
                        {"id": "C", "text": "4 times"},
                        {"id": "D", "text": "6 times"},
                    ],
                    "explanation": "Each merge call corresponds to one internal node in the recursion tree. An array of n=4 has 4 leaf nodes, so it has 3 internal nodes — meaning 3 merge calls. Think of it this way: every element must eventually be merged up to the root, and that process produces exactly n-1 pairwise merges.",
                },
            },
        },

        # [可以優化什麼 / 外部排序] 800 + 50(single) + 100(L2比較) + 100(新手誤區) = 1050
        {
            "id": "merge-sort-q17",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "外部排序（External Sorting）是指資料無法全部載入記憶體的排序情境。為什麼 Merge Sort 是外部排序的標準選擇？",
                    "options": [
                        {"id": "A", "text": "因為可以平行切分多個磁碟區塊，Quick Sort 沒有類似機制"},
                        {"id": "B", "text": "因為 Merge Sort 的合併步驟天然支援「讀取兩個有序區塊並寫出一個有序區塊」的流式處理模式"},
                        {"id": "C", "text": "因為 Merge Sort 穩定排序，磁碟讀寫次序需要保持一致"},
                        {"id": "D", "text": "因為 Merge Sort 需要的記憶體比 Quick Sort 少，適合磁碟環境"},
                    ],
                    "explanation": "外部排序的核心挑戰是每次只能從磁碟載入一小塊資料。Merge Sort 的 merge 步驟只需持有兩個有序「run」的當前元素進行比較，然後順序寫出，完全符合流式讀寫模式。其他排序法通常需要隨機存取整個資料集，在磁碟上代價極高。",
                },
                "en": {
                    "title": "External sorting refers to sorting data that cannot all fit in memory. Why is Merge Sort the standard choice for external sorting?",
                    "options": [
                        {"id": "A", "text": "Because multiple disk blocks can be split in parallel; Quick Sort has no comparable mechanism"},
                        {"id": "B", "text": "Because Merge Sort's merge step naturally supports a streaming pattern: read two sorted blocks, write one sorted block"},
                        {"id": "C", "text": "Because Merge Sort is a stable sort and disk read/write order must remain consistent"},
                        {"id": "D", "text": "Because Merge Sort uses less memory than Quick Sort, making it better suited for disk environments"},
                    ],
                    "explanation": "The core challenge of external sorting is that only a small chunk of data can be loaded from disk at a time. Merge Sort's merge step only needs the current element from two sorted 'runs' to compare and then writes sequentially — a perfect fit for streaming I/O. Other sorting algorithms typically need random access across the full dataset, which is prohibitively expensive on disk.",
                },
            },
        },

        # [核心概念 / 穩定排序應用] 800 + 50(single) + 100(L2比較) + 100(新手誤區) = 1050
        {
            "id": "merge-sort-q18",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[(Alice, 85), (Bob, 90), (Carol, 85), (Dave, 90)]`（姓名, 分數）先以分數降序排序，若使用 Merge Sort，排序後結果為何？",
                    "options": [
                        {"id": "A", "text": "[(Bob, 90), (Dave, 90), (Alice, 85), (Carol, 85)]（兩個 90 的相對順序改變）"},
                        {"id": "B", "text": "[(Dave, 90), (Bob, 90), (Carol, 85), (Alice, 85)]（完全顛倒）"},
                        {"id": "C", "text": "無法確定，Merge Sort 不保證相同鍵值的順序"},
                        {"id": "D", "text": "[(Bob, 90), (Dave, 90), (Alice, 85), (Carol, 85)]（相同分數保持原始順序）"},
                    ],
                    "explanation": "Merge Sort 是穩定排序，相同鍵值的元素保持原始相對順序。Bob（索引 1）在 Dave（索引 3）之前出現，兩者分數相同，排序後 Bob 仍在 Dave 前面。同理 Alice 在 Carol 前面。這正是需要穩定排序的典型應用場景。",
                },
                "en": {
                    "title": "Given `[(Alice, 85), (Bob, 90), (Carol, 85), (Dave, 90)]` (name, score), sorted by score in descending order using Merge Sort, what is the result?",
                    "options": [
                        {"id": "A", "text": "[(Bob, 90), (Dave, 90), (Alice, 85), (Carol, 85)] (relative order of the two 90s is changed)"},
                        {"id": "B", "text": "[(Dave, 90), (Bob, 90), (Carol, 85), (Alice, 85)] (completely reversed)"},
                        {"id": "C", "text": "Undefined — Merge Sort does not guarantee order among equal keys"},
                        {"id": "D", "text": "[(Bob, 90), (Dave, 90), (Alice, 85), (Carol, 85)] (equal scores preserve original order)"},
                    ],
                    "explanation": "Merge Sort is a stable sort, so elements with equal keys preserve their original relative order. Bob (index 1) appears before Dave (index 3) with the same score, so Bob remains before Dave after sorting. Similarly, Alice remains before Carol. This is a classic use case for stable sorting.",
                },
            },
        },

        # [關鍵的合併步驟] 800 + 50(single) + 250(L3多步) + 100(新手誤區) = 1200
        {
            "id": "merge-sort-q19",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "合併 `left = [2, 5, 7]` 與 `right = [1, 3, 6, 8]` 的過程中，指標 `i` 與 `j` 在 while 迴圈最後一次執行完畢時分別是多少？",
                    "options": [
                        {"id": "A", "text": "i=3, j=4"},
                        {"id": "B", "text": "i=2, j=3"},
                        {"id": "C", "text": "i=3, j=3"},
                        {"id": "D", "text": "i=2, j=4"},
                    ],
                    "explanation": "while 迴圈在「其中一方先耗盡」時停止。關鍵在於找到哪個指標先到達邊界：left 有 3 個元素（i=0,1,2），right 有 4 個（j=0,1,2,3）。兩個陣列交錯比較時，left 的 7 在最後一輪輸給 right[3]=8 之前就使 i 到達 3，right 此時 j 仍在 3，尚未越界，所以 while 因 i=len(left) 而退出，剩餘的 right[3]=8 由 extend 補上。",
                },
                "en": {
                    "title": "When merging `left = [2, 5, 7]` and `right = [1, 3, 6, 8]`, what are the values of pointer `i` and `j` after the while loop's final iteration?",
                    "options": [
                        {"id": "A", "text": "i=3, j=4"},
                        {"id": "B", "text": "i=2, j=3"},
                        {"id": "C", "text": "i=3, j=3"},
                        {"id": "D", "text": "i=2, j=4"},
                    ],
                    "explanation": "The while loop stops as soon as one side is exhausted. The key is which pointer reaches its boundary first: left has 3 elements (i can go to 3), right has 4 (j can go to 4). As the two arrays interleave, left's 7 is compared against right[3]=8 last, advancing i to 3 and exhausting left, while j is still at 3. The loop exits because i=len(left), and the remaining right[3]=8 is appended by extend.",
                },
            },
        },

        # [遞迴執行順序 / 操作複雜度] 800 + 50(single) + 100(L2比較) + 150(極端邊界) = 1100
        {
            "id": "merge-sort-q20",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對長度為 1 的陣列 `[42]` 呼叫 `merge_sort([42])`，程式會執行哪些步驟？",
                    "options": [
                        {"id": "A", "text": "計算 mid、遞迴左右兩半、再合併"},
                        {"id": "B", "text": "直接回傳 [42]，不進行任何拆分或合併"},
                        {"id": "C", "text": "拋出 IndexError，因為無法取 arr[mid:]"},
                        {"id": "D", "text": "呼叫 merge([], [42]) 並回傳結果"},
                    ],
                    "explanation": "基本情況（base case）是 `if len(arr) <= 1: return arr`。長度為 1 的陣列直接回傳，這是遞迴終止條件，也是「單一元素天然有序」的體現。這個邊界條件若缺少，遞迴將無法終止。",
                },
                "en": {
                    "title": "When `merge_sort([42])` is called on an array of length 1, what steps does the program take?",
                    "options": [
                        {"id": "A", "text": "Compute mid, recurse on both halves, then merge"},
                        {"id": "B", "text": "Return [42] immediately without any splitting or merging"},
                        {"id": "C", "text": "Raise IndexError because arr[mid:] cannot be taken"},
                        {"id": "D", "text": "Call merge([], [42]) and return the result"},
                    ],
                    "explanation": "The base case is `if len(arr) <= 1: return arr`. An array of length 1 is returned immediately — this is the recursion termination condition and reflects the fact that a single element is trivially sorted. Without this boundary condition, recursion would never terminate.",
                },
            },
        },

        # ────────────────── Complexity 進階（≥1400）── 10 題 ──────────────────

        # [關鍵的合併步驟 / fill-code] 800 + 150(fill) + 100(L2動態) + 150(極端邊界) = 1200
        {
            "id": "merge-sort-q21",
            "type": "fill-code",
            "baseRating": 1200,
            "correctAnswer": ["len(arr) <= 1", "arr[:mid]", "arr[mid:]"],
            "code": MERGE_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入正確的程式碼，完成 `merge_sort` 函式。",
                    "options": [],
                    "explanation": "(a) 遞迴必須有終止條件，思考「什麼情況下陣列已天然有序、不需要再拆？」(b)(c) `mid = len(arr) // 2` 已算好切割點，左半邊是 mid 之前的部分，右半邊是 mid 之後（含 mid）的部分；Python 的 slice 語法讓這個切割極為簡潔。",
                },
                "en": {
                    "title": "Fill in the correct code to complete the `merge_sort` function.",
                    "options": [],
                    "explanation": "(a) Every recursion needs a base case — think about when an array is already trivially sorted and needs no further splitting. (b)(c) `mid = len(arr) // 2` gives the split point; the left half is everything before mid, the right half is everything from mid onward (inclusive). Python's slice syntax makes this cut concise.",
                },
            },
        },

        # [遞迴執行順序 / predict-line] 800 + 150(predict) + 400(L4遞迴追蹤) + 150(複合邊界) = 1500
        {
            "id": "merge-sort-q22",
            "type": "predict-line",
            "baseRating": 1500,
            "correctAnswer": "2 4 5 2 3 6 2 3 7 9 10 11 12 16 17 11 18 19 20",
            "code": MERGE_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "呼叫 `merge_sort([2, 1])`，請依序寫出每次被執行到的行號（以空格分隔）。",
                    "options": [],
                    "explanation": "常見錯誤有三個：忽略遞迴先深入左半邊再右半邊的順序、誤以為 `def` 行在呼叫時也算執行、漏掉 while 條件行在每次迭代前都會重新執行一次（包括最後那次判斷為 False 而退出）。merge 進入後，`2>1` 為 False，走的是 else 分支（L16/L17），right 耗盡後 while 退出，left 的剩餘由 L18 補上。",
                },
                "en": {
                    "title": "Calling `merge_sort([2, 1])`, write the line numbers executed in order (space-separated).",
                    "options": [],
                    "explanation": "Three common mistakes: forgetting that recursion dives into the left subtree before the right; thinking the `def` line counts as executed on each call; and omitting the final while-condition check that evaluates to False and exits the loop. Inside merge, `2 > 1` is False so the else branch runs (L16/L17); after right is exhausted the while exits, and left's remainder is handled by L18.",
                },
            },
        },

        # [遞迴執行順序 / 深度理解] 800 + 50(single) + 250(L3多步) + 100(新手誤區) = 1200
        {
            "id": "merge-sort-q23",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "對長度為 8 的陣列執行 Merge Sort，遞迴樹共有幾個層次（含根層與葉層）？",
                    "options": [
                        {"id": "A", "text": "3 個層次"},
                        {"id": "B", "text": "4 個層次"},
                        {"id": "C", "text": "8 個層次"},
                        {"id": "D", "text": "log₂(8) = 3 個層次，不含葉層"},
                    ],
                    "explanation": "8→4→2→1，每次對半，需要 3 次拆分。若根層算第 1 層，葉層算第 4 層，共 4 個層次。這就是時間複雜度 O(n log n) 中 log n 的來源：共 log n 個層次，每層合併工作加總為 O(n)。D 選項的「不含葉層」說法不符合一般遞迴樹的計算方式。",
                },
                "en": {
                    "title": "When Merge Sort is applied to an array of length 8, how many levels does the recursion tree have in total (including the root level and the leaf level)?",
                    "options": [
                        {"id": "A", "text": "3 levels"},
                        {"id": "B", "text": "4 levels"},
                        {"id": "C", "text": "8 levels"},
                        {"id": "D", "text": "log₂(8) = 3 levels, not counting the leaf level"},
                    ],
                    "explanation": "8→4→2→1: three halvings are needed. Counting the root as level 1 and the leaves as level 4 gives 4 total levels. This is the source of the log n in O(n log n): there are log n levels and the merge work per level totals O(n). Option D's 'not counting the leaf level' is a non-standard interpretation that leads to an off-by-one error.",
                },
            },
        },

        # [操作複雜度] 800 + 50(single) + 250(L3多步分析) + 200(新手誤區+視覺干擾) = 1300
        {
            "id": "merge-sort-q24",
            "type": "single-choice",
            "baseRating": 1300,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "為什麼 Merge Sort 的時間複雜度是 O(n log n)？請從遞迴樹的角度解釋。",
                    "options": [
                        {"id": "A", "text": "拆分時每次比較 n 個元素，共拆分 log n 次，所以是 n × log n"},
                        {"id": "B", "text": "每次合併需要 log n 次比較，總共有 n 次合併，所以是 n × log n"},
                        {"id": "C", "text": "遞迴樹有 log n 層，同一層的所有合併加總走訪 n 個元素，共 log n 層就是 n × log n"},
                        {"id": "D", "text": "遞迴呼叫堆疊最深 log n，每次呼叫做 n 次比較，所以是 n × log n"},
                    ],
                    "explanation": "拆分本身幾乎不做比較工作（只算中點），合併才是主要工作。同一層的所有 merge 操作共同處理該層的 n 個元素，每層合計 O(n)，共 log n 層，故總計 O(n log n)。A 混淆了「拆分」與「合併」，B 的單次合併比較次數不是 log n，D 混淆了遞迴深度與比較次數。",
                },
                "en": {
                    "title": "Why is the time complexity of Merge Sort O(n log n)? Explain from the perspective of the recursion tree.",
                    "options": [
                        {"id": "A", "text": "The split phase compares n elements each time and splits log n times, giving n × log n"},
                        {"id": "B", "text": "Each merge requires log n comparisons, and there are n total merges, giving n × log n"},
                        {"id": "C", "text": "The recursion tree has log n levels; all merges at the same level together visit n elements, so log n levels gives n × log n"},
                        {"id": "D", "text": "The recursion call stack goes log n deep, and each call makes n comparisons, giving n × log n"},
                    ],
                    "explanation": "Splitting does almost no comparison work (just computing a midpoint); merging is where the work happens. All merge operations at the same level collectively process n elements, so each level costs O(n), and with log n levels the total is O(n log n). A confuses 'splitting' with 'merging'; B gets the per-merge comparison count wrong; D confuses recursion depth with comparisons per call.",
                },
            },
        },

        # [可以優化什麼 / Timsort] 800 + 50(single) + 400(L4系統設計理解) + 200(新手誤區+視覺干擾) = 1450
        {
            "id": "merge-sort-q25",
            "type": "single-choice",
            "baseRating": 1450,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "Python 的內建排序 `sorted()` 使用 Timsort，Timsort 結合了 Merge Sort 與 Insertion Sort。請問 Insertion Sort 在 Timsort 中扮演什麼角色？",
                    "options": [
                        {"id": "A", "text": "用於處理小型子陣列（通常 < 64 元素），因為小資料量時 Insertion Sort 的低常數係數優於 Merge Sort 的遞迴開銷"},
                        {"id": "B", "text": "用於最終的合併步驟，取代 Merge Sort 的 merge 函式"},
                        {"id": "C", "text": "用於隨機打亂陣列以避免 Merge Sort 的最壞情況"},
                        {"id": "D", "text": "Insertion Sort 負責拆分，Merge Sort 負責合併"},
                    ],
                    "explanation": "Timsort 的策略是：先用 Insertion Sort 將陣列分成多個「run」（天然有序小區段，預設長度 32–64），再以 Merge Sort 的方式合併這些 run。Insertion Sort 在小資料量時的 O(n²) 理論複雜度掩蓋不了它極小的常數係數優勢，在 n<64 時比任何 O(n log n) 演算法都更快。",
                },
                "en": {
                    "title": "Python's built-in `sorted()` uses Timsort, which combines Merge Sort and Insertion Sort. What role does Insertion Sort play in Timsort?",
                    "options": [
                        {"id": "A", "text": "It handles small sub-arrays (typically < 64 elements), because for small n its low constant factor beats Merge Sort's recursion overhead"},
                        {"id": "B", "text": "It replaces Merge Sort's merge function for the final merging step"},
                        {"id": "C", "text": "It randomly shuffles the array to avoid Merge Sort's worst case"},
                        {"id": "D", "text": "Insertion Sort handles splitting; Merge Sort handles merging"},
                    ],
                    "explanation": "Timsort's strategy: first use Insertion Sort to produce 'runs' (naturally ordered small segments, default size 32–64), then merge these runs with Merge Sort. For small n, Insertion Sort's tiny constant factor advantage outweighs its O(n²) theoretical complexity — it is faster than any O(n log n) algorithm when n < 64.",
                },
            },
        },

        # [關鍵的合併步驟 / 邊界分析] 800 + 50(single) + 100(L2動態) + 150(極端邊界) = 1100
        {
            "id": "merge-sort-q26",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "呼叫 `merge([1, 2, 3], [])` 時，merge 函式的執行結果為何？",
                    "options": [
                        {"id": "A", "text": "拋出 IndexError，因為合併時會嘗試存取空陣列的元素"},
                        {"id": "B", "text": "回傳 [1, 2, 3]"},
                        {"id": "C", "text": "回傳 []，因為 right 是空的，沒有東西可以合併"},
                        {"id": "D", "text": "回傳 [1, 2, 3, None]，合併函式在 right 為空時會補 None"},
                    ],
                    "explanation": "while 的條件 `i < len(left) and j < len(right)` 在 right 為空時（`len(right)=0`）直接為 False，迴圈一次都不執行。接著 `result.extend(left[i:])` 把 left 全部補入，`result.extend(right[j:])` 補入空串列，最終回傳 [1,2,3]。這種邊界行為來自 while 的短路求值，而非特殊處理。",
                },
                "en": {
                    "title": "What is the result of calling `merge([1, 2, 3], [])`?",
                    "options": [
                        {"id": "A", "text": "Raises IndexError, because the merge will try to access an element of the empty array"},
                        {"id": "B", "text": "Returns [1, 2, 3]"},
                        {"id": "C", "text": "Returns [], because right is empty and there is nothing to merge"},
                        {"id": "D", "text": "Returns [1, 2, 3, None]; the merge function appends None when right is empty"},
                    ],
                    "explanation": "The while condition `i < len(left) and j < len(right)` is immediately False when right is empty (`len(right)=0`), so the loop never runs. Then `result.extend(left[i:])` appends all of left, and `result.extend(right[j:])` appends an empty list, returning [1,2,3]. This boundary behavior arises from the while condition's short-circuit evaluation, not from any special-case handling.",
                },
            },
        },

        # [遞迴執行順序 / 深度理解] 800 + 50(single) + 250(L3多步) + 250(複合陷阱) = 1350
        {
            "id": "merge-sort-q27",
            "type": "single-choice",
            "baseRating": 1350,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "對陣列 `[4, 3, 2, 1]`（完全逆序）執行 Merge Sort，下列關於執行過程的陳述何者正確？",
                    "options": [
                        {"id": "A", "text": "每次合併的比較次數達到最大，整體效能因此退化到 O(n²)"},
                        {"id": "B", "text": "逆序時效能與已排序時完全相同，因為合併次數不變"},
                        {"id": "C", "text": "每次合併的比較次數達到最大（m+n-1 次），但遞迴樹層數不變，整體仍是 O(n log n)"},
                        {"id": "D", "text": "逆序時整體比較次數比隨機輸入少，因為每次合併「左比右大」的結果更規律"},
                    ],
                    "explanation": "逆序輸入確實讓每次 merge 的比較次數達到上限（m+n-1），這使 O(n log n) 的常數係數最大。但遞迴樹的層數固定是 log n，每層工作量仍是 O(n)，所以整體複雜度維持 O(n log n)——A 混淆了「常數係數增加」與「複雜度退化」，B 忽略了常數差異，D 的方向說反了。",
                },
                "en": {
                    "title": "When Merge Sort is applied to `[4, 3, 2, 1]` (completely reversed), which statement about the execution is correct?",
                    "options": [
                        {"id": "A", "text": "Each merge's comparison count reaches its maximum, so overall performance degrades to O(n²)"},
                        {"id": "B", "text": "Performance on reversed input is identical to sorted input because the number of merges does not change"},
                        {"id": "C", "text": "Each merge's comparison count reaches its maximum (m+n-1), but the number of recursion tree levels is unchanged, so the overall complexity is still O(n log n)"},
                        {"id": "D", "text": "Total comparisons on reversed input are fewer than on random input, because the 'left > right' outcomes are more regular"},
                    ],
                    "explanation": "Reversed input does maximize each merge's comparison count (m+n-1), which increases the constant factor of O(n log n). But the recursion tree still has log n levels and each level still costs O(n) total, so the complexity stays O(n log n). A confuses 'larger constant' with 'higher complexity class'; B ignores the constant difference; D gets the direction backwards.",
                },
            },
        },

        # [核心概念 / 計算反轉對進階] 800 + 50(single) + 600(L5演算法創造) + 100(新手誤區) = 1550 → 1500
        # [適合處理的問題 / 反轉對實作] 800 + 50(single) + 400(L4複雜控制流) + 250(複合陷阱) = 1500
        {
            "id": "merge-sort-q28",
            "type": "single-choice",
            "baseRating": 1500,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在利用 Merge Sort 計算反轉對（Counting Inversions）的實作中，當 `right[j] < left[i]` 時，應累加多少個反轉對？",
                    "options": [
                        {"id": "A", "text": "1 個"},
                        {"id": "B", "text": "`len(left) - i` 個"},
                        {"id": "C", "text": "`len(right) - j` 個"},
                        {"id": "D", "text": "`i * j` 個"},
                    ],
                    "explanation": "left 子陣列已排序，所以 right[j] < left[i] 意味著 right[j] 比 left[i] 到 left 末端的所有元素都小。這些元素在原陣列中排在 right[j] 前面，卻比它大，一次性批量計入可避免逐對枚舉、維持整體 O(n log n)。",
                },
                "en": {
                    "title": "In a Merge Sort-based Counting Inversions implementation, when `right[j] < left[i]`, how many inversion pairs should be accumulated?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "`len(left) - i`"},
                        {"id": "C", "text": "`len(right) - j`"},
                        {"id": "D", "text": "`i * j`"},
                    ],
                    "explanation": "Since left is already sorted, right[j] < left[i] means right[j] is smaller than every element from left[i] to the end of left. All of those elements appear before right[j] in the original array yet are larger — counting them in bulk avoids pairwise enumeration and keeps the overall complexity at O(n log n).",
                },
            },
        },

        # [操作複雜度] 800 + 50(single) + 400(L4複雜分析) + 150(極端邊界) = 1400
        {
            "id": "merge-sort-q29",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "有工程師提出「Bottom-Up Merge Sort（迭代版）」以消除遞迴的函式呼叫開銷。以下何者正確描述其與遞迴版的主要差異？",
                    "options": [
                        {"id": "A", "text": "消除遞迴後，合併時也不再需要輔助陣列，空間複雜度降為 O(1)"},
                        {"id": "B", "text": "Bottom-Up 版本的穩定性取決於實作語言，遞迴版本才能保證穩定"},
                        {"id": "C", "text": "Bottom-Up 省去 O(log n) 遞迴堆疊空間，因此總空間複雜度降為 O(log n)"},
                        {"id": "D", "text": "Bottom-Up 從長度 1 的子陣列開始，倍增合併大小（1→2→4→…），消除遞迴堆疊的 O(log n) 空間，但合併本身仍需 O(n) 輔助空間"},
                    ],
                    "explanation": "Bottom-Up 消除了遞迴呼叫堆疊（O(log n) 空間），但 merge 函式本身需要的暫存陣列是 O(n)，因此主導空間複雜度仍是 O(n)。穩定性由 merge 的比較條件（`<=` vs `<`）決定，與遞迴/迭代無關，兩版本在相同 merge 邏輯下穩定性相同。",
                },
                "en": {
                    "title": "An engineer proposes Bottom-Up Merge Sort (iterative) to eliminate recursive call overhead. Which correctly describes its main difference from the recursive version?",
                    "options": [
                        {"id": "A", "text": "Eliminating recursion also removes the need for an auxiliary array, reducing space complexity to O(1)"},
                        {"id": "B", "text": "The stability of Bottom-Up depends on the implementation language; only the recursive version can guarantee stability"},
                        {"id": "C", "text": "Bottom-Up saves the O(log n) recursion stack space, so total space complexity drops to O(log n)"},
                        {"id": "D", "text": "Bottom-Up starts from sub-arrays of length 1 and doubles the merge size (1→2→4→…), eliminating the O(log n) recursion stack, but merge itself still requires O(n) auxiliary space"},
                    ],
                    "explanation": "Bottom-Up eliminates the recursion call stack (O(log n) space), but the merge function's temporary array is O(n), which dominates, so overall space complexity remains O(n). Stability is determined by the merge comparison condition (`<=` vs `<`), not by whether the implementation is recursive or iterative — both versions have the same stability under the same merge logic.",
                },
            },
        },

        # [多重比較 / 綜合] 800 + 100(multiple) + 400(L4綜合分析) + 200(複合陷阱) = 1500
        {
            "id": "merge-sort-q30",
            "type": "multiple-choice",
            "baseRating": 1500,
            "correctAnswer": ["opt1", "opt3", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "以下關於 Merge Sort 的進階陳述，哪些是正確的？（選擇所有正確答案）",
                    "options": [
                        {"id": "opt1", "text": "若將 merge 函式的比較條件改為嚴格小於 `<`（而非 `<=`），Merge Sort 將變為不穩定排序"},
                        {"id": "opt2", "text": "Merge Sort 的空間複雜度可以優化到 O(1)，同時保持 O(n log n) 的時間複雜度與穩定性"},
                        {"id": "opt3", "text": "計算陣列中反轉對數量可以在 Merge Sort 的合併步驟中以 O(n log n) 時間完成，而不需要額外的 O(n²) 暴力搜尋"},
                        {"id": "opt4", "text": "對於鏈結串列，Merge Sort 的合併步驟可以透過修改指標而非配置暫存陣列來實現，此時空間複雜度僅為 O(log n)（遞迴堆疊）"},
                    ],
                    "explanation": "穩定性的關鍵在比較條件（opt1）；原地穩定 O(n log n) 合併在理論上可行但實際複雜度遠超實用門檻（opt2）；反轉對計數利用 left 已排序的性質可批量累加，不需額外掃描（opt3）；鏈結串列合併只需改指標，無需暫存陣列，空間由 O(n) 降至 O(log n) 遞迴堆疊（opt4）。",
                },
                "en": {
                    "title": "Which of the following advanced statements about Merge Sort are correct? (Select all that apply)",
                    "options": [
                        {"id": "opt1", "text": "If the merge comparison is changed from `<=` to strict `<`, Merge Sort becomes an unstable sort"},
                        {"id": "opt2", "text": "Merge Sort's space complexity can be optimized to O(1) while maintaining O(n log n) time complexity and stability"},
                        {"id": "opt3", "text": "Counting inversions in an array can be done in O(n log n) time within Merge Sort's merge step, without an additional O(n²) brute force"},
                        {"id": "opt4", "text": "For a linked list, the merge step can be implemented by modifying pointers rather than allocating a temp array, reducing space complexity to O(log n) (recursion stack only)"},
                    ],
                    "explanation": "Stability hinges on the comparison condition (opt1). In-place stable O(n log n) merge is theoretically possible but impractically complex (opt2). Inversion counting exploits the fact that left is already sorted to batch-accumulate counts without extra scanning (opt3). Linked list merge needs only pointer changes and no temp array, dropping space from O(n) to O(log n) recursion stack (opt4).",
                },
            },
        },
    ],
}

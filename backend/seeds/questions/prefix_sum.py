PSUM_QUERY_CODE = """def query_range(prefix_sum, i, j):
    # i 為起始索引，j 為結束索引 (均為包含)
    return prefix_sum[j + 1] - prefix_sum[i]"""

PSUM_FILL_CODE = """def build_and_query(arr, left, right):
    P = [0] * (len(arr) + 1)
    for i in range(len(arr)):
        P[i + 1] = (a) + arr[i]

    # 執行區間查詢 [left, right]
    return (b) - (c)"""

PSUM_PREDICT_CODE = """def build_prefix_sum(arr):           # L1
    n = len(arr)                      # L2
    prefix_sum = [0] * (n + 1)        # L3
    for i in range(n):                # L4
        prefix_sum[i + 1] = prefix_sum[i] + arr[i] # L5
    return prefix_sum                 # L6"""

COUNT_SUM_K_FILL_CODE = """def count_sum_k(arr, k):
    count = 0
    curr_sum = 0
    sums_map = {0: 1} # 紀錄前綴和出現次數
    for x in arr:
        curr_sum += x
        # 如果 curr_sum - k 在 map 中，代表存在子陣列和為 k
        if (a) in sums_map:
            count += sums_map[(b)]
        sums_map[curr_sum] = sums_map.get(curr_sum, 0) + (c)
    return count"""

DATA = {
    "slug": "prefixsum",
    "groups": [
        {
            "id": "group-psum-query",
            "translations": {
                "zh-TW": {
                    "title": "題組：高效區間查詢",
                    "description": "前綴和陣列 P 的核心優勢在於將 O(N) 的查詢優化為 O(1) 的減法運算。請仔細觀察索引的對應關係。",
                },
                "en": {
                    "title": "Group: Efficient Range Query",
                    "description": "The core advantage of a prefix sum array P is reducing O(N) range queries to O(1) subtraction. Pay close attention to the index mapping.",
                },
            },
            "code": PSUM_QUERY_CODE,
            "language": "python",
        }
    ],
    "questions": [
        {
            "id": "psum-q1",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 800,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "前綴和（Prefix Sum）陣列的主要用途是什麼？",
                    "options": [
                        {"id": "A", "text": "對陣列進行排序"},
                        {"id": "B", "text": "將區間求和的時間複雜度從 O(N) 降低至 O(1)"},
                        {"id": "C", "text": "尋找陣列中的最大值"},
                        {"id": "D", "text": "將陣列反轉"},
                    ],
                    "explanation": "前綴和陣列預先計算各位置的累計總和，使得任意區間 [i, j] 的求和只需一次減法（O(1)），而非每次都重新累加（O(N)）。",
                },
                "en": {
                    "title": "What is the primary purpose of a Prefix Sum array?",
                    "options": [
                        {"id": "A", "text": "To sort the array"},
                        {"id": "B", "text": "To reduce range sum queries from O(N) to O(1)"},
                        {"id": "C", "text": "To find the maximum value in the array"},
                        {"id": "D", "text": "To reverse the array"},
                    ],
                    "explanation": "A prefix sum array precomputes cumulative sums so that any range [i, j] sum requires only a single subtraction (O(1)) instead of re-summing every time (O(N)).",
                },
            },
        },
        {
            "id": "psum-tf-1",
            "type": "true-false",
            "category": "basic",
            "difficultyRating": 850,
            "correctAnswer": "true",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "對於長度為 N 的陣列，其前綴和陣列的長度為 N+1（在索引 0 處存放哨兵值 0）。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。前綴和陣列通常比原陣列長一位，P[0] = 0 作為哨兵值，使得區間查詢公式 P[j+1] - P[i] 能統一處理，不需要特別判斷邊界情況。",
                },
                "en": {
                    "title": "For an array of length N, its prefix sum array has length N+1, with a sentinel value of 0 stored at index 0.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. The prefix sum array is one element longer than the original, with P[0] = 0 as a sentinel value. This allows the uniform range query formula P[j+1] - P[i] without special-casing boundary conditions.",
                },
            },
        },
        {
            "id": "psum-q2",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 900,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "給定陣列 arr = [2, 4, 6, 8]，其前綴和陣列 P 為何？",
                    "options": [
                        {"id": "A", "text": "[2, 4, 6, 8]"},
                        {"id": "B", "text": "[0, 2, 6, 12, 20]"},
                        {"id": "C", "text": "[0, 2, 4, 6, 8]"},
                        {"id": "D", "text": "[2, 6, 12, 20]"},
                    ],
                    "explanation": "P[0]=0（哨兵）；P[1]=0+2=2；P[2]=2+4=6；P[3]=6+6=12；P[4]=12+8=20。因此前綴和陣列為 [0, 2, 6, 12, 20]，長度比原陣列多 1。",
                },
                "en": {
                    "title": "Given arr = [2, 4, 6, 8], what is the prefix sum array P?",
                    "options": [
                        {"id": "A", "text": "[2, 4, 6, 8]"},
                        {"id": "B", "text": "[0, 2, 6, 12, 20]"},
                        {"id": "C", "text": "[0, 2, 4, 6, 8]"},
                        {"id": "D", "text": "[2, 6, 12, 20]"},
                    ],
                    "explanation": "P[0]=0 (sentinel); P[1]=0+2=2; P[2]=2+4=6; P[3]=6+6=12; P[4]=12+8=20. The prefix sum array is [0, 2, 6, 12, 20], one element longer than the original.",
                },
            },
        },
        {
            "id": "psum-tf-2",
            "type": "true-false",
            "category": "basic",
            "difficultyRating": 950,
            "correctAnswer": "true",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "使用前綴和陣列查詢區間 [i, j] 的總和，公式為 P[j+1] - P[i]。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。P[j+1] 代表從索引 0 到 j 的累計總和，P[i] 代表從索引 0 到 i-1 的累計總和，相減即得到區間 [i, j] 的總和。",
                },
                "en": {
                    "title": "Using a prefix sum array, the formula to query the sum over range [i, j] is P[j+1] - P[i].",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. P[j+1] is the cumulative sum from index 0 to j; P[i] is the cumulative sum from index 0 to i-1. Their difference yields the sum over [i, j].",
                },
            },
        },
        {
            "id": "psum-q3",
            "type": "single-choice",
            "category": "basic",
            "difficultyRating": 950,
            "correctAnswer": "C",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "建構一個長度為 N 的陣列的前綴和陣列，時間複雜度與空間複雜度分別為何？",
                    "options": [
                        {"id": "A", "text": "時間 O(1)，空間 O(1)"},
                        {"id": "B", "text": "時間 O(N log N)，空間 O(N)"},
                        {"id": "C", "text": "時間 O(N)，空間 O(N)"},
                        {"id": "D", "text": "時間 O(N²)，空間 O(N²)"},
                    ],
                    "explanation": "建構前綴和陣列需要一次線性掃描（O(N) 時間），並額外儲存一個同等規模的陣列（O(N) 空間）。",
                },
                "en": {
                    "title": "What are the time and space complexities for building a prefix sum array from an array of length N?",
                    "options": [
                        {"id": "A", "text": "Time O(1), Space O(1)"},
                        {"id": "B", "text": "Time O(N log N), Space O(N)"},
                        {"id": "C", "text": "Time O(N), Space O(N)"},
                        {"id": "D", "text": "Time O(N²), Space O(N²)"},
                    ],
                    "explanation": "Building the prefix sum array requires one linear scan (O(N) time) and stores an array of equal size (O(N) space).",
                },
            },
        },
        {
            "id": "psum-group-1",
            "groupId": "group-psum-query",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1000,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "參考題組程式碼，給定 prefix_sum = [0, 3, 7, 12, 18]，呼叫 query_range(prefix_sum, 1, 3) 的回傳值為何？",
                    "options": [
                        {"id": "A", "text": "7"},
                        {"id": "B", "text": "15"},
                        {"id": "C", "text": "12"},
                        {"id": "D", "text": "18"},
                    ],
                    "explanation": "query_range(prefix_sum, 1, 3) = prefix_sum[3+1] - prefix_sum[1] = prefix_sum[4] - prefix_sum[1] = 18 - 3 = 15。這對應到原陣列索引 1 到 3 的元素總和（4+5+6=15）。",
                },
                "en": {
                    "title": "Using the group code, given prefix_sum = [0, 3, 7, 12, 18], what does query_range(prefix_sum, 1, 3) return?",
                    "options": [
                        {"id": "A", "text": "7"},
                        {"id": "B", "text": "15"},
                        {"id": "C", "text": "12"},
                        {"id": "D", "text": "18"},
                    ],
                    "explanation": "query_range(prefix_sum, 1, 3) = prefix_sum[3+1] - prefix_sum[1] = prefix_sum[4] - prefix_sum[1] = 18 - 3 = 15. This corresponds to the sum of elements at indices 1 to 3 in the original array (4+5+6=15).",
                },
            },
        },
        {
            "id": "psum-group-2",
            "groupId": "group-psum-query",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1100,
            "correctAnswer": "B",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "承上題，如果要查詢整個陣列（索引 0 到 3）的總和，應該如何呼叫 query_range？",
                    "options": [
                        {"id": "A", "text": "query_range(prefix_sum, 0, 4)"},
                        {"id": "B", "text": "query_range(prefix_sum, 0, 3)"},
                        {"id": "C", "text": "query_range(prefix_sum, 1, 4)"},
                        {"id": "D", "text": "prefix_sum[4]"},
                    ],
                    "explanation": "查詢整個陣列（索引 0 到 3）應呼叫 query_range(prefix_sum, 0, 3) = prefix_sum[4] - prefix_sum[0] = 18 - 0 = 18。注意索引範圍是閉區間，終點索引應為 3（最後一個元素的位置），而非 4。",
                },
                "en": {
                    "title": "Using the same setup, how should you call query_range to sum the entire array (indices 0 to 3)?",
                    "options": [
                        {"id": "A", "text": "query_range(prefix_sum, 0, 4)"},
                        {"id": "B", "text": "query_range(prefix_sum, 0, 3)"},
                        {"id": "C", "text": "query_range(prefix_sum, 1, 4)"},
                        {"id": "D", "text": "prefix_sum[4]"},
                    ],
                    "explanation": "To sum indices 0 to 3 (the full array), call query_range(prefix_sum, 0, 3) = prefix_sum[4] - prefix_sum[0] = 18 - 0 = 18. The range is inclusive; the end index should be 3 (last element's position), not 4.",
                },
            },
        },
        {
            "id": "psum-q4",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1100,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "前綴和的概念可以延伸至二維陣列。對 M×N 的二維矩陣建立前綴和後，查詢任意矩形區域的總和時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(M × N)"},
                        {"id": "B", "text": "O(1)"},
                        {"id": "C", "text": "O(M + N)"},
                        {"id": "D", "text": "O(log(M × N))"},
                    ],
                    "explanation": "二維前綴和同樣可將矩形區域查詢優化為 O(1)，公式為四個角落前綴和的加減組合（容斥原理）。",
                },
                "en": {
                    "title": "The prefix sum concept extends to 2D arrays. After building a prefix sum on an M×N matrix, what is the time complexity for querying any rectangular region's sum?",
                    "options": [
                        {"id": "A", "text": "O(M × N)"},
                        {"id": "B", "text": "O(1)"},
                        {"id": "C", "text": "O(M + N)"},
                        {"id": "D", "text": "O(log(M × N))"},
                    ],
                    "explanation": "A 2D prefix sum also reduces rectangular region queries to O(1), using a formula combining the four corner prefix sums (inclusion-exclusion principle).",
                },
            },
        },
        {
            "id": "psum-q5",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1150,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "給定陣列 arr = [1, 2, 3, 4, 5]，使用前綴和查詢索引 2 到 4 的區間總和，結果為何？",
                    "options": [
                        {"id": "A", "text": "9"},
                        {"id": "B", "text": "12"},
                        {"id": "C", "text": "14"},
                        {"id": "D", "text": "15"},
                    ],
                    "explanation": "P = [0,1,3,6,10,15]。query(2,4) = P[5] - P[2] = 15 - 3 = 12。這對應到 arr[2]+arr[3]+arr[4] = 3+4+5 = 12。",
                },
                "en": {
                    "title": "Given arr = [1, 2, 3, 4, 5], using a prefix sum to query the range sum from index 2 to 4, what is the result?",
                    "options": [
                        {"id": "A", "text": "9"},
                        {"id": "B", "text": "12"},
                        {"id": "C", "text": "14"},
                        {"id": "D", "text": "15"},
                    ],
                    "explanation": "P = [0,1,3,6,10,15]. query(2,4) = P[5] - P[2] = 15 - 3 = 12. This corresponds to arr[2]+arr[3]+arr[4] = 3+4+5 = 12.",
                },
            },
        },
        {
            "id": "psum-multi-1",
            "type": "multiple-choice",
            "category": "application",
            "difficultyRating": 1200,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "以下哪些問題可以利用前綴和技術有效解決？（多選）",
                    "options": [
                        {"id": "opt1", "text": "多次查詢靜態陣列的區間總和"},
                        {"id": "opt2", "text": "統計二維矩陣中某矩形區域的元素總和"},
                        {"id": "opt3", "text": "在動態頻繁更新的陣列上進行區間查詢"},
                        {"id": "opt4", "text": "判斷陣列中是否存在總和為 k 的連續子陣列"},
                    ],
                    "explanation": "前綴和適合靜態資料的多次區間查詢（opt1, opt2 正確）以及利用雜湊表找特定總和子陣列（opt4 正確）。頻繁更新的場景應使用樹狀陣列（BIT）或線段樹（opt3 不適合）。",
                },
                "en": {
                    "title": "Which of the following problems can be effectively solved using prefix sum? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Multiple range sum queries on a static array"},
                        {"id": "opt2", "text": "Summing a rectangular region in a 2D matrix"},
                        {"id": "opt3", "text": "Range queries on a dynamically and frequently updated array"},
                        {"id": "opt4", "text": "Determining whether a contiguous subarray with sum k exists"},
                    ],
                    "explanation": "Prefix sum is suitable for multiple range queries on static data (opt1, opt2 correct) and using a hash map to find subarrays with a specific sum (opt4 correct). Frequently updated arrays should use a Binary Indexed Tree or Segment Tree (opt3 is not suitable).",
                },
            },
        },
        {
            "id": "psum-q6",
            "type": "single-choice",
            "category": "application",
            "difficultyRating": 1250,
            "correctAnswer": "B",
            "points": 1,
            "translations": {
                "zh-TW": {
                    "title": "在「尋找總和為 k 的連續子陣列數量」問題中，使用前綴和配合雜湊表（HashMap）可以將時間複雜度從暴力解的 O(N²) 優化至多少？",
                    "options": [
                        {"id": "A", "text": "O(N log N)"},
                        {"id": "B", "text": "O(N)"},
                        {"id": "C", "text": "O(N√N)"},
                        {"id": "D", "text": "O(1)"},
                    ],
                    "explanation": "使用前綴和加雜湊表，只需一次線性掃描（O(N)）即可完成。對每個位置計算當前前綴和，再查詢雜湊表中 curr_sum - k 出現的次數，就能知道有多少個子陣列和為 k。",
                },
                "en": {
                    "title": "In the problem 'Count subarrays with sum k', using prefix sum with a HashMap can reduce time complexity from brute-force O(N²) to what?",
                    "options": [
                        {"id": "A", "text": "O(N log N)"},
                        {"id": "B", "text": "O(N)"},
                        {"id": "C", "text": "O(N√N)"},
                        {"id": "D", "text": "O(1)"},
                    ],
                    "explanation": "Using prefix sum with a hash map requires only one linear scan (O(N)). At each position, compute the current prefix sum, then look up how many times curr_sum - k has appeared in the map to count subarrays summing to k.",
                },
            },
        },
        {
            "id": "psum-group-3",
            "groupId": "group-psum-query",
            "type": "fill-code",
            "category": "complexity",
            "difficultyRating": 1300,
            "correctAnswer": ["P[i]", "P[right + 1]", "P[left]"],
            "points": 5,
            "code": PSUM_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 build_and_query 程式碼中 (a)(b)(c) 缺失的表達式，完成前綴和建構與區間查詢邏輯。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) P[i+1] = P[i] + arr[i]，因此 (a) 填入 P[i]。(b) 區間 [left, right] 的查詢，右端為 P[right + 1]。(c) 左端減去 P[left]，完成容斥原理的計算。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in the build_and_query code to complete the prefix sum construction and range query logic.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) P[i+1] = P[i] + arr[i], so (a) is P[i]. (b) For range [left, right], the right-end term is P[right + 1]. (c) Subtract P[left] to complete the inclusion-exclusion calculation.",
                },
            },
        },
        {
            "id": "psum-q7",
            "type": "single-choice",
            "category": "complexity",
            "difficultyRating": 1350,
            "correctAnswer": "C",
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "對一個長度為 N 的陣列，若需要進行 Q 次區間查詢，使用前綴和的總時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(N × Q)"},
                        {"id": "B", "text": "O(Q)"},
                        {"id": "C", "text": "O(N + Q)"},
                        {"id": "D", "text": "O(N log Q)"},
                    ],
                    "explanation": "建構前綴和陣列需要 O(N)，之後每次查詢為 O(1)，Q 次查詢共 O(Q)。總時間複雜度為 O(N + Q)，比暴力法的 O(N × Q) 效率高出許多。",
                },
                "en": {
                    "title": "For an array of length N with Q range queries, what is the total time complexity when using prefix sum?",
                    "options": [
                        {"id": "A", "text": "O(N × Q)"},
                        {"id": "B", "text": "O(Q)"},
                        {"id": "C", "text": "O(N + Q)"},
                        {"id": "D", "text": "O(N log Q)"},
                    ],
                    "explanation": "Building the prefix sum array takes O(N), and each of the Q queries takes O(1). Total time complexity is O(N + Q), far better than brute-force O(N × Q).",
                },
            },
        },
        {
            "id": "psum-multi-2",
            "type": "multiple-choice",
            "category": "complexity",
            "difficultyRating": 1400,
            "correctAnswer": ["opt1"],
            "points": 2,
            "translations": {
                "zh-TW": {
                    "title": "關於前綴和的限制，以下哪些敘述是正確的？（多選）",
                    "options": [
                        {"id": "opt1", "text": "若陣列頻繁更新，每次更新後需要重新建構前綴和，效率較差"},
                        {"id": "opt2", "text": "前綴和無法處理含有負數的陣列"},
                        {"id": "opt3", "text": "前綴和只能用於整數陣列，不能用於浮點數"},
                        {"id": "opt4", "text": "前綴和無法應用於二維以上的陣列"},
                    ],
                    "explanation": "前綴和最大的限制是它針對靜態陣列設計。頻繁修改陣列元素後，需要 O(N) 時間重建（opt1 正確）。前綴和完全支援負數、浮點數（opt2, opt3 錯誤），也可延伸至多維（opt4 錯誤）。",
                },
                "en": {
                    "title": "Which statements about prefix sum limitations are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "If the array is frequently updated, the prefix sum must be rebuilt after each update, which is inefficient"},
                        {"id": "opt2", "text": "Prefix sum cannot handle arrays with negative numbers"},
                        {"id": "opt3", "text": "Prefix sum only works for integer arrays, not floating-point numbers"},
                        {"id": "opt4", "text": "Prefix sum cannot be applied to arrays with more than two dimensions"},
                    ],
                    "explanation": "The main limitation of prefix sum is that it is designed for static arrays. Frequent element updates require O(N) rebuild time (opt1 correct). Prefix sum fully supports negative numbers and floats (opt2, opt3 wrong), and can be extended to multiple dimensions (opt4 wrong).",
                },
            },
        },
        {
            "id": "psum-fill-1",
            "type": "fill-code",
            "category": "complexity",
            "difficultyRating": 1450,
            "correctAnswer": ["curr_sum - k", "curr_sum - k", "1"],
            "points": 5,
            "code": COUNT_SUM_K_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 count_sum_k 程式碼中 (a)(b)(c) 缺失的表達式，完成利用前綴和與雜湊表計算子陣列和為 k 的數量。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a)(b) 若 curr_sum - k 存在於 sums_map，代表從那個前綴和位置到當前位置的子陣列和為 k，因此查詢 sums_map[curr_sum - k]。(c) 將當前前綴和加入或更新計數，每次出現加 1。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in count_sum_k to complete the prefix sum + hash map solution for counting subarrays with sum k.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a)(b) If curr_sum - k exists in sums_map, it means a subarray from that prefix sum position to the current position sums to k — look up sums_map[curr_sum - k]. (c) Add or update the current prefix sum's count, incrementing by 1 each time.",
                },
            },
        },
        {
            "id": "psum-pred-1",
            "type": "predict-line",
            "category": "complexity",
            "difficultyRating": 1500,
            "correctAnswer": "1 2 3 4 5 4 5 4 6",
            "points": 5,
            "code": PSUM_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 build_prefix_sum 函數。給定 arr = [3, 7]（長度 2），呼叫 build_prefix_sum(arr) 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "進入 L1 -> n=2(L2) -> 建立陣列(L3) -> 進入 for 迴圈(L4) -> i=0 執行 L5 -> 回到 L4 -> i=1 執行 L5 -> 迴圈結束回到 L4 -> return(L6)。行號序列：1 2 3 4 5 4 5 4 6。",
                },
                "en": {
                    "title": "Read the build_prefix_sum function. Given arr = [3, 7] (length 2), calling build_prefix_sum(arr) — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "Enter L1 -> n=2(L2) -> create array(L3) -> enter for loop(L4) -> i=0 executes L5 -> back to L4 -> i=1 executes L5 -> loop ends back at L4 -> return(L6). Sequence: 1 2 3 4 5 4 5 4 6.",
                },
            },
        },
    ],
}

DP_TRACE_CODE = """text_a = "ACBAD"
text_b = "ABCAD"
m, n = len(text_a), len(text_b)
dp = [[0] * (n + 1) for _ in range(m + 1)]

for i in range(1, m + 1):
    for j in range(1, n + 1):
        if text_a[i - 1] == text_b[j - 1]:
            dp[i][j] = dp[i - 1][j - 1] + 1
        else:
            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])"""

LCS_FILL_CODE = """def lcs_length(text_a, text_b):
    m, n = len(text_a), len(text_b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text_a[i - 1] == text_b[j - 1]:
                dp[i][j] = (a)
            else:
                dp[i][j] = (b)
    return (c)"""

SUBSTRING_FILL_CODE = """def longest_common_substring(text_a, text_b):
    m, n = len(text_a), len(text_b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    best = 0
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text_a[i - 1] == text_b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                best = (a)
            else:
                dp[i][j] = (b)
    return best"""

BACKTRACK_CODE = """def backtrack(a, b, dp):                       # L1
    i, j = len(a), len(b)                      # L2
    res = []                                   # L3
    while i > 0 and j > 0:                     # L4
        if a[i - 1] == b[j - 1]:               # L5
            res.append(a[i - 1])               # L6
            i -= 1; j -= 1                     # L7
        elif dp[i - 1][j] >= dp[i][j - 1]:     # L8
            i -= 1                             # L9
        else:                                  # L10
            j -= 1                             # L11
    return "".join(reversed(res))              # L12"""

DATA = {
    "slug": "lcs",
    "groups": [
        {
            "id": "lcs-group-1",
            "translations": {
                "zh-TW": {
                    "title": "題組：LCS 表格逐格追蹤",
                    "description": "下方程式碼對 text_a = \"ACBAD\" 與 text_b = \"ABCAD\" 填寫 LCS 的 DP 表格。dp[i][j] 代表 text_a 前 i 個字元與 text_b 前 j 個字元的 LCS 長度。請根據程式碼回答下列問題。",
                },
                "en": {
                    "title": "Group: LCS Table Cell-by-Cell Tracing",
                    "description": "The code below fills the LCS DP table for text_a = \"ACBAD\" and text_b = \"ABCAD\". dp[i][j] is the LCS length of the first i characters of text_a and the first j characters of text_b. Answer the following questions based on the code.",
                },
            },
            "code": DP_TRACE_CODE,
            "language": "python",
        }
    ],
    "questions": [
        {
            "id": "lcs-q1",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "\"ACE\" 是 \"ABCDE\" 的子序列。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。子序列只要求字元保持原本的先後順序，不需要連續。從 \"ABCDE\" 刪掉 B 和 D 就得到 \"ACE\"。這也是子序列（subsequence）與子字串（substring）最大的差別：子字串必須連續。",
                },
                "en": {
                    "title": "\"ACE\" is a subsequence of \"ABCDE\".",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. A subsequence only has to keep the characters in their original order — they do not need to be contiguous. Deleting B and D from \"ABCDE\" gives \"ACE\". This is the key difference from a substring, which must be contiguous.",
                },
            },
        },
        {
            "id": "lcs-q2",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "LCS 的二維 DP 陣列中，dp[i][j] 的定義是什麼？",
                    "options": [
                        {"id": "A", "text": "text_a[i] 與 text_b[j] 是否相同"},
                        {"id": "B", "text": "text_a 前 i 個字元與 text_b 前 j 個字元的 LCS 長度"},
                        {"id": "C", "text": "以 text_a[i] 和 text_b[j] 結尾的最長公共子字串長度"},
                        {"id": "D", "text": "text_a 從第 i 個字元、text_b 從第 j 個字元開始，還需要刪除幾個字元"},
                    ],
                    "explanation": "dp[i][j] 是「text_a[0..i-1] 與 text_b[0..j-1] 這兩段前綴」的 LCS 長度。選項 C 是最長公共子字串的定義，那個問題要求連續，轉移方式不同。",
                },
                "en": {
                    "title": "In the 2D DP array for LCS, what does dp[i][j] represent?",
                    "options": [
                        {"id": "A", "text": "Whether text_a[i] equals text_b[j]"},
                        {"id": "B", "text": "The LCS length of the first i characters of text_a and the first j characters of text_b"},
                        {"id": "C", "text": "The length of the longest common substring ending at text_a[i] and text_b[j]"},
                        {"id": "D", "text": "How many characters still need deleting from position i of text_a and position j of text_b"},
                    ],
                    "explanation": "dp[i][j] is the LCS length of the prefixes text_a[0..i-1] and text_b[0..j-1]. Option C describes the longest common substring, which must be contiguous and uses a different transition.",
                },
            },
        },
        {
            "id": "lcs-q3",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "當 text_a[i-1] == text_b[j-1] 時，dp[i][j] 應該等於什麼？",
                    "options": [
                        {"id": "A", "text": "dp[i-1][j-1] + 1"},
                        {"id": "B", "text": "max(dp[i-1][j], dp[i][j-1])"},
                        {"id": "C", "text": "dp[i-1][j] + 1"},
                        {"id": "D", "text": "max(dp[i-1][j], dp[i][j-1]) + 1"},
                    ],
                    "explanation": "兩個字元相同時，它們可以配成一對放在 LCS 的最後面，剩下的問題是兩個字串都去掉最後一個字元，也就是左上角的 dp[i-1][j-1]，再加上這一對的 1。選項 C、D 可能讓同一個字元被重複配對。",
                },
                "en": {
                    "title": "When text_a[i-1] == text_b[j-1], what should dp[i][j] be?",
                    "options": [
                        {"id": "A", "text": "dp[i-1][j-1] + 1"},
                        {"id": "B", "text": "max(dp[i-1][j], dp[i][j-1])"},
                        {"id": "C", "text": "dp[i-1][j] + 1"},
                        {"id": "D", "text": "max(dp[i-1][j], dp[i][j-1]) + 1"},
                    ],
                    "explanation": "When the characters match they can be paired as the last character of the LCS. What remains is both strings without their last character — the upper-left cell dp[i-1][j-1] — plus 1 for this pair. Options C and D could pair the same character twice.",
                },
            },
        },
        {
            "id": "lcs-q4",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "當 text_a[i-1] != text_b[j-1] 時，dp[i][j] 應該等於什麼？",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "dp[i-1][j-1]"},
                        {"id": "C", "text": "max(dp[i-1][j], dp[i][j-1])"},
                        {"id": "D", "text": "min(dp[i-1][j], dp[i][j-1])"},
                    ],
                    "explanation": "兩個字元不同時，至少有一個不會出現在 LCS 的結尾。所以要嘗試「丟掉 text_a 的最後一個字元」(上方 dp[i-1][j]) 或「丟掉 text_b 的最後一個字元」(左方 dp[i][j-1])，取較大者。選項 A 是最長公共子字串在不相同時的做法。",
                },
                "en": {
                    "title": "When text_a[i-1] != text_b[j-1], what should dp[i][j] be?",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "dp[i-1][j-1]"},
                        {"id": "C", "text": "max(dp[i-1][j], dp[i][j-1])"},
                        {"id": "D", "text": "min(dp[i-1][j], dp[i][j-1])"},
                    ],
                    "explanation": "When the characters differ, at least one of them cannot end the LCS. So try dropping the last character of text_a (above, dp[i-1][j]) or of text_b (left, dp[i][j-1]) and take the larger. Option A is what the longest common substring does on a mismatch.",
                },
            },
        },
        {
            "id": "lcs-q5",
            "type": "true-false",
            "baseRating": 1000,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "兩個字串的最長公共子序列一定只有一個。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "錯誤。LCS 的「長度」是唯一的，但子序列本身可能有好幾個。例如 \"AB\" 與 \"BA\" 的 LCS 長度為 1，\"A\" 和 \"B\" 都是答案。回溯時遇到上方與左方相等的情況，選擇不同的方向就可能得到不同的 LCS。",
                },
                "en": {
                    "title": "Two strings always have exactly one longest common subsequence.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "False. The LCS length is unique, but the subsequence itself may not be. For \"AB\" and \"BA\" the LCS length is 1, and both \"A\" and \"B\" are valid answers. When above and left are equal during backtracking, choosing a different direction can yield a different LCS.",
                },
            },
        },
        {
            "id": "lcs-q6",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "兩個字串長度分別為 m 與 n，用二維 DP 求 LCS 長度的時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(m + n)"},
                        {"id": "B", "text": "O(m × n)"},
                        {"id": "C", "text": "O(2^(m+n))"},
                        {"id": "D", "text": "O((m + n) log(m + n))"},
                    ],
                    "explanation": "DP 表格共有 (m+1) × (n+1) 格，每格只做一次 O(1) 的比較與取值，所以時間複雜度為 O(m × n)。選項 C 是不做記憶化、直接暴力遞迴的複雜度。",
                },
                "en": {
                    "title": "For strings of lengths m and n, what is the time complexity of computing the LCS length with 2D DP?",
                    "options": [
                        {"id": "A", "text": "O(m + n)"},
                        {"id": "B", "text": "O(m × n)"},
                        {"id": "C", "text": "O(2^(m+n))"},
                        {"id": "D", "text": "O((m + n) log(m + n))"},
                    ],
                    "explanation": "The table has (m+1) × (n+1) cells and each cell does O(1) work, so the time is O(m × n). Option C is the cost of plain recursion without memoization.",
                },
            },
        },
        {
            "id": "lcs-q7",
            "groupId": "lcs-group-1",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "參考題組程式碼，dp[2][3]（\"AC\" 與 \"ABC\" 的 LCS 長度）的值為何？",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "0"},
                    ],
                    "explanation": "text_a[1] = 'C'、text_b[2] = 'C'，字元相同，所以 dp[2][3] = dp[1][2] + 1。dp[1][2] 是 \"A\" 與 \"AB\" 的 LCS 長度 1，因此 dp[2][3] = 2，對應子序列 \"AC\"。",
                },
                "en": {
                    "title": "Using the group code, what is dp[2][3] (the LCS length of \"AC\" and \"ABC\")?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "0"},
                    ],
                    "explanation": "text_a[1] = 'C' and text_b[2] = 'C' match, so dp[2][3] = dp[1][2] + 1. dp[1][2] is the LCS length of \"A\" and \"AB\", which is 1, so dp[2][3] = 2 — the subsequence \"AC\".",
                },
            },
        },
        {
            "id": "lcs-q8",
            "groupId": "lcs-group-1",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "參考題組程式碼，執行結束後 dp[5][5] 的值為何？",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "5"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "2"},
                    ],
                    "explanation": "\"ACBAD\" 與 \"ABCAD\" 的 LCS 長度為 4，例如 \"ACAD\" 或 \"ABAD\"。長度不可能是 5，因為兩個字串並不相同。",
                },
                "en": {
                    "title": "Using the group code, what is dp[5][5] after the loops finish?",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "5"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "2"},
                    ],
                    "explanation": "The LCS length of \"ACBAD\" and \"ABCAD\" is 4, e.g. \"ACAD\" or \"ABAD\". It cannot be 5 because the two strings are not identical.",
                },
            },
        },
        {
            "id": "lcs-q9",
            "groupId": "lcs-group-1",
            "type": "single-choice",
            "baseRating": 1250,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "參考題組程式碼，整個雙層迴圈中，if 條件 text_a[i - 1] == text_b[j - 1] 成立（走進 dp[i - 1][j - 1] + 1 那一行）共幾次？",
                    "options": [
                        {"id": "A", "text": "5"},
                        {"id": "B", "text": "6"},
                        {"id": "C", "text": "7"},
                        {"id": "D", "text": "8"},
                    ],
                    "explanation": "條件成立的次數等於「字元相同的 (i, j) 組合數」。text_a = ACBAD 中 A 出現 2 次、C 1 次、B 1 次、D 1 次；text_b = ABCAD 中 A 出現 2 次、B、C、D 各 1 次。相同字元配對數 = A: 2×2 + C: 1×1 + B: 1×1 + D: 1×1 = 7。",
                },
                "en": {
                    "title": "Using the group code, how many times is the if condition text_a[i - 1] == text_b[j - 1] true (reaching the dp[i - 1][j - 1] + 1 line) across both loops?",
                    "options": [
                        {"id": "A", "text": "5"},
                        {"id": "B", "text": "6"},
                        {"id": "C", "text": "7"},
                        {"id": "D", "text": "8"},
                    ],
                    "explanation": "It is the number of (i, j) pairs whose characters match. In text_a = ACBAD, A appears twice and C, B, D once each; in text_b = ABCAD, A appears twice and B, C, D once each. Matching pairs = A: 2×2 + C: 1×1 + B: 1×1 + D: 1×1 = 7.",
                },
            },
        },
        {
            "id": "lcs-q10",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "\"ABCBDAB\" 與 \"BDCABA\" 的最長公共子序列長度為何？",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "5"},
                        {"id": "D", "text": "6"},
                    ],
                    "explanation": "這是《演算法導論》的經典範例，LCS 長度為 4，例如 \"BCBA\"、\"BDAB\"、\"BCAB\" 都是答案，這也再次說明 LCS 不一定唯一。",
                },
                "en": {
                    "title": "What is the length of the longest common subsequence of \"ABCBDAB\" and \"BDCABA\"?",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "5"},
                        {"id": "D", "text": "6"},
                    ],
                    "explanation": "This is the classic CLRS example: the LCS length is 4, with \"BCBA\", \"BDAB\" and \"BCAB\" all valid answers — another reminder that the LCS is not always unique.",
                },
            },
        },
        {
            "id": "lcs-q11",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "每次可以從任一字串刪除一個字元，要讓 \"sea\" 和 \"eat\" 變成相同字串，最少需要刪除幾次？",
                    "options": [
                        {"id": "A", "text": "2"},
                        {"id": "B", "text": "3"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "1"},
                    ],
                    "explanation": "兩個字串最後留下的共同部分越長，要刪的就越少，所以留下的是 LCS。\"sea\" 與 \"eat\" 的 LCS 為 \"ea\"（長度 2），最少刪除次數 = len(A) + len(B) - 2 × LCS = 3 + 3 - 4 = 2（刪掉 s 和 t）。這就是 LeetCode 583。",
                },
                "en": {
                    "title": "Each step deletes one character from either string. What is the minimum number of deletions to make \"sea\" and \"eat\" equal?",
                    "options": [
                        {"id": "A", "text": "2"},
                        {"id": "B", "text": "3"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "1"},
                    ],
                    "explanation": "The longer the common part that survives, the fewer deletions — so what remains is the LCS. The LCS of \"sea\" and \"eat\" is \"ea\" (length 2), so the minimum is len(A) + len(B) - 2 × LCS = 3 + 3 - 4 = 2 (delete s and t). This is LeetCode 583.",
                },
            },
        },
        {
            "id": "lcs-q12",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "把 LCS 改成「最長公共子字串」（必須連續）時，DP 轉移最關鍵的差異是什麼？",
                    "options": [
                        {"id": "A", "text": "字元相同時改成 dp[i-1][j-1] + 2"},
                        {"id": "B", "text": "迴圈必須改成由後往前"},
                        {"id": "C", "text": "答案一定在 dp[m][n]，不需要額外記錄"},
                        {"id": "D", "text": "字元不同時 dp[i][j] = 0，並另外用變數記錄整張表的最大值"},
                    ],
                    "explanation": "子字串必須連續，字元一不同，以這兩個位置結尾的公共子字串就斷掉了，所以設為 0。也因為最長的那段可能結束在表格任何位置，答案要另外記錄全表最大值，而不是直接看 dp[m][n]。",
                },
                "en": {
                    "title": "When changing LCS into \"longest common substring\" (must be contiguous), what is the key difference in the DP transition?",
                    "options": [
                        {"id": "A", "text": "On a match, use dp[i-1][j-1] + 2"},
                        {"id": "B", "text": "The loops must run backwards"},
                        {"id": "C", "text": "The answer is always dp[m][n], so nothing else needs tracking"},
                        {"id": "D", "text": "On a mismatch set dp[i][j] = 0, and track the maximum over the whole table separately"},
                    ],
                    "explanation": "A substring must be contiguous, so a mismatch breaks any common substring ending at those positions — set it to 0. Because the longest run can end anywhere in the table, the answer is the maximum over all cells rather than dp[m][n].",
                },
            },
        },
        {
            "id": "lcs-q13",
            "type": "multiple-choice",
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些問題可以直接用 LCS 或它的延伸來解決？（多選）",
                    "options": [
                        {"id": "opt1", "text": "git diff 這類工具找出兩個版本檔案之間沒有變動的行"},
                        {"id": "opt2", "text": "比對兩段 DNA 序列的相似程度"},
                        {"id": "opt3", "text": "在帶權重的圖上找兩點之間的最短路徑"},
                        {"id": "opt4", "text": "求讓兩個字串相同所需的最少刪除次數"},
                    ],
                    "explanation": "opt1 正確：diff 工具把每一行當成一個字元求 LCS，LCS 以外的行就是新增或刪除。opt2 正確：序列比對是 LCS 的延伸（加上配對分數與間隙懲罰）。opt3 錯誤：這是 Dijkstra 等最短路徑演算法的範疇。opt4 正確：答案 = len(A) + len(B) - 2 × LCS。",
                },
                "en": {
                    "title": "Which of the following can be solved directly with LCS or an extension of it? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Tools like git diff finding the unchanged lines between two versions of a file"},
                        {"id": "opt2", "text": "Measuring how similar two DNA sequences are"},
                        {"id": "opt3", "text": "Finding the shortest path between two nodes in a weighted graph"},
                        {"id": "opt4", "text": "The minimum number of deletions to make two strings equal"},
                    ],
                    "explanation": "opt1 is correct: diff tools treat each line as a character and compute an LCS; lines outside it were added or removed. opt2 is correct: sequence alignment extends LCS with match scores and gap penalties. opt3 is wrong: that is the domain of shortest-path algorithms such as Dijkstra. opt4 is correct: answer = len(A) + len(B) - 2 × LCS.",
                },
            },
        },
        {
            "id": "lcs-q14",
            "type": "single-choice",
            "baseRating": 1300,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "只需要 LCS「長度」時，可以把空間從 O(m × n) 優化到 O(min(m, n))。關於這個優化，哪個敘述正確？",
                    "options": [
                        {"id": "A", "text": "優化後時間複雜度也會降到 O(min(m, n))"},
                        {"id": "B", "text": "優化後仍然可以用同樣的回溯方式還原出子序列"},
                        {"id": "C", "text": "計算每一列只會用到上一列與本列左邊的值，所以只要保留兩列（或一列加一個變數）"},
                        {"id": "D", "text": "這個優化只適用於兩個字串長度相同的情況"},
                    ],
                    "explanation": "dp[i][j] 只依賴 dp[i-1][j-1]、dp[i-1][j]、dp[i][j-1]，都在「上一列」或「本列左邊」，所以滾動陣列就夠了，讓較短的字串當欄即可得到 O(min(m, n))。但時間仍是 O(m × n)，而且整張表被覆蓋掉之後就無法直接回溯出子序列（需要 Hirschberg 等進階技巧）。",
                },
                "en": {
                    "title": "When only the LCS length is needed, space can be reduced from O(m × n) to O(min(m, n)). Which statement about this optimization is correct?",
                    "options": [
                        {"id": "A", "text": "The time complexity also drops to O(min(m, n))"},
                        {"id": "B", "text": "The subsequence can still be recovered with the same backtracking"},
                        {"id": "C", "text": "Each row only needs the previous row and the values to its left, so keeping two rows (or one row plus a variable) is enough"},
                        {"id": "D", "text": "It only works when both strings have the same length"},
                    ],
                    "explanation": "dp[i][j] depends only on dp[i-1][j-1], dp[i-1][j] and dp[i][j-1] — all in the previous row or to the left in the current row — so a rolling array suffices, and using the shorter string for columns gives O(min(m, n)). Time is still O(m × n), and once the table is overwritten the subsequence cannot be backtracked directly (that needs techniques such as Hirschberg's algorithm).",
                },
            },
        },
        {
            "id": "lcs-q15",
            "type": "fill-code",
            "baseRating": 1300,
            "correctAnswer": [
                "dp[i-1][j-1]+1|1+dp[i-1][j-1]",
                "max(dp[i-1][j],dp[i][j-1])|max(dp[i][j-1],dp[i-1][j])",
                "dp[m][n]|dp[-1][-1]",
            ],
            "code": LCS_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 lcs_length 程式碼中 (a)(b)(c) 缺失的表達式，完成 LCS 長度的二維 DP 實作。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) 字元相同：取左上角再加 1，dp[i-1][j-1] + 1。(b) 字元不同：取上方與左方較大者，max(dp[i-1][j], dp[i][j-1])。(c) 答案是兩個完整字串的 LCS 長度，位於右下角 dp[m][n]。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in lcs_length to complete the 2D DP for the LCS length.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "(a) On a match take the upper-left cell plus 1: dp[i-1][j-1] + 1. (b) On a mismatch take the larger of above and left: max(dp[i-1][j], dp[i][j-1]). (c) The answer is the LCS length of the full strings, in the bottom-right cell dp[m][n].",
                },
            },
        },
        {
            "id": "lcs-q16",
            "type": "fill-code",
            "baseRating": 1350,
            "correctAnswer": [
                "max(best,dp[i][j])|max(dp[i][j],best)",
                "0",
            ],
            "code": SUBSTRING_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 longest_common_substring 程式碼中 (a)(b) 缺失的表達式，完成「最長公共子字串」（必須連續）的實作。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}],
                    "explanation": "(a) 最長的連續片段可能結束在任何位置，所以每次更新都要記錄全表最大值：max(best, dp[i][j])。(b) 字元不同時，以這兩個位置結尾的連續片段斷掉，長度歸零：0。這就是它和 LCS 取 max(上, 左) 的差別。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b) in longest_common_substring to complete the longest common substring (must be contiguous).",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}],
                    "explanation": "(a) The longest contiguous run can end anywhere, so track the maximum over the whole table: max(best, dp[i][j]). (b) On a mismatch the run ending at these positions breaks, so its length resets to 0 — unlike LCS, which takes max(above, left).",
                },
            },
        },
        {
            "id": "lcs-q17",
            "type": "predict-line",
            "baseRating": 1350,
            "correctAnswer": "1 2 3 4 5 8 9 4 5 6 7 4 12",
            "code": BACKTRACK_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 backtrack 函數。給定 a = \"AB\"、b = \"BA\"，以及已填好的 dp = [[0, 0, 0], [0, 0, 1], [0, 1, 1]]，呼叫 backtrack(a, b, dp) 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "L1 進入函數；L2 i=2, j=2；L3 res=[]；L4 條件成立；L5 a[1]='B' 與 b[1]='A' 不同；L8 dp[1][2]=1 ≥ dp[2][1]=1 成立；L9 i=1。L4 條件成立；L5 a[0]='A' 與 b[1]='A' 相同；L6 加入 'A'；L7 i=0, j=1。L4 i=0 條件不成立，離開迴圈；L12 回傳 \"A\"。行號序列：1 2 3 4 5 8 9 4 5 6 7 4 12。",
                },
                "en": {
                    "title": "Read the backtrack function. Given a = \"AB\", b = \"BA\" and the filled table dp = [[0, 0, 0], [0, 0, 1], [0, 1, 1]], calling backtrack(a, b, dp) — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "L1 enter; L2 i=2, j=2; L3 res=[]; L4 condition true; L5 a[1]='B' vs b[1]='A' differ; L8 dp[1][2]=1 >= dp[2][1]=1 is true; L9 i=1. L4 true; L5 a[0]='A' vs b[1]='A' match; L6 append 'A'; L7 i=0, j=1. L4 fails because i=0, leaving the loop; L12 returns \"A\". Line sequence: 1 2 3 4 5 8 9 4 5 6 7 4 12.",
                },
            },
        },
        {
            "id": "lcs-q18",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "為什麼 LCS 的 DP 表格大小是 (m+1) × (n+1)，而不是 m × n？",
                    "options": [
                        {"id": "A", "text": "多出來的第 0 列與第 0 欄代表空字串，作為值全為 0 的基底情況，讓 i-1、j-1 不會越界"},
                        {"id": "B", "text": "最後一列用來存放回溯出的子序列"},
                        {"id": "C", "text": "Python 的串列索引從 1 開始"},
                        {"id": "D", "text": "多一格是為了存放兩個字串長度的總和"},
                    ],
                    "explanation": "dp[0][j] 與 dp[i][0] 代表其中一個字串為空，LCS 長度必然為 0。有了這圈基底，計算 dp[1][1] 時也能安全地讀取 dp[0][0]、dp[0][1]、dp[1][0]，不必另外處理邊界。",
                },
                "en": {
                    "title": "Why is the LCS DP table (m+1) × (n+1) instead of m × n?",
                    "options": [
                        {"id": "A", "text": "The extra row 0 and column 0 represent the empty string — a base case of all zeros — so i-1 and j-1 never go out of bounds"},
                        {"id": "B", "text": "The last row stores the backtracked subsequence"},
                        {"id": "C", "text": "Python list indices start at 1"},
                        {"id": "D", "text": "The extra cell stores the sum of both string lengths"},
                    ],
                    "explanation": "dp[0][j] and dp[i][0] mean one string is empty, so the LCS length is 0. With this border of base cases, computing dp[1][1] can safely read dp[0][0], dp[0][1] and dp[1][0] without special boundary handling.",
                },
            },
        },
    ],
}

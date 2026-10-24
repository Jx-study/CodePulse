FIB_FILL_CODE = """def fib(n):
    if n <= (a):
        return (b)
    return fib((c)) + fib(n - 2)"""

FIB_PREDICT_CODE = """def fib(n):                         # L1
    if n <= 1:                     # L2
        return n                   # L3
    return fib(n - 1) + fib(n - 2) # L4"""

DATA = {
    "slug": "fibonacci-recursive",
    "groups": [
    ],
    "questions": [
        {
            "id": "fibonacci-recursive-q1",
            "type": "single-choice",
            "baseRating": 850,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "未經優化的遞迴版 fib(n) 的時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(n)"},
                        {"id": "B", "text": "O(n log n)"},
                        {"id": "C", "text": "O(2ⁿ)"},
                        {"id": "D", "text": "O(1)"},
                    ],
                    "explanation": "每次呼叫會產生兩個子呼叫，呼叫樹的節點數大約隨 n 呈指數成長，因此時間複雜度為 O(2ⁿ)（嚴格上界約為 O(1.618ⁿ)）。",
                },
                "en": {
                    "title": "What is the time complexity of the unoptimized recursive fib(n)?",
                    "options": [
                        {"id": "A", "text": "O(n)"},
                        {"id": "B", "text": "O(n log n)"},
                        {"id": "C", "text": "O(2ⁿ)"},
                        {"id": "D", "text": "O(1)"},
                    ],
                    "explanation": "Each call spawns two subcalls, so the number of nodes in the call tree grows exponentially with n, giving O(2ⁿ) (a tighter bound is about O(1.618ⁿ)).",
                },
            },
        },
        {
            "id": "fibonacci-recursive-q2",
            "type": "true-false",
            "baseRating": 900,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "計算 fib(5) 的過程中，fib(3) 會被重複計算兩次。",
                    "options": [
                        {"id": "true", "text": "正確"},
                        {"id": "false", "text": "錯誤"},
                    ],
                    "explanation": "正確。fib(5) 會呼叫 fib(4) 與 fib(3)，而 fib(4) 又會呼叫 fib(3)，所以 fib(3) 共被計算 2 次。這就是重疊子問題。",
                },
                "en": {
                    "title": "While computing fib(5), fib(3) is computed twice.",
                    "options": [
                        {"id": "true", "text": "True"},
                        {"id": "false", "text": "False"},
                    ],
                    "explanation": "True. fib(5) calls fib(4) and fib(3), and fib(4) calls fib(3) again, so fib(3) is computed 2 times. This is the overlapping-subproblem issue.",
                },
            },
        },
        {
            "id": "fibonacci-recursive-q3",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "計算 fib(4) 時，fib 函式總共會被呼叫幾次（包含最初的那一次）？",
                    "options": [
                        {"id": "A", "text": "5 次"},
                        {"id": "B", "text": "9 次"},
                        {"id": "C", "text": "8 次"},
                        {"id": "D", "text": "15 次"},
                    ],
                    "explanation": "設 C(n) 為計算 fib(n) 的總呼叫次數，C(0)=C(1)=1，C(n)=1+C(n-1)+C(n-2)。C(2)=3，C(3)=5，C(4)=1+5+3=9。",
                },
                "en": {
                    "title": "How many times is fib called in total (including the first call) when computing fib(4)?",
                    "options": [
                        {"id": "A", "text": "5"},
                        {"id": "B", "text": "9"},
                        {"id": "C", "text": "8"},
                        {"id": "D", "text": "15"},
                    ],
                    "explanation": "Let C(n) be the total calls for fib(n): C(0)=C(1)=1 and C(n)=1+C(n-1)+C(n-2). C(2)=3, C(3)=5, C(4)=1+5+3=9.",
                },
            },
        },
        {
            "id": "fibonacci-recursive-q4",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "未經優化的遞迴版 fib(n) 的空間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(n)"},
                        {"id": "B", "text": "O(2ⁿ)"},
                        {"id": "C", "text": "O(1)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "雖然總呼叫次數是指數級，但同一時間呼叫堆疊上最多只有從根到最深葉節點的一條路徑，深度為 n，所以空間複雜度為 O(n)。",
                },
                "en": {
                    "title": "What is the space complexity of the unoptimized recursive fib(n)?",
                    "options": [
                        {"id": "A", "text": "O(n)"},
                        {"id": "B", "text": "O(2ⁿ)"},
                        {"id": "C", "text": "O(1)"},
                        {"id": "D", "text": "O(n²)"},
                    ],
                    "explanation": "The total number of calls is exponential, but at any moment the call stack holds only one root-to-leaf path of depth at most n, so the space complexity is O(n).",
                },
            },
        },
        {
            "id": "fibonacci-recursive-q5",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "遞迴版 fib(n) 在 n 變大時會非常慢，最主要的原因是什麼？",
                    "options": [
                        {"id": "A", "text": "遞迴本身一定比迴圈慢"},
                        {"id": "B", "text": "Python 的整數運算很慢"},
                        {"id": "C", "text": "base case 寫錯了"},
                        {"id": "D", "text": "大量相同的子問題被重複計算"},
                    ],
                    "explanation": "fib(n-1) 與 fib(n-2) 的計算大量重疊，例如 fib(3) 會被反覆求值。重疊子問題沒有被儲存，導致時間呈指數成長。",
                },
                "en": {
                    "title": "What is the main reason the recursive fib(n) becomes very slow as n grows?",
                    "options": [
                        {"id": "A", "text": "Recursion is always slower than loops"},
                        {"id": "B", "text": "Integer arithmetic in Python is slow"},
                        {"id": "C", "text": "The base case is wrong"},
                        {"id": "D", "text": "Subproblems get recomputed"},
                    ],
                    "explanation": "The computations of fib(n-1) and fib(n-2) overlap heavily, e.g. fib(3) is evaluated again and again. Because the results are not stored, the running time grows exponentially.",
                },
            },
        },
        {
            "id": "fibonacci-recursive-q6",
            "type": "true-false",
            "baseRating": 1000,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "為遞迴版 fib 加上記憶化（Memoization）之後，時間複雜度可以降到 O(n)。",
                    "options": [
                        {"id": "true", "text": "正確"},
                        {"id": "false", "text": "錯誤"},
                    ],
                    "explanation": "正確。每個 fib(k) 只會真正計算一次並被存起來，之後直接查表，總共只需 n 個不同的子問題，時間為 O(n)。",
                },
                "en": {
                    "title": "Adding memoization to the recursive fib reduces the time complexity to O(n).",
                    "options": [
                        {"id": "true", "text": "True"},
                        {"id": "false", "text": "False"},
                    ],
                    "explanation": "True. Each fib(k) is computed only once and then stored, later calls just look it up. There are only n distinct subproblems, so the time is O(n).",
                },
            },
        },
        {
            "id": "fibonacci-recursive-q7",
            "type": "multiple-choice",
            "baseRating": 1150,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些方法可以讓 Fibonacci 的計算變得有效率？（多選）",
                    "options": [
                        {"id": "opt1", "text": "記憶化遞迴（Top-Down）"},
                        {"id": "opt2", "text": "迭代式動態規劃（Bottom-Up）"},
                        {"id": "opt3", "text": "只用兩個變數滾動保存前兩項"},
                        {"id": "opt4", "text": "把遞迴深度上限調得更大"},
                    ],
                    "explanation": "記憶化（opt1）、由小到大填表（opt2）、只保留前兩項（opt3）都避免了重複計算。調高遞迴深度上限（opt4）只會讓更深的呼叫不報錯，並不會減少重複計算。",
                },
                "en": {
                    "title": "Which of the following make computing Fibonacci efficient? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Memoized recursion (top-down)"},
                        {"id": "opt2", "text": "Iterative dynamic programming (bottom-up)"},
                        {"id": "opt3", "text": "Keeping only the previous two values in two variables"},
                        {"id": "opt4", "text": "Raising the recursion depth limit"},
                    ],
                    "explanation": "Memoization (opt1), filling a table from small to large (opt2) and keeping only the last two values (opt3) all avoid recomputation. Raising the recursion depth limit (opt4) only lets deeper calls run without an error and does not reduce repeated work.",
                },
            },
        },
        {
            "id": "fibonacci-recursive-q8",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若 fib 只保留 `if n == 0: return 0` 這個終止條件而沒有處理 n == 1，呼叫 fib(1) 會發生什麼事？",
                    "options": [
                        {"id": "A", "text": "回傳 1"},
                        {"id": "B", "text": "fib(-1) 永遠到不了終止條件，無限遞迴"},
                        {"id": "C", "text": "回傳 0"},
                        {"id": "D", "text": "回傳 2"},
                    ],
                    "explanation": "fib(1) 不是 base case，會繼續呼叫 fib(0)（回傳 0）與 fib(-1)。fib(-1) 又會呼叫 fib(-2)、fib(-3)…，n 越來越小而永遠碰不到 n == 0，最終發生 RecursionError。",
                },
                "en": {
                    "title": "If fib only keeps the base case `if n == 0: return 0` and does not handle n == 1, what happens when calling fib(1)?",
                    "options": [
                        {"id": "A", "text": "It returns 1"},
                        {"id": "B", "text": "fib(-1) never hits a base case: infinite recursion"},
                        {"id": "C", "text": "It returns 0"},
                        {"id": "D", "text": "It returns 2"},
                    ],
                    "explanation": "fib(1) is no longer a base case, so it calls fib(0) (returns 0) and fib(-1). fib(-1) calls fib(-2), fib(-3), … and n keeps decreasing without ever hitting 0, eventually causing a RecursionError.",
                },
            },
        },
        {
            "id": "fibonacci-recursive-q9",
            "type": "single-choice",
            "baseRating": 1300,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "計算 fib(5) 時，fib(1) 這個葉節點總共會被呼叫幾次？",
                    "options": [
                        {"id": "A", "text": "3 次"},
                        {"id": "B", "text": "4 次"},
                        {"id": "C", "text": "5 次"},
                        {"id": "D", "text": "8 次"},
                    ],
                    "explanation": "葉節點為 fib(1) 與 fib(0)。fib(n) 的呼叫樹中 fib(1) 出現的次數恰好等於 fib(n) 的值，也就是 fib(5)=5 次；fib(0) 則出現 fib(n-1)=3 次。",
                },
                "en": {
                    "title": "When computing fib(5), how many times is the leaf call fib(1) made in total?",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "5"},
                        {"id": "D", "text": "8"},
                    ],
                    "explanation": "The leaves are fib(1) and fib(0). In the call tree of fib(n), fib(1) appears exactly fib(n) times, so fib(5)=5 times, while fib(0) appears fib(n-1)=3 times.",
                },
            },
        },
        {
            "id": "fibonacci-recursive-q10",
            "type": "fill-code",
            "baseRating": 1150,
            "correctAnswer": ["1", "n", "n - 1"],
            "code": FIB_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 fib 程式碼中 (a)(b)(c) 缺失的表達式。",
                    "options": [
                        {"id": "a", "text": ""},
                        {"id": "b", "text": ""},
                        {"id": "c", "text": ""},
                    ],
                    "explanation": "(a) n <= 1 時屬於終止條件。(b) fib(0)=0、fib(1)=1，所以終止條件直接回傳 n。(c) 第一個子問題為 fib(n - 1)。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in the fib code.",
                    "options": [
                        {"id": "a", "text": ""},
                        {"id": "b", "text": ""},
                        {"id": "c", "text": ""},
                    ],
                    "explanation": "(a) n <= 1 is the base case. (b) fib(0)=0 and fib(1)=1, so the base case simply returns n. (c) The first subproblem is fib(n - 1).",
                },
            },
        },
        {
            "id": "fibonacci-recursive-q11",
            "type": "predict-line",
            "baseRating": 1500,
            "correctAnswer": "1 2 4 1 2 4 1 2 3 1 2 3 1 2 3",
            "code": FIB_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 fib 函數。呼叫 fib(3) 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "fib(3) 為 L1 L2 L4，先呼叫 fib(2)：L1 L2 L4，再呼叫 fib(1)：L1 L2 L3 回傳 1；接著 fib(2) 的第二個子呼叫 fib(0)：L1 L2 L3 回傳 0。回到 fib(3) 後再呼叫 fib(1)：L1 L2 L3 回傳 1，最終回傳 2。完整序列：1 2 4 1 2 4 1 2 3 1 2 3 1 2 3。",
                },
                "en": {
                    "title": "Read the fib function. Calling fib(3) — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "fib(3) runs L1 L2 L4 and first calls fib(2): L1 L2 L4, which calls fib(1): L1 L2 L3 returning 1, then fib(0): L1 L2 L3 returning 0. Back in fib(3) it calls fib(1): L1 L2 L3 returning 1, and the final result is 2. Full sequence: 1 2 4 1 2 4 1 2 3 1 2 3 1 2 3.",
                },
            },
        },
        {
            "id": "fibonacci-recursive-q12",
            "type": "single-choice",
            "baseRating": 1050,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "記憶化版本的 fib(n) 使用 O(n) 空間，主要是因為哪兩個部分？",
                    "options": [
                        {"id": "A", "text": "備忘錄加上最深 n 層的遞迴堆疊"},
                        {"id": "B", "text": "只有備忘錄"},
                        {"id": "C", "text": "只有遞迴堆疊，備忘錄不佔空間"},
                        {"id": "D", "text": "兩個變數 a 與 b"},
                    ],
                    "explanation": "備忘錄需要存放 n+1 個結果（O(n)），同時遞迴最深可達 n 層（O(n)），所以整體仍是 O(n)。只用兩個變數滾動的迭代版才是 O(1)。",
                },
                "en": {
                    "title": "A memoized fib(n) uses O(n) space. Which two parts account for this?",
                    "options": [
                        {"id": "A", "text": "The memo plus a recursion stack of depth n"},
                        {"id": "B", "text": "Only the memo"},
                        {"id": "C", "text": "Only the recursion stack; the memo takes no space"},
                        {"id": "D", "text": "Two variables a and b"},
                    ],
                    "explanation": "The memo stores n+1 results (O(n)) and the recursion goes up to n levels deep (O(n)), so the total is still O(n). Only an iterative version that rolls two variables is O(1).",
                },
            },
        },
    ],
}

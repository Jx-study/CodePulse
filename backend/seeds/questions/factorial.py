FACT_BUG_CODE = """def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)"""

FACT_FILL_CODE = """def factorial(n):
    if n <= 1:
        return (a)
    return (b) * factorial((c))"""

FACT_PREDICT_CODE = """def factorial(n):                  # L1
    if n <= 1:                     # L2
        return 1                   # L3
    return n * factorial(n - 1)    # L4"""

DATA = {
    "slug": "factorial",
    "groups": [
        {
            "id": "factorial-group-1",
            "translations": {
                "zh-TW": {
                    "title": "題組：base case 寫成 n == 0 的階乘",
                    "description": "以下階乘函式的終止條件寫成 n == 0。請閱讀程式碼並回答問題。",
                },
                "en": {
                    "title": "Group: Factorial with an n == 0 base case",
                    "description": "The factorial function below uses n == 0 as its base case. Read the code and answer the question.",
                },
            },
            "code": FACT_BUG_CODE,
            "language": "python",
        },
    ],
    "questions": [
        {
            "id": "factorial-q1",
            "type": "single-choice",
            "baseRating": 800,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "遞迴函式一定要有哪個部分，才能保證最終停止？",
                    "options": [
                        {"id": "A", "text": "迴圈計數器"},
                        {"id": "B", "text": "終止條件"},
                        {"id": "C", "text": "全域變數"},
                        {"id": "D", "text": "回傳值型別宣告"},
                    ],
                    "explanation": "遞迴必須有終止條件（Base Case）。沒有它，函式會一直呼叫自己，直到呼叫堆疊耗盡而發生錯誤。",
                },
                "en": {
                    "title": "What must a recursive function have to guarantee that it eventually stops?",
                    "options": [
                        {"id": "A", "text": "A loop counter"},
                        {"id": "B", "text": "A base case"},
                        {"id": "C", "text": "A global variable"},
                        {"id": "D", "text": "A return type declaration"},
                    ],
                    "explanation": "A recursive function needs a base case. Without one it keeps calling itself until the call stack is exhausted and an error occurs.",
                },
            },
        },
        {
            "id": "factorial-q2",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "遞迴版階乘 factorial(n) 的時間複雜度為 O(n)。",
                    "options": [
                        {"id": "true", "text": "正確"},
                        {"id": "false", "text": "錯誤"},
                    ],
                    "explanation": "正確。factorial(n) 會依序呼叫 factorial(n-1)、…、factorial(1)，共 n 次呼叫，每次只做一次乘法，所以時間複雜度為 O(n)。",
                },
                "en": {
                    "title": "The time complexity of the recursive factorial(n) is O(n).",
                    "options": [
                        {"id": "true", "text": "True"},
                        {"id": "false", "text": "False"},
                    ],
                    "explanation": "True. factorial(n) calls factorial(n-1), …, factorial(1), which is n calls with one multiplication each, so the time complexity is O(n).",
                },
            },
        },
        {
            "id": "factorial-q3",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "呼叫 factorial(5) 時，呼叫堆疊中同時存在的函式框架（frame）最多有幾個？",
                    "options": [
                        {"id": "A", "text": "1 個"},
                        {"id": "B", "text": "4 個"},
                        {"id": "C", "text": "5 個"},
                        {"id": "D", "text": "6 個"},
                    ],
                    "explanation": "factorial(5) → factorial(4) → … → factorial(1)，在到達終止條件時堆疊裡同時有 n=5,4,3,2,1 共 5 個框架。",
                },
                "en": {
                    "title": "When calling factorial(5), what is the maximum number of frames on the call stack at the same time?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "5"},
                        {"id": "D", "text": "6"},
                    ],
                    "explanation": "factorial(5) → factorial(4) → … → factorial(1). When the base case is reached the stack holds the frames for n=5,4,3,2,1, which is 5 frames.",
                },
            },
        },
        {
            "id": "factorial-q4",
            "type": "true-false",
            "baseRating": 1000,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "遞迴版 factorial(n) 的空間複雜度為 O(1)。",
                    "options": [
                        {"id": "true", "text": "正確"},
                        {"id": "false", "text": "錯誤"},
                    ],
                    "explanation": "錯誤。每次遞迴呼叫都會在呼叫堆疊上多一個框架，最深時有 n 個框架，所以空間複雜度為 O(n)。迴圈版才是 O(1)。",
                },
                "en": {
                    "title": "The space complexity of the recursive factorial(n) is O(1).",
                    "options": [
                        {"id": "true", "text": "True"},
                        {"id": "false", "text": "False"},
                    ],
                    "explanation": "False. Every recursive call adds a frame to the call stack, reaching n frames at the deepest point, so the space complexity is O(n). Only the loop version is O(1).",
                },
            },
        },
        {
            "id": "factorial-q5",
            "type": "single-choice",
            "baseRating": 850,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "依照 0! 的定義與一般階乘程式的寫法，factorial(0) 應該回傳多少？",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "0"},
                        {"id": "C", "text": "-1"},
                        {"id": "D", "text": "會發生錯誤"},
                    ],
                    "explanation": "數學上 0! = 1，所以 base case 通常把 n <= 1（或 n == 0）時回傳 1。",
                },
                "en": {
                    "title": "By the definition of 0! and the usual factorial implementation, what should factorial(0) return?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "0"},
                        {"id": "C", "text": "-1"},
                        {"id": "D", "text": "An error is raised"},
                    ],
                    "explanation": "Mathematically 0! = 1, so the base case returns 1 when n <= 1 (or n == 0).",
                },
            },
        },
        {
            "id": "factorial-q6",
            "type": "multiple-choice",
            "baseRating": 1050,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些是正確遞迴設計所需要的條件？（多選）",
                    "options": [
                        {"id": "opt1", "text": "至少有一個不再遞迴的終止條件"},
                        {"id": "opt2", "text": "遞迴呼叫處理的是規模更小的問題"},
                        {"id": "opt3", "text": "每次呼叫都更接近終止條件"},
                        {"id": "opt4", "text": "必須搭配迴圈才能運作"},
                    ],
                    "explanation": "正確的遞迴需要終止條件（opt1）、把問題縮小（opt2），並且每次都朝終止條件前進（opt3）。遞迴本身不需要迴圈（opt4 錯誤）。",
                },
                "en": {
                    "title": "Which of the following are required for a correct recursive design? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "At least one base case that does not recurse"},
                        {"id": "opt2", "text": "The recursive call works on a smaller problem"},
                        {"id": "opt3", "text": "Every call moves closer to the base case"},
                        {"id": "opt4", "text": "It must be combined with a loop to work"},
                    ],
                    "explanation": "A correct recursion needs a base case (opt1), a smaller subproblem (opt2), and progress toward the base case on every call (opt3). Recursion itself does not need a loop (opt4 is wrong).",
                },
            },
        },
        {
            "id": "factorial-q7",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在 factorial(4) 的執行過程中，乘法 n * factorial(n-1) 是在什麼時候真正被計算出結果？",
                    "options": [
                        {"id": "A", "text": "往下呼叫的過程中，每進入一層就立刻算出"},
                        {"id": "B", "text": "到達終止條件後，逐層回傳時"},
                        {"id": "C", "text": "所有呼叫開始之前"},
                        {"id": "D", "text": "只有在 n 為偶數時"},
                    ],
                    "explanation": "每一層的 n * factorial(n-1) 必須等內層回傳結果才算得出來，所以乘法是在到達 base case 之後、逐層回傳時才依序完成：1 → 2 → 6 → 24。",
                },
                "en": {
                    "title": "During factorial(4), when is the multiplication n * factorial(n-1) actually evaluated?",
                    "options": [
                        {"id": "A", "text": "Immediately on each level while going down"},
                        {"id": "B", "text": "On the way back, after the base case"},
                        {"id": "C", "text": "Before any call starts"},
                        {"id": "D", "text": "Only when n is even"},
                    ],
                    "explanation": "Each level's n * factorial(n-1) needs the inner call's result first, so the multiplications finish while returning after the base case: 1 → 2 → 6 → 24.",
                },
            },
        },
        {
            "id": "factorial-q8",
            "groupId": "factorial-group-1",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "以下程式的 base case 寫成 n == 0。呼叫 factorial(-1) 會發生什麼事？",
                    "options": [
                        {"id": "A", "text": "回傳 1"},
                        {"id": "B", "text": "回傳 -1"},
                        {"id": "C", "text": "不斷遞迴直到 RecursionError"},
                        {"id": "D", "text": "回傳 0"},
                    ],
                    "explanation": "n 從 -1 變成 -2、-3…，永遠不會等於 0，沒有任何一次呼叫能到達 base case，最後會超過遞迴深度上限而丟出 RecursionError。使用 n <= 1 能避免這類問題。",
                },
                "en": {
                    "title": "The base case below is written as n == 0. What happens when calling factorial(-1)?",
                    "options": [
                        {"id": "A", "text": "It returns 1"},
                        {"id": "B", "text": "It returns -1"},
                        {"id": "C", "text": "Recurses until RecursionError"},
                        {"id": "D", "text": "It returns 0"},
                    ],
                    "explanation": "n goes -1, -2, -3, … and never equals 0, so no call reaches the base case and the recursion depth limit is exceeded with a RecursionError. Using n <= 1 avoids this kind of problem.",
                },
            },
        },
        {
            "id": "factorial-q9",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "與迴圈版階乘相比，遞迴版階乘最主要的缺點是什麼？",
                    "options": [
                        {"id": "A", "text": "時間複雜度更高"},
                        {"id": "B", "text": "答案會不一樣"},
                        {"id": "C", "text": "程式碼一定更長"},
                        {"id": "D", "text": "額外堆疊空間，n 大時可能溢位"},
                    ],
                    "explanation": "兩者時間複雜度都是 O(n)，結果相同；但遞迴版需要 O(n) 的呼叫堆疊空間，n 過大時可能超過遞迴深度上限。",
                },
                "en": {
                    "title": "Compared with the loop version, what is the main drawback of the recursive factorial?",
                    "options": [
                        {"id": "A", "text": "Higher time complexity"},
                        {"id": "B", "text": "The answers differ"},
                        {"id": "C", "text": "The code is always longer"},
                        {"id": "D", "text": "Extra stack space; may overflow for large n"},
                    ],
                    "explanation": "Both are O(n) in time and give the same result, but the recursive version needs O(n) call-stack space and may exceed the recursion depth limit for large n.",
                },
            },
        },
        {
            "id": "factorial-q10",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "factorial(n) 若改成「尾端遞迴」寫法（多帶一個累積參數 acc），主要想解決的是什麼問題？",
                    "options": [
                        {"id": "A", "text": "減少乘法的次數"},
                        {"id": "B", "text": "重用同一個框架，避免堆疊持續增長"},
                        {"id": "C", "text": "讓 n 可以是負數"},
                        {"id": "D", "text": "讓結果變成浮點數"},
                    ],
                    "explanation": "尾端遞迴把乘法結果累積在參數中，遞迴呼叫是函式的最後一個動作，支援尾端呼叫最佳化的語言可以重用框架，使空間降為 O(1)。注意 Python 並不做這項最佳化，但概念值得了解。",
                },
                "en": {
                    "title": "If factorial(n) is rewritten in tail-recursive form (with an extra accumulator parameter acc), what problem is it mainly trying to solve?",
                    "options": [
                        {"id": "A", "text": "Fewer multiplications"},
                        {"id": "B", "text": "Reusing one frame so the stack stops growing"},
                        {"id": "C", "text": "Allowing negative n"},
                        {"id": "D", "text": "Making the result a float"},
                    ],
                    "explanation": "Tail recursion accumulates the product in a parameter and makes the recursive call the last action, so languages with tail-call optimization can reuse the frame and use O(1) space. Python does not perform this optimization, but the concept is worth knowing.",
                },
            },
        },
        {
            "id": "factorial-q11",
            "type": "fill-code",
            "baseRating": 1150,
            "correctAnswer": ["1", "n", "n - 1"],
            "code": FACT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 factorial 程式碼中 (a)(b)(c) 缺失的表達式。",
                    "options": [
                        {"id": "a", "text": ""},
                        {"id": "b", "text": ""},
                        {"id": "c", "text": ""},
                    ],
                    "explanation": "(a) 終止條件 n <= 1 時回傳 1。(b) 遞迴情況要把目前的 n 乘上子問題的結果，所以是 n。(c) 子問題的規模要縮小，傳入 n - 1。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in the factorial code.",
                    "options": [
                        {"id": "a", "text": ""},
                        {"id": "b", "text": ""},
                        {"id": "c", "text": ""},
                    ],
                    "explanation": "(a) The base case n <= 1 returns 1. (b) The recursive case multiplies the current n by the subproblem result, so it is n. (c) The subproblem must be smaller, so pass n - 1.",
                },
            },
        },
        {
            "id": "factorial-q12",
            "type": "predict-line",
            "baseRating": 1300,
            "correctAnswer": "1 2 4 1 2 4 1 2 3",
            "code": FACT_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 factorial 函數。呼叫 factorial(3) 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "L1 進入 factorial(3)，L2 判斷 3 <= 1 為否，L4 呼叫 factorial(2)。factorial(2) 同樣為 L1 L2 L4，並呼叫 factorial(1)。factorial(1) 為 L1 L2，條件成立後 L3 回傳 1。之後逐層回傳時不會再執行新的行，最終回傳 6。完整序列：1 2 4 1 2 4 1 2 3。",
                },
                "en": {
                    "title": "Read the factorial function. Calling factorial(3) — write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "L1 enters factorial(3), L2 checks 3 <= 1 which is false, L4 calls factorial(2). factorial(2) runs L1 L2 L4 the same way and calls factorial(1). factorial(1) runs L1 L2, the condition holds, and L3 returns 1. Returning up the stack executes no new lines, and the final result is 6. Full sequence: 1 2 4 1 2 4 1 2 3.",
                },
            },
        },
    ],
}

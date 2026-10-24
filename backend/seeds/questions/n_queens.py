NQ_BOARD_PARTIAL_CODE = """. Q . .
. . . Q
. . . .
. . . ."""

NQ_BOARD_FULL_CODE = """. Q . .
. . . Q
Q . . .
. . Q ."""

NQ_FILL_CODE = """def solve(row, n, cols, d1, d2):
    if row == (a):
        return True
    for col in range(n):
        if col in cols or row - col in d1 or row + col in (b):
            continue
        cols.add(col)
        d1.add(row - col)
        d2.add(row + col)
        if solve((c), n, cols, d1, d2):
            return True
        cols.discard(col)
        d1.discard(row - col)
        d2.discard(row + col)
    return False"""

DATA = {
    "slug": "n-queens",
    "groups": [
        {
            "id": "n-queens-group-1",
            "translations": {
                "zh-TW": {
                    "title": "題組：搜尋到一半的 4 × 4 棋盤",
                    "description": "下方是 4 皇后搜尋到一半的棋盤，Q 代表皇后、. 代表空格。第 0 列與第 1 列已經放好皇后，接下來要決定第 2 列。",
                },
                "en": {
                    "title": "Group: A Partially Filled 4 × 4 Board",
                    "description": "Below is a 4-Queens board midway through the search. Q is a queen and . is an empty cell. Rows 0 and 1 already have queens, and row 2 is next.",
                },
            },
            "code": NQ_BOARD_PARTIAL_CODE,
            "language": "plaintext",
        },
        {
            "id": "n-queens-group-2",
            "translations": {
                "zh-TW": {
                    "title": "題組：完整的 4 × 4 棋盤",
                    "description": "下方是放滿 4 個皇后的棋盤，Q 代表皇后、. 代表空格。",
                },
                "en": {
                    "title": "Group: A Complete 4 × 4 Board",
                    "description": "Below is a board with all 4 queens placed. Q is a queen and . is an empty cell.",
                },
            },
            "code": NQ_BOARD_FULL_CODE,
            "language": "plaintext",
        },
    ],
    "questions": [
        {
            "id": "n-queens-q1",
            "type": "single-choice",
            "baseRating": 850,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "N 皇后問題最常用哪一種演算法技巧來求解？",
                    "options": [
                        {"id": "A", "text": "貪婪法（Greedy）"},
                        {"id": "B", "text": "回溯法（Backtracking）"},
                        {"id": "C", "text": "二分搜尋"},
                        {"id": "D", "text": "分治合併排序"},
                    ],
                    "explanation": "N 皇后需要逐列嘗試放置皇后，遇到衝突就撤回上一步並嘗試其他位置，這正是回溯法（Backtracking）。",
                },
                "en": {
                    "title": "Which algorithmic technique is most commonly used to solve the N-Queens problem?",
                    "options": [
                        {"id": "A", "text": "Greedy"},
                        {"id": "B", "text": "Backtracking"},
                        {"id": "C", "text": "Binary search"},
                        {"id": "D", "text": "Divide-and-conquer merge sort"},
                    ],
                    "explanation": "N-Queens places queens row by row and, on a conflict, undoes the last placement and tries another position. That is backtracking.",
                },
            },
        },
        {
            "id": "n-queens-q2",
            "type": "true-false",
            "baseRating": 900,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "位於 (r1, c1) 與 (r2, c2) 的兩個皇后，只要 |r1 - r2| == |c1 - c2| 就會在斜線上互相攻擊。",
                    "options": [
                        {"id": "true", "text": "正確"},
                        {"id": "false", "text": "錯誤"},
                    ],
                    "explanation": "正確。兩格在同一條斜線上，代表列差與行差的絕對值相等。",
                },
                "en": {
                    "title": "Two queens at (r1, c1) and (r2, c2) attack each other diagonally whenever |r1 - r2| == |c1 - c2|.",
                    "options": [
                        {"id": "true", "text": "True"},
                        {"id": "false", "text": "False"},
                    ],
                    "explanation": "True. Two cells lie on the same diagonal exactly when the absolute row difference equals the absolute column difference.",
                },
            },
        },
        {
            "id": "n-queens-q3",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "4 × 4 棋盤的 4 皇后問題共有幾組不同的解？",
                    "options": [
                        {"id": "A", "text": "1 組"},
                        {"id": "B", "text": "2 組"},
                        {"id": "C", "text": "4 組"},
                        {"id": "D", "text": "8 組"},
                    ],
                    "explanation": "4 皇后恰好有 2 組解，彼此互為左右鏡像：[1, 3, 0, 2] 與 [2, 0, 3, 1]（陣列的第 i 項代表第 i 列皇后所在的行）。",
                },
                "en": {
                    "title": "How many distinct solutions does the 4-Queens problem on a 4 × 4 board have?",
                    "options": [
                        {"id": "A", "text": "1"},
                        {"id": "B", "text": "2"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "8"},
                    ],
                    "explanation": "4-Queens has exactly 2 solutions that mirror each other: [1, 3, 0, 2] and [2, 0, 3, 1] (item i is the column of the queen in row i).",
                },
            },
        },
        {
            "id": "n-queens-q4",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "演算法規定「每一列恰好放一個皇后」，這樣做的好處是什麼？",
                    "options": [
                        {"id": "A", "text": "讓皇后之間不可能在斜線上衝突"},
                        {"id": "B", "text": "讓時間複雜度變成 O(n)"},
                        {"id": "C", "text": "從結構上就排除了同列衝突，只需要檢查行與斜線"},
                        {"id": "D", "text": "可以不用回溯"},
                    ],
                    "explanation": "每列只放一個皇后，同列衝突根本不會發生，搜尋空間也縮小為「每一列選一個行」，只需檢查行與兩個方向的斜線。",
                },
                "en": {
                    "title": "The algorithm places exactly one queen per row. What is the benefit?",
                    "options": [
                        {"id": "A", "text": "Queens can never conflict diagonally"},
                        {"id": "B", "text": "The time complexity becomes O(n)"},
                        {"id": "C", "text": "Same-row conflicts are excluded by construction, so only columns and diagonals need checking"},
                        {"id": "D", "text": "Backtracking is no longer needed"},
                    ],
                    "explanation": "With one queen per row, same-row conflicts cannot happen and the search space shrinks to choosing a column per row, so only columns and the two diagonal directions need checking.",
                },
            },
        },
        {
            "id": "n-queens-q5",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "下列哪一組格子位於同一條「左上到右下」的斜線上（row - col 相同）？",
                    "options": [
                        {"id": "A", "text": "(0, 1) 與 (2, 3)"},
                        {"id": "B", "text": "(0, 2) 與 (1, 0)"},
                        {"id": "C", "text": "(1, 1) 與 (2, 3)"},
                        {"id": "D", "text": "(0, 3) 與 (3, 1)"},
                    ],
                    "explanation": "(0,1) 的 row - col = -1，(2,3) 的 row - col = -1，兩者相同。其他組的 row - col 分別為 (-2, 1)、(0, -1)、(-3, 2)，都不相同。",
                },
                "en": {
                    "title": "Which pair of cells lies on the same top-left to bottom-right diagonal (same row - col)?",
                    "options": [
                        {"id": "A", "text": "(0, 1) and (2, 3)"},
                        {"id": "B", "text": "(0, 2) and (1, 0)"},
                        {"id": "C", "text": "(1, 1) and (2, 3)"},
                        {"id": "D", "text": "(0, 3) and (3, 1)"},
                    ],
                    "explanation": "(0,1) has row - col = -1 and (2,3) also has -1. The other pairs give (-2, 1), (0, -1) and (-3, 2), none of which match.",
                },
            },
        },
        {
            "id": "n-queens-q6",
            "type": "true-false",
            "baseRating": 950,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "3 × 3 棋盤上無法放置 3 個互不攻擊的皇后（3 皇后無解）。",
                    "options": [
                        {"id": "true", "text": "正確"},
                        {"id": "false", "text": "錯誤"},
                    ],
                    "explanation": "正確。N 皇后在 N = 2 與 N = 3 時無解，其餘 N ≥ 4 都有解。",
                },
                "en": {
                    "title": "Three non-attacking queens cannot be placed on a 3 × 3 board (3-Queens has no solution).",
                    "options": [
                        {"id": "true", "text": "True"},
                        {"id": "false", "text": "False"},
                    ],
                    "explanation": "True. N-Queens has no solution for N = 2 and N = 3, while every N ≥ 4 has solutions.",
                },
            },
        },
        {
            "id": "n-queens-q7",
            "type": "multiple-choice",
            "baseRating": 1050,
            "correctAnswer": ["opt1", "opt2", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "兩個皇后在什麼情況下會互相攻擊？（多選）",
                    "options": [
                        {"id": "opt1", "text": "位於同一行"},
                        {"id": "opt2", "text": "位於同一條斜線"},
                        {"id": "opt3", "text": "位於同一列"},
                        {"id": "opt4", "text": "只有兩者相鄰（上下左右）時才會攻擊"},
                    ],
                    "explanation": "皇后可沿橫、直、斜線任意距離移動，因此同行（opt1）、同斜線（opt2）、同列（opt3）都會攻擊；不必相鄰（opt4 錯誤）。",
                },
                "en": {
                    "title": "Under which conditions do two queens attack each other? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "They share a column"},
                        {"id": "opt2", "text": "They share a diagonal"},
                        {"id": "opt3", "text": "They share a row"},
                        {"id": "opt4", "text": "Only when they are adjacent (up/down/left/right)"},
                    ],
                    "explanation": "A queen moves any distance along rows, columns and diagonals, so sharing a column (opt1), a diagonal (opt2) or a row (opt3) is an attack. They do not need to be adjacent (opt4 is wrong).",
                },
            },
        },
        {
            "id": "n-queens-q8",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "在 N 皇后的回溯法中，「回溯」這個動作指的是什麼？",
                    "options": [
                        {"id": "A", "text": "重新從第 0 列開始整個演算法"},
                        {"id": "B", "text": "把棋盤清空後隨機重放"},
                        {"id": "C", "text": "跳過目前這一列"},
                        {"id": "D", "text": "撤回上一列放的皇后（還原行與斜線標記），改試下一個位置"},
                    ],
                    "explanation": "當某一列所有位置都衝突時，要回到上一列，把剛放的皇后拿掉（cols、d1、d2 都要還原），再試該列的下一個位置。",
                },
                "en": {
                    "title": "In backtracking for N-Queens, what does \"backtrack\" mean?",
                    "options": [
                        {"id": "A", "text": "Restart the whole algorithm from row 0"},
                        {"id": "B", "text": "Clear the board and replace queens randomly"},
                        {"id": "C", "text": "Skip the current row"},
                        {"id": "D", "text": "Remove the queen placed in the previous row (restore the column/diagonal marks) and try its next position"},
                    ],
                    "explanation": "When every position in a row conflicts, we return to the previous row, remove the queen just placed (restoring cols, d1 and d2) and try the next position in that row.",
                },
            },
        },
        {
            "id": "n-queens-q9",
            "type": "single-choice",
            "baseRating": 1250,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "逐列放置並剪枝的 N 皇后回溯法，其最壞情況時間複雜度通常用下列何者描述？",
                    "options": [
                        {"id": "A", "text": "O(n log n)"},
                        {"id": "B", "text": "O(n²)"},
                        {"id": "C", "text": "O(n!)"},
                        {"id": "D", "text": "O(log n)"},
                    ],
                    "explanation": "第一列有 n 種選擇，第二列最多 n-1 種…，搜尋樹的規模上界約為 O(n!)。實際上剪枝會大幅降低需要探索的節點數，但最壞情況仍以 O(n!) 表示。",
                },
                "en": {
                    "title": "Which best describes the worst-case time complexity of row-by-row N-Queens backtracking with pruning?",
                    "options": [
                        {"id": "A", "text": "O(n log n)"},
                        {"id": "B", "text": "O(n²)"},
                        {"id": "C", "text": "O(n!)"},
                        {"id": "D", "text": "O(log n)"},
                    ],
                    "explanation": "The first row has n choices, the second at most n-1, and so on, so the search tree is bounded by about O(n!). Pruning cuts the explored nodes a lot in practice, but the worst case is still expressed as O(n!).",
                },
            },
        },
        {
            "id": "n-queens-q10",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "相較於先把 n 個皇后全放上棋盤再檢查是否衝突，回溯法為什麼快得多？",
                    "options": [
                        {"id": "A", "text": "一旦部分擺放已經衝突就立刻放棄，不再往更深層探索（剪枝）"},
                        {"id": "B", "text": "因為使用了遞迴"},
                        {"id": "C", "text": "因為只檢查一半的棋盤"},
                        {"id": "D", "text": "因為皇后數量變少"},
                    ],
                    "explanation": "回溯法在放下每個皇后時就檢查衝突，衝突就剪掉整個子樹，避免展開大量必然無效的完整擺法，這是它比暴力列舉快的關鍵。",
                },
                "en": {
                    "title": "Compared with placing all n queens first and then checking for conflicts, why is backtracking much faster?",
                    "options": [
                        {"id": "A", "text": "It abandons a partial placement as soon as it conflicts instead of exploring deeper (pruning)"},
                        {"id": "B", "text": "Because it uses recursion"},
                        {"id": "C", "text": "Because it only checks half of the board"},
                        {"id": "D", "text": "Because there are fewer queens"},
                    ],
                    "explanation": "Backtracking checks conflicts as each queen is placed and cuts the whole subtree on a conflict, avoiding the huge number of full placements that are doomed to fail. That is what beats brute force.",
                },
            },
        },
        {
            "id": "n-queens-q11",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在 `if solve(row + 1, n, cols, d1, d2): return True` 這段程式中，return True 的作用是什麼？",
                    "options": [
                        {"id": "A", "text": "表示目前這一列放置成功"},
                        {"id": "B", "text": "只要更深的列找到完整解，就沿著呼叫鏈一路回傳 True，不再繼續搜尋其他可能"},
                        {"id": "C", "text": "把所有解數加一"},
                        {"id": "D", "text": "還原棋盤狀態"},
                    ],
                    "explanation": "這個版本只找「第一組解」：深層遞迴找到解後回傳 True，上層收到 True 就直接 return True，因此不會執行後面的還原動作，也不再嘗試其他位置。",
                },
                "en": {
                    "title": "In `if solve(row + 1, n, cols, d1, d2): return True`, what does return True do?",
                    "options": [
                        {"id": "A", "text": "Marks the current row as placed successfully"},
                        {"id": "B", "text": "Once a complete solution is found deeper, it propagates True up the call chain and stops searching other options"},
                        {"id": "C", "text": "Increments the solution count"},
                        {"id": "D", "text": "Restores the board state"},
                    ],
                    "explanation": "This version only finds the first solution: when a deeper call finds one and returns True, the caller immediately returns True too, so the restore steps are skipped and no other positions are tried.",
                },
            },
        },
        {
            "id": "n-queens-q12",
            "type": "fill-code",
            "baseRating": 1300,
            "correctAnswer": ["n", "d2", "row + 1"],
            "code": NQ_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 solve 程式碼中 (a)(b)(c) 缺失的表達式。",
                    "options": [
                        {"id": "a", "text": ""},
                        {"id": "b", "text": ""},
                        {"id": "c", "text": ""},
                    ],
                    "explanation": "(a) 當 row 等於 n，代表 0 ~ n-1 列都已放好皇后。(b) 反斜線方向以 row + col 判斷，對應集合是 d2。(c) 放好這一列後，往下一列遞迴，傳入 row + 1。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b)(c) in the solve code.",
                    "options": [
                        {"id": "a", "text": ""},
                        {"id": "b", "text": ""},
                        {"id": "c", "text": ""},
                    ],
                    "explanation": "(a) When row equals n, rows 0 to n-1 all have queens. (b) The anti-diagonal is identified by row + col, so the set is d2. (c) After placing the current row, recurse into the next row with row + 1.",
                },
            },
        },
        {
            "id": "n-queens-q13",
            "groupId": "n-queens-group-1",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "棋盤的第 0 列、第 1 列已分別在第 1 行、第 3 行放了皇后。第 2 列有哪些位置是安全的（不會與已放的皇后衝突）？",
                    "options": [
                        {"id": "A", "text": "只有第 0 行"},
                        {"id": "B", "text": "第 0 行與第 2 行"},
                        {"id": "C", "text": "只有第 2 行"},
                        {"id": "D", "text": "四個位置都安全"},
                    ],
                    "explanation": "第 1、3 行已被佔用（同行衝突）。第 2 行雖然沒有同行衝突，但 (2,2) 的 row + col = 4，與 (1,3) 的 row + col = 4 在同一條反斜線上而衝突。第 0 行：row - col = 2、row + col = 2，與 (0,1)（-1、1）和 (1,3)（-2、4）都不相同，所以只有第 0 行安全。",
                },
                "en": {
                    "title": "Queens are already placed in row 0 at column 1 and in row 1 at column 3. Which positions in row 2 are safe (no conflict with the placed queens)?",
                    "options": [
                        {"id": "A", "text": "Only column 0"},
                        {"id": "B", "text": "Columns 0 and 2"},
                        {"id": "C", "text": "Only column 2"},
                        {"id": "D", "text": "All four positions"},
                    ],
                    "explanation": "Columns 1 and 3 are taken (column conflicts). Column 2 has no column conflict, but (2,2) has row + col = 4, the same as (1,3), so they share an anti-diagonal. Column 0 gives row - col = 2 and row + col = 2, which differ from (0,1) (-1, 1) and (1,3) (-2, 4), so only column 0 is safe.",
                },
            },
        },
        {
            "id": "n-queens-q14",
            "groupId": "n-queens-group-1",
            "type": "single-choice",
            "baseRating": 1250,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "承上題，如果在第 2 列的第 2 行放下皇后，會與哪一個皇后衝突？",
                    "options": [
                        {"id": "A", "text": "第 0 列的皇后，同一條左上到右下的斜線"},
                        {"id": "B", "text": "第 0 列的皇后，同一行"},
                        {"id": "C", "text": "第 1 列的皇后，同一條右上到左下的斜線（row + col 相同）"},
                        {"id": "D", "text": "不會衝突"},
                    ],
                    "explanation": "(2,2) 的 row + col = 4，(1,3) 的 row + col = 4，兩者位於同一條右上到左下的斜線，因此衝突。與 (0,1) 的 row - col 分別是 0 與 -1，row + col 分別是 4 與 1，沒有衝突。",
                },
                "en": {
                    "title": "Continuing from the previous question, if a queen is placed at row 2, column 2, which queen does it conflict with?",
                    "options": [
                        {"id": "A", "text": "The queen in row 0, on the same top-left to bottom-right diagonal"},
                        {"id": "B", "text": "The queen in row 0, in the same column"},
                        {"id": "C", "text": "The queen in row 1, on the same top-right to bottom-left diagonal (same row + col)"},
                        {"id": "D", "text": "No conflict"},
                    ],
                    "explanation": "(2,2) has row + col = 4 and (1,3) also has 4, so they share a top-right to bottom-left diagonal and conflict. Against (0,1), row - col is 0 vs -1 and row + col is 4 vs 1, so there is no conflict.",
                },
            },
        },
        {
            "id": "n-queens-q15",
            "groupId": "n-queens-group-2",
            "type": "true-false",
            "baseRating": 1150,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "下方棋盤是一組合法的 4 皇后解。",
                    "options": [
                        {"id": "true", "text": "正確"},
                        {"id": "false", "text": "錯誤"},
                    ],
                    "explanation": "正確。四個皇后位於 (0,1)、(1,3)、(2,0)、(3,2)：行 1、3、0、2 互不相同；row - col 為 -1、-2、2、1 互不相同；row + col 為 1、4、2、5 互不相同，因此沒有任何兩個皇后互相攻擊。",
                },
                "en": {
                    "title": "The board below is a valid 4-Queens solution.",
                    "options": [
                        {"id": "true", "text": "True"},
                        {"id": "false", "text": "False"},
                    ],
                    "explanation": "True. The queens are at (0,1), (1,3), (2,0), (3,2): columns 1, 3, 0, 2 are all different; row - col gives -1, -2, 2, 1 (all different); row + col gives 1, 4, 2, 5 (all different), so no two queens attack each other.",
                },
            },
        },
        {
            "id": "n-queens-q16",
            "groupId": "n-queens-group-2",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若用陣列 board 表示解，board[i] 代表第 i 列皇后所在的行，則下方棋盤對應的陣列為何？",
                    "options": [
                        {"id": "A", "text": "[0, 1, 2, 3]"},
                        {"id": "B", "text": "[1, 3, 0, 2]"},
                        {"id": "C", "text": "[2, 0, 3, 1]"},
                        {"id": "D", "text": "[3, 1, 2, 0]"},
                    ],
                    "explanation": "由上到下讀取每一列皇后所在的行：第 0 列在第 1 行、第 1 列在第 3 行、第 2 列在第 0 行、第 3 列在第 2 行，所以是 [1, 3, 0, 2]。",
                },
                "en": {
                    "title": "If a solution is stored in an array board where board[i] is the column of the queen in row i, which array matches the board below?",
                    "options": [
                        {"id": "A", "text": "[0, 1, 2, 3]"},
                        {"id": "B", "text": "[1, 3, 0, 2]"},
                        {"id": "C", "text": "[2, 0, 3, 1]"},
                        {"id": "D", "text": "[3, 1, 2, 0]"},
                    ],
                    "explanation": "Reading each row top to bottom: row 0 has its queen in column 1, row 1 in column 3, row 2 in column 0, and row 3 in column 2, so the array is [1, 3, 0, 2].",
                },
            },
        },
    ],
}

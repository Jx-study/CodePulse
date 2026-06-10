TRIE_GROUP_CODE = """\
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end

    def starts_with(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return True"""

TRIE_INSERT_FILL_CODE = """\
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

def insert(root, word):
    node = root
    for ch in word:
        if ch not in node.children:
            node.children[ch] = (a)
        node = (b)
    node.is_end = (c)"""

TRIE_SEARCH_PREDICT_CODE = """\
def search(root, word):                              # L1
    node = root                                      # L2
    for ch in word:                                  # L3
        if ch not in node.children:                  # L4
            return False                             # L5
        node = node.children[ch]                     # L6
    return node.is_end                               # L7"""

TRIE_DELETE_FILL_CODE = """\
def delete(root, word):
    def dfs(node, i):
        if i == len(word):
            if not node.is_end:
                return False
            node.is_end = (a)
            return len(node.children) == 0

        ch = word[i]
        child = node.children.get(ch)
        if child is None:
            return False

        should_prune = dfs(child, i + 1)
        if should_prune:
            (b)

        return len(node.children) == 0 and (c)

    dfs(root, 0)"""

TRIE_AUTOCOMPLETE_FILL_CODE = """\
def collect(node, prefix, out):
    if node.is_end:
        out.append(prefix)

    for ch in sorted(node.children.keys()):
        child = node.children[ch]
        collect(child, (a), out)

def autocomplete(root, prefix):
    node = root
    for ch in prefix:
        if ch not in node.children:
            return []
        node = node.children[ch]

    results = []
    collect(node, (b), results)
    return (c)"""


DATA = {
    "slug": "trie",
    "groups": [
        {
            "id": "trie-group-1",
            "translations": {
                "zh-TW": {
                    "title": "題組：Trie 基本操作追蹤",
                    "description": "以下是簡化版 Trie 實作。請根據 insert、search 與 starts_with 的差異回答問題。",
                },
                "en": {
                    "title": "Group: Tracing Basic Trie Operations",
                    "description": "This is a simplified Trie implementation. Use the differences between insert, search, and starts_with to answer the questions.",
                },
            },
            "code": TRIE_GROUP_CODE,
            "language": "python",
        }
    ],
    "questions": [
        # Basic: 10 questions under 1000
        # [核心概念] baseRating = 800 + 0(TF) + 50(L1 定義) + 0(直觀) = 850
        {
            "id": "trie-q1",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "Trie 會利用字串的共同前綴，讓有相同開頭的單字共用部分節點路徑。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "Trie 的核心想法是把字串拆成逐字元路徑；相同前綴自然會落在同一段祖先路徑上。",
                },
                "en": {
                    "title": "A Trie uses common string prefixes so words with the same beginning can share part of their node path.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "A Trie stores strings as character-by-character paths, so shared prefixes naturally share the same ancestor path.",
                },
            },
        },
        # [核心概念] baseRating = 800 + 50(SC) + 50(L1 定義) + 0(直觀) = 900
        {
            "id": "trie-q2",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "Trie 的根節點通常代表什麼？",
                    "options": [
                        {"id": "A", "text": "第一個插入的字元"},
                        {"id": "B", "text": "空字串"},
                        {"id": "C", "text": "最後一個插入的單字"},
                        {"id": "D", "text": "雜湊函數的輸出"},
                    ],
                    "explanation": "根節點是所有字串路徑的起點，本身對應空字串；字元由往下走的邊或映射鍵表示。",
                },
                "en": {
                    "title": "What does the root node of a Trie usually represent?",
                    "options": [
                        {"id": "A", "text": "The first inserted character"},
                        {"id": "B", "text": "The empty string"},
                        {"id": "C", "text": "The last inserted word"},
                        {"id": "D", "text": "The output of a hash function"},
                    ],
                    "explanation": "The root is the starting point for every string path and represents the empty string; characters are represented by edges or map keys below it.",
                },
            },
        },
        # [節點結構設計] baseRating = 800 + 50(SC) + 50(L1 定義) + 50(相似干擾) = 950
        {
            "id": "trie-q3",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "Trie 節點中的 `is_end` 最主要用途是什麼？",
                    "options": [
                        {"id": "A", "text": "記錄目前節點的父節點"},
                        {"id": "B", "text": "記錄這個節點代表的字元編碼"},
                        {"id": "C", "text": "標記從根到此節點是否形成完整單字"},
                        {"id": "D", "text": "計算目前 Trie 的節點總數"},
                    ],
                    "explanation": "`is_end` 標記單字邊界。沒有它時，路徑存在只能代表前綴存在，不能保證完整單字存在。",
                },
                "en": {
                    "title": "What is the main purpose of `is_end` in a Trie node?",
                    "options": [
                        {"id": "A", "text": "Store the current node's parent"},
                        {"id": "B", "text": "Store the character code represented by this node"},
                        {"id": "C", "text": "Mark whether the path from root to this node forms a complete word"},
                        {"id": "D", "text": "Count the total number of nodes in the Trie"},
                    ],
                    "explanation": "`is_end` marks word boundaries. Without it, an existing path only proves a prefix exists, not a complete word.",
                },
            },
        },
        # [操作複雜度] baseRating = 800 + 50(SC) + 50(L1 定義) + 0(直觀) = 900
        {
            "id": "trie-q4",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "若目標字串長度為 m，Trie 的插入與精確搜尋時間主要取決於什麼？",
                    "options": [
                        {"id": "A", "text": "目標字串長度 m"},
                        {"id": "B", "text": "已儲存單字的總數量"},
                        {"id": "C", "text": "根節點是否有父節點"},
                        {"id": "D", "text": "雜湊表是否發生碰撞"},
                    ],
                    "explanation": "Trie 操作沿著目標字串逐字元前進，因此主要成本與字串長度成正比。",
                },
                "en": {
                    "title": "If the target string length is m, what mainly determines Trie insertion and exact-search time?",
                    "options": [
                        {"id": "A", "text": "The target string length m"},
                        {"id": "B", "text": "The total number of stored words"},
                        {"id": "C", "text": "Whether the root has a parent"},
                        {"id": "D", "text": "Whether a hash table collision occurs"},
                    ],
                    "explanation": "Trie operations advance one character at a time along the target string, so the main cost is proportional to string length.",
                },
            },
        },
        # [與雜湊表比較] baseRating = 800 + 50(SC) + 100(L2 比較) + 0(直觀) = 950
        {
            "id": "trie-q5",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "若需求是「輸入前綴 ca，列出所有 ca 開頭的單字」，哪個結構通常更直接？",
                    "options": [
                        {"id": "A", "text": "只存完整字串的雜湊表"},
                        {"id": "B", "text": "只支援尾端操作的 Stack"},
                        {"id": "C", "text": "普通整數陣列"},
                        {"id": "D", "text": "Trie"},
                    ],
                    "explanation": "Trie 能先走到前綴節點，再從該節點收集所有後續分支；雜湊表較擅長完整鍵查找。",
                },
                "en": {
                    "title": "If the task is \"enter prefix ca and list every word starting with ca,\" which structure is usually more direct?",
                    "options": [
                        {"id": "A", "text": "A hash table storing only full strings"},
                        {"id": "B", "text": "A Stack that only supports end operations"},
                        {"id": "C", "text": "A plain integer array"},
                        {"id": "D", "text": "Trie"},
                    ],
                    "explanation": "A Trie can walk to the prefix node, then collect all branches below it. Hash tables are better at exact full-key lookup.",
                },
            },
        },
        # [節點結構設計] baseRating = 800 + 0(TF) + 50(L1 定義) + 100(新手誤區) = 950
        {
            "id": "trie-q6",
            "type": "true-false",
            "baseRating": 950,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "若 Trie 中只有插入 `apple`，那麼只要 `app` 這條路徑存在，`search(\"app\")` 就一定應回傳 true。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "`app` 是 `apple` 的前綴，但不一定是已插入的完整單字；精確搜尋還需要檢查最後節點的 `is_end`。",
                },
                "en": {
                    "title": "If a Trie only contains `apple`, then because the path `app` exists, `search(\"app\")` must return true.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "`app` is a prefix of `apple`, but not necessarily an inserted complete word; exact search must also check `is_end` on the final node.",
                },
            },
        },
        # [節點結構設計] baseRating = 800 + 50(SC) + 50(L1 定義) + 0(直觀) = 900
        {
            "id": "trie-q7",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "常見 Trie 節點的 `children` 欄位通常扮演什麼角色？",
                    "options": [
                        {"id": "A", "text": "由下一個字元映射到下一個節點"},
                        {"id": "B", "text": "儲存整個單字清單的排序結果"},
                        {"id": "C", "text": "記錄每個單字的雜湊值"},
                        {"id": "D", "text": "只記錄目前節點的深度"},
                    ],
                    "explanation": "`children` 常用 dict 或 map 表示，鍵是下一個字元，值是對應的子節點。",
                },
                "en": {
                    "title": "What role does the `children` field of a common Trie node usually play?",
                    "options": [
                        {"id": "A", "text": "Maps the next character to the next node"},
                        {"id": "B", "text": "Stores the sorted result of the entire word list"},
                        {"id": "C", "text": "Stores each word's hash value"},
                        {"id": "D", "text": "Only records the current node depth"},
                    ],
                    "explanation": "`children` is commonly a dict or map where each key is the next character and each value is the corresponding child node.",
                },
            },
        },
        # [適合處理的問題] baseRating = 800 + 50(SC) + 50(L1 定義) + 0(直觀) = 900
        {
            "id": "trie-q8",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "以下哪個場景最典型地會讓你想到 Trie？",
                    "options": [
                        {"id": "A", "text": "只需要反轉一串數字"},
                        {"id": "B", "text": "搜尋框輸入前幾個字母後顯示自動補全建議"},
                        {"id": "C", "text": "固定大小陣列做索引讀取"},
                        {"id": "D", "text": "用 Queue 做 BFS"},
                    ],
                    "explanation": "自動補全的核心是前綴查詢，正好符合 Trie 擅長利用共同字首縮小搜尋範圍的特性。",
                },
                "en": {
                    "title": "Which scenario most typically suggests using a Trie?",
                    "options": [
                        {"id": "A", "text": "Only reversing a sequence of numbers"},
                        {"id": "B", "text": "Showing autocomplete suggestions after typing the first few letters in a search box"},
                        {"id": "C", "text": "Index lookup in a fixed-size array"},
                        {"id": "D", "text": "Using a Queue for BFS"},
                    ],
                    "explanation": "Autocomplete is fundamentally prefix lookup, which matches a Trie's ability to narrow search using shared prefixes.",
                },
            },
        },
        # [與雜湊表比較] baseRating = 800 + 50(SC) + 50(L1 定義) + 50(相似干擾) = 950
        {
            "id": "trie-q9",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "若 Trie 的每層子節點依字母順序走訪，輸出的單字會呈現什麼特性？",
                    "options": [
                        {"id": "A", "text": "按字母排序"},
                        {"id": "B", "text": "按插入時間反序"},
                        {"id": "C", "text": "按雜湊值排序"},
                        {"id": "D", "text": "完全隨機"},
                    ],
                    "explanation": "Trie 的路徑本身由字元組成；若每層都按字母順序展開，收集到的完整單字也會是字典序。",
                },
                "en": {
                    "title": "If each level of a Trie is traversed in alphabetical child order, what property will the output words have?",
                    "options": [
                        {"id": "A", "text": "Alphabetical order"},
                        {"id": "B", "text": "Reverse insertion order"},
                        {"id": "C", "text": "Hash-value order"},
                        {"id": "D", "text": "Completely random order"},
                    ],
                    "explanation": "Trie paths are made of characters; if children are expanded alphabetically at each level, completed words are collected in lexicographic order.",
                },
            },
        },
        # [操作複雜度] baseRating = 800 + 50(SC) + 50(L1 定義) + 50(相似干擾) = 950
        {
            "id": "trie-q10",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "Trie 刪除單字時，第一個必要動作通常是什麼？",
                    "options": [
                        {"id": "A", "text": "直接清空整棵樹"},
                        {"id": "B", "text": "重新計算所有單字的雜湊值"},
                        {"id": "C", "text": "沿著字元路徑找到該單字的結尾節點"},
                        {"id": "D", "text": "把根節點設成 `is_end = True`"},
                    ],
                    "explanation": "刪除前必須先確認目標單字路徑與結尾標記存在，接著才能取消標記並考慮修剪無用分支。",
                },
                "en": {
                    "title": "When deleting a word from a Trie, what is usually the first necessary action?",
                    "options": [
                        {"id": "A", "text": "Clear the whole tree immediately"},
                        {"id": "B", "text": "Recompute every word's hash value"},
                        {"id": "C", "text": "Follow the character path to the word's ending node"},
                        {"id": "D", "text": "Set the root node to `is_end = True`"},
                    ],
                    "explanation": "Before deletion, we must confirm that the target path and end marker exist; then we can unmark it and consider pruning unused branches.",
                },
            },
        },
        # Application: 10 questions from 1000 to 1399
        # [核心概念] baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(新手誤區) = 1200
        {
            "id": "trie-q11",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "依序插入 `car`、`cart`、`cat` 後，以下哪個敘述正確？",
                    "options": [
                        {"id": "A", "text": "三個單字只共用 `c` 節點"},
                        {"id": "B", "text": "三個單字共用 `c -> a`，而 `car` 的結尾標記不能因插入 `cart` 被取消"},
                        {"id": "C", "text": "`car` 與 `cart` 必須各自建立完全獨立的 `c -> a -> r` 路徑"},
                        {"id": "D", "text": "`cat` 會讓 `car` 的 `r` 節點改成 `t` 節點"},
                    ],
                    "explanation": "Trie 共享共同前綴，但完整單字邊界仍由各自節點的結尾標記維護；一個單字是另一個單字前綴時尤其要保留這個標記。",
                },
                "en": {
                    "title": "After inserting `car`, `cart`, and `cat` in order, which statement is correct?",
                    "options": [
                        {"id": "A", "text": "The three words share only the `c` node"},
                        {"id": "B", "text": "The three words share `c -> a`, and `car`'s end marker must not be cleared when `cart` is inserted"},
                        {"id": "C", "text": "`car` and `cart` must each create a completely separate `c -> a -> r` path"},
                        {"id": "D", "text": "`cat` changes the `r` node of `car` into a `t` node"},
                    ],
                    "explanation": "A Trie shares common prefixes, but complete-word boundaries are still maintained by end markers on their own nodes. This matters especially when one word is a prefix of another.",
                },
            },
        },
        # [節點結構設計] baseRating = 800 + 50(SC) + 150(L2 單步追蹤) + 150(邊界) = 1150
        {
            "id": "trie-q12",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "Trie 已先插入 `apple`，接著再插入 `app`。第二次插入最關鍵的效果是什麼？",
                    "options": [
                        {"id": "A", "text": "沿用既有 `a -> p -> p` 路徑，並把 `app` 節點標記為單字結尾"},
                        {"id": "B", "text": "因為 `app` 的路徑已存在，所以不需要改任何結尾標記"},
                        {"id": "C", "text": "重新建立另一條獨立的 `a -> p -> p` 路徑，避免和 `apple` 共用"},
                        {"id": "D", "text": "刪除 `apple` 的 `l -> e` 分支，讓 Trie 只保留較短單字"},
                    ],
                    "explanation": "插入較短但已存在的前綴時，路徑可以重用；需要新增的是完整單字邊界，而不是複製或破壞既有分支。",
                },
                "en": {
                    "title": "A Trie first contains `apple`, then `app` is inserted. What is the key effect of the second insertion?",
                    "options": [
                        {"id": "A", "text": "Reuse the existing `a -> p -> p` path and mark the `app` node as a word ending"},
                        {"id": "B", "text": "Because the `app` path already exists, no end marker needs to change"},
                        {"id": "C", "text": "Create a separate `a -> p -> p` path to avoid sharing with `apple`"},
                        {"id": "D", "text": "Delete the `l -> e` branch from `apple` so only the shorter word remains"},
                    ],
                    "explanation": "When inserting a shorter word whose prefix path already exists, the path can be reused. What changes is the complete-word boundary, not a copy or destruction of existing branches.",
                },
            },
        },
        # [節點結構設計] baseRating = 800 + 50(SC) + 150(L2 單步追蹤) + 150(邊界) = 1150
        {
            "id": "trie-q13",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "Trie 只插入 `apple`。若走完 `app` 路徑後該節點的 `is_end` 是 false，`search(\"app\")` 應回傳什麼？",
                    "options": [
                        {"id": "A", "text": "true，因為路徑存在"},
                        {"id": "B", "text": "true，因為 `apple` 比 `app` 長"},
                        {"id": "C", "text": "false，因為 `app` 不是完整單字結尾"},
                        {"id": "D", "text": "拋出錯誤，因為前綴不能搜尋"},
                    ],
                    "explanation": "精確搜尋必須同時滿足路徑存在與結尾標記為真；只存在前綴不足以代表完整單字。",
                },
                "en": {
                    "title": "A Trie only contains `apple`. After walking the `app` path, that node has `is_end = False`. What should `search(\"app\")` return?",
                    "options": [
                        {"id": "A", "text": "true, because the path exists"},
                        {"id": "B", "text": "true, because `apple` is longer than `app`"},
                        {"id": "C", "text": "false, because `app` is not marked as a complete word ending"},
                        {"id": "D", "text": "Raise an error, because prefixes cannot be searched"},
                    ],
                    "explanation": "Exact search requires both an existing path and a true end marker; a prefix path alone does not represent a complete word.",
                },
            },
        },
        # [適合處理的問題] baseRating = 800 + 100(MC) + 100(L2 多重比較) + 100(新手誤區) = 1100
        {
            "id": "trie-q14",
            "type": "multiple-choice",
            "baseRating": 1100,
            "correctAnswer": ["opt1", "opt3"],
            "translations": {
                "zh-TW": {
                    "title": "以下哪些場景適合優先考慮 Trie？（多選）",
                    "options": [
                        {"id": "opt1", "text": "搜尋框自動補全"},
                        {"id": "opt2", "text": "只需判斷某個使用者 ID 是否完整存在"},
                        {"id": "opt3", "text": "IP 路由的最長前綴匹配"},
                        {"id": "opt4", "text": "依單字長度排序一批字串"},
                    ],
                    "explanation": "Trie 的優勢在前綴相關任務，例如自動補全與最長前綴匹配；單純完整鍵存在性通常用雜湊表更直接。",
                },
                "en": {
                    "title": "Which scenarios are good reasons to consider a Trie first? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "Search-box autocomplete"},
                        {"id": "opt2", "text": "Only checking whether a full user ID exists"},
                        {"id": "opt3", "text": "Longest-prefix matching in IP routing"},
                        {"id": "opt4", "text": "Sorting a batch of strings by word length"},
                    ],
                    "explanation": "Trie strengths are prefix-related tasks such as autocomplete and longest-prefix matching. Pure exact-key existence is usually more direct with a hash table.",
                },
            },
        },
        # [題組/節點結構設計] baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(新手誤區) = 1200
        {
            "id": "trie-q15",
            "groupId": "trie-group-1",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "根據上方程式碼，若只執行 `insert(\"apple\")`，接著 `search(\"app\")` 與 `starts_with(\"app\")` 分別會回傳什麼？",
                    "options": [
                        {"id": "A", "text": "`search` true，`starts_with` true"},
                        {"id": "B", "text": "`search` true，`starts_with` false"},
                        {"id": "C", "text": "`search` false，`starts_with` false"},
                        {"id": "D", "text": "`search` false，`starts_with` true"},
                    ],
                    "explanation": "`search` 與 `starts_with` 的差異在於是否要求完整單字邊界；作答時要對照兩個函式最後檢查的條件。",
                },
                "en": {
                    "title": "Based on the code above, if only `insert(\"apple\")` is executed, what do `search(\"app\")` and `starts_with(\"app\")` return?",
                    "options": [
                        {"id": "A", "text": "`search` true, `starts_with` true"},
                        {"id": "B", "text": "`search` true, `starts_with` false"},
                        {"id": "C", "text": "`search` false, `starts_with` false"},
                        {"id": "D", "text": "`search` false, `starts_with` true"},
                    ],
                    "explanation": "The difference between `search` and `starts_with` is whether a complete-word boundary is required. Compare the final condition each function checks.",
                },
            },
        },
        # [題組/操作複雜度] baseRating = 800 + 50(SC) + 250(L3 多步狀態) + 100(新手誤區) = 1200
        {
            "id": "trie-q16",
            "groupId": "trie-group-1",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若 Trie 已有 `app` 與 `apple`，刪除 `app` 時最重要的是避免什麼？",
                    "options": [
                        {"id": "A", "text": "避免把 `app` 的 `is_end` 設為 false"},
                        {"id": "B", "text": "避免刪掉 `apple` 還需要共用的後續路徑"},
                        {"id": "C", "text": "避免新增額外的根節點"},
                        {"id": "D", "text": "避免重新計算雜湊碰撞"},
                    ],
                    "explanation": "刪除有包含關係的單字時，通常先取消目標結尾標記；只有不再被其他單字共用的分支才可修剪。",
                },
                "en": {
                    "title": "If a Trie contains `app` and `apple`, what is the most important thing to avoid when deleting `app`?",
                    "options": [
                        {"id": "A", "text": "Avoid setting `app`'s `is_end` to false"},
                        {"id": "B", "text": "Avoid deleting the remaining path that `apple` still needs"},
                        {"id": "C", "text": "Avoid creating an extra root node"},
                        {"id": "D", "text": "Avoid recomputing hash collisions"},
                    ],
                    "explanation": "When deleting overlapping words, usually unmark the target ending first; only branches no longer shared by any word may be pruned.",
                },
            },
        },
        # [可以優化什麼] baseRating = 800 + 50(SC) + 100(L2 比較) + 150(邊界) = 1100
        {
            "id": "trie-q17",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "哪種資料集最可能讓一般 Trie 產生較高記憶體耗損？",
                    "options": [
                        {"id": "A", "text": "大量長字串，且前幾個字元幾乎都不同"},
                        {"id": "B", "text": "大量長度相近、只差最後一個字元的字串"},
                        {"id": "C", "text": "大量都以 `pre` 開頭，但後面分支很多的單字"},
                        {"id": "D", "text": "少量很短、彼此不同開頭的字串"},
                    ],
                    "explanation": "Trie 靠共享前綴節省路徑；若字串幾乎不共享前綴，就會建立許多分散節點與指標。",
                },
                "en": {
                    "title": "Which dataset is most likely to cause high memory overhead in a normal Trie?",
                    "options": [
                        {"id": "A", "text": "Many long strings whose first few characters are almost all different"},
                        {"id": "B", "text": "Many similar-length strings that differ only in the last character"},
                        {"id": "C", "text": "Many words all starting with `pre`, but branching heavily afterward"},
                        {"id": "D", "text": "A small number of very short strings with different first letters"},
                    ],
                    "explanation": "A Trie saves paths by sharing prefixes. If strings barely share prefixes, it creates many scattered nodes and pointers.",
                },
            },
        },
        # [適合處理的問題] baseRating = 800 + 50(SC) + 150(L2 單步追蹤) + 150(邊界) = 1150
        {
            "id": "trie-q18",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "IP 路由的最長前綴匹配中，若已匹配到多個候選前綴，應選哪一個？",
                    "options": [
                        {"id": "A", "text": "第一個插入的前綴"},
                        {"id": "B", "text": "最短的相符前綴"},
                        {"id": "C", "text": "最長的相符前綴"},
                        {"id": "D", "text": "雜湊值最大的前綴"},
                    ],
                    "explanation": "最長前綴匹配的重點是越具體的路由規則優先；Trie 可以沿路記錄最後一次命中的有效前綴。",
                },
                "en": {
                    "title": "In longest-prefix matching for IP routing, if several candidate prefixes match, which one should be chosen?",
                    "options": [
                        {"id": "A", "text": "The first inserted prefix"},
                        {"id": "B", "text": "The shortest matching prefix"},
                        {"id": "C", "text": "The longest matching prefix"},
                        {"id": "D", "text": "The prefix with the largest hash value"},
                    ],
                    "explanation": "Longest-prefix matching prioritizes the most specific routing rule. A Trie can record the latest valid prefix encountered along the path.",
                },
            },
        },
        # [節點結構設計] baseRating = 800 + 150(FC) + 250(L3 多步狀態) + 100(新手誤區) = 1300
        {
            "id": "trie-q19",
            "type": "fill-code",
            "baseRating": 1300,
            "correctAnswer": ["TrieNode()", "node.children[ch]", "True"],
            "code": TRIE_INSERT_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入 (a)(b)(c)，完成 Trie 的 insert 邏輯。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "缺少路徑時建立新節點，接著把目前節點移到對應子節點；走完整個單字後才標記結尾。",
                },
                "en": {
                    "title": "Fill in (a)(b)(c) to complete Trie insertion.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "Create a new node when the path is missing, move to the corresponding child, and mark the ending only after the full word is consumed.",
                },
            },
        },
        # [節點結構設計] baseRating = 800 + 150(PL) + 250(L3 多步狀態) + 150(邊界) = 1350
        {
            "id": "trie-q20",
            "type": "predict-line",
            "baseRating": 1350,
            "correctAnswer": "1 2 3 4 6 3 4 6 3 4 6 3 7",
            "code": TRIE_SEARCH_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "已知 Trie 中只插入 `apple`。呼叫 `search(root, \"app\")` 時，請依序填寫經過的行號（以空格分隔）。",
                    "options": [],
                    "explanation": "這段 `search` 只有在缺少下一個字元時才提前失敗；若迴圈正常結束，結果取決於函式最後回傳的條件。",
                },
                "en": {
                    "title": "A Trie contains only `apple`. When calling `search(root, \"app\")`, write the executed line numbers in order (space-separated).",
                    "options": [],
                    "explanation": "This `search` only fails early when the next character is missing. If the loop finishes normally, the result depends on the final return condition.",
                },
            },
        },
        # Complexity: 10 questions at 1400+
        # [操作複雜度] baseRating = 800 + 50(SC) + 400(L4 邊界分析) + 150(邊界) = 1400
        {
            "id": "trie-q21",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "Trie 中已有 `tea`、`ted`、`team`。刪除 `team` 後，哪些節點或標記必須保留？",
                    "options": [
                        {"id": "A", "text": "整條 `t -> e -> a -> m` 都必須保留"},
                        {"id": "B", "text": "`tea` 的結尾標記與 `ted` 的分支必須保留，只能移除不再共用的 `m` 分支"},
                        {"id": "C", "text": "刪除 `team` 時也必須刪除 `tea`"},
                        {"id": "D", "text": "只要取消根節點標記即可"},
                    ],
                    "explanation": "`team` 與 `tea` 共用到 `a` 節點，且 `tea` 是完整單字；刪除時只能清掉不再被其他單字需要的尾端分支。",
                },
                "en": {
                    "title": "A Trie contains `tea`, `ted`, and `team`. After deleting `team`, which nodes or markers must remain?",
                    "options": [
                        {"id": "A", "text": "The whole `t -> e -> a -> m` path must remain"},
                        {"id": "B", "text": "The end marker for `tea` and the branch for `ted` must remain; only the unshared `m` branch can be removed"},
                        {"id": "C", "text": "Deleting `team` must also delete `tea`"},
                        {"id": "D", "text": "Only the root marker needs to be cleared"},
                    ],
                    "explanation": "`team` shares the path up to `a` with `tea`, and `tea` is a complete word. Deletion may only remove tail branches no other word needs.",
                },
            },
        },
        # [核心概念] baseRating = 800 + 50(SC) + 400(L4 邊界分析) + 150(邊界) = 1400
        {
            "id": "trie-q22",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "從空 Trie 依序插入 `app`、`apple`、`apt`。若根節點也算一個節點，總共會有幾個節點？",
                    "options": [
                        {"id": "A", "text": "5"},
                        {"id": "B", "text": "6"},
                        {"id": "C", "text": "7"},
                        {"id": "D", "text": "8"},
                    ],
                    "explanation": "計算節點數時，先找出三個單字共用到哪個前綴，再只把每個分支新增加且不重複的節點納入。",
                },
                "en": {
                    "title": "Starting from an empty Trie, insert `app`, `apple`, and `apt`. Counting the root as a node, what is the total number of nodes?",
                    "options": [
                        {"id": "A", "text": "5"},
                        {"id": "B", "text": "6"},
                        {"id": "C", "text": "7"},
                        {"id": "D", "text": "8"},
                    ],
                    "explanation": "To count nodes, first identify the prefix shared by the three words, then add only the new, non-duplicate nodes contributed by each branch.",
                },
            },
        },
        # [與雜湊表比較] baseRating = 800 + 100(MC) + 400(L4 分析) + 100(新手誤區) = 1400
        {
            "id": "trie-q23",
            "type": "multiple-choice",
            "baseRating": 1400,
            "correctAnswer": ["opt1", "opt3", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "關於 Trie 與雜湊表的比較，哪些敘述正確？（多選）",
                    "options": [
                        {"id": "opt1", "text": "Trie 可直接支援前綴搜尋"},
                        {"id": "opt2", "text": "雜湊表天然能按字母順序輸出所有鍵"},
                        {"id": "opt3", "text": "Trie 不需要計算雜湊函數，也不會有雜湊碰撞"},
                        {"id": "opt4", "text": "若只做完整字串存在性查詢，雜湊表通常更省事"},
                    ],
                    "explanation": "Trie 的優勢是前綴與有序走訪；雜湊表擅長完整鍵查找，但通常不提供天然字典序輸出。",
                },
                "en": {
                    "title": "Which statements comparing Tries and hash tables are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "A Trie directly supports prefix search"},
                        {"id": "opt2", "text": "A hash table naturally outputs all keys in alphabetical order"},
                        {"id": "opt3", "text": "A Trie does not compute hash functions and has no hash collisions"},
                        {"id": "opt4", "text": "If you only need full-string existence checks, a hash table is usually simpler"},
                    ],
                    "explanation": "Trie strengths are prefixes and ordered traversal. Hash tables excel at full-key lookup, but usually do not provide natural lexicographic output.",
                },
            },
        },
        # [操作複雜度] baseRating = 800 + 150(FC) + 400(L4 邊界分析) + 150(邊界) = 1500
        {
            "id": "trie-q24",
            "type": "fill-code",
            "baseRating": 1500,
            "correctAnswer": ["False", "del node.children[ch]", "not node.is_end"],
            "code": TRIE_DELETE_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入 (a)(b)(c)，完成刪除時「取消結尾標記並向上修剪無用分支」的邏輯。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "找到完整單字後先取消結尾標記；遞迴回來時只刪除已無用途的 child，且目前節點不是其他單字結尾時才允許繼續向上修剪。",
                },
                "en": {
                    "title": "Fill in (a)(b)(c) to complete deletion logic that unmarks the word ending and prunes unused branches upward.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "After finding the complete word, unmark its ending. On the recursive return, delete only unused children and continue pruning upward only when the current node is not another word ending.",
                },
            },
        },
        # [節點結構設計] baseRating = 800 + 150(PL) + 400(L4 控制流) + 50(相似干擾) = 1400
        {
            "id": "trie-q25",
            "type": "predict-line",
            "baseRating": 1400,
            "correctAnswer": "1 2 3 4 6 3 4 6 3 4 5",
            "code": TRIE_SEARCH_PREDICT_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "已知 Trie 中插入 `app` 與 `apple`。呼叫 `search(root, \"apex\")` 時，請依序填寫經過的行號（以空格分隔）。",
                    "options": [],
                    "explanation": "這題考查 `search` 的提前失敗條件：只要下一個字元不存在，就會在迴圈中回傳，而不會等到最後一行。",
                },
                "en": {
                    "title": "A Trie contains `app` and `apple`. When calling `search(root, \"apex\")`, write the executed line numbers in order (space-separated).",
                    "options": [],
                    "explanation": "This question checks the early-failure condition in `search`: once the next character is missing, the loop returns immediately instead of reaching the final line.",
                },
            },
        },
        # [適合處理的問題] baseRating = 800 + 50(SC) + 400(L4 系統比較) + 250(複合陷阱) = 1500
        {
            "id": "trie-q26",
            "type": "single-choice",
            "baseRating": 1500,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "為什麼 AC 自動機會以 Trie 作為基礎結構之一？",
                    "options": [
                        {"id": "A", "text": "Trie 先把多個模式字串組成共享前綴的樹，再加入失配連結加速比對"},
                        {"id": "B", "text": "Trie 能把所有字串轉成固定長度整數"},
                        {"id": "C", "text": "Trie 會自動保證所有查詢都是 O(1)"},
                        {"id": "D", "text": "Trie 本身就是一種排序演算法"},
                    ],
                    "explanation": "多模式比對需要同時管理許多模式字串的共同前綴；AC 自動機在 Trie 結構上加入失配轉移來避免從頭重比。",
                },
                "en": {
                    "title": "Why does the Aho-Corasick automaton use a Trie as one of its base structures?",
                    "options": [
                        {"id": "A", "text": "A Trie first organizes multiple pattern strings into a shared-prefix tree, then failure links are added to speed matching"},
                        {"id": "B", "text": "A Trie converts every string into a fixed-length integer"},
                        {"id": "C", "text": "A Trie automatically guarantees every query is O(1)"},
                        {"id": "D", "text": "A Trie is itself a sorting algorithm"},
                    ],
                    "explanation": "Multi-pattern matching needs to manage shared prefixes across many patterns. Aho-Corasick adds failure transitions on top of a Trie to avoid restarting matches from scratch.",
                },
            },
        },
        # [可以優化什麼] baseRating = 800 + 50(SC) + 400(L4 系統分析) + 250(複合陷阱) = 1500
        {
            "id": "trie-q27",
            "type": "single-choice",
            "baseRating": 1500,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "你要支援「完整字串查詢、前綴列舉、依字母排序輸出」三種功能。哪個選擇最合理？",
                    "options": [
                        {"id": "A", "text": "只用 Stack"},
                        {"id": "B", "text": "只用 Queue"},
                        {"id": "C", "text": "只用未排序陣列並每次線性掃描"},
                        {"id": "D", "text": "使用 Trie，並按排序後的 children 走訪"},
                    ],
                    "explanation": "Trie 同時能走完整字串路徑、定位前綴子樹，並透過有序走訪產生字典序結果，較貼合三個需求。",
                },
                "en": {
                    "title": "You need full-string lookup, prefix enumeration, and alphabetical output. Which choice is most reasonable?",
                    "options": [
                        {"id": "A", "text": "Only use a Stack"},
                        {"id": "B", "text": "Only use a Queue"},
                        {"id": "C", "text": "Only use an unsorted array and scan linearly every time"},
                        {"id": "D", "text": "Use a Trie and traverse sorted children"},
                    ],
                    "explanation": "A Trie can follow full-string paths, locate prefix subtrees, and produce lexicographic results through ordered traversal, matching all three needs.",
                },
            },
        },
        # [與雜湊表比較] baseRating = 800 + 50(SC) + 400(L4 控制流) + 150(邊界) = 1400
        {
            "id": "trie-q28",
            "groupId": "trie-group-1",
            "type": "single-choice",
            "baseRating": 1400,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "若 Trie 中有 `car`、`cat`、`dog`，要列出 `ca` 前綴下的單字，正確策略是哪一個？",
                    "options": [
                        {"id": "A", "text": "從根節點收集所有單字，不需要先走 `ca`"},
                        {"id": "B", "text": "只檢查 `ca` 節點的 `is_end` 即可"},
                        {"id": "C", "text": "先走到 `ca` 對應節點，再 DFS 收集其子樹中的完整單字"},
                        {"id": "D", "text": "重新插入 `ca`，再刪除 `dog`"},
                    ],
                    "explanation": "前綴列舉通常分兩步：先定位前綴終點，再從該節點往下收集所有 `is_end` 為真的路徑。",
                },
                "en": {
                    "title": "If a Trie contains `car`, `cat`, and `dog`, what is the correct strategy to list words under prefix `ca`?",
                    "options": [
                        {"id": "A", "text": "Collect all words from the root without walking `ca` first"},
                        {"id": "B", "text": "Only check the `is_end` value of the `ca` node"},
                        {"id": "C", "text": "Walk to the node for `ca`, then DFS its subtree to collect complete words"},
                        {"id": "D", "text": "Reinsert `ca`, then delete `dog`"},
                    ],
                    "explanation": "Prefix enumeration usually has two steps: locate the prefix endpoint, then collect every path below it whose `is_end` is true.",
                },
            },
        },
        # [適合處理的問題] baseRating = 800 + 150(FC) + 400(L4 控制流) + 250(複合陷阱) = 1600
        {
            "id": "trie-q29",
            "type": "fill-code",
            "baseRating": 1600,
            "correctAnswer": ["prefix + ch", "prefix", "results"],
            "code": TRIE_AUTOCOMPLETE_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填入 (a)(b)(c)，完成以 Trie 做自動補全並按字母順序輸出的邏輯。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "收集子樹時要把目前前綴接上下一個字元；定位到查詢前綴後，從該前綴開始收集並回傳結果列表。",
                },
                "en": {
                    "title": "Fill in (a)(b)(c) to complete Trie autocomplete with alphabetical output.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}, {"id": "c", "text": ""}],
                    "explanation": "When collecting a subtree, append the next character to the current prefix. After locating the queried prefix, collect from that prefix and return the result list.",
                },
            },
        },
        # [節點結構設計] baseRating = 800 + 50(SC) + 400(L4 系統分析) + 250(複合陷阱) = 1500
        {
            "id": "trie-q30",
            "type": "single-choice",
            "baseRating": 1500,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "若一般 Trie 因節點太多造成空間壓力，且很多節點只有單一子節點，最直接的優化方向是什麼？",
                    "options": [
                        {"id": "A", "text": "把所有 `is_end` 都刪掉"},
                        {"id": "B", "text": "壓縮單一路徑，改用基數樹等壓縮 Trie 變體"},
                        {"id": "C", "text": "把根節點複製成每個單字一份"},
                        {"id": "D", "text": "將每次搜尋改成完整掃描所有節點"},
                    ],
                    "explanation": "當許多路徑沒有分岔時，可以把連續單一路徑壓成一段字串標籤，減少節點與指標數量。",
                },
                "en": {
                    "title": "If a normal Trie has space pressure from too many nodes, and many nodes have only one child, what is the most direct optimization?",
                    "options": [
                        {"id": "A", "text": "Remove every `is_end` marker"},
                        {"id": "B", "text": "Compress single-child paths using a compressed Trie variant such as a radix tree"},
                        {"id": "C", "text": "Copy the root node once for every word"},
                        {"id": "D", "text": "Change every search into a full scan of all nodes"},
                    ],
                    "explanation": "When many paths do not branch, consecutive single-child paths can be compressed into string labels, reducing nodes and pointers.",
                },
            },
        },
    ],
}

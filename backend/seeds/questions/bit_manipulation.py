BIT_OPS_CODE = """a = 44          # 0b101100
b = 27          # 0b011011
c = a & b
d = a ^ b
e = a & -a"""

COUNT_BITS_FILL_CODE = """def count_bits(n):
    count = 0
    while n:
        n = (a)
        count += 1
    return count


def is_power_of_two(n):
    return n > 0 and (b)"""

SUBSETS_FILL_CODE = """def subsets(arr):
    n = len(arr)
    result = []
    for mask in range((a)):
        subset = []
        for j in range(n):
            if (b):
                subset.append(arr[j])
        result.append(subset)
    return result"""

CLASSIFY_CODE = """def classify(n):                 # L1
    if n & (n - 1) == 0:         # L2
        return "power"           # L3
    count = 0                    # L4
    while n:                     # L5
        n &= n - 1               # L6
        count += 1               # L7
    if count % 2 == 1:           # L8
        return "odd bits"        # L9
    return "even bits"           # L10"""

DATA = {
    "slug": "bit-manipulation",
    "groups": [
        {
            "id": "bit-manipulation-group-1",
            "translations": {
                "zh-TW": {
                    "title": "題組：位元運算結果追蹤",
                    "description": "下方程式碼對 a = 44 與 b = 27 做了幾種位元運算，註解是它們的二進位表示。請根據程式碼回答下列問題。",
                },
                "en": {
                    "title": "Group: Tracing Bitwise Results",
                    "description": "The code below applies several bitwise operations to a = 44 and b = 27; the comments show their binary forms. Answer the following questions based on the code.",
                },
            },
            "code": BIT_OPS_CODE,
            "language": "python",
        }
    ],
    "questions": [
        {
            "id": "bit-manipulation-q1",
            "type": "true-false",
            "baseRating": 850,
            "correctAnswer": "true",
            "translations": {
                "zh-TW": {
                    "title": "對非負整數 n 而言，n & 1 == 1 代表 n 是奇數。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "正確。二進位中只有最低位（第 0 位）的位權是 1，其他位都是 2 的倍數。所以 n & 1 取出最低位：是 1 就是奇數，是 0 就是偶數，效果等同 n % 2。",
                },
                "en": {
                    "title": "For a non-negative integer n, n & 1 == 1 means n is odd.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "True. Only the lowest bit (bit 0) has weight 1; every other bit is a multiple of 2. So n & 1 extracts the lowest bit: 1 means odd, 0 means even — the same as n % 2.",
                },
            },
        },
        {
            "id": "bit-manipulation-q2",
            "type": "single-choice",
            "baseRating": 900,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "6 & 3 的結果是多少？",
                    "options": [
                        {"id": "A", "text": "7"},
                        {"id": "B", "text": "5"},
                        {"id": "C", "text": "2"},
                        {"id": "D", "text": "1"},
                    ],
                    "explanation": "6 = 110、3 = 011，AND 只有兩邊都是 1 的位元才是 1，只剩第 1 位：010 = 2。選項 A 是 6 | 3 = 7，選項 B 是 6 ^ 3 = 5。",
                },
                "en": {
                    "title": "What is 6 & 3?",
                    "options": [
                        {"id": "A", "text": "7"},
                        {"id": "B", "text": "5"},
                        {"id": "C", "text": "2"},
                        {"id": "D", "text": "1"},
                    ],
                    "explanation": "6 = 110 and 3 = 011. AND keeps a 1 only where both bits are 1, which leaves bit 1: 010 = 2. Option A is 6 | 3 = 7 and option B is 6 ^ 3 = 5.",
                },
            },
        },
        {
            "id": "bit-manipulation-q3",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "對任意整數 a，a ^ a 與 a ^ 0 分別等於什麼？",
                    "options": [
                        {"id": "A", "text": "0 和 a"},
                        {"id": "B", "text": "a 和 0"},
                        {"id": "C", "text": "0 和 0"},
                        {"id": "D", "text": "2a 和 a"},
                    ],
                    "explanation": "XOR 是「兩位不同才得 1」。a ^ a 每一位都相同，所以全部是 0；a ^ 0 時 0 不會改變任何位元，結果還是 a。這兩個性質讓成對出現的數字在 XOR 中互相抵銷。",
                },
                "en": {
                    "title": "For any integer a, what are a ^ a and a ^ 0?",
                    "options": [
                        {"id": "A", "text": "0 and a"},
                        {"id": "B", "text": "a and 0"},
                        {"id": "C", "text": "0 and 0"},
                        {"id": "D", "text": "2a and a"},
                    ],
                    "explanation": "XOR gives 1 only where the bits differ. In a ^ a every bit matches, so the result is 0; in a ^ 0 the zeros change nothing, so the result is a. Together these let paired numbers cancel out under XOR.",
                },
            },
        },
        {
            "id": "bit-manipulation-q4",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "要把整數 mask 的第 k 位「設為 1」（其他位元不變），應該怎麼寫？",
                    "options": [
                        {"id": "A", "text": "mask & (1 << k)"},
                        {"id": "B", "text": "mask | (1 << k)"},
                        {"id": "C", "text": "mask ^ (1 << k)"},
                        {"id": "D", "text": "mask & ~(1 << k)"},
                    ],
                    "explanation": "1 << k 只有第 k 位是 1。OR 上它會把第 k 位設成 1，其他位元 OR 0 不變。選項 A 是「檢查」第 k 位，選項 C 是「翻轉」第 k 位，選項 D 是「清除」第 k 位。",
                },
                "en": {
                    "title": "How do you set bit k of mask to 1 while leaving the other bits unchanged?",
                    "options": [
                        {"id": "A", "text": "mask & (1 << k)"},
                        {"id": "B", "text": "mask | (1 << k)"},
                        {"id": "C", "text": "mask ^ (1 << k)"},
                        {"id": "D", "text": "mask & ~(1 << k)"},
                    ],
                    "explanation": "1 << k has only bit k set. OR-ing it sets bit k to 1, and OR-ing 0 leaves the other bits alone. Option A tests bit k, option C toggles it, and option D clears it.",
                },
            },
        },
        {
            "id": "bit-manipulation-q5",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "對正整數 n，運算 n & (n - 1) 的效果是什麼？",
                    "options": [
                        {"id": "A", "text": "把 n 除以 2"},
                        {"id": "B", "text": "只保留 n 最低位的 1"},
                        {"id": "C", "text": "把 n 的所有位元反轉"},
                        {"id": "D", "text": "清掉 n 最低位的 1"},
                    ],
                    "explanation": "n - 1 會把 n 最低位的 1 變成 0，並把它右邊的 0 全部變成 1，更高的位元不變。兩者 AND 之後，這段被翻轉的位元全部歸零，效果就是清掉最低位的 1。選項 B 是 n & -n。",
                },
                "en": {
                    "title": "For a positive integer n, what does n & (n - 1) do?",
                    "options": [
                        {"id": "A", "text": "Divides n by 2"},
                        {"id": "B", "text": "Keeps only the lowest 1 bit of n"},
                        {"id": "C", "text": "Flips every bit of n"},
                        {"id": "D", "text": "Clears the lowest 1 bit of n"},
                    ],
                    "explanation": "n - 1 turns n's lowest 1 into 0 and every 0 to its right into 1, leaving the higher bits unchanged. AND-ing the two zeroes out that flipped stretch, which clears the lowest 1 bit. Option B is n & -n.",
                },
            },
        },
        {
            "id": "bit-manipulation-q6",
            "type": "true-false",
            "baseRating": 1050,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "只要檢查 n & (n - 1) == 0，不需要其他條件，就能正確判斷整數 n 是不是 2 的冪次。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "錯誤。n = 0 時 0 & (-1) = 0 也會成立，但 0 不是 2 的冪次。正確寫法是 n > 0 and n & (n - 1) == 0：2 的冪次在二進位中恰好只有一個 1，清掉它之後才會變成 0。",
                },
                "en": {
                    "title": "Checking n & (n - 1) == 0 on its own, with no other condition, correctly decides whether an integer n is a power of two.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "False. For n = 0, 0 & (-1) = 0 also passes, but 0 is not a power of two. The correct test is n > 0 and n & (n - 1) == 0: a power of two has exactly one 1 bit, and clearing it leaves 0.",
                },
            },
        },
        {
            "id": "bit-manipulation-q7",
            "groupId": "bit-manipulation-group-1",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "參考題組程式碼，c = a & b 的值為何？",
                    "options": [
                        {"id": "A", "text": "63"},
                        {"id": "B", "text": "8"},
                        {"id": "C", "text": "55"},
                        {"id": "D", "text": "12"},
                    ],
                    "explanation": "101100 & 011011：只有第 3 位兩邊都是 1，結果為 001000 = 8。選項 A 是 a | b = 63，選項 C 是 a ^ b = 55。",
                },
                "en": {
                    "title": "Using the group code, what is c = a & b?",
                    "options": [
                        {"id": "A", "text": "63"},
                        {"id": "B", "text": "8"},
                        {"id": "C", "text": "55"},
                        {"id": "D", "text": "12"},
                    ],
                    "explanation": "101100 & 011011: only bit 3 is 1 in both, giving 001000 = 8. Option A is a | b = 63 and option C is a ^ b = 55.",
                },
            },
        },
        {
            "id": "bit-manipulation-q8",
            "groupId": "bit-manipulation-group-1",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "參考題組程式碼，d = a ^ b 的值為何？",
                    "options": [
                        {"id": "A", "text": "63"},
                        {"id": "B", "text": "8"},
                        {"id": "C", "text": "17"},
                        {"id": "D", "text": "55"},
                    ],
                    "explanation": "101100 ^ 011011：兩位不同才得 1，只有第 3 位兩邊相同（都是 1），結果為 110111 = 32 + 16 + 4 + 2 + 1 = 55。也可以用 a ^ b = (a | b) - (a & b) = 63 - 8 驗算。",
                },
                "en": {
                    "title": "Using the group code, what is d = a ^ b?",
                    "options": [
                        {"id": "A", "text": "63"},
                        {"id": "B", "text": "8"},
                        {"id": "C", "text": "17"},
                        {"id": "D", "text": "55"},
                    ],
                    "explanation": "101100 ^ 011011: a bit is 1 only where they differ, and only bit 3 matches (both 1), giving 110111 = 32 + 16 + 4 + 2 + 1 = 55. You can double-check with a ^ b = (a | b) - (a & b) = 63 - 8.",
                },
            },
        },
        {
            "id": "bit-manipulation-q9",
            "groupId": "bit-manipulation-group-1",
            "type": "single-choice",
            "baseRating": 1250,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "參考題組程式碼，e = a & -a 的值為何？",
                    "options": [
                        {"id": "A", "text": "-44"},
                        {"id": "B", "text": "0"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "44"},
                    ],
                    "explanation": "在二補數中 -a = ~a + 1，它和 a 只有「最低位的 1」這一位同時為 1。所以 a & -a 只保留最低位的 1：44 = 101100，最低位的 1 在第 2 位，結果為 4。這個技巧常稱為 lowbit，是樹狀陣列（Fenwick Tree）的核心。",
                },
                "en": {
                    "title": "Using the group code, what is e = a & -a?",
                    "options": [
                        {"id": "A", "text": "-44"},
                        {"id": "B", "text": "0"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "44"},
                    ],
                    "explanation": "In two's complement -a = ~a + 1, which shares only the lowest 1 bit with a. So a & -a keeps just the lowest 1 bit: 44 = 101100 has it at bit 2, giving 4. This trick is often called lowbit and is the core of the Fenwick tree.",
                },
            },
        },
        {
            "id": "bit-manipulation-q10",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "用位元遮罩枚舉 5 個元素的所有子集（包含空集合），mask 總共有幾種可能的值？",
                    "options": [
                        {"id": "A", "text": "5"},
                        {"id": "B", "text": "25"},
                        {"id": "C", "text": "32"},
                        {"id": "D", "text": "31"},
                    ],
                    "explanation": "每個元素都有「選」與「不選」兩種狀態，5 個元素共 2^5 = 32 種組合，對應 mask = 0 到 31。選項 D 的 31 是 mask 的最大值，不是個數。",
                },
                "en": {
                    "title": "When enumerating every subset of 5 elements (including the empty set) with a bitmask, how many values can mask take?",
                    "options": [
                        {"id": "A", "text": "5"},
                        {"id": "B", "text": "25"},
                        {"id": "C", "text": "32"},
                        {"id": "D", "text": "31"},
                    ],
                    "explanation": "Each element is either chosen or not, so 5 elements give 2^5 = 32 combinations, matching mask = 0 through 31. Option D, 31, is the largest mask value, not the count.",
                },
            },
        },
        {
            "id": "bit-manipulation-q11",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "arr = [3, 5, 2, 7]，規定 mask 的第 j 位是 1 就代表選了 arr[j]。mask = 13 對應哪個子集？",
                    "options": [
                        {"id": "A", "text": "{3, 5, 7}"},
                        {"id": "B", "text": "{3, 2, 7}"},
                        {"id": "C", "text": "{5, 2, 7}"},
                        {"id": "D", "text": "{3, 5, 2}"},
                    ],
                    "explanation": "13 = 1101，第 0、2、3 位是 1（從最右邊的第 0 位數起），所以選了 arr[0] = 3、arr[2] = 2、arr[3] = 7。選項 A 是把二進位從左往右對應到 arr 的常見錯誤。",
                },
                "en": {
                    "title": "arr = [3, 5, 2, 7], and bit j of mask set means arr[j] is chosen. Which subset does mask = 13 represent?",
                    "options": [
                        {"id": "A", "text": "{3, 5, 7}"},
                        {"id": "B", "text": "{3, 2, 7}"},
                        {"id": "C", "text": "{5, 2, 7}"},
                        {"id": "D", "text": "{3, 5, 2}"},
                    ],
                    "explanation": "13 = 1101, so bits 0, 2 and 3 are set (counting from bit 0 on the right): arr[0] = 3, arr[2] = 2 and arr[3] = 7. Option A is the common mistake of mapping the binary digits to arr from left to right.",
                },
            },
        },
        {
            "id": "bit-manipulation-q12",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "用 mask 從 0 枚舉到 2^n - 1，並對每個 mask 逐位檢查 n 個位元來計算子集總和，整體時間複雜度為何？",
                    "options": [
                        {"id": "A", "text": "O(2^n)"},
                        {"id": "B", "text": "O(n^2)"},
                        {"id": "C", "text": "O(n · 2^n)"},
                        {"id": "D", "text": "O(n!)"},
                    ],
                    "explanation": "外層有 2^n 個 mask，每個 mask 內層都要檢查 n 個位元，所以是 O(n · 2^n)。這也是位元枚舉通常只用在 n ≤ 20 左右的原因。",
                },
                "en": {
                    "title": "Enumerating mask from 0 to 2^n - 1 and checking all n bits of each mask to compute the subset sum — what is the overall time complexity?",
                    "options": [
                        {"id": "A", "text": "O(2^n)"},
                        {"id": "B", "text": "O(n^2)"},
                        {"id": "C", "text": "O(n · 2^n)"},
                        {"id": "D", "text": "O(n!)"},
                    ],
                    "explanation": "There are 2^n masks, and each one checks n bits, so the total is O(n · 2^n). That is why bitmask enumeration is usually limited to n of about 20 or less.",
                },
            },
        },
        {
            "id": "bit-manipulation-q13",
            "type": "multiple-choice",
            "baseRating": 1150,
            "correctAnswer": ["opt1", "opt2", "opt4"],
            "translations": {
                "zh-TW": {
                    "title": "關於 XOR（^）的性質，以下哪些敘述正確？（多選）",
                    "options": [
                        {"id": "opt1", "text": "a ^ b ^ b == a"},
                        {"id": "opt2", "text": "滿足交換律與結合律，一串數字 XOR 的結果與順序無關"},
                        {"id": "opt3", "text": "對非負整數，a ^ b 一定大於等於 max(a, b)"},
                        {"id": "opt4", "text": "a ^ b == 0 若且唯若 a == b"},
                    ],
                    "explanation": "opt1 正確：b ^ b = 0，再 ^ 0 不變。opt2 正確：這就是「只出現一次的數字」可以直接全部 XOR 的原因。opt3 錯誤：例如 3 ^ 1 = 2，比 3 小。opt4 正確：只有每一位都相同時結果才會是 0。",
                },
                "en": {
                    "title": "Which statements about XOR (^) are correct? (Multiple choice)",
                    "options": [
                        {"id": "opt1", "text": "a ^ b ^ b == a"},
                        {"id": "opt2", "text": "It is commutative and associative, so XOR-ing a list gives the same result in any order"},
                        {"id": "opt3", "text": "For non-negative integers, a ^ b is always at least max(a, b)"},
                        {"id": "opt4", "text": "a ^ b == 0 if and only if a == b"},
                    ],
                    "explanation": "opt1 is correct: b ^ b = 0, and ^ 0 changes nothing. opt2 is correct: that is why XOR-ing everything solves Single Number. opt3 is wrong: 3 ^ 1 = 2, which is less than 3. opt4 is correct: the result is 0 only when every bit matches.",
                },
            },
        },
        {
            "id": "bit-manipulation-q14",
            "type": "single-choice",
            "baseRating": 1200,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "陣列 [4, 1, 2, 1, 2] 中只有一個數字出現一次，其他都出現兩次。把所有元素 XOR 起來的結果是多少？",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "1"},
                        {"id": "D", "text": "2"},
                    ],
                    "explanation": "XOR 滿足交換律與結合律，可以重新排列成 (1 ^ 1) ^ (2 ^ 2) ^ 4 = 0 ^ 0 ^ 4 = 4。成對的數字互相抵銷，只剩下出現一次的 4。這就是 LeetCode 136，時間 O(n)、空間 O(1)。",
                },
                "en": {
                    "title": "In [4, 1, 2, 1, 2] every number appears twice except one. What do you get by XOR-ing all the elements?",
                    "options": [
                        {"id": "A", "text": "0"},
                        {"id": "B", "text": "4"},
                        {"id": "C", "text": "1"},
                        {"id": "D", "text": "2"},
                    ],
                    "explanation": "XOR is commutative and associative, so regroup it as (1 ^ 1) ^ (2 ^ 2) ^ 4 = 0 ^ 0 ^ 4 = 4. The pairs cancel, leaving the single 4. This is LeetCode 136, in O(n) time and O(1) space.",
                },
            },
        },
        {
            "id": "bit-manipulation-q15",
            "type": "fill-code",
            "baseRating": 1300,
            "correctAnswer": [
                "n & (n - 1)|(n - 1) & n|n & n - 1",
                "n & (n - 1) == 0|(n & (n - 1)) == 0|not n & (n - 1)|not (n & (n - 1))",
            ],
            "code": COUNT_BITS_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫程式碼中 (a)(b) 缺失的表達式：count_bits 計算 n 的二進位中有幾個 1，is_power_of_two 判斷 n 是否為 2 的冪次。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}],
                    "explanation": "(a) 每次用 n & (n - 1) 清掉最低位的 1，迴圈次數就是 1 的個數。(b) 2 的冪次只有一個 1，清掉後會變成 0：n & (n - 1) == 0。在 Python 中比較運算子的優先順序比 & 低，所以不用額外加括號；前面的 n > 0 則排除了 n = 0。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b): count_bits counts the 1s in n's binary form, and is_power_of_two checks whether n is a power of two.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}],
                    "explanation": "(a) Each n & (n - 1) clears the lowest 1, so the number of rounds is the number of 1s. (b) A power of two has a single 1, which becomes 0 once cleared: n & (n - 1) == 0. In Python comparisons bind more loosely than &, so no extra parentheses are needed; the n > 0 in front rules out n = 0.",
                },
            },
        },
        {
            "id": "bit-manipulation-q16",
            "type": "fill-code",
            "baseRating": 1300,
            "correctAnswer": [
                "1 << n|2 ** n",
                "(mask >> j) & 1|mask >> j & 1|mask & (1 << j)|mask & 1 << j|(mask >> j) & 1 == 1|mask & (1 << j) != 0",
            ],
            "code": SUBSETS_FILL_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請填寫 subsets 程式碼中 (a)(b) 缺失的表達式，用位元遮罩列出 arr 的所有子集。",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}],
                    "explanation": "(a) n 個元素有 2^n 個子集，mask 要從 0 跑到 2^n - 1，所以 range(1 << n)。(b) 檢查 mask 的第 j 位是否為 1：(mask >> j) & 1，或寫成 mask & (1 << j)。",
                },
                "en": {
                    "title": "Fill in the missing expressions at (a)(b) in subsets to list every subset of arr with a bitmask.",
                    "options": [{"id": "a", "text": ""}, {"id": "b", "text": ""}],
                    "explanation": "(a) n elements have 2^n subsets, so mask runs from 0 to 2^n - 1: range(1 << n). (b) Test whether bit j of mask is 1: (mask >> j) & 1, or equivalently mask & (1 << j).",
                },
            },
        },
        {
            "id": "bit-manipulation-q17",
            "type": "predict-line",
            "baseRating": 1350,
            "correctAnswer": "1 2 4 5 6 7 5 6 7 5 8 10",
            "code": CLASSIFY_CODE,
            "language": "python",
            "translations": {
                "zh-TW": {
                    "title": "請閱讀 classify 函數。呼叫 classify(12) 時，請依序填寫執行的行號序列（以空格分隔）。",
                    "options": [],
                    "explanation": "L1 進入函數；L2 12 & 11 = 8 ≠ 0，不是 2 的冪次；L4 count = 0。L5 n = 12；L6 n = 12 & 11 = 8；L7 count = 1。L5 n = 8；L6 n = 8 & 7 = 0；L7 count = 2。L5 n = 0 離開迴圈；L8 count = 2 是偶數，條件不成立；L10 回傳 \"even bits\"。行號序列：1 2 4 5 6 7 5 6 7 5 8 10。",
                },
                "en": {
                    "title": "Read the classify function. When calling classify(12), write the sequence of line numbers executed (space-separated).",
                    "options": [],
                    "explanation": "L1 enter; L2 12 & 11 = 8 ≠ 0, so not a power of two; L4 count = 0. L5 n = 12; L6 n = 12 & 11 = 8; L7 count = 1. L5 n = 8; L6 n = 8 & 7 = 0; L7 count = 2. L5 n = 0 leaves the loop; L8 count = 2 is even, so the condition fails; L10 returns \"even bits\". Line sequence: 1 2 4 5 6 7 5 6 7 5 8 10.",
                },
            },
        },
        {
            "id": "bit-manipulation-q18",
            "type": "single-choice",
            "baseRating": 1250,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "在旅行推銷員問題（TSP）的狀態壓縮 DP 中，常定義 dp[mask][i]。其中 mask 代表什麼？",
                    "options": [
                        {"id": "A", "text": "已拜訪過的城市集合：第 j 位是 1 代表城市 j 已拜訪"},
                        {"id": "B", "text": "目前為止走過的總距離"},
                        {"id": "C", "text": "最後一個拜訪的城市編號"},
                        {"id": "D", "text": "還沒拜訪的城市數量"},
                    ],
                    "explanation": "狀態壓縮就是把「一個集合」壓成一個整數。mask 記錄已拜訪的城市，i 記錄目前停在哪個城市（選項 C 是 i 的角色），dp 值才是最短距離（選項 B）。狀態共 2^n × n 個，比枚舉所有排列的 n! 小得多。",
                },
                "en": {
                    "title": "In the bitmask DP for the traveling salesman problem (TSP), dp[mask][i] is a common definition. What does mask represent?",
                    "options": [
                        {"id": "A", "text": "The set of visited cities: bit j set means city j has been visited"},
                        {"id": "B", "text": "The total distance traveled so far"},
                        {"id": "C", "text": "The index of the last city visited"},
                        {"id": "D", "text": "The number of cities not yet visited"},
                    ],
                    "explanation": "Bitmask DP compresses a set into a single integer. mask records the visited cities, i records the current city (option C describes i), and the dp value itself is the shortest distance (option B). There are 2^n × n states — far fewer than the n! orderings.",
                },
            },
        },
        {
            "id": "bit-manipulation-q19",
            "type": "single-choice",
            "baseRating": 950,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "13 << 2 的結果是多少？",
                    "options": [
                        {"id": "A", "text": "52"},
                        {"id": "B", "text": "26"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "15"},
                    ],
                    "explanation": "左移 s 格等於乘以 2^s。13 = 1101，整排往左搬 2 格並在右邊補兩個 0，得到 110100 = 52 = 13 × 4。選項 B 只移了 1 格，選項 C 是右移 2 格的結果。",
                },
                "en": {
                    "title": "What is 13 << 2?",
                    "options": [
                        {"id": "A", "text": "52"},
                        {"id": "B", "text": "26"},
                        {"id": "C", "text": "3"},
                        {"id": "D", "text": "15"},
                    ],
                    "explanation": "Shifting left by s multiplies by 2^s. 13 = 1101; moving the whole row 2 places left and filling two 0s on the right gives 110100 = 52 = 13 × 4. Option B shifts only once, and option C is the result of shifting right by 2.",
                },
            },
        },
        {
            "id": "bit-manipulation-q20",
            "type": "single-choice",
            "baseRating": 1000,
            "correctAnswer": "C",
            "translations": {
                "zh-TW": {
                    "title": "對非負整數，100 >> 3 的結果是多少？",
                    "options": [
                        {"id": "A", "text": "800"},
                        {"id": "B", "text": "13"},
                        {"id": "C", "text": "12"},
                        {"id": "D", "text": "97"},
                    ],
                    "explanation": "右移 s 格等於除以 2^s 再無條件捨去。100 / 8 = 12.5，捨去小數後是 12。從位元來看，100 = 1100100，最右邊 3 個位元 100 掉出去，剩下 1100 = 12。選項 B 是四捨五入的錯誤，選項 A 是左移 3 格。",
                },
                "en": {
                    "title": "For a non-negative integer, what is 100 >> 3?",
                    "options": [
                        {"id": "A", "text": "800"},
                        {"id": "B", "text": "13"},
                        {"id": "C", "text": "12"},
                        {"id": "D", "text": "97"},
                    ],
                    "explanation": "Shifting right by s divides by 2^s and rounds down. 100 / 8 = 12.5, which rounds down to 12. In bits, 100 = 1100100; the rightmost three bits 100 fall off, leaving 1100 = 12. Option B rounds to nearest by mistake, and option A shifts left by 3.",
                },
            },
        },
        {
            "id": "bit-manipulation-q21",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "B",
            "translations": {
                "zh-TW": {
                    "title": "在 Python 中，~5 與 ~5 & 0xFF 分別是多少？",
                    "options": [
                        {"id": "A", "text": "250 和 250"},
                        {"id": "B", "text": "-6 和 250"},
                        {"id": "C", "text": "-5 和 251"},
                        {"id": "D", "text": "2 和 2"},
                    ],
                    "explanation": "Python 的整數沒有固定位數，~x 定義為 -x - 1，所以 ~5 = -6。如果只看 8 位元，5 = 00000101 反轉後是 11111010 = 250，也就是 255 - 5；& 0xFF 的作用正是只保留最低 8 位元。選項 D 只反轉了 5 的 3 個位元（101 → 010）。",
                },
                "en": {
                    "title": "In Python, what are ~5 and ~5 & 0xFF?",
                    "options": [
                        {"id": "A", "text": "250 and 250"},
                        {"id": "B", "text": "-6 and 250"},
                        {"id": "C", "text": "-5 and 251"},
                        {"id": "D", "text": "2 and 2"},
                    ],
                    "explanation": "Python integers have no fixed width, and ~x is defined as -x - 1, so ~5 = -6. Looking at 8 bits only, 5 = 00000101 flips to 11111010 = 250, i.e. 255 - 5; & 0xFF keeps exactly the lowest 8 bits. Option D flips only the three bits of 5 (101 -> 010).",
                },
            },
        },
        {
            "id": "bit-manipulation-q22",
            "type": "single-choice",
            "baseRating": 1100,
            "correctAnswer": "A",
            "translations": {
                "zh-TW": {
                    "title": "a = 12，執行 a & ~(1 << 2) 的結果是多少？",
                    "options": [
                        {"id": "A", "text": "8"},
                        {"id": "B", "text": "12"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "16"},
                    ],
                    "explanation": "1 << 2 = 00000100，~ 反轉後只有第 2 位是 0。12 = 00001100 和它 AND，第 2 位被清成 0，其他位不變，得到 00001000 = 8。這就是「清除第 k 位」的寫法。選項 C 是 a & (1 << 2)，也就是「檢查第 k 位」。",
                },
                "en": {
                    "title": "With a = 12, what is a & ~(1 << 2)?",
                    "options": [
                        {"id": "A", "text": "8"},
                        {"id": "B", "text": "12"},
                        {"id": "C", "text": "4"},
                        {"id": "D", "text": "16"},
                    ],
                    "explanation": "1 << 2 = 00000100, and ~ flips it so only bit 2 is 0. AND-ing 12 = 00001100 with it clears bit 2 and leaves the rest, giving 00001000 = 8. This is how to clear bit k. Option C is a & (1 << 2), which tests bit k.",
                },
            },
        },
        {
            "id": "bit-manipulation-q23",
            "type": "single-choice",
            "baseRating": 1150,
            "correctAnswer": "D",
            "translations": {
                "zh-TW": {
                    "title": "a = 5、b = 3，依序執行 a = a ^ b 與 b = a ^ b 之後（第三行還沒執行），b 的值是多少？",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "6"},
                        {"id": "C", "text": "0"},
                        {"id": "D", "text": "5"},
                    ],
                    "explanation": "第一行後 a = 5 ^ 3 = 6。第二行 b = a ^ b = 6 ^ 3 = (5 ^ 3) ^ 3，兩個 3 互相抵銷，剩下 5，也就是原本的 a。最後一行 a = a ^ b = 6 ^ 5 = 3，交換就完成了。",
                },
                "en": {
                    "title": "With a = 5 and b = 3, after running a = a ^ b and then b = a ^ b (before the third line), what is b?",
                    "options": [
                        {"id": "A", "text": "3"},
                        {"id": "B", "text": "6"},
                        {"id": "C", "text": "0"},
                        {"id": "D", "text": "5"},
                    ],
                    "explanation": "After the first line, a = 5 ^ 3 = 6. The second line gives b = a ^ b = 6 ^ 3 = (5 ^ 3) ^ 3; the two 3s cancel, leaving 5, the original a. The last line a = a ^ b = 6 ^ 5 = 3 completes the swap.",
                },
            },
        },
        {
            "id": "bit-manipulation-q24",
            "type": "true-false",
            "baseRating": 1250,
            "correctAnswer": "false",
            "translations": {
                "zh-TW": {
                    "title": "用 arr[i] ^= arr[j]; arr[j] ^= arr[i]; arr[i] ^= arr[j] 交換陣列元素，即使 i == j 也一定正確。",
                    "options": [{"id": "true", "text": "正確"}, {"id": "false", "text": "錯誤"}],
                    "explanation": "錯誤。要分清楚「數值相同」和「同一個位置」：兩個不同的變數就算數值相同也能正確交換，例如 a = 7、b = 7，第一步 a 變成 0 時 b 那一格還保留著 7，後面兩步就能還原。但 i == j 時，arr[i] 和 arr[j] 是同一格的兩個名字，第一步 arr[i] ^= arr[i] = 7 ^ 7 就把這一格變成 0，已經沒有任何一格記得原本的 7，之後怎麼 XOR 都是 0。所以用 XOR 交換前要先確認兩者不是同一個位置，或直接改用暫存變數。",
                },
                "en": {
                    "title": "Swapping array elements with arr[i] ^= arr[j]; arr[j] ^= arr[i]; arr[i] ^= arr[j] is always correct, even when i == j.",
                    "options": [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}],
                    "explanation": "False. Tell apart \"equal values\" and \"the same slot\": two different variables swap correctly even when their values are equal — with a = 7 and b = 7, the first step turns a into 0 while b still holds 7, so the next two steps restore both. But when i == j, arr[i] and arr[j] are two names for one slot, so the first step arr[i] ^= arr[i] = 7 ^ 7 turns that slot into 0; no slot remembers the original 7 any more, and every later XOR keeps it at 0. Check that the two positions differ before an XOR swap, or just use a temporary variable.",
                },
            },
        },
    ],
}

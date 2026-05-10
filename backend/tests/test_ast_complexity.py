"""
tests/test_ast_complexity.py — AST 靜態複雜度分析單元測試
"""
from services.ast_complexity import analyze_complexity


def test_constant():
    code = "def foo(x):\n    return x + 1"
    assert analyze_complexity(code) == "O(1)"


def test_linear_loop():
    code = "def foo(arr):\n    for x in arr:\n        print(x)"
    assert analyze_complexity(code) == "O(n)"


def test_quadratic_nested_loop():
    code = (
        "def bubble_sort(arr):\n"
        "    n = len(arr)\n"
        "    for i in range(n):\n"
        "        for j in range(n - i - 1):\n"
        "            if arr[j] > arr[j+1]:\n"
        "                arr[j], arr[j+1] = arr[j+1], arr[j]"
    )
    assert analyze_complexity(code) == "O(n²)"


def test_cubic_triple_loop():
    code = (
        "def foo(n):\n"
        "    for i in range(n):\n"
        "        for j in range(n):\n"
        "            for k in range(n):\n"
        "                pass"
    )
    assert analyze_complexity(code) == "O(n³)"


def test_recursive_no_loop():
    # AST cannot detect halving vs. linear recursion; conservative label is O(n).
    # binary_search is O(log n) at runtime, but big-O/Gemini layers correct this.
    code = (
        "def binary_search(arr, lo, hi, target):\n"
        "    if lo > hi:\n"
        "        return -1\n"
        "    mid = (lo + hi) // 2\n"
        "    if arr[mid] == target:\n"
        "        return mid\n"
        "    elif arr[mid] < target:\n"
        "        return binary_search(arr, mid + 1, hi, target)\n"
        "    else:\n"
        "        return binary_search(arr, lo, mid - 1, target)"
    )
    assert analyze_complexity(code) == "O(n)"


def test_linear_recursion_no_loop():
    code = (
        "def factorial(n):\n"
        "    if n <= 1:\n"
        "        return 1\n"
        "    return n * factorial(n - 1)"
    )
    assert analyze_complexity(code) == "O(n)"


def test_recursive_with_loop():
    code = (
        "def merge_sort(arr):\n"
        "    if len(arr) <= 1:\n"
        "        return arr\n"
        "    mid = len(arr) // 2\n"
        "    left = merge_sort(arr[:mid])\n"
        "    right = merge_sort(arr[mid:])\n"
        "    result = []\n"
        "    i = j = 0\n"
        "    while i < len(left) and j < len(right):\n"
        "        if left[i] <= right[j]:\n"
        "            result.append(left[i]); i += 1\n"
        "        else:\n"
        "            result.append(right[j]); j += 1\n"
        "    result.extend(left[i:])\n"
        "    result.extend(right[j:])\n"
        "    return result"
    )
    assert analyze_complexity(code) == "O(n log n)"


def test_syntax_error_returns_unknown():
    assert analyze_complexity("def foo(:\n    pass") == "unknown"


def test_no_function_linear():
    code = "for x in range(10):\n    print(x)"
    assert analyze_complexity(code) == "O(n)"

"""
tests/test_complexity_analyzer.py — fit_complexity 單元測試
（measure_step_counts 依賴 Docker，不在單元測試範圍）
"""
import math
import pytest
from services.complexity_analyzer import fit_complexity

NS = [10, 50, 100, 200, 500]


def test_fit_constant():
    counts = [42] * len(NS)
    assert fit_complexity(NS, counts) == "O(1)"


def test_fit_logn():
    counts = [int(10 * math.log2(max(n, 1)) + 3) for n in NS]
    assert fit_complexity(NS, counts) == "O(log n)"


def test_fit_linear():
    counts = [3 * n + 5 for n in NS]
    assert fit_complexity(NS, counts) == "O(n)"


def test_fit_nlogn():
    counts = [int(4 * n * math.log2(max(n, 1)) + 8) for n in NS]
    assert fit_complexity(NS, counts) == "O(n log n)"


def test_fit_quadratic():
    counts = [2 * n ** 2 + n + 10 for n in NS]
    assert fit_complexity(NS, counts) == "O(n²)"


def test_fit_single_point_no_crash():
    """1 個資料點：curve_fit 全部失敗，應回傳預設值不 crash。"""
    result = fit_complexity([10], [30])
    assert isinstance(result, str)


from services.complexity_analyzer import generate_bigo_wrapper


def _make_code(*funcs: str) -> str:
    return "\n\n".join(funcs)


def test_picks_uncalled_funcdef():
    """helper 被主函式呼叫，應選主函式（未被呼叫的那個）。"""
    code = _make_code(
        "def swap(a, b):\n    return b, a",
        "def bubble_sort(arr):\n    swap(0, 1)",
    )
    result = generate_bigo_wrapper(code)
    assert result is not None
    assert "def explore_wrapper(n):" in result
    assert "bubble_sort(" in result


def test_recursive_main_returns_none():
    """自呼叫遞迴主函式排除 self-call 後沒有呼叫任何其他頂層函式，
    是唯一未被呼叫的函式，但因為本身是遞迴 → 回傳 None。"""
    code = "def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)"
    assert generate_bigo_wrapper(code) is None


def test_ambiguous_falls_back_to_last():
    """兩個都未被呼叫 → fallback 最後一個。"""
    code = _make_code(
        "def foo(arr):\n    pass",
        "def bar(arr):\n    pass",
    )
    result = generate_bigo_wrapper(code)
    assert result is not None
    assert "bar(" in result


def test_wrapper_list_param():
    code = "def bubble_sort(arr):\n    pass"
    result = generate_bigo_wrapper(code)
    assert result is not None
    assert "bubble_sort(list(range(n, 0, -1)))" in result
    assert "def explore_wrapper(n):" in result


def test_wrapper_int_param():
    code = "def count_steps(n):\n    pass"
    result = generate_bigo_wrapper(code)
    assert result is not None
    assert "count_steps(n)" in result


def test_wrapper_string_param():
    code = "def is_palindrome(s):\n    pass"
    result = generate_bigo_wrapper(code)
    assert result is not None
    assert 'is_palindrome("a" * n)' in result


def test_wrapper_matrix_param():
    code = "def search_matrix(matrix):\n    pass"
    result = generate_bigo_wrapper(code)
    assert result is not None
    assert "search_matrix([[0]*10 for _ in range(n)])" in result


def test_wrapper_unknown_param_returns_none():
    code = "def solve(obj):\n    pass"
    assert generate_bigo_wrapper(code) is None


def test_wrapper_no_param_returns_none():
    code = "def run():\n    pass"
    assert generate_bigo_wrapper(code) is None

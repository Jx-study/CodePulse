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

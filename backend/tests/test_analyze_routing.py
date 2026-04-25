"""
Integration tests for route_level1_decision().
These mock algo_identify so they don't require the real MiniLM model.
"""
from unittest.mock import patch, MagicMock

import pytest

from services.algo_identification import IdentifyResult
from routes.analyze import route_level1_decision


def _result(algo_name, score=0.8, top_raw=None):
    return IdentifyResult(
        algo_name=algo_name,
        score=score,
        top_raw=top_raw or algo_name or "",
    )


# --- standard iterative bubble_sort → level1_eligible ---

BUBBLE_ITERATIVE = """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
"""

BUBBLE_RECURSIVE = """
def bubble_sort(arr, n=None):
    if n is None:
        n = len(arr)
    if n == 1:
        return arr
    for i in range(n - 1):
        if arr[i] > arr[i + 1]:
            arr[i], arr[i + 1] = arr[i + 1], arr[i]
    return bubble_sort(arr, n - 1)
"""

MERGE_SORT_STANDARD = """
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
"""

FIBONACCI = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
"""


def test_standard_bubble_sort_is_level1_eligible():
    algo, reason = route_level1_decision(BUBBLE_ITERATIVE, _result("bubble_sort"))
    assert algo == "bubble_sort"
    assert reason is None


def test_recursive_bubble_sort_is_structure_mismatch():
    algo, reason = route_level1_decision(BUBBLE_RECURSIVE, _result("bubble_sort"))
    assert algo is None
    assert reason == "structure_mismatch"


def test_merge_sort_is_no_template():
    # merge_sort is identified but not in SUPPORTED_ALGORITHMS (no Level 1 template yet)
    algo, reason = route_level1_decision(MERGE_SORT_STANDARD, _result("merge_sort"))
    assert algo is None
    assert reason == "no_template"


def test_unknown_code_is_low_confidence():
    # algo_name=None means MiniLM scored below threshold
    algo, reason = route_level1_decision(FIBONACCI, _result(None, score=0.3, top_raw="bubble_sort"))
    assert algo is None
    assert reason == "low_confidence"


def test_iterative_merge_sort_is_structure_mismatch():
    # If someone wrote iterative merge sort — identified as merge_sort but expected recursive
    iterative_merge = """
def merge_sort(arr):
    width = 1
    n = len(arr)
    while width < n:
        for i in range(0, n, 2 * width):
            left = arr[i:i + width]
            right = arr[i + width:i + 2 * width]
            arr[i:i + 2 * width] = sorted(left + right)
        width *= 2
    return arr
"""
    algo, reason = route_level1_decision(iterative_merge, _result("merge_sort"))
    assert algo is None
    assert reason == "structure_mismatch"

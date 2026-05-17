"""
Smoke tests for identify(). These tests load the real MiniLM model and real
embeddings — they are slow (~5-10s on first run). Mark with pytest -m smoke.
"""
import pytest
from services.algo_identification import identify, IdentifyResult

pytestmark = pytest.mark.smoke


KNOWN_CASES = [
    (
        "bubble_sort",
        """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
""",
    ),
    (
        "selection_sort",
        """
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
""",
    ),
    (
        "insertion_sort",
        """
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr
""",
    ),
    (
        "linear_search",
        """
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
""",
    ),
    (
        "binary_search",
        """
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
""",
    ),
    (
        "merge_sort",
        """
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
""",
    ),
    (
        "quick_sort",
        """
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)
""",
    ),
]

UNKNOWN_CASES = [
    # NOTE: fibonacci / matrix_mul intentionally excluded — see
    # Note/technical/normalizer-ablation-study.md §5.3: their recursive/triple-loop
    # structures sit inside the known-algorithm score cluster (~0.90+) and cannot
    # be rejected by any single threshold without losing real known cases.
    # Resolution is deferred to the LLM disambiguator (§5.4 item 3), not normalizer
    # or reference-library changes.
    (
        "bfs",
        """
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
""",
    ),
]


@pytest.mark.parametrize("expected_algo, code", KNOWN_CASES)
def test_known_algorithm_identified(expected_algo, code):
    result = identify(code)
    assert isinstance(result, IdentifyResult)
    assert result.algo_name == expected_algo, (
        f"Expected {expected_algo}, got {result.algo_name} (score={result.score:.3f}, top_raw={result.top_raw})"
    )
    assert result.score >= 0.45


@pytest.mark.parametrize("description, code", UNKNOWN_CASES)
def test_unknown_algorithm_returns_none(description, code):
    result = identify(code)
    assert result.algo_name is None, (
        f"Expected None for {description}, got {result.algo_name} (score={result.score:.3f})"
    )


def test_identify_returns_top3():
    result = identify("def bubble_sort(arr):\n    pass")
    assert hasattr(result, 'top3')
    assert isinstance(result.top3, list)
    assert all(isinstance(name, str) and isinstance(score, float) for name, score in result.top3)


def test_identify_top3_sorted_descending():
    result = identify("def bubble_sort(arr):\n    pass")
    scores = [score for _, score in result.top3]
    assert scores == sorted(scores, reverse=True)

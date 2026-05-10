"""
Offline tool: encode reference algorithm implementations with MiniLM and write
reference_embeddings.npy + labels.json to services/algo_identification/embeddings/.

Run from the backend/ directory:
    python scripts/build_embeddings.py
"""

import json
import sys
from pathlib import Path

import numpy as np
from fastembed import TextEmbedding

sys.path.insert(0, str(Path(__file__).parent.parent))
from services.algo_identification.normalizer import normalize_identifiers

REFERENCE_IMPLEMENTATIONS: dict[str, list[str]] = {
    "bubble_sort": [
        # variant 1: standard
        """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
""",
        # variant 2: early-exit with swapped flag
        """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr
""",
        # variant 3: while-loop outer
        """
def bubble_sort(arr):
    n = len(arr)
    i = 0
    while i < n:
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
        i += 1
    return arr
""",
    ],

    "selection_sort": [
        # variant 1: standard
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
        # variant 2: different naming
        """
def selection_sort(data):
    length = len(data)
    for start in range(length):
        smallest = start
        for current in range(start + 1, length):
            if data[current] < data[smallest]:
                smallest = current
        data[start], data[smallest] = data[smallest], data[start]
    return data
""",
    ],

    "insertion_sort": [
        # variant 1: standard
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
        # variant 2: for-loop inner
        """
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        for j in range(i - 1, -1, -1):
            if arr[j] > key:
                arr[j + 1] = arr[j]
            else:
                break
        arr[j + 1] = key
    return arr
""",
        # variant 3: temp variable naming variant (reduces bubble confusion)
        """
def insertion_sort(sequence):
    for index in range(1, len(sequence)):
        current_value = sequence[index]
        position = index
        while position > 0 and sequence[position - 1] > current_value:
            sequence[position] = sequence[position - 1]
            position -= 1
        sequence[position] = current_value
    return sequence
""",
    ],

    "linear_search": [
        # variant 1: for + range
        """
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
""",
        # variant 2: while
        """
def linear_search(arr, target):
    i = 0
    while i < len(arr):
        if arr[i] == target:
            return i
        i += 1
    return -1
""",
        # variant 3: enumerate
        """
def linear_search(arr, target):
    for index, value in enumerate(arr):
        if value == target:
            return index
    return -1
""",
    ],

    "binary_search": [
        # variant 1: iterative
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
        # variant 2: recursive
        """
def binary_search(arr, target, left=0, right=None):
    if right is None:
        right = len(arr) - 1
    if left > right:
        return -1
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search(arr, target, mid + 1, right)
    else:
        return binary_search(arr, target, left, mid - 1)
""",
    ],

    "merge_sort": [
        # variant 1: returns new array
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
        # variant 2: in-place style
        """
def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        left_half = arr[:mid]
        right_half = arr[mid:]
        merge_sort(left_half)
        merge_sort(right_half)
        i = j = k = 0
        while i < len(left_half) and j < len(right_half):
            if left_half[i] < right_half[j]:
                arr[k] = left_half[i]
                i += 1
            else:
                arr[k] = right_half[j]
                j += 1
            k += 1
        while i < len(left_half):
            arr[k] = left_half[i]
            i += 1
            k += 1
        while j < len(right_half):
            arr[k] = right_half[j]
            j += 1
            k += 1
    return arr
""",
    ],

    "quick_sort": [
        # variant 1: list comprehension
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
        # variant 2: Lomuto partition
        """
def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
""",
    ],
}


def build() -> None:
    model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

    codes: list[str] = []
    labels: list[str] = []
    for algo_name, variants in REFERENCE_IMPLEMENTATIONS.items():
        for code in variants:
            codes.append(normalize_identifiers(code.strip()))
            labels.append(algo_name)

    if not codes:
        raise ValueError("REFERENCE_IMPLEMENTATIONS is empty — nothing to encode")
    if len(codes) != len(labels):
        raise ValueError(
            f"codes/labels mismatch: {len(codes)} codes vs {len(labels)} labels — "
            "check REFERENCE_IMPLEMENTATIONS"
        )

    print(f"Encoding {len(codes)} reference implementations...")
    embeddings = np.array(list(model.embed(codes)), dtype=np.float32)

    out_dir = Path(__file__).parent.parent / "services" / "algo_identification" / "embeddings"
    out_dir.mkdir(parents=True, exist_ok=True)

    npy_path = out_dir / "reference_embeddings.npy"
    json_path = out_dir / "labels.json"

    np.save(npy_path, embeddings)
    with open(json_path, "w") as f:
        json.dump(labels, f)
        f.write("\n")

    print(f"Saved {npy_path}  shape={embeddings.shape}")
    print(f"Saved {json_path}  labels={len(labels)}")
    print("Done.")


if __name__ == "__main__":
    build()

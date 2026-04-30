"""
sorting.py — Level 1 標準排序實作

所有函式簽名：(data: list, _tag) -> None
_tag 由 template_tracer.run_reference_trace() 注入，不需 import。

Tag 規格：
  SORT_START                    — 排序開始
  SORT_COMPARE   i, j           — 比較 data[i] 與 data[j]
  SORT_SWAP      i, j           — 交換 data[i] 與 data[j]
  SORT_INSERT    i, j           — insertion sort：將 data[i] 插入 j 位置
  SORT_MIN_FOUND i, min_idx     — selection sort：第 i 輪找到最小值在 min_idx
  SORT_END                      — 排序結束
"""


def bubble_sort(data: list, _tag) -> None:
    _tag("SORT_START")
    n = len(data)
    for i in range(n):
        for j in range(n - i - 1):
            _tag("SORT_COMPARE", i=j, j=j + 1)
            if data[j] > data[j + 1]:
                data[j], data[j + 1] = data[j + 1], data[j]
                _tag("SORT_SWAP", i=j, j=j + 1)
    _tag("SORT_END")


def selection_sort(data: list, _tag) -> None:
    _tag("SORT_START")
    n = len(data)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            _tag("SORT_COMPARE", i=i, j=j)
            if data[j] < data[min_idx]:
                min_idx = j
        _tag("SORT_MIN_FOUND", i=i, min_idx=min_idx)
        if min_idx != i:
            data[i], data[min_idx] = data[min_idx], data[i]
            _tag("SORT_SWAP", i=i, j=min_idx)
    _tag("SORT_END")


def insertion_sort(data: list, _tag) -> None:
    _tag("SORT_START")
    for i in range(1, len(data)):
        key = data[i]
        j = i - 1
        while j >= 0 and data[j] > key:
            _tag("SORT_COMPARE", i=j, j=j + 1)
            data[j + 1] = data[j]
            j -= 1
        data[j + 1] = key
        _tag("SORT_INSERT", i=i, j=j + 1)
    _tag("SORT_END")

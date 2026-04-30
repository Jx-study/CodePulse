"""
searching.py — Level 1 標準搜尋實作

所有函式簽名：(data: list, target, _tag) -> None
_tag 由 template_tracer.run_reference_trace() 注入，不需 import。

Tag 規格：
  SEARCH_START    target         — 搜尋開始
  SEARCH_COMPARE  i, current     — 比較 data[i] 與 target
  SEARCH_FOUND    i              — 找到目標
  SEARCH_NOT_FOUND               — 未找到
  SEARCH_NARROW   low, high, mid — binary search：縮窄區間
  SEARCH_END                     — 搜尋結束
"""


def linear_search(data: list, target, _tag) -> None:
    _tag("SEARCH_START", target=target)
    for i in range(len(data)):
        _tag("SEARCH_COMPARE", i=i, current=data[i])
        if data[i] == target:
            _tag("SEARCH_FOUND", i=i)
            _tag("SEARCH_END")
            return
    _tag("SEARCH_NOT_FOUND")
    _tag("SEARCH_END")


def binary_search(data: list, target, _tag) -> None:
    _tag("SEARCH_START", target=target)
    low, high = 0, len(data) - 1
    while low <= high:
        mid = (low + high) // 2
        _tag("SEARCH_NARROW", low=low, high=high, mid=mid)
        _tag("SEARCH_COMPARE", i=mid, current=data[mid])
        if data[mid] == target:
            _tag("SEARCH_FOUND", i=mid)
            _tag("SEARCH_END")
            return
        elif data[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    _tag("SEARCH_NOT_FOUND")
    _tag("SEARCH_END")

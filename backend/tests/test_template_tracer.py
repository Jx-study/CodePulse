import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "services"))

from reference_implementations.sorting import bubble_sort, selection_sort, insertion_sort
from reference_implementations.searching import linear_search, binary_search


class TestSortingReferenceImpl:
    def _collect_tags(self, fn, data):
        events = []
        def _tag(tag_name, **kwargs):
            events.append({"tag": tag_name, **kwargs})
        fn(data, _tag)
        return events

    def test_bubble_sort_starts_and_ends(self):
        tags = self._collect_tags(bubble_sort, [3, 1, 2])
        assert tags[0]["tag"] == "SORT_START"
        assert tags[-1]["tag"] == "SORT_END"

    def test_bubble_sort_has_compare_events(self):
        tags = self._collect_tags(bubble_sort, [3, 1, 2])
        compare_tags = [e for e in tags if e["tag"] == "SORT_COMPARE"]
        assert len(compare_tags) > 0
        assert "i" in compare_tags[0] and "j" in compare_tags[0]

    def test_bubble_sort_has_swap_on_unsorted(self):
        tags = self._collect_tags(bubble_sort, [3, 1, 2])
        swap_tags = [e for e in tags if e["tag"] == "SORT_SWAP"]
        assert len(swap_tags) > 0

    def test_bubble_sort_no_swap_on_sorted(self):
        tags = self._collect_tags(bubble_sort, [1, 2, 3])
        swap_tags = [e for e in tags if e["tag"] == "SORT_SWAP"]
        assert len(swap_tags) == 0

    def test_selection_sort_has_min_found(self):
        tags = self._collect_tags(selection_sort, [3, 1, 2])
        min_tags = [e for e in tags if e["tag"] == "SORT_MIN_FOUND"]
        assert len(min_tags) > 0
        assert "min_idx" in min_tags[0]

    def test_insertion_sort_has_insert(self):
        tags = self._collect_tags(insertion_sort, [3, 1, 2])
        insert_tags = [e for e in tags if e["tag"] == "SORT_INSERT"]
        assert len(insert_tags) > 0

    def test_sort_result_correct(self):
        """標準實作執行後 data 應已排序。"""
        for fn in [bubble_sort, selection_sort, insertion_sort]:
            data = [3, 1, 4, 1, 5]
            fn(data, lambda *a, **kw: None)
            assert data == sorted([3, 1, 4, 1, 5])


class TestSearchingReferenceImpl:
    def _collect_tags(self, fn, data, target):
        events = []
        def _tag(tag_name, **kwargs):
            events.append({"tag": tag_name, **kwargs})
        fn(data, target, _tag)
        return events

    def test_linear_search_starts_and_ends(self):
        tags = self._collect_tags(linear_search, [1, 2, 3], 2)
        assert tags[0]["tag"] == "SEARCH_START"
        assert tags[-1]["tag"] == "SEARCH_END"

    def test_linear_search_found(self):
        tags = self._collect_tags(linear_search, [1, 2, 3], 2)
        found_tags = [e for e in tags if e["tag"] == "SEARCH_FOUND"]
        assert len(found_tags) == 1
        assert found_tags[0]["i"] == 1

    def test_linear_search_not_found(self):
        tags = self._collect_tags(linear_search, [1, 2, 3], 9)
        assert any(e["tag"] == "SEARCH_NOT_FOUND" for e in tags)
        assert not any(e["tag"] == "SEARCH_FOUND" for e in tags)

    def test_linear_search_has_compare(self):
        tags = self._collect_tags(linear_search, [1, 2, 3], 2)
        compare_tags = [e for e in tags if e["tag"] == "SEARCH_COMPARE"]
        assert len(compare_tags) >= 1
        assert "i" in compare_tags[0] and "current" in compare_tags[0]

    def test_binary_search_found(self):
        tags = self._collect_tags(binary_search, [1, 2, 3, 4, 5], 3)
        found_tags = [e for e in tags if e["tag"] == "SEARCH_FOUND"]
        assert len(found_tags) == 1

    def test_binary_search_has_narrow(self):
        tags = self._collect_tags(binary_search, [1, 2, 3, 4, 5], 1)
        narrow_tags = [e for e in tags if e["tag"] == "SEARCH_NARROW"]
        assert len(narrow_tags) > 0
        first = narrow_tags[0]
        assert "low" in first and "high" in first and "mid" in first

    def test_binary_search_not_found(self):
        tags = self._collect_tags(binary_search, [1, 2, 3], 9)
        assert any(e["tag"] == "SEARCH_NOT_FOUND" for e in tags)


from template_tracer import run_reference_trace, TagEvent


class TestRunReferenceTrace:
    def test_returns_list_of_tag_events(self):
        events = run_reference_trace("bubble_sort", [3, 1, 2])
        assert isinstance(events, list)
        assert len(events) > 0
        assert isinstance(events[0], TagEvent)

    def test_first_tag_is_sort_start(self):
        events = run_reference_trace("bubble_sort", [3, 1, 2])
        assert events[0].tag == "SORT_START"

    def test_last_tag_is_sort_end(self):
        events = run_reference_trace("bubble_sort", [3, 1, 2])
        assert events[-1].tag == "SORT_END"

    def test_datasnapshot_is_deep_copy(self):
        """每個 TagEvent 的 dataSnapshot 應獨立，不共享同一 list。"""
        events = run_reference_trace("bubble_sort", [3, 1, 2])
        compare_snaps = [
            e.dataSnapshot for e in events if e.tag == "SORT_COMPARE"
        ]
        assert len(compare_snaps) >= 2
        assert compare_snaps[0] is not compare_snaps[1]

    def test_does_not_mutate_input(self):
        data = [3, 1, 2]
        original = data.copy()
        run_reference_trace("bubble_sort", data)
        assert data == original

    def test_searching_algo(self):
        events = run_reference_trace("linear_search", [1, 2, 3], target=2)
        assert events[0].tag == "SEARCH_START"
        assert any(e.tag == "SEARCH_FOUND" for e in events)

    def test_unknown_algo_returns_empty(self):
        events = run_reference_trace("unknown_algo", [1, 2, 3])
        assert events == []


from template_tracer import align_snapshots
from tracer import TraceEvent, run_trace


class TestAlignSnapshots:
    def _make_ref_trace(self, n_tags: int):
        """產生 n 個 TagEvent，dataSnapshot 為標準資料（待被替換）。"""
        return [TagEvent(tag=f"TAG_{i}", dataSnapshot=[99, 99]) for i in range(n_tags)]

    def _make_user_raw(self, snapshots: list) -> list:
        """建構 user raw trace，local_vars 的 value 為 repr 字串（符合 tracer.py 格式）。"""
        return [
            TraceEvent(tag="LINE", local_vars={"arr": repr(snap)}, global_vars={}, dataSnapshot=[], meta={})
            for snap in snapshots
        ]

    def test_strategy_a_exact_length_match(self):
        """用戶快照數量與 ref_trace 完全一致 → 策略 A 直接對齊。"""
        ref_trace = self._make_ref_trace(3)
        user_snapshots_source = [[3, 1, 2], [1, 3, 2], [1, 2, 3]]
        user_raw = self._make_user_raw(user_snapshots_source)

        result = align_snapshots(ref_trace, user_raw)
        assert result is not None
        aligned, raw_index_map = result
        assert aligned[0].dataSnapshot == [3, 1, 2]
        assert aligned[1].dataSnapshot == [1, 3, 2]
        assert aligned[2].dataSnapshot == [1, 2, 3]
        assert len(raw_index_map) == 3

    def test_strategy_b_state_match(self):
        """用戶快照數量不一致，但狀態能比對 → 策略 B。"""
        ref_trace = [
            TagEvent(tag="SORT_COMPARE", dataSnapshot=[3, 1, 2]),
            TagEvent(tag="SORT_SWAP",    dataSnapshot=[1, 3, 2]),
            TagEvent(tag="SORT_COMPARE", dataSnapshot=[1, 3, 2]),
            TagEvent(tag="SORT_END",     dataSnapshot=[1, 2, 3]),
        ]
        # 用戶多一個快照（5 個），策略 A 失敗
        user_snaps = [[3, 1, 2], [3, 1, 2], [1, 3, 2], [1, 3, 2], [1, 2, 3]]
        user_raw = self._make_user_raw(user_snaps)
        result = align_snapshots(ref_trace, user_raw)
        assert result is not None
        aligned, raw_index_map = result
        swap_event = next(e for e in aligned if e.tag == "SORT_SWAP")
        assert swap_event.dataSnapshot == [1, 3, 2]

    def test_returns_none_on_insufficient_snapshots(self):
        """用戶 trace 完全沒有 list 快照 → None。"""
        ref_trace = self._make_ref_trace(5)
        user_raw = [
            TraceEvent(tag="LINE", local_vars={"x": "1"}, global_vars={}, dataSnapshot=[], meta={})
        ]
        result = align_snapshots(ref_trace, user_raw)
        assert result is None

    def test_returns_none_on_low_match_rate(self):
        """策略 B 匹配率 < 80% → None。"""
        ref_trace = [
            TagEvent(tag=f"TAG_{i}", dataSnapshot=[i, i + 1]) for i in range(10)
        ]
        # 用戶快照與 ref 完全不同，策略 B 會失敗
        user_raw = self._make_user_raw([[100 + i] for i in range(7)])
        result = align_snapshots(ref_trace, user_raw)
        assert result is None


from template_tracer import build_level1_trace

BUBBLE_SORT_USER_CODE = """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

result = bubble_sort([3, 1, 2])
"""

LINEAR_SEARCH_USER_CODE = """
def linear_search(data, target):
    for i in range(len(data)):
        if data[i] == target:
            return i
    return -1

result = linear_search([1, 2, 3], 2)
"""


class TestBuildLevel1Trace:
    def test_returns_trace_event_list(self):
        raw = run_trace(BUBBLE_SORT_USER_CODE)
        result = build_level1_trace("bubble_sort", raw.trace, [3, 1, 2])
        assert result is not None
        events, raw_index_map = result
        assert isinstance(events, list)
        assert len(events) > 0
        assert isinstance(raw_index_map, list)

    def test_trace_events_have_semantic_tags(self):
        raw = run_trace(BUBBLE_SORT_USER_CODE)
        result = build_level1_trace("bubble_sort", raw.trace, [3, 1, 2])
        assert result is not None
        events, _ = result
        tags = {e.tag for e in events}
        assert "SORT_COMPARE" in tags
        assert "SORT_START" in tags

    def test_trace_event_matches_frontend_contract(self):
        """每個 TraceEvent 必須有 tag, local_vars, global_vars, dataSnapshot。"""
        raw = run_trace(BUBBLE_SORT_USER_CODE)
        result = build_level1_trace("bubble_sort", raw.trace, [3, 1, 2])
        assert result is not None
        events, _ = result
        for event in events:
            assert hasattr(event, "tag")
            assert hasattr(event, "local_vars")
            assert hasattr(event, "global_vars")
            assert hasattr(event, "dataSnapshot")

    def test_returns_none_for_unsupported_algo(self):
        raw = run_trace(BUBBLE_SORT_USER_CODE)
        result = build_level1_trace("unknown_algo", raw.trace, [3, 1, 2])
        assert result is None

    def test_returns_none_for_empty_input_data(self):
        raw = run_trace(BUBBLE_SORT_USER_CODE)
        result = build_level1_trace("bubble_sort", raw.trace, [])
        assert result is None

    def test_never_raises(self):
        """build_level1_trace 永遠不 raise，即使輸入是垃圾。"""
        try:
            result = build_level1_trace("bubble_sort", [], None)
            assert result is None
        except Exception as exc:
            assert False, f"build_level1_trace raised: {exc}"

    def test_linear_search_level1(self):
        raw = run_trace(LINEAR_SEARCH_USER_CODE)
        result = build_level1_trace("linear_search", raw.trace, [1, 2, 3], target=2)
        assert result is not None
        events, _ = result
        tags = {e.tag for e in events}
        assert "SEARCH_COMPARE" in tags

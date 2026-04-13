import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "services"))

from reference_implementations.sorting import bubble_sort, selection_sort, insertion_sort


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

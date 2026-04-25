import numpy as np
import pytest
from services.algo_identification.similarity import find_top_match, apply_threshold, THRESHOLD


def _unit(v: list[float]) -> np.ndarray:
    a = np.array(v, dtype=np.float32)
    return a / np.linalg.norm(a)


def test_find_top_match_returns_correct_label():
    ref = np.stack([_unit([1, 0, 0]), _unit([0, 1, 0]), _unit([0, 0, 1])])
    labels = ["A", "B", "C"]
    user = _unit([0.1, 0.9, 0.05])
    label, score = find_top_match(user, ref, labels)
    assert label == "B"
    assert score > 0.9


def test_find_top_match_same_label_multiple_refs_takes_max():
    ref = np.stack([_unit([1, 0, 0]), _unit([0.9, 0.1, 0]), _unit([0, 1, 0])])
    labels = ["A", "A", "B"]
    user = _unit([0.95, 0.05, 0])
    label, score = find_top_match(user, ref, labels)
    assert label == "A"


def test_apply_threshold_below_returns_none():
    label, score = apply_threshold("bubble_sort", THRESHOLD - 0.01)
    assert label is None
    assert score == pytest.approx(THRESHOLD - 0.01)


def test_apply_threshold_at_threshold_returns_label():
    label, score = apply_threshold("bubble_sort", THRESHOLD)
    assert label == "bubble_sort"
    assert score == pytest.approx(THRESHOLD)


def test_apply_threshold_above_returns_label():
    label, score = apply_threshold("insertion_sort", 0.8)
    assert label == "insertion_sort"

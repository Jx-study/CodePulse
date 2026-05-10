"""
Integration tests for route_level1_decision().
These mock algo_identify so they don't require the real MiniLM model.
"""
from unittest.mock import patch, MagicMock

import pytest

from services.algo_identification import IdentifyResult
from services.analysis_runner import route_level1_decision


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


# ─── HTTP integration tests (require Flask test client) ──────────────────────

import hashlib
from services.code_normalizer import normalize_code


def _authed(client, auth_headers, method, path, **kwargs):
    token = auth_headers['access_token']
    client.set_cookie('access_token', token)
    fn = getattr(client, method)
    resp = fn(path, **kwargs)
    client.delete_cookie('access_token')
    return resp


class TestExploreHistoryHash:
    def test_history_record_has_code_hash(self, client, app, auth_headers):
        """GET /api/explore/history 每筆記錄都有 code_hash"""
        from models.explorer import ExploreHistory, AnalysisSource
        from database import db

        with app.app_context():
            record = ExploreHistory(
                explore_id=1,
                user_id=1,
                user_code="def foo():\n    # comment\n    return 1\n",
                detected_algorithm="linear_search",
                confidence_score=0.9,
                time_complexity="O(n)",
                analysis_source=AnalysisSource.ast_bigO,
            )
            db.session.add(record)
            db.session.commit()

        res = _authed(client, auth_headers, 'get', '/api/explore/history')
        assert res.status_code == 200
        data = res.get_json()
        assert len(data) == 1
        assert "code_hash" in data[0]
        expected = hashlib.sha256(
            normalize_code("def foo():\n    # comment\n    return 1\n").encode()
        ).hexdigest()
        assert data[0]["code_hash"] == expected


class TestDuplicateDetection:
    def test_submit_with_matching_hash_returns_duplicate(self, client, app, auth_headers):
        """送出 last_code_hash 與 normalized code 的 hash 相符 → 回傳 duplicate=true"""
        code = "def foo():\n    return 1\n"
        code_with_comment = "def foo():\n    # added comment\n    return 1\n"
        expected_hash = hashlib.sha256(normalize_code(code).encode()).hexdigest()

        res = _authed(
            client, auth_headers, 'post', '/api/analyze/submit',
            json={"code": code_with_comment, "last_code_hash": expected_hash},
        )
        assert res.status_code == 200
        data = res.get_json()
        assert data.get("duplicate") is True

    def test_submit_with_non_matching_hash_proceeds_normally(self, client, app, auth_headers):
        """last_code_hash 不符 → 正常建立 task"""
        res = _authed(
            client, auth_headers, 'post', '/api/analyze/submit',
            json={"code": "x = 1\n", "last_code_hash": "deadbeef"},
        )
        assert res.status_code == 202
        assert "task_id" in res.get_json()

    def test_submit_without_hash_proceeds_normally(self, client, app, auth_headers):
        """不帶 last_code_hash → 正常建立 task"""
        res = _authed(
            client, auth_headers, 'post', '/api/analyze/submit',
            json={"code": "x = 1\n"},
        )
        assert res.status_code == 202
        assert "task_id" in res.get_json()

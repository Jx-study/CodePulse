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
        """送出與既有 history 相同的 normalized code → 回傳 duplicate=true"""
        from models.explorer import ExploreHistory, AnalysisSource
        from database import db

        code = "def foo():\n    return 1\n"
        code_with_comment = "def foo():\n    # added comment\n    return 1\n"
        with app.app_context():
            db.session.add(ExploreHistory(
                explore_id=11,
                user_id=1,
                user_code=code,
                detected_algorithm="linear_search",
                confidence_score=0.9,
                time_complexity="O(n)",
                analysis_source=AnalysisSource.ast_bigO,
            ))
            db.session.commit()

        res = _authed(
            client, auth_headers, 'post', '/api/analyze/submit',
            json={"code": code_with_comment},
        )
        assert res.status_code == 200
        data = res.get_json()
        assert data.get("duplicate") is True
        assert data["duplicate_record"]["id"] == 11
        assert data["duplicate_record"]["user_code"] == code

    def test_submit_matches_non_latest_history_returns_duplicate(self, client, app, auth_headers):
        """Duplicate detection checks all existing history, not only the latest record."""
        from models.explorer import ExploreHistory, AnalysisSource
        from database import db

        with app.app_context():
            db.session.add_all([
                ExploreHistory(
                    explore_id=21,
                    user_id=1,
                    user_code="x = 1\n",
                    detected_algorithm="linear_search",
                    confidence_score=0.9,
                    time_complexity="O(n)",
                    analysis_source=AnalysisSource.ast_bigO,
                ),
                ExploreHistory(
                    explore_id=22,
                    user_id=1,
                    user_code="def target():\n    return 42\n",
                    detected_algorithm="linear_search",
                    confidence_score=0.9,
                    time_complexity="O(n)",
                    analysis_source=AnalysisSource.ast_bigO,
                ),
            ])
            db.session.commit()

        res = _authed(
            client, auth_headers, 'post', '/api/analyze/submit',
            json={"code": "def target():\n    # old history match\n    return 42\n"},
        )
        assert res.status_code == 200
        data = res.get_json()
        assert data.get("duplicate") is True

    def test_submit_with_non_matching_hash_proceeds_normally(self, client, app, auth_headers):
        """history 沒有相同 code → 正常建立 task"""
        res = _authed(
            client, auth_headers, 'post', '/api/analyze/submit',
            json={"code": "unique_value_for_submit = 987654\n"},
        )
        assert res.status_code == 202
        assert "task_id" in res.get_json()

    def test_submit_without_hash_proceeds_normally(self, client, app, auth_headers):
        """沒有相同 history → 正常建立 task"""
        res = _authed(
            client, auth_headers, 'post', '/api/analyze/submit',
            json={"code": "another_unique_value_for_submit = 123456\n"},
        )
        assert res.status_code == 202
        assert "task_id" in res.get_json()

    def test_submit_forwards_save_history_false(self, client, auth_headers):
        """save_history=false should reach the task queue so quota skip does not persist."""
        with patch("routes.analyze.task_queue.submit", return_value="tid-save-skip") as mock_submit:
            res = _authed(
                client, auth_headers, 'post', '/api/analyze/submit',
                json={
                    "code": "unique_value_for_save_history_false = 424242\n",
                    "save_history": False,
                },
            )

        assert res.status_code == 202
        assert res.get_json()["task_id"] == "tid-save-skip"
        assert mock_submit.call_args.kwargs["save_history"] is False

    def test_submit_save_history_false_bypasses_duplicate_check(self, client, app, auth_headers):
        """save_history=false is an ad-hoc run and should not be blocked by history duplicates."""
        from models.explorer import ExploreHistory, AnalysisSource
        from database import db

        code = "def foo():\n    return 1\n"
        with app.app_context():
            db.session.add(ExploreHistory(
                explore_id=31,
                user_id=1,
                user_code=code,
                detected_algorithm="linear_search",
                confidence_score=0.9,
                time_complexity="O(n)",
                analysis_source=AnalysisSource.ast_bigO,
            ))
            db.session.commit()

        with patch("routes.analyze.task_queue.submit", return_value="tid-no-save") as mock_submit:
            res = _authed(
                client, auth_headers, 'post', '/api/analyze/submit',
                json={
                    "code": "def foo():\n    # duplicate, but no persistence requested\n    return 1\n",
                    "save_history": False,
                },
            )

        assert res.status_code == 202
        assert res.get_json()["task_id"] == "tid-no-save"
        assert mock_submit.call_args.kwargs["save_history"] is False


class TestHistoryQuota:
    def _fill_history(self, app, count=5):
        from models.explorer import ExploreHistory, AnalysisSource
        from database import db

        with app.app_context():
            db.session.add_all([
                ExploreHistory(
                    explore_id=100 + i,
                    user_id=1,
                    user_code=f"value_{i} = {i}\n",
                    detected_algorithm="linear_search",
                    confidence_score=0.9,
                    time_complexity="O(n)",
                    analysis_source=AnalysisSource.ast_bigO,
                )
                for i in range(count)
            ])
            db.session.commit()

    def test_submit_save_history_true_is_rejected_when_history_quota_full(self, client, app, auth_headers):
        self._fill_history(app)

        with patch("routes.analyze.task_queue.submit") as mock_submit:
            res = _authed(
                client, auth_headers, 'post', '/api/analyze/submit',
                json={"code": "new_unique_value = 999\n"},
            )

        assert res.status_code == 409
        assert res.get_json()["error"] == "history_quota_exceeded"
        mock_submit.assert_not_called()

    def test_submit_save_history_false_bypasses_history_quota(self, client, app, auth_headers):
        self._fill_history(app)

        with patch("routes.analyze.task_queue.submit", return_value="tid-quota-skip") as mock_submit:
            res = _authed(
                client, auth_headers, 'post', '/api/analyze/submit',
                json={"code": "new_unique_value = 1000\n", "save_history": False},
            )

        assert res.status_code == 202
        assert res.get_json()["task_id"] == "tid-quota-skip"
        assert mock_submit.call_args.kwargs["save_history"] is False

    def test_save_history_skips_persistence_when_history_quota_full(self, app):
        from models.explorer import ExploreHistory
        from services.algo_identification import IdentifyResult
        from services.analysis_runner import _save_history

        self._fill_history(app)
        identify_result = IdentifyResult(
            algo_name="linear_search",
            score=0.9,
            top_raw="linear_search",
            top3=[],
        )

        with app.app_context():
            _save_history(
                user_id=1,
                code="new_unique_value = 2000\n",
                identify_result=identify_result,
                final_complexity="O(1)",
                complexity_source="ast",
                gemini_summary=None,
                have_level1=False,
                execution_trace=[],
                is_truncated=False,
                raw_trace=[],
                raw_index_map=[],
                call_graph=None,
                cfg_graph={},
                stdout_events=[],
            )

            assert ExploreHistory.query.filter_by(user_id=1).count() == 5

    def test_save_history_skips_persistence_for_existing_normalized_code(self, app):
        from models.explorer import ExploreHistory, AnalysisSource
        from services.algo_identification import IdentifyResult
        from services.analysis_runner import _save_history
        from database import db

        existing_code = "def foo():\n    return 1\n"
        duplicate_code = "def foo():\n    # comment should normalize away\n    return 1\n"
        identify_result = IdentifyResult(
            algo_name="linear_search",
            score=0.9,
            top_raw="linear_search",
            top3=[],
        )

        with app.app_context():
            db.session.add(ExploreHistory(
                explore_id=160,
                user_id=1,
                user_code=existing_code,
                detected_algorithm="linear_search",
                confidence_score=0.9,
                time_complexity="O(n)",
                analysis_source=AnalysisSource.ast_bigO,
            ))
            db.session.commit()

            _save_history(
                user_id=1,
                code=duplicate_code,
                identify_result=identify_result,
                final_complexity="O(1)",
                complexity_source="ast",
                gemini_summary=None,
                have_level1=False,
                execution_trace=[],
                is_truncated=False,
                raw_trace=[],
                raw_index_map=[],
                call_graph=None,
                cfg_graph={},
                stdout_events=[],
            )

            records = ExploreHistory.query.filter_by(user_id=1).all()
            assert len(records) == 1
            assert records[0].user_code == existing_code


class TestAnalyzeResultAuth:
    def test_status_requires_login(self, client):
        with patch("routes.analyze.task_queue.get_status") as mock_get_status:
            res = client.get('/api/analyze/status/task-1')

        assert res.status_code == 401
        mock_get_status.assert_not_called()

    def test_status_rejects_task_owned_by_another_user(self, client, auth_headers):
        with patch("routes.analyze.task_queue.owns_task", return_value=False), \
             patch("routes.analyze.task_queue.get_status") as mock_get_status:
            res = _authed(client, auth_headers, 'get', '/api/analyze/status/task-2')

        assert res.status_code == 404
        mock_get_status.assert_not_called()

    def test_status_returns_owned_task(self, client, auth_headers):
        with patch("routes.analyze.task_queue.owns_task", return_value=True), \
             patch("routes.analyze.task_queue.get_status", return_value={
                 "status": "running",
                 "progress": {"stage": "sandbox", "message": "running"},
             }):
            res = _authed(client, auth_headers, 'get', '/api/analyze/status/task-3')

        assert res.status_code == 200
        assert res.get_json()["status"] == "running"

    def test_result_requires_login(self, client):
        with patch("routes.analyze.task_queue.get_task", return_value={
            "status": "completed",
            "result": {"user_code": "secret"},
            "error": None,
            "progress": None,
        }):
            res = client.get('/api/analyze/result/task-1')

        assert res.status_code == 401

    def test_result_rejects_task_owned_by_another_user(self, client, auth_headers):
        with patch("routes.analyze.task_queue.owns_task", return_value=False), \
             patch("routes.analyze.task_queue.get_task") as mock_get_task:
            res = _authed(client, auth_headers, 'get', '/api/analyze/result/task-2')

        assert res.status_code == 404
        mock_get_task.assert_not_called()

    def test_result_returns_owned_completed_task(self, client, auth_headers):
        with patch("routes.analyze.task_queue.owns_task", return_value=True), \
             patch("routes.analyze.task_queue.get_task", return_value={
                 "status": "completed",
                 "result": {"detected_algorithm": "bubble_sort"},
                 "error": None,
                 "progress": None,
             }):
            res = _authed(client, auth_headers, 'get', '/api/analyze/result/task-3')

        assert res.status_code == 200
        assert res.get_json() == {"detected_algorithm": "bubble_sort"}


class TestAnalyzeInputApi:
    def test_submit_input_pushes_value_for_waiting_task(self, client, auth_headers):
        with patch("routes.analyze.task_queue.owns_task", return_value=True), \
             patch("routes.analyze.task_queue.get_task", return_value={
                 "status": "running",
                 "result": None,
                 "error": None,
                 "progress": None,
             }), \
             patch("routes.analyze.task_queue.is_waiting_for_input", return_value=True), \
             patch("routes.analyze.task_queue.supports_live_input", True), \
             patch("routes.analyze.task_queue.submit_input") as mock_submit_input:
            res = _authed(
                client,
                auth_headers,
                "post",
                "/api/analyze/input/task-1",
                json={"value": "Ada"},
            )

        assert res.status_code == 202
        assert res.get_json()["status"] == "accepted"
        mock_submit_input.assert_called_once_with("task-1", "Ada")

    def test_submit_input_rejects_running_task_not_yet_waiting(self, client, auth_headers):
        with patch("routes.analyze.task_queue.owns_task", return_value=True), \
             patch("routes.analyze.task_queue.get_task", return_value={
                 "status": "running",
                 "result": None,
                 "error": None,
                 "progress": None,
             }), \
             patch("routes.analyze.task_queue.is_waiting_for_input", return_value=False), \
             patch("routes.analyze.task_queue.submit_input") as mock_submit_input:
            res = _authed(
                client,
                auth_headers,
                "post",
                "/api/analyze/input/task-running",
                json={"value": "Ada"},
            )

        assert res.status_code == 409
        mock_submit_input.assert_not_called()

    def test_submit_input_rejects_non_owned_task(self, client, auth_headers):
        with patch("routes.analyze.task_queue.owns_task", return_value=False):
            res = _authed(
                client,
                auth_headers,
                "post",
                "/api/analyze/input/task-2",
                json={"value": "Ada"},
            )

        assert res.status_code == 404

    def test_submit_input_rejects_completed_task(self, client, auth_headers):
        with patch("routes.analyze.task_queue.owns_task", return_value=True), \
             patch("routes.analyze.task_queue.get_task", return_value={
                 "status": "completed",
                 "result": {},
                 "error": None,
                 "progress": None,
             }), \
             patch("routes.analyze.task_queue.is_waiting_for_input", return_value=False), \
             patch("routes.analyze.task_queue.submit_input") as mock_submit_input:
            res = _authed(
                client,
                auth_headers,
                "post",
                "/api/analyze/input/task-3",
                json={"value": "Ada"},
            )

        assert res.status_code == 409
        mock_submit_input.assert_not_called()

    def test_submit_input_rejects_when_queue_lacks_live_input_support(self, client, auth_headers):
        """in-memory queue 不支援 live input；不能回誤導性的 202，要明確告知不支援。"""
        with patch("routes.analyze.task_queue.owns_task", return_value=True), \
             patch("routes.analyze.task_queue.get_task", return_value={
                 "status": "running",
                 "result": None,
                 "error": None,
                 "progress": None,
             }), \
             patch("routes.analyze.task_queue.is_waiting_for_input", return_value=True), \
             patch("routes.analyze.task_queue.supports_live_input", False), \
             patch("routes.analyze.task_queue.submit_input") as mock_submit_input:
            res = _authed(
                client,
                auth_headers,
                "post",
                "/api/analyze/input/task-no-live",
                json={"value": "Ada"},
            )

        assert res.status_code == 501
        mock_submit_input.assert_not_called()

    def test_cancel_wakes_owned_task(self, client, auth_headers):
        with patch("routes.analyze.task_queue.owns_task", return_value=True), \
             patch("routes.analyze.task_queue.cancel_task") as mock_cancel:
            res = _authed(
                client,
                auth_headers,
                "post",
                "/api/analyze/cancel/task-4",
                json={},
            )

        assert res.status_code == 202
        mock_cancel.assert_called_once_with("task-4")

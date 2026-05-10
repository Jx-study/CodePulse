import os
os.environ["USE_CELERY"] = "1"
os.environ["CELERY_TASK_ALWAYS_EAGER"] = "1"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"

from unittest.mock import patch, MagicMock
import pytest
from services.task_queue_celery import CeleryTaskQueue


def make_queue():
    return CeleryTaskQueue()


def test_submit_returns_task_id():
    q = make_queue()
    with patch("services.analysis_runner.run_analysis_task") as mock_task:
        mock_result = MagicMock()
        mock_result.id = "test-task-id-123"
        mock_task.apply_async.return_value = mock_result
        task_id = q.submit("code", "wrapped")
    assert task_id == "test-task-id-123"
    mock_task.apply_async.assert_called_once_with(
        args=("code", "wrapped"),
        kwargs={"user_id": None, "save_history": True},
    )


def test_submit_forwards_save_history_false_as_task_kwarg():
    q = make_queue()
    with patch("services.analysis_runner.run_analysis_task") as mock_task:
        mock_result = MagicMock()
        mock_result.id = "test-task-id-456"
        mock_task.apply_async.return_value = mock_result
        task_id = q.submit("code", "wrapped", user_id=7, save_history=False)
    assert task_id == "test-task-id-456"
    mock_task.apply_async.assert_called_once_with(
        args=("code", "wrapped"),
        kwargs={"user_id": 7, "save_history": False},
    )


def test_update_progress_writes_to_redis():
    import json
    q = make_queue()
    with patch.object(q._redis, "hset") as mock_hset, \
         patch.object(q._redis, "expire") as mock_expire, \
         patch.object(q._redis, "publish") as mock_publish:
        q.update_progress("tid-1", "sandbox", "執行中")
        mock_hset.assert_called_once_with(
            "task:tid-1:progress", mapping={"stage": "sandbox", "message": "執行中"}
        )
        mock_expire.assert_called_once_with("task:tid-1:progress", 300)
        channel, payload = mock_publish.call_args.args
        assert channel == "task:tid-1:events"
        assert json.loads(payload) == {"stage": "sandbox", "message": "執行中", "status": "running"}


def test_update_progress_done_does_not_publish_terminal_completed():
    import json
    q = make_queue()
    with patch.object(q._redis, "hset"), \
         patch.object(q._redis, "expire"), \
         patch.object(q._redis, "publish") as mock_publish:
        q.update_progress("tid-1", "done", "Done")

    _, payload = mock_publish.call_args.args
    assert json.loads(payload) == {"stage": "done", "message": "Done", "status": "running"}


def test_get_status_pending():
    q = make_queue()
    with patch("services.task_queue_celery.AsyncResult") as mock_ar:
        mock_ar.return_value.state = "PENDING"
        result = q.get_status("some-id")
    assert result["status"] == "pending"
    assert result["progress"] is None


def test_get_status_running_with_progress():
    q = make_queue()
    with patch("services.task_queue_celery.AsyncResult") as mock_ar, \
         patch.object(q._redis, "hgetall", return_value={"stage": "sandbox", "message": "執行中"}):
        mock_ar.return_value.state = "STARTED"
        result = q.get_status("some-id")
    assert result["status"] == "running"
    assert result["progress"] == {"stage": "sandbox", "message": "執行中"}


def test_get_status_none_for_unknown_id():
    q = make_queue()
    with patch("services.task_queue_celery.AsyncResult") as mock_ar:
        mock_ar.return_value.state = "PENDING"
        result = q.get_status("nonexistent-id")
    assert result is not None  # Celery 對不存在的 id 也回 PENDING


def test_get_task_completed():
    q = make_queue()
    expected_result = {"detected_algorithm": "bubble_sort"}
    with patch("services.task_queue_celery.AsyncResult") as mock_ar:
        mock_ar.return_value.state = "SUCCESS"
        mock_ar.return_value.result = expected_result
        task = q.get_task("some-id")
    assert task["status"] == "completed"
    assert task["result"] == expected_result


def test_get_task_failed():
    q = make_queue()
    with patch("services.task_queue_celery.AsyncResult") as mock_ar:
        mock_ar.return_value.state = "FAILURE"
        mock_ar.return_value.result = RuntimeError("timeout")
        task = q.get_task("some-id")
    assert task["status"] == "failed"
    assert "timeout" in task["error"]


# ---------------------------------------------------------------------------
# Eager-mode integration tests — CELERY_TASK_ALWAYS_EAGER=1
#
# These tests let run_analysis_task.delay() execute synchronously via Celery
# eager mode, only patching out heavy I/O (sandbox, ML models, Gemini).
# This exercises the real submit → task execution → get_status/get_task path.
#
# Required Celery config for testability:
#   task_always_eager=True        — tasks run inline
#   task_store_eager_result=True  — result is written to backend so AsyncResult lookup works
#   result_backend='cache'        — in-process memory backend, no Redis needed
#   cache_backend='memory'
# ---------------------------------------------------------------------------

_FAKE_SANDBOX_OK = {
    "trace": [
        {
            "tag": "CALL",
            "local_vars": {"arr": "[1, 2, 3]"},
            "global_vars": {},
            "dataSnapshot": [1, 2, 3],
            "meta": {},
        }
    ],
    "call_graph": None,
    "cfg_graph": {},
    "is_truncated": False,
    "stdout_events": [],
}

_FAKE_SANDBOX_ERROR = {"error": "NameError: name 'x' is not defined", "lineno": 1}

_SIMPLE_CODE = "def sort(arr):\n    return sorted(arr)"
_SIMPLE_WRAPPED = _SIMPLE_CODE


@pytest.fixture(autouse=False)
def eager_celery_backend():
    """Switch Celery to an in-memory CacheBackend for the duration of the test.

    Two things must happen for AsyncResult(task_id) to work without a live Redis:
    1. celery_app._backend  →  CacheBackend (in-process memory store).
    2. task.store_eager_result = True  on the concrete task object, because
       build_tracer reads this attribute directly at execution time, not from
       celery_app.conf.task_store_eager_result.
    """
    from celery_app import celery_app
    from celery.backends.cache import CacheBackend
    from services.analysis_runner import run_analysis_task

    original_backend = celery_app.backend  # forces lazy init before swap
    original_task_store = run_analysis_task.store_eager_result
    original_conf_store = celery_app.conf.task_store_eager_result

    mem_backend = CacheBackend(app=celery_app, backend="memory")
    celery_app._backend = mem_backend
    run_analysis_task.store_eager_result = True
    celery_app.conf.task_store_eager_result = True

    yield celery_app

    celery_app._backend = original_backend
    run_analysis_task.store_eager_result = original_task_store
    celery_app.conf.task_store_eager_result = original_conf_store


@pytest.fixture()
def eager_queue(eager_celery_backend):
    """CeleryTaskQueue whose Redis calls are stubbed except for AsyncResult lookup.

    The module-level task_queue singleton used inside _run_analysis also needs
    its update_progress stubbed — it is the same object imported via
    services.task_queue (USE_CELERY=1 re-exports task_queue_celery.task_queue).
    """
    q = make_queue()
    with patch.object(q._redis, "hset"), \
         patch.object(q._redis, "expire"), \
         patch.object(q._redis, "hgetall", return_value={}), \
         patch("services.analysis_runner.task_queue.update_progress"):
        yield q


def _io_patches(sandbox_result=_FAKE_SANDBOX_OK):
    """Patch all heavy I/O in analysis_runner, leaving business logic intact."""
    from services.algo_identification import IdentifyResult
    from services.gemini_analysis.result import GeminiAnalysisResult

    fake_identify = IdentifyResult(algo_name=None, score=0.0, top_raw="")
    fake_gemini = GeminiAnalysisResult(
        detected_algorithm=None,
        time_complexity=None,
        summary=None,
        is_fallback=True,
        fallback_reason="test",
    )
    return [
        patch("services.analysis_runner.run_in_sandbox", return_value=sandbox_result),
        patch("services.analysis_runner.analyze_complexity", return_value="O(n log n)"),
        patch("services.analysis_runner.measure_step_counts", return_value="O(n log n)"),
        patch("services.analysis_runner.generate_bigo_wrapper", return_value=None),
        patch("services.analysis_runner.algo_identify", return_value=fake_identify),
        patch("services.analysis_runner.gemini_analyze", return_value=fake_gemini),
        patch("services.analysis_runner.log_divergence"),
    ]


def test_eager_submit_returns_non_empty_task_id(eager_queue):
    with _io_patches()[0], _io_patches()[1], _io_patches()[2], _io_patches()[3], \
         _io_patches()[4], _io_patches()[5], _io_patches()[6]:
        task_id = eager_queue.submit(_SIMPLE_CODE, _SIMPLE_WRAPPED)
    assert isinstance(task_id, str)
    assert task_id


def test_eager_get_status_completed_after_submit(eager_queue):
    # Task runs synchronously via eager mode; AsyncResult lookup must return SUCCESS.
    patches = _io_patches()
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5], patches[6]:
        task_id = eager_queue.submit(_SIMPLE_CODE, _SIMPLE_WRAPPED)
    status = eager_queue.get_status(task_id)
    assert status["status"] == "completed"


def test_eager_get_task_completed_returns_result_dict(eager_queue):
    patches = _io_patches()
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5], patches[6]:
        task_id = eager_queue.submit(_SIMPLE_CODE, _SIMPLE_WRAPPED)
    task = eager_queue.get_task(task_id)
    assert task["status"] == "completed"
    assert task["error"] is None
    assert isinstance(task["result"], dict)
    assert "detected_algorithm" in task["result"]
    assert "execution_trace" in task["result"]


def test_eager_submit_save_history_false_skips_persistence(eager_queue):
    patches = _io_patches()
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5], patches[6], \
         patch("services.analysis_runner._save_history") as mock_save_history:
        task_id = eager_queue.submit(_SIMPLE_CODE, _SIMPLE_WRAPPED, user_id=1, save_history=False)

    task = eager_queue.get_task(task_id)
    assert task["status"] == "completed"
    mock_save_history.assert_not_called()


def test_eager_get_task_failed_when_sandbox_errors(eager_queue):
    # Sandbox returns an error dict → _run_analysis raises → Celery stores FAILURE.
    patches = _io_patches(sandbox_result=_FAKE_SANDBOX_ERROR)
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5], patches[6]:
        task_id = eager_queue.submit(_SIMPLE_CODE, _SIMPLE_WRAPPED)
    task = eager_queue.get_task(task_id)
    assert task["status"] == "failed"
    assert task["error"] is not None

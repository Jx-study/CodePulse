"""
test_task_queue_memory.py — in-memory TaskQueue 的 input_needed 行為（Task 5：D1 / D13）

聚焦 _run() 的 except InputNeededSignal 分支與 stream_progress 的 terminal 處理，
不依賴 Redis / Docker，純 in-process 邏輯。
"""
import os
os.environ["USE_CELERY"] = "0"
os.environ.setdefault("SANDBOX_CONTAINER", "1")

import sys
SERVICES_PATH = os.path.join(os.path.dirname(__file__), "..", "services")
sys.path.insert(0, SERVICES_PATH)

from unittest.mock import patch

import pytest

from services.task_queue_memory import TaskQueue
from services.task_queue import (
    STATUS_INPUT_NEEDED,
    STATUS_COMPLETED,
    STATUS_FAILED,
)
from services.analysis_runner import InputNeededSignal


@pytest.fixture
def queue():
    return TaskQueue()


def _run_sync(q, task_id, fn):
    """直接呼叫 _run（繞過 ThreadPoolExecutor），讓斷言能同步觀察結果。"""
    with q._lock:
        q._tasks[task_id] = {
            "status": "pending",
            "progress": None,
            "result": None,
            "error": None,
            "user_id": None,
            "created_at": __import__("datetime").datetime.now(
                __import__("datetime").timezone.utc
            ),
        }
        import queue as _q
        q._queues[task_id] = _q.SimpleQueue()
    # app_context 在 _run 內被取用，patch 掉避免依賴完整 Flask app
    with patch("app.app"):
        q._run(task_id, fn, args=(), kwargs={})


def test_input_needed_signal_sets_status_and_meta(queue):
    """worker 拋 InputNeededSignal → 狀態為 INPUT_NEEDED，且存下 prompt / input_index。"""
    def fn(task_id):
        raise InputNeededSignal(prompt="age: ", input_index=1)

    _run_sync(queue, "t-input", fn)

    task = queue._tasks["t-input"]
    assert task["status"] == STATUS_INPUT_NEEDED
    assert task["input_needed"] == {"prompt": "age: ", "input_index": 1}
    # 不應被誤標成 completed / failed
    assert task["status"] not in (STATUS_COMPLETED, STATUS_FAILED)


def test_input_needed_stream_emits_terminal_event_when_late_connect(queue):
    """task 已處於 input_needed 後才連 SSE：stream_progress 應直接 yield 終止事件。"""
    def fn(task_id):
        raise InputNeededSignal(prompt="name: ", input_index=0)

    _run_sync(queue, "t-late", fn)
    # _run 結束後 queue 已被 pop，模擬「晚連」情境（走 line 99 early terminal guard）
    events = list(queue.stream_progress("t-late"))

    assert len(events) == 1
    assert events[0] == {
        "stage": "done",
        "status": "input_needed",
        "prompt": "name: ",
        "input_index": 0,
    }


def test_normal_completion_still_sets_completed(queue):
    """回歸：正常 return 仍標記 completed，不受 input_needed 分支影響。"""
    def fn(task_id):
        return {"ok": True}

    _run_sync(queue, "t-ok", fn)
    assert queue._tasks["t-ok"]["status"] == STATUS_COMPLETED
    assert queue._tasks["t-ok"]["result"] == {"ok": True}


def test_worker_exception_still_sets_failed(queue):
    """回歸：一般例外仍標記 failed。"""
    def fn(task_id):
        raise RuntimeError("boom")

    _run_sync(queue, "t-fail", fn)
    assert queue._tasks["t-fail"]["status"] == STATUS_FAILED
    assert "boom" in queue._tasks["t-fail"]["error"]

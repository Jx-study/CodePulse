import os
os.environ["USE_CELERY"] = "1"
os.environ["CELERY_TASK_ALWAYS_EAGER"] = "1"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"

from unittest.mock import patch, MagicMock
from services.task_queue_celery import CeleryTaskQueue


def make_queue():
    return CeleryTaskQueue()


def test_submit_returns_task_id():
    q = make_queue()
    with patch("services.analysis_runner.run_analysis_task") as mock_task:
        mock_result = MagicMock()
        mock_result.id = "test-task-id-123"
        mock_task.delay.return_value = mock_result
        task_id = q.submit(mock_task, "code", "wrapped")
    assert task_id == "test-task-id-123"


def test_update_progress_writes_to_redis():
    q = make_queue()
    with patch.object(q._redis, "hset") as mock_hset, \
         patch.object(q._redis, "expire") as mock_expire:
        q.update_progress("tid-1", "sandbox", "執行中")
        mock_hset.assert_called_once_with(
            "task:tid-1:progress", mapping={"stage": "sandbox", "message": "執行中"}
        )
        mock_expire.assert_called_once_with("task:tid-1:progress", 300)


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

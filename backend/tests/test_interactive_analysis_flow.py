from unittest.mock import patch

import pytest

from services import analysis_runner


def test_resolve_interactive_sandbox_publishes_input_and_sends_value():
    first = {
        "status": "input_needed",
        "session_id": "session-1",
        "prompt": "Name: ",
        "input_index": 0,
    }
    completed = {
        "status": "completed",
        "result": {"trace": [], "stdout_events": [{"text": "Name: Ada"}]},
    }

    with patch.object(analysis_runner.task_queue, "mark_waiting_for_input") as mock_mark_waiting, \
         patch.object(analysis_runner.task_queue, "publish_event") as mock_publish, \
         patch("services.analysis_runner._wait_for_user_input", return_value="Ada") as mock_wait, \
         patch("services.analysis_runner.send_input", return_value=completed) as mock_send, \
         patch("services.analysis_runner._cleanup_interactive_session") as mock_cleanup:
        result = analysis_runner._resolve_interactive_sandbox("task-1", first)

    assert result == completed["result"]
    mock_mark_waiting.assert_called_once_with("task-1", "session-1")
    mock_publish.assert_called_once_with("task-1", {
        "stage": "done",
        "status": "input_needed",
        "type": "input_needed",
        "task_id": "task-1",
        "prompt": "Name: ",
        "input_index": 0,
    })
    mock_wait.assert_called_once_with("task-1", "session-1")
    mock_send.assert_called_once_with("session-1", "Ada")
    mock_cleanup.assert_called_once_with("task-1", "session-1")


def test_wait_for_user_input_heartbeats_sidecar_when_no_input(monkeypatch):
    class FakeRedis:
        def __init__(self):
            self.calls = 0

        def expire(self, *_args):
            pass

        def blpop(self, _key, timeout):
            self.calls += 1
            if self.calls == 1:
                return None
            return ("analyze:input:task-1", "Ada")

    fake_redis = FakeRedis()
    monkeypatch.setattr(analysis_runner, "INPUT_WAIT_TIMEOUT_SECONDS", 30)
    monkeypatch.setattr(analysis_runner, "INPUT_HEARTBEAT_SECONDS", 10)

    with patch("services.analysis_runner._redis_client", return_value=fake_redis), \
         patch("services.analysis_runner.check_session_alive", return_value=True) as mock_alive:
        value = analysis_runner._wait_for_user_input("task-1", "session-1")

    assert value == "Ada"
    assert fake_redis.calls == 2
    mock_alive.assert_called_once_with("session-1")


def test_wait_for_user_input_raises_when_session_disappears(monkeypatch):
    class FakeRedis:
        def expire(self, *_args):
            pass

        def blpop(self, _key, timeout):
            return None

    monkeypatch.setattr(analysis_runner, "INPUT_WAIT_TIMEOUT_SECONDS", 30)
    monkeypatch.setattr(analysis_runner, "INPUT_HEARTBEAT_SECONDS", 10)

    with patch("services.analysis_runner._redis_client", return_value=FakeRedis()), \
         patch("services.analysis_runner.check_session_alive", return_value=False):
        with pytest.raises(RuntimeError, match="sandbox session lost"):
            analysis_runner._wait_for_user_input("task-1", "session-1")


def test_resolve_interactive_sandbox_returns_timeout_result():
    first = {
        "status": "input_needed",
        "session_id": "session-1",
        "prompt": "Name: ",
        "input_index": 0,
    }

    with patch.object(analysis_runner.task_queue, "mark_waiting_for_input"), \
         patch.object(analysis_runner.task_queue, "publish_event"), \
         patch("services.analysis_runner._wait_for_user_input", side_effect=analysis_runner.InteractiveInputTimeout()), \
         patch("services.analysis_runner._cleanup_interactive_session"):
        result = analysis_runner._resolve_interactive_sandbox("task-1", first)

    assert result["error"] == "timeout"
    assert result["is_truncated"] is True


def test_resolve_interactive_sandbox_returns_cancelled_result():
    first = {
        "status": "input_needed",
        "session_id": "session-1",
        "prompt": "Name: ",
        "input_index": 0,
    }

    with patch.object(analysis_runner.task_queue, "mark_waiting_for_input"), \
         patch.object(analysis_runner.task_queue, "publish_event"), \
         patch("services.analysis_runner._wait_for_user_input", side_effect=analysis_runner.InteractiveInputCancelled()), \
         patch("services.analysis_runner._cleanup_interactive_session"):
        result = analysis_runner._resolve_interactive_sandbox("task-1", first)

    assert result["error"] == "cancelled"
    assert result["is_truncated"] is False

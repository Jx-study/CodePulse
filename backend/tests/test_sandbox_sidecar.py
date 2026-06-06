"""
test_sandbox_sidecar.py — sandbox_sidecar/app.py 單元測試

測試策略：
- 用 unittest.mock.patch 模擬 subprocess.run 和 ContainerPool，避免真實 Docker 依賴
- 聚焦在 /run endpoint 的邏輯：參數解析、n 注入、timeout 覆蓋、錯誤處理
"""

import base64
import json
import sys
import os
import subprocess
import io

import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "sandbox_sidecar"))

from sandbox_sidecar.app import app, CONTAINER_TIMEOUT


SIMPLE_CODE = "def add(a, b):\n    return a + b\n"

VALID_STDOUT = json.dumps({
    "trace": [],
    "call_graph": None,
    "cfg_graph": {},
    "is_truncated": False,
    "step_count": 0,
})

EVENT_PREFIX = "__CODEPULSE_EVENT__"


def _make_completed_proc(stdout=VALID_STDOUT, returncode=0, stderr=""):
    proc = MagicMock()
    proc.stdout = stdout
    proc.returncode = returncode
    proc.stderr = stderr
    return proc


def _make_result_popen(payload=None):
    return FakePopen([
        {"type": "result", "payload": payload if payload is not None else json.loads(VALID_STDOUT)}
    ])


def _make_container(container_id="test-container-abc"):
    container = MagicMock()
    container.id = container_id
    return container


class FakePopen:
    def __init__(self, stdout_lines: list[dict]):
        self.stdout = io.StringIO(
            "".join(EVENT_PREFIX + json.dumps(line) + "\n" for line in stdout_lines)
        )
        self.stderr = io.StringIO("")
        self.stdin = io.StringIO()
        self.returncode = None
        self.killed = False

    def poll(self):
        return self.returncode

    def wait(self, timeout=None):
        self.returncode = 0
        return 0

    def kill(self):
        self.killed = True
        self.returncode = -9


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


@pytest.fixture(autouse=True)
def mock_pool():
    """Patch _get_pool for every test so no real ContainerPool is created."""
    pool = MagicMock()
    pool.acquire.return_value = _make_container()
    with patch("sandbox_sidecar.app._get_pool", return_value=pool):
        yield pool


class TestRunEndpointBasics:
    def test_missing_code_returns_400(self, client):
        resp = client.post("/run", json={})
        assert resp.status_code == 400

    def test_success_returns_sandbox_result(self, client):
        with patch("sandbox_sidecar.app.subprocess.Popen", return_value=_make_result_popen()):
            resp = client.post("/run", json={"code": SIMPLE_CODE})
        assert resp.status_code == 200
        assert "trace" in resp.get_json()

    def test_passes_code_as_base64_env_var(self, client):
        with patch("sandbox_sidecar.app.subprocess.Popen", return_value=_make_result_popen()) as mock_popen:
            client.post("/run", json={"code": SIMPLE_CODE})
        cmd = mock_popen.call_args.args[0]
        env_idx = cmd.index("-e")
        env_val = cmd[env_idx + 1]
        assert env_val.startswith("CODE=")
        decoded = base64.b64decode(env_val[len("CODE="):]).decode()
        assert decoded == SIMPLE_CODE

    def test_docker_exec_command_format(self, client):
        container_id = "test-container-abc"
        with patch("sandbox_sidecar.app.subprocess.Popen", return_value=_make_result_popen()) as mock_popen:
            client.post("/run", json={"code": SIMPLE_CODE})
        cmd = mock_popen.call_args.args[0]
        assert cmd[0] == "docker"
        assert cmd[1] == "exec"
        assert "-i" in cmd
        assert "-e" in cmd
        assert container_id in cmd
        assert "python" in cmd
        assert "/sandbox/runner.py" in cmd


class TestRunEndpointNInjection:
    """Task 4 新行為：n / per_n_timeout"""

    def test_n_appends_explore_wrapper_call(self, client):
        """n 不為 None 時，code 末尾應追加 explore_wrapper(n)"""
        with patch("sandbox_sidecar.app.subprocess.Popen", return_value=_make_result_popen()) as mock_popen:
            client.post("/run", json={"code": SIMPLE_CODE, "n": 100})
        cmd = mock_popen.call_args.args[0]
        env_idx = cmd.index("-e")
        env_val = cmd[env_idx + 1]
        decoded = base64.b64decode(env_val[len("CODE="):]).decode()
        assert decoded.endswith("explore_wrapper(100)")
        assert SIMPLE_CODE in decoded

    def test_n_none_does_not_modify_code(self, client):
        with patch("sandbox_sidecar.app.subprocess.Popen", return_value=_make_result_popen()) as mock_popen:
            client.post("/run", json={"code": SIMPLE_CODE, "n": None})
        cmd = mock_popen.call_args.args[0]
        env_idx = cmd.index("-e")
        env_val = cmd[env_idx + 1]
        decoded = base64.b64decode(env_val[len("CODE="):]).decode()
        assert decoded == SIMPLE_CODE

    def test_per_n_timeout_overrides_default(self, client):
        with patch("sandbox_sidecar.app.subprocess.Popen", return_value=_make_result_popen()):
            with patch("sandbox_sidecar.app._wait_for_control_event", return_value={"type": "result", "payload": json.loads(VALID_STDOUT)}) as mock_wait:
                client.post("/run", json={"code": SIMPLE_CODE, "n": 10, "per_n_timeout": 3})
        assert mock_wait.call_args.args[1] == 3

    def test_default_timeout_when_per_n_timeout_omitted(self, client):
        with patch("sandbox_sidecar.app.subprocess.Popen", return_value=_make_result_popen()):
            with patch("sandbox_sidecar.app._wait_for_control_event", return_value={"type": "result", "payload": json.loads(VALID_STDOUT)}) as mock_wait:
                client.post("/run", json={"code": SIMPLE_CODE})
        assert mock_wait.call_args.args[1] == CONTAINER_TIMEOUT


class TestRunEndpointErrors:
    def test_timeout_returns_error_payload(self, client, mock_pool):
        with patch("sandbox_sidecar.app.subprocess.Popen", return_value=_make_result_popen()):
            with patch("sandbox_sidecar.app._wait_for_control_event", return_value={"type": "error", "message": "timeout"}):
                resp = client.post("/run", json={"code": SIMPLE_CODE})
        body = resp.get_json()
        assert body["error"] == "timeout"
        mock_pool.mark_destroyed.assert_called_once()

    def test_nonzero_returncode_returns_error(self, client):
        with patch("sandbox_sidecar.app.subprocess.Popen", return_value=FakePopen([
            {"type": "error", "message": "boom"},
        ])):
            resp = client.post("/run", json={"code": SIMPLE_CODE})
        body = resp.get_json()
        assert "error" in body

    def test_invalid_json_returns_error(self, client):
        fake_proc = FakePopen([])
        fake_proc.stdout = io.StringIO("not-json\n")
        with patch("sandbox_sidecar.app.subprocess.Popen", return_value=fake_proc):
            resp = client.post("/run", json={"code": SIMPLE_CODE})
        body = resp.get_json()
        assert "error" in body


class TestInteractiveSessions:
    def test_run_returns_input_needed_session_without_releasing_container(self, client, mock_pool):
        fake_proc = FakePopen([
            {"type": "input_needed", "prompt": "Name: ", "input_index": 0},
        ])
        with patch("sandbox_sidecar.app.subprocess.Popen", return_value=fake_proc):
            resp = client.post("/run", json={"code": 'name = input("Name: ")'})

        body = resp.get_json()
        assert body["status"] == "input_needed"
        assert body["prompt"] == "Name: "
        assert body["input_index"] == 0
        assert body["session_id"]
        mock_pool.release.assert_not_called()

    def test_post_input_resumes_existing_session_and_returns_completed(self, client):
        fake_proc = FakePopen([
            {"type": "input_needed", "prompt": "Name: ", "input_index": 0},
            {"type": "result", "payload": {"trace": [], "stdout_events": [{"text": "Name: Ada"}]}},
        ])
        with patch("sandbox_sidecar.app.subprocess.Popen", return_value=fake_proc):
            run_resp = client.post("/run", json={"code": 'name = input("Name: ")'})
        session_id = run_resp.get_json()["session_id"]

        input_resp = client.post(f"/input/{session_id}", json={"value": "Ada"})

        assert fake_proc.stdin.getvalue() == "Ada\n"
        body = input_resp.get_json()
        assert body["status"] == "completed"
        assert body["result"]["stdout_events"] == [{"text": "Name: Ada"}]

    def test_post_input_missing_session_returns_failure(self, client):
        resp = client.post("/input/missing-session", json={"value": "Ada"})

        assert resp.status_code == 404
        assert resp.get_json()["status"] == "failed"

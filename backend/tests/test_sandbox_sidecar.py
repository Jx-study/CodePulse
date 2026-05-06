"""
test_sandbox_sidecar.py — sandbox_sidecar/app.py 單元測試

測試策略：
- 用 unittest.mock.patch 模擬 subprocess.run，避免真實 Docker 依賴
- 聚焦在 /run endpoint 的邏輯：參數解析、n 注入、timeout 覆蓋、錯誤處理
"""

import base64
import json
import sys
import os
import subprocess

import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "sandbox_sidecar"))

from sandbox_sidecar.app import app, IMAGE_NAME, CONTAINER_TIMEOUT


SIMPLE_CODE = "def add(a, b):\n    return a + b\n"

VALID_STDOUT = json.dumps({
    "trace": [],
    "call_graph": None,
    "cfg_graph": {},
    "is_truncated": False,
    "step_count": 0,
})


def _make_completed_proc(stdout=VALID_STDOUT, returncode=0, stderr=""):
    proc = MagicMock()
    proc.stdout = stdout
    proc.returncode = returncode
    proc.stderr = stderr
    return proc


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


class TestRunEndpointBasics:
    def test_missing_code_returns_400(self, client):
        resp = client.post("/run", json={})
        assert resp.status_code == 400

    def test_success_returns_sandbox_result(self, client):
        with patch("sandbox_sidecar.app.subprocess.run", return_value=_make_completed_proc()):
            resp = client.post("/run", json={"code": SIMPLE_CODE})
        assert resp.status_code == 200
        assert "trace" in resp.get_json()

    def test_passes_code_as_base64_env_var(self, client):
        with patch("sandbox_sidecar.app.subprocess.run", return_value=_make_completed_proc()) as mock_run:
            client.post("/run", json={"code": SIMPLE_CODE})
        cmd = mock_run.call_args.args[0]
        env_idx = cmd.index("-e")
        env_val = cmd[env_idx + 1]
        assert env_val.startswith("CODE=")
        decoded = base64.b64decode(env_val[len("CODE="):]).decode()
        assert decoded == SIMPLE_CODE

    def test_docker_security_flags_present(self, client):
        with patch("sandbox_sidecar.app.subprocess.run", return_value=_make_completed_proc()) as mock_run:
            client.post("/run", json={"code": SIMPLE_CODE})
        cmd = mock_run.call_args.args[0]
        assert "--rm" in cmd
        assert "--network" in cmd
        assert "none" in cmd
        assert "--read-only" in cmd
        assert "--user" in cmd
        assert IMAGE_NAME in cmd


class TestRunEndpointNInjection:
    """Task 4 新行為：n / per_n_timeout"""

    def test_n_appends_explore_wrapper_call(self, client):
        """n 不為 None 時，code 末尾應追加 explore_wrapper(n)"""
        with patch("sandbox_sidecar.app.subprocess.run", return_value=_make_completed_proc()) as mock_run:
            client.post("/run", json={"code": SIMPLE_CODE, "n": 100})
        cmd = mock_run.call_args.args[0]
        env_idx = cmd.index("-e")
        env_val = cmd[env_idx + 1]
        decoded = base64.b64decode(env_val[len("CODE="):]).decode()
        assert decoded.endswith("explore_wrapper(100)")
        assert SIMPLE_CODE in decoded

    def test_n_none_does_not_modify_code(self, client):
        with patch("sandbox_sidecar.app.subprocess.run", return_value=_make_completed_proc()) as mock_run:
            client.post("/run", json={"code": SIMPLE_CODE, "n": None})
        cmd = mock_run.call_args.args[0]
        env_idx = cmd.index("-e")
        env_val = cmd[env_idx + 1]
        decoded = base64.b64decode(env_val[len("CODE="):]).decode()
        assert decoded == SIMPLE_CODE

    def test_per_n_timeout_overrides_default(self, client):
        with patch("sandbox_sidecar.app.subprocess.run", return_value=_make_completed_proc()) as mock_run:
            client.post("/run", json={"code": SIMPLE_CODE, "n": 10, "per_n_timeout": 3})
        assert mock_run.call_args.kwargs["timeout"] == 3

    def test_default_timeout_when_per_n_timeout_omitted(self, client):
        with patch("sandbox_sidecar.app.subprocess.run", return_value=_make_completed_proc()) as mock_run:
            client.post("/run", json={"code": SIMPLE_CODE})
        assert mock_run.call_args.kwargs["timeout"] == CONTAINER_TIMEOUT


class TestRunEndpointErrors:
    def test_timeout_returns_error_payload(self, client):
        with patch("sandbox_sidecar.app.subprocess.run", side_effect=subprocess.TimeoutExpired(cmd="docker", timeout=10)):
            with patch("sandbox_sidecar.app._try_kill_container"):
                resp = client.post("/run", json={"code": SIMPLE_CODE})
        body = resp.get_json()
        assert body["error"] == "timeout"
        assert body["is_truncated"] is True

    def test_nonzero_returncode_returns_error(self, client):
        with patch("sandbox_sidecar.app.subprocess.run", return_value=_make_completed_proc(stdout="", returncode=1, stderr="boom")):
            resp = client.post("/run", json={"code": SIMPLE_CODE})
        body = resp.get_json()
        assert "error" in body

    def test_invalid_json_returns_error(self, client):
        with patch("sandbox_sidecar.app.subprocess.run", return_value=_make_completed_proc(stdout="not-json")):
            resp = client.post("/run", json={"code": SIMPLE_CODE})
        body = resp.get_json()
        assert "error" in body

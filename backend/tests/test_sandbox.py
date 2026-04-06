"""
test_sandbox.py — sandbox.run_in_sandbox() 單元測試

測試策略：
- 用 unittest.mock.patch 模擬 subprocess.run，避免真實 Docker 依賴
- 測試 sandbox.py 的邏輯：JSON parse、timeout 處理、錯誤分支
- 真實 Docker 整合測試（需 Docker 環境）標記 @pytest.mark.integration
"""

import base64
import json
import subprocess
import sys
import os

import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "services"))

# sandbox 尚未建立，import 預期失敗 → RED 階段
from services.sandbox import run_in_sandbox, CONTAINER_TIMEOUT, IMAGE_NAME


SIMPLE_CODE = """
def add(a, b):
    return a + b

result = add(1, 2)
"""

VALID_STDOUT = json.dumps({
    "trace": [
        {"tag": "CALL", "variables": {}, "dataSnapshot": [], "meta": {"lineno": 2, "func_name": "add"}},
        {"tag": "LINE", "variables": {"a": "1", "b": "2"}, "dataSnapshot": [], "meta": {"lineno": 3, "func_name": "add"}},
        {"tag": "RETURN", "variables": {"a": "1", "b": "2"}, "dataSnapshot": [], "meta": {"lineno": 3, "func_name": "add", "return_value": "3"}},
    ],
    "call_graph": {
        "nodes": [{"id": "func_add", "func_name": "add", "cfg": None}],
        "edges": [],
        "root": "func_add",
    },
    "cfg_graph": {},
    "is_truncated": False,
    "step_count": 3,
})


def _make_completed_proc(stdout=VALID_STDOUT, returncode=0):
    proc = MagicMock()
    proc.stdout = stdout
    proc.returncode = returncode
    return proc


class TestRunInSandboxSuccess:
    def test_returns_dict_on_valid_stdout(self):
        with patch("services.sandbox.subprocess.run", return_value=_make_completed_proc()):
            result = run_in_sandbox(SIMPLE_CODE)
        assert isinstance(result, dict)
        assert "trace" in result
        assert "call_graph" in result
        assert "is_truncated" in result

    def test_passes_code_as_base64_env_var(self):
        with patch("services.sandbox.subprocess.run", return_value=_make_completed_proc()) as mock_run:
            run_in_sandbox(SIMPLE_CODE)
        call_args = mock_run.call_args
        cmd = call_args[0][0]
        # 找到 -e CODE=... 的值
        env_idx = cmd.index("-e")
        env_val = cmd[env_idx + 1]
        assert env_val.startswith("CODE=")
        encoded = env_val[len("CODE="):]
        decoded = base64.b64decode(encoded).decode()
        assert decoded == SIMPLE_CODE

    def test_docker_run_uses_correct_image(self):
        with patch("services.sandbox.subprocess.run", return_value=_make_completed_proc()) as mock_run:
            run_in_sandbox(SIMPLE_CODE)
        cmd = mock_run.call_args[0][0]
        assert IMAGE_NAME in cmd

    def test_docker_run_has_security_flags(self):
        with patch("services.sandbox.subprocess.run", return_value=_make_completed_proc()) as mock_run:
            run_in_sandbox(SIMPLE_CODE)
        cmd = mock_run.call_args[0][0]
        assert "--rm" in cmd
        assert "--network" in cmd
        assert "none" in cmd
        assert "--read-only" in cmd
        assert "--user" in cmd

    def test_timeout_passed_to_subprocess(self):
        with patch("services.sandbox.subprocess.run", return_value=_make_completed_proc()) as mock_run:
            run_in_sandbox(SIMPLE_CODE)
        kwargs = mock_run.call_args[1]
        assert kwargs.get("timeout") == CONTAINER_TIMEOUT


class TestRunInSandboxTimeout:
    def test_timeout_returns_truncated_result(self):
        with patch("services.sandbox.subprocess.run", side_effect=subprocess.TimeoutExpired(cmd="docker", timeout=10)):
            result = run_in_sandbox(SIMPLE_CODE)
        assert result["is_truncated"] is True
        assert result["trace"] == []

    def test_timeout_does_not_raise(self):
        with patch("services.sandbox.subprocess.run", side_effect=subprocess.TimeoutExpired(cmd="docker", timeout=10)):
            # 不應 raise，永遠回傳 dict
            result = run_in_sandbox(SIMPLE_CODE)
        assert isinstance(result, dict)


class TestRunInSandboxErrors:
    def test_nonzero_returncode_returns_error_dict(self):
        with patch("services.sandbox.subprocess.run", return_value=_make_completed_proc(stdout="", returncode=1)):
            result = run_in_sandbox(SIMPLE_CODE)
        assert "error" in result

    def test_invalid_json_stdout_returns_error_dict(self):
        with patch("services.sandbox.subprocess.run", return_value=_make_completed_proc(stdout="not-json")):
            result = run_in_sandbox(SIMPLE_CODE)
        assert "error" in result

    def test_docker_not_found_returns_error_dict(self):
        with patch("services.sandbox.subprocess.run", side_effect=FileNotFoundError("docker not found")):
            result = run_in_sandbox(SIMPLE_CODE)
        assert "error" in result

    def test_runner_error_key_propagated(self):
        """runner.py 內部例外時，stdout 含 {"error": "..."} → 原樣回傳"""
        error_stdout = json.dumps({"error": "ZeroDivisionError: division by zero"})
        with patch("services.sandbox.subprocess.run", return_value=_make_completed_proc(stdout=error_stdout)):
            result = run_in_sandbox(SIMPLE_CODE)
        assert "error" in result
        assert "ZeroDivisionError" in result["error"]


@pytest.mark.integration
class TestRunInSandboxIntegration:
    """需要真實 Docker 環境才能執行，CI 中跳過"""

    def test_real_docker_simple_code(self):
        result = run_in_sandbox(SIMPLE_CODE)
        assert isinstance(result, dict)
        assert "trace" in result
        assert result["step_count"] > 0
        assert not result["is_truncated"]

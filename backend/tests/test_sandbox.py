"""
test_sandbox.py — sandbox.run_in_sandbox() 單元測試

測試策略：
- sandbox.py 是 HTTP 薄層，用 unittest.mock.patch 模擬 requests.post
- 真實 sidecar 整合測試標記 @pytest.mark.integration
"""

import sys
import os

import pytest
from unittest.mock import patch, MagicMock
import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "services"))

from services.sandbox import run_in_sandbox, CONTAINER_TIMEOUT


SIMPLE_CODE = """
def add(a, b):
    return a + b

result = add(1, 2)
"""

VALID_RESULT = {
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
}


def _make_response(payload=None, status=200):
    resp = MagicMock()
    resp.status_code = status
    resp.json.return_value = payload if payload is not None else VALID_RESULT
    return resp


class TestRunInSandboxSuccess:
    def test_returns_dict_on_valid_response(self):
        with patch("services.sandbox.requests.post", return_value=_make_response()):
            result = run_in_sandbox(SIMPLE_CODE)
        assert isinstance(result, dict)
        assert "trace" in result
        assert "call_graph" in result
        assert "is_truncated" in result

    def test_posts_code_in_json_body(self):
        with patch("services.sandbox.requests.post", return_value=_make_response()) as mock_post:
            run_in_sandbox(SIMPLE_CODE)
        kwargs = mock_post.call_args.kwargs
        assert kwargs["json"]["code"] == SIMPLE_CODE

    def test_posts_to_sidecar_run_endpoint(self):
        with patch("services.sandbox.requests.post", return_value=_make_response()) as mock_post:
            run_in_sandbox(SIMPLE_CODE)
        url = mock_post.call_args.args[0]
        assert url.endswith("/run")

    def test_default_timeout_passed(self):
        with patch("services.sandbox.requests.post", return_value=_make_response()) as mock_post:
            run_in_sandbox(SIMPLE_CODE)
        assert mock_post.call_args.kwargs["timeout"] == CONTAINER_TIMEOUT


class TestRunInSandboxNInjection:
    """Task 4 新行為：n / per_n_timeout 參數轉發至 sidecar"""

    def test_n_param_forwarded_in_body(self):
        with patch("services.sandbox.requests.post", return_value=_make_response()) as mock_post:
            run_in_sandbox(SIMPLE_CODE, n=100)
        body = mock_post.call_args.kwargs["json"]
        assert body["n"] == 100

    def test_per_n_timeout_overrides_default(self):
        with patch("services.sandbox.requests.post", return_value=_make_response()) as mock_post:
            run_in_sandbox(SIMPLE_CODE, n=50, per_n_timeout=7)
        assert mock_post.call_args.kwargs["timeout"] == 7

    def test_no_n_does_not_include_n_field(self):
        """n=None 時不應污染 body（保持與原本 sidecar 呼叫的相容性）"""
        with patch("services.sandbox.requests.post", return_value=_make_response()) as mock_post:
            run_in_sandbox(SIMPLE_CODE)
        body = mock_post.call_args.kwargs["json"]
        assert "n" not in body or body["n"] is None

    def test_backwards_compatible_single_arg_call(self):
        """原有 run_in_sandbox(code) 呼叫完全不變"""
        with patch("services.sandbox.requests.post", return_value=_make_response()) as mock_post:
            result = run_in_sandbox(SIMPLE_CODE)
        assert isinstance(result, dict)
        assert mock_post.call_count == 1


class TestRunInSandboxTimeout:
    def test_timeout_returns_truncated_result(self):
        with patch("services.sandbox.requests.post", side_effect=requests.Timeout()):
            result = run_in_sandbox(SIMPLE_CODE)
        assert result["is_truncated"] is True
        assert result["trace"] == []
        assert "error" in result

    def test_timeout_does_not_raise(self):
        with patch("services.sandbox.requests.post", side_effect=requests.Timeout()):
            result = run_in_sandbox(SIMPLE_CODE)
        assert isinstance(result, dict)


class TestRunInSandboxErrors:
    def test_connection_error_returns_error_dict(self):
        with patch("services.sandbox.requests.post", side_effect=requests.ConnectionError("sidecar down")):
            result = run_in_sandbox(SIMPLE_CODE)
        assert "error" in result

    def test_runner_error_key_propagated(self):
        """sidecar 回傳 {"error": "..."} → 原樣回傳"""
        error_payload = {"error": "ZeroDivisionError: division by zero", "is_truncated": False, "trace": []}
        with patch("services.sandbox.requests.post", return_value=_make_response(payload=error_payload)):
            result = run_in_sandbox(SIMPLE_CODE)
        assert "error" in result
        assert "ZeroDivisionError" in result["error"]


@pytest.mark.integration
class TestRunInSandboxIntegration:
    """需要真實 sidecar + Docker 環境才能執行，CI 中跳過"""

    def test_real_sidecar_simple_code(self):
        result = run_in_sandbox(SIMPLE_CODE)
        assert isinstance(result, dict)
        assert "trace" in result
        assert result["step_count"] > 0
        assert not result["is_truncated"]

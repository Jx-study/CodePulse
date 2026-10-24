"""
sandbox.py — Sandbox Sidecar HTTP 薄層封裝

run_in_sandbox(code, n=None, per_n_timeout=None) 將用戶程式碼透過 HTTP 送至
sandbox-sidecar 執行，回傳結構化的 TraceResult dict。

n: 若不為 None，sidecar 會在 code 末尾追加 explore_wrapper(n)（big-O 測量用）
per_n_timeout: 覆蓋預設 CONTAINER_TIMEOUT（秒）

永遠不 raise，錯誤透過回傳 {"error": "..."} 傳遞。
"""

import os
import requests

SIDECAR_URL = os.environ.get("SANDBOX_SIDECAR_URL", "http://sandbox-sidecar:8080")
CONTAINER_TIMEOUT = 15  # 秒（比 sidecar 內部 10s 多一點，留網路開銷）


def run_in_sandbox(
    code: str,
    n: int | None = None,
    per_n_timeout: int | None = None,
    stdin_inputs: list[str] | None = None,
) -> dict:
    """
    透過 sandbox-sidecar HTTP API 執行 code。

    Returns:
        成功：{"trace": [...], "call_graph": {...}, "cfg_graph": {...},
               "is_truncated": bool, "step_count": int}
        需要輸入：{"error": "input_needed", "prompt": "...", "input_index": int}
        失敗：{"error": "<message>", "is_truncated": bool, "trace": []}
    """
    body: dict = {"code": code}
    if n is not None:
        body["n"] = n
    if per_n_timeout is not None:
        body["per_n_timeout"] = per_n_timeout
    if stdin_inputs is not None:
        body["stdin_inputs"] = stdin_inputs

    effective_timeout = per_n_timeout if per_n_timeout is not None else CONTAINER_TIMEOUT
    http_timeout = effective_timeout + 5  # buffer for container startup + network overhead

    try:
        resp = requests.post(
            f"{SIDECAR_URL}/run",
            json=body,
            timeout=http_timeout,
        )
        return resp.json()
    except requests.Timeout:
        return {"error": "timeout", "is_truncated": True, "trace": [], "call_graph": None, "cfg_graph": {}}
    except requests.ConnectionError as e:
        return {"error": f"sandbox sidecar unavailable: {e}", "is_truncated": False, "trace": [], "call_graph": None, "cfg_graph": {}}
    except Exception as e:
        return {"error": f"sandbox error: {e}", "is_truncated": False, "trace": [], "call_graph": None, "cfg_graph": {}}


def send_input(session_id: str, value: str) -> dict:
    try:
        resp = requests.post(
            f"{SIDECAR_URL}/input/{session_id}",
            json={"value": value},
            timeout=CONTAINER_TIMEOUT + 5,
        )
        return resp.json()
    except requests.Timeout:
        return {"status": "failed", "error": "timeout"}
    except requests.ConnectionError as e:
        return {"status": "failed", "error": f"sandbox sidecar unavailable: {e}"}
    except Exception as e:
        return {"status": "failed", "error": f"sandbox error: {e}"}


def check_session_alive(session_id: str) -> bool:
    try:
        resp = requests.get(
            f"{SIDECAR_URL}/session/{session_id}/alive",
            timeout=5,
        )
        if resp.status_code != 200:
            return False
        body = resp.json()
        return bool(body.get("alive"))
    except Exception:
        return False


def close_session(session_id: str) -> dict:
    try:
        resp = requests.post(
            f"{SIDECAR_URL}/session/{session_id}/close",
            timeout=5,
        )
        return resp.json()
    except requests.ConnectionError as e:
        return {"status": "failed", "error": f"sandbox sidecar unavailable: {e}"}
    except Exception as e:
        return {"status": "failed", "error": f"sandbox error: {e}"}

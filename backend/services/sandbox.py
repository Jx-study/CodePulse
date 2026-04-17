"""
sandbox.py — Sandbox Sidecar HTTP 薄層封裝

run_in_sandbox(code) 將用戶程式碼透過 HTTP 送至 sandbox-sidecar 執行，
回傳結構化的 TraceResult dict。

永遠不 raise，錯誤透過回傳 {"error": "..."} 傳遞。
"""

import os
import requests

SIDECAR_URL = os.environ.get("SANDBOX_SIDECAR_URL", "http://sandbox-sidecar:8080")
CONTAINER_TIMEOUT = 15  # 秒（比 sidecar 內部 10s 多一點，留網路開銷）


def run_in_sandbox(code: str) -> dict:
    """
    透過 sandbox-sidecar HTTP API 執行 code。

    Returns:
        成功：{"trace": [...], "call_graph": {...}, "cfg_graph": {...},
               "is_truncated": bool, "step_count": int}
        失敗：{"error": "<message>", "is_truncated": bool, "trace": []}
    """
    try:
        resp = requests.post(
            f"{SIDECAR_URL}/run",
            json={"code": code},
            timeout=CONTAINER_TIMEOUT,
        )
        return resp.json()
    except requests.Timeout:
        return {"error": "timeout", "is_truncated": True, "trace": [], "call_graph": None, "cfg_graph": {}}
    except requests.ConnectionError as e:
        return {"error": f"sandbox sidecar unavailable: {e}", "is_truncated": False, "trace": [], "call_graph": None, "cfg_graph": {}}
    except Exception as e:
        return {"error": f"sandbox error: {e}", "is_truncated": False, "trace": [], "call_graph": None, "cfg_graph": {}}

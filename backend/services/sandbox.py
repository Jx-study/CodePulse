"""
sandbox.py — Docker sandbox 薄層封裝

run_in_sandbox(code) 把用戶程式碼在隔離的 Docker container 中執行，
回傳結構化的 TraceResult dict。

永遠不 raise，錯誤透過回傳 {"error": "..."} 傳遞。
"""

import base64
import json
import subprocess

CONTAINER_TIMEOUT = 10  # 秒
IMAGE_NAME = "codepulse-sandbox"

_DOCKER_FLAGS = [
    "--rm",
    "--network", "none",
    "--read-only",
    "--tmpfs", "/tmp",
    "--user", "nobody",
    "--memory", "128m",
    "--cpus", "0.5",
]


def run_in_sandbox(code: str) -> dict:
    """
    在 Docker container 中執行 code。

    Returns:
        成功：{"trace": [...], "call_graph": {...}, "cfg_graph": {...},
               "is_truncated": bool, "step_count": int}
        失敗：{"error": "<message>", "is_truncated": bool, "trace": []}
    """
    encoded = base64.b64encode(code.encode("utf-8")).decode("ascii")
    cmd = [
        "docker", "run",
        *_DOCKER_FLAGS,
        "-e", f"CODE={encoded}",
        IMAGE_NAME,
    ]

    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=CONTAINER_TIMEOUT,
        )
    except subprocess.TimeoutExpired:
        _try_kill_container()
        return {"error": "timeout", "is_truncated": True, "trace": [], "call_graph": None, "cfg_graph": {}}
    except FileNotFoundError as e:
        return {"error": f"docker not found: {e}", "is_truncated": False, "trace": [], "call_graph": None, "cfg_graph": {}}

    if proc.returncode != 0:
        # runner.py writes {"error": "..."} to stdout before sys.exit(1)
        try:
            payload = json.loads(proc.stdout)
            if "error" in payload:
                return {"error": payload["error"], "is_truncated": False, "trace": [], "call_graph": None, "cfg_graph": {}}
        except (json.JSONDecodeError, ValueError):
            pass
        stderr = proc.stderr.strip() if proc.stderr else ""
        return {"error": f"container exited with code {proc.returncode}: {stderr}", "is_truncated": False, "trace": [], "call_graph": None, "cfg_graph": {}}

    try:
        result = json.loads(proc.stdout)
    except json.JSONDecodeError:
        return {"error": f"invalid JSON from container: {proc.stdout[:200]}", "is_truncated": False, "trace": [], "call_graph": None, "cfg_graph": {}}

    return result


def _try_kill_container() -> None:
    """timeout 後嘗試 kill 最新的 sandbox container（best-effort）。"""
    try:
        result = subprocess.run(
            ["docker", "ps", "-q", "--filter", f"ancestor={IMAGE_NAME}"],
            capture_output=True, text=True, timeout=5,
        )
        for cid in result.stdout.strip().splitlines():
            subprocess.run(["docker", "kill", cid], capture_output=True, timeout=5)
    except Exception:
        pass

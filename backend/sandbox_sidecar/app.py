"""
sandbox_sidecar/app.py — Sandbox Sidecar

唯一有 /var/run/docker.sock 存取權的服務。
只接受一個 endpoint：POST /run，從 ContainerPool 取容器執行 user code。

安全設計：
- 不接受任意 docker 指令，只 hardcode docker exec 參數
- 容器靠 image build 時的 --network none / --read-only / --user nobody 隔離
- 永遠不 raise，錯誤透過 JSON 回傳
"""

import base64
import json
import os
import subprocess
import threading
from flask import Flask, request, jsonify

from container_pool import (
    ContainerDeadError,
    ContainerPool,
    PoolExhaustedError,
)

app = Flask(__name__)

CONTAINER_TIMEOUT = int(os.environ.get("CONTAINER_TIMEOUT", "10"))
ACQUIRE_TIMEOUT = float(os.environ.get("ACQUIRE_TIMEOUT", "8"))
MIN_POOL_SIZE = int(os.environ.get("MIN_POOL_SIZE", "10"))
MAX_POOL_SIZE = int(os.environ.get("MAX_POOL_SIZE", "30"))
MAX_REUSE = int(os.environ.get("MAX_REUSE", "50"))

_pool: ContainerPool | None = None
_pool_lock = threading.Lock()


def _get_pool() -> ContainerPool:
    """Lazy-init ContainerPool（double-checked locking）— 第一次 /run 才開始預熱容器。"""
    global _pool
    if _pool is None:
        with _pool_lock:
            if _pool is None:
                _pool = ContainerPool(
                    min_size=MIN_POOL_SIZE,
                    max_size=MAX_POOL_SIZE,
                    max_reuse=MAX_REUSE,
                )
    return _pool


def _error_response(message: str, *, status: int = 200, lineno: int | None = None):
    body = {
        "error": message,
        "is_truncated": False,
        "trace": [],
        "call_graph": None,
        "cfg_graph": {},
    }
    if lineno is not None:
        body["lineno"] = lineno
    return jsonify(body), status


@app.route("/run", methods=["POST"])
def run():
    data = request.get_json(silent=True)
    if not data or "code" not in data:
        return jsonify({"error": "missing field: code"}), 400

    code = data["code"]
    n = data.get("n")
    per_n_timeout = data.get("per_n_timeout")

    runnable = code if n is None else code + f"\nexplore_wrapper({n})"
    encoded = base64.b64encode(runnable.encode("utf-8")).decode("ascii")
    effective_timeout = per_n_timeout if per_n_timeout is not None else CONTAINER_TIMEOUT

    pool = _get_pool()

    try:
        container = pool.acquire(timeout=ACQUIRE_TIMEOUT)
    except PoolExhaustedError:
        return _error_response(
            "pool_exhausted: 伺服器繁忙，請稍後再試",
            status=503,
        )

    released = False
    try:
        try:
            proc = subprocess.run(
                [
                    "docker", "exec",
                    "-e", f"CODE={encoded}",
                    container.id,
                    "python", "/sandbox/runner.py",
                ],
                capture_output=True, text=True,
                timeout=effective_timeout,
            )
        except subprocess.TimeoutExpired:
            pool.mark_destroyed(container)
            released = True
            return jsonify({
                "error": "timeout",
                "is_truncated": True,
                "trace": [],
                "call_graph": None,
                "cfg_graph": {},
            })
        except FileNotFoundError as e:
            pool.release(container)
            released = True
            return _error_response(f"docker not found: {e}")

        if proc.returncode != 0:
            stderr = (proc.stderr or "").strip()
            if "no such container" in stderr.lower() or "is not running" in stderr.lower():
                pool.mark_destroyed(container)
                released = True
                return _error_response(f"container died: {stderr}")

            try:
                payload = json.loads(proc.stdout)
                if "error" in payload:
                    return _error_response(payload["error"], lineno=payload.get("lineno"))
            except (json.JSONDecodeError, ValueError):
                pass
            return _error_response(f"container exited with code {proc.returncode}: {stderr}")

        try:
            result = json.loads(proc.stdout)
        except json.JSONDecodeError:
            return _error_response(f"invalid JSON from container: {proc.stdout[:200]}")

        return jsonify(result)
    finally:
        if not released:
            pool.release(container)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
